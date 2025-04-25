// src/types/cash.ts
// Typy danych związane z modułem gotówki

// Typ transakcji gotówkowej
export enum TransactionType {
    INCOME = 'INCOME',     // Wpłata do kasy
    EXPENSE = 'EXPENSE'    // Wypłata z kasy
}

// Etykiety dla typów transakcji
export const TransactionTypeLabels: Record<TransactionType, string> = {
    [TransactionType.INCOME]: 'Wpłata',
    [TransactionType.EXPENSE]: 'Wypłata'
};

// Kolory dla typów transakcji
export const TransactionTypeColors: Record<TransactionType, string> = {
    [TransactionType.INCOME]: '#2ecc71',   // Zielony
    [TransactionType.EXPENSE]: '#e74c3c'   // Czerwony
};

// Interfejs dla transakcji gotówkowej
export interface CashTransaction {
    id: string;
    type: TransactionType;
    description: string;
    date: string;
    visitId?: string;      // Powiązana wizyta (opcjonalne)
    visitNumber?: string;  // Numer wizyty (opcjonalne)
    amount: number;
    createdAt: string;
    createdBy: string;     // ID użytkownika, który wprowadził transakcję
}

// Typ dla filtrów wyszukiwania transakcji
export interface CashTransactionFilters {
    type?: TransactionType;
    description?: string;
    dateFrom?: string;
    dateTo?: string;
    visitId?: string;
    minAmount?: number;
    maxAmount?: number;
}

// Informacje o paginacji
export interface Pagination {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

// Odpowiedź API z paginacją
export interface PaginatedResponse<T> {
    data: T[];
    pagination: Pagination;
}