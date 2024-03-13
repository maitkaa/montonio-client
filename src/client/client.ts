import axios, { AxiosError, AxiosInstance } from "axios";
import jwt from "jsonwebtoken";

import { PaymentMethods, PaymentMethodsResponse } from "../types/PaymentMethod";

interface MontonioClientOptions {
    accessKey: string;
    secretKey: string;
    sandbox?: boolean; // Optional, defaults to true
    url?: string; // Optional, overrides sandbox logic
}

interface MontonioErrorResponse {
    message: string;
}

export class MontonioClient {
    private readonly baseUrl: string;
    private readonly axiosInstance: AxiosInstance;

    constructor(options: MontonioClientOptions) {
        if (!options || !options.accessKey || !options.secretKey) {
            throw new Error("Missing required options: accessKey and secretKey");
        }

        const { accessKey, secretKey, sandbox, url } = options;

        this.baseUrl = url ?? (sandbox ? "https://sandbox-stargate.montonio.com" : "https://stargate.montonio.com/");

        const payload = { accessKey };
        const token = jwt.sign(payload, secretKey, { algorithm: "HS256", expiresIn: "10m" });

        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    async getPaymentMethods(): Promise<PaymentMethods> {
        try {
            const response = await this.axiosInstance.get<PaymentMethodsResponse>("/api/stores/payment-methods");
            return response.data.paymentMethods;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<MontonioErrorResponse>;
                throw new Error(`API request failed: ${axiosError.message}`);
            } else {
                throw error;
            }
        }
    }
}
