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
    inProgress: number;
    readyForPickup: number;
    completed: number;
    cancelled: number;
    all: number;
}

// Interfejsy dla wysyłania emaila
export interface SendProtocolEmailRequest {
    visit_id: string;
}

export interface EmailSendResponse {
    success: boolean;
    message?: string;
    emailId?: string;
    sentTo?: string;
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

            const response = await apiClient.getWithPagination<ProtocolListItem>(
                '/v1/protocols/list',
                otherFilters,
                { page, size }
            );

            // Server zwraca strukturę z snake_case, ale apiClient.getWithPagination
            // już konwertuje do camelCase, więc sprawdzamy czy konwersja przebiegła poprawnie
            return {
                data: response.data || [],
                pagination: {
                    currentPage: response.pagination?.currentPage ?? page,
                    pageSize: response.pagination?.pageSize ?? size,
                    totalItems: response.pagination?.totalItems ?? 0,
                    totalPages: response.pagination?.totalPages ?? 0
                }
            };
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
            return await apiClient.get<ProtocolListItem[]>('/v1/protocols/not-paginated', filters);
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
            return await apiClient.post<CarReceptionProtocol>(`/v1/protocols/${id}/release`, data);
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
            return await apiClient.get<CarReceptionProtocol>(`/v1/protocols/${id}`);
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
            return await apiClient.put<CarReceptionProtocol>(`/v1/protocols/${protocol.id}`, protocol);
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
            return await apiClient.patch<CarReceptionProtocol>(`/v1/protocols/${id}/status`, { status, reason });
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

    /**
     * Pobiera liczniki protokołów
     */
    getProtocolCounters: async (): Promise<ProtocolCounters> => {
        try {
            return await apiClient.get<ProtocolCounters>('/v1/protocols/counters');
        } catch (error) {
            console.error('Error fetching protocol counters:', error);
            // Zwracamy domyślne wartości w przypadku błędu
            return {
                scheduled: 0,
                inProgress: 0,
                readyForPickup: 0,
                completed: 0,
                cancelled: 0,
                all: 0
            };
        }
    },

    /**
     * Wysyła protokół emailem
     */
    sendProtocolEmail: async (visitId: string): Promise<EmailSendResponse> => {
        try {
            console.log('🔧 Sending protocol email...', visitId);

            const request: SendProtocolEmailRequest = {
                visit_id: visitId
            };

            const response = await apiClient.post<EmailSendResponse>('/email/send/protocol', request);

            console.log('✅ Protocol email sent successfully:', response);
            return response;
        } catch (error) {
            console.error(`Error sending protocol email (Visit ID: ${visitId}):`, error);

            // Zwracamy strukturę błędu zamiast rzucania wyjątku
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Nie udało się wysłać emaila z protokołem'
            };
        }
    }
};