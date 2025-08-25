// src/api/authApi.ts
import {apiClient} from './apiClient';

// Typy dla żądań i odpowiedzi
interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    userId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    companyId: number;
    companyName?: string;
    roles: string[];
}

/**
 * API do zarządzania autoryzacją użytkowników
 */
export const authApi = {
    /**
     * Logowanie użytkownika
     * @param username Login użytkownika (email)
     * @param password Hasło użytkownika
     * @returns Dane użytkownika i token JWT
     */
    login: async (username: string, password: string): Promise<LoginResponse> => {
        try {
            const loginRequest: LoginRequest = {
                username,
                password
            };

            const response = await apiClient.post<LoginResponse>('/auth/login', loginRequest);
            return response;
        } catch (error) {
            console.error('Login API error:', error);

            // Przekształć błąd na bardziej czytelny komunikat
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
            }
        }
    },

    /**
     * Sprawdza czy aktualny token jest ważny
     * @returns true jeśli token jest ważny, false w przeciwnym wypadku
     */
    validateToken: async (): Promise<boolean> => {
        try {
            // Próba wykonania zapytania wymagającego autoryzacji
            await apiClient.get('/auth/validate-token');
            return true;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    },

    /**
     * Pobiera aktualny profil użytkownika
     * @returns Dane profilu
     */
    getCurrentUser: async (): Promise<any> => {
        try {
            return await apiClient.get('/auth/profile');
        } catch (error) {
            console.error('Get current user error:', error);
            throw error;
        }
    },

    /**
     * Resetuje hasło użytkownika (inicjuje proces)
     * @param email Email użytkownika
     */
    resetPassword: async (email: string): Promise<void> => {
        try {
            await apiClient.post('/auth/reset-password', { email });
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }
};