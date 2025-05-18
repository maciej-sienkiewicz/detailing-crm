// src/pages/SMS/components/modals/automation-steps/Step2TriggerSettings.tsx
import React from 'react';
import styled from 'styled-components';
import {
    FaArrowRight,
    FaArrowLeft,
    FaInfoCircle,
    FaCalendarAlt,
    FaCaretRight,
    FaBirthdayCake,
    FaClock,
    FaFileInvoiceDollar,
    FaCar,
    FaTachometerAlt,
    FaRobot
} from 'react-icons/fa';
import { Step2Props } from '../automation-types';
import { SmsAutomationTrigger, SmsAutomationTriggerLabels } from '../../../../../types/sms';
import { getTriggerDescription } from '../automation-common/AutomationUtils';

/**
 * Krok 2: Ustawienia wyzwalacza automatyzacji
 */
const Step2TriggerSettings: React.FC<Step2Props> = ({
                                                        automation,
                                                        onTriggerChange,
                                                        onTriggerParameterChange,
                                                        onCheckboxChange,
                                                        onPrevious,
                                                        onNext
                                                    }) => {
    // Renderowanie ikony wyzwalacza
    const renderTriggerIcon = (trigger: SmsAutomationTrigger) => {
        switch (trigger) {
            case SmsAutomationTrigger.BEFORE_APPOINTMENT:
            case SmsAutomationTrigger.AFTER_APPOINTMENT:
                return <FaCalendarAlt />;
            case SmsAutomationTrigger.STATUS_CHANGE:
                return <FaCaretRight />;
            case SmsAutomationTrigger.CLIENT_BIRTHDAY:
                return <FaBirthdayCake />;
            case SmsAutomationTrigger.NO_VISIT_PERIOD:
                return <FaClock />;
            case SmsAutomationTrigger.INVOICE_STATUS_CHANGE:
                return <FaFileInvoiceDollar />;
            case SmsAutomationTrigger.VEHICLE_ANNIVERSARY:
                return <FaCar />;
            case SmsAutomationTrigger.VEHICLE_MILEAGE:
                return <FaTachometerAlt />;
            default:
                return <FaRobot />;
        }
    };

    return (
        <StepContainer>
            <StepTitle>
                <StepNumber>1</StepNumber>
                <StepNumber active>2</StepNumber>
                Ustawienia wyzwalacza
            </StepTitle>

            <FormSection>
                <SectionTitle>Wybierz typ wyzwalacza</SectionTitle>
                <TriggersGrid>
                    {Object.values(SmsAutomationTrigger).map(trigger => (
                        <TriggerOption
                            key={trigger}
                            selected={automation.trigger === trigger}
                            onClick={() => onTriggerChange({
                                target: { name: 'trigger', value: trigger }
                            } as React.ChangeEvent<HTMLSelectElement>)}
                        >
                            <TriggerIcon>
                                {renderTriggerIcon(trigger)}
                            </TriggerIcon>
                            <TriggerLabel>
                                {SmsAutomationTriggerLabels[trigger]}
                            </TriggerLabel>
                        </TriggerOption>
                    ))}
                </TriggersGrid>
            </FormSection>

            <FormSection>
                <SectionTitle>Parametry wyzwalacza</SectionTitle>
                <TriggerDescription>
                    <FaInfoCircle style={{ marginRight: '8px' }} />
                    {getTriggerDescription(automation.trigger as SmsAutomationTrigger)}
                </TriggerDescription>

                <ParametersGroup>
                    {automation.trigger === SmsAutomationTrigger.BEFORE_APPOINTMENT && (
                        <FormGroup>
                            <FormLabel>Liczba dni przed wizytą</FormLabel>
                            <FormInput
                                type="number"
                                name="days"
                                value={automation.triggerParameters?.days || 1}
                                onChange={onTriggerParameterChange}
                                min="1"
                                max="30"
                            />
                            <FormHelp>
                                Wiadomość zostanie wysłana określoną liczbę dni przed zaplanowaną wizytą.
                            </FormHelp>
                        </FormGroup>
                    )}

                    {automation.trigger === SmsAutomationTrigger.AFTER_APPOINTMENT && (
                        <FormGroup>
                            <FormLabel>Liczba dni po wizycie</FormLabel>
                            <FormInput
                                type="number"
                                name="days"
                                value={automation.triggerParameters?.days || 1}
                                onChange={onTriggerParameterChange}
                                min="1"
                                max="30"
                            />
                            <FormHelp>
                                Wiadomość zostanie wysłana określoną liczbę dni po zakończonej wizycie.
                            </FormHelp>
                        </FormGroup>
                    )}

                    {automation.trigger === SmsAutomationTrigger.STATUS_CHANGE && (
                        <FormGroup>
                            <FormLabel>Status zlecenia</FormLabel>
                            <FormSelect
                                name="status"
                                value={automation.triggerParameters?.status || ''}
                                onChange={onTriggerParameterChange}
                            >
                                <option value="pending">Oczekujące</option>
                                <option value="in_progress">W realizacji</option>
                                <option value="completed">Zakończone</option>
                                <option value="cancelled">Anulowane</option>
                            </FormSelect>
                            <FormHelp>
                                Wiadomość zostanie wysłana gdy status zlecenia zmieni się na wybrany.
                            </FormHelp>
                        </FormGroup>
                    )}

                    {automation.trigger === SmsAutomationTrigger.CLIENT_BIRTHDAY && (
                        <>
                            <FormGroup>
                                <FormLabel>Godzina wysyłki</FormLabel>
                                <FormInput
                                    type="time"
                                    name="time"
                                    value={automation.triggerParameters?.time || '09:00'}
                                    onChange={onTriggerParameterChange}
                                />
                                <FormHelp>
                                    Godzina o której zostanie wysłana wiadomość urodzinowa.
                                </FormHelp>
                            </FormGroup>

                            <FormGroup>
                                <FormCheckboxWrapper>
                                    <FormCheckbox
                                        type="checkbox"
                                        id="withDiscount"
                                        name="triggerParameters.withDiscount"
                                        checked={automation.triggerParameters?.withDiscount || false}
                                        onChange={onCheckboxChange}
                                    />
                                    <FormCheckboxLabel htmlFor="withDiscount">
                                        Dodaj kod rabatowy do wiadomości
                                    </FormCheckboxLabel>
                                </FormCheckboxWrapper>
                            </FormGroup>

                            {automation.triggerParameters?.withDiscount && (
                                <>
                                    <FormGroup>
                                        <FormLabel>Kod rabatowy</FormLabel>
                                        <FormInput
                                            type="text"
                                            name="discountCode"
                                            value={automation.triggerParameters?.discountCode || ''}
                                            onChange={onTriggerParameterChange}
                                            placeholder="np. URODZINY2023"
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <FormLabel>Wartość rabatu (%)</FormLabel>
                                        <FormInput
                                            type="number"
                                            name="discountValue"
                                            value={automation.triggerParameters?.discountValue || 10}
                                            onChange={onTriggerParameterChange}
                                            min="1"
                                            max="100"
                                        />
                                    </FormGroup>
                                </>
                            )}
                        </>
                    )}

                    {automation.trigger === SmsAutomationTrigger.NO_VISIT_PERIOD && (
                        <FormGroup>
                            <FormLabel>Liczba miesięcy bez wizyty</FormLabel>
                            <FormInput
                                type="number"
                                name="months"
                                value={automation.triggerParameters?.months || 3}
                                onChange={onTriggerParameterChange}
                                min="1"
                                max="24"
                            />
                            <FormHelp>
                                Wiadomość zostanie wysłana, gdy klient nie odwiedzi warsztatu przez określoną liczbę miesięcy.
                            </FormHelp>
                        </FormGroup>
                    )}

                    {automation.trigger === SmsAutomationTrigger.INVOICE_STATUS_CHANGE && (
                        <FormGroup>
                            <FormLabel>Status faktury</FormLabel>
                            <FormSelect
                                name="status"
                                value={automation.triggerParameters?.status || ''}
                                onChange={onTriggerParameterChange}
                            >
                                <option value="issued">Wystawiona</option>
                                <option value="paid">Opłacona</option>
                                <option value="overdue">Przeterminowana</option>
                            </FormSelect>
                            <FormHelp>
                                Wiadomość zostanie wysłana gdy status faktury zmieni się na wybrany.
                            </FormHelp>
                        </FormGroup>
                    )}

                    {automation.trigger === SmsAutomationTrigger.VEHICLE_ANNIVERSARY && (
                        <FormGroup>
                            <FormLabel>Rocznica (lata)</FormLabel>
                            <FormInput
                                type="number"
                                name="years"
                                value={automation.triggerParameters?.years || 1}
                                onChange={onTriggerParameterChange}
                                min="1"
                                max="10"
                            />
                            <FormHelp>
                                Wiadomość zostanie wysłana w rocznicę pierwszej wizyty pojazdu w warsztacie.
                            </FormHelp>
                        </FormGroup>
                    )}

                    {automation.trigger === SmsAutomationTrigger.VEHICLE_MILEAGE && (
                        <FormGroup>
                            <FormLabel>Przebieg (km)</FormLabel>
                            <FormInput
                                type="number"
                                name="mileage"
                                value={automation.triggerParameters?.mileage || 10000}
                                onChange={onTriggerParameterChange}
                                min="1000"
                                step="1000"
                            />
                            <FormHelp>
                                Wiadomość zostanie wysłana, gdy przebieg pojazdu przekroczy określoną wartość.
                            </FormHelp>
                        </FormGroup>
                    )}
                </ParametersGroup>
            </FormSection>

            <StepActions>
                <SecondaryButton onClick={onPrevious}>
                    <FaArrowLeft /> Wstecz
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

const TriggersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
`;

const TriggerOption = styled.div<{ selected?: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background-color: ${({ selected }) => selected ? '#e3f2fd' : 'white'};
    border: 1px solid ${({ selected }) => selected ? '#90cdf4' : '#e9ecef'};
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background-color: ${({ selected }) => selected ? '#e3f2fd' : '#f0f9ff'};
        border-color: ${({ selected }) => selected ? '#90cdf4' : '#bee3f8'};
    }
`;

const TriggerIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background-color: #f0f9ff;
    border-radius: 12px;
    color: #3498db;
    font-size: 20px;
`;

const TriggerLabel = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
    text-align: center;
`;

const TriggerDescription = styled.div`
    display: flex;
    align-items: flex-start;
    padding: 12px 16px;
    background-color: #f0f9ff;
    border: 1px solid #bee3f8;
    border-radius: 5px;
    font-size: 14px;
    color: #2c5282;
    line-height: 1.5;
`;

const ParametersGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background-color: white;
    border-radius: 5px;
    border: 1px solid #e9ecef;
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

const FormHelp = styled.div`
    font-size: 12px;
    color: #6c757d;
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

export default Step2TriggerSettings;