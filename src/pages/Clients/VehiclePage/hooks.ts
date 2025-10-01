// src/pages/Clients/VehiclePage/hooks.ts - NAPRAWIONE
import {useCallback, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {vehicleApi, VehicleTableFilters} from '../../../api/vehiclesApi';
import {VehicleFilters, VehiclesPageState, VehicleStats} from './types';
import {clientApi} from "../../../api/clientsApi";
import {VehicleExpanded} from "../../../types";
import {useToast} from '../../../components/common/Toast/Toast'; // DODANO

const DEFAULT_PAGE_SIZE = 25;

const initialFilters: VehicleFilters = {
    licensePlate: '',
    make: '',
    model: '',
    ownerName: '',
    minServices: '',
    maxServices: ''
};

const initialStats: VehicleStats = {
    totalVehicles: 0,
    premiumVehicles: 0,
    totalRevenue: 0,
    visitRevenueMedian: 0,
    mostActiveVehicle: null
};

export const useVehiclesPageState = () => {
    const [state, setState] = useState<VehiclesPageState>({
        vehicles: [],
        loading: true,
        currentPage: 0,
        totalItems: 0,
        totalPages: 0,
        showFilters: false,
        showAddModal: false,
        showDeleteConfirm: false,
        showHistoryModal: false,
        selectedVehicle: null,
        filters: initialFilters,
        appliedFilters: initialFilters,
        stats: initialStats,
        ownerName: null,
        error: null
    });

    const updateState = useCallback((updates: Partial<VehiclesPageState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    return { state, updateState };
};

export const useVehicleFilters = () => {
    const convertFiltersToApiFormat = useCallback((uiFilters: VehicleFilters): VehicleTableFilters => {
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
    }, []);

    const loadVehicles = useCallback(async (
        page: number = 0,
        filters: VehicleFilters = initialFilters,
        filterByOwnerId?: string
    ) => {
        try {
            let finalApiFilters = convertFiltersToApiFormat(filters);

            if (filterByOwnerId) {
                const owner = await clientApi.fetchClientById(filterByOwnerId);
                if (owner) {
                    const fullOwnerName = `${owner.firstName} ${owner.lastName}`;
                    finalApiFilters = {
                        ...finalApiFilters,
                        ownerName: fullOwnerName
                    };
                    return {
                        success: true,
                        vehicles: [],
                        pagination: {
                            currentPage: page,
                            pageSize: DEFAULT_PAGE_SIZE,
                            totalItems: 0,
                            totalPages: 0,
                            hasNext: false,
                            hasPrevious: false
                        },
                        ownerName: fullOwnerName,
                        error: null
                    };
                } else {
                    return {
                        success: false,
                        vehicles: [],
                        pagination: {
                            currentPage: page,
                            pageSize: DEFAULT_PAGE_SIZE,
                            totalItems: 0,
                            totalPages: 0,
                            hasNext: false,
                            hasPrevious: false
                        },
                        ownerName: null,
                        error: 'Nie znaleziono klienta o podanym ID'
                    };
                }
            }

            const result = await vehicleApi.fetchVehiclesForTable(
                { page, size: DEFAULT_PAGE_SIZE },
                finalApiFilters
            );

            return {
                success: true,
                vehicles: result.data,
                pagination: result.pagination,
                ownerName: null,
                error: null
            };
        } catch (err) {
            return {
                success: false,
                vehicles: [],
                pagination: {
                    currentPage: page,
                    pageSize: DEFAULT_PAGE_SIZE,
                    totalItems: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrevious: false
                },
                ownerName: null,
                error: 'Nie udało się załadować listy pojazdów'
            };
        }
    }, [convertFiltersToApiFormat]);

    const loadCompanyStatistics = useCallback(async (): Promise<VehicleStats> => {
        try {
            const result = await vehicleApi.fetchCompanyStatistics();
            return {
                totalVehicles: result.totalVehicles,
                premiumVehicles: result.premiumVehicles,
                totalRevenue: result.totalRevenue,
                visitRevenueMedian: result.visitRevenueMedian,
                mostActiveVehicle: result.mostActiveVehicle
            };
        } catch (err) {
            return initialStats;
        }
    }, []);

    return { loadVehicles, loadCompanyStatistics, convertFiltersToApiFormat };
};

export const useVehicleOperations = () => {
    const navigate = useNavigate();
    const { showToast } = useToast(); // DODANO

    const editVehicle = useCallback(async (vehicle: VehicleExpanded) => {
        try {
            return { success: true, vehicle };
        } catch (error) {
            console.error('❌ Error preparing vehicle for edit:', error);
            showToast('error', 'Nie udało się przygotować pojazdu do edycji');
            return { success: false, vehicle };
        }
    }, [showToast]);

    // NAPRAWIONO: Funkcja deleteVehicle z prawidłowym wywołaniem API
    const deleteVehicle = useCallback(async (vehicleId: string) => {
        try {

            const success = await vehicleApi.deleteVehicle(vehicleId);

            if (success) {
                showToast('success', 'Pojazd został usunięty pomyślnie');
                return { success: true };
            } else {
                console.error('❌ Vehicle deletion failed');
                showToast('error', 'Nie udało się usunąć pojazdu');
                return { success: false };
            }
        } catch (err: any) {
            console.error('❌ Error deleting vehicle:', err);

            let errorMessage = 'Nie udało się usunąć pojazdu';
            if (err.message) {
                errorMessage = err.message;
            } else if (err.status === 409) {
                errorMessage = 'Nie można usunąć pojazdu - posiada powiązane wizyty';
            } else if (err.status === 404) {
                errorMessage = 'Pojazd nie został znaleziony';
            }

            showToast('error', errorMessage);
            return { success: false };
        }
    }, [showToast]);

    // NAPRAWIONO: Funkcja saveVehicle - obecnie nie używana w nowym flow
    const saveVehicle = useCallback(async (vehicle: VehicleExpanded, isEdit: boolean = false) => {
        try {

            const vehicleData = {
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                licensePlate: vehicle.licensePlate,
                color: vehicle.color,
                vin: vehicle.vin,
                ownerIds: vehicle.ownerIds
            };

            if (isEdit && vehicle.id) {
                const updatedVehicle = await vehicleApi.updateVehicle(vehicle.id, vehicleData);
                showToast('success', 'Pojazd został zaktualizowany pomyślnie');
                return { success: true, vehicle: updatedVehicle };
            } else {
                const newVehicle = await vehicleApi.createVehicle(vehicleData);
                showToast('success', 'Nowy pojazd został dodany pomyślnie');
                return { success: true, vehicle: newVehicle };
            }
        } catch (err: any) {
            console.error('❌ Error saving vehicle:', err);

            let errorMessage = 'Nie udało się zapisać pojazdu';
            if (err.message) {
                errorMessage = err.message;
            } else if (err.status === 409) {
                errorMessage = 'Pojazd z tym numerem rejestracyjnym już istnieje';
            } else if (err.status === 400) {
                errorMessage = 'Nieprawidłowe dane pojazdu';
            }

            showToast('error', errorMessage);
            return { success: false, vehicle: null };
        }
    }, [showToast]);

    const navigateToClient = useCallback((clientId: string, onNavigateToClient?: (clientId: string) => void) => {

        if (onNavigateToClient) {
            onNavigateToClient(clientId);
        } else {
            navigate(`/clients-vehicles?tab=owners&clientId=${clientId}`);
        }
    }, [navigate]);

    const exportVehicles = useCallback(() => {
        showToast('info', 'Eksport danych pojazdów - funkcjonalność w przygotowaniu');
    }, [showToast]);

    return {
        editVehicle,
        deleteVehicle,
        saveVehicle, // UWAGA: Ta funkcja nie jest obecnie używana, ale zostaje dla kompatybilności
        navigateToClient,
        exportVehicles
    };
};

export const useFormatters = () => {
    const formatCurrency = useCallback((amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
    }, []);

    const formatVehicleCount = useCallback((count: number): string => {
        if (count === 1) return 'pojazd';
        if (count > 1 && count < 5) return 'pojazdy';
        return 'pojazdów';
    }, []);

    return {
        formatCurrency,
        formatVehicleCount
    };
};