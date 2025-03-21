import { CarReceptionProtocol } from '../types';
import { apiClient } from './apiClient';

// Interfejs dla odpowiedzi z serwera
interface CarReceptionResponse {
    id: string;
    created_at: string;
    updated_at: string;
    status_updated_at: string;
    status: string;
}

// Konwersja camelCase na snake_case dla API
const convertToSnakeCase = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(convertToSnakeCase);
    }

    return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        acc[snakeKey] = convertToSnakeCase(obj[key]);
        return acc;
    }, {} as any);
};

// Konwersja snake_case na camelCase dla aplikacji frontendowej
const convertToCamelCase = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(convertToCamelCase);
    }

    return Object.keys(obj).reduce((acc, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        acc[camelKey] = convertToCamelCase(obj[key]);
        return acc;
    }, {} as any);
};

export const carReceptionApi = {
    // Tworzenie nowego protokołu przyjęcia
    createCarReceptionProtocol: async (protocol: Omit<CarReceptionProtocol, 'id' | 'createdAt' | 'updatedAt' | 'statusUpdatedAt'>): Promise<CarReceptionProtocol> => {
        try {
            console.log('Sending protocol data to server:', protocol);

            // Konwertuj dane do formatu oczekiwanego przez API
            const requestData = convertToSnakeCase(protocol);
            console.log(requestData);

            // Wysyłanie żądania POST
            const response = await apiClient.post<CarReceptionResponse>('/receptions', requestData);
            console.log('Server response:', response);

            // Konwertuj odpowiedź na format używany w aplikacji
            const convertedResponse = convertToCamelCase(response);

            // Połącz dane protokołu z odpowiedzią serwera
            return {
                ...protocol,
                id: convertedResponse.id,
                createdAt: convertedResponse.createdAt,
                updatedAt: convertedResponse.updatedAt,
                statusUpdatedAt: convertedResponse.statusUpdatedAt
            } as CarReceptionProtocol;
        } catch (error) {
            console.error('Error creating protocol:', error);
            throw error;
        }
    },

    // Aktualizacja istniejącego protokołu
    updateCarReceptionProtocol: async (protocol: CarReceptionProtocol): Promise<CarReceptionProtocol> => {
        try {
            // Konwertuj dane do formatu oczekiwanego przez API
            const requestData = convertToSnakeCase(protocol);

            // Wysyłanie żądania PUT
            const response = await apiClient.put<CarReceptionResponse>(`/receptions/${protocol.id}`, requestData);

            // Konwertuj odpowiedź na format używany w aplikacji
            const convertedResponse = convertToCamelCase(response);

            // Połącz dane protokołu z odpowiedzią serwera
            return {
                ...protocol,
                updatedAt: convertedResponse.updatedAt,
                statusUpdatedAt: convertedResponse.statusUpdatedAt
            } as CarReceptionProtocol;
        } catch (error) {
            console.error('Error updating protocol:', error);
            throw error;
        }
    },

    // Pobieranie protokołów
    fetchCarReceptionProtocols: async (): Promise<CarReceptionProtocol[]> => {
        try {
            const response = await apiClient.get<any[]>('/receptions');

            // Konwertuj odpowiedź na format używany w aplikacji
            return response.map(convertToCamelCase) as CarReceptionProtocol[];
        } catch (error) {
            console.error('Error fetching protocols:', error);
            // W przypadku błędu zwracamy puste dane (można też rzucić wyjątek)
            return [];
        }
    },

    // Pobieranie pojedynczego protokołu
    fetchCarReceptionProtocol: async (id: string): Promise<CarReceptionProtocol | null> => {
        try {
            const response = await apiClient.get<any>(`/receptions/${id}`);

            // Konwertuj odpowiedź na format używany w aplikacji
            return convertToCamelCase(response) as CarReceptionProtocol;
        } catch (error) {
            console.error(`Error fetching protocol ${id}:`, error);
            return null;
        }
    },

    // Usuwanie protokołu
    deleteCarReceptionProtocol: async (id: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/receptions/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting protocol ${id}:`, error);
            return false;
        }
    }
};