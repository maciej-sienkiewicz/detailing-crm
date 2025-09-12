// src/components/recurringEvents/RecurringEventForm.tsx - OGRANICZONA EDYCJA
/**
 * Main Recurring Event Form Component
 * Orchestrates the multi-step form for creating/editing recurring events
 * NOWOŚĆ: Ograniczona edycja tylko nazwy i opisu dla istniejących wydarzeń
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useForm, FieldValues, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    EventType,
    CreateRecurringEventRequest,
    RecurringEventResponse,
    RecurrenceFrequency,
    EventTypeLabels,
    RecurrenceFrequencyLabels
} from '../../types/recurringEvents';
import { FormHeader } from './FormComponents/FormHeader';
import { StepsProgress } from './FormComponents/StepsProgress';
import { BasicInfoStep } from './FormSteps/BasicInfoStep';
import { RecurrencePatternStep } from './FormSteps/RecurrencePatternStep';
import { VisitTemplateStep } from './FormSteps/VisitTemplateStep';
import { FormActions } from './FormComponents/FormActions';
import { validationSchema, FormData } from './schema';
import { theme } from '../../styles/theme';
import { FaInfoCircle, FaExclamationTriangle, FaSave, FaTimes } from 'react-icons/fa';

interface RecurringEventFormProps {
    mode: 'create' | 'edit';
    initialData?: RecurringEventResponse;
    onSubmit: (data: CreateRecurringEventRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

// Ograniczona walidacja dla edycji (tylko nazwa i opis)
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

const RecurringEventForm: React.FC<RecurringEventFormProps> = ({
                                                                   mode,
                                                                   initialData,
                                                                   onSubmit,
                                                                   onCancel,
                                                                   isLoading = false
                                                               }) => {
    // Form state
    const [currentStep, setCurrentStep] = useState(1);

    // Wybieramy odpowiednią walidację i typ danych w zależności od trybu
    const isLimitedEdit = mode === 'edit';

    // Formularz dla ograniczonej edycji
    const limitedEditForm = useForm<LimitedEditFormData>({
        resolver: yupResolver(limitedEditValidationSchema) as any,
        defaultValues: {
            title: initialData?.title || '',
            description: initialData?.description || ''
        },
        mode: 'onChange'
    });

    // Formularz dla pełnego tworzenia
    const fullForm = useForm<FormData>({
        resolver: yupResolver(validationSchema) as any,
        defaultValues: {
            title: '',
            description: '',
            type: EventType.SIMPLE_EVENT,
            recurrencePattern: {
                frequency: RecurrenceFrequency.WEEKLY,
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

    // Wybieramy odpowiedni formularz
    const activeForm = isLimitedEdit ? limitedEditForm : fullForm;
    const { handleSubmit, watch, reset, formState: { errors, isValid } } = activeForm;

    const watchedType = !isLimitedEdit ? (fullForm.watch('type') as EventType) : initialData?.type;

    // Initialize form with existing data for full creation mode
    useEffect(() => {
        if (mode === 'create') {
            fullForm.reset({
                title: '',
                description: '',
                type: EventType.SIMPLE_EVENT,
                recurrencePattern: {
                    frequency: RecurrenceFrequency.WEEKLY,
                    interval: 1,
                    daysOfWeek: undefined,
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
    }, [mode, initialData, fullForm.reset, limitedEditForm.reset]);

    // Handle form submission
    const onFormSubmit = useCallback(async (data: LimitedEditFormData | FormData) => {
        try {
            if (isLimitedEdit && initialData) {
                // Dla edycji - zachowujemy wszystkie pozostałe pola z initialData
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
                // Dla tworzenia - standardowa transformacja
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
                await onSubmit(transformedData);
            }
        } catch (error) {
            console.error('Form submission error:', error);
        }
    }, [isLimitedEdit, initialData, onSubmit]);

    // Check if form can proceed to next step (tylko dla trybu tworzenia)
    const canProceedToStep = useCallback((step: number) => {
        if (isLimitedEdit) return true; // W trybie edycji nie ma kroków

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
    }, [errors, watchedType, isLimitedEdit]);

    // Jeśli to tryb edycji, wyświetl ograniczony formularz
    if (isLimitedEdit && initialData) {
        return (
            <FormContainer>
                <FormHeader
                    mode={mode}
                    title="Edytuj cykliczne wydarzenie"
                    subtitle="Modyfikuj podstawowe informacje o wydarzeniu"
                />

                {/* Informacja o ograniczeniach edycji */}
                <EditLimitationNotice>
                    <NoticeIcon>
                        <FaInfoCircle />
                    </NoticeIcon>
                    <NoticeContent>
                        <NoticeTitle>Ograniczona edycja</NoticeTitle>
                        <NoticeText>
                            W ramach edycji możesz modyfikować wyłącznie tytuł oraz opis wydarzenia.
                            W celu zmiany pozostałych parametrów (typ, częstotliwość, wzorzec) zalecamy
                            deaktywację bieżącego wydarzenia i utworzenie nowego. Takie podejście zapewnia
                            przejrzystość i spójność danych statystycznych.
                        </NoticeText>
                    </NoticeContent>
                </EditLimitationNotice>

                {/* Wyświetlenie informacji o aktualnych ustawieniach */}
                <CurrentSettingsSection>
                    <SectionTitle>Aktualne ustawienia (tylko do odczytu)</SectionTitle>
                    <SettingsGrid>
                        <SettingItem>
                            <SettingLabel>Typ wydarzenia:</SettingLabel>
                            <SettingValue>{EventTypeLabels[initialData.type]}</SettingValue>
                        </SettingItem>
                        <SettingItem>
                            <SettingLabel>Częstotliwość:</SettingLabel>
                            <SettingValue>{RecurrenceFrequencyLabels[initialData.recurrencePattern.frequency]}</SettingValue>
                        </SettingItem>
                        <SettingItem>
                            <SettingLabel>Interwał:</SettingLabel>
                            <SettingValue>Co {initialData.recurrencePattern.interval}</SettingValue>
                        </SettingItem>
                        <SettingItem>
                            <SettingLabel>Status:</SettingLabel>
                            <SettingValue>
                                <StatusBadge $active={initialData.isActive}>
                                    {initialData.isActive ? 'Aktywne' : 'Nieaktywne'}
                                </StatusBadge>
                            </SettingValue>
                        </SettingItem>
                    </SettingsGrid>
                </CurrentSettingsSection>

                <form onSubmit={limitedEditForm.handleSubmit(onFormSubmit)}>
                    <FormContent>
                        <EditFormSection>
                            <SectionTitle>Edytowalne pola</SectionTitle>

                            {/* Tytuł */}
                            <FormField>
                                <FieldLabel>
                                    Tytuł wydarzenia
                                    <RequiredIndicator>*</RequiredIndicator>
                                </FieldLabel>
                                <Controller
                                    name="title"
                                    control={limitedEditForm.control}
                                    render={({ field }) => (
                                        <TextInput
                                            {...field}
                                            placeholder="Np. Cykliczny przegląd techniczny"
                                            $hasError={!!errors.title}
                                            disabled={isLoading}
                                        />
                                    )}
                                />
                                {errors.title && (
                                    <ErrorMessage>{(errors.title as any).message}</ErrorMessage>
                                )}
                            </FormField>

                            {/* Opis */}
                            <FormField>
                                <FieldLabel>Opis (opcjonalny)</FieldLabel>
                                <Controller
                                    name="description"
                                    control={limitedEditForm.control}
                                    render={({ field }) => (
                                        <TextArea
                                            {...field}
                                            value={field.value || ''}
                                            placeholder="Dodatkowe informacje o wydarzeniu..."
                                            rows={3}
                                            $hasError={!!errors.description}
                                            disabled={isLoading}
                                        />
                                    )}
                                />
                                {errors.description && (
                                    <ErrorMessage>{(errors.description as any).message}</ErrorMessage>
                                )}
                            </FormField>
                        </EditFormSection>
                    </FormContent>

                    <FormActions>
                        <SecondaryButton
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            <FaTimes />
                            Anuluj
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={!isValid || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <LoadingSpinner />
                                    Zapisywanie...
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    Zapisz zmiany
                                </>
                            )}
                        </PrimaryButton>
                    </FormActions>
                </form>
            </FormContainer>
        );
    }

    // Tryb tworzenia - pełny formularz wielokrokowy
    return (
        <FormContainer>
            <FormHeader
                mode={mode}
                title="Nowe cykliczne wydarzenie"
                subtitle="Utwórz nowe wydarzenie, które będzie się automatycznie powtarzać"
            />

            <StepsProgress
                currentStep={currentStep}
                canProceedToStep={canProceedToStep}
                onStepClick={setCurrentStep}
                errors={errors}
            />

            <form onSubmit={fullForm.handleSubmit(onFormSubmit)}>
                <FormContent>
                    {currentStep === 1 && (
                        <BasicInfoStep
                            form={fullForm as any}
                            isLoading={isLoading}
                        />
                    )}

                    {currentStep === 2 && (
                        <RecurrencePatternStep
                            form={fullForm as any}
                            isLoading={isLoading}
                        />
                    )}

                    {currentStep === 3 && (
                        <VisitTemplateStep
                            form={fullForm as any}
                            isLoading={isLoading}
                            eventType={watchedType || EventType.SIMPLE_EVENT}
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
    width: 100%;
    max-width: 1200px;
    min-height: 700px;
`;

const FormContent = styled.div`
    padding: ${theme.spacing.xxl};
    min-height: 500px;

    @media (max-width: 768px) {
        padding: ${theme.spacing.xl};
    }
`;

const EditLimitationNotice = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xl};
    background: ${theme.primary}08;
    border: 1px solid ${theme.primary}20;
    margin: 0 ${theme.spacing.xxl} ${theme.spacing.xl};
    border-radius: ${theme.radius.lg};
`;

const NoticeIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${theme.primary}15;
    color: ${theme.primary};
    border-radius: ${theme.radius.lg};
    font-size: 20px;
    flex-shrink: 0;
`;

const NoticeContent = styled.div`
    flex: 1;
`;

const NoticeTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.sm} 0;
`;

const NoticeText = styled.p`
    font-size: 14px;
    color: ${theme.text.secondary};
    line-height: 1.6;
    margin: 0;
`;

const CurrentSettingsSection = styled.section`
    margin: 0 ${theme.spacing.xxl} ${theme.spacing.xl};
    padding: ${theme.spacing.xl};
    background: ${theme.surfaceElevated};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.lg} 0;
`;

const SettingsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${theme.spacing.lg};
`;

const SettingItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const SettingLabel = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: ${theme.text.tertiary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const SettingValue = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const StatusBadge = styled.div<{ $active: boolean }>`
    display: inline-flex;
    align-items: center;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${props => props.$active ? theme.success + '20' : theme.error + '20'};
    color: ${props => props.$active ? theme.success : theme.error};
    border: 1px solid ${props => props.$active ? theme.success + '40' : theme.error + '40'};
    border-radius: ${theme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    width: fit-content;
`;

const EditFormSection = styled.section`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
`;

const FormField = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
`;

const FieldLabel = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

const RequiredIndicator = styled.span`
    color: ${theme.error};
    font-size: 14px;
`;

const TextInput = styled.input<{ $hasError: boolean }>`
    padding: ${theme.spacing.md};
    border: 1px solid ${props => props.$hasError ? theme.error : theme.border};
    border-radius: ${theme.radius.md};
    font-size: 15px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? theme.error : theme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? theme.error : theme.primary}20;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: ${theme.surfaceAlt};
    }

    &::placeholder {
        color: ${theme.text.tertiary};
    }
`;

const TextArea = styled.textarea<{ $hasError: boolean }>`
    padding: ${theme.spacing.md};
    border: 1px solid ${props => props.$hasError ? theme.error : theme.border};
    border-radius: ${theme.radius.md};
    font-size: 15px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? theme.error : theme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? theme.error : theme.primary}20;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: ${theme.surfaceAlt};
    }

    &::placeholder {
        color: ${theme.text.tertiary};
    }
`;

const ErrorMessage = styled.div`
    font-size: 13px;
    color: ${theme.error};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    margin-top: ${theme.spacing.xs};

    &::before {
        content: '⚠';
        font-size: 12px;
    }
`;

const LimitedFormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.xl} ${theme.spacing.xxl};
    background: ${theme.surfaceElevated};
    border-top: 1px solid ${theme.border};
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.xl} ${theme.spacing.xxl};
    background: ${theme.surfaceElevated};
    border-top: 1px solid ${theme.border};
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;

    &:hover:not(:disabled) {
        background: ${theme.surfaceHover};
        border-color: ${theme.borderActive};
        color: ${theme.text.primary};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const PrimaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.primary};
    color: white;
    border: 1px solid ${theme.primary};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;

    &:hover:not(:disabled) {
        background: ${theme.primaryDark};
        border-color: ${theme.primaryDark};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export default RecurringEventForm;