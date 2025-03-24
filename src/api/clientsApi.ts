import {ClientExpanded, ContactAttempt} from '../types';
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

export const clientApi = {
    // Pobieranie listy klientów
    fetchClients: async (): Promise<ClientExpanded[]> => {
        try {
            const data = await apiClient.get<any[]>('/clients');
            console.log(data);
            return convertSnakeToCamel(data) as ClientExpanded[];
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
    fetchClientById: async (id: number): Promise<ClientExpanded | null> => {
        try {
            const data = await apiClient.get<any>(`/clients/${id}`);
            return convertSnakeToCamel(data) as ClientExpanded;
        } catch (error) {
            console.error(`Error fetching client ${id}:`, error);
            return null;
        }
    },

    // Tworzenie nowego klienta (bez pól statystyk)
    createClient: async (clientData: ClientData): Promise<ClientData> => {
        try {
            const requestData = convertCamelToSnake(clientData);
            const response = await apiClient.post<any>('/clients', requestData);

            // Konwertujemy odpowiedź z snake_case na camelCase
            return convertSnakeToCamel(response) as ClientData;
        } catch (error) {
            console.error('Error creating client:', error);
            throw error;
        }
    },

    // Aktualizacja istniejącego klienta (bez pól statystyk)
    updateClient: async (id: string, clientData: ClientData): Promise<ClientExpanded> => {
        try {
            // Konwertujemy dane do snake_case przed wysłaniem do API
            const requestData = convertCamelToSnake(clientData);
            const response = await apiClient.put<any>(`/clients/${id}`, requestData);

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
    }
};