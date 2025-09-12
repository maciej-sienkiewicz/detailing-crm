// src/types/recurringEvents.ts
/**
 * TypeScript types for Recurring Events module
 * UPDATED TO MATCH ACTUAL SERVER API
 */

// ========================================================================================
// ENUMS (Updated to match server)
// ========================================================================================

export enum EventType {
    SIMPLE_EVENT = 'SIMPLE_EVENT',
    RECURRING_VISIT = 'RECURRING_VISIT'
}

export enum RecurrenceFrequency {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY'
}

export enum OccurrenceStatus {
    PLANNED = 'PLANNED',
    COMPLETED = 'COMPLETED',
    CONVERTED_TO_VISIT = 'CONVERTED_TO_VISIT',
    SKIPPED = 'SKIPPED',
    CANCELLED = 'CANCELLED'
}

// ========================================================================================
// LABELS & COLORS (Same as before)
// ========================================================================================

export const EventTypeLabels: Record<EventType, string> = {
    [EventType.SIMPLE_EVENT]: 'Pojedyncze wydarzenie',
    [EventType.RECURRING_VISIT]: 'Cykliczna wizyta'
};

export const RecurrenceFrequencyLabels: Record<RecurrenceFrequency, string> = {
    [RecurrenceFrequency.DAILY]: 'Codziennie',
    [RecurrenceFrequency.WEEKLY]: 'Tygodniowo',
    [RecurrenceFrequency.MONTHLY]: 'Miesięcznie',
    [RecurrenceFrequency.YEARLY]: 'Rocznie'
};

export const OccurrenceStatusLabels: Record<OccurrenceStatus, string> = {
    [OccurrenceStatus.PLANNED]: 'Zaplanowane',
    [OccurrenceStatus.COMPLETED]: 'Ukończone',
    [OccurrenceStatus.CONVERTED_TO_VISIT]: 'Przekształcone na wizytę',
    [OccurrenceStatus.SKIPPED]: 'Pominięte',
    [OccurrenceStatus.CANCELLED]: 'Anulowane'
};

export const OccurrenceStatusColors: Record<OccurrenceStatus, string> = {
    [OccurrenceStatus.PLANNED]: '#3498db',
    [OccurrenceStatus.COMPLETED]: '#2ecc71',
    [OccurrenceStatus.CONVERTED_TO_VISIT]: '#9b59b6',
    [OccurrenceStatus.SKIPPED]: '#95a5a6',
    [OccurrenceStatus.CANCELLED]: '#e74c3c'
};

// ========================================================================================
// REQUEST TYPES (Updated to match server API)
// ========================================================================================

export interface RecurrencePatternRequest {
    frequency: RecurrenceFrequency;
    interval: number;
    daysOfWeek?: string[];
    dayOfMonth?: number;
    endDate?: string; // LocalDate format: YYYY-MM-DD
    maxOccurrences?: number;
}

export interface ServiceTemplateRequest {
    name: string;
    basePrice: number; // Maps to BigDecimal on server
}

export interface VisitTemplateRequest {
    clientId?: number; // Maps to client_id (long)
    vehicleId?: number; // Maps to vehicle_id (long)
    estimatedDurationMinutes: number; // Maps to estimated_duration_minutes (long)
    defaultServices: ServiceTemplateRequest[];
    notes?: string;
}

export interface CreateRecurringEventRequest {
    title: string; // max 200 chars
    description?: string; // max 1000 chars
    type: EventType;
    recurrencePattern: RecurrencePatternRequest; // Maps to recurrence_pattern
    visitTemplate?: VisitTemplateRequest; // Maps to visit_template
}

export interface UpdateRecurringEventRequest {
    title?: string;
    description?: string;
    recurrencePattern: RecurrencePatternRequest;
    visitTemplate?: VisitTemplateRequest;
}

export interface ConvertToVisitRequest {
    clientId: number; // Maps to client_id (long)
    vehicleId: number; // Maps to vehicle_id (long)
    additionalServices: Array<{
        name: string;
        basePrice: number; // Maps to base_price (BigDecimal)
        quantity?: number; // Server API supports quantity, defaults to 1
    }>; // Maps to additional_services
    notes?: string;
}

export interface UpdateOccurrenceStatusRequest {
    status: OccurrenceStatus;
    notes?: string;
}

// ========================================================================================
// RESPONSE TYPES (Updated to match server API)
// ========================================================================================

export interface RecurrencePatternResponse {
    frequency: RecurrenceFrequency;
    interval: number;
    daysOfWeek?: string[];
    dayOfMonth?: number;
    endDate?: string; // LocalDateTime from server
    maxOccurrences?: number;
}

export interface ServiceTemplateResponse {
    name: string;
    basePrice: number; // BigDecimal from server
}

export interface VisitTemplateResponse {
    clientId?: number;
    clientName?: string; // Not in server API - would need separate lookup
    vehicleId?: number;
    vehicleName?: string; // Not in server API - would need separate lookup
    estimatedDurationMinutes: number;
    defaultServices: ServiceTemplateResponse[];
    notes?: string;
}

