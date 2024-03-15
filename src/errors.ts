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
    INVALID_AMOUNT_FORMAT: "Invalid amount. It should be a number with up to 2 decimal places.",
    MISSING_ORDER_UUID: "Order UUID is required",
    MISSING_STORE_UUID: "Store UUID is required",
    MISSING_LIMIT: "Limit is required",
    LIMIT_OVER_MAX: "Limit is over the maximum allowed value of 150",
    MISSING_OFFSET: "Offset is required",
    MISSING_PAYOUT_UUID: "Payout UUID is required",
    MISSING_PAYOUT_TYPE: "Payout type is required",
    NETWORK_ERROR: "Network error",
};
