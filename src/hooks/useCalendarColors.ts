// src/hooks/useCalendarColors.ts - Hook with caching for calendar colors
import {useCallback, useEffect, useState} from 'react';
import {CalendarColor} from '../types/calendar';

// Global cache for calendar colors
let calendarColorsCache: {
    data: Record<string, CalendarColor> | null;
    timestamp: number;
    promise: Promise<Record<string, CalendarColor>> | null;
} = {
    data: null,
    timestamp: 0,
    promise: null
};

const CACHE_DURATION = 300000; // 5 minutes - colors don't change often

interface UseCalendarColorsReturn {
    calendarColors: Record<string, CalendarColor>;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useCalendarColors = (): UseCalendarColorsReturn => {
    const [calendarColors, setCalendarColors] = useState<Record<string, CalendarColor>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isCacheValid = useCallback((): boolean => {
        return calendarColorsCache.data !== null &&
            Date.now() - calendarColorsCache.timestamp < CACHE_DURATION;
    }, []);

    const fetchCalendarColors = useCallback(async (): Promise<Record<string, CalendarColor>> => {
        // Return cached data if valid
        if (isCacheValid() && calendarColorsCache.data) {
            console.log('🎨 Using cached calendar colors');
            return calendarColorsCache.data;
        }

        // Return existing promise if one is already in progress
        if (calendarColorsCache.promise) {
            console.log('⏳ Waiting for existing calendar colors request');
            return calendarColorsCache.promise;
        }

        console.log('🚀 Fetching fresh calendar colors');

        // Create new promise
        calendarColorsCache.promise = (async () => {
            try {
                const { calendarColorsApi } = await import('../api/calendarColorsApi');
                const colors = await calendarColorsApi.fetchCalendarColors();

                const colorsMap = colors.reduce((acc, color) => {
                    acc[color.id] = color;
                    return acc;
                }, {} as Record<string, CalendarColor>);

                // Update cache
                calendarColorsCache.data = colorsMap;
                calendarColorsCache.timestamp = Date.now();
                calendarColorsCache.promise = null;

                return colorsMap;
            } catch (err) {
                calendarColorsCache.promise = null;
                throw err;
            }
        })();

        return calendarColorsCache.promise;
    }, [isCacheValid]);

    const loadColors = useCallback(async () => {
        // Don't load if we already have valid cached data
        if (isCacheValid() && calendarColorsCache.data && Object.keys(calendarColors).length > 0) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const colors = await fetchCalendarColors();
            setCalendarColors(colors);
        } catch (err) {
            const errorMessage = 'Nie udało się załadować kolorów kalendarza';
            setError(errorMessage);
            console.error('Error loading calendar colors:', err);

            // Set empty object as fallback
            setCalendarColors({});
        } finally {
            setLoading(false);
        }
    }, [fetchCalendarColors, isCacheValid, calendarColors]);

    const refetch = useCallback(async () => {
        // Clear cache and force refetch
        calendarColorsCache.data = null;
        calendarColorsCache.timestamp = 0;
        calendarColorsCache.promise = null;

        await loadColors();
    }, [loadColors]);

    // Load colors on mount
    useEffect(() => {
        loadColors();
    }, [loadColors]);

    // Set cached data immediately if available
    useEffect(() => {
        if (isCacheValid() && calendarColorsCache.data && Object.keys(calendarColors).length === 0) {
            setCalendarColors(calendarColorsCache.data);
        }
    }, [isCacheValid, calendarColors]);

    return {
        calendarColors,
        loading,
        error,
        refetch
    };
};