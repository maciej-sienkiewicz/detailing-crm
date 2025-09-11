// src/components/recurringEvents/RecurringEventsList.tsx
/**
 * Comprehensive Recurring Events List Component
 * Features advanced filtering, sorting, and bulk operations
 */

import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    FaSearch,
    FaFilter,
    FaSort,
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
    FaChevronDown
} from 'react-icons/fa';
import {
    RecurringEventListItem,
    RecurringEventsListParams,
    EventType,
    EventTypeLabels,
    RecurrenceFrequencyLabels
} from '../../types/recurringEvents';
import { useRecurringEventsList } from '../../hooks/useRecurringEvents';
import { theme } from '../../styles/theme';
import { Tooltip } from '../common/Tooltip';

interface RecurringEventsListProps {
    onEdit: (event: RecurringEventListItem) => void;
    onDelete: (eventId: string) => void;
    onDeactivate: (eventId: string) => void;
    onViewOccurrences: (eventId: string) => void;
    onViewDetails: (event: RecurringEventListItem) => void;
}

const RecurringEventsList: React.FC<RecurringEventsListProps> = ({
                                                                     onEdit,
                                                                     onDelete,
                                                                     onDeactivate,
                                                                     onViewOccurrences,
                                                                     onViewDetails
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
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

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

    // Handle search
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
        setCurrentPage(0); // Reset to first page
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

    // Handle sorting
    const handleSort = useCallback((field: typeof sortBy) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
        setCurrentPage(0);
    }, [sortBy, sortOrder]);

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

    const handleSelectAll = useCallback((selected: boolean) => {
        if (selected) {
            setSelectedEvents(new Set(events.map(event => event.id)));
        } else {
            setSelectedEvents(new Set());
        }
    }, [events]);

    // Handle dropdown
    const handleDropdownToggle = useCallback((eventId: string) => {
        setDropdownOpen(prev => prev === eventId ? null : eventId);
    }, []);

    // Close dropdown when clicking outside
    const handleCloseDropdown = useCallback(() => {
        setDropdownOpen(null);
    }, []);

    // Format next occurrence date
    const formatNextOccurrence = useCallback((dateString?: string) => {
        if (!dateString) return 'Brak';

        try {
            return format(new Date(dateString), 'dd MMM yyyy', { locale: pl });
        } catch {
            return 'Nieprawidłowa data';
        }
    }, []);

    // Get status indicator
    const getStatusIndicator = useCallback((isActive: boolean) => {
        return isActive ? (
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
    }, []);

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

    return (
        <ListContainer onClick={handleCloseDropdown}>
            {/* Header with Search and Filters */}
            <ListHeader>
                <HeaderLeft>
                    <SearchContainer>
                        <SearchIcon>
                            <FaSearch />
                        </SearchIcon>
                        <SearchInput
                            type="text"
                            placeholder="Szukaj wydarzeń..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </SearchContainer>

                    <FilterButton
                        onClick={() => setShowFilters(!showFilters)}
                        $active={showFilters || hasActiveFilters}
                    >
                        <FaFilter />
                        Filtry
                        {hasActiveFilters && <FilterBadge />}
                    </FilterButton>
                </HeaderLeft>

                <HeaderRight>
                    <ResultsInfo>
                        {pagination ? (
                            <>
                                Wyniki {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, pagination.totalItems)} z {pagination.totalItems}
                            </>
                        ) : (
                            'Ładowanie...'
                        )}
                    </ResultsInfo>
                </HeaderRight>
            </ListHeader>

            {/* Filters Panel */}
            {showFilters && (
                <FiltersPanel>
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
                </FiltersPanel>
            )}

            {/* Events Table */}
            <TableContainer>
                {isLoading ? (
                    <LoadingState>
                        <LoadingSpinner />
                        <LoadingText>Ładowanie wydarzeń...</LoadingText>
                    </LoadingState>
                ) : error ? (
                    <ErrorState>
                        <ErrorIcon>⚠️</ErrorIcon>
                        <ErrorText>{error}</ErrorText>
                        <RetryButton onClick={() => refetch()}>
                            Spróbuj ponownie
                        </RetryButton>
                    </ErrorState>
                ) : events.length === 0 ? (
                    <EmptyState>
                        <EmptyIcon>
                            <FaCalendarAlt />
                        </EmptyIcon>
                        <EmptyTitle>Brak cyklicznych wydarzeń</EmptyTitle>
                        <EmptyDescription>
                            {hasActiveFilters
                                ? 'Nie znaleziono wydarzeń spełniających kryteria wyszukiwania.'
                                : 'Nie masz jeszcze żadnych cyklicznych wydarzeń. Utwórz pierwsze, aby rozpocząć.'
                            }
                        </EmptyDescription>
                        {hasActiveFilters && (
                            <ClearFiltersButton onClick={clearFilters}>
                                Wyczyść filtry
                            </ClearFiltersButton>
                        )}
                    </EmptyState>
                ) : (
                    <EventsTable>
                        <TableHeader>
                            <HeaderRow>
                                <HeaderCell $width="40px">
                                    <SelectAllCheckbox
                                        type="checkbox"
                                        checked={selectedEvents.size === events.length && events.length > 0}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </HeaderCell>
                                <HeaderCell $sortable onClick={() => handleSort('title')}>
                                    <SortableHeader>
                                        Tytuł
                                        <SortIcon $active={sortBy === 'title'}>
                                            <FaSort />
                                        </SortIcon>
                                    </SortableHeader>
                                </HeaderCell>
                                <HeaderCell $width="140px">
                                    Typ
                                </HeaderCell>
                                <HeaderCell $width="160px">
                                    Częstotliwość
                                </HeaderCell>
                                <HeaderCell $width="120px">
                                    Status
                                </HeaderCell>
                                <HeaderCell $width="140px" $sortable onClick={() => handleSort('nextOccurrence')}>
                                    <SortableHeader>
                                        Następne
                                        <SortIcon $active={sortBy === 'nextOccurrence'}>
                                            <FaSort />
                                        </SortIcon>
                                    </SortableHeader>
                                </HeaderCell>
                                <HeaderCell $width="120px">
                                    Wystąpienia
                                </HeaderCell>
                                <HeaderCell $width="140px" $sortable onClick={() => handleSort('createdAt')}>
                                    <SortableHeader>
                                        Utworzone
                                        <SortIcon $active={sortBy === 'createdAt'}>
                                            <FaSort />
                                        </SortIcon>
                                    </SortableHeader>
                                </HeaderCell>
                                <HeaderCell $width="80px">
                                    Akcje
                                </HeaderCell>
                            </HeaderRow>
                        </TableHeader>

                        <TableBody>
                            {events.map((event) => (
                                <EventRow
                                    key={event.id}
                                    $selected={selectedEvents.has(event.id)}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <BodyCell>
                                        <SelectCheckbox
                                            type="checkbox"
                                            checked={selectedEvents.has(event.id)}
                                            onChange={(e) => handleSelectEvent(event.id, e.target.checked)}
                                        />
                                    </BodyCell>
                                    <BodyCell>
                                        <EventTitle
                                            onClick={() => onViewDetails(event)}
                                            title={event.title}
                                        >
                                            {event.title}
                                        </EventTitle>
                                    </BodyCell>
                                    <BodyCell>
                                        <EventTypeChip $type={event.type}>
                                            {EventTypeLabels[event.type]}
                                        </EventTypeChip>
                                    </BodyCell>
                                    <BodyCell>
                                        <FrequencyInfo>
                                            <FaClock />
                                            <span>{RecurrenceFrequencyLabels[event.frequency]}</span>
                                        </FrequencyInfo>
                                    </BodyCell>
                                    <BodyCell>
                                        {getStatusIndicator(event.isActive)}
                                    </BodyCell>
                                    <BodyCell>
                                        <NextOccurrence>
                                            {formatNextOccurrence(event.nextOccurrence)}
                                        </NextOccurrence>
                                    </BodyCell>
                                    <BodyCell>
                                        <OccurrenceStats>
                                            <Tooltip
                                                text={`${event.completedOccurrences} ukończone z ${event.totalOccurrences} łącznych`}
                                                position="top"
                                            >
                                                <StatsContainer>
                                                    <CompletedCount>{event.completedOccurrences}</CompletedCount>
                                                    <StatsSeparator>/</StatsSeparator>
                                                    <TotalCount>{event.totalOccurrences}</TotalCount>
                                                </StatsContainer>
                                            </Tooltip>
                                        </OccurrenceStats>
                                    </BodyCell>
                                    <BodyCell>
                                        <CreatedDate>
                                            {format(new Date(event.createdAt), 'dd MMM yyyy', { locale: pl })}
                                        </CreatedDate>
                                    </BodyCell>
                                    <BodyCell>
                                        <ActionsContainer>
                                            <ActionButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDropdownToggle(event.id);
                                                }}
                                                $active={dropdownOpen === event.id}
                                            >
                                                <FaEllipsisV />
                                            </ActionButton>

                                            {dropdownOpen === event.id && (
                                                <ActionsDropdown onClick={(e) => e.stopPropagation()}>
                                                    <DropdownItem onClick={() => onViewDetails(event)}>
                                                        <FaEye />
                                                        Szczegóły
                                                    </DropdownItem>
                                                    <DropdownItem onClick={() => onEdit(event)}>
                                                        <FaEdit />
                                                        Edytuj
                                                    </DropdownItem>
                                                    <DropdownItem onClick={() => onViewOccurrences(event.id)}>
                                                        <FaCalendarAlt />
                                                        Wystąpienia
                                                    </DropdownItem>
                                                    <DropdownDivider />
                                                    <DropdownItem
                                                        onClick={() => onDeactivate(event.id)}
                                                        $danger={event.isActive}
                                                    >
                                                        {event.isActive ? <FaPause /> : <FaPlay />}
                                                        {event.isActive ? 'Dezaktywuj' : 'Aktywuj'}
                                                    </DropdownItem>
                                                    <DropdownItem onClick={() => onDelete(event.id)} $danger>
                                                        <FaTrash />
                                                        Usuń
                                                    </DropdownItem>
                                                </ActionsDropdown>
                                            )}
                                        </ActionsContainer>
                                    </BodyCell>
                                </EventRow>
                            ))}
                        </TableBody>
                    </EventsTable>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <PaginationContainer>
                        <PaginationInfo>
                            Strona {currentPage + 1} z {pagination.totalPages}
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

                        <PageSizeSelector>
                            <PageSizeLabel>Pokaż:</PageSizeLabel>
                            <PageSizeSelect
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(parseInt(e.target.value));
                                    setCurrentPage(0);
                                }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </PageSizeSelect>
                        </PageSizeSelector>
                    </PaginationContainer>
                )}
            </TableContainer>
        </ListContainer>
    );
};

