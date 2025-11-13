// src/services/ReservationCalendarService.ts
/**
 * Service for integrating Reservations with Calendar
 * Converts reservation data to calendar appointment format
 */

import { Appointment, AppointmentStatus } from '../types';
import { Reservation, reservationsApi, ReservationStatus } from '../features/reservations/api/reservationsApi';
import { parseBackendDate } from '../features/reservations/libs/dateParser';

/**
 * Converts backend reservation to calendar appointment
 */
const convertReservationToAppointment = (reservation: Reservation): Appointment | null => {
    // Map reservation status to appointment status
    let appointmentStatus: AppointmentStatus;

    switch (reservation.status) {
        case ReservationStatus.CONFIRMED:
            appointmentStatus = AppointmentStatus.SCHEDULED;
            break;
        case ReservationStatus.CANCELLED:
            appointmentStatus = AppointmentStatus.CANCELLED;
            break;
        case ReservationStatus.CONVERTED:
            // Skip converted reservations - they're now full visits
            return null;
        default:
            appointmentStatus = AppointmentStatus.SCHEDULED;
    }

    // Parse dates using centralized parser
    const startDate = parseBackendDate(reservation.startDate);
    const endDate = parseBackendDate(reservation.endDate);

    if (!startDate) {
        console.error('Failed to parse reservation start date:', reservation.startDate);
        return null;
    }

    // If no end date, use start date + 1 hour
    const finalEndDate = endDate || new Date(startDate.getTime() + 60 * 60 * 1000);

    return {
        id: `reservation-${reservation.id}`,
        title: reservation.title,
        start: startDate,
        end: finalEndDate,
        customerId: reservation.contactPhone,
        vehicleId: reservation.vehicleDisplay,
        serviceType: 'reservation',
        status: appointmentStatus,
        notes: reservation.notes,
        isProtocol: false,
        calendarColorId: reservation.calendarColorId,
        services: reservation.services.map(service => ({
            id: service.id,
            name: service.name,
            quantity: service.quantity,
            basePrice: service.basePrice,
            discountType: 'PERCENTAGE' as any,
            discountValue: 0,
            finalPrice: service.finalPrice,
            note: service.note
        })),
        statusUpdatedAt: reservation.updatedAt,
        isReservation: true,
        reservationData: reservation
    } as Appointment & { isReservation: boolean; reservationData: Reservation };
};

/**
 * Fetches reservations and converts them to appointments for calendar display
 */
export const fetchReservationsAsAppointments = async (
    dateRange: { start: Date; end: Date }
): Promise<Appointment[]> => {
    try {
        console.log('📅 Fetching reservations for calendar:', {
            start: dateRange.start.toISOString(),
            end: dateRange.end.toISOString()
        });

        // Fetch all confirmed reservations
        const response = await reservationsApi.listReservations({
            status: ReservationStatus.CONFIRMED,
            sortBy: 'startDate',
            sortDirection: 'ASC',
            size: 1000
        });

        console.log(`✅ Fetched ${response.data.length} reservations from API`);

        // Convert to appointments and filter by date range
        const appointments = response.data
            .map(convertReservationToAppointment)
            .filter(apt => {
                if (!apt) return false;

                const aptStart = new Date(apt.start);
                const aptEnd = new Date(apt.end);

                return aptStart <= dateRange.end && aptEnd >= dateRange.start;
            }) as Appointment[];

        console.log(`📅 Converted ${appointments.length} reservations to calendar events`);

        return appointments;

    } catch (error) {
        console.error('❌ Error fetching reservations for calendar:', error);
        throw new Error('Nie udało się pobrać rezerwacji');
    }
};

/**
 * Checks if an appointment is a reservation
 */
export const isReservationAppointment = (appointmentId: string): boolean => {
    return appointmentId.startsWith('reservation-');
};

/**
 * Extracts reservation ID from appointment ID
 */
export const extractReservationId = (appointmentId: string): string | null => {
    if (!isReservationAppointment(appointmentId)) {
        return null;
    }
    return appointmentId.replace('reservation-', '');
};