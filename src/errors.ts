export interface MontonioErrorResponse {
    message: string;
    code: string;
}

export class ApiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ApiError";
    }
}

export class NetworkError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NetworkError";
    }
}

export const ERRORS = {
    MISSING_OPTIONS: "Missing required parameter: options",
    MISSING_ACCESS_KEY: "Missing required option: accessKey",
    MISSING_SECRET_KEY: "Missing required option: secretKey",
    API_REQUEST_FAILED: "API request failed: ",
    API_MONTONIO_RESPONSE: "Montonio response: ",
    ORDER_TOKEN_DECODE_FAILED: "Failed to decode order token",
    ORDER_TOKEN_DECODE_WRONG_ACCESS_KEY: "Order token access key does not match the access key provided in the options",
    INVALID_AMOUNT_FORMAT: "Invalid amount. It should be a number with up to 2 decimal places.",
    MISSING_ORDER_UUID: "Order UUID is required",
    MISSING_STORE_UUID: "Store UUID is required",
    LIMIT_OVER_MAX: "Limit is over the maximum allowed value of 150",
    MISSING_PAYOUT_UUID: "Payout UUID is required",
    MISSING_PAYOUT_TYPE: "Payout type is required",
    NETWORK_ERROR: "Network error",
    INVALID_HIRE_PURCHASE_AMOUNT: "Invalid amount for HirePurchase. Amount must be between 100€ and 10000€.",
    INVALID_BNPL_AMOUNT_PERIOD_1: "Invalid amount for Bnpl period 1. Amount must be between 30€ and 800€.",
    INVALID_BNPL_AMOUNT_PERIOD_2_3: "Invalid amount for Bnpl period 2 or 3. Amount must be between 75€ and 2500€.",
    INVALID_BNPL_PERIOD: "Invalid period for Bnpl. Period must be 1, 2 or 3.",
    INVALID_CURRENCY: "Invalid currency. The only supported currency is PLN.",
};
