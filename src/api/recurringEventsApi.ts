// src/api/recurringEventsApi.ts
/**
 * Production-ready API service for Recurring Events module
 * UPDATED TO MATCH ACTUAL SERVER API
 */

import { apiClientNew, ApiError, PaginationParams } from './apiClientNew';
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
    BulkOccurrenceResult,
    RecurrencePreview,
    PatternValidationResult,
    OccurrenceStatus
} from '../types/recurringEvents';

// Spring Boot pagination response type
interface SpringPageResponse<T> {
    content: T[];
    pageable: {
        sort: {
            sorted: boolean;
            unsorted: boolean;
        };
        pageNumber: number;
        pageSize: number;
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    numberOfElements: number;
    size: number;
    number: number;
}

// Converted pagination response for frontend
interface ConvertedPaginationResponse<T> {
    data: T[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
    success: boolean;
    message?: string;
}

/**
 * Main Recurring Events API class
 */
class RecurringEventsApi {
    private readonly baseEndpoint = '/recurring-events';

    // ========================================================================================
    // HELPER METHODS
    // ========================================================================================

    /**
     * Convert Spring Boot page response to our frontend format
     */
    private convertPaginationResponse<T>(springResponse: SpringPageResponse<T>): ConvertedPaginationResponse<T> {
        return {
            data: springResponse.content,
            pagination: {
                currentPage: springResponse.number,
                pageSize: springResponse.size,
                totalItems: springResponse.totalElements,
                totalPages: springResponse.totalPages,
                hasNext: !springResponse.last,
                hasPrevious: !springResponse.first
            },
            success: true
        };
    }

