// src/components/recurringEvents/OccurrenceManagement.tsx - POPRAWIONE UX
import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { toast } from 'react-toastify';
import {
    FaCalendarCheck,
    FaEdit,
    FaCheckCircle,
    FaTimes,
    FaPause,
    FaExchangeAlt,
    FaFilter,
    FaArrowLeft,
    FaChevronDown
} from 'react-icons/fa';
import { DataTable } from '../common/DataTable';
import { PageHeader } from '../common/PageHeader';
import type { TableColumn, HeaderAction, SelectAllConfig } from '../common/DataTable/types';
import {
    EventOccurrenceResponse,
    OccurrenceStatus,
    OccurrenceStatusLabels,
    OccurrenceStatusColors,
    ConvertToVisitRequest
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

// Funkcja do konwersji daty z formatu serwera
const parseServerDate = (dateArray: number[] | string): Date => {
    if (typeof dateArray === 'string') {
        return new Date(dateArray);
    }

    if (Array.isArray(dateArray) && dateArray.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0, nanosecond = 0] = dateArray;
        return new Date(year, month - 1, day, hour, minute, second, Math.floor(nanosecond / 1000000));
    }

    return new Date(dateArray as any);
};

// Funkcja bezpiecznego formatowania dat
const formatDateSafely = (dateValue: number[] | string | undefined, formatString: string = 'dd-MM-yyyy HH:mm'): string => {
    if (!dateValue) return '-';

    try {
        const date = parseServerDate(dateValue);

        if (isNaN(date.getTime())) {
            return 'Nieprawidłowa data';
        }

        return format(date, formatString, { locale: pl });
    } catch (error) {
        return 'Błąd daty';
    }
};

