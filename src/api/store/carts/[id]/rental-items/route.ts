// /api/store/carts/[cart_id]/rental-items/route.ts
import type {
    LineItemService,
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/medusa"
import CartService from "../../../../../services/cart"
import RentalProductService from "../../../../../services/rental-product"

type RentalItemRequestBody = {
    rental_product_id: string
    quantity: number
    rental_details: {
        start_date: string | Date
        end_date: string | Date
    }
}

export async function POST(req: MedusaRequest<RentalItemRequestBody>, res: MedusaResponse) {
    const cartService: CartService = req.scope.resolve("cartService")
    const lineItemService: LineItemService = req.scope.resolve("lineItemService")
    const rentalProductService: RentalProductService = req.scope.resolve("rentalProductService")

    const { cart_id } = req.params
    const { rental_product_id, quantity, rental_details } = req.body

    // 렌탈 제품 정보 조회
    const rentalProduct = await rentalProductService.retrieve(rental_product_id)

    // 렌탈 기간에 따른 가격 계산
    const rentalDays = Math.ceil((new Date(rental_details.end_date).getTime() - new Date(rental_details.start_date).getTime()) / (1000 * 60 * 60 * 24))
    const rentalPrice = await rentalProductService.calculateRentalPrice(rental_product_id, rentalDays)

    // LineItem 생성
    const lineItem = await lineItemService.generate(
        rentalProduct.product.variants[0].id,
        cart_id,
        quantity,
        {
            metadata: {
                is_rental: true,
                rental_product_id: rental_product_id,
                rental_details: rental_details,
                rental_days: rentalDays
            },
            unit_price: rentalPrice
        }
    )

    await cartService.addLineItem(cart_id, lineItem)


    const updatedCart = await cartService.retrieve(cart_id, {
        relations: ["items", "items.variant", "items.variant.product"]
    })

    res.json({ cart: updatedCart })
}
