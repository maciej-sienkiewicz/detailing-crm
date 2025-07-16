// src/pages/Clients/VehiclesPage.tsx - Enhanced with URL navigation support
import React, { useState, useEffect, useImperativeHandle, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaArrowLeft, FaCar, FaUsers, FaTools, FaMoneyBillWave, FaExclamationTriangle, FaTrophy, FaEye } from 'react-icons/fa';
import { VehicleExpanded } from '../../types';
import { vehicleApi, VehicleTableFilters, VehicleCompanyStatisticsResponse } from '../../api/vehiclesApi';
import { clientApi } from '../../api/clientsApi';
import VehicleListTable from './components/VehicleListTable';
import VehicleDetailDrawer from './components/VehicleDetailDrawer';
import VehicleFilters, { VehicleFilters as VehicleFiltersType } from './components/VehicleFilters';
import VehicleFormModal from './components/VehicleFormModal';
import VehicleHistoryModal from './components/VehicleHistoryModal';
import Modal from '../../components/common/Modal';

// Professional Brand Theme
const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',
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
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    }
};

interface VehiclesPageContentProps {
    onSetRef?: (ref: {
        handleAddVehicle?: () => void;
        handleExportVehicles?: () => void;
        openVehicleDetail?: (vehicleId: string) => void;
    }) => void;
    // New props for URL navigation support
    initialVehicleId?: string;
    filterByOwnerId?: string;
    onNavigateToClient?: (clientId: string) => void;
    onClearDetailParams?: () => void;
    onVehicleSelected?: (vehicleId: string) => void;
    onVehicleClosed?: () => void;
}

