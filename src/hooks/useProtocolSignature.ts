// src/hooks/useProtocolSignature.ts
import {useCallback, useState} from 'react';
import {
    protocolSignatureApi,
    ProtocolSignatureRequest,
    ProtocolSignatureStatusResponse
} from '../api/protocolSignatureApi';

interface UseProtocolSignatureResult {
    // Stan
    isRequesting: boolean;
    isPolling: boolean;
    error: string | null;
    currentSession: string | null;
    currentStatus: ProtocolSignatureStatusResponse | null;

    // Akcje
    requestSignature: (request: ProtocolSignatureRequest) => Promise<string | null>;
    cancelSignature: (sessionId: string, reason?: string) => Promise<boolean>;
    downloadSignedDocument: (sessionId: string, protocolId: number) => Promise<boolean>;
    clearError: () => void;
    clearSession: () => void;
}

export const useProtocolSignature = (): UseProtocolSignatureResult => {
    const [isRequesting, setIsRequesting] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSession, setCurrentSession] = useState<string | null>(null);
    const [currentStatus, setCurrentStatus] = useState<ProtocolSignatureStatusResponse | null>(null);

    const requestSignature = useCallback(async (request: ProtocolSignatureRequest): Promise<string | null> => {
        try {
            setIsRequesting(true);
            setError(null);

            const response = await protocolSignatureApi.requestProtocolSignature(request);

            if (response.success) {
                setCurrentSession(response.sessionId);
                return response.sessionId;
            } else {
                setError(response.message || 'Nie udało się wysłać żądania podpisu');
                return null;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się wysłać żądania podpisu';
            console.error('❌ Error requesting protocol signature:', err);
            setError(errorMessage);
            return null;
        } finally {
            setIsRequesting(false);
        }
    }, []);

    const cancelSignature = useCallback(async (sessionId: string, reason?: string): Promise<boolean> => {
        try {
            setError(null);

            const response = await protocolSignatureApi.cancelSignatureSession(sessionId, reason);

            if (response.success) {
                setCurrentSession(null);
                setCurrentStatus(null);
                return true;
            } else {
                setError('Nie udało się anulować żądania podpisu');
                return false;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się anulować żądania podpisu';
            console.error('❌ Error cancelling signature session:', err);
            setError(errorMessage);
            return false;
        }
    }, []);

    const downloadSignedDocument = useCallback(async (sessionId: string, protocolId: number): Promise<boolean> => {
        try {
            setError(null);

            const blob = await protocolSignatureApi.getSignedDocument(sessionId);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `protokol-${protocolId}-podpisany.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się pobrać podpisanego dokumentu';
            console.error('❌ Error downloading signed document:', err);
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
        downloadSignedDocument,
        clearError,
        clearSession
    };
};