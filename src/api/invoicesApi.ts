// src/api/invoicesApi.ts
import {apiClient} from './apiClient';
import {Invoice, InvoiceFilters, InvoiceStatus} from '../types';

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
    extractedDocumentData: ExtractedInvoiceData;
}

/**
 * Formatuje datę do formatu wymaganego przez backend
 * @param date - Data w dowolnym formacie
 * @returns Data w formacie YYYY-MM-DD
 */
const formatDateForBackend = (date: any): string => {
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
};

/**
 * Normalizuje dane faktury aby zapewnić spójność
 * @param invoiceData - Dane faktury
 * @returns Znormalizowane dane faktury
 */
const normalizeInvoiceData = (invoiceData: any): any => {
    // Upewnij się, że wszystkie wymagane pola są obecne i mają prawidłowe wartości
    const normalizedData = {
        ...invoiceData,
        // Upewnij się, że wymagane pola są wypełnione
        title: invoiceData.title || "Nowa faktura",
        sellerName: invoiceData.sellerName || "Nazwa Sprzedawcy",
        buyerName: invoiceData.buyerName || "Nazwa Nabywcy",
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

    // Przelicz sumy, jeśli nie zostały podane lub są nieprawidłowe
    if (!normalizedData.totalNet || normalizedData.totalNet <= 0) {
        normalizedData.totalNet = normalizedData.items.reduce(
            (sum: number, item: any) => sum + Number(item.totalNet), 0
        );
    }

    if (!normalizedData.totalTax || normalizedData.totalTax < 0) {
        normalizedData.totalTax = normalizedData.items.reduce(
            (sum: number, item: any) => sum + (Number(item.totalGross) - Number(item.totalNet)), 0
        );
    }

    if (!normalizedData.totalGross || normalizedData.totalGross <= 0) {
        normalizedData.totalGross = normalizedData.items.reduce(
            (sum: number, item: any) => sum + Number(item.totalGross), 0
        );
    }

    return normalizedData;
};

export const invoicesApi = {
    // Pobieranie wszystkich faktur z opcjonalnym filtrowaniem
    fetchInvoices: async (filters?: InvoiceFilters): Promise<Invoice[]> => {
        try {
            return await apiClient.get<Invoice[]>('/invoices', filters || {});
        } catch (error) {
            console.error('Error fetching invoices:', error);
            return [];
        }
    },

    // Pobieranie faktury po ID
    fetchInvoiceById: async (id: string): Promise<Invoice | null> => {
        try {
            return await apiClient.get<Invoice>(`/invoices/${id}`);
        } catch (error) {
            console.error(`Error fetching invoice ${id}:`, error);
            return null;
        }
    },

    // Tworzenie nowej faktury
    createInvoice: async (invoiceData: any, attachmentFile?: File): Promise<Invoice | null> => {
        try {
            // Normalizacja danych faktury
            const normalizedData = normalizeInvoiceData(invoiceData);

            // Przygotowanie formularza
            const formData = apiClient.createFormDataWithJson(
                normalizedData,
                'invoice',
                attachmentFile ? { 'attachment': attachmentFile } : undefined
            );

            return await apiClient.post<Invoice>('/invoices', formData);
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw error;
        }
    },

    // Aktualizacja istniejącej faktury
    updateInvoice: async (id: string, invoiceData: any, attachmentFile?: File): Promise<Invoice | null> => {
        try {
            // Normalizacja danych faktury
            const normalizedData = normalizeInvoiceData(invoiceData);

            // Przygotowanie formularza
            const formData = apiClient.createFormDataWithJson(
                normalizedData,
                'invoice',
                attachmentFile ? { 'attachment': attachmentFile } : undefined
            );

            return await apiClient.put<Invoice>(`/invoices/${id}`, formData);
        } catch (error) {
            console.error(`Error updating invoice ${id}:`, error);
            throw error;
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
            await apiClient.patch<any>(`/invoices/${id}/status`, { status });
            return true;
        } catch (error) {
            console.error(`Error updating invoice status ${id}:`, error);
            return false;
        }
    },

    // Aktualizacja kwoty zapłaconej
    updatePaidAmount: async (id: string, paid: number): Promise<boolean> => {
        try {
            await apiClient.patch<any>(`/invoices/${id}/paid`, { paid });
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

            const response = await apiClient.post<InvoiceDataResponse>('/invoice/extract', formData);
            return response.extractedDocumentData;
        } catch (error) {
            console.error('Error extracting invoice data:', error);
            return null;
        }
    }
};