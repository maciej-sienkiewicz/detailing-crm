import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
    FaEdit,
    FaTrash,
    FaCar,
    FaHistory,
    FaSms,
    FaCheckSquare,
    FaSquare,
    FaGripVertical,
    FaEye,
    FaList,
    FaTable,
    FaBuilding, FaPhone, FaEnvelope
} from 'react-icons/fa';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ClientExpanded } from '../../../types';

// Professional Brand Theme for Automotive CRM
const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.08))',
    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    surfaceElevated: '#fafbfc',
    neutral: '#64748b',
    neutralLight: '#94a3b8',
    border: '#e2e8f0',
    text: {
        primary: '#1e293b',
        secondary: '#64748b',
        muted: '#94a3b8'
    },
    status: {
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        info: '#0ea5e9'
    }
};

// Table Column Configuration
interface TableColumn {
    id: string;
    label: string;
    width: string;
    sortable?: boolean;
}

const COLUMN_ORDER_KEY = 'client_table_columns_order';
const VIEW_MODE_KEY = 'client_view_mode';
const COLUMN_TYPE = 'column';

type ViewMode = 'table' | 'cards';

// Draggable Column Header Component
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

interface ClientListTableProps {
    clients: ClientExpanded[];
    selectedClientIds: string[];
    onToggleSelection: (clientId: string) => void;
    onSelectClient: (client: ClientExpanded) => void;
    onEditClient: (client: ClientExpanded) => void;
    onDeleteClient: (clientId: string) => void;
    onShowVehicles: (clientId: string) => void;
    onAddContactAttempt: (client: ClientExpanded) => void;
    onSendSMS: (client: ClientExpanded) => void;
}

