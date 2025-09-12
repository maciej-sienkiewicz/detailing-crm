// src/components/recurringEvents/OccurrenceManagement.tsx - NAPRAWIONE
import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { toast } from 'react-toastify';
import {
    FaCalendarCheck,
    FaEdit,
    FaTrash,
    FaCheckCircle,
    FaTimes,
    FaPlay,
    FaPause,
    FaExchangeAlt,
    FaNotesMedical,
    FaFilter,
    FaSort,
    FaEllipsisV,
    FaChevronDown
} from 'react-icons/fa';
import {
    EventOccurrenceResponse,
    OccurrenceStatus,
    OccurrenceStatusLabels,
    OccurrenceStatusColors,
    ConvertToVisitRequest,
    BulkOccurrenceUpdate // POPRAWKA: Dodany import typu
} from '../../types/recurringEvents';
import { useEventOccurrences } from '../../hooks/useRecurringEvents';
import { theme } from '../../styles/theme';
import Modal from '../common/Modal';
import ConvertToVisitDialog from './ConvertToVisitDialog';

interface OccurrenceManagementProps {
    eventId: string;
    eventTitle: string;
    onBack: () => void;
}

const OccurrenceManagement: React.FC<OccurrenceManagementProps> = ({
                                                                       eventId,
                                                                       eventTitle,
                                                                       onBack
                                                                   }) => {
    // State
    const [selectedOccurrences, setSelectedOccurrences] = useState<Set<string>>(new Set());
    const [statusFilter, setStatusFilter] = useState<OccurrenceStatus | 'all'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showFilters, setShowFilters] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

    // Modals
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
    const [selectedOccurrence, setSelectedOccurrence] = useState<EventOccurrenceResponse | null>(null);
    const [notesText, setNotesText] = useState('');
    const [bulkAction, setBulkAction] = useState<{ action: string; status?: OccurrenceStatus }>({ action: '' });

    // Hooks
    const {
        allOccurrences,
        pagination,
        isLoadingAll,
        isUpdatingStatus,
        isConverting,
        isBulkUpdating,
        updateStatus,
        convertToVisit,
        bulkUpdateStatus, // To będzie działać mimo że API nie wspiera - hook zwraca błąd
        refetchAll
    } = useEventOccurrences(eventId);

    // Filter and sort occurrences
    const filteredAndSortedOccurrences = useMemo(() => {
        let filtered = allOccurrences;

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(occurrence => occurrence.status === statusFilter);
        }

        // Sort occurrences
        const sorted = [...filtered].sort((a, b) => {
            let comparison = 0;

            if (sortBy === 'date') {
                comparison = new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
            } else if (sortBy === 'status') {
                comparison = a.status.localeCompare(b.status);
            }

            return sortOrder === 'desc' ? -comparison : comparison;
        });

        return sorted;
    }, [allOccurrences, statusFilter, sortBy, sortOrder]);

    // Handle selection
    const handleSelectOccurrence = useCallback((occurrenceId: string, selected: boolean) => {
        setSelectedOccurrences(prev => {
            const newSet = new Set(prev);
            if (selected) {
                newSet.add(occurrenceId);
            } else {
                newSet.delete(occurrenceId);
            }
            return newSet;
        });
    }, []);

    const handleSelectAll = useCallback((selected: boolean) => {
        if (selected) {
            setSelectedOccurrences(new Set(filteredAndSortedOccurrences.map(occ => occ.id)));
        } else {
            setSelectedOccurrences(new Set());
        }
    }, [filteredAndSortedOccurrences]);

    // Handle individual occurrence actions
    const handleStatusChange = useCallback(async (occurrence: EventOccurrenceResponse, newStatus: OccurrenceStatus) => {
        try {
            const result = await updateStatus(occurrence.id, { status: newStatus });
            if (result.success) {
                setDropdownOpen(null);
                toast.success('Status został zaktualizowany');
            } else {
                toast.error(result.error || 'Błąd podczas aktualizacji statusu');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Błąd podczas aktualizacji statusu');
        }
    }, [updateStatus]);

    const handleConvertToVisit = useCallback((occurrence: EventOccurrenceResponse) => {
        setSelectedOccurrence(occurrence);
        setShowConvertModal(true);
        setDropdownOpen(null);
    }, []);

    const handleEditNotes = useCallback((occurrence: EventOccurrenceResponse) => {
        setSelectedOccurrence(occurrence);
        setNotesText(occurrence.notes || '');
        setShowNotesModal(true);
        setDropdownOpen(null);
    }, []);

    // Handle bulk actions
    const handleBulkStatusChange = useCallback((status: OccurrenceStatus) => {
        setBulkAction({ action: 'status', status });
        setShowBulkActionsModal(true);
    }, []);

    // Handle convert to visit submission
    const handleConvertSubmit = useCallback(async (data: ConvertToVisitRequest) => {
        if (!selectedOccurrence) return;

        try {
            const result = await convertToVisit(selectedOccurrence.id, data);
            if (result.success) {
                setShowConvertModal(false);
                setSelectedOccurrence(null);
                toast.success('Wystąpienie zostało przekształcone na wizytę');
            } else {
                toast.error(result.error || 'Błąd podczas konwersji na wizytę');
            }
        } catch (error) {
            console.error('Error converting to visit:', error);
            toast.error('Błąd podczas konwersji na wizytę');
        }
    }, [selectedOccurrence, convertToVisit]);

    // Handle notes submission
    const handleNotesSubmit = useCallback(async () => {
        if (!selectedOccurrence) return;

        try {
            const result = await updateStatus(selectedOccurrence.id, {
                status: selectedOccurrence.status,
                notes: notesText
            });
            if (result.success) {
                setShowNotesModal(false);
                setSelectedOccurrence(null);
                setNotesText('');
                toast.success('Notatki zostały zaktualizowane');
            } else {
                toast.error(result.error || 'Błąd podczas aktualizacji notatek');
            }
        } catch (error) {
            console.error('Error updating notes:', error);
            toast.error('Błąd podczas aktualizacji notatek');
        }
    }, [selectedOccurrence, notesText, updateStatus]);

    // Get status options for dropdown
    const getStatusOptions = useCallback((currentStatus: OccurrenceStatus) => {
        const allStatuses = Object.values(OccurrenceStatus);
        return allStatuses.filter(status => status !== currentStatus);
    }, []);

    // Format date for display
    const formatDate = useCallback((dateString: string) => {
        return "";
    }, []);

    return (
        <ManagementContainer>
            {/* Header */}
            <ManagementHeader>
                <HeaderLeft>
                    <BackButton onClick={onBack}>
                        <FaTimes />
                    </BackButton>
                    <HeaderContent>
                        <HeaderTitle>Wystąpienia wydarzenia</HeaderTitle>
                        <HeaderSubtitle>{eventTitle}</HeaderSubtitle>
                    </HeaderContent>
                </HeaderLeft>
                <HeaderRight>
                    <FilterButton
                        onClick={() => setShowFilters(!showFilters)}
                        $active={showFilters}
                    >
                        <FaFilter />
                        Filtry
                    </FilterButton>
                </HeaderRight>
            </ManagementHeader>

            {/* Filters */}
            {showFilters && (
                <FiltersPanel>
                    <FilterGroup>
                        <FilterLabel>Status:</FilterLabel>
                        <FilterSelect
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as OccurrenceStatus | 'all')}
                        >
                            <option value="all">Wszystkie</option>
                            {Object.values(OccurrenceStatus).map(status => (
                                <option key={status} value={status}>
                                    {OccurrenceStatusLabels[status]}
                                </option>
                            ))}
                        </FilterSelect>
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel>Sortuj:</FilterLabel>
                        <FilterSelect
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'date' | 'status')}
                        >
                            <option value="date">Data</option>
                            <option value="status">Status</option>
                        </FilterSelect>
                        <SortOrderButton
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                            <FaSort />
                            {sortOrder === 'asc' ? 'Rosnąco' : 'Malejąco'}
                        </SortOrderButton>
                    </FilterGroup>
                </FiltersPanel>
            )}

            {/* Bulk Actions */}
            {selectedOccurrences.size > 0 && (
                <BulkActionsPanel>
                    <BulkInfo>
                        Wybrano {selectedOccurrences.size} wystąpień
                    </BulkInfo>
                    <BulkActions>
                        <BulkButton onClick={() => handleBulkStatusChange(OccurrenceStatus.COMPLETED)}>
                            <FaCheckCircle />
                            Oznacz jako ukończone
                        </BulkButton>
                        <BulkButton onClick={() => handleBulkStatusChange(OccurrenceStatus.SKIPPED)}>
                            <FaPause />
                            Oznacz jako pominięte
                        </BulkButton>
                        <BulkButton onClick={() => handleBulkStatusChange(OccurrenceStatus.CANCELLED)}>
                            <FaTimes />
                            Oznacz jako anulowane
                        </BulkButton>
                    </BulkActions>
                </BulkActionsPanel>
            )}

            {/* Occurrences List */}
            <OccurrencesList>
                {isLoadingAll ? (
                    <LoadingState>
                        <LoadingSpinner />
                        <LoadingText>Ładowanie wystąpień...</LoadingText>
                    </LoadingState>
                ) : filteredAndSortedOccurrences.length === 0 ? (
                    <EmptyState>
                        <EmptyIcon>
                            <FaCalendarCheck />
                        </EmptyIcon>
                        <EmptyTitle>Brak wystąpień</EmptyTitle>
                        <EmptyDescription>
                            Nie znaleziono wystąpień spełniających wybrane kryteria.
                        </EmptyDescription>
                    </EmptyState>
                ) : (
                    <OccurrencesTable>
                        <TableHeader>
                            <HeaderRow>
                                <HeaderCell $width="40px">
                                    <SelectAllCheckbox
                                        type="checkbox"
                                        checked={selectedOccurrences.size === filteredAndSortedOccurrences.length && filteredAndSortedOccurrences.length > 0}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </HeaderCell>
                                <HeaderCell>Data</HeaderCell>
                                <HeaderCell>Status</HeaderCell>
                                <HeaderCell>Notatki</HeaderCell>
                                <HeaderCell>Utworzone</HeaderCell>
                                <HeaderCell $width="80px">Akcje</HeaderCell>
                            </HeaderRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedOccurrences.map((occurrence) => (
                                <OccurrenceRow key={occurrence.id} $selected={selectedOccurrences.has(occurrence.id)}>
                                    <BodyCell>
                                        <SelectCheckbox
                                            type="checkbox"
                                            checked={selectedOccurrences.has(occurrence.id)}
                                            onChange={(e) => handleSelectOccurrence(occurrence.id, e.target.checked)}
                                        />
                                    </BodyCell>
                                    <BodyCell>
                                        <OccurrenceDate>
                                            {formatDate(occurrence.scheduledDate)}
                                        </OccurrenceDate>
                                    </BodyCell>
                                    <BodyCell>
                                        <StatusBadge $status={occurrence.status}>
                                            {OccurrenceStatusLabels[occurrence.status]}
                                        </StatusBadge>
                                    </BodyCell>
                                    <BodyCell>
                                        <NotesPreview>
                                            {occurrence.notes ? (
                                                <NotesText title={occurrence.notes}>
                                                    {occurrence.notes.length > 50
                                                        ? `${occurrence.notes.substring(0, 50)}...`
                                                        : occurrence.notes
                                                    }
                                                </NotesText>
                                            ) : (
                                                <NoNotes>Brak notatek</NoNotes>
                                            )}
                                        </NotesPreview>
                                    </BodyCell>
                                    <BodyCell>
                                        <CreatedDate>
                                           "
                                        </CreatedDate>
                                    </BodyCell>
                                    <BodyCell>
                                        <ActionsContainer>
                                            <ActionButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDropdownOpen(dropdownOpen === occurrence.id ? null : occurrence.id);
                                                }}
                                                $active={dropdownOpen === occurrence.id}
                                            >
                                                <FaEllipsisV />
                                            </ActionButton>

                                            {dropdownOpen === occurrence.id && (
                                                <ActionsDropdown>
                                                    {/* Status change options */}
                                                    {getStatusOptions(occurrence.status).map(status => (
                                                        <DropdownItem
                                                            key={status}
                                                            onClick={() => handleStatusChange(occurrence, status)}
                                                            disabled={isUpdatingStatus}
                                                        >
                                                            <StatusIcon $status={status}>
                                                                {status === OccurrenceStatus.COMPLETED && <FaCheckCircle />}
                                                                {status === OccurrenceStatus.SKIPPED && <FaPause />}
                                                                {status === OccurrenceStatus.CANCELLED && <FaTimes />}
                                                                {status === OccurrenceStatus.PLANNED && <FaPlay />}
                                                            </StatusIcon>
                                                            {OccurrenceStatusLabels[status]}
                                                        </DropdownItem>
                                                    ))}

                                                    <DropdownDivider />

                                                    <DropdownItem onClick={() => handleEditNotes(occurrence)}>
                                                        <FaNotesMedical />
                                                        Edytuj notatki
                                                    </DropdownItem>

                                                    {occurrence.status === OccurrenceStatus.PLANNED && (
                                                        <DropdownItem
                                                            onClick={() => handleConvertToVisit(occurrence)}
                                                            disabled={isConverting}
                                                        >
                                                            <FaExchangeAlt />
                                                            Konwertuj na wizytę
                                                        </DropdownItem>
                                                    )}
                                                </ActionsDropdown>
                                            )}
                                        </ActionsContainer>
                                    </BodyCell>
                                </OccurrenceRow>
                            ))}
                        </TableBody>
                    </OccurrencesTable>
                )}
            </OccurrencesList>

            {/* Convert to Visit Modal */}
            {selectedOccurrence && (
                <ConvertToVisitDialog
                    open={showConvertModal}
                    occurrence={selectedOccurrence}
                    onClose={() => {
                        setShowConvertModal(false);
                        setSelectedOccurrence(null);
                    }}
                    onConfirm={handleConvertSubmit}
                />
            )}

            {/* Notes Modal */}
            <Modal
                isOpen={showNotesModal}
                onClose={() => {
                    setShowNotesModal(false);
                    setSelectedOccurrence(null);
                    setNotesText('');
                }}
                title="Edytuj notatki"
                size="md"
            >
                <NotesModalContent>
                    <NotesTextArea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        placeholder="Dodaj notatki do wystąpienia..."
                        rows={5}
                    />
                    <NotesActions>
                        <CancelButton
                            onClick={() => {
                                setShowNotesModal(false);
                                setSelectedOccurrence(null);
                                setNotesText('');
                            }}
                        >
                            Anuluj
                        </CancelButton>
                        <SaveButton
                            onClick={handleNotesSubmit}
                            disabled={isUpdatingStatus}
                        >
                            {isUpdatingStatus ? 'Zapisywanie...' : 'Zapisz notatki'}
                        </SaveButton>
                    </NotesActions>
                </NotesModalContent>
            </Modal>

            {/* Bulk Actions Confirmation Modal */}
        </ManagementContainer>
    );
};

