// src/types/fleetMaintenance.ts

// Wpis dotyczący serwisu/naprawy
export interface FleetMaintenance {
    id: string;
    vehicleId: string;
    date: string;
    type: 'OIL_CHANGE' | 'REGULAR_SERVICE' | 'REPAIR' | 'INSPECTION' | 'TIRE_CHANGE' | 'OTHER';
    description: string;
    mileage: number;
    cost: number;
    garage: string;
    invoiceNumber?: string;
    invoiceFileUrl?: string;
    parts?: FleetMaintenancePart[];
    notes?: string;
    createdAt: string;
    createdBy: string;
}

// Części użyte podczas serwisu
export interface FleetMaintenancePart {
    id: string;
    maintenanceId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

// Etykiety dla typów serwisu
export const FleetMaintenanceTypeLabels: Record<string, string> = {
    'OIL_CHANGE': 'Wymiana oleju',
    'REGULAR_SERVICE': 'Przegląd okresowy',
    'REPAIR': 'Naprawa',
    'INSPECTION': 'Inspekcja',
    'TIRE_CHANGE': 'Wymiana opon',
    'OTHER': 'Inny'
};

// Wpis dotyczący tankowania
export interface FleetFuelEntry {
    id: string;
    vehicleId: string;
    date: string;
    mileage: number;
    fuelAmount: number;
    fuelPrice: number;
    totalCost: number;
    fullTank: boolean;
    station?: string;
    createdBy: string;
    notes?: string;
}

export interface FleetFuelStatus {
    vehicleId: string;
    currentFuelLevel: number; // 0-1 (procent)
    estimatedRange?: number;  // Szacowany zasięg w km
    lastUpdated: string;
    source: 'RENTAL_END' | 'FUEL_ENTRY' | 'MANUAL_UPDATE';
}

// Funkcja do pobierania opisu poziomu paliwa
export const getFuelLevelDescription = (level: number): string => {
    if (level < 0.1) return 'Pusty';
    if (level < 0.25) return 'Rezerwa';
    if (level < 0.5) return 'Ćwierć';
    if (level < 0.75) return 'Połowa';
    if (level < 0.9) return 'Trzy czwarte';
    return 'Pełny';
};