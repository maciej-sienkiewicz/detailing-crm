// src/components/recurringEvents/hooks/useRecurringEventForm.ts
/**
 * Custom hook for Recurring Event Form logic
 * Handles form state, validation, and data transformation
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

    // NAPRAWKA: Custom validation for submit - zawsze sprawdzaj czy jesteśmy na kroku 3
    const isFormValidForSubmit = useMemo(() => {
        if (isLimitedEdit) {
            return limitedEditForm.formState.isValid;
        }

        // Formularz może być submit'owany TYLKO na kroku 3
        if (currentStep !== 3) {
            return false;
        }

        const formData = fullForm.getValues();
        const errors = fullForm.formState.errors;

        // Dla SIMPLE_EVENT - ignoruj błędy visitTemplate, ale sprawdź podstawowe pola
        if (formData.type === EventType.SIMPLE_EVENT) {
            const hasBasicErrors = !!(errors.title || errors.description || errors.type || errors.recurrencePattern);
            const hasRequiredData = !!(formData.title && formData.type && formData.recurrencePattern);

            console.log('🔍 SIMPLE_EVENT final validation:', {
                currentStep,
                type: formData.type,
                title: formData.title,
                hasRecurrencePattern: !!formData.recurrencePattern,
                hasBasicErrors,
                hasRequiredData,
                visitTemplateErrors: errors.visitTemplate,
                shouldBeValid: !hasBasicErrors && hasRequiredData
            });

            return !hasBasicErrors && hasRequiredData;
        }

        // Dla RECURRING_VISIT - sprawdź wszystkie pola włącznie z visitTemplate
        return fullForm.formState.isValid;
    }, [
        isLimitedEdit,
        currentStep, // WAŻNE: dodane currentStep
        limitedEditForm.formState.isValid,
        fullForm.formState.isValid,
        fullForm.formState.errors,
        watchedType,
        fullForm.watch()
    ]);

    // Clear visitTemplate errors for SIMPLE_EVENT
    const clearVisitTemplateForSimpleEvent = useCallback(() => {
        if (watchedType === EventType.SIMPLE_EVENT) {
            const currentErrors = fullForm.formState.errors;
            if (currentErrors.visitTemplate) {
                console.log('🧹 AGGRESSIVELY clearing visitTemplate errors for SIMPLE_EVENT');

                fullForm.setValue('visitTemplate', undefined, { shouldValidate: false });
                fullForm.clearErrors('visitTemplate');
                fullForm.clearErrors('visitTemplate.estimatedDurationMinutes');
                fullForm.clearErrors('visitTemplate.defaultServices');

                setTimeout(() => {
                    fullForm.trigger(['title', 'description', 'type', 'recurrencePattern']);
                }, 100);

                setTimeout(() => {
                    const stillHasErrors = fullForm.formState.errors.visitTemplate;
                    if (stillHasErrors) {
                        console.log('🔥 FORCE reset form validation state');
                        const currentData = fullForm.getValues();
                        const cleanData = {
                            ...currentData,
                            visitTemplate: undefined
                        };
                        fullForm.reset(cleanData, { keepValues: true });
                    }
                }, 200);
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

    // DODATKOWY useEffect do debugowania nieoczekiwanych submit'ów
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            console.log('⚠️ Page unload detected - possible unwanted form submission!');
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                console.log('🔥 ENTER key pressed - potential form submit trigger!', {
                    target: e.target,
                    currentStep,
                    activeElement: document.activeElement
                });

                // Jeśli nie jesteśmy na ostatnim kroku, blokuj Enter
                if (currentStep !== 3) {
                    console.log('🛑 BLOCKING Enter key - not on final step');
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }
        };

        // Dodaj event listenery tylko dla trybu tworzenia
        if (!isLimitedEdit) {
            window.addEventListener('beforeunload', handleBeforeUnload);
            document.addEventListener('keydown', handleKeyDown, true); // Capture phase
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [currentStep, isLimitedEdit]);
    useEffect(() => {
        if (!isLimitedEdit && watchedType === EventType.SIMPLE_EVENT) {
            const visitTemplateErrors = fullForm.formState.errors.visitTemplate;
            if (visitTemplateErrors) {
                console.log('🚨 Detected visitTemplate errors for SIMPLE_EVENT, clearing immediately');
                clearVisitTemplateForSimpleEvent();
            }
        }
    }, [fullForm.formState.errors.visitTemplate, watchedType, clearVisitTemplateForSimpleEvent, isLimitedEdit]);

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

    // Custom submit handler
    const handleCustomSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = fullForm.getValues();
        console.log('🚀 Custom submit handler called with:', formData);

        if (formData.type === EventType.SIMPLE_EVENT) {
            const hasTitle = formData.title && formData.title.trim().length >= 3;
            const hasType = formData.type;
            const hasRecurrencePattern = formData.recurrencePattern &&
                formData.recurrencePattern.frequency &&
                formData.recurrencePattern.interval;

            if (hasTitle && hasType && hasRecurrencePattern) {
                console.log('✅ SIMPLE_EVENT validation passed, submitting...');
                await handleFormSubmit(formData);
                return;
            } else {
                console.log('❌ SIMPLE_EVENT validation failed:', { hasTitle, hasType, hasRecurrencePattern });
                return;
            }
        }

        const isValid = await fullForm.trigger();
        if (isValid) {
            await handleFormSubmit(formData);
        }
    }, [fullForm]);

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

    // Step validation
    const canProceedToStepWrapper = useCallback((step: number) => {
        if (isLimitedEdit) return true;

        const formData = fullForm.getValues();
        const errors = fullForm.formState.errors;

        console.log(`🔍 Checking step ${step} proceed:`, { formData, errors });

        return canProceedToStep(step, formData, errors);
    }, [isLimitedEdit, fullForm]);

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