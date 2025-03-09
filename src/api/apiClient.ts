// Konfiguracja klienta API dla integracji z backendem Kotlin/Spring

// Funkcja do pobierania tokenu autoryzacyjnego (później zostanie zaimplementowana z prawdziwym backendem)
const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token');
};

// Bazowy URL API (później zostanie zmieniony na rzeczywisty endpoint)
const API_BASE_URL = '/api'; // W produkcji będzie to pełny URL do backendu

// Podstawowe opcje dla wszystkich żądań API
const getDefaultOptions = (): RequestInit => ({
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {})
    }
});

// Podstawowa funkcja fetch API z obsługą błędów
const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        ...getDefaultOptions(),
        ...options,
    });

    if (!response.ok) {
        // Obsługa różnych kodów błędów HTTP
        if (response.status === 401) {
            // Nieprawidłowe uwierzytelnienie - można przekierować do strony logowania
            throw new Error('Unauthorized access');
        }

        if (response.status === 403) {
            throw new Error('Access forbidden');
        }

        if (response.status === 404) {
            throw new Error('Resource not found');
        }

        // Próba uzyskania informacji o błędzie z odpowiedzi JSON
        try {
            const errorData = await response.json();
            throw new Error(errorData.message || 'An error occurred');
        } catch (e) {
            throw new Error(`HTTP error ${response.status}`);
        }
    }

    // Zwróć dane JSON z odpowiedzi
    return response.json();
};

// Eksportowane funkcje do wykonywania różnych typów żądań HTTP
export const apiClient = {
    get: <T>(endpoint: string, queryParams: Record<string, string> = {}): Promise<T> => {
        // Konstruowanie parametrów zapytania
        const queryString = new URLSearchParams(queryParams).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        return apiFetch<T>(url);
    },

    post: <T>(endpoint: string, data: any): Promise<T> => {
        return apiFetch<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    put: <T>(endpoint: string, data: any): Promise<T> => {
        return apiFetch<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    delete: <T>(endpoint: string): Promise<T> => {
        return apiFetch<T>(endpoint, {
            method: 'DELETE'
        });
    }
};

// Użycie powyższych funkcji będzie następujące:
// apiClient.get<Appointment[]>('/appointments')
// apiClient.post<Appointment>('/appointments', newAppointment)
// apiClient.put<Appointment>('/appointments/123', updatedAppointment)
// apiClient.delete<void>('/appointments/123')