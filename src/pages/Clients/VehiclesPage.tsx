import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';
import {VehicleExpanded, VehicleStatistics} from '../../types';
import { vehicleApi } from '../../api/vehiclesApi';
import { clientApi } from '../../api/clientsApi';
import VehicleListTable from './components/VehicleListTable';
import VehicleDetailDrawer from './components/VehicleDetailDrawer';
import VehicleFilters, { VehicleFilters as VehicleFiltersType } from './components/VehicleFilters';
import VehicleFormModal from './components/VehicleFormModal';
import VehicleHistoryModal from './components/VehicleHistoryModal';
import Modal from '../../components/common/Modal';

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
    const [showDetailDrawer, setShowDetailDrawer] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleExpanded | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Filters
    const [filters, setFilters] = useState<VehicleFiltersType>({
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
                    vehiclesData = await vehicleApi.fetchVehiclesByOwnerId(ownerId);

                    // Also fetch the owner's name
                    const owner = await clientApi.fetchClientById(ownerId);
                    if (owner) {
                        setOwnerName(`${owner.firstName} ${owner.lastName}`);
                    }
                } else {
                    vehiclesData = await vehicleApi.fetchVehicles();
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

    // Reset filters
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

    const handleSaveVehicle = async (vehicle: VehicleExpanded) => {
        try {
            if (selectedVehicle && selectedVehicle.id) {
                // Update existing vehicle
                const updatedVehicle = await vehicleApi.updateVehicle(selectedVehicle.id, {
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    licensePlate: vehicle.licensePlate,
                    color: vehicle.color,
                    vin: vehicle.vin,
                    ownerIds: vehicle.ownerIds
                });

                setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));

                // Update the selected vehicle if detail drawer is open
                if (showDetailDrawer) {
                    setSelectedVehicle(updatedVehicle);
                }
            } else {
                // Add new vehicle
                const newVehicle = await vehicleApi.createVehicle({
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    licensePlate: vehicle.licensePlate,
                    color: vehicle.color,
                    vin: vehicle.vin,
                    ownerIds: vehicle.ownerIds
                });

                setVehicles(prev => [...prev, newVehicle]);
            }
            setShowAddModal(false);
        } catch (err) {
            setError('Nie udało się zapisać pojazdu');
            console.error('Error saving vehicle:', err);
        }
    };

    const handleDeleteClick = (vehicleId: string) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            setSelectedVehicle(vehicle);
            setShowDeleteConfirm(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedVehicle) return;

        try {
            const success = await vehicleApi.deleteVehicle(selectedVehicle.id);

            if (success) {
                setVehicles(vehicles.filter(v => v.id !== selectedVehicle.id));
                setShowDeleteConfirm(false);
                setSelectedVehicle(null);

                // Close drawer if currently showing the deleted vehicle
                if (showDetailDrawer) {
                    setShowDetailDrawer(false);
                }
            }
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

    const handleSelectVehicle = (vehicle: VehicleExpanded) => {
        setSelectedVehicle(vehicle);
        setShowDetailDrawer(true);
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
                    <AddButton onClick={handleAddVehicle}>
                        <FaPlus /> Dodaj pojazd
                    </AddButton>
                </HeaderActions>
            </PageHeader>

            {/* Filter section - moved outside the header */}
            <VehicleFilters
                filters={filters}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                onFilterChange={handleFilterChange}
                onResetFilters={resetFilters}
                resultCount={filteredVehicles.length}
            />

            {error && <ErrorMessage>{error}</ErrorMessage>}

            {loading ? (
                <LoadingMessage>Ładowanie danych pojazdów...</LoadingMessage>
            ) : filteredVehicles.length === 0 ? (
                <EmptyState>
                    {Object.values(filters).some(val => val !== '')
                        ? 'Nie znaleziono pojazdów spełniających kryteria filtrowania.'
                        : 'Brak pojazdów w bazie. Kliknij "Dodaj pojazd", aby dodać pierwszy pojazd.'}
                </EmptyState>
            ) : (
                <VehicleListTable
                    vehicles={filteredVehicles}
                    onSelectVehicle={handleSelectVehicle}
                    onEditVehicle={handleEditVehicle}
                    onDeleteVehicle={handleDeleteClick}
                    onShowHistory={handleShowHistory}
                />
            )}

            {/* Vehicle detail drawer */}
            <VehicleDetailDrawer
                isOpen={showDetailDrawer}
                vehicle={selectedVehicle}
                onClose={() => setShowDetailDrawer(false)}
            />

            {/* Vehicle add/edit modal */}
            {showAddModal && (
                <VehicleFormModal
                    vehicle={selectedVehicle}
                    defaultOwnerId={ownerId || undefined}
                    onSave={handleSaveVehicle}
                    onCancel={() => setShowAddModal(false)}
                />
            )}

            {/* History modal */}
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

export default VehiclesPage;