// src/services/CalendarIntegrationService.ts - ENHANCED VERSION WITH RESERVATIONS
/**
 * Unified service for fetching calendar data from multiple sources
 * Handles protocols, reservations, and recurring events
 */

import {Appointment, AppointmentStatus} from '../types';
import {fetchProtocolsAsAppointments} from './ProtocolCalendarService';
import {fetchReservationsAsAppointments} from './ReservationCalendarService';
import {recurringEventsApi} from '../api/recurringEventsApi';

// Convert recurring event occurrence to calendar appointment format
const convertOccurrenceToAppointment = (occurrence: any): Appointment => {
    const startDate = new Date(occurrence.scheduledDate);
    const endDate = new Date(startDate);

    // Używamy szczegółów wydarzenia już dostępnych w odpowiedzi
    const eventDetails = occurrence.recurringEventDetails;

    // Jeśli mamy szczegóły wydarzenia, używamy szacowanego czasu trwania
    if (eventDetails?.visitTemplate?.estimatedDurationMinutes) {
        endDate.setMinutes(startDate.getMinutes() + eventDetails.visitTemplate.estimatedDurationMinutes);
    } else {
        endDate.setHours(endDate.getHours() + 1); // Domyślnie 1 godzina
    }

    // Mapowanie statusu z OccurrenceStatus na AppointmentStatus
    let appointmentStatus;
    switch (occurrence.status) {
        case 'PLANNED':
            appointmentStatus = 'SCHEDULED';
            break;
        case 'COMPLETED':
            appointmentStatus = 'COMPLETED';
            break;
        case 'CONVERTED_TO_VISIT':
            appointmentStatus = 'COMPLETED';
            break;
        case 'SKIPPED':
            appointmentStatus = 'CANCELLED';
            break;
        case 'CANCELLED':
            appointmentStatus = 'CANCELLED';
            break;
        default:
            appointmentStatus = 'SCHEDULED';
    }

    // Tworzenie tytułu i szczegółów z danych już dostępnych w odpowiedzi
    let title = 'Cykliczne wydarzenie';
    let customerId = '';
    let vehicleId = '';

    if (eventDetails) {
        title = eventDetails.title || title;

        // Informacje o kliencie i pojeździe z szablonu wizyty
        if (eventDetails.visitTemplate) {
            if (eventDetails.visitTemplate.clientId) {
                customerId = `Klient #${eventDetails.visitTemplate.clientId}`;
            }
            if (eventDetails.visitTemplate.vehicleId) {
                vehicleId = `Pojazd #${eventDetails.visitTemplate.vehicleId}`;
            }
        }
    }

    return {
        id: `recurring-${occurrence.id}`,
        title: title,
        start: startDate,
        end: endDate,
        customerId: customerId,
        vehicleId: vehicleId,
        serviceType: 'recurring_event',
        status: appointmentStatus as any,
        notes: occurrence.notes || '',
        isProtocol: false,
        isRecurringEvent: true, // Ważne: oznaczenie jako wydarzenie cykliczne
        statusUpdatedAt: occurrence.updatedAt,
        recurringEventData: occurrence, // Przechowywanie pełnych danych
        services: eventDetails?.visitTemplate?.defaultServices?.map((service: any) => ({
            id: `template-${service.name}`,
            name: service.name,
            price: service.basePrice,
            discountType: 'PERCENTAGE' as any,
            discountValue: 0,
            finalPrice: service.basePrice,
            approvalStatus: 'PENDING' as any
        })) || []
    };
};

export interface CalendarData {
    appointments: Appointment[]; // Regular appointments (if any)
    protocols: Appointment[];    // Visits/protocols
    reservations: Appointment[]; // Reservations (NEW)
    recurringEvents: Appointment[]; // Recurring event occurrences
    errors: string[]; // Track any errors from individual sources
}

/**
 * ENHANCED: Fetch all calendar data from multiple sources with reservations
 */
export const fetchCalendarData = async (dateRange?: { start: Date; end: Date }): Promise<CalendarData> => {
    const errors: string[] = [];
    let appointments: Appointment[] = [];
    let protocols: Appointment[] = [];
    let reservations: Appointment[] = [];
    let recurringEvents: Appointment[] = [];

    try {
        // 1. Fetch protocols (visits) - existing implementation
        const protocolsPromise = fetchProtocolsAsAppointments(dateRange).catch(err => {
            console.error('Error fetching protocols:', err);
            errors.push('Nie udało się załadować protokołów');
            return [];
        });

        // 2. Fetch reservations (NEW)
        const reservationsPromise = fetchReservationsAsAppointments(dateRange || {
            start: new Date(),
            end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year ahead
        }).catch(err => {
            console.error('Error fetching reservations:', err);
            errors.push('Nie udało się załadować rezerwacji');
            return [];
        });

        // 3. Fetch recurring events with full details in single request
        let recurringEventsPromise: Promise<Appointment[]>;

        if (dateRange) {
            const startDateStr = dateRange.start.toISOString().split('T')[0];
            const endDateStr = dateRange.end.toISOString().split('T')[0];

            recurringEventsPromise = recurringEventsApi.getEventCalendarWithDetails({
                startDate: startDateStr,
                endDate: endDateStr
            }).then(occurrences => {
                // Konwersja wszystkich wystąpień na appointments
                return occurrences.map(occurrence => convertOccurrenceToAppointment(occurrence));
            }).catch(err => {
                console.error('Error fetching recurring events:', err);
                errors.push('Nie udało się załadować cyklicznych wydarzeń');
                return [];
            });
        } else {
            // Jeśli brak zakresu dat, zwracamy pustą listę
            recurringEventsPromise = Promise.resolve([]);
        }

        // Wykonaj wszystkie zapytania równolegle
        const [protocolsResult, reservationsResult, recurringEventsResult] = await Promise.all([
            protocolsPromise,
            reservationsPromise,
            recurringEventsPromise
        ]);

        protocols = protocolsResult;
        reservations = reservationsResult;
        recurringEvents = recurringEventsResult.filter(x => x.status == AppointmentStatus.SCHEDULED);

        console.log('✅ Calendar data fetched:', {
            protocols: protocols.length,
            reservations: reservations.length,
            recurringEvents: recurringEvents.length,
            errors: errors.length
        });

    } catch (err) {
        console.error('Critical error fetching calendar data:', err);
        errors.push('Wystąpił krytyczny błąd podczas ładowania kalendarza');
    }

    return {
        appointments, // Puste na razie - można rozszerzyć o zwykłe wizyty
        protocols,
        reservations,
        recurringEvents,
        errors
    };
};

/**
 * Check if appointment ID represents a recurring event
 */
export const isRecurringEventAppointment = (appointmentId: string): boolean => {
    return appointmentId.startsWith('recurring-');
};

/**
 * Check if appointment ID represents a reservation
 */
export const isReservationAppointment = (appointmentId: string): boolean => {
    return appointmentId.startsWith('reservation-');
};

/**
 * Extract occurrence ID from recurring event appointment ID
 */
export const extractOccurrenceId = (appointmentId: string): string | null => {
    if (isRecurringEventAppointment(appointmentId)) {
        return appointmentId.replace('recurring-', '');
    }
    return null;
};

/**
 * Extract reservation ID from reservation appointment ID
 */
export const extractReservationId = (appointmentId: string): string | null => {
    if (isReservationAppointment(appointmentId)) {
        return appointmentId.replace('reservation-', '');
    }
    return null;
};