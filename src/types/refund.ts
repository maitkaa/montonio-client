import { Currency } from "../enums";

export interface RefundResponse {
    uuid: string;
    amount: number;
    status: string;
    currency: Currency;
    createdAt: string;
    type: string;
}
