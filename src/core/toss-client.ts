import {Logger} from "@medusajs/medusa"
import axios, {AxiosInstance, AxiosRequestConfig, Method} from "axios"

const widgetSecretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
const apiSecretKey = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R";
const BASE_URL = "https://api.tosspayments.com/v1";
const encryptedWidgetSecretKey = "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");
const encryptedApiSecretKey = "Basic " + Buffer.from(apiSecretKey + ":").toString("base64");

export class TossHttpClient {
    private client: AxiosInstance;
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey || widgetSecretKey;
        this.client = axios.create({
            baseURL: BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }

    async confirmWidgetPayment(paymentKey: string, orderId: string, amount: number): Promise<Record<string, unknown>> {
        try {
            const response = await this.client.post(
                "/payments/confirm",
                {
                    orderId: orderId,
                    amount: amount,
                    paymentKey: paymentKey,
                },
                {
                    headers: {
                        Authorization: encryptedApiSecretKey,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log("Payment Confirmation Success:", response.data.json());
            return response.data;
        } catch (error) {
            console.error("Payment Confirmation Error:", error.response.data);
            throw error.response.data;
        }
    }

    async retrievePayment(paymentKey: string): Promise<Record<string, unknown>> {
        try {
            const response = await this.client.get(`/payments/${paymentKey}`, {
                headers: {
                    Authorization: encryptedApiSecretKey,
                    "Content-Type": "application/json",
                },
            });
            console.log("Payment Retrieval Success:", response.data.json());
            return response.data;
        } catch (error) {
            console.error("Payment Retrieval Error:", error.response.data);
            throw error.response.data;
        }
    }

    async retrieveOrder(orderId: string): Promise<Record<string, unknown>> {
        try {
            const response = await this.client.get(`/payments/orders/${orderId}`, {
                headers: {
                    Authorization: encryptedApiSecretKey,
                    "Content-Type": "application/json",
                },
            });
            console.log("Order Retrieval Success:", response.data.json());
            return response.data;
        } catch (error) {
            console.error("Order Retrieval Error:", error.response.data);
            throw error.response.data;
        }
    }

    async cancelPayment(paymentKey: string, cancelReason: string): Promise<Record<string, unknown>> {
        try {
            const response = await this.client.post(`/payments/${paymentKey}/cancel`, {
                headers: {
                    Authorization: encryptedApiSecretKey,
                    "Content-Type": "application/json",
                },
                data: {
                    "cancelReason": cancelReason,
                }
            });
            console.log("Payment Cancellation Success:", response.data.json());
            return response.data;
        } catch (error) {
            console.error("Payment Cancellation Error:", error.response.data);
            throw error.response.data;
        }
    }
}

export default TossHttpClient;
