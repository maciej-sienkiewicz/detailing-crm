// src/components/recurringEvents/FormComponents/StepsProgress.tsx
/**
 * Steps Progress Component
 * Shows the current progress in the multi-step form
 */

import React from 'react';
import styled from 'styled-components';
import { FaCheckCircle } from 'react-icons/fa';
import { theme } from '../../../styles/theme';

interface StepsProgressProps {
    currentStep: number;
    canProceedToStep: (step: number) => boolean;
    onStepClick: (step: number) => void;
}

const STEPS = [
    { number: 1, label: 'Podstawowe dane' },
    { number: 2, label: 'Wzorzec powtarzania' },
    { number: 3, label: 'Konfiguracja' }
];

export const StepsProgress: React.FC<StepsProgressProps> = ({
                                                                currentStep,
                                                                canProceedToStep,
                                                                onStepClick
                                                            }) => {
    const isStepActive = (step: number) => currentStep === step;
    const isStepCompleted = (step: number) => currentStep > step && canProceedToStep(step);

    return (
        <StepsContainer>
            {STEPS.map((step, index) => (
                <React.Fragment key={step.number}>
                    <StepIndicator
                        $active={isStepActive(step.number)}
                        $completed={isStepCompleted(step.number)}
                        onClick={() => {
                            if (isStepCompleted(step.number) || isStepActive(step.number)) {
                                onStepClick(step.number);
                            }
                        }}
                    >
                        <StepNumber
                            $active={isStepActive(step.number)}
                            $completed={isStepCompleted(step.number)}
                        >
                            {isStepCompleted(step.number) ? <FaCheckCircle /> : step.number}
                        </StepNumber>
                        <StepLabel $active={isStepActive(step.number)}>
                            {step.label}
                        </StepLabel>
                    </StepIndicator>

                    {index < STEPS.length - 1 && (
                        <StepConnector $completed={isStepCompleted(step.number)} />
                    )}
                </React.Fragment>
            ))}
        </StepsContainer>
    );
};

// Styled Components
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