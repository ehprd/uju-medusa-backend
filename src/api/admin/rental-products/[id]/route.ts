import type {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/medusa"
import { EntityManager } from "typeorm"

import RentalProductService from "../../../../services/rental-product"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { id } = req.params

    const rentalProductService: RentalProductService =
        req.scope.resolve("rentalProductService")

    const rentalProduct = await rentalProductService.retrieve(id)

    res.status(200).json({ rental_product: rentalProduct })
}

export async function PUT(
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

export async function DELETE(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { id } = req.params

    const rentalProductService: RentalProductService =
        req.scope.resolve("rentalProductService")
    const manager: EntityManager = req.scope.resolve("manager")

    await manager.transaction(
        async (transactionManager) => {
            return await rentalProductService
                .withTransaction(transactionManager)
                .delete(id)
        }
    )

    res.status(200).json({ id, object: "rental_product", deleted: true })
}
