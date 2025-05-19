// src/api/fleetRentalApi.ts

import { apiClient } from './apiClient';
import { FleetRental, FleetRentalStatus, FleetImage } from '../types/fleetRental';
import { FleetRentalFilter } from '../types/fleetFilters';

export const fleetRentalApi = {
    // Pobieranie wypożyczeń z filtrami
    fetchRentals: async (filters?: FleetRentalFilter): Promise<FleetRental[]> => {
        try {
            const queryParams = filters || {};
            return await apiClient.get<FleetRental[]>('/fleet/rentals', queryParams);
        } catch (error) {
            console.error('Error fetching fleet rentals:', error);
            const fleetRentals: FleetRental[] = [
                {
                    id: "1",
                    vehicleId: "V12345",
                    clientId: "C001",
                    employeeId: "E001",
                    protocolId: "P001",
                    status: FleetRentalStatus.ACTIVE,
                    startDate: "2025-05-01T08:00:00Z",
                    plannedEndDate: "2025-05-10T08:00:00Z",
                    actualEndDate: "",
                    startMileage: 12000,
                    endMileage: undefined,
                    fuelLevelStart: 80,
                    fuelLevelEnd: undefined,
                    startConditionNotes: "Pojazd w dobrym stanie, brak widocznych uszkodzeń.",
                    endConditionNotes: undefined,
                    damageReported: false,
                    damageDescription: undefined,
                    contractNumber: "CON123456",
                    contractFileUrl: "https://example.com/contract123.pdf",
                    createdAt: "2025-05-01T08:00:00Z",
                    createdBy: "admin",
                    updatedAt: "2025-05-01T08:00:00Z",
                    updatedBy: undefined
                },
                {
                    id: "2",
                    vehicleId: "V67890",
                    clientId: "C002",
                    employeeId: "E002",
                    protocolId: "P002",
                    status: FleetRentalStatus.COMPLETED,
                    startDate: "2025-04-15T10:00:00Z",
                    plannedEndDate: "2025-04-22T10:00:00Z",
                    actualEndDate: "2025-04-21T10:00:00Z",
                    startMileage: 10500,
                    endMileage: 10750,
                    fuelLevelStart: 90,
                    fuelLevelEnd: 85,
                    startConditionNotes: "Pojazd w dobrym stanie, niewielkie zużycie wnętrza.",
                    endConditionNotes: "Pojazd zarysowany na przednim zderzaku.",
                    damageReported: true,
                    damageDescription: "Zarysowanie na przednim zderzaku, niewielkie.",
                    contractNumber: "CON654321",
                    contractFileUrl: "https://example.com/contract654.pdf",
                    createdAt: "2025-04-15T10:00:00Z",
                    createdBy: "admin",
                    updatedAt: "2025-04-21T10:00:00Z",
                    updatedBy: "admin"
                },
                {
                    id: "3",
                    vehicleId: "V11223",
                    clientId: "C003",
                    employeeId: "E003",
                    protocolId: "P003",
                    status: FleetRentalStatus.CANCELLED,
                    startDate: "2025-04-01T08:00:00Z",
                    plannedEndDate: "2025-04-05T08:00:00Z",
                    actualEndDate: "2025-04-02T08:00:00Z",
                    startMileage: 15000,
                    endMileage: 15020,
                    fuelLevelStart: 70,
                    fuelLevelEnd: 60,
                    startConditionNotes: "Pojazd z lekkimi uszkodzeniami wnętrza.",
                    endConditionNotes: "Pojazd zwrócony przed czasem, brak uszkodzeń.",
                    damageReported: false,
                    damageDescription: undefined,
                    contractNumber: "CON999999",
                    contractFileUrl: "https://example.com/contract999.pdf",
                    createdAt: "2025-04-01T08:00:00Z",
                    createdBy: "admin",
                    updatedAt: "2025-04-02T08:00:00Z",
                    updatedBy: "admin"
                }
            ];

            return fleetRentals;
        }
    },

    // Pobieranie pojedynczego wypożyczenia
    fetchRentalById: async (id: string): Promise<FleetRental | null> => {
        try {
            return await apiClient.get<FleetRental>(`/fleet/rentals/${id}`);
        } catch (error) {
            console.error(`Error fetching rental ${id}:`, error);
            const rental =                 {
                id: "2",
                vehicleId: "V67890",
                clientId: "C002",
                employeeId: "E002",
                protocolId: "P002",
                status: FleetRentalStatus.COMPLETED,
                startDate: "2025-04-15T10:00:00Z",
                plannedEndDate: "2025-04-22T10:00:00Z",
                actualEndDate: "2025-04-21T10:00:00Z",
                startMileage: 10500,
                endMileage: 10750,
                fuelLevelStart: 90,
                fuelLevelEnd: 85,
                startConditionNotes: "Pojazd w dobrym stanie, niewielkie zużycie wnętrza.",
                endConditionNotes: "Pojazd zarysowany na przednim zderzaku.",
                damageReported: true,
                damageDescription: "Zarysowanie na przednim zderzaku, niewielkie.",
                contractNumber: "CON654321",
                contractFileUrl: "https://example.com/contract654.pdf",
                createdAt: "2025-04-15T10:00:00Z",
                createdBy: "admin",
                updatedAt: "2025-04-21T10:00:00Z",
                updatedBy: "admin"
            }
            return rental;
        }
    },

    // Pobieranie wypożyczeń dla pojazdu
    fetchVehicleRentals: async (vehicleId: string): Promise<FleetRental[]> => {
        try {
            return await apiClient.get<FleetRental[]>(`/fleet/vehicles/${vehicleId}/rentals`);
        } catch (error) {
            console.error(`Error fetching rentals for vehicle ${vehicleId}:`, error);
            return [];
        }
    },

    // Pobieranie wypożyczeń dla klienta
    fetchClientRentals: async (clientId: string): Promise<FleetRental[]> => {
        try {
            return await apiClient.get<FleetRental[]>(`/fleet/rentals/client/${clientId}`);
        } catch (error) {
            console.error(`Error fetching rentals for client ${clientId}:`, error);
            return [];
        }
    },

    // Tworzenie nowego wypożyczenia
    createRental: async (rentalData: Partial<FleetRental>): Promise<FleetRental> => {
        try {
            return await apiClient.post<FleetRental>('/fleet/rentals', rentalData);
        } catch (error) {
            console.error('Error creating rental:', error);
            throw error;
        }
    },

    // Aktualizacja wypożyczenia
    updateRental: async (id: string, rentalData: Partial<FleetRental>): Promise<FleetRental> => {
        try {
            return await apiClient.put<FleetRental>(`/fleet/rentals/${id}`, rentalData);
        } catch (error) {
            console.error(`Error updating rental ${id}:`, error);
            throw error;
        }
    },

    // Zakończenie wypożyczenia
    completeRental: async (
        id: string,
        data: {
            endMileage: number,
            fuelLevelEnd: number,
            actualEndDate: string,
            endConditionNotes?: string,
            damageReported: boolean,
            damageDescription?: string
        }
    ): Promise<FleetRental> => {
        try {
            return await apiClient.patch<FleetRental>(`/fleet/rentals/${id}/complete`, data);
        } catch (error) {
            console.error(`Error completing rental ${id}:`, error);
            throw error;
        }
    },

    // Aktualizacja statusu wypożyczenia
    updateRentalStatus: async (id: string, status: FleetRentalStatus): Promise<FleetRental> => {
        try {
            return await apiClient.patch<FleetRental>(`/fleet/rentals/${id}/status`, { status });
        } catch (error) {
            console.error(`Error updating rental status ${id}:`, error);
            throw error;
        }
    },

    // Dodawanie zdjęcia do wypożyczenia
    uploadRentalImage: async (rentalId: string, file: File, description?: string): Promise<FleetImage> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('entityType', 'RENTAL');
            formData.append('entityId', rentalId);

            if (description) {
                formData.append('description', description);
            }

            return await apiClient.post<FleetImage>('/fleet/images', formData);
        } catch (error) {
            console.error(`Error uploading image for rental ${rentalId}:`, error);
            throw error;
        }
    },

    // Pobieranie zdjęć wypożyczenia
    fetchRentalImages: async (rentalId: string): Promise<FleetImage[]> => {
        try {
            return await apiClient.get<FleetImage[]>(`/fleet/rentals/${rentalId}/images`);
        } catch (error) {
            console.error(`Error fetching images for rental ${rentalId}:`, error);
            return [];
        }
    }
};