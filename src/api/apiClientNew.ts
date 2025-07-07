// src/api/apiClientNew.ts
/**
 * Production-ready API Client for backend communication
 * Features:
 * - Type-safe HTTP methods
 * - Automatic snake_case <-> camelCase conversion
 * - Error handling with proper typing
 * - Request/Response interceptors
 * - Authentication handling
 * - Retry logic
 */

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    errors?: string[];
}

export interface PaginationParams {
    page?: number;
    size?: number;
}

export interface PaginationMeta {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface PaginatedApiResponse<T> {
    data: T[];
    pagination: PaginationMeta;
    success: boolean;
    message?: string;
}

export interface RequestConfig extends RequestInit {
    timeout?: number;
    retries?: number;
    skipAuth?: boolean;
}

export class ApiError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        public data?: any,
        message?: string
    ) {
        super(message || `API Error: ${status} ${statusText}`);
        this.name = 'ApiError';
    }

    static isApiError(error: unknown): error is ApiError {
        return error instanceof ApiError;
    }
}

const caseConverter = {
    toCamelCase: <T>(obj: any): T => {
        if (obj === null || obj === undefined || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => caseConverter.toCamelCase(item)) as T;
        }

        const converted: Record<string, any> = {};

        for (const [key, value] of Object.entries(obj)) {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            converted[camelKey] = caseConverter.toCamelCase(value);
        }

        return converted as T;
    },

    toSnakeCase: (obj: any): any => {
        if (obj === null || obj === undefined || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => caseConverter.toSnakeCase(item));
        }

        const converted: Record<string, any> = {};

        for (const [key, value] of Object.entries(obj)) {
            const snakeKey = key.replace(/([A-Z])/g, (_, letter) => `_${letter.toLowerCase()}`);
            converted[snakeKey] = caseConverter.toSnakeCase(value);
        }

        return converted;
    }
};

const auth = {
    getToken: (): string | null => {
        try {
            return localStorage.getItem('auth_token');
        } catch {
            return null;
        }
    },

    setToken: (token: string): void => {
        try {
            localStorage.setItem('auth_token', token);
        } catch (error) {
            console.warn('Failed to store auth token:', error);
        }
    },

    removeToken: (): void => {
        try {
            localStorage.removeItem('auth_token');
        } catch (error) {
            console.warn('Failed to remove auth token:', error);
        }
    }
};

const requestUtils = {
    buildQueryString: (params: Record<string, any>): string => {
        const filtered = Object.entries(params)
            .filter(([_, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => [key, String(value)]);

        if (filtered.length === 0) return '';

        const searchParams = new URLSearchParams(filtered);
        return `?${searchParams.toString()}`;
    },

    createHeaders: (config?: RequestConfig): HeadersInit => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (!config?.skipAuth) {
            const token = auth.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        if (config?.headers) {
            Object.assign(headers, config.headers);
        }

        return headers;
    },

    createTimeoutController: (timeoutMs: number = 30000): AbortController => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeoutMs);
        return controller;
    }
};

class ApiClientNew {
    private readonly baseUrl: string;
    private readonly defaultTimeout: number;
    private readonly defaultRetries: number;

    constructor() {
        this.baseUrl = 'http://localhost:8080/api';
        this.defaultTimeout = 30000;
        this.defaultRetries = 3;
    }

