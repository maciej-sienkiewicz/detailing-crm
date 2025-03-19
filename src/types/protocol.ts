// Typy dla odpowiedzi z API dla protokołów przyjęcia pojazdów w widoku listy

// Statusy protokołu
export enum ProtocolStatus {
    SCHEDULED = 'SCHEDULED',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    IN_PROGRESS = 'IN_PROGRESS',
    READY_FOR_PICKUP = 'READY_FOR_PICKUP',
    COMPLETED = 'COMPLETED'
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

// Podstawowe informacje o pojeździe
export interface VehicleBasicInfo {
    make: string;
    model: string;
    licensePlate: string;
    productionYear: number;
    color?: string;
}

// Podstawowe informacje o właścicielu
export interface OwnerBasicInfo {
    name: string;
    companyName?: string;
}

// Informacje o okresie
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