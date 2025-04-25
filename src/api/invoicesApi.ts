// src/api/invoicesApi.ts
import { apiClient } from './apiClient';
import {
    Invoice,
    InvoiceType,
    InvoiceStatus,
    InvoiceFilters,
    InvoiceAttachment
} from '../types';

// Typ odpowiedzi dla ekstrahowanych danych z faktury
export interface ExtractedInvoiceData {
    generalInfo: {
        title?: string;
        issuedDate: string;
        dueDate: string;
    };
    seller: {
        name: string;
        taxId?: string;
        address?: string;
    };
    buyer: {
        name: string;
        taxId?: string;
        address?: string;
    };
    items: {
        name: string;
        description?: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
        totalNet: number;
        totalGross: number;
    }[];
    summary: {
        totalNet: number;
        totalTax: number;
        totalGross: number;
    };
    notes?: string;
}

// Typ odpowiedzi z serwera dla ekstrahowanych danych
export interface InvoiceDataResponse {
    extractedInvoiceData: ExtractedInvoiceData;
}

const convertToSnakeCase = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(convertToSnakeCase);
    }

    return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        acc[snakeKey] = convertToSnakeCase(obj[key]);
        return acc;
    }, {} as any);
};

const convertToCamelCase = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(convertToCamelCase);
    }

    return Object.keys(obj).reduce((acc, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        acc[camelKey] = convertToCamelCase(obj[key]);
        return acc;
    }, {} as any);
};

