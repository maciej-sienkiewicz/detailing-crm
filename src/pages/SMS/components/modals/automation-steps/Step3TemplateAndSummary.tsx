// src/pages/SMS/components/modals/automation-steps/Step3TemplateAndSummary.tsx
import React from 'react';
import styled from 'styled-components';
import {FaArrowLeft, FaSave, FaTimes, FaToggleOn} from 'react-icons/fa';
import {StatusValueProps, Step3Props, SummaryItemProps} from '../automation-types';
import {SmsAutomationTriggerLabels} from '../../../../../types/sms';

/**
 * Krok 3: Wybór szablonu i podsumowanie automatyzacji
 */
const Step3TemplateAndSummary: React.FC<Step3Props> = ({
                                                           automation,
                                                           templates,
                                                           selectedTemplate,
                                                           isLoadingTemplates,
                                                           onInputChange,
                                                           onPrevious,
                                                           onSave,
                                                           isLoading
                                                       }) => {
    return (
        <StepContainer>
            <StepTitle>
                <StepNumber>1</StepNumber>
                <StepNumber>2</StepNumber>
                <StepNumber active>3</StepNumber>
                Wiadomość i podsumowanie
            </StepTitle>

            <FormSection>
                <SectionTitle>Szablon wiadomości</SectionTitle>

                <FormGroup>
                    <FormLabel>Wybierz szablon*</FormLabel>
                    {isLoadingTemplates ? (
                        <LoadingContainer>
                            <LoadingSpinner />
                            <span>Ładowanie szablonów...</span>
                        </LoadingContainer>
                    ) : (
                        <FormSelect
                            name="templateId"
                            value={automation.templateId || ''}
                            onChange={onInputChange}
                            required
                        >
                            <option value="">Wybierz szablon...</option>
                            {templates.map(template => (
                                <option key={template.id} value={template.id}>
                                    {template.name}
                                </option>
                            ))}
                        </FormSelect>
                    )}
                </FormGroup>

                {selectedTemplate && (
                    <TemplatePreview>
                        <PreviewTitle>Podgląd szablonu</PreviewTitle>
                        <PreviewContent>
                            {selectedTemplate.content}
                        </PreviewContent>

                        {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                            <VariablesInfo>
                                <VariablesTitle>Zmienne w szablonie:</VariablesTitle>
                                <VariablesList>
                                    {selectedTemplate.variables.map(variable => (
                                        <VariableTag key={variable}>{`{{${variable}}}`}</VariableTag>
                                    ))}
                                </VariablesList>
                            </VariablesInfo>
                        )}
                    </TemplatePreview>
                )}
            </FormSection>

            <FormSection>
                <SectionTitle>Podsumowanie automatyzacji</SectionTitle>

                <SummaryGrid>
                    <SummaryItem>
                        <SummaryLabel>Nazwa</SummaryLabel>
                        <SummaryValue>{automation.name}</SummaryValue>
                    </SummaryItem>

                    <SummaryItem>
                        <SummaryLabel>Wyzwalacz</SummaryLabel>
                        <SummaryValue>
                            {automation.trigger && SmsAutomationTriggerLabels[automation.trigger]}
                        </SummaryValue>
                    </SummaryItem>

                    <SummaryItem>
                        <SummaryLabel>Status</SummaryLabel>
                        <StatusValue active={automation.isActive === true}>
                            {automation.isActive ? (
                                <>
                                    <FaToggleOn style={{ marginRight: '5px' }} />
                                    Aktywna
                                </>
                            ) : (
                                <>
                                    <FaTimes style={{ marginRight: '5px' }} />
                                    Nieaktywna
                                </>
                            )}
                        </StatusValue>
                    </SummaryItem>

                    <SummaryItem fullWidth>
                        <SummaryLabel>Szablon wiadomości</SummaryLabel>
                        <SummaryValue>
                            {selectedTemplate ? selectedTemplate.name : 'Nie wybrano szablonu'}
                        </SummaryValue>
                    </SummaryItem>

                    {automation.description && (
                        <SummaryItem fullWidth>
                            <SummaryLabel>Opis</SummaryLabel>
                            <SummaryValue>{automation.description}</SummaryValue>
                        </SummaryItem>
                    )}
                </SummaryGrid>
            </FormSection>

            <StepActions>
                <SecondaryButton onClick={onPrevious}>
                    <FaArrowLeft /> Wstecz
                </SecondaryButton>
                <PrimaryButton
                    onClick={onSave}
                    disabled={isLoading || !automation.templateId}
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner />
                            Zapisywanie...
                        </>
                    ) : (
                        <>
                            <FaSave /> Utwórz automatyzację
                        </>
                    )}
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

const FormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
`;

const SectionTitle = styled.h4`
    font-size: 15px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 8px 0;
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

const FormSelect = styled.select`
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 14px;
    background-color: white;
    transition: border-color 0.2s;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const TemplatePreview = styled.div`
    padding: 16px;
    background-color: #f0f9ff;
    border: 1px solid #bee3f8;
    border-radius: 5px;
    margin-top: 12px;
`;

const PreviewTitle = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #3498db;
    margin-bottom: 12px;
`;

const PreviewContent = styled.div`
    padding: 12px;
    background-color: white;
    border: 1px solid #e9ecef;
    border-radius: 5px;
    font-size: 14px;
    color: #2c3e50;
    white-space: pre-wrap;
    line-height: 1.5;
`;

const VariablesInfo = styled.div`
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed #bee3f8;
`;

const VariablesTitle = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: #4a5568;
    margin-bottom: 8px;
`;

const VariablesList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const VariableTag = styled.div`
    display: inline-block;
    padding: 2px 6px;
    background-color: #edf2f7;
    border-radius: 3px;
    font-size: 12px;
    font-family: monospace;
    color: #e74c3c;
`;

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
`;

const SummaryItem = styled.div<SummaryItemProps>`
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    ${({ fullWidth }) => fullWidth && `
        grid-column: 1 / -1;
    `}
`;

const SummaryLabel = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

const SummaryValue = styled.div`
    font-size: 14px;
    color: #2c3e50;
    font-weight: 500;
`;

const StatusValue = styled.div<StatusValueProps>`
    display: flex;
    align-items: center;
    color: ${({ active }) => active ? '#2ecc71' : '#6c757d'};
`;

const LoadingContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    color: #6c757d;
`;

const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
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

export default Step3TemplateAndSummary;