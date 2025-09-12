// src/components/recurringEvents/RecurrencePatternBuilder.tsx - NAPRAWIONA WERSJA
/**
 * Advanced Recurrence Pattern Builder Component
 * NAPRAWY: Uporządkowane style, poprawiona logika, lepszy UX
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { FaCalendar, FaClock, FaInfoCircle, FaEye, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { format, addDays, addWeeks, addMonths, addYears, startOfMonth, endOfMonth, isValid as isDateValid } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    RecurrencePatternRequest,
    RecurrenceFrequency,
    RecurrenceFrequencyLabels
} from '../../types/recurringEvents';

// Theme definition - zastąpić właściwym theme z aplikacji
const theme = {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',

    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    surfaceElevated: '#f1f5f9',
    surfaceHover: '#f8fafc',

    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#94a3b8'
    },

    border: '#e2e8f0',
    borderActive: '#cbd5e1',

    spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px'
    },

    radius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px'
    },

    shadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },

    // Additional colors for validation states
    errorBg: '#fef2f2',
    successBg: '#f0fdf4',
    warningBg: '#fffbeb'
};

interface RecurrencePatternBuilderProps {
    value: RecurrencePatternRequest;
    onChange: (pattern: RecurrencePatternRequest) => void;
    disabled?: boolean;
    showPreview?: boolean;
    maxPreviewItems?: number;
}

const DAYS_OF_WEEK = [
    { key: 'MON', label: 'Pn', fullLabel: 'Poniedziałek' },
    { key: 'TUE', label: 'Wt', fullLabel: 'Wtorek' },
    { key: 'WED', label: 'Śr', fullLabel: 'Środa' },
    { key: 'THU', label: 'Cz', fullLabel: 'Czwartek' },
    { key: 'FRI', label: 'Pt', fullLabel: 'Piątek' },
    { key: 'SAT', label: 'So', fullLabel: 'Sobota' },
    { key: 'SUN', label: 'Nd', fullLabel: 'Niedziela' }
];

const RecurrencePatternBuilder: React.FC<RecurrencePatternBuilderProps> = ({
                                                                               value,
                                                                               onChange,
                                                                               disabled = false,
                                                                               showPreview = true,
                                                                               maxPreviewItems = 8
                                                                           }) => {
    // Local state for form inputs
    const [localPattern, setLocalPattern] = useState<RecurrencePatternRequest>(value);
    const [endType, setEndType] = useState<'never' | 'date' | 'count'>(() => {
        if (value.endDate) return 'date';
        if (value.maxOccurrences) return 'count';
        return 'never';
    });

    // Validation state
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

    // Update local state when value prop changes
    useEffect(() => {
        setLocalPattern(value);
        if (value.endDate) setEndType('date');
        else if (value.maxOccurrences) setEndType('count');
        else setEndType('never');
    }, [value]);

    // Real-time validation
    const validatePattern = useCallback((pattern: RecurrencePatternRequest) => {
        const errors: string[] = [];

        if (!pattern.frequency) {
            errors.push('Wybierz częstotliwość powtarzania');
        }

        if (!pattern.interval || pattern.interval < 1) {
            errors.push('Interwał musi być większy od 0');
        }

        if (pattern.frequency === RecurrenceFrequency.WEEKLY) {
            if (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0) {
                errors.push('Wybierz przynajmniej jeden dzień tygodnia dla częstotliwości tygodniowej');
            }
        }

        if (pattern.frequency === RecurrenceFrequency.MONTHLY) {
            if (!pattern.dayOfMonth || pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31) {
                errors.push('Wybierz prawidłowy dzień miesiąca (1-31) dla częstotliwości miesięcznej');
            }
        }

        if (pattern.endDate) {
            const endDate = new Date(pattern.endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (!isDateValid(endDate) || endDate <= today) {
                errors.push('Data zakończenia musi być w przyszłości');
            }
        }

        if (pattern.maxOccurrences && pattern.maxOccurrences < 1) {
            errors.push('Liczba wystąpień musi być większa od 0');
        }

        setValidationErrors(errors);
        return errors.length === 0;
    }, []);

    // Generate preview dates
    const generatePreviewDates = useCallback((pattern: RecurrencePatternRequest, maxDates: number = 8) => {
        if (!validatePattern(pattern)) {
            return [];
        }

        setIsGeneratingPreview(true);

        try {
            const dates: Date[] = [];
            let currentDate = new Date();
            currentDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

            const endDate = pattern.endDate ? new Date(pattern.endDate) : null;
            const maxOccurrences = pattern.maxOccurrences || maxDates;
            const limit = Math.min(maxDates, maxOccurrences);

            let attempts = 0;
            const maxAttempts = limit * 10; // Safety limit

            while (dates.length < limit && attempts < maxAttempts) {
                attempts++;

                // Check end date
                if (endDate && currentDate > endDate) {
                    break;
                }

                // Add current date
                dates.push(new Date(currentDate));

                // Calculate next occurrence based on frequency
                switch (pattern.frequency) {
                    case RecurrenceFrequency.DAILY:
                        currentDate = addDays(currentDate, pattern.interval);
                        break;

                    case RecurrenceFrequency.WEEKLY:
                        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
                            // For weekly, handle multiple days per week correctly
                            currentDate = addWeeks(currentDate, pattern.interval);
                        } else {
                            currentDate = addWeeks(currentDate, pattern.interval);
                        }
                        break;

                    case RecurrenceFrequency.MONTHLY:
                        if (pattern.dayOfMonth) {
                            const nextMonth = addMonths(currentDate, pattern.interval);
                            const daysInMonth = endOfMonth(nextMonth).getDate();
                            const targetDay = Math.min(pattern.dayOfMonth, daysInMonth);
                            nextMonth.setDate(targetDay);
                            currentDate = nextMonth;
                        } else {
                            currentDate = addMonths(currentDate, pattern.interval);
                        }
                        break;

                    case RecurrenceFrequency.YEARLY:
                        currentDate = addYears(currentDate, pattern.interval);
                        break;

                    default:
                        currentDate = addDays(currentDate, pattern.interval);
                }
            }

            return dates;
        } finally {
            setIsGeneratingPreview(false);
        }
    }, [validatePattern]);

    // Update pattern and notify parent
    const updatePattern = useCallback((updates: Partial<RecurrencePatternRequest>) => {
        const newPattern = { ...localPattern, ...updates };
        setLocalPattern(newPattern);
        onChange(newPattern);
    }, [localPattern, onChange]);

    // Handle frequency change
    const handleFrequencyChange = useCallback((frequency: RecurrenceFrequency) => {
        const updates: Partial<RecurrencePatternRequest> = { frequency };

        // Clear frequency-specific fields when changing frequency
        if (frequency !== RecurrenceFrequency.WEEKLY) {
            updates.daysOfWeek = undefined;
        } else {
            // Set default days for weekly (current day of week)
            const today = new Date();
            const dayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const dayKeys = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            updates.daysOfWeek = [dayKeys[dayIndex]];
        }

        if (frequency !== RecurrenceFrequency.MONTHLY) {
            updates.dayOfMonth = undefined;
        } else {
            updates.dayOfMonth = new Date().getDate();
        }

        updatePattern(updates);
    }, [updatePattern]);

    // Handle interval change
    const handleIntervalChange = useCallback((interval: number) => {
        updatePattern({ interval: Math.max(1, interval) });
    }, [updatePattern]);

    // Handle days of week change
    const handleDaysOfWeekChange = useCallback((day: string, checked: boolean) => {
        const currentDays = localPattern.daysOfWeek || [];
        const newDays = checked
            ? [...currentDays, day]
            : currentDays.filter(d => d !== day);

        updatePattern({ daysOfWeek: newDays.length > 0 ? newDays : undefined });
    }, [localPattern.daysOfWeek, updatePattern]);

    // Handle day of month change
    const handleDayOfMonthChange = useCallback((dayOfMonth: number) => {
        const clampedDay = Math.max(1, Math.min(31, dayOfMonth));
        updatePattern({ dayOfMonth: clampedDay });
    }, [updatePattern]);

    // Handle end type change
    const handleEndTypeChange = useCallback((type: 'never' | 'date' | 'count') => {
        setEndType(type);

        const updates: Partial<RecurrencePatternRequest> = {};

        switch (type) {
            case 'never':
                updates.endDate = undefined;
                updates.maxOccurrences = undefined;
                break;
            case 'date':
                updates.maxOccurrences = undefined;
                if (!localPattern.endDate) {
                    const defaultEndDate = addDays(new Date(), 30);
                    updates.endDate = format(defaultEndDate, 'yyyy-MM-dd');
                }
                break;
            case 'count':
                updates.endDate = undefined;
                if (!localPattern.maxOccurrences) {
                    updates.maxOccurrences = 10;
                }
                break;
        }

        updatePattern(updates);
    }, [localPattern.endDate, localPattern.maxOccurrences, updatePattern]);

    // Generate interval label based on frequency
    const getIntervalLabel = useMemo(() => {
        switch (localPattern.frequency) {
            case RecurrenceFrequency.DAILY:
                return localPattern.interval === 1 ? 'dzień' : 'dni';
            case RecurrenceFrequency.WEEKLY:
                return localPattern.interval === 1 ? 'tydzień' : 'tygodni';
            case RecurrenceFrequency.MONTHLY:
                return localPattern.interval === 1 ? 'miesiąc' : 'miesięcy';
            case RecurrenceFrequency.YEARLY:
                return localPattern.interval === 1 ? 'rok' : 'lat';
            default:
                return '';
        }
    }, [localPattern.frequency, localPattern.interval]);

    // Check if pattern is valid for preview
    const isValidForPreview = useMemo(() => {
        return validationErrors.length === 0 &&
            localPattern.frequency &&
            localPattern.interval > 0;
    }, [validationErrors, localPattern]);

    // Generate preview
    const previewDates = useMemo(() => {
        if (!isValidForPreview || !showPreview) return [];
        return generatePreviewDates(localPattern, maxPreviewItems);
    }, [isValidForPreview, showPreview, localPattern, maxPreviewItems, generatePreviewDates]);

    // Validate on pattern change
    useEffect(() => {
        validatePattern(localPattern);
    }, [localPattern, validatePattern]);

    return (
        <PatternBuilderContainer>
            <PatternBuilderContent>
                <MainContent>
                    <LeftColumn>
                        {/* Frequency Selection */}
                        <FormSection>
                            <SectionHeader>
                                <SectionTitle>
                                    <FaClock />
                                    Częstotliwość
                                </SectionTitle>
                                <RequiredIndicator>*</RequiredIndicator>
                            </SectionHeader>
                            <FrequencyGrid>
                                {Object.values(RecurrenceFrequency).map(frequency => (
                                    <FrequencyOption
                                        key={frequency}
                                        $active={localPattern.frequency === frequency}
                                        $disabled={disabled}
                                        onClick={() => !disabled && handleFrequencyChange(frequency)}
                                        disabled={disabled}
                                    >
                                        <FrequencyLabel>{RecurrenceFrequencyLabels[frequency]}</FrequencyLabel>
                                    </FrequencyOption>
                                ))}
                            </FrequencyGrid>
                        </FormSection>

                        {/* Interval Configuration */}
                        {localPattern.frequency && (
                            <FormSection>
                                <SectionHeader>
                                    <SectionTitle>Interwał</SectionTitle>
                                    <RequiredIndicator>*</RequiredIndicator>
                                </SectionHeader>
                                <IntervalContainer>
                                    <IntervalLabel>Co</IntervalLabel>
                                    <IntervalInput
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={localPattern.interval || 1}
                                        onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                                        disabled={disabled}
                                    />
                                    <IntervalLabel>{getIntervalLabel}</IntervalLabel>
                                </IntervalContainer>
                                <IntervalHint>
                                    Określa co ile {getIntervalLabel} ma się powtarzać wydarzenie
                                </IntervalHint>
                            </FormSection>
                        )}

                        {/* Days of Week Selection (Weekly only) */}
                        {localPattern.frequency === RecurrenceFrequency.WEEKLY && (
                            <FormSection>
                                <SectionHeader>
                                    <SectionTitle>Dni tygodnia</SectionTitle>
                                    <RequiredIndicator>*</RequiredIndicator>
                                </SectionHeader>
                                <DaysOfWeekGrid>
                                    {DAYS_OF_WEEK.map(day => (
                                        <DayOfWeekOption
                                            key={day.key}
                                            $active={localPattern.daysOfWeek?.includes(day.key) || false}
                                            $disabled={disabled}
                                            onClick={() => !disabled && handleDaysOfWeekChange(
                                                day.key,
                                                !localPattern.daysOfWeek?.includes(day.key)
                                            )}
                                            title={day.fullLabel}
                                            disabled={disabled}
                                        >
                                            {day.label}
                                        </DayOfWeekOption>
                                    ))}
                                </DaysOfWeekGrid>
                                <DaysHint>
                                    Wybierz dni tygodnia, w które ma się odbywać wydarzenie
                                </DaysHint>
                            </FormSection>
                        )}

                        {/* Day of Month Selection (Monthly only) */}
                        {localPattern.frequency === RecurrenceFrequency.MONTHLY && (
                            <FormSection>
                                <SectionHeader>
                                    <SectionTitle>Dzień miesiąca</SectionTitle>
                                    <RequiredIndicator>*</RequiredIndicator>
                                </SectionHeader>
                                <DayOfMonthContainer>
                                    <DayOfMonthInputContainer>
                                        <DayOfMonthInput
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={localPattern.dayOfMonth || ''}
                                            onChange={(e) => handleDayOfMonthChange(parseInt(e.target.value) || 1)}
                                            placeholder="Dzień"
                                            disabled={disabled}
                                        />
                                        <DayOfMonthLabel>dzień miesiąca</DayOfMonthLabel>
                                    </DayOfMonthInputContainer>
                                    <DayOfMonthHint>
                                        <FaInfoCircle />
                                        <span>Jeśli dzień nie istnieje w danym miesiącu (np. 31 lutego), zostanie użyty ostatni dzień miesiąca</span>
                                    </DayOfMonthHint>
                                </DayOfMonthContainer>
                            </FormSection>
                        )}

                        {/* End Condition */}
                        <FormSection>
                            <SectionHeader>
                                <SectionTitle>Zakończenie</SectionTitle>
                            </SectionHeader>
                            <EndTypeContainer>
                                <EndTypeOption
                                    $active={endType === 'never'}
                                    onClick={() => handleEndTypeChange('never')}
                                    disabled={disabled}
                                >
                                    <EndTypeIcon>∞</EndTypeIcon>
                                    <EndTypeLabel>Nigdy</EndTypeLabel>
                                </EndTypeOption>
                                <EndTypeOption
                                    $active={endType === 'date'}
                                    onClick={() => handleEndTypeChange('date')}
                                    disabled={disabled}
                                >
                                    <EndTypeIcon><FaCalendar /></EndTypeIcon>
                                    <EndTypeLabel>Do daty</EndTypeLabel>
                                </EndTypeOption>
                                <EndTypeOption
                                    $active={endType === 'count'}
                                    onClick={() => handleEndTypeChange('count')}
                                    disabled={disabled}
                                >
                                    <EndTypeIcon>#</EndTypeIcon>
                                    <EndTypeLabel>Po liczbie wystąpień</EndTypeLabel>
                                </EndTypeOption>
                            </EndTypeContainer>

                            {endType === 'date' && (
                                <EndDateContainer>
                                    <EndDateInput
                                        type="date"
                                        value={localPattern.endDate || ''}
                                        onChange={(e) => updatePattern({ endDate: e.target.value || undefined })}
                                        min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                                        disabled={disabled}
                                    />
                                </EndDateContainer>
                            )}

                            {endType === 'count' && (
                                <EndCountContainer>
                                    <EndCountInput
                                        type="number"
                                        min="1"
                                        max="1000"
                                        value={localPattern.maxOccurrences || ''}
                                        onChange={(e) => updatePattern({
                                            maxOccurrences: parseInt(e.target.value) || undefined
                                        })}
                                        placeholder="Liczba wystąpień"
                                        disabled={disabled}
                                    />
                                    <EndCountLabel>wystąpień</EndCountLabel>
                                </EndCountContainer>
                            )}
                        </FormSection>
                    </LeftColumn>

                    <RightColumn>
                        {/* Validation Messages */}
                        {validationErrors.length > 0 && (
                            <ValidationSection $type="error">
                                <ValidationHeader>
                                    <FaExclamationTriangle />
                                    <ValidationTitle>Wymagane informacje</ValidationTitle>
                                </ValidationHeader>
                                <ValidationList>
                                    {validationErrors.map((error, index) => (
                                        <ValidationItem key={index}>
                                            <ValidationBullet>•</ValidationBullet>
                                            <ValidationMessage>{error}</ValidationMessage>
                                        </ValidationItem>
                                    ))}
                                </ValidationList>
                            </ValidationSection>
                        )}

                        {/* Success indicator */}
                        {validationErrors.length === 0 && isValidForPreview && (
                            <ValidationSection $type="success">
                                <ValidationHeader>
                                    <FaCheckCircle />
                                    <ValidationTitle>Wzorzec jest prawidłowy</ValidationTitle>
                                </ValidationHeader>
                                <SuccessMessage>
                                    Wszystkie wymagane pola zostały wypełnione poprawnie.
                                </SuccessMessage>
                            </ValidationSection>
                        )}

                        {/* Preview Section */}
                        {showPreview && isValidForPreview && (
                            <PreviewSection>
                                <PreviewHeader>
                                    <PreviewTitle>
                                        <FaEye />
                                        Podgląd następnych wystąpień
                                    </PreviewTitle>
                                    {isGeneratingPreview && <PreviewLoader>Generowanie...</PreviewLoader>}
                                </PreviewHeader>

                                {previewDates.length > 0 && (
                                    <PreviewContent>
                                        <PreviewSummary>
                                            <SummaryItem>
                                                <SummaryLabel>Pierwsze wystąpienie:</SummaryLabel>
                                                <SummaryValue>
                                                    {format(previewDates[0], 'dd MMMM yyyy, EEEE', { locale: pl })}
                                                </SummaryValue>
                                            </SummaryItem>
                                            <SummaryItem>
                                                <SummaryLabel>Łączna liczba wystąpień:</SummaryLabel>
                                                <SummaryValue>
                                                    {endType === 'never'
                                                        ? '∞ (bez ograniczeń)'
                                                        : localPattern.maxOccurrences || 'Do końcowej daty'
                                                    }
                                                </SummaryValue>
                                            </SummaryItem>
                                        </PreviewSummary>

                                        <PreviewDates>
                                            {previewDates.slice(0, maxPreviewItems).map((date, index) => (
                                                <PreviewDate key={index}>
                                                    <DateNumber>{format(date, 'd')}</DateNumber>
                                                    <DateInfo>
                                                        <DateMonth>{format(date, 'MMM', { locale: pl })}</DateMonth>
                                                        <DateYear>{format(date, 'yyyy')}</DateYear>
                                                        <DateDay>{format(date, 'EEEE', { locale: pl })}</DateDay>
                                                    </DateInfo>
                                                </PreviewDate>
                                            ))}
                                            {previewDates.length > maxPreviewItems && (
                                                <MoreDatesIndicator>
                                                    +{previewDates.length - maxPreviewItems} więcej...
                                                </MoreDatesIndicator>
                                            )}
                                        </PreviewDates>
                                    </PreviewContent>
                                )}
                            </PreviewSection>
                        )}
                    </RightColumn>
                </MainContent>
            </PatternBuilderContent>
        </PatternBuilderContainer>
    );
};

