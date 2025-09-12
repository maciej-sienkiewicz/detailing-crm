// src/components/recurringEvents/RecurringEventsList.tsx - REFACTORED WITH DATATABLE
/**
 * Recurring Events List using the common DataTable component
 * Features advanced filtering, sorting, and bulk operations through DataTable
 */

import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { format, isValid, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    FaSearch,
    FaFilter,
    FaEdit,
    FaEye,
    FaTrash,
    FaPause,
    FaPlay,
    FaCalendarAlt,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaEllipsisV,
    FaUsers,
    FaPlus
} from 'react-icons/fa';
import { DataTable } from '../common/DataTable';
import type { TableColumn, HeaderAction, SelectAllConfig } from '../common/DataTable/types';
import {
    RecurringEventListItem,
    RecurringEventsListParams,
    EventType,
    EventTypeLabels,
    RecurrenceFrequencyLabels
} from '../../types/recurringEvents';
import { useRecurringEventsList } from '../../hooks/useRecurringEvents';
import { theme } from '../../styles/theme';

interface RecurringEventsListProps {
    onEdit: (event: RecurringEventListItem) => void;
    onDelete: (eventId: string) => void;
    onDeactivate: (eventId: string) => void;
    onViewOccurrences: (eventId: string) => void;
    onViewDetails: (event: RecurringEventListItem) => void;
    onCreateNew?: () => void;
}

