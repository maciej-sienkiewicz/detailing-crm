// src/api/clientsApi.ts - Naprawione parsowanie odpowiedzi API
/**
 * Production-ready Clients API
 * Handles all client-related operations with proper typing and error handling
 * Uses apiClientNew for consistent API communication
 */

import {
    apiClientNew,
    PaginatedApiResponse,
    PaginationParams,
    ApiError,
    RequestConfig
} from './apiClientNew';
import { ClientExpanded, ClientStatistics, ContactAttempt } from '../types';

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

/**
 * Raw client data from API (before enrichment)
 */
interface RawClientData {
    id: string | number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    company?: string;
    taxId?: string;
    notes?: string;
    totalVisits?: number;
    totalTransactions?: number;
    abandonedSales?: number;
    totalRevenue?: number;
    contactAttempts?: number;
    lastVisitDate?: string;
    vehicles?: string[];
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Paginated response from backend
 */
interface BackendPaginatedResponse {
    data: RawClientData[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
}

/**
 * Client data for creation/update operations (excluding statistics)
 */
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

/**
 * Client search and filter parameters
 */
export interface ClientSearchParams extends PaginationParams {
    query?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    company?: string;
    taxId?: string;
    hasVehicles?: boolean;
    minTotalRevenue?: number;
    maxTotalRevenue?: number;
    minVisits?: number;
    maxVisits?: number;
    lastVisitFrom?: string;
    lastVisitTo?: string;
    sortBy?: 'name' | 'email' | 'totalRevenue' | 'totalVisits' | 'lastVisit' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

/**
 * API operation result
 */
export interface ClientApiResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
}

// ========================================================================================
// CLIENTS API CLASS
// ========================================================================================

/**
 * Production-ready Clients API with comprehensive error handling
 */
class ClientsApi {
    private readonly baseEndpoint = '/clients';
    private readonly isDevelopment = process.env.NODE_ENV === 'development';

    // ========================================================================================
    // CORE CRUD OPERATIONS
    // ========================================================================================

    /**
     * Fetches paginated list of clients with optional filtering
     * NAPRAWIONE: Używa nowego endpointu z paginacją
     */
    async getClients(params: ClientSearchParams = {}): Promise<ClientApiResult<PaginatedApiResponse<ClientExpanded>>> {
        try {
            this.logDebug('Fetching clients with params:', params);

            const { page = 0, size = 20, ...filterParams } = params;
            const queryParams = this.buildQueryParams(filterParams);

            // NAPRAWIONE: Używamy nowego endpointu /clients/paginated z typowaniem
            const response = await apiClientNew.get<BackendPaginatedResponse | RawClientData[]>(
                `${this.baseEndpoint}/paginated`,
                { ...queryParams, page, size },
                { timeout: 15000 }
            );

            this.logDebug('Raw API response:', response);

            // NAPRAWIONE: Sprawdzamy format odpowiedzi z nowego endpointu z typowaniem
            let processedClients: ClientExpanded[] = [];
            let pagination = {
                currentPage: page,
                pageSize: size,
                totalItems: 0,
                totalPages: 0,
                hasNext: false,
                hasPrevious: false
            };

            // Nowy endpoint powinien zwracać PaginatedResponse<ClientExpandedResponse>
            if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
                console.log('🎯 Using paginated endpoint response');
                const paginatedResponse = response as BackendPaginatedResponse;
                processedClients = paginatedResponse.data.map((client: RawClientData) => this.enrichClientData(client));

                pagination = {
                    currentPage: paginatedResponse.page || page,
                    pageSize: paginatedResponse.size || size,
                    totalItems: paginatedResponse.totalItems || 0,
                    totalPages: paginatedResponse.totalPages || 0,
                    hasNext: (paginatedResponse.page || page) < (paginatedResponse.totalPages || 1) - 1,
                    hasPrevious: (paginatedResponse.page || page) > 0
                };
            } else if (Array.isArray(response)) {
                // Fallback: serwer zwrócił bezpośrednio tablicę klientów (stary endpoint)
                console.log('🔄 Fallback: Server returned array directly, processing...');
                const arrayResponse = response as RawClientData[];
                processedClients = arrayResponse.map((client: RawClientData) => this.enrichClientData(client));

                // Symulujemy paginację po stronie klienta
                const startIndex = page * size;
                const endIndex = startIndex + size;
                const paginatedData = processedClients.slice(startIndex, endIndex);

                pagination = {
                    currentPage: page,
                    pageSize: size,
                    totalItems: processedClients.length,
                    totalPages: Math.ceil(processedClients.length / size),
                    hasNext: endIndex < processedClients.length,
                    hasPrevious: page > 0
                };

                processedClients = paginatedData;
            } else {
                console.warn('⚠️ Unexpected response format:', response);
                processedClients = [];
            }

            const result: ClientApiResult<PaginatedApiResponse<ClientExpanded>> = {
                success: true,
                data: {
                    data: processedClients,
                    pagination,
                    success: true
                }
            };

            this.logDebug('Successfully processed clients:', {
                count: processedClients.length,
                totalItems: pagination.totalItems,
                currentPage: pagination.currentPage
            });

            return result;

        } catch (error) {
            console.error('[clientsApi] Error fetching clients:', error);

            // NAPRAWIONE: Fallback do starego endpointu w przypadku błędu
            if (error instanceof Error && error.message.includes('404')) {
                console.log('🔄 Paginated endpoint not available, falling back to legacy endpoint...');
                return this.getLegacyClients(params);
            }

            return this.handleApiError(error, 'pobierania listy klientów');
        }
    }

