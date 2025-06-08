// src/pages/Protocols/list/ProtocolList.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ProtocolListItem } from '../../../types';
import { ProtocolItem } from './ProtocolItem';
import { FilterType } from './ProtocolFilters';
import Pagination from '../../../components/common/Pagination';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaGripVertical, FaEye, FaEdit, FaTrash, FaList, FaTable } from 'react-icons/fa';
import styled from 'styled-components';

// Brand Theme System
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    accent: '#f8fafc',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0'
};

// Definicja kolumny tabeli
interface TableColumn {
    id: string;
    label: string;
    width: string;
    sortable?: boolean;
}

// Klucz do przechowywania konfiguracji kolumn w localStorage
const COLUMN_ORDER_KEY = 'protocol_table_columns_order';
const VIEW_MODE_KEY = 'protocol_view_mode';

// Typ elementu przeciągania
const COLUMN_TYPE = 'column';

type ViewMode = 'table' | 'cards';

// Komponent nagłówka kolumny z możliwością przeciągania
interface ColumnHeaderProps {
    column: TableColumn;
    index: number;
    moveColumn: (dragIndex: number, hoverIndex: number) => void;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({ column, index, moveColumn }) => {
    const ref = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag({
        type: COLUMN_TYPE,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: COLUMN_TYPE,
        hover: (item: any, monitor) => {
            if (!ref.current) return;

            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) return;

            const hoverBoundingRect = ref.current.getBoundingClientRect();
            const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientX = clientOffset!.x - hoverBoundingRect.left;

            if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;
            if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;

            moveColumn(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    drag(drop(ref));

    return (
        <ModernHeaderCell
            ref={ref}
            $isDragging={isDragging}
            $width={column.width}
        >
            <HeaderContent>
                <DragHandle>
                    <FaGripVertical />
                </DragHandle>
                <HeaderLabel>{column.label}</HeaderLabel>
            </HeaderContent>
        </ModernHeaderCell>
    );
};

interface ProtocolListProps {
    protocols: ProtocolListItem[];
    activeFilter: FilterType;
    onViewProtocol: (protocol: ProtocolListItem) => void;
    onEditProtocol: (protocolId: string, isOpenProtocolAction?: boolean) => Promise<void>;
    onDeleteProtocol: (protocolId: string) => Promise<void>;
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
    onPageChange: (page: number) => void;
}

export const ProtocolList: React.FC<ProtocolListProps> = ({
                                                              protocols,
                                                              activeFilter,
                                                              onViewProtocol,
                                                              onEditProtocol,
                                                              onDeleteProtocol,
                                                              pagination,
                                                              onPageChange
                                                          }) => {
    // Domyślna konfiguracja kolumn
    const defaultColumns: TableColumn[] = [
        { id: 'vehicle', label: 'Pojazd', width: '15%', sortable: true },
        { id: 'date', label: 'Data', width: '12%', sortable: true },
        { id: 'licensePlate', label: 'Nr rejestracyjny', width: '12%', sortable: true },
        { id: 'title', label: 'Tytuł wizyty', width: '15%', sortable: true },
        { id: 'owner', label: 'Właściciel', width: '15%', sortable: true },
        { id: 'value', label: 'Wartość', width: '10%', sortable: true },
        { id: 'status', label: 'Status', width: '12%', sortable: true },
        { id: 'actions', label: 'Akcje', width: '9%', sortable: false },
    ];

    // Stan widoku i kolumn
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const saved = localStorage.getItem(VIEW_MODE_KEY);
        return (saved as ViewMode) || 'table';
    });

    const [columns, setColumns] = useState<TableColumn[]>(() => {
        try {
            const savedOrder = localStorage.getItem(COLUMN_ORDER_KEY);
            return savedOrder ? JSON.parse(savedOrder) : defaultColumns;
        } catch (e) {
            console.error("Error loading saved column order:", e);
            return defaultColumns;
        }
    });

    // Zapisz konfigurację przy zmianie
    useEffect(() => {
        try {
            localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(columns));
            localStorage.setItem(VIEW_MODE_KEY, viewMode);
        } catch (e) {
            console.error("Error saving configuration:", e);
        }
    }, [columns, viewMode]);

    // Funkcja do zamiany pozycji kolumn
    const moveColumn = (dragIndex: number, hoverIndex: number) => {
        const draggedColumn = columns[dragIndex];
        const newColumns = [...columns];
        newColumns.splice(dragIndex, 1);
        newColumns.splice(hoverIndex, 0, draggedColumn);
        setColumns(newColumns);
    };

    // Obsługa akcji na protokołach
    const handleQuickAction = (action: string, protocol: ProtocolListItem, e: React.MouseEvent) => {
        e.stopPropagation();

        switch (action) {
            case 'view':
                onViewProtocol(protocol);
                break;
            case 'edit':
                onEditProtocol(protocol.id);
                break;
            case 'delete':
                if (window.confirm('Czy na pewno chcesz usunąć ten protokół?')) {
                    onDeleteProtocol(protocol.id);
                }
                break;
        }
    };

    if (protocols.length === 0 && pagination.totalItems === 0) {
        return (
            <EmptyStateContainer>
                <EmptyStateIcon>
                    <FaList />
                </EmptyStateIcon>
                <EmptyStateTitle>Brak protokołów</EmptyStateTitle>
                <EmptyStateDescription>
                    {activeFilter !== 'Wszystkie'
                        ? `Brak protokołów w grupie "${activeFilter}"`
                        : 'Nie znaleziono żadnych protokołów przyjęcia pojazdów'
                    }
                </EmptyStateDescription>
                {activeFilter === 'Wszystkie' && (
                    <EmptyStateAction>
                        Kliknij "Rozpocznij wizytę", aby utworzyć pierwszy protokół
                    </EmptyStateAction>
                )}
            </EmptyStateContainer>
        );
    }

    return (
        <ListContainer>
            {/* Header with view controls */}
            <ListHeader>
                <ListTitle>
                   Wizyty ({pagination.totalItems})
                </ListTitle>
                <ViewControls>
                    <ViewButton
                        $active={viewMode === 'table'}
                        onClick={() => setViewMode('table')}
                        title="Widok tabeli"
                    >
                        <FaTable />
                    </ViewButton>
                    <ViewButton
                        $active={viewMode === 'cards'}
                        onClick={() => setViewMode('cards')}
                        title="Widok kart"
                    >
                        <FaList />
                    </ViewButton>
                </ViewControls>
            </ListHeader>

            {/* Content based on view mode */}
            {viewMode === 'table' ? (
                <DndProvider backend={HTML5Backend}>
                    <TableContainer>
                        <TableHeader>
                            {columns.map((column, index) => (
                                <ColumnHeader
                                    key={column.id}
                                    column={column}
                                    index={index}
                                    moveColumn={moveColumn}
                                />
                            ))}
                        </TableHeader>

                        <TableBody>
                            {protocols.length === 0 ? (
                                <LoadingRow>
                                    <LoadingCell colSpan={columns.length}>
                                        <LoadingSpinner />
                                        <span>Ładowanie danych...</span>
                                    </LoadingCell>
                                </LoadingRow>
                            ) : (
                                protocols.map(protocol => (
                                    <TableRow
                                        key={protocol.id}
                                        onClick={() => onViewProtocol(protocol)}
                                    >
                                        {columns.map(column => (
                                            <TableCell
                                                key={`${protocol.id}-${column.id}`}
                                                $width={column.width}
                                            >
                                                {column.id === 'actions' ? (
                                                    <ActionButtons>
                                                        <ActionButton
                                                            onClick={(e) => handleQuickAction('view', protocol, e)}
                                                            title="Zobacz szczegóły"
                                                            $variant="view"
                                                        >
                                                            <FaEye />
                                                        </ActionButton>
                                                        <ActionButton
                                                            onClick={(e) => handleQuickAction('edit', protocol, e)}
                                                            title="Edytuj"
                                                            $variant="edit"
                                                        >
                                                            <FaEdit />
                                                        </ActionButton>
                                                        <ActionButton
                                                            onClick={(e) => handleQuickAction('delete', protocol, e)}
                                                            title="Usuń"
                                                            $variant="delete"
                                                        >
                                                            <FaTrash />
                                                        </ActionButton>
                                                    </ActionButtons>
                                                ) : (
                                                    <ProtocolItem
                                                        protocol={protocol}
                                                        columnId={column.id}
                                                        onView={onViewProtocol}
                                                        onEdit={onEditProtocol}
                                                        onDelete={onDeleteProtocol}
                                                    />
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </TableContainer>
                </DndProvider>
            ) : (
                <CardsContainer>
                    {protocols.map(protocol => (
                        <ProtocolCard key={protocol.id} onClick={() => onViewProtocol(protocol)}>
                            <CardHeader>
                                <CardTitle>
                                    {protocol.vehicle.make} {protocol.vehicle.model}
                                </CardTitle>
                                <CardActions>
                                    <ActionButton
                                        onClick={(e) => handleQuickAction('view', protocol, e)}
                                        title="Zobacz szczegóły"
                                        $variant="view"
                                        $small
                                    >
                                        <FaEye />
                                    </ActionButton>
                                    <ActionButton
                                        onClick={(e) => handleQuickAction('edit', protocol, e)}
                                        title="Edytuj"
                                        $variant="edit"
                                        $small
                                    >
                                        <FaEdit />
                                    </ActionButton>
                                </CardActions>
                            </CardHeader>

                            <CardContent>
                                <CardRow>
                                    <CardLabel>Nr rejestracyjny:</CardLabel>
                                    <CardValue>{protocol.vehicle.licensePlate}</CardValue>
                                </CardRow>
                                <CardRow>
                                    <CardLabel>Właściciel:</CardLabel>
                                    <CardValue>{protocol.owner.name}</CardValue>
                                </CardRow>
                                <CardRow>
                                    <CardLabel>Wartość:</CardLabel>
                                    <CardValue>{protocol.totalAmount.toFixed(2)} PLN</CardValue>
                                </CardRow>
                                <CardRow>
                                    <CardLabel>Status:</CardLabel>
                                    <ProtocolItem
                                        protocol={protocol}
                                        columnId="status"
                                        onView={onViewProtocol}
                                        onEdit={onEditProtocol}
                                        onDelete={onDeleteProtocol}
                                    />
                                </CardRow>
                            </CardContent>
                        </ProtocolCard>
                    ))}
                </CardsContainer>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <PaginationWrapper>
                    <Pagination
                        currentPage={pagination.currentPage + 1}
                        totalPages={pagination.totalPages}
                        onPageChange={onPageChange}
                        totalItems={pagination.totalItems}
                        pageSize={pagination.pageSize}
                        showTotalItems={true}
                    />
                </PaginationWrapper>
            )}
        </ListContainer>
    );
};

// Modern Styled Components
const ListContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: 16px;
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const ListHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

const ListTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
`;

const ViewControls = styled.div`
    display: flex;
    border: 2px solid ${brandTheme.border};
    border-radius: 8px;
    overflow: hidden;
`;

const ViewButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 36px;
    border: none;
    background: ${props => props.$active ? brandTheme.primary : brandTheme.surface};
    color: ${props => props.$active ? 'white' : brandTheme.neutral};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;

    &:hover {
        background: ${props => props.$active ? brandTheme.primaryDark : brandTheme.primaryGhost};
        color: ${props => props.$active ? 'white' : brandTheme.primary};
    }

    &:not(:last-child) {
        border-right: 1px solid ${brandTheme.border};
    }
`;

// Table Components
const TableContainer = styled.div`
    width: 100%;
    overflow-x: auto;
`;

const TableHeader = styled.div`
    display: flex;
    background: ${brandTheme.surfaceAlt};
    border-bottom: 2px solid ${brandTheme.border};
    min-height: 56px;
`;

const ModernHeaderCell = styled.div<{ $isDragging?: boolean; $width: string }>`
    flex: 0 0 ${props => props.$width};
    width: ${props => props.$width};
    display: flex;
    align-items: center;
    padding: 0 16px;
    background: ${props => props.$isDragging ? brandTheme.primaryGhost : brandTheme.surfaceAlt};
    border-right: 1px solid ${brandTheme.border};
    cursor: grab;
    user-select: none;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryGhost};
    }

    &:active {
        cursor: grabbing;
    }

    &:last-child {
        border-right: none;
    }
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
`;

const DragHandle = styled.div`
    color: ${brandTheme.neutral};
    font-size: 12px;
    opacity: 0.6;
    transition: opacity 0.2s ease;

    ${ModernHeaderCell}:hover & {
        opacity: 1;
    }
`;

const HeaderLabel = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: #374151;
`;

const TableBody = styled.div`
    background: ${brandTheme.surface};
`;

const TableRow = styled.div`
    display: flex;
    border-bottom: 1px solid ${brandTheme.border};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.surfaceAlt};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.div<{ $width?: string; colSpan?: number }>`
    flex: ${props => props.colSpan ? '1 1 100%' : `0 0 ${props.$width || 'auto'}`};
    width: ${props => props.colSpan ? '100%' : props.$width || 'auto'};
    padding: 16px;
    display: flex;
    align-items: center;
    min-height: 72px;
    border-right: 1px solid ${brandTheme.border};

    &:last-child {
        border-right: none;
    }
`;

const LoadingRow = styled.div`
    display: flex;
    width: 100%;
`;

const LoadingCell = styled.div<{ colSpan: number }>`
    flex: 1;
    padding: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: ${brandTheme.neutral};
    font-size: 16px;
`;

const LoadingSpinner = styled.div`
    width: 20px;
    height: 20px;
    border: 2px solid ${brandTheme.border};
    border-top: 2px solid ${brandTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Card Components
const CardsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 16px;
    padding: 24px;
`;

const ProtocolCard = styled.div`
    background: ${brandTheme.surface};
    border: 2px solid ${brandTheme.border};
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        border-color: ${brandTheme.primary};
    }
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

const CardTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
`;

const CardActions = styled.div`
    display: flex;
    gap: 8px;
`;

const CardContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const CardRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CardLabel = styled.span`
    font-size: 14px;
    color: ${brandTheme.neutral};
    font-weight: 500;
`;

const CardValue = styled.span`
    font-size: 14px;
    color: #374151;
    font-weight: 600;
`;

// Action Components
const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
`;

const ActionButton = styled.button<{
    $variant: 'view' | 'edit' | 'delete';
    $small?: boolean;
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${props => props.$small ? '28px' : '32px'};
    height: ${props => props.$small ? '28px' : '32px'};
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: ${props => props.$small ? '12px' : '14px'};

    ${({ $variant }) => {
    switch ($variant) {
        case 'view':
            return `
                    background: ${brandTheme.primaryGhost};
                    color: ${brandTheme.primary};
                    &:hover {
                        background: ${brandTheme.primary};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        case 'edit':
            return `
                    background: rgba(245, 158, 11, 0.1);
                    color: #f59e0b;
                    &:hover {
                        background: #f59e0b;
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        case 'delete':
            return `
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    &:hover {
                        background: #ef4444;
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
    }
}}
`;

// Empty State Components
const EmptyStateContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 40px;
    background: ${brandTheme.surface};
    border-radius: 16px;
    border: 2px dashed ${brandTheme.border};
    text-align: center;
`;

const EmptyStateIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${brandTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: ${brandTheme.neutral};
    margin-bottom: 20px;
`;

const EmptyStateTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 8px 0;
`;

const EmptyStateDescription = styled.p`
    font-size: 16px;
    color: ${brandTheme.neutral};
    margin: 0 0 12px 0;
    line-height: 1.5;
`;

const EmptyStateAction = styled.p`
    font-size: 14px;
    color: ${brandTheme.primary};
    margin: 0;
    font-weight: 500;
`;

const PaginationWrapper = styled.div`
    padding: 20px 24px;
    border-top: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;