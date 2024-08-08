import {PricedVariant} from "@medusajs/medusa/dist/types/pricing";
import {ProductVariantInventoryItem} from "@medusajs/medusa/dist/models/product-variant-inventory-item";
import {InventoryLevelDTO} from "@medusajs/types";
import {
    ProductVariant,
    ProductVariantInventoryService as MedusaProductVariantInventoryService,
} from "@medusajs/medusa"

type AvailabilityContext = {
    variantInventoryMap?: Map<string, ProductVariantInventoryItem[]>;
    inventoryLocationMap?: Map<string, InventoryLevelDTO[]>;
};

class ProductVariantInventoryService extends MedusaProductVariantInventoryService {
    setVariantAvailability(variants: ProductVariant[] | PricedVariant[], salesChannelId: string | string[] | undefined, availabilityContext?: AvailabilityContext): Promise<ProductVariant[] | PricedVariant[]> {
        const value = super.setVariantAvailability(variants, salesChannelId, availabilityContext);

        return value.then((result) => {
            return result
        })
    }
}

export default ProductVariantInventoryService;
