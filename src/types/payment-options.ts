export interface BankLinkProviders {
    supportedCurrencies: string[];
    paymentMethods: PaymentMethodsEntity[];
}

export interface OtherPaymentInitiation {
    processor: string;
    logoUrl: string;
}

export interface PaymentInitiation {
    processor: string;
    setup: Setup;
}

export interface PaymentMethods {
    paymentInitiation: PaymentInitiation;
    cardPayments: OtherPaymentInitiation;
    blik: OtherPaymentInitiation;
    bnpl: OtherPaymentInitiation;
    hirePurchase: OtherPaymentInitiation;
}

export interface PaymentMethodsEntity {
    name: string;
    logoUrl: string;
    supportedCurrencies: string[];
    uiPosition: number;
    code: string;
}

export interface PaymentMethodsResponse {
    uuid: string;
    name: string;
    paymentMethods: PaymentMethods;
}

export interface Setup {
    [key: string]: BankLinkProviders;
}
