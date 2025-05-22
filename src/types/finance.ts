export enum InvoiceStatus {
    NOT_PAID = 'NOT_PAID',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED'
}

export const InvoiceStatusLabels: Record<InvoiceStatus, string> = {
    [InvoiceStatus.NOT_PAID]: 'Nieopłacona',
    [InvoiceStatus.PAID]: 'Opłacona',
    [InvoiceStatus.OVERDUE]: 'Przeterminowana',
    [InvoiceStatus.CANCELLED]: 'Anulowana'
};

export const InvoiceStatusColors: Record<InvoiceStatus, string> = {
    [InvoiceStatus.NOT_PAID]: '#3498db',
    [InvoiceStatus.PAID]: '#2ecc71',
    [InvoiceStatus.OVERDUE]: '#e74c3c',
    [InvoiceStatus.CANCELLED]: '#95a5a6'
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

export interface InvoiceAttachment {
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    uploadedAt: string;
    file?: File;
}

export interface InvoiceItem {
    id?: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    totalNet: number;
    totalGross: number;
}

export enum InvoiceType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE'
}

export const InvoiceTypeLabels: Record<InvoiceType, string> = {
    [InvoiceType.INCOME]: 'Przychodowa',
    [InvoiceType.EXPENSE]: 'Kosztowa'
};

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
    paid?: number;
}

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

export enum FinancialOperationType {
    INVOICE = 'INVOICE',
    RECEIPT = 'RECEIPT',
    OTHER = 'OTHER'
}

export const FinancialOperationTypeLabels: Record<FinancialOperationType, string> = {
    [FinancialOperationType.INVOICE]: 'Faktura',
    [FinancialOperationType.RECEIPT]: 'Paragon',
    [FinancialOperationType.OTHER]: 'Inna operacja'
};

export const FinancialOperationTypeIcons: Record<FinancialOperationType, string> = {
    [FinancialOperationType.INVOICE]: 'FaFileInvoiceDollar',
    [FinancialOperationType.RECEIPT]: 'FaReceipt',
    [FinancialOperationType.OTHER]: 'FaExchangeAlt'
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

export enum PaymentStatus {
    PAID = 'PAID',
    UNPAID = 'UNPAID',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
    OVERDUE = 'OVERDUE'
}

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
    [PaymentStatus.PAID]: 'Opłacone',
    [PaymentStatus.UNPAID]: 'Nieopłacone',
    [PaymentStatus.PARTIALLY_PAID]: 'Częściowo opłacone',
    [PaymentStatus.OVERDUE]: 'Przeterminowane'
};

export const PaymentStatusColors: Record<PaymentStatus, string> = {
    [PaymentStatus.PAID]: '#2ecc71',
    [PaymentStatus.UNPAID]: '#3498db',
    [PaymentStatus.PARTIALLY_PAID]: '#f39c12',
    [PaymentStatus.OVERDUE]: '#e74c3c'
};

export interface FinancialOperation {
    id: string;
    type: FinancialOperationType;
    documentNumber?: string;
    title: string;
    description?: string;
    date: string;
    dueDate?: string;
    direction: TransactionDirection;
    paymentMethod: PaymentMethod;
    counterpartyName: string;
    counterpartyId?: string;
    amount: number;
    netAmount?: number;
    taxAmount?: number;
    paidAmount?: number;
    status: PaymentStatus;
    currency: string;
    protocolId?: string;
    visitId?: string;
    sourceId: string;
    sourceType: FinancialOperationType;
    createdAt: string;
    updatedAt: string;
    attachments?: any[];
    items?: InvoiceItem[];
}

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

export interface FinancialSummary {
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