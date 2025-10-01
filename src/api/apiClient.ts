// Konfiguracja klienta API dla integracji z backendem Kotlin/Spring

/**
 * ApiClient - główny moduł do komunikacji z API
 * Zawiera podstawowe metody oraz narzędzia pomocnicze do obsługi żądań HTTP
 */

// Interfejs dla opcji paginacji
export interface PaginationOptions {
    page?: number;
    size?: number;
}

// Uniwersalny interfejs dla odpowiedzi z paginacją
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}

// Funkcja do pobierania tokenu autoryzacyjnego
const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token');
};

// Bazowy URL API - teraz wskazuje na lokalny serwer Spring Boot
const API_BASE_URL = '/api';

// Flaga zapobiegająca wielokrotnemu przekierowaniu
let isRedirecting = false;

// Funkcja obsługująca przekierowanie przy 401
const handle401Redirect = () => {
    if (!isRedirecting) {
        isRedirecting = true;

        console.warn('Unauthorized (401) - Session expired. Redirecting to login...');

        // Wyczyść token
        localStorage.removeItem('auth_token');

        // Przekieruj na stronę logowania
        window.location.href = '/login';

        // Reset flagi po krótkiej chwili (zabezpieczenie przed wielokrotnym wywołaniem)
        setTimeout(() => {
            isRedirecting = false;
        }, 1000);
    }
};

// Podstawowe opcje dla wszystkich żądań API
const getDefaultOptions = (): RequestInit => ({
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {})
    }
});

/**
 * Konwersja obiektu ze snake_case na camelCase
 * @param data - Dane do konwersji
 * @returns Skonwertowane dane
 */
export const convertSnakeToCamel = (data: any): any => {
    if (data === null || data === undefined || typeof data !== 'object') {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => convertSnakeToCamel(item));
    }

    return Object.keys(data).reduce((result, key) => {
        // Konwertuj klucz ze snake_case na camelCase
        const camelKey = key.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

        // Rekurencyjnie konwertuj wartość jeśli jest obiektem
        result[camelKey] = convertSnakeToCamel(data[key]);

        return result;
    }, {} as Record<string, any>);
};

/**
 * Konwersja obiektu z camelCase na snake_case
 * @param data - Dane do konwersji
 * @returns Skonwertowane dane
 */
