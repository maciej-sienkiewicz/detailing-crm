// src/api/protocolsApi.ts
import {apiClient, PaginatedResponse} from './apiClient';
import {ProtocolListItem, ProtocolStatus} from '../types/protocol';
import {CarReceptionProtocol, SelectedService} from '../types';
import {apiClientNew} from "./apiClientNew";

interface ReleaseVehicleData {
    paymentMethod: 'cash' | 'card' | 'transfer';
    documentType: 'invoice' | 'receipt' | 'other';
    paymentDays?: number;
    overridenItems?: SelectedService[];
}

interface ServicesUpdateCommand {
    services: Array<{
        name: string;
        price: number;
        quantity?: number;
        discount_type?: string;
        discount_value?: number;
        final_price?: number;
        approval_status?: string;
        note?: string;
    }>;
}

interface ProtocolIdResponse {
    id: string;
}

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
     * Zwalnia (wydaje) pojazd
     */
    releaseVehicle: async (id: string, data: ReleaseVehicleData): Promise<CarReceptionProtocol | null> => {
        try {

            return await apiClientNew.post<CarReceptionProtocol>(`/v1/protocols/${id}/release`, data);
        } catch (error) {
            console.error(`Error releasing vehicle (ID: ${id}):`, error);
            return null;
        }
    },

    updateServices: async (protocolId: string, services: SelectedService[]): Promise<boolean> => {
        try {

            // Mapowanie z SelectedService na format API
            const servicesUpdateCommand: ServicesUpdateCommand = {
                services: services.map(service => ({
                    name: service.name,
                    price: service.price,
                    quantity: 1, // Domyślnie 1
                    discount_type: service.discountType,
                    discount_value: service.discountValue,
                    final_price: service.finalPrice,
                    approval_status: service.approvalStatus || 'PENDING',
                    note: service.note || ''
                }))
            };

            const response = await apiClientNew.put<ProtocolIdResponse>(
                `/v1/protocols/${protocolId}/services`,
                servicesUpdateCommand
            );
            return true;
        } catch (error) {
            console.error(`Error updating services for protocol (ID: ${protocolId}):`, error);
            return false;
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

            const request: SendProtocolEmailRequest = {
                visit_id: visitId
            };

            const response = await apiClient.post<EmailSendResponse>('/email/send/protocol', request);
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