// src/components/recurringEvents/views/EditFormView.tsx
/**
 * Edit Form View Component
 * Limited editing view for existing recurring events
 */

import React from 'react';
import styled from 'styled-components';
import { Controller, UseFormReturn } from 'react-hook-form';
import { FaInfoCircle, FaSave, FaTimes } from 'react-icons/fa';
import {
    RecurringEventResponse,
    EventTypeLabels,
    RecurrenceFrequencyLabels
} from '../../../types/recurringEvents';
import { FormHeader } from '../FormComponents/FormHeader';
import {
    FormField,
    FieldLabel,
    RequiredIndicator,
    ErrorMessage
} from '../FormComponents/FormElements';
import { theme } from '../../../styles/theme';

interface LimitedEditFormData {
    title: string;
    description?: string;
}

interface EditFormViewProps {
    initialData: RecurringEventResponse;
    form: UseFormReturn<LimitedEditFormData>;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isLoading: boolean;
}

export const EditFormView: React.FC<EditFormViewProps> = ({
                                                              initialData,
                                                              form,
                                                              onSubmit,
                                                              onCancel,
                                                              isLoading
                                                          }) => {
    const { control, formState: { errors, isValid } } = form;

    return (
        <FormContainer>
            <FormHeader
                mode="edit"
                title="Edytuj cykliczne wydarzenie"
                subtitle="Modyfikuj podstawowe informacje o wydarzeniu"
            />

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

            <form onSubmit={onSubmit}>
                <FormContent>
                    <EditFormSection>
                        <SectionTitle>Edytowalne pola</SectionTitle>

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
                                        value={field.value || ''}
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

const FormContent = styled.div`
    padding: ${theme.spacing.xxl};

    @media (max-width: 768px) {
        padding: ${theme.spacing.xl};
    }
`;

const EditFormSection = styled.section`
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

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.xl} ${theme.spacing.xxl};
    background: ${theme.surfaceElevated};
    border-top: 1px solid ${theme.border};
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.xl};
    border-radius: ${theme.radius.lg};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid;
    min-height: 48px;
    min-width: 140px;
    justify-content: center;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.lg};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    svg {
        font-size: 14px;
    }
`;

const PrimaryButton = styled(BaseButton)`
    background: ${theme.primary};
    color: white;
    border-color: ${theme.primary};

    &:hover:not(:disabled) {
        background: ${theme.primaryDark};
        border-color: ${theme.primaryDark};
        box-shadow: 0 4px 12px ${theme.primary}40;
    }

    &:disabled {
        background: ${theme.surfaceAlt};
        color: ${theme.text.tertiary};
        border-color: ${theme.border};
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