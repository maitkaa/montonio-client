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

export enum CardPaymentMethod {
    WALLET = "wallet",
    CARD = "card",
}

export enum Currency {
    EUR = "EUR",
    PLN = "PLN",
}

export enum PayoutOrderByOptions {
    CREATED_AT = "createdAt",
    SETTLEMENT_TYPE = "settlementType",
    TOTAL_AMOUNT = "totalAmount",
    STATUS = "status"
}

export enum PayoutOutputType {
    EXCEL = "excel",
    XML = "xml"
}