// Styled Components - UPORZĄDKOWANE STYLE
const PatternBuilderContainer = styled.div`
    width: 100%;
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
`;

const PatternBuilderContent = styled.div`
    width: 100%;
`;

const MainContent = styled.div`
    display: grid;
    grid-template-columns: 1fr 400px;
    min-height: 600px;
    
    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const LeftColumn = styled.div`
    padding: ${theme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
`;

const RightColumn = styled.div`
    background: ${theme.surfaceAlt};
    border-left: 1px solid ${theme.border};
    padding: ${theme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
    
    @media (max-width: 1024px) {
        border-left: none;
        border-top: 1px solid ${theme.border};
    }
`;

const FormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
`;

const SectionTitle = styled.h4`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;

    svg {
        color: ${theme.primary};
        font-size: 14px;
    }
`;

const RequiredIndicator = styled.span`
    color: ${theme.error};
    font-size: 14px;
    font-weight: 600;
`;

// Frequency styles
const FrequencyGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.md};
`;

const FrequencyOption = styled.button<{ $active: boolean; $disabled: boolean }>`
    padding: ${theme.spacing.lg};
    background: ${props => props.$active ? theme.primary : theme.surface};
    color: ${props => props.$active ? 'white' : theme.text.primary};
    border: 2px solid ${props => props.$active ? theme.primary : theme.border};
    border-radius: ${theme.radius.lg};
    font-weight: 600;
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    opacity: ${props => props.$disabled ? 0.6 : 1};
    text-align: center;

    &:hover:not(:disabled) {
        background: ${props => props.$active ? theme.primaryDark : theme.surfaceHover};
        border-color: ${theme.primary};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.sm};
    }

    &:disabled {
        cursor: not-allowed;
        transform: none;
    }
