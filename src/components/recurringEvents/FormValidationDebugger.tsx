// src/components/recurringEvents/FormComponents/FormValidationDebugger.tsx
/**
 * Form Validation Debugger Component
 * Pomocniczy komponent do debugowania walidacji formularza w development mode
 */

import React from 'react';
import styled from 'styled-components';
import { UseFormReturn } from 'react-hook-form';
import { FaBug, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { FormData, canProceedToStep } from './schema';
import { theme } from '../../styles/theme';

interface FormValidationDebuggerProps {
    form: UseFormReturn<FormData>;
    currentStep: number;
}

export const FormValidationDebugger: React.FC<FormValidationDebuggerProps> = ({
                                                                                  form,
                                                                                  currentStep
                                                                              }) => {
    const formData = form.watch();
    const errors = form.formState.errors;
    const isValid = form.formState.isValid;

    // Sprawdź każdy krok
    const step1Valid = canProceedToStep(1, formData, errors);
    const step2Valid = canProceedToStep(2, formData, errors);
    const step3Valid = canProceedToStep(3, formData, errors);

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <DebugContainer>
            <DebugHeader>
                <FaBug />
                <DebugTitle>Form Validation Debugger</DebugTitle>
            </DebugHeader>

            <DebugSection>
                <SectionTitle>Overall Form State</SectionTitle>
                <StateGrid>
                    <StateItem>
                        <StateLabel>Current Step:</StateLabel>
                        <StateValue>{currentStep}/3</StateValue>
                    </StateItem>
                    <StateItem>
                        <StateLabel>Form Valid:</StateLabel>
                        <StateValue $status={isValid ? 'success' : 'error'}>
                            {isValid ? <FaCheckCircle /> : <FaTimesCircle />}
                            {isValid ? 'Valid' : 'Invalid'}
                        </StateValue>
                    </StateItem>
                    <StateItem>
                        <StateLabel>Event Type:</StateLabel>
                        <StateValue>{formData.type || 'Not set'}</StateValue>
                    </StateItem>
                </StateGrid>
            </DebugSection>

            <DebugSection>
                <SectionTitle>Step Validation</SectionTitle>
                <StepValidationGrid>
                    <StepValidationItem $valid={step1Valid} $active={currentStep === 1}>
                        <StepNumber>1</StepNumber>
                        <StepInfo>
                            <StepName>Basic Info</StepName>
                            <StepStatus>{step1Valid ? 'Valid' : 'Invalid'}</StepStatus>
                        </StepInfo>
                        {step1Valid ? <FaCheckCircle /> : <FaTimesCircle />}
                    </StepValidationItem>

                    <StepValidationItem $valid={step2Valid} $active={currentStep === 2}>
                        <StepNumber>2</StepNumber>
                        <StepInfo>
                            <StepName>Recurrence</StepName>
                            <StepStatus>{step2Valid ? 'Valid' : 'Invalid'}</StepStatus>
                        </StepInfo>
                        {step2Valid ? <FaCheckCircle /> : <FaTimesCircle />}
                    </StepValidationItem>

                    <StepValidationItem $valid={step3Valid} $active={currentStep === 3}>
                        <StepNumber>3</StepNumber>
                        <StepInfo>
                            <StepName>Visit Template</StepName>
                            <StepStatus>{step3Valid ? 'Valid' : 'Invalid'}</StepStatus>
                        </StepInfo>
                        {step3Valid ? <FaCheckCircle /> : <FaTimesCircle />}
                    </StepValidationItem>
                </StepValidationGrid>
            </DebugSection>

            {Object.keys(errors).length > 0 && (
                <DebugSection>
                    <SectionTitle>Validation Errors</SectionTitle>
                    <ErrorsList>
                        {Object.entries(errors).map(([field, error]) => (
                            <ErrorItem key={field}>
                                <ErrorField>{field}:</ErrorField>
                                <ErrorMessage>{error?.message || 'Unknown error'}</ErrorMessage>
                            </ErrorItem>
                        ))}
                    </ErrorsList>
                </DebugSection>
            )}

            <DebugSection>
                <SectionTitle>Form Data (Preview)</SectionTitle>
                <DataPreview>
                    <DataItem>
                        <DataLabel>Title:</DataLabel>
                        <DataValue>{formData.title || 'Not set'}</DataValue>
                    </DataItem>
                    <DataItem>
                        <DataLabel>Type:</DataLabel>
                        <DataValue>{formData.type || 'Not set'}</DataValue>
                    </DataItem>
                    <DataItem>
                        <DataLabel>Frequency:</DataLabel>
                        <DataValue>{formData.recurrencePattern?.frequency || 'Not set'}</DataValue>
                    </DataItem>
                    <DataItem>
                        <DataLabel>Visit Template:</DataLabel>
                        <DataValue>{formData.visitTemplate ? 'Set' : 'Not set'}</DataValue>
                    </DataItem>
                    {formData.visitTemplate && (
                        <DataItem>
                            <DataLabel>Services Count:</DataLabel>
                            <DataValue>{formData.visitTemplate.defaultServices?.length || 0}</DataValue>
                        </DataItem>
                    )}
                </DataPreview>
            </DebugSection>
        </DebugContainer>
    );
};

