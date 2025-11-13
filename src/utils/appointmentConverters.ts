// src/utils/appointmentConverters.ts
import { Appointment } from '../types';
import { Reservation } from '../features/reservations/api/reservationsApi';
import { isReservationAppointment, extractReservationId } from '../services/CalendarIntegrationService';
import { formatDateForBackend } from '../features/reservations/libs/dateParser';

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

    // Convert dates to backend format
    const startDate = formatDateForBackend(appointment.start);
    const endDate = formatDateForBackend(appointment.end);

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