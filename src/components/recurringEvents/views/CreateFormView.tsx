// src/components/recurringEvents/views/CreateFormView.tsx
/**
 * Create Form View Component
 * Multi-step creation view for new recurring events
 */

import React from 'react';
import styled from 'styled-components';
import { UseFormReturn } from 'react-hook-form';
import { FaSave, FaTimes, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { EventType } from '../../../types/recurringEvents';
import { FormData } from '../schema';
import { FormHeader } from '../FormComponents/FormHeader';
import { StepsProgress } from '../FormComponents/StepsProgress';
import { BasicInfoStep } from '../FormSteps/BasicInfoStep';
import { RecurrencePatternStep } from '../FormSteps/RecurrencePatternStep';
import { VisitTemplateStep } from '../FormSteps/VisitTemplateStep';
import { FormValidationDebugger } from '../FormValidationDebugger';
import { theme } from '../../../styles/theme';

interface CreateFormViewProps {
    form: UseFormReturn<FormData>;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    watchedType: EventType | undefined;
    canProceedToStep: (step: number) => boolean;
    isFormValidForSubmit: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isLoading: boolean;
}

export const CreateFormView: React.FC<CreateFormViewProps> = ({
                                                                  form,
                                                                  currentStep,
                                                                  setCurrentStep,
                                                                  watchedType,
                                                                  canProceedToStep,
                                                                  isFormValidForSubmit,
                                                                  onSubmit,
                                                                  onCancel,
                                                                  isLoading
                                                              }) => {
    return (
        <FormContainer>
            <FormHeader
                mode="create"
                title="Nowe cykliczne wydarzenie"
                subtitle="Utwórz nowe wydarzenie, które będzie się automatycznie powtarzać"
            />

            <StepsProgress
                currentStep={currentStep}
                canProceedToStep={canProceedToStep}
                onStepClick={setCurrentStep}
                errors={form.formState.errors}
            />

            <form onSubmit={onSubmit}>
                <FormContent>
                    {currentStep === 1 && (
                        <BasicInfoStep
                            form={form as any}
                            isLoading={isLoading}
                        />
                    )}

                    {currentStep === 2 && (
                        <RecurrencePatternStep
                            form={form as any}
                            isLoading={isLoading}
                        />
                    )}

                    {currentStep === 3 && (
                        <VisitTemplateStep
                            form={form as any}
                            isLoading={isLoading}
                            eventType={watchedType || EventType.SIMPLE_EVENT}
                        />
                    )}
                </FormContent>

                <FormActions>
                    <LeftSection>
                        <SecondaryButton type="button" onClick={onCancel} disabled={isLoading}>
                            <FaTimes />
                            Anuluj
                        </SecondaryButton>
                    </LeftSection>

                    <RightSection>
                        {currentStep > 1 && (
                            <SecondaryButton
                                type="button"
                                onClick={() => {
                                    console.log(`🔙 Moving back to step ${currentStep - 1}`);
                                    setCurrentStep(currentStep - 1);
                                }}
                                disabled={isLoading}
                            >
                                <FaArrowLeft />
                                Wstecz
                            </SecondaryButton>
                        )}

                        {currentStep < 3 ? (
                            <PrimaryButton
                                type="button"
                                onClick={() => {
                                    console.log(`🚀 Moving to step ${currentStep + 1}`);
                                    setCurrentStep(currentStep + 1);
                                }}
                                disabled={!canProceedToStep(currentStep) || isLoading}
                                title={!canProceedToStep(currentStep) ? 'Wypełnij wymagane pola' : ''}
                            >
                                Dalej
                                <FaArrowRight />
                            </PrimaryButton>
                        ) : (
                            <PrimaryButton
                                type="submit"
                                disabled={!isFormValidForSubmit || isLoading}
                                title={!isFormValidForSubmit ? 'Wypełnij wszystkie wymagane pola' : ''}
                                onClick={() => console.log('🚀 Submit button clicked - Form valid:', isFormValidForSubmit)}
                            >
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner />
                                        Tworzenie...
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        Utwórz wydarzenie
                                    </>
                                )}
                            </PrimaryButton>
                        )}
                    </RightSection>
                </FormActions>
            </form>

            {/* Debug component */}
            <FormValidationDebugger form={form} currentStep={currentStep} />
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

const FormContent = styled.div`
    padding: ${theme.spacing.xxl};
    min-height: 500px;

    @media (max-width: 768px) {
        padding: ${theme.spacing.xl};
    }
`;

const FormActions = styled.div`
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