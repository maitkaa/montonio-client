import axios, { AxiosError, AxiosInstance } from "axios";
import jwt from "jsonwebtoken";

import { PaymentMethods, PaymentMethodsResponse } from "../types/PaymentMethod";
import { ERRORS } from "../errors";
import { OrderData, PaymentUrlResponse } from "../types/orderData";

interface MontonioClientOptions {
    accessKey: string;
    secretKey: string;
    sandbox?: boolean; // Optional, defaults to true
    url?: string; // Optional, overrides sandbox logic
    endpoints?: { [key: string]: string }; // Optional, custom endpoints
}

interface MontonioErrorResponse {
    message: string;
}

export class MontonioClient {
    private readonly baseUrl: string;
    private readonly axiosInstance: AxiosInstance;
    private readonly endpoints: { [key: string]: string };
    private readonly accessKey: string;
    private readonly secretKey: string;

    constructor(options: MontonioClientOptions) {
        if (!options) {
            throw new Error(ERRORS.MISSING_OPTIONS);
        }

        const { accessKey, secretKey, sandbox, url, endpoints } = options;

        if (!accessKey) {
            throw new Error(ERRORS.MISSING_ACCESS_KEY);
        }

        if (!secretKey) {
            throw new Error(ERRORS.MISSING_SECRET_KEY);
        }

        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.baseUrl = url ?? (sandbox ? "https://sandbox-stargate.montonio.com" : "https://stargate.montonio.com/");
        this.endpoints = endpoints ?? {
            getPaymentMethods: "/api/stores/payment-methods",
            createOrder: "/api/orders",
        };

        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
        });
    }

    async getPaymentMethods(): Promise<PaymentMethods> {
        try {
            const payload = { accessKey: this.accessKey };
            const token = jwt.sign(payload, this.secretKey, { algorithm: "HS256", expiresIn: "10m" });
            const response = await this.axiosInstance.get<PaymentMethodsResponse>(this.endpoints.getPaymentMethods, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data.paymentMethods;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<MontonioErrorResponse>;
                throw new Error(`${ERRORS.API_REQUEST_FAILED}${axiosError.message}`);
            } else {
                throw error;
            }
        }
    }

    /**
     * Create an order in Montonio
     * @param orderData - Order data
     * @returns Payment URL
     */
    async createOrder(orderData: OrderData): Promise<string> {
        try {
            const token = jwt.sign({ accessKey: this.accessKey, ...orderData }, this.secretKey, {
                algorithm: "HS256",
                expiresIn: "10m"
            });
            const response = await this.axiosInstance.post<PaymentUrlResponse>(this.endpoints.createOrder, { data: token });

            return response.data.paymentUrl;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<MontonioErrorResponse>;
                throw new Error(`${ERRORS.API_REQUEST_FAILED}${axiosError.message}`);
            } else {
                throw error;
            }
        }
    }

}
