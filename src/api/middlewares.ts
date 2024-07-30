import {
    authenticate, ProductStatus,
} from "@medusajs/medusa"
import type {
    MedusaNextFunction,
    MedusaRequest,
    MedusaResponse,
    MiddlewaresConfig,
    User,
    UserService,
} from "@medusajs/medusa"
import {maybeApplyPriceListsFilter} from "@medusajs/medusa/dist/api-v2/admin/products/utils";
import {maybeApplyLinkFilter} from "@medusajs/medusa/dist/api-v2/utils/maybe-apply-link-filter";
import {validateAndTransformQuery} from "@medusajs/medusa/dist/api-v2/utils/validate-query";
import {z} from "zod";
import {createFindParams} from "@medusajs/medusa/dist/api-v2/utils/validators";
import {AdminGetProductVariantsParams} from "@medusajs/medusa/dist/api-v2/admin/products/validators";
import {GetProductsParams} from "@medusajs/medusa/dist/api-v2/utils/common-validators";
import {listProductQueryConfig} from "@medusajs/medusa/dist/api-v2/admin/products/query-config";

const registerLoggedInUser = async (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
) => {
    let loggedInUser: User | null = null

    if (req.user && req.user.userId) {
        const userService =
            req.scope.resolve("userService") as UserService
        loggedInUser = await userService.retrieve(req.user.userId)
    }

    req.scope.register({
        loggedInUser: {
            resolve: () => loggedInUser,
        },
    })

    console.log("Logged in user registered")
    console.log(req)
    console.log(res)
    next()
}

const statusEnum = z.nativeEnum(ProductStatus)

const AdminGetProductsParams = createFindParams({
    offset: 0,
    limit: 50,
}).merge(
    z
        .object({
            variants: AdminGetProductVariantsParams.optional(),
            price_list_id: z.string().array().optional(),
            status: statusEnum.array().optional(),
            $and: z.lazy(() => AdminGetProductsParams.array()).optional(),
            $or: z.lazy(() => AdminGetProductsParams.array()).optional(),
        })
        .merge(GetProductsParams)
)
export const config: MiddlewaresConfig = {
    routes: [
        {
            method: ["POST"],
            matcher: "/admin/products",
            middlewares: [authenticate(),
                validateAndTransformQuery(
                    AdminGetProductsParams,
                    listProductQueryConfig
                ),
                maybeApplyLinkFilter({
                    entryPoint: "product_sales_channel",
                    resourceId: "product_id",
                    filterableField: "sales_channel_id",
                }),
                maybeApplyPriceListsFilter(),
                registerLoggedInUser],
        },
    ],
}
