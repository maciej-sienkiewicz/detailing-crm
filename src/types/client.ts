// src/types/client.ts
// Typy związane z klientami

// Rozszerzony interfejs klienta z funkcjami CRM
export interface ClientExpanded {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    company?: string;
    taxId?: string;

    // CRM metrics
    totalVisits: number;
    totalTransactions: number;
    abandonedSales: number;
    totalRevenue: number;
    contactAttempts: number;
    lastVisitDate?: string;
    notes?: string;

    // Relations
    vehicles: string[]; // IDs of vehicles
}

// Śledzenie prób kontaktu
export interface ContactAttempt {
    id: string;
    clientId: string;
    date: string;
    type: 'PHONE' | 'EMAIL' | 'SMS' | 'OTHER';
    description: string;
    result: 'SUCCESS' | 'NO_ANSWER' | 'CALLBACK_REQUESTED' | 'REJECTED';
}