export interface RecurringEventResponse {
    id: string;
    title: string;
    description?: string;
    type: EventType;
    recurrencePattern: RecurrencePatternResponse; // Maps from recurrence_pattern
    isActive: boolean; // Maps from is_active
    visitTemplate?: VisitTemplateResponse; // Maps from visit_template
    createdAt: string; // LocalDateTime from server
    updatedAt: string; // LocalDateTime from server
}

export interface EventOccurrenceResponse {
    id: string;
    recurringEventId: string; // Maps from recurring_event_id
    scheduledDate: string; // LocalDateTime from server
    status: OccurrenceStatus;
    actualVisitId?: string; // Maps from actual_visit_id
    completedAt?: string; // LocalDateTime from server
    notes?: string;
    createdAt: string; // LocalDateTime from server
    updatedAt: string; // LocalDateTime from server
    recurringEvent?: RecurringEventResponse; // Not in server API - populated by client if needed
}

// ========================================================================================
// LIST & PAGINATION (Updated for Spring Boot pagination)
// ========================================================================================

export interface RecurringEventListItem {
    id: string;
    title: string;
    type: EventType;
    frequency: RecurrenceFrequency;
    isActive: boolean;
    nextOccurrence?: string;
    totalOccurrences: number;
    completedOccurrences: number;
    createdAt: string;
    updatedAt: string;
}

export interface RecurringEventsListParams {
    page?: number; // Spring Boot pagination starts from 0
    size?: number; // Default 20 according to API docs
    sortBy?: string; // Default 'updatedAt'
    sortOrder?: 'asc' | 'desc'; // Maps to sortDirection (ASC/DESC) on server
    type?: EventType;
    isActive?: boolean; // Maps to activeOnly on server
    search?: string; // If supported by server
}

// ========================================================================================
// CALENDAR INTEGRATION (Updated)
// ========================================================================================

export interface EventCalendarItem {
    id: string;
    recurringEventId: string;
    title: string;
    date: string;
    status: OccurrenceStatus;
    type: EventType;
    duration?: number;
}

export interface EventCalendarParams {
    startDate: string; // LocalDate format: YYYY-MM-DD (maps to start_date)
    endDate: string;   // LocalDate format: YYYY-MM-DD (maps to end_date)
}

// ========================================================================================
// STATISTICS (Updated to match server API)
// ========================================================================================

export interface RecurringEventStatistics {
    totalEvents: number;
    activeEvents: number;
    inactiveEvents: number;
    totalOccurrences: number;
    completedOccurrences: number;
    convertedOccurrences: number;
    skippedOccurrences: number;
    cancelledOccurrences: number;
    upcomingOccurrences: number;
}

export interface EventOccurrenceStatistics {
    eventId: string;
    totalOccurrences: number;
    completedOccurrences: number;
    convertedOccurrences: number;
    skippedOccurrences: number;
    cancelledOccurrences: number;
    completionRate: number;
    conversionRate: number;
    averageTimeToCompletion?: number;
    lastOccurrenceDate?: string;
    nextOccurrenceDate?: string;
}

// Server API statistics response format
export interface ServerEventStatistics {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
}

export interface ServerEventCount {
    count: number;
}

// ========================================================================================
// ERROR HANDLING (Updated)
// ========================================================================================

export interface RecurringEventError {
    error: string;
    message: string;
    details?: string[];
}

export interface RecurringEventValidationError {
    field: string;
    message: string;
    value?: any;
}

// ========================================================================================
// BULK OPERATIONS (Not supported by current server API)
// ========================================================================================

export interface BulkOccurrenceUpdate {
    occurrenceIds: string[];
    status: OccurrenceStatus;
    notes?: string;
}

export interface BulkOccurrenceResult {
    successCount: number;
    failureCount: number;
    failures: Array<{
        occurrenceId: string;
        error: string;
    }>;
}

// ========================================================================================
// PREVIEW & VALIDATION (Client-side only)
// ========================================================================================

export interface RecurrencePreview {
    dates: string[];
    totalCount: number;
    firstOccurrence: string;
    lastOccurrence?: string;
    hasEndDate: boolean;
    warnings: string[];
}

export interface PatternValidationResult {
    isValid: boolean;
    errors: RecurringEventValidationError[];
    warnings: string[];
}

// ========================================================================================
// FORM DATA TYPES (Same as before)
// ========================================================================================

export interface RecurringEventFormData {
    title: string;
    description?: string;
    type: EventType;
    recurrencePattern: RecurrencePatternRequest;
    visitTemplate?: VisitTemplateRequest;
}

// ========================================================================================
// PAGINATION RESPONSE (Spring Boot format)
// ========================================================================================

export interface SpringBootPageResponse<T> {
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

// Frontend pagination format (for compatibility)
export interface FrontendPaginationResponse<T> {
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

// ========================================================================================
// UTILITY TYPES
// ========================================================================================

export type RecurringEventId = string;
export type OccurrenceId = string;
export type VisitId = string;

export interface DateRange {
    start: Date;
    end: Date;
}

export interface TimeRange {
    startTime: string;
    endTime: string;
}