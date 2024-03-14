export enum PaymentMethod {
    PaymentInitiation = "paymentInitiation",
    CardPayments = "cardPayments",
    Blik = "blik",
    HirePurchase = "hirePurchase",
    Bnpl = "bnpl"
}

export enum Locale {
    De = "de",
    En = "en",
    Et = "et",
    Fi = "fi",
    Lt = "lt",
    Lv = "lv",
    Pl = "pl",
    Ru = "ru"
}

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

export interface LineItem {
    name: string;
    quantity: number;
    finalPrice: number;
}

export interface PaymentInitiationOptions {
    preferredProvider: string;
    preferredCountry: string;
    preferredLocale: string;
    paymentDescription: string;
}

export interface CardPaymentsOptions {
    preferredMethod: string;
    preferredLocale: string;
}

export interface BlikOptions {
    preferredLocale: string;
}

export interface HirePurchaseOptions {
}

export interface BnplOptions {
    period: number;
}

export type PaymentOptions =
    PaymentInitiationOptions
    | CardPaymentsOptions
    | BlikOptions
    | HirePurchaseOptions
    | BnplOptions;

export interface Payment {
    method: PaymentMethod;
    methodOptions: PaymentOptions;
    methodDisplay?: string;
    locale?: Locale;
    currency: string;
    amount: number;
}

export interface OrderData {
    merchantReference: string;
    returnUrl: string;
    notificationUrl: string;
    grandTotal: number;
    currency: string;
    payment: Payment;
    billingAddress: Address;
    shippingAddress: Address;
    lineItems: LineItem[];
    locale: Locale;
}

interface PaymentIntent {
    uuid: string;
    paymentMethodType: string;
    paymentMethodMetadata: {
        preferredCountry: string;
        preferredProvider: string;
        paymentDescription: string;
    };
    amount: string;
    currency: string;
    status: string;
    serviceFee: string;
    serviceFeeCurrency: string;
    createdAt: string;
}

export interface PaymentUrlResponse {
    uuid: string;
    paymentStatus: string;
    locale: string;
    merchantReference: string;
    merchantReferenceDisplay: string;
    merchantReturnUrl: string;
    merchantNotificationUrl: string;
    grandTotal: string;
    currency: string;
    paymentMethodType: string;
    storeUuid: string;
    paymentIntents: PaymentIntent[];
    refunds: [];
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
