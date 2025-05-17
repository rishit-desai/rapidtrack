import { Order } from "./order";
import { DeliveryPartner } from "./partner";

export type cusResponse = {
    error?: string;
    message?: string;
    data?: boolean | DeliveryPartner | DeliveryPartner[] | Order | Order[];
    status?: number;
}