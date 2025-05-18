// src/pages/SMS/components/modals/automation-steps/Step1BasicInfo.tsx
import React from 'react';
import styled from 'styled-components';
import { FaArrowRight, FaTimes } from 'react-icons/fa';
import { Step1Props } from '../automation-types';

/**
 * Krok 1: Podstawowe informacje automatyzacji
 */
const Step1BasicInfo: React.FC<Step1Props> = ({
                                                  automation,
                                                  onInputChange,
                                                  onCheckboxChange,
                                                  onNext,
                                                  onCancel
                                              }) => {
    return (
        <StepContainer>
            <StepTitle>
                <StepNumber active>1</StepNumber>
                Podstawowe informacje
            </StepTitle>

            <FormGroup>
                <FormLabel>Nazwa automatyzacji*</FormLabel>
                <FormInput
                    type="text"
                    name="name"
                    value={automation.name || ''}
                    onChange={onInputChange}
                    placeholder="np. Przypomnienie o wizycie"
                    required
                />
            </FormGroup>

            <FormGroup>
                <FormLabel>Opis automatyzacji</FormLabel>
                <FormTextarea
                    name="description"
                    value={automation.description || ''}
                    onChange={onInputChange}
                    placeholder="Dodaj opis automatyzacji..."
                    rows={3}
                />
            </FormGroup>

            <FormGroup>
                <FormCheckboxWrapper>
                    <FormCheckbox
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={automation.isActive === true}
                        onChange={onCheckboxChange}
                    />
                    <FormCheckboxLabel htmlFor="isActive">
                        Automatyzacja aktywna
                    </FormCheckboxLabel>
                </FormCheckboxWrapper>
                <FormHelp>
                    Nieaktywne automatyzacje nie będą wysyłać wiadomości.
                </FormHelp>
            </FormGroup>

            <StepActions>
                <SecondaryButton onClick={onCancel}>
                    <FaTimes /> Anuluj
                </SecondaryButton>
                <PrimaryButton onClick={onNext}>
                    Dalej <FaArrowRight />
                </PrimaryButton>
            </StepActions>
        </StepContainer>
    );
};

// Styled components
const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const StepTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
`;

const StepNumber = styled.div<{ active?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background-color: ${({ active }) => active ? '#3498db' : '#e9ecef'};
    color: ${({ active }) => active ? 'white' : '#6c757d'};
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const FormLabel = styled.label`
    font-size: 14px;
    font-weight: 500;
    color: #495057;
`;

const FormInput = styled.input`
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 14px;
    transition: border-color 0.2s;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const FormTextarea = styled.textarea`
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 14px;
    transition: border-color 0.2s;
    resize: vertical;
    min-height: 100px;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const FormCheckboxWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const FormCheckbox = styled.input`
    width: 16px;
    height: 16px;
    cursor: pointer;
`;

const FormCheckboxLabel = styled.label`
    font-size: 14px;
    color: #495057;
    cursor: pointer;
`;

const FormHelp = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

const StepActions = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 5px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const PrimaryButton = styled(Button)`
    background-color: #3498db;
    border-color: #3498db;
    color: white;

    &:hover:not(:disabled) {
        background-color: #2980b9;
        border-color: #2980b9;
    }
`;

const SecondaryButton = styled(Button)`
    background-color: #f8f9fa;
    border-color: #dee2e6;
    color: #6c757d;

    &:hover:not(:disabled) {
        background-color: #e9ecef;
    }
`;

export default Step1BasicInfo;