const OccurrenceManagement: React.FC<OccurrenceManagementProps> = ({
                                                                       eventId,
                                                                       eventTitle,
                                                                       onBack
                                                                   }) => {
    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OccurrenceStatus | 'all'>('all');
    const [selectedOccurrenceIds, setSelectedOccurrenceIds] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Modals
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedOccurrence, setSelectedOccurrence] = useState<EventOccurrenceResponse | null>(null);
    const [notesText, setNotesText] = useState('');

    // Hooks
    const {
        allOccurrences,
        isLoadingAll,
        isUpdatingStatus,
        isConverting,
        updateStatus,
        convertToVisit,
        refetchAll
    } = useEventOccurrences(eventId);

    // Przetwarzanie danych z serwera
    const processedOccurrences = useMemo(() => {
        return allOccurrences.map(occurrence => ({
            ...occurrence,
            scheduledDate: typeof occurrence.scheduledDate === 'string'
                ? occurrence.scheduledDate
                : parseServerDate(occurrence.scheduledDate as any).toISOString(),
            createdAt: typeof occurrence.createdAt === 'string'
                ? occurrence.createdAt
                : parseServerDate(occurrence.createdAt as any).toISOString(),
            updatedAt: typeof occurrence.updatedAt === 'string'
                ? occurrence.updatedAt
                : parseServerDate(occurrence.updatedAt as any).toISOString(),
            completedAt: occurrence.completedAt
                ? (typeof occurrence.completedAt === 'string'
                    ? occurrence.completedAt
                    : parseServerDate(occurrence.completedAt as any).toISOString())
                : undefined
        }));
    }, [allOccurrences]);

    // Filtrowanie danych
    const filteredOccurrences = useMemo(() => {
        let filtered = processedOccurrences;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(occurrence => occurrence.status === statusFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(occurrence =>
                occurrence.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                occurrence.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [processedOccurrences, statusFilter, searchTerm]);

    // Obsługa zaznaczenia
    const handleToggleSelection = useCallback((occurrenceId: string) => {
        setSelectedOccurrenceIds(prev =>
            prev.includes(occurrenceId)
                ? prev.filter(id => id !== occurrenceId)
                : [...prev, occurrenceId]
        );
    }, []);

    const handleToggleSelectAll = useCallback(() => {
        const allSelected = selectedOccurrenceIds.length === filteredOccurrences.length && filteredOccurrences.length > 0;
        if (allSelected) {
            setSelectedOccurrenceIds([]);
        } else {
            setSelectedOccurrenceIds(filteredOccurrences.map(occ => occ.id));
        }
    }, [filteredOccurrences, selectedOccurrenceIds]);

    // Akcje na wystąpieniach
    const handleStatusChange = useCallback(async (occurrence: EventOccurrenceResponse, newStatus: OccurrenceStatus) => {
        try {
            const result = await updateStatus(occurrence.id, { status: newStatus });
            if (result.success) {
                toast.success('Status został zaktualizowany');
            } else {
                toast.error(result.error || 'Błąd podczas aktualizacji statusu');
            }
        } catch (error) {
            toast.error('Błąd podczas aktualizacji statusu');
        }
    }, [updateStatus]);

    const handleEditNotes = useCallback((occurrence: EventOccurrenceResponse) => {
        setSelectedOccurrence(occurrence);
        setNotesText(occurrence.notes || '');
        setShowNotesModal(true);
    }, []);

    const handleChangeStatus = useCallback((occurrence: EventOccurrenceResponse) => {
        setSelectedOccurrence(occurrence);
        setShowStatusModal(true);
    }, []);

    const handleConvertToVisit = useCallback((occurrence: EventOccurrenceResponse) => {
        setSelectedOccurrence(occurrence);
        setShowConvertModal(true);
    }, []);

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
            toast.error('Błąd podczas konwersji na wizytę');
        }
    }, [selectedOccurrence, convertToVisit]);

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
            toast.error('Błąd podczas aktualizacji notatek');
        }
    }, [selectedOccurrence, notesText, updateStatus]);

    // Bulk operations
    const handleBulkStatusChange = useCallback(async (newStatus: OccurrenceStatus) => {
        let successCount = 0;

        for (const id of selectedOccurrenceIds) {
            try {
                const result = await updateStatus(id, { status: newStatus });
                if (result.success) {
                    successCount++;
                }
            } catch (error) {
                console.error(`Error updating occurrence ${id}:`, error);
            }
        }

        setSelectedOccurrenceIds([]);
        toast.success(`Zaktualizowano status ${successCount} z ${selectedOccurrenceIds.length} wystąpień`);
    }, [selectedOccurrenceIds, updateStatus]);

    // Konfiguracja DataTable
    const columns: TableColumn[] = [
        { id: 'selection', label: '', width: '50px', sortable: false },
        { id: 'scheduledDate', label: 'Data wystąpienia', width: '15%', sortable: true },
        { id: 'status', label: 'Status', width: '12%', sortable: true },
        { id: 'notes', label: 'Notatki', width: '30%', sortable: false },
        { id: 'completedAt', label: 'Ukończono', width: '15%', sortable: true },
        { id: 'createdAt', label: 'Utworzono', width: '13%', sortable: true },
        { id: 'actions', label: 'Akcje', width: '15%', sortable: false }
    ];

    const headerActions: HeaderAction[] = [
        {
            id: 'filter',
            label: 'Filtry',
            icon: FaFilter,
            onClick: () => setShowFilters(!showFilters),
            variant: 'filter',
            active: showFilters,
            badge: statusFilter !== 'all' || searchTerm !== ''
        }
    ];

    // POPRAWKA 3: Bulk actions po lewej stronie od "Zaznacz wszystkie"
    const bulkActionsConfig = selectedOccurrenceIds.length > 0 ? [
        {
            id: 'bulk-complete',
            label: 'Ukończ',
            icon: FaCheckCircle,
            onClick: () => handleBulkStatusChange(OccurrenceStatus.COMPLETED),
            variant: 'secondary' as const
        },
        {
            id: 'bulk-skip',
            label: 'Pomiń',
            icon: FaPause,
            onClick: () => handleBulkStatusChange(OccurrenceStatus.SKIPPED),
            variant: 'secondary' as const
        },
        {
            id: 'bulk-cancel',
            label: 'Anuluj',
            icon: FaTimes,
            onClick: () => handleBulkStatusChange(OccurrenceStatus.CANCELLED),
            variant: 'secondary' as const
        }
    ] : [];

    const selectAllConfig: SelectAllConfig = {
        selectedCount: selectedOccurrenceIds.length,
        totalCount: filteredOccurrences.length,
        selectAll: selectedOccurrenceIds.length === filteredOccurrences.length && filteredOccurrences.length > 0,
        onToggleSelectAll: handleToggleSelectAll,
        label: `Zaznacz wszystkie (${filteredOccurrences.length})`,
        bulkActions: bulkActionsConfig // POPRAWKA 3: Dodajemy bulk actions do selectAllConfig
    };

    // Renderowanie komórek
    const renderCell = useCallback((occurrence: EventOccurrenceResponse, columnId: string) => {
        switch (columnId) {
            case 'selection':
                return (
                    <SelectionCell>
                        <SelectionCheckbox
                            type="checkbox"
                            checked={selectedOccurrenceIds.includes(occurrence.id)}
                            onChange={() => handleToggleSelection(occurrence.id)}
                        />
                    </SelectionCell>
                );

            case 'scheduledDate':
                return (
                    <DateCell>
                        {formatDateSafely(occurrence.scheduledDate, 'dd-MM-yyyy HH:mm')}
                    </DateCell>
                );

            case 'status':
                return (
                    <StatusBadge $status={occurrence.status}>
                        {OccurrenceStatusLabels[occurrence.status]}
                    </StatusBadge>
                );

            case 'notes':
                return (
                    <NotesCell>
                        {occurrence.notes ? (
                            <NotesText title={occurrence.notes}>
                                {occurrence.notes}
                            </NotesText>
                        ) : (
                            <NoNotes>-</NoNotes>
                        )}
                    </NotesCell>
                );

            case 'completedAt':
                return (
                    <DateCell>
                        {formatDateSafely(occurrence.completedAt, 'dd-MM-yyyy HH:mm')}
                    </DateCell>
                );

            case 'createdAt':
                return (
                    <DateCell>
                        {formatDateSafely(occurrence.createdAt, 'dd-MM-yyyy HH:mm')}
                    </DateCell>
                );

            case 'actions':
                return (
                    <ActionsCell>
                        <ActionButton
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditNotes(occurrence);
                            }}
                            title="Edytuj notatki"
                        >
                            <FaEdit />
                        </ActionButton>

                        <StatusDropdown>
                            <StatusDropdownButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleChangeStatus(occurrence);
                                }}
                                title="Zmień status"
                            >
                                <FaCheckCircle />
                                <FaChevronDown />
                            </StatusDropdownButton>
                        </StatusDropdown>

                        {/* Specjalna akcja dla konwersji na wizytę */}
                        {occurrence.status === OccurrenceStatus.PLANNED && (
                            <ActionButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleConvertToVisit(occurrence);
                                }}
                                title="Konwertuj na wizytę"
                                $special
                            >
                                <FaExchangeAlt />
                            </ActionButton>
                        )}
                    </ActionsCell>
                );

            default:
                return null;
        }
    }, [selectedOccurrenceIds, handleToggleSelection, handleEditNotes, handleChangeStatus, handleConvertToVisit]);

    // Panel filtrów - POPRAWKA 3: Usunięto bulk actions (przeniesione do selectAllConfig)
    const filtersContent = (
        <FiltersPanel>
            <FiltersRow>
                <FilterGroup>
                    <FilterLabel>Wyszukaj:</FilterLabel>
                    <SearchInput
                        type="text"
                        placeholder="Szukaj w notatkach..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </FilterGroup>

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
                    <ClearButton
                        onClick={() => {
                            setStatusFilter('all');
                            setSearchTerm('');
                        }}
                        disabled={statusFilter === 'all' && searchTerm === ''}
                    >
                        Wyczyść filtry
                    </ClearButton>
                </FilterGroup>
            </FiltersRow>
        </FiltersPanel>
    );

    return (
        <Container>
            {/* Główny nagłówek strony */}
            <PageHeader
                icon={FaCalendarCheck}
                title="Wystąpienia wydarzenia"
                subtitle={eventTitle}
                actions={
                    <BackButton onClick={onBack}>
                        <FaArrowLeft />
                        Powrót
                    </BackButton>
                }
            />

            {/* Tabela z danymi */}
            <TableContainer>
                <DataTable
                    data={filteredOccurrences}
                    columns={columns}
                    title="Zaplanowane wydarzenia"
                    emptyStateConfig={{
                        icon: FaCalendarCheck,
                        title: 'Brak wystąpień',
                        description: statusFilter !== 'all' || searchTerm
                            ? 'Nie znaleziono wystąpień spełniających kryteria.'
                            : 'To wydarzenie nie ma jeszcze żadnych wystąpień.',
                        actionText: statusFilter !== 'all' || searchTerm
                            ? 'Spróbuj zmienić kryteria filtrowania'
                            : 'Wystąpienia zostaną wygenerowane automatycznie'
                    }}
                    onItemClick={() => {}}
                    renderCell={renderCell}
                    enableDragAndDrop={true}
                    enableViewToggle={false}
                    defaultViewMode="table"
                    headerActions={headerActions}
                    selectAllConfig={filteredOccurrences.length > 0 ? selectAllConfig : undefined}
                    expandableContent={filtersContent}
                    expandableVisible={showFilters}
                    storageKeys={{
                        viewMode: 'occurrence_management_view',
                        columnOrder: 'occurrence_management_columns'
                    }}
                />
            </TableContainer>

            {/* Modals */}
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
                        rows={4}
                    />
                    <NotesActions>
                        <CancelModalButton
                            onClick={() => {
                                setShowNotesModal(false);
                                setSelectedOccurrence(null);
                                setNotesText('');
                            }}
                        >
                            Anuluj
                        </CancelModalButton>
                        <SaveButton
                            onClick={handleNotesSubmit}
                            disabled={isUpdatingStatus}
                        >
                            {isUpdatingStatus ? 'Zapisywanie...' : 'Zapisz'}
                        </SaveButton>
                    </NotesActions>
                </NotesModalContent>
            </Modal>

            {/* Status Change Modal */}
            <Modal
                isOpen={showStatusModal}
                onClose={() => {
                    setShowStatusModal(false);
                    setSelectedOccurrence(null);
                }}
                title="Zmień status wystąpienia"
                size="sm"
            >
                <StatusModalContent>
                    <StatusOptions>
                        {Object.values(OccurrenceStatus)
                            .filter(status => status !== selectedOccurrence?.status)
                            .map(status => (
                                <StatusOption
                                    key={status}
                                    onClick={() => {
                                        if (selectedOccurrence) {
                                            handleStatusChange(selectedOccurrence, status);
                                            setShowStatusModal(false);
                                            setSelectedOccurrence(null);
                                        }
                                    }}
                                    disabled={isUpdatingStatus}
                                >
                                    <StatusIcon $status={status}>
                                        {status === OccurrenceStatus.COMPLETED && <FaCheckCircle />}
                                        {status === OccurrenceStatus.SKIPPED && <FaPause />}
                                        {status === OccurrenceStatus.CANCELLED && <FaTimes />}
                                        {status === OccurrenceStatus.PLANNED && <FaCheckCircle />}
                                        {status === OccurrenceStatus.CONVERTED_TO_VISIT && <FaExchangeAlt />}
                                    </StatusIcon>
                                    <StatusLabel>{OccurrenceStatusLabels[status]}</StatusLabel>
                                </StatusOption>
                            ))}
                    </StatusOptions>
                </StatusModalContent>
            </Modal>
        </Container>
    );
};

