// src/hooks/useInvoiceSignature.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import {
    invoiceSignatureApi,
    InvoiceSignatureFromVisitRequest,
    InvoiceSignatureStatusResponse,
    InvoiceSignatureStatus
} from '../api/invoiceSignatureApi';

interface UseInvoiceSignatureResult {
    // States
    isRequesting: boolean;
    isPolling: boolean;
    error: string | null;
    currentSession: string | null;
    currentInvoiceId: string | null;
    currentStatus: InvoiceSignatureStatusResponse | null;

    // Actions
    requestSignatureFromVisit: (request: InvoiceSignatureFromVisitRequest) => Promise<{ sessionId: string; invoiceId: string } | null>;
    startStatusPolling: (sessionId: string, invoiceId: string) => void;
    stopStatusPolling: () => void;
    cancelSignature: (sessionId: string, invoiceId: string, reason?: string) => Promise<boolean>;
    downloadSignedInvoice: (sessionId: string, invoiceId: string) => Promise<boolean>;
    downloadSignatureImage: (sessionId: string, invoiceId: string) => Promise<boolean>;
    downloadCurrentInvoice: (invoiceId: string) => Promise<boolean>;
    clearError: () => void;
    clearSession: () => void;
    isSignatureCompleted: boolean;
    isSignatureFailed: boolean;
}

/**
 * Production-ready hook for managing invoice signature workflow
 * Provides status polling and complete lifecycle management
 */
export const useInvoiceSignature = (): UseInvoiceSignatureResult => {
    const [isRequesting, setIsRequesting] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSession, setCurrentSession] = useState<string | null>(null);
    const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);
    const [currentStatus, setCurrentStatus] = useState<InvoiceSignatureStatusResponse | null>(null);

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isPollingActiveRef = useRef(false);

    // Derived states
    const isSignatureCompleted = currentStatus?.status === InvoiceSignatureStatus.COMPLETED;
    const isSignatureFailed = currentStatus?.status === InvoiceSignatureStatus.ERROR ||
        currentStatus?.status === InvoiceSignatureStatus.EXPIRED ||
        currentStatus?.status === InvoiceSignatureStatus.CANCELLED;

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            stopStatusPolling();
        };
    }, []);

    /**
     * Request signature from visit - initiates the signature process
     */
    const requestSignatureFromVisit = useCallback(async (request: InvoiceSignatureFromVisitRequest): Promise<{ sessionId: string; invoiceId: string } | null> => {
        try {
            setIsRequesting(true);
            setError(null);

            console.log('🔧 Requesting invoice signature from visit...', request);

            const response = await invoiceSignatureApi.requestInvoiceSignatureFromVisit(request);

            if (response.success) {
                setCurrentSession(response.sessionId);
                setCurrentInvoiceId(response.invoiceId);
                console.log('✅ Invoice signature requested successfully:', { sessionId: response.sessionId, invoiceId: response.invoiceId });
                return { sessionId: response.sessionId, invoiceId: response.invoiceId };
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

    /**
     * Poll status - checks signature status periodically
     */
    const pollStatus = useCallback(async (sessionId: string, invoiceId: string): Promise<void> => {
        if (!isPollingActiveRef.current) {
            return;
        }

        try {
            console.log('🔄 Polling invoice signature status...', { sessionId, invoiceId });

            const statusResponse = await invoiceSignatureApi.getInvoiceSignatureStatus(sessionId, invoiceId);
            setCurrentStatus(statusResponse);

            console.log('📊 Invoice signature status updated:', statusResponse.status);

            // Stop polling if signature is completed or failed
            if (statusResponse.status === InvoiceSignatureStatus.COMPLETED ||
                statusResponse.status === InvoiceSignatureStatus.ERROR ||
                statusResponse.status === InvoiceSignatureStatus.EXPIRED ||
                statusResponse.status === InvoiceSignatureStatus.CANCELLED) {

                console.log('🏁 Stopping status polling - final status:', statusResponse.status);
                stopStatusPolling();
            }
        } catch (err) {
            console.error('❌ Error polling signature status:', err);

            // Continue polling on network errors, but stop on authentication errors
            if (err instanceof Error && err.message.includes('401')) {
                setError('Sesja wygasła. Zaloguj się ponownie.');
                stopStatusPolling();
            }
        }
    }, []);

    /**
     * Start status polling - begins checking signature status periodically
     */
    const startStatusPolling = useCallback((sessionId: string, invoiceId: string): void => {
        console.log('▶️ Starting invoice signature status polling...', { sessionId, invoiceId });

        // Clear any existing polling
        stopStatusPolling();

        setIsPolling(true);
        isPollingActiveRef.current = true;
        setCurrentSession(sessionId);
        setCurrentInvoiceId(invoiceId);

        // Initial status check
        pollStatus(sessionId, invoiceId);

        // Set up polling interval (every 3 seconds)
        pollingIntervalRef.current = setInterval(() => {
            pollStatus(sessionId, invoiceId);
        }, 3000);
    }, [pollStatus]);

    /**
     * Stop status polling - stops checking signature status
     */
    const stopStatusPolling = useCallback((): void => {
        console.log('⏹️ Stopping invoice signature status polling...');

        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }

        isPollingActiveRef.current = false;
        setIsPolling(false);
    }, []);

    /**
     * Cancel signature session
     */
    const cancelSignature = useCallback(async (sessionId: string, invoiceId: string, reason?: string): Promise<boolean> => {
        try {
            setError(null);
            stopStatusPolling(); // Stop polling before cancelling

            console.log('🔧 Cancelling invoice signature session...', { sessionId, invoiceId, reason });

            const response = await invoiceSignatureApi.cancelInvoiceSignatureSession(sessionId, invoiceId, reason);

            if (response.success) {
                setCurrentSession(null);
                setCurrentInvoiceId(null);
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
    }, [stopStatusPolling]);

    /**
     * Download signed invoice
     */
    const downloadSignedInvoice = useCallback(async (sessionId: string, invoiceId: string): Promise<boolean> => {
        try {
            setError(null);

            console.log('🔧 Downloading signed invoice...', { sessionId, invoiceId });

            const blob = await invoiceSignatureApi.getSignedInvoice(sessionId, invoiceId);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `faktura-${invoiceId}-podpisana.pdf`;
            link.style.display = 'none';
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

    /**
     * Download signature image
     */
    const downloadSignatureImage = useCallback(async (sessionId: string, invoiceId: string): Promise<boolean> => {
        try {
            setError(null);

            console.log('🔧 Downloading signature image...', { sessionId, invoiceId });

            const blob = await invoiceSignatureApi.getSignatureImage(sessionId, invoiceId);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `podpis-${sessionId}.png`;
            link.style.display = 'none';
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

    /**
     * Download current invoice
     */
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
            link.style.display = 'none';
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

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Clear session and stop polling
     */
    const clearSession = useCallback(() => {
        stopStatusPolling();
        setCurrentSession(null);
        setCurrentInvoiceId(null);
        setCurrentStatus(null);
    }, [stopStatusPolling]);

    return {
        // States
        isRequesting,
        isPolling,
        error,
        currentSession,
        currentInvoiceId,
        currentStatus,

        // Actions
        requestSignatureFromVisit,
        startStatusPolling,
        stopStatusPolling,
        cancelSignature,
        downloadSignedInvoice,
        downloadSignatureImage,
        downloadCurrentInvoice,
        clearError,
        clearSession,

        // Derived states
        isSignatureCompleted,
        isSignatureFailed
    };
};