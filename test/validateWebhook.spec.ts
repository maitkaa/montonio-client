import jwt from "jsonwebtoken";

import { ERRORS, MontonioClient, MontonioClientOptions, PaymentStatus } from "../src";

describe("validateWebhook", () => {
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

    it("should validate a webhook JWT token and return decoded payment details", async () => {
        const webhookToken = jwt.sign(
            { accessKey: options.accessKey, paymentStatus: PaymentStatus.PAID },
            options.secretKey
        );

        const result = await client.validateWebhook(webhookToken);

        expect(result.accessKey).toEqual(options.accessKey);
        expect(result.paymentStatus).toEqual(PaymentStatus.PAID);
    });

    it("should throw error for invalid webhook token", async () => {
        await expect(client.validateWebhook("invalidToken")).rejects.toThrow(ERRORS.ORDER_TOKEN_DECODE_FAILED);
    });

    it("should throw error when access key does not match", async () => {
        const webhookToken = jwt.sign({ accessKey: "differentAccessKey" }, options.secretKey);
        await expect(client.validateWebhook(webhookToken)).rejects.toThrow(ERRORS.ORDER_TOKEN_DECODE_WRONG_ACCESS_KEY);
    });

    it("should throw error for expired webhook token", async () => {
        const expiredToken = jwt.sign(
            { accessKey: options.accessKey },
            options.secretKey,
            { expiresIn: "0s" }
        );

        await new Promise((resolve) => setTimeout(resolve, 10));

        await expect(client.validateWebhook(expiredToken)).rejects.toThrow(ERRORS.ORDER_TOKEN_DECODE_FAILED);
    });
});
