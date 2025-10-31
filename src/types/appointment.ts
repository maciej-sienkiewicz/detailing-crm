// src/types/appointment.ts - UPDATED WITH FLEXIBLE SERVICE TYPES
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
    // ✅ UPDATED: Support both SelectedService (from protocols) and Service (from templates/simple appointments)
    services?: (SelectedService | Service)[];

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
                    basePrice: number; // ✅ This can also be PriceResponse now
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