// src/api/clientsApi.ts - NAPRAWIONE WERSJA
import {apiClientNew, ApiError, PaginatedApiResponse, PaginationParams} from './apiClientNew';
import {ClientExpanded, ClientStatistics, ContactAttempt} from '../types';

// Interfejs odpowiadający strukturze z serwera - ClientWithStatisticsResponse
interface BackendClientWithStatistics {
    client: {
        id: string;
        first_name: string;
        last_name: string;
        full_name: string;
        email: string;
        phone: string;
        address?: string;
        company?: string;
        tax_id?: string;
        notes?: string;
        created_at: string;
        updated_at: string;
    };
    statistics?: {
        visit_count: number;
        total_revenue: number;
        vehicle_count: number;
        last_visit_date?: string;
    };
}

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

interface BackendPaginatedResponse {
    data: RawClientData[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
}

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

export interface ClientSearchParams extends PaginationParams {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    // NAPRAWIONE: Zmienione z hasVehicles na minVehicles
    minVehicles?: number;
    minTotalRevenue?: number;
    maxTotalRevenue?: number;
    minVisits?: number;
    maxVisits?: number;
    sortBy?: 'id' | 'name' | 'email' | 'totalRevenue' | 'totalVisits' | 'lastVisit' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    query?: string;
    firstName?: string;
    lastName?: string;
    taxId?: string;
    lastVisitFrom?: string;
    lastVisitTo?: string;
}

export interface ClientApiResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
}

class ClientsApi {
    private readonly baseEndpoint = '/clients';

    async getClients(params: ClientSearchParams = {}): Promise<ClientApiResult<PaginatedApiResponse<ClientExpanded>>> {
        try {
            const { page = 0, size = 25, ...filterParams } = params;
            const queryParams = this.buildQueryParams(filterParams);

            const response = await apiClientNew.get<BackendPaginatedResponse | RawClientData[]>(
                `${this.baseEndpoint}/paginated`,
                { ...queryParams, page, size },
                { timeout: 15000 }
            );

            let processedClients: ClientExpanded[] = [];
            let pagination = {
                currentPage: page,
                pageSize: size,
                totalItems: 0,
                totalPages: 0,
                hasNext: false,
                hasPrevious: false
            };

            if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
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
                const arrayResponse = response as RawClientData[];
                processedClients = arrayResponse.map((client: RawClientData) => this.enrichClientData(client));

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
                processedClients = [];
            }

            return {
                success: true,
                data: {
                    data: processedClients,
                    pagination,
                    success: true
                }
            };

        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                return this.getLegacyClients(params);
            }

