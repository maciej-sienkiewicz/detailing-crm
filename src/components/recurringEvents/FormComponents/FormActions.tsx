// src/components/recurringEvents/FormComponents/FormActions.tsx - NAPRAWIONE
/**
 * Form Actions Component
 * Navigation and submission buttons for the form
 * NAPRAWKA: Opcjonalne błędy i lepsze typowanie
 */

import React from 'react';
import styled from 'styled-components';
import { FaSave, FaTimes, FaArrowLeft, FaArrowRight, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { theme } from '../../../styles/theme';
import { getStepValidationMessage } from '../schema';

interface FormActionsProps {
    currentStep: number;
    canProceed: boolean;
    isValid: boolean;
    isLoading: boolean;
    mode: 'create' | 'edit';
    errors?: Record<string, any>; // NAPRAWKA: Opcjonalne errors
    onCancel: () => void;
    onPrevious: () => void;
    onNext: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({
                                                            currentStep,
                                                            canProceed,
                                                            isValid,
                                                            isLoading,
                                                            mode,
                                                            errors = {}, // NAPRAWKA: Domyślna wartość
                                                            onCancel,
                                                            onPrevious,
                                                            onNext
                                                        }) => {
    const isLastStep = currentStep === 3;
    const validationMessage = getStepValidationMessage(currentStep, errors);

    return (
        <ActionsContainer>
            <LeftSection>
                <SecondaryButton type="button" onClick={onCancel} disabled={isLoading}>
                    <FaTimes />
                    Anuluj
                </SecondaryButton>

                {validationMessage && !canProceed && (
                    <ValidationHint>
                        <FaInfoCircle />
                        <span>{validationMessage}</span>
                    </ValidationHint>
                )}
            </LeftSection>

            <RightSection>
                {currentStep > 1 && (
                    <SecondaryButton
                        type="button"
                        onClick={onPrevious}
                        disabled={isLoading}
                    >
                        <FaArrowLeft />
                        Wstecz
                    </SecondaryButton>
                )}

                {!isLastStep ? (
                    <PrimaryButton
                        type="button"
                        onClick={onNext}
                        disabled={!canProceed || isLoading}
                        title={!canProceed ? validationMessage || 'Wypełnij wymagane pola' : ''}
                    >
                        Dalej
                        <FaArrowRight />
                    </PrimaryButton>
                ) : (
                    <PrimaryButton
                        type="submit"
                        disabled={!isValid || isLoading}
                        title={!isValid ? 'Wypełnij wszystkie wymagane pola' : ''}
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner />
                                {mode === 'create' ? 'Tworzenie...' : 'Zapisywanie...'}
                            </>
                        ) : (
                            <>
                                <FaSave />
                                {mode === 'create' ? 'Utwórz wydarzenie' : 'Zapisz zmiany'}
                            </>
                        )}
                    </PrimaryButton>
                )}
            </RightSection>
        </ActionsContainer>
    );
};

// Styled Components - pozostają bez zmian
const ActionsContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.xl} ${theme.spacing.xxl};
    background: ${theme.surfaceElevated};
    border-top: 1px solid ${theme.border};
    min-height: 80px;
`;

const LeftSection = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
`;

const RightSection = styled.div`
    display: flex;
    gap: ${theme.spacing.md};
`;

const ValidationHint = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${theme.warning}10;
    border: 1px solid ${theme.warning}30;
    border-radius: ${theme.radius.md};
    font-size: 13px;
    color: ${theme.warning};
    font-weight: 500;
    max-width: 300px;

    svg {
        flex-shrink: 0;
        font-size: 14px;
    }
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