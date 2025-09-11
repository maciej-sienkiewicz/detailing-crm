// src/components/visits/VisitFormExtension.tsx
/**
 * Visit Form Extension for Recurring Visits
 * Adds recurring visit functionality to existing visit forms
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { FaChevronDown, FaChevronUp, FaInfoCircle } from 'react-icons/fa';
import {
    RecurrencePatternRequest,
    RecurrenceFrequency
} from '../../types/recurringEvents';
import RecurrencePatternBuilder from '../recurringEvents/RecurrencePatternBuilder';
import { theme } from '../../styles/theme';
import {FaRepeat} from "react-icons/fa6";

interface VisitFormExtensionProps {
    // Form state
    isRecurring: boolean;
    recurrencePattern: RecurrencePatternRequest;

    // Callbacks
    onRecurringToggle: (enabled: boolean) => void;
    onPatternChange: (pattern: RecurrencePatternRequest) => void;

    // Configuration
    disabled?: boolean;
    showHelp?: boolean;
}

const VisitFormExtension: React.FC<VisitFormExtensionProps> = ({
                                                                   isRecurring,
                                                                   recurrencePattern,
                                                                   onRecurringToggle,
                                                                   onPatternChange,
                                                                   disabled = false,
                                                                   showHelp = true
                                                               }) => {
    const [isExpanded, setIsExpanded] = useState(isRecurring);

    // Handle recurring toggle
    const handleToggle = useCallback((enabled: boolean) => {
        onRecurringToggle(enabled);
        setIsExpanded(enabled);

        // If enabling recurring, initialize with default pattern
        if (enabled && !recurrencePattern.frequency) {
            onPatternChange({
                frequency: RecurrenceFrequency.WEEKLY,
                interval: 1,
                daysOfWeek: undefined,
                dayOfMonth: undefined,
                endDate: undefined,
                maxOccurrences: undefined
            });
        }
    }, [onRecurringToggle, onPatternChange, recurrencePattern]);

    // Handle pattern changes
    const handlePatternChange = useCallback((pattern: RecurrencePatternRequest) => {
        onPatternChange(pattern);
    }, [onPatternChange]);

    return (
        <ExtensionContainer>
            {/* Toggle Section */}
            <ToggleSection>
                <ToggleContainer>
                    <ToggleCheckbox
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => handleToggle(e.target.checked)}
                        disabled={disabled}
                    />
                    <ToggleContent>
                        <ToggleLabel>
                            <FaRepeat />
                            Powtarzaj tę wizytę
                        </ToggleLabel>
                        <ToggleDescription>
                            Utwórz cykliczne wydarzenie, które będzie się automatycznie powtarzać według określonego wzorca
                        </ToggleDescription>
                    </ToggleContent>
                </ToggleContainer>

                {isRecurring && (
                    <ExpandToggle
                        onClick={() => setIsExpanded(!isExpanded)}
                        disabled={disabled}
                    >
                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </ExpandToggle>
                )}
            </ToggleSection>

            {/* Help Section */}
            {showHelp && isRecurring && (
                <HelpSection>
                    <HelpIcon>
                        <FaInfoCircle />
                    </HelpIcon>
                    <HelpContent>
                        <HelpTitle>Jak działają cykliczne wizyty?</HelpTitle>
                        <HelpText>
                            Cykliczna wizyta tworzy szablon, który generuje wystąpienia w określonych intervalach.
                            Każde wystąpienie można później przekształcić w pełnoprawną wizytę z konkretnym klientem i pojazdem.
                        </HelpText>
                        <HelpList>
                            <HelpItem>✓ Automatyczne generowanie terminów</HelpItem>
                            <HelpItem>✓ Elastyczna konfiguracja powtarzania</HelpItem>
                            <HelpItem>✓ Możliwość konwersji na rzeczywiste wizyty</HelpItem>
                        </HelpList>
                    </HelpContent>
                </HelpSection>
            )}

            {/* Pattern Configuration */}
            {isRecurring && isExpanded && (
                <PatternSection>
                    <RecurrencePatternBuilder
                        value={recurrencePattern}
                        onChange={handlePatternChange}
                        disabled={disabled}
                        showPreview={true}
                        maxPreviewItems={5}
                    />
                </PatternSection>
            )}

            {/* Summary */}
            {isRecurring && !isExpanded && recurrencePattern.frequency && (
                <SummarySection onClick={() => setIsExpanded(true)}>
                    <SummaryContent>
                        <SummaryLabel>Wzorzec powtarzania:</SummaryLabel>
                        <SummaryValue>
                            {getPatternSummary(recurrencePattern)}
                        </SummaryValue>
                    </SummaryContent>
                    <SummaryAction>
                        Kliknij aby rozwinąć
                    </SummaryAction>
                </SummarySection>
            )}
        </ExtensionContainer>
    );
};

