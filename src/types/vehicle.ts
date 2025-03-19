// src/types/vehicle.ts
// Typy związane z pojazdami

// Rozszerzony interfejs pojazdu ze śledzeniem serwisowym
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
    serviceHistory: ServiceHistoryItem[];
    totalSpent: number;

    // Relacje
    ownerIds: string[]; // ID właścicieli (może mieć wielu)
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