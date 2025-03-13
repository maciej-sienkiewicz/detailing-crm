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

    // Próba wyodrębnienia informacji o pojeździe z tytułu wizyty
    let make = '';
    let model = '';
    let licensePlate = appointment.vehicleId || '';

    // Próba wyciągnięcia marki i modelu z tytułu (np. "Audi A6 - Mycie detailingowe")
    const titleParts = appointment.title.split('-').map(part => part.trim());
    if (titleParts.length > 0) {
        const carParts = titleParts[0].split(' ');
        if (carParts.length >= 2) {
            make = carParts[0];
            model = carParts.slice(1).join(' ');
        } else {
            make = titleParts[0]; // Cały pierwszy segment jako marka
        }
    }

    // Podstawowa usługa bazująca na tytule wizyty lub typie serwisu
    const serviceName = titleParts.length > 1 ? titleParts[1] : appointment.title;

    // Znajdowanie usługi z mockowych danych, która najlepiej pasuje do nazwy wizyty
    const matchedService = mockAvailableServices.find(
        service => service.name.toLowerCase().includes(serviceName.toLowerCase())
    ) || mockAvailableServices[0]; // Domyślna wartość

    // Tworzenie pozycji usługi
    const selectedService: SelectedService = {
        id: matchedService.id,
        name: matchedService.name,
        price: matchedService.price,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 0,
        finalPrice: matchedService.price
    };

    // Wyodrębnienie nazwy i danych kontaktowych klienta
    let ownerName = appointment.customerId || '';
    let phone = '';
    let email = '';

    // Próba wyciągnięcia numeru telefonu z notatek
    if (appointment.notes) {
        // Szukanie wzorca numeru telefonu w notatkach
        const phoneMatch = appointment.notes.match(/(\+\d{2}\s\d{3}\s\d{3}\s\d{3}|\+\d{11}|\d{9})/);
        if (phoneMatch) {
            phone = phoneMatch[0];
        }

        // Szukanie adresu email w notatkach
        const emailMatch = appointment.notes.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
            email = emailMatch[0];
        }
    }

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
        licensePlate,
        make,
        model,
        productionYear: new Date().getFullYear(), // Domyślny rok produkcji
        mileage: 0, // Domyślny przebieg
        keysProvided: true,
        documentsProvided: true,
        ownerName,
        email: email || '',
        phone: phone || '',
        notes: appointment.notes || '',
        selectedServices: [selectedService],
        status: protocolStatus
    };
};