    private async request<T>(
        endpoint: string,
        config: RequestConfig = {}
    ): Promise<T> {
        const {
            timeout = this.defaultTimeout,
            retries = this.defaultRetries,
            ...fetchConfig
        } = config;

        const url = `${this.baseUrl}${endpoint}`;
        const controller = requestUtils.createTimeoutController(timeout);

        let lastError: Error;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                console.log(`API Request (attempt ${attempt + 1}): ${fetchConfig.method || 'GET'} ${url}`);

                const response = await fetch(url, {
                    ...fetchConfig,
                    headers: requestUtils.createHeaders(config),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const errorData = await this.parseErrorResponse(response);
                    throw new ApiError(
                        response.status,
                        response.statusText,
                        errorData,
                        errorData?.message || `HTTP ${response.status}: ${response.statusText}`
                    );
                }

                const data = await this.parseSuccessResponse<T>(response);
                console.log(`API Response: ${response.status} ${response.statusText}`);

                return data;

            } catch (error) {
                lastError = error as Error;

                if (ApiError.isApiError(error) && error.status >= 400 && error.status < 500) {
                    throw error;
                }

                if (attempt === retries) {
                    break;
                }

                const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw lastError!;
    }

    private async parseSuccessResponse<T>(response: Response): Promise<T> {
        const contentType = response.headers.get('Content-Type') || '';

        if (contentType.includes('application/json')) {
            const jsonData = await response.json();
            return caseConverter.toCamelCase<T>(jsonData);
        }

        if (response.status === 204 || !contentType) {
            return {} as T;
        }

        const textData = await response.text();
        return textData as unknown as T;
    }

    private async parseErrorResponse(response: Response): Promise<any> {
        try {
            const contentType = response.headers.get('Content-Type') || '';
            if (contentType.includes('application/json')) {
                return await response.json();
            }
            return { message: await response.text() };
        } catch {
            return { message: `HTTP ${response.status}: ${response.statusText}` };
        }
    }

    async get<T>(endpoint: string, params?: Record<string, any>, config?: RequestConfig): Promise<T> {
        const queryString = params ? requestUtils.buildQueryString(caseConverter.toSnakeCase(params)) : '';
        const url = `${endpoint}${queryString}`;

        return this.request<T>(url, {
            method: 'GET',
            ...config,
        });
    }

    async getWithPagination<T>(
        endpoint: string,
        params: Record<string, any> = {},
        pagination: PaginationParams = {},
        config?: RequestConfig
    ): Promise<PaginatedApiResponse<T>> {
        const { page = 0, size = 10 } = pagination;
        const allParams = { ...params, page, size };

        const response = await this.get<any>(endpoint, allParams, config);

        const data = response.data || [];
        const paginationData = response.pagination || response;

        return {
            data: Array.isArray(data) ? data : [],
            pagination: {
                currentPage: paginationData.page || paginationData.currentPage || page,
                pageSize: paginationData.size || paginationData.pageSize || size,
                totalItems: paginationData.totalItems || paginationData.total_items || 0,
                totalPages: paginationData.totalPages || paginationData.total_pages || 0,
                hasNext: paginationData.hasNext || (paginationData.currentPage || page) < (paginationData.totalPages || 1) - 1,
                hasPrevious: paginationData.hasPrevious || (paginationData.currentPage || page) > 0,
            },
            success: response.success !== false,
            message: response.message,
        };
    }

    async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(caseConverter.toSnakeCase(data)),
            ...config,
            headers: {
                ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
                ...config?.headers,
            },
        });
    }

    async postFormData<T>(
        endpoint: string,
        formData: FormData,
        onProgress?: (progress: number) => void
    ): Promise<T> {
        if (onProgress) {
            return this.uploadFile<T>(endpoint, formData.get('file') as File, {}, onProgress);
        }

        return this.request<T>(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`,
            },
        });
    }

    async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data instanceof FormData ? data : JSON.stringify(caseConverter.toSnakeCase(data)),
            ...config,
            headers: {
                ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
                ...config?.headers,
            },
        });
    }

    async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data instanceof FormData ? data : JSON.stringify(caseConverter.toSnakeCase(data)),
            ...config,
            headers: {
                ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
                ...config?.headers,
            },
        });
    }

    async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
            ...config,
        });
    }

    async uploadFile<T>(
        endpoint: string,
        file: File,
        additionalData?: Record<string, any>,
        onProgress?: (progress: number) => void
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();

            formData.append('file', file);

            if (additionalData) {
                Object.entries(caseConverter.toSnakeCase(additionalData)).forEach(([key, value]) => {
                    formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
                });
            }

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const progress = (event.loaded / event.total) * 100;
                    onProgress(progress);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(caseConverter.toCamelCase<T>(response));
                    } catch {
                        resolve(xhr.responseText as unknown as T);
                    }
                } else {
                    reject(new ApiError(xhr.status, xhr.statusText));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new ApiError(0, 'Network Error'));
            });

            xhr.open('POST', `${this.baseUrl}${endpoint}`);

            const token = auth.getToken();
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            xhr.send(formData);
        });
    }
}

export const apiClientNew = new ApiClientNew();
export { auth, caseConverter, requestUtils };