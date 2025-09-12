// src/components/recurringEvents/RecurringEventCellRenderer.tsx
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
} from './styled'; // We will create this styled components file next

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
            return <EventTitle>{event.title}</EventTitle>;

        case 'type':
            return (
                <EventTypeChip $type={event.type}>
                    {EventTypeLabels[event.type]}
                </EventTypeChip>
            );

        case 'frequency':
            return (
                <FrequencyInfo>
                    <FaClock />
                    <span>{RecurrenceFrequencyLabels[event.frequency]}</span>
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
            return <NextOccurrence>{formatDate(event.nextOccurrence)}</NextOccurrence>;

        case 'occurrences':
            return (
                <OccurrenceStats>
                    <CompletedCount>{event.completedOccurrences}</CompletedCount>
                    <StatsSeparator>/</StatsSeparator>
                    <TotalCount>{event.totalOccurrences}</TotalCount>
                </OccurrenceStats>
            );

        case 'createdAt':
            return <CreatedDate>{formatDate(event.createdAt)}</CreatedDate>;

        case 'actions':
            return (
                <ActionButtons>
                    <TooltipWrapper title="Szczegóły">
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
                    <TooltipWrapper title="Wystąpienia">
                        <ActionButton
                            $variant="info"
                            onClick={(e) => handleActionClick(e, () => onViewOccurrences(event.id))}
                        >
                            <FaUsers />
                        </ActionButton>
                    </TooltipWrapper>
                    <TooltipWrapper title={event.isActive ? 'Dezaktywuj' : 'Aktywuj'}>
                        <ActionButton
                            $variant="secondary"
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
            return null;
    }
};