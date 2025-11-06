import { Reservation } from '../api/reservationsApi';
import { CarReceptionProtocol, SelectedService } from '../../../types';

export const mapReservationToProtocol = (reservation: Reservation): Partial<CarReceptionProtocol> => {
    const convertDate = (date: string | number[] | undefined): string => {
        if (!date) return '';

        if (Array.isArray(date)) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = date;
            const pad = (n: number) => String(n).padStart(2, '0');
            return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`;
        }

        return String(date);
    };

    const mappedServices: SelectedService[] = reservation.services.map(service => ({
        id: service.id,
        name: service.name,
        quantity: service.quantity,
        basePrice: service.basePrice,
        discountType: 'PERCENTAGE' as any,
        discountValue: 0,
        finalPrice: service.finalPrice,
        note: service.note,
        approvalStatus: undefined
    }));

    return {
        title: reservation.title,
        ownerName: reservation.contactName || '',
        phone: reservation.contactPhone,
        make: reservation.vehicleMake,
        model: reservation.vehicleModel,
        startDate: convertDate(reservation.startDate as any),
        endDate: convertDate(reservation.endDate as any),
        selectedServices: mappedServices,
        notes: reservation.notes || '',
        calendarColorId: reservation.calendarColorId
    };
};