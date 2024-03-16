import nock from "nock";

import {
    Address,
    CardPaymentMethod,
    Currency,
    ERRORS,
    Locale,
    MontonioClient,
    MontonioClientOptions,
    OrderData,
    PaymentMethod
} from "../src";

const address: Address = {
    firstName: "CustomerFirst",
    lastName: "CustomerLast",
    email: "test@test.com",
    phoneNumber: "123456789",
    phoneCountry: "EE",
    addressLine1: "Kai 1",
    addressLine2: "",
    locality: "Tallinn",
    region: "Harjumaa",
    postalCode: "10111",
    country: "EE"
};

const orderData: OrderData = {
    merchantReference: "Order1234567",
    returnUrl: "http://localhost:3000/return",
    notificationUrl: "http://example.com/payment/notify",
    currency: Currency.EUR,
    grandTotal: 100.00,
    locale: Locale.Et,
    billingAddress: address,
    shippingAddress: address,
    lineItems: [
        {
            name: "Hoverboard",
            quantity: 1,
            finalPrice: 100.00
        }
    ],
    payment: {
        method: PaymentMethod.CardPayments,
        currency: Currency.EUR,
        amount: 100.00,
        methodOptions: {
            preferredMethod: CardPaymentMethod.CARD,
            preferredLocale: Locale.Et,
        }
    }
};

describe("Create order", () => {
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

    it("should create an order", async () => {
        const paymentUrl = "https://example.com/payment";

        nock("https://sandbox-stargate.montonio.com")
            .post("/api/orders")
            .reply(200, { paymentUrl });

        const result = await client.createOrder(orderData);

        expect(result).toEqual(paymentUrl);
    });

    it("should throw error for invalid HirePurchase amount", async () => {
        const extendedOrderData = {
            ...orderData,
            payment: {
                ...orderData.payment,
                method: PaymentMethod.HirePurchase,
                amount: 99,
            },
        };

        await expect(client.createOrder(extendedOrderData)).rejects.toThrowError(ERRORS.INVALID_HIRE_PURCHASE_AMOUNT);
    });

    it("should throw error for invalid Blik currency", async () => {
        const extendedOrderData = {
            ...orderData,
            payment: {
                ...orderData.payment,
                method: PaymentMethod.Blik,
                currency: Currency.EUR,
            },
        };

        await expect(client.createOrder(extendedOrderData)).rejects.toThrowError(ERRORS.INVALID_CURRENCY);
    });

    it("should throw error for invalid Bnpl period", async () => {
        const extendedOrderData = {
            ...orderData,
            payment: {
                ...orderData.payment,
                method: PaymentMethod.Bnpl,
                methodOptions: {
                    ...orderData.payment.methodOptions,
                    period: 4,
                },
            },
        };

        await expect(client.createOrder(extendedOrderData)).rejects.toThrowError(ERRORS.INVALID_BNPL_PERIOD);
    });

    it("should throw error for invalid Bnpl amount for period 1", async () => {
        const extendedOrderData = {
            ...orderData,
            payment: {
                ...orderData.payment,
                method: PaymentMethod.Bnpl,
                methodOptions: {
                    ...orderData.payment.methodOptions,
                    period: 1,
                },
                amount: 29,
            },
        };

        await expect(client.createOrder(extendedOrderData)).rejects.toThrowError(ERRORS.INVALID_BNPL_AMOUNT_PERIOD_1);
    });

    it("should throw error for invalid Bnpl amount for period 2", async () => {
        const extendedOrderData = {
            ...orderData,
            payment: {
                ...orderData.payment,
                method: PaymentMethod.Bnpl,
                methodOptions: {
                    ...orderData.payment.methodOptions,
                    period: 2,
                },
                amount: 74,
            },
        };

        await expect(client.createOrder(extendedOrderData)).rejects.toThrowError(ERRORS.INVALID_BNPL_AMOUNT_PERIOD_2_3);
    });


    it("should handle errors", async () => {
        const errorMessage = "Test error";

        nock("https://sandbox-stargate.montonio.com")
            .post("/api/orders")
            .replyWithError(errorMessage);

        await expect(client.createOrder(orderData)).rejects.toThrowError(
            `${ERRORS.NETWORK_ERROR}${errorMessage}`
        );
    });

});
