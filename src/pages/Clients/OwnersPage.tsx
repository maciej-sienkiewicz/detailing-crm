import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    FaPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaCar,
    FaEnvelope,
    FaPhone,
    FaBuilding,
    FaIdCard,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaExclamationTriangle,
    FaSms,
    FaHistory,
    FaFilter,
    FaTimes
} from 'react-icons/fa';
import { ClientExpanded } from '../../types/client';
import {
    fetchClients,
    deleteClient,
    fetchVehiclesByOwnerId
} from '../../api/mocks/clientMocks';
import ClientFormModal from './components/ClientFormModal';
import ContactAttemptModal from './components/ContactAttemptModal';
import Modal from '../../components/common/Modal';

// Client filters interface
interface ClientFilters {
    name: string;
    email: string;
    phone: string;
    minVisits: string;
    minTransactions: string;
    minRevenue: string;
}

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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Filters
    const [filters, setFilters] = useState<ClientFilters>({
        name: '',
        email: '',
        phone: '',
        minVisits: '',
        minTransactions: '',
        minRevenue: ''
    });

    // Load clients on component mount
    useEffect(() => {
        const loadClients = async () => {
            try {
                setLoading(true);
                const data = await fetchClients();
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

    // Filter clients when filters change
    useEffect(() => {
        let result = [...clients];

        // Filter by name (first name or last name)
        if (filters.name) {
            const nameQuery = filters.name.toLowerCase();
            result = result.filter(client =>
                `${client.firstName} ${client.lastName}`.toLowerCase().includes(nameQuery)
            );
        }

        // Filter by email
        if (filters.email) {
            const emailQuery = filters.email.toLowerCase();
            result = result.filter(client =>
                client.email.toLowerCase().includes(emailQuery)
            );
        }

        // Filter by phone
        if (filters.phone) {
            const phoneQuery = filters.phone.toLowerCase();
            result = result.filter(client =>
                client.phone.toLowerCase().includes(phoneQuery)
            );
        }

        // Filter by minimum visits
        if (filters.minVisits) {
            const minVisits = parseInt(filters.minVisits);
            if (!isNaN(minVisits)) {
                result = result.filter(client => client.totalVisits >= minVisits);
            }
        }

        // Filter by minimum transactions
        if (filters.minTransactions) {
            const minTransactions = parseInt(filters.minTransactions);
            if (!isNaN(minTransactions)) {
                result = result.filter(client => client.totalTransactions >= minTransactions);
            }
        }

        // Filter by minimum revenue
        if (filters.minRevenue) {
            const minRevenue = parseFloat(filters.minRevenue);
            if (!isNaN(minRevenue)) {
                result = result.filter(client => client.totalRevenue >= minRevenue);
            }
        }

        setFilteredClients(result);
    }, [clients, filters]);

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
            // Update existing client
            setClients(clients.map(c => c.id === client.id ? client : c));
        } else {
            // Add new client
            setClients(prev => [...prev, client]);
        }
        setShowAddModal(false);
    };

    const handleDeleteClick = (client: ClientExpanded) => {
        setSelectedClient(client);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedClient) return;

        try {
            await deleteClient(selectedClient.id);
            setClients(clients.filter(c => c.id !== selectedClient.id));
            setShowDeleteConfirm(false);
            setSelectedClient(null);
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
        // In a real app, we would reload the client data
        // For now, we'll just update the contact attempts count
        if (selectedClient) {
            const updatedClient = {
                ...selectedClient,
                contactAttempts: selectedClient.contactAttempts + 1
            };

            setClients(clients.map(c =>
                c.id === updatedClient.id ? updatedClient : c
            ));
        }
        setShowContactModal(false);
    };

    const handleSendSMS = (client: ClientExpanded) => {
        alert(`Symulacja wysyłania SMS do: ${client.firstName} ${client.lastName} (${client.phone})`);
    };

    const hasActiveFilters = () => {
        return Object.values(filters).some(val => val !== '');
    };

    return (
        <PageContainer>
            <PageHeader>
                <h1>Właściciele pojazdów</h1>
                <HeaderActions>
                    <FilterToggle onClick={() => setShowFilters(!showFilters)}>
                        <FaFilter /> {showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
                    </FilterToggle>
                    <AddButton onClick={handleAddClient}>
                        <FaPlus /> Dodaj klienta
                    </AddButton>
                </HeaderActions>
            </PageHeader>

            {showFilters && (
                <FiltersContainer>
                    <FiltersGrid>
                        <FilterGroup>
                            <Label htmlFor="name">Imię i nazwisko</Label>
                            <Input
                                id="name"
                                name="name"
                                value={filters.name}
                                onChange={handleFilterChange}
                                placeholder="Wyszukaj po imieniu i nazwisku..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                value={filters.email}
                                onChange={handleFilterChange}
                                placeholder="Wyszukaj po emailu..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="phone">Telefon</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={filters.phone}
                                onChange={handleFilterChange}
                                placeholder="Wyszukaj po telefonie..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="minVisits">Min. liczba wizyt</Label>
                            <Input
                                id="minVisits"
                                name="minVisits"
                                type="number"
                                min="0"
                                value={filters.minVisits}
                                onChange={handleFilterChange}
                                placeholder="Min. liczba wizyt..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="minTransactions">Min. liczba transakcji</Label>
                            <Input
                                id="minTransactions"
                                name="minTransactions"
                                type="number"
                                min="0"
                                value={filters.minTransactions}
                                onChange={handleFilterChange}
                                placeholder="Min. liczba transakcji..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="minRevenue">Min. przychody (zł)</Label>
                            <Input
                                id="minRevenue"
                                name="minRevenue"
                                type="number"
                                min="0"
                                value={filters.minRevenue}
                                onChange={handleFilterChange}
                                placeholder="Min. kwota przychodów..."
                            />
                        </FilterGroup>
                    </FiltersGrid>

                    <FiltersActions>
                        {hasActiveFilters() && (
                            <FilterResults>
                                Znaleziono: {filteredClients.length} {
                                filteredClients.length === 1 ? 'klienta' :
                                    filteredClients.length > 1 && filteredClients.length < 5 ? 'klientów' : 'klientów'
                            }
                            </FilterResults>
                        )}

                        <ClearFiltersButton
                            onClick={resetFilters}
                            disabled={!hasActiveFilters()}
                        >
                            <FaTimes /> Wyczyść filtry
                        </ClearFiltersButton>
                    </FiltersActions>
                </FiltersContainer>
            )}

            {error && <ErrorMessage>{error}</ErrorMessage>}

            {loading ? (
                <LoadingMessage>Ładowanie danych klientów...</LoadingMessage>
            ) : filteredClients.length === 0 ? (
                <EmptyState>
                    {hasActiveFilters()
                        ? 'Nie znaleziono klientów spełniających kryteria filtrowania.'
                        : 'Brak klientów w bazie. Kliknij "Dodaj klienta", aby dodać pierwszego klienta.'}
                </EmptyState>
            ) : (
                <ClientsGrid>
                    {filteredClients.map(client => (
                        <ClientCard key={client.id}>
                            <ClientHeader>
                                <ClientName>{client.firstName} {client.lastName}</ClientName>
                                {client.company && (
                                    <CompanyName><FaBuilding /> {client.company}</CompanyName>
                                )}
                            </ClientHeader>

                            <ClientDetails>
                                <ContactDetail>
                                    <DetailIcon><FaEnvelope /></DetailIcon>
                                    <DetailText>{client.email}</DetailText>
                                </ContactDetail>

                                <ContactDetail>
                                    <DetailIcon><FaPhone /></DetailIcon>
                                    <DetailText>{client.phone}</DetailText>
                                </ContactDetail>

                                {client.address && (
                                    <ContactDetail>
                                        <DetailIcon><FaIdCard /></DetailIcon>
                                        <DetailText>{client.address}</DetailText>
                                    </ContactDetail>
                                )}

                                {client.taxId && (
                                    <ContactDetail>
                                        <DetailIcon><FaIdCard /></DetailIcon>
                                        <DetailText>NIP: {client.taxId}</DetailText>
                                    </ContactDetail>
                                )}
                            </ClientDetails>

                            <ClientMetrics>
                                <MetricItem>
                                    <MetricIcon $color="#3498db"><FaCalendarAlt /></MetricIcon>
                                    <MetricValue>{client.totalVisits}</MetricValue>
                                    <MetricLabel>Wizyty</MetricLabel>
                                </MetricItem>

                                <MetricItem>
                                    <MetricIcon $color="#2ecc71"><FaMoneyBillWave /></MetricIcon>
                                    <MetricValue>{client.totalTransactions}</MetricValue>
                                    <MetricLabel>Transakcje</MetricLabel>
                                </MetricItem>

                                <MetricItem>
                                    <MetricIcon $color="#e74c3c"><FaExclamationTriangle /></MetricIcon>
                                    <MetricValue>{client.abandonedSales}</MetricValue>
                                    <MetricLabel>Porzucone</MetricLabel>
                                </MetricItem>

                                <MetricItem full>
                                    <MetricIcon $color="#f39c12"><FaMoneyBillWave /></MetricIcon>
                                    <MetricValue>{client.totalRevenue.toFixed(2)} zł</MetricValue>
                                    <MetricLabel>Suma przychodów</MetricLabel>
                                </MetricItem>
                            </ClientMetrics>

                            <LastVisitInfo>
                                {client.lastVisitDate ? (
                                    <>Ostatnia wizyta: {formatDate(client.lastVisitDate)}</>
                                ) : (
                                    <>Brak wizyt</>
                                )}
                            </LastVisitInfo>

                            <ClientActions>
                                <ActionButton title="Edytuj klienta" onClick={() => handleEditClient(client)}>
                                    <FaEdit />
                                </ActionButton>

                                <ActionButton
                                    title="Pokaż pojazdy klienta"
                                    onClick={() => handleShowVehicles(client.id)}
                                >
                                    <FaCar />
                                </ActionButton>

                                <ActionButton
                                    title="Dodaj próbę kontaktu"
                                    onClick={() => handleAddContactAttempt(client)}
                                >
                                    <FaHistory />
                                </ActionButton>

                                <ActionButton
                                    title="Wyślij SMS"
                                    onClick={() => handleSendSMS(client)}
                                >
                                    <FaSms />
                                </ActionButton>

                                <ActionButton
                                    title="Usuń klienta"
                                    danger
                                    onClick={() => handleDeleteClick(client)}
                                >
                                    <FaTrash />
                                </ActionButton>
                            </ClientActions>
                        </ClientCard>
                    ))}
                </ClientsGrid>
            )}

            {/* Client add/edit modal */}
            {showAddModal && (
                <ClientFormModal
                    client={selectedClient}
                    onSave={handleSaveClient}
                    onCancel={() => setShowAddModal(false)}
                />
            )}

            {/* Contact attempt modal */}
            {showContactModal && selectedClient && (
                <ContactAttemptModal
                    client={selectedClient}
                    onSave={handleContactSaved}
                    onCancel={() => setShowContactModal(false)}
                />
            )}

            {/* Delete confirmation modal */}
            {showDeleteConfirm && selectedClient && (
                <Modal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    title="Potwierdź usunięcie"
                >
                    <DeleteConfirmContent>
                        <p>Czy na pewno chcesz usunąć klienta <strong>{selectedClient.firstName} {selectedClient.lastName}</strong>?</p>
                        <p>Ta operacja jest nieodwracalna.</p>

                        <DeleteConfirmButtons>
                            <CancelButton onClick={() => setShowDeleteConfirm(false)}>
                                Anuluj
                            </CancelButton>
                            <DeleteButton onClick={handleConfirmDelete}>
                                Usuń klienta
                            </DeleteButton>
                        </DeleteConfirmButtons>
                    </DeleteConfirmContent>
                </Modal>
            )}
        </PageContainer>
    );
};

// Helper function to format dates
const formatDate = (dateString: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

// Styled components
const PageContainer = styled.div`
    padding: 20px;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h1 {
        font-size: 24px;
        margin: 0;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 10px;
`;

const AddButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-weight: 500;
    cursor: pointer;
    
    &:hover {
        background-color: #2980b9;
    }
`;

const FilterToggle = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #f9f9f9;
    color: #34495e;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px 16px;
    font-weight: 500;
    cursor: pointer;
    
    &:hover {
        background-color: #f0f0f0;
    }
`;

const FiltersContainer = styled.div`
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 20px;
    border: 1px solid #eee;
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Label = styled.label`
    font-weight: 500;
    font-size: 14px;
    color: #333;
`;

const Input = styled.input`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const FiltersActions = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
`;

const FilterResults = styled.div`
    font-size: 14px;
    color: #7f8c8d;
`;

const ClearFiltersButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: #e74c3c;
    font-size: 14px;
    cursor: pointer;
    padding: 4px 8px;
    
    &:hover:not(:disabled) {
        text-decoration: underline;
    }
    
    &:disabled {
        color: #bdc3c7;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.div`
    background-color: #fdecea;
    color: #e74c3c;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 20px;
`;

const LoadingMessage = styled.div`
    display: flex;
    justify-content: center;
    padding: 40px;
    font-size: 16px;
    color: #7f8c8d;
`;

const EmptyState = styled.div`
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 30px;
    text-align: center;
    color: #7f8c8d;
`;

const ClientsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
`;

const ClientCard = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const ClientHeader = styled.div`
    padding: 16px;
    border-bottom: 1px solid #f5f5f5;
`;

const ClientName = styled.h3`
    margin: 0 0 4px 0;
    font-size: 18px;
    color: #34495e;
`;

const CompanyName = styled.div`
    font-size: 14px;
    color: #7f8c8d;
    display: flex;
    align-items: center;
    gap: 6px;
`;

const ClientDetails = styled.div`
    padding: 12px 16px;
    border-bottom: 1px solid #f5f5f5;
`;

const ContactDetail = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const DetailIcon = styled.div`
    width: 20px;
    margin-right: 10px;
    color: #7f8c8d;
    text-align: center;
`;

const DetailText = styled.div`
    color: #34495e;
`;

const ClientMetrics = styled.div`
    display: flex;
    flex-wrap: wrap;
    padding: 12px 16px;
    background-color: #f9f9f9;
    border-bottom: 1px solid #f5f5f5;
`;

const MetricItem = styled.div<{ full?: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: ${props => props.full ? '100%' : '33%'};
    padding: 8px 0;
    
    ${props => props.full && `
        border-top: 1px solid #eee;
        margin-top: 8px;
        padding-top: 16px;
    `}
`;

const MetricIcon = styled.div<{ $color: string }>`
    color: ${props => props.$color};
    font-size: 18px;
    margin-bottom: 4px;
`;

const MetricValue = styled.div`
    font-weight: 600;
    font-size: 18px;
    color: #34495e;
`;

const MetricLabel = styled.div`
    font-size: 12px;
    color: #7f8c8d;
`;

const LastVisitInfo = styled.div`
    padding: 8px 16px;
    font-size: 13px;
    color: #7f8c8d;
    background-color: #f9f9f9;
    text-align: center;
    border-bottom: 1px solid #f5f5f5;
`;

const ClientActions = styled.div`
    display: flex;
    padding: 12px 16px;
    gap: 8px;
    justify-content: space-between;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${props => props.danger ? '#fef5f5' : '#f5f9fd'};
    color: ${props => props.danger ? '#e74c3c' : '#3498db'};
    border: 1px solid ${props => props.danger ? '#fad7d3' : '#d5e6f3'};
    border-radius: 4px;
    width: 36px;
    height: 36px;
    cursor: pointer;
    font-size: 15px;
    
    &:hover {
        background-color: ${props => props.danger ? '#fdecea' : '#eaf2fa'};
    }
`;

const DeleteConfirmContent = styled.div`
    padding: 16px 0;
    
    p {
        margin: 0 0 16px 0;
    }
`;

const DeleteConfirmButtons = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
`;

const CancelButton = styled.button`
    padding: 8px 16px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    
    &:hover {
        background-color: #e9e9e9;
    }
`;

const DeleteButton = styled.button`
    padding: 8px 16px;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    
    &:hover {
        background-color: #c0392b;
    }
`;

export default OwnersPage;