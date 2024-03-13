import nock from "nock";

import { MontonioClient } from "../src/client/client";


describe("MontonioClient", () => {
    let client: MontonioClient;

    beforeEach(() => {
        client = new MontonioClient({
            accessKey: "testAccessKey",
            secretKey: "testSecretKey",
            sandbox: true
        });
    });

    it("should get payment methods", async () => {
        const mockPaymentMethods = ["method1", "method2"];

        nock("https://sandbox-payments.montonio.com")
            .get("/stores/payment-methods")
            .reply(200, { paymentMethods: mockPaymentMethods });

        const paymentMethods = await client.getPaymentMethods();

        expect(paymentMethods).toEqual(mockPaymentMethods);
    });

    it("should throw error when request fails", async () => {
        nock("https://sandbox-payments.montonio.com")
            .get("/stores/payment-methods")
            .replyWithError("Something went wrong");

        await expect(client.getPaymentMethods()).rejects.toThrow("API request failed: Something went wrong");
    });
});
