import { apiClient } from './apiClient';
// Importujemy wersje mockowe dla łatwiejszego testowania
import * as mocks from './mocks/calendarColorsMocks';
import {CalendarColor} from "../types/calendar";

// Flaga określająca, czy używamy mocków (dla trybu deweloperskiego)
const USE_MOCKS = 'development';

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

export const calendarColorsApi = {
    // Pobieranie wszystkich kolorów kalendarza
    fetchCalendarColors: async (): Promise<CalendarColor[]> => {

        try {
            const data = await apiClient.get<any[]>('/calendar/colors');
            return convertSnakeToCamel(data) as CalendarColor[];
        } catch (error) {
            console.error('Error fetching calendar colors:', error);
            return [];
        }
    },

    // Tworzenie nowego koloru
    createCalendarColor: async (colorData: Omit<CalendarColor, 'id'>): Promise<CalendarColor | null> => {

        try {
            const requestData = convertCamelToSnake(colorData);
            const response = await apiClient.post<any>('/calendar/colors', requestData);
            return convertSnakeToCamel(response) as CalendarColor;
        } catch (error) {
            console.error('Error creating calendar color:', error);
            return null;
        }
    },

    // Aktualizacja istniejącego koloru
    updateCalendarColor: async (id: string, colorData: Omit<CalendarColor, 'id'>): Promise<CalendarColor | null> => {
        try {
            const requestData = convertCamelToSnake(colorData);
            const response = await apiClient.put<any>(`/calendar/colors/${id}`, requestData);
            return convertSnakeToCamel(response) as CalendarColor;
        } catch (error) {
            console.error(`Error updating calendar color ${id}:`, error);
            return null;
        }
    },

    // Usuwanie koloru
    deleteCalendarColor: async (id: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/calendar/colors/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting calendar color ${id}:`, error);
            return false;
        }
    },

    // Sprawdzenie, czy dana nazwa koloru jest już zajęta
    isColorNameTaken: async (name: string, excludeId?: string): Promise<boolean> => {
        try {
            const queryParams: Record<string, string> = { name };
            if (excludeId) {
                queryParams.exclude_id = excludeId;
            }

            const response = await apiClient.get<{ exists: boolean }>('/calendar/colors/check-name', queryParams);
            return response.exists;
        } catch (error) {
            console.error('Error checking if color name is taken:', error);
            return false; // W przypadku błędu zakładamy, że nazwa nie jest zajęta
        }
    }
};