const ClientListTable: React.FC<ClientListTableProps> = ({
                                                             clients,
                                                             selectedClientIds,
                                                             onToggleSelection,
                                                             onSelectClient,
                                                             onEditClient,
                                                             onDeleteClient,
                                                             onShowVehicles,
                                                             onAddContactAttempt,
                                                             onSendSMS
                                                         }) => {
    // Default column configuration
    const defaultColumns: TableColumn[] = [
        { id: 'selection', label: '', width: '50px', sortable: false },
        { id: 'client', label: 'Klient', width: '20%', sortable: true },
        { id: 'contact', label: 'Kontakt', width: '18%', sortable: true },
        { id: 'company', label: 'Firma', width: '15%', sortable: true },
        { id: 'metrics', label: 'Statystyki', width: '15%', sortable: true },
        { id: 'revenue', label: 'Przychody', width: '12%', sortable: true },
        { id: 'actions', label: 'Akcje', width: '20%', sortable: false },
    ];

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const saved = localStorage.getItem(VIEW_MODE_KEY);
        return (saved as ViewMode) || 'table';
    });

    const [columns, setColumns] = useState<TableColumn[]>(() => {
        try {
            const savedOrder = localStorage.getItem(COLUMN_ORDER_KEY);
            return savedOrder ? JSON.parse(savedOrder) : defaultColumns;
        } catch (e) {
            return defaultColumns;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(columns));
            localStorage.setItem(VIEW_MODE_KEY, viewMode);
        } catch (e) {
            console.error("Error saving configuration:", e);
        }
    }, [columns, viewMode]);

    const moveColumn = (dragIndex: number, hoverIndex: number) => {
        const draggedColumn = columns[dragIndex];
        const newColumns = [...columns];
        newColumns.splice(dragIndex, 1);
        newColumns.splice(hoverIndex, 0, draggedColumn);
        setColumns(newColumns);
    };

    const handleQuickAction = (action: string, client: ClientExpanded, e: React.MouseEvent) => {
        e.stopPropagation();

        switch (action) {
            case 'view':
                onSelectClient(client);
                break;
            case 'edit':
                onEditClient(client);
                break;
            case 'delete':
                if (window.confirm('Czy na pewno chcesz usunąć tego klienta?')) {
                    onDeleteClient(client.id);
                }
                break;
            case 'vehicles':
                onShowVehicles(client.id);
                break;
            case 'contact':
                onAddContactAttempt(client);
                break;
            case 'sms':
                onSendSMS(client);
                break;
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
    };

    const getClientStatus = (client: ClientExpanded): { label: string; color: string } => {
        if (client.totalRevenue > 50000) return { label: 'VIP', color: brandTheme.status.error };
        if (client.totalRevenue > 20000) return { label: 'Premium', color: brandTheme.status.warning };
        return { label: 'Standard', color: brandTheme.neutral };
    };

    if (clients.length === 0) {
        return (
            <EmptyStateContainer>
                <EmptyStateIcon>
                    <FaList />
                </EmptyStateIcon>
                <EmptyStateTitle>Brak klientów</EmptyStateTitle>
                <EmptyStateDescription>
                    Nie znaleziono żadnych klientów w bazie danych
                </EmptyStateDescription>
                <EmptyStateAction>
                    Kliknij "Dodaj klienta", aby utworzyć pierwszy wpis
                </EmptyStateAction>
            </EmptyStateContainer>
        );
    }

    return (
        <ListContainer>
            {/* Header with view controls */}
            <ListHeader>
                <ListTitle>
                    Lista klientów ({clients.length})
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
                            {clients.map(client => {
                                const status = getClientStatus(client);
                                return (
                                    <TableRow
                                        key={client.id}
                                        onClick={() => onSelectClient(client)}
                                    >
                                        {columns.map(column => (
                                            <TableCell
                                                key={`${client.id}-${column.id}`}
                                                $width={column.width}
                                            >
                                                {column.id === 'selection' && (
                                                    <SelectionCheckbox
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onToggleSelection(client.id);
                                                        }}
                                                    >
                                                        {selectedClientIds.includes(client.id) ?
                                                            <FaCheckSquare /> : <FaSquare />
                                                        }
                                                    </SelectionCheckbox>
                                                )}

                                                {column.id === 'client' && (
                                                    <ClientInfo>
                                                        <ClientName>
                                                            {client.firstName} {client.lastName}
                                                            <StatusBadge $color={status.color}>
                                                                {status.label}
                                                            </StatusBadge>
                                                        </ClientName>
                                                        {client.lastVisitDate && (
                                                            <LastVisit>
                                                                Ostatnia wizyta: {formatDate(client.lastVisitDate)}
                                                            </LastVisit>
                                                        )}
                                                    </ClientInfo>
                                                )}

                                                {column.id === 'contact' && (
                                                    <ContactInfo>
                                                        <ContactItem>
                                                            <FaEnvelope style={{ fontSize: '12px', color: brandTheme.neutral }} />
                                                            {client.email}
                                                        </ContactItem>
                                                        <ContactItem>
                                                            <FaPhone style={{ fontSize: '12px', color: brandTheme.neutral }} />
                                                            {client.phone}
                                                        </ContactItem>
                                                    </ContactInfo>
                                                )}

                                                {column.id === 'company' && (
                                                    <CompanyInfo>
                                                        {client.company ? (
                                                            <>
                                                                <CompanyName>
                                                                    <FaBuilding style={{ fontSize: '12px' }} />
                                                                    {client.company}
                                                                </CompanyName>
                                                                {client.taxId && (
                                                                    <TaxId>NIP: {client.taxId}</TaxId>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span style={{ color: brandTheme.text.muted, fontStyle: 'italic' }}>
                                                                Klient indywidualny
                                                            </span>
                                                        )}
                                                    </CompanyInfo>
                                                )}

                                                {column.id === 'metrics' && (
                                                    <MetricsContainer>
                                                        <MetricItem>
                                                            <MetricValue>{client.totalVisits}</MetricValue>
                                                            <MetricLabel>wizyt</MetricLabel>
                                                        </MetricItem>
                                                        <MetricSeparator>•</MetricSeparator>
                                                        <MetricItem>
                                                            <MetricValue>{client.totalTransactions || 0}</MetricValue>
                                                            <MetricLabel>transakcji</MetricLabel>
                                                        </MetricItem>
                                                    </MetricsContainer>
                                                )}

                                                {column.id === 'revenue' && (
                                                    <RevenueDisplay>
                                                        {formatCurrency(client.totalRevenue)}
                                                    </RevenueDisplay>
                                                )}

                                                {column.id === 'actions' && (
                                                    <ActionButtons>
                                                        <ActionButton
                                                            onClick={(e) => handleQuickAction('view', client, e)}
                                                            title="Zobacz szczegóły"
                                                            $variant="view"
                                                        >
                                                            <FaEye />
                                                        </ActionButton>
                                                        <ActionButton
                                                            onClick={(e) => handleQuickAction('edit', client, e)}
                                                            title="Edytuj klienta"
                                                            $variant="edit"
                                                        >
                                                            <FaEdit />
                                                        </ActionButton>
                                                        <ActionButton
                                                            onClick={(e) => handleQuickAction('vehicles', client, e)}
                                                            title="Pojazdy klienta"
                                                            $variant="info"
                                                        >
                                                            <FaCar />
                                                        </ActionButton>
                                                        <ActionButton
                                                            onClick={(e) => handleQuickAction('contact', client, e)}
                                                            title="Dodaj kontakt"
                                                            $variant="secondary"
                                                        >
                                                            <FaHistory />
                                                        </ActionButton>
                                                        <ActionButton
                                                            onClick={(e) => handleQuickAction('sms', client, e)}
                                                            title="Wyślij SMS"
                                                            $variant="success"
                                                        >
                                                            <FaSms />
                                                        </ActionButton>
                                                        <ActionButton
                                                            onClick={(e) => handleQuickAction('delete', client, e)}
                                                            title="Usuń klienta"
                                                            $variant="delete"
                                                        >
                                                            <FaTrash />
                                                        </ActionButton>
                                                    </ActionButtons>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </TableContainer>
                </DndProvider>
            ) : (
                <CardsContainer>
                    {clients.map(client => {
                        const status = getClientStatus(client);
                        return (
                            <ClientCard key={client.id} onClick={() => onSelectClient(client)}>
                                <CardHeader>
                                    <CardTitle>
                                        {client.firstName} {client.lastName}
                                        <StatusBadge $color={status.color}>
                                            {status.label}
                                        </StatusBadge>
                                    </CardTitle>
                                    <SelectionCheckbox
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleSelection(client.id);
                                        }}
                                    >
                                        {selectedClientIds.includes(client.id) ?
                                            <FaCheckSquare /> : <FaSquare />
                                        }
                                    </SelectionCheckbox>
                                </CardHeader>

                                <CardContent>
                                    <CardRow>
                                        <CardLabel>Email:</CardLabel>
                                        <CardValue>{client.email}</CardValue>
                                    </CardRow>
                                    <CardRow>
                                        <CardLabel>Telefon:</CardLabel>
                                        <CardValue>{client.phone}</CardValue>
                                    </CardRow>
                                    {client.company && (
                                        <CardRow>
                                            <CardLabel>Firma:</CardLabel>
                                            <CardValue>{client.company}</CardValue>
                                        </CardRow>
                                    )}
                                    <CardRow>
                                        <CardLabel>Wizyty:</CardLabel>
                                        <CardValue>{client.totalVisits}</CardValue>
                                    </CardRow>
                                    <CardRow>
                                        <CardLabel>Przychody:</CardLabel>
                                        <CardValue>{formatCurrency(client.totalRevenue)}</CardValue>
                                    </CardRow>
                                </CardContent>

                                <CardFooter>
                                    <ActionButton
                                        onClick={(e) => handleQuickAction('edit', client, e)}
                                        title="Edytuj"
                                        $variant="edit"
                                        $small
                                    >
                                        <FaEdit />
                                    </ActionButton>
                                    <ActionButton
                                        onClick={(e) => handleQuickAction('vehicles', client, e)}
                                        title="Pojazdy"
                                        $variant="info"
                                        $small
                                    >
                                        <FaCar />
                                    </ActionButton>
                                    <ActionButton
                                        onClick={(e) => handleQuickAction('sms', client, e)}
                                        title="SMS"
                                        $variant="success"
                                        $small
                                    >
                                        <FaSms />
                                    </ActionButton>
                                </CardFooter>
                            </ClientCard>
                        );
                    })}
                </CardsContainer>
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
    color: ${brandTheme.text.primary};
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
    color: ${brandTheme.text.primary};
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

const TableCell = styled.div<{ $width?: string }>`
    flex: 0 0 ${props => props.$width || 'auto'};
    width: ${props => props.$width || 'auto'};
    padding: 16px;
    display: flex;
    align-items: center;
    min-height: 72px;
    border-right: 1px solid ${brandTheme.border};

    &:last-child {
        border-right: none;
    }
`;

const SelectionCheckbox = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    color: ${brandTheme.primary};
    transition: all 0.2s ease;

    &:hover {
        color: ${brandTheme.primaryDark};
        transform: scale(1.1);
    }
`;

const ClientInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
`;

const ClientName = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 15px;
    color: ${brandTheme.text.primary};
`;

const StatusBadge = styled.span<{ $color: string }>`
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border: 1px solid ${props => props.$color}30;
`;

const LastVisit = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.secondary};
`;

const ContactInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
`;

const ContactItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: ${brandTheme.text.secondary};
`;

const CompanyInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
`;

const CompanyName = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;
    color: ${brandTheme.text.primary};
`;

const TaxId = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
`;

const MetricsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const MetricItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const MetricValue = styled.div`
    font-weight: 600;
    font-size: 15px;
    color: ${brandTheme.primary};
`;

const MetricLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
`;

const MetricSeparator = styled.div`
    color: ${brandTheme.border};
    font-weight: bold;
`;

const RevenueDisplay = styled.div`
    font-weight: 600;
    font-size: 15px;
    color: ${brandTheme.status.success};
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
`;

const ActionButton = styled.button<{
    $variant: 'view' | 'edit' | 'delete' | 'info' | 'success' | 'secondary';
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
    font-size: ${props => props.$small ? '12px' : '13px'};

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
                    background: rgba(217, 119, 6, 0.1);
                    color: ${brandTheme.status.warning};
                    &:hover {
                        background: ${brandTheme.status.warning};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        case 'info':
            return `
                    background: rgba(14, 165, 233, 0.1);
                    color: ${brandTheme.status.info};
                    &:hover {
                        background: ${brandTheme.status.info};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        case 'success':
            return `
                    background: rgba(5, 150, 105, 0.1);
                    color: ${brandTheme.status.success};
                    &:hover {
                        background: ${brandTheme.status.success};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        case 'secondary':
            return `
                    background: ${brandTheme.surfaceElevated};
                    color: ${brandTheme.neutral};
                    &:hover {
                        background: ${brandTheme.neutral};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        case 'delete':
            return `
                    background: rgba(220, 38, 38, 0.1);
                    color: ${brandTheme.status.error};
                    &:hover {
                        background: ${brandTheme.status.error};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
    }
}}
`;

// Card Components
const CardsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 16px;
    padding: 24px;
`;

const ClientCard = styled.div`
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
    align-items: flex-start;
    margin-bottom: 16px;
`;

const CardTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
`;

const CardContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
`;

const CardRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CardLabel = styled.span`
    font-size: 13px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const CardValue = styled.span`
    font-size: 13px;
    color: ${brandTheme.text.primary};
    font-weight: 600;
`;

const CardFooter = styled.div`
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 12px;
    border-top: 1px solid ${brandTheme.border};
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
    color: ${brandTheme.text.primary};
    margin: 0 0 8px 0;
`;

const EmptyStateDescription = styled.p`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    margin: 0 0 12px 0;
    line-height: 1.5;
`;

const EmptyStateAction = styled.p`
    font-size: 14px;
    color: ${brandTheme.primary};
    margin: 0;
    font-weight: 500;
`;

export default ClientListTable;