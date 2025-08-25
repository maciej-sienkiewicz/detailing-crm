import React, {useState} from 'react';
import {FaArrowLeft, FaArrowRight, FaEdit, FaInfoCircle} from 'react-icons/fa';
import {
    FormSection,
    LoadingContainer,
    LoadingSpinner,
    PrimaryButton,
    SecondaryButton,
    SectionTitle,
    StepActions,
    StepContainer,
    StepNumber,
    StepTitle
} from '../campaign-common/styled/LayoutComponents';
import {
    FormCheckbox,
    FormCheckboxLabel,
    FormCheckboxWrapper,
    FormGroup,
    FormLabel,
    FormSelect,
    FormTextarea
} from '../campaign-common/styled/FormComponents';
// Styled components
import styled from 'styled-components';
import {SmsTemplate} from "../../../../../types/sms";

interface Step3ContentProps {
    campaign: any;
    useTemplate: boolean;
    setUseTemplate: (useTemplate: boolean) => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    templates: SmsTemplate[];
    isLoadingTemplates: boolean;
    recipientsCount: number;
    onPrevious: () => void;
    onNext: () => void;
}

/**
 * Trzeci krok kreatora kampanii SMS - treść wiadomości
 * Pozwala na wybór szablonu lub wprowadzenie własnej treści wiadomości
 */
const Step3Content: React.FC<Step3ContentProps> = ({
                                                       campaign,
                                                       useTemplate,
                                                       setUseTemplate,
                                                       onInputChange,
                                                       templates,
                                                       isLoadingTemplates,
                                                       recipientsCount,
                                                       onPrevious,
                                                       onNext
                                                   }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplate | null>(null);
    const [showPreview, setShowPreview] = useState(true);

    // Obliczanie liczby znaków w treści
    const countCharacters = (text: string) => {
        return text ? text.length : 0;
    };

    // Liczba SMS-ów potrzebnych do wysłania
    const getSmsCount = (text: string) => {
        const length = countCharacters(text);
        if (length <= 160) return 1;
        return Math.ceil(length / 153); // 153 znaki dla kolejnych części wiadomości wieloczęściowej
    };

    // Obsługa zmiany szablonu
    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
        onInputChange(e);

        if (templateId) {
            const template = templates.find(t => t.id === templateId);
            if (template) {
                setSelectedTemplate(template);

                // Update campaign content with template content
                const contentChangeEvent = {
                    target: {
                        name: 'customContent',
                        value: template.content
                    }
                } as React.ChangeEvent<HTMLTextAreaElement>;

                onInputChange(contentChangeEvent);
            }
        } else {
            setSelectedTemplate(null);
        }
    };

    // Obsługa zmiany opcji szablonu
    const handleUseTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUseTemplate(e.target.checked);
        if (!e.target.checked) {
            const templateChangeEvent = {
                target: {
                    name: 'templateId',
                    value: ''
                }
            } as React.ChangeEvent<HTMLSelectElement>;

            onInputChange(templateChangeEvent);
            setSelectedTemplate(null);
        }
    };

    const totalSmsCount = getSmsCount(campaign.customContent || '') * recipientsCount;

    return (
        <StepContainer>
            <StepTitle>
                <StepNumber>1</StepNumber>
                <StepNumber>2</StepNumber>
                <StepNumber active>3</StepNumber>
                Treść wiadomości
            </StepTitle>

            <FormSection>
                <SectionTitle>Treść wiadomości SMS</SectionTitle>

                <FormGroup>
                    <FormCheckboxWrapper>
                        <FormCheckbox
                            type="checkbox"
                            id="useTemplate"
                            checked={useTemplate}
                            onChange={handleUseTemplateChange}
                        />
                        <FormCheckboxLabel htmlFor="useTemplate">
                            Użyj szablonu wiadomości
                        </FormCheckboxLabel>
                    </FormCheckboxWrapper>
                </FormGroup>

                {useTemplate && (
                    <FormGroup>
                        <FormLabel>Wybierz szablon</FormLabel>
                        {isLoadingTemplates ? (
                            <LoadingContainer>
                                <LoadingSpinner />
                                <span>Ładowanie szablonów...</span>
                            </LoadingContainer>
                        ) : (
                            <FormSelect
                                name="templateId"
                                value={campaign.templateId || ''}
                                onChange={handleTemplateChange}
                            >
                                <option value="">Wybierz szablon...</option>
                                {templates.map(template => (
                                    <option key={template.id} value={template.id}>
                                        {template.name}
                                    </option>
                                ))}
                            </FormSelect>
                        )}

                        {(selectedTemplate && selectedTemplate.variables) && selectedTemplate.variables.length > 0 && (
                            <TemplateVariablesInfo>
                                <VariablesTitle>Dostępne zmienne w szablonie:</VariablesTitle>
                                <VariablesList>
                                    {selectedTemplate.variables.map(variable => (
                                        <VariableItem key={variable}>
                                            <VariableCode>{`{{${variable}}}`}</VariableCode>
                                        </VariableItem>
                                    ))}
                                </VariablesList>
                                <VariablesHelp>
                                    Zmienne zostaną automatycznie zastąpione danymi każdego odbiorcy podczas wysyłki.
                                </VariablesHelp>
                            </TemplateVariablesInfo>
                        )}
                    </FormGroup>
                )}

                <FormGroup>
                    <FormLabel>Treść wiadomości SMS</FormLabel>
                    <FormTextarea
                        name="customContent"
                        value={campaign.customContent || ''}
                        onChange={onInputChange}
                        placeholder="Wprowadź treść wiadomości..."
                        rows={5}
                        required
                    />

                    <CharacterCounter>
                        <div>
                            {countCharacters(campaign.customContent || '')} znaków
                        </div>
                        <div>
                            {getSmsCount(campaign.customContent || '')} {
                            getSmsCount(campaign.customContent || '') === 1
                                ? 'wiadomość SMS'
                                : getSmsCount(campaign.customContent || '') < 5
                                    ? 'wiadomości SMS'
                                    : 'wiadomości SMS'
                        } × {recipientsCount} odbiorców = {totalSmsCount} SMS
                        </div>
                    </CharacterCounter>
                </FormGroup>
            </FormSection>

            {showPreview && (
                <MessagePreviewBox>
                    <PreviewTitle>
                        <FaEdit style={{ marginRight: '8px' }} />
                        Podgląd wiadomości
                    </PreviewTitle>
                    <PreviewContent>
                        {campaign.customContent || 'Brak treści'}
                    </PreviewContent>
                </MessagePreviewBox>
            )}

            {totalSmsCount > 500 && (
                <WarningMessage>
                    <FaInfoCircle style={{ marginRight: '10px' }} />
                    Uwaga: Planujesz wysłać dużą liczbę wiadomości ({totalSmsCount} SMS). Upewnij się, że masz wystarczające saldo oraz sprawdź treść wiadomości, aby zoptymalizować jej długość.
                </WarningMessage>
            )}

            <StepActions>
                <SecondaryButton onClick={onPrevious}>
                    <FaArrowLeft /> Wstecz
                </SecondaryButton>
                <PrimaryButton onClick={onNext} disabled={!campaign.customContent}>
                    Dalej <FaArrowRight />
                </PrimaryButton>
            </StepActions>
        </StepContainer>
    );
};

