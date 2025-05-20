// src/api/protocolsApi.ts
import { apiClient, PaginatedResponse } from './apiClient';
import { ProtocolListItem, ProtocolStatus } from '../types/protocol';
import { CarReceptionProtocol } from '../types';

// Interfejs dla parametrów filtrowania
interface ProtocolFilterParams {
    clientName?: string;
    licensePlate?: string;
    status?: ProtocolStatus;
    startDate?: string;
    endDate?: string;
    make?: string;
    model?: string;
    serviceName?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    size?: number;
}

export interface ProtocolCounters {
    scheduled: number;
    in_progress: number;
    ready_for_pickup: number;
    completed: number;
    cancelled: number;
    all: number;
}

/**
 * API do zarządzania protokołami przyjęcia pojazdów
 */
export const protocolsApi = {
    /**
     * Pobiera listę protokołów (tylko podstawowe dane) z paginacją
     */
    getProtocolsList: async (filters: ProtocolFilterParams = {}): Promise<PaginatedResponse<ProtocolListItem>> => {
        try {
            const { page = 0, size = 10, ...otherFilters } = filters;

            return await apiClient.getWithPagination<ProtocolListItem>(
                '/receptions/list',
                otherFilters,
                { page, size }
            );
        } catch (error) {
            console.error('Error fetching protocols list:', error);
            // W przypadku błędu zwracamy pustą listę z minimalnymi informacjami o paginacji
            return {
                data: [],
                pagination: {
                    currentPage: Number(filters.page || 0),
                    pageSize: Number(filters.size || 10),
                    totalItems: 0,
                    totalPages: 0
                }
            };
        }
    },

    /**
     * Pobiera listę protokołów bez paginacji
     */
    getProtocolsListWithoutPagination: async (filters: Omit<ProtocolFilterParams, 'page' | 'size'> = {}): Promise<ProtocolListItem[]> => {
        try {
            return await apiClient.get<ProtocolListItem[]>('/receptions/not-paginated', filters);
        } catch (error) {
            console.error('Error fetching protocols list:', error);
            return [];
        }
    },

    /**
     * Pobiera protokoły dla określonego klienta
     */
    getProtocolsByClientId: async (clientId: string): Promise<ProtocolListItem[]> => {
        try {
            return await apiClient.get<ProtocolListItem[]>(`/receptions/${clientId}/protocols`);
        } catch (error) {
            console.error('Error fetching protocols list:', error);
            return [];
        }
    },

    /**
     * Zwalnia (wydaje) pojazd
     */
    releaseVehicle: async (id: string, data: {
        paymentMethod: 'cash' | 'card';
        documentType: 'invoice' | 'receipt' | 'other';
    }): Promise<CarReceptionProtocol | null> => {
        try {
            return await apiClient.post<CarReceptionProtocol>(`/receptions/${id}/release`, data);
        } catch (error) {
            console.error(`Error releasing vehicle (ID: ${id}):`, error);
            return null;
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
    updateProtocolStatus: async (id: string, status: ProtocolStatus, reason?: string): Promise<CarReceptionProtocol | null> => {
        try {
            return await apiClient.patch<CarReceptionProtocol>(`/receptions/${id}/status`, { status, reason });
        } catch (error) {
            console.error(`Error updating protocol status (ID: ${id}):`, error);
            return null;
        }
    },

    /**
     * Przywraca anulowany protokół
     */
    restoreProtocol: async (id: string, options: {
        newStatus: ProtocolStatus;
        newStartDate?: string;
        newEndDate?: string;
    }): Promise<CarReceptionProtocol | null> => {
        try {
            return await apiClient.patch<CarReceptionProtocol>(
                `/receptions/${id}/restore`,
                options
            );
        } catch (error) {
            console.error(`Error restoring protocol (ID: ${id}):`, error);
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
    },

    getProtocolCounters: async (): Promise<ProtocolCounters> => {
        try {
            return await apiClient.get<ProtocolCounters>('/receptions/counters');
        } catch (error) {
            console.error('Error fetching protocol counters:', error);
            // Zwracamy domyślne wartości w przypadku błędu
            return {
                scheduled: 0,
                in_progress: 0,
                ready_for_pickup: 0,
                completed: 0,
                cancelled: 0,
                all: 0
            };
        }
    }
};