export const invoicesApi = {
    // Pobieranie wszystkich faktur z opcjonalnym filtrowaniem
    fetchInvoices: async (filters?: InvoiceFilters): Promise<Invoice[]> => {
        try {
            // Przekształcenie filtrów na parametry zapytania
            const queryParams: Record<string, string> = {};

            if (filters) {
                if (filters.number) queryParams.number = filters.number;
                if (filters.title) queryParams.title = filters.title;
                if (filters.buyerName) queryParams.buyerName = filters.buyerName;
                if (filters.status) queryParams.status = filters.status;
                if (filters.type) queryParams.type = filters.type;
                if (filters.dateFrom) queryParams.dateFrom = filters.dateFrom;
                if (filters.dateTo) queryParams.dateTo = filters.dateTo;
                if (filters.protocolId) queryParams.protocolId = filters.protocolId;
                if (filters.minAmount) queryParams.minAmount = filters.minAmount.toString();
                if (filters.maxAmount) queryParams.maxAmount = filters.maxAmount.toString();
            }

            const response = await apiClient.get<Invoice[]>('/invoices', queryParams);
            return convertToCamelCase(response);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            return [];
        }
    },

    // Pobieranie faktury po ID
    fetchInvoiceById: async (id: string): Promise<Invoice | null> => {
        try {
            const response = await apiClient.get<Invoice>(`/invoices/${id}`);
            return response;
        } catch (error) {
            console.error(`Error fetching invoice ${id}:`, error);
            return null;
        }
    },

    // Tworzenie nowej faktury
    createInvoice: async (invoiceData: any, attachmentFile?: File): Promise<Invoice | null> => {
        try {
            // Upewnij się, że wszystkie wymagane pola są obecne i mają prawidłowe wartości
            const dataToSend = {
                ...invoiceData,
                // Upewnij się, że wymagane pola są wypełnione
                title: invoiceData.title || "Nowa faktura",
                sellerName: invoiceData.sellerName || "Nazwa Sprzedawcy",  // Non-empty value
                buyerName: invoiceData.buyerName || "Nazwa Nabywcy",      // Non-empty value
                status: invoiceData.status || "DRAFT",
                type: invoiceData.type || "INCOME",
                paymentMethod: invoiceData.paymentMethod || "BANK_TRANSFER",
                currency: invoiceData.currency || "PLN",
                issuedDate: formatDateForBackend(invoiceData.issuedDate || new Date()),
                dueDate: formatDateForBackend(invoiceData.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)), // +14 dni

                // Zapewnij, że jest przynajmniej jeden element faktury z pozytywnymi wartościami
                items: invoiceData.items && invoiceData.items.length > 0
                    ? invoiceData.items.map((item: any) => ({
                        ...item,
                        name: item.name || "Pozycja faktury",
                        quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
                        unitPrice: item.unitPrice && item.unitPrice > 0 ? item.unitPrice : 1, // Must be positive!
                        taxRate: item.taxRate >= 0 ? item.taxRate : 23,
                        totalNet: item.totalNet && item.totalNet > 0 ? item.totalNet : 1,
                        totalGross: item.totalGross && item.totalGross > 0 ? item.totalGross : 1.23
                    }))
                    : [{
                        name: "Domyślna pozycja faktury",
                        quantity: 1,
                        unitPrice: 1, // Ensure positive
                        taxRate: 23,
                        totalNet: 1,
                        totalGross: 1.23
                    }]
            };

            // Przelicz sumy, jeśli nie zostały podane lub są nieprawidłowe
            if (!dataToSend.totalNet || dataToSend.totalNet <= 0) {
                dataToSend.totalNet = dataToSend.items.reduce((sum: number, item: any) => sum + Number(item.totalNet), 0);
            }

            if (!dataToSend.totalTax || dataToSend.totalTax < 0) {
                dataToSend.totalTax = dataToSend.items.reduce((sum: number, item: any) =>
                    sum + (Number(item.totalGross) - Number(item.totalNet)), 0);
            }

            if (!dataToSend.totalGross || dataToSend.totalGross <= 0) {
                dataToSend.totalGross = dataToSend.items.reduce((sum: number, item: any) => sum + Number(item.totalGross), 0);
            }

            console.log("Sending invoice data:", JSON.stringify(dataToSend, null, 2));

            // Przygotowanie formularza do wysyłki
            const formData = new FormData();

            // Dodanie danych faktury jako JSON blob
            const invoiceBlob = new Blob([JSON.stringify(dataToSend)], {
                type: 'application/json'
            });
            formData.append('invoice', invoiceBlob);

            console.log(attachmentFile?.name)
            // Dodanie załącznika (jeśli istnieje)
            if (attachmentFile) {
                formData.append('attachment', attachmentFile);
            }

            const response = await apiClient.post<Invoice>('/invoices', formData);
            return convertToCamelCase(response);
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw error; // Re-throw to see the complete error
        }
    },

    // Aktualizacja istniejącej faktury
    updateInvoice: async (id: string, invoiceData: any, attachmentFile?: File): Promise<Invoice | null> => {
        try {
            // Bardzo podobna logika jak w createInvoice
            const dataToSend = {
                ...invoiceData,
                title: invoiceData.title || "Faktura",
                sellerName: invoiceData.sellerName || "Nazwa Sprzedawcy",
                buyerName: invoiceData.buyerName || "Nazwa Nabywcy",
                status: invoiceData.status || "DRAFT",
                type: invoiceData.type || "INCOME",
                paymentMethod: invoiceData.paymentMethod || "BANK_TRANSFER",
                currency: invoiceData.currency || "PLN",
                issuedDate: formatDateForBackend(invoiceData.issuedDate || new Date()),
                dueDate: formatDateForBackend(invoiceData.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),

                items: invoiceData.items && invoiceData.items.length > 0
                    ? invoiceData.items.map((item: any) => ({
                        ...item,
                        name: item.name || "Pozycja faktury",
                        quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
                        unitPrice: item.unitPrice && item.unitPrice > 0 ? item.unitPrice : 1,
                        taxRate: item.taxRate >= 0 ? item.taxRate : 23,
                        totalNet: item.totalNet && item.totalNet > 0 ? item.totalNet : 1,
                        totalGross: item.totalGross && item.totalGross > 0 ? item.totalGross : 1.23
                    }))
                    : [{
                        name: "Domyślna pozycja faktury",
                        quantity: 1,
                        unitPrice: 1,
                        taxRate: 23,
                        totalNet: 1,
                        totalGross: 1.23
                    }]
            };

            // Przelicz sumy
            if (!dataToSend.totalNet || dataToSend.totalNet <= 0) {
                dataToSend.totalNet = dataToSend.items.reduce((sum: number, item: any) => sum + Number(item.totalNet), 0);
            }

            if (!dataToSend.totalTax || dataToSend.totalTax < 0) {
                dataToSend.totalTax = dataToSend.items.reduce((sum: number, item: any) =>
                    sum + (Number(item.totalGross) - Number(item.totalNet)), 0);
            }

            if (!dataToSend.totalGross || dataToSend.totalGross <= 0) {
                dataToSend.totalGross = dataToSend.items.reduce((sum: number, item: any) => sum + Number(item.totalGross), 0);
            }

            console.log("Sending invoice update data:", JSON.stringify(dataToSend, null, 2));

            // Przygotowanie formularza do wysyłki
            const formData = new FormData();

            // Dodanie danych faktury jako JSON
            const invoiceBlob = new Blob([JSON.stringify(convertToSnakeCase(dataToSend))], {
                type: 'application/json'
            });
            formData.append('invoice', invoiceBlob);

            // Dodanie załącznika (jeśli istnieje)
            if (attachmentFile) {
                formData.append('attachment', attachmentFile);
            }

            const response = await apiClient.put<Invoice>(`/invoices/${id}`, formData);
            return convertToCamelCase(response);
        } catch (error) {
            console.error(`Error updating invoice ${id}:`, error);
            throw error; // Re-throw to see the complete error
        }
    },

    // Usuwanie faktury
    deleteInvoice: async (id: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/invoices/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting invoice ${id}:`, error);
            return false;
        }
    },

    // Aktualizacja statusu faktury
    updateInvoiceStatus: async (id: string, status: InvoiceStatus): Promise<boolean> => {
        try {
            await apiClient.patch<any>(`/invoices/${id}/status?status=${status}`, {});
            return true;
        } catch (error) {
            console.error(`Error updating invoice status ${id}:`, error);
            return false;
        }
    },

    // Aktualizacja kwoty zapłaconej
    updatePaidAmount: async (id: string, paid: number): Promise<boolean> => {
        try {
            await apiClient.patch<any>(`/invoices/${id}/paid?paid=${paid}`, {});
            return true;
        } catch (error) {
            console.error(`Error updating invoice paid amount ${id}:`, error);
            return false;
        }
    },

    // Pobieranie załącznika faktury
    getInvoiceAttachmentUrl: (id: string): string => {
        return `${apiClient.getBaseUrl()}/invoices/${id}/attachment`;
    },

    // Ekstrakcja danych z faktury
    extractInvoiceData: async (file: File): Promise<ExtractedInvoiceData | null> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post<InvoiceDataResponse>('/invoices/extract', formData);
            return response.extractedInvoiceData;
        } catch (error) {
            console.error('Error extracting invoice data:', error);
            return null;
        }
    }
};

// Helper dla formatowania dat
function formatDateForBackend(date: any): string {
    if (!date) return new Date().toISOString().split('T')[0];

    if (typeof date === 'string') {
        // Jeśli to już string, upewnij się, że jest w formacie YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }
        // Próba konwersji stringa na Date
        date = new Date(date);
    }

    if (date instanceof Date && !isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Fallback na bieżącą datę
    return new Date().toISOString().split('T')[0];
}