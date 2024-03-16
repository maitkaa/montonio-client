import nock from "nock";

import { MontonioClient, MontonioClientOptions } from "../src";
import { ERRORS } from "../src";

describe("MontonioClient", () => {
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

    it("should fetch payment methods", async () => {
        const paymentMethods = ["paymentInitiation", "cardPayments", "blik", "bnpl", "hirePurchase"];

        nock("https://sandbox-stargate.montonio.com")
            .get("/api/stores/payment-methods")
            .reply(200, { paymentMethods });

        const result = await client.getPaymentMethods();

        expect(result).toEqual(paymentMethods);
    });

    it("should handle errors", async () => {
        const errorMessage = "Test error";
        nock("https://sandbox-stargate.montonio.com",
            {
                reqheaders: {
                    "authorization": (headerValue) => {
                        return headerValue !== undefined;
                    },
                },
            })
            .get("/api/stores/payment-methods")
            .reply(400, { message: errorMessage });

        await expect(client.getPaymentMethods()).rejects.toThrowError(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
            `${ERRORS.API_REQUEST_FAILED}Request failed with status code 400 ${ERRORS.API_MONTONIO_RESPONSE}${errorMessage}`
        );
    });

});
