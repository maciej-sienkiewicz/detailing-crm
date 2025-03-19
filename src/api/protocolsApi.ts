import { apiClient } from './apiClient';
import { ProtocolListItem, ProtocolStatus } from '../types/protocol';
import { CarReceptionProtocol } from '../types';

// Funkcja pomocnicza do konwersji ze snake_case na camelCase
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

            // Pobierz dane z API
            const rawData = await apiClient.get<any[]>('/receptions/list', queryParams);

            // Przekształć dane ze snake_case na camelCase
            const transformedData = convertSnakeToCamel(rawData) as ProtocolListItem[];

            return transformedData;
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
            // Pobierz dane z API
            const rawData = await apiClient.get<any>(`/receptions/${id}`);

            // Przekształć dane ze snake_case na camelCase
            const transformedData = convertSnakeToCamel(rawData) as CarReceptionProtocol;

            return transformedData;
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
            // Przekształć dane z camelCase na snake_case (dla API)
            const protocolToSnakeCase = convertCamelToSnake(protocol);

            // Wyślij dane do API
            const rawResponse = await apiClient.post<any>('/receptions', protocolToSnakeCase);

            // Przekształć odpowiedź ze snake_case na camelCase
            const transformedResponse = convertSnakeToCamel(rawResponse) as CarReceptionProtocol;

            return transformedResponse;
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
            // Przekształć dane z camelCase na snake_case (dla API)
            const protocolToSnakeCase = convertCamelToSnake(protocol);

            // Wyślij dane do API
            const rawResponse = await apiClient.put<any>(`/receptions/${protocol.id}`, protocolToSnakeCase);

            // Przekształć odpowiedź ze snake_case na camelCase
            const transformedResponse = convertSnakeToCamel(rawResponse) as CarReceptionProtocol;

            return transformedResponse;
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
            // Przekształć dane z camelCase na snake_case (dla API)
            const statusData = { status };
            const statusToSnakeCase = convertCamelToSnake(statusData);

            // Wyślij dane do API
            const rawResponse = await apiClient.patch<any>(`/receptions/${id}/status`, statusToSnakeCase);

            // Przekształć odpowiedź ze snake_case na camelCase
            const transformedResponse = convertSnakeToCamel(rawResponse) as CarReceptionProtocol;

            return transformedResponse;
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