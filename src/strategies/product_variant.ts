import {PriceSelectionContext, PriceSelectionResult, ProductVariant,} from "@medusajs/medusa"
import PriceSelectionStrategy from "@medusajs/medusa/dist/strategies/price-selection";
import ProductVariantRepository from "@medusajs/medusa/dist/repositories/product-variant";
import RentalProductRepository from "../repositories/rental-product";
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

        return await super.calculateVariantPrice(data, context)
    }

}

