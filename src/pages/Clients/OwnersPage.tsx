// OwnersPage.tsx - Final Version with Modular ClientListTable
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaSms, FaCheckSquare, FaSquare, FaUsers, FaFilter, FaFileExport, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { ClientExpanded } from '../../types';
import { clientApi } from '../../api/clientsApi';
import ClientListTable from './components/ClientListTable'; // Modularny komponent
import ClientDetailDrawer from './components/ClientDetailDrawer';
import ClientFilters, { ClientFilters as ClientFiltersType } from './components/ClientFilters';
import ClientFormModal from './components/ClientFormModal';
import ContactAttemptModal from './components/ContactAttemptModal';
import Modal from '../../components/common/Modal';
import DeleteConfirmationModal from "./modals/DeleteConfirmationModal";

// Professional Brand Theme - Premium Automotive CRM
const brandTheme = {
    // Primary Colors - Professional Blue Palette
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',

    // Surface Colors - Clean & Minimal
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',

    // Typography Colors
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },

    // Border Colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',

    // Status Colors - Automotive Grade
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

    // Shadows - Professional Depth
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    // Spacing Scale
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    // Border Radius
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    }
};

const OwnersPage: React.FC = () => {
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

    // Load clients on component mount
    useEffect(() => {
        const loadClients = async () => {
            try {
                setLoading(true);
                const data = await clientApi.fetchClients();
                setClients(data);
                setFilteredClients(data);

                // Calculate statistics
                const totalRevenue = data.reduce((sum, client) => sum + client.totalRevenue, 0);
                const vipCount = data.filter(client => client.totalRevenue > 50000).length;

                setStats({
                    totalClients: data.length,
                    vipClients: vipCount,
                    totalRevenue,
                    averageRevenue: data.length > 0 ? totalRevenue / data.length : 0
                });

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

    // Handlers
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
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
        setStats(prevStats => ({
            ...prevStats,
            totalClients: prevStats.totalClients + 1,
            totalRevenue: prevStats.totalRevenue,
            averageRevenue: prevStats.totalRevenue
        }));
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
            setSelectedClientIds(prev => prev.filter(id => id !== selectedClient.id));
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

    const toggleClientSelection = (clientId: string) => {
        setSelectedClientIds(currentSelected => {
            if (currentSelected.includes(clientId)) {
                return currentSelected.filter(id => id !== clientId);
            } else {
                return [...currentSelected, clientId];
            }
        });
    };

    const toggleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        if (!newSelectAll) {
            const filteredIds = filteredClients.map(client => client.id);
            setSelectedClientIds(prev => prev.filter(id => !filteredIds.includes(id)));
        }
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
        setSelectedClientIds([]);
    };

    const handleExportClients = () => {
        alert('Eksport danych klientów - funkcjonalność w przygotowaniu');
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
    };

    return (
        <PageContainer>
            {/* Professional Header */}
            <PageHeader>
                <HeaderContent>
                    <HeaderLeft>
                        <HeaderIcon>
                            <FaUsers />
                        </HeaderIcon>
                        <HeaderText>
                            <HeaderTitle>Baza Klientów</HeaderTitle>
                            <HeaderSubtitle>
                                Zarządzanie relacjami z klientami detailingu
                            </HeaderSubtitle>
                        </HeaderText>
                    </HeaderLeft>

                    <HeaderActions>
                        {selectedClientIds.length > 0 && (
                            <BulkActionButton onClick={handleOpenBulkSmsModal}>
                                <FaSms />
                                <span>SMS do zaznaczonych ({selectedClientIds.length})</span>
                            </BulkActionButton>
                        )}

                        <SecondaryButton onClick={handleExportClients}>
                            <FaFileExport />
                            <span>Eksport</span>
                        </SecondaryButton>

                        <PrimaryButton onClick={handleAddClient}>
                            <FaPlus />
                            <span>Nowy klient</span>
                        </PrimaryButton>
                    </HeaderActions>
                </HeaderContent>
            </PageHeader>

            {/* Statistics Dashboard */}
            <StatsSection>
                <StatsGrid>
                    <StatCard>
                        <StatIcon $color={brandTheme.primary}>
                            <FaUsers />
                        </StatIcon>
                        <StatContent>
                            <StatValue>{stats.totalClients}</StatValue>
                            <StatLabel>Łączna liczba klientów</StatLabel>
                        </StatContent>
                    </StatCard>

                    <StatCard>
                        <StatIcon $color={brandTheme.status.warning}>
                            <FaUsers />
                        </StatIcon>
                        <StatContent>
                            <StatValue>{stats.vipClients}</StatValue>
                            <StatLabel>Klienci VIP (50k+ PLN)</StatLabel>
                        </StatContent>
                    </StatCard>

                    <StatCard>
                        <StatIcon $color={brandTheme.status.success}>
                            <FaUsers />
                        </StatIcon>
                        <StatContent>
                            <StatValue>{formatCurrency(stats.totalRevenue)}</StatValue>
                            <StatLabel>Łączne przychody</StatLabel>
                        </StatContent>
                    </StatCard>

                    <StatCard>
                        <StatIcon $color={brandTheme.status.info}>
                            <FaUsers />
                        </StatIcon>
                        <StatContent>
                            <StatValue>{formatCurrency(stats.averageRevenue)}</StatValue>
                            <StatLabel>Średni przychód na klienta</StatLabel>
                        </StatContent>
                    </StatCard>
                </StatsGrid>
            </StatsSection>

            {/* Content Container - Takes full width */}
            <ContentContainer>
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
                        {/* Selection Bar - Only show when we have clients and filters */}
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

                        {/* Main Table Component - Now Modular! */}
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

            {/* Professional Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteConfirm}
                client={selectedClient}
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />

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
                                    Wyślij wiadomość do {selectedClientIds.length} {
                                    selectedClientIds.length === 1 ? 'klienta' :
                                        selectedClientIds.length > 1 && selectedClientIds.length < 5 ? 'klientów' : 'klientów'
                                }
                                </BulkSmsTitle>
                                <BulkSmsSubtitle>
                                    Wiadomość zostanie wysłana do wszystkich zaznaczonych klientów
                                </BulkSmsSubtitle>
                            </BulkSmsInfo>
                        </BulkSmsHeader>

                        <SmsFormGroup>
                            <SmsLabel>Treść wiadomości:</SmsLabel>
                            <SmsTextarea
                                value={bulkSmsText}
                                onChange={(e) => setBulkSmsText(e.target.value)}
                                placeholder="Wprowadź treść wiadomości SMS..."
                                rows={5}
                                maxLength={160}
                            />
                            <SmsCharacterCounter>
                                {bulkSmsText.length}/160 znaków
                            </SmsCharacterCounter>
                        </SmsFormGroup>

                        <RecipientsList>
                            <RecipientsLabel>Lista odbiorców:</RecipientsLabel>
                            <RecipientsContainer>
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
                            </RecipientsContainer>
                        </RecipientsList>

                        <BulkSmsActions>
                            <SecondaryButton onClick={() => setShowBulkSmsModal(false)}>
                                Anuluj
                            </SecondaryButton>
                            <PrimaryButton
                                onClick={handleSendBulkSms}
                                disabled={bulkSmsText.trim() === ''}
                            >
                                <FaSms />
                                Wyślij SMS
                            </PrimaryButton>
                        </BulkSmsActions>
                    </BulkSmsContent>
                </Modal>
            )}
        </PageContainer>
    );
};

// Professional Styled Components - Same as before but optimized
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${brandTheme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const PageHeader = styled.header`
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.sm};
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);
`;

const HeaderContent = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.lg};

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
        flex-direction: column;
        align-items: stretch;
        gap: ${brandTheme.spacing.md};
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    min-width: 0;
    flex: 1;
`;

const HeaderIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${brandTheme.shadow.md};
    flex-shrink: 0;
`;

const HeaderText = styled.div`
    min-width: 0;
    flex: 1;
`;

const HeaderTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.xs} 0;
    letter-spacing: -0.025em;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const HeaderSubtitle = styled.p`
    color: ${brandTheme.text.secondary};
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.4;

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    align-items: center;
    flex-wrap: wrap;

    @media (max-width: 1024px) {
        justify-content: flex-end;
        width: 100%;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${brandTheme.spacing.xs};

        > * {
            width: 100%;
        }
    }
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
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    span {
        @media (max-width: 480px) {
            display: none;
        }
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

const BulkActionButton = styled(BaseButton)`
    background: linear-gradient(135deg, ${brandTheme.status.success} 0%, #10b981 100%);
    color: white;
    box-shadow: ${brandTheme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, #059669 0%, ${brandTheme.status.success} 100%);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const DangerButton = styled(BaseButton)`
    background: ${brandTheme.surface};
    color: ${brandTheme.status.error};
    border-color: ${brandTheme.status.error};

    &:hover {
        background: ${brandTheme.status.error};
        color: white;
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const StatsSection = styled.section`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl} 0;

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

    /* Izolacja - upewnij się że style dotyczą tylko bezpośrednich dzieci */
    > * {
        /* Style tylko dla StatCard */
    }

    @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
        gap: ${brandTheme.spacing.md};
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${brandTheme.spacing.md};
    }

    /* Zapewnienie że nie wpływa na inne gridy */
    &:not(.stats-grid) {
        /* Failsafe */
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

const ContentContainer = styled.div`
    flex: 1;
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 ${brandTheme.spacing.xl} ${brandTheme.spacing.xl};
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
    min-height: 0; /* Ważne: pozwala na prawidłowe działanie flex-shrink */
    overflow: hidden; /* Zapobiega rozciąganiu poza kontener */

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

// Delete Confirmation Modal Styles
const DeleteConfirmContent = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md} 0;
`;

const DeleteIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${brandTheme.status.errorLight};
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.status.error};
    font-size: 20px;
    flex-shrink: 0;
`;

const DeleteText = styled.div`
    flex: 1;
`;

const DeleteTitle = styled.div`
    font-size: 18px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.sm};
`;

const DeleteSubtitle = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    margin-bottom: ${brandTheme.spacing.sm};
`;

const DeleteWarning = styled.div`
    font-size: 14px;
    color: ${brandTheme.status.error};
    font-weight: 500;
`;

const DeleteConfirmButtons = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.sm};
    margin-top: ${brandTheme.spacing.lg};
    padding-top: ${brandTheme.spacing.md};
    border-top: 1px solid ${brandTheme.border};
`;

// Bulk SMS Modal Styles
const BulkSmsContent = styled.div`
    padding: ${brandTheme.spacing.md} 0;
`;

const BulkSmsHeader = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.lg};
`;

const BulkSmsIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${brandTheme.status.successLight};
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.status.success};
    font-size: 20px;
    flex-shrink: 0;
`;

const BulkSmsInfo = styled.div`
    flex: 1;
`;

const BulkSmsTitle = styled.div`
    font-size: 18px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
`;

const BulkSmsSubtitle = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
`;

const SmsFormGroup = styled.div`
    margin-bottom: ${brandTheme.spacing.lg};
`;

const SmsLabel = styled.label`
    display: block;
    font-weight: 600;
    font-size: 14px;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.sm};
`;

const SmsTextarea = styled.textarea`
    width: 100%;
    padding: ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 16px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    resize: vertical;
    min-height: 120px;
    font-family: inherit;
    line-height: 1.5;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.tertiary};
        font-weight: 400;
    }
`;

const SmsCharacterCounter = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    text-align: right;
    margin-top: ${brandTheme.spacing.xs};
`;

const RecipientsList = styled.div`
    margin-bottom: ${brandTheme.spacing.lg};
`;

const RecipientsLabel = styled.div`
    font-weight: 600;
    font-size: 14px;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.sm};
`;

const RecipientsContainer = styled.div`
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    background: ${brandTheme.surfaceAlt};

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: ${brandTheme.surfaceAlt};
    }
    &::-webkit-scrollbar-thumb {
        background: ${brandTheme.border};
        border-radius: 3px;
    }
`;

const RecipientItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-bottom: 1px solid ${brandTheme.border};
    transition: all 0.2s ease;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: ${brandTheme.surface};
    }
`;

const RecipientName = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const RecipientPhone = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const BulkSmsActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.sm};
    padding-top: ${brandTheme.spacing.md};
    border-top: 1px solid ${brandTheme.border};
`;

const TableContainer = styled.div`
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 400px); /* Ograniczenie wysokości względem viewport */

    /* Responsive height adjustments */
    @media (max-width: 1024px) {
        max-height: calc(100vh - 350px);
    }

    @media (max-width: 768px) {
        max-height: calc(100vh - 300px);
    }
`;

export default OwnersPage;