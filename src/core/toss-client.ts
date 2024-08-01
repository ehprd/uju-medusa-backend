import {Logger} from "@medusajs/medusa"
import toss from "toss-payments-server-api";
import {ITossPayment} from "toss-payments-server-api/lib/structures/ITossPayment";
import {ITossPaymentCancel} from "toss-payments-server-api/lib/structures/ITossPaymentCancel";

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
                Authorization: encryptedApiSecretKey
            }
        };
    }

    async confirmWidgetPayment(paymentKey: string, body: ITossPayment.IApproval): Promise<ITossPayment> {
        try {
            const payment: ITossPayment = await toss.functional.v1.payments.approve
            (
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

    async retrievePayment(paymentKey: string): Promise<ITossPayment> {
        try {
            const payment: ITossPayment = await toss.functional.v1.payments.at
            (
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

    async cancelPayment(paymentKey: string, body: ITossPaymentCancel.ICreate): Promise<ITossPayment> {
        try {
            const payment: ITossPayment = await toss.functional.v1.payments.cancel(
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
}

export default TossHttpClient;
