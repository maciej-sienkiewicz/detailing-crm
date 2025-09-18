// src/services/ProtocolCalendarService.ts - FIXED VERSION
import {VisitListItem, visitsApi} from '../api/visitsApiNew';
import {Appointment, AppointmentStatus, DiscountType, ServiceApprovalStatus} from '../types';
import {CarReceptionProtocol, ProtocolStatus} from '../types/protocol';

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

// Convert VisitListItem to Appointment for calendar display
const convertVisitListItemToAppointment = (visit: VisitListItem): Appointment => {
    // Bezpieczne parsowanie dat z zagnieżdżonego obiektu period
    const startDate = new Date(visit.period.startDate);
    const endDate = new Date(visit.period.endDate);

    // Tworzenie czytelnego opisu pojazdu
    const vehicleDescription = `${visit.vehicle.make} ${visit.vehicle.model} ${visit.vehicle.licensePlate}`.trim();

    // Nazwa klienta (może być firma lub osoba prywatna)
    const clientName = visit.owner.companyName || visit.owner.name;

    return {
        id: visit.id,
        title: visit.title || `${clientName} - ${visit.vehicle.licensePlate}`,
        start: startDate,
        end: endDate,
        customerId: clientName,
        vehicleId: vehicleDescription,
        serviceType: 'protocol',
        status: mapProtocolStatusToAppointmentStatus(visit.status),
        notes: '',
        isProtocol: true,
        statusUpdatedAt: visit.lastUpdate,
        calendarColorId: visit.calendarColorId,
        // FIXED: Add missing description and vatRate properties to services mapping
        services: visit.selectedServices?.map(service => ({
            id: service.id,
            name: service.name,
            price: service.price,
            description: service.note || '', // FIXED: Use note as description or empty string
            vatRate: 23, // FIXED: Add default VAT rate (23% for Poland)
            discountType: (service.discountType as DiscountType) || DiscountType.PERCENTAGE,
            discountValue: service.discountValue || 0,
            finalPrice: service.finalPrice,
            approvalStatus: (service.approvalStatus as ServiceApprovalStatus) || ServiceApprovalStatus.PENDING
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
        // FIXED: Add missing description and vatRate properties to services mapping
        services: protocol.selectedServices?.map(service => ({
            id: service.id,
            name: service.name,
            price: service.price,
            description: service.note || '', // FIXED: Use note as description or empty string
            vatRate: 23, // FIXED: Add default VAT rate (23% for Poland)
            discountType: service.discountType,
            discountValue: service.discountValue,
            finalPrice: service.finalPrice,
            approvalStatus: service.approvalStatus
        })) || []
    };
};

/**
 * Fetch protocols and convert them to appointments for calendar display using new visitsApiNew
 * @param dateRange Optional date range filter
 * @returns Promise<Appointment[]>
 */
export const fetchProtocolsAsAppointments = async (dateRange?: { start: Date; end: Date }): Promise<Appointment[]> => {
    try {
        // Prepare filter parameters based on date range
        const filterParams = dateRange ? {
            startDate: dateRange.start.toISOString().split('T')[0],
            endDate: dateRange.end.toISOString().split('T')[0],
            page: 0,
            size: 1000 // Set pagination to 1000 records per page
        } : {
            page: 0,
            size: 1000 // Set pagination to 1000 records per page
        };

        console.log('🚀 Fetching visits using visitsApiNew with params:', filterParams);

        // Fetch visits using new API
        const visitsResult = await visitsApi.getVisitsList(filterParams);

        if (!visitsResult.success || !visitsResult.data) {
            console.error('❌ Failed to fetch visits:', visitsResult.error);
            return [];
        }

        const visits = visitsResult.data.data; // Extract visits from paginated response

        console.log('✅ Successfully fetched visits:', {
            count: visits.length,
            totalItems: visitsResult.data.pagination.totalItems,
            currentPage: visitsResult.data.pagination.currentPage,
            hasNext: visitsResult.data.pagination.hasNext,
            dateRange: dateRange ? {
                start: dateRange.start.toISOString().split('T')[0],
                end: dateRange.end.toISOString().split('T')[0]
            } : 'no date range'
        });

        // Convert visits to appointments
        const appointments = visits
            .map(convertVisitListItemToAppointment)
            .filter(appointment => {
                // Additional client-side filtering if needed
                if (dateRange) {
                    return isDateInRange(appointment.start, dateRange) ||
                        isDateInRange(appointment.end, dateRange);
                }
                return true;
            });

        console.log(`📅 Converted ${appointments.length} visits to appointments`, {
            dateRange,
            totalVisits: visits.length,
            convertedAppointments: appointments.length,
            sampleAppointments: appointments.slice(0, 3).map(apt => ({
                id: apt.id,
                title: apt.title,
                status: apt.status,
                start: apt.start.toISOString().split('T')[0]
            }))
        });

        return appointments;
    } catch (error) {
        console.error('❌ Error fetching visits as appointments:', error);

        // Return empty array instead of throwing to prevent calendar from breaking
        return [];
    }
};

/**
 * Get a single protocol as an appointment - using legacy protocolsApi for detailed view
 * @param protocolId Protocol ID
 * @returns Promise<Appointment | null>
 */
export const getProtocolAsAppointment = async (protocolId: string): Promise<Appointment | null> => {
    try {
        // Import legacy API for detailed protocol view
        const { protocolsApi } = await import('../api/protocolsApi');

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
 * Update protocol status through calendar interface - using legacy protocolsApi
 * @param protocolId Protocol ID (without protocol- prefix)
 * @param newStatus New appointment status
 * @returns Promise<Appointment | null>
 */
export const updateProtocolStatusFromCalendar = async (
    protocolId: string,
    newStatus: AppointmentStatus
): Promise<Appointment | null> => {
    try {
        // Import legacy API for status updates
        const { protocolsApi } = await import('../api/protocolsApi');

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