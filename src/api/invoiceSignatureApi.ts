// src/api/invoiceSignatureApi.ts
import { apiClientNew } from './apiClientNew';

export interface InvoiceSignatureFromVisitRequest {
    visitId: string;
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
    documentPreviewUrl?: string;
}

export interface InvoiceSignatureStatusResponse {
    success: boolean;
    sessionId: string;
    invoiceId: string;
    status: InvoiceSignatureStatus;
    signedAt?: string;
    signedInvoiceUrl?: string;
    signatureImageUrl?: string;
    timestamp: string;
}

export enum InvoiceSignatureStatus {
    PENDING = 'PENDING',
    SENT_TO_TABLET = 'SENT_TO_TABLET',
    VIEWING_INVOICE = 'VIEWING_INVOICE',
    SIGNING_IN_PROGRESS = 'SIGNING_IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
    ERROR = 'ERROR'
}

export interface CancelInvoiceSignatureRequest {
    reason?: string;
}

/**
 * Production-ready Invoice Signature API
 * Handles all invoice signature operations with proper error handling and status polling
 */
export const invoiceSignatureApi = {
    /**
     * Request invoice signature from visit
     * Uses the new backend endpoint that matches the controller structure
     */
    requestInvoiceSignatureFromVisit: async (request: InvoiceSignatureFromVisitRequest): Promise<InvoiceSignatureResponse> => {
        try {
            console.log('🔧 Requesting invoice signature from visit...', request);

            const response = await apiClientNew.post<InvoiceSignatureResponse>(
                `/invoice-signatures/request-from-visit`,
                request,
                { timeout: 30000 }
            );

            console.log('✅ Invoice signature request sent:', response);
            return response;
        } catch (error) {
            console.error('❌ Error requesting invoice signature:', error);
            throw error;
        }
    },

    /**
     * Get invoice signature status with polling support
     * This method should be called repeatedly to track signature progress
     */
    getInvoiceSignatureStatus: async (sessionId: string, invoiceId: string): Promise<InvoiceSignatureStatusResponse> => {
        try {
            const response = await apiClientNew.get<InvoiceSignatureStatusResponse>(
                `/invoice-signatures/sessions/${sessionId}/status`,
                { invoiceId },
                { timeout: 15000 }
            );

            return response;
        } catch (error) {
            console.error('❌ Error getting invoice signature status:', error);
            throw error;
        }
    },

    /**
     * Cancel invoice signature session
     */
    cancelInvoiceSignatureSession: async (
        sessionId: string,
        invoiceId: string,
        reason?: string
    ): Promise<{ success: boolean; message: string; timestamp: string }> => {
        try {
            console.log('🔧 Cancelling invoice signature session...', { sessionId, invoiceId, reason });

            const response = await apiClientNew.post<{ success: boolean; message: string; timestamp: string }>(
                `/invoice-signatures/sessions/${sessionId}/cancel`,
                { reason },
                {
                    timeout: 15000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Invoice signature session cancelled:', response);
            return response;
        } catch (error) {
            console.error('❌ Error cancelling invoice signature session:', error);
            throw error;
        }
    },

    /**
     * Download signed invoice document
     */
    getSignedInvoice: async (sessionId: string, invoiceId: string): Promise<Blob> => {
        try {
            console.log('🔧 Downloading signed invoice...', { sessionId, invoiceId });

            const response = await fetch(
                `${apiClientNew['baseUrl']}/invoice-signatures/sessions/${sessionId}/signed-document?invoiceId=${encodeURIComponent(invoiceId)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'Accept': 'application/pdf'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            console.log('✅ Signed invoice downloaded successfully');

            return blob;
        } catch (error) {
            console.error('❌ Error downloading signed invoice:', error);
            throw error;
        }
    },

    /**
     * Download signature image
     */
    getSignatureImage: async (sessionId: string, invoiceId: string): Promise<Blob> => {
        try {
            console.log('🔧 Downloading signature image...', { sessionId, invoiceId });

            const response = await fetch(
                `${apiClientNew['baseUrl']}/invoice-signatures/sessions/${sessionId}/signature-image?invoiceId=${encodeURIComponent(invoiceId)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'Accept': 'image/png'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            console.log('✅ Signature image downloaded successfully');

            return blob;
        } catch (error) {
            console.error('❌ Error downloading signature image:', error);
            throw error;
        }
    },

    /**
     * Download current invoice from financial documents API
     */
    downloadCurrentInvoice: async (invoiceId: string): Promise<Blob> => {
        try {
            console.log('🔧 Downloading current invoice...', invoiceId);

            const response = await fetch(
                `${apiClientNew['baseUrl']}/financial-documents/${invoiceId}/attachment`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'Accept': 'application/pdf'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            console.log('✅ Current invoice downloaded successfully');

            return blob;
        } catch (error) {
            console.error('❌ Error downloading current invoice:', error);
            throw error;
        }
    }
};