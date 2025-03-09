import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    FaPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaCar,
    FaUser,
    FaCalendarAlt,
    FaTools,
    FaMoneyBillWave,
    FaHistory,
    FaTags,
    FaFilter,
    FaTimes,
    FaArrowLeft
} from 'react-icons/fa';
import { VehicleExpanded } from '../../types/client';
import {
    fetchVehicles,
    fetchVehiclesByOwnerId,
    deleteVehicle,
    fetchClientById
} from '../../api/mocks/clientMocks';
import VehicleFormModal from './components/VehicleFormModal';
import VehicleHistoryModal from './components/VehicleHistoryModal';
import Modal from '../../components/common/Modal';

// Vehicle filters interface
interface VehicleFilters {
    licensePlate: string;
    make: string;
    model: string;
    minYear: string;
    minServices: string;
    minSpent: string;
}

const VehiclesPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const ownerId = queryParams.get('ownerId');

    // State
    const [vehicles, setVehicles] = useState<VehicleExpanded[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<VehicleExpanded[]>([]);
    const [ownerName, setOwnerName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI state
    const [showFilters, setShowFilters] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleExpanded | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Filters
    const [filters, setFilters] = useState<VehicleFilters>({
        licensePlate: '',
        make: '',
        model: '',
        minYear: '',
        minServices: '',
        minSpent: ''
    });

    // Load vehicles on component mount
    useEffect(() => {
        const loadVehicles = async () => {
            try {
                setLoading(true);

                // If we have an owner ID, fetch only that owner's vehicles
                let vehiclesData;
                if (ownerId) {
                    vehiclesData = await fetchVehiclesByOwnerId(ownerId);

                    // Also fetch the owner's name
                    const owner = await fetchClientById(ownerId);
                    if (owner) {
                        setOwnerName(`${owner.firstName} ${owner.lastName}`);
                    }
                } else {
                    vehiclesData = await fetchVehicles();
                }

                setVehicles(vehiclesData);
                setFilteredVehicles(vehiclesData);
                setError(null);
            } catch (err) {
                setError('Nie udało się załadować listy pojazdów');
                console.error('Error loading vehicles:', err);
            } finally {
                setLoading(false);
            }
        };

        loadVehicles();
    }, [ownerId]);

    // Filter vehicles when filters change
    useEffect(() => {
        let result = [...vehicles];

        // Filter by license plate
        if (filters.licensePlate) {
            const query = filters.licensePlate.toLowerCase();
            result = result.filter(vehicle =>
                vehicle.licensePlate.toLowerCase().includes(query)
            );
        }

        // Filter by make
        if (filters.make) {
            const query = filters.make.toLowerCase();
            result = result.filter(vehicle =>
                vehicle.make.toLowerCase().includes(query)
            );
        }

        // Filter by model
        if (filters.model) {
            const query = filters.model.toLowerCase();
            result = result.filter(vehicle =>
                vehicle.model.toLowerCase().includes(query)
            );
        }

        // Filter by minimum year
        if (filters.minYear) {
            const minYear = parseInt(filters.minYear);
            if (!isNaN(minYear)) {
                result = result.filter(vehicle => vehicle.year >= minYear);
            }
        }

        // Filter by minimum services
        if (filters.minServices) {
            const minServices = parseInt(filters.minServices);
            if (!isNaN(minServices)) {
                result = result.filter(vehicle => vehicle.totalServices >= minServices);
            }
        }

        // Filter by minimum spent
        if (filters.minSpent) {
            const minSpent = parseFloat(filters.minSpent);
            if (!isNaN(minSpent)) {
                result = result.filter(vehicle => vehicle.totalSpent >= minSpent);
            }
        }

        setFilteredVehicles(result);
    }, [vehicles, filters]);

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
            licensePlate: '',
            make: '',
            model: '',
            minYear: '',
            minServices: '',
            minSpent: ''
        });
    };

    const handleAddVehicle = () => {
        setSelectedVehicle(null);
        setShowAddModal(true);
    };

    const handleEditVehicle = (vehicle: VehicleExpanded) => {
        setSelectedVehicle(vehicle);
        setShowAddModal(true);
    };

    const handleSaveVehicle = (vehicle: VehicleExpanded) => {
        if (selectedVehicle) {
            // Update existing vehicle
            setVehicles(vehicles.map(v => v.id === vehicle.id ? vehicle : v));
        } else {
            // Add new vehicle
            setVehicles(prev => [...prev, vehicle]);
        }
        setShowAddModal(false);
        setSelectedVehicle(null);
    };

    const handleDeleteClick = (vehicle: VehicleExpanded) => {
        setSelectedVehicle(vehicle);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedVehicle) return;

        try {
            await deleteVehicle(selectedVehicle.id);
            setVehicles(vehicles.filter(v => v.id !== selectedVehicle.id));
            setShowDeleteConfirm(false);
            setSelectedVehicle(null);
        } catch (err) {
            setError('Nie udało się usunąć pojazdu');
            console.error('Error deleting vehicle:', err);
        }
    };

    const handleShowHistory = (vehicle: VehicleExpanded) => {
        setSelectedVehicle(vehicle);
        setShowHistoryModal(true);
    };

    const handleBackToOwners = () => {
        navigate('/clients/owners');
    };

    const hasActiveFilters = () => {
        return Object.values(filters).some(val => val !== '');
    };

    return (
        <PageContainer>
            <PageHeader>
                {ownerId && ownerName ? (
                    <TitleWithBack>
                        <BackButton onClick={handleBackToOwners}>
                            <FaArrowLeft />
                        </BackButton>
                        <div>
                            <h1>Pojazdy klienta</h1>
                            <OwnerName>{ownerName}</OwnerName>
                        </div>
                    </TitleWithBack>
                ) : (
                    <h1>Pojazdy</h1>
                )}
                <HeaderActions>
                    <FilterToggle onClick={() => setShowFilters(!showFilters)}>
                        <FaFilter /> {showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
                    </FilterToggle>
                    <AddButton onClick={handleAddVehicle}>
                        <FaPlus /> Dodaj pojazd
                    </AddButton>
                </HeaderActions>
            </PageHeader>

            {showFilters && (
                <FiltersContainer>
                    <FiltersGrid>
                        <FilterGroup>
                            <Label htmlFor="licensePlate">Numer rejestracyjny</Label>
                            <Input
                                id="licensePlate"
                                name="licensePlate"
                                value={filters.licensePlate}
                                onChange={handleFilterChange}
                                placeholder="Wyszukaj po numerze..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="make">Marka</Label>
                            <Input
                                id="make"
                                name="make"
                                value={filters.make}
                                onChange={handleFilterChange}
                                placeholder="Wyszukaj po marce..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="model">Model</Label>
                            <Input
                                id="model"
                                name="model"
                                value={filters.model}
                                onChange={handleFilterChange}
                                placeholder="Wyszukaj po modelu..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="minYear">Min. rok produkcji</Label>
                            <Input
                                id="minYear"
                                name="minYear"
                                type="number"
                                min="1900"
                                value={filters.minYear}
                                onChange={handleFilterChange}
                                placeholder="Min. rok produkcji..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="minServices">Min. liczba usług</Label>
                            <Input
                                id="minServices"
                                name="minServices"
                                type="number"
                                min="0"
                                value={filters.minServices}
                                onChange={handleFilterChange}
                                placeholder="Min. liczba usług..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="minSpent">Min. wydatki (zł)</Label>
                            <Input
                                id="minSpent"
                                name="minSpent"
                                type="number"
                                min="0"
                                value={filters.minSpent}
                                onChange={handleFilterChange}
                                placeholder="Min. kwota wydatków..."
                            />
                        </FilterGroup>
                    </FiltersGrid>

                    <FiltersActions>
                        {hasActiveFilters() && (
                            <FilterResults>
                                Znaleziono: {filteredVehicles.length} {
                                filteredVehicles.length === 1 ? 'pojazd' :
                                    filteredVehicles.length > 1 && filteredVehicles.length < 5 ? 'pojazdy' : 'pojazdów'
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
                <LoadingMessage>Ładowanie danych pojazdów...</LoadingMessage>
            ) : filteredVehicles.length === 0 ? (
                <EmptyState>
                    {hasActiveFilters()
                        ? 'Nie znaleziono pojazdów spełniających kryteria filtrowania.'
                        : 'Brak pojazdów w bazie. Kliknij "Dodaj pojazd", aby dodać pierwszy pojazd.'}
                </EmptyState>
            ) : (
                <VehiclesGrid>
                    {filteredVehicles.map(vehicle => (
                        <VehicleCard key={vehicle.id}>
                            <VehicleHeader>
                                <VehicleName>{vehicle.make} {vehicle.model}</VehicleName>
                                <VehicleYear>{vehicle.year}</VehicleYear>
                            </VehicleHeader>

                            <LicensePlateContainer>
                                <LicensePlate>{vehicle.licensePlate}</LicensePlate>
                            </LicensePlateContainer>

                            {vehicle.vin && (
                                <VehicleDetail>
                                    <DetailLabel>VIN:</DetailLabel>
                                    <DetailValue>{vehicle.vin}</DetailValue>
                                </VehicleDetail>
                            )}

                            {vehicle.color && (
                                <VehicleDetail>
                                    <DetailLabel>Kolor:</DetailLabel>
                                    <DetailValue>{vehicle.color}</DetailValue>
                                </VehicleDetail>
                            )}

                            <VehicleMetrics>
                                <MetricItem>
                                    <MetricIcon $color="#3498db"><FaTools /></MetricIcon>
                                    <MetricValue>{vehicle.totalServices}</MetricValue>
                                    <MetricLabel>Usługi</MetricLabel>
                                </MetricItem>

                                <MetricItem>
                                    <MetricIcon $color="#2ecc71"><FaMoneyBillWave /></MetricIcon>
                                    <MetricValue>{vehicle.totalSpent.toFixed(2)} zł</MetricValue>
                                    <MetricLabel>Wydatki łącznie</MetricLabel>
                                </MetricItem>
                            </VehicleMetrics>

                            <LastServiceInfo>
                                {vehicle.lastServiceDate ? (
                                    <>Ostatnia usługa: {formatDate(vehicle.lastServiceDate)}</>
                                ) : (
                                    <>Brak historii usług</>
                                )}
                            </LastServiceInfo>

                            <VehicleActions>
                                <ActionButton title="Edytuj pojazd" onClick={() => handleEditVehicle(vehicle)}>
                                    <FaEdit />
                                </ActionButton>

                                <ActionButton
                                    title="Historia usług"
                                    onClick={() => handleShowHistory(vehicle)}
                                >
                                    <FaHistory />
                                </ActionButton>

                                <ActionButton
                                    title="Usuń pojazd"
                                    danger
                                    onClick={() => handleDeleteClick(vehicle)}
                                >
                                    <FaTrash />
                                </ActionButton>
                            </VehicleActions>
                        </VehicleCard>
                    ))}
                </VehiclesGrid>
            )}

            {/* Vehicle add/edit modal */}
            {showAddModal && (
                <VehicleFormModal
                    vehicle={selectedVehicle}
                    defaultOwnerId={ownerId || undefined}
                    onSave={handleSaveVehicle}
                    onCancel={() => setShowAddModal(false)}
                />
            )}

            {/* Vehicle history modal */}
            {showHistoryModal && selectedVehicle && (
                <VehicleHistoryModal
                    vehicle={selectedVehicle}
                    onClose={() => setShowHistoryModal(false)}
                />
            )}

            {/* Delete confirmation modal */}
            {showDeleteConfirm && selectedVehicle && (
                <Modal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    title="Potwierdź usunięcie"
                >
                    <DeleteConfirmContent>
                        <p>Czy na pewno chcesz usunąć pojazd <strong>{selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.licensePlate})</strong>?</p>
                        <p>Ta operacja jest nieodwracalna.</p>

                        <DeleteConfirmButtons>
                            <CancelButton onClick={() => setShowDeleteConfirm(false)}>
                                Anuluj
                            </CancelButton>
                            <DeleteButton onClick={handleConfirmDelete}>
                                Usuń pojazd
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

const TitleWithBack = styled.div`
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

const OwnerName = styled.div`
    font-size: 16px;
    color: #7f8c8d;
    margin-top: 4px;
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

const VehiclesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
`;

const VehicleCard = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const VehicleHeader = styled.div`
    padding: 16px;
    border-bottom: 1px solid #f5f5f5;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const VehicleName = styled.h3`
    margin: 0;
    font-size: 18px;
    color: #34495e;
`;

const VehicleYear = styled.div`
    font-size: 16px;
    color: #7f8c8d;
    font-weight: 500;
`;

const LicensePlateContainer = styled.div`
    display: flex;
    justify-content: center;
    padding: 12px;
    background-color: #f5f5f5;
`;

const LicensePlate = styled.div`
    background-color: white;
    border: 2px solid #3498db;
    border-radius: 4px;
    padding: 8px 20px;
    font-weight: 600;
    color: #34495e;
    font-size: 18px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const VehicleDetail = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 8px 16px;
    border-bottom: 1px solid #f5f5f5;
`;

const DetailLabel = styled.div`
    font-weight: 500;
    color: #7f8c8d;
    font-size: 14px;
`;

const DetailValue = styled.div`
    color: #34495e;
    font-size: 14px;
`;

const VehicleMetrics = styled.div`
    display: flex;
    padding: 12px 16px;
    background-color: #f9f9f9;
    border-bottom: 1px solid #f5f5f5;
`;

const MetricItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 50%;
    padding: 8px 0;
`;

const MetricIcon = styled.div<{ $color: string }>`
    color: ${props => props.$color};
    font-size: 18px;
    margin-bottom: 4px;
`;

const MetricValue = styled.div`
    font-weight: 600;
    font-size: 16px;
    color: #34495e;
`;

const MetricLabel = styled.div`
    font-size: 12px;
    color: #7f8c8d;
`;

const LastServiceInfo = styled.div`
    padding: 8px 16px;
    font-size: 13px;
    color: #7f8c8d;
    background-color: #f9f9f9;
    text-align: center;
    border-bottom: 1px solid #f5f5f5;
`;

const VehicleActions = styled.div`
    display: flex;
    justify-content: space-around;
    padding: 12px 16px;
    gap: 8px;
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

export default VehiclesPage;