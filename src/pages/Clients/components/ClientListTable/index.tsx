// ClientListTable/index.tsx - Enhanced Main Component with ProtocolList styling
import React, {useEffect, useRef, useState} from 'react';
import {DndProvider, useDrag, useDrop} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import styled from 'styled-components';
import {
    FaBuilding,
    FaCalendarAlt,
    FaCar,
    FaCheckSquare,
    FaEdit,
    FaEnvelope,
    FaEye,
    FaGripVertical,
    FaList,
    FaPhone,
    FaSms,
    FaSquare,
    FaTable,
    FaTrash,
    FaUsers
} from 'react-icons/fa';
import {ClientExpanded} from '../../../../types';

// Brand Theme System - consistent with ProtocolList
const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    accent: '#f8fafc',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0',

    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2',
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },
};

// Table Column Definition
interface TableColumn {
    id: string;
    label: string;
    width: string;
    sortable?: boolean;
}

// Drag and Drop Constants
const COLUMN_TYPE = 'column';
const COLUMN_ORDER_KEY = 'client_table_columns_order';
const VIEW_MODE_KEY = 'client_view_mode';

type ViewMode = 'table' | 'cards';

// Client Status Helper
const getClientStatus = (client: ClientExpanded) => {
    if (client.totalRevenue > 50000) {
        return { label: 'VIP', color: brandTheme.status.error };
    }
    if (client.totalRevenue > 20000) {
        return { label: 'Premium', color: brandTheme.status.warning };
    }
    return { label: 'Standard', color: brandTheme.neutral };
};

// Column Header Component with Drag and Drop
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

// Client Item Component for rendering cell content
interface ClientItemProps {
    client: ClientExpanded;
    columnId: string;
    selectedClientIds: string[];
    onToggleSelection: (clientId: string) => void;
    onView: (client: ClientExpanded) => void;
    onEdit: (client: ClientExpanded) => void;
    onDelete: (clientId: string) => void;
    onShowVehicles: (clientId: string) => void;
    onAddContactAttempt: (client: ClientExpanded) => void;
    onSendSMS: (client: ClientExpanded) => void;
}

const ClientItem: React.FC<ClientItemProps> = ({
                                                   client,
                                                   columnId,
                                                   selectedClientIds,
                                                   onToggleSelection,
                                                   onView,
                                                   onEdit,
                                                   onDelete,
                                                   onShowVehicles,
                                                   onAddContactAttempt,
                                                   onSendSMS
                                               }) => {
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
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

    const status = getClientStatus(client);
    const isSelected = selectedClientIds.includes(client.id);

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
                        onToggleSelection(client.id);
                    }}
                    $selected={isSelected}
                >
                    {isSelected ? <FaCheckSquare /> : <FaSquare />}
                </SelectionCheckbox>
            );

        case 'client':
            return (
                <ClientInfo>
                    <ClientName>
                        {client.firstName} {client.lastName}
                        <StatusBadge $color={status.color}>
                            {status.label}
                        </StatusBadge>
                    </ClientName>
                </ClientInfo>
            );

        case 'contact':
            return (
                <ContactInfo>
                    <ContactItem>
                        <ContactIcon>
                            <FaEnvelope />
                        </ContactIcon>
                        <ContactText>{client.email}</ContactText>
                    </ContactItem>
                    <ContactItem>
                        <ContactIcon>
                            <FaPhone />
                        </ContactIcon>
                        <ContactText>{client.phone}</ContactText>
                    </ContactItem>
                </ContactInfo>
            );

        case 'company':
            return (
                <CompanyInfo>
                    {client.company ? (
                        <>
                            <CompanyName>
                                <FaBuilding />
                                {client.company}
                            </CompanyName>
                            {client.taxId && (
                                <TaxId>NIP: {client.taxId}</TaxId>
                            )}
                        </>
                    ) : (
                        <EmptyCompany>
                            Klient indywidualny
                        </EmptyCompany>
                    )}
                </CompanyInfo>
            );

        case 'lastVisit':
            return (
                <LastVisitDate>
                    {client.lastVisitDate ? (
                        <>
                            <FaCalendarAlt />
                            <span>{formatDate(client.lastVisitDate)}</span>
                        </>
                    ) : (
                        <EmptyDate>Brak wizyt</EmptyDate>
                    )}
                </LastVisitDate>
            );

        case 'metrics':
            return (
                <MetricsContainer>
                    <MetricItem>
                        <MetricValue>{client.totalVisits}</MetricValue>
                        <MetricLabel>wizyt</MetricLabel>
                    </MetricItem>
                    <MetricSeparator>•</MetricSeparator>
                    <MetricItem>
                        <MetricValue>{client.vehicles?.length || 0}</MetricValue>
                        <MetricLabel>pojazdów</MetricLabel>
                    </MetricItem>
                </MetricsContainer>
            );

        case 'revenue':
            return (
                <RevenueDisplay>
                    {formatCurrency(client.totalRevenue)}
                </RevenueDisplay>
            );

        case 'actions':
            return (
                <ActionButtons>
                    <ActionButton
                        onClick={(e) => handleActionClick(e, () => onView(client))}
                        title="Zobacz szczegóły"
                        $variant="view"
                    >
                        <FaEye />
                    </ActionButton>
                    <ActionButton
                        onClick={(e) => handleActionClick(e, () => onEdit(client))}
                        title="Edytuj"
                        $variant="edit"
                    >
                        <FaEdit />
                    </ActionButton>
                    <ActionButton
                        onClick={(e) => handleActionClick(e, () => onDelete(client.id))}
                        title="Usuń"
                        $variant="delete"
                    >
                        <FaTrash />
                    </ActionButton>
                </ActionButtons>
            );

        default:
            return null;
    }
};