    /**
     * Fallback method for legacy endpoint without pagination
     */
    private async getLegacyClients(params: ClientSearchParams = {}): Promise<ClientApiResult<PaginatedApiResponse<ClientExpanded>>> {
        try {
            this.logDebug('Using legacy clients endpoint...');

            const { page = 0, size = 20 } = params;

            // Używamy starego endpointu /clients (bez paginacji)
            const response = await apiClientNew.get<RawClientData[]>(
                this.baseEndpoint,
                {},
                { timeout: 15000 }
            );

            this.logDebug('Legacy API response:', response);

            let processedClients: ClientExpanded[] = [];

            if (Array.isArray(response)) {
                processedClients = response.map((client: RawClientData) => this.enrichClientData(client));

                // Symulujemy paginację po stronie klienta
                const startIndex = page * size;
                const endIndex = startIndex + size;
                const paginatedData = processedClients.slice(startIndex, endIndex);

                const pagination = {
                    currentPage: page,
                    pageSize: size,
                    totalItems: processedClients.length,
                    totalPages: Math.ceil(processedClients.length / size),
                    hasNext: endIndex < processedClients.length,
                    hasPrevious: page > 0
                };

                const result: ClientApiResult<PaginatedApiResponse<ClientExpanded>> = {
                    success: true,
                    data: {
                        data: paginatedData,
                        pagination,
                        success: true
                    }
                };

                this.logDebug('Successfully processed legacy clients:', {
                    count: paginatedData.length,
                    totalItems: pagination.totalItems,
                    currentPage: pagination.currentPage
                });

                return result;
            } else {
                console.warn('⚠️ Legacy endpoint returned unexpected format:', response);
                return {
                    success: false,
                    error: 'Nieoczekiwany format odpowiedzi z serwera'
                };
            }

        } catch (error) {
            console.error('[clientsApi] Error with legacy endpoint:', error);
            return this.handleApiError(error, 'pobierania listy klientów (legacy)');
        }
    }

    /**
     * Fetches a single client by ID with full details
     */
    async getClientById(id: number | string): Promise<ClientApiResult<ClientExpanded>> {
        try {
            this.logDebug('Fetching client by ID:', id);

            if (!id) {
                return {
                    success: false,
                    error: 'ID klienta jest wymagane'
                };
            }

            const response = await apiClientNew.get<any>(
                `${this.baseEndpoint}/${id}`,
                undefined,
                { timeout: 10000 }
            );

            const enrichedClient = this.enrichClientData(response);

            return {
                success: true,
                data: enrichedClient
            };

        } catch (error) {
            console.error(`[clientsApi] Error fetching client ${id}:`, error);
            return this.handleApiError(error, 'pobierania danych klienta');
        }
    }

