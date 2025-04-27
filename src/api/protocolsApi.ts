import { apiClient } from './apiClient';
import { ProtocolListItem, ProtocolStatus, PaginatedResponse } from '../types/protocol';
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

// Funkcja pomocnicza do wzbogacania danych protokołu
const enrichProtocolData = (protocolData: any): CarReceptionProtocol => {
    // Najpierw konwertujemy nazwy pól ze snake_case na camelCase
    const camelCaseProtocol = convertSnakeToCamel(protocolData);

    // Zapewniamy, że wszystkie wymagane pola istnieją
    return {
        ...camelCaseProtocol,
        // Konwertujemy ID właściciela z formatu API (może być przekazywane jako string)
        ownerId: camelCaseProtocol.ownerId !== undefined ? camelCaseProtocol.ownerId :
            protocolData.owner_id !== undefined ? protocolData.owner_id : null,
        // Domyślne wartości dla pól, których może brakować
        selectedServices: camelCaseProtocol.selectedServices || [],
        vehicleImages: camelCaseProtocol.vehicleImages || [],
        vehicleIssues: camelCaseProtocol.vehicleIssues || [],
        purchaseInvoices: camelCaseProtocol.purchaseInvoices || [],
        comments: camelCaseProtocol.comments || []
    };
};

// Interfejs dla parametrów filtrowania
interface ProtocolFilterParams {
    clientName?: string;
    licensePlate?: string;
    status?: ProtocolStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
}

/**
 * Serwis do komunikacji z API dla protokołów przyjęcia pojazdów
 */
export const protocolsApi = {
    /**
     * Pobiera listę protokołów (tylko podstawowe dane) z paginacją
     */
    getProtocolsList: async (filters: ProtocolFilterParams = {}): Promise<PaginatedResponse<ProtocolListItem>> => {
        try {
            // Budowanie parametrów zapytania
            const queryParams: Record<string, string> = {};

            if (filters.clientName) queryParams.clientName = filters.clientName;
            if (filters.licensePlate) queryParams.licensePlate = filters.licensePlate;
            if (filters.status) queryParams.status = filters.status;
            if (filters.startDate) queryParams.startDate = filters.startDate;
            if (filters.endDate) queryParams.endDate = filters.endDate;

            // Parametry paginacji
            queryParams.page = String(filters.page !== undefined ? filters.page : 0);
            queryParams.size = String(filters.size !== undefined ? filters.size : 10);

            // Pobierz dane z API
            const response = await apiClient.get<any>('/receptions/list', queryParams);

            // Sprawdzamy, czy odpowiedź zawiera już strukturę paginacji
            // Jeśli tak, konwertujemy dane
            let transformedData: ProtocolListItem[] = [];
            let paginationInfo = {
                currentPage: Number(queryParams.page),
                pageSize: Number(queryParams.size),
                totalItems: 0,
                totalPages: 0
            };

            if (response.data && Array.isArray(response.data)) {
                // Odpowiedź w starym formacie (tylko tablica)
                transformedData = convertSnakeToCamel(response.data) as ProtocolListItem[];
                paginationInfo.totalItems = transformedData.length;
                paginationInfo.totalPages = 1;
            } else {
                // Odpowiedź w nowym formacie (z paginacją)
                transformedData = convertSnakeToCamel(response.data || []) as ProtocolListItem[];
                paginationInfo = {
                    currentPage: response.page || 0,
                    pageSize: response.size || 10,
                    totalItems: response.total_items || 0,
                    totalPages: response.total_pages || 0
                };
            }

            return {
                data: transformedData,
                pagination: paginationInfo
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

    getProtocolsByClientId: async (clientId: string): Promise<ProtocolListItem[]> => {
        try {
            // Pobierz dane z API
            const rawData = await apiClient.get<any[]>(`/receptions/${clientId}/protocols`, {});

            // Przekształć dane ze snake_case na camelCase
            const transformedData = convertSnakeToCamel(rawData) as ProtocolListItem[];

            return transformedData;
        } catch (error) {
            console.error('Error fetching protocols list:', error);
            return [];
        }
    },

    releaseVehicle: async (id: string, data: {
        paymentMethod: 'cash' | 'card';
        documentType: 'invoice' | 'receipt' | 'other';
    }): Promise<CarReceptionProtocol | null> => {
        try {
            // Konwersja danych na snake_case (dla API)
            const paymentData = convertCamelToSnake(data);

            // Wyślij dane do API
            const rawResponse = await apiClient.post<any>(`/receptions/${id}/release`, paymentData);

            // Przekształć odpowiedź ze snake_case na camelCase
            const transformedResponse = enrichProtocolData(rawResponse);

            return transformedResponse;
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
            // Pobierz dane z API
            const rawData = await apiClient.get<any>(`/receptions/${id}`);

            // Przekształć dane ze snake_case na camelCase i wzbogać o brakujące pola
            const transformedData = enrichProtocolData(rawData);

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
            const transformedResponse = enrichProtocolData(rawResponse);

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
            const transformedResponse = enrichProtocolData(rawResponse);

            return transformedResponse;
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
            // Przekształć dane z camelCase na snake_case (dla API)
            const statusData = { status };
            const statusToSnakeCase = convertCamelToSnake(statusData);

            // Wyślij dane do API
            const rawResponse = await apiClient.patch<any>(`/receptions/${id}/status`, statusToSnakeCase);

            // Przekształć odpowiedź ze snake_case na camelCase
            const transformedResponse = enrichProtocolData(rawResponse);

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