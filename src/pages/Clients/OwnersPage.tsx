// src/pages/Clients/OwnersPage.tsx - Enhanced with URL navigation support
import React, {useState, useEffect, useImperativeHandle, forwardRef, useCallback, useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaSms, FaCheckSquare, FaSquare, FaUsers, FaFilter, FaFileExport, FaExclamationTriangle, FaTimes, FaPaperPlane, FaCheck } from 'react-icons/fa';
import { ClientExpanded } from '../../types';
import { clientsApi } from '../../api/clientsApi';
import ClientListTable from './components/ClientListTable';
import ClientDetailDrawer from './components/ClientDetailDrawer';
import ClientFilters, { ClientFilters as ClientFiltersType } from './components/ClientFilters';
import ClientFormModal from './components/ClientFormModal';
import ContactAttemptModal from './components/ContactAttemptModal';
import Modal from '../../components/common/Modal';
import DeleteConfirmationModal from "./modals/DeleteConfirmationModal";
import { TooltipWrapper } from './components/ClientListTable/styles/components';

// Professional Brand Theme
const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',
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
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    }
};

interface OwnersPageContentProps {
    onSetRef?: (ref: {
        handleAddClient?: () => void;
        handleExportClients?: () => void;
        handleOpenBulkSmsModal?: () => void;
        selectedClientIds?: string[];
        openClientDetail?: (clientId: string) => void;
    }) => void;
    // New props for URL navigation support
    initialClientId?: string;
    onNavigateToVehiclesByOwner?: (ownerId: string) => void;
    onClearDetailParams?: () => void;
    onClientSelected?: (clientId: string) => void;
    onClientClosed?: () => void;
}

