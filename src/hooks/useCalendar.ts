// src/hooks/useCalendar.ts - OPTIMIZED VERSION
import {useCallback, useEffect, useRef, useState} from 'react';
import {Appointment, AppointmentStatus} from '../types';
import {useToast} from '../components/common/Toast/Toast';
import {
    addAppointment,
    deleteAppointment,
    fetchAppointments,
    updateAppointment,
    updateAppointmentStatus
} from '../api/mocks/appointmentMocks';
import {fetchProtocolsAsAppointments} from '../services/ProtocolCalendarService';

interface UseCalendarReturn {
    appointments: Appointment[];
    loading: boolean;
    error: string | null;
    lastRefresh: Date | null;
    loadAppointments: (dateRange?: { start: Date; end: Date }, force?: boolean) => Promise<void>;
    createAppointment: (appointmentData: Omit<Appointment, 'id'>) => Promise<void>;
    updateAppointmentData: (appointment: Appointment) => Promise<void>;
    removeAppointment: (id: string) => Promise<void>;
    changeAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
    clearCache: () => void;
}

// Global cache to prevent duplicate requests across component instances
const globalCache = {
    appointments: new Map<string, { data: Appointment[]; timestamp: number }>(),
    protocols: new Map<string, { data: Appointment[]; timestamp: number }>(),
    activeRequests: new Map<string, Promise<Appointment[]>>()
};

const CACHE_DURATION = 30000; // 30 seconds
const MAX_CACHE_SIZE = 20; // Maximum number of cached ranges