// Styled Components
const ListContainer = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
    box-shadow: ${theme.shadow.sm};
`;

const ListHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.border};
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
`;

const SearchContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: ${theme.spacing.md};
    color: ${theme.text.tertiary};
    font-size: 14px;
    pointer-events: none;
`;

const SearchInput = styled.input`
    padding: ${theme.spacing.sm} ${theme.spacing.md} ${theme.spacing.sm} 40px;
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    width: 300px;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primary}20;
    }

    &::placeholder {
        color: ${theme.text.tertiary};
    }
`;

const FilterButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${props => props.$active ? theme.primary : theme.surface};
    color: ${props => props.$active ? 'white' : theme.text.secondary};
    border: 1px solid ${props => props.$active ? theme.primary : theme.border};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
        background: ${props => props.$active ? theme.primaryDark : theme.surfaceHover};
        border-color: ${theme.primary};
    }
`;

const FilterBadge = styled.div`
    position: absolute;
    top: -4px;
    right: -4px;
    width: 8px;
    height: 8px;
    background: ${theme.error};
    border-radius: 50%;
    border: 2px solid ${theme.surface};
`;

const ResultsInfo = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
    font-weight: 500;
`;

const FiltersPanel = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xl};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    background: ${theme.surfaceAlt};
    border-bottom: 1px solid ${theme.border};
    flex-wrap: wrap;
`;

const FilterGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
`;

const FilterLabel = styled.label`
    font-size: 13px;
    font-weight: 500;
    color: ${theme.text.secondary};
    white-space: nowrap;
`;

const FilterSelect = styled.select`
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 13px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
    }
`;

const FilterActions = styled.div`
    margin-left: auto;
`;

const ClearFiltersButton = styled.button`
    padding: ${theme.spacing.xs} ${theme.spacing.md};
    background: transparent;
    color: ${theme.text.tertiary};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.surfaceHover};
        color: ${theme.text.secondary};
        border-color: ${theme.borderActive};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const TableContainer = styled.div`
    overflow: hidden;
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxxl};
    gap: ${theme.spacing.lg};
`;

const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 3px solid ${theme.borderLight};
    border-top: 3px solid ${theme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${theme.text.tertiary};
    font-weight: 500;
`;

const ErrorState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxxl};
    gap: ${theme.spacing.lg};
`;

const ErrorIcon = styled.div`
    font-size: 48px;
`;

const ErrorText = styled.div`
    font-size: 16px;
    color: ${theme.error};
    text-align: center;
`;

const RetryButton = styled.button`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.primary};
    color: white;
    border: none;
    border-radius: ${theme.radius.md};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.primaryDark};
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxxl};
    gap: ${theme.spacing.lg};
    text-align: center;
`;

const EmptyIcon = styled.div`
    font-size: 64px;
    color: ${theme.text.tertiary};
`;

const EmptyTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

const EmptyDescription = styled.p`
    font-size: 15px;
    color: ${theme.text.secondary};
    margin: 0;
    line-height: 1.5;
    max-width: 400px;
`;

const EventsTable = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHeader = styled.thead`
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.border};
`;

const TableBody = styled.tbody``;

const HeaderRow = styled.tr``;

const HeaderCell = styled.th<{ $width?: string; $sortable?: boolean }>`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: ${theme.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    width: ${props => props.$width || 'auto'};
    cursor: ${props => props.$sortable ? 'pointer' : 'default'};
    user-select: none;
    white-space: nowrap;

    &:hover {
        color: ${props => props.$sortable ? theme.primary : theme.text.secondary};
    }
`;

const SortableHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

const SortIcon = styled.div<{ $active: boolean }>`
    color: ${props => props.$active ? theme.primary : theme.text.tertiary};
    font-size: 10px;
    transition: color 0.2s ease;
`;

const EventRow = styled.tr<{ $selected: boolean }>`
    background: ${props => props.$selected ? theme.primary : 'transparent'};
    border-bottom: 1px solid ${theme.borderLight};
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$selected ? theme.primary : theme.surfaceHover};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const BodyCell = styled.td`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    vertical-align: middle;
    font-size: 14px;
    color: ${theme.text.primary};
`;

const SelectAllCheckbox = styled.input`
    width: 16px;
    height: 16px;
    accent-color: ${theme.primary};
    cursor: pointer;
`;

const SelectCheckbox = styled.input`
    width: 16px;
    height: 16px;
    accent-color: ${theme.primary};
    cursor: pointer;
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
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.2s ease;

    &:hover {
        color: ${theme.primaryDark};
        text-decoration: underline;
    }
`;

const EventTypeChip = styled.span<{ $type: EventType }>`
    display: inline-flex;
    align-items: center;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${props => props.$type === EventType.SIMPLE_EVENT ? theme.primary : theme.success};
    color: ${props => props.$type === EventType.SIMPLE_EVENT ? theme.primary : theme.success};
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
    justify-content: center;
`;

const StatsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    cursor: pointer;
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

const ActionsContainer = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
`;

const ActionButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${props => props.$active ? theme.surfaceActive : 'transparent'};
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

const PaginationContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    background: ${theme.surfaceElevated};
    border-top: 1px solid ${theme.border};
    flex-wrap: wrap;
    gap: ${theme.spacing.md};
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

const PageSizeSelector = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
`;

const PageSizeLabel = styled.span`
    font-size: 13px;
    color: ${theme.text.tertiary};
    font-weight: 500;
`;

const PageSizeSelect = styled.select`
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 13px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
    }
`;

export default RecurringEventsList;