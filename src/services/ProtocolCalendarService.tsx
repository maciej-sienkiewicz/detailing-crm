// src/services/ProtocolCalendarService.ts - FIXED VERSION
import { protocolsApi } from '../api/protocolsApi';
import { Appointment, AppointmentStatus } from '../types';
import { ProtocolListItem, ProtocolStatus, CarReceptionProtocol } from '../types/protocol';

// Helper function to check if date is in range
const isDateInRange = (date: Date, range?: { start: Date; end: Date }): boolean => {
    if (!range) return true;
    return date >= range.start && date <= range.end;
};

// Map protocol status to appointment status
const mapProtocolStatusToAppointmentStatus = (protocolStatus: ProtocolStatus): AppointmentStatus => {
    switch (protocolStatus) {
        case ProtocolStatus.SCHEDULED:
            return AppointmentStatus.SCHEDULED;
        case ProtocolStatus.IN_PROGRESS:
            return AppointmentStatus.IN_PROGRESS;
        case ProtocolStatus.READY_FOR_PICKUP:
            return AppointmentStatus.READY_FOR_PICKUP;
        case ProtocolStatus.COMPLETED:
            return AppointmentStatus.COMPLETED;
        case ProtocolStatus.CANCELLED:
            return AppointmentStatus.CANCELLED;
        default:
            return AppointmentStatus.SCHEDULED;
    }
};

// Convert ProtocolListItem to Appointment for calendar display
const convertProtocolListItemToAppointment = (protocol: ProtocolListItem): Appointment => {
    // Bezpieczne parsowanie dat z zagnieżdżonego obiektu period
    const startDate = new Date(protocol.period.startDate);
    const endDate = new Date(protocol.period.endDate);

    // Tworzenie czytelnego opisu pojazdu
    const vehicleDescription = `${protocol.vehicle.make} ${protocol.vehicle.model} ${protocol.vehicle.licensePlate}`.trim();

    // Nazwa klienta (może być firma lub osoba prywatna)
    const clientName = protocol.owner.companyName || protocol.owner.name;

    return {
        id: `protocol-${protocol.id}`,
        title: protocol.title || `${clientName} - ${protocol.vehicle.licensePlate}`,
        start: startDate,
        end: endDate,
        customerId: clientName,
        vehicleId: vehicleDescription,
        serviceType: 'protocol',
        status: mapProtocolStatusToAppointmentStatus(protocol.status),
        notes: '', // ProtocolListItem nie ma description/notes
        isProtocol: true,
        statusUpdatedAt: protocol.lastUpdate,
        services: protocol.selectedServices?.map(service => ({
            id: service.id,
            name: service.name,
            price: service.price,
            discountType: service.discountType,
            discountValue: service.discountValue,
            finalPrice: service.finalPrice,
            approvalStatus: service.approvalStatus
        })) || []
    };
};

// Convert CarReceptionProtocol to Appointment for calendar display
const convertCarReceptionProtocolToAppointment = (protocol: CarReceptionProtocol): Appointment => {
    const startDate = new Date(protocol.startDate);
    const endDate = new Date(protocol.endDate);

    // Tworzenie czytelnego opisu pojazdu
    const vehicleDescription = `${protocol.make} ${protocol.model} ${protocol.licensePlate}`.trim();

    // Nazwa klienta (może być firma lub osoba prywatna)
    const clientName = protocol.companyName || protocol.ownerName;

    return {
        id: `protocol-${protocol.id}`,
        title: protocol.title || `${clientName} - ${protocol.licensePlate}`,
        start: startDate,
        end: endDate,
        customerId: clientName,
        vehicleId: vehicleDescription,
        serviceType: 'protocol',
        status: mapProtocolStatusToAppointmentStatus(protocol.status),
        notes: protocol.notes || '',
        isProtocol: true,
        statusUpdatedAt: protocol.statusUpdatedAt,
        services: protocol.selectedServices?.map(service => ({
            id: service.id,
            name: service.name,
            price: service.price,
            discountType: service.discountType,
            discountValue: service.discountValue,
            finalPrice: service.finalPrice,
            approvalStatus: service.approvalStatus
        })) || []
    };
};

