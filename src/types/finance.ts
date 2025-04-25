// src/types/finance.ts
// Typy danych związane z modułem finansów

// Status faktury
export enum InvoiceStatus {
    NOT_PAID = 'NOT_PAID',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED'
}

// Etykiety dla statusów faktury
export const InvoiceStatusLabels: Record<InvoiceStatus, string> = {
    [InvoiceStatus.NOT_PAID]: 'Nieopłacona',
    [InvoiceStatus.PAID]: 'Opłacona',
    [InvoiceStatus.OVERDUE]: 'Przeterminowana',
    [InvoiceStatus.CANCELLED]: 'Anulowana'
};

// Kolory dla statusów faktury
export const InvoiceStatusColors: Record<InvoiceStatus, string> = {
    [InvoiceStatus.NOT_PAID]: '#3498db',       // Niebieski
    [InvoiceStatus.PAID]: '#2ecc71',         // Zielony
    [InvoiceStatus.OVERDUE]: '#e74c3c',      // Czerwony
    [InvoiceStatus.CANCELLED]: '#95a5a6'     // Jasno szary
};

// Typ płatności
export enum PaymentMethod {
    CASH = 'CASH',                 // Gotówka
    BANK_TRANSFER = 'BANK_TRANSFER', // Przelew bankowy
    CARD = 'CARD',   // Karta
    MOBILE_PAYMENT = 'MOBILE_PAYMENT', // Płatność mobilna
    OTHER = 'OTHER'                // Inna
}

// Etykiety dla typów płatności
export const PaymentMethodLabels: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: 'Gotówka',
    [PaymentMethod.BANK_TRANSFER]: 'Przelew bankowy',
    [PaymentMethod.CARD]: 'Karta',
    [PaymentMethod.MOBILE_PAYMENT]: 'Płatność mobilna',
    [PaymentMethod.OTHER]: 'Inna'
};

// Definicja załącznika faktury (np. plik PDF)
export interface InvoiceAttachment {
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    uploadedAt: string;
    file?: File; // Tylko po stronie klienta, nie przesyłane do API
}

// Pozycja na fakturze
export interface InvoiceItem {
    id: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    totalNet: number;
    totalGross: number;
}

// Typ faktury
export enum InvoiceType {
    INCOME = 'INCOME',           // Przychodowa
    EXPENSE = 'EXPENSE'          // Kosztowa
}

// Etykiety dla typów faktury
export const InvoiceTypeLabels: Record<InvoiceType, string> = {
    [InvoiceType.INCOME]: 'Przychodowa',
    [InvoiceType.EXPENSE]: 'Kosztowa'
};

// Główny interfejs faktury
export interface Invoice {
    id: string;
    number: string;
    title: string;
    issuedDate: string;
    dueDate: string;
    sellerName: string;
    sellerTaxId?: string;
    sellerAddress?: string;
    buyerName: string;
    buyerTaxId?: string;
    buyerAddress?: string;
    status: InvoiceStatus;
    type: InvoiceType;
    paymentMethod: PaymentMethod;
    totalNet: number;
    totalTax: number;
    totalGross: number;
    currency: string;
    notes?: string;
    protocolId?: string;
    protocolNumber?: string;
    createdAt: string;
    updatedAt: string;
    items: InvoiceItem[];
    attachments: InvoiceAttachment[];
    paid?: number; // Kwota już zapłacona
}

// Typ dla filtrów wyszukiwania faktur
export interface InvoiceFilters {
    number?: string;
    title?: string;
    buyerName?: string;
    status?: InvoiceStatus;
    type?: InvoiceType;
    dateFrom?: string;
    dateTo?: string;
    protocolId?: string;
    minAmount?: number;
    maxAmount?: number;
}