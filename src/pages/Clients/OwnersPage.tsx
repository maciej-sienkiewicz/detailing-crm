import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus } from 'react-icons/fa';
import { ClientExpanded } from '../../types';
import {
    fetchClients,
    deleteClient,
    fetchVehiclesByOwnerId
} from '../../api/mocks/clientMocks';
import ClientListTable from './components/ClientListTable';
import ClientDetailDrawer from './components/ClientDetailDrawer';
import ClientFilters, { ClientFilters as ClientFiltersType } from './components/ClientFilters';
import ClientFormModal from './components/ClientFormModal';
import ContactAttemptModal from './components/ContactAttemptModal';
import Modal from '../../components/common/Modal';

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

    // Filters
    const [filters, setFilters] = useState<ClientFiltersType>({
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
            await deleteClient(selectedClient.id);
            setClients(clients.filter(c => c.id !== selectedClient.id));
            setShowDeleteConfirm(false);
            setSelectedClient(null);

            // Close detail drawer if opened for the deleted client
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

            // Update selected client in the detail drawer
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

    return (
        <PageContainer>
            <PageHeader>
                <h1>Właściciele pojazdów</h1>
                <HeaderActions>
                    <AddButton onClick={handleAddClient}>
                        <FaPlus /> Dodaj klienta
                    </AddButton>
                </HeaderActions>
            </PageHeader>

            {/* Filter section - moved outside the header */}
            <ClientFilters
                filters={filters}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                onFilterChange={handleFilterChange}
                onResetFilters={resetFilters}
                resultCount={filteredClients.length}
            />

            {error && <ErrorMessage>{error}</ErrorMessage>}

            {loading ? (
                <LoadingMessage>Ładowanie danych klientów...</LoadingMessage>
            ) : filteredClients.length === 0 ? (
                <EmptyState>
                    {Object.values(filters).some(val => val !== '')
                        ? 'Nie znaleziono klientów spełniających kryteria filtrowania.'
                        : 'Brak klientów w bazie. Kliknij "Dodaj klienta", aby dodać pierwszego klienta.'}
                </EmptyState>
            ) : (
                <ClientListTable
                    clients={filteredClients}
                    onSelectClient={handleSelectClient}
                    onEditClient={handleEditClient}
                    onDeleteClient={handleDeleteClick}
                    onShowVehicles={handleShowVehicles}
                    onAddContactAttempt={handleAddContactAttempt}
                    onSendSMS={handleSendSMS}
                />
            )}

            {/* Detail Drawer */}
            <ClientDetailDrawer
                isOpen={showDetailDrawer}
                client={selectedClient}
                onClose={() => setShowDetailDrawer(false)}
            />

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

const LoadingMessage = styled.div`
    display: flex;
    justify-content: center;
    padding: 40px;
    font-size: 16px;
    color: #7f8c8d;
`;

const ErrorMessage = styled.div`
    background-color: #fdecea;
    color: #e74c3c;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 20px;
`;

const EmptyState = styled.div`
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 30px;
    text-align: center;
    color: #7f8c8d;
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