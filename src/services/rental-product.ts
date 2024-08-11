import {
    TransactionBaseService,
    FindConfig,
    Selector,
    ProductService
} from "@medusajs/medusa"
import {EntityManager, Equal, FindManyOptions, FindOptionsWhere} from "typeorm"
import RentalProductRepository from "../repositories/rental-product";
import {RentalProduct} from "../models/rental-product";
import {CreateRentalProductInput, RentalProductSelector, UpdateRentalProductInput} from "../admin/types/rental-product";

class RentalProductService extends TransactionBaseService {
    protected manager_: EntityManager
    protected transactionManager_: EntityManager | undefined
    protected readonly rentalProductRepository_: typeof RentalProductRepository
    protected readonly productService_: ProductService

    constructor(container) {
        super(container)
        this.manager_ = container.manager
        this.rentalProductRepository_ = container.rentalProductRepository
        this.productService_ = container.productService
    }

    async list(
        selector: RentalProductSelector = {},
        config: FindConfig<RentalProduct> = { relations: [], skip: 0, take: 20 }
    ): Promise<RentalProduct[]> {
        const rentalProductRepo = this.activeManager_.getRepository(RentalProduct)

        const query: FindManyOptions<RentalProduct> = {
            where: this.buildWhere_(selector),
            take: config.take,
            skip: config.skip,
            relations: {
                product: true,
            }
        }

        return await rentalProductRepo.find(query)
    }

    private buildWhere_(selector: RentalProductSelector): FindOptionsWhere<RentalProduct> {
        const where: FindOptionsWhere<RentalProduct> = {}

        for (const [key, value] of Object.entries(selector)) {
            if (value !== undefined && value !== null) {
                switch (key) {
                    case 'id':
                    case 'product_id':
                        where[key] = Equal(value as string)
                        break
                    case 'is_available':
                        where[key] = value as boolean
                        break
                    // 여기에 다른 필드에 대한 처리를 추가할 수 있습니다.
                    default:
                        // 알 수 없는 키에 대한 처리
                        console.warn(`Unknown selector key: ${key}`)
                }
            }
        }

        return where
    }

    async retrieve(id: string, config: FindConfig<RentalProduct> = {}): Promise<RentalProduct> {
        const rentalProductRepo = this.activeManager_.getRepository(RentalProduct)
        const rentalProduct = await rentalProductRepo.findOne({
            where: { id },
            ...config,
        })

        if (!rentalProduct) {
            throw new Error(`Rental product with id: ${id} not found`)
        }

        return rentalProduct
    }

    async create(data: CreateRentalProductInput): Promise<RentalProduct> {
        return this.atomicPhase_(async (manager) => {
            const rentalProductRepo = manager.getRepository(RentalProduct)

            // Verify that the product exists
            await this.productService_.retrieve(data.product_id)

            const rentalProduct = rentalProductRepo.create(data)
            return await rentalProductRepo.save(rentalProduct)
        })
    }

    async update(id: string, data: UpdateRentalProductInput): Promise<RentalProduct> {
        return this.atomicPhase_(async (manager) => {
            const rentalProductRepo = manager.getRepository(RentalProduct)
            const rentalProduct = await this.retrieve(id)

            Object.assign(rentalProduct, data)
            return await rentalProductRepo.save(rentalProduct)
        })
    }

    async delete(id: string): Promise<void> {
        return this.atomicPhase_(async (manager) => {
            const rentalProductRepo = manager.getRepository(RentalProduct)
            const rentalProduct = await this.retrieve(id)

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
