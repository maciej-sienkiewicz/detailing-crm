// src/services/invoiceExtractService.ts
import {apiClient} from '../api/apiClient';

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

export interface InvoiceDataResponse {
    extractedInvoiceData: ExtractedInvoiceData;
}

/**
 * Serwis do ekstrakcji danych z faktur
 */
export const invoiceExtractService = {
    /**
     * Wyodrębnij dane z pliku faktury
     * @param file Plik faktury (PDF lub obraz)
     * @returns Dane wyodrębnione z faktury
     */
    extractInvoiceData: async (file: File): Promise<ExtractedInvoiceData | null> => {
        if (!file) {
            console.error('Brak pliku do ekstrakcji');
            return null;
        }

        try {
            // Tworzymy FormData do wysłania pliku
            const formData = new FormData();
            formData.append('file', file);
            formData.append('preprocess', 'true');

            // Wywołanie API do ekstrakcji danych
            const response = await apiClient.post<InvoiceDataResponse>('/invoice/extract', formData);

            if (response && response.extractedInvoiceData) {
                return response.extractedInvoiceData;
            }

            return null;
        } catch (error) {
            console.error('Błąd podczas ekstrakcji danych z faktury:', error);
            throw error;
        }
    }
};