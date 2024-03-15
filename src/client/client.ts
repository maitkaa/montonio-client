import axios, { AxiosError, AxiosInstance } from "axios";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import qs from "qs";

import { PaymentMethods, PaymentMethodsResponse } from "../types/PaymentMethod";
import { ERRORS } from "../errors";
import { OrderData, OrderResponse, PaymentStatus, RefundResponse } from "../types/orderData";
import {
    Payout,
    PayoutExportResponse,
    PayoutOutputType,
    PayoutsResponse,
    QueryParams, StoreBalanceResponse
} from "../types/statistics";

interface MontonioClientOptions {
    accessKey: string;
    secretKey: string;
    sandbox?: boolean; // Optional, defaults to true
    url?: string; // Optional, overrides sandbox logic
    endpoints?: { [key: string]: string }; // Optional, overrides some default endpoints
    storeUuid?: string; // Optional, for store payout statistics
}

interface MontonioErrorResponse {
    message: string;
}

class ApiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ApiError";
    }
}

class NetworkError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NetworkError";
    }
}

/**
 * Montonio API client
 */
export class MontonioClient {
    private readonly baseUrl: string;
    private readonly axiosInstance: AxiosInstance;
    private readonly endpoints: { [key: string]: string };
    private readonly accessKey: string;
    private readonly secretKey: string;
    private readonly storeUuid?: string;

