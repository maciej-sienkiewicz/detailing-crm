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