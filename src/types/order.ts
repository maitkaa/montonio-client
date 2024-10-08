import { CardPaymentMethod, Currency, Locale, PaymentMethod, PaymentStatus } from "../enums";

import { RefundResponse } from "./refund";

export interface Address {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    phoneCountry?: string;
    addressLine1?: string;
    addressLine2?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    companyName?: string,
    companyLegalName?: string,
    companyRegCode?: string,
    companyVatNumber?: string
}

export interface BlikOptions {
    preferredLocale: Locale;
}

export interface BnplOptions {
    period: number;
}

export interface CardPaymentsOptions {
    preferredMethod: CardPaymentMethod;
    preferredLocale: Locale;
}

export interface LineItem {
    name: string;
    quantity: number;
    finalPrice: number;
}

export interface Order {
    merchantReference: string;
    returnUrl: string;
    notificationUrl: string;
    grandTotal: number;
    currency: Currency;
    payment: Payment;
    billingAddress?: Address;
    shippingAddress?: Address;
    lineItems?: LineItem[];
    locale?: Locale;
}

export interface OrderResponse {
    uuid: string;
    paymentStatus: PaymentStatus;
    locale: Locale;
    merchantReference: string;
    merchantReferenceDisplay: string;
    merchantReturnUrl: string;
    merchantNotificationUrl: string;
    grandTotal: string;
    currency: Currency;
    paymentMethodType: PaymentMethod;
    storeUuid: string;
    paymentIntents: PaymentIntent[];
    refunds: RefundResponse[];
    availableForRefund: number;
    isRefundableType: boolean;
    lineItems: LineItem[];
    billingAddress: Address;
    shippingAddress: Address;
    expiresAt: string;
    createdAt: string;
    storeName: string;
    businessName: string;
    paymentUrl: string;
}

export interface Payment {
    method: PaymentMethod;
    methodOptions: PaymentOptions;
    methodDisplay?: string;
    locale?: Locale;
    currency: Currency;
    amount: number;
}

export interface PaymentDetails {
    uuid: string;
    accessKey: string;
    grandTotal: number;
    merchantReference: string;
    merchantReferenceDisplay: string;
    paymentStatus: PaymentStatus;
    paymentMethod: string;
    paymentProviderName: string;
    senderIban: string | null;
    senderName: string | null;
    currency: Currency;
    merchant_reference: string;
    merchant_reference_display: string;
    payment_status: string;
    iat: number;
    exp: number;
}

export interface PaymentInitiationOptions {
    preferredProvider?: string;
    preferredCountry?: string;
    preferredLocale?: Locale;
    paymentDescription?: string;
    paymentReference?: string; //Structured payment reference number. This is a standardized reference number used for accounting purposes and will be validated by banks.
}

export type PaymentOptions =
    PaymentInitiationOptions
    | CardPaymentsOptions
    | BlikOptions
    | BnplOptions;

export interface PaymentIntent {
    uuid: string;
    paymentMethodType: PaymentMethod;
    paymentMethodMetadata: {
        preferredCountry: string;
        preferredProvider: string;
        paymentDescription: string;
    };
    amount: string;
    currency: Currency;
    status: PaymentStatus;
    serviceFee: string;
    serviceFeeCurrency: Currency;
    createdAt: string;
}
