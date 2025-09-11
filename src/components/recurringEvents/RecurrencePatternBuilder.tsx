// src/components/recurringEvents/RecurrencePatternBuilder.tsx
/**
 * Advanced Recurrence Pattern Builder Component
 * Provides intuitive interface for creating complex recurring patterns
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { FaCalendar, FaClock, FaInfoCircle, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import { format, addDays, startOfWeek } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    RecurrencePatternRequest,
    RecurrenceFrequency,
    RecurrenceFrequencyLabels
} from '../../types/recurringEvents';
import { useRecurrencePreview, usePatternValidation } from '../../hooks/useRecurringEvents';
import { theme } from '../../styles/theme';

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
                                                                               maxPreviewItems = 10
                                                                           }) => {
    // Local state for form inputs
    const [localPattern, setLocalPattern] = useState<RecurrencePatternRequest>(value);
    const [endType, setEndType] = useState<'never' | 'date' | 'count'>(() => {
        if (value.endDate) return 'date';
        if (value.maxOccurrences) return 'count';
        return 'never';
    });

    // Hooks for validation and preview
    const { preview, isGenerating, generatePreview, clearPreview } = useRecurrencePreview();
    const { validationResult, isValidating, validatePattern, clearValidation } = usePatternValidation();

    // Update local state when value prop changes
    useEffect(() => {
        setLocalPattern(value);
    }, [value]);

    // Generate preview when pattern changes
    useEffect(() => {
        if (showPreview && isValidPattern(localPattern)) {
            const debounceTimer = setTimeout(() => {
                generatePreview(localPattern, maxPreviewItems);
            }, 500);
            return () => clearTimeout(debounceTimer);
        } else {
            clearPreview();
        }
    }, [localPattern, showPreview, maxPreviewItems, generatePreview, clearPreview]);

    // Validate pattern when it changes
    useEffect(() => {
        if (isValidPattern(localPattern)) {
            const debounceTimer = setTimeout(() => {
                validatePattern(localPattern);
            }, 300);
            return () => clearTimeout(debounceTimer);
        } else {
            clearValidation();
        }
    }, [localPattern, validatePattern, clearValidation]);

    // Check if pattern has minimum required fields
    const isValidPattern = useCallback((pattern: RecurrencePatternRequest): boolean => {
        return !!(pattern.frequency && pattern.interval > 0);
    }, []);

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
        }
        if (frequency !== RecurrenceFrequency.MONTHLY) {
            updates.dayOfMonth = undefined;
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
                    updates.endDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');
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

    // Check if current configuration is valid
    const hasValidationErrors = useMemo(() => {
        if (!validationResult) return false;
        return !validationResult.isValid && validationResult.errors.length > 0;
    }, [validationResult]);

    const hasValidationWarnings = useMemo(() => {
        if (!validationResult) return false;
        return validationResult.warnings.length > 0;
    }, [validationResult]);

    return (
        <PatternBuilderContainer>
            <PatternBuilderHeader>
                <HeaderIcon>
                    <FaClock />
                </HeaderIcon>
                <HeaderContent>
                    <HeaderTitle>Wzorzec powtarzania</HeaderTitle>
                    <HeaderSubtitle>Skonfiguruj częstotliwość i zasady powtarzania wydarzenia</HeaderSubtitle>
                </HeaderContent>
            </PatternBuilderHeader>

            <PatternBuilderContent>
                {/* Frequency Selection */}
                <FormSection>
                    <SectionTitle>Częstotliwość</SectionTitle>
                    <FrequencyGrid>
                        {Object.values(RecurrenceFrequency).map(frequency => (
                            <FrequencyOption
                                key={frequency}
                                $active={localPattern.frequency === frequency}
                                $disabled={disabled}
                                onClick={() => !disabled && handleFrequencyChange(frequency)}
                            >
                                <FrequencyLabel>{RecurrenceFrequencyLabels[frequency]}</FrequencyLabel>
                            </FrequencyOption>
                        ))}
                    </FrequencyGrid>
                </FormSection>

                {/* Interval Configuration */}
                {localPattern.frequency && (
                    <FormSection>
                        <SectionTitle>Interwał</SectionTitle>
                        <IntervalContainer>
                            <IntervalLabel>Co</IntervalLabel>
                            <IntervalInput
                                type="number"
                                min="1"
                                max="365"
                                value={localPattern.interval}
                                onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                                disabled={disabled}
                            />
                            <IntervalLabel>{getIntervalLabel}</IntervalLabel>
                        </IntervalContainer>
                    </FormSection>
                )}

                {/* Days of Week Selection (Weekly only) */}
                {localPattern.frequency === RecurrenceFrequency.WEEKLY && (
                    <FormSection>
                        <SectionTitle>Dni tygodnia</SectionTitle>
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
                                >
                                    {day.label}
                                </DayOfWeekOption>
                            ))}
                        </DaysOfWeekGrid>
                        {!localPattern.daysOfWeek || localPattern.daysOfWeek.length === 0 && (
                            <ValidationMessage $type="error">
                                Wybierz przynajmniej jeden dzień tygodnia
                            </ValidationMessage>
                        )}
                    </FormSection>
                )}

                {/* Day of Month Selection (Monthly only) */}
                {localPattern.frequency === RecurrenceFrequency.MONTHLY && (
                    <FormSection>
                        <SectionTitle>Dzień miesiąca</SectionTitle>
                        <DayOfMonthContainer>
                            <DayOfMonthInput
                                type="number"
                                min="1"
                                max="31"
                                value={localPattern.dayOfMonth || ''}
                                onChange={(e) => updatePattern({
                                    dayOfMonth: parseInt(e.target.value) || undefined
                                })}
                                placeholder="Wybierz dzień (1-31)"
                                disabled={disabled}
                            />
                            <DayOfMonthHint>
                                <FaInfoCircle />
                                <span>Jeśli dzień nie istnieje w miesiącu, zostanie użyty ostatni dostępny dzień</span>
                            </DayOfMonthHint>
                        </DayOfMonthContainer>
                    </FormSection>
                )}

                {/* End Condition */}
                <FormSection>
                    <SectionTitle>Zakończenie</SectionTitle>
                    <EndTypeContainer>
                        <EndTypeOption
                            $active={endType === 'never'}
                            onClick={() => handleEndTypeChange('never')}
                            disabled={disabled}
                        >
                            Nigdy
                        </EndTypeOption>
                        <EndTypeOption
                            $active={endType === 'date'}
                            onClick={() => handleEndTypeChange('date')}
                            disabled={disabled}
                        >
                            Do daty
                        </EndTypeOption>
                        <EndTypeOption
                            $active={endType === 'count'}
                            onClick={() => handleEndTypeChange('count')}
                            disabled={disabled}
                        >
                            Po ilości
                        </EndTypeOption>
                    </EndTypeContainer>

                    {endType === 'date' && (
                        <EndDateContainer>
                            <EndDateInput
                                type="date"
                                value={localPattern.endDate || ''}
                                onChange={(e) => updatePattern({ endDate: e.target.value || undefined })}
                                min={format(new Date(), 'yyyy-MM-dd')}
                                disabled={disabled}
                            />
                        </EndDateContainer>
                    )}

                    {endType === 'count' && (
                        <EndCountContainer>
                            <EndCountInput
                                type="number"
                                min="1"
                                max="10000"
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

                {/* Validation Messages */}
                {hasValidationErrors && validationResult && (
                    <ValidationSection>
                        <ValidationTitle $type="error">
                            <FaExclamationTriangle />
                            Błędy walidacji
                        </ValidationTitle>
                        {validationResult.errors.map((error, index) => (
                            <ValidationMessage key={index} $type="error">
                                {error.message}
                            </ValidationMessage>
                        ))}
                    </ValidationSection>
                )}

                {hasValidationWarnings && validationResult && (
                    <ValidationSection>
                        <ValidationTitle $type="warning">
                            <FaInfoCircle />
                            Ostrzeżenia
                        </ValidationTitle>
                        {validationResult.warnings.map((warning, index) => (
                            <ValidationMessage key={index} $type="warning">
                                {warning}
                            </ValidationMessage>
                        ))}
                    </ValidationSection>
                )}

                {/* Preview Section */}
                {showPreview && isValidPattern(localPattern) && (
                    <PreviewSection>
                        <PreviewHeader>
                            <PreviewTitle>
                                <FaEye />
                                Podgląd następnych wystąpień
                            </PreviewTitle>
                            {isGenerating && <PreviewLoader>Generowanie...</PreviewLoader>}
                        </PreviewHeader>

                        {preview && (
                            <PreviewContent>
                                <PreviewSummary>
                                    <SummaryItem>
                                        <SummaryLabel>Łącznie wystąpień:</SummaryLabel>
                                        <SummaryValue>
                                            {endType === 'never' ? '∞' : preview.totalCount}
                                        </SummaryValue>
                                    </SummaryItem>
                                    <SummaryItem>
                                        <SummaryLabel>Pierwsze wystąpienie:</SummaryLabel>
                                        <SummaryValue>
                                            {preview.firstOccurrence && format(
                                                new Date(preview.firstOccurrence),
                                                'dd MMMM yyyy, EEEE',
                                                { locale: pl }
                                            )}
                                        </SummaryValue>
                                    </SummaryItem>
                                    {preview.lastOccurrence && (
                                        <SummaryItem>
                                            <SummaryLabel>Ostatnie wystąpienie:</SummaryLabel>
                                            <SummaryValue>
                                                {format(
                                                    new Date(preview.lastOccurrence),
                                                    'dd MMMM yyyy, EEEE',
                                                    { locale: pl }
                                                )}
                                            </SummaryValue>
                                        </SummaryItem>
                                    )}
                                </PreviewSummary>

                                <PreviewDates>
                                    {preview.dates.slice(0, maxPreviewItems).map((date, index) => (
                                        <PreviewDate key={index}>
                                            <DateNumber>{format(new Date(date), 'd')}</DateNumber>
                                            <DateInfo>
                                                <DateMonth>{format(new Date(date), 'MMM', { locale: pl })}</DateMonth>
                                                <DateYear>{format(new Date(date), 'yyyy')}</DateYear>
                                                <DateDay>{format(new Date(date), 'EEEE', { locale: pl })}</DateDay>
                                            </DateInfo>
                                        </PreviewDate>
                                    ))}
                                    {preview.dates.length > maxPreviewItems && (
                                        <MoreDatesIndicator>
                                            +{preview.dates.length - maxPreviewItems} więcej...
                                        </MoreDatesIndicator>
                                    )}
                                </PreviewDates>
                            </PreviewContent>
                        )}
                    </PreviewSection>
                )}
            </PatternBuilderContent>
        </PatternBuilderContainer>
    );
};

