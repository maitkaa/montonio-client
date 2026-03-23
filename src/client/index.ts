import qs from "qs";
import { v4 as uuidv4 } from "uuid";

import { Currency, PaymentMethod, PaymentStatus, PayoutOutputType } from "../enums";
import { ERRORS } from "../errors";
import {
    Order,
    OrderResponse,
    PaymentDetails,
    PaymentLinkOptions,
    PaymentLinkResponse,
    PaymentMethods,
    PaymentMethodsResponse, Payout, PayoutExportResponse, PayoutsResponse,
    QueryParams,
    RefundResponse, StoreBalanceResponse
} from "../types";
import { MontonioBaseClient } from "../base";
import jwt from "jsonwebtoken";


/**
 * Montonio API client options
 */
export interface MontonioClientOptions {
    accessKey: string;
    secretKey: string;
    sandbox?: boolean; // Optional, defaults to true
    url?: string; // Optional, overrides sandbox logic
    endpoints?: { [key: string]: string }; // Optional, overrides some default endpoints
    storeUuid?: string; // Optional, for store payout statistics
}

/**
 * Montonio API client
 */
export class MontonioClient extends MontonioBaseClient {
    private readonly endpoints: { [key: string]: string };
    private readonly storeUuid?: string;

    constructor(options: MontonioClientOptions) {
        if (!options || !options.accessKey || !options.secretKey) {
            throw new Error(ERRORS.MISSING_OPTIONS);
        }

        const { accessKey, secretKey, sandbox, url, endpoints, storeUuid } = options;

        const baseUrl = url ?? (sandbox !== false
            ? "https://sandbox-stargate.montonio.com/api"
            : "https://stargate.montonio.com/api");

        super(accessKey, secretKey, baseUrl);

        this.endpoints = endpoints ?? {
            getPaymentMethods: "/stores/payment-methods",
            createOrder: "/orders",
            refundOrder: "/refunds",
            storeBalances: "/store-balances",
        };
        this.storeUuid = storeUuid;
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
        }
    }

    /**
     * Create an order in Montonio
     * @param orderData - Order data
     * @returns Payment URL
     */
    async createOrder(orderData: Order): Promise<string> {
        try {
            // Check if payment method is HirePurchase
            if (orderData.payment.method === PaymentMethod.HirePurchase) {
                if (orderData.payment.amount < 100 || orderData.payment.amount > 10000) {
                    throw new Error(ERRORS.INVALID_HIRE_PURCHASE_AMOUNT);
                }
            }

            // Check if payment method is Blik and currency is PLN
            if (orderData.payment.method === PaymentMethod.Blik) {
                if (orderData.payment.currency !== Currency.PLN) {
                    throw new Error(ERRORS.INVALID_CURRENCY);
                }
            }

            // Check if payment method is Bnpl
            if (orderData.payment.method === PaymentMethod.Bnpl && "period" in orderData.payment.methodOptions) {
                const period = orderData.payment.methodOptions.period;
                const amount = orderData.payment.amount;

                if (![1, 2, 3].includes(period)) {
                    throw new Error(ERRORS.INVALID_BNPL_PERIOD);
                }

                if (period === 1 && (amount < 30 || amount > 800)) {
                    throw new Error(ERRORS.INVALID_BNPL_AMOUNT_PERIOD_1);
                } else if ((period === 2 || period === 3) && (amount < 75 || amount > 2500)) {
                    throw new Error(ERRORS.INVALID_BNPL_AMOUNT_PERIOD_2_3);
                }
            }

            const token = jwt.sign({ accessKey: this.accessKey, ...orderData }, this.secretKey, {
                algorithm: "HS256",
                expiresIn: "10m"
            });
            const response = await this.axiosInstance.post<OrderResponse>(this.endpoints.createOrder, { data: token });

            return response.data.paymentUrl;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    /**
     * Validate order with order token
     * @param orderToken - Order token
     * @returns Order data
     */
    // eslint-disable-next-line @typescript-eslint/require-await
    async validateOrder(orderToken: string): Promise<PaymentDetails> {
        try {
            let decoded;
            try {
                decoded = jwt.verify(orderToken, this.secretKey) as PaymentDetails;
            } catch {
                throw new Error(ERRORS.ORDER_TOKEN_DECODE_FAILED);
            }
            if (!decoded) throw new Error(ERRORS.ORDER_TOKEN_DECODE_FAILED);
            if (decoded.accessKey !== this.accessKey) throw new Error(ERRORS.ORDER_TOKEN_DECODE_WRONG_ACCESS_KEY);
            return decoded;
        } catch (error) {
            this.handleAxiosError(error);
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
        try {
            const response = await this.axiosInstance.get<OrderResponse>(`/orders/${orderUuid}`,
                this.getAuthorizationHeader(),
            );
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
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
            if (parseFloat(amount.toFixed(2)) !== amount) throw new Error(ERRORS.INVALID_AMOUNT_FORMAT);

            const idempotencyKey = uuidv4();
            const payload = {
                accessKey: this.accessKey,
                orderUuid,
                amount,
                idempotencyKey
            };

            const token = jwt.sign(payload, this.secretKey, { algorithm: "HS256", expiresIn: "10m" });
            const response = await this.axiosInstance.post<RefundResponse>(this.endpoints.refundOrder, { data: token });

            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
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
        if (limit > 150) throw new Error(ERRORS.LIMIT_OVER_MAX);

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

        const endpoint = `/stores/${this.storeUuid}/payouts/${payoutUuid}/export-${payoutType}`;
        try {
            const response = await this.axiosInstance.get<PayoutExportResponse>(endpoint, this.getAuthorizationHeader());
            return response.data.url;
        } catch (error) {
            this.handleAxiosError(error);
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
        }
    }

    /**
     * Create a payment link
     * @param options - Payment link options
     * @returns Payment URL and UUID
     */
    async createPaymentLink(options: PaymentLinkOptions): Promise<PaymentLinkResponse> {
        try {
            const token = jwt.sign(
                { accessKey: this.accessKey, ...options },
                this.secretKey,
                { algorithm: "HS256", expiresIn: "10m" }
            );
            const response = await this.axiosInstance.post<PaymentLinkResponse>("/payment-links", { data: token });
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    /**
     * Validate an incoming webhook JWT token from Montonio
     * @param webhookToken - JWT token received in the webhook notification
     * @returns Decoded payment details
     */
    // eslint-disable-next-line @typescript-eslint/require-await
    async validateWebhook(webhookToken: string): Promise<PaymentDetails> {
        try {
            let decoded;
            try {
                decoded = jwt.verify(webhookToken, this.secretKey) as PaymentDetails;
            } catch {
                throw new Error(ERRORS.ORDER_TOKEN_DECODE_FAILED);
            }
            if (!decoded) throw new Error(ERRORS.ORDER_TOKEN_DECODE_FAILED);
            if (decoded.accessKey !== this.accessKey) throw new Error(ERRORS.ORDER_TOKEN_DECODE_WRONG_ACCESS_KEY);
            return decoded;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

}
