import nock from "nock";

import {
    CreateShipmentRequest,
    ERRORS,
    MontonioShippingClient,
    MontonioShippingClientOptions,
    PickupPointSubtype,
    ShippingMethodType,
} from "../src";

const BASE_URL = "https://sandbox-shipping.montonio.com/api";

describe("MontonioShippingClient", () => {
    let options: MontonioShippingClientOptions;
    let client: MontonioShippingClient;

    beforeEach(() => {
        options = {
            accessKey: "testAccessKey",
            secretKey: "testSecretKey",
            sandbox: true,
        };
        client = new MontonioShippingClient(options);
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe("constructor", () => {
        it("should initialize with sandbox URL when sandbox is true", () => {
            expect(client).toHaveProperty("baseUrl", BASE_URL);
        });

        it("should initialize with production URL when sandbox is false", () => {
            const prodClient = new MontonioShippingClient({ ...options, sandbox: false });
            expect(prodClient).toHaveProperty("baseUrl", "https://shipping.montonio.com/api");
        });

        it("should throw error when required options are missing", () => {
            expect(() => new MontonioShippingClient({ accessKey: "", secretKey: "", sandbox: true }))
                .toThrow(ERRORS.MISSING_OPTIONS);
        });
    });

    describe("getCarriers", () => {
        it("should return a list of carriers", async () => {
            const mockCarriers = {
                carriers: [
                    { code: "omniva", name: "Omniva", supportedCountries: ["EE", "LV", "LT"] },
                    { code: "dpd", name: "DPD", supportedCountries: ["EE", "LV", "LT", "PL"] },
                ],
            };

            nock(BASE_URL).get("/carriers").reply(200, mockCarriers);

            const result = await client.getCarriers();

            expect(result).toHaveLength(2);
            expect(result[0].code).toBe("omniva");
        });

        it("should throw ApiError on API failure", async () => {
            nock(BASE_URL).get("/carriers").reply(401, { message: "Unauthorized", code: "UNAUTHORIZED" });

            await expect(client.getCarriers()).rejects.toThrow(ERRORS.API_REQUEST_FAILED);
        });
    });

    describe("getShippingMethods", () => {
        it("should return a list of shipping methods", async () => {
            const mockMethods = {
                shippingMethods: [
                    {
                        uuid: "method-uuid-1",
                        name: "Omniva parcel machine",
                        type: ShippingMethodType.PickupPoint,
                        carrierCode: "omniva",
                        supportedCountries: ["EE"],
                    },
                ],
            };

            nock(BASE_URL).get("/shipping-methods").reply(200, mockMethods);

            const result = await client.getShippingMethods();

            expect(result).toHaveLength(1);
            expect(result[0].type).toBe(ShippingMethodType.PickupPoint);
        });
    });

    describe("getPickupPoints", () => {
        it("should return pickup points for a carrier and country", async () => {
            const mockPickupPoints = {
                pickupPoints: [
                    {
                        id: "PP-001",
                        name: "Tallinn Ülemiste",
                        type: PickupPointSubtype.ParcelMachine,
                        carrierCode: "omniva",
                        streetAddress: "Suur-Sõjamäe 4",
                        locality: "Tallinn",
                        postalCode: "11415",
                        country: "EE",
                    },
                ],
            };

            nock(BASE_URL)
                .get("/pickup-points")
                .query({ carrierCode: "omniva", countryCode: "EE" })
                .reply(200, mockPickupPoints);

            const result = await client.getPickupPoints("omniva", "EE");

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("PP-001");
        });

        it("should filter by subtype when provided", async () => {
            const mockPickupPoints = { pickupPoints: [] };

            nock(BASE_URL)
                .get("/pickup-points")
                .query({ carrierCode: "dpd", countryCode: "LV", type: PickupPointSubtype.ParcelShop })
                .reply(200, mockPickupPoints);

            const result = await client.getPickupPoints("dpd", "LV", PickupPointSubtype.ParcelShop);

            expect(result).toHaveLength(0);
        });
    });

    describe("createShipment", () => {
        it("should create a shipment and return shipment details", async () => {
            const shipmentData: CreateShipmentRequest = {
                merchantReference: "SHIP-001",
                shippingMethod: {
                    type: ShippingMethodType.PickupPoint,
                    id: "method-uuid-1",
                },
                receiver: {
                    name: "Jane Doe",
                    email: "jane@example.com",
                    phoneCountryCode: "+372",
                    phoneNumber: "55512345",
                },
                parcels: [{ weight: 1.5 }],
                pickupPointId: "PP-001",
            };

            const mockResponse = {
                uuid: "shipment-uuid-123",
                merchantReference: "SHIP-001",
                status: "created",
                trackingCode: "EE123456789EE",
                trackingUrl: "https://tracking.omniva.ee/EE123456789EE",
                carrier: "omniva",
                shippingMethodType: ShippingMethodType.PickupPoint,
                createdAt: "2024-01-01T00:00:00Z",
            };

            nock(BASE_URL).post("/shipments").reply(201, mockResponse);

            const result = await client.createShipment(shipmentData);

            expect(result.uuid).toBe("shipment-uuid-123");
            expect(result.trackingCode).toBe("EE123456789EE");
        });

        it("should throw ApiError when shipment creation fails", async () => {
            nock(BASE_URL)
                .post("/shipments")
                .reply(400, { message: "Invalid shipment data", code: "INVALID_DATA" });

            const shipmentData: CreateShipmentRequest = {
                merchantReference: "SHIP-002",
                shippingMethod: { type: ShippingMethodType.CourierDelivery, id: "method-uuid-2" },
                receiver: { name: "John", email: "john@example.com", phoneCountryCode: "+372", phoneNumber: "55500000" },
                parcels: [{ weight: 0.5 }],
            };

            await expect(client.createShipment(shipmentData)).rejects.toThrow(ERRORS.API_REQUEST_FAILED);
        });
    });

    describe("getShipment", () => {
        it("should return shipment details by UUID", async () => {
            const mockResponse = {
                uuid: "shipment-uuid-123",
                merchantReference: "SHIP-001",
                status: "in_transit",
                carrier: "omniva",
                shippingMethodType: ShippingMethodType.PickupPoint,
                createdAt: "2024-01-01T00:00:00Z",
            };

            nock(BASE_URL).get("/shipments/shipment-uuid-123").reply(200, mockResponse);

            const result = await client.getShipment("shipment-uuid-123");

            expect(result.uuid).toBe("shipment-uuid-123");
            expect(result.status).toBe("in_transit");
        });
    });

    describe("getShipmentLabel", () => {
        it("should return the label download URL", async () => {
            const mockResponse = { url: "https://labels.montonio.com/label-abc.pdf" };

            nock(BASE_URL).get("/shipments/shipment-uuid-123/label").reply(200, mockResponse);

            const result = await client.getShipmentLabel("shipment-uuid-123");

            expect(result).toBe("https://labels.montonio.com/label-abc.pdf");
        });

        it("should throw ApiError when label is not available", async () => {
            nock(BASE_URL)
                .get("/shipments/not-found/label")
                .reply(404, { message: "Shipment not found", code: "NOT_FOUND" });

            await expect(client.getShipmentLabel("not-found")).rejects.toThrow(ERRORS.API_REQUEST_FAILED);
        });
    });
});
