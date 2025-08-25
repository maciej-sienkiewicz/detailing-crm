import React from 'react';
import {FaArrowLeft, FaCalendarAlt, FaClock, FaEnvelope, FaInfoCircle, FaPlay, FaSave, FaUsers} from 'react-icons/fa';
import {
    FormSection,
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
    FormHelp,
    FormInput,
    FormLabel
} from '../campaign-common/styled/FormComponents';
// Styled components
import styled from 'styled-components';

interface Step4SummaryProps {
    campaign: any;
    scheduleNow: boolean;
    setScheduleNow: (scheduleNow: boolean) => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    selectedRecipients: string[];
    onPrevious: () => void;
    onSave: () => void;
    isLoading: boolean;
}

/**
 * Czwarty krok kreatora kampanii SMS - harmonogram i podsumowanie
 * Pozwala na wybór terminu wysyłki oraz wyświetla podsumowanie kampanii
 */
const Step4Summary: React.FC<Step4SummaryProps> = ({
                                                       campaign,
                                                       scheduleNow,
                                                       setScheduleNow,
                                                       onInputChange,
                                                       selectedRecipients,
                                                       onPrevious,
                                                       onSave,
                                                       isLoading
                                                   }) => {
    // Obsługa zmiany opcji harmonogramu
    const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const scheduleForLater = e.target.checked;
        setScheduleNow(!scheduleForLater);

        // Jeśli zaplanowano na później, ustaw domyślną datę (jutro)
        if (scheduleForLater && !campaign.scheduledDate) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);

            const dateString = tomorrow.toISOString().slice(0, 16);

            const event = {
                target: {
                    name: 'scheduledDate',
                    value: dateString
                }
            } as React.ChangeEvent<HTMLInputElement>;

            onInputChange(event);
        }
    };

    // Liczenie znaków w treści
    const countCharacters = (text: string) => {
        return text ? text.length : 0;
    };

    // Liczba SMS-ów potrzebnych do wysłania
    const getSmsCount = (text: string) => {
        const length = countCharacters(text);
        if (length <= 160) return 1;
        return Math.ceil(length / 153);
    };

    // Formatowanie daty
    const formatDate = (dateString: string): string => {
        if (!dateString) return '-';

        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const totalSmsCount = getSmsCount(campaign.customContent || '') * selectedRecipients.length;

    return (
        <StepContainer>
            <StepTitle>
                <StepNumber>1</StepNumber>
                <StepNumber>2</StepNumber>
                <StepNumber>3</StepNumber>
                <StepNumber active>4</StepNumber>
                Harmonogram i podsumowanie
            </StepTitle>

            <FormSection>
                <SectionTitle>Harmonogram wysyłki</SectionTitle>

                <FormGroup>
                    <FormCheckboxWrapper>
                        <FormCheckbox
                            type="checkbox"
                            id="scheduleForLater"
                            checked={!scheduleNow}
                            onChange={handleScheduleChange}
                        />
                        <FormCheckboxLabel htmlFor="scheduleForLater">
                            Zaplanuj wysyłkę na później
                        </FormCheckboxLabel>
                    </FormCheckboxWrapper>
                </FormGroup>

                {!scheduleNow && (
                    <FormGroup>
                        <FormLabel>
                            <FaCalendarAlt style={{ marginRight: '8px' }} />
                            Data i godzina wysyłki
                        </FormLabel>
                        <FormInput
                            type="datetime-local"
                            name="scheduledDate"
                            value={campaign.scheduledDate || ''}
                            onChange={onInputChange}
                            min={new Date().toISOString().slice(0, 16)}
                            required
                        />
                        <FormHelp>
                            Wiadomości zostaną wysłane automatycznie o wybranej porze.
                        </FormHelp>
                    </FormGroup>
                )}
            </FormSection>

            <FormSection>
                <SectionTitle>Podsumowanie kampanii</SectionTitle>

                <SummaryGrid>
                    <SummaryItem>
                        <SummaryLabel>Nazwa kampanii</SummaryLabel>
                        <SummaryValue>{campaign.name}</SummaryValue>
                    </SummaryItem>

                    <SummaryItem>
                        <SummaryLabel>Liczba odbiorców</SummaryLabel>
                        <SummaryValue>
                            <FaUsers style={{ marginRight: '5px' }} />
                            {selectedRecipients.length}
                        </SummaryValue>
                    </SummaryItem>

                    <SummaryItem>
                        <SummaryLabel>Liczba wiadomości</SummaryLabel>
                        <SummaryValue>
                            <FaEnvelope style={{ marginRight: '5px' }} />
                            {totalSmsCount} SMS
                        </SummaryValue>
                    </SummaryItem>

                    <SummaryItem>
                        <SummaryLabel>Harmonogram</SummaryLabel>
                        <SummaryValue>
                            <FaClock style={{ marginRight: '5px' }} />
                            {scheduleNow
                                ? 'Natychmiastowa wysyłka'
                                : campaign.scheduledDate
                                    ? formatDate(campaign.scheduledDate)
                                    : 'Nie wybrano daty'
                            }
                        </SummaryValue>
                    </SummaryItem>

                    {campaign.description && (
                        <SummaryItem fullWidth>
                            <SummaryLabel>Opis</SummaryLabel>
                            <SummaryValue>{campaign.description}</SummaryValue>
                        </SummaryItem>
                    )}

                    <SummaryItem fullWidth>
                        <SummaryLabel>Treść wiadomości</SummaryLabel>
                        <SummaryContentBox>
                            {campaign.customContent}
                        </SummaryContentBox>
                    </SummaryItem>
                </SummaryGrid>

                <CostEstimation>
                    <CostTitle>Szacunkowy koszt kampanii</CostTitle>
                    <CostValue>
                        {totalSmsCount} SMS × 0,11 zł = {(totalSmsCount * 0.11).toFixed(2)} zł
                    </CostValue>
                </CostEstimation>
            </FormSection>

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
                <PrimaryButton
                    onClick={onSave}
                    disabled={isLoading || (!scheduleNow && !campaign.scheduledDate)}
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner style={{ width: '14px', height: '14px', marginRight: '8px' }} />
                            {scheduleNow ? 'Uruchamianie...' : 'Zapisywanie...'}
                        </>
                    ) : (
                        <>
                            {scheduleNow ? <FaPlay style={{ marginRight: '5px' }} /> : <FaSave style={{ marginRight: '5px' }} />}
                            {scheduleNow ? 'Uruchom kampanię' : 'Zaplanuj kampanię'}
                        </>
                    )}
                </PrimaryButton>
            </StepActions>
        </StepContainer>
    );
};

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
`;

interface SummaryItemProps {
    fullWidth?: boolean;
}

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
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #2c3e50;
    font-weight: 500;
`;

const SummaryContentBox = styled.div`
    padding: 12px;
    background-color: white;
    border: 1px solid #e9ecef;
    border-radius: 5px;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
`;

const CostEstimation = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #f0f9ff;
    border: 1px solid #bee3f8;
    border-radius: 5px;
`;

const CostTitle = styled.div`
    font-weight: 500;
    color: #3498db;
`;

const CostValue = styled.div`
    font-weight: 600;
    color: #2c3e50;
`;

const WarningMessage = styled.div`
    display: flex;
    align-items: center;
    margin-top: 16px;
    padding: 12px 16px;
    background-color: #fff8e6;
    border: 1px solid #ffeeba;
    border-radius: 5px;
    color: #856404;
    font-size: 14px;
`;

export default Step4Summary;