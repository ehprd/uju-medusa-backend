import type {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/medusa"
import { EntityManager } from "typeorm"

import RentalProductService from "../../../services/rental-product"
import {CreateRentalProductInput} from "../../../admin/types/rental-product";

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const rentalProductService: RentalProductService =
        req.scope.resolve("rentalProductService")

    const rentalProducts = await rentalProductService.list()

    res.status(200).json({ rental_products: rentalProducts })
}

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const rentalProductService: RentalProductService =
        req.scope.resolve("rentalProductService")
    const manager: EntityManager = req.scope.resolve("manager")

    console.log(req.body)

    // req.body의 타입을 검증하고 변환하는 함수
    function validateCreateRentalProductInput(data: unknown): CreateRentalProductInput {
        if (typeof data !== 'object' || data === null) {
            throw new Error('Invalid input: expected an object')
        }

        const { product_id, short_term_rate, medium_term_rate, long_term_rate, rental_periods } = data as any

        if (typeof product_id !== 'string' ||
            typeof short_term_rate !== 'number' ||
            typeof medium_term_rate !== 'number' ||
            typeof long_term_rate !== 'number') {
            throw new Error('Invalid input: missing required fields or incorrect types')
        }

        const input: CreateRentalProductInput = {
            product_id,
            short_term_rate,
            medium_term_rate,
            long_term_rate,
        }

        if (rental_periods) {
            if (typeof rental_periods !== 'object' || rental_periods === null) {
                throw new Error('Invalid input: rental_periods must be an object')
            }
            input.rental_periods = rental_periods as CreateRentalProductInput['rental_periods']
        }

        return input
    }

    try {
        const validatedInput = validateCreateRentalProductInput(req.body)

        const rentalProduct = await manager.transaction(
            async (transactionManager) => {
                return await rentalProductService
                    .withTransaction(transactionManager)
                    .create(validatedInput)
            }
        )

        res.status(200).json({ rental_product: rentalProduct })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
