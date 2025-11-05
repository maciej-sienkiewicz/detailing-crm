import {apiClient} from '../shared/api/apiClient';
import {CalendarColor} from "../types/calendar";

/**
 * API do zarządzania kolorami kalendarza
 */
export const calendarColorsApi = {
    // Pobieranie wszystkich kolorów kalendarza
    fetchCalendarColors: async (): Promise<CalendarColor[]> => {
        try {
            return await apiClient.get<CalendarColor[]>('/calendar/colors');
        } catch (error) {
            console.error('Error fetching calendar colors:', error);
            return [];
        }
    },

    // Tworzenie nowego koloru
    createCalendarColor: async (colorData: Omit<CalendarColor, 'id'>): Promise<CalendarColor | null> => {
        try {
            return await apiClient.post<CalendarColor>('/calendar/colors', colorData);
        } catch (error) {
            console.error('Error creating calendar color:', error);
            return null;
        }
    },

    // Aktualizacja istniejącego koloru
    updateCalendarColor: async (id: string, colorData: Omit<CalendarColor, 'id'>): Promise<CalendarColor | null> => {
        try {
            return await apiClient.put<CalendarColor>(`/calendar/colors/${id}`, colorData);
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
            const queryParams: Record<string, any> = { name };
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