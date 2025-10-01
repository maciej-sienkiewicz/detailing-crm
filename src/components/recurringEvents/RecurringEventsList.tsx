import React, { useState, useMemo, useCallback } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { FaFilter, FaCalendarAlt, FaTimes, FaSearch } from 'react-icons/fa';

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
    FilterRow,
    FilterGroup,
    FilterLabel,
    FilterInput,
    FilterSelect,
    FilterActions,
    ClearFiltersButton,
    ApplyFiltersButton,
    FiltersBadge,
} from './styled';

interface RecurringEventsListProps {
    onEdit: (event: RecurringEventListItem) => void;
    onDelete: (eventId: string) => void;
    onDeactivate: (eventId: string) => void;
    onViewOccurrences: (eventId: string) => void;
    onViewDetails: (event: RecurringEventListItem) => void;
}

const columns: TableColumn[] = [
    { id: 'selection', label: '', width: '2%', sortable: false },
    { id: 'title', label: 'Tytuł', width: '22%', sortable: true },
    { id: 'type', label: 'Typ', width: '12%', sortable: true },
    { id: 'frequency', label: 'Częstotliwość', width: '14%', sortable: true },
    { id: 'status', label: 'Status', width: '9%', sortable: true },
    { id: 'nextOccurrence', label: 'Następne wystąpienie', width: '14%', sortable: true },
    { id: 'occurrences', label: 'Wystąpienia', width: '9%', sortable: false },
    { id: 'createdAt', label: 'Utworzone', width: '9%', sortable: true },
    { id: 'actions', label: 'Akcje', width: '16%', sortable: false }
];

const RecurringEventsList: React.FC<RecurringEventsListProps> = ({
                                                                     onEdit,
                                                                     onDelete,
                                                                     onDeactivate,
                                                                     onViewOccurrences,
                                                                     onViewDetails,
                                                                 }) => {
    // State management
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'nextOccurrence'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

    // Prepare query parameters
    const queryParams: RecurringEventsListParams = useMemo(() => ({
        page: currentPage,
        size: pageSize,
        search: searchTerm || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        sortBy,
        sortOrder
    }), [currentPage, pageSize, searchTerm, typeFilter, statusFilter, sortBy, sortOrder]);

    // Fetch data
    const {
        events,
        pagination,
        isLoading,
        error,
        refetch
    } = useRecurringEventsList(queryParams);

    // FIXED: Safe date formatting function
    const formatDateSafely = useCallback((dateInput: string | number[] | undefined): string => {
        if (!dateInput) return '–';

        try {
            let date: Date;

            if (Array.isArray(dateInput) && dateInput.length >= 6) {
                // Handle LocalDateTime array format from server
                const [year, month, day, hour, minute, second] = dateInput;
                date = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
            } else if (typeof dateInput === 'string') {
                // Handle ISO string format
                date = parseISO(dateInput);
            } else {
                console.warn('Unknown date format:', dateInput);
                return 'Błędny format';
            }

            if (!isValid(date)) {
                console.warn('Invalid date created:', dateInput);
                return 'Błąd daty';
            }

            return format(date, 'dd MMM yyyy', { locale: pl });
        } catch (error) {
            console.error('Error formatting date:', dateInput, error);
            return 'Błąd daty';
        }
    }, []);

    // Selection handlers
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

    // Filter handlers
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0); // Reset to first page when searching
    }, []);

    const handleTypeFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setTypeFilter(e.target.value as EventType | 'all');
        setCurrentPage(0);
    }, []);

    const handleStatusFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
        setCurrentPage(0);
    }, []);

    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setTypeFilter('all');
        setStatusFilter('all');
        setCurrentPage(0);
    }, []);

    const hasActiveFilters = useMemo(() => {
        return searchTerm !== '' || typeFilter !== 'all' || statusFilter !== 'all';
    }, [searchTerm, typeFilter, statusFilter]);

    // Header actions
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

    // Select all configuration
    const selectAllConfig: SelectAllConfig = {
        selectedCount: selectedEvents.size,
        totalCount: events.length,
        selectAll: selectedEvents.size === events.length && events.length > 0,
        onToggleSelectAll: handleToggleSelectAll,
    };

    // FIXED: Cell renderer with proper error handling
    const renderCell = useCallback((event: RecurringEventListItem, columnId: string) => {
        try {
            return (
                <RecurringEventCellRenderer
                    event={event}
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
            );
        } catch (error) {
            console.error('Error rendering cell:', { event, columnId, error });
            return <span>Błąd renderowania</span>;
        }
    }, [
        selectedEvents,
        handleSelectEvent,
        onViewDetails,
        onEdit,
        onDeactivate,
        onViewOccurrences,
        onDelete,
        formatDateSafely
    ]);

    // Filters panel content
    const filtersContent = (
        <FiltersPanel>
            <FilterRow>
                <FilterGroup>
                    <FilterLabel>Wyszukaj</FilterLabel>
                    <FilterInput
                        type="text"
                        placeholder="Szukaj po nazwie..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel>Typ wydarzenia</FilterLabel>
                    <FilterSelect value={typeFilter} onChange={handleTypeFilterChange}>
                        <option value="all">Wszystkie typy</option>
                        <option value={EventType.SIMPLE_EVENT}>Wydarzenie</option>
                        <option value={EventType.RECURRING_VISIT}>Wizyta</option>
                    </FilterSelect>
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel>Status</FilterLabel>
                    <FilterSelect value={statusFilter} onChange={handleStatusFilterChange}>
                        <option value="all">Wszystkie statusy</option>
                        <option value="active">Aktywne</option>
                        <option value="inactive">Nieaktywne</option>
                    </FilterSelect>
                </FilterGroup>
            </FilterRow>

            {hasActiveFilters && (
                <FilterActions>
                    <ClearFiltersButton onClick={clearFilters}>
                        <FaTimes />
                        Wyczyść filtry
                    </ClearFiltersButton>
                </FilterActions>
            )}
        </FiltersPanel>
    );

    // Loading state
    if (isLoading && events.length === 0) {
        return <LoadingContainer>Ładowanie wydarzeń...</LoadingContainer>;
    }

    // Debug logging

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
                        ? 'Nie znaleziono wydarzeń spełniających kryteria filtrów.'
                        : 'Nie masz jeszcze żadnych cyklicznych wydarzeń.',
                    actionText: hasActiveFilters ? 'Wyczyść filtry aby zobaczyć wszystkie wydarzenia' : 'Utwórz nowe wydarzenie aby rozpocząć'
                }}
                storageKeys={{
                    viewMode: 'recurring_events_view_mode',
                    columnOrder: 'recurring_events_columns_order'
                }}
                onItemClick={onViewDetails}
                renderCell={renderCell}
                enableDragAndDrop={true}
                enableViewToggle={false} // Disable cards view for now
                headerActions={headerActions}
                selectAllConfig={events.length > 0 ? selectAllConfig : undefined}
                expandableContent={filtersContent}
                expandableVisible={showFilters}
            />
        </Container>
    );
};

export default RecurringEventsList;