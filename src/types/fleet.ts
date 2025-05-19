// src/types/fleet.ts

// Status pojazdu flotowego
export enum FleetVehicleStatus {
    AVAILABLE = 'AVAILABLE',
    RENTED = 'RENTED',
    MAINTENANCE = 'MAINTENANCE',
    UNAVAILABLE = 'UNAVAILABLE'
}

// Etykiety dla statusów pojazdów
export const FleetVehicleStatusLabels: Record<FleetVehicleStatus, string> = {
    [FleetVehicleStatus.AVAILABLE]: 'Dostępny',
    [FleetVehicleStatus.RENTED]: 'Wypożyczony',
    [FleetVehicleStatus.MAINTENANCE]: 'W serwisie',
    [FleetVehicleStatus.UNAVAILABLE]: 'Niedostępny'
};

// Kolory dla statusów pojazdów
export const FleetVehicleStatusColors: Record<FleetVehicleStatus, string> = {
    [FleetVehicleStatus.AVAILABLE]: '#2ecc71',    // Zielony
    [FleetVehicleStatus.RENTED]: '#3498db',       // Niebieski
    [FleetVehicleStatus.MAINTENANCE]: '#f39c12',  // Pomarańczowy
    [FleetVehicleStatus.UNAVAILABLE]: '#e74c3c'   // Czerwony
};

// Kategoria pojazdu flotowego
export enum FleetVehicleCategory {
    ECONOMY = 'ECONOMY',
    STANDARD = 'STANDARD',
    PREMIUM = 'PREMIUM',
    SUV = 'SUV',
    UTILITY = 'UTILITY'
}

// Etykiety dla kategorii pojazdów
export const FleetVehicleCategoryLabels: Record<FleetVehicleCategory, string> = {
    [FleetVehicleCategory.ECONOMY]: 'Ekonomiczny',
    [FleetVehicleCategory.STANDARD]: 'Standardowy',
    [FleetVehicleCategory.PREMIUM]: 'Premium',
    [FleetVehicleCategory.SUV]: 'SUV',
    [FleetVehicleCategory.UTILITY]: 'Użytkowy'
};

// Typ użytkowania pojazdu
export enum FleetVehicleUsageType {
    REPLACEMENT = 'REPLACEMENT',
    COMPANY = 'COMPANY'
}

// Etykiety dla typów użytkowania
export const FleetVehicleUsageTypeLabels: Record<FleetVehicleUsageType, string> = {
    [FleetVehicleUsageType.REPLACEMENT]: 'Samochód zastępczy',
    [FleetVehicleUsageType.COMPANY]: 'Samochód firmowy'
};

// Główny interfejs pojazdu flotowego
export interface FleetVehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    vin: string;
    color?: string;
    category: FleetVehicleCategory;
    usageType: FleetVehicleUsageType;
    status: FleetVehicleStatus;

    // Dane techniczne
    engineType: string;
    engineCapacity: number;
    fuelType: string;
    transmission: string;

    // Dane administracyjne
    purchaseDate: string;
    registrationDate: string;
    insuranceExpiryDate: string;
    technicalInspectionDate: string;

    // Dane operacyjne
    currentMileage: number;
    lastServiceMileage: number;
    nextServiceMileage: number;

    // Metadane
    createdAt: string;
    updatedAt: string;
}