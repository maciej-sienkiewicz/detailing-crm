// src/components/recurringEvents/schema.ts - OSTATECZNA NAPRAWIONA WERSJA
/**
 * Form validation schema and types - OSTATECZNA NAPRAWIONA WERSJA
 * Centralized validation logic for the recurring events form
 * NAPRAWKI: Poprawiona logika kroków - WSZYSTKIE typy przechodzą przez 3 kroki
 */

import * as yup from 'yup';
import { EventType, RecurrenceFrequency } from '../../types/recurringEvents';

// Form data type that matches yup schema exactly
export interface FormData {
    title: string;
    description?: string;
    type: EventType;
    recurrencePattern: {
        frequency: RecurrenceFrequency;
        interval: number;
        daysOfWeek?: string[];
        dayOfMonth?: number;
        endDate?: string;
        maxOccurrences?: number;
    };
    visitTemplate?: {
        clientId?: number;
        vehicleId?: number;
        estimatedDurationMinutes: number;
        defaultServices: Array<{
            name: string;
            basePrice: number;
        }>;
        notes?: string;
    };
}

// Helper function to validate enum values
const validateEnum = <T extends Record<string, string>>(enumObject: T, fieldName: string) => {
    return yup.mixed<T[keyof T]>()
        .oneOf(Object.values(enumObject) as T[keyof T][], `Wybierz prawidłowy ${fieldName.toLowerCase()}`)
        .required(`${fieldName} jest wymagane`);
};

// Custom validation for days of week
const validateDaysOfWeek = yup.array()
    .of(yup.string().oneOf(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], 'Nieprawidłowy dzień tygodnia'))
    .when('frequency', {
        is: RecurrenceFrequency.WEEKLY,
        then: (schema) => schema
            .min(1, 'Wybierz przynajmniej jeden dzień tygodnia')
            .max(7, 'Nie można wybrać więcej niż 7 dni tygodnia')
            .required('Dni tygodnia są wymagane dla częstotliwości tygodniowej'),
        otherwise: (schema) => schema.notRequired()
    });

// Custom validation for day of month
const validateDayOfMonth = yup.number()
    .when('frequency', {
        is: RecurrenceFrequency.MONTHLY,
        then: (schema) => schema
            .min(1, 'Dzień miesiąca musi być między 1 a 31')
            .max(31, 'Dzień miesiąca musi być między 1 a 31')
            .integer('Dzień miesiąca musi być liczbą całkowitą')
            .required('Dzień miesiąca jest wymagany dla częstotliwości miesięcznej'),
        otherwise: (schema) => schema.notRequired()
    });

// NAPRAWKA: Poprawiona funkcja testowa dla daty
const validateFutureDate = yup
    .string()
    .notRequired()
    .test('future-date', 'Data zakończenia musi być w przyszłości', function(value) {
        if (!value) return true;
        const endDate = new Date(value);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return endDate >= tomorrow;
    })
    .test('valid-date', 'Nieprawidłowy format daty', function(value) {
        if (!value) return true;
        const date = new Date(value);
        const hasValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(value);
        return !isNaN(date.getTime()) && hasValidFormat;
    });

// GŁÓWNA NAPRAWKA: Poprawiona walidacja visitTemplate
const validateVisitTemplate = yup.object({
    clientId: yup
        .number()
        .notRequired()
        .min(1, 'Wybierz prawidłowego klienta'),

    vehicleId: yup
        .number()
        .notRequired()
        .min(1, 'Wybierz prawidłowy pojazd'),

    estimatedDurationMinutes: yup
        .number()
        .min(15, 'Czas trwania musi być co najmniej 15 minut')
        .max(480, 'Czas trwania może być maksymalnie 8 godzin (480 minut)')
        .integer('Czas trwania musi być liczbą całkowitą')
        .required('Szacowany czas trwania jest wymagany'),

    defaultServices: yup
        .array()
        .of(yup.object({
            name: yup
                .string()
                .required('Podaj nazwę usługi')
                .min(2, 'Nazwa usługi musi mieć co najmniej 2 znaki')
                .max(100, 'Nazwa usługi może mieć maksymalnie 100 znaków')
                .trim(),
            basePrice: yup
                .number()
                .min(0, 'Cena nie może być ujemna')
                .max(99999.99, 'Cena jest zbyt wysoka')
                .required('Podaj cenę usługi')
                .test('decimal-places', 'Cena może mieć maksymalnie 2 miejsca po przecinku', function(value) {
                    if (typeof value !== 'number') return true;
                    return Number.isInteger(value * 100);
                })
        }).required())
        .min(1, 'Dodaj przynajmniej jedną usługę domyślną dla cyklicznych wizyt')
        .required(),

    notes: yup
        .string()
        .notRequired()
        .max(500, 'Notatki mogą mieć maksymalnie 500 znaków')
        .trim()
})
    .when('type', {
        // NAPRAWKA: visitTemplate jest wymagane TYLKO dla RECURRING_VISIT
        is: EventType.RECURRING_VISIT,
        then: (schema) => schema.required('Szablon wizyty jest wymagany dla cyklicznych wizyt'),
        otherwise: (schema) => schema.notRequired().nullable()
    });

