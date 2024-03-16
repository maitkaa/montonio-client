import { Currency, PayoutOrderByOptions } from "../enums";

export interface Balance {
    currency: Currency;
    balance: number;
}

export interface Store {
    uuid: string;
    name: string;
    legalName: string;
}

export interface Balances {
    stripe: Balance[];
    montonioMoneyMovement: Balance[];
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

export interface PayoutExportResponse {
    url: string;
}

export interface StoreBalanceResponse {
    store: Store;
    balances: Balances;
}

export interface QueryParams {
    limit: number;
    offset: number;
    orderBy?: PayoutOrderByOptions;
    order: "DESC" | "ASC";
}
