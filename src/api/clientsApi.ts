import {ClientExpanded, ClientStatistics, ContactAttempt} from '../types';
import { apiClient } from './apiClient';

// Interfejs dla danych klienta do zapisu (bez pól statystyk)
export interface ClientData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    company?: string;
    taxId?: string;
    notes?: string;
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

// Konwersja niepełnych danych klienta z API na pełny format ClientExpanded
const enrichClientData = (clientData: any): ClientExpanded => {
    // Najpierw konwertujemy nazwy pól ze snake_case na camelCase
    const camelCaseClient = convertSnakeToCamel(clientData);

    // Zapewniamy, że wszystkie wymagane pola istnieją - dodajemy brakujące z wartościami domyślnymi
    return {
        ...camelCaseClient,
        // Dodajemy brakujące pola wymagane przez interfejs ClientExpanded, jeśli nie istnieją
        totalVisits: camelCaseClient.totalVisits || 0,
        totalTransactions: camelCaseClient.totalTransactions || 0,
        abandonedSales: camelCaseClient.abandonedSales || 0,
        totalRevenue: camelCaseClient.totalRevenue || 0,
        contactAttempts: camelCaseClient.contactAttempts || 0,
        vehicles: camelCaseClient.vehicles || []
    };
};

export const clientApi = {
    // Pobieranie listy klientów
    fetchClients: async (): Promise<ClientExpanded[]> => {
        try {
            const data = await apiClient.getNot<ClientExpanded[]>('/clients');
            return data;
        } catch (error) {
            console.error('Error fetching clients:', error);
            throw error;
        }
    },

    createContactAttempt: async (contactAttempt: ContactAttempt): Promise<ContactAttempt> => {
        try {
            const requestData = convertCamelToSnake(contactAttempt);
            const response = await apiClient.post<any>('/clients/contact-attempts', requestData);

            // Konwertujemy odpowiedź z snake_case na camelCase
            return convertSnakeToCamel(response) as ContactAttempt;
        } catch (error) {
            console.error('Error creating client:', error);
            throw error;
        }
    },

    // Pobieranie pojedynczego klienta
    fetchContactAttemptsByClientById: async (id: string): Promise<ContactAttempt[]> => {
        try {
            const data = await apiClient.get<any>(`/clients/${id}/contact-attempts`);
            return convertSnakeToCamel(data) as ContactAttempt[];
        } catch (error) {
            console.error(`Error fetching client ${id}:`, error);
            return [];
        }
    },

    // Pobieranie pojedynczego klienta
    fetchClientById: async (id: number | string): Promise<ClientExpanded | null> => {
        try {
            const data = await apiClient.get<any>(`/clients/${id}`);
            // Używamy enrichClientData do wzbogacenia danych o brakujące pola
            return enrichClientData(data);
        } catch (error) {
            console.error(`Error fetching client ${id}:`, error);
            return null;
        }
    },

    fetchClientStatsById: async (id: number | string): Promise<ClientStatistics | null> => {
        try {
            const data = await apiClient.get<any>(`/clients/${id}/statistics`);
            return {
                ...data,
                // Dodajemy brakujące pola wymagane przez interfejs ClientExpanded, jeśli nie istnieją
                totalVisits: data.totalVisits || 0,
                totalRevenue: data.totalRevenue || 0,
                vehicleNo: data.vehicleNo || 0
            };
        } catch (error) {
            console.error(`Error fetching client stats ${id}:`, error);
            return null;
        }
    },

    // Tworzenie nowego klienta (bez pól statystyk)
    createClient: async (clientData: ClientData): Promise<ClientData> => {
        try {
            const requestData = convertCamelToSnake(clientData);
            const response = await apiClient.postNotCamel<any>('/clients', requestData);

            return response as ClientData;
        } catch (error) {
            console.error('Error creating client:', error);
            throw error;
        }
    },

    // Aktualizacja istniejącego klienta (bez pól statystyk)
    updateClient: async (id: string, clientData: ClientData): Promise<ClientExpanded> => {
        try {
            // Konwertujemy dane do snake_case przed wysłaniem do API
            const response = await apiClient.putNot<any>(`/clients/${id}`, clientData);

            // Konwertujemy odpowiedź z snake_case na camelCase
            return convertSnakeToCamel(response) as ClientExpanded;
        } catch (error) {
            console.error(`Error updating client ${id}:`, error);
            throw error;
        }
    },

    // Usuwanie klienta
    deleteClient: async (id: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/clients/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting client ${id}:`, error);
            throw error;
        }
    },

    searchClients: async (query: string): Promise<ClientExpanded[]> => {
        try {
            const data = await apiClient.get<any[]>(`/clients/search`, { query });
            return data.map(client => enrichClientData(client));
        } catch (error) {
            console.error('Error searching clients:', error);
            return [];
        }
    }
};