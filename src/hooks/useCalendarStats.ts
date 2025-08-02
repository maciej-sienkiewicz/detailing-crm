// src/hooks/useCalendarStats.ts - CAŁKOWICIE PRZEPISANA WERSJA
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { fetchProtocolsAsAppointments } from '../services/ProtocolCalendarService';
import { fetchAppointments } from '../api/mocks/appointmentMocks';

interface CalendarStats {
    total: number;
    today: number;
    thisWeek: number;
    protocols: number;
    inProgress: number;
    readyForPickup: number;
    cancelled: number;
}

// Extended type for mixed data sources that may have different date formats
interface MixedAppointmentData {
    id: string;
    title: string;
    start: Date | string | any; // Mixed format from different sources
    end?: Date | string | any;
    status: string | AppointmentStatus;
    isProtocol?: boolean;
    [key: string]: any; // Allow other properties
}

// Cache dla danych statystyk - niezależny od zakresu kalendarza
let statsCache: {
    data: MixedAppointmentData[] | null;
    timestamp: number;
    promise: Promise<MixedAppointmentData[]> | null;
} = {
    data: null,
    timestamp: 0,
    promise: null
};

const STATS_CACHE_DURATION = 60000; // 1 minuta - statystyki mogą być rzadziej odświeżane

// Helper functions for date handling - defined outside of component
function getDateString(dateValue: any): string | null {
    if (!dateValue) return null;

    if (typeof dateValue === 'string') {
        return dateValue.split('T')[0];
    }

    if (dateValue instanceof Date) {
        return dateValue.toISOString().split('T')[0];
    }

    // Try to convert to Date if it's an object with date-like properties
    try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) {
        console.warn('Could not parse date:', dateValue);
    }

    return null;
}

function getDateObject(dateValue: any): Date | null {
    if (!dateValue) return null;

    if (dateValue instanceof Date) {
        return dateValue;
    }

    if (typeof dateValue === 'string') {
        try {
            const date = new Date(dateValue);
            return !isNaN(date.getTime()) ? date : null;
        } catch (e) {
            return null;
        }
    }

    // Try to convert to Date if it's an object
    try {
        const date = new Date(dateValue);
        return !isNaN(date.getTime()) ? date : null;
    } catch (e) {
        return null;
    }
}

// Mapowanie statusów z serwera na nasze typy
function mapServerStatus(serverStatus: string): AppointmentStatus {
    switch (serverStatus) {
        case 'SCHEDULED': return AppointmentStatus.SCHEDULED;
        case 'IN_PROGRESS': return AppointmentStatus.IN_PROGRESS;
        case 'READY_FOR_PICKUP': return AppointmentStatus.READY_FOR_PICKUP;
        case 'COMPLETED': return AppointmentStatus.COMPLETED;
        case 'CANCELLED': return AppointmentStatus.CANCELLED;
        default:
            console.warn('Unknown status:', serverStatus);
            return AppointmentStatus.SCHEDULED;
    }
}

