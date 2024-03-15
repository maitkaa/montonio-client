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

export enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    VOIDED = "VOIDED",
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
    REFUNDED = "REFUNDED",
    ABANDONED = "ABANDONED",
    AUTHORIZED = "AUTHORIZED",
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
    status: PaymentStatus;
    serviceFee: string;
    serviceFeeCurrency: string;
    createdAt: string;
}

export interface OrderResponse {
    uuid: string;
    paymentStatus: PaymentStatus;
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

export interface RefundResponse {
    uuid: string;
    amount: number;
    status: string;
    currency: string;
    createdAt: string;
    type: string;
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
    currency: string;
    merchant_reference: string;
    merchant_reference_display: string;
    payment_status: string;
    iat: number;
    exp: number;
}
