// src/api/vehiclesApi.ts - Naprawione API dla nowych endpointów
import { VehicleExpanded, VehicleOwner, VehicleStatistics } from '../types';
import { apiClient, PaginatedResponse, PaginationOptions } from './apiClient';

// Interfejsy dostosowane do rzeczywistego formatu API
export interface VehicleTableResponse {
    id: number;
    make: string;
    model: string;
    year?: number;
    licensePlate: string;
    color?: string;
    vin?: string;
    mileage?: number;
    owners: VehicleOwnerSummary[];
    visitCount: number;
    lastVisitDate?: number[] | string | null;  // Może być tablicą lub stringiem
    totalRevenue: number;
    createdAt: number[] | string;              // Może być tablicą lub stringiem
    updatedAt: number[] | string;              // Może być tablicą lub stringiem
}

export interface VehicleOwnerSummary {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email?: string;
    phone?: string;
}

// Rzeczywista struktura odpowiedzi paginacji z serwera Spring Boot
export interface SpringPageResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            unsorted: boolean;
            sorted: boolean;
        };
        offset: number;
        unpaged: boolean;
        paged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    sort: {
        empty: boolean;
        unsorted: boolean;
        sorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface VehicleCompanyStatisticsResponse {
    totalVehicles: number;
    premiumVehicles: number;
    visitRevenueMedian: number;
    totalRevenue: number;
    averageRevenuePerVehicle: number;
    mostActiveVehicle?: MostActiveVehicleInfo;
    calculatedAt: string;
}

export interface MostActiveVehicleInfo {
    id: number;
    make: string;
    model: string;
    licensePlate: string;
    visitCount: number;
    totalRevenue: number;
}

// Interfejs dla filtrów tabeli pojazdów
export interface VehicleTableFilters {
    make?: string;
    model?: string;
    licensePlate?: string;
    ownerName?: string;
    minVisits?: number;
    maxVisits?: number;
}

// Interfejs dla historii serwisowej z serwera
export interface ServiceHistoryResponse {
    id: string;
    date: string;
    service_type: string;
    description: string;
    price: number;
    protocol_id?: string;
}

// Interfejs dla danych pojazdu do zapisu
export interface VehicleData {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color?: string;
    vin?: string;
    ownerIds: string[];
}

// Funkcja do konwersji daty z formatu tablicy na string ISO
const convertDateArrayToString = (dateArray: number[] | string | null): string | undefined => {
    if (!dateArray) return undefined;
    if (typeof dateArray === 'string') return dateArray;

    if (Array.isArray(dateArray) && dateArray.length >= 6) {
        // Format: [year, month, day, hour, minute, second, nanosecond]
        // Uwaga: month w Java/Spring jest 1-based, w JavaScript 0-based
        const [year, month, day, hour, minute, second, nanosecond] = dateArray;
        const date = new Date(year, month - 1, day, hour, minute, second, Math.floor(nanosecond / 1000000));
        return date.toISOString();
    }

    return undefined;
};

// Funkcja konwersji VehicleTableResponse na VehicleExpanded
const convertToVehicleExpanded = (tableResponse: VehicleTableResponse): VehicleExpanded => ({
    id: tableResponse.id.toString(),
    make: tableResponse.make,
    model: tableResponse.model,
    year: tableResponse.year || new Date().getFullYear(),
    licensePlate: tableResponse.licensePlate,
    color: tableResponse.color || undefined,
    vin: tableResponse.vin || undefined,
    totalServices: tableResponse.visitCount,
    lastServiceDate: convertDateArrayToString(tableResponse.lastVisitDate),
    totalSpent: tableResponse.totalRevenue,
    ownerIds: tableResponse.owners.map(owner => owner.id.toString()),
    // Dodatkowe pola dla zgodności
    owners: tableResponse.owners,
    createdAt: convertDateArrayToString(tableResponse.createdAt),
    updatedAt: convertDateArrayToString(tableResponse.updatedAt)
});

// Funkcja konwersji VehicleOwnerSummary na VehicleOwner
const convertToVehicleOwner = (ownerSummary: VehicleOwnerSummary): VehicleOwner => ({
    ownerId: ownerSummary.id,
    ownerName: ownerSummary.fullName
});

// Funkcja konwersji SpringPageResponse na PaginatedResponse
const convertSpringPageToPaginatedResponse = <T>(springPage: SpringPageResponse<T>): PaginatedResponse<T> => ({
    data: springPage.content,
    pagination: {
        currentPage: springPage.number,
        pageSize: springPage.size,
        totalItems: springPage.totalElements,
        totalPages: springPage.totalPages
    }
});

export const vehicleApi = {
    // Nowa funkcja do pobierania pojazdów dla tabeli z paginacją i filtrami
    fetchVehiclesForTable: async (
        paginationOptions: PaginationOptions = {},
        filters: VehicleTableFilters = {}
    ): Promise<PaginatedResponse<VehicleExpanded>> => {
        try {
            const queryParams = {
                page: paginationOptions.page || 0,
                size: paginationOptions.size || 20,
                sort: 'lastVisitDate,desc', // Domyślne sortowanie
                ...filters // Spread filtrów
            };

            console.log('Calling /vehicles/table with params:', queryParams);

            // Wywołanie API bezpośrednio bez użycia apiClient.getWithPagination
            // bo mamy inny format odpowiedzi niż oczekiwany przez getWithPagination
            const response = await apiClient.getNot<SpringPageResponse<VehicleTableResponse>>(
                '/vehicles/table',
                queryParams
            );

            console.log('Raw API response:', response);

            // Konwersja danych na format VehicleExpanded
            const convertedData = response.content.map(convertToVehicleExpanded);

            console.log('Converted vehicles:', convertedData);

            // Konwersja na nasz format paginacji
            const paginatedResponse = convertSpringPageToPaginatedResponse({
                ...response,
                content: convertedData
            });

            console.log('Final paginated response:', paginatedResponse);

            return paginatedResponse as PaginatedResponse<VehicleExpanded>;
        } catch (error) {
            console.error('Error fetching vehicles for table:', error);
            throw error;
        }
    },

    // Nowa funkcja do pobierania statystyk firmowych
    fetchCompanyStatistics: async (): Promise<VehicleCompanyStatisticsResponse> => {
        try {
            return await apiClient.getNot<VehicleCompanyStatisticsResponse>('/vehicles/company-statistics');
        } catch (error) {
            console.error('Error fetching company statistics:', error);
            throw error;
        }
    },

    // Zachowane stare funkcje dla kompatybilności wstecznej
    fetchVehicles: async (): Promise<VehicleExpanded[]> => {
        try {
            console.warn('fetchVehicles is deprecated, use fetchVehiclesForTable instead');
            const response = await vehicleApi.fetchVehiclesForTable({ page: 0, size: 1000 });
            return response.data;
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            throw error;
        }
    },

    fetchVehicleStatistics: async (vehicleId: string): Promise<VehicleStatistics> => {
        try {
            return await apiClient.get<VehicleStatistics>(`/vehicles/${vehicleId}/statistics`);
        } catch (error) {
            console.error('Error fetching vehicle statistics:', error);
            throw error;
        }
    },

    fetchOwners: async (vehicleId: string): Promise<VehicleOwner[]> => {
        try {
            // Jeśli używamy nowego API, właściciele są już w danych tabeli
            // Ta funkcja może być używana do pobrania szczegółowych danych właścicieli
            const response = await apiClient.get<VehicleOwnerSummary[]>(`/vehicles/${vehicleId}/owners`);
            return response.map(convertToVehicleOwner);
        } catch (error) {
            console.error('Error fetching vehicle owners:', error);
            throw error;
        }
    },

    // Pobieranie pojedynczego pojazdu
    fetchVehicleById: async (id: string): Promise<VehicleExpanded | null> => {
        try {
            // Używamy nowego API z filtrem - pobieramy pierwszą stronę i szukamy pojazdu
            const response = await vehicleApi.fetchVehiclesForTable({ page: 0, size: 100 });
            const vehicle = response.data.find(v => v.id === id);
            return vehicle || null;
        } catch (error) {
            console.error(`Error fetching vehicle ${id}:`, error);
            return null;
        }
    },

    // Pobieranie pojazdów dla właściciela - używa nowego API z filtrem
    fetchVehiclesByOwnerId: async (ownerId: string): Promise<VehicleExpanded[]> => {
        try {
            // Najpierw pobierz dane właściciela, żeby otrzymać jego imię i nazwisko
            // Następnie użyj filtra ownerName w nowym API
            // To wymaga dodatkowego zapytania lub rozszerzenia API o filtr po owner ID

            // Tymczasowo używamy filtrowania lokalnego
            const response = await vehicleApi.fetchVehiclesForTable({ page: 0, size: 1000 });
            return response.data.filter(vehicle =>
                vehicle.ownerIds.includes(ownerId)
            );
        } catch (error) {
            console.error(`Error fetching vehicles for owner ${ownerId}:`, error);
            return [];
        }
    },

    // Pobieranie historii serwisowej pojazdu - pozostaje bez zmian
    fetchVehicleServiceHistory: async (vehicleId: string): Promise<ServiceHistoryResponse[]> => {
        try {
            const data = await apiClient.get<ServiceHistoryResponse[]>(`/vehicles/${vehicleId}/service-history`);
            return apiClient.convertSnakeToCamel(data) as ServiceHistoryResponse[];
        } catch (error) {
            console.error(`Error fetching service history for vehicle ${vehicleId}:`, error);
            return [];
        }
    },

    // CRUD operacje - pozostają bez zmian
    createVehicle: async (vehicleData: VehicleData): Promise<VehicleExpanded> => {
        try {
            const response = await apiClient.postNot<any>('/vehicles', vehicleData);
            return apiClient.convertSnakeToCamel(response) as VehicleExpanded;
        } catch (error) {
            console.error('Error creating vehicle:', error);
            throw error;
        }
    },

    updateVehicle: async (id: string, vehicleData: VehicleData): Promise<VehicleExpanded> => {
        try {
            const response = await apiClient.putNot<any>(`/vehicles/${id}`, vehicleData);
            return apiClient.convertSnakeToCamel(response) as VehicleExpanded;
        } catch (error) {
            console.error(`Error updating vehicle ${id}:`, error);
            throw error;
        }
    },

    deleteVehicle: async (id: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/vehicles/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting vehicle ${id}:`, error);
            throw error;
        }
    },

    // Nowe funkcje pomocnicze dla filtrowania
    searchVehiclesByMake: async (make: string, paginationOptions?: PaginationOptions): Promise<PaginatedResponse<VehicleExpanded>> => {
        return vehicleApi.fetchVehiclesForTable(paginationOptions, { make });
    },

    searchVehiclesByModel: async (model: string, paginationOptions?: PaginationOptions): Promise<PaginatedResponse<VehicleExpanded>> => {
        return vehicleApi.fetchVehiclesForTable(paginationOptions, { model });
    },

    searchVehiclesByLicensePlate: async (licensePlate: string, paginationOptions?: PaginationOptions): Promise<PaginatedResponse<VehicleExpanded>> => {
        return vehicleApi.fetchVehiclesForTable(paginationOptions, { licensePlate });
    },

    searchVehiclesByOwnerName: async (ownerName: string, paginationOptions?: PaginationOptions): Promise<PaginatedResponse<VehicleExpanded>> => {
        return vehicleApi.fetchVehiclesForTable(paginationOptions, { ownerName });
    },

    searchVehiclesByVisitRange: async (minVisits?: number, maxVisits?: number, paginationOptions?: PaginationOptions): Promise<PaginatedResponse<VehicleExpanded>> => {
        return vehicleApi.fetchVehiclesForTable(paginationOptions, { minVisits, maxVisits });
    }
};