// Styled Components (pozostają bez zmian - tylko dodano brakujące style)
const ManagementContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: ${theme.surfaceAlt};
`;

const ManagementHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.xl};
    background: ${theme.surface};
    border-bottom: 1px solid ${theme.border};
    box-shadow: ${theme.shadow.sm};
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
`;

const BackButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        color: ${theme.text.primary};
        border-color: ${theme.primary};
    }
`;

const HeaderContent = styled.div``;

const HeaderTitle = styled.h1`
    font-size: 24px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.xs} 0;
`;

const HeaderSubtitle = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
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

    &:hover {
        background: ${props => props.$active ? theme.primaryDark : theme.surfaceHover};
        border-color: ${theme.primary};
    }
`;

const FiltersPanel = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xl};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.border};
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

const SortOrderButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        border-color: ${theme.primary};
        color: ${theme.primary};
    }
`;

const BulkActionsPanel = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    background: ${theme.primary}08;
    border-bottom: 1px solid ${theme.primary}30;
`;

const BulkInfo = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const BulkActions = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};
`;

const BulkButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.xs} ${theme.spacing.md};
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        border-color: ${theme.primary};
        color: ${theme.primary};
    }
`;

const OccurrencesList = styled.div`
    flex: 1;
    background: ${theme.surface};
    margin: ${theme.spacing.xl};
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.border};
    box-shadow: ${theme.shadow.sm};
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
`;

