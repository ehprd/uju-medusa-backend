// src/services/rental-product.ts
import {
    TransactionBaseService,
    FindConfig,
    Selector,
} from "@medusajs/medusa"
import {EntityManager, FindOneOptions} from "typeorm"
import {ProductService} from "@medusajs/medusa"
import {MedusaError} from "medusa-core-utils"
import {RentalProduct} from "../models/rental_product";

type CreateRentalProductInput = {
    product_id: string
    short_term_rate: number
    medium_term_rate: number
    long_term_rate: number
}

class RentalProductService extends TransactionBaseService {
    protected manager_: EntityManager
    protected transactionManager_: EntityManager
    protected productService_: ProductService

    constructor(container) {
        super(container)
        this.productService_ = container.productService
    }

    async create(data: CreateRentalProductInput): Promise<RentalProduct> {
        return await this.atomicPhase_(async (manager) => {
            const rentalProductRepo = manager.getRepository(RentalProduct)

            // Check if the product exists
            await this.productService_.retrieve(data.product_id)

            const rentalProduct = rentalProductRepo.create(data)
            return await rentalProductRepo.save(rentalProduct)
        })
    }

    async retrieve(
        rentalProductId: string,
        config?: FindOneOptions<RentalProduct>
    ): Promise<RentalProduct> {
        const rentalProductRepo = this.manager_.getRepository(RentalProduct)
        const rentalProduct = await rentalProductRepo.findOne({
            where: {id: rentalProductId},
            ...config,
        })

        if (!rentalProduct) {
            throw new MedusaError(
                MedusaError.Types.NOT_FOUND,
                `Rental product with id: ${rentalProductId} was not found`
            )
        }

        return rentalProduct
    }

    async calculateRentalPrice(
        rentalProductId: string,
        rentalDays: number
    ): Promise<number> {
        const rentalProduct = await this.retrieve(rentalProductId)

        if (rentalDays <= 2) {
            return rentalProduct.short_term_rate * rentalDays
        } else if (rentalDays <= 15) {
            return rentalProduct.medium_term_rate * rentalDays
        } else {
            return rentalProduct.long_term_rate * rentalDays
        }
    }
}

export default RentalProductService
