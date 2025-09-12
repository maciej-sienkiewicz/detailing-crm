// src/components/recurringEvents/FormComponents/StepsProgress.tsx - ULEPSZONE
/**
 * Steps Progress Component
 * Shows the current progress in the multi-step form
 * ULEPSZENIA: Lepsze wizualne wskazanie, animacje, tooltips
 */

import React from 'react';
import styled from 'styled-components';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { theme } from '../../../styles/theme';

interface StepsProgressProps {
    currentStep: number;
    canProceedToStep: (step: number) => boolean;
    onStepClick: (step: number) => void;
    errors?: Record<string, any>;
}

const STEPS = [
    {
        number: 1,
        label: 'Podstawowe dane',
        description: 'Tytuł i typ wydarzenia'
    },
    {
        number: 2,
        label: 'Wzorzec powtarzania',
        description: 'Częstotliwość i harmonogram'
    },
    {
        number: 3,
        label: 'Konfiguracja',
        description: 'Szablon wizyty i szczegóły'
    }
];

export const StepsProgress: React.FC<StepsProgressProps> = ({
                                                                currentStep,
                                                                canProceedToStep,
                                                                onStepClick,
                                                                errors = {}
                                                            }) => {
    const isStepActive = (step: number) => currentStep === step;
    const isStepCompleted = (step: number) => currentStep > step && canProceedToStep(step);
    const hasStepError = (step: number) => {
        switch (step) {
            case 1:
                return !!(errors.title || errors.type || errors.description);
            case 2:
                return !!(errors.recurrencePattern || Object.keys(errors).some(key => key.startsWith('recurrencePattern.')));
            case 3:
                return !!(errors.visitTemplate || Object.keys(errors).some(key => key.startsWith('visitTemplate.')));
            default:
                return false;
        }
    };

    return (
        <StepsContainer>
            <StepsHeader>
                <StepsTitle>Tworzenie cyklicznego wydarzenia</StepsTitle>
                <StepsSubtitle>Krok {currentStep} z {STEPS.length}</StepsSubtitle>
            </StepsHeader>

            <StepsProgressStyle>
                {STEPS.map((step, index) => (
                    <React.Fragment key={step.number}>
                        <StepIndicator
                            $active={isStepActive(step.number)}
                            $completed={isStepCompleted(step.number)}
                            $hasError={hasStepError(step.number)}
                            $clickable={isStepCompleted(step.number) || isStepActive(step.number)}
                            onClick={() => {
                                if (isStepCompleted(step.number) || isStepActive(step.number)) {
                                    onStepClick(step.number);
                                }
                            }}
                            title={step.description}
                        >
                            <StepNumber
                                $active={isStepActive(step.number)}
                                $completed={isStepCompleted(step.number)}
                                $hasError={hasStepError(step.number)}
                            >
                                {isStepCompleted(step.number) ? (
                                    <FaCheckCircle />
                                ) : hasStepError(step.number) && !isStepActive(step.number) ? (
                                    <FaExclamationCircle />
                                ) : (
                                    step.number
                                )}
                            </StepNumber>
                            <StepContent>
                                <StepLabel $active={isStepActive(step.number)}>
                                    {step.label}
                                </StepLabel>
                                <StepDescription>
                                    {step.description}
                                </StepDescription>
                            </StepContent>
                        </StepIndicator>

                        {index < STEPS.length - 1 && (
                            <StepConnector
                                $completed={isStepCompleted(step.number)}
                                $active={currentStep > step.number}
                            />
                        )}
                    </React.Fragment>
                ))}
            </StepsProgressStyle>

            <ProgressBar>
                <ProgressFill
                    $progress={(currentStep - 1) / (STEPS.length - 1) * 100}
                />
            </ProgressBar>
        </StepsContainer>
    );
};

// Styled Components - ULEPSZONE
const StepsContainer = styled.div`
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.border};
    padding: ${theme.spacing.xl} ${theme.spacing.xxl};
`;

const StepsHeader = styled.div`
    text-align: center;
    margin-bottom: ${theme.spacing.xl};
`;

const StepsTitle = styled.h2`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.xs} 0;
`;

const StepsSubtitle = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const StepsProgressStyle = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: ${theme.spacing.lg};
`;

const StepIndicator = styled.div<{
    $active: boolean;
    $completed: boolean;
    $hasError: boolean;
    $clickable: boolean;
}>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    cursor: ${props => props.$clickable ? 'pointer' : 'default'};
    opacity: ${props => props.$completed || props.$active ? 1 : 0.6};
    transition: all 0.3s ease;
    padding: ${theme.spacing.md};
    border-radius: ${theme.radius.lg};

    &:hover {
        opacity: ${props => props.$clickable ? 1 : 0.6};
        background: ${props => props.$clickable ? theme.surfaceHover : 'transparent'};
    }
`;

const StepNumber = styled.div<{
    $active: boolean;
    $completed: boolean;
    $hasError: boolean;
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    font-weight: 700;
    font-size: 16px;
    transition: all 0.3s ease;
    border: 3px solid;
    
    ${props => {
    if (props.$hasError && !props.$active) {
        return `
                background: ${theme.errorBg};
                color: ${theme.error};
                border-color: ${theme.error};
            `;
    }
    if (props.$completed) {
        return `
                background: ${theme.success};
                color: white;
                border-color: ${theme.success};
            `;
    }
    if (props.$active) {
        return `
                background: ${theme.primary};
                color: white;
                border-color: ${theme.primary};
                box-shadow: 0 0 0 4px ${theme.primary}20;
            `;
    }
    return `
            background: ${theme.surface};
            color: ${theme.text.tertiary};
            border-color: ${theme.border};
        `;
}}
`;

const StepContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const StepLabel = styled.span<{ $active: boolean }>`
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.$active ? theme.text.primary : theme.text.secondary};
    transition: color 0.3s ease;
`;

const StepDescription = styled.span`
    font-size: 12px;
    color: ${theme.text.tertiary};
    line-height: 1.3;
`;

const StepConnector = styled.div<{
    $completed: boolean;
    $active: boolean;
}>`
    width: 80px;
    height: 3px;
    margin: 0 ${theme.spacing.lg};
    border-radius: ${theme.radius.sm};
    transition: all 0.3s ease;
    background: ${props => {
    if (props.$completed) return theme.success;
    if (props.$active) return theme.primary;
    return theme.border;
}};
`;

const ProgressBar = styled.div`
    width: 100%;
    height: 4px;
    background: ${theme.border};
    border-radius: ${theme.radius.sm};
    overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number }>`
    height: 100%;
    background: linear-gradient(90deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
    width: ${props => props.$progress}%;
    transition: width 0.5s ease;
    border-radius: ${theme.radius.sm};
`;