import React from 'react';
import styled from 'styled-components';
import {FaCheck} from 'react-icons/fa';

interface StepsIndicatorProps {
    currentStep: number;
}

/**
 * Komponent wskaźnika kroków kampanii SMS
 * Wizualizuje postęp w procesie tworzenia kampanii
 */
const StepsIndicator: React.FC<StepsIndicatorProps> = ({ currentStep }) => {
    // Definicja kroków
    const steps = [
        { id: 1, label: 'Podstawowe informacje' },
        { id: 2, label: 'Wybór odbiorców' },
        { id: 3, label: 'Treść' },
        { id: 4, label: 'Harmonogram' }
    ];

    return (
        <StepsContainer>
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <StepIndicator active={currentStep >= step.id} completed={currentStep > step.id}>
                        <StepIndicatorNumber>
                            {currentStep > step.id ? <FaCheck /> : step.id}
                        </StepIndicatorNumber>
                        <StepIndicatorLabel active={currentStep >= step.id}>
                            {step.label}
                        </StepIndicatorLabel>
                    </StepIndicator>

                    {/* Connector between steps (not after the last step) */}
                    {index < steps.length - 1 && (
                        <StepConnector completed={currentStep > step.id} />
                    )}
                </React.Fragment>
            ))}
        </StepsContainer>
    );
};

// Styled components
const StepsContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 24px;
    
    @media (max-width: 768px) {
        overflow-x: auto;
        justify-content: flex-start;
        padding-bottom: 8px;
        
        &::-webkit-scrollbar {
            height: 4px;
        }
        
        &::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        
        &::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 10px;
        }
    }
`;

const StepIndicator = styled.div<{ active: boolean; completed: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    min-width: 80px;
    
    @media (max-width: 576px) {
        min-width: 70px;
    }
`;

const StepIndicatorNumber = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: ${props => props.theme.active ? '#3498db' : '#e9ecef'};
    color: ${props => props.theme.active ? 'white' : '#6c757d'};
    font-size: 14px;
    margin-bottom: 8px;
    transition: all 0.3s ease;
    
    ${props => props.theme.completed && `
        background-color: #2ecc71;
    `}
`;

const StepIndicatorLabel = styled.span<{ active: boolean }>`
    font-size: 12px;
    text-align: center;
    color: ${props => props.active ? '#2c3e50' : '#6c757d'};
    transition: color 0.3s ease;
    white-space: nowrap;
    
    @media (max-width: 576px) {
        font-size: 11px;
    }
`;

const StepConnector = styled.div<{ completed: boolean }>`
    flex: 1;
    height: 2px;
    background-color: ${props => props.completed ? '#2ecc71' : '#e9ecef'};
    margin: 0 4px;
    margin-bottom: 24px;
    transition: background-color 0.3s ease;
    min-width: 40px;
    
    @media (max-width: 768px) {
        min-width: 20px;
    }
`;

export default StepsIndicator;