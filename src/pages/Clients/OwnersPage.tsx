// OwnersPage.tsx - Professional redesign with brand color integration
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaSms, FaCheckSquare, FaSquare, FaUsers, FaFilter, FaDownload, FaFileExport } from 'react-icons/fa';
import { ClientExpanded } from '../../types';
import { clientApi } from '../../api/clientsApi';
import ClientListTable from './components/ClientListTable';
import ClientDetailDrawer from './components/ClientDetailDrawer';
import ClientFilters, { ClientFilters as ClientFiltersType } from './components/ClientFilters';
import ClientFormModal from './components/ClientFormModal';
import ContactAttemptModal from './components/ContactAttemptModal';
import Modal from '../../components/common/Modal';

// Professional Brand Theme with User Customizable Colors
const brandTheme = {
    // User-configurable brand colors that adapt to their business identity
    primary: 'var(--brand-color, var(--brand-primary, #1a365d))',
    primaryLight: 'var(--brand-color-light, var(--brand-primary-light, #2c5aa0))',
    primaryDark: 'var(--brand-color-dark, var(--brand-primary-dark, #0f2027))',
    primaryGhost: 'var(--brand-color-ghost, var(--brand-primary-ghost, rgba(26, 54, 93, 0.08)))',
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
    };

    const handleExportClients = () => {
        // Simulate export functionality
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
            {/* Modern Header */}
            <PageHeader>
                <HeaderContent>
                    <HeaderLeft>
                        <HeaderIcon>
                            <FaUsers />
                        </HeaderIcon>
                        <HeaderText>
                            <HeaderTitle>Baza Właścicieli</HeaderTitle>
                            <HeaderSubtitle>
                                Zarządzaj klientami i ich pojazdami
                            </HeaderSubtitle>
                        </HeaderText>
                    </HeaderLeft>

                    <HeaderActions>
                        {selectedClientIds.length > 0 && (
                            <BulkSmsButton onClick={handleOpenBulkSmsModal}>
                                <FaSms />
                                SMS do zaznaczonych ({selectedClientIds.length})
                            </BulkSmsButton>
                        )}

                        <SecondaryButton onClick={handleExportClients}>
                            <FaFileExport />
                            Eksport
                        </SecondaryButton>

                        <PrimaryButton onClick={handleAddClient}>
                            <FaPlus />
                            Nowy klient
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
                            <StatLabel>Klienci VIP (50k PLN)</StatLabel>
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

            {/* Main Content */}
            <ContentContainer>
                {loading ? (
                    <LoadingContainer>
                        <LoadingSpinner />
                        <LoadingText>Ładowanie danych klientów...</LoadingText>
                    </LoadingContainer>
                ) : filteredClients.length === 0 ? (
                    <EmptyStateContainer>
                        <EmptyStateIcon>
                            <FaUsers />
                        </EmptyStateIcon>
                        <EmptyStateTitle>
                            {Object.values(filters).some(val => val !== '')
                                ? 'Brak wyników wyszukiwania'
                                : 'Brak klientów w bazie'
                            }
                        </EmptyStateTitle>
                        <EmptyStateDescription>
                            {Object.values(filters).some(val => val !== '')
                                ? 'Nie znaleziono klientów spełniających kryteria filtrowania.'
                                : 'Rozpocznij budowanie bazy klientów dodając pierwszego klienta.'}
                        </EmptyStateDescription>
                        {Object.values(filters).some(val => val !== '') ? (
                            <EmptyStateButton onClick={resetFilters}>
                                <FaFilter />
                                Wyczyść filtry
                            </EmptyStateButton>
                        ) : (
                            <EmptyStateButton onClick={handleAddClient}>
                                <FaPlus />
                                Dodaj pierwszego klienta
                            </EmptyStateButton>
                        )}
                    </EmptyStateContainer>
                ) : (
                    <>
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
                        <DeleteIcon>
                            <FaExclamationTriangle />
                        </DeleteIcon>
                        <DeleteText>
                            <DeleteTitle>Czy na pewno chcesz usunąć klienta?</DeleteTitle>
                            <DeleteSubtitle>
                                <strong>{selectedClient.firstName} {selectedClient.lastName}</strong>
                            </DeleteSubtitle>
                            <DeleteWarning>Ta operacja jest nieodwracalna.</DeleteWarning>
                        </DeleteText>
                    </DeleteConfirmContent>

                    <DeleteConfirmButtons>
                        <SecondaryButton onClick={() => setShowDeleteConfirm(false)}>
                            Anuluj
                        </SecondaryButton>
                        <DangerButton onClick={handleConfirmDelete}>
                            <FaTimes />
                            Usuń klienta
                        </DangerButton>
                    </DeleteConfirmButtons>
                </Modal>
            )}

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

// Modern Styled Components with Brand Color Integration
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${brandTheme.surfaceAlt};
    padding: 0;
`;

const PageHeader = styled.div`
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.border};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const HeaderContent = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 20px;
        align-items: stretch;
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const HeaderIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${brandTheme.primary};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    box-shadow: 0 4px 12px ${brandTheme.primary}40;
`;

const HeaderText = styled.div``;

const HeaderTitle = styled.h1`
    font-size: 28px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 4px 0;
    letter-spacing: -0.5px;