export const useCalendarStats = (): CalendarStats & {
    loading: boolean;
    error: string | null;
    refreshStats: () => Promise<void>;
} => {
    const [statsData, setStatsData] = useState<MixedAppointmentData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isCacheValid = useCallback((): boolean => {
        return statsCache.data !== null &&
            Date.now() - statsCache.timestamp < STATS_CACHE_DURATION;
    }, []);

    const fetchStatsData = useCallback(async (): Promise<MixedAppointmentData[]> => {
        // Zwróć cache jeśli jest ważny
        if (isCacheValid() && statsCache.data) {
            console.log('📊 Using cached stats data');
            return statsCache.data;
        }

        // Zwróć istniejące promise jeśli już trwa
        if (statsCache.promise) {
            console.log('⏳ Waiting for existing stats request');
            return statsCache.promise;
        }

        console.log('🚀 Fetching fresh stats data');

        // Utwórz nowe promise
        statsCache.promise = (async () => {
            try {
                // Pobierz wszystkie dane niezależnie od zakresu kalendarza
                // Dla statystyk zawsze pobieramy szeroki zakres:
                const now = new Date();

                // Szeroki zakres - od 3 miesiące wstecz do 3 miesiące do przodu
                // To zapewni, że nie przegapimy żadnych protokołów o różnych zakresach dat
                const startRange = new Date(now);
                startRange.setMonth(now.getMonth() - 3);
                startRange.setDate(1);
                startRange.setHours(0, 0, 0, 0);

                const endRange = new Date(now);
                endRange.setMonth(now.getMonth() + 3);
                endRange.setDate(1);
                endRange.setHours(23, 59, 59, 999);

                console.log('📊 Fetching stats data for range:', {
                    start: startRange.toISOString().split('T')[0],
                    end: endRange.toISOString().split('T')[0]
                });

                // Pobierz dane z szerszego zakresu dla statystyk
                const appointmentsPromise = fetchAppointments().catch(err => {
                    console.error('Error fetching appointments for stats:', err);
                    return [];
                });

                const protocolsPromise = fetchProtocolsAsAppointments({
                    start: startRange,
                    end: endRange
                }).catch(err => {
                    console.error('Error fetching protocols for stats:', err);
                    return [];
                });

                const [appointments, protocols] = await Promise.all([
                    appointmentsPromise,
                    protocolsPromise
                ]);

                // Combine data - cast to our mixed type to handle different date formats
                const combinedData: MixedAppointmentData[] = [
                    ...appointments.map(a => ({ ...a } as MixedAppointmentData)),
                    ...protocols.map(p => ({ ...p } as MixedAppointmentData))
                ];

                console.log('📊 Stats data loaded:', {
                    appointmentsCount: appointments.length,
                    protocolsCount: protocols.length,
                    totalCount: combinedData.length,
                    sampleProtocols: protocols.slice(0, 3).map(p => ({
                        id: p.id,
                        status: p.status,
                        title: p.title
                    }))
                });

                // Zaktualizuj cache
                statsCache.data = combinedData;
                statsCache.timestamp = Date.now();
                statsCache.promise = null;

                return combinedData;
            } catch (err) {
                statsCache.promise = null;
                throw err;
            }
        })();

        return statsCache.promise;
    }, [isCacheValid]);

    const loadStatsData = useCallback(async () => {
        // Nie ładuj ponownie jeśli mamy ważne dane w cache
        if (isCacheValid() && statsCache.data && statsData.length > 0) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const data = await fetchStatsData();
            setStatsData(data);
        } catch (err) {
            const errorMessage = 'Nie udało się załadować statystyk';
            setError(errorMessage);
            console.error('Error loading stats:', err);

            // Ustaw puste dane jako fallback
            setStatsData([]);
        } finally {
            setLoading(false);
        }
    }, [fetchStatsData, isCacheValid, statsData.length]);

    const refreshStats = useCallback(async () => {
        // Wyczyść cache i wymuś ponowne załadowanie
        statsCache.data = null;
        statsCache.timestamp = 0;
        statsCache.promise = null;

        await loadStatsData();
    }, [loadStatsData]);

    // Załaduj dane przy pierwszym renderze
    useEffect(() => {
        loadStatsData();
    }, [loadStatsData]);

    // Ustaw dane z cache natychmiast jeśli są dostępne
    useEffect(() => {
        if (isCacheValid() && statsCache.data && statsData.length === 0) {
            setStatsData(statsCache.data);
        }
    }, [isCacheValid, statsData.length]);

    // Oblicz statystyki na podstawie niezależnych danych
    const stats = useMemo((): CalendarStats => {
        if (!statsData || statsData.length === 0) {
            return {
                total: 0,
                today: 0,
                thisWeek: 0,
                protocols: 0,
                inProgress: 0,
                readyForPickup: 0,
                cancelled: 0
            };
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Wczoraj dla anulowanych (31-07-2025)
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        // Początek i koniec tygodnia (poniedziałek - niedziela)
        const dayOfWeek = now.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - daysFromMonday);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        console.log('📊 Stats calculation:', {
            todayString: today.toISOString().split('T')[0],
            yesterdayString,
            totalRecords: statsData.length,
            sampleData: statsData.slice(0, 3).map(item => ({
                id: item.id,
                status: item.status,
                startDate: getDateString(item.start),
                title: item.title ? item.title.substring(0, 30) : 'No title'
            }))
        });

        // NAJWAŻNIEJSZE: Aktualne statusy pojazdów (niezależnie od dat)
        const inProgressCount = statsData.filter(item => {
            const mappedStatus = mapServerStatus(item.status as string);
            return mappedStatus === AppointmentStatus.IN_PROGRESS;
        }).length;

        const readyForPickupCount = statsData.filter(item => {
            const mappedStatus = mapServerStatus(item.status as string);
            return mappedStatus === AppointmentStatus.READY_FOR_PICKUP;
        }).length;

        // Filtrowanie wizyt na podstawie dat
        const todayAppointments = statsData.filter(appointment => {
            const appointmentStartDate = getDateString(appointment.start);
            return appointmentStartDate === today.toISOString().split('T')[0];
        });

        const thisWeekAppointments = statsData.filter(appointment => {
            const appointmentDate = getDateObject(appointment.start);
            if (!appointmentDate) return false;

            return appointmentDate >= weekStart && appointmentDate <= weekEnd;
        });

        const cancelledYesterday = statsData.filter(appointment => {
            const mappedStatus = mapServerStatus(appointment.status as string);
            const appointmentStartDate = getDateString(appointment.start);

            return mappedStatus === AppointmentStatus.CANCELLED &&
                appointmentStartDate === yesterdayString;
        });

        const result = {
            total: statsData.length,
            today: todayAppointments.filter(item => {
                const mappedStatus = mapServerStatus(item.status as string);
                return mappedStatus === AppointmentStatus.SCHEDULED;
            }).length,
            thisWeek: thisWeekAppointments.length,
            protocols: statsData.filter(item => item.isProtocol).length,
            inProgress: inProgressCount,
            readyForPickup: readyForPickupCount,
            cancelled: cancelledYesterday.length
        };

        console.log('📊 Final stats:', result);

        return result;
    }, [statsData]);

    return {
        ...stats,
        loading,
        error,
        refreshStats
    };
};