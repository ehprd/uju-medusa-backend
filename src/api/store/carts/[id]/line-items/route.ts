import {EntityManager} from "typeorm";
import {IsInt, IsOptional, IsString} from "class-validator"
import {
    CartService, cleanResponseData,
    defaultStoreCartFields,
    defaultStoreCartRelations,
    IdempotencyKey,
    IdempotencyKeyService, LineItem, LineItemService, MedusaRequest, MedusaResponse, validator
} from "@medusajs/medusa";
import {initializeIdempotencyRequest} from "@medusajs/medusa/dist/utils/idempotency";
import {
    CreateLineItemSteps, setPaymentSessions, setVariantAvailability
} from "@medusajs/medusa/dist/api/routes/store/carts/create-line-item/utils/handler-steps";
import {featureFlagRouter} from "@medusajs/medusa/dist/loaders/feature-flags";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    const {id} = req.params
    console.log(id)

    const customerId: string | undefined = req.user?.customer_id
    const validated = await validator(StorePostCartsCartLineItemsReq, req.body)

    const manager: EntityManager = req.scope.resolve("manager")

    let idempotencyKey!: IdempotencyKey
    try {
        idempotencyKey = await initializeIdempotencyRequest(req, res)
    } catch {
        res.status(409).send("Failed to create idempotency key")
        return
    }

    let inProgress = true
    let err: unknown = false

    const idempotencyKeyService: IdempotencyKeyService = req.scope.resolve(
        "idempotencyKeyService"
    )

    while (inProgress) {
        switch (idempotencyKey.recovery_point) {
            case CreateLineItemSteps.STARTED: {
                try {
                    const cartId = id
                    if(validated.metadata?.rentPlace) {
                        const data = {
                            customer_id: customerId,
                            metadata: validated.metadata,
                            quantity: validated.quantity,
                            variant_id: validated.variant_id,
                        }

                        await addOrUpdateRentalLineItem({
                            cartId,
                            container: req.scope,
                            manager,
                            data,
                        })
                    } else {
                        const data = {
                            customer_id: customerId,
                            metadata: validated.metadata,
                            quantity: validated.quantity,
                            variant_id: validated.variant_id,
                        }

                        await addOrUpdateLineItem({
                            cartId,
                            container: req.scope,
                            manager,
                            data,
                        })
                    }

                    idempotencyKey = await idempotencyKeyService
                        .withTransaction(manager)
                        .update(idempotencyKey.idempotency_key, {
                            recovery_point: CreateLineItemSteps.SET_PAYMENT_SESSIONS,
                        })
                } catch (e) {
                    inProgress = false
                    err = e
                }

                break
            }

            case CreateLineItemSteps.SET_PAYMENT_SESSIONS: {
                try {
                    const cartService: CartService = req.scope.resolve("cartService")
                    const getCart = async () => {
                        return await cartService
                            .withTransaction(manager)
                            .retrieveWithTotals(id, {
                                select: defaultStoreCartFields,
                                relations: [
                                    ...defaultStoreCartRelations,
                                    "region.tax_rates",
                                    "customer",
                                ],
                            })
                    }

                    const cart = await getCart()

                    await manager.transaction(async (transactionManager) => {
                        await setPaymentSessions({
                            cart,
                            container: req.scope,
                            manager: transactionManager,
                        })
                    })

                    const freshCart = await getCart()
                    await setVariantAvailability({
                        cart: freshCart,
                        container: req.scope,
                        manager,
                    })

                    idempotencyKey = await idempotencyKeyService
                        .withTransaction(manager)
                        .update(idempotencyKey.idempotency_key, {
                            recovery_point: CreateLineItemSteps.FINISHED,
                            response_code: 200,
                            response_body: {cart: freshCart},
                        })
                } catch (e) {
                    inProgress = false
                    err = e
                }

                break
            }

            case CreateLineItemSteps.FINISHED: {
                inProgress = false
                break
            }
        }
    }

    if (err) {
        throw err
    }

    if (idempotencyKey.response_body.cart) {
        idempotencyKey.response_body.cart = cleanResponseData(
            idempotencyKey.response_body.cart,
            []
        )
    }

    res.status(idempotencyKey.response_code).json(idempotencyKey.response_body)
}

/**
 * @schema StorePostCartsCartLineItemsReq
 * type: object
 * description: "The details of the line item to create."
 * required:
 *   - variant_id
 *   - quantity
 * properties:
 *   variant_id:
 *     type: string
 *     description: The id of the Product Variant to generate the Line Item from.
 *   quantity:
 *     type: number
 *     description: The quantity of the Product Variant to add to the Line Item.
 *   metadata:
 *     type: object
 *     description: An optional key-value map with additional details about the Line Item.
 *     externalDocs:
 *       description: "Learn about the metadata attribute, and how to delete and update it."
 *       url: "https://docs.medusajs.com/development/entities/overview#metadata-attribute"
 */
export class StorePostCartsCartLineItemsReq {
    @IsString()
    variant_id: string

    @IsInt()
    quantity: number

    @IsOptional()
    metadata?: Record<string, unknown> | undefined
}

export async function addOrUpdateLineItem(
    {
        cartId,
        container,
        manager,
        data,
    }
) {
    const cartService: CartService = container.resolve("cartService")
    const lineItemService: LineItemService = container.resolve("lineItemService")

    const cart = await cartService.retrieve(cartId, {
        select: ["id", "region_id", "customer_id"],
    })

    const line: LineItem = await lineItemService
        .withTransaction(manager)
        .generate(data.variant_id, cart.region_id, data.quantity, {
            customer_id: data.customer_id || cart.customer_id,
            metadata: data.metadata,
        })

    await manager.transaction(async (transactionManager) => {
        const txCartService = cartService.withTransaction(transactionManager)

        await txCartService.addOrUpdateLineItems(cart.id, line, {
            validateSalesChannels:
                featureFlagRouter.isFeatureEnabled("sales_channels"),
        })
    })
}

export async function  addOrUpdateRentalLineItem(
    {
        cartId,
        container,
        manager,
        data,
    }
) {
    const cartService: CartService = container.resolve("cartService")
    const lineItemService: LineItemService = container.resolve("lineItemService")
    const productVariantService = container.resolve("productVariantService")
    const productService = container.resolve("productService")

    const variant = await productVariantService.retrieve(data.variant_id)

    const product = productService.retrieve(variant.product_id, {
        select: ["variant"],
    })

    const startDate = new Date(data.metadata.rentPlace.startDate)
    const endDate = new Date(data.metadata.rentPlace.endDate)

    if(variant.title === "Daily Rental") {
        data.quantity = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        if(data.quantity > 2) {
            const weeklyVariant = await productVariantService.find(
                {
                    title: "Weekly Rental",
                    product_id: product.id
                }
            )
            data.variant_id = weeklyVariant.id
        }
    } else if(variant.title === "Monthly Rental") {
        data.quantity = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) / 30)
    }
    const cart = await cartService.retrieve(cartId, {
        select: ["id", "region_id", "customer_id"],
    })

    const line: LineItem = await lineItemService
        .withTransaction(manager)
        .generate(data.variant_id, cart.region_id, data.quantity, {
            customer_id: data.customer_id || cart.customer_id,
            metadata: data.metadata,
        })

    await manager.transaction(async (transactionManager) => {
        const txCartService = cartService.withTransaction(transactionManager)

        await txCartService.addOrUpdateLineItems(cart.id, line, {
            validateSalesChannels:
                featureFlagRouter.isFeatureEnabled("sales_channels"),
        })
    })
}