            return this.handleApiError(error, 'pobierania listy klientów');
        }
    }

    private async getLegacyClients(params: ClientSearchParams = {}): Promise<ClientApiResult<PaginatedApiResponse<ClientExpanded>>> {
        try {
            const { page = 0, size = 25 } = params;

            const response = await apiClientNew.get<RawClientData[]>(
                this.baseEndpoint,
                {},
                { timeout: 15000 }
            );

            let processedClients: ClientExpanded[] = [];

            if (Array.isArray(response)) {
                processedClients = response.map((client: RawClientData) => this.enrichClientData(client));
                processedClients = this.applyClientSideFiltering(processedClients, params);

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

                return {
                    success: true,
                    data: {
                        data: paginatedData,
                        pagination,
                        success: true
                    }
                };
            } else {
                return {
                    success: false,
                    error: 'Nieoczekiwany format odpowiedzi z serwera'
                };
            }

        } catch (error) {
            return this.handleApiError(error, 'pobierania listy klientów (legacy)');
        }
    }

    private applyClientSideFiltering(clients: ClientExpanded[], params: ClientSearchParams): ClientExpanded[] {
        let result = [...clients];

        if (params.name) {
            const nameQuery = params.name.toLowerCase();
            result = result.filter(client =>
                `${client.firstName} ${client.lastName}`.toLowerCase().includes(nameQuery)
            );
        }

        if (params.email) {
            const emailQuery = params.email.toLowerCase();
            result = result.filter(client =>
                client.email.toLowerCase().includes(emailQuery)
            );
        }

        if (params.phone) {
            const phoneQuery = params.phone.replace(/\s/g, '').toLowerCase();
            result = result.filter(client =>
                client.phone.replace(/\s/g, '').toLowerCase().includes(phoneQuery)
            );
        }

        if (params.company) {
            const companyQuery = params.company.toLowerCase();
            result = result.filter(client =>
                (client.company || '').toLowerCase().includes(companyQuery)
            );
        }

        // NAPRAWIONE: Filtrowanie po minimalnej liczbie pojazdów
        if (params.minVehicles !== undefined) {
            result = result.filter(client => (client.vehicles?.length || 0) >= params.minVehicles!);
        }

        if (params.minTotalRevenue !== undefined) {
            result = result.filter(client => (client.totalRevenue || 0) >= params.minTotalRevenue!);
        }

        if (params.maxTotalRevenue !== undefined) {
            result = result.filter(client => (client.totalRevenue || 0) <= params.maxTotalRevenue!);
        }

        if (params.minVisits !== undefined) {
            result = result.filter(client => (client.totalVisits || 0) >= params.minVisits!);
        }

        if (params.maxVisits !== undefined) {
            result = result.filter(client => (client.totalVisits || 0) <= params.maxVisits!);
        }

        return result;
    }

    // NAPRAWIONE: getClientById używa prawidłowego endpointa i mapuje odpowiedź
    async getClientById(id: number | string): Promise<ClientApiResult<ClientExpanded>> {
        try {
            if (!id) {
                return {
                    success: false,
                    error: 'ID klienta jest wymagane'
                };
            }

            // Używamy endpointa /api/clients/{id} który zwraca ClientWithStatisticsResponse
            const response = await apiClientNew.get<BackendClientWithStatistics>(
                `${this.baseEndpoint}/${id}`,
                undefined,
                { timeout: 10000 }
            );

            // Mapujemy odpowiedź z serwera na ClientExpanded
            const enrichedClient = this.mapBackendClientToExpanded(response);

            return {
                success: true,
                data: enrichedClient
            };

        } catch (error) {
            return this.handleApiError(error, 'pobierania danych klienta');
        }
    }

    // NOWA FUNKCJA: Mapuje odpowiedź z backendu na ClientExpanded
    private mapBackendClientToExpanded(backendResponse: BackendClientWithStatistics): ClientExpanded {
        const client = backendResponse.client;
        const stats = backendResponse.statistics;

        return {
            id: client.id,
            firstName: client.first_name,
            lastName: client.last_name,
            fullName: client.full_name,
            email: client.email,
            phone: client.phone,
            address: client.address,
            company: client.company,
            taxId: client.tax_id,
            notes: client.notes,

            // Mapujemy statystyki jeśli istnieją
            totalVisits: stats?.visit_count || 0,
            totalTransactions: 0, // Nie ma w API, domyślnie 0
            abandonedSales: 0, // Nie ma w API, domyślnie 0
            totalRevenue: Number(stats?.total_revenue || 0),
            contactAttempts: 0, // Nie ma w API, domyślnie 0
            lastVisitDate: stats?.last_visit_date,
            vehicles: [], // UWAGA: Brak informacji o pojazdach w tym endpoincie

            createdAt: client.created_at,
            updatedAt: client.updated_at
        };
    }

    async createClient(clientData: ClientData): Promise<ClientApiResult<ClientExpanded>> {
        try {
            const response = await apiClientNew.post<any>(
                this.baseEndpoint,
                clientData,
                { timeout: 12000 }
            );

            const enrichedClient = this.enrichClientData(response);

            return {
                success: true,
                data: enrichedClient
            };

        } catch (error) {
            return this.handleApiError(error, 'tworzenia klienta');
        }
    }

    async updateClient(id: string, clientData: ClientData): Promise<ClientApiResult<ClientExpanded>> {
        try {
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

            return {
                success: true,
                data: enrichedClient
            };

        } catch (error) {
            return this.handleApiError(error, 'aktualizacji klienta');
        }
    }

    async deleteClient(id: string): Promise<ClientApiResult<boolean>> {
        try {
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

            return {
                success: true,
                data: true
            };

        } catch (error) {
            return this.handleApiError(error, 'usuwania klienta');
        }
    }

    async searchClients(query: string, limit: number = 20): Promise<ClientApiResult<ClientExpanded[]>> {
        try {
            if (!query?.trim()) {
                return {
                    success: false,
                    error: 'Zapytanie wyszukiwania nie może być puste'
                };
            }

            const searchResult = await this.getClients({
                name: query.trim(),
                size: limit,
                page: 0
            });

            if (searchResult.success && searchResult.data) {
                return {
                    success: true,
                    data: searchResult.data.data
                };
            } else {
                return {
                    success: false,
                    error: searchResult.error || 'Błąd podczas wyszukiwania'
                };
            }

        } catch (error) {
            return this.handleApiError(error, 'wyszukiwania klientów');
        }
    }

    async getClientStatistics(id: number | string): Promise<ClientApiResult<ClientStatistics>> {
        try {
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

            const statistics: ClientStatistics = {
                totalVisits: response.totalVisits || 0,
                totalRevenue: response.totalRevenue || 0,
                vehicleNo: response.vehicleNo || 0
            };

            return {
                success: true,
                data: statistics
            };

        } catch (error) {
            return this.handleApiError(error, 'pobierania statystyk klienta');
        }
    }

    async createContactAttempt(contactAttempt: ContactAttempt): Promise<ClientApiResult<ContactAttempt>> {
        try {
            const response = await apiClientNew.post<ContactAttempt>(
                '/clients/contact-attempts',
                contactAttempt,
                { timeout: 10000 }
            );

            return {
                success: true,
                data: response
            };

        } catch (error) {
            return this.handleApiError(error, 'tworzenia próby kontaktu');
        }
    }

    async getContactAttemptsByClientId(clientId: string): Promise<ClientApiResult<ContactAttempt[]>> {
        try {
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

            return {
                success: true,
                data: Array.isArray(response) ? response : []
            };

        } catch (error) {
            return this.handleApiError(error, 'pobierania prób kontaktu');
        }
    }

    async fetchClients(): Promise<ClientExpanded[]> {
        const result = await this.getClients({ size: 1000 });
        return result.data?.data || [];
    }

    async fetchClientById(id: number | string): Promise<ClientExpanded | null> {
        const result = await this.getClientById(id);
        return result.data || null;
    }

    async fetchClientStatsById(id: number | string): Promise<ClientStatistics | null> {
        const result = await this.getClientStatistics(id);
        return result.data || null;
    }

    async fetchContactAttemptsByClientById(id: string): Promise<ContactAttempt[]> {
        const result = await this.getContactAttemptsByClientId(id);
        return result.data || [];
    }

    private enrichClientData(clientData: RawClientData): ClientExpanded {
        if (!clientData) {
            throw new Error('Client data is required');
        }

        const id = clientData.id?.toString() || '';
        const firstName = clientData.firstName || '';
        const lastName = clientData.lastName || '';
        const fullName = (firstName && lastName ? `${firstName} ${lastName}`.trim() : '');
        const email = clientData.email || '';
        const phone = clientData.phone || '';
        const company = clientData.company || undefined;
        const taxId = clientData.taxId || undefined;

        return {
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
            totalVisits: clientData.totalVisits || 0,
            totalTransactions: clientData.totalTransactions || 0,
            abandonedSales: clientData.abandonedSales || 0,
            totalRevenue: clientData.totalRevenue || 0,
            contactAttempts: clientData.contactAttempts || 0,
            lastVisitDate: clientData.lastVisitDate || undefined,
            vehicles: Array.isArray(clientData.vehicles) ? clientData.vehicles : [],
            createdAt: clientData.createdAt || undefined,
            updatedAt: clientData.updatedAt || undefined
        };
    }

    // NAPRAWIONE: buildQueryParams prawidłowo obsługuje minVehicles
    private buildQueryParams(params: Record<string, any>): Record<string, any> {
        const queryParams: Record<string, any> = {};

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                // NAPRAWIONE: Specjalna obsługa dla minVehicles
                if (key === 'minVehicles' && typeof value === 'number' && value > 0) {
                    queryParams['min_vehicles'] = value;
                } else {
                    queryParams[key] = value;
                }
            }
        });

        return queryParams;
    }

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
}

export const clientsApi = new ClientsApi();
export const clientApi = clientsApi;
export { ClientsApi };
export default clientsApi;