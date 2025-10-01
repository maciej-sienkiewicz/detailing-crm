// src/api/recurringEventsApi.ts - COMPLETE FIXED VERSION
/**
 * Production-ready API service for Recurring Events module
 * FIXED: Handles LocalDateTime arrays, field mapping, and calculates missing fields
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
    OccurrenceStatus,
    EventType,
    RecurrenceFrequency,
    ConvertToVisitResponse
} from '../types/recurringEvents';
import { addDays, addWeeks, addMonths, addYears, startOfDay, isAfter, format } from 'date-fns';

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

// Raw server response types (before conversion)
interface RawRecurringEventResponse {
    id: string;
    title: string;
    description?: string;
    type: EventType;
    recurrence_pattern: {
        frequency: RecurrenceFrequency;
        interval: number;
        days_of_week?: string[];
        day_of_month?: number;
        end_date?: string;
        max_occurrences?: number;
    };
    is_active: boolean;
    visit_template?: {
        client_id?: number;
        vehicle_id?: number;
        estimated_duration_minutes: number;
        default_services: Array<{
            name: string;
            base_price: number;
        }>;
        notes?: string;
    };
    created_at: number[];
    updated_at: number[];
    // Additional fields for list items
    next_occurrence?: string;
    total_occurrences?: number;
    completed_occurrences?: number;
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

interface EventOccurrenceWithDetailsResponse extends EventOccurrenceResponse {
    recurringEventDetails?: {
        id: string;
        title: string;
        description?: string;
        type: any;
        recurrencePattern?: any;
        recurrence_pattern?: any;
        isActive?: boolean;
        is_active?: boolean;
        visitTemplate?: any;
        visit_template?: any;
        createdAt?: any;
        created_at?: any;
        updatedAt?: any;
        updated_at?: any;
    };
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
     * Convert LocalDateTime array from Spring Boot to ISO string
     * Spring Boot sends LocalDateTime as: [year, month, day, hour, minute, second, nanosecond]
     */
    private convertLocalDateTimeArray(dateArray: number[]): string {
        if (!Array.isArray(dateArray) || dateArray.length < 6) {
            console.warn('Invalid date array format:', dateArray);
            return new Date().toISOString();
        }

        try {
            const [year, month, day, hour, minute, second, nanosecond = 0] = dateArray;
            const date = new Date(year, month - 1, day, hour, minute, second, Math.floor(nanosecond / 1000000));

            if (isNaN(date.getTime())) {
                console.warn('Invalid date created from array:', dateArray);
                return new Date().toISOString();
            }

            return date.toISOString();
        } catch (error) {
            console.warn('Error converting date array:', dateArray, error);
            return new Date().toISOString();
        }
    }

    /**
     * Calculate next occurrence based on recurrence pattern
     * FIXED: Oblicza następne wystąpienie na podstawie wzorca - POPRAWIONA WERSJA
     */
    private calculateNextOccurrence(pattern: any, createdAt: string): string | undefined {
        try {

            if (!pattern || !pattern.frequency || !createdAt) {
                console.warn('Missing required data for calculation:', { pattern, createdAt });
                return undefined;
            }

            // Konwertuj created_at (może być array lub string)
            let startDate: Date;
            if (Array.isArray(createdAt)) {
                startDate = new Date(this.convertLocalDateTimeArray(createdAt));
            } else {
                startDate = new Date(createdAt);
            }

            startDate = startOfDay(startDate);
            const today = startOfDay(new Date());

            // Jeśli data startu jest w przyszłości, to jest pierwszym wystąpieniem
            if (isAfter(startDate, today)) {
                return startDate.toISOString();
            }

            const interval = pattern.interval || 1;
            const frequency = pattern.frequency;
            let nextDate = new Date(startDate);

            const maxIterations = 1000; // Większe zabezpieczenie
            let iterations = 0;

            // Oblicz następne wystąpienie
            while (iterations < maxIterations) {
                switch (frequency) {
                    case 'DAILY':
                        nextDate = addDays(nextDate, interval);
                        break;
                    case 'WEEKLY':
                        nextDate = addWeeks(nextDate, interval);
                        // TODO: Obsługa days_of_week jeśli potrzebna
                        break;
                    case 'MONTHLY':
                        nextDate = addMonths(nextDate, interval);
                        if (pattern.day_of_month) {
                            const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
                            nextDate.setDate(Math.min(pattern.day_of_month, lastDayOfMonth));
                        }
                        break;
                    case 'YEARLY':
                        nextDate = addYears(nextDate, interval);
                        break;
                    default:
                        console.warn('Unknown frequency:', frequency);
                        return undefined;
                }

                // Sprawdź czy data jest w przyszłości
                if (isAfter(nextDate, today)) {
                    // Sprawdź warunki zakończenia
                    if (pattern.end_date) {
                        const endDate = new Date(pattern.end_date);
                        if (isAfter(nextDate, endDate)) {
                            return undefined; // Przekroczono datę końcową
                        }
                    }
                    return nextDate.toISOString();
                }

                iterations++;

                // Dodatkowe logowanie co 50 iteracji
                if (iterations % 50 === 0) {
                }
            }

            console.warn('❌ Max iterations reached without finding next occurrence');
            return undefined;
        } catch (error) {
            console.error('❌ Error calculating next occurrence:', error);
            return undefined;
        }
    }

    /**
     * Fetch occurrence statistics for an event
     * NOWA FUNKCJA: Pobiera statystyki wystąpień dla wydarzenia
     */
    private async fetchEventOccurrenceStats(eventId: string): Promise<{ total: number; completed: number }> {
        try {
            const stats = await this.getEventStatistics(eventId);
            return {
                total: stats.total || 0,
                completed: stats.completed || 0
            };
        } catch (error) {
            console.warn(`Could not fetch occurrence stats for event ${eventId}:`, error);
            return { total: 0, completed: 0 };
        }
    }

    /**
     * Convert raw server response to frontend format
     */
    private convertRawEventToResponse(raw: any): RecurringEventResponse {
        const pattern = raw.recurrence_pattern || raw.recurrencePattern;

        return {
            id: raw.id,
            title: raw.title,
            description: raw.description,
            type: raw.type,
            recurrencePattern: {
                frequency: pattern.frequency,
                interval: pattern.interval,
                daysOfWeek: pattern.days_of_week || pattern.daysOfWeek,
                dayOfMonth: pattern.day_of_month || pattern.dayOfMonth,
                endDate: (pattern.end_date || pattern.endDate) && Array.isArray(pattern.end_date || pattern.endDate)
                    ? this.convertLocalDateTimeArray(pattern.end_date || pattern.endDate)
                    : (pattern.end_date || pattern.endDate),
                maxOccurrences: pattern.max_occurrences || pattern.maxOccurrences
            },
            isActive: raw.is_active ?? raw.isActive,
            visitTemplate: raw.visit_template || raw.visitTemplate ? {
                clientId: (raw.visit_template || raw.visitTemplate).client_id || (raw.visit_template || raw.visitTemplate).clientId,
                vehicleId: (raw.visit_template || raw.visitTemplate).vehicle_id || (raw.visit_template || raw.visitTemplate).vehicleId,
                estimatedDurationMinutes: (raw.visit_template || raw.visitTemplate).estimated_duration_minutes || (raw.visit_template || raw.visitTemplate).estimatedDurationMinutes,
                defaultServices: ((raw.visit_template || raw.visitTemplate).default_services || (raw.visit_template || raw.visitTemplate).defaultServices || []).map((service: any) => ({
                    name: service.name,
                    basePrice: service.base_price || service.basePrice
                })),
                notes: (raw.visit_template || raw.visitTemplate).notes
            } : undefined,
            createdAt: this.convertLocalDateTimeArray(raw.created_at || raw.createdAt),
            updatedAt: this.convertLocalDateTimeArray(raw.updated_at || raw.updatedAt)
        };
    }

    /**
     * Convert raw server list item to frontend format
     * FIXED: Proper handling of missing fields with calculations and synchronous approach
     */
    private convertRawEventToListItem(raw: any): RecurringEventListItem {

        const createdAt = Array.isArray(raw.created_at)
            ? this.convertLocalDateTimeArray(raw.created_at)
            : raw.created_at || raw.createdAt;

        // POPRAWKA 1: Właściwe mapowanie frequency z recurrence_pattern
        const recurrencePattern = raw.recurrence_pattern || raw.recurrencePattern;
        const frequency = recurrencePattern?.frequency;

        // POPRAWKA 2: Oblicz następne wystąpienie jeśli nie ma w odpowiedzi
        let nextOccurrence = raw.next_occurrence || raw.nextOccurrence;
        if (!nextOccurrence && raw.is_active !== false && recurrencePattern) {
            nextOccurrence = this.calculateNextOccurrence(recurrencePattern, createdAt);
        }

        // POPRAWKA 3: Lepsze mapowanie statystyk z serwera
        let totalOccurrences = raw.total_occurrences ?? raw.totalOccurrences;
        let completedOccurrences = raw.completed_occurrences ?? raw.completedOccurrences;

        // KLUCZOWA NAPRAWKA: Jeśli brakuje statystyk w odpowiedzi serwera, ustaw wartości domyślne
        // ale nie pokazuj "Ładowanie..." - pokaż rzeczywiste dane (może być 0 dla nowych wydarzeń)
        if (totalOccurrences === undefined || totalOccurrences === null) {
            totalOccurrences = 0;
        }

        if (completedOccurrences === undefined || completedOccurrences === null) {
            completedOccurrences = 0;
        }

        const listItem: RecurringEventListItem = {
            id: raw.id,
            title: raw.title,
            type: raw.type,
            frequency: frequency as RecurrenceFrequency,
            isActive: raw.is_active ?? raw.isActive ?? true,
            nextOccurrence: nextOccurrence,
            totalOccurrences: totalOccurrences,      // POPRAWKA: Zawsze number, nie undefined
            completedOccurrences: completedOccurrences, // POPRAWKA: Zawsze number, nie undefined
            createdAt: createdAt,
            updatedAt: Array.isArray(raw.updated_at)
                ? this.convertLocalDateTimeArray(raw.updated_at)
                : raw.updated_at || raw.updatedAt
        };

        // POPRAWKA 4: Asynchroniczne odświeżanie statystyk TYLKO jeśli są rzeczywiście zero
        // (może to oznaczać brak danych w cache serwera)
        if (totalOccurrences === 0 && completedOccurrences === 0) {

            // To nie blokuje renderowania - działa w tle
            this.fetchEventOccurrenceStats(raw.id).then(stats => {

                // Jeśli rzeczywiste statystyki różnią się od zera,
                // możemy zaktualizować cache lub wywołać odświeżenie
                if (stats.total > 0 || stats.completed > 0) {
                    // Tutaj można dodać mechanizm odświeżania UI jeśli potrzeba
                }
            }).catch(err => {
                console.warn(`Could not fetch background stats for ${raw.id}:`, err);
            });
        }

        return listItem;
    }

    /**
     * Convert Spring Boot page response to our frontend format
     * UPDATED: Back to synchronous conversion since we fixed the mapping
     */
    private convertPaginationResponse<T>(
        springResponse: SpringPageResponse<any>,
        converter?: (item: any) => T
    ): ConvertedPaginationResponse<T> {
        let convertedData: T[];

        if (converter) {
            convertedData = springResponse.content.map(converter);
        } else {
            convertedData = springResponse.content;
        }

        return {
            data: convertedData,
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

            const response = await apiClientNew.post<RawRecurringEventResponse>(
                this.baseEndpoint,
                data,
                {timeout: 15000}
            );

            const converted = this.convertRawEventToResponse(response);
            return converted;

        } catch (error) {
            console.error('❌ Error creating recurring event:', error);
            throw new Error(this.extractErrorMessage(error));
        }
    }

    /**
     * Fetches paginated list of recurring events
     * FIXED: Back to synchronous conversion with better logging
     */
    async getRecurringEventsList(params: RecurringEventsListParams = {}): Promise<ConvertedPaginationResponse<RecurringEventListItem>> {
        try {

            const {page = 0, size = 20, sortBy = 'updatedAt', sortOrder = 'desc', ...filterParams} = params;

            // Convert our params to Spring Boot format
            const springParams = {
                page,
                size,
                sortBy,
                sortDirection: sortOrder.toUpperCase(), // Spring expects UPPERCASE
                type: filterParams.type,
                activeOnly: filterParams.isActive,
                ...(filterParams.search && {search: filterParams.search})
            };

            const springResponse = await apiClientNew.get<SpringPageResponse<any>>(
                this.baseEndpoint,
                springParams,
                {timeout: 10000}
            );

            // UPDATED: Use synchronous converter
            const converted = this.convertPaginationResponse(
                springResponse,
                (item) => {
                    const listItem = this.convertRawEventToListItem(item);
                    return listItem;
                }
            );

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

            const response = await apiClientNew.get<RawRecurringEventResponse>(
                `${this.baseEndpoint}/${eventId}`,
                {},
                {timeout: 10000}
            );

            const converted = this.convertRawEventToResponse(response);
            return converted;

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

            const response = await apiClientNew.put<RawRecurringEventResponse>(
                `${this.baseEndpoint}/${eventId}`,
                data,
                {timeout: 15000}
            );

            const converted = this.convertRawEventToResponse(response);
            return converted;

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

            const response = await apiClientNew.delete<{ message: string; deleted: boolean }>(
                `${this.baseEndpoint}/${eventId}`,
                {timeout: 10000}
            );
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

            const response = await apiClientNew.patch<RawRecurringEventResponse>(
                `${this.baseEndpoint}/${eventId}/deactivate`,
                {},
                {timeout: 10000}
            );

            const converted = this.convertRawEventToResponse(response);
            return converted;

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

            const response = await apiClientNew.get<any[]>(
                `${this.baseEndpoint}/${eventId}/occurrences`,
                {
                    startDate: startDate,
                    endDate: endDate
                },
                {timeout: 10000}
            );

            const converted = response.map(occurrence => ({
                id: occurrence.id,
                recurringEventId: occurrence.recurring_event_id || occurrence.recurringEventId,
                scheduledDate: Array.isArray(occurrence.scheduled_date)
                    ? this.convertLocalDateTimeArray(occurrence.scheduled_date)
                    : occurrence.scheduled_date || occurrence.scheduledDate,
                status: occurrence.status,
                actualVisitId: occurrence.actual_visit_id || occurrence.actualVisitId,
                completedAt: occurrence.completed_at && Array.isArray(occurrence.completed_at)
                    ? this.convertLocalDateTimeArray(occurrence.completed_at)
                    : occurrence.completed_at || occurrence.completedAt,
                notes: occurrence.notes,
                createdAt: Array.isArray(occurrence.created_at)
                    ? this.convertLocalDateTimeArray(occurrence.created_at)
                    : occurrence.created_at || occurrence.createdAt,
                updatedAt: Array.isArray(occurrence.updated_at)
                    ? this.convertLocalDateTimeArray(occurrence.updated_at)
                    : occurrence.updated_at || occurrence.updatedAt
            }));
            return converted;

        } catch (error) {
            console.error('❌ Error fetching event occurrences:', error);
            return [];
        }
    }

    /**
     * Fetches all occurrences for a specific event with pagination
     */
    async getAllEventOccurrences(eventId: string, params: PaginationParams = {}): Promise<ConvertedPaginationResponse<EventOccurrenceResponse>> {
        try {

            const {page = 0, size = 50} = params;

            const springResponse = await apiClientNew.get<SpringPageResponse<any>>(
                `${this.baseEndpoint}/${eventId}/occurrences/all`,
                {page, size},
                {timeout: 10000}
            );

            const converter = (occurrence: any): EventOccurrenceResponse => ({
                id: occurrence.id,
                recurringEventId: occurrence.recurring_event_id || occurrence.recurringEventId,
                scheduledDate: Array.isArray(occurrence.scheduled_date)
                    ? this.convertLocalDateTimeArray(occurrence.scheduled_date)
                    : occurrence.scheduled_date || occurrence.scheduledDate,
                status: occurrence.status,
                actualVisitId: occurrence.actual_visit_id || occurrence.actualVisitId,
                completedAt: occurrence.completed_at && Array.isArray(occurrence.completed_at)
                    ? this.convertLocalDateTimeArray(occurrence.completed_at)
                    : occurrence.completed_at || occurrence.completedAt,
                notes: occurrence.notes,
                createdAt: Array.isArray(occurrence.created_at)
                    ? this.convertLocalDateTimeArray(occurrence.created_at)
                    : occurrence.created_at || occurrence.createdAt,
                updatedAt: Array.isArray(occurrence.updated_at)
                    ? this.convertLocalDateTimeArray(occurrence.updated_at)
                    : occurrence.updated_at || occurrence.updatedAt
            });

            const converted = this.convertPaginationResponse(springResponse, converter);

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

            const response = await apiClientNew.patch<any>(
                `${this.baseEndpoint}/${eventId}/occurrences/${occurrenceId}/status`,
                data,
                {timeout: 10000}
            );

            const converted: EventOccurrenceResponse = {
                id: response.id,
                recurringEventId: response.recurring_event_id || response.recurringEventId,
                scheduledDate: Array.isArray(response.scheduled_date)
                    ? this.convertLocalDateTimeArray(response.scheduled_date)
                    : response.scheduled_date || response.scheduledDate,
                status: response.status,
                actualVisitId: response.actual_visit_id || response.actualVisitId,
                completedAt: response.completed_at && Array.isArray(response.completed_at)
                    ? this.convertLocalDateTimeArray(response.completed_at)
                    : response.completed_at || response.completedAt,
                notes: response.notes,
                createdAt: Array.isArray(response.created_at)
                    ? this.convertLocalDateTimeArray(response.created_at)
                    : response.created_at || response.createdAt,
                updatedAt: Array.isArray(response.updated_at)
                    ? this.convertLocalDateTimeArray(response.updated_at)
                    : response.updated_at || response.updatedAt
            };
            return converted;

        } catch (error) {
            console.error('❌ Error updating occurrence status:', error);
            throw new Error(this.extractErrorMessage(error));
        }
    }

    /**
     * Converts an occurrence to a full visit
     */
    async convertOccurrenceToVisit(
        eventId: string,
        occurrenceId: string,
        data: ConvertToVisitRequest
    ): Promise<ConvertToVisitResponse> {
        try {

            const response = await apiClientNew.post<any>(
                `${this.baseEndpoint}/${eventId}/occurrences/${occurrenceId}/convert-to-visit`,
                data,
                { timeout: 15000 }
            );

            const converted: ConvertToVisitResponse = {
                id: response.id,
                title: response.title,
                clientId: response.client_id,
                vehicleId: response.vehicle_id,
                startDate: Array.isArray(response.start_date)
                    ? this.convertLocalDateTimeArray(response.start_date)
                    : response.start_date,
                endDate: Array.isArray(response.end_date)
                    ? this.convertLocalDateTimeArray(response.end_date)
                    : response.end_date,
                status: response.status,
                services: response.services || [],
                totalAmount: response.total_amount || 0,
                serviceCount: response.service_count || 0,
                notes: response.notes,
                referralSource: response.referral_source,
                appointmentId: response.appointment_id,
                calendarColorId: response.calendar_color_id || '',
                keysProvided: response.keys_provided || false,
                documentsProvided: response.documents_provided || false,
                createdAt: Array.isArray(response.created_at)
                    ? this.convertLocalDateTimeArray(response.created_at)
                    : response.created_at,
                updatedAt: Array.isArray(response.updated_at)
                    ? this.convertLocalDateTimeArray(response.updated_at)
                    : response.updated_at
            };
            return converted;

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

            const apiParams = {
                startDate: params.startDate,
                endDate: params.endDate
            };

            const response = await apiClientNew.get<any[]>(
                `${this.baseEndpoint}/calendar`,
                apiParams,
                {timeout: 10000}
            );

            const converted = response.map(occurrence => ({
                id: occurrence.id,
                recurringEventId: occurrence.recurring_event_id || occurrence.recurringEventId,
                scheduledDate: Array.isArray(occurrence.scheduled_date)
                    ? this.convertLocalDateTimeArray(occurrence.scheduled_date)
                    : occurrence.scheduled_date || occurrence.scheduledDate,
                status: occurrence.status,
                actualVisitId: occurrence.actual_visit_id || occurrence.actualVisitId,
                completedAt: occurrence.completed_at && Array.isArray(occurrence.completed_at)
                    ? this.convertLocalDateTimeArray(occurrence.completed_at)
                    : occurrence.completed_at || occurrence.completedAt,
                notes: occurrence.notes,
                createdAt: Array.isArray(occurrence.created_at)
                    ? this.convertLocalDateTimeArray(occurrence.created_at)
                    : occurrence.created_at || occurrence.createdAt,
                updatedAt: Array.isArray(occurrence.updated_at)
                    ? this.convertLocalDateTimeArray(occurrence.updated_at)
                    : occurrence.updated_at || occurrence.updatedAt
            }));
            return converted;

        } catch (error) {
            console.error('❌ Error fetching event calendar:', error);
            return [];
        }
    }

    async getEventCalendarWithDetails(params: EventCalendarParams): Promise<EventOccurrenceWithDetailsResponse[]> {
        try {

            const apiParams = {
                start_date: params.startDate,
                end_date: params.endDate,
                includeEventDetails: 'true'
            };

            const response = await apiClientNew.get<EventOccurrenceWithDetailsResponse[]>(
                `${this.baseEndpoint}/calendar/detailed`,
                apiParams,
                {timeout: 15000}
            );

            const converted = response.map(occurrence => ({
                id: occurrence.id,
                recurringEventId: occurrence.recurringEventId,
                scheduledDate: Array.isArray(occurrence.scheduledDate)
                    ? this.convertLocalDateTimeArray(occurrence.scheduledDate)
                    : occurrence.scheduledDate,
                status: occurrence.status,
                actualVisitId: occurrence.actualVisitId,
                completedAt: occurrence.completedAt && Array.isArray(occurrence.completedAt)
                    ? this.convertLocalDateTimeArray(occurrence.completedAt)
                    : occurrence.completedAt,
                notes: occurrence.notes,
                createdAt: Array.isArray(occurrence.createdAt)
                    ? this.convertLocalDateTimeArray(occurrence.createdAt)
                    : occurrence.createdAt,
                updatedAt: Array.isArray(occurrence.updatedAt)
                    ? this.convertLocalDateTimeArray(occurrence.updatedAt)
                    : occurrence.updatedAt,

                recurringEventDetails: occurrence.recurringEventDetails ? {
                    id: occurrence.recurringEventDetails.id,
                    title: occurrence.recurringEventDetails.title,
                    description: occurrence.recurringEventDetails.description,
                    type: occurrence.recurringEventDetails.type,
                    recurrencePattern: {
                        frequency: occurrence.recurringEventDetails.recurrencePattern?.frequency ||
                            occurrence.recurringEventDetails.recurrence_pattern?.frequency,
                        interval: occurrence.recurringEventDetails.recurrencePattern?.interval ||
                            occurrence.recurringEventDetails.recurrence_pattern?.interval,
                        daysOfWeek: occurrence.recurringEventDetails.recurrencePattern?.daysOfWeek ||
                            occurrence.recurringEventDetails.recurrence_pattern?.days_of_week,
                        dayOfMonth: occurrence.recurringEventDetails.recurrencePattern?.dayOfMonth ||
                            occurrence.recurringEventDetails.recurrence_pattern?.day_of_month,
                        endDate: occurrence.recurringEventDetails.recurrencePattern?.endDate ||
                            occurrence.recurringEventDetails.recurrence_pattern?.end_date,
                        maxOccurrences: occurrence.recurringEventDetails.recurrencePattern?.maxOccurrences ||
                            occurrence.recurringEventDetails.recurrence_pattern?.max_occurrences
                    },
                    isActive: occurrence.recurringEventDetails.isActive ?? occurrence.recurringEventDetails.is_active ?? true,
                    visitTemplate: occurrence.recurringEventDetails.visitTemplate || occurrence.recurringEventDetails.visit_template ? {
                        clientId: (occurrence.recurringEventDetails.visitTemplate || occurrence.recurringEventDetails.visit_template).clientId ||
                            (occurrence.recurringEventDetails.visitTemplate || occurrence.recurringEventDetails.visit_template).client_id,
                        vehicleId: (occurrence.recurringEventDetails.visitTemplate || occurrence.recurringEventDetails.visit_template).vehicleId ||
                            (occurrence.recurringEventDetails.visitTemplate || occurrence.recurringEventDetails.visit_template).vehicle_id,
                        estimatedDurationMinutes: (occurrence.recurringEventDetails.visitTemplate || occurrence.recurringEventDetails.visit_template).estimatedDurationMinutes ||
                            (occurrence.recurringEventDetails.visitTemplate || occurrence.recurringEventDetails.visit_template).estimated_duration_minutes,
                        defaultServices: ((occurrence.recurringEventDetails.visitTemplate || occurrence.recurringEventDetails.visit_template).defaultServices ||
                            (occurrence.recurringEventDetails.visitTemplate || occurrence.recurringEventDetails.visit_template).default_services || []).map((service: any) => ({
                            name: service.name,
                            basePrice: service.basePrice || service.base_price
                        })),
                        notes: (occurrence.recurringEventDetails.visitTemplate || occurrence.recurringEventDetails.visit_template).notes
                    } : undefined,
                    createdAt: Array.isArray(occurrence.recurringEventDetails.createdAt || occurrence.recurringEventDetails.created_at)
                        ? this.convertLocalDateTimeArray(occurrence.recurringEventDetails.createdAt || occurrence.recurringEventDetails.created_at)
                        : occurrence.recurringEventDetails.createdAt || occurrence.recurringEventDetails.created_at,
                    updatedAt: Array.isArray(occurrence.recurringEventDetails.updatedAt || occurrence.recurringEventDetails.updated_at)
                        ? this.convertLocalDateTimeArray(occurrence.recurringEventDetails.updatedAt || occurrence.recurringEventDetails.updated_at)
                        : occurrence.recurringEventDetails.updatedAt || occurrence.recurringEventDetails.updated_at
                } : undefined
            }));

            return converted;

        } catch (error) {
            console.error('❌ Error fetching calendar events with details:', error);
            try {
                const basicEvents = await this.getEventCalendar(params);
                return basicEvents.map(event => ({
                    ...event,
                    recurringEventDetails: undefined
                }));
            } catch (fallbackError) {
                console.error('❌ Fallback also failed:', fallbackError);
                return [];
            }
        }
    }

    /**
     * Fetches upcoming events/occurrences
     */
    async getUpcomingEvents(days: number = 7): Promise<EventOccurrenceResponse[]> {
        try {

            const response = await apiClientNew.get<any[]>(
                `${this.baseEndpoint}/upcoming`,
                { days },
                { timeout: 10000 }
            );

            const converted = response.map(occurrence => ({
                id: occurrence.id,
                recurringEventId: occurrence.recurring_event_id || occurrence.recurringEventId,
                scheduledDate: Array.isArray(occurrence.scheduled_date)
                    ? this.convertLocalDateTimeArray(occurrence.scheduled_date)
                    : occurrence.scheduled_date || occurrence.scheduledDate,
                status: occurrence.status,
                actualVisitId: occurrence.actual_visit_id || occurrence.actualVisitId,
                completedAt: occurrence.completed_at && Array.isArray(occurrence.completed_at)
                    ? this.convertLocalDateTimeArray(occurrence.completed_at)
                    : occurrence.completed_at || occurrence.completedAt,
                notes: occurrence.notes,
                createdAt: Array.isArray(occurrence.created_at)
                    ? this.convertLocalDateTimeArray(occurrence.created_at)
                    : occurrence.created_at || occurrence.createdAt,
                updatedAt: Array.isArray(occurrence.updated_at)
                    ? this.convertLocalDateTimeArray(occurrence.updated_at)
                    : occurrence.updated_at || occurrence.updatedAt
            }));
            return converted;

        } catch (error) {
            console.error('❌ Error fetching upcoming events:', error);
            return [];
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

            const response = await apiClientNew.get<{ total: number; completed: number; pending: number; cancelled: number }>(
                `${this.baseEndpoint}/${eventId}/statistics`,
                {},
                { timeout: 10000 }
            );
            return response;

        } catch (error) {
            console.error('❌ Error fetching event statistics:', error);
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

            const params = type ? { type } : {};
            const response = await apiClientNew.get<{ count: number }>(
                `${this.baseEndpoint}/count`,
                params,
                { timeout: 5000 }
            );
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
     */
    async getRecurringEventsStatistics(): Promise<RecurringEventStatistics> {
        try {
            const countResult = await this.getRecurringEventsCount();

            return {
                totalEvents: countResult.count,
                activeEvents: countResult.count,
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
        console.warn('Bulk update not supported by server API - would need individual calls');
        throw new Error('Bulk operations not supported by current API');
    }

    /**
     * Placeholder for pattern validation (not in server API)
     */
    async validateRecurrencePattern(pattern: any): Promise<PatternValidationResult> {

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