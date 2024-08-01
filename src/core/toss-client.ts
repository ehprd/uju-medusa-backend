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
            const response = await axios.post<ITossPayment>(
                `${this.connection.host}/v1/payments/${paymentKey}`,
                body,
                {
                    headers: {
                        "Authorization": encryptedWidgetSecretKey,
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error("Payment Confirmation Error:", error.response.data);
            throw error.response.data;
        }
    }

    async retrievePayment(paymentKey: string): Promise<ITossPayment> {
        try {
            const response = await axios.get<ITossPayment>(
                `${this.connection.host}/v1/payments/${paymentKey}`,
                {
                    headers: {
                        "Authorization": encryptedWidgetSecretKey,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Payment Retrieval Error:", error.response.data);
            throw error.response.data;
        }
    }

    async cancelPayment(paymentKey: string, body: ITossPaymentCancel.ICreate): Promise<ITossPayment> {
        try {
            let paymentKey = body.paymentKey;

            let newInput: ITossPaymentCancel.ICreate = {
                paymentKey: body.paymentKey,
                cancelReason: body.cancelReason,
            }

            const response = await axios.post<ITossPayment>(
                `${this.connection.host}/v1/payments/${paymentKey}/cancel`,
                newInput,
                {
                    headers: {
                        "Authorization": encryptedWidgetSecretKey,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Payment Cancellation Error:", error.response.data);
            throw error.response.data;
        }
    }

    async refundPayment(paymentKey: string, body: ITossPaymentCancel.ICreate): Promise<ITossPayment> {
        try {
            if (body.cancelAmount === undefined) {
                throw new Error("cancelAmount is required");
            }

            let newInput: ITossPaymentCancel.ICreate = {
                paymentKey: paymentKey,
                cancelReason: body.cancelReason,
                cancelAmount: body.cancelAmount,
            }

            const response = await axios.post<ITossPayment>(
                `${this.connection.host}/v1/payments/${paymentKey}/cancel`,
                newInput,
                {
                    headers: {
                        "Authorization": encryptedWidgetSecretKey,
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error("Payment Refund Error:", error.response.data);
            throw error.response.data;
        }
    }
}

export default TossHttpClient;