    constructor(options: MontonioClientOptions) {
        if (!options) {
            throw new Error(ERRORS.MISSING_OPTIONS);
        }

        const { accessKey, secretKey, sandbox, url, endpoints, storeUuid } = options;

        if (!accessKey) {
            throw new Error(ERRORS.MISSING_ACCESS_KEY);
        }

        if (!secretKey) {
            throw new Error(ERRORS.MISSING_SECRET_KEY);
        }

        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.baseUrl = url ?? (sandbox ? "https://sandbox-stargate.montonio.com/api" : "https://stargate.montonio.com/api");
        this.endpoints = endpoints ?? {
            getPaymentMethods: "/stores/payment-methods",
            createOrder: "/orders",
            refundOrder: "/refunds",
            storeBalances: "/store-balances",
        };
        this.storeUuid = storeUuid;
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
        });
    }

    private getAuthorizationHeader() {
        const payload = { accessKey: this.accessKey };
        const token = jwt.sign(payload, this.secretKey, { algorithm: "HS256", expiresIn: "10m" });
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }

    private handleAxiosError(error: unknown) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<MontonioErrorResponse>;
            if (axiosError.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                throw new ApiError(`${ERRORS.API_REQUEST_FAILED}${axiosError.message}`);
            } else if (axiosError.request) {
                // The request was made but no response was received
                throw new NetworkError(`${ERRORS.NETWORK_ERROR}${axiosError.message}`);
            } else {
                // Something happened in setting up the request that triggered an Error
                throw new Error(axiosError.message);
            }
        } else {
            throw error;
        }
    }


    /**
     * Get available payment methods
     * @returns Payment methods
     */
    async getPaymentMethods(): Promise<PaymentMethods> {
        try {
            const response = await this.axiosInstance.get<PaymentMethodsResponse>(this.endpoints.getPaymentMethods,
                this.getAuthorizationHeader(),
            );

            return response.data.paymentMethods;
        } catch (error) {
            this.handleAxiosError(error);
            throw error;
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
            const response = await this.axiosInstance.post<OrderResponse>(this.endpoints.createOrder, { data: token });

            return response.data.paymentUrl;
        } catch (error) {
            this.handleAxiosError(error);
            throw error;
        }
    }


    /**
     * Validate order with order token
     * @param orderToken - Order token
     * @returns Order data
     */
    // eslint-disable-next-line @typescript-eslint/require-await
    async validateOrder(orderToken: string): Promise<OrderResponse> {
        try {
            return jwt.verify(orderToken, this.secretKey) as OrderResponse;
        } catch (error) {
            this.handleAxiosError(error);
            throw error;
        }
    }

    /**
     * Check if an order has been paid
     * @param orderToken - Order token
     * @returns True if the order has been paid
     */
    async isOrderPaid(orderToken: string): Promise<boolean> {
        const order = await this.validateOrder(orderToken);
        return order.paymentStatus === PaymentStatus.PAID;
    }

    /**
     * Get order data
     * @param orderUuid - Order UUID
     * @returns Order data
     */
    async getOrder(orderUuid: string): Promise<OrderResponse> {
        if (!orderUuid) throw new Error(ERRORS.MISSING_UUID);

        try {
            const response = await this.axiosInstance.get<OrderResponse>(`/orders/${orderUuid}`,
                this.getAuthorizationHeader(),
            );
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
            throw error;
        }
    }


    /**
     * Create a refund for an order
     * @param orderUuid - Order UUID
     * @param amount - Refund amount
     * @returns Refund data
     */
    async createRefund(orderUuid: string, amount: number): Promise<RefundResponse> {
        try {
            if (!orderUuid) throw new Error(ERRORS.MISSING_UUID);
            if (amount.toFixed(2) !== amount.toString()) throw new Error(ERRORS.INVALID_AMOUNT_FORMAT);

            const idempotencyKey = (uuidv4 as unknown as () => string)();
            const payload = {
                accessKey: this.accessKey,
                orderUuid,
                amount,
                idempotencyKey
            };

            const token = jwt.sign(payload, this.secretKey, { algorithm: "HS256", expiresIn: "10m" });
            const response = await this.axiosInstance.post<RefundResponse>(this.endpoints.refunds, { data: token });

            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
            throw error;
        }
    }

    /**
     * List payouts
     * @param input - Query parameters (limit, offset, order, orderBy)
     * @returns Payouts[]
     */
    async listPayments(input: QueryParams): Promise<Payout[]> {
        const { limit, offset, order, orderBy } = input;
        if (!this.storeUuid) throw new Error(ERRORS.MISSING_STORE_UUID);
        if (!limit) throw new Error(ERRORS.MISSING_LIMIT);
        if (limit > 150) throw new Error(ERRORS.LIMIT_OVER_MAX);
        if (!offset) throw new Error(ERRORS.MISSING_OFFSET);

        const queryValues: QueryParams = {
            limit,
            offset,
            order,
            orderBy
        };

        const queryParams = (qs as unknown as { stringify: (obj: QueryParams) => string }).stringify(queryValues);

        const endpoint = `/stores/${this.storeUuid}/payouts?${queryParams}`;

        try {
            const response = await this.axiosInstance.get<PayoutsResponse>(endpoint, this.getAuthorizationHeader());
            return response.data.payouts;
        } catch (error) {
            this.handleAxiosError(error);
            throw error;
        }
    }

    /**
     * Export payments
     * **Note:** Bank payment refunds support both excel and xml, Card payments support only excel.
     * @param payoutUuid - Payout UUID
     * @param payoutType - Payout output type
     * @returns URL to download the export
     */
    async exportPayments(payoutUuid: string, payoutType: PayoutOutputType): Promise<string> {
        if (!this.storeUuid) throw new Error(ERRORS.MISSING_STORE_UUID);
        if (!payoutUuid) throw new Error(ERRORS.MISSING_PAYOUT_UUID);
        if (!payoutType) throw new Error(ERRORS.MISSING_PAYOUT_UUID);

        const endpoint = `/stores/${this.storeUuid}/payouts/${payoutUuid}/export-${payoutUuid}`;
        try {
            const response = await this.axiosInstance.get<PayoutExportResponse>(endpoint, this.getAuthorizationHeader());
            return response.data.url;
        } catch (error) {
            this.handleAxiosError(error);
            throw error;
        }

    }

    /**
     * Get store balances
     * @returns Store balances
     */
    async getStoreBalances(): Promise<StoreBalanceResponse> {
        try {
            const response = await this.axiosInstance.get<StoreBalanceResponse>(this.endpoints.storeBalances, this.getAuthorizationHeader());

            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
            throw error;
        }
    }

}
