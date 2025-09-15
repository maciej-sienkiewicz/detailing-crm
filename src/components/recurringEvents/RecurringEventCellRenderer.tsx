// src/components/recurringEvents/RecurringEventCellRenderer.tsx - FIXED OCCURRENCES COLUMN
import React from 'react';
import {
    FaEdit,
    FaEye,
    FaTrash,
    FaPause,
    FaPlay,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaUsers,
    FaCheckSquare,
    FaSquare,
    FaCalendarDay,
    FaExclamationCircle,
    FaSpinner,
} from 'react-icons/fa';
import {
    RecurringEventListItem,
    EventTypeLabels,
    RecurrenceFrequencyLabels,
} from '../../types/recurringEvents';
import {
    ActionButtons,
    ActionButton,
    TooltipWrapper,
} from '../common/DataTable/components';
import {
    EventTitle,
    EventTypeChip,
    FrequencyInfo,
    StatusIndicator,
    NextOccurrence,
    OccurrenceStats,
    CompletedCount,
    StatsSeparator,
    TotalCount,
    CreatedDate,
    SelectionCheckbox,
    EmptyValue,
} from './styled';

interface RecurringEventCellRendererProps {
    event: RecurringEventListItem;
    columnId: string;
    isSelected: boolean;
    onToggleSelection: (eventId: string) => void;
    onViewDetails: (event: RecurringEventListItem) => void;
    onEdit: (event: RecurringEventListItem) => void;
    onDeactivate: (eventId: string) => void;
    onViewOccurrences: (eventId: string) => void;
    onDelete: (eventId: string) => void;
    formatDate: (dateString?: string) => string;
}

export const RecurringEventCellRenderer: React.FC<RecurringEventCellRendererProps> = ({
                                                                                          event,
                                                                                          columnId,
                                                                                          isSelected,
                                                                                          onToggleSelection,
                                                                                          onViewDetails,
                                                                                          onEdit,
                                                                                          onDeactivate,
                                                                                          onViewOccurrences,
                                                                                          onDelete,
                                                                                          formatDate,
                                                                                      }) => {
    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    // Debug logging for troubleshooting
    console.log(`🔍 RecurringEventCellRenderer - ${columnId}:`, {
        eventId: event.id,
        columnValue: event[columnId as keyof RecurringEventListItem],
        frequency: event.frequency,
        nextOccurrence: event.nextOccurrence,
        totalOccurrences: event.totalOccurrences,
        completedOccurrences: event.completedOccurrences
    });

    switch (columnId) {
        case 'selection':
            return (
                <SelectionCheckbox
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelection(event.id);
                    }}
                    $selected={isSelected}
                >
                    {isSelected ? <FaCheckSquare /> : <FaSquare />}
                </SelectionCheckbox>
            );

        case 'title':
            return (
                <EventTitle title={event.title}>
                    {event.title || 'Bez nazwy'}
                </EventTitle>
            );

        case 'type':
            return (
                <EventTypeChip $type={event.type}>
                    {EventTypeLabels[event.type] || event.type}
                </EventTypeChip>
            );

        case 'frequency':
            const frequencyLabel = event.frequency ? RecurrenceFrequencyLabels[event.frequency] : null;

            if (!frequencyLabel) {
                console.warn(`Missing or invalid frequency for event ${event.id}:`, event.frequency);
                return (
                    <EmptyValue>
                        <FaExclamationCircle />
                        <span>Brak danych</span>
                    </EmptyValue>
                );
            }

            return (
                <FrequencyInfo>
                    <FaClock />
                    <span>{frequencyLabel}</span>
                </FrequencyInfo>
            );

        case 'status':
            return event.isActive ? (
                <StatusIndicator $status="active">
                    <FaCheckCircle />
                    <span>Aktywne</span>
                </StatusIndicator>
            ) : (
                <StatusIndicator $status="inactive">
                    <FaTimesCircle />
                    <span>Nieaktywne</span>
                </StatusIndicator>
            );

        case 'nextOccurrence':
            if (!event.isActive) {
                return (
                    <EmptyValue>
                        <FaTimesCircle />
                        <span>Nieaktywne</span>
                    </EmptyValue>
                );
            }

            if (event.nextOccurrence) {
                const formattedDate = formatDate(event.nextOccurrence);
                if (formattedDate && formattedDate !== 'Błąd daty' && formattedDate !== '–') {
                    return (
                        <NextOccurrence>
                            <FaCalendarDay />
                            <span>{formattedDate}</span>
                        </NextOccurrence>
                    );
                }
            }

            return (
                <EmptyValue>
                    <FaExclamationCircle />
                    <span>Obliczanie...</span>
                </EmptyValue>
            );

        case 'occurrences':
            // GŁÓWNA NAPRAWKA: Lepsze wyświetlanie statystyk wystąpień
            const total = event.totalOccurrences ?? 0;
            const completed = event.completedOccurrences ?? 0;

            console.log(`📊 Occurrences for event ${event.id}:`, { total, completed });

            // POPRAWKA 1: Jeśli wydarzenie nie jest aktywne, pokaż status
            if (!event.isActive) {
                return (
                    <EmptyValue>
                        <FaTimesCircle />
                        <span>Nieaktywne</span>
                    </EmptyValue>
                );
            }

            // POPRAWKA 2: Pokaż statystyki nawet jeśli są zero (to mogą być prawidłowe dane)
            // Wydarzenie może mieć 0 wystąpień jeśli jest nowo utworzone lub ma datę startu w przyszłości
            return (
                <OccurrenceStats>
                    <CompletedCount>{completed}</CompletedCount>
                    <StatsSeparator>/</StatsSeparator>
                    <TotalCount>{total}</TotalCount>
                </OccurrenceStats>
            );

        case 'createdAt':
            const createdDate = formatDate(event.createdAt);
            return (
                <CreatedDate>
                    {createdDate && createdDate !== 'Błąd daty' ? createdDate : 'Brak daty'}
                </CreatedDate>
            );

        case 'actions':
            return (
                <ActionButtons>
                    <TooltipWrapper title="Edytuj">
                        <ActionButton
                            $variant="secondary"
                            onClick={(e) => handleActionClick(e, () => onEdit(event))}
                        >
                            <FaEdit />
                        </ActionButton>
                    </TooltipWrapper>
                    <TooltipWrapper title="Zobacz wystąpienia">
                        <ActionButton
                            $variant="secondary"
                            onClick={(e) => handleActionClick(e, () => onViewOccurrences(event.id))}
                        >
                            <FaUsers />
                        </ActionButton>
                    </TooltipWrapper>
                    <TooltipWrapper title={event.isActive ? 'Dezaktywuj' : 'Aktywuj'}>
                        <ActionButton
                            $variant={event.isActive ? 'secondary' : 'success'}
                            onClick={(e) => handleActionClick(e, () => onDeactivate(event.id))}
                        >
                            {event.isActive ? <FaPause /> : <FaPlay />}
                        </ActionButton>
                    </TooltipWrapper>
                    <TooltipWrapper title="Usuń">
                        <ActionButton
                            $variant="delete"
                            onClick={(e) => handleActionClick(e, () => onDelete(event.id))}
                        >
                            <FaTrash />
                        </ActionButton>
                    </TooltipWrapper>
                </ActionButtons>
            );

        default:
            console.warn(`Unknown column ID: ${columnId} for event:`, event.id);
            return (
                <EmptyValue>
                    <FaExclamationCircle />
                    <span>Nieznana kolumna</span>
                </EmptyValue>
            );
    }
};