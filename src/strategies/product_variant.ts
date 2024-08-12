import {PriceSelectionContext, PriceSelectionResult, ProductVariant,} from "@medusajs/medusa"
import PriceSelectionStrategy from "@medusajs/medusa/dist/strategies/price-selection";
import ProductVariantRepository from "@medusajs/medusa/dist/repositories/product-variant";
import RentalProductRepository from "../repositories/rental-product";
import {RentalProduct} from "../models/rental-product";
import {MoneyAmount} from "@medusajs/medusa/dist/models";
import {PriceType} from "@medusajs/medusa/dist/interfaces/price-selection-strategy";
import ProductRepository from "@medusajs/medusa/dist/repositories/product";

export default class MyStrategy extends PriceSelectionStrategy {
    protected productRepository_: typeof ProductRepository;
    protected productVariantRepository_: typeof ProductVariantRepository;
    private rentalProductRepository: typeof RentalProductRepository;

    constructor({
                    productVariantRepository,
                    rentalProductRepository,
                    productRepository,
                    manager,
                    featureFlagRouter,
                    moneyAmountRepository,
                    cacheService,
                }) {
        // @ts-ignore
        // eslint-disable-next-line prefer-rest-params
        super(...arguments)
        this.productVariantRepository_ = productVariantRepository
        this.productRepository_ = productRepository
        this.rentalProductRepository = rentalProductRepository
    }

    async calculateVariantPrice(data: {
        variantId: string;
        quantity?: number
    }[], context: PriceSelectionContext): Promise<Map<string, PriceSelectionResult>> {
        const moneyRepo = this.activeManager_.withRepository(this.moneyAmountRepository_)

        const variantsPrices = await this.productVariantRepository_.findOne({
            where: {
                id: data[0].variantId
            },
            relations: ["product", "product.type", "prices"]
        })

        const rentalProduct = await this.rentalProductRepository.findOne({
            where: {
                product_id: variantsPrices.product_id
            }
        })

        if (rentalProduct) {
            const prices = await super.calculateVariantPrice(data, context)
            return prices
        } else {
            return await super.calculateVariantPrice(data, context)
        }
    }

}

