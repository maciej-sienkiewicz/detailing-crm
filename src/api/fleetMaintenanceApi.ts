// src/api/fleetMaintenanceApi.ts

import {apiClient} from '../shared/api/apiClient';
import {FleetFuelEntry, FleetFuelStatus, FleetMaintenance} from '../types/fleetMaintenance';

export const fleetMaintenanceApi = {
    // Pobieranie historii serwisowej pojazdu
    fetchMaintenanceHistory: async (vehicleId: string): Promise<FleetMaintenance[]> => {
        try {
            return await apiClient.get<FleetMaintenance[]>(`/fleet/vehicles/${vehicleId}/maintenance`);
        } catch (error) {
            console.error(`Error fetching maintenance history for vehicle ${vehicleId}:`, error);
            return [];
        }
    },

    // Dodawanie wpisu serwisowego
    addMaintenanceRecord: async (vehicleId: string, record: Partial<FleetMaintenance>): Promise<FleetMaintenance> => {
        try {
            return await apiClient.post<FleetMaintenance>(`/fleet/vehicles/${vehicleId}/maintenance`, record);
        } catch (error) {
            console.error(`Error adding maintenance record to vehicle ${vehicleId}:`, error);
            throw error;
        }
    },

    // Aktualizacja wpisu serwisowego
    updateMaintenanceRecord: async (id: string, record: Partial<FleetMaintenance>): Promise<FleetMaintenance> => {
        try {
            return await apiClient.put<FleetMaintenance>(`/fleet/maintenance/${id}`, record);
        } catch (error) {
            console.error(`Error updating maintenance record ${id}:`, error);
            throw error;
        }
    },

    // Usuwanie wpisu serwisowego
    deleteMaintenanceRecord: async (id: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/fleet/maintenance/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting maintenance record ${id}:`, error);
            throw error;
        }
    },

    // Pobieranie wpisów o tankowaniu
    fetchFuelEntries: async (vehicleId: string): Promise<FleetFuelEntry[]> => {
        try {
            return await apiClient.get<FleetFuelEntry[]>(`/fleet/vehicles/${vehicleId}/fuel`);
        } catch (error) {
            console.error(`Error fetching fuel entries for vehicle ${vehicleId}:`, error);
            return [];
        }
    },

    // Dodawanie wpisu o tankowaniu
    addFuelEntry: async (vehicleId: string, entry: Partial<FleetFuelEntry>): Promise<FleetFuelEntry> => {
        try {
            return await apiClient.post<FleetFuelEntry>(`/fleet/vehicles/${vehicleId}/fuel`, entry);
        } catch (error) {
            console.error(`Error adding fuel entry to vehicle ${vehicleId}:`, error);
            throw error;
        }
    },
    fetchFuelStatus: async (vehicleId: string): Promise<FleetFuelStatus | null> => {
        try {
            return await apiClient.get<FleetFuelStatus>(`/fleet/vehicles/${vehicleId}/fuel-status`);
        } catch (error) {
            console.error(`Error fetching fuel status for vehicle ${vehicleId}:`, error);
            return null;
        }
    },

// Aktualizacja stanu paliwa pojazdu
    updateFuelStatus: async (vehicleId: string, fuelLevel: number): Promise<FleetFuelStatus> => {
        try {
            return await apiClient.patch<FleetFuelStatus>(`/fleet/vehicles/${vehicleId}/fuel-status`, {
                fuelLevel,
                source: 'MANUAL_UPDATE'
            });
        } catch (error) {
            console.error(`Error updating fuel status for vehicle ${vehicleId}:`, error);
            throw error;
        }
    }
};