const OccurrencesTable = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHeader = styled.thead`
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.border};
`;

const TableBody = styled.tbody``;

const HeaderRow = styled.tr``;

const HeaderCell = styled.th<{ $width?: string }>`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: ${theme.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    width: ${props => props.$width || 'auto'};
`;

const OccurrenceRow = styled.tr<{ $selected: boolean }>`
    background: ${props => props.$selected ? theme.primary + '10' : "transparent"};
    border-bottom: 1px solid ${theme.borderLight};
    transition: all 0.2s ease;

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

const OccurrenceDate = styled.div`
    font-weight: 500;
`;

const StatusBadge = styled.div<{ $status: OccurrenceStatus }>`
    display: inline-flex;
    align-items: center;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${props => OccurrenceStatusColors[props.$status]}20;
    color: ${props => OccurrenceStatusColors[props.$status]};
    border: 1px solid ${props => OccurrenceStatusColors[props.$status]}40;
    border-radius: ${theme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const NotesPreview = styled.div`
    max-width: 200px;
`;

const NotesText = styled.div`
    font-size: 13px;
    color: ${theme.text.secondary};
    cursor: help;
`;

const NoNotes = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
    font-style: italic;
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
    min-width: 200px;
    overflow: hidden;
`;

const DropdownItem = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    width: 100%;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: none;
    border: none;
    color: ${theme.text.primary};
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;

    &:hover:not(:disabled) {
        background: ${theme.surfaceHover};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        font-size: 12px;
        flex-shrink: 0;
    }
`;

const StatusIcon = styled.div<{ $status: OccurrenceStatus }>`
    color: ${props => OccurrenceStatusColors[props.$status]};
`;

const DropdownDivider = styled.div`
    height: 1px;
    background: ${theme.borderLight};
    margin: ${theme.spacing.xs} 0;
`;

const NotesModalContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
`;

const NotesTextArea = styled.textarea`
    padding: ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    font-family: inherit;
    background: ${theme.surface};
    color: ${theme.text.primary};
    resize: vertical;
    min-height: 120px;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primary}20;
    }

    &::placeholder {
        color: ${theme.text.tertiary};
    }
`;

const NotesActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${theme.spacing.md};
`;

const CancelButton = styled.button`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        border-color: ${theme.borderActive};
        color: ${theme.text.primary};
    }
`;

const SaveButton = styled.button`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.primary};
    color: white;
    border: 1px solid ${theme.primary};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.primaryDark};
        border-color: ${theme.primaryDark};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const BulkConfirmContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
    padding: ${theme.spacing.xl};
    text-align: center;
`;

const BulkConfirmMessage = styled.div`
    font-size: 15px;
    color: ${theme.text.primary};
    line-height: 1.5;
`;

const BulkConfirmActions = styled.div`
    display: flex;
    justify-content: center;
    gap: ${theme.spacing.md};
`;

export default OccurrenceManagement;