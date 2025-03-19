import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaCarSide, FaFileAlt } from 'react-icons/fa';
import { ProtocolListItem, ProtocolStatus } from '../../types/protocol';
import { CarReceptionProtocol } from '../../types';
import { CarReceptionForm } from './components/CarReceptionForm/CarReceptionForm';
import { useLocation, useNavigate } from 'react-router-dom';
import { protocolsApi } from '../../api/protocolsApi';
import { fetchAvailableServices } from '../../api/mocks/carReceptionMocks';

const CarReceptionPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [protocols, setProtocols] = useState<ProtocolListItem[]>([]);
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProtocol, setEditingProtocol] = useState<CarReceptionProtocol | null>(null);
    const [formData, setFormData] = useState<Partial<CarReceptionProtocol>>({});

    // Sprawdzamy, czy mamy dane do stworzenia protokołu z wizyty
    const protocolDataFromAppointment = location.state?.protocolData;
    const appointmentId = location.state?.appointmentId;
    const editProtocolId = location.state?.editProtocolId;
    const startDateFromCalendar = location.state?.startDate;
    const isFullProtocolFromNav = location.state?.isFullProtocol !== undefined
        ? location.state.isFullProtocol
        : true; // domyślnie true, jeśli nie określono

    const [isFullProtocol, setIsFullProtocol] = useState(isFullProtocolFromNav);

    // Pobieranie danych
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Używamy nowego API do pobierania listy protokołów
                const protocolsData = await protocolsApi.getProtocolsList();
                console.log(protocolsData);
                setProtocols(protocolsData);

                // Pobieramy dostępne usługi
                const servicesData = await fetchAvailableServices();
                setAvailableServices(servicesData);
                setError(null);

                // Jeśli mamy dane z wizyty, automatycznie otworzymy formularz
                if (protocolDataFromAppointment) {
                    setEditingProtocol(null); // To nie jest edycja, tylko nowy protokół
                    setShowForm(true);
                }

                // Jeśli przyszliśmy z kalendarza z nową wizytą
                if (startDateFromCalendar) {
                    const today = new Date().toISOString().split('T')[0];
                    setEditingProtocol(null);
                    const initialData = {
                        startDate: startDateFromCalendar,
                        endDate: startDateFromCalendar
                    };
                    setFormData(prev => ({
                        ...prev,
                        ...initialData
                    }));
                    setShowForm(true);
                }

                // Jeśli mamy ID protokołu do edycji, pobieramy go i otwieramy formularz
                if (editProtocolId) {
                    try {
                        const protocolToEdit = await protocolsApi.getProtocolDetails(editProtocolId);
                        if (protocolToEdit) {
                            setEditingProtocol(protocolToEdit);
                            setShowForm(true);
                        } else {
                            setError('Nie udało się znaleźć protokołu do edycji');
                        }
                    } catch (err) {
                        setError('Nie udało się pobrać protokołu do edycji');
                        console.error('Error fetching protocol for edit:', err);
                    }
                }
            } catch (err) {
                setError('Nie udało się pobrać danych protokołów');
                console.error('Error fetching car reception protocols:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [protocolDataFromAppointment, editProtocolId, startDateFromCalendar]);

    // Obsługa dodawania nowego protokołu
    const handleAddProtocol = () => {
        const today = new Date().toISOString().split('T')[0];
        setEditingProtocol(null);
        setShowForm(true);
    };

    // Obsługa przejścia do szczegółów protokołu
    const handleViewProtocol = (protocol: ProtocolListItem) => {
        navigate(`/orders/car-reception/${protocol.id}`);
    };

    // Obsługa edytowania protokołu
    const handleEditProtocol = async (protocolId: string) => {
        try {
            setLoading(true);
            const protocolDetails = await protocolsApi.getProtocolDetails(protocolId);

            if (protocolDetails) {
                setEditingProtocol(protocolDetails);
                setShowForm(true);
            } else {
                setError('Nie udało się pobrać danych protokołu do edycji');
            }
        } catch (err) {
            setError('Błąd podczas pobierania danych protokołu do edycji');
            console.error('Error fetching protocol for edit:', err);
        } finally {
            setLoading(false);
        }
    };

    // Obsługa usunięcia protokołu
    const handleDeleteProtocol = async (id: string) => {
        if (window.confirm('Czy na pewno chcesz usunąć ten protokół?')) {
            try {
                // Używamy nowego API do usuwania
                const success = await protocolsApi.deleteProtocol(id);

                if (success) {
                    setProtocols(protocols.filter(protocol => protocol.id !== id));
                } else {
                    setError('Nie udało się usunąć protokołu');
                }
            } catch (err) {
                setError('Nie udało się usunąć protokołu');
                console.error('Error deleting protocol:', err);
            }
        }
    };

    // Obsługa zapisania protokołu
    const handleSaveProtocol = (protocol: CarReceptionProtocol) => {
        // Po zapisaniu lub aktualizacji, odświeżamy listę protokołów
        const fetchUpdatedProtocols = async () => {
            try {
                const protocolsData = await protocolsApi.getProtocolsList();
                setProtocols(protocolsData);
            } catch (err) {
                console.error('Error refreshing protocols list:', err);
            }
        };

        fetchUpdatedProtocols();
        setShowForm(false);
        setEditingProtocol(null);
    };

    return (
        <PageContainer>
            <PageHeader>
                <h1>Protokoły przyjęcia pojazdu</h1>
                <AddButton onClick={handleAddProtocol}>
                    <FaPlus /> Nowy protokół
                </AddButton>
            </PageHeader>

            {loading ? (
                <LoadingMessage>Ładowanie danych...</LoadingMessage>
            ) : error ? (
                <ErrorMessage>{error}</ErrorMessage>
            ) : (
                <>
                    {showForm ? (
                        <CarReceptionForm
                            protocol={editingProtocol}
                            availableServices={availableServices}
                            initialData={protocolDataFromAppointment || formData}
                            appointmentId={appointmentId}
                            isFullProtocol={isFullProtocol}
                            onSave={handleSaveProtocol}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingProtocol(null);
                            }}
                        />
                    ) : (
                        <>
                            {protocols.length === 0 ? (
                                <EmptyState>
                                    <p>Brak protokołów przyjęcia. Kliknij "Nowy protokół", aby utworzyć pierwszy.</p>
                                </EmptyState>
                            ) : (
                                <ProtocolsTable>
                                    <thead>
                                    <tr>
                                        <TableHeader>Pojazd</TableHeader>
                                        <TableHeader>Data</TableHeader>
                                        <TableHeader>Właściciel</TableHeader>
                                        <TableHeader>Numer rejestracyjny</TableHeader>
                                        <TableHeader>Akcje</TableHeader>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {protocols.map(protocol => (
                                        <TableRow key={protocol.id} onClick={() => handleViewProtocol(protocol)}>
                                            <TableCell>
                                                <CarInfo>
                                                    <strong>{protocol.vehicle.make} {protocol.vehicle.model}</strong>
                                                    <span>Rok: {protocol.vehicle.productionYear}</span>
                                                </CarInfo>
                                            </TableCell>
                                            <TableCell>
                                                <DateRange>
                                                    <span>Od: {formatDate(protocol.period.startDate)}</span>
                                                    <span>Do: {formatDate(protocol.period.endDate)}</span>
                                                </DateRange>
                                            </TableCell>
                                            <TableCell>
                                                <OwnerInfo>
                                                    <div>{protocol.owner.name}</div>
                                                    {protocol.owner.companyName && (
                                                        <CompanyInfo>{protocol.owner.companyName}</CompanyInfo>
                                                    )}
                                                </OwnerInfo>
                                            </TableCell>
                                            <TableCell>
                                                <LicensePlate>{protocol.vehicle.licensePlate}</LicensePlate>
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <ActionButtons>
                                                    <ActionButton onClick={() => handleEditProtocol(protocol.id)}>
                                                        <FaEdit />
                                                    </ActionButton>
                                                    <ActionButton danger onClick={() => handleDeleteProtocol(protocol.id)}>
                                                        <FaTrash />
                                                    </ActionButton>
                                                    <ActionButton title="Drukuj protokół">
                                                        <FaFileAlt />
                                                    </ActionButton>
                                                </ActionButtons>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    </tbody>
                                </ProtocolsTable>
                            )}
                        </>
                    )}
                </>
            )}
        </PageContainer>
    );
};

// Funkcja pomocnicza do formatowania daty
const formatDate = (dateString: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

// Style komponentów

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

const ProtocolsTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const TableHeader = styled.th`
    text-align: left;
    padding: 12px 16px;
    background-color: #f5f5f5;
    border-bottom: 2px solid #eee;
    font-weight: 600;
    color: #333;
`;

const TableRow = styled.tr`
    &:not(:last-child) {
        border-bottom: 1px solid #eee;
    }

    &:hover {
        background-color: #f9f9f9;
    }
`;

const TableCell = styled.td`
    padding: 12px 16px;
    vertical-align: middle;
`;

const CarInfo = styled.div`
    display: flex;
    flex-direction: column;

    strong {
        margin-bottom: 2px;
        color: #34495e;
    }

    span {
        font-size: 13px;
        color: #7f8c8d;
    }
`;

const DateRange = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 14px;
    color: #34495e;

    span {
        margin-bottom: 4px;
    }
`;

const OwnerInfo = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 14px;
    color: #34495e;
`;

const CompanyInfo = styled.div`
    font-size: 13px;
    color: #7f8c8d;
    margin-top: 2px;
`;

const LicensePlate = styled.div`
    display: inline-block;
    padding: 4px 8px;
    background-color: #f0f7ff;
    border: 1px solid #d5e9f9;
    border-radius: 4px;
    font-weight: 500;
    color: #3498db;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
    background: none;
    border: none;
    color: ${props => props.danger ? '#e74c3c' : '#3498db'};
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;

    &:hover {
        background-color: ${props => props.danger ? '#fdecea' : '#f0f7ff'};
    }
`;

export default CarReceptionPage;