`;

const HeaderSubtitle = styled.p`
    color: ${brandTheme.text.secondary};
    margin: 0;
    font-size: 16px;
    font-weight: 500;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 12px;
    align-items: center;

    @media (max-width: 768px) {
        justify-content: flex-end;
    }
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

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background: ${brandTheme.surface};
    color: ${brandTheme.neutral};
    border: 2px solid ${brandTheme.border};
    border-radius: 8px;
    padding: 10px 18px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
        background: ${brandTheme.primaryGhost};
        transform: translateY(-1px);
    }
`;

const BulkSmsButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background: ${brandTheme.status.success};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);

    &:hover {
        background: #047857;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
    }
`;

const DangerButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background: ${brandTheme.status.error};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #b91c1c;
        transform: translateY(-1px);
    }
`;

const StatsSection = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 32px 0;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
`;

const StatCard = styled.div`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        border-color: ${brandTheme.primary};
    }
`;

const StatIcon = styled.div<{ $color: string }>`
    width: 48px;
    height: 48px;
    background: ${props => props.$color}15;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 20px;
`;

const StatContent = styled.div`
    flex: 1;
`;

const StatValue = styled.div`
    font-size: 24px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: 4px;
    letter-spacing: -0.5px;
`;

const StatLabel = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const ContentContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 32px 32px;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    gap: 16px;
`;

const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 3px solid ${brandTheme.border};
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
    gap: 12px;
    background: #fef2f2;
    color: ${brandTheme.status.error};
    padding: 16px 20px;
    border-radius: 12px;
    margin: 0 32px 24px;
    border: 1px solid #fecaca;
    font-weight: 500;
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;

    svg {
        font-size: 18px;
    }
`;

const EmptyStateContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 40px;
    background: ${brandTheme.surface};
    border: 2px dashed ${brandTheme.border};
    border-radius: 16px;
    text-align: center;
`;

const EmptyStateIcon = styled.div`
    width: 80px;
    height: 80px;
    background: ${brandTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: ${brandTheme.neutral};
    margin-bottom: 24px;
`;

const EmptyStateTitle = styled.h3`
    font-size: 24px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
`;

const EmptyStateDescription = styled.p`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    margin: 0 0 24px 0;
    line-height: 1.6;
    max-width: 400px;
`;

const EmptyStateButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background: ${brandTheme.primary};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryDark};
        transform: translateY(-1px);
    }
`;

const SelectionBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: ${brandTheme.primaryGhost};
    border: 1px solid ${brandTheme.primary}30;
    border-radius: 12px;
    margin-bottom: 16px;
`;

const SelectAllCheckbox = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    color: ${brandTheme.text.primary};
    font-weight: 500;
    transition: all 0.2s ease;

    svg {
        color: ${brandTheme.primary};
        font-size: 18px;
    }

    &:hover {
        color: ${brandTheme.primary};
    }
`;

const SelectionInfo = styled.div`
    font-size: 14px;
    color: ${brandTheme.primary};
    font-weight: 600;
`;

// Delete Confirmation Modal Styles
const DeleteConfirmContent = styled.div`
    display: flex;
    gap: 16px;
    padding: 16px 0;
`;

const DeleteIcon = styled.div`
    width: 48px;
    height: 48px;
    background: #fef2f2;
    border-radius: 12px;
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
    margin-bottom: 8px;
`;

const DeleteSubtitle = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    margin-bottom: 12px;
`;

const DeleteWarning = styled.div`
    font-size: 14px;
    color: ${brandTheme.status.error};
    font-weight: 500;
`;

const DeleteConfirmButtons = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid ${brandTheme.border};
`;

// Bulk SMS Modal Styles
const BulkSmsContent = styled.div`
    padding: 16px 0;
`;

const BulkSmsHeader = styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
`;

const BulkSmsIcon = styled.div`
    width: 48px;
    height: 48px;
    background: rgba(5, 150, 105, 0.15);
    border-radius: 12px;
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
    margin-bottom: 4px;
`;

const BulkSmsSubtitle = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
`;

const SmsFormGroup = styled.div`
    margin-bottom: 24px;
`;

const SmsLabel = styled.label`
    display: block;
    font-weight: 600;
    font-size: 14px;
    color: ${brandTheme.text.primary};
    margin-bottom: 8px;
`;

const SmsTextarea = styled.textarea`
    width: 100%;
    padding: 16px;
    border: 2px solid ${brandTheme.border};
    border-radius: 8px;
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
        color: ${brandTheme.neutral};
        font-weight: 400;
    }
`;

const SmsCharacterCounter = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    text-align: right;
    margin-top: 4px;
`;

const RecipientsList = styled.div`
    margin-bottom: 24px;
`;

const RecipientsLabel = styled.div`
    font-weight: 600;
    font-size: 14px;
    color: ${brandTheme.text.primary};
    margin-bottom: 12px;
`;

const RecipientsContainer = styled.div`
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid ${brandTheme.border};
    border-radius: 8px;
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
    padding: 12px 16px;
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
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid ${brandTheme.border};
`;

export default OwnersPage;