// Styled Components
const PatternBuilderContainer = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
    box-shadow: ${theme.shadow.sm};
`;

const PatternBuilderHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xl};
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.border};
`;

const HeaderIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${theme.primary}15;
    color: ${theme.primary};
    border-radius: ${theme.radius.lg};
    font-size: 20px;
`;

const HeaderContent = styled.div`
    flex: 1;
`;

const HeaderTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.xs} 0;
`;

const HeaderSubtitle = styled.p`
    font-size: 14px;
    color: ${theme.text.secondary};
    margin: 0;
    line-height: 1.4;
`;

const PatternBuilderContent = styled.div`
    padding: ${theme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
`;

const FormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const SectionTitle = styled.h4`
    font-size: 15px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const FrequencyGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: ${theme.spacing.sm};
`;

const FrequencyOption = styled.button<{ $active: boolean; $disabled: boolean }>`
    padding: ${theme.spacing.lg};
    background: ${props => props.$active ? theme.primary : theme.surface};
    color: ${props => props.$active ? 'white' : theme.text.secondary};
    border: 2px solid ${props => props.$active ? theme.primary : theme.border};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    opacity: ${props => props.$disabled ? 0.6 : 1};

    &:hover:not(:disabled) {
        background: ${props => props.$active ? theme.primaryDark : theme.surfaceHover};
        border-color: ${theme.primary};
        transform: translateY(-1px);
    }
`;