    /**
     * Creates a new client
     */
    async createClient(clientData: ClientData): Promise<ClientApiResult<ClientExpanded>> {
        try {
            this.logDebug('Creating new client:', { email: clientData.email });

            const response = await apiClientNew.post<any>(
                this.baseEndpoint,
                clientData,
                { timeout: 12000 }
            );

            const enrichedClient = this.enrichClientData(response);

            this.logDebug('Successfully created client:', enrichedClient.id);

            return {
                success: true,
                data: enrichedClient
            };

        } catch (error) {
            console.error('[clientsApi] Error creating client:', error);
            return this.handleApiError(error, 'tworzenia klienta');
        }
    }

    /**
     * Updates an existing client
     */
    async updateClient(id: string, clientData: ClientData): Promise<ClientApiResult<ClientExpanded>> {
        try {
            this.logDebug('Updating client:', id);

            if (!id) {
                return {
                    success: false,
                    error: 'ID klienta jest wymagane'
                };
            }

            const response = await apiClientNew.put<any>(
                `${this.baseEndpoint}/${id}`,
                clientData,
                { timeout: 12000 }
            );

            const enrichedClient = this.enrichClientData(response);

            this.logDebug('Successfully updated client:', id);

            return {
                success: true,
                data: enrichedClient
            };

        } catch (error) {
            console.error(`[clientsApi] Error updating client ${id}:`, error);
            return this.handleApiError(error, 'aktualizacji klienta');
        }
    }

    /**
     * Deletes a client
     */
    async deleteClient(id: string): Promise<ClientApiResult<boolean>> {
        try {
            this.logDebug('Deleting client:', id);

            if (!id) {
                return {
                    success: false,
                    error: 'ID klienta jest wymagane'
                };
            }

            await apiClientNew.delete<void>(
                `${this.baseEndpoint}/${id}`,
                { timeout: 10000 }
            );

            this.logDebug('Successfully deleted client:', id);

            return {
                success: true,
                data: true
            };

        } catch (error) {
            console.error(`[clientsApi] Error deleting client ${id}:`, error);
            return this.handleApiError(error, 'usuwania klienta');
        }
    }

    // ========================================================================================
    // SPECIALIZED OPERATIONS
    // ========================================================================================

    /**
     * Searches clients by query string
     */
    async searchClients(query: string, limit: number = 20): Promise<ClientApiResult<ClientExpanded[]>> {
        try {
            this.logDebug('Searching clients:', { query, limit });

            if (!query?.trim()) {
                return {
                    success: false,
                    error: 'Zapytanie wyszukiwania nie może być puste'
                };
            }

            const response = await apiClientNew.get<RawClientData[]>(
                `${this.baseEndpoint}/search`,
                { query: query.trim(), limit },
                { timeout: 12000 }
            );

            const processedClients = Array.isArray(response)
                ? response.map((client: RawClientData) => this.enrichClientData(client))
                : [];

            this.logDebug('Search completed:', { query, resultCount: processedClients.length });

            return {
                success: true,
                data: processedClients
            };

        } catch (error) {
            console.error('[clientsApi] Error searching clients:', error);
            return this.handleApiError(error, 'wyszukiwania klientów');
        }
    }

