import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/medusa"
import RentalProductService from "../../../../../services/rental-product";
import {CreateRentalProductInput} from "../../../../../admin/types/rental-product";

export async function POST(
    req: MedusaRequest<CreateRentalProductInput>,
    res: MedusaResponse
) {
    const rentalProductService: RentalProductService = req.scope.resolve("rentalProductService")
    const productId = req.params.id

    try {
        const data = req.body
        const rentalProduct = await rentalProductService.setupRentalProductOptions(productId, {
            short_term_rate: data.short_term_rate,
            medium_term_rate: data.medium_term_rate,
            long_term_rate: data.long_term_rate,
            rentPlace: data.rentPlace,
            returnPlace: data.returnPlace
        })
        res.status(200).json({ rental_product: rentalProduct })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