const VehiclesPageContent: React.FC<VehiclesPageContentProps> = ({
                                                                     onSetRef,
                                                                     initialVehicleId,
                                                                     filterByOwnerId,
                                                                     onNavigateToClient,
                                                                     onClearDetailParams,
                                                                     onVehicleSelected,
                                                                     onVehicleClosed
                                                                 }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // State dla danych
    const [vehicles, setVehicles] = useState<VehicleExpanded[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<VehicleExpanded[]>([]);
    const [ownerName, setOwnerName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 0,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0
    });

    // UI state
    const [showFilters, setShowFilters] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showDetailDrawer, setShowDetailDrawer] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleExpanded | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Filters state
    const [filters, setFilters] = useState<VehicleFiltersType>({
        licensePlate: '',
        make: '',
        model: '',
        ownerName: '',
        minServices: '',
        maxServices: ''
    });

    // Company statistics state
    const [companyStats, setCompanyStats] = useState<VehicleCompanyStatisticsResponse | null>(null);

    // Enhanced handlers with URL navigation support
    const handleAddVehicle = useCallback(() => {
        setSelectedVehicle(null);
        setShowAddModal(true);
    }, []);

    const handleExportVehicles = useCallback(() => {
        alert('Eksport danych pojazdów - funkcjonalność w przygotowaniu');
    }, []);

    // Enhanced vehicle detail opening with URL support
    const openVehicleDetail = useCallback((vehicleId: string) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            setSelectedVehicle(vehicle);
            setShowDetailDrawer(true);
            onVehicleSelected?.(vehicleId);
        }
    }, [vehicles, onVehicleSelected]);

    // Enhanced vehicle detail closing with URL cleanup
    const closeVehicleDetail = useCallback(() => {
        setShowDetailDrawer(false);
        setSelectedVehicle(null);
        // Always call onVehicleClosed to clear URL params
        onVehicleClosed?.();
    }, [onVehicleClosed]);

    const refObject = useMemo(() => ({
        handleAddVehicle,
        handleExportVehicles,
        openVehicleDetail
    }), [handleAddVehicle, handleExportVehicles, openVehicleDetail]);

    // Notify parent when methods change
    useEffect(() => {
        if (onSetRef) {
            onSetRef(refObject);
        }
    }, [onSetRef, refObject]);

    // Handle initial vehicle ID from URL
    useEffect(() => {
        if (initialVehicleId && vehicles.length > 0) {
            // Only open if not already open and vehicle exists
            const vehicle = vehicles.find(v => v.id === initialVehicleId);
            if (vehicle && !showDetailDrawer) {
                openVehicleDetail(initialVehicleId);
            }
        }
    }, [initialVehicleId, vehicles.length, openVehicleDetail]);

    // Convert filters to API format
    const convertFiltersToApiFormat = (uiFilters: VehicleFiltersType): VehicleTableFilters => {
        const apiFilters: VehicleTableFilters = {};

        if (uiFilters.licensePlate) {
            apiFilters.licensePlate = uiFilters.licensePlate;
        }
        if (uiFilters.make) {
            apiFilters.make = uiFilters.make;
        }
        if (uiFilters.model) {
            apiFilters.model = uiFilters.model;
        }
        if (uiFilters.ownerName) {
            apiFilters.ownerName = uiFilters.ownerName;
        }
        if (uiFilters.minServices) {
            const minServices = parseInt(uiFilters.minServices);
            if (!isNaN(minServices)) {
                apiFilters.minVisits = minServices;
            }
        }
        if (uiFilters.maxServices) {
            const maxServices = parseInt(uiFilters.maxServices);
            if (!isNaN(maxServices)) {
                apiFilters.maxVisits = maxServices;
            }
        }

        return apiFilters;
    };

    // Load vehicles data
    const loadVehiclesData = async (page: number = 0, apiFilters?: VehicleTableFilters) => {
        try {
            setLoading(true);
            setError(null);

            let finalApiFilters = { ...apiFilters };

            // Handle filtering by owner ID from URL
            if (filterByOwnerId) {
                try {
                    const owner = await clientApi.fetchClientById(filterByOwnerId);
                    if (owner) {
                        const fullOwnerName = `${owner.firstName} ${owner.lastName}`;
                        setOwnerName(fullOwnerName);
                        finalApiFilters = {
                            ...finalApiFilters,
                            ownerName: fullOwnerName
                        };
                    } else {
                        setError('Nie znaleziono klienta o podanym ID');
                        return;
                    }
                } catch (ownerError) {
                    console.error('Error loading owner:', ownerError);
                    setError('Nie udało się załadować danych właściciela');
                    return;
                }
            }

            // Load vehicles with appropriate filters
            const response = await vehicleApi.fetchVehiclesForTable(
                { page, size: pagination.pageSize },
                finalApiFilters
            );

            setVehicles(response.data);
            setFilteredVehicles(response.data);
            setPagination(response.pagination);

        } catch (err) {
            setError('Nie udało się załadować listy pojazdów');
            console.error('Error loading vehicles:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load company statistics
    const loadCompanyStatistics = async () => {
        try {
            const stats = await vehicleApi.fetchCompanyStatistics();
            setCompanyStats(stats);
        } catch (err) {
            console.error('Error loading company statistics:', err);
        }
    };

    // Initial data load
    useEffect(() => {
        loadVehiclesData();
        if (!filterByOwnerId) {
            loadCompanyStatistics();
        }
    }, []);

    // Owner ID change effect
    useEffect(() => {
        if (filterByOwnerId) {
            loadVehiclesData();
        }
    }, [filterByOwnerId]);

    // Filters change effect
    useEffect(() => {
        if (filterByOwnerId) {
            return;
        }

        const apiFilters = convertFiltersToApiFormat(filters);
        const timeoutId = setTimeout(() => {
            loadVehiclesData(0, apiFilters);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [filters, filterByOwnerId]);

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
            ownerName: filterByOwnerId ? ownerName || '' : '',
            minServices: '',
            maxServices: ''
        });

        if (filterByOwnerId) {
            loadVehiclesData();
        }
    };

    const handlePageChange = (newPage: number) => {
        const apiFilters = convertFiltersToApiFormat(filters);
        loadVehiclesData(newPage, apiFilters);
    };

    const handleEditVehicle = (vehicle: VehicleExpanded) => {
        setSelectedVehicle(vehicle);
        setShowAddModal(true);
    };

    const handleSaveVehicle = async (vehicle: VehicleExpanded) => {
        try {
            if (selectedVehicle && selectedVehicle.id) {
                const updatedVehicle = await vehicleApi.updateVehicle(selectedVehicle.id, {
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    licensePlate: vehicle.licensePlate,
                    color: vehicle.color,
                    vin: vehicle.vin,
                    ownerIds: vehicle.ownerIds
                });

                const apiFilters = convertFiltersToApiFormat(filters);
                await loadVehiclesData(pagination.currentPage, apiFilters);
                await loadCompanyStatistics();

                if (showDetailDrawer) {
                    setSelectedVehicle(updatedVehicle);
                }
            } else {
                await vehicleApi.createVehicle({
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    licensePlate: vehicle.licensePlate,
                    color: vehicle.color,
                    vin: vehicle.vin,
                    ownerIds: vehicle.ownerIds
                });

                const apiFilters = convertFiltersToApiFormat(filters);
                await loadVehiclesData(pagination.currentPage, apiFilters);
                await loadCompanyStatistics();
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
                const apiFilters = convertFiltersToApiFormat(filters);
                await loadVehiclesData(pagination.currentPage, apiFilters);
                await loadCompanyStatistics();

                setShowDeleteConfirm(false);
                setSelectedVehicle(null);

                if (showDetailDrawer) {
                    closeVehicleDetail();
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

    // Enhanced vehicle selection handler
    const handleSelectVehicle = useCallback((vehicle: VehicleExpanded) => {
        setSelectedVehicle(vehicle);
        setShowDetailDrawer(true);
        onVehicleSelected?.(vehicle.id);
    }, [onVehicleSelected]);

    // Enhanced back to owners handler
    const handleBackToOwners = () => {
        if (onClearDetailParams) {
            onClearDetailParams();
        } else {
            // Fallback to old navigation
            navigate('/clients-vehicles?tab=owners');
        }
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
    };

    return (
        <ContentContainer>
            {/* Back to Owners button when filtering by owner */}
            {filterByOwnerId && ownerName && (
                <BackSection>
                    <BackButton onClick={handleBackToOwners}>
                        <FaArrowLeft />
                        Powrót do listy klientów
                    </BackButton>
                    <OwnerInfo>
                        <OwnerTitle>Pojazdy klienta:</OwnerTitle>
                        <OwnerName>{ownerName}</OwnerName>
                    </OwnerInfo>
                </BackSection>
            )}

            {/* Enhanced Statistics Dashboard - only when not filtering by owner */}
            {!filterByOwnerId && companyStats && (
                <StatsSection>
                    <StatsGrid>
                        <StatCard>
                            <StatIcon $color={brandTheme.text.secondary}>
                                <FaCar />
                            </StatIcon>
                            <StatContent>
                                <StatValue>{companyStats.totalVehicles}</StatValue>
                                <StatLabel>Łączna liczba pojazdów</StatLabel>
                            </StatContent>
                        </StatCard>

                        <StatCard>
                            <StatIcon $color={brandTheme.text.secondary}>
                                <FaTrophy />
                            </StatIcon>
                            <StatContent>
                                <StatValue>{companyStats.premiumVehicles}</StatValue>
                                <StatLabel>Pojazdy Premium</StatLabel>
                            </StatContent>
                        </StatCard>

                        <StatCard>
                            <StatIcon $color={brandTheme.text.secondary}>
                                <FaMoneyBillWave />
                            </StatIcon>
                            <StatContent>
                                <StatValue>{companyStats.totalRevenue?.toFixed(2)} zł</StatValue>
                                <StatLabel>Łączne przychody</StatLabel>
                            </StatContent>
                        </StatCard>

                        <StatCard>
                            <StatIcon $color={brandTheme.text.secondary}>
                                <FaEye />
                            </StatIcon>
                            <StatContent>
                                <StatValue>{companyStats.visitRevenueMedian?.toFixed(2)} zł</StatValue>
                                <StatLabel>Mediana wartości wizyt</StatLabel>
                            </StatContent>
                        </StatCard>
                    </StatsGrid>

                    {/* Most active vehicle card */}
                    {companyStats.mostActiveVehicle && (
                        <MostActiveVehicleCard>
                            <MostActiveHeader>
                                <MostActiveIcon>
                                    <FaTrophy />
                                </MostActiveIcon>
                                <MostActiveContent>
                                    <MostActiveTitle>Najaktywniejszy pojazd</MostActiveTitle>
                                    <MostActiveVehicleInfo>
                                        <span>{companyStats.mostActiveVehicle.make} {companyStats.mostActiveVehicle.model}</span>
                                        <LicenseBadge>{companyStats.mostActiveVehicle.licensePlate}</LicenseBadge>
                                    </MostActiveVehicleInfo>
                                </MostActiveContent>
                            </MostActiveHeader>
                            <MostActiveStats>
                                <MostActiveStat>
                                    <span>{companyStats.mostActiveVehicle.visitCount} wizyt</span>
                                    <span>{formatCurrency(companyStats.mostActiveVehicle.totalRevenue)}</span>
                                </MostActiveStat>
                            </MostActiveStats>
                        </MostActiveVehicleCard>
                    )}
                </StatsSection>
            )}

            {/* Main Content */}
            <MainContent>
                {/* Filters - hide when filtering by owner */}
                {!filterByOwnerId && (
                    <VehicleFilters
                        filters={filters}
                        showFilters={showFilters}
                        onToggleFilters={() => setShowFilters(!showFilters)}
                        onFilterChange={handleFilterChange}
                        onResetFilters={resetFilters}
                        resultCount={pagination.totalItems}
                    />
                )}

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
                        <LoadingText>Ładowanie danych pojazdów...</LoadingText>
                    </LoadingContainer>
                ) : (
                    <>
                        {/* Main Table Component */}
                        <TableContainer>
                            <VehicleListTable
                                vehicles={filteredVehicles}
                                onSelectVehicle={handleSelectVehicle}
                                onEditVehicle={handleEditVehicle}
                                onDeleteVehicle={handleDeleteClick}
                                onShowHistory={handleShowHistory}
                            />
                        </TableContainer>

                        {/* Pagination Controls */}
                        {pagination.totalPages > 1 && (
                            <PaginationContainer>
                                <PaginationInfo>
                                    Strona {pagination.currentPage + 1} z {pagination.totalPages}
                                    ({pagination.totalItems} pojazdów)
                                </PaginationInfo>
                                <PaginationButtons>
                                    <PaginationButton
                                        onClick={() => handlePageChange(0)}
                                        disabled={pagination.currentPage === 0}
                                    >
                                        Pierwsza
                                    </PaginationButton>
                                    <PaginationButton
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 0}
                                    >
                                        Poprzednia
                                    </PaginationButton>
                                    <PageNumbers>
                                        {Array.from({length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                            const startPage = Math.max(0, pagination.currentPage - 2);
                                            const pageNumber = startPage + i;
                                            if (pageNumber >= pagination.totalPages) return null;

                                            return (
                                                <PageNumber
                                                    key={pageNumber}
                                                    $active={pageNumber === pagination.currentPage}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                >
                                                    {pageNumber + 1}
                                                </PageNumber>
                                            );
                                        })}
                                    </PageNumbers>
                                    <PaginationButton
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage >= pagination.totalPages - 1}
                                    >
                                        Następna
                                    </PaginationButton>
                                    <PaginationButton
                                        onClick={() => handlePageChange(pagination.totalPages - 1)}
                                        disabled={pagination.currentPage >= pagination.totalPages - 1}
                                    >
                                        Ostatnia
                                    </PaginationButton>
                                </PaginationButtons>
                            </PaginationContainer>
                        )}
                    </>
                )}
            </MainContent>

            {/* Detail Drawer with enhanced close handler */}
            <VehicleDetailDrawer
                isOpen={showDetailDrawer}
                vehicle={selectedVehicle}
                onClose={closeVehicleDetail}
            />

            {/* Modals */}
            {showAddModal && (
                <VehicleFormModal
                    vehicle={selectedVehicle}
                    defaultOwnerId={filterByOwnerId || undefined}
                    onSave={handleSaveVehicle}
                    onCancel={() => setShowAddModal(false)}
                />
            )}

            {showHistoryModal && selectedVehicle && (
                <VehicleHistoryModal
                    vehicle={selectedVehicle}
                    onClose={() => setShowHistoryModal(false)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedVehicle && (
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
                            <DeleteTitle>Czy na pewno chcesz usunąć pojazd?</DeleteTitle>
                            <DeleteVehicleInfo>
                                <strong>{selectedVehicle.make} {selectedVehicle.model}</strong>
                                <VehiclePlate>{selectedVehicle.licensePlate}</VehiclePlate>
                            </DeleteVehicleInfo>
                            <DeleteWarning>
                                Ta operacja jest nieodwracalna i usunie wszystkie dane serwisowe pojazdu.
                            </DeleteWarning>
                        </DeleteText>
                    </DeleteConfirmContent>

                    <DeleteConfirmButtons>
                        <SecondaryButton onClick={() => setShowDeleteConfirm(false)}>
                            Anuluj
                        </SecondaryButton>
                        <DangerButton onClick={handleConfirmDelete}>
                            Usuń pojazd
                        </DangerButton>
                    </DeleteConfirmButtons>
                </Modal>
            )}
        </ContentContainer>
    );
};

// Styled Components (same as original but continued)
const ContentContainer = styled.div`
   flex: 1;
   display: flex;
   flex-direction: column;
   min-height: 0;
   background: ${brandTheme.surfaceAlt};
`;

const BackSection = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    width: 100%;
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.lg};
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.border};

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md};
        flex-direction: column;
        align-items: flex-start;
        gap: ${brandTheme.spacing.md};
    }