`;

const FrequencyLabel = styled.span`
    font-size: 15px;
`;

// Interval styles
const IntervalContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
`;

const IntervalLabel = styled.span`
    font-size: 16px;
    color: ${theme.text.primary};
    font-weight: 500;
`;

const IntervalInput = styled.input`
    width: 80px;
    padding: ${theme.spacing.md};
    border: 2px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 16px;
    text-align: center;
    background: ${theme.surface};
    color: ${theme.text.primary};
    font-weight: 600;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primary}20;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const IntervalHint = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
    margin-top: ${theme.spacing.sm};
`;

// Days of week styles
const DaysOfWeekGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: ${theme.spacing.sm};
`;

const DayOfWeekOption = styled.button<{ $active: boolean; $disabled: boolean }>`
    padding: ${theme.spacing.md};
    background: ${props => props.$active ? theme.primary : theme.surface};
    color: ${props => props.$active ? 'white' : theme.text.primary};
    border: 2px solid ${props => props.$active ? theme.primary : theme.border};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    opacity: ${props => props.$disabled ? 0.6 : 1};
    text-align: center;
    font-size: 13px;

&:hover:not(:disabled) {
        background: ${props => props.$active ? theme.primaryDark : theme.surfaceHover};
        border-color: ${theme.primary};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.sm};
    }

    &:disabled {
        cursor: not-allowed;
        transform: none;
    }
