import { Appointment, AppointmentStatus, CarReceptionProtocol, ProtocolListItem, ProtocolStatus } from '../types';
import { protocolsApi } from '../api/protocolsApi';

/**
 * Konwertuje element listy protokołów (ProtocolListItem) na obiekt wizyty w kalendarzu
 */
export const mapProtocolListItemToAppointment = (protocolItem: ProtocolListItem): Appointment => {
    // Utworzenie dat początku i końca
    const startDate = new Date(protocolItem.period.startDate);
    const endDate = new Date(protocolItem.period.endDate);

    // Domyślne ustawienie godzin (8:00 - 16:00)
    startDate.setHours(8, 0, 0, 0);
    endDate.setHours(16, 0, 0, 0);

    // Mapowanie statusu protokołu na status wizyty
    let appointmentStatus: AppointmentStatus;
    switch (protocolItem.status) {
        case ProtocolStatus.SCHEDULED:
            appointmentStatus = AppointmentStatus.SCHEDULED;
            break;
        case ProtocolStatus.IN_PROGRESS:
            appointmentStatus = AppointmentStatus.IN_PROGRESS;
            break;
        case ProtocolStatus.READY_FOR_PICKUP:
            appointmentStatus = AppointmentStatus.READY_FOR_PICKUP;
            break;
        case ProtocolStatus.COMPLETED:
            appointmentStatus = AppointmentStatus.COMPLETED;
            break;
        case ProtocolStatus.CANCELLED:
            appointmentStatus = AppointmentStatus.CANCELLED;
            break;
        default:
            appointmentStatus = AppointmentStatus.SCHEDULED;
    }

    // Przygotowanie tytułu (marka, model, nr rejestracyjny)
    const vehicleInfo = protocolItem.vehicle;
    const title = `${vehicleInfo.make} ${vehicleInfo.model} - ${vehicleInfo.licensePlate}`;

    // Notatka z podstawowymi informacjami
    const notes = `Protokół przyjęcia pojazdu\nKlient: ${protocolItem.owner.name}\nUsługi: ${protocolItem.totalServiceCount}\nWartość: ${protocolItem.totalAmount.toFixed(2)} zł`;

    // Zwracamy obiekt wizyty w kalendarzu
    return {
        id: protocolItem.id,
        title: title,
        start: startDate,
        end: endDate,
        customerId: protocolItem.owner.name,
        vehicleId: vehicleInfo.licensePlate,
        serviceType: 'car_reception_protocol',
        status: appointmentStatus,
        notes: notes,
        statusUpdatedAt: new Date().toISOString(), // Brak informacji o dacie aktualizacji statusu w ProtocolListItem
        isProtocol: true, // Dodatkowe pole do identyfikacji, że to protokół,
        calendarColorId: protocolItem.calendarColorId,
        services: protocolItem.selectedServices
    };
};

/**
 * Pobiera wszystkie protokoły poprzez API i konwertuje je na obiekty wizyt w kalendarzu
 */
export const fetchProtocolsAsAppointments = async (): Promise<Appointment[]> => {
    try {
        // Pobieramy listę protokołów z API
        const protocols = await protocolsApi.getProtocolsListWithoutPagination();
        console.log('Pobrano protokoły z API:', protocols);

        // Konwertujemy każdy element listy na wizytę w kalendarzu
        const appointments = protocols.map(mapProtocolListItemToAppointment);
        console.log('Przekonwertowane na wizyty:', appointments);

        return appointments;
    } catch (error) {
        console.error('Błąd podczas pobierania protokołów dla kalendarza:', error);
        return [];
    }
};