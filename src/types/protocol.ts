// src/types/protocol.ts
// Typy związane z protokołami przyjęcia pojazdów

import { SelectedService } from './common';

export interface PaginationInfo {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

// Odpowiedź API z paginacją
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationInfo;
}

// Statusy protokołu
export enum ProtocolStatus {
    SCHEDULED = 'SCHEDULED',                  // Zaplanowano
    IN_PROGRESS = 'IN_PROGRESS',              // W realizacji
    READY_FOR_PICKUP = 'READY_FOR_PICKUP',    // Oczekiwanie na odbiór
    COMPLETED = 'COMPLETED',                  // Wydano/zakończono
    CANCELLED = 'CANCELLED'                   // Anulowano
}

// Zaktualizuj etykiety dla statusów
export const ProtocolStatusLabels: Record<ProtocolStatus, string> = {
    [ProtocolStatus.SCHEDULED]: 'Zaplanowano',
    [ProtocolStatus.IN_PROGRESS]: 'W realizacji',
    [ProtocolStatus.READY_FOR_PICKUP]: 'Gotowy do odbioru',
    [ProtocolStatus.COMPLETED]: 'Zakończony',
    [ProtocolStatus.CANCELLED]: 'Anulowany'
};

// Zaktualizuj kolory dla statusów
export const ProtocolStatusColors: Record<ProtocolStatus, string> = {
    [ProtocolStatus.SCHEDULED]: '#3498db',        // Niebieski
    [ProtocolStatus.IN_PROGRESS]: '#9b59b6',      // Fioletowy
    [ProtocolStatus.READY_FOR_PICKUP]: '#2ecc71', // Zielony
    [ProtocolStatus.COMPLETED]: '#7f8c8d',        // Szary
    [ProtocolStatus.CANCELLED]: '#e74c3c'         // Czerwony
};

// Interfejs dla zdjęcia pojazdu
export interface VehicleImage {
    id: string;
    url?: string;
    name: string;
    size: number;
    type: string;
    createdAt: string;
    description?: string;
    location?: string;
    tags?: string[];
    file?: File;
    storageId?: string;
    protocolId?: string;
}

// Definicja protokołu przyjęcia pojazdu
export interface CarReceptionProtocol {
    id: string;
    title?: string;        // Tytuł wizyty
    calendarColorId?: string; // ID koloru używanego do wyświetlania wizyty w kalendarzu
    startDate: string;     // Teraz zawiera datę i godzinę (format ISO 8601)
    endDate: string;       // Zawsze będzie ustawiony na koniec dnia
    licensePlate: string;
    make: string;
    model: string;
    productionYear: number;
    mileage: number;
    keysProvided: boolean;
    documentsProvided: boolean;
    ownerId: number;
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
    protocolDocuments?: ProtocolDocument[]; // Dodaj to pole

    // Dodatkowe pola
    comments?: any[];
    purchaseInvoices?: any[];
    vehicleIssues?: any[];
    vehicleImages?: VehicleImage[]; // Zdjęcia pojazdu
}

export interface ProtocolDocument {
    storageId: string;
    protocolId: string;
    originalName: string;
    fileSize: number;
    contentType: string;
    documentType: string;
    documentTypeDisplay: string;
    description?: string;
    createdAt: string;
    uploadedBy: string;
    downloadUrl: string;
}

// Enum dla typów dokumentów
export enum ProtocolDocumentType {
    MARKETING_CONSENT = 'MARKETING_CONSENT',
    SERVICE_CONSENT = 'SERVICE_CONSENT',
    TERMS_ACCEPTANCE = 'TERMS_ACCEPTANCE',
    PRIVACY_POLICY = 'PRIVACY_POLICY',
    ACCEPTANCE_PROTOCOL = "Protokół odbioru",
    DAMAGE_WAIVER = 'DAMAGE_WAIVER',
    OTHER = 'OTHER'
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
    calendarColorId?: string;
    selectedServices: SelectedService[];
    title: string;
    lastUpdate: string;
}

// Nowy interfejs dla historii wizyt klienta (uproszczony format z API)
export interface ClientProtocolHistory {
    id: string;
    startDate: string;
    endDate: string;
    status: ProtocolStatus;
    carMake: string;
    carModel: string;
    licensePlate: string;
    totalAmount: number;
}