// src/pages/SMS/components/modals/automation-common/StepsIndicator.tsx
import React from 'react';
import styled from 'styled-components';
import { FaCheck } from 'react-icons/fa';

interface StepsIndicatorProps {
    currentStep: number;
}

/**
 * Wskaźnik kroków dla procesu tworzenia automatyzacji
 */
const StepsIndicator: React.FC<StepsIndicatorProps> = ({ currentStep }) => {
    return (
        <StepsIndicatorContainer>
            <StepIndicator active={currentStep >= 1} completed={currentStep > 1}>
                <StepIndicatorNumber>{currentStep > 1 ? <FaCheck /> : 1}</StepIndicatorNumber>
                <StepIndicatorLabel>Podstawowe informacje</StepIndicatorLabel>
            </StepIndicator>

            <StepConnector completed={currentStep > 1} />

            <StepIndicator active={currentStep >= 2} completed={currentStep > 2}>
                <StepIndicatorNumber>{currentStep > 2 ? <FaCheck /> : 2}</StepIndicatorNumber>
                <StepIndicatorLabel>Wyzwalacz</StepIndicatorLabel>
            </StepIndicator>

            <StepConnector completed={currentStep > 2} />

            <StepIndicator active={currentStep >= 3}>
                <StepIndicatorNumber>3</StepIndicatorNumber>
                <StepIndicatorLabel>Szablon i podsumowanie</StepIndicatorLabel>
            </StepIndicator>
        </StepsIndicatorContainer>
    );
};

const StepsIndicatorContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 0 16px;
    margin-bottom: 24px;
`;

const StepIndicator = styled.div<{ active?: boolean; completed?: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    position: relative;
    
    ${({ active }) => active && `
        font-weight: 600;
    `}
`;

const StepIndicatorNumber = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: #e9ecef;
    border-radius: 50%;
    font-size: 14px;
    color: #6c757d;
`;

const StepIndicatorLabel = styled.div`
    font-size: 12px;
    color: #6c757d;
    white-space: nowrap;
`;

const StepConnector = styled.div<{ completed?: boolean }>`
    flex: 1;
    height: 2px;
    background-color: #e9ecef;
    margin: 0 4px;
    
    ${({ completed }) => completed && `
        background-color: #3498db;
    `}
`;

export default StepsIndicator;