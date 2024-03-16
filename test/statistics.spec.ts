import nock from "nock";
import qs from "qs";

import {
    Currency,
    MontonioClient,
    MontonioClientOptions,
    Payout,
    PayoutOrderByOptions,
    PayoutOutputType,
    QueryParams,
    StoreBalanceResponse
} from "../src";

describe("MontonioClient Payments and Balances", () => {
    let options: MontonioClientOptions;
    let client: MontonioClient;

    beforeEach(() => {
        options = {
            accessKey: "testAccessKey",
            secretKey: "testSecretKey",
            sandbox: true,
            storeUuid: "testStoreUuid",
        };
        client = new MontonioClient(options);
    });

    it("should list payments", async () => {
        const queryParams: QueryParams = {
            limit: 10,
            offset: 0,
            order: "ASC",
            orderBy: PayoutOrderByOptions.CREATED_AT,
        };
        const payouts: Payout[] = [
            {
                uuid: "123e4567-e89b-12d3-a456-426614174000",
                storeUuid: "123e4567-e89b-12d3-a456-426614174000",
                storeName: "Test Store",
                storeLegalName: "Test Store LLC",
                iban: "EE38 2200 2210 2014 5685",
                accountName: "Test Account",
                status: "COMPLETED",
                settlementType: "STANDARD",
                paymentsAmount: "1000.00",
                refundsAmount: "0.00",
                totalAmount: "1000.00",
                currency: Currency.EUR,
                expectedArrivalDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString(),
            },
        ];

        nock("https://sandbox-stargate.montonio.com")
            .get(`/api/stores/${options.storeUuid}/payouts?${qs.stringify(queryParams)}`)
            .reply(200, { payouts });

        const result = await client.listPayments(queryParams);

        expect(result).toEqual(payouts);
    });

    it("should export payments", async () => {
        const payoutUuid = "testPayoutUuid";
        const payoutType = PayoutOutputType.EXCEL;
        const exportUrl = "https://example.com/export";

        nock("https://sandbox-stargate.montonio.com")
            .get(`/api/stores/${options.storeUuid}/payouts/${payoutUuid}/export-${payoutType}`)
            .reply(200, { url: exportUrl });

        const result = await client.exportPayments(payoutUuid, payoutType);

        expect(result).toEqual(exportUrl);
    });

    it("should get store balances", async () => {
        const storeBalanceResponse: StoreBalanceResponse = {
            store: {
                uuid: "123e4567-e89b-12d3-a456-426614174000",
                name: "Test Store",
                legalName: "Test Store LLC",
            },
            balances: {
                stripe: [
                    {
                        currency: Currency.EUR,
                        balance: 1000.00,
                    }
                ],
                montonioMoneyMovement: [
                    {
                        currency: Currency.PLN,
                        balance: 3000.00,
                    }
                ],
            },
        };


        nock("https://sandbox-stargate.montonio.com")
            .get("/api/store-balances")
            .reply(200, storeBalanceResponse);

        const result = await client.getStoreBalances();

        expect(result).toEqual(storeBalanceResponse);
    });
});
