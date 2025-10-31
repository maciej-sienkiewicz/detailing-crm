// src/types/vehicle.ts - Zaktualizowane typy - NAPRAWIONE
// Typy związane z pojazdami

// Rozszerzony interfejs pojazdu - zaktualizowany dla nowego API
import {PriceDetails} from "../shared/types/price";

export interface VehicleExpanded {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color?: string;
    vin?: string;
    mileage?: number;

    // Metryki śledzenia - zaktualizowane nazwy
    totalServices: number;    // Mapowane z visitCount z API
    lastServiceDate?: string; // Mapowane z lastVisitDate z API (po konwersji)
    totalSpent: PriceDetails;       // Mapowane z totalRevenue z API

    // Relacje - zaktualizowane dla nowego API
    ownerIds: string[];       // ID właścicieli (może mieć wielu)

    // NAPRAWIONE: Dodanie pełnych danych właścicieli z API
    owners?: VehicleOwnerSummary[]; // Pełne dane właścicieli z API

    // Historia serwisowa - pobierana osobno
    serviceHistory?: ServiceHistoryItem[];

    // Nowe pola z API - dodane po konwersji dat
    createdAt?: string;
    updatedAt?: string;
}

// NOWY interfejs dla właścicieli z API - rozszerzony o wszystkie potrzebne dane
export interface VehicleOwnerSummary {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email?: string;
    phone?: string;
}

// Zachowany stary interfejs dla kompatybilności wstecznej
export interface VehicleOwner {
    ownerId: number;
    ownerName: string;
}

// Statystyki pojazdu
export interface VehicleStatistics {
    servicesNo: number;
    totalRevenue: number;
}

// Nowe interfejsy dla statystyk firmowych
export interface VehicleCompanyStatistics {
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

// Śledzenie historii serwisowej - bez zmian
export interface ServiceHistoryItem {
    id: string;
    date: string;
    serviceType: string;
    description: string;
    price: number;
    protocolId?: string;
}

// Nowe interfejsy dla filtrów - dostosowane do nowego API
export interface VehicleTableFilters {
    make?: string;
    model?: string;
    licensePlate?: string;
    ownerName?: string;
    minVisits?: number;
    maxVisits?: number;
}

// Interfejs dla UI filtrów
export interface VehicleUIFilters {
    licensePlate: string;
    make: string;
    model: string;
    ownerName: string;
    minServices: string;
    maxServices: string;
}

// Interfejs dla odpowiedzi z tabeli pojazdów
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
    lastVisitDate?: string;
    totalRevenue: number;
    createdAt: string;
    updatedAt: string;
}

// Interfejs dla danych pojazdu do zapisu - bez zmian
export interface VehicleData {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color?: string;
    vin?: string;
    ownerIds: string[];
}

// Dodatkowe typy pomocnicze
export type VehicleStatus = 'Standard' | 'VIP' | 'Premium';

export interface VehicleStatusInfo {
    label: VehicleStatus;
    color: string;
}

// Enum dla sortowania
export enum VehicleSortField {
    MAKE = 'make',
    MODEL = 'model',
    LICENSE_PLATE = 'licensePlate',
    LAST_VISIT = 'lastVisitDate',
    VISIT_COUNT = 'visitCount',
    TOTAL_REVENUE = 'totalRevenue',
    CREATED_AT = 'createdAt'
}

export enum SortDirection {
    ASC = 'asc',
    DESC = 'desc'
}

// NOWE TYPY dla kompatybilności z różnymi formatami API
export interface VehicleOwnerDetailed {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    company?: string;
    address?: string;
}

// Typ dla konwersji między formatami
export type VehicleOwnerFormat = VehicleOwnerSummary | VehicleOwner | VehicleOwnerDetailed;

// Helper type guards
export const isVehicleOwnerSummary = (owner: VehicleOwnerFormat): owner is VehicleOwnerSummary => {
    return 'firstName' in owner && 'lastName' in owner && 'fullName' in owner;
};

export const isVehicleOwner = (owner: VehicleOwnerFormat): owner is VehicleOwner => {
    return 'ownerId' in owner && 'ownerName' in owner;
};

export const isVehicleOwnerDetailed = (owner: VehicleOwnerFormat): owner is VehicleOwnerDetailed => {
    return 'firstName' in owner && 'lastName' in owner && 'email' in owner && typeof (owner as any).id === 'string';
};