// Main validation schema - NAPRAWIONA WERSJA
export const validationSchema = yup.object({
    title: yup
        .string()
        .required('Podaj tytuł wydarzenia')
        .min(3, 'Tytuł musi mieć co najmniej 3 znaki')
        .max(200, 'Tytuł może mieć maksymalnie 200 znaków')
        .trim('Tytuł nie może zaczynać ani kończyć się spacją'),

    description: yup
        .string()
        .notRequired()
        .max(1000, 'Opis może mieć maksymalnie 1000 znaków')
        .trim(),

    type: validateEnum(EventType, 'Typ wydarzenia'),

    recurrencePattern: yup.object({
        frequency: validateEnum(RecurrenceFrequency, 'Częstotliwość'),

        interval: yup
            .number()
            .min(1, 'Interwał musi być większy od 0')
            .max(365, 'Interwał może być maksymalnie 365')
            .integer('Interwał musi być liczbą całkowitą')
            .required('Interwał jest wymagany'),

        daysOfWeek: validateDaysOfWeek,
        dayOfMonth: validateDayOfMonth,
        endDate: validateFutureDate,

        maxOccurrences: yup
            .number()
            .notRequired()
            .min(1, 'Liczba wystąpień musi być większa od 0')
            .max(1000, 'Liczba wystąpień może być maksymalnie 1000')
            .integer('Liczba wystąpień musi być liczbą całkowitą')
            .test('end-condition-conflict', 'Nie można ustawić jednocześnie daty zakończenia i liczby wystąpień', function(value) {
                const endDate = this.parent.endDate;
                if (value && endDate) {
                    return false;
                }
                return true;
            })
    }).required('Wzorzec powtarzania jest wymagany'),

    // NAPRAWKA: Poprawiona walidacja visitTemplate
    visitTemplate: validateVisitTemplate
});

// KLUCZOWA NAPRAWKA: Funkcja canProceedToStep - WSZYSTKIE typy przechodzą przez 3 kroki
export const canProceedToStep = (step: number, formData: Partial<FormData>, errors: Record<string, any>): boolean => {

    switch (step) {
        case 1:
            // Basic info step - wymagane dla WSZYSTKICH typów
            const hasBasicInfo = !!(
                formData.title &&
                formData.title.length >= 3 &&
                formData.type
            );
            const hasBasicErrors = !!(errors.title || errors.description || errors.type);
            return hasBasicInfo && !hasBasicErrors;

        case 2:
            // Recurrence pattern step - wymagane dla WSZYSTKICH typów
            const pattern = formData.recurrencePattern;
            if (!pattern) {
                return false;
            }

            // Check basic requirements
            if (!pattern.frequency || !pattern.interval || pattern.interval < 1) {
                return false;
            }

            // Check frequency-specific requirements
            if (pattern.frequency === RecurrenceFrequency.WEEKLY) {
                if (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0) {
                    return false;
                }
            }

            if (pattern.frequency === RecurrenceFrequency.MONTHLY) {
                if (!pattern.dayOfMonth || pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31) {
                    return false;
                }
            }

            // Check end conditions
            if (pattern.endDate && pattern.maxOccurrences) {
                return false;
            }

            if (pattern.endDate) {
                const endDate = new Date(pattern.endDate);
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                if (endDate < tomorrow) {
                    return false;
                }
            }

            if (pattern.maxOccurrences && pattern.maxOccurrences < 1) {
                return false;
            }

            const hasPatternErrors = !!errors.recurrencePattern;
            return !hasPatternErrors;

        case 3:
            // NAJWAŻNIEJSZA NAPRAWKA: Krok 3 - różna walidacja dla różnych typów
            if (formData.type === EventType.SIMPLE_EVENT) {
                // SIMPLE_EVENT - może przejść do kroku 3 (potwierdzenia) bez visitTemplate

                // Sprawdź tylko podstawowe wymagania
                const hasValidTitle = !!(formData.title && formData.title.length >= 3);
                const hasValidType = !!formData.type;
                const hasValidPattern = !!(
                    formData.recurrencePattern &&
                    formData.recurrencePattern.frequency &&
                    formData.recurrencePattern.interval > 0
                );

                const hasBasicErrors = !!(
                    errors.title ||
                    errors.type ||
                    errors.recurrencePattern
                );

                const isValidSimpleEvent = hasValidTitle && hasValidType && hasValidPattern && !hasBasicErrors;

                return isValidSimpleEvent;
            }

            // RECURRING_VISIT - wymaga visitTemplate
            const template = formData.visitTemplate;
            if (!template) {
                return false;
            }

            const hasValidDuration = typeof template.estimatedDurationMinutes === 'number' &&
                template.estimatedDurationMinutes >= 15;
            const hasValidServices = Array.isArray(template.defaultServices) &&
                template.defaultServices.length > 0 &&
                template.defaultServices.every(service =>
                    service.name &&
                    service.name.trim().length >= 2 &&
                    typeof service.basePrice === 'number' &&
                    service.basePrice >= 0
                );

            const hasTemplateErrors = !!errors.visitTemplate;
            const isStep3ValidRecurring = hasValidDuration && hasValidServices && !hasTemplateErrors;

            return isStep3ValidRecurring;

        default:
            return false;
    }
};