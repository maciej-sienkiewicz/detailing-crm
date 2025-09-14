// src/utils/recurringVisitUtils.ts - NAPRAWIONA WERSJA
import { Appointment } from '../types';
import { EventOccurrenceResponse, EventType, OccurrenceStatus } from '../types/recurringEvents';

// Interfejs dla rzeczywistej struktury danych z API
interface ActualRecurringEventData {
    id: string;
    recurringEventId: string;
    scheduledDate: string;
    status: OccurrenceStatus;
    actualVisitId: string | null;
    completedAt: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    recurringEventDetails?: {
        id: string;
        title: string;
        description: string;
        type: EventType;
        recurrencePattern: any;
        isActive: boolean;
        visitTemplate?: any;
        createdAt: string;
        updatedAt: string;
    };
}

/**
 * Sprawdza czy appointment jest cykliczną wizytą (RECURRING_VISIT)
 */
export const isRecurringVisit = (appointment: Appointment): boolean => {
    const recurringEventData = (appointment as any).recurringEventData as ActualRecurringEventData;

    console.log('🔍 isRecurringVisit - recurringEventData:', recurringEventData);

    if (!recurringEventData) {
        return false;
    }

    // POPRAWKA: Sprawdź czy to jest RECURRING_VISIT przez recurringEventDetails
    if (recurringEventData.recurringEventDetails?.type === EventType.RECURRING_VISIT) {
        console.log('✅ Confirmed RECURRING_VISIT via recurringEventDetails.type');
        return true;
    }

    // Fallback: sprawdź po ID czy zaczyna się od "recurring-"
    const isRecurringId = appointment.id.startsWith('recurring-');
    console.log('🔍 Fallback check - appointment.id starts with "recurring-":', isRecurringId);

    return isRecurringId;
};

/**
 * Sprawdza czy cykliczna wizyta może być przekształcona
 */
export const canConvertToVisit = (appointment: Appointment): boolean => {
    if (!isRecurringVisit(appointment)) {
        console.log('❌ canConvertToVisit - not a recurring visit');
        return false;
    }

    const recurringEventData = (appointment as any).recurringEventData as ActualRecurringEventData;

    if (!recurringEventData) {
        console.log('❌ canConvertToVisit - no recurringEventData');
        return false;
    }

    // POPRAWKA: Sprawdź actualVisitId z rzeczywistej struktury
    if (recurringEventData.actualVisitId) {
        console.log('❌ canConvertToVisit - already has actualVisitId:', recurringEventData.actualVisitId);
        return false;
    }

    // POPRAWKA: Sprawdź status z rzeczywistej struktury
    if (recurringEventData.status === OccurrenceStatus.CANCELLED ||
        recurringEventData.status === OccurrenceStatus.COMPLETED ||
        recurringEventData.status === OccurrenceStatus.CONVERTED_TO_VISIT) {
        console.log('❌ canConvertToVisit - invalid status:', recurringEventData.status);
        return false;
    }

    console.log('✅ canConvertToVisit - can convert');
    return true;
};

/**
 * Sprawdza czy cykliczna wizyta została już przekształcona
 */
export const isAlreadyConverted = (appointment: Appointment): boolean => {
    if (!isRecurringVisit(appointment)) {
        return false;
    }

    const recurringEventData = (appointment as any).recurringEventData as ActualRecurringEventData;

    const hasVisitId = !!recurringEventData?.actualVisitId;
    const isConverted = recurringEventData?.status === OccurrenceStatus.CONVERTED_TO_VISIT;

    console.log('🔍 isAlreadyConverted:', {
        hasVisitId,
        isConverted,
        actualVisitId: recurringEventData?.actualVisitId,
        status: recurringEventData?.status
    });

    return hasVisitId || isConverted;
};

/**
 * Pobiera ID occurrence z cyklicznej wizyty
 */
export const getOccurrenceId = (appointment: Appointment): string | null => {
    const recurringEventData = (appointment as any).recurringEventData as ActualRecurringEventData;
    const occurrenceId = recurringEventData?.id || null;

    console.log('🔍 getOccurrenceId:', occurrenceId);
    return occurrenceId;
};

/**
 * Pobiera ID cyklicznego wydarzenia z cyklicznej wizyty
 */
export const getRecurringEventId = (appointment: Appointment): string | null => {
    const recurringEventData = (appointment as any).recurringEventData as ActualRecurringEventData;
    const eventId = recurringEventData?.recurringEventId || null;

    console.log('🔍 getRecurringEventId:', eventId);
    return eventId;
};

/**
 * Pobiera szczegóły cyklicznego wydarzenia
 */
export const getRecurringEventDetails = (appointment: Appointment): ActualRecurringEventData['recurringEventDetails'] | null => {
    const recurringEventData = (appointment as any).recurringEventData as ActualRecurringEventData;
    return recurringEventData?.recurringEventDetails || null;
};

/**
 * Sprawdza czy cykliczne wydarzenie jest aktywne
 */
export const isRecurringEventActive = (appointment: Appointment): boolean => {
    const details = getRecurringEventDetails(appointment);
    return details?.isActive === true;
};

/**
 * Pobiera tytuł cyklicznego wydarzenia
 */
export const getRecurringEventTitle = (appointment: Appointment): string | null => {
    const details = getRecurringEventDetails(appointment);
    return details?.title || null;
};

/**
 * Pobiera szablon wizyty z cyklicznego wydarzenia
 */
export const getVisitTemplate = (appointment: Appointment): any | null => {
    const details = getRecurringEventDetails(appointment);
    return details?.visitTemplate || null;
};

/**
 * Debug function - wyświetla pełną strukturę danych cyklicznej wizyty
 */
export const debugRecurringVisit = (appointment: Appointment): void => {
    const recurringEventData = (appointment as any).recurringEventData as ActualRecurringEventData;

    console.group('🔍 DEBUG: Recurring Visit Data');
    console.log('Appointment ID:', appointment.id);
    console.log('Appointment title:', appointment.title);
    console.log('Full recurringEventData:', recurringEventData);

    if (recurringEventData) {
        console.log('Occurrence ID:', recurringEventData.id);
        console.log('Recurring Event ID:', recurringEventData.recurringEventId);
        console.log('Status:', recurringEventData.status);
        console.log('Actual Visit ID:', recurringEventData.actualVisitId);
        console.log('Scheduled Date:', recurringEventData.scheduledDate);

        if (recurringEventData.recurringEventDetails) {
            console.log('Event Type:', recurringEventData.recurringEventDetails.type);
            console.log('Event Title:', recurringEventData.recurringEventDetails.title);
            console.log('Is Active:', recurringEventData.recurringEventDetails.isActive);
            console.log('Visit Template:', recurringEventData.recurringEventDetails.visitTemplate);
        }
    }

    console.log('Utils Results:');
    console.log('- isRecurringVisit:', isRecurringVisit(appointment));
    console.log('- canConvertToVisit:', canConvertToVisit(appointment));
    console.log('- isAlreadyConverted:', isAlreadyConverted(appointment));
    console.groupEnd();
};