`;

const BackButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: ${brandTheme.surfaceElevated};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    color: ${brandTheme.text.secondary};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
        background: ${brandTheme.primary};
        color: white;
        border-color: ${brandTheme.primary};
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const OwnerInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const OwnerTitle = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${brandTheme.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const OwnerName = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.025em;
`;

const StatsSection = styled.section`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl} 0;
    width: 100%;

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

    @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
        gap: ${brandTheme.spacing.md};
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${brandTheme.spacing.md};
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

const MostActiveVehicleCard = styled.div`
    background: linear-gradient(135deg, ${brandTheme.status.warningLight} 0%, #fef3c7 100%);
    border: 2px solid ${brandTheme.status.warning}30;
    border-radius: ${brandTheme.radius.xl};
    padding: ${brandTheme.spacing.lg};
    margin-bottom: ${brandTheme.spacing.lg};
    box-shadow: ${brandTheme.shadow.md};
`;

const MostActiveHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.md};
`;

const MostActiveIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${brandTheme.status.warning};
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    box-shadow: ${brandTheme.shadow.sm};
`;

const MostActiveContent = styled.div`
    flex: 1;
`;

const MostActiveTitle = styled.div`
    font-size: 18px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
`;

const MostActiveVehicleInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const LicenseBadge = styled.span`
    background: ${brandTheme.status.warning};
    color: white;
    padding: 2px 8px;
    border-radius: ${brandTheme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const MostActiveStats = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const MostActiveStat = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.lg};
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};

    span:first-child {
        color: ${brandTheme.status.info};
    }

    span:last-child {
        color: ${brandTheme.status.success};
    }
