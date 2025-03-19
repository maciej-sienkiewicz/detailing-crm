export interface ClientExpanded {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    company?: string;
    taxId?: string;

    totalVisits: number;
    totalTransactions: number;
    abandonedSales: number;
    totalRevenue: number;
    contactAttempts: number;
    lastVisitDate?: string;
    notes?: string;

    vehicles: string[];
}

export interface ContactAttempt {
    id: string;
    clientId: string;
    date: string;
    type: 'PHONE' | 'EMAIL' | 'SMS' | 'OTHER';
    description: string;
    result: 'SUCCESS' | 'NO_ANSWER' | 'CALLBACK_REQUESTED' | 'REJECTED';
}