    /**
     * Gets client statistics by ID
     */
    async getClientStatistics(id: number | string): Promise<ClientApiResult<ClientStatistics>> {
        try {
            this.logDebug('Fetching client statistics:', id);

            if (!id) {
                return {
                    success: false,
                    error: 'ID klienta jest wymagane'
                };
            }

            const response = await apiClientNew.get<ClientStatistics>(
                `${this.baseEndpoint}/${id}/statistics`,
                undefined,
                { timeout: 10000 }
            );

            // Ensure all required fields exist
            const statistics: ClientStatistics = {
                totalVisits: response.totalVisits || 0,
                totalRevenue: response.totalRevenue || 0,
                vehicleNo: response.vehicleNo || 0
            };

            this.logDebug('Successfully fetched client statistics');

            return {
                success: true,
                data: statistics
            };

        } catch (error) {
            console.error(`[clientsApi] Error fetching client stats ${id}:`, error);
            return this.handleApiError(error, 'pobierania statystyk klienta');
        }
    }

    // ========================================================================================
    // CONTACT ATTEMPTS
    // ========================================================================================

    /**
     * Creates a new contact attempt
     */
    async createContactAttempt(contactAttempt: ContactAttempt): Promise<ClientApiResult<ContactAttempt>> {
        try {
            this.logDebug('Creating contact attempt for client:', contactAttempt.clientId);

            const response = await apiClientNew.post<ContactAttempt>(
                '/clients/contact-attempts',
                contactAttempt,
                { timeout: 10000 }
            );

            this.logDebug('Successfully created contact attempt');

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('[clientsApi] Error creating contact attempt:', error);
            return this.handleApiError(error, 'tworzenia próby kontaktu');
        }
    }

    /**
     * Gets contact attempts for a client
     */
    async getContactAttemptsByClientId(clientId: string): Promise<ClientApiResult<ContactAttempt[]>> {
        try {
            this.logDebug('Fetching contact attempts for client:', clientId);

            if (!clientId) {
                return {
                    success: false,
                    error: 'ID klienta jest wymagane'
                };
            }

            const response = await apiClientNew.get<ContactAttempt[]>(
                `${this.baseEndpoint}/${clientId}/contact-attempts`,
                undefined,
                { timeout: 10000 }
            );

            this.logDebug('Successfully fetched contact attempts:', Array.isArray(response) ? response.length : 0);

            return {
                success: true,
                data: Array.isArray(response) ? response : []
            };

        } catch (error) {
            console.error(`[clientsApi] Error fetching contact attempts for ${clientId}:`, error);
            return this.handleApiError(error, 'pobierania prób kontaktu');
        }
    }

    // ========================================================================================
    // CONVENIENCE METHODS (for backward compatibility)
    // ========================================================================================

    /**
     * Legacy method for backward compatibility
     * @deprecated Use getClients() instead
     */
    async fetchClients(): Promise<ClientExpanded[]> {
        const result = await this.getClients({ size: 1000 });
        return result.data?.data || [];
    }

    /**
     * Legacy method for backward compatibility
     * @deprecated Use getClientById() instead
     */
    async fetchClientById(id: number | string): Promise<ClientExpanded | null> {
        const result = await this.getClientById(id);
        return result.data || null;
    }

    /**
     * Legacy method for backward compatibility
     * @deprecated Use getClientStatistics() instead
     */
    async fetchClientStatsById(id: number | string): Promise<ClientStatistics | null> {
        const result = await this.getClientStatistics(id);
        return result.data || null;
    }

    /**
     * Legacy method for backward compatibility
     * @deprecated Use getContactAttemptsByClientId() instead
     */
    async fetchContactAttemptsByClientById(id: string): Promise<ContactAttempt[]> {
        const result = await this.getContactAttemptsByClientId(id);
        return result.data || [];
    }

    // ========================================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================================

