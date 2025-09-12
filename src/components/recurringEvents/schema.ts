// src/components/recurringEvents/schema.ts - NAPRAWIONA WALIDACJA
/**
 * Form validation schema and types - NAPRAWIONA WERSJA
 * Centralized validation logic for the recurring events form
 * NAPRAWY: Poprawiona funkcja testowa dla daty, lepsza walidacja warunkowa
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

// Validation schema - NAPRAWKA: Poprawiona funkcja testowa dla daty
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

        endDate: yup
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
            }),

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

    visitTemplate: yup.object({
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
            is: EventType.RECURRING_VISIT,
            then: (schema) => schema.required('Szablon wizyty jest wymagany dla cyklicznych wizyt'),
            otherwise: (schema) => schema.notRequired()
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
        return { isValid: false, errors: { general: 'Wystąpił błąd podczas walidacji formularza' } };
    }
};

// Helper function to check if step can proceed
export const canProceedToStep = (step: number, formData: Partial<FormData>, errors: Record<string, any>): boolean => {
    switch (step) {
        case 1:
            // Basic info step
            return !!(
                formData.title &&
                formData.title.length >= 3 &&
                formData.type
            ) && !errors.title && !errors.description && !errors.type;

        case 2:
            // Recurrence pattern step
            const pattern = formData.recurrencePattern;
            if (!pattern) return false;

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
                return false; // Cannot have both
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

            return !errors.recurrencePattern;

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
                    service.name &&
                    service.name.trim().length >= 2 &&
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

// Helper functions for better UX
export const getValidationSummary = (errors: Record<string, any>): string[] => {
    const messages: string[] = [];

    if (errors.title) messages.push('Tytuł wydarzenia');
    if (errors.type) messages.push('Typ wydarzenia');
    if (errors['recurrencePattern.frequency']) messages.push('Częstotliwość powtarzania');
    if (errors['recurrencePattern.interval']) messages.push('Interwał powtarzania');
    if (errors['recurrencePattern.daysOfWeek']) messages.push('Dni tygodnia');
    if (errors['recurrencePattern.dayOfMonth']) messages.push('Dzień miesiąca');
    if (errors['recurrencePattern.endDate']) messages.push('Data zakończenia');
    if (errors['recurrencePattern.maxOccurrences']) messages.push('Liczba wystąpień');
    if (errors['visitTemplate.estimatedDurationMinutes']) messages.push('Czas trwania wizyty');
    if (errors['visitTemplate.defaultServices']) messages.push('Domyślne usługi');

    return messages;
};

export const getStepValidationMessage = (step: number, errors: Record<string, any>): string | null => {
    switch (step) {
        case 1:
            if (errors.title) return 'Wypełnij tytuł wydarzenia';
            if (errors.type) return 'Wybierz typ wydarzenia';
            return null;

        case 2:
            if (errors['recurrencePattern.frequency']) return 'Wybierz częstotliwość powtarzania';
            if (errors['recurrencePattern.interval']) return 'Podaj interwał powtarzania';
            if (errors['recurrencePattern.daysOfWeek']) return 'Wybierz dni tygodnia';
            if (errors['recurrencePattern.dayOfMonth']) return 'Podaj dzień miesiąca';
            return null;

        case 3:
            if (errors['visitTemplate.estimatedDurationMinutes']) return 'Podaj szacowany czas trwania';
            if (errors['visitTemplate.defaultServices']) return 'Dodaj przynajmniej jedną usługę';
            return null;

        default:
            return null;
    }
};