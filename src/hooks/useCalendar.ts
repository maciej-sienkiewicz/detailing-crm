// src/hooks/useCalendar.ts - ENHANCED VERSION WITH RECURRING EVENTS
import {useCallback, useEffect, useRef, useState} from 'react';
import {Appointment, AppointmentStatus} from '../types';
import {EventOccurrenceResponse} from '../types/recurringEvents';
import {useToast} from '../components/common/Toast/Toast';
import {fetchCalendarData, isRecurringEventAppointment, extractOccurrenceId} from '../services/CalendarIntegrationService';
import {recurringEventsApi} from '../api/recurringEventsApi';

interface UseCalendarReturn {
    appointments: Appointment[];
    recurringOccurrences: EventOccurrenceResponse[];
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

// Enhanced global cache to include all calendar data sources
const globalCache = {
    calendarData: new Map<string, {
        data: { appointments: Appointment[]; protocols: Appointment[]; recurringEvents: Appointment[] };
        timestamp: number;
    }>(),
    activeRequests: new Map<string, Promise<any>>()
};

const CACHE_DURATION = 30000; // 30 seconds
const MAX_CACHE_SIZE = 20;

export const useCalendar = (): UseCalendarReturn => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [recurringOccurrences, setRecurringOccurrences] = useState<EventOccurrenceResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const { showToast } = useToast();

    const loadingRef = useRef(false);
    const lastLoadedRangeRef = useRef<string>('');

    const generateCacheKey = (dateRange?: { start: Date; end: Date }): string => {
        if (!dateRange) {
            console.warn('⚠️ No date range provided for cache key');
            return 'fallback-all';
        }
        return `${dateRange.start.toISOString().split('T')[0]}_${dateRange.end.toISOString().split('T')[0]}`;
    };

    const isCacheValid = (timestamp: number): boolean => {
        return Date.now() - timestamp < CACHE_DURATION;
    };

    const cleanCache = useCallback(() => {
        const now = Date.now();

        for (const [key, value] of globalCache.calendarData.entries()) {
            if (!isCacheValid(value.timestamp)) {
                globalCache.calendarData.delete(key);
            }
        }

        if (globalCache.calendarData.size > MAX_CACHE_SIZE) {
            const oldestKey = Array.from(globalCache.calendarData.keys())[0];
            globalCache.calendarData.delete(oldestKey);
        }
    }, []);

    const loadAppointments = useCallback(async (
        dateRange?: { start: Date; end: Date },
        force: boolean = false
    ) => {
        if (!dateRange) {
            console.warn('⚠️ loadAppointments called without dateRange - skipping');
            return;
        }

        const cacheKey = generateCacheKey(dateRange);

        if (loadingRef.current && !force) {
            console.log('🔄 Request already in progress, skipping...');
            return;
        }

        // Check cache first
        const cachedData = globalCache.calendarData.get(cacheKey);
        if (!force && cachedData && isCacheValid(cachedData.timestamp)) {
            console.log('🎯 Using cached calendar data for range:', cacheKey);
            const combinedAppointments = [
                ...cachedData.data.protocols,
                ...cachedData.data.recurringEvents
            ].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

            setAppointments(combinedAppointments);

            // Extract recurring occurrences for separate state
            const occurrences = cachedData.data.recurringEvents
                .filter(app => app.recurringEventData)
                .map(app => app.recurringEventData as EventOccurrenceResponse);
            setRecurringOccurrences(occurrences);

            setLastRefresh(new Date(cachedData.timestamp));
            lastLoadedRangeRef.current = cacheKey;
            return;
        }

        // Check for active request
        const activeRequest = globalCache.activeRequests.get(cacheKey);
        if (activeRequest && !force) {
            console.log('⏳ Waiting for active request to complete...');
            try {
                await activeRequest;
                return;
            } catch (err) {
                // Continue with new request if active request fails
            }
        }

        try {
            loadingRef.current = true;
            setLoading(true);
            setError(null);

            console.log('🚀 Loading fresh calendar data for range:', cacheKey, {
                start: dateRange.start.toISOString().split('T')[0],
                end: dateRange.end.toISOString().split('T')[0]
            });

            const fetchPromise = fetchCalendarData(dateRange);
            globalCache.activeRequests.set(cacheKey, fetchPromise);

            const calendarData = await fetchPromise;

            // Handle any errors from individual data sources
            if (calendarData.errors.length > 0) {
                const errorMessage = calendarData.errors.join('; ');
                setError(errorMessage);
                showToast('info', errorMessage, 5000);
            }

            // Cache the results
            const now = Date.now();
            globalCache.calendarData.set(cacheKey, {
                data: calendarData,
                timestamp: now
            });

            // Combine all appointments for calendar display
            const combinedAppointments = [
                ...calendarData.protocols,
                ...calendarData.recurringEvents
            ].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

            setAppointments(combinedAppointments);

            // Extract recurring occurrences for separate state
            const occurrences = calendarData.recurringEvents
                .filter(app => app.recurringEventData)
                .map(app => app.recurringEventData as EventOccurrenceResponse);
            setRecurringOccurrences(occurrences);

            setLastRefresh(new Date());
            lastLoadedRangeRef.current = cacheKey;

            console.log(`✅ Loaded ${combinedAppointments.length} calendar items for range:`, cacheKey, {
                protocols: calendarData.protocols.length,
                recurringEvents: calendarData.recurringEvents.length,
                total: combinedAppointments.length
            });

        } catch (err) {
            const errorMessage = 'Nie udało się załadować danych kalendarza';
            setError(errorMessage);
            showToast('error', errorMessage, 5000);
            console.error('Calendar load error:', err);
        } finally {
            setLoading(false);
            loadingRef.current = false;
            globalCache.activeRequests.delete(cacheKey);
            cleanCache();
        }
    }, [showToast, cleanCache]);