    /**
     * Enriches raw client data from API with proper field mapping
     * NAPRAWIONE: Lepsze obsługiwanie różnych formatów pól z typowaniem
     */
    private enrichClientData(clientData: RawClientData): ClientExpanded {
        if (!clientData) {
            throw new Error('Client data is required');
        }

        console.log('🔄 Enriching client data:', clientData);

        // Extract data with proper field mapping for API response format
        const id = clientData.id?.toString() || '';
        const firstName = clientData.firstName || '';
        const lastName = clientData.lastName || '';
        const fullName = (firstName && lastName ? `${firstName} ${lastName}`.trim() : '');
        const email = clientData.email || '';
        const phone = clientData.phone || '';
        const company = clientData.company || undefined;
        const taxId = clientData.taxId || undefined;

        // Build enriched client object
        const enrichedClient: ClientExpanded = {
            id,
            firstName,
            lastName,
            fullName,
            email,
            phone,
            address: clientData.address || undefined,
            company,
            taxId,
            notes: clientData.notes || undefined,

            // Statistical fields with defaults - NAPRAWIONE: obsługa null/undefined
            totalVisits: clientData.totalVisits || 0,
            totalTransactions: clientData.totalTransactions || 0,
            abandonedSales: clientData.abandonedSales || 0,
            totalRevenue: clientData.totalRevenue || 0,
            contactAttempts: clientData.contactAttempts || 0,
            lastVisitDate: clientData.lastVisitDate || undefined,
            vehicles: Array.isArray(clientData.vehicles) ? clientData.vehicles : [],

            // Metadata fields
            createdAt: clientData.createdAt || undefined,
            updatedAt: clientData.updatedAt || undefined
        };

        console.log('✅ Enriched client:', enrichedClient);
        return enrichedClient;
    }

    /**
     * Builds query parameters for API requests
     */
    private buildQueryParams(params: Record<string, any>): Record<string, any> {
        const queryParams: Record<string, any> = {};

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams[key] = value;
            }
        });

        return queryParams;
    }

    /**
     * Handles API errors consistently with Polish messages
     */
    private handleApiError(error: unknown, operation: string): ClientApiResult {
        if (ApiError.isApiError(error)) {
            switch (error.status) {
                case 400:
                    return {
                        success: false,
                        error: error.data?.message || 'Nieprawidłowe dane wejściowe.',
                        details: error
                    };
                case 401:
                    return {
                        success: false,
                        error: 'Sesja wygasła. Zaloguj się ponownie.',
                        details: error
                    };
                case 403:
                    return {
                        success: false,
                        error: 'Brak uprawnień do tej operacji.',
                        details: error
                    };
                case 404:
                    return {
                        success: false,
                        error: 'Nie znaleziono klienta.',
                        details: error
                    };
                case 409:
                    return {
                        success: false,
                        error: 'Klient o podanych danych już istnieje.',
                        details: error
                    };
                case 422:
                    return {
                        success: false,
                        error: error.data?.message || 'Nieprawidłowe dane klienta.',
                        details: error
                    };
                case 429:
                    return {
                        success: false,
                        error: 'Zbyt wiele żądań. Spróbuj ponownie za chwilę.',
                        details: error
                    };
                case 500:
                    return {
                        success: false,
                        error: 'Błąd serwera. Spróbuj ponownie później.',
                        details: error
                    };
                case 503:
                    return {
                        success: false,
                        error: 'Serwis tymczasowo niedostępny.',
                        details: error
                    };
                default:
                    return {
                        success: false,
                        error: error.data?.message || error.message || `Błąd podczas ${operation}.`,
                        details: error
                    };
            }
        }

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Żądanie zostało anulowane (przekroczono limit czasu).',
                    details: error
                };
            }
            if (error.message.includes('network') || error.message.includes('fetch')) {
                return {
                    success: false,
                    error: 'Błąd połączenia z serwerem.',
                    details: error
                };
            }
            return {
                success: false,
                error: error.message,
                details: error
            };
        }

        return {
            success: false,
            error: `Wystąpił nieoczekiwany błąd podczas ${operation}.`,
            details: error
        };
    }

    /**
     * Logs debug information (only in development)
     */
    private logDebug(message: string, data?: any): void {
        if (this.isDevelopment) {
            console.log(`[clientsApi] ${message}`, data || '');
        }
    }
}

// ========================================================================================
// EXPORTS
// ========================================================================================

// Export singleton instance
export const clientsApi = new ClientsApi();

// Legacy export for backward compatibility
export const clientApi = clientsApi;

// Export class for testing
export { ClientsApi };

// Default export
export default clientsApi;