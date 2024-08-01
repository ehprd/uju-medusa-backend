import {Logger} from "@medusajs/medusa"
import toss, {IConnection} from "toss-payments-server-api";
import {ITossPayment} from "toss-payments-server-api/lib/structures/ITossPayment";
import {ITossPaymentCancel} from "toss-payments-server-api/lib/structures/ITossPaymentCancel";
import axios from "axios";

const widgetSecretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
const apiSecretKey = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R";
const encryptedWidgetSecretKey = "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");
const encryptedApiSecretKey = "Basic " + Buffer.from(apiSecretKey + ":").toString("base64");

export class TossHttpClient {
    private connection: toss.IConnection;

    constructor(apiKey: string) {
        this.connection = {
            // host: "http://127.0.0.1:30771", // FAKE-SERVER
            host: "https://api.tosspayments.com", // REAL-SERVER
            headers: {
                "Authorization": encryptedWidgetSecretKey
            }
        };
    }

    async confirmWidgetPayment(paymentKey: string, body: ITossPayment.IApproval): Promise<ITossPayment> {
        try {
            const payment: ITossPayment = await this.approve(
                this.connection,
                paymentKey,
                body
            );
            console.log("Payment Confirmation Success:", payment);
            return payment;
        } catch (error) {
            console.error("Payment Confirmation Error:", error.response.data);
            throw error.response.data;
        }
    }

    async approve(connection: IConnection, paymentKey: string, input: ITossPayment.IApproval): Promise<ITossPayment> {
        const response = await axios.post<ITossPayment>(
            `${connection.host}/v1/payments/${paymentKey}`,
            input,
            {
                headers: {
                    "Authorization": encryptedWidgetSecretKey,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    }

    async retrievePayment(paymentKey: string): Promise<ITossPayment> {
        try {
            const payment: ITossPayment = await this.at(
                this.connection,
                paymentKey,
            );
            console.log("Payment Retrieval Success:", payment);
            return payment;
        } catch (error) {
            console.error("Payment Retrieval Error:", error.response.data);
            throw error.response.data;
        }
    }

    async at(connection: IConnection, paymentKey: string): Promise<ITossPayment> {
        const response = await axios.get<ITossPayment>(
            `${connection.host}/v1/payments/${paymentKey}`,
            {
                headers: {
                    "Authorization": encryptedWidgetSecretKey,
                },
            }
        );
        return response.data;
    }

    async cancelPayment(paymentKey: string, body: ITossPaymentCancel.ICreate): Promise<ITossPayment> {
        try {
            const payment: ITossPayment = await this.cancel(
                this.connection,
                paymentKey,
                body
            )
            console.log("Payment Cancellation Success:", payment);
            return payment;
        } catch (error) {
            console.error("Payment Cancellation Error:", error.response.data);
            throw error.response.data;
        }
    }

    async cancel(connection: IConnection, paymentKey: string, input: ITossPaymentCancel.ICreate): Promise<ITossPayment> {
        let newInput:  ITossPaymentCancel. ICreate = {
            paymentKey: input.paymentKey,
            cancelReason: input.cancelReason,
        }
        const response = await axios.post<ITossPayment>(
            `${connection.host}/v1/payments/${paymentKey}/cancel`,
            newInput,
            {
                headers: {
                    "Authorization": encryptedWidgetSecretKey,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    }

    async refundPayment(paymentKey: string, body: ITossPaymentCancel.ICreate): Promise<ITossPayment> {
        try {
            const payment: ITossPayment = await this.refund(
                this.connection,
                paymentKey,
                body
            )
            console.log("Payment Refund Success:", payment);
            return payment;
        } catch (error) {
            console.error("Payment Refund Error:", error.response.data);
            throw error.response.data;
        }
    }

    async refund(connection: IConnection, paymentKey: string, input: ITossPaymentCancel.ICreate): Promise<ITossPayment> {
        if(input.cancelAmount === undefined) {
            input.cancelAmount = 0;
        }
        let newInput:  ITossPaymentCancel. ICreate = {
            paymentKey: input.paymentKey,
            cancelReason: input.cancelReason,
            cancelAmount: input.cancelAmount,
        }
        const response = await axios.post<ITossPayment>(
            `${connection.host}/v1/payments/${paymentKey}/refund`,
            newInput,
            {
                headers: {
                    "Authorization": encryptedWidgetSecretKey,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    }
}

export default TossHttpClient;
