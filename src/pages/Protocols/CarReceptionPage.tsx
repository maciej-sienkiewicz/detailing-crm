import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaArrowLeft, FaEdit, FaFileAlt, FaPlus, FaTrash} from 'react-icons/fa';
import {ProtocolListItem, ProtocolStatus} from '../../types/protocol';
import {CarReceptionProtocol} from '../../types';
import {CarReceptionForm} from './components/CarReceptionForm/CarReceptionForm';
import {useLocation, useNavigate} from 'react-router-dom';
import {protocolsApi} from '../../api/protocolsApi';
import {fetchAvailableServices} from '../../api/mocks/carReceptionMocks';

const CarReceptionPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [protocols, setProtocols] = useState<ProtocolListItem[]>([]);
    const [filteredProtocols, setFilteredProtocols] = useState<ProtocolListItem[]>([]);
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProtocol, setEditingProtocol] = useState<CarReceptionProtocol | null>(null);
    const [formData, setFormData] = useState<Partial<CarReceptionProtocol>>({});

    // Nowy stan do obsługi aktywnego filtru
    const [activeFilter, setActiveFilter] = useState<'Zaplanowane' | 'W realizacji' | 'Gotowe na odbiór' | 'Archiwum' | 'Wszystkie'>('Wszystkie');

    // Definiujemy mapowanie filtrów na statusy protokołów
    const filterMapping = {
        'Zaplanowane': [ProtocolStatus.SCHEDULED],
        'W realizacji': [ProtocolStatus.IN_PROGRESS],
        'Gotowe na odbiór': [ProtocolStatus.READY_FOR_PICKUP],
        'Archiwum': [ProtocolStatus.COMPLETED],
        'Wszystkie': [ProtocolStatus.SCHEDULED, ProtocolStatus.IN_PROGRESS, ProtocolStatus.READY_FOR_PICKUP, ProtocolStatus.COMPLETED]
    };

    // Sprawdzamy, czy mamy dane do stworzenia protokołu z wizyty
    const protocolDataFromAppointment = location.state?.protocolData;
    const appointmentId = location.state?.appointmentId;
    const editProtocolId = location.state?.editProtocolId;
    const isOpenProtocolAction = location.state?.isOpenProtocolAction;
    const startDateFromCalendar = location.state?.startDate;
    const isFullProtocolFromNav = location.state?.isFullProtocol !== undefined
        ? location.state.isFullProtocol
        : true; // domyślnie true, jeśli nie określono

    const [isFullProtocol, setIsFullProtocol] = useState(isFullProtocolFromNav);

    // Dodajemy stan, który będzie wymuszał odświeżenie listy protokołów
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Funkcja do wymuszenia odświeżenia listy protokołów
    const refreshProtocolsList = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // Pobieranie danych
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Używamy nowego API do pobierania listy protokołów
                const protocolsData = await protocolsApi.getProtocolsList();
                setProtocols(protocolsData);

                // Zastosuj aktualny filtr
                if (activeFilter === 'Wszystkie') {
                    setFilteredProtocols(protocolsData);
                } else {
                    const statusesToFilter = filterMapping[activeFilter];
                    setFilteredProtocols(protocolsData.filter(protocol =>
                        statusesToFilter.includes(protocol.status)
                    ));
                }

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
                            if(isOpenProtocolAction) {
                                protocolToEdit.status = ProtocolStatus.IN_PROGRESS;
                            }
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
    }, [protocolDataFromAppointment, editProtocolId, startDateFromCalendar, refreshTrigger]);

    // Efekt dla obsługi odświeżenia komponentu po zmianie ścieżki
    // Dzięki temu, gdy klikniemy w menu głównym "Zlecenia", aplikacja zawsze pokaże listę protokołów
    useEffect(() => {
        setShowForm(false);
        setEditingProtocol(null);
        refreshProtocolsList();
    }, [location.key]);

    // Nowa funkcja do zmiany filtra
    const handleFilterChange = (filter: 'Zaplanowane' | 'W realizacji' | 'Gotowe na odbiór' | 'Archiwum' | 'Wszystkie') => {
        setActiveFilter(filter);

        // Filtrujemy lokalnie, bez ponownego zapytania do serwera
        if (filter === 'Wszystkie') {
            setFilteredProtocols(protocols);
        } else {
            const statusesToFilter = filterMapping[filter];
            const filtered = protocols.filter(protocol =>
                statusesToFilter.includes(protocol.status)
            );
            setFilteredProtocols(filtered);
        }
    };

    // Obsługa dodawania nowego protokołu
    const handleAddProtocol = () => {
        const today = new Date().toISOString().split('T')[0];
        setEditingProtocol(null);
        setFormData({});
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

    // Dodajemy funkcję, by umożliwić odświeżenie listy przy powrocie z innych komponentów
    useEffect(() => {
        // Funkcja do odświeżenia danych przy powrocie do strony
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !showForm && !loading) {
                refreshProtocolsList();
            }
        };

        // Nasłuchujemy na zmiany widoczności dokumentu zamiast focus
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [showForm, loading]);

    // Obsługa usunięcia protokołu
    const handleDeleteProtocol = async (id: string) => {
        if (window.confirm('Czy na pewno chcesz usunąć ten protokół?')) {
            try {
                // Używamy nowego API do usuwania
                const success = await protocolsApi.deleteProtocol(id);

                if (success) {
                    // Po pomyślnym usunięciu protokołu odświeżamy listę
                    refreshProtocolsList();
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
        // Zamiast bezpośrednio pobierać dane, wywołujemy odświeżenie
        refreshProtocolsList();
        setShowForm(false);
        setEditingProtocol(null);
        navigate(`/orders/car-reception/${protocol.id}`);
    };

    // Obsługa powrotu z formularza
    const handleFormCancel = () => {
        setShowForm(false);
        setEditingProtocol(null);
    };

    return (
        <PageContainer>
            <PageHeader>
                {showForm ? (
                    <>
                        <HeaderLeft>
                            <BackButton onClick={handleFormCancel}>
                                <FaArrowLeft />
                            </BackButton>
                            <h1>{editingProtocol ? 'Edycja protokołu' : 'Nowy protokół przyjęcia pojazdu'}</h1>
                        </HeaderLeft>
                    </>
                ) : (
                    <>
                        <h1>Protokoły przyjęcia pojazdu</h1>
                        <AddButton onClick={handleAddProtocol}>
                            <FaPlus /> Nowy protokół
                        </AddButton>
                    </>
                )}
            </PageHeader>

            {/* Nowy komponent z przyciskami filtrowania - ukrywamy podczas wyświetlania formularza */}
            {!showForm && (
                <FilterButtons>
                    <FilterButton
                        active={activeFilter === 'Wszystkie'}
                        onClick={() => handleFilterChange('Wszystkie')}
                    >
                        Wszystkie
                    </FilterButton>
                    <FilterButton
                        active={activeFilter === 'Zaplanowane'}
                        onClick={() => handleFilterChange('Zaplanowane')}
                    >
                        Zaplanowane
                    </FilterButton>
                    <FilterButton
                        active={activeFilter === 'W realizacji'}
                        onClick={() => handleFilterChange('W realizacji')}
                    >
                        W realizacji
                    </FilterButton>
                    <FilterButton
                        active={activeFilter === 'Gotowe na odbiór'}
                        onClick={() => handleFilterChange('Gotowe na odbiór')}
                    >
                        Gotowe na odbiór
                    </FilterButton>
                    <FilterButton
                        active={activeFilter === 'Archiwum'}
                        onClick={() => handleFilterChange('Archiwum')}
                    >
                        Archiwum
                    </FilterButton>
                </FilterButtons>
            )}

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
                            onCancel={handleFormCancel}
                        />
                    ) : (
                        <>
                            {filteredProtocols.length === 0 ? (
                                <EmptyState>
                                    <p>Brak protokołów przyjęcia {activeFilter !== 'Wszystkie' ? `w grupie "${activeFilter}"` : ''}.
                                        {activeFilter === 'Wszystkie' ? ' Kliknij "Nowy protokół", aby utworzyć pierwszy.' : ''}</p>
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
                                    {filteredProtocols.map(protocol => (
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
                                            <TableCell>
                                                <StatusBadge status={protocol.status}>
                                                    {getStatusLabel(protocol.status)}
                                                </StatusBadge>
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

    // Formatowanie daty
    const formattedDate = date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    // Dodajemy godzinę tylko dla daty początkowej (startDate)
    if (dateString.includes('T') && dateString.split('T')[1] !== '23:59:59') {
        const time = date.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
        });
        return `${formattedDate}, ${time}`;
    }

    return formattedDate;
};

// Funkcja pomocnicza do uzyskania etykiety statusu
const getStatusLabel = (status: ProtocolStatus): string => {
    const statusLabels: Record<ProtocolStatus, string> = {
        [ProtocolStatus.SCHEDULED]: 'Zaplanowano',
        [ProtocolStatus.IN_PROGRESS]: 'W realizacji',
        [ProtocolStatus.READY_FOR_PICKUP]: 'Gotowy do odbioru',
        [ProtocolStatus.COMPLETED]: 'Zakończony'
    };

    return statusLabels[status] || status;
};

// Nowe style dla filtrów
const FilterButtons = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active: boolean }>`
    padding: 8px 16px;
    background-color: ${props => props.active ? '#3498db' : '#f8f9fa'};
    color: ${props => props.active ? 'white' : '#333'};
    border: 1px solid ${props => props.active ? '#2980b9' : '#ddd'};
    border-radius: 4px;
    font-weight: ${props => props.active ? '500' : 'normal'};
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: ${props => props.active ? '#2980b9' : '#f0f0f0'};
    }
`;

// Nowy styl dla wyświetlania statusu
const StatusBadge = styled.div<{ status: ProtocolStatus }>`
    display: inline-block;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${props => {
        switch (props.status) {
            case ProtocolStatus.SCHEDULED:
                return '#e3f2fd'; // jasny niebieski
            case ProtocolStatus.IN_PROGRESS:
                return '#f3e5f5'; // jasny fioletowy
            case ProtocolStatus.READY_FOR_PICKUP:
                return '#e8f5e9'; // jasny zielony
            case ProtocolStatus.COMPLETED:
                return '#f5f5f5'; // jasny szary
            default:
                return '#f5f5f5';
        }
    }};
    color: ${props => {
        switch (props.status) {
            case ProtocolStatus.SCHEDULED:
                return '#1976d2'; // ciemny niebieski
            case ProtocolStatus.IN_PROGRESS:
                return '#7b1fa2'; // ciemny fioletowy 
            case ProtocolStatus.READY_FOR_PICKUP:
                return '#2e7d32'; // ciemny zielony
            case ProtocolStatus.COMPLETED:
                return '#616161'; // ciemny szary
            default:
                return '#616161';
        }
    }};
    border: 1px solid ${props => {
        switch (props.status) {
            case ProtocolStatus.SCHEDULED:
                return '#bbdefb'; // jaśniejszy niebieski
            case ProtocolStatus.IN_PROGRESS:
                return '#e1bee7'; // jaśniejszy fioletowy
            case ProtocolStatus.READY_FOR_PICKUP:
                return '#c8e6c9'; // jaśniejszy zielony
            case ProtocolStatus.COMPLETED:
                return '#e0e0e0'; // jaśniejszy szary
            default:
                return '#e0e0e0';
        }
    }};
`;

// Istniejące style - pozostawiamy bez zmian
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

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
`;

const BackButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background-color: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 50%;
    cursor: pointer;
    color: #34495e;

    &:hover {
        background-color: #f0f0f0;
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