// src/hooks/useClientAnalytics.ts
import { useState, useEffect, useCallback } from 'react';
import {
    clientAnalyticsApi,
    ClientAnalyticsResponse,
    ClientAnalyticsSummaryResponse,
    CompanyAveragesResponse
} from '../api/clientAnalyticsApi';

// ========================================================================================
// COMPREHENSIVE ANALYTICS HOOK
// ========================================================================================

interface UseClientAnalyticsResult {
    analytics: ClientAnalyticsResponse | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useClientAnalytics = (clientId?: string): UseClientAnalyticsResult => {
    const [analytics, setAnalytics] = useState<ClientAnalyticsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        if (!clientId) {
            setAnalytics(null);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await clientAnalyticsApi.getClientAnalytics(clientId);
            setAnalytics(data);
        } catch (err) {
            console.error('❌ Failed to load analytics:', err);
            setError(err instanceof Error ? err.message : 'Błąd podczas ładowania analiz');
            setAnalytics(null);
        } finally {
            setLoading(false);
        }
    }, [clientId]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return {
        analytics,
        loading,
        error,
        refetch: fetchAnalytics
    };
};

// ========================================================================================
// SUMMARY ANALYTICS HOOK
// ========================================================================================

interface UseClientAnalyticsSummaryResult {
    summary: ClientAnalyticsSummaryResponse | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useClientAnalyticsSummary = (clientId?: string): UseClientAnalyticsSummaryResult => {
    const [summary, setSummary] = useState<ClientAnalyticsSummaryResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        if (!clientId) {
            setSummary(null);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await clientAnalyticsApi.getClientAnalyticsSummary(clientId);
            setSummary(data);
        } catch (err) {
            console.error('❌ Failed to load summary:', err);
            setError(err instanceof Error ? err.message : 'Błąd podczas ładowania podsumowania');
            setSummary(null);
        } finally {
            setLoading(false);
        }
    }, [clientId]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    return {
        summary,
        loading,
        error,
        refetch: fetchSummary
    };
};

// ========================================================================================
// COMPANY AVERAGES HOOK
// ========================================================================================

interface UseCompanyAveragesResult {
    averages: CompanyAveragesResponse | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useCompanyAverages = (): UseCompanyAveragesResult => {
    const [averages, setAverages] = useState<CompanyAveragesResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAverages = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await clientAnalyticsApi.getCompanyAverages();
            setAverages(data);
        } catch (err) {
            console.error('❌ Failed to load company averages:', err);
            setError(err instanceof Error ? err.message : 'Błąd podczas ładowania średnich firmowych');
            setAverages(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAverages();
    }, [fetchAverages]);

    return {
        averages,
        loading,
        error,
        refetch: fetchAverages
    };
};

// ========================================================================================
// BATCH ANALYTICS HOOK
// ========================================================================================

interface UseBatchClientAnalyticsResult {
    batchAnalytics: Record<string, ClientAnalyticsResponse>;
    loading: boolean;
    error: string | null;
    fetchBatch: (clientIds: string[]) => Promise<void>;
}

export const useBatchClientAnalytics = (): UseBatchClientAnalyticsResult => {
    const [batchAnalytics, setBatchAnalytics] = useState<Record<string, ClientAnalyticsResponse>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBatch = useCallback(async (clientIds: string[]) => {
        if (clientIds.length === 0) {
            setBatchAnalytics({});
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await clientAnalyticsApi.getBatchClientAnalytics(clientIds);
            setBatchAnalytics(data);
        } catch (err) {
            console.error('❌ Failed to load batch analytics:', err);
            setError(err instanceof Error ? err.message : 'Błąd podczas ładowania analiz partii');
            setBatchAnalytics({});
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        batchAnalytics,
        loading,
        error,
        fetchBatch
    };
};