import { Appointment, CarReceptionProtocol, ProtocolStatus, SelectedService, DiscountType, AppointmentStatus } from '../types';
import { mockAvailableServices } from '../api/mocks/carReceptionMocks';

/**
 * Konwertuje dane z wydarzenia w kalendarzu na szablon protokołu przyjęcia
 */
export const mapAppointmentToProtocol = (appointment: Appointment): Partial<CarReceptionProtocol> => {
    // Przygotowanie dat w formacie ISO (YYYY-MM-DD)
    const startDate = appointment.start.toISOString().split('T')[0];

    // Dla daty końcowej używamy daty początkowej + 1 dzień, jeśli nie określono inaczej
    let endDate;
    if (appointment.end) {
        endDate = appointment.end.toISOString().split('T')[0];
    } else {
        const nextDay = new Date(appointment.start);
        nextDay.setDate(nextDay.getDate() + 1);
        endDate = nextDay.toISOString().split('T')[0];
    }

    let ownerName = appointment.customerId || '';

    // Mapowanie statusu wizyty na status protokołu - używamy domyślnego statusu, jeśli nie określono
    let protocolStatus = ProtocolStatus.PENDING_APPROVAL;
    if (appointment.status) {
        switch (appointment.status) {
            case AppointmentStatus.PENDING_APPROVAL:
                protocolStatus = ProtocolStatus.PENDING_APPROVAL;
                break;
            case AppointmentStatus.CONFIRMED:
                protocolStatus = ProtocolStatus.CONFIRMED;
                break;
            case AppointmentStatus.IN_PROGRESS:
                protocolStatus = ProtocolStatus.IN_PROGRESS;
                break;
            case AppointmentStatus.READY_FOR_PICKUP:
                protocolStatus = ProtocolStatus.READY_FOR_PICKUP;
                break;
            case AppointmentStatus.COMPLETED:
                protocolStatus = ProtocolStatus.COMPLETED;
                break;
        }
    }

    return {
        startDate,
        endDate,
        licensePlate: '',
        make: '',
        model: '',
        productionYear: new Date().getFullYear(), // Domyślny rok produkcji
        mileage: 0, // Domyślny przebieg
        keysProvided: true,
        documentsProvided: true,
        ownerName,
        email: '',
        phone: '',
        notes: appointment.notes || '',
        selectedServices: [],
        status: protocolStatus
    };
};