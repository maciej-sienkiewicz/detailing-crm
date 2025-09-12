// src/components/recurringEvents/schema.ts
/**
 * Form validation schema and types - FIXED VERSION
 * Centralized validation logic for the recurring events form
 * FIXES: Proper enum validation and type safety
 */

import * as yup from 'yup';
import { EventType, RecurrenceFrequency } from '../../types/recurringEvents';

// Form data type that matches yup schema exactly
export interface FormData {
    title: string;
    description?: string;
    type: EventType; // Changed to proper enum type
    recurrencePattern: {
        frequency: RecurrenceFrequency; // Changed to proper enum type
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
        .oneOf(Object.values(enumObject) as T[keyof T][], `Nieprawidłowa wartość dla pola ${fieldName}`)
        .required(`${fieldName} jest wymagane`);
};

// Custom validation for days of week
const validateDaysOfWeek = yup.array()
    .of(yup.string().oneOf(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], 'Nieprawidłowy dzień tygodnia'))
    .test('weekly-required', 'Wybierz przynajmniej jeden dzień tygodnia dla częstotliwości tygodniowej', function(value) {
        const frequency = this.parent.frequency;
        if (frequency === RecurrenceFrequency.WEEKLY) {
            return Array.isArray(value) && value.length > 0;
        }
        return true;
    });

// Custom validation for day of month
const validateDayOfMonth = yup.number()
    .min(1, 'Dzień miesiąca musi być między 1 a 31')
    .max(31, 'Dzień miesiąca musi być między 1 a 31')
    .integer('Dzień miesiąca musi być liczbą całkowitą')
    .test('monthly-required', 'Dzień miesiąca jest wymagany dla częstotliwości miesięcznej', function(value) {
        const frequency = this.parent.frequency;
        if (frequency === RecurrenceFrequency.MONTHLY) {
            return typeof value === 'number' && value >= 1 && value <= 31;
        }
        return true;
    });

// Validation schema
export const validationSchema = yup.object({
    title: yup
        .string()
        .required('Tytuł jest wymagany')
        .min(3, 'Tytuł musi mieć co najmniej 3 znaki')
        .max(200, 'Tytuł może mieć maksymalnie 200 znaków')
        .trim(),

    description: yup
        .string()
        .optional()
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

        daysOfWeek: validateDaysOfWeek.optional(),

        dayOfMonth: validateDayOfMonth.optional(),

        endDate: yup
            .string()
            .optional()
            .test('future-date', 'Data zakończenia musi być w przyszłości', function(value) {
                if (!value) return true;
                const endDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time to compare only dates
                return endDate > today;
            })
            .test('valid-date', 'Nieprawidłowy format daty', function(value) {
                if (!value) return true;
                const date = new Date(value);
                return !isNaN(date.getTime());
            }),

        maxOccurrences: yup
            .number()
            .optional()
            .min(1, 'Liczba wystąpień musi być większa od 0')
            .max(10000, 'Liczba wystąpień może być maksymalnie 10000')
            .integer('Liczba wystąpień musi być liczbą całkowitą')
            .test('end-condition', 'Wybierz datę zakończenia lub liczbę wystąpień', function(value) {
                const endDate = this.parent.endDate;
                // Allow both to be empty (infinite recurrence)
                // But if one is set, the other should be empty
                if (value && endDate) {
                    return this.createError({
                        message: 'Nie można ustawić jednocześnie daty zakończenia i liczby wystąpień'
                    });
                }
                return true;
            })
    }).required('Wzorzec powtarzania jest wymagany'),

    visitTemplate: yup.object({
        clientId: yup
            .number()
            .optional()
            .min(1, 'Nieprawidłowe ID klienta'),

        vehicleId: yup
            .number()
            .optional()
            .min(1, 'Nieprawidłowe ID pojazdu'),

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
                    .required('Nazwa usługi jest wymagana')
                    .min(2, 'Nazwa usługi musi mieć co najmniej 2 znaki')
                    .max(100, 'Nazwa usługi może mieć maksymalnie 100 znaków')
                    .trim(),
                basePrice: yup
                    .number()
                    .min(0, 'Cena musi być większa lub równa 0')
                    .max(99999.99, 'Cena jest zbyt wysoka')
                    .required('Cena jest wymagana')
                    .test('decimal-places', 'Cena może mieć maksymalnie 2 miejsca po przecinku', function(value) {
                        if (typeof value !== 'number') return true;
                        return Number.isInteger(value * 100);
                    })
            }).required())
            .min(1, 'Dodaj przynajmniej jedną usługę domyślną')
            .required('Domyślne usługi są wymagane'),

        notes: yup
            .string()
            .optional()
            .max(500, 'Notatki mogą mieć maksymalnie 500 znaków')
            .trim()
    })
        .optional()
        .when('type', {
            is: EventType.RECURRING_VISIT,
            then: (schema) => schema.required('Szablon wizyty jest wymagany dla cyklicznych wizyt'),
            otherwise: (schema) => schema.optional()
        })
});