export const convertCamelToSnake = (data: any): any => {
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

/**
 * Przygotowanie parametrów zapytania jako string
 * @param params - Obiekt z parametrami
 * @returns String parametrów URL lub pusty string
 */
export const prepareQueryParams = (params: Record<string, any> = {}): string => {
    const filteredParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .reduce((obj, [key, value]) => {
            obj[key] = String(value);
            return obj;
        }, {} as Record<string, string>);

    const queryString = new URLSearchParams(filteredParams).toString();
    return queryString ? `?${queryString}` : '';
};

// Uniwersalna funkcja do obsługi błędów HTTP
export const handleApiError = (error: any, context: string): never => {
    console.error(`API error (${context}):`, error);
    throw error;
};

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

    // Logowanie opcji żądania dla debugowania w trybie deweloperskim
    if (process.env.NODE_ENV === 'development') {
        console.log('Request options:', {
            method: fetchOptions.method,
            headers: fetchOptions.headers,
            bodyType: options.body ? (isFormData ? 'FormData' : typeof options.body) : null
        });
    }

    try {
        const response = await fetch(url, fetchOptions);

        // Logowanie statusu odpowiedzi
        console.log(`API response status: ${response.status}`);

        // ✅ OBSŁUGA 401 - AUTOMATYCZNE PRZEKIEROWANIE NA LOGIN
        if (response.status === 401) {
            handle401Redirect();
            throw new Error('Unauthorized - Session expired');
        }

        if (!response.ok) {
            // POPRAWIONA OBSŁUGA BŁĘDÓW
            let errorData = null;

            // Najpierw spróbuj pobrać dane JSON
            try {
                const contentType = response.headers.get('Content-Type');
                if (contentType && contentType.includes('application/json')) {
                    errorData = await response.json();
                    console.log('Response data:', errorData);
                } else {
                    // Jeśli nie JSON, spróbuj jako text
                    const textData = await response.text();
                    console.log('Response text:', textData);
                    errorData = { message: textData };
                }
            } catch (parseError) {
                console.warn('Could not parse error response:', parseError);
                errorData = { message: `HTTP error ${response.status}` };
            }

            // Obsługa różnych kodów błędów HTTP
            if (response.status === 403) {
                throw new Error('Access forbidden');
            }

            if (response.status === 404) {
                throw new Error('Resource not found');
            }

            // Twórz błąd z pełnymi danymi
            const error = new Error(errorData?.message || `HTTP error ${response.status}`);
            // Dodaj dodatkowe właściwości do błędu
            (error as any).status = response.status;
            (error as any).error = errorData?.error;
            (error as any).success = errorData?.success;
            (error as any).timestamp = errorData?.timestamp;
            (error as any).path = errorData?.path;
            (error as any).response = {
                status: response.status,
                data: errorData
            };

            throw error;
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
            const jsonData = await response.json();
            return jsonData as T;
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

    getAuthToken: () => getAuthToken(),

    // Metody konwersji formatów danych
    convertSnakeToCamel,
    convertCamelToSnake,

    // Pomocnicza metoda do konwersji formatu odpowiedzi
    parseResponse: <T>(response: any): T => {
        return convertSnakeToCamel(response) as T;
    },

    // Metoda do pobierania danych z API
    get: async <T>(endpoint: string, queryParams: Record<string, any> = {}): Promise<T> => {
        try {
            // Konstruowanie parametrów zapytania
            const queryString = prepareQueryParams(queryParams);
            const url = `${endpoint}${queryString}`;

            const response = await apiFetch<any>(url);
            return convertSnakeToCamel(response) as T;
        } catch (error) {
            return handleApiError(error, `GET ${endpoint}`);
        }
    },

    getNot: async <T>(endpoint: string, queryParams: Record<string, any> = {}): Promise<T> => {
        try {
            // Konstruowanie parametrów zapytania
            const queryString = prepareQueryParams(queryParams);
            const url = `${endpoint}${queryString}`;

            const response = await apiFetch<any>(url);
            return response as T;
        } catch (error) {
            return handleApiError(error, `GET ${endpoint}`);
        }
    },

    // Metoda do pobierania danych z paginacją
    getWithPagination: async <T>(
        endpoint: string,
        queryParams: Record<string, any> = {},
        paginationOptions: PaginationOptions = {}
    ): Promise<PaginatedResponse<T>> => {
        try {
            // Dodajemy parametry paginacji do queryParams
            const paramsWithPagination = {
                ...queryParams,
                page: paginationOptions.page !== undefined ? paginationOptions.page : 0,
                size: paginationOptions.size !== undefined ? paginationOptions.size : 10
            };

            const queryString = prepareQueryParams(paramsWithPagination);
            const url = `${endpoint}${queryString}`;

            const response = await apiFetch<any>(url);

            // Przetwarzamy odpowiedź z paginacją
            let data: T[] = [];
            let pagination = {
                currentPage: paramsWithPagination.page,
                pageSize: paramsWithPagination.size,
                totalItems: 0,
                totalPages: 0
            };

            // Obsługa różnych formatów odpowiedzi z paginacją
            if (Array.isArray(response)) {
                // Prosta tablica bez metadanych paginacji
                data = convertSnakeToCamel(response) as T[];
                pagination.totalItems = data.length;
                pagination.totalPages = 1;
            } else if (response.pagination) {
                // Format z obiektem pagination
                data = convertSnakeToCamel(response.data || []) as T[];
                pagination = convertSnakeToCamel(response.pagination);
            } else if (response.data && Array.isArray(response.data)) {
                // Format z polami paginacji bezpośrednio w głównym obiekcie
                data = convertSnakeToCamel(response.data) as T[];
                pagination = {
                    currentPage: response.page || 0,
                    pageSize: response.size || 10,
                    totalItems: response.total_items || 0,
                    totalPages: response.total_pages || 0
                };
            }

            return {
                data,
                pagination
            };
        } catch (error) {
            return handleApiError(error, `GET with pagination ${endpoint}`);
        }
    },

    downloadFile: async (url: string, filename: string): Promise<void> => {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Accept': '*/*'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            throw error;
        }
    },

    // Metoda do wysyłania danych do API (POST)
    post: async <T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> => {
        try {
            // Sprawdzamy, czy wysyłamy FormData
            const isFormData = data instanceof FormData;

            // Jeśli nie jest to FormData, konwertujemy na JSON string
            const body = isFormData ? data : JSON.stringify(convertCamelToSnake(data));

            const response = await apiFetch<any>(endpoint, {
                method: 'POST',
                body,
                ...options
            });

            return convertSnakeToCamel(response) as T;
        } catch (error) {
            return handleApiError(error, `POST ${endpoint}`);
        }
    },

    postNot: async <T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> => {
        try {
            // Sprawdzamy, czy wysyłamy FormData
            const isFormData = data instanceof FormData;

            // Jeśli nie jest to FormData, konwertujemy na JSON string
            const body = isFormData ? data : JSON.stringify(data);

            const response = await apiFetch<any>(endpoint, {
                method: 'POST',
                body,
                ...options
            });

            return convertSnakeToCamel(response) as T;
        } catch (error) {
            return handleApiError(error, `POST ${endpoint}`);
        }
    },

    postNotCamel: async <T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> => {
        try {
            // Sprawdzamy, czy wysyłamy FormData
            const isFormData = data instanceof FormData;

            // Jeśli nie jest to FormData, konwertujemy na JSON string
            const body = isFormData ? data : JSON.stringify(data);

            const response = await apiFetch<any>(endpoint, {
                method: 'POST',
                body,
                ...options
            });

            return response as T;
        } catch (error) {
            return handleApiError(error, `POST ${endpoint}`);
        }
    },

    // Metoda do częściowej aktualizacji danych (PATCH)
    patch: async <T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> => {
        try {
            // Sprawdzamy, czy wysyłamy FormData
            const isFormData = data instanceof FormData;

            // Jeśli nie jest to FormData, konwertujemy na JSON string
            const body = isFormData ? data : JSON.stringify(convertCamelToSnake(data));

            const response = await apiFetch<any>(endpoint, {
                method: 'PATCH',
                body,
                ...options
            });

            return convertSnakeToCamel(response) as T;
        } catch (error) {
            return handleApiError(error, `PATCH ${endpoint}`);
        }
    },

    // Metoda do pełnej aktualizacji danych (PUT)
    put: async <T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> => {
        try {
            // Sprawdzamy, czy wysyłamy FormData
            const isFormData = data instanceof FormData;

            // Jeśli nie jest to FormData, konwertujemy na JSON string
            const body = isFormData ? data : JSON.stringify(convertCamelToSnake(data));

            const response = await apiFetch<any>(endpoint, {
                method: 'PUT',
                body,
                ...options
            });

            return convertSnakeToCamel(response) as T;
        } catch (error) {
            return handleApiError(error, `PUT ${endpoint}`);
        }
    },

    // Metoda do pełnej aktualizacji danych (PUT)
    putNot: async <T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> => {
        try {
            // Sprawdzamy, czy wysyłamy FormData
            const isFormData = data instanceof FormData;

            // Jeśli nie jest to FormData, konwertujemy na JSON string
            const body = isFormData ? data : JSON.stringify(data);

            const response = await apiFetch<any>(endpoint, {
                method: 'PUT',
                body,
                ...options
            });

            return convertSnakeToCamel(response) as T;
        } catch (error) {
            return handleApiError(error, `PUT ${endpoint}`);
        }
    },

    // Metoda do usuwania danych (DELETE)
    delete: async <T = void>(endpoint: string, options: RequestInit = {}): Promise<T> => {
        try {
            const response = await apiFetch<any>(endpoint, {
                method: 'DELETE',
                ...options
            });

            return convertSnakeToCamel(response) as T;
        } catch (error) {
            return handleApiError(error, `DELETE ${endpoint}`);
        }
    },

    // Metoda pomocnicza do tworzenia FormData z obiektem JSON
    createFormDataWithJson: (jsonData: any, jsonFieldName: string = 'data', files?: Record<string, File | File[]>): FormData => {
        const formData = new FormData();

        // Zamiast dodawać jako Blob, dodaj jako zwykły string
        const jsonString = JSON.stringify(convertCamelToSnake(jsonData));
        formData.append(jsonFieldName, jsonString);

        // Dodajemy pliki, jeśli zostały podane
        if (files) {
            Object.entries(files).forEach(([fieldName, fileOrFiles]) => {
                if (Array.isArray(fileOrFiles)) {
                    fileOrFiles.forEach((file, index) => {
                        formData.append(`${fieldName}[${index}]`, file);
                    });
                } else {
                    formData.append(fieldName, fileOrFiles);
                }
            });
        }

        return formData;
    }
};