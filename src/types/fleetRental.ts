// src/types/fleetRental.ts

// Status wypożyczenia
export enum FleetRentalStatus {
    SCHEDULED = 'SCHEDULED',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

// Etykiety dla statusów wypożyczenia
export const FleetRentalStatusLabels: Record<FleetRentalStatus, string> = {
    [FleetRentalStatus.SCHEDULED]: 'Zaplanowane',
    [FleetRentalStatus.ACTIVE]: 'Trwające',
    [FleetRentalStatus.COMPLETED]: 'Zakończone',
    [FleetRentalStatus.CANCELLED]: 'Anulowane'
};

// Kolory dla statusów wypożyczenia
export const FleetRentalStatusColors: Record<FleetRentalStatus, string> = {
    [FleetRentalStatus.SCHEDULED]: '#3498db',     // Niebieski
    [FleetRentalStatus.ACTIVE]: '#2ecc71',        // Zielony
    [FleetRentalStatus.COMPLETED]: '#7f8c8d',     // Szary
    [FleetRentalStatus.CANCELLED]: '#e74c3c'      // Czerwony
};

// Wypożyczenie pojazdu
export interface FleetRental {
    id: string;
    vehicleId: string;
    clientId?: string;
    employeeId?: string;
    protocolId?: string;

    status: FleetRentalStatus;
    startDate: string;
    plannedEndDate: string;
    actualEndDate?: string;

    // Stan pojazdu
    startMileage: number;
    endMileage?: number;
    fuelLevelStart: number;
    fuelLevelEnd?: number;

    // Dokumentacja
    startConditionNotes: string;
    endConditionNotes?: string;
    damageReported: boolean;
    damageDescription?: string;

    // Umowa
    contractNumber: string;
    contractFileUrl?: string;

    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy?: string;
}

// Zdjęcie związane z pojazdem
export interface FleetImage {
    id: string;
    entityId: string;
    entityType: 'VEHICLE' | 'RENTAL';
    url?: string;
    name: string;
    size: number;
    type: string;
    createdAt: string;
    description?: string;
    file?: File;
}