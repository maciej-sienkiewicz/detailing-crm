// src/components/recurringEvents/FormComponents/FormActions.tsx
/**
 * Form Actions Component
 * Navigation and submission buttons for the form
 */

import React from 'react';
import styled from 'styled-components';
import { FaSave, FaTimes } from 'react-icons/fa';
import { theme } from '../../../styles/theme';

interface FormActionsProps {
    currentStep: number;
    canProceed: boolean;
    isValid: boolean;
    isLoading: boolean;
    mode: 'create' | 'edit';
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
                                                            onCancel,
                                                            onPrevious,
                                                            onNext
                                                        }) => {
    const isLastStep = currentStep === 3;

    return (
        <ActionsContainer>
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
                        onClick={onPrevious}
                        disabled={isLoading}
                    >
                        Wstecz
                    </SecondaryButton>
                )}

                {!isLastStep ? (
                    <PrimaryButton
                        type="button"
                        onClick={onNext}
                        disabled={!canProceed || isLoading}
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
        </ActionsContainer>
    );
};

// Styled Components
const ActionsContainer = styled.div`
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