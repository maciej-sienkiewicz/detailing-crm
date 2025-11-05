// src/api/fleetApi.ts

import {apiClient} from '../shared/api/apiClient';
import {FleetVehicle, FleetVehicleCategory, FleetVehicleStatus, FleetVehicleUsageType} from '../types/fleet';
import {FleetVehicleFilter} from '../types/fleetFilters';

// API dla pojazdów flotowych
export const fleetVehicleApi = {
    // Pobieranie listy pojazdów
    fetchVehicles: async (filters?: FleetVehicleFilter): Promise<FleetVehicle[]> => {
        try {
            const queryParams = filters || {};
            return await apiClient.get<FleetVehicle[]>('/fleet/vehicles', queryParams);
        } catch (error) {
            console.error('Error fetching fleet vehicles:', error);
            const fleetVehicles: FleetVehicle[] = [
                {
                    id: '1',
                    make: 'Toyota',
                    model: 'Corolla',
                    year: 2020,
                    licensePlate: 'XYZ1234',
                    vin: 'JTDBU4EE8J3056789',
                    color: 'Red',
                    category: FleetVehicleCategory.STANDARD,
                    usageType: FleetVehicleUsageType.COMPANY,
                    status: FleetVehicleStatus.AVAILABLE,
                    engineType: 'Inline 4',
                    engineCapacity: 1800,
                    fuelType: 'Petrol',
                    transmission: 'Automatic',
                    purchaseDate: '2020-03-15',
                    registrationDate: '2020-04-01',
                    insuranceExpiryDate: '2023-03-15',
                    technicalInspectionDate: '2021-04-01',
                    currentMileage: 25000,
                    lastServiceMileage: 20000,
                    nextServiceMileage: 30000,
                    createdAt: '2020-03-15T12:00:00Z',
                    updatedAt: '2021-03-01T12:00:00Z',
                },
                {
                    id: '2',
                    make: 'BMW',
                    model: 'X5',
                    year: 2022,
                    licensePlate: 'ABC5678',
                    vin: '5UXKR6C5XH0C45678',
                    color: 'Black',
                    category: FleetVehicleCategory.PREMIUM,
                    usageType: FleetVehicleUsageType.REPLACEMENT,
                    status: FleetVehicleStatus.RENTED,
                    engineType: 'V6',
                    engineCapacity: 3000,
                    fuelType: 'Diesel',
                    transmission: 'Automatic',
                    purchaseDate: '2022-01-20',
                    registrationDate: '2022-02-01',
                    insuranceExpiryDate: '2023-01-20',
                    technicalInspectionDate: '2022-02-20',
                    currentMileage: 15000,
                    lastServiceMileage: 10000,
                    nextServiceMileage: 20000,
                    createdAt: '2022-01-20T10:00:00Z',
                    updatedAt: '2023-01-01T15:00:00Z',
                },
                {
                    id: '3',
                    make: 'Ford',
                    model: 'Transit',
                    year: 2021,
                    licensePlate: 'LMN9876',
                    vin: 'WF0EXXTTHE0B12345',
                    color: 'White',
                    category: FleetVehicleCategory.UTILITY,
                    usageType: FleetVehicleUsageType.COMPANY,
                    status: FleetVehicleStatus.MAINTENANCE,
                    engineType: 'Diesel',
                    engineCapacity: 2200,
                    fuelType: 'Diesel',
                    transmission: 'Manual',
                    purchaseDate: '2021-05-05',
                    registrationDate: '2021-06-01',
                    insuranceExpiryDate: '2022-05-05',
                    technicalInspectionDate: '2021-06-01',
                    currentMileage: 5000,
                    lastServiceMileage: 4000,
                    nextServiceMileage: 6000,
                    createdAt: '2021-05-05T09:30:00Z',
                    updatedAt: '2022-05-01T14:00:00Z',
                },
                {
                    id: '4',
                    make: 'Audi',
                    model: 'A4',
                    year: 2019,
                    licensePlate: 'GHI6789',
                    vin: 'WAUZL98EXKA456789',
                    color: 'Silver',
                    category: FleetVehicleCategory.PREMIUM,
                    usageType: FleetVehicleUsageType.COMPANY,
                    status: FleetVehicleStatus.UNAVAILABLE,
                    engineType: 'Inline 4',
                    engineCapacity: 2000,
                    fuelType: 'Petrol',
                    transmission: 'Automatic',
                    purchaseDate: '2019-10-10',
                    registrationDate: '2019-11-01',
                    insuranceExpiryDate: '2022-10-10',
                    technicalInspectionDate: '2020-11-01',
                    currentMileage: 40000,
                    lastServiceMileage: 35000,
                    nextServiceMileage: 45000,
                    createdAt: '2019-10-10T08:00:00Z',
                    updatedAt: '2021-09-01T13:00:00Z',
                },
                {
                    id: '5',
                    make: 'Volkswagen',
                    model: 'Golf',
                    year: 2021,
                    licensePlate: 'JKL4321',
                    vin: 'WVWZZZ1JZXW006789',
                    color: 'Blue',
                    category: FleetVehicleCategory.ECONOMY,
                    usageType: FleetVehicleUsageType.REPLACEMENT,
                    status: FleetVehicleStatus.AVAILABLE,
                    engineType: 'Inline 4',
                    engineCapacity: 1600,
                    fuelType: 'Petrol',
                    transmission: 'Manual',
                    purchaseDate: '2021-06-01',
                    registrationDate: '2021-07-01',
                    insuranceExpiryDate: '2022-06-01',
                    technicalInspectionDate: '2021-07-01',
                    currentMileage: 12000,
                    lastServiceMileage: 10000,
                    nextServiceMileage: 15000,
                    createdAt: '2021-06-01T11:00:00Z',
                    updatedAt: '2021-11-01T12:00:00Z',
                }
            ];


            return fleetVehicles;
        }
    },

    // Pobieranie pojedynczego pojazdu
    fetchVehicleById: async (id: string): Promise<FleetVehicle | null> => {
        try {
            return await apiClient.get<FleetVehicle>(`/fleet/vehicles/${id}`);
        } catch (error) {
            const vehicle = {
                id: '5',
                make: 'Volkswagen',
                model: 'Golf',
                year: 2021,
                licensePlate: 'JKL4321',
                vin: 'WVWZZZ1JZXW006789',
                color: 'Blue',
                category: FleetVehicleCategory.ECONOMY,
                usageType: FleetVehicleUsageType.REPLACEMENT,
                status: FleetVehicleStatus.AVAILABLE,
                engineType: 'Inline 4',
                engineCapacity: 1600,
                fuelType: 'Petrol',
                transmission: 'Manual',
                purchaseDate: '2021-06-01',
                registrationDate: '2021-07-01',
                insuranceExpiryDate: '2022-06-01',
                technicalInspectionDate: '2021-07-01',
                currentMileage: 12000,
                lastServiceMileage: 10000,
                nextServiceMileage: 15000,
                createdAt: '2021-06-01T11:00:00Z',
                updatedAt: '2021-11-01T12:00:00Z',
            }
            console.error(`Error fetching fleet vehicle ${id}:`, error);
            return vehicle;
        }
    },

    // Tworzenie nowego pojazdu
    createVehicle: async (vehicleData: Partial<FleetVehicle>): Promise<FleetVehicle> => {
        try {
            return await apiClient.post<FleetVehicle>('/fleet/vehicles', vehicleData);
        } catch (error) {
            console.error('Error creating fleet vehicle:', error);
            throw error;
        }
    },

    // Aktualizacja pojazdu
    updateVehicle: async (id: string, vehicleData: Partial<FleetVehicle>): Promise<FleetVehicle> => {
        try {
            return await apiClient.put<FleetVehicle>(`/fleet/vehicles/${id}`, vehicleData);
        } catch (error) {
            console.error(`Error updating fleet vehicle ${id}:`, error);
            throw error;
        }
    },

    // Usuwanie pojazdu
    deleteVehicle: async (id: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/fleet/vehicles/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting fleet vehicle ${id}:`, error);
            throw error;
        }
    },

    // Aktualizacja przebiegu pojazdu
    updateVehicleMileage: async (id: string, mileage: number): Promise<FleetVehicle> => {
        try {
            return await apiClient.patch<FleetVehicle>(`/fleet/vehicles/${id}/mileage`, { mileage });
        } catch (error) {
            console.error(`Error updating fleet vehicle mileage ${id}:`, error);
            throw error;
        }
    },

    // Aktualizacja statusu pojazdu
    updateVehicleStatus: async (id: string, status: FleetVehicleStatus): Promise<FleetVehicle> => {
        try {
            return await apiClient.patch<FleetVehicle>(`/fleet/vehicles/${id}/status`, { status });
        } catch (error) {
            console.error(`Error updating fleet vehicle status ${id}:`, error);
            throw error;
        }
    }
};