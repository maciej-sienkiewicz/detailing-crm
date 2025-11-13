// src/utils/appointmentConverters.ts - z importem
import { Appointment } from '../types';
import { Reservation } from '../features/reservations/api/reservationsApi';
import { isReservationAppointment, extractReservationId } from '../services/CalendarIntegrationService';
// ✅ DODAJ IMPORT
import { formatDateForAPI } from '../features/reservations/libs/utils';

/**
 * Converts Appointment to Reservation
 * Returns null if appointment is not a reservation
 */
export const appointmentToReservation = (appointment: Appointment): Reservation | null => {
    if (!isReservationAppointment(appointment.id)) {
        return null;
    }

    const reservationId = extractReservationId(appointment.id);
    if (!reservationId) {
        return null;
    }

    // Map appointment services to reservation services
    const services = (appointment.services || []).map(service => ({
        id: service.id,
        name: service.name,
        basePrice: 'basePrice' in service ? service.basePrice : { priceNetto: 0, priceBrutto: 0, taxAmount: 0 },
        quantity: 'quantity' in service ? service.quantity : 1,
        finalPrice: 'finalPrice' in service ? service.finalPrice : { priceNetto: 0, priceBrutto: 0, taxAmount: 0 },
        discount: 'discountType' in service && 'discountValue' in service ? {
            discountType: service.discountType,
            discountValue: service.discountValue
        } : undefined,
        note: 'note' in service ? service.note : undefined
    }));

    // Calculate totals
    const totalPriceBrutto = services.reduce((sum, s) => sum + s.finalPrice.priceBrutto, 0);
    const totalPriceNetto = services.reduce((sum, s) => sum + s.finalPrice.priceNetto, 0);
    const totalTaxAmount = services.reduce((sum, s) => sum + s.finalPrice.taxAmount, 0);

    // ✅ POPRAWIONE: Konwertuj Date na format ISO, potem na format API
    const startDateISO = appointment.start.toISOString();
    const endDateISO = appointment.end.toISOString();

    // Konwertuj do formatu yyyy-MM-ddTHH:mm:ss dla formatDateForAPI
    const startDateFormatted = startDateISO.substring(0, 19); // "2024-01-15T10:00:00"
    const endDateFormatted = endDateISO.substring(0, 19);

    const startDate = formatDateForAPI(startDateFormatted);  // "15.01.2024 10:00"
    const endDate = formatDateForAPI(endDateFormatted);      // "15.01.2024 11:00"

    // Build reservation object
    return {
        id: reservationId,
        title: appointment.title,
        contactPhone: appointment.customerId || '',
        contactName: appointment.customerId || undefined,
        vehicleMake: appointment.vehicleId?.split(' ')[0] || '',
        vehicleModel: appointment.vehicleId?.split(' ')[1] || '',
        vehicleDisplay: appointment.vehicleId || '',
        startDate: startDate,
        endDate: endDate,
        status: 'CONFIRMED' as any,
        notes: appointment.notes,
        calendarColorId: appointment.calendarColorId || '',
        canBeConverted: appointment.status === 'SCHEDULED',
        services,
        serviceCount: services.length,
        totalPriceNetto,
        totalPriceBrutto,
        totalTaxAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

/**
 * Validates if appointment can be converted to reservation
 */
export const canConvertToReservation = (appointment: Appointment): boolean => {
    return isReservationAppointment(appointment.id);
};

/**
 * Type guard to check if appointment is a reservation
 */
export const isReservationType = (appointment: Appointment): appointment is Appointment & {
    id: `reservation-${string}`
} => {
    return isReservationAppointment(appointment.id);
};