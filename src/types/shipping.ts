import { PickupPointSubtype, ShippingMethodType } from "../enums";

export interface ShipmentReceiver {
    name: string;
    email: string;
    phoneCountryCode: string;
    phoneNumber: string;
    streetAddress?: string;
    locality?: string;
    postalCode?: string;
    country?: string;
}

export interface ShipmentParcel {
    weight: number;
    width?: number;
    height?: number;
    length?: number;
}

export interface ShipmentShippingMethod {
    type: ShippingMethodType;
    id: string;
}

export interface CreateShipmentRequest {
    merchantReference: string;
    shippingMethod: ShipmentShippingMethod;
    receiver: ShipmentReceiver;
    parcels: ShipmentParcel[];
    pickupPointId?: string;
}

export interface ShipmentResponse {
    uuid: string;
    merchantReference: string;
    status: string;
    trackingCode?: string;
    trackingUrl?: string;
    labelUrl?: string;
    carrier: string;
    shippingMethodType: ShippingMethodType;
    createdAt: string;
}

export interface PickupPoint {
    id: string;
    name: string;
    type: PickupPointSubtype;
    carrierCode: string;
    streetAddress: string;
    locality: string;
    postalCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
}

export interface PickupPointsResponse {
    pickupPoints: PickupPoint[];
}

export interface Carrier {
    code: string;
    name: string;
    logoUrl?: string;
    supportedCountries: string[];
}

export interface CarriersResponse {
    carriers: Carrier[];
}

export interface ShippingMethod {
    uuid: string;
    name: string;
    type: ShippingMethodType;
    carrierCode: string;
    supportedCountries: string[];
}

export interface ShippingMethodsResponse {
    shippingMethods: ShippingMethod[];
}

export interface ShipmentLabelResponse {
    url: string;
}
