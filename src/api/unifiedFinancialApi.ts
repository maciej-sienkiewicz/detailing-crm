// src/api/unifiedFinancialApi.ts
import { apiClient, PaginatedResponse } from './apiClient';
import {
    UnifiedFinancialDocument,
    UnifiedDocumentFilters,
    UnifiedDocumentSummary,
    DocumentType,
    DocumentStatus
} from '../types/finance';

// Typ odpowiedzi dla ekstrahowanych danych z dokumentu
export interface ExtractedDocumentData {
    generalInfo: {
        title?: string;
        issuedDate: string;
        dueDate?: string;
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
export interface DocumentDataResponse {
    extractedDocumentData: ExtractedDocumentData;
}

/**
 * Formatuje datę do formatu wymaganego przez backend
 */
const formatDateForBackend = (date: any): string => {
    if (!date) return new Date().toISOString().split('T')[0];

    if (typeof date === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }
        date = new Date(date);
    }

    if (date instanceof Date && !isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return new Date().toISOString().split('T')[0];
};

/**
 * Normalizuje dane dokumentu aby zapewnić spójność
 */
const normalizeDocumentData = (documentData: any): any => {
    const normalizedData = {
        ...documentData,
        title: documentData.title || "Nowy dokument",
        sellerName: documentData.sellerName || "Nazwa Sprzedawcy",
        buyerName: documentData.buyerName || "Nazwa Nabywcy",
        status: documentData.status || "NOT_PAID",
        direction: documentData.direction || "INCOME",
        type: documentData.type || "INVOICE",
        paymentMethod: documentData.paymentMethod || "BANK_TRANSFER",
        currency: documentData.currency || "PLN",
        issuedDate: formatDateForBackend(documentData.issuedDate || new Date()),
        dueDate: documentData.dueDate ? formatDateForBackend(documentData.dueDate) : undefined,

        items: documentData.items && documentData.items.length > 0
            ? documentData.items.map((item: any) => ({
                ...item,
                name: item.name || "Pozycja dokumentu",
                quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
                unitPrice: item.unitPrice && item.unitPrice > 0 ? item.unitPrice : 1,
                taxRate: item.taxRate >= 0 ? item.taxRate : 23,
                totalNet: item.totalNet && item.totalNet > 0 ? item.totalNet : 1,
                totalGross: item.totalGross && item.totalGross > 0 ? item.totalGross : 1.23
            }))
            : [{
                name: "Domyślna pozycja",
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

export const unifiedFinancialApi = {
    // Pobieranie wszystkich dokumentów z opcjonalnym filtrowaniem
    fetchDocuments: async (
        filters?: UnifiedDocumentFilters,
        page: number = 0,
        size: number = 10
    ): Promise<PaginatedResponse<UnifiedFinancialDocument>> => {
        try {
            return await apiClient.getWithPagination<UnifiedFinancialDocument>(
                '/financial-documents',
                filters || {},
                { page, size }
            );
        } catch (error) {
            console.error('Error fetching financial documents:', error);
            return {
                data: [],
                pagination: {
                    currentPage: page,
                    pageSize: size,
                    totalItems: 0,
                    totalPages: 0
                }
            };
        }
    },

    // Pobieranie dokumentu po ID
    fetchDocumentById: async (id: string): Promise<UnifiedFinancialDocument | null> => {
        try {
            return await apiClient.get<UnifiedFinancialDocument>(`/financial-documents/${id}`);
        } catch (error) {
            console.error(`Error fetching document ${id}:`, error);
            return null;
        }
    },

    // Tworzenie nowego dokumentu
    createDocument: async (
        documentData: any,
        attachmentFile?: File
    ): Promise<UnifiedFinancialDocument | null> => {
        try {
            const normalizedData = normalizeDocumentData(documentData);

            console.log("Sending document data:", JSON.stringify(normalizedData, null, 2));

            const formData = apiClient.createFormDataWithJson(
                normalizedData,
                'document',
                attachmentFile ? { 'attachment': attachmentFile } : undefined
            );

            return await apiClient.post<UnifiedFinancialDocument>('/financial-documents', formData);
        } catch (error) {
            console.error('Error creating document:', error);
            throw error;
        }
    },

    // Aktualizacja istniejącego dokumentu
    updateDocument: async (
        id: string,
        documentData: any,
        attachmentFile?: File
    ): Promise<UnifiedFinancialDocument | null> => {
        try {
            const normalizedData = normalizeDocumentData(documentData);

            console.log("Sending document update data:", JSON.stringify(normalizedData, null, 2));

            const formData = apiClient.createFormDataWithJson(
                normalizedData,
                'document',
                attachmentFile ? { 'attachment': attachmentFile } : undefined
            );

            return await apiClient.put<UnifiedFinancialDocument>(`/financial-documents/${id}`, formData);
        } catch (error) {
            console.error(`Error updating document ${id}:`, error);
            throw error;
        }
    },

    // Usuwanie dokumentu
    deleteDocument: async (id: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/financial-documents/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting document ${id}:`, error);
            return false;
        }
    },

    // Aktualizacja statusu dokumentu
    updateDocumentStatus: async (id: string, status: DocumentStatus): Promise<boolean> => {
        try {
            await apiClient.patch<any>(`/financial-documents/${id}/status`, { status });
            return true;
        } catch (error) {
            console.error(`Error updating document status ${id}:`, error);
            return false;
        }
    },

    // Aktualizacja kwoty zapłaconej
    updatePaidAmount: async (id: string, paidAmount: number): Promise<boolean> => {
        try {
            await apiClient.patch<any>(`/financial-documents/${id}/paid`, { paidAmount });
            return true;
        } catch (error) {
            console.error(`Error updating document paid amount ${id}:`, error);
            return false;
        }
    },

    // Pobieranie załącznika dokumentu
    getDocumentAttachmentUrl: (id: string): string => {
        return `${apiClient.getBaseUrl()}/financial-documents/${id}/attachment`;
    },

    // Ekstrakcja danych z dokumentu
    extractDocumentData: async (file: File): Promise<ExtractedDocumentData | null> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post<DocumentDataResponse>('/financial-documents/extract', formData);
            return response.extractedDocumentData;
        } catch (error) {
            console.error('Error extracting document data:', error);
            return null;
        }
    },

    // Pobieranie podsumowania finansowego
    getFinancialSummary: async (dateFrom?: string, dateTo?: string): Promise<UnifiedDocumentSummary> => {
        try {
            const params: any = {};
            if (dateFrom) params.dateFrom = dateFrom;
            if (dateTo) params.dateTo = dateTo;

            return await apiClient.get<UnifiedDocumentSummary>('/financial-documents/summary', params);
        } catch (error) {
            console.error('Error fetching financial summary:', error);
            throw error;
        }
    },

    // Pobieranie danych do wykresów
    getFinancialChartData: async (period: 'month' | 'quarter' | 'year' = 'month'): Promise<any> => {
        try {
            return await apiClient.get<any>(`/financial-documents/chart-data?period=${period}`);
        } catch (error) {
            console.error('Error fetching financial chart data:', error);
            throw error;
        }
    }
};