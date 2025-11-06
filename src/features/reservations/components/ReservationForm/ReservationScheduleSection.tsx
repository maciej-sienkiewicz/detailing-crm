// src/features/reservations/components/ReservationScheduleSection.tsx
/**
 * Schedule section for reservation form
 * Based on ScheduleSection from visits but adapted for reservations
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { FaClock } from 'react-icons/fa';
import { ReservationFormErrors } from '../../libs/types';
import { extractDateFromISO, extractTimeFromISO } from '../../libs/utils';

const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    surface: '#ffffff',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8'
    },
    border: '#e2e8f0',
    status: {
        error: '#dc2626',
        errorLight: '#fee2e2'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px'
    },
    radius: {
        md: '8px',
        lg: '12px'
    },
    transitions: {
        normal: '0.2s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    shadow: {
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }
};

interface ReservationScheduleSectionProps {
    startDate: string;
    endDate?: string;
    isAllDay: boolean;
    errors: ReservationFormErrors;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onAllDayToggle: () => void;
}

export const ReservationScheduleSection: React.FC<ReservationScheduleSectionProps> = ({
                                                                                          startDate,
                                                                                          endDate,
                                                                                          isAllDay,
                                                                                          errors,
                                                                                          onStartDateChange,
                                                                                          onEndDateChange,
                                                                                          onAllDayToggle
                                                                                      }) => {
    const [dateError, setDateError] = useState<string | null>(null);

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'startDate') {
            const newDateTime = value.includes('T') ? value : `${value}T08:00:00`;
            onStartDateChange(newDateTime);
        } else if (name === 'startTime') {
            const date = extractDateFromISO(startDate || new Date().toISOString());
            const newDateTime = `${date}T${value}:00`;
            onStartDateChange(newDateTime);
        }
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value) {
            const newDateTime = `${value}T23:59:59`;

            // Validate end date
            if (startDate) {
                const startDateObj = new Date(startDate.replace(' ', 'T'));
                const endDateObj = new Date(newDateTime);

                if (endDateObj < startDateObj) {
                    setDateError('Data zakończenia nie może być wcześniejsza niż data rozpoczęcia');
                } else {
                    setDateError(null);
                }
            }

            onEndDateChange(newDateTime);
        } else {
            onEndDateChange('');
            setDateError(null);
        }
    };

    return (
        <Section>
            <SectionTitle>Termin rezerwacji</SectionTitle>
            <FormRow>
                <FormGroup className="date-time-group">
                    <DateLabelContainer>
                        <InlineLabelContainer>
                            <Label htmlFor="startDate">
                                <LabelIcon><FaClock /></LabelIcon>
                                <span>Data i godzina rozpoczęcia</span>
                                <RequiredBadge>Wymagane</RequiredBadge>
                            </Label>
                            <AllDayToggleContainer>
                                <AllDayLabel>Cały dzień</AllDayLabel>
                                <ToggleSwitch $isActive={isAllDay} onClick={onAllDayToggle} type="button">
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
                            value={extractDateFromISO(startDate || '')}
                            onChange={handleStartDateChange}
                            required
                            className="date-input"
                            $hasError={!!errors.startDate}
                        />
                        {!isAllDay && (
                            <Input
                                id="startTime"
                                name="startTime"
                                type="time"
                                value={extractTimeFromISO(startDate || '', '08:00')}
                                onChange={handleStartDateChange}
                                required
                                className="time-input"
                            />
                        )}
                    </DateTimeContainer>
                    {errors.startDate && <ErrorText>{errors.startDate}</ErrorText>}
                </FormGroup>

                {!isAllDay && (
                    <FormGroup>
                        <Label htmlFor="endDate">
                            <LabelIcon><FaClock /></LabelIcon>
                            <span>Data zakończenia</span>
                            <RequiredBadge>Wymagane</RequiredBadge>
                        </Label>
                        <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            value={extractDateFromISO(endDate || '')}
                            onChange={handleEndDateChange}
                            required
                            $hasError={!!(errors.endDate || dateError)}
                        />
                        {errors.endDate && <ErrorText>{errors.endDate}</ErrorText>}
                        {dateError && <ErrorText>{dateError}</ErrorText>}
                    </FormGroup>
                )}
            </FormRow>
        </Section>
    );
};

// Styled Components
const Section = styled.section`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};

    &::before {
        content: '';
        width: 4px;
        height: 18px;
        background: ${brandTheme.primary};
        border-radius: 2px;
    }
`;

const SectionDescription = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${brandTheme.spacing.md};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }

    &.responsive-row {
        @media (max-width: 768px) {
            grid-template-columns: 1fr;
        }
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};

    &.date-time-group {
        grid-column: span 2;

        @media (max-width: 768px) {
            grid-column: span 1;
        }
    }
`;

const DateLabelContainer = styled.div`
    margin-bottom: ${brandTheme.spacing.xs};
`;

const InlineLabelContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.lg};
    width: 100%;
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const LabelIcon = styled.span`
    color: ${brandTheme.primary};
    font-size: 12px;
`;

const RequiredBadge = styled.span`
    background: ${brandTheme.primary};
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
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
        box-shadow: 0 0 0 3px ${props =>
    props.$isActive ? brandTheme.primaryGhost : 'rgba(148, 163, 184, 0.2)'
};
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

const DateTimeContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr auto;
    gap: ${brandTheme.spacing.sm};
    align-items: end;

    .date-input {
        grid-column: 1;
    }

    .time-input {
        grid-column: 2;
        width: 120px;
    }

    @media (max-width: 576px) {
        grid-template-columns: 1fr;
        gap: ${brandTheme.spacing.xs};

        .time-input {
            width: 100%;
        }
    }
`;

const Input = styled.input<{ $hasError?: boolean }>`
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasError ? brandTheme.status.error : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all ${brandTheme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? brandTheme.status.error : brandTheme.primary};
        box-shadow: 0 0 0 3px ${props =>
    props.$hasError ? brandTheme.status.errorLight : brandTheme.primaryGhost
};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }

    &.time-input, &.date-input {
        font-variant-numeric: tabular-nums;
    }
`;

const ErrorText = styled.div`
    color: ${brandTheme.status.error};
    font-size: 12px;
    font-weight: 500;
    margin-top: ${brandTheme.spacing.xs};
`;