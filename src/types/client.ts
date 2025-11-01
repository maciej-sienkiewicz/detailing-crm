// src/types/client.ts
import {PriceDetails} from "../shared/types/price";

export interface ClientExpanded {
    id: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    email: string;
    phone: string;
    address?: string;
    company?: string;
    taxId?: string;

    totalVisits: number;
    totalTransactions: number;
    abandonedSales: number;
    totalRevenue: PriceDetails;
    contactAttempts: number;
    lastVisitDate?: string;
    notes?: string;

    vehicles: string[];

    // Dodane pola które mogą przyjść z API
    createdAt?: string;
    updatedAt?: string;
}

export interface ClientStatistics {
    totalVisits: number;
    totalRevenue: PriceDetails;
    vehicleNo: number;
}

export interface ClientStatisticsPriceResponse {
    priceNetto: number;
    priceBrutto: number;
    taxAmount: number;
}

export interface ClientStatisticsResponse {
    totalVisits: number;
    totalRevenue: ClientStatisticsPriceResponse;
    vehicleNo: number;
}

export interface ContactAttempt {
    id?: string;
    clientId: string;
    date: string;
    type: 'PHONE' | 'EMAIL' | 'SMS' | 'OTHER';
    description: string;
    result: 'SUCCESS' | 'NO_ANSWER' | 'CALLBACK_REQUESTED' | 'REJECTED';
}