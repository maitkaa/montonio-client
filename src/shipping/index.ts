import { MontonioBaseClient } from "../base";
import { PickupPointSubtype } from "../enums";
import { ERRORS } from "../errors";
import {
    Carrier,
    CarriersResponse,
    CreateShipmentRequest,
    PickupPoint,
    PickupPointsResponse,
    ShipmentLabelResponse,
    ShipmentResponse,
    ShippingMethod,
    ShippingMethodsResponse,
} from "../types";

export interface MontonioShippingClientOptions {
    accessKey: string;
    secretKey: string;
    sandbox?: boolean;
    url?: string;
}

export class MontonioShippingClient extends MontonioBaseClient {

    constructor(options: MontonioShippingClientOptions) {
        if (!options || !options.accessKey || !options.secretKey) {
            throw new Error(ERRORS.MISSING_OPTIONS);
        }

        const { accessKey, secretKey, sandbox, url } = options;

        const baseUrl = url ?? (sandbox !== false
            ? "https://sandbox-shipping.montonio.com/api"
            : "https://shipping.montonio.com/api");

        super(accessKey, secretKey, baseUrl);
    }

    /**
     * Get available carriers
     * @returns List of carriers
     */
    async getCarriers(): Promise<Carrier[]> {
        try {
            const response = await this.axiosInstance.get<CarriersResponse>("/carriers", this.getAuthorizationHeader());
            return response.data.carriers;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    /**
     * Get available shipping methods
     * @returns List of shipping methods
     */
    async getShippingMethods(): Promise<ShippingMethod[]> {
        try {
            const response = await this.axiosInstance.get<ShippingMethodsResponse>("/shipping-methods", this.getAuthorizationHeader());
            return response.data.shippingMethods;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    /**
     * Get pickup points (parcel machines, parcel shops, post offices)
     * @param carrierCode - Carrier code (e.g. "omniva", "dpd")
     * @param countryCode - ISO 2-letter country code (e.g. "EE", "LV")
     * @param type - Optional pickup point subtype filter
     * @returns List of pickup points
     */
    async getPickupPoints(carrierCode: string, countryCode: string, type?: PickupPointSubtype): Promise<PickupPoint[]> {
        try {
            const params: Record<string, string> = { carrierCode, countryCode };
            if (type) params["type"] = type;

            const response = await this.axiosInstance.get<PickupPointsResponse>("/pickup-points", {
                ...this.getAuthorizationHeader(),
                params,
            });
            return response.data.pickupPoints;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    /**
     * Create a shipment
     * @param data - Shipment creation data
     * @returns Shipment details
     */
    async createShipment(data: CreateShipmentRequest): Promise<ShipmentResponse> {
        try {
            const response = await this.axiosInstance.post<ShipmentResponse>(
                "/shipments",
                data,
                this.getAuthorizationHeader(),
            );
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    /**
     * Get shipment details
     * @param shipmentUuid - Shipment UUID
     * @returns Shipment details
     */
    async getShipment(shipmentUuid: string): Promise<ShipmentResponse> {
        try {
            const response = await this.axiosInstance.get<ShipmentResponse>(
                `/shipments/${shipmentUuid}`,
                this.getAuthorizationHeader(),
            );
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    /**
     * Get shipping label download URL
     * @param shipmentUuid - Shipment UUID
     * @returns Label download URL
     */
    async getShipmentLabel(shipmentUuid: string): Promise<string> {
        try {
            const response = await this.axiosInstance.get<ShipmentLabelResponse>(
                `/shipments/${shipmentUuid}/label`,
                this.getAuthorizationHeader(),
            );
            return response.data.url;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }
}
