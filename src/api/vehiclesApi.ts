import {VehicleExpanded, VehicleOwner, VehicleStatistics} from '../types';
import { apiClient } from './apiClient';
import {id} from "date-fns/locale";

// Interfejs dla odpowiedzi z serwera
interface VehicleResponse {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
    color?: string;
    vin?: string;
    total_services: number;
    last_service_date?: string;
    total_spent: number;
    owner_ids: string[];
}

// Interfejs dla historii serwisowej z serwera
export interface ServiceHistoryResponse {
    id: string;
    date: string;
    service_type: string;
    description: string;
    price: number;
    protocol_id?: string;
}

// Interfejs dla danych pojazdu do zapisu
export interface VehicleData {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color?: string;
    vin?: string;
    ownerIds: string[];
}

// Konwersja snake_case na camelCase dla odpowiedzi z API
const convertSnakeToCamel = (data: any): any => {
    if (data === null || data === undefined || typeof data !== 'object') {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => convertSnakeToCamel(item));
    }

    return Object.keys(data).reduce((result, key) => {
        // Konwertuj klucz ze snake_case na camelCase
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

        // Rekurencyjnie konwertuj wartość jeśli jest obiektem
        result[camelKey] = convertSnakeToCamel(data[key]);

        return result;
    }, {} as Record<string, any>);
};

// Konwersja camelCase na snake_case dla wysyłanych danych
const convertCamelToSnake = (data: any): any => {
    if (data === null || data === undefined || typeof data !== 'object') {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => convertCamelToSnake(item));
    }

    return Object.keys(data).reduce((result, key) => {
        // Konwertuj klucz z camelCase na snake_case
        const snakeKey = key.replace(/([A-Z])/g, (_, letter) => `_${letter.toLowerCase()}`);

        // Rekurencyjnie konwertuj wartość jeśli jest obiektem
        result[snakeKey] = convertCamelToSnake(data[key]);

        return result;
    }, {} as Record<string, any>);
};

export const vehicleApi = {
    // Pobieranie listy pojazdów
    fetchVehicles: async (): Promise<VehicleExpanded[]> => {
        try {
            const data = await apiClient.get<VehicleResponse[]>('/vehicles');
            return convertSnakeToCamel(data) as VehicleExpanded[];
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            throw error;
        }
    },

    fetchVehicleStatistics: async (vehicleId: string): Promise<VehicleStatistics> => {
        try {
            return await apiClient.get<VehicleStatistics>(`/vehicles/${vehicleId}/statistics`);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            throw error;
        }
    },

    fetchOwners: async (vehicleId: string): Promise<VehicleOwner[]> => {
        try {
            const data = await apiClient.get<VehicleResponse[]>(`/vehicles/${vehicleId}/owners`);
            return convertSnakeToCamel(data) as VehicleOwner[];
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            throw error;
        }
    },

    // Pobieranie pojedynczego pojazdu
    fetchVehicleById: async (id: string): Promise<VehicleExpanded | null> => {
        try {
            const data = await apiClient.get<VehicleResponse>(`/vehicles/${id}`);
            return convertSnakeToCamel(data) as VehicleExpanded;
        } catch (error) {
            console.error(`Error fetching vehicle ${id}:`, error);
            return null;
        }
    },

    // Pobieranie pojazdów dla właściciela
    fetchVehiclesByOwnerId: async (ownerId: string): Promise<VehicleExpanded[]> => {
        try {
            const data = await apiClient.get<VehicleResponse[]>(`/vehicles/owner/${ownerId}`);
            return convertSnakeToCamel(data) as VehicleExpanded[];
        } catch (error) {
            console.error(`Error fetching vehicles for owner ${ownerId}:`, error);
            return [];
        }
    },

    // Pobieranie historii serwisowej pojazdu
    fetchVehicleServiceHistory: async (vehicleId: string): Promise<ServiceHistoryResponse[]> => {
        try {
            const data = await apiClient.get<ServiceHistoryResponse[]>(`/vehicles/${vehicleId}/service-history`);
            return convertSnakeToCamel(data) as ServiceHistoryResponse[];
        } catch (error) {
            console.error(`Error fetching service history for vehicle ${vehicleId}:`, error);
            return [];
        }
    },

    // Tworzenie nowego pojazdu
    createVehicle: async (vehicleData: VehicleData): Promise<VehicleExpanded> => {
        try {
            const response = await apiClient.postNot<VehicleResponse>('/vehicles', vehicleData);
            return convertSnakeToCamel(response) as VehicleExpanded;
        } catch (error) {
            console.error('Error creating vehicle:', error);
            throw error;
        }
    },

    // Aktualizacja istniejącego pojazdu
    updateVehicle: async (id: string, vehicleData: VehicleData): Promise<VehicleExpanded> => {
        try {
            const requestData = convertCamelToSnake(vehicleData);
            const response = await apiClient.put<VehicleResponse>(`/vehicles/${id}`, requestData);
            return convertSnakeToCamel(response) as VehicleExpanded;
        } catch (error) {
            console.error(`Error updating vehicle ${id}:`, error);
            throw error;
        }
    },

    // Usuwanie pojazdu
    deleteVehicle: async (id: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/vehicles/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting vehicle ${id}:`, error);
            throw error;
        }
    }
};