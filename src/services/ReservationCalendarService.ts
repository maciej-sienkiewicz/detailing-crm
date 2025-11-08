// src/services/ReservationCalendarService.ts
/**
 * Service for integrating Reservations with Calendar
 * Converts reservation data to calendar appointment format
 */

import { Appointment, AppointmentStatus } from '../types';
import { Reservation, reservationsApi, ReservationStatus } from '../features/reservations/api/reservationsApi';

/**
 * Converts backend reservation to calendar appointment
 */
const convertReservationToAppointment = (reservation: Reservation): Appointment => {
    // Map reservation status to appointment status
    let appointmentStatus: AppointmentStatus;
    console.log(reservation.status)
    switch (reservation.status) {
        case ReservationStatus.CONFIRMED:
            appointmentStatus = AppointmentStatus.SCHEDULED;
            break;
        case ReservationStatus.CANCELLED:
            appointmentStatus = AppointmentStatus.CANCELLED;
            break;
        case ReservationStatus.CONVERTED:
            // Skip converted reservations - they're now full visits
            return null as any;
        default:
            appointmentStatus = AppointmentStatus.SCHEDULED;
    }



    // Parse dates - handle both string and array formats
    const parseDate = (dateValue: string | number[]): Date => {
        // ➡️ Logika dla tablicy (pozostawiona bez zmian, jest poprawna,
        // pamiętając o indeksowaniu miesiąca od 0).
        if (Array.isArray(dateValue)) {
            // [rok, miesiąc (1-12), dzień, godzina, minuta, sekunda]
            const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
            // Miesiąc w konstruktorze Date jest indeksowany od 0 (styczeń = 0)
            return new Date(year, month - 1, day, hour, minute, second);
        }

        // ➡️ Logika dla stringa (ZAKTUALIZOWANA)
        if (typeof dateValue === 'string') {
            // Sprawdzenie, czy string jest w formacie DD.MM.RRRR
            if (dateValue.includes('.')) {
                // Rozdzielenie na części: [0] = Dzień, [1] = Miesiąc, [2] = Rok
                const [day, month, year] = dateValue.split('.');

                // Przeorganizowanie na bezpieczny format ISO RRRR-MM-DD
                const isoFormat = `${year}-${month}-${day}`;

                return new Date(isoFormat);
            }

            // Domyślna obsługa innych stringów (np. RRRR/MM/DD, timestampy, etc.)
            return new Date(dateValue);
        }

        // Zwrócenie 'Invalid Date' lub domyślnej daty, jeśli typ jest nieoczekiwany (choć typowanie to wyklucza)
        return new Date('Invalid Date');
    };

    console.log("dupa")
    console.log(reservation.startDate)
    console.log(reservation.endDate)

    return {
        id: `reservation-${reservation.id}`,
        title: reservation.title,
        start: parseDate(reservation.startDate),
        end: parseDate(reservation.endDate || reservation.startDate),
        customerId: reservation.contactPhone, // Use phone as identifier
        vehicleId: reservation.vehicleDisplay,
        serviceType: 'reservation',
        status: appointmentStatus,
        notes: reservation.notes,
        isProtocol: false, // Reservations are NOT protocols
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
        // Mark as reservation for filtering
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
        // We don't filter by date on API level as backend might not support it
        const response = await reservationsApi.listReservations({
            status: ReservationStatus.CONFIRMED,
            sortBy: 'startDate',
            sortDirection: 'ASC',
            size: 1000 // Large size to get all reservations
        });

        console.log(`✅ Fetched ${response.data.length} reservations from API`);

        // Convert to appointments and filter by date range
        const appointments = response.data
            .map(convertReservationToAppointment)
            .filter(apt => {
                console.log(apt)
                if (!apt) return false; // Skip converted reservations

                // Filter by date range
                const aptStart = new Date(apt.start);
                console.log(apt.end);
                const aptEnd = new Date(apt.end);

                console.log(aptStart)
                console.log(`end: ${apt.end}`)
                console.log(aptStart <= dateRange.end && aptEnd >= dateRange.start)

                return aptStart <= dateRange.end && aptEnd >= dateRange.start;
            });

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