// Helper functions for form validation
export const validateFormData = async (data: FormData): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
    try {
        await validationSchema.validate(data, { abortEarly: false });
        return { isValid: true, errors: {} };
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            const errors: Record<string, string> = {};
            error.inner.forEach((err) => {
                if (err.path) {
                    errors[err.path] = err.message;
                }
            });
            return { isValid: false, errors };
        }
        return { isValid: false, errors: { general: 'Błąd walidacji formularza' } };
    }
};

// Helper function to check if step can proceed
export const canProceedToStep = (step: number, formData: Partial<FormData>, errors: Record<string, any>): boolean => {
    switch (step) {
        case 1:
            // Basic info step
            return !!(formData.title && formData.type) &&
                !errors.title &&
                !errors.description &&
                !errors.type;

        case 2:
            // Recurrence pattern step
            const pattern = formData.recurrencePattern;
            if (!pattern) return false;

            const hasValidFrequency = pattern.frequency && Object.values(RecurrenceFrequency).includes(pattern.frequency);
            const hasValidInterval = typeof pattern.interval === 'number' && pattern.interval > 0;

            let hasValidSpecificFields = true;
            if (pattern.frequency === RecurrenceFrequency.WEEKLY) {
                hasValidSpecificFields = Array.isArray(pattern.daysOfWeek) && pattern.daysOfWeek.length > 0;
            } else if (pattern.frequency === RecurrenceFrequency.MONTHLY) {
                hasValidSpecificFields = typeof pattern.dayOfMonth === 'number' &&
                    pattern.dayOfMonth >= 1 &&
                    pattern.dayOfMonth <= 31;
            }

            return hasValidFrequency && hasValidInterval && hasValidSpecificFields && !errors.recurrencePattern;

        case 3:
            // Visit template step (only for RECURRING_VISIT)
            if (formData.type === EventType.SIMPLE_EVENT) {
                return true; // No additional validation needed
            }

            const template = formData.visitTemplate;
            if (!template) return false;

            const hasValidDuration = typeof template.estimatedDurationMinutes === 'number' &&
                template.estimatedDurationMinutes >= 15;
            const hasValidServices = Array.isArray(template.defaultServices) &&
                template.defaultServices.length > 0 &&
                template.defaultServices.every(service =>
                    service.name && service.name.length > 0 &&
                    typeof service.basePrice === 'number' &&
                    service.basePrice >= 0
                );

            return hasValidDuration && hasValidServices && !errors.visitTemplate;

        default:
            return false;
    }
};

// Type guards for better type safety
export const isRecurringVisit = (formData: FormData): formData is FormData & { visitTemplate: NonNullable<FormData['visitTemplate']> } => {
    return formData.type === EventType.RECURRING_VISIT && !!formData.visitTemplate;
};

export const isWeeklyFrequency = (pattern: FormData['recurrencePattern']): pattern is FormData['recurrencePattern'] & { daysOfWeek: string[] } => {
    return pattern.frequency === RecurrenceFrequency.WEEKLY && Array.isArray(pattern.daysOfWeek);
};

export const isMonthlyFrequency = (pattern: FormData['recurrencePattern']): pattern is FormData['recurrencePattern'] & { dayOfMonth: number } => {
    return pattern.frequency === RecurrenceFrequency.MONTHLY && typeof pattern.dayOfMonth === 'number';
};