import axios, { AxiosError, AxiosInstance } from "axios";
import jwt from "jsonwebtoken";

import { PaymentMethods, PaymentMethodsResponse } from "../types/PaymentMethod";
import { ERRORS } from "../errors";

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

        this.baseUrl = url ?? (sandbox ? "https://sandbox-stargate.montonio.com" : "https://stargate.montonio.com/");

        this.endpoints = endpoints ?? {
            getPaymentMethods: "/api/stores/payment-methods",
        };

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
            const response = await this.axiosInstance.get<PaymentMethodsResponse>(this.endpoints.getPaymentMethods);
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
}
