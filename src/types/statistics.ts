import { Currency } from "./orderData";

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

export interface Payout {
    uuid: string;
    storeUuid: string;
    storeName: string;
    storeLegalName: string;
    iban: string;
    accountName: string;
    status: string;
    settlementType: string;
    paymentsAmount: string;
    refundsAmount: string;
    totalAmount: string;
    currency: Currency;
    expectedArrivalDate: string | null;
    createdAt: string;
}

export interface PayoutsResponse {
    payouts: Payout[];
}

export interface QueryParams {
    limit: number;
    offset: number;
    orderBy?: PayoutOrderByOptions;
    order: "DESC" | "ASC";
}

export interface PayoutExportResponse {
    url: string;
}

export interface Balance {
    currency: Currency;
    balance: number;
}

export interface Balances {
    stripe: Balance[];
    montonioMoneyMovement: Balance[];
}

export interface Store {
    uuid: string;
    name: string;
    legalName: string;
}

export interface StoreBalanceResponse {
    store: Store;
    balances: Balances;
}

