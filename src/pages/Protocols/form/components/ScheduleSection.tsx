// src/pages/Protocols/form/components/ScheduleSection.tsx - POPRAWIONA WERSJA

import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {CarReceptionProtocol} from '../../../../types';
import {FormErrors} from '../hooks/useFormValidation';
import {
    brandTheme,
    DateTimeContainer,
    ErrorText,
    FormGroup,
    FormRow,
    FormSection,
    Input,
    SectionTitle
} from '../styles';
import {useToast} from "../../../../components/common/Toast/Toast";
import {LabelWithBadge} from './LabelWithBadge';

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

    // Handle all day toggle
    const handleAllDayToggle = () => {
        const newIsAllDay = !isAllDay;
        setIsAllDay(newIsAllDay);

        if (newIsAllDay) {
            // Set to all day - from 00:00 to 23:59, but use the same date for start and end
            const currentDate = formData.startDate ? formData.startDate.split('T')[0] : new Date().toISOString().split('T')[0];
            const startDateTime = `${currentDate}T00:00:00`;
            const endDateTime = `${currentDate}T23:59:59`;

            // Update start date
            const startEvent = {
                target: { name: 'startDate', value: startDateTime, type: 'text' }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(startEvent);

            // Update end date to the same day
            const endEvent = {
                target: { name: 'endDate', value: endDateTime, type: 'text' }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(endEvent);
        }
    };

    // Handle date change with validation
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'endDate') {
            if (value) {
                const newDateTime = `${value}T23:59:59`;
                const syntheticEvent = {
                    target: { name: 'endDate', value: newDateTime, type: 'text' }
                } as React.ChangeEvent<HTMLInputElement>;

                // Check if end date is valid compared to start date
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

    // POPRAWKA: Nie ustawiaj automatycznie daty obecnej dla StartVisitForm
    // StartVisitForm sam zarządza swoimi datami w useState
    useEffect(() => {
        // Sprawdź czy nie jesteśmy w kontekście StartVisitForm
        const isStartVisitContext = window.location.pathname.includes('/open');

        if (isFullProtocol && !formData.startDate && !isStartVisitContext) {
            console.log('🕐 ScheduleSection - ustawianie domyślnej daty dla nowego protokołu');
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

    // POPRAWKA: Ulepszona funkcja do wyciągania daty z różnych formatów
    const extractDateFromISO = (dateString: string): string => {
        if (!dateString) return '';

        try {
            // Usuń 'Z' i milisekundy
            let cleanedDate = dateString.replace('Z', '').split('.')[0];

            console.log('📅 ScheduleSection extractDateFromISO:', {
                input: dateString,
                cleaned: cleanedDate
            });

            // Jeśli ma format ISO z T, wyciągnij tylko część z datą
            if (cleanedDate.includes('T')) {
                const datePart = cleanedDate.split('T')[0];
                console.log('  📅 Wyciągnięta data:', datePart);
                return datePart;
            }

            // Jeśli ma spację zamiast T, wyciągnij część przed spacją
            if (cleanedDate.includes(' ')) {
                const datePart = cleanedDate.split(' ')[0];
                console.log('  📅 Wyciągnięta data (spacja):', datePart);
                return datePart;
            }

            // Jeśli to już tylko data w formacie YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedDate)) {
                console.log('  📅 Data w poprawnym formacie:', cleanedDate);
                return cleanedDate;
            }

            // Fallback - spróbuj utworzyć datę i wyciągnij z niej część
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                const formattedDate = date.toISOString().split('T')[0];
                console.log('  📅 Data z fallback:', formattedDate);
                return formattedDate;
            }

            console.warn('⚠️ Nie można sparsować daty:', dateString);
            return '';
        } catch (e) {
            console.warn('⚠️ Błąd podczas parsowania daty:', dateString, e);
            return '';
        }
    };

    // POPRAWKA: Ulepszona funkcja do wyciągania czasu
    const extractTimeFromISO = (dateString: string, defaultTime = '08:00'): string => {
        if (!dateString) return defaultTime;

        try {
            // Usuń 'Z' i milisekundy
            let cleanedDate = dateString.replace('Z', '').split('.')[0];

            console.log('🕐 ScheduleSection extractTimeFromISO:', {
                input: dateString,
                cleaned: cleanedDate,
                default: defaultTime
            });

            // Jeśli ma format ISO z T, wyciągnij czas
            if (cleanedDate.includes('T')) {
                const timePart = cleanedDate.split('T')[1];
                if (timePart) {
                    const timeOnly = timePart.substring(0, 5); // HH:MM
                    console.log('  🕐 Wyciągnięty czas (T):', timeOnly);
                    return timeOnly;
                }
            }

            // Jeśli ma spację zamiast T, wyciągnij czas
            if (cleanedDate.includes(' ')) {
                const timePart = cleanedDate.split(' ')[1];
                if (timePart) {
                    const timeOnly = timePart.substring(0, 5); // HH:MM
                    console.log('  🕐 Wyciągnięty czas (spacja):', timeOnly);
                    return timeOnly;
                }
            }

            console.log('  🕐 Używam domyślnego czasu:', defaultTime);
            return defaultTime;
        } catch (e) {
            console.warn('⚠️ Błąd podczas wyciągania czasu:', dateString, e);
            return defaultTime;
        }
    };

    return (
        <FormSection>
            <SectionTitle>Harmonogram wizyty</SectionTitle>
            <FormRow className="responsive-row">
                <FormGroup className="date-time-group">
                    <DateLabelContainer>
                        <InlineLabelContainer>
                            <LabelWithBadge htmlFor="startDate" required={true} badgeVariant="modern">
                                Data i godzina rozpoczęcia
                            </LabelWithBadge>
                            <AllDayToggleContainer>
                                <AllDayLabel>Cały dzień</AllDayLabel>
                                <ToggleSwitch $isActive={isAllDay} onClick={handleAllDayToggle} type="button">
                                    <ToggleSlider $isActive={isAllDay} />
                                </ToggleSwitch>
                            </AllDayToggleContainer>
                        </InlineLabelContainer>
                    </DateLabelContainer>

                    <DateTimeContainer>
                        <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={extractDateFromISO(formData.startDate || '')}
                            onChange={handleDateChange}
                            required
                            className="date-input"
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
                                    console.log('🕐 ScheduleSection - zmiana czasu rozpoczęcia:', {
                                        date,
                                        time: e.target.value,
                                        newDateTime
                                    });
                                    const syntheticEvent = {
                                        target: { name: 'startDate', value: newDateTime, type: 'text' }
                                    } as React.ChangeEvent<HTMLInputElement>;
                                    onChange(syntheticEvent);
                                }}
                                required
                                className="time-input"
                            />
                        )}
                    </DateTimeContainer>
                    {errors.startDate && <ErrorText>{errors.startDate}</ErrorText>}
                </FormGroup>

                {!isAllDay && (
                    <FormGroup>
                        <LabelWithBadge htmlFor="endDate" required={true} badgeVariant="modern">
                            Data zakończenia
                        </LabelWithBadge>
                        <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            value={extractDateFromISO(formData.endDate || '')}
                            onChange={handleDateChange}
                            required
                            $hasError={!!(errors.endDate || dateError)}
                        />
                        {errors.endDate && <ErrorText>{errors.endDate}</ErrorText>}
                        {dateError && <ErrorText>{dateError}</ErrorText>}
                    </FormGroup>
                )}
            </FormRow>
        </FormSection>
    );
};

// Styled Components for All Day Toggle
const DateLabelContainer = styled.div`
    margin-bottom: ${brandTheme.spacing.xs};
`;

const InlineLabelContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.lg};
    width: 100%;
`;

const AllDayToggleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    margin-left: auto;
`;

const AllDayLabel = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: ${brandTheme.text.secondary};
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

export default ScheduleSection;