// src/types/recurringEvents.ts
/**
 * TypeScript types for Recurring Events module
 * Based on the API specification and frontend requirements
 */

// ========================================================================================
// ENUMS
// ========================================================================================

export enum EventType {
    SIMPLE_EVENT = 'SIMPLE_EVENT',        // Pojedyncze wydarzenie (np. wymiana filtra)
    RECURRING_VISIT = 'RECURRING_VISIT'   // Cykliczna wizyta z szablonem
}

export enum RecurrenceFrequency {
    DAILY = 'DAILY',       // Codziennie
    WEEKLY = 'WEEKLY',     // Tygodniowo
    MONTHLY = 'MONTHLY',   // Miesięcznie
    YEARLY = 'YEARLY'      // Rocznie
}

export enum OccurrenceStatus {
    PLANNED = 'PLANNED',                           // Zaplanowane
    COMPLETED = 'COMPLETED',                       // Ukończone
    CONVERTED_TO_VISIT = 'CONVERTED_TO_VISIT',     // Przekształcone na wizytę
    SKIPPED = 'SKIPPED',                           // Pominięte
    CANCELLED = 'CANCELLED'                        // Anulowane
}

// ========================================================================================
// LABELS & COLORS
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
    [OccurrenceStatus.PLANNED]: '#3498db',           // Niebieski
    [OccurrenceStatus.COMPLETED]: '#2ecc71',         // Zielony
    [OccurrenceStatus.CONVERTED_TO_VISIT]: '#9b59b6', // Fioletowy
    [OccurrenceStatus.SKIPPED]: '#95a5a6',           // Szary
    [OccurrenceStatus.CANCELLED]: '#e74c3c'          // Czerwony
};

// ========================================================================================
// REQUEST TYPES
// ========================================================================================

export interface RecurrencePatternRequest {
    frequency: RecurrenceFrequency;
    interval: number;                    // Co ile jednostek powtarzać (np. co 2 tygodnie)
    daysOfWeek?: string[];              // Dni tygodnia dla WEEKLY (np. ["MON", "FRI"])
    dayOfMonth?: number;                // Dzień miesiąca dla MONTHLY (1-31)
    endDate?: string;                   // Data zakończenia (ISO format)
    maxOccurrences?: number;            // Maksymalna liczba wystąpień
}

export interface ServiceTemplateRequest {
    name: string;
    basePrice: number;
}

export interface VisitTemplateRequest {
    clientId?: number;
    vehicleId?: number;
    estimatedDurationMinutes: number;
    defaultServices: ServiceTemplateRequest[];
    notes?: string;
}

export interface CreateRecurringEventRequest {
    title: string;
    description?: string;
    type: EventType;
    recurrencePattern: RecurrencePatternRequest;
    visitTemplate?: VisitTemplateRequest;
}

export interface UpdateRecurringEventRequest extends Partial<CreateRecurringEventRequest> {
    isActive?: boolean;
}

export interface ConvertToVisitRequest {
    clientId: number;
    vehicleId: number;
    additionalServices: AdditionalServiceRequest[];
    notes?: string;
}

export interface AdditionalServiceRequest {
    name: string;
    basePrice: number;
}

export interface UpdateOccurrenceStatusRequest {
    status: OccurrenceStatus;
    notes?: string;
}

export interface AddOccurrenceNotesRequest {
    notes: string;
}

// ========================================================================================
// RESPONSE TYPES
// ========================================================================================

export interface RecurrencePatternResponse {
    frequency: RecurrenceFrequency;
    interval: number;
    daysOfWeek?: string[];
    dayOfMonth?: number;
    endDate?: string;
    maxOccurrences?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ServiceTemplateResponse {
    id: string;
    name: string;
    basePrice: number;
    createdAt: string;
}

export interface VisitTemplateResponse {
    id: string;
    clientId?: number;
    clientName?: string;
    vehicleId?: number;
    vehicleName?: string;
    estimatedDurationMinutes: number;
    defaultServices: ServiceTemplateResponse[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RecurringEventResponse {
    id: string;
    title: string;
    description?: string;
    type: EventType;
    recurrencePattern: RecurrencePatternResponse;
    isActive: boolean;
    visitTemplate?: VisitTemplateResponse;
    createdAt: string;
    updatedAt: string;

    // Statistics (computed fields)
    totalOccurrences?: number;
    completedOccurrences?: number;
    convertedOccurrences?: number;
    nextOccurrenceDate?: string;
}

export interface EventOccurrenceResponse {
    id: string;
    recurringEventId: string;
    scheduledDate: string;
    status: OccurrenceStatus;
    actualVisitId?: string;
    completedAt?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;

    // Related data
    recurringEvent?: RecurringEventResponse;
    visit?: any; // Reference to actual visit if converted
}

// ========================================================================================
// UI COMPONENT PROPS
// ========================================================================================

export interface RecurringEventFormData {
    title: string;
    description?: string;  // Zmienione z string na string | undefined
    type: EventType;
    recurrencePattern: RecurrencePatternRequest;
    visitTemplate?: VisitTemplateRequest;  // Pozostaje opcjonalne
}

export interface RecurrencePatternFormData extends RecurrencePatternRequest {}
// ========================================================================================
// LIST & PAGINATION
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
    page?: number;
    size?: number;
    type?: EventType;
    isActive?: boolean;
    search?: string;
    sortBy?: 'title' | 'createdAt' | 'nextOccurrence';
    sortOrder?: 'asc' | 'desc';
}

// ========================================================================================
// CALENDAR INTEGRATION
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
    startDate: string;
    endDate: string;
    eventTypes?: EventType[];
    statuses?: OccurrenceStatus[];
}

// ========================================================================================
// STATISTICS
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

// ========================================================================================
// ERROR HANDLING
// ========================================================================================

export interface RecurringEventError {
    code: string;
    message: string;
    field?: string;
    details?: Record<string, any>;
}

export interface RecurringEventValidationError {
    field: string;
    message: string;
    value?: any;
}

// ========================================================================================
// BULK OPERATIONS
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
// VISIT INTEGRATION
// ========================================================================================

// Extension of existing CreateVisitRequest for recurring visits
export interface CreateVisitRequestExtended {
    // Standard visit fields (from existing types)
    title: string;
    clientId: number;
    vehicleId: number;
    startDate: string;
    endDate: string;
    notes?: string;
    selectedServices: any[];

    // Recurring visit specific fields
    isRecurring?: boolean;
    recurrencePattern?: RecurrencePatternRequest;
}

// ========================================================================================
// PREVIEW & VALIDATION
// ========================================================================================

export interface RecurrencePreview {
    dates: string[];                    // Generated dates based on pattern
    totalCount: number;                 // Total number of occurrences
    firstOccurrence: string;            // First occurrence date
    lastOccurrence?: string;            // Last occurrence date (if has end)
    hasEndDate: boolean;                // Whether pattern has end date
    warnings: string[];                 // Any warnings about the pattern
}

export interface PatternValidationResult {
    isValid: boolean;
    errors: RecurringEventValidationError[];
    warnings: string[];
    preview?: RecurrencePreview;
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
    startTime: string;  // HH:mm format
    endTime: string;    // HH:mm format
}