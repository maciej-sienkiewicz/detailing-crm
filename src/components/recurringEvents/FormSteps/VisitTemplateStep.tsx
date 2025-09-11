// src/components/recurringEvents/FormSteps/VisitTemplateStep.tsx
/**
 * Visit Template Step Component
 * Third step of the form - visit template configuration for recurring visits
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

    if (eventType === EventType.SIMPLE_EVENT) {
        return (
            <StepContent>
                <StepTitle>Konfiguracja zakończona</StepTitle>

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
            </StepContent>
        );
    }

    return (
        <StepContent>
            <StepTitle>Konfiguracja szablonu wizyty</StepTitle>

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
                                            <FaTrash />
                                        </RemoveServiceButton>
                                    </ServiceRow>
                                ))}
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
        </StepContent>
    );
};

// Styled Components
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};
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