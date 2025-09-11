// src/api/recurringEventsApi.ts
/**
 * Production-ready API service for Recurring Events module
 * Handles all recurring events, occurrences, and calendar operations
 */

import { apiClientNew, ApiError, PaginatedApiResponse, PaginationParams } from './apiClientNew';
import {
    RecurringEventResponse,
    CreateRecurringEventRequest,
    UpdateRecurringEventRequest,
    EventOccurrenceResponse,
    ConvertToVisitRequest,
    UpdateOccurrenceStatusRequest,
    AddOccurrenceNotesRequest,
    RecurringEventListItem,
    RecurringEventsListParams,
    EventCalendarItem,
    EventCalendarParams,
    RecurringEventStatistics,
    EventOccurrenceStatistics,
    BulkOccurrenceUpdate,
    BulkOccurrenceResult,
    RecurrencePreview,
    PatternValidationResult,
    OccurrenceStatus
} from '../types/recurringEvents';

/**
 * API operation result wrapper
 */
export interface RecurringEventsApiResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
}

/**
 * Main Recurring Events API class
 */
class RecurringEventsApi {
    private readonly baseEndpoint = '/recurring-events';

    // ========================================================================================
    // RECURRING EVENTS CRUD
    // ========================================================================================

    /**
     * Creates a new recurring event
     */
    async createRecurringEvent(
        data: CreateRecurringEventRequest
    ): Promise<RecurringEventsApiResult<RecurringEventResponse>> {
        try {
            console.log('🔧 Creating recurring event:', data);

            const response = await apiClientNew.post<RecurringEventResponse>(
                this.baseEndpoint,
                data,
                { timeout: 15000 }
            );

            console.log('✅ Successfully created recurring event:', response.id);

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error creating recurring event:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error
            };
        }
    }

    /**
     * Fetches paginated list of recurring events
     */
    async getRecurringEventsList(
        params: RecurringEventsListParams = {}
    ): Promise<RecurringEventsApiResult<PaginatedApiResponse<RecurringEventListItem>>> {
        try {
            console.log('🔍 Fetching recurring events list:', params);

            const { page = 0, size = 10, ...filterParams } = params;

            const response = await apiClientNew.getWithPagination<RecurringEventListItem>(
                this.baseEndpoint,
                filterParams,
                { page, size },
                { timeout: 10000 }
            );

            console.log('✅ Successfully fetched recurring events:', {
                count: response.data.length,
                totalItems: response.pagination.totalItems
            });

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error fetching recurring events list:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error,
                data: {
                    data: [],
                    pagination: {
                        currentPage: params.page || 0,
                        pageSize: params.size || 10,
                        totalItems: 0,
                        totalPages: 0,
                        hasNext: false,
                        hasPrevious: false
                    },
                    success: false,
                    message: this.extractErrorMessage(error)
                }
            };
        }
    }

    /**
     * Fetches details of a specific recurring event
     */
    async getRecurringEventById(
        eventId: string
    ): Promise<RecurringEventsApiResult<RecurringEventResponse>> {
        try {
            console.log('🔍 Fetching recurring event details:', eventId);

            const response = await apiClientNew.get<RecurringEventResponse>(
                `${this.baseEndpoint}/${eventId}`,
                {},
                { timeout: 10000 }
            );

            console.log('✅ Successfully fetched recurring event details');

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error fetching recurring event details:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error
            };
        }
    }

    /**
     * Updates an existing recurring event
     */
    async updateRecurringEvent(
        eventId: string,
        data: UpdateRecurringEventRequest
    ): Promise<RecurringEventsApiResult<RecurringEventResponse>> {
        try {
            console.log('🔧 Updating recurring event:', { eventId, data });

            const response = await apiClientNew.put<RecurringEventResponse>(
                `${this.baseEndpoint}/${eventId}`,
                data,
                { timeout: 15000 }
            );

            console.log('✅ Successfully updated recurring event');

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error updating recurring event:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error
            };
        }
    }

    /**
     * Deletes a recurring event
     */
    async deleteRecurringEvent(
        eventId: string
    ): Promise<RecurringEventsApiResult<void>> {
        try {
            console.log('🗑️ Deleting recurring event:', eventId);

            await apiClientNew.delete<void>(
                `${this.baseEndpoint}/${eventId}`,
                { timeout: 10000 }
            );

            console.log('✅ Successfully deleted recurring event');

            return {
                success: true
            };

        } catch (error) {
            console.error('❌ Error deleting recurring event:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error
            };
        }
    }

    /**
     * Deactivates a recurring event (soft delete)
     */
    async deactivateRecurringEvent(
        eventId: string
    ): Promise<RecurringEventsApiResult<RecurringEventResponse>> {
        try {
            console.log('⏸️ Deactivating recurring event:', eventId);

            const response = await apiClientNew.patch<RecurringEventResponse>(
                `${this.baseEndpoint}/${eventId}/deactivate`,
                {},
                { timeout: 10000 }
            );

            console.log('✅ Successfully deactivated recurring event');

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error deactivating recurring event:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error
            };
        }
    }

    // ========================================================================================
    // OCCURRENCES MANAGEMENT
    // ========================================================================================

    /**
     * Fetches occurrences for a specific event within date range
     */
    async getEventOccurrences(
        eventId: string,
        startDate: string,
        endDate: string
    ): Promise<RecurringEventsApiResult<EventOccurrenceResponse[]>> {
        try {
            console.log('🔍 Fetching event occurrences:', { eventId, startDate, endDate });

            const response = await apiClientNew.get<EventOccurrenceResponse[]>(
                `${this.baseEndpoint}/${eventId}/occurrences`,
                { startDate, endDate },
                { timeout: 10000 }
            );

            console.log('✅ Successfully fetched event occurrences:', response.length);

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error fetching event occurrences:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error,
                data: []
            };
        }
    }

    /**
     * Fetches all occurrences for a specific event
     */
    async getAllEventOccurrences(
        eventId: string,
        params: PaginationParams = {}
    ): Promise<RecurringEventsApiResult<PaginatedApiResponse<EventOccurrenceResponse>>> {
        try {
            console.log('🔍 Fetching all event occurrences:', { eventId, params });

            const { page = 0, size = 20 } = params;

            const response = await apiClientNew.getWithPagination<EventOccurrenceResponse>(
                `${this.baseEndpoint}/${eventId}/occurrences/all`,
                {},
                { page, size },
                { timeout: 10000 }
            );

            console.log('✅ Successfully fetched all event occurrences:', response.data.length);

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error fetching all event occurrences:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error,
                data: {
                    data: [],
                    pagination: {
                        currentPage: params.page || 0,
                        pageSize: params.size || 20,
                        totalItems: 0,
                        totalPages: 0,
                        hasNext: false,
                        hasPrevious: false
                    },
                    success: false,
                    message: this.extractErrorMessage(error)
                }
            };
        }
    }

    /**
     * Updates the status of a specific occurrence
     */
    async updateOccurrenceStatus(
        eventId: string,
        occurrenceId: string,
        data: UpdateOccurrenceStatusRequest
    ): Promise<RecurringEventsApiResult<EventOccurrenceResponse>> {
        try {
            console.log('🔧 Updating occurrence status:', { eventId, occurrenceId, data });

            const response = await apiClientNew.patch<EventOccurrenceResponse>(
                `${this.baseEndpoint}/${eventId}/occurrences/${occurrenceId}/status`,
                data,
                { timeout: 10000 }
            );

            console.log('✅ Successfully updated occurrence status');

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error updating occurrence status:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error
            };
        }
    }

    /**
     * Converts an occurrence to a full visit
     */
    async convertOccurrenceToVisit(
        eventId: string,
        occurrenceId: string,
        data: ConvertToVisitRequest
    ): Promise<RecurringEventsApiResult<{ occurrence: EventOccurrenceResponse; visitId: string }>> {
        try {
            console.log('🔄 Converting occurrence to visit:', { eventId, occurrenceId, data });

            const response = await apiClientNew.post<{ occurrence: EventOccurrenceResponse; visitId: string }>(
                `${this.baseEndpoint}/${eventId}/occurrences/${occurrenceId}/convert-to-visit`,
                data,
                { timeout: 15000 }
            );

            console.log('✅ Successfully converted occurrence to visit:', response.visitId);

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error converting occurrence to visit:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error
            };
        }
    }

    /**
     * Adds or updates notes for a specific occurrence
     */
    async addOccurrenceNotes(
        eventId: string,
        occurrenceId: string,
        data: AddOccurrenceNotesRequest
    ): Promise<RecurringEventsApiResult<EventOccurrenceResponse>> {
        try {
            console.log('📝 Adding occurrence notes:', { eventId, occurrenceId });

            const response = await apiClientNew.patch<EventOccurrenceResponse>(
                `${this.baseEndpoint}/${eventId}/occurrences/${occurrenceId}/notes`,
                data,
                { timeout: 10000 }
            );

            console.log('✅ Successfully added occurrence notes');

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error adding occurrence notes:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error
            };
        }
    }

    // ========================================================================================
    // BULK OPERATIONS
    // ========================================================================================

    /**
     * Updates status of multiple occurrences at once
     */
    async bulkUpdateOccurrenceStatus(
        eventId: string,
        data: BulkOccurrenceUpdate
    ): Promise<RecurringEventsApiResult<BulkOccurrenceResult>> {
        try {
            console.log('🔧 Bulk updating occurrence status:', { eventId, count: data.occurrenceIds.length });

            const response = await apiClientNew.patch<BulkOccurrenceResult>(
                `${this.baseEndpoint}/${eventId}/occurrences/bulk-status`,
                data,
                { timeout: 20000 }
            );

            console.log('✅ Successfully completed bulk status update:', response);

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error in bulk status update:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error
            };
        }
    }

    // ========================================================================================
    // CALENDAR INTEGRATION
    // ========================================================================================

    /**
     * Fetches calendar events for the specified date range
     */
    async getEventCalendar(
        params: EventCalendarParams
    ): Promise<RecurringEventsApiResult<EventCalendarItem[]>> {
        try {
            console.log('📅 Fetching event calendar:', params);

            const response = await apiClientNew.get<EventCalendarItem[]>(
                `${this.baseEndpoint}/calendar`,
                params,
                { timeout: 10000 }
            );

            console.log('✅ Successfully fetched event calendar:', response.length);

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error fetching event calendar:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error,
                data: []
            };
        }
    }

    /**
     * Fetches upcoming events/occurrences
     */
    async getUpcomingEvents(
        days: number = 7,
        limit: number = 20
    ): Promise<RecurringEventsApiResult<EventCalendarItem[]>> {
        try {
            console.log('🔮 Fetching upcoming events:', { days, limit });

            const response = await apiClientNew.get<EventCalendarItem[]>(
                `${this.baseEndpoint}/upcoming`,
                { days, limit },
                { timeout: 10000 }
            );

            console.log('✅ Successfully fetched upcoming events:', response.length);

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error fetching upcoming events:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error,
                data: []
            };
        }
    }

    // ========================================================================================
    // STATISTICS
    // ========================================================================================

    /**
     * Fetches overall statistics for recurring events
     */
    async getRecurringEventsStatistics(): Promise<RecurringEventsApiResult<RecurringEventStatistics>> {
        try {
            console.log('📊 Fetching recurring events statistics');

            const response = await apiClientNew.get<RecurringEventStatistics>(
                `${this.baseEndpoint}/statistics`,
                {},
                { timeout: 10000 }
            );

            console.log('✅ Successfully fetched statistics');

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error fetching statistics:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error,
                data: {
                    totalEvents: 0,
                    activeEvents: 0,
                    inactiveEvents: 0,
                    totalOccurrences: 0,
                    completedOccurrences: 0,
                    convertedOccurrences: 0,
                    skippedOccurrences: 0,
                    cancelledOccurrences: 0,
                    upcomingOccurrences: 0
                }
            };
        }
    }

    /**
     * Fetches statistics for a specific event
     */
    async getEventStatistics(
        eventId: string
    ): Promise<RecurringEventsApiResult<EventOccurrenceStatistics>> {
        try {
            console.log('📊 Fetching event statistics:', eventId);

            const response = await apiClientNew.get<EventOccurrenceStatistics>(
                `${this.baseEndpoint}/${eventId}/statistics`,
                {},
                { timeout: 10000 }
            );

            console.log('✅ Successfully fetched event statistics');

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error fetching event statistics:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error
            };
        }
    }

    /**
     * Fetches count of recurring events by status
     */
    async getRecurringEventsCount(): Promise<RecurringEventsApiResult<{ total: number; active: number; inactive: number }>> {
        try {
            console.log('🔢 Fetching recurring events count');

            const response = await apiClientNew.get<{ total: number; active: number; inactive: number }>(
                `${this.baseEndpoint}/count`,
                {},
                { timeout: 5000 }
            );

            console.log('✅ Successfully fetched events count');

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error fetching events count:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error,
                data: { total: 0, active: 0, inactive: 0 }
            };
        }
    }

    // ========================================================================================
    // VALIDATION & PREVIEW
    // ========================================================================================

    /**
     * Validates a recurrence pattern and returns preview
     */
    async validateRecurrencePattern(
        pattern: any
    ): Promise<RecurringEventsApiResult<PatternValidationResult>> {
        try {
            console.log('✅ Validating recurrence pattern:', pattern);

            const response = await apiClientNew.post<PatternValidationResult>(
                `${this.baseEndpoint}/validate-pattern`,
                pattern,
                { timeout: 10000 }
            );

            console.log('✅ Successfully validated pattern:', response.isValid);

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error validating pattern:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error,
                data: {
                    isValid: false,
                    errors: [],
                    warnings: []
                }
            };
        }
    }

    /**
     * Generates preview of occurrence dates for a pattern
     */
    async getRecurrencePreview(
        pattern: any,
        maxPreview: number = 10
    ): Promise<RecurringEventsApiResult<RecurrencePreview>> {
        try {
            console.log('🔮 Generating recurrence preview:', pattern);

            const response = await apiClientNew.post<RecurrencePreview>(
                `${this.baseEndpoint}/preview-pattern`,
                { ...pattern, maxPreview },
                { timeout: 10000 }
            );

            console.log('✅ Successfully generated preview:', response.totalCount);

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error generating preview:', error);

            return {
                success: false,
                error: this.extractErrorMessage(error),
                details: error,
                data: {
                    dates: [],
                    totalCount: 0,
                    firstOccurrence: '',
                    hasEndDate: false,
                    warnings: []
                }
            };
        }
    }

    // ========================================================================================
    // HELPER METHODS
    // ========================================================================================

    /**
     * Extracts user-friendly error message from various error types
     */
    private extractErrorMessage(error: unknown): string {
        if (ApiError.isApiError(error)) {
            // Handle specific API errors
            switch (error.status) {
                case 401:
                    return 'Sesja wygasła. Zaloguj się ponownie.';
                case 403:
                    return 'Brak uprawnień do tej operacji.';
                case 404:
                    return 'Nie znaleziono żądanych danych.';
                case 422:
                    return 'Nieprawidłowe dane wejściowe.';
                case 429:
                    return 'Zbyt wiele żądań. Spróbuj ponownie za chwilę.';
                case 500:
                    return 'Błąd serwera. Spróbuj ponownie później.';
                case 503:
                    return 'Serwis tymczasowo niedostępny.';
                default:
                    return error.data?.message || error.message || 'Nieznany błąd API';
            }
        }

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return 'Żądanie zostało anulowane (timeout).';
            }
            if (error.message.includes('fetch')) {
                return 'Błąd połączenia z serwerem.';
            }
            return error.message;
        }

        return 'Wystąpił nieoczekiwany błąd.';
    }

    /**
     * Helper method to format date for API calls
     */
    private formatDateForApi(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    /**
     * Helper method to build query parameters for occurrence filtering
     */
    private buildOccurrenceParams(params: {
        statuses?: OccurrenceStatus[];
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Record<string, any> {
        const queryParams: Record<string, any> = {};

        if (params.statuses && params.statuses.length > 0) {
            queryParams.statuses = params.statuses;
        }

        if (params.startDate) {
            queryParams.startDate = this.formatDateForApi(params.startDate);
        }

        if (params.endDate) {
            queryParams.endDate = this.formatDateForApi(params.endDate);
        }

        if (params.limit) {
            queryParams.limit = params.limit;
        }

        return queryParams;
    }
}

// ========================================================================================
// EXPORT SINGLETON INSTANCE
// ========================================================================================

export const recurringEventsApi = new RecurringEventsApi();
export default recurringEventsApi;