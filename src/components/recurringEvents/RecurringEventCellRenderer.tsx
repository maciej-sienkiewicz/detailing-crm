// src/components/recurringEvents/RecurringEventCellRenderer.tsx - FINAL FIXED VERSION
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
            // POPRAWKA 1: Sprawdź czy frequency istnieje i wyświetl prawidłową wartość
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
            // POPRAWKA 2: Lepsze wyświetlanie następnego wystąpienia
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

            // Jeśli nie ma danych o następnym wystąpieniu
            return (
                <EmptyValue>
                    <FaExclamationCircle />
                    <span>Obliczanie...</span>
                </EmptyValue>
            );

        case 'occurrences':
            // POPRAWKA 3: Lepsze wyświetlanie statystyk wystąpień
            const total = event.totalOccurrences ?? 0;
            const completed = event.completedOccurrences ?? 0;

            // Jeśli mamy rzeczywiste dane (nie same zera)
            if (total > 0 || completed > 0) {
                return (
                    <OccurrenceStats>
                        <CompletedCount>{completed}</CompletedCount>
                        <StatsSeparator>/</StatsSeparator>
                        <TotalCount>{total}</TotalCount>
                    </OccurrenceStats>
                );
            }

            // Jeśli nie ma wystąpień lub są ładowane
            return (
                <EmptyValue>
                    <FaClock />
                    <span>Ładowanie...</span>
                </EmptyValue>
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
                    <TooltipWrapper title="Zobacz szczegóły">
                        <ActionButton
                            $variant="view"
                            onClick={(e) => handleActionClick(e, () => onViewDetails(event))}
                        >
                            <FaEye />
                        </ActionButton>
                    </TooltipWrapper>
                    <TooltipWrapper title="Edytuj">
                        <ActionButton
                            $variant="edit"
                            onClick={(e) => handleActionClick(e, () => onEdit(event))}
                        >
                            <FaEdit />
                        </ActionButton>
                    </TooltipWrapper>
                    <TooltipWrapper title="Zobacz wystąpienia">
                        <ActionButton
                            $variant="info"
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