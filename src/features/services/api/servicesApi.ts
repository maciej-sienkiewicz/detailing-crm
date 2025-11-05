import { Service, PriceType, ServicePriceInput } from '../../../types';
import { apiClient } from '../../../shared/api/apiClient';

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

// Interface dla danych wysyłanych do API (REQUEST)
export interface ServiceData {
    name: string;
    description?: string;
    price: ServicePriceInput;  // inputPrice + inputType
    vatRate: number;
}

export const servicesApi = {
    // Pobieranie listy usług
    fetchServices: async (): Promise<Service[]> => {
        try {
            const data = await apiClient.get<any[]>('/services');
            const services = convertSnakeToCamel(data) as Service[];

            return services;
        } catch (error) {
            console.error('Error fetching services:', error);
            throw error;
        }
    },

    // Pobieranie pojedynczej usługi
    fetchServiceById: async (id: string): Promise<Service | null> => {
        try {
            const data = await apiClient.get<any>(`/services/${id}`);
            const service = convertSnakeToCamel(data) as Service;

            return service;
        } catch (error) {
            console.error(`Error fetching service ${id}:`, error);
            return null;
        }
    },

    // Tworzenie nowej usługi
    createService: async (serviceData: ServiceData): Promise<Service> => {
        try {
            const requestData = convertCamelToSnake(serviceData);
            const response = await apiClient.post<any>('/services', requestData);

            // Backend zwraca pełny obiekt ServiceResponse z wyliczonymi cenami
            const createdService = convertSnakeToCamel(response) as Service;

            return createdService;
        } catch (error) {
            console.error('Error creating service:', error);
            throw error;
        }
    },

    // Aktualizacja istniejącej usługi
    updateService: async (id: string, serviceData: ServiceData): Promise<Service> => {
        try {
            const requestData = convertCamelToSnake(serviceData);
            const response = await apiClient.put<any>(`/services/${id}`, requestData);
            return convertSnakeToCamel(response) as Service;
        } catch (error) {
            console.error(`Error updating service ${id}:`, error);
            throw error;
        }
    },

    // Usuwanie usługi
    deleteService: async (id: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/services/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting service ${id}:`, error);
            throw error;
        }
    },

    // Pobieranie domyślnej stawki VAT
    fetchDefaultVatRate: async (): Promise<number> => {
        try {
            return 23; // Domyślna wartość jako fallback
        } catch (error) {
            console.error('Error fetching default VAT rate:', error);
            return 23; // Zwracamy domyślną wartość w przypadku błędu
        }
    }
};