import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaSms, FaCheckSquare, FaSquare, FaEye, FaEdit, FaCar, FaTrash, FaHistory, FaFilter, FaUsers, FaGripVertical } from 'react-icons/fa';
import { ClientExpanded } from '../../types';
import { clientApi } from '../../api/clientsApi';
import ClientDetailDrawer from './components/ClientDetailDrawer';
import ClientFilters, { ClientFilters as ClientFiltersType } from './components/ClientFilters';
import ClientFormModal from './components/ClientFormModal';
import ContactAttemptModal from './components/ContactAttemptModal';
import Modal from '../../components/common/Modal';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Brand Theme System - Automotive Premium
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    accent: '#f8fafc',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
};

const COLUMN_ORDER_KEY = 'clients_table_columns_order';
const COLUMN_TYPE = 'column';

// Table Column Configuration
interface TableColumn {
    id: string;
    label: string;
    width: string;
    sortable?: boolean;
}

const defaultColumns: TableColumn[] = [
    { id: 'selection', label: '', width: '60px', sortable: false },
    { id: 'client', label: 'Klient', width: '25%', sortable: true },
    { id: 'contact', label: 'Kontakt', width: '20%', sortable: true },
    { id: 'company', label: 'Firma', width: '18%', sortable: true },
    { id: 'stats', label: 'Statystyki', width: '15%', sortable: true },
    { id: 'revenue', label: 'Przychody', width: '12%', sortable: true },
    { id: 'actions', label: 'Akcje', width: '10%', sortable: false }
];

