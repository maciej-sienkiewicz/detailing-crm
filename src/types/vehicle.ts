// src/types/vehicle.ts
// Typy związane z pojazdami

// Rozszerzony interfejs pojazdu bez historii serwisowej (ładowanej osobno)
export interface VehicleExpanded {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color?: string;
    vin?: string;

    // Metryki śledzenia
    totalServices: number;
    lastServiceDate?: string;
    totalSpent: number;

    // Relacje
    ownerIds: string[]; // ID właścicieli (może mieć wielu)

    // Historia serwisowa już nie jest częścią głównego modelu pojazdu,
    // będzie pobierana osobnym zapytaniem
    serviceHistory?: ServiceHistoryItem[];
}

export interface VehicleStatistics {
    servicesNo: number;
    totalRevenue: number;
}

export interface VehicleOwner {
    ownerId: number;
    ownerName: string;
}

// Śledzenie historii serwisowej
export interface ServiceHistoryItem {
    id: string;
    date: string;
    serviceType: string;
    description: string;
    price: number;
    protocolId?: string;
}