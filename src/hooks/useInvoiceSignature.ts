import { useState, useCallback, useRef, useEffect } from 'react';
import {
    invoiceSignatureApi,
    InvoiceSignatureFromVisitRequest,
    InvoiceGenerationFromVisitRequest,
    InvoiceSignatureStatusResponse,
    InvoiceGenerationResponse,
    InvoiceSignatureStatus
} from '../api/invoiceSignatureApi';

interface UseInvoiceSignatureResult {
    isRequesting: boolean;
    isPolling: boolean;
    isGenerating: boolean;
    error: string | null;
    currentSession: string | null;
    currentInvoiceId: string | null;
    currentStatus: InvoiceSignatureStatusResponse | null;
    requestSignatureFromVisit: (request: InvoiceSignatureFromVisitRequest) => Promise<{ sessionId: string; invoiceId: string } | null>;
    generateInvoiceFromVisit: (request: InvoiceGenerationFromVisitRequest) => Promise<{ invoiceId: string } | null>;
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

export const useInvoiceSignature = (): UseInvoiceSignatureResult => {
    const [isRequesting, setIsRequesting] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSession, setCurrentSession] = useState<string | null>(null);
    const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);
    const [currentStatus, setCurrentStatus] = useState<InvoiceSignatureStatusResponse | null>(null);

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isPollingActiveRef = useRef(false);

    const isSignatureCompleted = currentStatus?.status === InvoiceSignatureStatus.COMPLETED;
    const isSignatureFailed = currentStatus?.status === InvoiceSignatureStatus.ERROR ||
        currentStatus?.status === InvoiceSignatureStatus.EXPIRED ||
        currentStatus?.status === InvoiceSignatureStatus.CANCELLED;

    useEffect(() => {
        return () => {
            stopStatusPolling();
        };
    }, []);

    const requestSignatureFromVisit = useCallback(async (request: InvoiceSignatureFromVisitRequest): Promise<{ sessionId: string; invoiceId: string } | null> => {
        try {
            setIsRequesting(true);
            setError(null);

            console.log('🔧 Requesting invoice signature from visit with enhanced data...', {
                visitId: request.visitId,
                tabletId: request.tabletId,
                customerName: request.customerName,
                paymentMethod: request.paymentMethod,
                paymentDays: request.paymentDays,
                overridenItems: request.overridenItems ? `${request.overridenItems.length} items` : 'none',
                signatureTitle: request.signatureTitle,
                timeoutMinutes: request.timeoutMinutes
            });

            if (!request.visitId || !request.tabletId || !request.customerName) {
                throw new Error('Wymagane pola: visitId, tabletId, customerName');
            }

            if (request.paymentMethod) {
                console.log('💳 Payment method included:', request.paymentMethod);
            }

            if (request.paymentDays && request.paymentMethod === 'transfer') {
                console.log('📅 Payment days for transfer:', request.paymentDays);
            }

            if (request.overridenItems && request.overridenItems.length > 0) {
                console.log('📋 Overridden items included:', {
                    count: request.overridenItems.length,
                    totalValue: request.overridenItems.reduce((sum, item) => sum + (item.finalPrice || item.price), 0)
                });
            }

            const response = await invoiceSignatureApi.requestInvoiceSignatureFromVisit(request);

            if (response.success) {
                setCurrentSession(response.sessionId);
                setCurrentInvoiceId(response.invoiceId);
                console.log('✅ Invoice signature request successful:', {
                    sessionId: response.sessionId,
                    invoiceId: response.invoiceId,
                    includesPaymentData: !!(request.paymentMethod || request.overridenItems || request.paymentDays)
                });
                return { sessionId: response.sessionId, invoiceId: response.invoiceId };
            } else {
                setError(response.message || 'Nie udało się wysłać żądania podpisu faktury');
                return null;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się wysłać żądania podpisu faktury';
            console.error('❌ Error requesting invoice signature:', err);

            if (request.paymentMethod || request.overridenItems) {
                console.error('❌ Request included payment data:', {
                    paymentMethod: request.paymentMethod,
                    paymentDays: request.paymentDays,
                    overridenItemsCount: request.overridenItems?.length || 0
                });
            }

            setError(errorMessage);
            return null;
        } finally {
            setIsRequesting(false);
        }
    }, []);

    const generateInvoiceFromVisit = useCallback(async (request: InvoiceGenerationFromVisitRequest): Promise<{ invoiceId: string } | null> => {
        try {
            setIsGenerating(true);
            setError(null);

            console.log('🔧 Generating invoice from visit without signature...', {
                visitId: request.visitId,
                paymentMethod: request.paymentMethod,
                paymentDays: request.paymentDays,
                overridenItems: request.overridenItems ? `${request.overridenItems.length} items` : 'none',
                invoiceTitle: request.invoiceTitle,
                notes: request.notes
            });

            if (!request.visitId) {
                throw new Error('Wymagane pole: visitId');
            }

            if (request.paymentMethod) {
                console.log('💳 Payment method for invoice:', request.paymentMethod);
            }

            if (request.paymentDays) {
                console.log('📅 Payment days for invoice:', request.paymentDays);
            }

            if (request.overridenItems && request.overridenItems.length > 0) {
                console.log('📋 Overridden items for invoice:', {
                    count: request.overridenItems.length,
                    totalValue: request.overridenItems.reduce((sum, item) => sum + (item.finalPrice || item.price), 0)
                });
            }

            const response = await invoiceSignatureApi.generateInvoiceFromVisit(request);

            if (response.success) {
                setCurrentInvoiceId(response.invoiceId);
                console.log('✅ Invoice generation successful:', {
                    invoiceId: response.invoiceId,
                    includesPaymentData: !!(request.paymentMethod || request.overridenItems || request.paymentDays)
                });
                return { invoiceId: response.invoiceId };
            } else {
                setError(response.message || 'Nie udało się wygenerować faktury');
                return null;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się wygenerować faktury';
            console.error('❌ Error generating invoice from visit:', err);

            if (request.paymentMethod || request.overridenItems) {
                console.error('❌ Invoice generation request included payment data:', {
                    paymentMethod: request.paymentMethod,
                    paymentDays: request.paymentDays,
                    overridenItemsCount: request.overridenItems?.length || 0
                });
            }

            setError(errorMessage);
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const pollStatus = useCallback(async (sessionId: string, invoiceId: string): Promise<void> => {
        if (!isPollingActiveRef.current) {
            return;
        }

        try {
            console.log('🔄 Polling invoice signature status...', { sessionId, invoiceId });

            const statusResponse = await invoiceSignatureApi.getInvoiceSignatureStatus(sessionId, invoiceId);
            setCurrentStatus(statusResponse);

            console.log('📊 Invoice signature status updated:', statusResponse.status);

            if (statusResponse.status === InvoiceSignatureStatus.COMPLETED ||
                statusResponse.status === InvoiceSignatureStatus.ERROR ||
                statusResponse.status === InvoiceSignatureStatus.EXPIRED ||
                statusResponse.status === InvoiceSignatureStatus.CANCELLED) {

                console.log('🏁 Stopping status polling - final status:', statusResponse.status);
                stopStatusPolling();
            }
        } catch (err) {
            console.error('❌ Error polling signature status:', err);

            if (err instanceof Error && err.message.includes('401')) {
                setError('Sesja wygasła. Zaloguj się ponownie.');
                stopStatusPolling();
            }
        }
    }, []);

    const startStatusPolling = useCallback((sessionId: string, invoiceId: string): void => {
        console.log('▶️ Starting invoice signature status polling...', { sessionId, invoiceId });

        stopStatusPolling();

        setIsPolling(true);
        isPollingActiveRef.current = true;
        setCurrentSession(sessionId);
        setCurrentInvoiceId(invoiceId);

        pollStatus(sessionId, invoiceId);

        pollingIntervalRef.current = setInterval(() => {
            pollStatus(sessionId, invoiceId);
        }, 3000);
    }, [pollStatus]);

    const stopStatusPolling = useCallback((): void => {
        console.log('⏹️ Stopping invoice signature status polling...');

        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }

        isPollingActiveRef.current = false;
        setIsPolling(false);
    }, []);

    const cancelSignature = useCallback(async (sessionId: string, invoiceId: string, reason?: string): Promise<boolean> => {
        try {
            setError(null);
            stopStatusPolling();

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

    const downloadSignedInvoice = useCallback(async (sessionId: string, invoiceId: string): Promise<boolean> => {
        try {
            setError(null);

            console.log('🔧 Downloading signed invoice...', { sessionId, invoiceId });

            const blob = await invoiceSignatureApi.getSignedInvoice(sessionId, invoiceId);

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

    const downloadSignatureImage = useCallback(async (sessionId: string, invoiceId: string): Promise<boolean> => {
        try {
            setError(null);

            console.log('🔧 Downloading signature image...', { sessionId, invoiceId });

            const blob = await invoiceSignatureApi.getSignatureImage(sessionId, invoiceId);

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

    const downloadCurrentInvoice = useCallback(async (invoiceId: string): Promise<boolean> => {
        try {
            setError(null);

            console.log('🔧 Downloading current invoice...', invoiceId);

            const blob = await invoiceSignatureApi.downloadCurrentInvoice(invoiceId);

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

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const clearSession = useCallback(() => {
        stopStatusPolling();
        setCurrentSession(null);
        setCurrentInvoiceId(null);
        setCurrentStatus(null);
    }, [stopStatusPolling]);

    return {
        isRequesting,
        isPolling,
        isGenerating,
        error,
        currentSession,
        currentInvoiceId,
        currentStatus,
        requestSignatureFromVisit,
        generateInvoiceFromVisit,
        startStatusPolling,
        stopStatusPolling,
        cancelSignature,
        downloadSignedInvoice,
        downloadSignatureImage,
        downloadCurrentInvoice,
        clearError,
        clearSession,
        isSignatureCompleted,
        isSignatureFailed
    };
};