const CharacterCounter = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #6c757d;
    margin-top: 8px;
`;

const TemplateVariablesInfo = styled.div`
    margin-top: 8px;
    padding: 10px 12px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 5px;
`;

const VariablesTitle = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: #495057;
    margin-bottom: 8px;
`;

const VariablesList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
`;

const VariableItem = styled.div`
    display: inline-block;
`;

const VariableCode = styled.code`
    padding: 2px 6px;
    background-color: #e9ecef;
    border-radius: 3px;
    font-family: monospace;
    font-size: 12px;
    color: #e74c3c;
`;

const VariablesHelp = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

const MessagePreviewBox = styled.div`
    margin-top: 20px;
    padding: 16px;
    background-color: #f0f9ff;
    border: 1px solid #bee3f8;
    border-radius: 8px;
`;

const PreviewTitle = styled.div`
    display: flex;
    align-items: center;
    font-weight: 500;
    color: #3498db;
    margin-bottom: 12px;
`;

const PreviewContent = styled.div`
    padding: 16px;
    background-color: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.5;
    min-height: 80px;
    white-space: pre-wrap;
`;

const WarningMessage = styled.div`
    display: flex;
    align-items: center;
    margin-top: 16px;
    padding: 12px 16px;
    background-color: #fff8e6;
    border: 1px solid #ffeeba;
    border-radius: 8px;
    color: #856404;
    font-size: 14px;
`;

export default Step3Content;