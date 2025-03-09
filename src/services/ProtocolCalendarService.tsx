import { Appointment, AppointmentStatus, CarReceptionProtocol } from '../types';
import { fetchCarReceptionProtocols } from '../api/mocks/carReceptionMocks';

/**
 * Konwertuje protokół przyjęcia pojazdu na obiekt wizyt w kalendarzu
 */
export const mapProtocolToAppointment = (protocol: CarReceptionProtocol): Appointment => {
    // Utworzenie dat początku i końca
    const startDate = new Date(protocol.startDate);
    const endDate = new Date(protocol.endDate);

    // Domyślne ustawienie godzin (8:00 - 16:00)
    startDate.setHours(8, 0, 0, 0);
    endDate.setHours(16, 0, 0, 0);

    // Mapowanie statusu protokołu na status wizyty
    let appointmentStatus: AppointmentStatus;
    switch (protocol.status) {
        case 'PENDING_APPROVAL':
            appointmentStatus = AppointmentStatus.PENDING_APPROVAL;
            break;
        case 'CONFIRMED':
            appointmentStatus = AppointmentStatus.CONFIRMED;
            break;
        case 'IN_PROGRESS':
            appointmentStatus = AppointmentStatus.IN_PROGRESS;
            break;
        case 'READY_FOR_PICKUP':
            appointmentStatus = AppointmentStatus.READY_FOR_PICKUP;
            break;
        case 'COMPLETED':
            appointmentStatus = AppointmentStatus.COMPLETED;
            break;
        default:
            appointmentStatus = AppointmentStatus.PENDING_APPROVAL;
    }

    // Przygotowanie listy usług do notatki
    const servicesList = protocol.selectedServices
        .map(service => `- ${service.name}`)
        .join('\n');

    // Obliczenie łącznej wartości usług
    const totalValue = protocol.selectedServices.reduce(
        (sum, service) => sum + service.finalPrice,
        0
    );

    // Zwracamy obiekt wizyty w kalendarzu
    return {
        id: `protocol-${protocol.id}`,
        title: `${protocol.make} ${protocol.model} - ${protocol.licensePlate}`,
        start: startDate,
        end: endDate,
        customerId: protocol.ownerName,
        vehicleId: protocol.licensePlate,
        serviceType: 'car_reception_protocol',
        status: appointmentStatus,
        notes: `Protokół przyjęcia pojazdu\nTel: ${protocol.phone}\nUsługi:\n${servicesList}\nWartość: ${totalValue.toFixed(2)} zł`,
        statusUpdatedAt: protocol.statusUpdatedAt || protocol.createdAt,
        isProtocol: true // Dodatkowe pole do identyfikacji, że to protokół
    };
};

/**
 * Pobiera wszystkie protokoły i konwertuje je na obiekty wizyt w kalendarzu
 */
export const fetchProtocolsAsAppointments = async (): Promise<Appointment[]> => {
    try {
        const protocols = await fetchCarReceptionProtocols();
        return protocols.map(mapProtocolToAppointment);
    } catch (error) {
        console.error('Błąd podczas pobierania protokołów dla kalendarza:', error);
        return [];
    }
};