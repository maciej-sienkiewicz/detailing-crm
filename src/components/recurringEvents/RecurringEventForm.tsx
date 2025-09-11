import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    FaCalendarAlt,
    FaSave,
    FaTimes,
    FaInfoCircle,
    FaExclamationTriangle,
    FaCheckCircle,
    FaCog,
    FaUsers
} from 'react-icons/fa';
import {
    RecurringEventFormData,
    EventType,
    EventTypeLabels,
    RecurrenceFrequency,
    CreateRecurringEventRequest,
    RecurringEventResponse
} from '../../types/recurringEvents';
import RecurrencePatternBuilder from './RecurrencePatternBuilder';
import { theme } from '../../styles/theme';

interface RecurringEventFormProps {
    mode: 'create' | 'edit';
    initialData?: RecurringEventResponse;
    onSubmit: (data: CreateRecurringEventRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

// Validation schema
const validationSchema = yup.object({
    title: yup
        .string()
        .required('Tytuł jest wymagany')
        .min(3, 'Tytuł musi mieć co najmniej 3 znaki')
        .max(200, 'Tytuł może mieć maksymalnie 200 znaków'),
    description: yup
        .string()
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
            .of(yup.string())
            .when('frequency', {
                is: RecurrenceFrequency.WEEKLY,
                then: (schema) => schema.min(1, 'Wybierz przynajmniej jeden dzień tygodnia'),
                otherwise: (schema) => schema.optional()
            }),
        dayOfMonth: yup
            .number()
            .min(1, 'Dzień miesiąca musi być między 1 a 31')
            .max(31, 'Dzień miesiąca musi być między 1 a 31')
            .when('frequency', {
                is: RecurrenceFrequency.MONTHLY,
                then: (schema) => schema.required('Dzień miesiąca jest wymagany'),
                otherwise: (schema) => schema.optional()
            }),
        dayOfMonth: yup
    .number()
    .min(1, 'Dzień miesiąca musi być między 1 a 31')
    .max(31, 'Dzień miesiąca musi być między 1 a 31')
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
    visitTemplate: yup.object().when('type', {
    is: EventType.RECURRING_VISIT,
    then: (schema) => schema.shape({
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
            .min(1, 'Dodaj przynajmniej jedną usługę domyślną'),
        notes: yup.string().max(500, 'Notatki mogą mieć maksymalnie 500 znaków')
    }).required('Szablon wizyty jest wymagany dla cyklicznych wizyt'),
    otherwise: (schema) => schema.optional()
})
});

const RecurringEventForm: React.FC<RecurringEventFormProps> = ({
                                                                   mode,
                                                                   initialData,
                                                                   onSubmit,
                                                                   onCancel,
                                                                   isLoading = false
                                                               }) => {
    // Form state
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Initialize form with validation
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isValid, isDirty },
        reset
    } = useForm<RecurringEventFormData>({
        resolver: yupResolver(validationSchema),
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

    // Watch form values for reactive updates
    const watchedType = watch('type');
    const watchedPattern = watch('recurrencePattern');

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
    const onFormSubmit = useCallback(async (data: RecurringEventFormData) => {
        try {
            await onSubmit(data);
        } catch (error) {
            console.error('Form submission error:', error);
        }
    }, [onSubmit]);

    // Handle event type change
    const handleEventTypeChange = useCallback((type: EventType) => {
        setValue('type', type);
        if (type === EventType.SIMPLE_EVENT) {
            setValue('visitTemplate', undefined);
        } else {
            setValue('visitTemplate', {
                estimatedDurationMinutes: 60,
                defaultServices: [],
                notes: ''
            });
        }
    }, [setValue]);

    // Add default service
    const addDefaultService = useCallback(() => {
        const currentTemplate = watch('visitTemplate');
        if (currentTemplate) {
            setValue('visitTemplate.defaultServices', [
                ...currentTemplate.defaultServices,
                { name: '', basePrice: 0 }
            ]);
        }
    }, [setValue, watch]);

    // Remove default service
    const removeDefaultService = useCallback((index: number) => {
        const currentTemplate = watch('visitTemplate');
        if (currentTemplate) {
            const newServices = currentTemplate.defaultServices.filter((_, i) => i !== index);
            setValue('visitTemplate.defaultServices', newServices);
        }
    }, [setValue, watch]);

    // Check if form can proceed to next step
    const canProceedToStep = useMemo(() => {
        switch (currentStep) {
            case 1:
                return !errors.title && !errors.description && !errors.type;
            case 2:
                return !errors.recurrencePattern;
            case 3:
                return watchedType === EventType.SIMPLE_EVENT || !errors.visitTemplate;
            default:
                return false;
        }
    }, [currentStep, errors, watchedType]);

    // Get step title
    const getStepTitle = (step: number) => {
        switch (step) {
            case 1: return 'Podstawowe informacje';
            case 2: return 'Wzorzec powtarzania';
            case 3: return 'Konfiguracja wizyty';
            default: return '';
        }
    };

    // Check if current step is active
    const isStepActive = (step: number) => currentStep === step;
    const isStepCompleted = (step: number) => currentStep > step && canProceedToStep;

    return (
        <FormContainer>
            <FormHeader>
                <HeaderIcon>
                    <FaCalendarAlt />
                </HeaderIcon>
                <HeaderContent>
                    <HeaderTitle>
                        {mode === 'create' ? 'Nowe cykliczne wydarzenie' : 'Edytuj cykliczne wydarzenie'}
                    </HeaderTitle>
                    <HeaderSubtitle>
                        {mode === 'create'
                            ? 'Utwórz nowe wydarzenie, które będzie się automatycznie powtarzać'
                            : 'Modyfikuj istniejące cykliczne wydarzenie'
                        }
                    </HeaderSubtitle>
                </HeaderContent>
            </FormHeader>

            {/* Progress Steps */}
            <StepsContainer>
                <StepIndicator
                    $active={isStepActive(1)}
                    $completed={isStepCompleted(1)}
                    onClick={() => setCurrentStep(1)}
                >
                    <StepNumber $active={isStepActive(1)} $completed={isStepCompleted(1)}>
                        {isStepCompleted(1) ? <FaCheckCircle /> : '1'}
                    </StepNumber>
                    <StepLabel $active={isStepActive(1)}>Podstawowe dane</StepLabel>
                </StepIndicator>

                <StepConnector $completed={isStepCompleted(1)} />

                <StepIndicator
                    $active={isStepActive(2)}
                    $completed={isStepCompleted(2)}
                    onClick={() => canProceedToStep && setCurrentStep(2)}
                >
                    <StepNumber $active={isStepActive(2)} $completed={isStepCompleted(2)}>
                        {isStepCompleted(2) ? <FaCheckCircle /> : '2'}
                    </StepNumber>
                    <StepLabel $active={isStepActive(2)}>Wzorzec powtarzania</StepLabel>
                </StepIndicator>

                <StepConnector $completed={isStepCompleted(2)} />

                <StepIndicator
                    $active={isStepActive(3)}
                    $completed={isStepCompleted(3)}
                    onClick={() => canProceedToStep && setCurrentStep(3)}
                >
                    <StepNumber $active={isStepActive(3)} $completed={isStepCompleted(3)}>
                        {isStepCompleted(3) ? <FaCheckCircle /> : '3'}
                    </StepNumber>
                    <StepLabel $active={isStepActive(3)}>Konfiguracja</StepLabel>
                </StepIndicator>
            </StepsContainer>

            <form onSubmit={handleSubmit(onFormSubmit)}>
                <FormContent>
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <StepContent>
                            <StepTitle>{getStepTitle(1)}</StepTitle>

                            <FormSection>
                                <FormField>
                                    <FieldLabel>
                                        Tytuł wydarzenia
                                        <RequiredIndicator>*</RequiredIndicator>
                                    </FieldLabel>
                                    <Controller
                                        name="title"
                                        control={control}
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
                                        <ErrorMessage>{errors.title.message}</ErrorMessage>
                                    )}
                                </FormField>

                                <FormField>
                                    <FieldLabel>Opis (opcjonalny)</FieldLabel>
                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field }) => (
                                            <TextArea
                                                {...field}
                                                placeholder="Dodatkowe informacje o wydarzeniu..."
                                                rows={3}
                                                $hasError={!!errors.description}
                                                disabled={isLoading}
                                            />
                                        )}
                                    />
                                    {errors.description && (
                                        <ErrorMessage>{errors.description.message}</ErrorMessage>
                                    )}
                                </FormField>

                                <FormField>
                                    <FieldLabel>
                                        Typ wydarzenia
                                        <RequiredIndicator>*</RequiredIndicator>
                                    </FieldLabel>
                                    <EventTypeSelector>
                                        {Object.values(EventType).map(type => (
                                            <EventTypeOption
                                                key={type}
                                                $active={watchedType === type}
                                                onClick={() => handleEventTypeChange(type)}
                                                disabled={isLoading}
                                                type="button"
                                            >
                                                <EventTypeIcon>
                                                    {type === EventType.SIMPLE_EVENT ? <FaInfoCircle /> : <FaUsers />}
                                                </EventTypeIcon>
                                                <EventTypeContent>
                                                    <EventTypeTitle>{EventTypeLabels[type]}</EventTypeTitle>
                                                    <EventTypeDescription>
                                                        {type === EventType.SIMPLE_EVENT
                                                            ? 'Pojedyncze wydarzenia, np. wymiana filtra, kontrola'
                                                            : 'Pełne wizyty z klientami, pojazdem i usługami'
                                                        }
                                                    </EventTypeDescription>
                                                </EventTypeContent>
                                            </EventTypeOption>
                                        ))}
                                    </EventTypeSelector>
                                    {errors.type && (
                                        <ErrorMessage>{errors.type.message}</ErrorMessage>
                                    )}
                                </FormField>
                            </FormSection>
                        </StepContent>
                    )}

                    {/* Step 2: Recurrence Pattern */}
                    {currentStep === 2 && (
                        <StepContent>
                            <StepTitle>{getStepTitle(2)}</StepTitle>

                            <FormSection>
                                <Controller
                                    name="recurrencePattern"
                                    control={control}
                                    render={({ field }) => (
                                        <RecurrencePatternBuilder
                                            value={field.value}
                                            onChange={field.onChange}
                                            disabled={isLoading}
                                            showPreview={true}
                                            maxPreviewItems={8}
                                        />
                                    )}
                                />
                                {errors.recurrencePattern && (
                                    <ErrorMessage>
                                        {errors.recurrencePattern.message || 'Wzorzec powtarzania zawiera błędy'}
                                    </ErrorMessage>
                                )}
                            </FormSection>
                        </StepContent>
                    )}

                    {/* Step 3: Visit Template (if recurring visit) */}
                    {currentStep === 3 && (
                        <StepContent>
                            <StepTitle>{getStepTitle(3)}</StepTitle>

                            {watchedType === EventType.RECURRING_VISIT ? (
                                <FormSection>
                                    <SectionDescription>
                                        <FaInfoCircle />
                                        <span>
                                            Skonfiguruj szablon wizyty, który będzie używany dla każdego wystąpienia.
                                            Możesz modyfikować te dane przy konwersji na rzeczywistą wizytę.
                                        </span>
                                    </SectionDescription>

                                    <FormField>
                                        <FieldLabel>
                                            Szacowany czas trwania (minuty)
                                            <RequiredIndicator>*</RequiredIndicator>
                                        </FieldLabel>
                                        <Controller
                                            name="visitTemplate.estimatedDurationMinutes"
                                            control={control}
                                            render={({ field }) => (
                                                <DurationInput
                                                    type="number"
                                                    min="15"
                                                    max="480"
                                                    step="15"
                                                    {...field}
                                                    value={field.value || ''}
                                                    placeholder="60"
                                                    $hasError={!!errors.visitTemplate?.estimatedDurationMinutes}
                                                    disabled={isLoading}
                                                />
                                            )}
                                        />
                                        {errors.visitTemplate?.estimatedDurationMinutes && (
                                            <ErrorMessage>
                                                {errors.visitTemplate.estimatedDurationMinutes.message}
                                            </ErrorMessage>
                                        )}
                                    </FormField>

                                    <FormField>
                                        <FieldLabel>
                                            Domyślne usługi
                                            <RequiredIndicator>*</RequiredIndicator>
                                        </FieldLabel>
                                        <Controller
                                            name="visitTemplate.defaultServices"
                                            control={control}
                                            render={({ field }) => (
                                                <DefaultServicesContainer>
                                                    {field.value?.map((service, index) => (
                                                        <ServiceRow key={index}>
                                                            <ServiceNameInput
                                                                value={service.name}
                                                                onChange={(e) => {
                                                                    const newServices = [...field.value];
                                                                    newServices[index].name = e.target.value;
                                                                    field.onChange(newServices);
                                                                }}
                                                                placeholder="Nazwa usługi"
                                                                disabled={isLoading}
                                                            />
                                                            <ServicePriceInput
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={service.basePrice}
                                                                onChange={(e) => {
                                                                    const newServices = [...field.value];
                                                                    newServices[index].basePrice = parseFloat(e.target.value) || 0;
                                                                    field.onChange(newServices);
                                                                }}
                                                                placeholder="0.00"
                                                                disabled={isLoading}
                                                            />
                                                            <PriceLabel>zł</PriceLabel>
                                                            <RemoveServiceButton
                                                                type="button"
                                                                onClick={() => removeDefaultService(index)}
                                                                disabled={isLoading}
                                                            >
                                                                <FaTimes />
                                                            </RemoveServiceButton>
                                                        </ServiceRow>
                                                    ))}
                                                    <AddServiceButton
                                                        type="button"
                                                        onClick={addDefaultService}
                                                        disabled={isLoading}
                                                    >
                                                        + Dodaj usługę
                                                    </AddServiceButton>
                                                </DefaultServicesContainer>
                                            )}
                                        />
                                        {errors.visitTemplate?.defaultServices && (
                                            <ErrorMessage>
                                                {errors.visitTemplate.defaultServices.message}
                                            </ErrorMessage>
                                        )}
                                    </FormField>

                                    <FormField>
                                        <FieldLabel>Notatki do szablonu</FieldLabel>
                                        <Controller
                                            name="visitTemplate.notes"
                                            control={control}
                                            render={({ field }) => (
                                                <TextArea
                                                    {...field}
                                                    value={field.value || ''}
                                                    placeholder="Dodatkowe informacje do szablonu wizyty..."
                                                    rows={3}
                                                    $hasError={!!errors.visitTemplate?.notes}
                                                    disabled={isLoading}
                                                />
                                            )}
                                        />
                                        {errors.visitTemplate?.notes && (
                                            <ErrorMessage>{errors.visitTemplate.notes.message}</ErrorMessage>
                                        )}
                                    </FormField>
                                </FormSection>
                            ) : (
                                <CompletionMessage>
                                    <CompletionIcon>
                                        <FaCheckCircle />
                                    </CompletionIcon>
                                    <CompletionContent>
                                        <CompletionTitle>Konfiguracja zakończona</CompletionTitle>
                                        <CompletionDescription>
                                            Wydarzenie typu "Pojedyncze wydarzenie" nie wymaga dodatkowej konfiguracji.
                                            Możesz zapisać wydarzenie lub wrócić do poprzednich kroków aby wprowadzić zmiany.
                                        </CompletionDescription>
                                    </CompletionContent>
                                </CompletionMessage>
                            )}
                        </StepContent>
                    )}
                </FormContent>

                {/* Form Actions */}
                <FormActions>
                    <ActionGroup>
                        <SecondaryButton type="button" onClick={onCancel} disabled={isLoading}>
                            <FaTimes />
                            Anuluj
                        </SecondaryButton>
                    </ActionGroup>

                    <ActionGroup>
                        {currentStep > 1 && (
                            <SecondaryButton
                                type="button"
                                onClick={() => setCurrentStep(currentStep - 1)}
                                disabled={isLoading}
                            >
                                Wstecz
                            </SecondaryButton>
                        )}

                        {currentStep < 3 ? (
                            <PrimaryButton
                                type="button"
                                onClick={() => setCurrentStep(currentStep + 1)}
                                disabled={!canProceedToStep || isLoading}
                            >
                                Dalej
                            </PrimaryButton>
                        ) : (
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
                                        {mode === 'create' ? 'Utwórz wydarzenie' : 'Zapisz zmiany'}
                                    </>
                                )}
                            </PrimaryButton>
                        )}
                    </ActionGroup>
                </FormActions>
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

const FormHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xxl};
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.border};
`;

const HeaderIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: ${theme.primary}15;
    color: ${theme.primary};
    border-radius: ${theme.radius.lg};
    font-size: 24px;
`;

const HeaderContent = styled.div`
    flex: 1;
`;

const HeaderTitle = styled.h2`
    font-size: 22px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.xs} 0;
`;

const HeaderSubtitle = styled.p`
    font-size: 15px;
    color: ${theme.text.secondary};
    margin: 0;
    line-height: 1.4;
`;

const StepsContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xl} ${theme.spacing.xxl};
    background: ${theme.surfaceAlt};
    border-bottom: 1px solid ${theme.border};
`;

const StepIndicator = styled.div<{ $active: boolean; $completed: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.sm};
    cursor: ${props => props.$completed || props.$active ? 'pointer' : 'not-allowed'};
    opacity: ${props => props.$completed || props.$active ? 1 : 0.6};
    transition: all 0.2s ease;

    &:hover {
        opacity: ${props => props.$completed || props.$active ? 1 : 0.8};
    }
`;

const StepNumber = styled.div<{ $active: boolean; $completed: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-weight: 600;
    font-size: 16px;
    background: ${props => {
    if (props.$completed) return theme.success;
    if (props.$active) return theme.primary;
    return theme.surface;
}};
    color: ${props => {
    if (props.$completed || props.$active) return 'white';
    return theme.text.tertiary;
}};
    border: 2px solid ${props => {
    if (props.$completed) return theme.success;
    if (props.$active) return theme.primary;
    return theme.border;
}};
    transition: all 0.2s ease;
`;

const StepLabel = styled.span<{ $active: boolean }>`
    font-size: 13px;
    font-weight: 500;
    color: ${props => props.$active ? theme.text.primary : theme.text.secondary};
    text-align: center;
    white-space: nowrap;
`;

const StepConnector = styled.div<{ $completed: boolean }>`
    width: 60px;
    height: 2px;
    background: ${props => props.$completed ? theme.success : theme.border};
    margin: 0 ${theme.spacing.md};
    transition: background-color 0.2s ease;
`;

const FormContent = styled.div`
    padding: ${theme.spacing.xxl};
`;

const StepContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
`;

const StepTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
    text-align: center;
`;

const FormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
`;

const SectionDescription = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
    background: ${theme.primary}08;
    border: 1px solid ${theme.primary}20;
    border-radius: ${theme.radius.md};
    font-size: 14px;
    color: ${theme.text.secondary};
    line-height: 1.5;

    svg {
        color: ${theme.primary};
        font-size: 16px;
        margin-top: 2px;
        flex-shrink: 0;
    }
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

const EventTypeSelector = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const EventTypeOption = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
    background: ${props => props.$active ? theme.primary : 2};
    border: 2px solid ${props => props.$active ? theme.primary : theme.border};
    border-radius: ${theme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;

    &:hover:not(:disabled) {
        background: ${props => props.$active ? theme.primary : theme.surfaceHover};
        border-color: ${theme.primary};
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const EventTypeIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${theme.primary}15;
    color: ${theme.primary};
    border-radius: ${theme.radius.md};
    font-size: 20px;
    flex-shrink: 0;
`;

const EventTypeContent = styled.div`
    flex: 1;
`;

const EventTypeTitle = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
`;

const EventTypeDescription = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    line-height: 1.4;
`;

const DurationInput = styled.input<{ $hasError: boolean }>`
    width: 200px;
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
`;

const DefaultServicesContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
`;

const ServiceRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
`;

const ServiceNameInput = styled.input`
    flex: 1;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    background: ${theme.surface};
    color: ${theme.text.primary};

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 2px ${theme.primary}20;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: ${theme.surfaceAlt};
    }
`;

const ServicePriceInput = styled.input`
    width: 100px;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    text-align: right;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 2px ${theme.primary}20;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: ${theme.surfaceAlt};
    }
`;

const PriceLabel = styled.span`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const RemoveServiceButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${theme.errorBg};
    color: ${theme.error};
    border: 1px solid ${theme.error}30;
    border-radius: ${theme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.error};
        color: white;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const AddServiceButton = styled.button`
    padding: ${theme.spacing.md};
    background: ${theme.surface};
    color: ${theme.primary};
    border: 2px dashed ${theme.primary};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.primary}08;
        border-style: solid;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const CompletionMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xxl};
    background: ${theme.success}08;
    border: 1px solid ${theme.success}30;
    border-radius: ${theme.radius.lg};
    text-align: center;
`;

const CompletionIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: ${theme.success}15;
    color: ${theme.success};
    border-radius: 50%;
    font-size: 28px;
    flex-shrink: 0;
`;

const CompletionContent = styled.div`
    flex: 1;
    text-align: left;
`;

const CompletionTitle = styled.h4`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.sm} 0;
`;

const CompletionDescription = styled.p`
    font-size: 15px;
    color: ${theme.text.secondary};
    margin: 0;
    line-height: 1.5;
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

const FormActions = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.xl} ${theme.spacing.xxl};
    background: ${theme.surfaceElevated};
    border-top: 1px solid ${theme.border};
`;

const ActionGroup = styled.div`
    display: flex;
    gap: ${theme.spacing.md};
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid;
    min-height: 44px;

    &:hover:not(:disabled) {
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

const PrimaryButton = styled(BaseButton)`
    background: ${theme.primary};
    color: white;
    border-color: ${theme.primary};

    &:hover:not(:disabled) {
        background: ${theme.primaryDark};
        border-color: ${theme.primaryDark};
    }
`;

const SecondaryButton = styled(BaseButton)`
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border-color: ${theme.border};

    &:hover:not(:disabled) {
        background: ${theme.surfaceHover};
        border-color: ${theme.borderActive};
        color: ${theme.text.primary};
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

export default RecurringEventForm;// src/components/recurringEvents/RecurringEventForm.tsx