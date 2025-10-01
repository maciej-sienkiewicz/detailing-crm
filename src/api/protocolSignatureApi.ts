// src/api/protocolSignatureApi.ts
import {apiClient} from './apiClient';

export interface ProtocolSignatureRequest {
    protocolId: number;
    tabletId: string;
    customerName: string;
    instructions?: string;
    timeoutMinutes?: number;
}

export interface ProtocolSignatureResponse {
    success: boolean;
    sessionId: string;
    message: string;
    expiresAt: string;
    protocolId: number;
    documentPreviewUrl?: string;
}

export interface ProtocolSignatureStatusResponse {
    success: boolean;
    sessionId: string;
    status: 'PENDING' | 'GENERATING_PDF' | 'SENT_TO_TABLET' | 'VIEWING_DOCUMENT' | 'SIGNING_IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED' | 'ERROR';
    protocolId: number;
    signedAt?: string;
    signedDocumentUrl?: string;
    signatureImageUrl?: string;
    timestamp: string;
}

export const protocolSignatureApi = {
    // Wysłanie żądania podpisu protokołu
    requestProtocolSignature: async (request: ProtocolSignatureRequest): Promise<ProtocolSignatureResponse> => {
        try {

            const response = await apiClient.postNotCamel<ProtocolSignatureResponse>('/protocol-signatures/request', request);
            return response;
        } catch (error) {
            console.error('❌ Error requesting protocol signature:', error);
            throw error;
        }
    },

    // Sprawdzenie statusu podpisu
    getSignatureStatus: async (sessionId: string): Promise<ProtocolSignatureStatusResponse> => {
        try {
            return await apiClient.getNot<ProtocolSignatureStatusResponse>(`/protocol-signatures/sessions/${sessionId}/status`);
        } catch (error) {
            console.error('❌ Error getting signature status:', error);
            throw error;
        }
    },

    // Anulowanie sesji podpisu
    cancelSignatureSession: async (sessionId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
        try {
            return await apiClient.postNotCamel(`/protocol-signatures/sessions/${sessionId}/cancel`, { reason });
        } catch (error) {
            console.error('❌ Error cancelling signature session:', error);
            throw error;
        }
    },

    // Pobranie podpisanego dokumentu
    getSignedDocument: async (sessionId: string): Promise<Blob> => {
        try {
            const response = await fetch(`${apiClient.getBaseUrl()}/protocol-signatures/sessions/${sessionId}/signed-document`, {
                headers: {
                    'Authorization': `Bearer ${apiClient.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download signed document');
            }

            return await response.blob();
        } catch (error) {
            console.error('❌ Error downloading signed document:', error);
            throw error;
        }
    }
};