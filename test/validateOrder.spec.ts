import jwt from "jsonwebtoken";

import { MontonioClient, MontonioClientOptions, PaymentStatus, ERRORS } from "../src";

describe("MontonioClient Order Validation", () => {
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

    describe("validateOrder", () => {
        it("should validate order token", async () => {
            const orderToken = jwt.sign({ accessKey: options.accessKey }, options.secretKey);

            const result = await client.validateOrder(orderToken);

            expect(result.accessKey).toEqual(options.accessKey);
        });

        it("should throw error for invalid order token", async () => {
            const orderToken = "invalidToken";
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
            await expect(client.validateOrder(orderToken)).rejects.toThrowError(ERRORS.ORDER_TOKEN_DECODE_FAILED);
        });

        it("should throw error for wrong access key", async () => {
            const orderToken = jwt.sign({ accessKey: "wrongAccessKey" }, options.secretKey);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
            await expect(client.validateOrder(orderToken)).rejects.toThrowError(ERRORS.ORDER_TOKEN_DECODE_WRONG_ACCESS_KEY);
        });
    });

    describe("isOrderPaid", () => {
        it("should return true if order is paid", async () => {
            const orderToken = jwt.sign({
                accessKey: options.accessKey,
                paymentStatus: PaymentStatus.PAID
            }, options.secretKey);

            const result = await client.isOrderPaid(orderToken);

            expect(result).toBe(true);
        });

        it("should return false if order is not paid", async () => {
            const orderToken = jwt.sign({
                accessKey: options.accessKey,
                paymentStatus: PaymentStatus.PENDING
            }, options.secretKey);

            const result = await client.isOrderPaid(orderToken);

            expect(result).toBe(false);
        });

    });
});
