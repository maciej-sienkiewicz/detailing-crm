// src/types/appointment.ts
// Typy związane z wizytami i terminarzem

// Statusy wizyt
export enum AppointmentStatus {
    SCHEDULED = 'SCHEDULED',                  // Zaplanowano
    PENDING_APPROVAL = 'PENDING_APPROVAL',    // Oczekuje zatwierdzenia
    IN_PROGRESS = 'IN_PROGRESS',              // W realizacji
    READY_FOR_PICKUP = 'READY_FOR_PICKUP',    // Oczekiwanie na odbiór
    COMPLETED = 'COMPLETED'                   // Wydano/zakończono
}

// Etykiety dla statusów wizyt
export const AppointmentStatusLabels: Record<AppointmentStatus, string> = {
    [AppointmentStatus.SCHEDULED]: 'Zaplanowano',
    [AppointmentStatus.PENDING_APPROVAL]: 'Oczekuje na zatwierdzenie',
    [AppointmentStatus.IN_PROGRESS]: 'W realizacji',
    [AppointmentStatus.READY_FOR_PICKUP]: 'Oczekiwanie na odbiór',
    [AppointmentStatus.COMPLETED]: 'Zakończony'
};

// Kolory dla statusów wizyt
export const AppointmentStatusColors: Record<AppointmentStatus, string> = {
    [AppointmentStatus.SCHEDULED]: '#3498db',        // Niebieski
    [AppointmentStatus.PENDING_APPROVAL]: '#f39c12', // Pomarańczowy
    [AppointmentStatus.IN_PROGRESS]: '#9b59b6',      // Fioletowy
    [AppointmentStatus.READY_FOR_PICKUP]: '#2ecc71', // Zielony
    [AppointmentStatus.COMPLETED]: '#7f8c8d'         // Szary
};

// Definicja wizyty/terminu
export interface Appointment {
    id: string;
    title: string;
    start: Date;
    end: Date;
    customerId?: string;
    vehicleId?: string;
    serviceType: string;
    status: AppointmentStatus;
    notes?: string;
    statusUpdatedAt?: string;
    isProtocol?: boolean; // Flaga wskazująca, czy wydarzenie pochodzi z protokołu
}