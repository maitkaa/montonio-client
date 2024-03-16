import nock from "nock";

import {
    Currency,
    Locale,
    MontonioClient,
    MontonioClientOptions,
    OrderResponse,
    PaymentMethod,
    PaymentStatus
} from "../src";

describe("MontonioClient Order Retrieval", () => {
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

    it("should retrieve an order", async () => {
        const orderUuid = "123e4567-e89b-12d3-a456-426614174000";
        const orderResponse: OrderResponse = {
            uuid: "123e4567-e89b-12d3-a456-426614174000",
            paymentStatus: PaymentStatus.PAID,
            locale: Locale.En,
            merchantReference: "Order1234567",
            merchantReferenceDisplay: "Order 1234567",
            merchantReturnUrl: "http://localhost:3000/return",
            merchantNotificationUrl: "http://example.com/payment/notify",
            grandTotal: "100.00",
            currency: Currency.EUR,
            paymentMethodType: PaymentMethod.CardPayments,
            storeUuid: "123e4567-e89b-12d3-a456-426614174000",
            paymentIntents: [
                {
                    uuid: "123e4567-e89b-12d3-a456-426614174000",
                    paymentMethodType: PaymentMethod.CardPayments,
                    paymentMethodMetadata: {
                        preferredCountry: "US",
                        preferredProvider: "Visa",
                        paymentDescription: "Payment for Order 1234567",
                    },
                    amount: "100.00",
                    currency: Currency.EUR,
                    status: PaymentStatus.PAID,
                    serviceFee: "0.00",
                    serviceFeeCurrency: Currency.EUR,
                    createdAt: new Date().toISOString(),
                },
            ],
            refunds: [],
            availableForRefund: 0,
            isRefundableType: false,
            lineItems: [
                {
                    name: "Test Item",
                    quantity: 1,
                    finalPrice: 100,
                },
            ],
            billingAddress: {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                phoneNumber: "123456789",
                phoneCountry: "US",
                addressLine1: "123 Main St",
                locality: "Anytown",
                region: "Anystate",
                postalCode: "12345",
                country: "US",
            },
            shippingAddress: {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                phoneNumber: "123456789",
                phoneCountry: "US",
                addressLine1: "123 Main St",
                locality: "Anytown",
                region: "Anystate",
                postalCode: "12345",
                country: "US",
            },
            expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            storeName: "Test Store",
            businessName: "Test Business",
            paymentUrl: "",
        };

        nock("https://sandbox-stargate.montonio.com")
            .get(`/api/orders/${orderUuid}`)
            .reply(200, orderResponse);

        const result = await client.getOrder(orderUuid);

        expect(result).toEqual(orderResponse);
    });

    it("should handle errors", async () => {
        const orderUuid = "testOrderUuid";
        const errorMessage = "Test error";

        nock("https://sandbox-stargate.montonio.com", {
            reqheaders: {
                "authorization": (headerValue) => {
                    return headerValue !== undefined;
                },
            },
        })
            .get(`/api/orders/${orderUuid}`)
            .reply(500, { message: errorMessage });

        await expect(client.getOrder(orderUuid)).rejects.toThrowError(
            `API request failed: Request failed with status code 500 Montonio response: ${errorMessage}`
        );
    });

});
