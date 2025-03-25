import { apiClient } from './apiClient';
import { ServiceApprovalStatus } from '../types';

// Interfejs dla usługi
export interface ServiceData {
    id: string;
    name: string;
    price: number;
    description?: string;
    vatRate?: number;
}

// Interfejs dla usługi w protokole
export interface ProtocolServiceData {
    id: string;
    name: string;
    price: number;
    finalPrice: number;
    discountType: string;
    discountValue: number;
    approvalStatus: ServiceApprovalStatus;
    addedAt: string;
    approvedAt?: string;
    rejectedAt?: string;
    confirmationMessage?: string;
    clientMessage?: string;
}

// Funkcja pomocnicza konwertująca nazwy pól ze snake_case na camelCase
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

// Funkcja pomocnicza do konwersji z camelCase na snake_case (dla wysyłania danych do API)
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

export const servicesApi = {
    /**
     * Pobiera wszystkie dostępne usługi
     */
    fetchServices: async (): Promise<ServiceData[]> => {
        try {
            const response = await apiClient.get<any[]>('/services');
            return convertSnakeToCamel(response) as ServiceData[];
        } catch (error) {
            console.error('Błąd podczas pobierania usług:', error);
            return [];
        }
    },

    /**
     * Dodaje usługę do protokołu wraz z powiadomieniem
     */
    addServiceToProtocol: async (
        protocolId: string,
        services: { id: string; name: string; price: number }[],
        notificationType?: 'SMS' | 'EMAIL' | 'BOTH' | 'NONE'
    ): Promise<boolean> => {
        try {
            const requestData = convertCamelToSnake({
                services,
                notificationType: notificationType || 'SMS',
            });

            await apiClient.post(`/receptions/${protocolId}/services`, requestData);
            return true;
        } catch (error) {
            console.error('Błąd podczas dodawania usług do protokołu:', error);
            throw error;
        }
    },

    /**
     * Pobiera usługi przypisane do protokołu
     */
    getProtocolServices: async (protocolId: string): Promise<ProtocolServiceData[]> => {
        try {
            const response = await apiClient.get<any[]>(`/receptions/${protocolId}/services`);
            return convertSnakeToCamel(response) as ProtocolServiceData[];
        } catch (error) {
            console.error('Błąd podczas pobierania usług protokołu:', error);
            return [];
        }
    },

    /**
     * Zmienia status usługi (np. zatwierdza lub odrzuca)
     */
    updateServiceStatus: async (
        protocolId: string,
        serviceId: string,
        status: ServiceApprovalStatus,
        clientMessage?: string
    ): Promise<boolean> => {
        try {
            const requestData = convertCamelToSnake({
                status,
                clientMessage
            });

            await apiClient.patch(`/receptions/${protocolId}/services/${serviceId}/status`, requestData);
            return true;
        } catch (error) {
            console.error('Błąd podczas aktualizacji statusu usługi:', error);
            return false;
        }
    },

    /**
     * Pobiera kategorie usług
     */
    fetchServiceCategories: async (): Promise<string[]> => {
        try {
            const response = await apiClient.get<string[]>('/services/categories');
            return response;
        } catch (error) {
            console.error('Błąd podczas pobierania kategorii usług:', error);
            return [];
        }
    },

    /**
     * Anuluje usługę oczekującą na potwierdzenie
     */
    cancelPendingService: async (protocolId: string, serviceId: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/receptions/${protocolId}/services/${serviceId}`);
            return true;
        } catch (error) {
            console.error('Błąd podczas anulowania usługi:', error);
            return false;
        }
    },

    /**
     * Wysyła ponowne powiadomienie do klienta odnośnie usługi
     */
    resendServiceNotification: async (
        protocolId: string,
        serviceId: string,
        notificationType: 'SMS' | 'EMAIL' | 'BOTH' = 'SMS'
    ): Promise<boolean> => {
        try {
            const requestData = convertCamelToSnake({
                notificationType
            });

            await apiClient.post(`/receptions/${protocolId}/services/${serviceId}/notify`, requestData);
            return true;
        } catch (error) {
            console.error('Błąd podczas wysyłania powiadomienia:', error);
            return false;
        }
    }
};