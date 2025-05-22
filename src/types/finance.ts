// src/types/finance.ts - Zaktualizowana wersja
export enum DocumentStatus {
    NOT_PAID = 'NOT_PAID',
    PAID = 'PAID',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED'
}

export const DocumentStatusLabels: Record<DocumentStatus, string> = {
    [DocumentStatus.NOT_PAID]: 'Nieopłacone',
    [DocumentStatus.PAID]: 'Opłacone',
    [DocumentStatus.PARTIALLY_PAID]: 'Częściowo opłacone',
    [DocumentStatus.OVERDUE]: 'Przeterminowane',
    [DocumentStatus.CANCELLED]: 'Anulowane'
};

export const DocumentStatusColors: Record<DocumentStatus, string> = {
    [DocumentStatus.NOT_PAID]: '#3498db',
    [DocumentStatus.PAID]: '#2ecc71',
    [DocumentStatus.PARTIALLY_PAID]: '#f39c12',
    [DocumentStatus.OVERDUE]: '#e74c3c',
    [DocumentStatus.CANCELLED]: '#95a5a6'
};

export enum PaymentMethod {
    CASH = 'CASH',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CARD = 'CARD',
    MOBILE_PAYMENT = 'MOBILE_PAYMENT',
    OTHER = 'OTHER'
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: 'Gotówka',
    [PaymentMethod.BANK_TRANSFER]: 'Przelew bankowy',
    [PaymentMethod.CARD]: 'Karta',
    [PaymentMethod.MOBILE_PAYMENT]: 'Płatność mobilna',
    [PaymentMethod.OTHER]: 'Inna'
};

export interface DocumentAttachment {
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    uploadedAt: string;
    file?: File;
}

export interface DocumentItem {
    id?: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    totalNet: number;
    totalGross: number;
}

export enum DocumentType {
    INVOICE = 'INVOICE',
    RECEIPT = 'RECEIPT',
    OTHER = 'OTHER'
}

export const DocumentTypeLabels: Record<DocumentType, string> = {
    [DocumentType.INVOICE]: 'Faktura',
    [DocumentType.RECEIPT]: 'Paragon',
    [DocumentType.OTHER]: 'Inna operacja'
};

export enum TransactionDirection {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE'
}

export const TransactionDirectionLabels: Record<TransactionDirection, string> = {
    [TransactionDirection.INCOME]: 'Przychód',
    [TransactionDirection.EXPENSE]: 'Wydatek'
};

export const TransactionDirectionColors: Record<TransactionDirection, string> = {
    [TransactionDirection.INCOME]: '#2ecc71',
    [TransactionDirection.EXPENSE]: '#e74c3c'
};

// Główny interfejs - zunifikowany dokument finansowy
export interface UnifiedFinancialDocument {
    id: string;
    number: string; // Numer dokumentu (faktury/paragonu/etc)
    type: DocumentType; // Typ dokumentu
    title: string;

    // Daty
    issuedDate: string; // Data wystawienia
    dueDate?: string; // Termin płatności (głównie dla faktur)

    // Kontrahenci
    sellerName: string;
    sellerTaxId?: string;
    sellerAddress?: string;
    buyerName: string;
    buyerTaxId?: string;
    buyerAddress?: string;

    // Status i płatność
    status: DocumentStatus;
    direction: TransactionDirection; // Przychód/Wydatek
    paymentMethod: PaymentMethod;

    // Kwoty
    totalNet: number;
    totalTax: number;
    totalGross: number;
    paidAmount?: number; // Kwota zapłacona
    currency: string;

    // Dodatkowe informacje
    description?: string; // Dodatkowy opis
    notes?: string; // Uwagi

    // Powiązania
    protocolId?: string;
    protocolNumber?: string;
    visitId?: string;

    // Metadane
    createdAt: string;
    updatedAt: string;

    // Pozycje i załączniki
    items: DocumentItem[];
    attachments: DocumentAttachment[];
}

export interface UnifiedDocumentFilters {
    number?: string;
    title?: string;
    buyerName?: string;
    sellerName?: string;
    status?: DocumentStatus;
    type?: DocumentType;
    direction?: TransactionDirection;
    paymentMethod?: PaymentMethod;
    dateFrom?: string;
    dateTo?: string;
    protocolId?: string;
    visitId?: string;
    minAmount?: number;
    maxAmount?: number;
}

// Dla kompatybilności wstecznej - aliasy
export type Invoice = UnifiedFinancialDocument;
export type InvoiceStatus = DocumentStatus;
export const InvoiceStatus = DocumentStatus;
export const InvoiceStatusLabels = DocumentStatusLabels;
export const InvoiceStatusColors = DocumentStatusColors;
export type InvoiceType = TransactionDirection;
export const InvoiceType = TransactionDirection;
export const InvoiceTypeLabels = TransactionDirectionLabels;
export type InvoiceItem = DocumentItem;
export type InvoiceAttachment = DocumentAttachment;
export type InvoiceFilters = UnifiedDocumentFilters;

// Typy dla API
export interface UnifiedDocumentSummary {
    cashBalance: number;
    totalIncome: number;
    totalExpense: number;
    bankAccountBalance: number;
    receivables: number;
    receivablesOverdue: number;
    liabilities: number;
    liabilitiesOverdue: number;
    profit: number;
    cashFlow: number;
    incomeByMethod: Record<PaymentMethod, number>;
    expenseByMethod: Record<PaymentMethod, number>;
    receivablesByTimeframe: {
        current: number;
        within30Days: number;
        within60Days: number;
        within90Days: number;
        over90Days: number;
    };
    liabilitiesByTimeframe: {
        current: number;
        within30Days: number;
        within60Days: number;
        within90Days: number;
        over90Days: number;
    };
}

// Dla kompatybilności wstecznej
export type FinancialSummary = UnifiedDocumentSummary;