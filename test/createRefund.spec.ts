import nock from "nock";

import { MontonioClient, MontonioClientOptions, RefundResponse, ERRORS, Currency } from "../src";

describe("MontonioClient Refund Creation", () => {
    let options: MontonioClientOptions;
    let client: MontonioClient;

    beforeEach(() => {
        options = {
            accessKey: "testAccessKey",
            secretKey: "testSecretKey",
            sandbox: true,
        };
        client = new MontonioClient(options);
    });

    it("should create a refund", async () => {
        const orderUuid = "testOrderUuid";
        const amount = 100.00;
        const refundResponse: RefundResponse = {
            uuid: "123e4567-e89b-12d3-a456-426614174000",
            amount: 100.00,
            status: "PENDING",
            currency: Currency.EUR,
            createdAt: new Date().toISOString(),
            type: "PARTIAL_REFUND",
        };


        nock("https://sandbox-stargate.montonio.com")
            .post("/api/refunds")
            .reply(200, refundResponse);

        const result = await client.createRefund(orderUuid, amount);

        expect(result).toEqual(refundResponse);
    });

    it("should throw error for invalid amount format", async () => {
        const orderUuid = "testOrderUuid";
        const amount = 100.123;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
        await expect(client.createRefund(orderUuid, amount)).rejects.toThrowError(ERRORS.INVALID_AMOUNT_FORMAT);
    });

    it("should handle errors", async () => {
        const orderUuid = "testOrderUuid";
        const amount = 100.00;
        const errorMessage = "Test error";

        nock("https://sandbox-stargate.montonio.com")
            .post("/api/refunds")
            .replyWithError(errorMessage);

        await expect(client.createRefund(orderUuid, amount)).rejects.toThrowError(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
            `${ERRORS.NETWORK_ERROR}${errorMessage}`
        );
    });
});
