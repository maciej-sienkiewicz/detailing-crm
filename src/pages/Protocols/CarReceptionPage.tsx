import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaCarSide, FaFileAlt } from 'react-icons/fa';
import {
    fetchCarReceptionProtocols,
    deleteCarReceptionProtocol,
    fetchAvailableServices,
    updateProtocolStatus
} from '../../api/mocks/carReceptionMocks';
import { CarReceptionProtocol, ProtocolStatus } from '../../types';
import { CarReceptionForm } from './components/CarReceptionForm';
import { StatusManager } from './components/StatusManager';

const CarReceptionPage: React.FC = () => {
    const [protocols, setProtocols] = useState<CarReceptionProtocol[]>([]);
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProtocol, setEditingProtocol] = useState<CarReceptionProtocol | null>(null);

    // Pobieranie danych
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [protocolsData, servicesData] = await Promise.all([
                    fetchCarReceptionProtocols(),
                    fetchAvailableServices()
                ]);
                setProtocols(protocolsData);
                setAvailableServices(servicesData);
                setError(null);
            } catch (err) {
                setError('Nie udało się pobrać danych protokołów');
                console.error('Error fetching car reception protocols:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Obsługa dodawania nowego protokołu
    const handleAddProtocol = () => {
        setEditingProtocol(null);
        setShowForm(true);
    };

    // Obsługa edytowania protokołu
    const handleEditProtocol = (protocol: CarReceptionProtocol) => {
        setEditingProtocol(protocol);
        setShowForm(true);
    };

    // Obsługa usunięcia protokołu
    const handleDeleteProtocol = async (id: string) => {
        if (window.confirm('Czy na pewno chcesz usunąć ten protokół?')) {
            try {
                await deleteCarReceptionProtocol(id);
                setProtocols(protocols.filter(protocol => protocol.id !== id));
            } catch (err) {
                setError('Nie udało się usunąć protokołu');
            }
        }
    };

    // Obsługa zapisania protokołu
    const handleSaveProtocol = (protocol: CarReceptionProtocol) => {
        if (editingProtocol) {
            // Aktualizacja istniejącego protokołu
            setProtocols(protocols.map(p => p.id === protocol.id ? protocol : p));
        } else {
            // Dodanie nowego protokołu
            setProtocols([...protocols, protocol]);
        }
        setShowForm(false);
        setEditingProtocol(null);
    };

    // Zmiana statusu protokołu
    const handleStatusChange = async (protocolId: string, newStatus: ProtocolStatus) => {
        try {
            const updatedProtocol = await updateProtocolStatus(protocolId, newStatus);

            // Aktualizacja listy protokołów
            setProtocols(
                protocols.map(protocol =>
                    protocol.id === protocolId ? updatedProtocol : protocol
                )
            );
        } catch (err) {
            setError('Nie udało się zmienić statusu protokołu');
            console.error('Error updating protocol status:', err);
        }
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
                                        <TableHeader>Status</TableHeader>
                                        <TableHeader>Akcje</TableHeader>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {protocols.map(protocol => (
                                        <TableRow key={protocol.id}>
                                            <TableCell>
                                                <CarInfo>
                                                    <strong>{protocol.make} {protocol.model}</strong>
                                                    <span>Rok: {protocol.productionYear}</span>
                                                </CarInfo>
                                            </TableCell>
                                            <TableCell>
                                                <DateRange>
                                                    <span>Od: {formatDate(protocol.startDate)}</span>
                                                    <span>Do: {formatDate(protocol.endDate)}</span>
                                                </DateRange>
                                            </TableCell>
                                            <TableCell>
                                                <OwnerInfo>
                                                    <div>{protocol.ownerName}</div>
                                                    {protocol.companyName && (
                                                        <CompanyInfo>{protocol.companyName}</CompanyInfo>
                                                    )}
                                                </OwnerInfo>
                                            </TableCell>
                                            <TableCell>
                                                <LicensePlate>{protocol.licensePlate}</LicensePlate>
                                            </TableCell>
                                            <TableCell>
                                                <StatusManager
                                                    status={protocol.status}
                                                    onStatusChange={(newStatus) => handleStatusChange(protocol.id, newStatus)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <ActionButtons>
                                                    <ActionButton onClick={() => handleEditProtocol(protocol)}>
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

// Style dla statusów
const StatusContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const StatusBadge = styled.div`
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    color: white;
`;

const StatusActionButton = styled.button`
    background: none;
    border: none;
    color: #7f8c8d;
    font-size: 14px;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    border-radius: 4px;

    &:hover {
        background-color: #f0f0f0;
        color: #34495e;
    }
`;

const StatusMenu = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 10;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 160px;
    margin-top: 8px;
    overflow: hidden;
`;

const StatusMenuItem = styled.div`
    padding: 8px 12px;
    cursor: pointer;
    border-left: 3px solid;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f5f5f5;
    }

    &:not(:last-child) {
        border-bottom: 1px solid #eee;
    }
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