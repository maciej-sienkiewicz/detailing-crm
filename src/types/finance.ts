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

// Dodajemy nowe typy do istniejącego pliku finance.ts

// Typ operacji finansowej
export enum FinancialOperationType {
    INVOICE = 'INVOICE',       // Faktura
    RECEIPT = 'RECEIPT',       // Paragon
    OTHER = 'OTHER'            // Inna operacja
}

// Etykiety dla typów operacji
export const FinancialOperationTypeLabels: Record<FinancialOperationType, string> = {
    [FinancialOperationType.INVOICE]: 'Faktura',
    [FinancialOperationType.RECEIPT]: 'Paragon',
    [FinancialOperationType.OTHER]: 'Inna operacja'
};

// Ikony dla typów operacji (kody ikon z react-icons/fa)
export const FinancialOperationTypeIcons: Record<FinancialOperationType, string> = {
    [FinancialOperationType.INVOICE]: 'FaFileInvoiceDollar',
    [FinancialOperationType.RECEIPT]: 'FaReceipt',
    [FinancialOperationType.OTHER]: 'FaExchangeAlt'
};

// Kierunek transakcji
export enum TransactionDirection {
    INCOME = 'INCOME',         // Przychód
    EXPENSE = 'EXPENSE'        // Wydatek
}

// Etykiety dla kierunków transakcji
export const TransactionDirectionLabels: Record<TransactionDirection, string> = {
    [TransactionDirection.INCOME]: 'Przychód',
    [TransactionDirection.EXPENSE]: 'Wydatek'
};

// Kolory dla kierunków transakcji
export const TransactionDirectionColors: Record<TransactionDirection, string> = {
    [TransactionDirection.INCOME]: '#2ecc71',   // Zielony
    [TransactionDirection.EXPENSE]: '#e74c3c'   // Czerwony
};

// Status płatności
export enum PaymentStatus {
    PAID = 'PAID',                   // Opłacone
    UNPAID = 'UNPAID',               // Nieopłacone
    PARTIALLY_PAID = 'PARTIALLY_PAID', // Częściowo opłacone
    OVERDUE = 'OVERDUE'              // Przeterminowane
}

// Etykiety dla statusów płatności
export const PaymentStatusLabels: Record<PaymentStatus, string> = {
    [PaymentStatus.PAID]: 'Opłacone',
    [PaymentStatus.UNPAID]: 'Nieopłacone',
    [PaymentStatus.PARTIALLY_PAID]: 'Częściowo opłacone',
    [PaymentStatus.OVERDUE]: 'Przeterminowane'
};

// Kolory dla statusów płatności
export const PaymentStatusColors: Record<PaymentStatus, string> = {
    [PaymentStatus.PAID]: '#2ecc71',         // Zielony
    [PaymentStatus.UNPAID]: '#3498db',       // Niebieski
    [PaymentStatus.PARTIALLY_PAID]: '#f39c12', // Pomarańczowy
    [PaymentStatus.OVERDUE]: '#e74c3c'       // Czerwony
};

// Główny interfejs operacji finansowej
export interface FinancialOperation {
    id: string;
    type: FinancialOperationType;    // Typ operacji
    documentNumber?: string;         // Numer dokumentu (opcjonalny dla operacji gotówkowych)
    title: string;                   // Tytuł/nazwa operacji
    description?: string;            // Dodatkowy opis (opcjonalny)
    date: string;                    // Data operacji
    dueDate?: string;                // Termin płatności (opcjonalny)
    direction: TransactionDirection; // Kierunek: przychód/wydatek
    paymentMethod: PaymentMethod;    // Metoda płatności
    counterpartyName: string;        // Nazwa kontrahenta
    counterpartyId?: string;         // ID kontrahenta (opcjonalny)
    amount: number;                  // Kwota brutto
    netAmount?: number;              // Kwota netto (opcjonalna)
    taxAmount?: number;              // Kwota podatku (opcjonalna)
    paidAmount?: number;             // Zapłacona kwota (opcjonalna)
    status: PaymentStatus;           // Status płatności
    currency: string;                // Waluta
    protocolId?: string;             // Powiązany protokół (opcjonalny)
    visitId?: string;                // Powiązana wizyta (opcjonalny)
    sourceId: string;                // ID oryginalnego dokumentu
    sourceType: FinancialOperationType; // Typ oryginalnego dokumentu
    createdAt: string;               // Data utworzenia
    updatedAt: string;               // Data aktualizacji
    attachments?: any[];             // Załączniki (opcjonalne)
}

// Filtry operacji finansowych
export interface FinancialOperationFilters {
    type?: FinancialOperationType;
    direction?: TransactionDirection;
    status?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
    counterpartyName?: string;
    documentNumber?: string;
    protocolId?: string;
    visitId?: string;
}

// Dane podsumowania finansowego
export interface FinancialSummary {
    cashBalance: number;              // Aktualny stan kasy
    totalIncome: number;              // Całkowite przychody
    totalExpense: number;             // Całkowite wydatki
    bankAccountBalance: number;       // Stan konta bankowego
    receivables: number;              // Należności do otrzymania
    receivablesOverdue: number;       // Przeterminowane należności
    liabilities: number;              // Zobowiązania do zapłaty
    liabilitiesOverdue: number;       // Przeterminowane zobowiązania
    profit: number;                   // Zysk (przychody - koszty)
    cashFlow: number;                 // Przepływ pieniędzy
    incomeByMethod: Record<PaymentMethod, number>; // Przychody wg metody płatności
    expenseByMethod: Record<PaymentMethod, number>; // Wydatki wg metody płatności
    receivablesByTimeframe: {         // Należności wg terminów
        current: number;                // Bieżące
        within30Days: number;           // Do 30 dni
        within60Days: number;           // 30-60 dni
        within90Days: number;           // 60-90 dni
        over90Days: number;             // Ponad 90 dni
    };
    liabilitiesByTimeframe: {         // Zobowiązania wg terminów
        current: number;                // Bieżące
        within30Days: number;           // Do 30 dni
        within60Days: number;           // 30-60 dni
        within90Days: number;           // 60-90 dni
        over90Days: number;             // Ponad 90 dni
    };
}