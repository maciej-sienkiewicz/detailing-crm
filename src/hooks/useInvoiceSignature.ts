// src/hooks/useInvoiceSignature.ts
import { useState, useCallback } from 'react';
import { invoiceSignatureApi, InvoiceSignatureRequest, InvoiceSignatureStatusResponse } from '../api/invoiceSignatureApi';

interface UseInvoiceSignatureResult {
    // Stan
    isRequesting: boolean;
    isPolling: boolean;
    error: string | null;
    currentSession: string | null;
    currentStatus: InvoiceSignatureStatusResponse | null;

    // Akcje
    requestSignature: (invoiceId: string, request: InvoiceSignatureRequest) => Promise<string | null>;
    cancelSignature: (invoiceId: string, sessionId: string, reason?: string) => Promise<boolean>;
    downloadSignedInvoice: (invoiceId: string, sessionId: string) => Promise<boolean>;
    downloadSignatureImage: (invoiceId: string, sessionId: string) => Promise<boolean>;
    downloadCurrentInvoice: (invoiceId: string) => Promise<boolean>;
    clearError: () => void;
    clearSession: () => void;
}

export const useInvoiceSignature = (): UseInvoiceSignatureResult => {
    const [isRequesting, setIsRequesting] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSession, setCurrentSession] = useState<string | null>(null);
    const [currentStatus, setCurrentStatus] = useState<InvoiceSignatureStatusResponse | null>(null);

    const requestSignature = useCallback(async (invoiceId: string, request: InvoiceSignatureRequest): Promise<string | null> => {
        try {
            setIsRequesting(true);
            setError(null);

            console.log('🔧 Requesting invoice signature...', { invoiceId, request });

            const response = await invoiceSignatureApi.requestInvoiceSignature(invoiceId, request);

            if (response.success) {
                setCurrentSession(response.sessionId);
                console.log('✅ Invoice signature requested successfully:', response.sessionId);
                return response.sessionId;
            } else {
                setError(response.message || 'Nie udało się wysłać żądania podpisu faktury');
                return null;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się wysłać żądania podpisu faktury';
            console.error('❌ Error requesting invoice signature:', err);
            setError(errorMessage);
            return null;
        } finally {
            setIsRequesting(false);
        }
    }, []);

    const cancelSignature = useCallback(async (invoiceId: string, sessionId: string, reason?: string): Promise<boolean> => {
        try {
            setError(null);

            console.log('🔧 Cancelling invoice signature session...', { invoiceId, sessionId });

            const response = await invoiceSignatureApi.cancelInvoiceSignatureSession(invoiceId, sessionId, reason);

            if (response.success) {
                setCurrentSession(null);
                setCurrentStatus(null);
                console.log('✅ Invoice signature session cancelled successfully');
                return true;
            } else {
                setError('Nie udało się anulować żądania podpisu faktury');
                return false;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się anulować żądania podpisu faktury';
            console.error('❌ Error cancelling invoice signature session:', err);
            setError(errorMessage);
            return false;
        }
    }, []);

    const downloadSignedInvoice = useCallback(async (invoiceId: string, sessionId: string): Promise<boolean> => {
        try {
            setError(null);

            console.log('🔧 Downloading signed invoice...', { invoiceId, sessionId });

            const blob = await invoiceSignatureApi.getSignedInvoice(invoiceId, sessionId);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `faktura-${invoiceId}-podpisana.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log('✅ Signed invoice downloaded successfully');
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się pobrać podpisanej faktury';
            console.error('❌ Error downloading signed invoice:', err);
            setError(errorMessage);
            return false;
        }
    }, []);

    const downloadSignatureImage = useCallback(async (invoiceId: string, sessionId: string): Promise<boolean> => {
        try {
            setError(null);

            console.log('🔧 Downloading signature image...', { invoiceId, sessionId });

            const blob = await invoiceSignatureApi.getSignatureImage(invoiceId, sessionId);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `podpis-${sessionId}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log('✅ Signature image downloaded successfully');
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się pobrać obrazu podpisu';
            console.error('❌ Error downloading signature image:', err);
            setError(errorMessage);
            return false;
        }
    }, []);

    const downloadCurrentInvoice = useCallback(async (invoiceId: string): Promise<boolean> => {
        try {
            setError(null);

            console.log('🔧 Downloading current invoice...', invoiceId);

            const blob = await invoiceSignatureApi.downloadCurrentInvoice(invoiceId);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `faktura-${invoiceId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log('✅ Current invoice downloaded successfully');
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się pobrać faktury';
            console.error('❌ Error downloading current invoice:', err);
            setError(errorMessage);
            return false;
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const clearSession = useCallback(() => {
        setCurrentSession(null);
        setCurrentStatus(null);
    }, []);

    return {
        // Stan
        isRequesting,
        isPolling,
        error,
        currentSession,
        currentStatus,

        // Akcje
        requestSignature,
        cancelSignature,
        downloadSignedInvoice,
        downloadSignatureImage,
        downloadCurrentInvoice,
        clearError,
        clearSession
    };
};