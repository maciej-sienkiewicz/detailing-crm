// src/hooks/useVehicleAnalytics.ts
import { useState, useEffect } from 'react';
import { vehicleAnalyticsApi, VehicleAnalyticsResponse } from '../api/vehicleAnalyticsApi';

interface UseVehicleAnalyticsResult {
    analytics: VehicleAnalyticsResponse | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useVehicleAnalytics = (vehicleId?: string): UseVehicleAnalyticsResult => {
    const [analytics, setAnalytics] = useState<VehicleAnalyticsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        if (!vehicleId) return;

        setLoading(true);
        setError(null);

        try {
            console.log('🔄 Fetching analytics for vehicle:', vehicleId);
            const data = await vehicleAnalyticsApi.getVehicleAnalytics(vehicleId);
            setAnalytics(data);
            console.log('✅ Analytics loaded successfully');
        } catch (err) {
            console.error('❌ Failed to load analytics:', err);
            setError(err instanceof Error ? err.message : 'Błąd podczas ładowania analiz');
            setAnalytics(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (vehicleId) {
            fetchAnalytics();
        } else {
            setAnalytics(null);
            setError(null);
        }
    }, [vehicleId]);

    return {
        analytics,
        loading,
        error,
        refetch: fetchAnalytics
    };
};