const FrequencyLabel = styled.span`
    font-size: 14px;
`;

const IntervalContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    flex-wrap: wrap;
`;

const IntervalLabel = styled.span`
    font-size: 15px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const IntervalInput = styled.input`
    width: 80px;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 15px;
    text-align: center;
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

const DaysOfWeekGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: ${theme.spacing.sm};
`;

const DayOfWeekOption = styled.button<{ $active: boolean; $disabled: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${props => props.$active ? theme.primary : theme.surface};
    color: ${props => props.$active ? 'white' : theme.text.secondary};
    border: 2px solid ${props => props.$active ? theme.primary : theme.border};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    opacity: ${props => props.$disabled ? 0.6 : 1};

    &:hover:not(:disabled) {
        background: ${props => props.$active ? theme.primaryDark : theme.surfaceHover};
        border-color: ${theme.primary};
        transform: scale(1.05);
    }
`;

const DayOfMonthContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
`;

const DayOfMonthInput = styled.input`
    width: 200px;
    padding: ${theme.spacing.md};
    border: 1px solid ${theme.border};
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

const DayOfMonthHint = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 13px;
    color: ${theme.text.tertiary};
    
    svg {
        color: ${theme.primary};
    }
`;

const EndTypeContainer = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};
    flex-wrap: wrap;
