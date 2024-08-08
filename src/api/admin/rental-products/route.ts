import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import RentalProductService from "../../../services/rental-product"

type CreateRentalProductInput = {
    product_id: string;
    short_term_rate: number;
    medium_term_rate: number;
    long_term_rate: number;
    rental_periods?: {
        short_term: { min: number; max: number };
        medium_term: { min: number; max: number };
        long_term: { min: number };
    };
};

export async function POST(req: MedusaRequest<CreateRentalProductInput>, res: MedusaResponse) {
    const rentalProductService: RentalProductService = req.scope.resolve("rentalProductService")

    const {
        product_id,
        short_term_rate,
        medium_term_rate,
        long_term_rate,
        rental_periods
    } = req.body

    try {
        const rentalProduct = await rentalProductService.create({
            product_id,
            short_term_rate,
            medium_term_rate,
            long_term_rate,
            rental_periods
        })

        res.status(201).json({ rental_product: rentalProduct })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
