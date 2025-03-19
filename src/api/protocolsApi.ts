import { apiClient } from './apiClient';
import { ProtocolListItem, ProtocolStatus } from '../types/protocol';
import { CarReceptionProtocol } from '../types';

// Interfejs dla parametrów filtrowania
interface ProtocolFilterParams {
    clientName?: string;
    licensePlate?: string;
    status?: ProtocolStatus;
    startDate?: string;
    endDate?: string;
}

/**
 * Serwis do komunikacji z API dla protokołów przyjęcia pojazdów
 */
export const protocolsApi = {
    /**
     * Pobiera listę protokołów (tylko podstawowe dane)
     */
    getProtocolsList: async (filters: ProtocolFilterParams = {}): Promise<ProtocolListItem[]> => {
        try {
            // Budowanie parametrów zapytania
            const queryParams: Record<string, string> = {};

            if (filters.clientName) queryParams.clientName = filters.clientName;
            if (filters.licensePlate) queryParams.licensePlate = filters.licensePlate;
            if (filters.status) queryParams.status = filters.status;
            if (filters.startDate) queryParams.startDate = filters.startDate;
            if (filters.endDate) queryParams.endDate = filters.endDate;

            return await apiClient.get<ProtocolListItem[]>('/receptions/list', queryParams);
        } catch (error) {
            console.error('Error fetching protocols list:', error);
            return [];
        }
    },

    /**
     * Pobiera szczegóły protokołu
     */
    getProtocolDetails: async (id: string): Promise<CarReceptionProtocol | null> => {
        try {
            return await apiClient.get<CarReceptionProtocol>(`/receptions/${id}`);
        } catch (error) {
            console.error(`Error fetching protocol details (ID: ${id}):`, error);
            return null;
        }
    },

    /**
     * Tworzy nowy protokół
     */
    createProtocol: async (protocol: Omit<CarReceptionProtocol, 'id'>): Promise<CarReceptionProtocol | null> => {
        try {
            return await apiClient.post<CarReceptionProtocol>('/receptions', protocol);
        } catch (error) {
            console.error('Error creating protocol:', error);
            return null;
        }
    },

    /**
     * Aktualizuje istniejący protokół
     */
    updateProtocol: async (protocol: CarReceptionProtocol): Promise<CarReceptionProtocol | null> => {
        try {
            return await apiClient.put<CarReceptionProtocol>(`/receptions/${protocol.id}`, protocol);
        } catch (error) {
            console.error(`Error updating protocol (ID: ${protocol.id}):`, error);
            return null;
        }
    },

    /**
     * Zmienia status protokołu
     */
    updateProtocolStatus: async (id: string, status: ProtocolStatus): Promise<CarReceptionProtocol | null> => {
        try {
            return await apiClient.patch<CarReceptionProtocol>(`/receptions/${id}/status`, { status });
        } catch (error) {
            console.error(`Error updating protocol status (ID: ${id}):`, error);
            return null;
        }
    },

    /**
     * Usuwa protokół
     */
    deleteProtocol: async (id: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/receptions/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting protocol (ID: ${id}):`, error);
            return false;
        }
    }
};