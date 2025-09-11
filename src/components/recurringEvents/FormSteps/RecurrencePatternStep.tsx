// src/components/recurringEvents/FormSteps/RecurrencePatternStep.tsx
/**
 * Recurrence Pattern Step Component
 * Second step of the form - configuring recurrence pattern
 */

import React from 'react';
import styled from 'styled-components';
import { Controller, UseFormReturn } from 'react-hook-form';
import RecurrencePatternBuilder from '../RecurrencePatternBuilder';
import { FormData } from '../schema';
import { ErrorMessage } from '../FormComponents/FormElements';
import { theme } from '../../../styles/theme';

interface RecurrencePatternStepProps {
    form: UseFormReturn<FormData>;
    isLoading: boolean;
}

export const RecurrencePatternStep: React.FC<RecurrencePatternStepProps> = ({
                                                                                form,
                                                                                isLoading
                                                                            }) => {
    const { control, formState: { errors } } = form;

    return (
        <StepContent>
            <StepTitle>Wzorzec powtarzania</StepTitle>

            <FormSection>
                <Controller
                    name="recurrencePattern"
                    control={control}
                    render={({ field }) => (
                        <RecurrencePatternBuilder
                            value={field.value as any} // Cast to proper type expected by builder
                            onChange={field.onChange}
                            disabled={isLoading}
                            showPreview={true}
                            maxPreviewItems={8}
                        />
                    )}
                />
                {errors.recurrencePattern && (
                    <ErrorMessage>
                        {errors.recurrencePattern.message || 'Wzorzec powtarzania zawiera błędy'}
                    </ErrorMessage>
                )}
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