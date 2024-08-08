import type {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/medusa"
import CartService from "../../../../../services/cart";

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

    const { cart_id } = req.params
    const { rental_product_id, quantity, rental_details } = req.body

    const parsedRentalDetails = {
        start_date: new Date(rental_details.start_date),
        end_date: new Date(rental_details.end_date)
    }

    await cartService.addRentalItem(cart_id, rental_product_id, quantity, parsedRentalDetails)

    const cart = await cartService.retrieve(cart_id, {
        relations: ["items", "items.variant", "items.variant.product"],
    })

    res.json({ cart })
}
