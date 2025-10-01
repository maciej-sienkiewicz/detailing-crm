// src/hooks/useTablets.ts
import {useCallback, useEffect, useState} from 'react';
import {
    CreateSignatureSessionRequest,
    PairingCodeResponse,
    SignatureSession,
    TabletDevice,
    tabletsApi
} from '../api/tabletsApi';

interface RealtimeStats {
    connectedTablets: number;
}

interface UseTabletsResult {
    tablets: TabletDevice[];
    sessions: SignatureSession[];
    realtimeStats: RealtimeStats;
    loading: boolean;
    error: string | null;

    // Pairing state
    pairingCode: PairingCodeResponse | null;
    isPairingCodeGenerating: boolean;
    pairingError: string | null;

    // Actions
    refreshData: () => Promise<void>;
    generatePairingCode: () => Promise<PairingCodeResponse>;
    clearPairingState: () => void;
    createSignatureSession: (request: CreateSignatureSessionRequest) => Promise<any>;
    retrySignatureSession: (sessionId: string) => Promise<void>;
    cancelSignatureSession: (sessionId: string) => Promise<void>;
    testTablet: (tabletId: string) => Promise<{ success: boolean; message: string }>;
    getTabletStatus: (tabletId: string) => Promise<any>;
    disconnectTablet: (tabletId: string) => Promise<{ success: boolean; message: string }>;
    unpairTablet: (tabletId: string) => Promise<{ success: boolean; message: string }>;
}

export const useTablets = (): UseTabletsResult => {
    const [tablets, setTablets] = useState<TabletDevice[]>([]);
    const [sessions, setSessions] = useState<SignatureSession[]>([]);
    const [realtimeStats, setRealtimeStats] = useState<RealtimeStats>({
        connectedTablets: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pairing state
    const [pairingCode, setPairingCode] = useState<PairingCodeResponse | null>(null);
    const [isPairingCodeGenerating, setIsPairingCodeGenerating] = useState(false);
    const [pairingError, setPairingError] = useState<string | null>(null);

    // Calculate realtime stats from current data
    const calculateRealtimeStats = useCallback((tabletsData: TabletDevice[]): RealtimeStats => {
        const connectedTablets = tabletsData.filter(t => t.isOnline).length;

        // Calculate today's completed sessions
        const today = new Date().toDateString();
        return {
            connectedTablets,
        };
    }, []);

    // Fetch all data
    const refreshData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch tablets and sessions in parallel
            const [tabletsData] = await Promise.all([
                tabletsApi.getTablets(),
            ]);

            setTablets(tabletsData);

            // Calculate and set realtime stats
            const stats = calculateRealtimeStats(tabletsData);
            setRealtimeStats(stats);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
            console.error('❌ Error refreshing data:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [calculateRealtimeStats]);

    // Generate pairing code
    const generatePairingCode = useCallback(async (): Promise<PairingCodeResponse> => {
        try {
            setIsPairingCodeGenerating(true);
            setPairingError(null);

            const response = await tabletsApi.generatePairingCode();
            setPairingCode(response);

            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate pairing code';
            console.error('❌ Error generating pairing code:', err);
            setPairingError(errorMessage);
            throw err;
        } finally {
            setIsPairingCodeGenerating(false);
        }
    }, []);

    // Clear pairing state
    const clearPairingState = useCallback(() => {
        setPairingCode(null);
        setPairingError(null);
        setIsPairingCodeGenerating(false);
    }, []);

    // Create signature session
    const createSignatureSession = useCallback(async (request: CreateSignatureSessionRequest) => {
        try {

            const response = await tabletsApi.createSignatureSession(request);

            // Update stats
            const stats = calculateRealtimeStats(tablets);
            setRealtimeStats(stats);

            return response;
        } catch (err) {
            console.error('❌ Error creating signature session:', err);
            throw err;
        }
    }, [tablets, calculateRealtimeStats]);

    // Retry signature session
    const retrySignatureSession = useCallback(async (sessionId: string) => {
        try {

            await tabletsApi.retrySignatureSession(sessionId);

            // Refresh data after retry
            await refreshData();
        } catch (err) {
            console.error('❌ Error retrying signature session:', err);
            throw err;
        }
    }, [refreshData]);

    // Cancel signature session
    const cancelSignatureSession = useCallback(async (sessionId: string) => {
        try {

            await tabletsApi.cancelSignatureSession(sessionId);

            // Refresh data after cancellation
            await refreshData();
        } catch (err) {
            console.error('❌ Error cancelling signature session:', err);
            throw err;
        }
    }, [refreshData]);

    // Test tablet
    const testTablet = useCallback(async (tabletId: string) => {
        try {

            const result = await tabletsApi.testTablet(tabletId);

            return result;
        } catch (err) {
            console.error('❌ Error testing tablet:', err);
            return { success: false, message: 'Failed to test tablet' };
        }
    }, []);

    // Get tablet status
    const getTabletStatus = useCallback(async (tabletId: string) => {
        try {
            return await tabletsApi.getTabletStatus(tabletId);
        } catch (err) {
            console.error('❌ Error getting tablet status:', err);
            throw err;
        }
    }, []);

    // Disconnect tablet
    const disconnectTablet = useCallback(async (tabletId: string) => {
        try {

            const result = await tabletsApi.disconnectTablet(tabletId);

            // Refresh data after disconnection
            await refreshData();

            return result;
        } catch (err) {
            console.error('❌ Error disconnecting tablet:', err);
            return { success: false, message: 'Failed to disconnect tablet' };
        }
    }, [refreshData]);

    // Unpair tablet
    const unpairTablet = useCallback(async (tabletId: string) => {
        try {

            const result = await tabletsApi.unpairTablet(tabletId);

            // Refresh data after unpairing
            await refreshData();

            return result;
        } catch (err) {
            console.error('❌ Error unpairing tablet:', err);
            return { success: false, message: 'Failed to unpair tablet' };
        }
    }, [refreshData]);

    // Initial data load
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // Auto-refresh data every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
        }, 30000);

        return () => clearInterval(interval);
    }, [refreshData]);

    return {
        tablets,
        sessions,
        realtimeStats,
        loading,
        error,

        // Pairing state
        pairingCode,
        isPairingCodeGenerating,
        pairingError,

        // Actions
        refreshData,
        generatePairingCode,
        clearPairingState,
        createSignatureSession,
        retrySignatureSession,
        cancelSignatureSession,
        testTablet,
        getTabletStatus,
        disconnectTablet,
        unpairTablet
    };
};