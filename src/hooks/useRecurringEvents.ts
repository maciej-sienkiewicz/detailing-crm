// src/hooks/useRecurringEvents.ts
/**
 * Production-ready React hooks for Recurring Events module
 * Provides state management, caching, and optimistic updates
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
    RecurringEventResponse,
    CreateRecurringEventRequest,
    UpdateRecurringEventRequest,
    EventOccurrenceResponse,
    ConvertToVisitRequest,
    UpdateOccurrenceStatusRequest,
    RecurringEventListItem,
    RecurringEventsListParams,
    EventCalendarItem,
    EventCalendarParams,
    RecurringEventStatistics,
    EventOccurrenceStatistics,
    BulkOccurrenceUpdate,
    RecurrencePreview,
    PatternValidationResult,
    OccurrenceStatus
} from '../types/recurringEvents';
import { recurringEventsApi } from '../api/recurringEventsApi';

// ========================================================================================
// MAIN RECURRING EVENTS HOOK
// ========================================================================================

export const useRecurringEvents = () => {
    const queryClient = useQueryClient();

    // Create event mutation
    const createEventMutation = useMutation({
        mutationFn: (data: CreateRecurringEventRequest) =>
            recurringEventsApi.createRecurringEvent(data),
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['recurring-events'] });
                queryClient.invalidateQueries({ queryKey: ['recurring-events-stats'] });
                toast.success('Cykliczne wydarzenie zostało utworzone');
            } else {
                toast.error(result.error || 'Błąd podczas tworzenia wydarzenia');
            }
        },
        onError: (error) => {
            console.error('Error creating recurring event:', error);
            toast.error('Błąd podczas tworzenia wydarzenia');
        }
    });

    // Update event mutation
    const updateEventMutation = useMutation({
        mutationFn: ({ eventId, data }: { eventId: string; data: UpdateRecurringEventRequest }) =>
            recurringEventsApi.updateRecurringEvent(eventId, data),
        onSuccess: (result, variables) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['recurring-events'] });
                queryClient.invalidateQueries({ queryKey: ['recurring-event', variables.eventId] });
                queryClient.invalidateQueries({ queryKey: ['recurring-events-stats'] });
                toast.success('Wydarzenie zostało zaktualizowane');
            } else {
                toast.error(result.error || 'Błąd podczas aktualizacji wydarzenia');
            }
        },
        onError: (error) => {
            console.error('Error updating recurring event:', error);
            toast.error('Błąd podczas aktualizacji wydarzenia');
        }
    });

    // Delete event mutation
    const deleteEventMutation = useMutation({
        mutationFn: (eventId: string) => recurringEventsApi.deleteRecurringEvent(eventId),
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['recurring-events'] });
                queryClient.invalidateQueries({ queryKey: ['recurring-events-stats'] });
                toast.success('Wydarzenie zostało usunięte');
            } else {
                toast.error(result.error || 'Błąd podczas usuwania wydarzenia');
            }
        },
        onError: (error) => {
            console.error('Error deleting recurring event:', error);
            toast.error('Błąd podczas usuwania wydarzenia');
        }
    });

    // Deactivate event mutation
    const deactivateEventMutation = useMutation({
        mutationFn: (eventId: string) => recurringEventsApi.deactivateRecurringEvent(eventId),
        onSuccess: (result, eventId) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['recurring-events'] });
                queryClient.invalidateQueries({ queryKey: ['recurring-event', eventId] });
                queryClient.invalidateQueries({ queryKey: ['recurring-events-stats'] });
                toast.success('Wydarzenie zostało dezaktywowane');
            } else {
                toast.error(result.error || 'Błąd podczas dezaktywacji wydarzenia');
            }
        },
        onError: (error) => {
            console.error('Error deactivating recurring event:', error);
            toast.error('Błąd podczas dezaktywacji wydarzenia');
        }
    });

    return {
        // Mutations
        createEvent: createEventMutation.mutateAsync,
        updateEvent: useCallback(
            (eventId: string, data: UpdateRecurringEventRequest) =>
                updateEventMutation.mutateAsync({ eventId, data }),
            [updateEventMutation]
        ),
        deleteEvent: deleteEventMutation.mutateAsync,
        deactivateEvent: deactivateEventMutation.mutateAsync,

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
        events: result?.data?.data || [],
        pagination: result?.data?.pagination,
        isLoading,
        error: result?.error || (error as Error)?.message,
        success: result?.success ?? false,
        refetch
    };
};

// ========================================================================================
// SINGLE RECURRING EVENT HOOK
// ========================================================================================

export const useRecurringEvent = (eventId: string | null) => {
    const {
        data: result,
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
        event: result?.data,
        isLoading,
        error: result?.error || (error as Error)?.message,
        success: result?.success ?? false,
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
            if (!eventId) return { data: [], success: false };
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
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['event-occurrences', eventId] });
                queryClient.invalidateQueries({ queryKey: ['event-statistics', eventId] });
                queryClient.invalidateQueries({ queryKey: ['recurring-events-stats'] });
                toast.success('Status wystąpienia został zaktualizowany');
            } else {
                toast.error(result.error || 'Błąd podczas aktualizacji statusu');
            }
        },
        onError: (error) => {
            console.error('Error updating occurrence status:', error);
            toast.error('Błąd podczas aktualizacji statusu');
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
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['event-occurrences', eventId] });
                queryClient.invalidateQueries({ queryKey: ['event-statistics', eventId] });
                queryClient.invalidateQueries({ queryKey: ['recurring-events-stats'] });
                queryClient.invalidateQueries({ queryKey: ['visits'] }); // Invalidate visits list
                toast.success('Wystąpienie zostało przekształcone na wizytę');
            } else {
                toast.error(result.error || 'Błąd podczas konwersji na wizytę');
            }
        },
        onError: (error) => {
            console.error('Error converting to visit:', error);
            toast.error('Błąd podczas konwersji na wizytę');
        }
    });

    // Bulk update status mutation
    const bulkUpdateStatusMutation = useMutation({
        mutationFn: (data: BulkOccurrenceUpdate) => {
            if (!eventId) throw new Error('Event ID is required');
            return recurringEventsApi.bulkUpdateOccurrenceStatus(eventId, data);
        },
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['event-occurrences', eventId] });
                queryClient.invalidateQueries({ queryKey: ['event-statistics', eventId] });
                queryClient.invalidateQueries({ queryKey: ['recurring-events-stats'] });

                const { data } = result;
                if (data?.successCount > 0) {
                    toast.success(`Zaktualizowano ${data.successCount} wystąpień`);
                }
                if (data?.failureCount > 0) {
                    toast.warning(`Nie udało się zaktualizować ${data.failureCount} wystąpień`);
                }
            } else {
                toast.error(result.error || 'Błąd podczas grupowej aktualizacji');
            }
        },
        onError: (error) => {
            console.error('Error in bulk update:', error);
            toast.error('Błąd podczas grupowej aktualizacji');
        }
    });

    return {
        // Data
        allOccurrences: allOccurrencesResult?.data?.data || [],
        pagination: allOccurrencesResult?.data?.pagination,

        // Loading states
        isLoadingAll,
        isUpdatingStatus: updateStatusMutation.isPending,
        isConverting: convertToVisitMutation.isPending,
        isBulkUpdating: bulkUpdateStatusMutation.isPending,

        // Functions
        fetchOccurrences,
        updateStatus: useCallback(
            (occurrenceId: string, data: UpdateOccurrenceStatusRequest) =>
                updateStatusMutation.mutateAsync({ occurrenceId, data }),
            [updateStatusMutation]
        ),
        convertToVisit: useCallback(
            (occurrenceId: string, data: ConvertToVisitRequest) =>
                convertToVisitMutation.mutateAsync({ occurrenceId, data }),
            [convertToVisitMutation]
        ),
        bulkUpdateStatus: bulkUpdateStatusMutation.mutateAsync,

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
        startDate: dateRange.start.toISOString().split('T')[0],
        endDate: dateRange.end.toISOString().split('T')[0],
        ...filters
    }), [dateRange, filters]);

    const {
        data: result,
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
        events: result?.data || [],
        dateRange,
        filters,

        // Loading state
        isLoading,
        error: result?.error || (error as Error)?.message,
        success: result?.success ?? false,

        // Functions
        updateDateRange,
        updateFilters,
        refetch
    };
};

// ========================================================================================
// UPCOMING EVENTS HOOK
// ========================================================================================

export const useUpcomingEvents = (days: number = 7, limit: number = 20) => {
    const {
        data: result,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['upcoming-events', days, limit],
        queryFn: () => recurringEventsApi.getUpcomingEvents(days, limit),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        refetchInterval: 10 * 60 * 1000 // Refetch every 10 minutes
    });

    return {
        events: result?.data || [],
        isLoading,
        error: result?.error || (error as Error)?.message,
        success: result?.success ?? false,
        refetch
    };
};

// ========================================================================================
// STATISTICS HOOKS
// ========================================================================================

export const useRecurringEventsStatistics = () => {
    const {
        data: result,
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
        stats: result?.data || {
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
        error: result?.error || (error as Error)?.message,
        success: result?.success ?? false,
        refetch
    };
};

export const useEventStatistics = (eventId: string | null) => {
    const {
        data: result,
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

    return {
        stats: result?.data,
        isLoading,
        error: result?.error || (error as Error)?.message,
        success: result?.success ?? false,
        refetch
    };
};

// ========================================================================================
// PATTERN VALIDATION HOOK
// ========================================================================================

export const usePatternValidation = () => {
    const [validationResult, setValidationResult] = useState<PatternValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    const validatePattern = useCallback(async (pattern: any) => {
        setIsValidating(true);
        try {
            const result = await recurringEventsApi.validateRecurrencePattern(pattern);
            if (result.success && result.data) {
                setValidationResult(result.data);
            } else {
                setValidationResult({
                    isValid: false,
                    errors: [{ field: 'pattern', message: result.error || 'Validation failed' }],
                    warnings: []
                });
            }
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
// RECURRENCE PREVIEW HOOK
// ========================================================================================

export const useRecurrencePreview = () => {
    const [preview, setPreview] = useState<RecurrencePreview | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePreview = useCallback(async (pattern: any, maxPreview: number = 10) => {
        setIsGenerating(true);
        try {
            const result = await recurringEventsApi.getRecurrencePreview(pattern, maxPreview);
            if (result.success && result.data) {
                setPreview(result.data);
            } else {
                setPreview(null);
                toast.error(result.error || 'Nie można wygenerować podglądu');
            }
        } catch (error) {
            console.error('Preview generation error:', error);
            setPreview(null);
            toast.error('Błąd podczas generowania podglądu');
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