// Styled Components
const Container = styled.div`
    min-height: 100vh;
    background: ${theme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const BackButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: ${theme.surfaceHover};
        color: ${theme.text.primary};
        border-color: ${theme.primary};
    }

    svg {
        font-size: 14px;
    }
`;

const TableContainer = styled.div`
    flex: 1;
    padding: 0 ${theme.spacing.xl} ${theme.spacing.xl};
`;

// POPRAWKA 1: Widoczne komórki zaznaczenia
const SelectionCell = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.sm};
`;

const SelectionCheckbox = styled.input`
    width: 16px;
    height: 16px;
    accent-color: ${theme.primary};
    cursor: pointer;
`;

// Cell components
const DateCell = styled.div`
    font-size: 14px;
    color: ${theme.text.primary};
    font-family: monospace; // Monospace dla lepszej czytelności dat
    font-weight: 500;
    line-height: 1.4;
`;

const DateValue = styled.div`
    font-weight: 500;
`;

const TimeValue = styled.div`
    font-size: 12px;
    color: ${theme.text.tertiary};
    font-family: monospace;
`;

const StatusBadge = styled.div<{ $status: OccurrenceStatus }>`
    display: inline-block;
    padding: 4px 8px;
    background: ${props => OccurrenceStatusColors[props.$status]}15;
    color: ${props => OccurrenceStatusColors[props.$status]};
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.3px;
`;

const NotesCell = styled.div`
    font-size: 14px;
    line-height: 1.4;
