// src/api/invoiceSignatureApi.ts
import { apiClient } from './apiClient';

export interface InvoiceSignatureRequest {
    tabletId: string;
    customerName: string;
    signatureTitle?: string;
    instructions?: string;
    timeoutMinutes?: number;
}

export interface InvoiceSignatureResponse {
    success: boolean;
    sessionId: string;
    message: string;
    invoiceId: string;
    expiresAt: string;
    invoicePreviewUrl?: string;
}

export interface InvoiceSignatureStatusResponse {
    success: boolean;
    sessionId: string;
    invoiceId: string;
    status: 'PENDING' | 'SENT_TO_TABLET' | 'VIEWING_INVOICE' | 'SIGNING_IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED' | 'ERROR';
    signedAt?: string;
    signedInvoiceUrl?: string;
    signatureImageUrl?: string;
    timestamp: string;
}

export const invoiceSignatureApi = {
    // Wysłanie żądania podpisu faktury
    requestInvoiceSignature: async (invoiceId: string, request: InvoiceSignatureRequest): Promise<InvoiceSignatureResponse> => {
        try {
            console.log('🔧 Requesting invoice signature...', { invoiceId, request });

            const response = await apiClient.post<InvoiceSignatureResponse>(
                `/invoices/${invoiceId}/signature/request`,
                request
            );

            console.log('✅ Invoice signature request sent:', response);
            return response;
        } catch (error) {
            console.error('❌ Error requesting invoice signature:', error);
            throw error;
        }
    },

    // Sprawdzenie statusu podpisu faktury
    getInvoiceSignatureStatus: async (invoiceId: string, sessionId: string): Promise<InvoiceSignatureStatusResponse> => {
        try {
            return await apiClient.get<InvoiceSignatureStatusResponse>(
                `/invoices/${invoiceId}/signature/${sessionId}/status`
            );
        } catch (error) {
            console.error('❌ Error getting invoice signature status:', error);
            throw error;
        }
    },

    // Anulowanie sesji podpisu faktury
    cancelInvoiceSignatureSession: async (invoiceId: string, sessionId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
        try {
            const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
            return await apiClient.delete(
                `/invoices/${invoiceId}/signature/${sessionId}${params}`
            );
        } catch (error) {
            console.error('❌ Error cancelling invoice signature session:', error);
            throw error;
        }
    },

    // Pobranie podpisanej faktury
    getSignedInvoice: async (invoiceId: string, sessionId: string): Promise<Blob> => {
        try {
            const response = await fetch(`${apiClient.getBaseUrl()}/invoices/${invoiceId}/signature/${sessionId}/signed-document`, {
                headers: {
                    'Authorization': `Bearer ${apiClient.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download signed invoice');
            }

            return await response.blob();
        } catch (error) {
            console.error('❌ Error downloading signed invoice:', error);
            throw error;
        }
    },

    // Pobranie obrazu podpisu
    getSignatureImage: async (invoiceId: string, sessionId: string): Promise<Blob> => {
        try {
            const response = await fetch(`${apiClient.getBaseUrl()}/invoices/${invoiceId}/signature/${sessionId}/signature-image`, {
                headers: {
                    'Authorization': `Bearer ${apiClient.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download signature image');
            }

            return await response.blob();
        } catch (error) {
            console.error('❌ Error downloading signature image:', error);
            throw error;
        }
    },

    // Pobranie aktualnej wersji faktury z głównego API dokumentów finansowych
    downloadCurrentInvoice: async (invoiceId: string): Promise<Blob> => {
        try {
            const response = await fetch(`${apiClient.getBaseUrl()}/financial-documents/${invoiceId}/attachment`, {
                headers: {
                    'Authorization': `Bearer ${apiClient.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download current invoice');
            }

            return await response.blob();
        } catch (error) {
            console.error('❌ Error downloading current invoice:', error);
            throw error;
        }
    },
};