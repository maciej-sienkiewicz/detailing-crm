import React, { useState, useMemo, useCallback } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { FaFilter, FaCalendarAlt } from 'react-icons/fa';

import { DataTable } from '../common/DataTable';
import type { TableColumn, HeaderAction, SelectAllConfig } from '../common/DataTable/types';
import {
    RecurringEventListItem,
    RecurringEventsListParams,
    EventType,
} from '../../types/recurringEvents';
import { useRecurringEventsList } from '../../hooks/useRecurringEvents';
import { RecurringEventCellRenderer } from './RecurringEventCellRenderer';
import {
    Container,
    LoadingContainer,
    FiltersPanel,
} from './styled';


interface RecurringEventsListProps {
    onEdit: (event: RecurringEventListItem) => void;
    onDelete: (eventId: string) => void;
    onDeactivate: (eventId: string) => void;
    onViewOccurrences: (eventId: string) => void;
    onViewDetails: (event: RecurringEventListItem) => void;
}

const columns: TableColumn[] = [
    { id: 'selection', label: '', width: '4%', sortable: false },
    { id: 'title', label: 'Tytuł', width: '20%', sortable: true },
    { id: 'type', label: 'Typ', width: '11%', sortable: true },
    { id: 'frequency', label: 'Częstotliwość', width: '12%', sortable: true },
    { id: 'status', label: 'Status', width: '10%', sortable: true },
    { id: 'nextOccurrence', label: 'Następne', width: '11%', sortable: true },
    { id: 'occurrences', label: 'Wystąpienia', width: '9%', sortable: false },
    { id: 'createdAt', label: 'Utworzone', width: '11%', sortable: true },
    { id: 'actions', label: 'Akcje', width: '12%', sortable: false }
];

const RecurringEventsList: React.FC<RecurringEventsListProps> = ({
                                                                     onEdit,
                                                                     onDelete,
                                                                     onDeactivate,
                                                                     onViewOccurrences,
                                                                     onViewDetails,
                                                                 }) => {
    // ... all existing state management hooks (useState, useMemo) remain unchanged ...
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'nextOccurrence'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

    const queryParams: RecurringEventsListParams = useMemo(() => ({
        page: currentPage,
        size: pageSize,
        search: searchTerm || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        sortBy,
        sortOrder
    }), [currentPage, pageSize, searchTerm, typeFilter, statusFilter, sortBy, sortOrder]);

    const {
        events,
        pagination,
        isLoading,
        error,
        refetch
    } = useRecurringEventsList(queryParams);


    const formatDateSafely = useCallback((dateInput: string | number[] | undefined): string => {
        if (!dateInput) return '–';

        let date: Date;

        if (Array.isArray(dateInput) && dateInput.length >= 6) {
            date = new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3], dateInput[4], dateInput[5]);
        } else if (typeof dateInput === 'string') {
            date = parseISO(dateInput);
        } else {
            return 'Błędny format';
        }

        return isValid(date) ? format(date, 'dd MMM yyyy', { locale: pl }) : 'Błąd daty';
    }, []);


    const handleSelectEvent = useCallback((eventId: string) => {
        setSelectedEvents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(eventId)) {
                newSet.delete(eventId);
            } else {
                newSet.add(eventId);
            }
            return newSet;
        });
    }, []);

    const handleToggleSelectAll = useCallback(() => {
        const allSelected = selectedEvents.size === events.length && events.length > 0;
        if (allSelected) {
            setSelectedEvents(new Set());
        } else {
            setSelectedEvents(new Set(events.map(event => event.id)));
        }
    }, [events, selectedEvents]);

    // ... other handlers (handleSearchChange, clearFilters, etc.) remain unchanged ...

    const hasActiveFilters = useMemo(() => {
        return searchTerm !== '' || typeFilter !== 'all' || statusFilter !== 'all';
    }, [searchTerm, typeFilter, statusFilter]);


    const headerActions: HeaderAction[] = [
        {
            id: 'filter',
            label: 'Filtry',
            icon: FaFilter,
            onClick: () => setShowFilters(!showFilters),
            variant: 'filter' as const,
            active: showFilters,
            badge: hasActiveFilters,
        }
    ];

    const selectAllConfig: SelectAllConfig = {
        selectedCount: selectedEvents.size,
        totalCount: events.length,
        selectAll: selectedEvents.size === events.length && events.length > 0,
        onToggleSelectAll: handleToggleSelectAll,
    };

    const renderCell = useCallback((event: any, columnId: string) => (
        <RecurringEventCellRenderer
            event={{ ...event, createdAt: event.created_at }} // Mapowanie snake_case na camelCase
            columnId={columnId}
            isSelected={selectedEvents.has(event.id)}
            onToggleSelection={handleSelectEvent}
            onViewDetails={onViewDetails}
            onEdit={onEdit}
            onDeactivate={onDeactivate}
            onViewOccurrences={onViewOccurrences}
            onDelete={onDelete}
            formatDate={formatDateSafely}
        />
    ), [selectedEvents, handleSelectEvent, onViewDetails, onEdit, onDeactivate, onViewOccurrences, onDelete, formatDateSafely]);

    // const renderCard = useCallback((event: RecurringEventListItem) => (
    //     <RecurringEventCard event={event} ... />
    // ), [/* dependencies */]);

    const filtersContent = (
        <FiltersPanel>
            {/* JSX for filters remains unchanged */}
        </FiltersPanel>
    );

    if (isLoading && events.length === 0) {
        return <LoadingContainer>Ładowanie wydarzeń...</LoadingContainer>;
    }

    return (
        <Container>
            <DataTable
                data={events}
                columns={columns}
                title="Cykliczne Wydarzenia"
                emptyStateConfig={{
                    icon: FaCalendarAlt,
                    title: 'Brak cyklicznych wydarzeń',
                    description: hasActiveFilters
                        ? 'Nie znaleziono wydarzeń spełniających kryteria.'
                        : 'Nie masz jeszcze żadnych cyklicznych wydarzeń.',
                    actionText: hasActiveFilters ? 'Wyczyść filtry' : 'Utwórz nowe wydarzenie'
                }}
                storageKeys={{
                    viewMode: 'recurring_events_view_mode',
                    columnOrder: 'recurring_events_columns_order'
                }}
                onItemClick={onViewDetails}
                renderCell={renderCell}
                // renderCard={renderCard} // Enable this when RecurringEventCard is created
                enableDragAndDrop={true}
                enableViewToggle={true}
                headerActions={headerActions}
                selectAllConfig={events.length > 0 ? selectAllConfig : undefined}
                expandableContent={filtersContent}
                expandableVisible={showFilters}
            />

            {/* Pagination remains unchanged */}
        </Container>
    );
};

export default RecurringEventsList;