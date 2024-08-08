// src/services/cart.ts
import {
    CartService as MedusaCartService,
} from "@medusajs/medusa"
import {EntityManager} from "typeorm"
import RentalProductService from "./rental-product"

class CartService extends MedusaCartService {
    protected manager_: EntityManager
    protected transactionManager_: EntityManager
    protected readonly rentalProductService_: RentalProductService

    constructor(container) {
        super(container)
        this.rentalProductService_ = container.rentalProductService
    }

    async addRentalItem(
        cartId: string,
        rentalProductId: string,
        quantity: number,
        rentalDetails: {
            start_date: Date
            end_date: Date
        }
    ): Promise<void> {
        return await this.atomicPhase_(async (manager) => {
            const rentalProduct = await this.rentalProductService_.retrieve(rentalProductId)
            const cart = await this.retrieve(cartId, {relations: ["items"]})

            const rentalDays = Math.ceil((rentalDetails.end_date.getTime() - rentalDetails.start_date.getTime()) / (1000 * 60 * 60 * 24))
            const rentalPrice = await this.rentalProductService_.calculateRentalPrice(rentalProductId, rentalDays)

            const lineItemData = {
                cart_id: cartId,
                title: rentalProduct.product.title,
                description: `Rental: ${rentalDetails.start_date.toISOString()} to ${rentalDetails.end_date.toISOString()}`,
                thumbnail: rentalProduct.product.thumbnail,
                unit_price: rentalPrice,
                quantity: quantity,
                rental_product_id: rentalProductId,
                rental_details: {
                    start_date: rentalDetails.start_date,
                    end_date: rentalDetails.end_date,
                    rental_days: rentalDays
                },
                metadata: {
                    is_rental: true
                }
            }

            const lineItem = await this.lineItemService_.create(lineItemData)
            cart.items.push(lineItem)

            await this.lineItemService_.create([lineItem])
            await this.eventBus_.emit(CartService.Events.UPDATED, {id: cart.id})
        })
    }
}

export default CartService
