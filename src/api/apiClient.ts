// Konfiguracja klienta API dla integracji z backendem Kotlin/Spring

// Funkcja do pobierania tokenu autoryzacyjnego (później zostanie zaimplementowana z prawdziwym backendem)
const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token');
};

// Bazowy URL API - teraz wskazuje na lokalny serwer Spring Boot
const API_BASE_URL = 'http://localhost:8080/api';

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

    // Logowanie wywołania API do konsoli dla debugowania
    console.log(`API request: ${options.method || 'GET'} ${url}`);

    // Sprawdzamy, czy mamy do czynienia z FormData
    const isFormData = options.body instanceof FormData;

    // Przygotowujemy opcje żądania
    let fetchOptions: RequestInit;

    if (isFormData) {
        // Dla FormData, kopiujemy domyślne opcje, ale bez Content-Type
        // Pozwalamy przeglądarce ustawić odpowiedni Content-Type z granicą (boundary)
        const { headers, ...restDefaultOptions } = getDefaultOptions();
        const headersWithoutContentType: Record<string, string> = { ...headers as Record<string, string> };
        delete headersWithoutContentType['Content-Type'];

        fetchOptions = {
            ...restDefaultOptions,
            ...options,
            headers: {
                ...headersWithoutContentType,
                ...(options.headers as Record<string, string> || {})
            }
        };
    } else {
        // Dla standardowych żądań, używamy domyślnych opcji
        fetchOptions = {
            ...getDefaultOptions(),
            ...options,
            headers: {
                ...getDefaultOptions().headers,
                ...(options.headers || {})
            }
        };
    }

    // Logowanie opcji żądania dla debugowania
    console.log('Request options:', {
        method: fetchOptions.method,
        headers: fetchOptions.headers,
        bodyType: options.body ? (isFormData ? 'FormData' : typeof options.body) : null
    });

    try {
        const response = await fetch(url, fetchOptions);

        // Logowanie statusu odpowiedzi
        console.log(`API response status: ${response.status}`);

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
                console.error('API error details:', errorData);
                throw new Error(errorData.message || 'An error occurred');
            } catch (e) {
                throw new Error(`HTTP error ${response.status}`);
            }
        }

        // Sprawdź, czy odpowiedź jest pusta
        const contentType = response.headers.get('Content-Type');
        const contentLength = response.headers.get('Content-Length');

        // Jeśli odpowiedź jest pusta, zwracamy pusty obiekt
        if (contentLength === '0') {
            return {} as T;
        }

        // Jeśli Content-Type to JSON, parsujemy odpowiedź jako JSON
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }

        // W przeciwnym razie zwracamy odpowiedź jako tekst
        return response.text() as unknown as T;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

// Eksportowane funkcje do wykonywania różnych typów żądań HTTP
export const apiClient = {
    // Metoda do uzyskania bazowego URL API
    getBaseUrl: () => API_BASE_URL,

    get: <T>(endpoint: string, queryParams: Record<string, string> = {}): Promise<T> => {
        // Konstruowanie parametrów zapytania
        const queryString = new URLSearchParams(queryParams).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        return apiFetch<T>(url);
    },

    post: <T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> => {
        // Sprawdzamy, czy wysyłamy FormData
        const isFormData = data instanceof FormData;

        // Jeśli nie jest to FormData, konwertujemy na JSON string
        const body = isFormData ? data : JSON.stringify(data);

        return apiFetch<T>(endpoint, {
            method: 'POST',
            body,
            ...options
        });
    },

    patch: <T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> => {
        // Sprawdzamy, czy wysyłamy FormData
        const isFormData = data instanceof FormData;

        // Jeśli nie jest to FormData, konwertujemy na JSON string
        const body = isFormData ? data : JSON.stringify(data);

        return apiFetch<T>(endpoint, {
            method: 'PATCH',
            body,
            ...options
        });
    },

    put: <T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> => {
        // Sprawdzamy, czy wysyłamy FormData
        const isFormData = data instanceof FormData;

        // Jeśli nie jest to FormData, konwertujemy na JSON string
        const body = isFormData ? data : JSON.stringify(data);

        return apiFetch<T>(endpoint, {
            method: 'PUT',
            body,
            ...options
        });
    },

    delete: <T>(endpoint: string): Promise<T> => {
        return apiFetch<T>(endpoint, {
            method: 'DELETE'
        });
    }
};