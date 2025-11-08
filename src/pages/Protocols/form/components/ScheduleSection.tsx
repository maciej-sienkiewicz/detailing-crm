import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {CarReceptionProtocol} from '../../../../types';
import {FormErrors} from '../hooks/useFormValidation';
import {
    brandTheme,
    ErrorText,
    Input,
    SectionTitle
} from '../styles';
import {useToast} from "../../../../components/common/Toast/Toast";

interface ScheduleSectionProps {
    formData: Partial<CarReceptionProtocol>;
    errors: FormErrors;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isFullProtocol?: boolean;
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({
                                                             formData,
                                                             errors,
                                                             onChange,
                                                             isFullProtocol = true
                                                         }) => {
    const { showToast } = useToast();
    const [dateError, setDateError] = useState<string | null>(null);
    const [isAllDay, setIsAllDay] = useState(false);

    const handleAllDayToggle = () => {
        const newIsAllDay = !isAllDay;
        setIsAllDay(newIsAllDay);

        if (newIsAllDay) {
            const currentDate = formData.startDate ? formData.startDate.split('T')[0] : new Date().toISOString().split('T')[0];
            const startDateTime = `${currentDate}T00:00:00`;
            const endDateTime = `${currentDate}T23:59:59`;

            const startEvent = {
                target: { name: 'startDate', value: startDateTime, type: 'text' }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(startEvent);

            const endEvent = {
                target: { name: 'endDate', value: endDateTime, type: 'text' }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(endEvent);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'endDate') {
            if (value) {
                const newDateTime = `${value}T23:59:59`;
                const syntheticEvent = {
                    target: { name: 'endDate', value: newDateTime, type: 'text' }
                } as React.ChangeEvent<HTMLInputElement>;

                if (formData.startDate) {
                    const startDateObj = new Date(formData.startDate.replace(' ', 'T'));
                    const endDateObj = new Date(newDateTime);

                    if (endDateObj < startDateObj) {
                        setDateError('Data zakończenia nie może być wcześniejsza niż data rozpoczęcia');
                        showToast('error', 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia', 3000);
                    } else {
                        setDateError(null);
                    }
                }
                onChange(syntheticEvent);
            } else {
                const syntheticEvent = {
                    target: { name: 'endDate', value: '', type: 'text' }
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(syntheticEvent);
                setDateError(null);
            }
        } else if (name === 'startDate') {
            if (value) {
                const newDateTime = value.includes('T') ? value : `${value}T08:00:00`;
                const syntheticEvent = {
                    target: { name: 'startDate', value: newDateTime, type: 'text' }
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(syntheticEvent);
            } else {
                onChange(e);
            }
        } else {
            onChange(e);
        }
    };

    useEffect(() => {
        const isStartVisitContext = window.location.pathname.includes('/open');

        if (isFullProtocol && !formData.startDate && !isStartVisitContext) {
            const now = new Date();
            const currentDate = now.toISOString().split('T')[0];
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const currentTime = `${hours}:${minutes}`;
            const fullDateTime = `${currentDate}T${currentTime}:00`;

            const syntheticEvent = {
                target: { name: 'startDate', value: fullDateTime, type: 'text' }
            } as React.ChangeEvent<HTMLInputElement>;

            onChange(syntheticEvent);
        }
    }, [isFullProtocol, formData.startDate, onChange]);

    const extractDateFromISO = (dateString: string): string => {
        if (!dateString) return '';

        try {
            let cleanedDate = dateString.replace('Z', '').split('.')[0];

            if (cleanedDate.includes('T')) {
                return cleanedDate.split('T')[0];
            }

            if (cleanedDate.includes(' ')) {
                return cleanedDate.split(' ')[0];
            }

            if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedDate)) {
                return cleanedDate;
            }

            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }

            return '';
        } catch (e) {
            return '';
        }
    };

    const extractTimeFromISO = (dateString: string, defaultTime = '08:00'): string => {
        if (!dateString) return defaultTime;

        try {
            let cleanedDate = dateString.replace('Z', '').split('.')[0];

            if (cleanedDate.includes('T')) {
                const timePart = cleanedDate.split('T')[1];
                if (timePart) {
                    return timePart.substring(0, 5);
                }
            }

            if (cleanedDate.includes(' ')) {
                const timePart = cleanedDate.split(' ')[1];
                if (timePart) {
                    return timePart.substring(0, 5);
                }
            }
            return defaultTime;
        } catch (e) {
            return defaultTime;
        }
    };

    return (
        <FormSection>
            <SectionTitle>Harmonogram wizyty</SectionTitle>

            {/* KLUCZOWA ZMIANA: Użyj Grid Layout z FIXED kolumnami */}
            <ScheduleGrid $isAllDay={isAllDay}>
                {/* Kolumna 1: Data i godzina rozpoczęcia */}
                <StartDateColumn>
                    <LabelRow>
                        <CompactLabel htmlFor="startDate">
                            Data i godzina rozpoczęcia
                            <RequiredBadge>Wymagane</RequiredBadge>
                        </CompactLabel>
                        <AllDayToggleContainer>
                            <AllDayLabel>Cały dzień</AllDayLabel>
                            <ToggleSwitch $isActive={isAllDay} onClick={handleAllDayToggle} type="button">
                                <ToggleSlider $isActive={isAllDay} />
                            </ToggleSwitch>
                        </AllDayToggleContainer>
                    </LabelRow>

                    <InputRow>
                        <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={extractDateFromISO(formData.startDate || '')}
                            onChange={handleDateChange}
                            required
                            $hasError={!!errors.startDate}
                        />
                        {!isAllDay && (
                            <Input
                                id="startTime"
                                name="startTime"
                                type="time"
                                value={extractTimeFromISO(formData.startDate || '', '08:00')}
                                onChange={(e) => {
                                    const date = extractDateFromISO(formData.startDate || new Date().toISOString());
                                    const newDateTime = `${date}T${e.target.value}:00`;
                                    const syntheticEvent = {
                                        target: { name: 'startDate', value: newDateTime, type: 'text' }
                                    } as React.ChangeEvent<HTMLInputElement>;
                                    onChange(syntheticEvent);
                                }}
                                required
                            />
                        )}
                    </InputRow>

                    {errors.startDate && <ErrorText>{errors.startDate}</ErrorText>}
                </StartDateColumn>

                {/* Kolumna 2: Data zakończenia (tylko gdy nie "cały dzień") */}
                {!isAllDay && (
                    <EndDateColumn>
                        <LabelRow>
                            <CompactLabel htmlFor="endDate">
                                Data zakończenia
                                <RequiredBadge>Wymagane</RequiredBadge>
                            </CompactLabel>
                        </LabelRow>

                        <InputRow>
                            <Input
                                id="endDate"
                                name="endDate"
                                type="date"
                                value={extractDateFromISO(formData.endDate || '')}
                                onChange={handleDateChange}
                                required
                                $hasError={!!(errors.endDate || dateError)}
                            />
                        </InputRow>

                        {errors.endDate && <ErrorText>{errors.endDate}</ErrorText>}
                        {dateError && <ErrorText>{dateError}</ErrorText>}
                    </EndDateColumn>
                )}
            </ScheduleGrid>
        </FormSection>
    );
};

// ==================== STYLED COMPONENTS ====================

const FormSection = styled.section`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

// KLUCZOWA ZMIANA: Grid z FIXED kolumnami zamiast auto-fit
const ScheduleGrid = styled.div<{ $isAllDay: boolean }>`
    display: grid;
    grid-template-columns: ${props => props.$isAllDay ? '1fr' : '1fr 1fr'};
    gap: ${brandTheme.spacing.md};
    align-items: start;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const StartDateColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
    min-width: 0;
`;

const EndDateColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
    min-width: 0;
`;

const LabelRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${brandTheme.spacing.sm};
    min-height: 28px;
    margin-bottom: ${brandTheme.spacing.xs};
`;

const CompactLabel = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    display: inline-flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    flex: 0 1 auto;
    min-width: 0;
    white-space: nowrap;
`;

const RequiredBadge = styled.span`
    background: ${brandTheme.primaryLight};
    opacity: 0.29;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex-shrink: 0;
    white-space: nowrap;
    box-shadow: 0 2px 4px ${brandTheme.primary}30;
    border: 2px solid ${brandTheme.primaryLight};
`;

const AllDayToggleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    flex-shrink: 0;
`;

const AllDayLabel = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: ${brandTheme.text.secondary};
    white-space: nowrap;
`;

const ToggleSwitch = styled.button<{ $isActive: boolean }>`
    position: relative;
    width: 44px;
    height: 22px;
    background: ${props => props.$isActive ? brandTheme.primary : brandTheme.text.muted};
    border: none;
    border-radius: 11px;
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};
    outline: none;
    flex-shrink: 0;

    &:hover {
        background: ${props => props.$isActive ? brandTheme.primaryDark : brandTheme.text.secondary};
    }

    &:focus {
        box-shadow: 0 0 0 3px ${props => props.$isActive ? brandTheme.primaryGhost : 'rgba(148, 163, 184, 0.2)'};
    }
`;

const ToggleSlider = styled.div<{ $isActive: boolean }>`
    position: absolute;
    top: 2px;
    left: ${props => props.$isActive ? '24px' : '2px'};
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    transition: all ${brandTheme.transitions.spring};
    box-shadow: ${brandTheme.shadow.sm};
`;

// KLUCZOWA ZMIANA: Inputy w jednym wierszu z gap
const InputRow = styled.div`
    display: grid;
    grid-template-columns: 1fr auto;
    gap: ${brandTheme.spacing.sm};
    align-items: center;

    input {
        height: 44px;
    }

    input[type="time"] {
        width: 120px;
    }

    /* Gdy jest tylko data (bez czasu) */
    &:has(input:only-child) {
        grid-template-columns: 1fr;
    }

    @media (max-width: 576px) {
        grid-template-columns: 1fr;

        input[type="time"] {
            width: 100%;
        }
    }
`;

export default ScheduleSection;