// src/api/vehiclesApi.ts - Naprawione API dla nowych endpointów - POPRAWIONE
import { VehicleExpanded, VehicleOwner, VehicleStatistics } from '../types';
import { apiClientNew, PaginatedApiResponse, PaginationParams } from './apiClientNew';

// Interfejsy dostosowane do rzeczywistego formatu API - NAPRAWIONE TYPY
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
    lastVisitDate?: number[] | string | null | undefined;  // NAPRAWIONE: dodano undefined
    totalRevenue: number;
    createdAt: number[] | string | undefined;              // NAPRAWIONE: dodano undefined
    updatedAt: number[] | string | undefined;              // NAPRAWIONE: dodano undefined
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

// Funkcja do konwersji daty z formatu tablicy na string ISO - NAPRAWIONA
const convertDateArrayToString = (dateArray: number[] | string | null | undefined): string | undefined => {
    if (!dateArray || dateArray === undefined || dateArray === null) return undefined;
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

// Funkcja konwersji VehicleTableResponse na VehicleExpanded - NAPRAWIONA
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

    // NAPRAWIONE: Dodanie pełnych danych właścicieli
    owners: tableResponse.owners.map(owner => ({
        id: owner.id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        fullName: owner.fullName,
        email: owner.email,
        phone: owner.phone
    })),

    // Dodatkowe pola dla zgodności
    createdAt: convertDateArrayToString(tableResponse.createdAt),
    updatedAt: convertDateArrayToString(tableResponse.updatedAt)
});

// Funkcja konwersji VehicleOwnerSummary na VehicleOwner
const convertToVehicleOwner = (ownerSummary: VehicleOwnerSummary): VehicleOwner => ({
    ownerId: ownerSummary.id,
    ownerName: ownerSummary.fullName
});

// Funkcja konwersji SpringPageResponse na PaginatedApiResponse
const convertSpringPageToPaginatedResponse = <T>(springPage: SpringPageResponse<T>): PaginatedApiResponse<T> => ({
    data: springPage.content,
    pagination: {
        currentPage: springPage.number,
        pageSize: springPage.size,
        totalItems: springPage.totalElements,
        totalPages: springPage.totalPages,
        hasNext: !springPage.last,
        hasPrevious: !springPage.first
    },
    success: true
});

