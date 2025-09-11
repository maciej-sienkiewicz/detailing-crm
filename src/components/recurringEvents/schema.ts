// src/components/recurringEvents/FormValidation/schema.ts
/**
 * Form validation schema and types
 * Centralized validation logic for the recurring events form
 */

import * as yup from 'yup';
import { EventType, RecurrenceFrequency } from '../../../types/recurringEvents';

// Form data type that matches yup schema exactly
export interface FormData {
    title: string;
    description?: string;
    type: string; // Will be cast to EventType
    recurrencePattern: {
        frequency: string; // Will be cast to RecurrenceFrequency
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

// Validation schema
export const validationSchema = yup.object({
    title: yup
        .string()
        .required('Tytuł jest wymagany')
        .min(3, 'Tytuł musi mieć co najmniej 3 znaki')
        .max(200, 'Tytuł może mieć maksymalnie 200 znaków'),
    description: yup
        .string()
        .optional()
        .max(1000, 'Opis może mieć maksymalnie 1000 znaków'),
    type: yup
        .string()
        .oneOf(Object.values(EventType), 'Nieprawidłowy typ wydarzenia')
        .required('Typ wydarzenia jest wymagany'),
    recurrencePattern: yup.object({
        frequency: yup
            .string()
            .oneOf(Object.values(RecurrenceFrequency), 'Nieprawidłowa częstotliwość')
            .required('Częstotliwość jest wymagana'),
        interval: yup
            .number()
            .min(1, 'Interwał musi być większy od 0')
            .max(365, 'Interwał może być maksymalnie 365')
            .required('Interwał jest wymagany'),
        daysOfWeek: yup
            .array()
            .of(yup.string().required())
            .optional()
            .when('frequency', {
                is: RecurrenceFrequency.WEEKLY,
                then: (schema) => schema.min(1, 'Wybierz przynajmniej jeden dzień tygodnia'),
                otherwise: (schema) => schema.optional()
            }),
        dayOfMonth: yup
            .number()
            .min(1, 'Dzień miesiąca musi być między 1 a 31')
            .max(31, 'Dzień miesiąca musi być między 1 a 31')
            .optional()
            .when('frequency', {
                is: RecurrenceFrequency.MONTHLY,
                then: (schema) => schema.required('Dzień miesiąca jest wymagany'),
                otherwise: (schema) => schema.optional()
            }),
        endDate: yup
            .string()
            .optional()
            .test('future-date', 'Data zakończenia musi być w przyszłości', function(value) {
                if (!value) return true;
                return new Date(value) > new Date();
            }),
        maxOccurrences: yup
            .number()
            .min(1, 'Liczba wystąpień musi być większa od 0')
            .max(10000, 'Liczba wystąpień może być maksymalnie 10000')
            .optional()
    }).required('Wzorzec powtarzania jest wymagany'),
    visitTemplate: yup.object({
        clientId: yup.number().optional(),
        vehicleId: yup.number().optional(),
        estimatedDurationMinutes: yup
            .number()
            .min(15, 'Czas trwania musi być co najmniej 15 minut')
            .max(480, 'Czas trwania może być maksymalnie 8 godzin')
            .required('Szacowany czas trwania jest wymagany'),
        defaultServices: yup
            .array()
            .of(yup.object({
                name: yup.string().required('Nazwa usługi jest wymagana'),
                basePrice: yup.number().min(0, 'Cena musi być większa lub równa 0').required('Cena jest wymagana')
            }))
            .min(1, 'Dodaj przynajmniej jedną usługę domyślną')
            .required(),
        notes: yup.string().optional().max(500, 'Notatki mogą mieć maksymalnie 500 znaków')
    }).optional().when('type', {
        is: EventType.RECURRING_VISIT,
        then: (schema) => schema.required('Szablon wizyty jest wymagany dla cyklicznych wizyt'),
        otherwise: (schema) => schema.optional()
    })
});