export const useCalendar = (): UseCalendarReturn => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const { showToast } = useToast();

    // Prevent concurrent requests for the same range
    const loadingRef = useRef(false);
    const lastLoadedRangeRef = useRef<string>('');

    // Generate cache key from date range - ALWAYS require range
    const generateCacheKey = (dateRange?: { start: Date; end: Date }): string => {
        if (!dateRange) {
            console.warn('⚠️ No date range provided for cache key - this should not happen');
            return 'fallback-all';
        }
        return `${dateRange.start.toISOString().split('T')[0]}_${dateRange.end.toISOString().split('T')[0]}`;
    };

    // Check if cache is valid
    const isCacheValid = (timestamp: number): boolean => {
        return Date.now() - timestamp < CACHE_DURATION;
    };

    // Clean old cache entries
    const cleanCache = useCallback(() => {
        const now = Date.now();

        // Clean appointments cache
        for (const [key, value] of globalCache.appointments.entries()) {
            if (!isCacheValid(value.timestamp)) {
                globalCache.appointments.delete(key);
            }
        }

        // Clean protocols cache
        for (const [key, value] of globalCache.protocols.entries()) {
            if (!isCacheValid(value.timestamp)) {
                globalCache.protocols.delete(key);
            }
        }

        // Limit cache size
        if (globalCache.appointments.size > MAX_CACHE_SIZE) {
            const oldestKey = Array.from(globalCache.appointments.keys())[0];
            globalCache.appointments.delete(oldestKey);
        }

        if (globalCache.protocols.size > MAX_CACHE_SIZE) {
            const oldestKey = Array.from(globalCache.protocols.keys())[0];
            globalCache.protocols.delete(oldestKey);
        }
    }, []);

    // Optimized data loading with intelligent caching - REQUIRE date range
    const loadAppointments = useCallback(async (
        dateRange?: { start: Date; end: Date },
        force: boolean = false
    ) => {
        // ALWAYS require date range for proper API calls
        if (!dateRange) {
            console.warn('⚠️ loadAppointments called without dateRange - skipping');
            return;
        }

        const cacheKey = generateCacheKey(dateRange);

        // Prevent duplicate concurrent requests
        if (loadingRef.current && !force) {
            console.log('🔄 Request already in progress, skipping...');
            return;
        }

        // Check if we already have this data cached and valid (but allow natural range changes)
        if (!force && cacheKey === lastLoadedRangeRef.current && appointments.length > 0) {
            // Only skip if the cache key is exactly the same AND we're not forcing
            // This allows for natural calendar navigation
            const timeSinceLastLoad = Date.now() - (globalCache.appointments.get(cacheKey)?.timestamp || 0);
            if (timeSinceLastLoad < 5000) { // Only skip if loaded very recently (5 seconds)
                console.log('📋 Data recently loaded for this range, skipping...');
                return;
            }
        }

        // Check global cache first
        const cachedAppointments = globalCache.appointments.get(cacheKey);
        const cachedProtocols = globalCache.protocols.get(cacheKey);

        if (!force && cachedAppointments && cachedProtocols &&
            isCacheValid(cachedAppointments.timestamp) &&
            isCacheValid(cachedProtocols.timestamp)) {
            console.log('🎯 Using cached data for range:', cacheKey);
            const combinedData = [...cachedAppointments.data, ...cachedProtocols.data]
                .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

            setAppointments(combinedData);
            setLastRefresh(new Date(Math.min(cachedAppointments.timestamp, cachedProtocols.timestamp)));
            lastLoadedRangeRef.current = cacheKey;
            return;
        }

        // Check if there's already a request in progress for this range
        const activeRequest = globalCache.activeRequests.get(cacheKey);
        if (activeRequest && !force) {
            console.log('⏳ Waiting for active request to complete...');
            try {
                const result = await activeRequest;
                setAppointments(result);
                setLastRefresh(new Date());
                lastLoadedRangeRef.current = cacheKey;
                return;
            } catch (err) {
                // If active request fails, proceed with new request
            }
        }

        try {
            loadingRef.current = true;
            setLoading(true);
            setError(null);

            console.log('🚀 Loading fresh data for range:', cacheKey, {
                start: dateRange.start.toISOString().split('T')[0],
                end: dateRange.end.toISOString().split('T')[0]
            });

            // Create promises for both data sources with REQUIRED date range
            const appointmentsPromise = fetchAppointments().catch(err => {
                console.error('Error fetching appointments:', err);
                return [];
            });

            const protocolsPromise = fetchProtocolsAsAppointments(dateRange).catch(err => {
                console.error('Error fetching protocols:', err);
                return [];
            });

            // Store active request promises to prevent duplicates
            const combinedPromise = Promise.all([appointmentsPromise, protocolsPromise])
                .then(([appointments, protocols]) => {
                    // Cache the results
                    const now = Date.now();
                    globalCache.appointments.set(cacheKey, { data: appointments, timestamp: now });
                    globalCache.protocols.set(cacheKey, { data: protocols, timestamp: now });

                    // Combine and sort
                    const combinedData = [...appointments, ...protocols]
                        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

                    return combinedData;
                });

            globalCache.activeRequests.set(cacheKey, combinedPromise);

            const combinedData = await combinedPromise;

            setAppointments(combinedData);
            setLastRefresh(new Date());
            lastLoadedRangeRef.current = cacheKey;

            console.log(`✅ Loaded ${combinedData.length} appointments for range:`, cacheKey);

        } catch (err) {
            const errorMessage = 'Nie udało się załadować danych kalendarza';
            setError(errorMessage);
            showToast('error', errorMessage, 5000);
            console.error('Calendar load error:', err);
        } finally {
            setLoading(false);
            loadingRef.current = false;
            globalCache.activeRequests.delete(cacheKey);

            // Clean old cache entries
            cleanCache();
        }
    }, [showToast, cleanCache]); // Removed appointments.length dependency


    // Clear cache function
    const clearCache = useCallback(() => {
        globalCache.appointments.clear();
        globalCache.protocols.clear();
        globalCache.activeRequests.clear();
        lastLoadedRangeRef.current = '';
        console.log('🧹 Cache cleared');
    }, []);

    // Clean cache on unmount
    useEffect(() => {
        return () => {
            cleanCache();
        };
    }, [cleanCache]);

    const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id'>) => {
        try {
            const newAppointment = await addAppointment(appointmentData);
            setAppointments(prev => [...prev, newAppointment]
                .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()));

            // Invalidate cache since we have new data
            clearCache();

            showToast('success', 'Wizyta została utworzona', 3000);
        } catch (err) {
            showToast('error', 'Nie udało się utworzyć wizyty', 5000);
            throw err;
        }
    }, [showToast, clearCache]);

    const updateAppointmentData = useCallback(async (appointment: Appointment) => {
        try {
            const updatedAppointment = await updateAppointment(appointment);
            setAppointments(prev => prev.map(item =>
                item.id === updatedAppointment.id ? updatedAppointment : item
            ));

            // Invalidate cache since we have updated data
            clearCache();

            showToast('success', 'Wizyta została zaktualizowana', 3000);
        } catch (err) {
            showToast('error', 'Nie udało się zaktualizować wizyty', 5000);
            throw err;
        }
    }, [showToast, clearCache]);

    const removeAppointment = useCallback(async (id: string) => {
        try {
            await deleteAppointment(id);
            setAppointments(prev => prev.filter(item => item.id !== id));

            // Invalidate cache since we removed data
            clearCache();

            showToast('success', 'Wizyta została usunięta', 3000);
        } catch (err) {
            showToast('error', 'Nie udało się usunąć wizyty', 5000);
            throw err;
        }
    }, [showToast, clearCache]);

    const changeAppointmentStatus = useCallback(async (id: string, status: AppointmentStatus) => {
        try {
            const updatedAppointment = await updateAppointmentStatus(id, status);
            setAppointments(prev => prev.map(item =>
                item.id === updatedAppointment.id ? updatedAppointment : item
            ));

            // Don't clear cache for status changes - it's not critical
            showToast('success', 'Status wizyty został zmieniony', 3000);
        } catch (err) {
            showToast('error', 'Nie udało się zmienić statusu wizyty', 5000);
            throw err;
        }
    }, [showToast]);

    return {
        appointments,
        loading,
        error,
        lastRefresh,
        loadAppointments,
        createAppointment,
        updateAppointmentData,
        removeAppointment,
        changeAppointmentStatus,
        clearCache
    };
};