const RecurringEventsList: React.FC<RecurringEventsListProps> = ({
                                                                     onEdit,
                                                                     onDelete,
                                                                     onDeactivate,
                                                                     onViewOccurrences,
                                                                     onViewDetails,
                                                                     onCreateNew
                                                                 }) => {
    // Filter and search state
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'nextOccurrence'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // UI state
    const [showFilters, setShowFilters] = useState(false);
    const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

    // Build query parameters
    const queryParams: RecurringEventsListParams = useMemo(() => ({
        page: currentPage,
        size: pageSize,
        search: searchTerm || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        sortBy,
        sortOrder
    }), [currentPage, pageSize, searchTerm, typeFilter, statusFilter, sortBy, sortOrder]);

    // Fetch events
    const {
        events,
        pagination,
        isLoading,
        error,
        refetch
    } = useRecurringEventsList(queryParams);

    // Safe date formatting helper
    const formatDateSafely = useCallback((dateString: string | undefined, formatString: string = 'dd MMM yyyy'): string => {
        if (!dateString) return 'Brak';

        try {
            let date: Date;

            if (typeof dateString === 'string') {
                if (dateString.includes('T') || dateString.includes('Z')) {
                    date = parseISO(dateString);
                } else {
                    date = new Date(dateString);
                }
            } else {
                date = new Date(dateString);
            }

            if (!isValid(date)) {
                console.warn('Invalid date:', dateString);
                return 'Nieprawidłowa data';
            }

            return format(date, formatString, { locale: pl });
        } catch (error) {
            console.warn('Error formatting date:', dateString, error);
            return 'Błąd daty';
        }
    }, []);

    // Handle filter changes
    const handleTypeFilterChange = useCallback((type: EventType | 'all') => {
        setTypeFilter(type);
        setCurrentPage(0);
    }, []);

    const handleStatusFilterChange = useCallback((status: 'all' | 'active' | 'inactive') => {
        setStatusFilter(status);
        setCurrentPage(0);
    }, []);

    // Handle search
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
        setCurrentPage(0);
    }, []);

    // Handle selection
    const handleSelectEvent = useCallback((eventId: string, selected: boolean) => {
        setSelectedEvents(prev => {
            const newSet = new Set(prev);
            if (selected) {
                newSet.add(eventId);
            } else {
                newSet.delete(eventId);
            }
            return newSet;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        const allSelected = selectedEvents.size === events.length && events.length > 0;
        if (allSelected) {
            setSelectedEvents(new Set());
        } else {
            setSelectedEvents(new Set(events.map(event => event.id)));
        }
    }, [events, selectedEvents]);

    // Clear all filters
    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setTypeFilter('all');
        setStatusFilter('all');
        setSortBy('createdAt');
        setSortOrder('desc');
        setCurrentPage(0);
    }, []);

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return searchTerm !== '' || typeFilter !== 'all' || statusFilter !== 'all';
    }, [searchTerm, typeFilter, statusFilter]);

    // DataTable configuration
    const columns: TableColumn[] = [
        { id: 'title', label: 'Tytuł', width: '250px', sortable: true },
        { id: 'type', label: 'Typ', width: '140px', sortable: true },
        { id: 'frequency', label: 'Częstotliwość', width: '160px', sortable: true },
        { id: 'status', label: 'Status', width: '120px', sortable: true },
        { id: 'nextOccurrence', label: 'Następne', width: '140px', sortable: true },
        { id: 'occurrences', label: 'Wystąpienia', width: '120px', sortable: false },
        { id: 'createdAt', label: 'Utworzone', width: '140px', sortable: true },
        { id: 'actions', label: 'Akcje', width: '120px', sortable: false }
    ];

    // Header actions
    const headerActions: HeaderAction[] = [
        ...(onCreateNew ? [{
            id: 'create',
            label: 'Nowe wydarzenie',
            icon: FaPlus,
            onClick: onCreateNew,
            variant: 'primary' as const
        }] : []),
        {
            id: 'filter',
            label: 'Filtry',
            icon: FaFilter,
            onClick: () => setShowFilters(!showFilters),
            variant: 'filter' as const,
            active: showFilters || hasActiveFilters,
            badge: hasActiveFilters
        }
    ];

    // Select all configuration
    const selectAllConfig: SelectAllConfig = {
        selectedCount: selectedEvents.size,
        totalCount: events.length,
        selectAll: selectedEvents.size === events.length && events.length > 0,
        onToggleSelectAll: handleSelectAll,
        label: `Zaznacz wszystkie (${events.length})`
    };

    // Render cell content
    const renderCell = useCallback((event: RecurringEventListItem, columnId: string) => {
        switch (columnId) {
            case 'title':
                return (
                    <EventTitleContainer>
                        <EventTitle
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails(event);
                            }}
                        >
                            {event.title}
                        </EventTitle>
                        <EventSelection>
                            <input
                                type="checkbox"
                                checked={selectedEvents.has(event.id)}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    handleSelectEvent(event.id, e.target.checked);
                                }}
                            />
                        </EventSelection>
                    </EventTitleContainer>
                );

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
                return (
                    <NextOccurrence>
                        {formatDateSafely(event.nextOccurrence)}
                    </NextOccurrence>
                );

            case 'occurrences':
                return (
                    <OccurrenceStats>
                        <CompletedCount>{event.completedOccurrences}</CompletedCount>
                        <StatsSeparator>/</StatsSeparator>
                        <TotalCount>{event.totalOccurrences}</TotalCount>
                    </OccurrenceStats>
                );

            case 'createdAt':
                return (
                    <CreatedDate>
                        {formatDateSafely(event.createdAt)}
                    </CreatedDate>
                );

            case 'actions':
                return (
                    <ActionsMenu
                        event={event}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onDeactivate={onDeactivate}
                        onViewOccurrences={onViewOccurrences}
                        onViewDetails={onViewDetails}
                    />
                );

            default:
                return null;
        }
    }, [selectedEvents, formatDateSafely, onEdit, onDelete, onDeactivate, onViewOccurrences, onViewDetails, handleSelectEvent]);

    // Render card view (optional)
    const renderCard = useCallback((event: RecurringEventListItem) => (
        <EventCard
            key={event.id}
            $selected={selectedEvents.has(event.id)}
            onClick={() => onViewDetails(event)}
        >
            <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardCheckbox>
                    <input
                        type="checkbox"
                        checked={selectedEvents.has(event.id)}
                        onChange={(e) => {
                            e.stopPropagation();
                            handleSelectEvent(event.id, e.target.checked);
                        }}
                    />
                </CardCheckbox>
            </CardHeader>
            <CardContent>
                <CardRow>
                    <CardLabel>Typ:</CardLabel>
                    <EventTypeChip $type={event.type}>
                        {EventTypeLabels[event.type]}
                    </EventTypeChip>
                </CardRow>
                <CardRow>
                    <CardLabel>Częstotliwość:</CardLabel>
                    <span>{RecurrenceFrequencyLabels[event.frequency]}</span>
                </CardRow>
                <CardRow>
                    <CardLabel>Status:</CardLabel>
                    {event.isActive ? (
                        <StatusIndicator $status="active">
                            <FaCheckCircle />
                            <span>Aktywne</span>
                        </StatusIndicator>
                    ) : (
                        <StatusIndicator $status="inactive">
                            <FaTimesCircle />
                            <span>Nieaktywne</span>
                        </StatusIndicator>
                    )}
                </CardRow>
                <CardRow>
                    <CardLabel>Następne wystąpienie:</CardLabel>
                    <span>{formatDateSafely(event.nextOccurrence)}</span>
                </CardRow>
                <CardRow>
                    <CardLabel>Wystąpienia:</CardLabel>
                    <OccurrenceStats>
                        <CompletedCount>{event.completedOccurrences}</CompletedCount>
                        <StatsSeparator>/</StatsSeparator>
                        <TotalCount>{event.totalOccurrences}</TotalCount>
                    </OccurrenceStats>
                </CardRow>
            </CardContent>
            <CardActions>
                <ActionsMenu
                    event={event}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDeactivate={onDeactivate}
                    onViewOccurrences={onViewOccurrences}
                    onViewDetails={onViewDetails}
                />
            </CardActions>
        </EventCard>
    ), [selectedEvents, formatDateSafely, onEdit, onDelete, onDeactivate, onViewOccurrences, onViewDetails, handleSelectEvent]);

    // Filters panel content
    const filtersContent = (
        <FiltersPanel>
            <FilterSection>
                <FilterGroup>
                    <FilterLabel>Szukaj:</FilterLabel>
                    <SearchInput
                        type="text"
                        placeholder="Szukaj wydarzeń..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel>Typ wydarzenia:</FilterLabel>
                    <FilterSelect
                        value={typeFilter}
                        onChange={(e) => handleTypeFilterChange(e.target.value as EventType | 'all')}
                    >
                        <option value="all">Wszystkie typy</option>
                        {Object.values(EventType).map(type => (
                            <option key={type} value={type}>
                                {EventTypeLabels[type]}
                            </option>
                        ))}
                    </FilterSelect>
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel>Status:</FilterLabel>
                    <FilterSelect
                        value={statusFilter}
                        onChange={(e) => handleStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
                    >
                        <option value="all">Wszystkie</option>
                        <option value="active">Aktywne</option>
                        <option value="inactive">Nieaktywne</option>
                    </FilterSelect>
                </FilterGroup>

                <FilterActions>
                    <ClearFiltersButton onClick={clearFilters} disabled={!hasActiveFilters}>
                        Wyczyść filtry
                    </ClearFiltersButton>
                </FilterActions>
            </FilterSection>
        </FiltersPanel>
    );

    // Loading state
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
                        ? 'Nie znaleziono wydarzeń spełniających kryteria wyszukiwania.'
                        : 'Nie masz jeszcze żadnych cyklicznych wydarzeń. Utwórz pierwsze, aby rozpocząć.',
                    actionText: hasActiveFilters ? 'Spróbuj zmienić kryteria wyszukiwania' : 'Kliknij "Nowe wydarzenie" aby rozpocząć'
                }}
                onItemClick={onViewDetails}
                renderCell={renderCell}
                renderCard={renderCard}
                enableDragAndDrop={true}
                enableViewToggle={true}
                defaultViewMode="table"
                headerActions={headerActions}
                selectAllConfig={selectAllConfig}
                expandableContent={filtersContent}
                expandableVisible={showFilters}
                storageKeys={{
                    viewMode: 'recurring_events_view_mode',
                    columnOrder: 'recurring_events_columns_order'
                }}
            />

            {/* Custom pagination can be added here if needed */}
            {pagination && pagination.totalPages > 1 && (
                <PaginationContainer>
                    <PaginationInfo>
                        Strona {currentPage + 1} z {pagination.totalPages} •
                        Wyniki {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, pagination.totalItems)} z {pagination.totalItems}
                    </PaginationInfo>
                    <PaginationControls>
                        <PaginationButton
                            onClick={() => setCurrentPage(0)}
                            disabled={currentPage === 0}
                        >
                            Pierwsza
                        </PaginationButton>
                        <PaginationButton
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 0}
                        >
                            Poprzednia
                        </PaginationButton>
                        <PaginationButton
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage >= pagination.totalPages - 1}
                        >
                            Następna
                        </PaginationButton>
                        <PaginationButton
                            onClick={() => setCurrentPage(pagination.totalPages - 1)}
                            disabled={currentPage >= pagination.totalPages - 1}
                        >
                            Ostatnia
                        </PaginationButton>
                    </PaginationControls>
                </PaginationContainer>
            )}
        </Container>
    );
};

