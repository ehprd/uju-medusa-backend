import type {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/medusa"
import { EntityManager } from "typeorm"

import RentalProductService from "../../../../../services/rental-product"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { productId } = req.params

    const rentalProductService: RentalProductService =
        req.scope.resolve("rentalProductService")

    const rentalProduct = await rentalProductService.findByProductId(productId)

    res.status(200).json({ rental_product: rentalProduct })
}

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { id } = req.params

    const rentalProductService: RentalProductService =
        req.scope.resolve("rentalProductService")
    const manager: EntityManager = req.scope.resolve("manager")

    const rentalProduct = await manager.transaction(
        async (transactionManager) => {
            return await rentalProductService
                .withTransaction(transactionManager)
                .update(id, req.body)
        }
    )

    res.status(200).json({ rental_product: rentalProduct })
}
