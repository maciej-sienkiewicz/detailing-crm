// src/hooks/useTablets.ts
import { useState, useEffect, useCallback } from 'react';
import { tabletsApi, TabletDevice, SignatureSession, PairingCodeResponse, TabletCredentials, CreateSignatureSessionRequest, SignatureSessionResponse } from '../api/tabletsApi';
import { getTenantUUID, getLocationUUID, generateWorkstationUUID, debugUUIDs } from '../utils/uuidHelper';

interface UseTabletsState {
    tablets: TabletDevice[];
    sessions: SignatureSession[];
    loading: boolean;
    error: string | null;
    realtimeStats: {
        connectedTablets: number;
        pendingSessions: number;
        completedToday: number;
        successRate: number;
    };
}

interface PairingState {
    isGenerating: boolean;
    pairingCode: PairingCodeResponse | null;
    error: string | null;
}

export const useTablets = () => {
    const [state, setState] = useState<UseTabletsState>({
        tablets: [],
        sessions: [],
        loading: true,
        error: null,
        realtimeStats: {
            connectedTablets: 0,
            pendingSessions: 0,
            completedToday: 0,
            successRate: 0
        }
    });

    const [pairingState, setPairingState] = useState<PairingState>({
        isGenerating: false,
        pairingCode: null,
        error: null
    });

    // Load initial data
    const loadData = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const [tablets, sessions] = await Promise.all([
                tabletsApi.getTablets(),
                tabletsApi.getSignatureSessions()
            ]);

            // Calculate realtime stats
            const connectedTablets = tablets.filter(t => t.isOnline).length;
            const pendingSessions = sessions.filter(s => s.status === 'PENDING' || s.status === 'SENT_TO_TABLET').length;

            const today = new Date().toDateString();
            const completedToday = sessions.filter(s =>
                s.status === 'SIGNED' && s.signedAt &&
                new Date(s.signedAt).toDateString() === today
            ).length;

            const totalCompletedSessions = sessions.filter(s => s.status === 'SIGNED' || s.status === 'EXPIRED').length;
            const successfulSessions = sessions.filter(s => s.status === 'SIGNED').length;
            const successRate = totalCompletedSessions > 0 ? (successfulSessions / totalCompletedSessions) * 100 : 0;

            setState({
                tablets,
                sessions,
                loading: false,
                error: null,
                realtimeStats: {
                    connectedTablets,
                    pendingSessions,
                    completedToday,
                    successRate: Math.round(successRate * 10) / 10
                }
            });
        } catch (error) {
            console.error('Error loading tablets data:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to load data'
            }));
        }
    }, []);

    // Generate pairing code
    const generatePairingCode = useCallback(async (tenantId?: string, locationId?: string, workstationId?: string) => {
        try {
            setPairingState({ isGenerating: true, pairingCode: null, error: null });

            console.log('🔧 Generating pairing code...');
            debugUUIDs();

            // Use proper UUIDs instead of hardcoded strings
            const finalTenantId = tenantId || getTenantUUID();
            const finalLocationId = locationId || getLocationUUID();
            const finalWorkstationId = workstationId || undefined; // Optional

            const request = {
                tenantId: finalTenantId,
                locationId: finalLocationId,
                workstationId: finalWorkstationId
            };

            console.log('📤 Pairing request:', request);

            const pairingCode = await tabletsApi.initiateTabletRegistration(request);

            setPairingState({
                isGenerating: false,
                pairingCode,
                error: null
            });

            console.log('✅ Pairing code generated:', pairingCode);
            return pairingCode;
        } catch (error) {
            console.error('❌ Error generating pairing code:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate pairing code';
            setPairingState({
                isGenerating: false,
                pairingCode: null,
                error: errorMessage
            });
            throw new Error(errorMessage);
        }
    }, []);

    // Complete pairing
    const completePairing = useCallback(async (code: string, deviceName: string): Promise<TabletCredentials> => {
        try {
            const credentials = await tabletsApi.completeTabletPairing({ code, deviceName });

            // Refresh data after successful pairing
            await loadData();

            // Clear pairing state
            setPairingState({
                isGenerating: false,
                pairingCode: null,
                error: null
            });

            return credentials;
        } catch (error) {
            console.error('Error completing pairing:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to complete pairing';
            setPairingState(prev => ({
                ...prev,
                error: errorMessage
            }));
            throw new Error(errorMessage);
        }
    }, [loadData]);

    // Create signature session
    const createSignatureSession = useCallback(async (request: CreateSignatureSessionRequest): Promise<SignatureSessionResponse> => {
        try {
            const response = await tabletsApi.createSignatureSession(request);

            // Refresh data after creating session
            await loadData();

            return response;
        } catch (error) {
            console.error('Error creating signature session:', error);
            throw error;
        }
    }, [loadData]);

    // Retry signature session
    const retrySignatureSession = useCallback(async (sessionId: string): Promise<SignatureSessionResponse> => {
        try {
            const response = await tabletsApi.retrySignatureSession(sessionId);

            // Refresh data after retry
            await loadData();

            return response;
        } catch (error) {
            console.error('Error retrying signature session:', error);
            throw error;
        }
    }, [loadData]);

    // Cancel signature session
    const cancelSignatureSession = useCallback(async (sessionId: string) => {
        try {
            const response = await tabletsApi.cancelSignatureSession(sessionId);

            if (response.success) {
                // Refresh data after cancellation
                await loadData();
            }

            return response;
        } catch (error) {
            console.error('Error cancelling signature session:', error);
            throw error;
        }
    }, [loadData]);

    // Test tablet
    const testTablet = useCallback(async (tabletId: string) => {
        try {
            const response = await tabletsApi.testTablet(tabletId);
            return response;
        } catch (error) {
            console.error('Error testing tablet:', error);
            throw error;
        }
    }, []);

    // Clear pairing state
    const clearPairingState = useCallback(() => {
        setPairingState({
            isGenerating: false,
            pairingCode: null,
            error: null
        });
    }, []);

    // Refresh data
    const refresh = useCallback(() => {
        return loadData();
    }, [loadData]);

    // Load data on mount
    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        // Data
        tablets: state.tablets,
        sessions: state.sessions,
        realtimeStats: state.realtimeStats,
        loading: state.loading,
        error: state.error,

        // Pairing
        pairingCode: pairingState.pairingCode,
        isPairingCodeGenerating: pairingState.isGenerating,
        pairingError: pairingState.error,

        // Actions
        generatePairingCode,
        completePairing,
        clearPairingState,
        createSignatureSession,
        retrySignatureSession,
        cancelSignatureSession,
        testTablet,
        refresh,
        loadData
    };
};