// Main ClientListTable Component
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
        { id: 'selection', label: '', width: '4%', sortable: false },
        { id: 'client', label: 'Klient', width: '18%', sortable: true },
        { id: 'contact', label: 'Kontakt', width: '18%', sortable: true },
        { id: 'company', label: 'Firma', width: '15%', sortable: true },
        { id: 'lastVisit', label: 'Ostatnia wizyta', width: '12%', sortable: true },
        { id: 'metrics', label: 'Wizyty / Pojazdy', width: '13%', sortable: true },
        { id: 'revenue', label: 'Przychody', width: '10%', sortable: true },
        { id: 'actions', label: 'Akcje', width: '10%', sortable: false },
    ];

    // State management
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

    // Save configuration changes
    useEffect(() => {
        try {
            localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(columns));
            localStorage.setItem(VIEW_MODE_KEY, viewMode);
        } catch (e) {
            console.error("Error saving configuration:", e);
        }
    }, [columns, viewMode]);

    // Column reordering function
    const moveColumn = (dragIndex: number, hoverIndex: number) => {
        const draggedColumn = columns[dragIndex];
        const newColumns = [...columns];
        newColumns.splice(dragIndex, 1);
        newColumns.splice(hoverIndex, 0, draggedColumn);
        setColumns(newColumns);
    };

    // Action handlers
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

    // Empty state
    if (clients.length === 0) {
        return (
            <EmptyStateContainer>
                <EmptyStateIcon>
                    <FaUsers />
                </EmptyStateIcon>
                <EmptyStateTitle>Brak klientów</EmptyStateTitle>
                <EmptyStateDescription>
                    Nie znaleziono żadnych klientów w bazie danych
                </EmptyStateDescription>
                <EmptyStateAction>
                    Kliknij "Nowy klient", aby utworzyć pierwszy wpis
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
                            {clients.map(client => (
                                <TableRow
                                    key={client.id}
                                    onClick={() => onSelectClient(client)}
                                    $selected={selectedClientIds.includes(client.id)}
                                >
                                    {columns.map(column => (
                                        <TableCell
                                            key={`${client.id}-${column.id}`}
                                            $width={column.width}
                                        >
                                            <ClientItem
                                                client={client}
                                                columnId={column.id}
                                                selectedClientIds={selectedClientIds}
                                                onToggleSelection={onToggleSelection}
                                                onView={onSelectClient}
                                                onEdit={onEditClient}
                                                onDelete={onDeleteClient}
                                                onShowVehicles={onShowVehicles}
                                                onAddContactAttempt={onAddContactAttempt}
                                                onSendSMS={onSendSMS}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableContainer>
                </DndProvider>
            ) : (
                <CardsContainer>
                    {clients.map(client => {
                        const status = getClientStatus(client);
                        const isSelected = selectedClientIds.includes(client.id);
                        return (
                            <ClientCard
                                key={client.id}
                                onClick={() => onSelectClient(client)}
                                $selected={isSelected}
                            >
                                <CardHeader>
                                    <CardTitle>
                                        {client.firstName} {client.lastName}
                                        <StatusBadge $color={status.color}>
                                            {status.label}
                                        </StatusBadge>
                                    </CardTitle>
                                    <CardHeaderActions>
                                        <SelectionCheckbox
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleSelection(client.id);
                                            }}
                                            $selected={isSelected}
                                        >
                                            {isSelected ? <FaCheckSquare /> : <FaSquare />}
                                        </SelectionCheckbox>
                                        <CardActions>
                                            <ActionButton
                                                onClick={(e) => handleQuickAction('view', client, e)}
                                                title="Zobacz szczegóły"
                                                $variant="view"
                                                $small
                                            >
                                                <FaEye />
                                            </ActionButton>
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
                                        </CardActions>
                                    </CardHeaderActions>
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
                                        <CardLabel>Pojazdy:</CardLabel>
                                        <CardValue>{client.vehicles?.length || 0}</CardValue>
                                    </CardRow>
                                    <CardRow>
                                        <CardLabel>Przychody:</CardLabel>
                                        <CardValue>
                                            {new Intl.NumberFormat('pl-PL', {
                                                style: 'currency',
                                                currency: 'PLN'
                                            }).format(client.totalRevenue)}
                                        </CardValue>
                                    </CardRow>
                                </CardContent>
                            </ClientCard>
                        );
                    })}
                </CardsContainer>
            )}
        </ListContainer>
    );
};

// Styled Components - consistent with ProtocolList
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

const TableRow = styled.div<{ $selected?: boolean }>`
    display: flex;
    border-bottom: 1px solid ${brandTheme.border};
    cursor: pointer;
    transition: all 0.2s ease;
    background: ${props => props.$selected ? brandTheme.primaryGhost : brandTheme.surface};

    &:hover {
        background: ${props => props.$selected ? brandTheme.primaryGhost : brandTheme.surfaceAlt};
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
    min-height: 80px;
    border-right: 1px solid ${brandTheme.border};

    &:last-child {
        border-right: none;
    }
`;

// Selection Components
const SelectionCheckbox = styled.div<{ $selected?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    color: ${props => props.$selected ? brandTheme.primary : brandTheme.neutral};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 8px;
    border-radius: 6px;

    &:hover {
        color: ${brandTheme.primary};
        background: ${brandTheme.primaryGhost};
        transform: scale(1.1);
    }
`;

// Client-specific Cell Components
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
    color: #1e293b;
    line-height: 1.3;
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
    white-space: nowrap;
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
`;

const ContactIcon = styled.div`
    color: ${brandTheme.neutral};
    font-size: 12px;
    width: 16px;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
`;

const ContactText = styled.span`
    color: #374151;
    font-weight: 500;
    word-break: break-all;
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
    color: #1e293b;

    svg {
        color: ${brandTheme.neutral};
        font-size: 12px;
    }
`;

const TaxId = styled.div`
    font-size: 12px;
    color: ${brandTheme.neutral};
    font-weight: 500;
`;

const EmptyCompany = styled.div`
    color: ${brandTheme.neutral};
    font-style: italic;
    font-size: 13px;
`;

const LastVisitDate = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #374151;

    svg {
        color: ${brandTheme.neutral};
        font-size: 11px;
    }
`;

const EmptyDate = styled.span`
    color: ${brandTheme.neutral};
    font-style: italic;
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
    min-width: 0;
`;

const MetricValue = styled.div`
    font-weight: 700;
    font-size: 16px;
    color: #374151;
    line-height: 1.2;
`;

const MetricLabel = styled.div`
    font-size: 11px;
    color: ${brandTheme.neutral};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const MetricSeparator = styled.div`
    color: ${brandTheme.border};
    font-weight: bold;
    font-size: 16px;
`;

const RevenueDisplay = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: #374151;
`;

// Action Components
const ActionButtons = styled.div`
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
`;

const ActionButton = styled.button<{
    $variant: 'view' | 'edit' | 'delete' | 'info' | 'success';
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
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
        case 'edit':
            return `
                    background: ${brandTheme.status.warningLight};
                    color: ${brandTheme.status.warning};
                    &:hover {
                        background: ${brandTheme.status.warning};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        case 'info':
            return `
                    background: ${brandTheme.status.infoLight};
                    color: ${brandTheme.status.info};
                    &:hover {
                        background: ${brandTheme.status.info};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        case 'success':
            return `
                    background: ${brandTheme.status.successLight};
                    color: ${brandTheme.status.success};
                    &:hover {
                        background: ${brandTheme.status.success};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        case 'delete':
            return `
                    background: ${brandTheme.status.errorLight};
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
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 16px;
    padding: 24px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        padding: 16px;
    }
`;

const ClientCard = styled.div<{ $selected?: boolean }>`
    background: ${brandTheme.surface};
    border: 2px solid ${props => props.$selected ? brandTheme.primary : brandTheme.border};
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: ${props => props.$selected ? brandTheme.shadow.md : brandTheme.shadow.xs};

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
    gap: 12px;
`;

const CardTitle = styled.h4`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    flex: 1;
    min-width: 0;
`;

const CardHeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
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
    min-height: 24px;
`;

const CardLabel = styled.span`
    font-size: 14px;
    color: ${brandTheme.neutral};
    font-weight: 500;
    flex-shrink: 0;
`;

const CardValue = styled.span`
    font-size: 14px;
    color: #374151;
    font-weight: 600;
    text-align: right;
    word-break: break-word;
    flex: 1;
    margin-left: 12px;
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

export default ClientListTable;