// Styled Components
const DebugContainer = styled.div`
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 400px;
    max-height: 600px;
    overflow-y: auto;
    background: ${theme.surface};
    border: 2px solid ${theme.primary};
    border-radius: ${theme.radius.lg};
    box-shadow: ${theme.shadow.lg};
    z-index: 9999;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
`;

const DebugHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md};
    background: ${theme.primary};
    color: white;
    font-weight: 600;
    font-size: 14px;
`;

const DebugTitle = styled.span`
    flex: 1;
`;

const DebugSection = styled.div`
    padding: ${theme.spacing.md};
    border-bottom: 1px solid ${theme.border};

    &:last-child {
        border-bottom: none;
    }
`;

const SectionTitle = styled.h4`
    font-size: 12px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.sm} 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const StateGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${theme.spacing.xs};
`;

const StateItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.xs};
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.sm};
    font-size: 11px;
`;

const StateLabel = styled.span`
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const StateValue = styled.span<{ $status?: 'success' | 'error' }>`
    color: ${props => {
    if (props.$status === 'success') return theme.success;
    if (props.$status === 'error') return theme.error;
    return theme.text.primary;
}};
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};

    svg {
        font-size: 10px;
    }
`;

const StepValidationGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${theme.spacing.xs};
`;

const StepValidationItem = styled.div<{ $valid: boolean; $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm};
    background: ${props => {
    if (props.$active) return theme.primary + '20';
    return theme.surfaceAlt;
}};
    border: 1px solid ${props => {
    if (props.$active) return theme.primary;
    if (props.$valid) return theme.success + '50';
    return theme.error + '50';
}};
    border-radius: ${theme.radius.sm};
    font-size: 11px;
`;

const StepNumber = styled.div`
    width: 20px;
    height: 20px;
    background: ${theme.primary};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 10px;
`;

const StepInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const StepName = styled.span`
    color: ${theme.text.primary};
    font-weight: 600;
`;

const StepStatus = styled.span`
    color: ${theme.text.tertiary};
    font-size: 10px;
`;

const ErrorsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const ErrorItem = styled.div`
    padding: ${theme.spacing.xs};
    background: ${theme.errorBg};
    border: 1px solid ${theme.error}30;
    border-radius: ${theme.radius.sm};
    font-size: 10px;
`;

const ErrorField = styled.span`
    color: ${theme.error};
    font-weight: 700;
    margin-right: ${theme.spacing.xs};
`;

const ErrorMessage = styled.span`
    color: ${theme.text.primary};
`;

const DataPreview = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${theme.spacing.xs};
`;

const DataItem = styled.div`
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing.xs};
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.sm};
    font-size: 10px;
`;

const DataLabel = styled.span`
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const DataValue = styled.span`
    color: ${theme.text.primary};
    font-weight: 600;
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;