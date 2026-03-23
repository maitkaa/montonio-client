import nock from "nock";

import {
    Currency,
    ERRORS,
    Locale,
    MontonioClient,
    MontonioClientOptions,
    PaymentLinkOptions,
} from "../src";

const BASE_URL = "https://sandbox-stargate.montonio.com/api";

describe("Payment Links", () => {
    let options: MontonioClientOptions;
    let client: MontonioClient;
    let paymentLinkOptions: PaymentLinkOptions;

    beforeEach(() => {
        options = {
            accessKey: "testAccessKey",
            secretKey: "testSecretKey",
            sandbox: true,
        };
        client = new MontonioClient(options);

        paymentLinkOptions = {
            amount: 50.00,
            currency: Currency.EUR,
            merchantReference: "LINK-001",
            description: "Invoice payment",
            returnUrl: "https://example.com/return",
            notificationUrl: "https://example.com/notify",
            locale: Locale.En,
        };
    });

    afterEach(() => {
        nock.cleanAll();
    });

    it("should create a payment link and return paymentUrl and uuid", async () => {
        const mockResponse = {
            paymentUrl: "https://sandbox-payments.montonio.com?payment_token=abc123",
            uuid: "test-uuid-123",
        };

        nock(BASE_URL)
            .post("/payment-links")
            .reply(200, mockResponse);

        const result = await client.createPaymentLink(paymentLinkOptions);

        expect(result.paymentUrl).toBe(mockResponse.paymentUrl);
        expect(result.uuid).toBe(mockResponse.uuid);
    });

    it("should include preferredProvider in the request", async () => {
        const mockResponse = {
            paymentUrl: "https://sandbox-payments.montonio.com?payment_token=xyz789",
            uuid: "test-uuid-456",
        };

        nock(BASE_URL)
            .post("/payment-links")
            .reply(200, mockResponse);

        const result = await client.createPaymentLink({
            ...paymentLinkOptions,
            preferredProvider: "lhv",
        });

        expect(result.paymentUrl).toBeDefined();
    });

    it("should throw ApiError when the API returns an error", async () => {
        nock(BASE_URL)
            .post("/payment-links")
            .reply(400, { message: "Invalid request", code: "INVALID_REQUEST" });

        await expect(client.createPaymentLink(paymentLinkOptions)).rejects.toThrow(ERRORS.API_REQUEST_FAILED);
    });

    it("should throw NetworkError when no response is received", async () => {
        nock(BASE_URL)
            .post("/payment-links")
            .replyWithError("Network error");

        await expect(client.createPaymentLink(paymentLinkOptions)).rejects.toThrow();
    });
});
