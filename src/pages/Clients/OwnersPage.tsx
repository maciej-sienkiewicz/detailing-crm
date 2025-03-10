import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaSms, FaCheckSquare, FaSquare } from 'react-icons/fa';
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

    // Masowe zaznaczanie i SMS state
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

        // Zaktualizuj stan selectAll jeśli wszystkie odfiltrowane elementy
        // są na liście wybranych elementów
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

    // Effect do obsługi zaznaczenia lub odznaczenia wszystkich
    // (zmienione aby czyścić wszystko przy odznaczeniu "zaznacz wszystkie")
    useEffect(() => {
        if (selectAll) {
            // Dodaj tylko odfiltrowane elementy do wybranych
            setSelectedClientIds(prev => {
                const filteredIds = filteredClients.map(client => client.id);
                // Zachowuj elementy, które są już zaznaczone i nie są w aktualnie filtrowanych
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

    // Funkcja do zmiany stanu zaznaczenia klienta
    const toggleClientSelection = (clientId: string) => {
        setSelectedClientIds(currentSelected => {
            if (currentSelected.includes(clientId)) {
                return currentSelected.filter(id => id !== clientId);
            } else {
                return [...currentSelected, clientId];
            }
        });
    };

    // Obsługa zaznaczenia/odznaczenia wszystkich (zmieniona)
    const toggleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        if (!newSelectAll) {
            // Jeśli odznaczamy "zaznacz wszystkie", usuń z zaznaczenia wszystkie odfiltrowane elementy
            const filteredIds = filteredClients.map(client => client.id);
            setSelectedClientIds(prev => prev.filter(id => !filteredIds.includes(id)));
        }
    };

    // Otwarcie modalu do wysyłania SMS-ów
    const handleOpenBulkSmsModal = () => {
        if (selectedClientIds.length === 0) {
            alert('Zaznacz co najmniej jednego klienta, aby wysłać SMS');
            return;
        }
        setShowBulkSmsModal(true);
    };

    // Wysyłanie SMS-ów do zaznaczonych klientów
    const handleSendBulkSms = () => {
        if (bulkSmsText.trim() === '') {
            alert('Wprowadź treść wiadomości SMS');
            return;
        }

        // Pobierz dane klientów
        const selectedClients = clients.filter(client =>
            selectedClientIds.includes(client.id)
        );

        // Symulacja wysyłania SMS
        const recipientsList = selectedClients.map(client =>
            `${client.firstName} ${client.lastName} (${client.phone})`
        ).join('\n');

        alert(`Wysłano SMS o treści:\n${bulkSmsText}\n\nDo odbiorców:\n${recipientsList}`);

        // Reset stanu
        setBulkSmsText('');
        setShowBulkSmsModal(false);
    };

    return (
        <PageContainer>
            <PageHeader>
                <h1>Właściciele pojazdów</h1>
                <HeaderActions>
                    {selectedClientIds.length > 0 && (
                        <BulkSmsButton onClick={handleOpenBulkSmsModal}>
                            <FaSms /> Wyślij SMS ({selectedClientIds.length})
                        </BulkSmsButton>
                    )}
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
                <>
                    <SelectionBar>
                        <SelectAllCheckbox onClick={toggleSelectAll}>
                            {selectAll ? <FaCheckSquare /> : <FaSquare />}
                            <span>Zaznacz wszystkich ({filteredClients.length})</span>
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

            {/* Bulk SMS modal */}
            {showBulkSmsModal && (
                <Modal
                    isOpen={showBulkSmsModal}
                    onClose={() => setShowBulkSmsModal(false)}
                    title="Wyślij SMS do zaznaczonych klientów"
                >
                    <BulkSmsContent>
                        <p>Wiadomość zostanie wysłana do {selectedClientIds.length} {
                            selectedClientIds.length === 1 ? 'klienta' :
                                selectedClientIds.length > 1 && selectedClientIds.length < 5 ? 'klientów' : 'klientów'
                        }</p>

                        <FormGroup>
                            <Label>Treść wiadomości:</Label>
                            <Textarea
                                value={bulkSmsText}
                                onChange={(e) => setBulkSmsText(e.target.value)}
                                placeholder="Wprowadź treść wiadomości SMS..."
                                rows={5}
                                maxLength={160}
                            />
                            <CharacterCounter>
                                {bulkSmsText.length}/160 znaków
                            </CharacterCounter>
                        </FormGroup>

                        <RecipientsList>
                            <Label>Lista odbiorców:</Label>
                            <RecipientsContainer>
                                {clients
                                    .filter(client => selectedClientIds.includes(client.id))
                                    .map(client => (
                                        <RecipientItem key={client.id}>
                                            <RecipientName>{client.firstName} {client.lastName}</RecipientName>
                                            <RecipientPhone>{client.phone}</RecipientPhone>
                                        </RecipientItem>
                                    ))
                                }
                            </RecipientsContainer>
                        </RecipientsList>

                        <ButtonGroup>
                            <CancelButton onClick={() => setShowBulkSmsModal(false)}>
                                Anuluj
                            </CancelButton>
                            <SendButton onClick={handleSendBulkSms} disabled={bulkSmsText.trim() === ''}>
                                <FaSms /> Wyślij SMS
                            </SendButton>
                        </ButtonGroup>
                    </BulkSmsContent>
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

const BulkSmsButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #27ae60;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        background-color: #219955;
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

const SelectionBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background-color: #f5f5f5;
    border-radius: 4px;
    margin-bottom: 10px;
`;

const SelectAllCheckbox = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: #34495e;

    svg {
        color: #7f8c8d;
        font-size: 18px;
    }
`;

const SelectionInfo = styled.div`
    font-size: 14px;
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

const BulkSmsContent = styled.div`
    padding: 16px 0;

    p {
        margin: 0 0 16px 0;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
`;

const Label = styled.label`
    font-weight: 500;
    font-size: 14px;
    color: #333;
    margin-bottom: 4px;
`;

const Textarea = styled.textarea`
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const CharacterCounter = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    text-align: right;
    margin-top: 4px;
`;

const RecipientsList = styled.div`
    margin-bottom: 20px;
`;

const RecipientsContainer = styled.div`
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0;
    background-color: #f9f9f9;
`;

const RecipientItem = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid #eee;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background-color: #f0f0f0;
    }
`;

const RecipientName = styled.div`
    font-size: 14px;
    color: #34495e;
`;

const RecipientPhone = styled.div`
    font-size: 14px;
    color: #7f8c8d;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
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

const SendButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: #27ae60;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
        background-color: #219955;
    }

    &:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
    }
`;

export default OwnersPage;