`;

const NotesText = styled.div`
    color: ${theme.text.secondary};
    cursor: help;
`;

const NoNotes = styled.div`
    color: ${theme.text.muted};
    font-style: italic;
`;

// POPRAWKA 2: Nowa kolumna akcji z konkretnymi przyciskami
const ActionsCell = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
`;

const ActionButton = styled.button<{ $special?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: ${props => props.$special ? theme.primary + '15' : 'transparent'};
    color: ${props => props.$special ? theme.primary : theme.text.muted};
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: ${props => props.$special ? theme.primary + '25' : theme.surfaceHover};
        color: ${props => props.$special ? theme.primary : theme.text.secondary};
    }

    svg {
        font-size: 12px;
    }
`;

const StatusDropdown = styled.div`
    position: relative;
`;

const StatusDropdownButton = styled.button`
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: transparent;
    color: ${theme.text.muted};
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: ${theme.surfaceHover};
        color: ${theme.text.secondary};
    }

    svg:first-child {
        font-size: 12px;
    }

    svg:last-child {
        font-size: 10px;
    }
`;

// Filters panel
const FiltersPanel = styled.div`
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
`;

const FiltersRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    flex-wrap: wrap;
`;

const FilterGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
`;

const FilterLabel = styled.label`
    font-size: 14px;
    font-weight: 500;
    color: ${theme.text.secondary};
    white-space: nowrap;