// Helper function to create pattern summary
const getPatternSummary = (pattern: RecurrencePatternRequest): string => {
    const { frequency, interval, daysOfWeek, dayOfMonth, endDate, maxOccurrences } = pattern;

    let summary = '';

    switch (frequency) {
        case RecurrenceFrequency.DAILY:
            summary = interval === 1 ? 'Codziennie' : `Co ${interval} dni`;
            break;
        case RecurrenceFrequency.WEEKLY:
            summary = interval === 1 ? 'Tygodniowo' : `Co ${interval} tygodni`;
            if (daysOfWeek && daysOfWeek.length > 0) {
                summary += ` (${daysOfWeek.join(', ')})`;
            }
            break;
        case RecurrenceFrequency.MONTHLY:
            summary = interval === 1 ? 'Miesięcznie' : `Co ${interval} miesięcy`;
            if (dayOfMonth) {
                summary += ` (${dayOfMonth} dzień miesiąca)`;
            }
            break;
        case RecurrenceFrequency.YEARLY:
            summary = interval === 1 ? 'Rocznie' : `Co ${interval} lat`;
            break;
    }

    if (endDate) {
        summary += ` do ${endDate}`;
    } else if (maxOccurrences) {
        summary += ` (${maxOccurrences} razy)`;
    }

    return summary;
};

// Styled Components
const ExtensionContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xl};
    background: ${theme.surfaceElevated};
    border: 2px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    transition: all 0.2s ease;

    &:hover {
        border-color: ${theme.primary}40;
        box-shadow: 0 0 0 4px ${theme.primary}10;
    }
`;

const ToggleSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: ${theme.spacing.lg};
`;

const ToggleContainer = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.lg};
    flex: 1;
`;

const ToggleCheckbox = styled.input`
    width: 20px;
    height: 20px;
    accent-color: ${theme.primary};
    cursor: pointer;
    margin-top: 2px;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ToggleContent = styled.div`
    flex: 1;
`;

const ToggleLabel = styled.label`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    cursor: pointer;
    margin-bottom: ${theme.spacing.sm};

    svg {
        color: ${theme.primary};
        font-size: 14px;
    }
`;

const ToggleDescription = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    line-height: 1.4;
`;

const ExpandToggle = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${theme.surface};
    color: ${theme.text.tertiary};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.surfaceHover};
        color: ${theme.primary};
        border-color: ${theme.primary};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const HelpSection = styled.div`
    display: flex;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
    background: ${theme.primary}08;
    border: 1px solid ${theme.primary}20;
    border-radius: ${theme.radius.md};
`;

const HelpIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${theme.primary}15;
    color: ${theme.primary};
    border-radius: 50%;
    font-size: 16px;
    flex-shrink: 0;
    margin-top: 2px;
`;

const HelpContent = styled.div`
    flex: 1;
`;

const HelpTitle = styled.h4`
    font-size: 15px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.sm} 0;
`;

const HelpText = styled.p`
    font-size: 14px;
    color: ${theme.text.secondary};
    line-height: 1.5;
    margin: 0 0 ${theme.spacing.md} 0;
`;

const HelpList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const HelpItem = styled.li`
    font-size: 13px;
    color: ${theme.text.secondary};
    display: flex;
    align-items: center;
`;

const PatternSection = styled.div`
    border-top: 1px solid ${theme.border};
    padding-top: ${theme.spacing.lg};
`;

const SummarySection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        border-color: ${theme.primary};
    }
`;

const SummaryContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    flex: 1;
`;

const SummaryLabel = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: ${theme.text.tertiary};
`;

const SummaryValue = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const SummaryAction = styled.div`
    font-size: 12px;
    color: ${theme.text.tertiary};
    font-style: italic;
`;

export default VisitFormExtension;