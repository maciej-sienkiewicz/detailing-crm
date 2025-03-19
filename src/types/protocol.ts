// src/types/protocol.ts
// Typy związane z protokołami przyjęcia pojazdów

import { SelectedService } from './common';

// Statusy protokołu
export enum ProtocolStatus {
    SCHEDULED = 'SCHEDULED',                  // Zaplanowano
    PENDING_APPROVAL = 'PENDING_APPROVAL',    // Oczekuje zatwierdzenia
    IN_PROGRESS = 'IN_PROGRESS',              // W realizacji
    READY_FOR_PICKUP = 'READY_FOR_PICKUP',    // Oczekiwanie na odbiór
    COMPLETED = 'COMPLETED'                   // Wydano/zakończono
}

// Etykiety dla statusów protokołów
export const ProtocolStatusLabels: Record<ProtocolStatus, string> = {
    [ProtocolStatus.SCHEDULED]: 'Zaplanowano',
    [ProtocolStatus.PENDING_APPROVAL]: 'Oczekuje na zatwierdzenie',
    [ProtocolStatus.IN_PROGRESS]: 'W realizacji',
    [ProtocolStatus.READY_FOR_PICKUP]: 'Gotowy do odbioru',
    [ProtocolStatus.COMPLETED]: 'Zakończony'
};

// Kolory dla statusów protokołów
export const ProtocolStatusColors: Record<ProtocolStatus, string> = {
    [ProtocolStatus.SCHEDULED]: '#3498db',        // Niebieski
    [ProtocolStatus.PENDING_APPROVAL]: '#f39c12', // Pomarańczowy
    [ProtocolStatus.IN_PROGRESS]: '#9b59b6',      // Fioletowy
    [ProtocolStatus.READY_FOR_PICKUP]: '#2ecc71', // Zielony
    [ProtocolStatus.COMPLETED]: '#7f8c8d'         // Szary
};

// Interfejs dla zdjęcia pojazdu
export interface VehicleImage {
    id: string;
    url: string;
    name: string;
    size: number;
    type: string;
    createdAt: string;
    description?: string; // Opcjonalny opis zdjęcia
    location?: string;    // Opcjonalna lokalizacja uszkodzenia/zdjęcia
}

// Definicja protokołu przyjęcia pojazdu
export interface CarReceptionProtocol {
    id: string;
    startDate: string;
    endDate: string;
    licensePlate: string;
    make: string;
    model: string;
    productionYear: number;
    mileage: number;
    keysProvided: boolean;
    documentsProvided: boolean;
    ownerName: string;
    companyName?: string;
    taxId?: string;
    email: string;
    phone: string;
    notes?: string;
    selectedServices: SelectedService[];
    status: ProtocolStatus;
    statusUpdatedAt?: string;
    createdAt: string;
    updatedAt: string;
    appointmentId?: string;
    referralSource?: 'regular_customer' | 'recommendation' | 'search_engine' | 'social_media' | 'local_ad' | 'other';
    otherSourceDetails?: string;

    // Dodatkowe pola
    comments?: any[];
    purchaseInvoices?: any[];
    vehicleIssues?: any[];
    vehicleImages?: VehicleImage[]; // Zdjęcia pojazdu
}

// Podstawowe informacje o pojeździe (dla widoku listy)
export interface VehicleBasicInfo {
    make: string;
    model: string;
    licensePlate: string;
    productionYear: number;
    color?: string;
}

// Podstawowe informacje o właścicielu (dla widoku listy)
export interface OwnerBasicInfo {
    name: string;
    companyName?: string;
}

// Informacje o okresie (dla widoku listy)
export interface PeriodInfo {
    startDate: string;
    endDate: string;
}

// Odpowiedź z API dla widoku listy protokołów
export interface ProtocolListItem {
    id: string;
    vehicle: VehicleBasicInfo;
    period: PeriodInfo;
    owner: OwnerBasicInfo;
    status: ProtocolStatus;
    totalServiceCount: number;
    totalAmount: number;
}