import {
    TransactionBaseService,
    FindConfig,
    ProductService, ProductVariantService, ProductTypeService
} from "@medusajs/medusa"
import {EntityManager, Equal, FindManyOptions, FindOptionsWhere} from "typeorm"
import RentalProductRepository from "../repositories/rental-product";
import {RentalProduct} from "../models/rental-product";
import {CreateRentalProductInput, RentalProductSelector, UpdateRentalProductInput} from "../admin/types/rental-product";

class RentalProductService extends TransactionBaseService {
    protected manager_: EntityManager
    protected transactionManager_: EntityManager | undefined
    protected readonly rentalProductRepository_: typeof RentalProductRepository
    protected readonly productVariantService_: ProductVariantService
    protected readonly productTypeService_: ProductTypeService
    protected readonly productService_: ProductService

    constructor(container) {
        super(container)
        this.manager_ = container.manager
        this.rentalProductRepository_ = container.rentalProductRepository
        this.productVariantService_ = container.productVariantService
        this.productTypeService_ = container.productTypeService
        this.productService_ = container.productService
    }

    async findByProductId(productId: string): Promise<RentalProduct | undefined> {
        const rentalProductRepo = this.manager_.getRepository(RentalProduct)

        return await rentalProductRepo.findOne({
            where: {product_id: productId},
            relations: ["product"] // product 관계를 포함하여 가져옵니다.
        })
    }

    async list(
        selector: RentalProductSelector = {},
        config: FindConfig<RentalProduct> = {relations: [], skip: 0, take: 20}
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
            where: {id},
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
            const product = await this.productService_.retrieve(data.product_id, {relations: ["options", "variants"]})

            // 2. 기존 Options와 Variants 삭제
            for (const variant of product.variants) {
                await this.productVariantService_.delete(variant.id)
            }

            for (const option of product.options) {
                await this.productService_.deleteOption(product.id, option.id)
            }

            // 3. 렌트 유형 옵션 추가
            const newProduct = await this.productService_.addOption(product.id, "Rental Type")

            const rentalTypeOption = await this.productService_.retrieveOptionByTitle("Rental Type", newProduct.id)

            // 4. 일일 렌트와 장기 렌트 Variant 생성
            const dailyRentalVariant = await this.productVariantService_.create(newProduct.id, {
                title: "Daily Rental",
                options: [{option_id: rentalTypeOption.id, value: "Daily Rental"}],
                prices: [{amount: data.short_term_rate, currency_code: "krw"}],
                inventory_quantity: 15,
            })

            const weeklyRentalVariant = await this.productVariantService_.create(product.id, {
                title: "Weekly Rental",
                options: [{option_id: rentalTypeOption.id, value: "Weekly Rental"}],
                prices: [{amount: data.medium_term_rate, currency_code: "krw"}],
                inventory_quantity: 12,
            })

            const monthlyRentalVariant = await this.productVariantService_.create(product.id, {
                title: "Monthly Rental",
                options: [{option_id: rentalTypeOption.id, value: "Monthly Rental"}],
                prices: [{amount: data.long_term_rate, currency_code: "krw"}],
                inventory_quantity: 12,
            })

            await this.productService_.update(product.id, {
                metadata: {
                    dailyPrice: data.short_term_rate,
                    shortTermDailyPrice: data.medium_term_rate,
                    longTermDailyPrice: data.long_term_rate,
                    rentPlace:data.rentPlace,
                    returnPlace:data.returnPlace,
                }
            })

            const rentalProduct = rentalProductRepo.create(data)

            return await rentalProductRepo.save(rentalProduct)
        })
    }

    async update(rentalProductId: string, data: Partial<CreateRentalProductInput>): Promise<RentalProduct> {
        return this.atomicPhase_(async (manager) => {
            const rentalProductRepo = manager.getRepository(RentalProduct)
            const rentalProduct = await this.retrieve(rentalProductId)

            const product = await this.productService_.retrieve(rentalProduct.product_id, {relations: ["variants", "options"]})

            if (data.short_term_rate || data.medium_term_rate || data.long_term_rate) {
                // Update variant prices
                for (const variant of product.variants) {
                    if (variant.title === "Daily Rental" && data.short_term_rate) {
                        await this.productVariantService_.update(variant.id, {
                            prices: [{amount: data.short_term_rate, currency_code: "krw"}]
                        })
                    } else if (variant.title === "Weekly Rental" && data.medium_term_rate) {
                        await this.productVariantService_.update(variant.id, {
                            prices: [{amount: data.medium_term_rate, currency_code: "krw"}]
                        })
                    } else if (variant.title === "Monthly Rental" && data.long_term_rate) {
                        await this.productVariantService_.update(variant.id, {
                            prices: [{amount: data.long_term_rate, currency_code: "krw"}]
                        })
                    }
                }

                // Update product metadata
                await this.productService_.update(product.id, {
                    metadata: {
                        ...product.metadata,
                        dailyPrice: data.short_term_rate || product.metadata.dailyPrice,
                        shortTermDailyPrice: data.medium_term_rate || product.metadata.shortTermDailyPrice,
                        longTermDailyPrice: data.long_term_rate || product.metadata.longTermDailyPrice,
                    }
                })
            }

            // Update other rental product fields
            Object.assign(rentalProduct, data)

            return await rentalProductRepo.save(rentalProduct)
        })
    }

    async delete(rentalProductId: string): Promise<void> {
        return this.atomicPhase_(async (manager) => {
            const rentalProductRepo = manager.getRepository(RentalProduct)
            const rentalProduct = await this.retrieve(rentalProductId)

            // Delete rental product
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