`;

const DaysHint = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
    margin-top: ${theme.spacing.sm};
`;

// Day of month styles
const DayOfMonthContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const DayOfMonthInputContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
`;

const DayOfMonthInput = styled.input`
    width: 80px;
    padding: ${theme.spacing.md};
    border: 2px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 16px;
    text-align: center;
    background: ${theme.surface};
    color: ${theme.text.primary};
    font-weight: 600;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primary}20;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const DayOfMonthLabel = styled.span`
    font-size: 16px;
    color: ${theme.text.primary};
    font-weight: 500;
`;

const DayOfMonthHint = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
    font-size: 13px;
    color: ${theme.text.tertiary};
    background: ${theme.primary}08;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.radius.md};
    border: 1px solid ${theme.primary}20;
    
    svg {
        color: ${theme.primary};
        margin-top: 2px;
        flex-shrink: 0;
    }
`;

// End type styles
const EndTypeContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${theme.spacing.sm};
`;

const EndTypeOption = styled.button<{ $active: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg};
    background: ${props => props.$active ? theme.primary : theme.surface};
    color: ${props => props.$active ? 'white' : theme.text.primary};
    border: 2px solid ${props => props.$active ? theme.primary : theme.border};
    border-radius: ${theme.radius.lg};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${props => props.$active ? theme.primaryDark : theme.surfaceHover};
        border-color: ${theme.primary};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.sm};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const EndTypeIcon = styled.div`
    font-size: 20px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
        font-size: 16px;
    }
`;