const OwnersPageContent = forwardRef<{
    handleAddClient: () => void;
    handleExportClients: () => void;
    handleOpenBulkSmsModal: () => void;
    selectedClientIds: string[];
    openClientDetail: (clientId: string) => void;
}, OwnersPageContentProps>(({
                                onSetRef,
                                initialClientId,
                                onNavigateToVehiclesByOwner,
                                onClearDetailParams,
                                onClientSelected,
                                onClientClosed
                            }, ref) => {
    const navigate = useNavigate();

    // State
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

    // Filters
    const [filters, setFilters] = useState<ClientFiltersType>({
        name: '',
        email: '',
        phone: '',
        minVisits: '',
        minTransactions: '',
        minRevenue: ''
    });

    // Statistics
    const [stats, setStats] = useState({
        totalClients: 0,
        vipClients: 0,
        totalRevenue: 0,
        averageRevenue: 0
    });

    // Enhanced handlers with URL navigation support
    const handleAddClient = useCallback(() => {
        setSelectedClient(null);
        setShowAddModal(true);
    }, []);

    const handleExportClients = useCallback(() => {
        alert('Eksport danych klientów - funkcjonalność w przygotowaniu');
    }, []);

    const handleOpenBulkSmsModal = useCallback(() => {
        if (selectedClientIds.length === 0) {
            alert('Zaznacz co najmniej jednego klienta, aby wysłać SMS');
            return;
        }
        setShowBulkSmsModal(true);
    }, [selectedClientIds.length]);

    // Enhanced client detail opening with URL support
    const openClientDetail = useCallback((clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setSelectedClient(client);
            setShowDetailDrawer(true);
            onClientSelected?.(clientId);
        }
    }, [clients, onClientSelected]);

    // Enhanced client detail closing with URL cleanup
    const closeClientDetail = useCallback(() => {
        setShowDetailDrawer(false);
        setSelectedClient(null);
        // Always call onClientClosed to clear URL params
        onClientClosed?.();
    }, [onClientClosed]);

    const refObject = useMemo(() => ({
        handleAddClient,
        handleExportClients,
        handleOpenBulkSmsModal,
        selectedClientIds,
        openClientDetail
    }), [handleAddClient, handleExportClients, handleOpenBulkSmsModal, selectedClientIds, openClientDetail]);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => refObject, [refObject]);

    // Stable onSetRef callback
    const stableOnSetRef = useCallback(() => {
        if (onSetRef) {
            onSetRef(refObject);
        }
    }, [onSetRef, refObject]);

    // Notify parent when methods change
    useEffect(() => {
        stableOnSetRef();
    }, [stableOnSetRef]);

    // Handle initial client ID from URL
    useEffect(() => {
        if (initialClientId && clients.length > 0) {
            // Only open if not already open and client exists
            const client = clients.find(c => c.id === initialClientId);
            if (client && !showDetailDrawer) {
                openClientDetail(initialClientId);
            }
        }
    }, [initialClientId, clients.length, openClientDetail]);

    // Load clients on component mount
    useEffect(() => {
        const loadClients = async () => {
            try {
                setLoading(true);
                console.log('🔄 Loading clients using new API...');

                const result = await clientsApi.getClients({
                    page: 0,
                    size: 1000
                });

                if (result.success && result.data) {
                    const clientsData = result.data.data;
                    console.log('✅ Clients loaded successfully:', clientsData.length);

                    setClients(clientsData);
                    setFilteredClients(clientsData);

                    const totalRevenue = clientsData.reduce((sum, client) => sum + (client.totalRevenue || 0), 0);
                    const vipCount = clientsData.filter(client => (client.totalRevenue || 0) > 50000).length;

                    setStats({
                        totalClients: clientsData.length,
                        vipClients: vipCount,
                        totalRevenue,
                        averageRevenue: clientsData.length > 0 ? totalRevenue / clientsData.length : 0
                    });

                    setError(null);
                } else {
                    console.error('❌ Failed to load clients:', result.error);
                    setError(result.error || 'Nie udało się załadować listy klientów');
                    setClients([]);
                    setFilteredClients([]);
                }
            } catch (err) {
                console.error('❌ Error loading clients:', err);
                setError('Nie udało się załadować listy klientów');
                setClients([]);
                setFilteredClients([]);
            } finally {
                setLoading(false);
            }
        };

        loadClients();
    }, []);

    // Filter clients when filters change
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
                result = result.filter(client => (client.totalVisits || 0) >= minVisits);
            }
        }

        if (filters.minTransactions) {
            const minTransactions = parseInt(filters.minTransactions);
            if (!isNaN(minTransactions)) {
                result = result.filter(client => (client.totalTransactions || 0) >= minTransactions);
            }
        }

        if (filters.minRevenue) {
            const minRevenue = parseFloat(filters.minRevenue);
            if (!isNaN(minRevenue)) {
                result = result.filter(client => (client.totalRevenue || 0) >= minRevenue);
            }
        }

        // Update selectAll state
        if (result.length > 0) {
            const allFilteredSelected = result.every(client =>
                selectedClientIds.includes(client.id)
            );
            setSelectAll(allFilteredSelected);
        } else {
            setSelectAll(false);
        }

        setFilteredClients(result);
    }, [clients, filters, selectedClientIds]);

    // Handle selectAll effect
    useEffect(() => {
        if (selectAll) {
            setSelectedClientIds(prev => {
                const filteredIds = filteredClients.map(client => client.id);
                const existingSelected = prev.filter(id => !filteredIds.includes(id));
                return [...existingSelected, ...filteredIds];
            });
        }
    }, [selectAll, filteredClients]);

    const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            name: '',
            email: '',
            phone: '',
            minVisits: '',
            minTransactions: '',
            minRevenue: ''
        });
    }, []);

    const handleEditClient = useCallback((client: ClientExpanded) => {
        setSelectedClient(client);
        setShowAddModal(true);
    }, []);

    const handleSaveClient = useCallback(async (client: ClientExpanded) => {
        try {
            if (selectedClient) {
                const result = await clientsApi.updateClient(client.id, {
                    firstName: client.firstName,
                    lastName: client.lastName,
                    email: client.email,
                    phone: client.phone,
                    address: client.address,
                    company: client.company,
                    taxId: client.taxId,
                    notes: client.notes
                });

                if (result.success && result.data) {
                    setClients(clients.map(c => c.id === client.id ? result.data! : c));
                } else {
                    setError(result.error || 'Nie udało się zaktualizować klienta');
                    return;
                }
            } else {
                const result = await clientsApi.createClient({
                    firstName: client.firstName,
                    lastName: client.lastName,
                    email: client.email,
                    phone: client.phone,
                    address: client.address,
                    company: client.company,
                    taxId: client.taxId,
                    notes: client.notes
                });

                if (result.success && result.data) {
                    setClients(prev => [...prev, result.data!]);
                    setStats(prevStats => ({
                        ...prevStats,
                        totalClients: prevStats.totalClients + 1
                    }));
                } else {
                    setError(result.error || 'Nie udało się utworzyć klienta');
                    return;
                }
            }

            setShowAddModal(false);
        } catch (err) {
            console.error('Error saving client:', err);
            setError('Wystąpił błąd podczas zapisywania klienta');
        }
    }, [selectedClient, clients]);

    const handleDeleteClick = useCallback((clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setSelectedClient(client);
            setShowDeleteConfirm(true);
        }
    }, [clients]);

    const handleConfirmDelete = useCallback(async () => {
        if (!selectedClient) return;

        try {
            const result = await clientsApi.deleteClient(selectedClient.id);

            if (result.success) {
                setClients(clients.filter(c => c.id !== selectedClient.id));
                setSelectedClientIds(prev => prev.filter(id => id !== selectedClient.id));
                setShowDeleteConfirm(false);
                setSelectedClient(null);

                if (showDetailDrawer) {
                    closeClientDetail();
                }
            } else {
                setError(result.error || 'Nie udało się usunąć klienta');
            }
        } catch (err) {
            setError('Nie udało się usunąć klienta');
            console.error('Error deleting client:', err);
        }
    }, [selectedClient, clients, showDetailDrawer, closeClientDetail]);

    // Enhanced vehicle navigation handler
    const handleShowVehicles = useCallback((clientId: string) => {
        if (onNavigateToVehiclesByOwner) {
            onNavigateToVehiclesByOwner(clientId);
        } else {
            // Fallback to old navigation
            navigate(`/clients-vehicles?tab=vehicles&ownerId=${clientId}`);
        }
    }, [navigate, onNavigateToVehiclesByOwner]);

    const handleAddContactAttempt = useCallback((client: ClientExpanded) => {
        setSelectedClient(client);
        setShowContactModal(true);
    }, []);

    const handleContactSaved = useCallback(async () => {
        if (selectedClient) {
            const result = await clientsApi.getClientById(selectedClient.id);
            if (result.success && result.data) {
                const updatedClient = result.data;
                setClients(clients.map(c =>
                    c.id === updatedClient.id ? updatedClient : c
                ));
                setSelectedClient(updatedClient);
            }
        }
        setShowContactModal(false);
    }, [selectedClient, clients]);

    const handleSendSMS = useCallback((client: ClientExpanded) => {
        alert(`Symulacja wysyłania SMS do: ${client.firstName} ${client.lastName} (${client.phone})`);
    }, []);

    // Enhanced client selection handler
    const handleSelectClient = useCallback((client: ClientExpanded) => {
        setSelectedClient(client);
        setShowDetailDrawer(true);
        onClientSelected?.(client.id);
    }, [onClientSelected]);

    const toggleClientSelection = useCallback((clientId: string) => {
        setSelectedClientIds(currentSelected => {
            if (currentSelected.includes(clientId)) {
                return currentSelected.filter(id => id !== clientId);
            } else {
                return [...currentSelected, clientId];
            }
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        if (!newSelectAll) {
            const filteredIds = filteredClients.map(client => client.id);
            setSelectedClientIds(prev => prev.filter(id => !filteredIds.includes(id)));
        }
    }, [selectAll, filteredClients]);

    const handleSendBulkSms = useCallback(() => {
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
        setSelectedClientIds([]);
    }, [bulkSmsText, clients, selectedClientIds]);

    const formatCurrency = useCallback((amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
    }, []);

    return (
        <ContentContainer>
            {/* Statistics Dashboard */}
            <StatsSection>
                <StatsGrid>
                    <TooltipWrapper title="Całkowita liczba klientów zarejestrowanych w systemie CRM">
                        <StatCard>
                            <StatIcon $color={brandTheme.text.secondary}>
                                <FaUsers />
                            </StatIcon>
                            <StatContent>
                                <StatValue>{stats.totalClients}</StatValue>
                                <StatLabel>Łączna liczba klientów</StatLabel>
                            </StatContent>
                        </StatCard>
                    </TooltipWrapper>

                    <TooltipWrapper title="Klienci z przychodami powyżej 50 000 PLN - najwartościowsi klienci firmy">
                        <StatCard>
                            <StatIcon $color={brandTheme.text.secondary}>
                                <FaUsers />
                            </StatIcon>
                            <StatContent>
                                <StatValue>{stats.vipClients}</StatValue>
                                <StatLabel>Klienci VIP (50k+ PLN)</StatLabel>
                            </StatContent>
                        </StatCard>
                    </TooltipWrapper>

                    <TooltipWrapper title="Suma wszystkich przychodów wszystkich zakończonych wizyt w całej historii firmy">
                        <StatCard>
                            <StatIcon $color={brandTheme.text.secondary}>
                                <FaUsers />
                            </StatIcon>
                            <StatContent>
                                <StatValue>{formatCurrency(stats.totalRevenue)}</StatValue>
                                <StatLabel>Łączne przychody</StatLabel>
                            </StatContent>
                        </StatCard>
                    </TooltipWrapper>

                    <TooltipWrapper title="Średnia wartość przychodów przypadająca na jednego klienta">
                        <StatCard>
                            <StatIcon $color={brandTheme.text.secondary}>
                                <FaUsers />
                            </StatIcon>
                            <StatContent>
                                <StatValue>{formatCurrency(stats.averageRevenue)}</StatValue>
                                <StatLabel>Średni przychód na klienta</StatLabel>
                            </StatContent>
                        </StatCard>
                    </TooltipWrapper>
                </StatsGrid>
            </StatsSection>

            {/* Main Content */}
            <MainContent>
                {/* Filters */}
                <ClientFilters
                    filters={filters}
                    showFilters={showFilters}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                    onFilterChange={handleFilterChange}
                    onResetFilters={resetFilters}
                    resultCount={filteredClients.length}
                />

                {/* Error Display */}
                {error && (
                    <ErrorMessage>
                        <FaExclamationTriangle />
                        {error}
                    </ErrorMessage>
                )}

                {/* Loading State */}
                {loading ? (
                    <LoadingContainer>
                        <LoadingSpinner />
                        <LoadingText>Ładowanie danych klientów...</LoadingText>
                    </LoadingContainer>
                ) : (
                    <>
                        {/* Selection Bar */}
                        {filteredClients.length > 0 && (
                            <SelectionBar>
                                <SelectAllCheckbox onClick={toggleSelectAll}>
                                    {selectAll ? <FaCheckSquare /> : <FaSquare />}
                                    <span>
                                        Zaznacz wszystkich ({filteredClients.length})
                                    </span>
                                </SelectAllCheckbox>
                                {selectedClientIds.length > 0 && (
                                    <SelectionInfo>
                                        Zaznaczono: {selectedClientIds.length} {
                                        selectedClientIds.length === 1 ? 'klienta' :
                                            selectedClientIds.length > 1 && selectedClientIds.length < 5 ? 'klientów' : 'klientów'
                                    }
                                    </SelectionInfo>
                                )}
                            </SelectionBar>
                        )}

                        {/* Main Table Component */}
                        <TableContainer>
                            <ClientListTable
                                clients={filteredClients}
                                selectedClientIds={selectedClientIds}
                                onToggleSelection={toggleClientSelection}
                                onSelectClient={handleSelectClient}
                                onEditClient={handleEditClient}
                                onDeleteClient={handleDeleteClick}
                                onShowVehicles={handleShowVehicles}
                                onAddContactAttempt={handleAddContactAttempt}
                                onSendSMS={handleSendSMS}
                            />
                        </TableContainer>
                    </>
                )}
            </MainContent>

            {/* Detail Drawer */}
            <ClientDetailDrawer
                isOpen={showDetailDrawer}
                client={selectedClient}
                onClose={closeClientDetail}
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

            <DeleteConfirmationModal
                isOpen={showDeleteConfirm}
                client={selectedClient}
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />

            {/* Enhanced Bulk SMS Modal */}
            {showBulkSmsModal && (
                <Modal
                    isOpen={showBulkSmsModal}
                    onClose={() => setShowBulkSmsModal(false)}
                    title="Masowe wysyłanie SMS"
                >
                    <BulkSmsContent>
                        <BulkSmsHeader>
                            <BulkSmsIcon>
                                <FaSms />
                            </BulkSmsIcon>
                            <BulkSmsInfo>
                                <BulkSmsTitle>
                                    Wysyłanie SMS do {selectedClientIds.length} {
                                    selectedClientIds.length === 1 ? 'klienta' :
                                        selectedClientIds.length > 1 && selectedClientIds.length < 5 ? 'klientów' : 'klientów'
                                }
                                </BulkSmsTitle>
                                <BulkSmsSubtitle>
                                    Wiadomość zostanie wysłana do wszystkich zaznaczonych klientów
                                </BulkSmsSubtitle>
                            </BulkSmsInfo>
                        </BulkSmsHeader>

                        <SmsFormSection>
                            <SmsFormGroup>
                                <SmsLabel>Treść wiadomości SMS:</SmsLabel>
                                <SmsTextarea
                                    value={bulkSmsText}
                                    onChange={(e) => setBulkSmsText(e.target.value)}
                                    placeholder="Wprowadź treść wiadomości SMS..."
                                    rows={5}
                                    maxLength={160}
                                />
                                <SmsCharacterCounter $nearLimit={bulkSmsText.length > 140}>
                                    {bulkSmsText.length}/160 znaków
                                    {bulkSmsText.length > 140 && (
                                        <span> - Zbliżasz się do limitu!</span>
                                    )}
                                </SmsCharacterCounter>
                            </SmsFormGroup>
                        </SmsFormSection>

                        <BulkSmsActions>
                            <SecondaryButton onClick={() => setShowBulkSmsModal(false)}>
                                Anuluj
                            </SecondaryButton>
                            <PrimaryButton
                                onClick={handleSendBulkSms}
                                disabled={bulkSmsText.trim() === ''}
                            >
                                Wyślij SMS ({selectedClientIds.length})
                            </PrimaryButton>
                        </BulkSmsActions>
                    </BulkSmsContent>
                </Modal>
            )}
        </ContentContainer>
    );
})