`;

const MainContent = styled.div`
    flex: 1;
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 ${brandTheme.spacing.xl} ${brandTheme.spacing.xl};
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
    min-height: 0;

    @media (max-width: 1024px) {
        padding: 0 ${brandTheme.spacing.lg} ${brandTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${brandTheme.spacing.md} ${brandTheme.spacing.md};
        gap: ${brandTheme.spacing.md};
    }
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

const TableContainer = styled.div`
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 400px);

    @media (max-width: 1024px) {
        max-height: calc(100vh - 350px);
    }

    @media (max-width: 768px) {
        max-height: calc(100vh - 300px);
    }
`;

const PaginationContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    margin-top: ${brandTheme.spacing.md};
    box-shadow: ${brandTheme.shadow.xs};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${brandTheme.spacing.md};
    }
`;

const PaginationInfo = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const PaginationButtons = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const PaginationButton = styled.button`
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border: 1px solid ${brandTheme.border};
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${brandTheme.primary};
        color: white;
        border-color: ${brandTheme.primary};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const PageNumbers = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};
`;

const PageNumber = styled.button<{ $active: boolean }>`
    width: 32px;
    height: 32px;
    border: 1px solid ${props => props.$active ? brandTheme.primary : brandTheme.border};
    background: ${props => props.$active ? brandTheme.primary : brandTheme.surface};
    color: ${props => props.$active ? 'white' : brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${brandTheme.primary};
        color: white;
        border-color: ${brandTheme.primary};
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

const DeleteVehicleInfo = styled.div`
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    margin-bottom: ${brandTheme.spacing.sm};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    flex-wrap: wrap;

    strong {
        font-size: 16px;
        color: ${brandTheme.text.primary};
    }
`;

const VehiclePlate = styled.span`
    background: ${brandTheme.primary};
    color: white;
    padding: 2px 8px;
    border-radius: ${brandTheme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
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

    &:hover {
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
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

const DangerButton = styled(BaseButton)`
    background: linear-gradient(135deg, ${brandTheme.status.error} 0%, #b91c1c 100%);
    color: white;
    box-shadow: ${brandTheme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

export default VehiclesPageContent;