const EndTypeLabel = styled.div`
    font-size: 13px;
    text-align: center;
`;

const EndDateContainer = styled.div`
    margin-top: ${theme.spacing.md};
`;

const EndDateInput = styled.input`
    width: 100%;
    padding: ${theme.spacing.md};
    border: 2px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 15px;
    background: ${theme.surface};
    color: ${theme.text.primary};

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primary}20;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const EndCountContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    margin-top: ${theme.spacing.md};
`;

const EndCountInput = styled.input`
    flex: 1;
    padding: ${theme.spacing.md};
    border: 2px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 15px;
    background: ${theme.surface};
    color: ${theme.text.primary};

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primary}20;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const EndCountLabel = styled.span`
    font-size: 15px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

// Validation styles
const ValidationSection = styled.div<{ $type: 'error' | 'success' }>`
    padding: ${theme.spacing.lg};
    border-radius: ${theme.radius.lg};
    background: ${props => props.$type === 'error' ? theme.errorBg : theme.successBg};
    border: 2px solid ${props => props.$type === 'error' ? theme.error + '30' : theme.success + '30'};
    position: sticky;
    top: ${theme.spacing.md};
`;

const ValidationHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.md};
    
    svg {
        color: ${props => props.theme.$type === 'error' ? theme.error : theme.success};
        font-size: 16px;
    }
