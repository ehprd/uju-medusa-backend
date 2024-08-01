import {EOL} from "os"
import {
    AbstractPaymentProcessor,
    isPaymentProcessorError,
    PaymentProcessorContext,
    PaymentProcessorError,
    PaymentProcessorSessionResponse,
    PaymentSessionStatus,
} from "@medusajs/medusa"

import {Logger} from "@medusajs/types"
import {MedusaError} from "@medusajs/utils"
import {TossHttpClient} from "../core/toss-client";
import {PaymentStatus, PurchaseUnits, TossOrder, TossOrderStatus} from "../core/types";
import {UUID} from "typeorm/driver/mongodb/bson.typings";

class TossProviderService extends AbstractPaymentProcessor {
    static identifier = "toss"

    protected toss_: TossHttpClient
    protected readonly logger_: Logger | undefined

    constructor({logger}: { logger?: Logger }, options) {
        // @ts-ignore
        // eslint-disable-next-line prefer-rest-params
        super(...arguments)

        this.logger_ = logger
        this.init()
    }

    protected init(): void {
        this.toss_ = new TossHttpClient(null)
    }

    async getPaymentStatus(
        paymentSessionData: Record<string, unknown>
    ): Promise<PaymentSessionStatus> {
        let order
        try {
            order = (await this.retrievePayment(
                paymentSessionData
            )) as TossOrder
        } catch(e){
            if(e.code=== "ALREADY_PROCESSED_PAYMENT"){
                return PaymentSessionStatus.AUTHORIZED
            }
            throw e
        }
        switch (order.status) {
            case PaymentStatus.READY:
                return PaymentSessionStatus.PENDING
            case PaymentStatus.IN_PROGRESS:
            case PaymentStatus.WAITING_FOR_DEPOSIT:
                return PaymentSessionStatus.REQUIRES_MORE
            case PaymentStatus.DONE:
                return PaymentSessionStatus.AUTHORIZED
            case PaymentStatus.CANCELED:
            case PaymentStatus.PARTIAL_CANCELED:
            case PaymentStatus.ABORTED:
            case PaymentStatus.EXPIRED:
                return PaymentSessionStatus.CANCELED
            default:
                return PaymentSessionStatus.PENDING
        }
    }

    async initiatePayment(
        context: PaymentProcessorContext
    ): Promise<PaymentProcessorError | PaymentProcessorSessionResponse> {
        console.log('initiatePayment', context)
        const {amount} = context

        return {
            session_data: {
                amount: amount,
            },
        }
    }

    async authorizePayment(
        paymentSessionData: Record<string, unknown>,
        context: Record<string, unknown>
    ): Promise<
        | PaymentProcessorError
        | {
        status: PaymentSessionStatus
        data: PaymentProcessorSessionResponse["session_data"]
    }
    > {
        console.log('authorizePayment', paymentSessionData, context)
        const {amount, orderId, paymentKey} = paymentSessionData

        try {
            var order = await this.toss_.confirmWidgetPayment(paymentKey as string, {
                amount: amount as number,
                orderId: orderId as string,
            })

            var stat = await this.getPaymentStatus(paymentSessionData)
            return {
                data: { session_data: order }, status: stat
            }
        } catch (error) {
            return this.buildError("An error occurred in authorizePayment", error)
        }
    }

    /**
     * Toss does not provide such feature
     * @param paymentSessionData
     */
    async cancelPayment(
        paymentSessionData: Record<string, unknown>
    ): Promise<
        PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
    > {
        console.log('cancelPayment', paymentSessionData)
        return paymentSessionData
    }

    async capturePayment(
        paymentSessionData: Record<string, unknown>
    ): Promise<
        PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
    > {
        console.log('capturePayment', paymentSessionData)
        try {
            return await this.retrievePayment(paymentSessionData)
        } catch (error) {
            return this.buildError("An error occurred in capturePayment", error)
        }
    }

    /**
     * Toss does not provide such feature
     * @param paymentSessionData
     */
    async deletePayment(
        paymentSessionData: Record<string, unknown>
    ): Promise<
        PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
    > {
        console.log('deletePayment', paymentSessionData)
        return paymentSessionData
    }

    async refundPayment(
        paymentSessionData: Record<string, unknown>,
        refundAmount: number
    ): Promise<
        PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
    > {
        console.log('refundPayment', paymentSessionData, refundAmount)
        try {
            const paymentKey = paymentSessionData.paymentKey as string

            await this.toss_.cancelPayment(paymentKey, {
                cancelReason: "Refund",
                paymentKey: paymentKey,
            })

            return await this.retrievePayment(paymentSessionData)
        } catch (error) {
            return this.buildError("An error occurred in refundPayment", error)
        }
    }

    async retrievePayment(
        paymentSessionData: Record<string, unknown>
    ): Promise<
        PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
    > {
        console.log('retrievePayment', paymentSessionData)
        try {
            const paymentKey = paymentSessionData.paymentKey as string
            return (await this.toss_.retrievePayment(
                paymentKey
            )) as unknown as PaymentProcessorSessionResponse["session_data"]
        } catch (e) {
            return this.buildError("An error occurred in retrievePayment", e)
        }
    }

    async updatePayment(
        context: PaymentProcessorContext
    ): Promise<PaymentProcessorError | PaymentProcessorSessionResponse | void> {
        console.log('updatePayment', context)
        return await this.initiatePayment(context).catch((e) => {
            return this.buildError("An error occurred in updatePayment", e)
        })
    }

    async updatePaymentData(sessionId: string, data: Record<string, unknown>): Promise<PaymentProcessorError | Record<string, unknown>> {
        console.log('updatePaymentData', sessionId, data)
        try {
            if (data.amount) {
                throw new MedusaError(
                    MedusaError.Types.INVALID_DATA,
                    "Cannot update amount, use updatePayment instead"
                )
            }

            return data
        } catch (e) {
            return this.buildError("An error occurred in updatePaymentData", e)
        }
    }

    protected buildError(
        message: string,
        e: PaymentProcessorError | Error
    ): PaymentProcessorError {
        return {
            error: message,
            code: "code" in e ? e.code : "",
            detail: isPaymentProcessorError(e)
                ? `${e.error}${EOL}${e.detail ?? ""}`
                : e.message ?? "",
        }
    }

}

export default TossProviderService