// Actions Menu Component
interface ActionsMenuProps {
    event: RecurringEventListItem;
    onEdit: (event: RecurringEventListItem) => void;
    onDelete: (eventId: string) => void;
    onDeactivate: (eventId: string) => void;
    onViewOccurrences: (eventId: string) => void;
    onViewDetails: (event: RecurringEventListItem) => void;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({
                                                     event,
                                                     onEdit,
                                                     onDelete,
                                                     onDeactivate,
                                                     onViewOccurrences,
                                                     onViewDetails
                                                 }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = (action: () => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        action();
        setIsOpen(false);
    };

    return (
        <ActionsContainer>
            <ActionButton
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
            >
                <FaEllipsisV />
            </ActionButton>

            {isOpen && (
                <>
                    <ActionsBackdrop onClick={() => setIsOpen(false)} />
                    <ActionsDropdown>
                        <DropdownItem onClick={handleAction(() => onViewDetails(event))}>
                            <FaEye />
                            Szczegóły
                        </DropdownItem>
                        <DropdownItem onClick={handleAction(() => onEdit(event))}>
                            <FaEdit />
                            Edytuj
                        </DropdownItem>
                        <DropdownItem onClick={handleAction(() => onViewOccurrences(event.id))}>
                            <FaUsers />
                            Wystąpienia
                        </DropdownItem>
                        <DropdownDivider />
                        <DropdownItem
                            onClick={handleAction(() => onDeactivate(event.id))}
                            $danger={event.isActive}
                        >
                            {event.isActive ? <FaPause /> : <FaPlay />}
                            {event.isActive ? 'Dezaktywuj' : 'Aktywuj'}
                        </DropdownItem>
                        <DropdownItem
                            onClick={handleAction(() => onDelete(event.id))}
                            $danger
                        >
                            <FaTrash />
                            Usuń
                        </DropdownItem>
                    </ActionsDropdown>
                </>
            )}
        </ActionsContainer>
    );
};

// Styled Components
const Container = styled.div`
    width: 100%;
`;

const LoadingContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxxl};
    font-size: 16px;
    color: ${theme.text.secondary};