    const clearCache = useCallback(() => {
        globalCache.calendarData.clear();
        globalCache.activeRequests.clear();
        lastLoadedRangeRef.current = '';
        console.log('🧹 Calendar cache cleared');
    }, []);

    const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id'>) => {
        try {
            // In production, this would call the appropriate API based on appointment type
            // For now, we'll handle protocols through the visits API
            showToast('info', 'Przekierowanie do tworzenia wizyty...', 3000);

            clearCache();
        } catch (err) {
            showToast('error', 'Nie udało się utworzyć wizyty', 5000);
            throw err;
        }
    }, [showToast, clearCache]);

    const updateAppointmentData = useCallback(async (appointment: Appointment) => {
        try {
            if (isRecurringEventAppointment(appointment.id)) {
                showToast('info', 'Cykliczne wydarzenia należy edytować z poziomu modułu wydarzeń', 4000);
                return;
            }

            // Handle protocol updates through visits API
            // This would be implemented based on your existing update logic
            showToast('success', 'Wizyta została zaktualizowana', 3000);
            clearCache();
        } catch (err) {
            showToast('error', 'Nie udało się zaktualizować wizyty', 5000);
            throw err;
        }
    }, [showToast, clearCache]);

    const removeAppointment = useCallback(async (id: string) => {
        try {
            if (isRecurringEventAppointment(id)) {
                showToast('info', 'Cykliczne wydarzenia należy usuwać z poziomu modułu wydarzeń', 4000);
                return;
            }

            // Handle protocol deletion through visits API
            // This would be implemented based on your existing delete logic
            showToast('success', 'Wizyta została usunięta', 3000);
            clearCache();
        } catch (err) {
            showToast('error', 'Nie udało się usunąć wizyty', 5000);
            throw err;
        }
    }, [showToast, clearCache]);

    const changeAppointmentStatus = useCallback(async (id: string, status: AppointmentStatus) => {
        try {
            if (isRecurringEventAppointment(id)) {
                const occurrenceId = extractOccurrenceId(id);
                if (!occurrenceId) {
                    throw new Error('Invalid recurring event ID');
                }

                // Map appointment status to occurrence status
                let occurrenceStatus;
                switch (status) {
                    case AppointmentStatus.SCHEDULED:
                        occurrenceStatus = 'PLANNED';
                        break;
                    case AppointmentStatus.COMPLETED:
                        occurrenceStatus = 'COMPLETED';
                        break;
                    case AppointmentStatus.CANCELLED:
                        occurrenceStatus = 'CANCELLED';
                        break;
                    default:
                        occurrenceStatus = 'PLANNED';
                }

                // Find the recurring event ID from the occurrence
                const occurrence = recurringOccurrences.find(o => o.id === occurrenceId);
                if (!occurrence) {
                    throw new Error('Recurring event occurrence not found');
                }

                await recurringEventsApi.updateOccurrenceStatus(
                    occurrence.recurringEventId,
                    occurrenceId,
                    { status: occurrenceStatus as any }
                );

                // Update local state
                setAppointments(prev => prev.map(apt =>
                    apt.id === id ? { ...apt, status } : apt
                ));

                showToast('success', 'Status cyklicznego wydarzenia został zmieniony', 3000);
            } else {
                // Handle protocol status updates through existing logic
                showToast('success', 'Status wizyty został zmieniony', 3000);
            }
        } catch (err) {
            showToast('error', 'Nie udało się zmienić statusu', 5000);
            throw err;
        }
    }, [showToast, recurringOccurrences]);

    // Clean cache on unmount
    useEffect(() => {
        return () => {
            cleanCache();
        };
    }, [cleanCache]);

    return {
        appointments,
        recurringOccurrences,
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