/**
 * Fetch protocols and convert them to appointments for calendar display
 * @param dateRange Optional date range filter
 * @returns Promise<Appointment[]>
 */
export const fetchProtocolsAsAppointments = async (dateRange?: { start: Date; end: Date }): Promise<Appointment[]> => {
    try {
        // Prepare filter parameters based on date range
        const filterParams = dateRange ? {
            startDate: dateRange.start.toISOString().split('T')[0],
            endDate: dateRange.end.toISOString().split('T')[0]
        } : {};

        // Fetch protocols from API
        const protocolsResponse = await protocolsApi.getProtocolsListWithoutPagination(filterParams);

        // Convert protocols to appointments
        const appointments = protocolsResponse
            .map(convertProtocolListItemToAppointment)
            .filter(appointment => {
                // Additional client-side filtering if needed
                if (dateRange) {
                    return isDateInRange(appointment.start, dateRange) ||
                        isDateInRange(appointment.end, dateRange);
                }
                return true;
            });

        console.log(`Loaded ${appointments.length} protocols as appointments`, {
            dateRange,
            totalProtocols: protocolsResponse.length,
            convertedAppointments: appointments.length
        });

        return appointments;
    } catch (error) {
        console.error('Error fetching protocols as appointments:', error);

        // Return empty array instead of throwing to prevent calendar from breaking
        return [];
    }
};

/**
 * Get a single protocol as an appointment
 * @param protocolId Protocol ID
 * @returns Promise<Appointment | null>
 */
export const getProtocolAsAppointment = async (protocolId: string): Promise<Appointment | null> => {
    try {
        const protocol = await protocolsApi.getProtocolDetails(protocolId);
        if (!protocol) {
            return null;
        }

        // Convert CarReceptionProtocol to appointment format
        return convertCarReceptionProtocolToAppointment(protocol);
    } catch (error) {
        console.error(`Error fetching protocol ${protocolId} as appointment:`, error);
        return null;
    }
};

/**
 * Update protocol status through calendar interface
 * @param protocolId Protocol ID (without protocol- prefix)
 * @param newStatus New appointment status
 * @returns Promise<Appointment | null>
 */
export const updateProtocolStatusFromCalendar = async (
    protocolId: string,
    newStatus: AppointmentStatus
): Promise<Appointment | null> => {
    try {
        // Convert appointment status back to protocol status
        let protocolStatus: ProtocolStatus;
        switch (newStatus) {
            case AppointmentStatus.SCHEDULED:
                protocolStatus = ProtocolStatus.SCHEDULED;
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
            case AppointmentStatus.CANCELLED:
                protocolStatus = ProtocolStatus.CANCELLED;
                break;
            default:
                protocolStatus = ProtocolStatus.SCHEDULED;
        }

        // Update protocol status via API
        const updatedProtocol = await protocolsApi.updateProtocolStatus(
            protocolId.replace('protocol-', ''),
            protocolStatus
        );

        if (!updatedProtocol) {
            throw new Error('Failed to update protocol status');
        }

        // Convert updated protocol back to appointment
        return convertCarReceptionProtocolToAppointment(updatedProtocol);
    } catch (error) {
        console.error(`Error updating protocol status for ${protocolId}:`, error);
        return null;
    }
};

/**
 * Check if an appointment ID represents a protocol
 * @param appointmentId Appointment ID to check
 * @returns boolean
 */
export const isProtocolAppointment = (appointmentId: string): boolean => {
    return appointmentId.startsWith('protocol-');
};

/**
 * Extract protocol ID from appointment ID
 * @param appointmentId Appointment ID
 * @returns Protocol ID or null if not a protocol appointment
 */
export const extractProtocolId = (appointmentId: string): string | null => {
    if (isProtocolAppointment(appointmentId)) {
        return appointmentId.replace('protocol-', '');
    }
    return null;
};