// Styled Components
const ContentContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: ${brandTheme.surfaceAlt};
`;

const StatsSection = styled.section`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl} 0;
    width: 100%;

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg} 0;
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.md} 0;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: ${brandTheme.spacing.lg};
    margin-bottom: ${brandTheme.spacing.lg};

    @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
        gap: ${brandTheme.spacing.md};
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${brandTheme.spacing.md};
    }
`;

const StatCard = styled.div`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.xl};
    padding: ${brandTheme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${brandTheme.shadow.xs};
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${brandTheme.shadow.lg};
        border-color: ${brandTheme.primary};
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    &:hover::before {
        opacity: 1;
    }
`;

const StatIcon = styled.div<{ $color: string }>`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 24px;
    flex-shrink: 0;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;

const StatContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const StatValue = styled.div`
    font-size: 28px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
    letter-spacing: -0.025em;
    line-height: 1.1;

    @media (max-width: 768px) {
        font-size: 24px;
    }
`;

const StatLabel = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    line-height: 1.3;
`;

const MainContent = styled.div`
    flex: 1;
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 ${brandTheme.spacing.xl} ${brandTheme.spacing.xl};
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
    min-height: 0;

    @media (max-width: 1024px) {
        padding: 0 ${brandTheme.spacing.lg} ${brandTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${brandTheme.spacing.md} ${brandTheme.spacing.md};
        gap: ${brandTheme.spacing.md};
    }
`;

const SelectionBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: linear-gradient(135deg, ${brandTheme.primaryGhost} 0%, rgba(26, 54, 93, 0.02) 100%);
    border: 1px solid ${brandTheme.borderLight};
    border-radius: ${brandTheme.radius.lg};
    margin-bottom: ${brandTheme.spacing.md};
`;

const SelectAllCheckbox = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    cursor: pointer;
    color: ${brandTheme.text.primary};
    font-weight: 500;
    font-size: 14px;
    transition: all 0.2s ease;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.md};

    svg {
        color: ${brandTheme.primary};
        font-size: 18px;
        transition: transform 0.2s ease;
    }

    &:hover {
        color: ${brandTheme.primary};
        background: ${brandTheme.primaryGhost};

        svg {
            transform: scale(1.1);
        }
    }
`;

const SelectionInfo = styled.div`
    font-size: 14px;
    color: ${brandTheme.primary};
    font-weight: 600;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.primary}30;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    gap: ${brandTheme.spacing.md};
    min-height: 400px;
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${brandTheme.borderLight};
    border-top: 3px solid ${brandTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.status.error}30;
    font-weight: 500;
    box-shadow: ${brandTheme.shadow.xs};

    svg {
        font-size: 18px;
        flex-shrink: 0;
    }
