// src/components/recurringEvents/FormSteps/VisitTemplateStep.tsx - NAPRAWIONY
/**
 * Visit Template Step Component - NAPRAWIONA WERSJA
 * Third step of the form - visit template configuration for recurring visits
 * NAPRAWKI: Poprawiona logika walidacji, lepsze UX dla różnych typów wydarzeń
 */

import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Controller, UseFormReturn } from 'react-hook-form';
import { FaInfoCircle, FaPlus, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { EventType } from '../../../types/recurringEvents';
import { FormData } from '../schema';
import {
    FormField,
    FieldLabel,
    RequiredIndicator,
    ErrorMessage,
    SectionDescription
} from '../FormComponents/FormElements';
import { theme } from '../../../styles/theme';

interface VisitTemplateStepProps {
    form: UseFormReturn<FormData>;
    isLoading: boolean;
    eventType: string;
}

export const VisitTemplateStep: React.FC<VisitTemplateStepProps> = ({
                                                                        form,
                                                                        isLoading,
                                                                        eventType
                                                                    }) => {
    const { control, setValue, watch, formState: { errors } } = form;
    const watchedTemplate = watch('visitTemplate');

    // Add default service
    const addDefaultService = useCallback(() => {
        const currentServices = watchedTemplate?.defaultServices || [];
        setValue('visitTemplate.defaultServices', [
            ...currentServices,
            { name: '', basePrice: 0 }
        ]);
    }, [watchedTemplate, setValue]);

    // Remove default service
    const removeDefaultService = useCallback((index: number) => {
        const currentServices = watchedTemplate?.defaultServices || [];
        const newServices = currentServices.filter((_, i) => i !== index);
        setValue('visitTemplate.defaultServices', newServices);
    }, [watchedTemplate, setValue]);

    // NAPRAWKA: Lepsze renderowanie dla SIMPLE_EVENT
    if (eventType === EventType.SIMPLE_EVENT) {
        return (
            <StepContent>
                <StepTitle>Konfiguracja zakończona</StepTitle>

                <CompletionMessage>
                    <CompletionIcon>
                        <FaCheckCircle />
                    </CompletionIcon>
                    <CompletionContent>
                        <CompletionTitle>Konfiguracja została zakończona</CompletionTitle>
                        <CompletionDescription>
                            Wydarzenie typu "Pojedyncze wydarzenie" nie wymaga dodatkowej konfiguracji szablonu wizyty.
                            Możesz teraz utworzyć wydarzenie lub wrócić do poprzednich kroków aby wprowadzić zmiany.
                        </CompletionDescription>
                        <CompletionActions>
                            <ActionTip>
                                💡 <strong>Wskazówka:</strong> Jeśli potrzebujesz skonfigurować szczegóły wizyty,
                                wybierz typ "Cykliczna wizyta" w pierwszym kroku.
                            </ActionTip>
                        </CompletionActions>
                    </CompletionContent>
                </CompletionMessage>
            </StepContent>
        );
    }

    // NAPRAWKA: Inicjalizacja visitTemplate dla RECURRING_VISIT jeśli nie istnieje
    React.useEffect(() => {
        if (eventType === EventType.RECURRING_VISIT && !watchedTemplate) {
            setValue('visitTemplate', {
                estimatedDurationMinutes: 60,
                defaultServices: [],
                notes: ''
            });
        }
    }, [eventType, watchedTemplate, setValue]);

    return (
        <StepContent>
            <StepTitle>Szablon wizyty</StepTitle>

            <FormSection>
                <SectionDescription>
                    <FaInfoCircle />
                    <span>
                        Skonfiguruj szablon wizyty, który będzie używany jako podstawa dla każdego wystąpienia.
                        Te dane można będzie modyfikować podczas konwersji na rzeczywistą wizytę.
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
                    <DurationHint>
                        Czas podawany w minutach (15 min - 8 godzin). Sugerujemy wielokrotności 15 minut.
                    </DurationHint>
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
                    <ServicesDescription>
                        Lista usług, które będą automatycznie dodawane do każdej wizyty utworzonej z tego szablonu.
                    </ServicesDescription>

                    <Controller
                        name="visitTemplate.defaultServices"
                        control={control}
                        render={({ field }) => (
                            <DefaultServicesContainer>
                                {field.value && field.value.length > 0 ? (
                                    <>
                                        <ServicesHeader>
                                            <HeaderItem>Nazwa usługi</HeaderItem>
                                            <HeaderItem>Cena bazowa</HeaderItem>
                                            <HeaderItem>Akcje</HeaderItem>
                                        </ServicesHeader>

                                        {field.value.map((service, index) => (
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
                                                <ServicePriceContainer>
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
                                                </ServicePriceContainer>
                                                <RemoveServiceButton
                                                    type="button"
                                                    onClick={() => removeDefaultService(index)}
                                                    disabled={isLoading}
                                                    title="Usuń usługę"
                                                >
                                                    <FaTrash />
                                                </RemoveServiceButton>
                                            </ServiceRow>
                                        ))}
                                    </>
                                ) : (
                                    <EmptyServicesState>
                                        <EmptyStateIcon>📋</EmptyStateIcon>
                                        <EmptyStateText>
                                            <EmptyStateTitle>Brak domyślnych usług</EmptyStateTitle>
                                            <EmptyStateDescription>
                                                Dodaj usługi, które będą automatycznie uwzględniane w każdej wizycie.
                                            </EmptyStateDescription>
                                        </EmptyStateText>
                                    </EmptyServicesState>
                                )}

                                <AddServiceButton
                                    type="button"
                                    onClick={addDefaultService}
                                    disabled={isLoading}
                                >
                                    <FaPlus />
                                    Dodaj usługę
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
                    <FieldLabel>Dodatkowe notatki (opcjonalnie)</FieldLabel>
                    <Controller
                        name="visitTemplate.notes"
                        control={control}
                        render={({ field }) => (
                            <TextArea
                                {...field}
                                value={field.value || ''}
                                placeholder="Dodatkowe informacje, instrukcje lub uwagi do szablonu wizyty..."
                                rows={3}
                                $hasError={!!errors.visitTemplate?.notes}
                                disabled={isLoading}
                            />
                        )}
                    />
                    <NotesHint>
                        Przykład: "Sprawdzić stan opon", "Zabrać dokumenty pojazdu", "Wizyta w obecności klienta"
                    </NotesHint>
                    {errors.visitTemplate?.notes && (
                        <ErrorMessage>{errors.visitTemplate.notes.message}</ErrorMessage>
                    )}
                </FormField>
            </FormSection>
        </StepContent>
    );
};

// Styled Components - ULEPSZONE STYLE
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

const DurationHint = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
    margin-top: ${theme.spacing.xs};
`;

const ServicesDescription = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    margin-bottom: ${theme.spacing.md};
    line-height: 1.4;
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

const ServicesHeader = styled.div`
    display: grid;
    grid-template-columns: 1fr 120px 60px;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.sm} 0;
    border-bottom: 1px solid ${theme.border};
    margin-bottom: ${theme.spacing.sm};
`;

const HeaderItem = styled.div`
    font-size: 13px;
    font-weight: 600;
    color: ${theme.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const ServiceRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 120px 60px;
    gap: ${theme.spacing.md};
    align-items: center;
`;

const ServiceNameInput = styled.input`
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

    &::placeholder {
        color: ${theme.text.tertiary};
    }
`;

const ServicePriceContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
`;

const ServicePriceInput = styled.input`
    flex: 1;
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
    min-width: 20px;
`;

const RemoveServiceButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: ${theme.errorBg};
    color: ${theme.error};
    border: 1px solid ${theme.error}30;
    border-radius: ${theme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.error};
        color: white;
        transform: scale(1.05);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const EmptyServicesState = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xl};
    background: ${theme.surface};
    border: 2px dashed ${theme.border};
    border-radius: ${theme.radius.md};
    text-align: center;
`;

const EmptyStateIcon = styled.div`
    font-size: 48px;
    opacity: 0.5;
`;

const EmptyStateText = styled.div`
    flex: 1;
    text-align: left;
`;

const EmptyStateTitle = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
`;

const EmptyStateDescription = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    line-height: 1.4;
`;

const AddServiceButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md};
    background: ${theme.surface};
    color: ${theme.primary};
    border: 2px dashed ${theme.primary};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.primary}08;
        border-style: solid;
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    svg {
        font-size: 14px;
    }
`;

const TextArea = styled.textarea<{ $hasError: boolean }>`
    padding: ${theme.spacing.md};
    border: 1px solid ${props => props.$hasError ? theme.error : theme.border};
    border-radius: ${theme.radius.md};
    font-size: 15px;
    font-family: inherit;
    background: ${theme.surface};
    color: ${theme.text.primary};
    resize: vertical;
    min-height: 80px;
    line-height: 1.5;

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

const NotesHint = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
    margin-top: ${theme.spacing.xs};
    font-style: italic;
`;

const CompletionMessage = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.xl};
    padding: ${theme.spacing.xxl};
    background: ${theme.success}08;
    border: 2px solid ${theme.success}30;
    border-radius: ${theme.radius.xl};
    text-align: left;
`;

const CompletionIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: ${theme.success}15;
    color: ${theme.success};
    border-radius: 50%;
    font-size: 36px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px ${theme.success}20;
`;

const CompletionContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const CompletionTitle = styled.h4`
    font-size: 20px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0;
    line-height: 1.2;
`;

const CompletionDescription = styled.p`
    font-size: 16px;
    color: ${theme.text.secondary};
    margin: 0;
    line-height: 1.6;
`;

const CompletionActions = styled.div`
    margin-top: ${theme.spacing.lg};
`;

const ActionTip = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg};
    background: ${theme.primary}08;
    border: 1px solid ${theme.primary}20;
    border-radius: ${theme.radius.lg};
    font-size: 14px;
    line-height: 1.5;
    color: ${theme.text.secondary};

    strong {
        color: ${theme.primary};
        font-weight: 600;
    }
`;