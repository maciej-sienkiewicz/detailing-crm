// src/hooks/useRecurringEvents.ts
/**
 * Updated React hooks for Recurring Events module
 * UPDATED TO MATCH ACTUAL SERVER API
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    RecurringEventResponse,
    CreateRecurringEventRequest,
    UpdateRecurringEventRequest,
    EventOccurrenceResponse,
    ConvertToVisitRequest,
    UpdateOccurrenceStatusRequest,
    RecurringEventListItem,
    RecurringEventsListParams,
    EventCalendarParams,
    RecurringEventStatistics,
    OccurrenceStatus
} from '../types/recurringEvents';
import { recurringEventsApi } from '../api/recurringEventsApi';

// API Result wrapper for consistent return types
interface ApiResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// ========================================================================================
// MAIN RECURRING EVENTS HOOK
// ========================================================================================

export const useRecurringEvents = () => {
    const queryClient = useQueryClient();

    // Create event mutation
    const createEventMutation = useMutation({
        mutationFn: (data: CreateRecurringEventRequest) => recurringEventsApi.createRecurringEvent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-events'] });
            queryClient.invalidateQueries({ queryKey: ['recurring-events-stats'] });
        },
        onError: (error) => {
            console.error('Error creating recurring event:', error);
        }
    });

    // Update event mutation
    const updateEventMutation = useMutation({
        mutationFn: ({ eventId, data }: { eventId: string; data: UpdateRecurringEventRequest }) =>
            recurringEventsApi.updateRecurringEvent(eventId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['recurring-events'] });
            queryClient.invalidateQueries({ queryKey: ['recurring-event', variables.eventId] });
            queryClient.invalidateQueries({ queryKey: ['recurring-events-stats'] });
        },
        onError: (error) => {
            console.error('Error updating recurring event:', error);
        }
    });

    // Delete event mutation
    const deleteEventMutation = useMutation({
        mutationFn: (eventId: string) => recurringEventsApi.deleteRecurringEvent(eventId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-events'] });
            queryClient.invalidateQueries({ queryKey: ['recurring-events-stats'] });
        },
        onError: (error) => {
            console.error('Error deleting recurring event:', error);
        }
    });

    // Deactivate event mutation
    const deactivateEventMutation = useMutation({
        mutationFn: (eventId: string) => recurringEventsApi.deactivateRecurringEvent(eventId),
        onSuccess: (_, eventId) => {
            queryClient.invalidateQueries({ queryKey: ['recurring-events'] });
            queryClient.invalidateQueries({ queryKey: ['recurring-event', eventId] });
            queryClient.invalidateQueries({ queryKey: ['recurring-events-stats'] });
        },
        onError: (error) => {
            console.error('Error deactivating recurring event:', error);
        }
    });

    // Helper to wrap API calls with consistent result format
    const wrapApiCall = useCallback(async <T>(apiCall: () => Promise<T>): Promise<ApiResult<T>> => {
        try {
            const data = await apiCall();
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }, []);

    return {
        // Wrapped mutations that return ApiResult
        createEvent: useCallback((data: CreateRecurringEventRequest) =>
            wrapApiCall(() => createEventMutation.mutateAsync(data)), [createEventMutation, wrapApiCall]),

        updateEvent: useCallback((eventId: string, data: UpdateRecurringEventRequest) =>
            wrapApiCall(() => updateEventMutation.mutateAsync({ eventId, data })), [updateEventMutation, wrapApiCall]),

        deleteEvent: useCallback((eventId: string) =>
            wrapApiCall(() => deleteEventMutation.mutateAsync(eventId)), [deleteEventMutation, wrapApiCall]),

        deactivateEvent: useCallback((eventId: string) =>
            wrapApiCall(() => deactivateEventMutation.mutateAsync(eventId)), [deactivateEventMutation, wrapApiCall]),

        // Loading states
        isCreating: createEventMutation.isPending,
        isUpdating: updateEventMutation.isPending,
        isDeleting: deleteEventMutation.isPending,
        isDeactivating: deactivateEventMutation.isPending,

        // Utility functions
        invalidateQueries: useCallback(() => {
            queryClient.invalidateQueries({ queryKey: ['recurring-events'] });
        }, [queryClient])
    };
};

// ========================================================================================
// RECURRING EVENTS LIST HOOK
// ========================================================================================

export const useRecurringEventsList = (params: RecurringEventsListParams = {}) => {
    const {
        data: result,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['recurring-events', 'list', params],
        queryFn: () => recurringEventsApi.getRecurringEventsList(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2
    });

    return {
        events: result?.data || [],
        pagination: result?.pagination,
        isLoading,
        error: result?.message || (error as Error)?.message,
        success: result?.success ?? false,
        refetch
    };
};

// ========================================================================================
// SINGLE RECURRING EVENT HOOK
// ========================================================================================

export const useRecurringEvent = (eventId: string | null) => {
    const {
        data: event,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['recurring-event', eventId],
        queryFn: () => eventId ? recurringEventsApi.getRecurringEventById(eventId) : null,
        enabled: !!eventId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2
    });

    return {
        event,
        isLoading,
        error: (error as Error)?.message,
        success: !!event,
        refetch
    };
};

// ========================================================================================
// EVENT OCCURRENCES HOOK
// ========================================================================================

export const useEventOccurrences = (eventId: string | null) => {
    const queryClient = useQueryClient();

    // Fetch occurrences in date range
    const fetchOccurrences = useCallback(
        async (startDate: string, endDate: string) => {
            if (!eventId) return [];
            return recurringEventsApi.getEventOccurrences(eventId, startDate, endDate);
        },
        [eventId]
    );

    // Fetch all occurrences with pagination
    const {
        data: allOccurrencesResult,
        isLoading: isLoadingAll,
        refetch: refetchAll
    } = useQuery({
        queryKey: ['event-occurrences', eventId, 'all'],
        queryFn: () => eventId ? recurringEventsApi.getAllEventOccurrences(eventId) : null,
        enabled: !!eventId,
        staleTime: 2 * 60 * 1000
    });

    // Update occurrence status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ occurrenceId, data }: {
            occurrenceId: string;
            data: UpdateOccurrenceStatusRequest
        }) => {
            if (!eventId) throw new Error('Event ID is required');
            return recurringEventsApi.updateOccurrenceStatus(eventId, occurrenceId, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-occurrences', eventId] });
            queryClient.invalidateQueries({ queryKey: ['event-statistics', eventId] });
            queryClient.invalidateQueries({ queryKey: ['recurring-events-stats'] });
        },
        onError: (error) => {
            console.error('Error updating occurrence status:', error);
        }
    });

    // Convert to visit mutation
    const convertToVisitMutation = useMutation({
        mutationFn: ({ occurrenceId, data }: {
            occurrenceId: string;
            data: ConvertToVisitRequest;
        }) => {
            if (!eventId) throw new Error('Event ID is required');
            return recurringEventsApi.convertOccurrenceToVisit(eventId, occurrenceId, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-occurrences', eventId] });
            queryClient.invalidateQueries({ queryKey: ['event-statistics', eventId] });
            queryClient.invalidateQueries({ queryKey: ['recurring-events-stats'] });
            queryClient.invalidateQueries({ queryKey: ['visits'] });
        },
        onError: (error) => {
            console.error('Error converting to visit:', error);
        }
    });

    // Helper to wrap API calls with consistent result format
    const wrapApiCall = useCallback(async <T>(apiCall: () => Promise<T>): Promise<ApiResult<T>> => {
        try {
            const data = await apiCall();
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }, []);

    return {
        // Data
        allOccurrences: allOccurrencesResult?.data || [],
        pagination: allOccurrencesResult?.pagination,

        // Loading states
        isLoadingAll,
        isUpdatingStatus: updateStatusMutation.isPending,
        isConverting: convertToVisitMutation.isPending,
        isBulkUpdating: false, // Not supported by current API

        // Functions that return ApiResult
        fetchOccurrences,
        updateStatus: useCallback(
            (occurrenceId: string, data: UpdateOccurrenceStatusRequest) =>
                wrapApiCall(() => updateStatusMutation.mutateAsync({ occurrenceId, data })),
            [updateStatusMutation, wrapApiCall]
        ),
        convertToVisit: useCallback(
            (occurrenceId: string, data: ConvertToVisitRequest) =>
                wrapApiCall(() => convertToVisitMutation.mutateAsync({ occurrenceId, data })),
            [convertToVisitMutation, wrapApiCall]
        ),

        // Bulk operations placeholder (not supported by API)
        bulkUpdateStatus: useCallback(
            async () => {
                return {
                    success: false,
                    error: 'Bulk operations not supported by current API'
                } as ApiResult<any>;
            },
            []
        ),

        // Utility
        refetchAll
    };
};

// ========================================================================================
// EVENT CALENDAR HOOK
// ========================================================================================

export const useEventCalendar = () => {
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
        start: new Date(),
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    const [filters, setFilters] = useState<Omit<EventCalendarParams, 'startDate' | 'endDate'>>({});

    // Prepare API parameters
    const apiParams = useMemo(() => ({
        startDate: dateRange.start.toISOString().split('T')[0], // LocalDate format
        endDate: dateRange.end.toISOString().split('T')[0],     // LocalDate format
        ...filters
    }), [dateRange, filters]);

    const {
        data: events,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['event-calendar', apiParams],
        queryFn: () => recurringEventsApi.getEventCalendar(apiParams),
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2
    });

    const updateDateRange = useCallback((start: Date, end: Date) => {
        setDateRange({ start, end });
    }, []);

    const updateFilters = useCallback((newFilters: typeof filters) => {
        setFilters(newFilters);
    }, []);

    return {
        // Data
        events: events || [],
        dateRange,
        filters,

        // Loading state
        isLoading,
        error: (error as Error)?.message,
        success: Array.isArray(events),

        // Functions
        updateDateRange,
        updateFilters,
        refetch
    };
};

// ========================================================================================
// UPCOMING EVENTS HOOK
// ========================================================================================

export const useUpcomingEvents = (days: number = 7) => {
    const {
        data: events,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['upcoming-events', days],
        queryFn: () => recurringEventsApi.getUpcomingEvents(days),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        refetchInterval: 10 * 60 * 1000 // Refetch every 10 minutes
    });

    return {
        events: events || [],
        isLoading,
        error: (error as Error)?.message,
        success: Array.isArray(events),
        refetch
    };
};

// ========================================================================================
// STATISTICS HOOKS
// ========================================================================================

export const useRecurringEventsStatistics = () => {
    const {
        data: stats,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['recurring-events-stats'],
        queryFn: () => recurringEventsApi.getRecurringEventsStatistics(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2
    });

    return {
        stats: stats || {
            totalEvents: 0,
            activeEvents: 0,
            inactiveEvents: 0,
            totalOccurrences: 0,
            completedOccurrences: 0,
            convertedOccurrences: 0,
            skippedOccurrences: 0,
            cancelledOccurrences: 0,
            upcomingOccurrences: 0
        },
        isLoading,
        error: (error as Error)?.message,
        success: !!stats,
        refetch
    };
};

export const useEventStatistics = (eventId: string | null) => {
    const {
        data: rawStats,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['event-statistics', eventId],
        queryFn: () => eventId ? recurringEventsApi.getEventStatistics(eventId) : null,
        enabled: !!eventId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2
    });

    // Convert server stats format to frontend format
    const stats = useMemo(() => {
        if (!rawStats) return null;

        return {
            eventId: eventId || '',
            totalOccurrences: rawStats.total,
            completedOccurrences: rawStats.completed,
            convertedOccurrences: 0, // Not available from current API
            skippedOccurrences: rawStats.pending, // Mapping pending to skipped for now
            cancelledOccurrences: rawStats.cancelled,
            completionRate: rawStats.total > 0 ? rawStats.completed / rawStats.total : 0,
            conversionRate: 0, // Not available from current API
            averageTimeToCompletion: undefined,
            lastOccurrenceDate: undefined,
            nextOccurrenceDate: undefined
        };
    }, [rawStats, eventId]);

    return {
        stats,
        isLoading,
        error: (error as Error)?.message,
        success: !!stats,
        refetch
    };
};

// ========================================================================================
// PATTERN VALIDATION HOOK (CLIENT-SIDE)
// ========================================================================================

export const usePatternValidation = () => {
    const [validationResult, setValidationResult] = useState<{
        isValid: boolean;
        errors: Array<{ field: string; message: string }>;
        warnings: string[];
    } | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    const validatePattern = useCallback(async (pattern: any) => {
        setIsValidating(true);
        try {
            // Client-side validation since server doesn't provide this endpoint
            const errors: Array<{ field: string; message: string }> = [];
            const warnings: string[] = [];

            // Basic validation logic
            if (!pattern.frequency) {
                errors.push({ field: 'frequency', message: 'Frequency is required' });
            }

            if (!pattern.interval || pattern.interval < 1) {
                errors.push({ field: 'interval', message: 'Interval must be at least 1' });
            }

            if (pattern.frequency === 'WEEKLY' && (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0)) {
                errors.push({ field: 'daysOfWeek', message: 'Days of week required for weekly frequency' });
            }

            if (pattern.frequency === 'MONTHLY' && !pattern.dayOfMonth) {
                errors.push({ field: 'dayOfMonth', message: 'Day of month required for monthly frequency' });
            }

            if (pattern.endDate && pattern.maxOccurrences) {
                warnings.push('Both end date and max occurrences are set - end date will take precedence');
            }

            setValidationResult({
                isValid: errors.length === 0,
                errors,
                warnings
            });

        } catch (error) {
            console.error('Pattern validation error:', error);
            setValidationResult({
                isValid: false,
                errors: [{ field: 'pattern', message: 'Validation error occurred' }],
                warnings: []
            });
        } finally {
            setIsValidating(false);
        }
    }, []);

    const clearValidation = useCallback(() => {
        setValidationResult(null);
    }, []);

    return {
        validationResult,
        isValidating,
        validatePattern,
        clearValidation
    };
};

// ========================================================================================
// RECURRENCE PREVIEW HOOK (CLIENT-SIDE)
// ========================================================================================

export const useRecurrencePreview = () => {
    const [preview, setPreview] = useState<{
        dates: string[];
        totalCount: number;
        firstOccurrence: string;
        hasEndDate: boolean;
        warnings: string[];
    } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePreview = useCallback(async (pattern: any, maxPreview: number = 10) => {
        setIsGenerating(true);
        try {
            // Client-side preview generation since server doesn't provide this endpoint
            const dates: string[] = [];
            let currentDate = new Date();
            const endDate = pattern.endDate ? new Date(pattern.endDate) : null;
            const maxOccurrences = pattern.maxOccurrences || maxPreview;

            // Simple preview generation logic
            for (let i = 0; i < Math.min(maxPreview, maxOccurrences); i++) {
                if (endDate && currentDate > endDate) break;

                dates.push(currentDate.toISOString().split('T')[0]);

                // Increment based on frequency
                switch (pattern.frequency) {
                    case 'DAILY':
                        currentDate.setDate(currentDate.getDate() + (pattern.interval || 1));
                        break;
                    case 'WEEKLY':
                        currentDate.setDate(currentDate.getDate() + (pattern.interval || 1) * 7);
                        break;
                    case 'MONTHLY':
                        currentDate.setMonth(currentDate.getMonth() + (pattern.interval || 1));
                        break;
                    case 'YEARLY':
                        currentDate.setFullYear(currentDate.getFullYear() + (pattern.interval || 1));
                        break;
                }
            }

            setPreview({
                dates,
                totalCount: pattern.maxOccurrences || dates.length,
                firstOccurrence: dates[0] || '',
                hasEndDate: !!pattern.endDate,
                warnings: []
            });

        } catch (error) {
            console.error('Preview generation error:', error);
            setPreview(null);
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const clearPreview = useCallback(() => {
        setPreview(null);
    }, []);

    return {
        preview,
        isGenerating,
        generatePreview,
        clearPreview
    };
};