`;

// Event Title with selection
const EventTitleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    width: 100%;
`;

const EventTitle = styled.button`
    background: none;
    border: none;
    color: ${theme.primary};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    text-align: left;
    padding: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.2s ease;

    &:hover {
        color: ${theme.primaryDark};
        text-decoration: underline;
    }
`;

const EventSelection = styled.div`
    flex-shrink: 0;

    input {
        width: 16px;
        height: 16px;
        accent-color: ${theme.primary};
        cursor: pointer;
    }
`;

const EventTypeChip = styled.span<{ $type: EventType }>`
    display: inline-flex;
    align-items: center;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${props => props.$type === EventType.SIMPLE_EVENT ? theme.primary + '20' : theme.success + '20'};
    color: ${props => props.$type === EventType.SIMPLE_EVENT ? theme.primary : theme.success};
    border: 1px solid ${props => props.$type === EventType.SIMPLE_EVENT ? theme.primary + '40' : theme.success + '40'};
    border-radius: ${theme.radius.sm};
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
`;

const FrequencyInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: 13px;
    color: ${theme.text.secondary};

    svg {
        font-size: 12px;
        color: ${theme.text.tertiary};
    }
`;

const StatusIndicator = styled.div<{ $status: 'active' | 'inactive' }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: 13px;
    font-weight: 500;
    color: ${props => props.$status === 'active' ? theme.success : theme.text.tertiary};

    svg {
        font-size: 12px;
    }
`;