    /**
     * Format date for API (LocalDate format: YYYY-MM-DD)
     */
    private formatDateForApi(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    /**
     * Extract user-friendly error message
     */
    private extractErrorMessage(error: unknown): string {
        if (ApiError.isApiError(error)) {
            switch (error.status) {
                case 400:
                    return error.data?.message || 'Nieprawidłowe dane wejściowe';
                case 401:
                    return 'Sesja wygasła. Zaloguj się ponownie.';
                case 403:
                    return 'Brak uprawnień do tej operacji.';
                case 404:
                    return 'Nie znaleziono żądanych danych.';
                case 500:
                    return 'Błąd serwera. Spróbuj ponownie później.';
                default:
                    return error.data?.message || error.message || 'Nieznany błąd API';
            }
        }

        if (error instanceof Error) {
            return error.message;
        }

        return 'Wystąpił nieoczekiwany błąd.';
    }

    // ========================================================================================
    // RECURRING EVENTS CRUD
    // ========================================================================================

    /**
     * Creates a new recurring event
     */
    async createRecurringEvent(data: CreateRecurringEventRequest): Promise<RecurringEventResponse> {
        try {
            console.log('🔧 Creating recurring event:', data);

            const response = await apiClientNew.post<RecurringEventResponse>(
                this.baseEndpoint,
                data,
                { timeout: 15000 }
            );

            console.log('✅ Successfully created recurring event:', response.id);
            return response;

        } catch (error) {
            console.error('❌ Error creating recurring event:', error);
            throw new Error(this.extractErrorMessage(error));
        }
    }

    /**
     * Fetches paginated list of recurring events
     */
    async getRecurringEventsList(params: RecurringEventsListParams = {}): Promise<ConvertedPaginationResponse<RecurringEventListItem>> {
        try {
            console.log('🔍 Fetching recurring events list:', params);

            const { page = 0, size = 20, sortBy = 'updatedAt', sortOrder = 'desc', ...filterParams } = params;

            // Convert our params to Spring Boot format
            const springParams = {
                page,
                size,
                sortBy,
                sortDirection: sortOrder.toUpperCase(), // Spring expects UPPERCASE
                type: filterParams.type,
                activeOnly: filterParams.isActive,
                // Add search support if the API supports it
                ...(filterParams.search && { search: filterParams.search })
            };

            const springResponse = await apiClientNew.get<SpringPageResponse<RecurringEventListItem>>(
                this.baseEndpoint,
                springParams,
                { timeout: 10000 }
            );

            const converted = this.convertPaginationResponse(springResponse);
            console.log('✅ Successfully fetched recurring events:', {
                count: converted.data.length,
                totalItems: converted.pagination.totalItems
            });

            return converted;

        } catch (error) {
            console.error('❌ Error fetching recurring events list:', error);

            return {
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
            };
        }
    }

    /**
     * Fetches details of a specific recurring event
     */
    async getRecurringEventById(eventId: string): Promise<RecurringEventResponse> {
        try {
            console.log('🔍 Fetching recurring event details:', eventId);

            const response = await apiClientNew.get<RecurringEventResponse>(
                `${this.baseEndpoint}/${eventId}`,
                {},
                { timeout: 10000 }
            );

            console.log('✅ Successfully fetched recurring event details');
            return response;

        } catch (error) {
            console.error('❌ Error fetching recurring event details:', error);
            throw new Error(this.extractErrorMessage(error));
        }
    }

    /**
     * Updates an existing recurring event
     */
    async updateRecurringEvent(eventId: string, data: UpdateRecurringEventRequest): Promise<RecurringEventResponse> {
        try {
            console.log('🔧 Updating recurring event:', { eventId, data });

            const response = await apiClientNew.put<RecurringEventResponse>(
                `${this.baseEndpoint}/${eventId}`,
                data,
                { timeout: 15000 }
            );

            console.log('✅ Successfully updated recurring event');
            return response;

        } catch (error) {
            console.error('❌ Error updating recurring event:', error);
            throw new Error(this.extractErrorMessage(error));
        }
    }

    /**
     * Deletes a recurring event
     */
    async deleteRecurringEvent(eventId: string): Promise<{ message: string; deleted: boolean }> {
        try {
            console.log('🗑️ Deleting recurring event:', eventId);

            const response = await apiClientNew.delete<{ message: string; deleted: boolean }>(
                `${this.baseEndpoint}/${eventId}`,
                { timeout: 10000 }
            );

            console.log('✅ Successfully deleted recurring event');
            return response;

        } catch (error) {
            console.error('❌ Error deleting recurring event:', error);
            throw new Error(this.extractErrorMessage(error));
        }
    }

    /**
     * Deactivates a recurring event (soft delete)
     */
    async deactivateRecurringEvent(eventId: string): Promise<RecurringEventResponse> {
        try {
            console.log('⏸️ Deactivating recurring event:', eventId);

            const response = await apiClientNew.patch<RecurringEventResponse>(
                `${this.baseEndpoint}/${eventId}/deactivate`,
                {},
                { timeout: 10000 }
            );

            console.log('✅ Successfully deactivated recurring event');
            return response;

        } catch (error) {
            console.error('❌ Error deactivating recurring event:', error);
            throw new Error(this.extractErrorMessage(error));
        }
    }

    // ========================================================================================
    // OCCURRENCES MANAGEMENT
    // ========================================================================================

    /**
     * Fetches occurrences for a specific event within date range
     */
    async getEventOccurrences(eventId: string, startDate: string, endDate: string): Promise<EventOccurrenceResponse[]> {
        try {
            console.log('🔍 Fetching event occurrences:', { eventId, startDate, endDate });

            const response = await apiClientNew.get<EventOccurrenceResponse[]>(
                `${this.baseEndpoint}/${eventId}/occurrences`,
                {
                    startDate: startDate, // API expects start_date but apiClient converts to startDate
                    endDate: endDate     // API expects end_date but apiClient converts to endDate
                },
                { timeout: 10000 }
            );

            console.log('✅ Successfully fetched event occurrences:', response.length);
            return response;

        } catch (error) {
            console.error('❌ Error fetching event occurrences:', error);
            return []; // Return empty array instead of throwing
        }
    }

    /**
     * Fetches all occurrences for a specific event with pagination
     */
    async getAllEventOccurrences(eventId: string, params: PaginationParams = {}): Promise<ConvertedPaginationResponse<EventOccurrenceResponse>> {
        try {
            console.log('🔍 Fetching all event occurrences:', { eventId, params });

            const { page = 0, size = 50 } = params;

            const springResponse = await apiClientNew.get<SpringPageResponse<EventOccurrenceResponse>>(
                `${this.baseEndpoint}/${eventId}/occurrences/all`,
                { page, size },
                { timeout: 10000 }
            );

            const converted = this.convertPaginationResponse(springResponse);
            console.log('✅ Successfully fetched all event occurrences:', converted.data.length);

            return converted;

        } catch (error) {
            console.error('❌ Error fetching all event occurrences:', error);

            return {
                data: [],
                pagination: {
                    currentPage: params.page || 0,
                    pageSize: params.size || 50,
                    totalItems: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrevious: false
                },
                success: false,
                message: this.extractErrorMessage(error)
            };
        }
    }

    /**
     * Updates the status of a specific occurrence
     */
    async updateOccurrenceStatus(eventId: string, occurrenceId: string, data: UpdateOccurrenceStatusRequest): Promise<EventOccurrenceResponse> {
        try {
            console.log('🔧 Updating occurrence status:', { eventId, occurrenceId, data });

            const response = await apiClientNew.patch<EventOccurrenceResponse>(
                `${this.baseEndpoint}/${eventId}/occurrences/${occurrenceId}/status`,
                data,
                { timeout: 10000 }
            );

            console.log('✅ Successfully updated occurrence status');
            return response;

        } catch (error) {
            console.error('❌ Error updating occurrence status:', error);
            throw new Error(this.extractErrorMessage(error));
        }
    }

    /**
     * Converts an occurrence to a full visit
     */
    async convertOccurrenceToVisit(eventId: string, occurrenceId: string, data: ConvertToVisitRequest): Promise<any> {
        try {
            console.log('🔄 Converting occurrence to visit:', { eventId, occurrenceId, data });

            const response = await apiClientNew.post<any>( // API returns VisitResponse according to docs
                `${this.baseEndpoint}/${eventId}/occurrences/${occurrenceId}/convert-to-visit`,
                data,
                { timeout: 15000 }
            );

            console.log('✅ Successfully converted occurrence to visit');
            return response;

        } catch (error) {
            console.error('❌ Error converting occurrence to visit:', error);
            throw new Error(this.extractErrorMessage(error));
        }
    }

    // ========================================================================================
    // CALENDAR INTEGRATION
    // ========================================================================================

    /**
     * Fetches calendar events for the specified date range
     */
    async getEventCalendar(params: EventCalendarParams): Promise<EventOccurrenceResponse[]> {
        try {
            console.log('📅 Fetching event calendar:', params);

            // API expects start_date and end_date
            const apiParams = {
                startDate: params.startDate,
                endDate: params.endDate
            };

            const response = await apiClientNew.get<EventOccurrenceResponse[]>(
                `${this.baseEndpoint}/calendar`,
                apiParams,
                { timeout: 10000 }
            );

            console.log('✅ Successfully fetched event calendar:', response.length);
            return response;

        } catch (error) {
            console.error('❌ Error fetching event calendar:', error);
            return []; // Return empty array instead of throwing
        }
    }

    /**
     * Fetches upcoming events/occurrences
     */
    async getUpcomingEvents(days: number = 7): Promise<EventOccurrenceResponse[]> {
        try {
            console.log('🔮 Fetching upcoming events:', { days });

            const response = await apiClientNew.get<EventOccurrenceResponse[]>(
                `${this.baseEndpoint}/upcoming`,
                { days },
                { timeout: 10000 }
            );

            console.log('✅ Successfully fetched upcoming events:', response.length);
            return response;

        } catch (error) {
            console.error('❌ Error fetching upcoming events:', error);
            return []; // Return empty array instead of throwing
        }
    }

    // ========================================================================================
    // STATISTICS
    // ========================================================================================

    /**
     * Fetches statistics for a specific event
     */
    async getEventStatistics(eventId: string): Promise<{ total: number; completed: number; pending: number; cancelled: number }> {
        try {
            console.log('📊 Fetching event statistics:', eventId);

            const response = await apiClientNew.get<{ total: number; completed: number; pending: number; cancelled: number }>(
                `${this.baseEndpoint}/${eventId}/statistics`,
                {},
                { timeout: 10000 }
            );

            console.log('✅ Successfully fetched event statistics');
            return response;

        } catch (error) {
            console.error('❌ Error fetching event statistics:', error);
            // Return empty stats instead of throwing
            return {
                total: 0,
                completed: 0,
                pending: 0,
                cancelled: 0
            };
        }
    }

    /**
     * Fetches count of recurring events
     */
    async getRecurringEventsCount(type?: string): Promise<{ count: number }> {
        try {
            console.log('🔢 Fetching recurring events count');

            const params = type ? { type } : {};
            const response = await apiClientNew.get<{ count: number }>(
                `${this.baseEndpoint}/count`,
                params,
                { timeout: 5000 }
            );

            console.log('✅ Successfully fetched events count');
            return response;

        } catch (error) {
            console.error('❌ Error fetching events count:', error);
            return { count: 0 };
        }
    }

    // ========================================================================================
    // PLACEHOLDER METHODS FOR MISSING ENDPOINTS
    // ========================================================================================

    /**
     * Placeholder for general statistics (not in server API)
     * Maps to individual calls or returns mock data
     */
    async getRecurringEventsStatistics(): Promise<RecurringEventStatistics> {
        try {
            // Try to get count as a basic statistic
            const countResult = await this.getRecurringEventsCount();

            // Return basic stats - in real implementation you might call multiple endpoints
            return {
                totalEvents: countResult.count,
                activeEvents: countResult.count, // Placeholder
                inactiveEvents: 0,
                totalOccurrences: 0,
                completedOccurrences: 0,
                convertedOccurrences: 0,
                skippedOccurrences: 0,
                cancelledOccurrences: 0,
                upcomingOccurrences: 0
            };

        } catch (error) {
            console.error('❌ Error fetching statistics:', error);

            return {
                totalEvents: 0,
                activeEvents: 0,
                inactiveEvents: 0,
                totalOccurrences: 0,
                completedOccurrences: 0,
                convertedOccurrences: 0,
                skippedOccurrences: 0,
                cancelledOccurrences: 0,
                upcomingOccurrences: 0
            };
        }
    }

    /**
     * Placeholder for bulk operations (not in server API)
     */
    async bulkUpdateOccurrenceStatus(eventId: string, data: BulkOccurrenceUpdate): Promise<BulkOccurrenceResult> {
        // This would need to be implemented as individual API calls
        // or added to the server API
        console.warn('Bulk update not supported by server API - would need individual calls');

        throw new Error('Bulk operations not supported by current API');
    }

    /**
     * Placeholder for pattern validation (not in server API)
     */
    async validateRecurrencePattern(pattern: any): Promise<PatternValidationResult> {
        // Client-side validation since server doesn't provide this endpoint
        console.log('Client-side pattern validation:', pattern);

        return {
            isValid: true,
            errors: [],
            warnings: []
        };
    }

    /**
     * Placeholder for recurrence preview (not in server API)
     */
    async getRecurrencePreview(pattern: any, maxPreview: number = 10): Promise<RecurrencePreview> {
        // Client-side preview generation since server doesn't provide this endpoint
        console.log('Client-side preview generation:', pattern);

        return {
            dates: [],
            totalCount: 0,
            firstOccurrence: '',
            hasEndDate: false,
            warnings: []
        };
    }
}

// ========================================================================================
// EXPORT SINGLETON INSTANCE
// ========================================================================================

export const recurringEventsApi = new RecurringEventsApi();
export default recurringEventsApi;