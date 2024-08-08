import {PriceSelectionContext, PriceSelectionResult, ProductVariant,} from "@medusajs/medusa"
import PriceSelectionStrategy from "@medusajs/medusa/dist/strategies/price-selection";
import ProductVariantRepository from "@medusajs/medusa/dist/repositories/product-variant";

export default class MyStrategy extends PriceSelectionStrategy {
    protected productVariantRepository_: typeof ProductVariantRepository;

    constructor({
                    productVariantRepository,
                    manager,
                    featureFlagRouter,
                    moneyAmountRepository,
                    cacheService,
                }) {
        // @ts-ignore
        // eslint-disable-next-line prefer-rest-params
        super(...arguments)
        this.productVariantRepository_ = productVariantRepository
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
            relations: ["product","product.type", "prices"]
        })
        //
        // variantsPrices.prices = variantsPrices.prices.map(price => {
        //     price.amount = 100
        //     return price
        // })
        //
        // console.log("CALCULATING VARIANT PRICE")
        //
        //
        // console.log(context)

        if(variantsPrices.product.type !== null && variantsPrices.product.type.value === "rental") {
            console.log(variantsPrices.product)
        }

        const prices = await super.calculateVariantPrice(data, context)
        // if(variantsPrices.product.type.value === "rental"){
        //     console.log("RENTAL")
        // }

        // prices.forEach(
        //     (price, variantId) => {
        //         console.log(price)
        //     }
        // )
        // console.log(prices)
        return prices
    }
}