`;

const SearchInput = styled.input`
    padding: 8px 12px;
    border: 1px solid ${theme.border};
    border-radius: 4px;
    font-size: 14px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    width: 200px;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
    }

    &::placeholder {
        color: ${theme.text.muted};
    }
`;

const FilterSelect = styled.select`
    padding: 8px 12px;
    border: 1px solid ${theme.border};
    border-radius: 4px;
    font-size: 14px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
    }
`;

const ClearButton = styled.button`
    padding: 8px 16px;
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border: 1px solid ${theme.border};
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
        background: ${theme.surfaceHover};
        color: ${theme.text.primary};
        border-color: ${theme.primary};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// Modal styles
const NotesModalContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xl};
`;

const NotesTextArea = styled.textarea`
    padding: ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
    background: ${theme.surface};
    color: ${theme.text.primary};
    resize: vertical;
    min-height: 80px;
    line-height: 1.4;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 2px ${theme.primary}20;
    }

    &::placeholder {
        color: ${theme.text.muted};
    }
`;

const NotesActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${theme.spacing.md};
`;

const CancelModalButton = styled.button`
    padding: 8px 16px;
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border: 1px solid ${theme.border};
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: ${theme.surfaceHover};
        color: ${theme.text.primary};
        border-color: ${theme.borderActive};
    }
`;

const SaveButton = styled.button`
    padding: 8px 16px;
    background: ${theme.primary};
    color: white;
    border: 1px solid ${theme.primary};
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
        background: ${theme.primaryDark};
        border-color: ${theme.primaryDark};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

// Status Modal styles
const StatusModalContent = styled.div`
    padding: ${theme.spacing.xl};
`;

const StatusOptions = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
`;

const StatusOption = styled.button<{ disabled?: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md};
    background: ${theme.surface};
    color: ${theme.text.primary};
    border: 1px solid ${theme.border};
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;

    &:hover:not(:disabled) {
        background: ${theme.surfaceHover};
        border-color: ${theme.primary};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const StatusIcon = styled.div<{ $status: OccurrenceStatus }>`
    color: ${props => OccurrenceStatusColors[props.$status]};
    font-size: 16px;
`;

const StatusLabel = styled.span`
    font-weight: 500;
`;

export default OccurrenceManagement;