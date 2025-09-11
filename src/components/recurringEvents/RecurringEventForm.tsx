// src/components/recurringEvents/RecurringEventForm.tsx
/**
 * Main Recurring Event Form Component
 * Orchestrates the multi-step form for creating/editing recurring events
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaCalendarAlt, FaSave, FaTimes } from 'react-icons/fa';
import {
    EventType,
    CreateRecurringEventRequest,
    RecurringEventResponse
} from '../../types/recurringEvents';
import { FormHeader } from './FormComponents/FormHeader';
import { StepsProgress } from './FormComponents/StepsProgress';
import { BasicInfoStep } from './FormSteps/BasicInfoStep';
import { RecurrencePatternStep } from './FormSteps/RecurrencePatternStep';
import { VisitTemplateStep } from './FormSteps/VisitTemplateStep';
import { FormActions } from './FormComponents/FormActions';
import { validationSchema, FormData } from './FormValidation/schema';
import { theme } from '../../styles/theme';

interface RecurringEventFormProps {
    mode: 'create' | 'edit';
    initialData?: RecurringEventResponse;
    onSubmit: (data: CreateRecurringEventRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const RecurringEventForm: React.FC<RecurringEventFormProps> = ({
                                                                   mode,
                                                                   initialData,
                                                                   onSubmit,
                                                                   onCancel,
                                                                   isLoading = false
                                                               }) => {
    // Form state
    const [currentStep, setCurrentStep] = useState(1);

    // Initialize form with validation
    const form = useForm<FormData>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            title: '',
            description: '',
            type: EventType.SIMPLE_EVENT,
            recurrencePattern: {
                frequency: 'WEEKLY',
                interval: 1,
                daysOfWeek: undefined,
                dayOfMonth: undefined,
                endDate: undefined,
                maxOccurrences: undefined
            },
            visitTemplate: undefined
        },
        mode: 'onChange'
    });

    const { handleSubmit, watch, reset, formState: { errors, isValid } } = form;
    const watchedType = watch('type');

    // Initialize form with existing data
    useEffect(() => {
        if (mode === 'edit' && initialData) {
            reset({
                title: initialData.title,
                description: initialData.description || '',
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
            });
        }
    }, [mode, initialData, reset]);

    // Handle form submission
    const onFormSubmit = useCallback(async (data: FormData) => {
        try {
            const transformedData: CreateRecurringEventRequest = {
                title: data.title,
                description: data.description,
                type: data.type as EventType,
                recurrencePattern: {
                    frequency: data.recurrencePattern.frequency as any,
                    interval: data.recurrencePattern.interval,
                    daysOfWeek: data.recurrencePattern.daysOfWeek,
                    dayOfMonth: data.recurrencePattern.dayOfMonth,
                    endDate: data.recurrencePattern.endDate,
                    maxOccurrences: data.recurrencePattern.maxOccurrences
                },
                visitTemplate: data.visitTemplate ? {
                    clientId: data.visitTemplate.clientId,
                    vehicleId: data.visitTemplate.vehicleId,
                    estimatedDurationMinutes: data.visitTemplate.estimatedDurationMinutes,
                    defaultServices: data.visitTemplate.defaultServices || [],
                    notes: data.visitTemplate.notes
                } : undefined
            };

            await onSubmit(transformedData);
        } catch (error) {
            console.error('Form submission error:', error);
        }
    }, [onSubmit]);

    // Check if form can proceed to next step
    const canProceedToStep = useCallback((step: number) => {
        switch (step) {
            case 1:
                return !errors.title && !errors.description && !errors.type;
            case 2:
                return !errors.recurrencePattern;
            case 3:
                return watchedType === EventType.SIMPLE_EVENT || !errors.visitTemplate;
            default:
                return false;
        }
    }, [errors, watchedType]);

    return (
        <FormContainer>
            <FormHeader
                mode={mode}
                title={mode === 'create' ? 'Nowe cykliczne wydarzenie' : 'Edytuj cykliczne wydarzenie'}
                subtitle={mode === 'create'
                    ? 'Utwórz nowe wydarzenie, które będzie się automatycznie powtarzać'
                    : 'Modyfikuj istniejące cykliczne wydarzenie'
                }
            />

            <StepsProgress
                currentStep={currentStep}
                canProceedToStep={canProceedToStep}
                onStepClick={setCurrentStep}
            />

            <form onSubmit={handleSubmit(onFormSubmit)}>
                <FormContent>
                    {currentStep === 1 && (
                        <BasicInfoStep
                            form={form}
                            isLoading={isLoading}
                        />
                    )}

                    {currentStep === 2 && (
                        <RecurrencePatternStep
                            form={form}
                            isLoading={isLoading}
                        />
                    )}

                    {currentStep === 3 && (
                        <VisitTemplateStep
                            form={form}
                            isLoading={isLoading}
                            eventType={watchedType}
                        />
                    )}
                </FormContent>

                <FormActions
                    currentStep={currentStep}
                    canProceed={canProceedToStep(currentStep)}
                    isValid={isValid}
                    isLoading={isLoading}
                    mode={mode}
                    onCancel={onCancel}
                    onPrevious={() => setCurrentStep(currentStep - 1)}
                    onNext={() => setCurrentStep(currentStep + 1)}
                />
            </form>
        </FormContainer>
    );
};

// Styled Components
const FormContainer = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    box-shadow: ${theme.shadow.lg};
    overflow: hidden;
    max-width: 800px;
    width: 100%;
`;

const FormContent = styled.div`
    padding: ${theme.spacing.xxl};
`;

export default RecurringEventForm;