import {apiClientNew} from './apiClientNew';

export interface CreateServiceCommand {
    name: string;
    price: number;
    quantity?: number;
    discountType?: 'PERCENTAGE' | 'FIXED_PRICE' | 'AMOUNT' | null;
    discountValue?: number | null;
    finalPrice?: number | null;
    approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
    note?: string | null;
}

export interface InvoiceSignatureFromVisitRequest {
    visitId: string;
    tabletId: string;
    customerName: string;
    signatureTitle?: string;
    instructions?: string;
    timeoutMinutes?: number;
    paymentMethod?: 'cash' | 'card' | 'transfer';
    overridenItems?: CreateServiceCommand[];
    paymentDays?: number;
}

export interface InvoiceGenerationFromVisitRequest {
    visitId: string;
    overridenItems?: CreateServiceCommand[];
    paymentDays?: number;
    paymentMethod?: string;
    invoiceTitle?: string;
    notes?: string;
}

export interface InvoiceSignatureResponse {
    success: boolean;
    sessionId: string;
    message: string;
    invoiceId: string;
    expiresAt: string;
    documentPreviewUrl?: string;
}

export interface InvoiceGenerationResponse {
    success: boolean;
    invoiceId: string;
    message: string;
    documentUrl?: string;
    timestamp: string;
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

export const invoiceSignatureApi = {
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

    generateInvoiceFromVisit: async (request: InvoiceGenerationFromVisitRequest): Promise<InvoiceGenerationResponse> => {
        try {
            console.log('🔧 Generating invoice from visit without signature...', request);

            const response = await apiClientNew.post<InvoiceGenerationResponse>(
                `/financial-documents/generate-from-visit`,
                request,
                { timeout: 30000 }
            );

            console.log('✅ Invoice generated successfully:', response);
            return response;
        } catch (error) {
            console.error('❌ Error generating invoice from visit:', error);
            throw error;
        }
    },

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