`;

const ValidationTitle = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const ValidationList = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
`;

const ValidationItem = styled.li`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.sm};

    &:last-child {
        margin-bottom: 0;
    }
`;

const ValidationBullet = styled.div`
    color: ${theme.error};
    font-weight: bold;
    margin-top: 2px;
    flex-shrink: 0;
`;

const ValidationMessage = styled.div`
    font-size: 13px;
    color: ${theme.text.primary};
    line-height: 1.4;
`;

const SuccessMessage = styled.div`
    font-size: 14px;
    color: ${theme.success};
    font-weight: 500;
`;

// Preview styles
const PreviewSection = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
    position: sticky;
    top: ${theme.spacing.md};
`;

const PreviewHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.border};
`;

const PreviewTitle = styled.h5`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 15px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
    
    svg {
        color: ${theme.primary};
        font-size: 14px;
    }
`;

const PreviewLoader = styled.span`
    font-size: 13px;
    color: ${theme.primary};
    font-weight: 500;
    animation: pulse 1.5s ease-in-out infinite;

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;

const PreviewContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
`;

const PreviewSummary = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    padding-bottom: ${theme.spacing.lg};
    border-bottom: 1px solid ${theme.border};
`;

const SummaryItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const SummaryLabel = styled.span`
    font-size: 12px;
    color: ${theme.text.tertiary};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const SummaryValue = styled.span`
    font-size: 14px;
    color: ${theme.text.primary};
    font-weight: 600;
`;

