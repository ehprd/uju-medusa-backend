// src/services/rental-product.ts
import {
    TransactionBaseService,
    ProductService,
} from "@medusajs/medusa"
import {EntityManager} from "typeorm"
import {RentalProduct} from "../models/rental_product";
import {generateEntityId} from "@medusajs/utils";
import RentalProductRepository from "../repositories/rental-product";

type CreateRentalProductInput = {
    product_id: string
    short_term_rate: number
    medium_term_rate: number
    long_term_rate: number
    rental_periods?: {
        short_term: { min: number; max: number }
        medium_term: { min: number; max: number }
        long_term: { min: number }
    }
}

class RentalProductService extends TransactionBaseService {
    protected manager_: EntityManager
    protected readonly rentalProductRepository_: typeof RentalProductRepository

    protected transactionManager_: EntityManager
    protected productService_: ProductService

    constructor(container) {
        super(container)
        this.rentalProductRepository_ = container.rentalProductRepository
        this.productService_ = container.productService
    }

    async create(data: CreateRentalProductInput): Promise<RentalProduct> {
        return this.atomicPhase_(async (manager) => {
            // 먼저 일반 제품이 존재하는지 확인
            const product = await this.productService_.retrieve(data.product_id)

            const rentalProduct = this.rentalProductRepository_.create({
                id: generateEntityId(RentalProduct.name),
                product: product, // 관계 설정
                ...data
            })

            return await this.rentalProductRepository_.save(rentalProduct)
        })
    }

    async retrieve(productId: string): Promise<RentalProduct> {
        const rentalProductRepo = this.manager_.getRepository(RentalProduct)
        const rentalProduct = await rentalProductRepo.findOne({
            where: {product_id: productId},
        })

        if (!rentalProduct) {
            throw new Error(`Rental product with id ${productId} not found`)
        }

        return rentalProduct
    }

    async update(productId: string, data: Partial<CreateRentalProductInput>): Promise<RentalProduct> {
        return this.atomicPhase_(async (manager) => {
            const rentalProductRepo = manager.getRepository(RentalProduct)
            const rentalProduct = await this.retrieve(productId)

            Object.assign(rentalProduct, data)
            return await rentalProductRepo.save(rentalProduct)
        })
    }

    async delete(productId: string): Promise<void> {
        return this.atomicPhase_(async (manager) => {
            const rentalProductRepo = manager.getRepository(RentalProduct)
            const rentalProduct = await this.retrieve(productId)

            await rentalProductRepo.remove(rentalProduct)
        })
    }

    async calculateRentalPrice(productId: string, days: number): Promise<number> {
        const rentalProduct = await this.retrieve(productId)

        if (days <= rentalProduct.rental_periods.short_term.max) {
            return days * rentalProduct.short_term_rate
        } else if (days <= rentalProduct.rental_periods.medium_term.max) {
            return days * rentalProduct.medium_term_rate
        } else {
            return days * rentalProduct.long_term_rate
        }
    }
}

export default RentalProductService