export const vehicleApi = {
    // Nowa funkcja do pobierania pojazdów dla tabeli z paginacją i filtrami
    fetchVehiclesForTable: async (
        paginationOptions: PaginationParams = {},
        filters: VehicleTableFilters = {}
    ): Promise<PaginatedApiResponse<VehicleExpanded>> => {
        try {
            const queryParams = {
                page: paginationOptions.page || 0,
                size: paginationOptions.size || 20,
                sort: 'lastVisitDate,desc', // Domyślne sortowanie
                ...filters // Spread filtrów
            };

            console.log('🚗 Calling /vehicles/table with params:', queryParams);

            // Wywołanie API z wykorzystaniem nowego apiClientNew
            const response = await apiClientNew.get<SpringPageResponse<VehicleTableResponse>>(
                '/vehicles/table',
                queryParams
            );

            console.log('📊 Raw API response:', response);

            // Konwersja danych na format VehicleExpanded
            const convertedData = response.content.map(convertToVehicleExpanded);

            console.log('✅ Converted vehicles:', convertedData);

            // Konwersja na nasz format paginacji
            const paginatedResponse = convertSpringPageToPaginatedResponse({
                ...response,
                content: convertedData
            });

            console.log('📋 Final paginated response:', paginatedResponse);

            return paginatedResponse as PaginatedApiResponse<VehicleExpanded>;
        } catch (error) {
            console.error('❌ Error fetching vehicles for table:', error);
            throw error;
        }
    },

    // Nowa funkcja do pobierania statystyk firmowych
    fetchCompanyStatistics: async (): Promise<VehicleCompanyStatisticsResponse> => {
        try {
            console.log('📈 Fetching company statistics...');
            const response = await apiClientNew.get<VehicleCompanyStatisticsResponse>('/vehicles/company-statistics');
            console.log('✅ Company statistics loaded:', response);
            return response;
        } catch (error) {
            console.error('❌ Error fetching company statistics:', error);
            throw error;
        }
    },

    // NAPRAWIONA funkcja do pobierania właścicieli pojazdu
    fetchOwners: async (vehicleId: string): Promise<VehicleOwner[]> => {
        try {
            console.log(`👥 Fetching owners for vehicle ${vehicleId}...`);

            // Najpierw pobierz szczegóły pojazdu z tabeli, które zawierają właścicieli
            const vehicleResponse = await apiClientNew.get<SpringPageResponse<VehicleTableResponse>>(
                '/vehicles/table',
                { licensePlate: '', make: '', model: '' } // Pusty filtr żeby pobrać wszystkie
            );

            // Znajdź konkretny pojazd
            const vehicle = vehicleResponse.content.find(v => v.id.toString() === vehicleId);

            if (vehicle && vehicle.owners) {
                const owners = vehicle.owners.map(convertToVehicleOwner);
                console.log('✅ Vehicle owners loaded:', owners);
                return owners;
            }

            // Fallback - jeśli nie znaleziono w tabeli, spróbuj bezpośredniego endpoint
            try {
                const directResponse = await apiClientNew.get<VehicleOwnerSummary[]>(`/vehicles/${vehicleId}/owners`);
                const owners = directResponse.map(convertToVehicleOwner);
                console.log('✅ Vehicle owners loaded (direct):', owners);
                return owners;
            } catch (directError) {
                console.warn('⚠️ Direct owners endpoint failed, returning empty array');
                return [];
            }
        } catch (error) {
            console.error('❌ Error fetching vehicle owners:', error);
            return [];
        }
    },

    // Funkcja do pobierania statystyk pojazdu
    fetchVehicleStatistics: async (vehicleId: string): Promise<VehicleStatistics> => {
        try {
            console.log(`📊 Fetching statistics for vehicle ${vehicleId}...`);
            const response = await apiClientNew.get<VehicleStatistics>(`/vehicles/${vehicleId}/statistics`);
            console.log('✅ Vehicle statistics loaded:', response);
            return response;
        } catch (error) {
            console.error(`❌ Error fetching vehicle statistics for ${vehicleId}:`, error);
            // Zwróć domyślne statystyki w przypadku błędu
            return {
                servicesNo: 0,
                totalRevenue: 0
            };
        }
    },

    // Zachowane stare funkcje dla kompatybilności wstecznej
    fetchVehicles: async (): Promise<VehicleExpanded[]> => {
        try {
            console.warn('⚠️ fetchVehicles is deprecated, use fetchVehiclesForTable instead');
            const response = await vehicleApi.fetchVehiclesForTable({ page: 0, size: 1000 });
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching vehicles:', error);
            throw error;
        }
    },

    // Pobieranie pojedynczego pojazdu
    fetchVehicleById: async (id: string): Promise<VehicleExpanded | null> => {
        try {
            console.log(`🔍 Fetching vehicle by ID: ${id}`);

            // Użyj tabeli do znalezienia pojazdu
            const response = await vehicleApi.fetchVehiclesForTable({ page: 0, size: 100 });
            const vehicle = response.data.find(v => v.id === id);

            if (vehicle) {
                console.log('✅ Vehicle found:', vehicle);
                return vehicle;
            }

            console.warn(`⚠️ Vehicle with ID ${id} not found`);
            return null;
        } catch (error) {
            console.error(`❌ Error fetching vehicle ${id}:`, error);
            return null;
        }
    },

    // Pobieranie pojazdów dla właściciela - używa nowego API z filtrem
    fetchVehiclesByOwnerId: async (ownerId: string): Promise<VehicleExpanded[]> => {
        try {
            console.log(`🚗 Fetching vehicles for owner ${ownerId}...`);

            const response = await vehicleApi.fetchVehiclesForTable({ page: 0, size: 1000 });

            const ownerVehicles = response.data.filter(vehicle => {
                // Sprawdź czy owners istnieje i nie jest pusty
                if (!vehicle.owners || vehicle.owners.length === 0) {
                    return false;
                }

                // Porównaj zarówno string z string jak i string z number
                return vehicle.owners.some(owner =>
                    owner.id.toString() === ownerId ||
                    owner.id === parseInt(ownerId, 10)
                );
            });

            console.log(`✅ Found ${ownerVehicles.length} vehicles for owner ${ownerId}`);
            return ownerVehicles;
        } catch (error) {
            console.error('❌ Error fetching vehicles by owner ID:', error);
            throw error;
        }
    },

    // Pobieranie historii serwisowej pojazdu - pozostaje bez zmian
    fetchVehicleServiceHistory: async (vehicleId: string): Promise<ServiceHistoryResponse[]> => {
        try {
            console.log(`📋 Fetching service history for vehicle ${vehicleId}...`);
            const data = await apiClientNew.get<ServiceHistoryResponse[]>(`/vehicles/${vehicleId}/service-history`);
            console.log('✅ Service history loaded:', data);
            return data;
        } catch (error) {
            console.error(`❌ Error fetching service history for vehicle ${vehicleId}:`, error);
            return [];
        }
    },

    // CRUD operacje - NAPRAWIONE do używania nowego API client
    createVehicle: async (vehicleData: VehicleData): Promise<VehicleExpanded> => {
        try {
            console.log('➕ Creating new vehicle:', vehicleData);
            const response = await apiClientNew.post<any>('/vehicles', vehicleData);
            console.log('✅ Vehicle created:', response);

            // Konwertuj odpowiedź na VehicleExpanded jeśli to VehicleTableResponse
            if (response.owners && Array.isArray(response.owners)) {
                return convertToVehicleExpanded(response);
            }

            // Jeśli odpowiedź ma inny format, spróbuj konwersji
            return {
                id: response.id?.toString() || '',
                make: response.make || vehicleData.make,
                model: response.model || vehicleData.model,
                year: response.year || vehicleData.year,
                licensePlate: response.licensePlate || vehicleData.licensePlate,
                color: response.color || vehicleData.color,
                vin: response.vin || vehicleData.vin,
                totalServices: response.visitCount || 0,
                totalSpent: response.totalRevenue || 0,
                ownerIds: vehicleData.ownerIds,
                lastServiceDate: convertDateArrayToString(response.lastVisitDate || null),
                createdAt: convertDateArrayToString(response.createdAt || null),
                updatedAt: convertDateArrayToString(response.updatedAt || null)
            };
        } catch (error) {
            console.error('❌ Error creating vehicle:', error);
            throw error;
        }
    },

    updateVehicle: async (id: string, vehicleData: VehicleData): Promise<VehicleExpanded> => {
        try {
            console.log(`✏️ Updating vehicle ${id}:`, vehicleData);
            const response = await apiClientNew.put<any>(`/vehicles/${id}`, vehicleData);
            console.log('✅ Vehicle updated:', response);

            // Konwertuj odpowiedź na VehicleExpanded jeśli to VehicleTableResponse
            if (response.owners && Array.isArray(response.owners)) {
                return convertToVehicleExpanded(response);
            }

            // Jeśli odpowiedź ma inny format, spróbuj konwersji
            return {
                id: response.id?.toString() || id,
                make: response.make || vehicleData.make,
                model: response.model || vehicleData.model,
                year: response.year || vehicleData.year,
                licensePlate: response.licensePlate || vehicleData.licensePlate,
                color: response.color || vehicleData.color,
                vin: response.vin || vehicleData.vin,
                totalServices: response.visitCount || 0,
                totalSpent: response.totalRevenue || 0,
                ownerIds: vehicleData.ownerIds,
                lastServiceDate: convertDateArrayToString(response.lastVisitDate || null),
                createdAt: convertDateArrayToString(response.createdAt || null),
                updatedAt: convertDateArrayToString(response.updatedAt || null)
            };
        } catch (error) {
            console.error(`❌ Error updating vehicle ${id}:`, error);
            throw error;
        }
    },

    deleteVehicle: async (id: string): Promise<boolean> => {
        try {
            console.log(`🗑️ Deleting vehicle ${id}...`);
            await apiClientNew.delete(`/vehicles/${id}`);
            console.log('✅ Vehicle deleted successfully');
            return true;
        } catch (error) {
            console.error(`❌ Error deleting vehicle ${id}:`, error);
            return false;
        }
    },

    // Nowe funkcje pomocnicze dla filtrowania
    searchVehiclesByMake: async (make: string, paginationOptions?: PaginationParams): Promise<PaginatedApiResponse<VehicleExpanded>> => {
        return vehicleApi.fetchVehiclesForTable(paginationOptions, { make });
    },

    searchVehiclesByModel: async (model: string, paginationOptions?: PaginationParams): Promise<PaginatedApiResponse<VehicleExpanded>> => {
        return vehicleApi.fetchVehiclesForTable(paginationOptions, { model });
    },

    searchVehiclesByLicensePlate: async (licensePlate: string, paginationOptions?: PaginationParams): Promise<PaginatedApiResponse<VehicleExpanded>> => {
        return vehicleApi.fetchVehiclesForTable(paginationOptions, { licensePlate });
    },

    searchVehiclesByOwnerName: async (ownerName: string, paginationOptions?: PaginationParams): Promise<PaginatedApiResponse<VehicleExpanded>> => {
        return vehicleApi.fetchVehiclesForTable(paginationOptions, { ownerName });
    },

    searchVehiclesByVisitRange: async (minVisits?: number, maxVisits?: number, paginationOptions?: PaginationParams): Promise<PaginatedApiResponse<VehicleExpanded>> => {
        return vehicleApi.fetchVehiclesForTable(paginationOptions, { minVisits, maxVisits });
    }
};