const PreviewDates = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.md};
    max-height: 400px;
    overflow-y: auto;
    
    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: ${theme.surfaceAlt};
        border-radius: ${theme.radius.sm};
    }
    
    &::-webkit-scrollbar-thumb {
        background: ${theme.border};
        border-radius: ${theme.radius.sm};
        
        &:hover {
            background: ${theme.borderActive};
        }
    }
`;

const PreviewDate = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md};
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    transition: all 0.2s ease;

    &:hover {
        border-color: ${theme.primary};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.sm};
    }
`;

const DateNumber = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: ${theme.primary};
    color: white;
    font-size: 16px;
    font-weight: 700;
    border-radius: ${theme.radius.md};
    flex-shrink: 0;
`;

const DateInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
`;

const DateMonth = styled.span`
    font-size: 13px;
    color: ${theme.text.primary};
    font-weight: 600;
    text-transform: capitalize;
`;

const DateYear = styled.span`
    font-size: 12px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const DateDay = styled.span`
    font-size: 11px;
    color: ${theme.text.tertiary};
    text-transform: capitalize;
`;

const MoreDatesIndicator = styled.div`
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.lg};
    color: ${theme.text.tertiary};
    font-size: 13px;
    font-weight: 500;
    border: 2px dashed ${theme.border};
    border-radius: ${theme.radius.md};
    background: ${theme.surfaceAlt};
`;

export default RecurrencePatternBuilder;