// src/components/recurringEvents/FormSteps/BasicInfoStep.tsx
/**
 * Basic Info Step Component
 * First step of the form - title, description, and event type selection
 */

import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Controller, UseFormReturn } from 'react-hook-form';
import { FaInfoCircle, FaUsers } from 'react-icons/fa';
import { EventType, EventTypeLabels } from '../../../types/recurringEvents';
import { FormData } from '../schema';
import { FormField, FieldLabel, RequiredIndicator, ErrorMessage } from '../FormComponents/FormElements';
import { theme } from '../../../styles/theme';

interface BasicInfoStepProps {
    form: UseFormReturn<FormData>;
    isLoading: boolean;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
                                                                form,
                                                                isLoading
                                                            }) => {
    const { control, setValue, watch, formState: { errors } } = form;
    const watchedType = watch('type');

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

    return (
        <StepContent>
            <StepTitle>Podstawowe informacje</StepTitle>

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
    background: ${props => props.$active ? theme.primary + '20' : theme.surface};
    border: 2px solid ${props => props.$active ? theme.primary : theme.border};
    border-radius: ${theme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;

    &:hover:not(:disabled) {
        background: ${props => props.$active ? theme.primary + '30' : theme.surfaceHover};
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