const NextOccurrence = styled.div`
    font-size: 13px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const OccurrenceStats = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

const CompletedCount = styled.span`
    font-weight: 600;
    color: ${theme.success};
`;

const StatsSeparator = styled.span`
    color: ${theme.text.tertiary};
    font-size: 12px;
`;

const TotalCount = styled.span`
    font-weight: 500;
    color: ${theme.text.secondary};
`;

const CreatedDate = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
`;

// Actions Menu
const ActionsContainer = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: transparent;
    color: ${theme.text.tertiary};
    border: none;
    border-radius: ${theme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        color: ${theme.text.secondary};
    }
`;

const ActionsBackdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
`;

const ActionsDropdown = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: ${theme.spacing.xs};
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    box-shadow: ${theme.shadow.lg};
    z-index: 10;
    min-width: 150px;
    overflow: hidden;
`;

const DropdownItem = styled.button<{ $danger?: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    width: 100%;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: none;
    border: none;
    color: ${props => props.$danger ? theme.error : theme.text.primary};
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;

    &:hover {
        background: ${props => props.$danger ? theme.errorBg : theme.surfaceHover};
    }

    svg {
        font-size: 12px;
        flex-shrink: 0;
    }
`;

const DropdownDivider = styled.div`
    height: 1px;
    background: ${theme.borderLight};
    margin: ${theme.spacing.xs} 0;
`;

// Card View
const EventCard = styled.div<{ $selected: boolean }>`
    background: ${theme.surface};
    border: 2px solid ${props => props.$selected ? theme.primary : theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadow.lg};
        border-color: ${theme.primary};
    }
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.md};
`;

const CardTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
    flex: 1;
`;

const CardCheckbox = styled.div`
    input {
        width: 16px;
        height: 16px;
        accent-color: ${theme.primary};
        cursor: pointer;
    }
`;

const CardContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.md};
`;

const CardRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CardLabel = styled.span`
    font-size: 13px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const CardActions = styled.div`
    display: flex;
    justify-content: flex-end;
    padding-top: ${theme.spacing.md};
    border-top: 1px solid ${theme.borderLight};
`;

// Filters Panel
const FiltersPanel = styled.div`
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
`;

const FilterSection = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.lg};
    align-items: end;
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    min-width: 150px;
`;

const FilterLabel = styled.label`
    font-size: 13px;
    font-weight: 500;
    color: ${theme.text.secondary};
`;

const SearchInput = styled.input`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    min-width: 250px;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primary}20;
    }
`;

const FilterSelect = styled.select`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
    }
`;

const FilterActions = styled.div`
    display: flex;
    align-items: end;
`;

const ClearFiltersButton = styled.button`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    height: fit-content;

    &:hover:not(:disabled) {
        background: ${theme.surfaceHover};
        color: ${theme.text.primary};
        border-color: ${theme.borderActive};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// Pagination
const PaginationContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
    border-top: 1px solid ${theme.border};
    margin-top: ${theme.spacing.sm};
    border-radius: 0 0 ${theme.radius.lg} ${theme.radius.lg};
`;

const PaginationInfo = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
    font-weight: 500;
`;

const PaginationControls = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};
`;

const PaginationButton = styled.button`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.surfaceHover};
        border-color: ${theme.primary};
        color: ${theme.primary};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

export default RecurringEventsList;