// src/types/appointment.ts
// Typy związane z wizytami i terminarzem

// Statusy wizyt
import {SelectedService} from "./common";
import {Service} from "./service";
import {EventOccurrenceResponse} from "./recurringEvents";

export enum AppointmentStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    READY_FOR_PICKUP = 'READY_FOR_PICKUP',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

// Etykiety dla statusów wizyt
export const AppointmentStatusLabels: Record<AppointmentStatus, string> = {
    [AppointmentStatus.SCHEDULED]: 'Zaplanowano',
    [AppointmentStatus.IN_PROGRESS]: 'W realizacji',
    [AppointmentStatus.READY_FOR_PICKUP]: 'Oczekiwanie na odbiór',
    [AppointmentStatus.COMPLETED]: 'Zakończony',
    [AppointmentStatus.CANCELLED]: 'Anulowany'
};

// Kolory dla statusów wizyt
export const AppointmentStatusColors: Record<AppointmentStatus, string> = {
    [AppointmentStatus.SCHEDULED]: '#3498db',        // Niebieski
    [AppointmentStatus.IN_PROGRESS]: '#9b59b6',      // Fioletowy
    [AppointmentStatus.READY_FOR_PICKUP]: '#2ecc71', // Zielony
    [AppointmentStatus.COMPLETED]: '#7f8c8d',         // Szary
    [AppointmentStatus.CANCELLED]: '#000000'         // Szary
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
    isProtocol?: boolean;
    statusUpdatedAt?: string;
    calendarColorId?: string;
    services?: Service[];

    // Enhanced recurring event properties
    isRecurringEvent?: boolean;
    recurringEventData?: EventOccurrenceResponse & {
        recurringEventDetails?: {
            id: string;
            title: string;
            description?: string;
            type: any;
            recurrencePattern: {
                frequency: string;
                interval: number;
                daysOfWeek?: string[];
                dayOfMonth?: number;
                endDate?: string;
                maxOccurrences?: number;
            };
            isActive: boolean;
            visitTemplate?: {
                clientId?: number;
                vehicleId?: number;
                estimatedDurationMinutes: number;
                defaultServices: Array<{
                    name: string;
                    basePrice: number;
                }>;
                notes?: string;
            };
            createdAt: string;
            updatedAt: string;
        };
    };
    recurringEventId?: string;
    occurrenceId?: string;
}

export const isRecurringEventAppointment = (appointment: Appointment): boolean => {
    return appointment.isRecurringEvent === true ||
        appointment.id.startsWith('recurring-') ||
        !!appointment.recurringEventData;
};

export const hasRecurringEventData = (appointment: Appointment): appointment is Appointment & {
    recurringEventData: EventOccurrenceResponse;
} => {
    return !!appointment.recurringEventData;
};