`;

const TableContainer = styled.div`
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 400px);

    @media (max-width: 1024px) {
        max-height: calc(100vh - 350px);
    }

    @media (max-width: 768px) {
        max-height: calc(100vh - 300px);
    }
`;

// Bulk SMS Modal styles
const BulkSmsContent = styled.div`
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.md};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xl};
`;

const BulkSmsHeader = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.md};
    align-items: flex-start;
    padding-bottom: ${brandTheme.spacing.lg};
    border-bottom: 2px solid ${brandTheme.borderLight};
`;

const BulkSmsIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${brandTheme.status.success} 0%, #10b981 100%);
    border-radius: ${brandTheme.radius.xl};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${brandTheme.shadow.lg};
    flex-shrink: 0;
`;

const BulkSmsInfo = styled.div`
    flex: 1;
`;

const BulkSmsTitle = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
    letter-spacing: -0.025em;
`;

const BulkSmsSubtitle = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    line-height: 1.5;
`;

const SmsFormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
`;

const SmsFormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const SmsLabel = styled.label`
    font-weight: 600;
    font-size: 14px;
    color: ${brandTheme.text.primary};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
`;

const SmsTextarea = styled.textarea`
    width: 100%;
    padding: ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    font-size: 15px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    resize: vertical;
    min-height: 120px;
    font-family: inherit;
    line-height: 1.6;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 4px ${brandTheme.primaryGhost};
        transform: translateY(-1px);
    }

    &::placeholder {
        color: ${brandTheme.text.tertiary};
        font-weight: 400;
    }
`;

const SmsCharacterCounter = styled.div<{ $nearLimit?: boolean }>`
    font-size: 12px;
    color: ${props => props.$nearLimit ? brandTheme.status.warning : brandTheme.text.muted};
    text-align: right;
    font-weight: 500;

    span {
        color: ${brandTheme.status.error};
        font-weight: 600;
    }
`;

const BulkSmsActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.sm};
    padding-top: ${brandTheme.spacing.lg};
    border-top: 2px solid ${brandTheme.borderLight};
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;

    &:hover {
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const PrimaryButton = styled(BaseButton)`
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${brandTheme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const SecondaryButton = styled(BaseButton)`
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border-color: ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.xs};

    &:hover {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.text.primary};
        border-color: ${brandTheme.borderHover};
        box-shadow: ${brandTheme.shadow.sm};
    }
`;

export default OwnersPageContent;