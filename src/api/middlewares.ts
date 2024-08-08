import {
    MiddlewaresConfig,
    MedusaRequest,
    MedusaResponse,
    MedusaNextFunction,
    requireCustomerAuthentication,
    transformStoreQuery,
    FindParams,
    defaultStoreCartRelations,
    defaultStoreCartFields,
} from "@medusajs/medusa";

async function rentalItemMiddleware(
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
) {
    // 여기에 렌탈 아이템 관련 미들웨어 로직을 구현
    console.log("Rental item being added to cart")
    next()
}

export const config: MiddlewaresConfig = {
    routes: [
        {
            method: ["GET"],
            matcher: "/store/carts/:id",
            middlewares: [
                transformStoreQuery(FindParams, {
                    defaultRelations: defaultStoreCartRelations,
                    defaultFields: defaultStoreCartFields,
                    isList: false,
                }),
            ],
        },
        {
            matcher: "/store/carts/.*/rental-items",
            middlewares: [rentalItemMiddleware],
        },
    ],
}