// Draggable Column Header Component
interface ColumnHeaderProps {
    column: TableColumn;
    index: number;
    moveColumn: (dragIndex: number, hoverIndex: number) => void;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({ column, index, moveColumn }) => {
    const ref = React.useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag({
        type: COLUMN_TYPE,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: COLUMN_TYPE,
        hover: (item: any) => {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;
            moveColumn(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    drag(drop(ref));

    if (column.id === 'selection') {
        return (
            <HeaderCell $width={column.width}>
                <SelectionHeaderContent>
                    <FaCheckSquare />
                </SelectionHeaderContent>
            </HeaderCell>
        );
    }

    return (
        <HeaderCell
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
        </HeaderCell>
    );
};

const OwnersPage: React.FC = () => {
    const navigate = useNavigate();

    // State management
    const [clients, setClients] = useState<ClientExpanded[]>([]);
    const [filteredClients, setFilteredClients] = useState<ClientExpanded[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI state
    const [showFilters, setShowFilters] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<ClientExpanded | null>(null);
    const [showDetailDrawer, setShowDetailDrawer] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Bulk operations state
    const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
    const [showBulkSmsModal, setShowBulkSmsModal] = useState(false);
    const [bulkSmsText, setBulkSmsText] = useState('');
    const [selectAll, setSelectAll] = useState(false);

    // Table configuration
    const [columns, setColumns] = useState<TableColumn[]>(() => {
        try {
            const savedOrder = localStorage.getItem(COLUMN_ORDER_KEY);
            return savedOrder ? JSON.parse(savedOrder) : defaultColumns;
        } catch (e) {
            return defaultColumns;
        }
    });

    // Filters
    const [filters, setFilters] = useState<ClientFiltersType>({
        name: '',
        email: '',
        phone: '',
        minVisits: '',
        minTransactions: '',
        minRevenue: ''
    });

    // Save column configuration
    useEffect(() => {
        try {
            localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(columns));
        } catch (e) {
            console.error("Error saving column order:", e);
        }
    }, [columns]);

    // Column reordering
    const moveColumn = (dragIndex: number, hoverIndex: number) => {
        const draggedColumn = columns[dragIndex];
        const newColumns = [...columns];
        newColumns.splice(dragIndex, 1);
        newColumns.splice(hoverIndex, 0, draggedColumn);
        setColumns(newColumns);
    };

    // Load clients
    useEffect(() => {
        const loadClients = async () => {
            try {
                setLoading(true);
                const data = await clientApi.fetchClients();
                setClients(data);
                setFilteredClients(data);
                setError(null);
            } catch (err) {
                setError('Nie udało się załadować listy klientów');
                console.error('Error loading clients:', err);
            } finally {
                setLoading(false);
            }
        };
        loadClients();
    }, []);

    // Filter clients
    useEffect(() => {
        let result = [...clients];

        if (filters.name) {
            const nameQuery = filters.name.toLowerCase();
            result = result.filter(client =>
                `${client.firstName} ${client.lastName}`.toLowerCase().includes(nameQuery)
            );
        }

        if (filters.email) {
            const emailQuery = filters.email.toLowerCase();
            result = result.filter(client =>
                client.email.toLowerCase().includes(emailQuery)
            );
        }

        if (filters.phone) {
            const phoneQuery = filters.phone.toLowerCase();
            result = result.filter(client =>
                client.phone.toLowerCase().includes(phoneQuery)
            );
        }

        if (filters.minVisits) {
            const minVisits = parseInt(filters.minVisits);
            if (!isNaN(minVisits)) {
                result = result.filter(client => client.totalVisits >= minVisits);
            }
        }

        if (filters.minTransactions) {
            const minTransactions = parseInt(filters.minTransactions);
            if (!isNaN(minTransactions)) {
                result = result.filter(client => client.totalTransactions >= minTransactions);
            }
        }

        if (filters.minRevenue) {
            const minRevenue = parseFloat(filters.minRevenue);
            if (!isNaN(minRevenue)) {
                result = result.filter(client => client.totalRevenue >= minRevenue);
            }
        }

        setFilteredClients(result);

        // Update select all state
        if (result.length > 0) {
            const allSelected = result.every(client => selectedClientIds.includes(client.id));
            setSelectAll(allSelected);
        } else {
            setSelectAll(false);
        }
    }, [clients, filters, selectedClientIds]);

    // Handlers
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({
            name: '',
            email: '',
            phone: '',
            minVisits: '',
            minTransactions: '',
            minRevenue: ''
        });
    };

    const toggleClientSelection = (clientId: string) => {
        setSelectedClientIds(current => {
            if (current.includes(clientId)) {
                return current.filter(id => id !== clientId);
            } else {
                return [...current, clientId];
            }
        });
    };

    const toggleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        if (newSelectAll) {
            setSelectedClientIds(prev => {
                const filteredIds = filteredClients.map(client => client.id);
                const existingSelected = prev.filter(id => !filteredIds.includes(id));
                return [...existingSelected, ...filteredIds];
            });
        } else {
            const filteredIds = filteredClients.map(client => client.id);
            setSelectedClientIds(prev => prev.filter(id => !filteredIds.includes(id)));
        }
    };

    const handleAddClient = () => {
        setSelectedClient(null);
        setShowAddModal(true);
    };

    const handleEditClient = (client: ClientExpanded) => {
        setSelectedClient(client);
        setShowAddModal(true);
    };

    const handleSaveClient = (client: ClientExpanded) => {
        if (selectedClient) {
            setClients(clients.map(c => c.id === client.id ? client : c));
        } else {
            setClients(prev => [...prev, client]);
        }
        setShowAddModal(false);
    };

    const handleDeleteClick = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setSelectedClient(client);
            setShowDeleteConfirm(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedClient) return;

        try {
            await clientApi.deleteClient(selectedClient.id);
            setClients(clients.filter(c => c.id !== selectedClient.id));
            setShowDeleteConfirm(false);
            setSelectedClient(null);

            if (showDetailDrawer) {
                setShowDetailDrawer(false);
            }
        } catch (err) {
            setError('Nie udało się usunąć klienta');
            console.error('Error deleting client:', err);
        }
    };

    const handleShowVehicles = (clientId: string) => {
        navigate(`/clients/vehicles?ownerId=${clientId}`);
    };

    const handleAddContactAttempt = (client: ClientExpanded) => {
        setSelectedClient(client);
        setShowContactModal(true);
    };

    const handleContactSaved = () => {
        if (selectedClient) {
            const updatedClient = {
                ...selectedClient,
                contactAttempts: selectedClient.contactAttempts + 1
            };

            setClients(clients.map(c =>
                c.id === updatedClient.id ? updatedClient : c
            ));

            setSelectedClient(updatedClient);
        }
        setShowContactModal(false);
    };

    const handleSendSMS = (client: ClientExpanded) => {
        alert(`Symulacja wysyłania SMS do: ${client.firstName} ${client.lastName} (${client.phone})`);
    };

    const handleSelectClient = (client: ClientExpanded) => {
        setSelectedClient(client);
        setShowDetailDrawer(true);
    };

    const handleOpenBulkSmsModal = () => {
        if (selectedClientIds.length === 0) {
            alert('Zaznacz co najmniej jednego klienta, aby wysłać SMS');
            return;
        }
        setShowBulkSmsModal(true);
    };

    const handleSendBulkSms = () => {
        if (bulkSmsText.trim() === '') {
            alert('Wprowadź treść wiadomości SMS');
            return;
        }

        const selectedClients = clients.filter(client =>
            selectedClientIds.includes(client.id)
        );

        const recipientsList = selectedClients.map(client =>
            `${client.firstName} ${client.lastName} (${client.phone})`
        ).join('\n');

        alert(`Wysłano SMS o treści:\n${bulkSmsText}\n\nDo odbiorców:\n${recipientsList}`);

        setBulkSmsText('');
        setShowBulkSmsModal(false);
    };

    const renderTableCell = (client: ClientExpanded, columnId: string) => {
        switch (columnId) {
            case 'selection':
                return (
                    <SelectionCell onClick={(e) => {
                        e.stopPropagation();
                        toggleClientSelection(client.id);
                    }}>
                        <SelectionCheckbox $selected={selectedClientIds.includes(client.id)}>
                            {selectedClientIds.includes(client.id) ? <FaCheckSquare /> : <FaSquare />}
                        </SelectionCheckbox>
                    </SelectionCell>
                );

            case 'client':
                return (
                    <ClientInfo>
                        <ClientName>{client.firstName} {client.lastName}</ClientName>
                        {client.lastVisitDate && (
                            <ClientSubInfo>
                                Ostatnia wizyta: {formatDate(client.lastVisitDate)}
                            </ClientSubInfo>
                        )}
                    </ClientInfo>
                );

            case 'contact':
                return (
                    <ContactInfo>
                        <ContactItem>
                            <ContactIcon>@</ContactIcon>
                            <ContactText>{client.email}</ContactText>
                        </ContactItem>
                        <ContactItem>
                            <ContactIcon>📞</ContactIcon>
                            <ContactText>{client.phone}</ContactText>
                        </ContactItem>
                    </ContactInfo>
                );

            case 'company':
                return (
                    <CompanyInfo>
                        {client.company ? (
                            <>
                                <CompanyName>{client.company}</CompanyName>
                                {client.taxId && <CompanyTax>NIP: {client.taxId}</CompanyTax>}
                            </>
                        ) : (
                            <EmptyField>Brak danych</EmptyField>
                        )}
                    </CompanyInfo>
                );

            case 'stats':
                return (
                    <StatsContainer>
                        <StatItem>
                            <StatValue>{client.totalVisits}</StatValue>
                            <StatLabel>wizyt</StatLabel>
                        </StatItem>
                        <StatItem>
                            <StatValue>{client.contactAttempts}</StatValue>
                            <StatLabel>kontaktów</StatLabel>
                        </StatItem>
                    </StatsContainer>
                );

            case 'revenue':
                return (
                    <RevenueDisplay>
                        <RevenueAmount>{client.totalRevenue.toFixed(2)}</RevenueAmount>
                        <RevenueCurrency>PLN</RevenueCurrency>
                    </RevenueDisplay>
                );

            case 'actions':
                return (
                    <ActionButtons onClick={(e) => e.stopPropagation()}>
                        <ActionButton
                            title="Zobacz szczegóły"
                            $variant="view"
                            onClick={() => handleSelectClient(client)}
                        >
                            <FaEye />
                        </ActionButton>
                        <ActionButton
                            title="Edytuj klienta"
                            $variant="edit"
                            onClick={() => handleEditClient(client)}
                        >
                            <FaEdit />
                        </ActionButton>
                        <ActionButton
                            title="Pojazdy klienta"
                            $variant="secondary"
                            onClick={() => handleShowVehicles(client.id)}
                        >
                            <FaCar />
                        </ActionButton>
                        <ActionButton
                            title="Dodaj kontakt"
                            $variant="secondary"
                            onClick={() => handleAddContactAttempt(client)}
                        >
                            <FaHistory />
                        </ActionButton>
                        <ActionButton
                            title="Wyślij SMS"
                            $variant="secondary"
                            onClick={() => handleSendSMS(client)}
                        >
                            <FaSms />
                        </ActionButton>
                        <ActionButton
                            title="Usuń klienta"
                            $variant="delete"
                            onClick={() => handleDeleteClick(client.id)}
                        >
                            <FaTrash />
                        </ActionButton>
                    </ActionButtons>
                );

            default:
                return null;
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

    if (loading && filteredClients.length === 0) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie danych klientów...</LoadingText>
                </LoadingContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <HeaderLeft>
                    <HeaderIcon>
                        <FaUsers />
                    </HeaderIcon>
                    <HeaderContent>
                        <HeaderTitle>Klienci</HeaderTitle>
                        <HeaderSubtitle>
                            Zarządzanie bazą klientów detailing studio
                        </HeaderSubtitle>
                    </HeaderContent>
                </HeaderLeft>
                <HeaderActions>
                    {selectedClientIds.length > 0 && (
                        <BulkActionButton onClick={handleOpenBulkSmsModal}>
                            <FaSms />
                            SMS ({selectedClientIds.length})
                        </BulkActionButton>
                    )}
                    <PrimaryButton onClick={handleAddClient}>
                        <FaPlus />
                        Dodaj klienta
                    </PrimaryButton>
                </HeaderActions>
            </PageHeader>

            <ContentContainer>
                {/* Filters Section */}
                <FiltersSection>
                    <FiltersToggle onClick={() => setShowFilters(!showFilters)}>
                        <FaFilter />
                        {showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
                    </FiltersToggle>

                    {showFilters && (
                        <ClientFilters
                            filters={filters}
                            showFilters={showFilters}
                            onToggleFilters={() => setShowFilters(!showFilters)}
                            onFilterChange={handleFilterChange}
                            onResetFilters={resetFilters}
                            resultCount={filteredClients.length}
                        />
                    )}
                </FiltersSection>

                {error && (
                    <ErrorContainer>
                        <ErrorIcon>⚠️</ErrorIcon>
                        <ErrorText>{error}</ErrorText>
                    </ErrorContainer>
                )}

                {filteredClients.length === 0 && !loading ? (
                    <EmptyStateContainer>
                        <EmptyIcon>
                            <FaUsers />
                        </EmptyIcon>
                        <EmptyTitle>
                            {Object.values(filters).some(val => val !== '')
                                ? 'Brak wyników'
                                : 'Brak klientów'
                            }
                        </EmptyTitle>
                        <EmptyDescription>
                            {Object.values(filters).some(val => val !== '')
                                ? 'Nie znaleziono klientów spełniających kryteria filtrowania.'
                                : 'Rozpocznij budowanie bazy klientów dla swojego detailing studio.'
                            }
                        </EmptyDescription>
                        {Object.values(filters).every(val => val === '') && (
                            <EmptyAction onClick={handleAddClient}>
                                Dodaj pierwszego klienta
                            </EmptyAction>
                        )}
                    </EmptyStateContainer>
                ) : (
                    <>
                        {/* Selection Bar */}
                        <SelectionBar>
                            <SelectionLeft>
                                <SelectAllButton onClick={toggleSelectAll}>
                                    {selectAll ? <FaCheckSquare /> : <FaSquare />}
                                    <span>Zaznacz wszystkich ({filteredClients.length})</span>
                                </SelectAllButton>
                                {selectedClientIds.length > 0 && (
                                    <SelectionInfo>
                                        Zaznaczono: {selectedClientIds.length} {
                                        selectedClientIds.length === 1 ? 'klienta' :
                                            selectedClientIds.length > 1 && selectedClientIds.length < 5 ? 'klientów' : 'klientów'
                                    }
                                    </SelectionInfo>
                                )}
                            </SelectionLeft>
                        </SelectionBar>

                        {/* Clients Table */}
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
                                    {filteredClients.map(client => (
                                        <TableRow
                                            key={client.id}
                                            onClick={() => handleSelectClient(client)}
                                        >
                                            {columns.map(column => (
                                                <TableCell
                                                    key={`${client.id}-${column.id}`}
                                                    $width={column.width}
                                                >
                                                    {renderTableCell(client, column.id)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </TableContainer>
                        </DndProvider>
                    </>
                )}
            </ContentContainer>

            {/* Detail Drawer */}
            <ClientDetailDrawer
                isOpen={showDetailDrawer}
                client={selectedClient}
                onClose={() => setShowDetailDrawer(false)}
            />

            {/* Modals */}
            {showAddModal && (
                <ClientFormModal
                    client={selectedClient}
                    onSave={handleSaveClient}
                    onCancel={() => setShowAddModal(false)}
                />
            )}

            {showContactModal && selectedClient && (
                <ContactAttemptModal
                    client={selectedClient}
                    onSave={handleContactSaved}
                    onCancel={() => setShowContactModal(false)}
                />
            )}

            {showDeleteConfirm && selectedClient && (
                <Modal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    title="Potwierdź usunięcie"
                >
                    <DeleteConfirmContent>
                        <DeleteMessage>
                            Czy na pewno chcesz usunąć klienta{' '}
                            <strong>{selectedClient.firstName} {selectedClient.lastName}</strong>?
                        </DeleteMessage>
                        <DeleteWarning>Ta operacja jest nieodwracalna.</DeleteWarning>

                        <DeleteButtons>
                            <SecondaryButton onClick={() => setShowDeleteConfirm(false)}>
                                Anuluj
                            </SecondaryButton>
                            <DeleteButton onClick={handleConfirmDelete}>
                                Usuń klienta
                            </DeleteButton>
                        </DeleteButtons>
                    </DeleteConfirmContent>
                </Modal>
            )}

            {showBulkSmsModal && (
                <Modal
                    isOpen={showBulkSmsModal}
                    onClose={() => setShowBulkSmsModal(false)}
                    title="Wyślij SMS do zaznaczonych klientów"
                >
                    <BulkSmsContent>
                        <BulkSmsInfo>
                            Wiadomość zostanie wysłana do {selectedClientIds.length}{' '}
                            {selectedClientIds.length === 1 ? 'klienta' :
                                selectedClientIds.length > 1 && selectedClientIds.length < 5 ? 'klientów' : 'klientów'}
                        </BulkSmsInfo>

                        <SmsFormGroup>
                            <SmsLabel>Treść wiadomości:</SmsLabel>
                            <SmsTextarea
                                value={bulkSmsText}
                                onChange={(e) => setBulkSmsText(e.target.value)}
                                placeholder="Wprowadź treść wiadomości SMS..."
                                rows={5}
                                maxLength={160}
                            />
                            <SmsCounter>
                                {bulkSmsText.length}/160 znaków
                            </SmsCounter>
                        </SmsFormGroup>

                        <RecipientsSection>
                            <SmsLabel>Lista odbiorców:</SmsLabel>
                            <RecipientsList>
                                {clients
                                    .filter(client => selectedClientIds.includes(client.id))
                                    .map(client => (
                                        <RecipientItem key={client.id}>
                                            <RecipientName>
                                                {client.firstName} {client.lastName}
                                            </RecipientName>
                                            <RecipientPhone>{client.phone}</RecipientPhone>
                                        </RecipientItem>
                                    ))
                                }
                            </RecipientsList>
                        </RecipientsSection>

                        <BulkSmsButtons>
                            <SecondaryButton onClick={() => setShowBulkSmsModal(false)}>
                                Anuluj
                            </SecondaryButton>
                            <SendButton
                                onClick={handleSendBulkSms}
                                disabled={bulkSmsText.trim() === ''}
                            >
                                <FaSms />
                                Wyślij SMS
                            </SendButton>
                        </BulkSmsButtons>
                    </BulkSmsContent>
                </Modal>
            )}
        </PageContainer>
    );
};

// Modern Styled Components - Automotive Premium Design
const PageContainer = styled.div`
    background: ${brandTheme.accent};
    min-height: 100vh;
    padding: 0;
`;

const PageHeader = styled.div`
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.border};
    padding: 24px 32px;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);

    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const HeaderIcon = styled.div`
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    box-shadow: 0 4px 12px ${brandTheme.primaryGhost};
`;

const HeaderTitle = styled.h1`
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.5px;
`;

const HeaderSubtitle = styled.p`
    font-size: 14px;
    color: ${brandTheme.neutral};
    margin: 0;
    font-weight: 500;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 12px;
    align-items: center;
`;

const PrimaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background: ${brandTheme.primary};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
        background: ${brandTheme.primaryDark};
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:active {
        transform: translateY(0);
    }
`;

const BulkActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background: ${brandTheme.success};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 16px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
        background: #059669;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
`;

const ContentContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 32px;
`;

const FiltersSection = styled.div`
    background: ${brandTheme.surface};
    border-radius: 12px;
    border: 1px solid ${brandTheme.border};
    margin-bottom: 24px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const FiltersToggle = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 16px 24px;
    background: ${brandTheme.surfaceAlt};
    border: none;
    border-bottom: 1px solid ${brandTheme.border};
    color: ${brandTheme.neutral};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryGhost};
        color: ${brandTheme.primary};
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120px 20px;
    background: ${brandTheme.surface};
    border-radius: 16px;
    margin: 24px 32px;
    border: 1px solid ${brandTheme.border};
`;

const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 3px solid ${brandTheme.border};
    border-top: 3px solid ${brandTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${brandTheme.neutral};
    font-weight: 500;
`;

const ErrorContainer = styled.div`
    background: linear-gradient(135deg, #fef2f2 0%, #fdf2f8 100%);
    border: 1px solid #fecaca;
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);
`;

const ErrorIcon = styled.div`
    font-size: 18px;
`;

const ErrorText = styled.div`
    color: #dc2626;
    font-weight: 500;
    font-size: 14px;
`;

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

const EmptyIcon = styled.div`
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

const EmptyTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
    font-size: 16px;
    color: ${brandTheme.neutral};
    margin: 0 0 20px 0;
    line-height: 1.5;
    max-width: 400px;
`;

const EmptyAction = styled.button`
    background: ${brandTheme.primary};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryDark};
        transform: translateY(-1px);
    }
`;

const SelectionBar = styled.div`
    background: ${brandTheme.surface};
    border-radius: 12px;
    border: 1px solid ${brandTheme.border};
    padding: 16px 24px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const SelectionLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const SelectAllButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: ${brandTheme.neutral};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryGhost};
        color: ${brandTheme.primary};
    }

    svg {
        font-size: 16px;
    }
`;

const SelectionInfo = styled.div`
    font-size: 14px;
    color: ${brandTheme.primary};
    font-weight: 500;
    background: ${brandTheme.primaryGhost};
    padding: 6px 12px;
    border-radius: 20px;
`;

// Table Components
const TableContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: 16px;
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.div`
    display: flex;
    background: ${brandTheme.surfaceAlt};
    border-bottom: 2px solid ${brandTheme.border};
    min-height: 56px;
`;

const HeaderCell = styled.div<{ $isDragging?: boolean; $width: string }>`
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

    ${HeaderCell}:hover & {
        opacity: 1;
    }
`;

const HeaderLabel = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: #374151;
`;

const SelectionHeaderContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    color: ${brandTheme.neutral};
    font-size: 16px;
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

const TableCell = styled.div<{ $width: string }>`
    flex: 0 0 ${props => props.$width};
    width: ${props => props.$width};
    padding: 16px;
    display: flex;
    align-items: center;
    min-height: 72px;
    border-right: 1px solid ${brandTheme.border};

    &:last-child {
        border-right: none;
    }
`;

// Cell Content Components
const SelectionCell = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    cursor: pointer;
`;

const SelectionCheckbox = styled.div<{ $selected: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    transition: all 0.2s ease;
    color: ${props => props.$selected ? brandTheme.primary : brandTheme.neutral};
    font-size: 16px;

    &:hover {
        color: ${brandTheme.primary};
        background: ${brandTheme.primaryGhost};
    }
`;

const ClientInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
`;

const ClientName = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
`;

const ClientSubInfo = styled.div`
    font-size: 13px;
    color: ${brandTheme.neutral};
    font-weight: 500;
`;

const ContactInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
`;

const ContactItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const ContactIcon = styled.div`
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: ${brandTheme.neutral};
`;

const ContactText = styled.div`
    font-size: 14px;
    color: #374151;
    font-weight: 500;
`;

const CompanyInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
`;

const CompanyName = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
`;

const CompanyTax = styled.div`
    font-size: 13px;
    color: ${brandTheme.neutral};
    font-weight: 500;
`;

const EmptyField = styled.div`
    font-size: 14px;
    color: ${brandTheme.neutral};
    font-style: italic;
`;

const StatsContainer = styled.div`
    display: flex;
    gap: 16px;
    width: 100%;
`;

const StatItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
`;

const StatValue = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${brandTheme.primary};
`;

const StatLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.neutral};
    font-weight: 500;
`;

const RevenueDisplay = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    width: 100%;
`;

const RevenueAmount = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${brandTheme.success};
`;

const RevenueCurrency = styled.div`
    font-size: 12px;
    color: ${brandTheme.neutral};
    font-weight: 500;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
`;

const ActionButton = styled.button<{
    $variant: 'view' | 'edit' | 'delete' | 'secondary';
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 12px;

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
        case 'secondary':
            return `
                    background: ${brandTheme.surfaceAlt};
                    color: ${brandTheme.neutral};
                    &:hover {
                        background: ${brandTheme.neutral};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
    }
}}
`;

// Modal Content Components
const DeleteConfirmContent = styled.div`
    padding: 16px 0;
`;

const DeleteMessage = styled.p`
    font-size: 16px;
    color: #374151;
    margin: 0 0 8px 0;
    line-height: 1.5;
`;

const DeleteWarning = styled.p`
    font-size: 14px;
    color: ${brandTheme.error};
    margin: 0 0 24px 0;
    font-weight: 500;
`;

const DeleteButtons = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
`;

const SecondaryButton = styled.button`
    padding: 10px 16px;
    background: ${brandTheme.surfaceAlt};
    color: ${brandTheme.neutral};
    border: 1px solid ${brandTheme.border};
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.border};
        color: #374151;
    }
`;

const DeleteButton = styled.button`
    padding: 10px 16px;
    background: ${brandTheme.error};
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #dc2626;
        transform: translateY(-1px);
    }
`;

// Bulk SMS Modal Components
const BulkSmsContent = styled.div`
    padding: 16px 0;
`;

const BulkSmsInfo = styled.p`
    font-size: 16px;
    color: #374151;
    margin: 0 0 20px 0;
    padding: 12px 16px;
    background: ${brandTheme.primaryGhost};
    border-radius: 8px;
    border: 1px solid rgba(37, 99, 235, 0.2);
`;

const SmsFormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
`;

const SmsLabel = styled.label`
    font-weight: 600;
    font-size: 14px;
    color: #374151;
`;

const SmsTextarea = styled.textarea`
    padding: 12px 16px;
    border: 2px solid ${brandTheme.border};
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.neutral};
    }
`;

const SmsCounter = styled.div`
    font-size: 12px;
    color: ${brandTheme.neutral};
    text-align: right;
    margin-top: 4px;
`;

const RecipientsSection = styled.div`
    margin-bottom: 20px;
`;

const RecipientsList = styled.div`
    max-height: 200px;
    overflow-y: auto;
    border: 2px solid ${brandTheme.border};
    border-radius: 8px;
    background: ${brandTheme.surfaceAlt};
`;

const RecipientItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid ${brandTheme.border};

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: ${brandTheme.surface};
    }
`;

const RecipientName = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #374151;
`;

const RecipientPhone = styled.div`
    font-size: 14px;
    color: ${brandTheme.neutral};
`;

const BulkSmsButtons = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid ${brandTheme.border};
`;

const SendButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: ${brandTheme.success};
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: #059669;
        transform: translateY(-1px);
    }

    &:disabled {
        background: ${brandTheme.neutral};
        cursor: not-allowed;
        transform: none;
    }
`;

export default OwnersPage;