import {
    MiddlewaresConfig,
    MedusaRequest,
    MedusaResponse,
    MedusaNextFunction, requireCustomerAuthentication,
} from "@medusajs/medusa";
import {validateAndTransformBody} from "@medusajs/medusa/dist/api-v2/utils/validate-body";
import {validateAndTransformQuery} from "@medusajs/medusa/dist/api-v2/utils/validate-query";
import {StoreAddCartLineItem, StoreGetCartsCart} from "@medusajs/medusa/dist/api-v2/store/carts/validators";
import * as QueryConfig from "./store/query-config"
import {authenticate} from "@medusajs/medusa/dist/utils/authenticate-middleware";

const storeMiddleware = (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
) => {
    // do something
    console.log("storeMiddleware")
    next()
}

export const config: MiddlewaresConfig = {
    routes: [
    ],
}
