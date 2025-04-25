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
            return response;
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
    createInvoice: async (invoiceData: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'updatedAt'>, attachmentFile?: File): Promise<Invoice | null> => {
        try {
            // Przygotowanie formularza do wysyłki
            const formData = new FormData();

            // Dodanie danych faktury jako JSON
            formData.append('invoice', JSON.stringify(invoiceData));

            // Dodanie załącznika (jeśli istnieje)
            if (attachmentFile) {
                formData.append('attachment', attachmentFile);
            }

            const response = await apiClient.post<Invoice>('/invoices', formData);
            return response;
        } catch (error) {
            console.error('Error creating invoice:', error);
            return null;
        }
    },

    // Aktualizacja istniejącej faktury
    updateInvoice: async (id: string, invoiceData: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'updatedAt'>, attachmentFile?: File): Promise<Invoice | null> => {
        try {
            // Przygotowanie formularza do wysyłki
            const formData = new FormData();

            // Dodanie danych faktury jako JSON
            formData.append('invoice', JSON.stringify(invoiceData));

            // Dodanie załącznika (jeśli istnieje)
            if (attachmentFile) {
                formData.append('attachment', attachmentFile);
            }

            const response = await apiClient.put<Invoice>(`/invoices/${id}`, formData);
            return response;
        } catch (error) {
            console.error(`Error updating invoice ${id}:`, error);
            return null;
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