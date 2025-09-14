// src/components/recurringEvents/hooks/useRecurringEventForm.ts - NAPRAWIONA WERSJA
/**
 * Custom hook for Recurring Event Form logic - NAPRAWIONA WALIDACJA
 * Handles form state, validation, and data transformation
 * NAPRAWKI: Poprawiona logika submit dla SIMPLE_EVENT - zawsze wymaga kroku 3
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    EventType,
    CreateRecurringEventRequest,
    RecurringEventResponse,
    RecurrenceFrequency
} from '../../../types/recurringEvents';
import { validationSchema, FormData, canProceedToStep } from '../schema';

// Limited edit schema for edit mode
const limitedEditValidationSchema = yup.object({
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
        .trim()
});

interface LimitedEditFormData {
    title: string;
    description?: string;
}

interface UseRecurringEventFormProps {
    mode: 'create' | 'edit';
    initialData?: RecurringEventResponse;
    onSubmit: (data: CreateRecurringEventRequest) => Promise<void>;
}

export const useRecurringEventForm = ({
                                          mode,
                                          initialData,
                                          onSubmit
                                      }: UseRecurringEventFormProps) => {
    // Form state
    const [currentStep, setCurrentStep] = useState(1);
    const isLimitedEdit = mode === 'edit';

    // Limited edit form
    const limitedEditForm = useForm<LimitedEditFormData>({
        resolver: yupResolver(limitedEditValidationSchema) as any,
        defaultValues: {
            title: initialData?.title || '',
            description: initialData?.description || ''
        },
        mode: 'onChange'
    });

    // Full creation form
    const fullForm = useForm<FormData>({
        resolver: yupResolver(validationSchema) as any,
        defaultValues: {
            title: '',
            description: '',
            type: EventType.SIMPLE_EVENT,
            recurrencePattern: {
                frequency: RecurrenceFrequency.WEEKLY,
                interval: 1,
                daysOfWeek: ['MON'],
                dayOfMonth: undefined,
                endDate: undefined,
                maxOccurrences: undefined
            },
            visitTemplate: undefined
        },
        mode: 'onChange'
    });

    const watchedType = !isLimitedEdit ? fullForm.watch('type') : initialData?.type;

    // KLUCZOWA NAPRAWKA: Formularz może być submitowany TYLKO na kroku 3 dla WSZYSTKICH typów
    const isFormValidForSubmit = useMemo(() => {
        if (isLimitedEdit) {
            return limitedEditForm.formState.isValid;
        }

        // GŁÓWNA NAPRAWKA: Formularz może być submit'owany TYLKO na kroku 3
        if (currentStep !== 3) {
            console.log('🚫 Form submit blocked - not on step 3, current step:', currentStep);
            return false;
        }

        const formData = fullForm.getValues();
        const errors = fullForm.formState.errors;

        console.log('🔍 Final form validation check:', {
            currentStep,
            type: formData.type,
            title: formData.title,
            hasRecurrencePattern: !!formData.recurrencePattern,
            errors: errors,
            visitTemplateErrors: errors.visitTemplate
        });

        // Dla SIMPLE_EVENT - ignoruj błędy visitTemplate, ale sprawdź podstawowe pola
        if (formData.type === EventType.SIMPLE_EVENT) {
            const hasValidTitle = !!(formData.title && formData.title.trim().length >= 3);
            const hasValidType = !!formData.type;
            const hasValidRecurrencePattern = !!(
                formData.recurrencePattern &&
                formData.recurrencePattern.frequency &&
                formData.recurrencePattern.interval > 0
            );

            // Sprawdź czy nie ma podstawowych błędów (ignoruj visitTemplate)
            const hasBasicErrors = !!(
                errors.title ||
                errors.description ||
                errors.type ||
                errors.recurrencePattern
            );

            const isValid = hasValidTitle && hasValidType && hasValidRecurrencePattern && !hasBasicErrors;

            console.log('✅ SIMPLE_EVENT final validation:', {
                hasValidTitle,
                hasValidType,
                hasValidRecurrencePattern,
                hasBasicErrors,
                isValid
            });

            return isValid;
        }

        // Dla RECURRING_VISIT - sprawdź wszystkie pola włącznie z visitTemplate
        const isValid = fullForm.formState.isValid;
        console.log('✅ RECURRING_VISIT final validation:', { isValid });

        return isValid;
    }, [
        isLimitedEdit,
        currentStep, // WAŻNE: currentStep musi być w dependencies
        limitedEditForm.formState.isValid,
        fullForm.formState.isValid,
        fullForm.formState.errors,
        watchedType,
        fullForm.watch() // To zapewnia reaktywność na zmiany w formularzu
    ]);

    // NAPRAWKA: Blokowanie automatycznego submit przy Enter
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Jeśli wciśnięto Enter i nie jesteśmy na ostatnim kroku
            if (e.key === 'Enter' && !isLimitedEdit && currentStep !== 3) {
                console.log('🛑 BLOCKING Enter key - not on final step, current step:', currentStep);
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        if (!isLimitedEdit) {
            document.addEventListener('keydown', handleKeyDown, true);
        }

        return () => {
            if (!isLimitedEdit) {
                document.removeEventListener('keydown', handleKeyDown, true);
            }
        };
    }, [currentStep, isLimitedEdit]);

    // Clear visitTemplate errors for SIMPLE_EVENT
    const clearVisitTemplateForSimpleEvent = useCallback(() => {
        if (watchedType === EventType.SIMPLE_EVENT) {
            const currentErrors = fullForm.formState.errors;
            if (currentErrors.visitTemplate) {
                console.log('🧹 Clearing visitTemplate errors for SIMPLE_EVENT');
                fullForm.setValue('visitTemplate', undefined, { shouldValidate: false });
                fullForm.clearErrors('visitTemplate');

                setTimeout(() => {
                    fullForm.trigger(['title', 'description', 'type', 'recurrencePattern']);
                }, 100);
            }
        }
    }, [watchedType, fullForm]);

    // Handle type changes
    useEffect(() => {
        if (!isLimitedEdit && watchedType) {
            console.log('🔄 Type changed to:', watchedType);

            if (watchedType === EventType.RECURRING_VISIT) {
                const currentTemplate = fullForm.getValues('visitTemplate');
                if (!currentTemplate) {
                    fullForm.setValue('visitTemplate', {
                        estimatedDurationMinutes: 60,
                        defaultServices: [],
                        notes: ''
                    });
                }
            } else {
                fullForm.setValue('visitTemplate', undefined);
                fullForm.clearErrors('visitTemplate');
                setTimeout(() => fullForm.trigger(), 100);
            }
        }
    }, [watchedType, fullForm, isLimitedEdit]);

    // Monitor and clear visitTemplate errors
    useEffect(() => {
        if (!isLimitedEdit) {
            clearVisitTemplateForSimpleEvent();
        }
    }, [watchedType, fullForm.formState.errors, clearVisitTemplateForSimpleEvent, isLimitedEdit]);

    // Initialize forms
    useEffect(() => {
        if (mode === 'create') {
            fullForm.reset({
                title: '',
                description: '',
                type: EventType.SIMPLE_EVENT,
                recurrencePattern: {
                    frequency: RecurrenceFrequency.WEEKLY,
                    interval: 1,
                    daysOfWeek: ['MON'],
                    dayOfMonth: undefined,
                    endDate: undefined,
                    maxOccurrences: undefined
                },
                visitTemplate: undefined
            });
        } else if (mode === 'edit' && initialData) {
            limitedEditForm.reset({
                title: initialData.title,
                description: initialData.description || ''
            });
        }
    }, [mode, initialData, fullForm, limitedEditForm]);

    // NAPRAWKA: Custom submit handler z lepszą walidacją
    const handleCustomSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🚀 Custom submit handler called');

        // NAJWAŻNIEJSZA NAPRAWKA: Zawsze sprawdź czy jesteśmy na kroku 3
        if (!isLimitedEdit && currentStep !== 3) {
            console.log('🚫 Submit blocked - not on step 3, current step:', currentStep);
            return;
        }

        const formData = fullForm.getValues();
        console.log('📋 Form data for submission:', formData);

        if (formData.type === EventType.SIMPLE_EVENT) {
            // Walidacja dla SIMPLE_EVENT
            const hasTitle = formData.title && formData.title.trim().length >= 3;
            const hasType = formData.type;
            const hasRecurrencePattern = formData.recurrencePattern &&
                formData.recurrencePattern.frequency &&
                formData.recurrencePattern.interval > 0;

            if (hasTitle && hasType && hasRecurrencePattern) {
                console.log('✅ SIMPLE_EVENT validation passed, submitting...');
                await handleFormSubmit(formData);
                return;
            } else {
                console.log('❌ SIMPLE_EVENT validation failed:', {
                    hasTitle,
                    hasType,
                    hasRecurrencePattern
                });
                return;
            }
        }

        // Walidacja dla RECURRING_VISIT
        const isValid = await fullForm.trigger();
        if (isValid) {
            console.log('✅ RECURRING_VISIT validation passed, submitting...');
            await handleFormSubmit(formData);
        } else {
            console.log('❌ RECURRING_VISIT validation failed');
        }
    }, [fullForm, currentStep, isLimitedEdit]);

    // Handle form submission with data transformation
    const handleFormSubmit = useCallback(async (data: LimitedEditFormData | FormData) => {
        try {
            console.log('📤 Submitting form data:', data);

            if (isLimitedEdit && initialData) {
                const limitedData = data as LimitedEditFormData;
                const transformedData: CreateRecurringEventRequest = {
                    title: limitedData.title,
                    description: limitedData.description,
                    type: initialData.type,
                    recurrencePattern: {
                        frequency: initialData.recurrencePattern.frequency,
                        interval: initialData.recurrencePattern.interval,
                        daysOfWeek: initialData.recurrencePattern.daysOfWeek,
                        dayOfMonth: initialData.recurrencePattern.dayOfMonth,
                        endDate: initialData.recurrencePattern.endDate,
                        maxOccurrences: initialData.recurrencePattern.maxOccurrences
                    },
                    visitTemplate: initialData.visitTemplate ? {
                        clientId: initialData.visitTemplate.clientId,
                        vehicleId: initialData.visitTemplate.vehicleId,
                        estimatedDurationMinutes: initialData.visitTemplate.estimatedDurationMinutes,
                        defaultServices: initialData.visitTemplate.defaultServices.map(service => ({
                            name: service.name,
                            basePrice: service.basePrice
                        })),
                        notes: initialData.visitTemplate.notes
                    } : undefined
                };
                await onSubmit(transformedData);
            } else {
                const fullData = data as FormData;
                const transformedData: CreateRecurringEventRequest = {
                    title: fullData.title,
                    description: fullData.description,
                    type: fullData.type as EventType,
                    recurrencePattern: {
                        frequency: fullData.recurrencePattern.frequency as RecurrenceFrequency,
                        interval: fullData.recurrencePattern.interval,
                        daysOfWeek: fullData.recurrencePattern.daysOfWeek,
                        dayOfMonth: fullData.recurrencePattern.dayOfMonth,
                        endDate: fullData.recurrencePattern.endDate,
                        maxOccurrences: fullData.recurrencePattern.maxOccurrences
                    },
                    visitTemplate: fullData.visitTemplate ? {
                        clientId: fullData.visitTemplate.clientId,
                        vehicleId: fullData.visitTemplate.vehicleId,
                        estimatedDurationMinutes: fullData.visitTemplate.estimatedDurationMinutes,
                        defaultServices: fullData.visitTemplate.defaultServices || [],
                        notes: fullData.visitTemplate.notes
                    } : undefined
                };

                console.log('🚀 Final transformed data:', transformedData);
                await onSubmit(transformedData);
            }
        } catch (error) {
            console.error('Form submission error:', error);
        }
    }, [isLimitedEdit, initialData, onSubmit]);

    // NAPRAWKA: Step validation wrapper
    const canProceedToStepWrapper = useCallback((step: number) => {
        if (isLimitedEdit) return true;

        const formData = fullForm.getValues();
        const errors = fullForm.formState.errors;

        console.log(`🔍 Checking step ${step} proceed:`, {
            formData,
            errors,
            currentStep
        });

        return canProceedToStep(step, formData, errors);
    }, [isLimitedEdit, fullForm, currentStep]);

    return {
        // Form instances
        limitedEditForm,
        fullForm,

        // State
        currentStep,
        setCurrentStep,
        isLimitedEdit,
        watchedType,
        isFormValidForSubmit,

        // Handlers
        handleCustomSubmit,
        handleFormSubmit: limitedEditForm.handleSubmit(handleFormSubmit),
        canProceedToStepWrapper,

        // Data for debugging
        fullFormData: !isLimitedEdit ? fullForm.watch() : null,
        fullFormErrors: !isLimitedEdit ? fullForm.formState.errors : {}
    };
};