`;

const EndTypeOption = styled.button<{ $active: boolean }>`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${props => props.$active ? theme.primary : theme.surface};
    color: ${props => props.$active ? 'white' : theme.text.secondary};
    border: 2px solid ${props => props.$active ? theme.primary : theme.border};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${props => props.$active ? theme.primaryDark : theme.surfaceHover};
        border-color: ${theme.primary};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const EndDateContainer = styled.div`
    margin-top: ${theme.spacing.md};
`;

const EndDateInput = styled.input`
    padding: ${theme.spacing.md};
    border: 1px solid ${theme.border};
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
    width: 150px;
    padding: ${theme.spacing.md};
    border: 1px solid ${theme.border};
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

const ValidationSection = styled.div`
    padding: ${theme.spacing.lg};
    border-radius: ${theme.radius.md};
    background: ${theme.errorBg};
    border: 1px solid ${theme.error}30;
`;

const ValidationTitle = styled.div<{ $type: 'error' | 'warning' }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.$type === 'error' ? theme.error : theme.warning};
    margin-bottom: ${theme.spacing.md};
    
    svg {
        font-size: 14px;
    }
`;

const ValidationMessage = styled.div<{ $type: 'error' | 'warning' }>`
    font-size: 13px;
    color: ${props => props.$type === 'error' ? theme.error : theme.warning};
    margin-bottom: ${theme.spacing.xs};
    line-height: 1.4;

    &:last-child {
        margin-bottom: 0;
    }
`;

const PreviewSection = styled.div`
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceElevated};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
`;

const PreviewHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.spacing.lg};
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
    color: ${theme.text.tertiary};
    font-style: italic;
`;

const PreviewContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
`;

const PreviewSummary = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${theme.spacing.md};
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
    display: flex;
    gap: ${theme.spacing.md};
    flex-wrap: wrap;
    max-height: 200px;
    overflow-y: auto;
`;

const PreviewDate = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: ${theme.spacing.md};
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    min-width: 80px;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${theme.primary};
        transform: translateY(-2px);
        box-shadow: ${theme.shadow.sm};
    }
`;

const DateNumber = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${theme.primary};
    line-height: 1;
`;

const DateInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    margin-top: ${theme.spacing.xs};
`;

const DateMonth = styled.span`
    font-size: 11px;
    color: ${theme.text.secondary};
    font-weight: 600;
    text-transform: uppercase;
`;

const DateYear = styled.span`
    font-size: 10px;
    color: ${theme.text.tertiary};
    font-weight: 500;
`;

const DateDay = styled.span`
    font-size: 10px;
    color: ${theme.text.tertiary};
    font-weight: 400;
    text-transform: capitalize;
`;

const MoreDatesIndicator = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.lg};
    color: ${theme.text.tertiary};
    font-size: 13px;
    font-style: italic;
    border: 2px dashed ${theme.border};
    border-radius: ${theme.radius.md};
    min-width: 120px;
`;

export default RecurrencePatternBuilder;