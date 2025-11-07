// src/utils/calendarUtils.ts - ENHANCED VERSION WITH RESERVATIONS
import {Appointment, AppointmentStatus, AppointmentStatusColors} from '../types';
import {CalendarColor} from '../types/calendar';
import {format} from 'date-fns';
import {pl} from 'date-fns/locale';

export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

export interface QuickFilters {
    scheduled: boolean;       // NOW SHOWS: Reservations (not SCHEDULED protocols)
    inProgress: boolean;
    readyForPickup: boolean;
    completed: boolean;
    cancelled: boolean;
    recurringEvents: boolean;
}

export const DEFAULT_QUICK_FILTERS: QuickFilters = {
    scheduled: true,          // Show reservations by default
    inProgress: true,
    readyForPickup: false,
    completed: false,
    cancelled: false,
    recurringEvents: true
};

/**
 * Check if appointment is a reservation
 */
export const isReservation = (appointment: Appointment): boolean => {
    return appointment.id.startsWith('reservation-') || (appointment as any).isReservation === true;
};

/**
 * Check if appointment is a recurring event
 */
export const isRecurringEvent = (event: Appointment): boolean => {
    return (event as any).isRecurringEvent === true || event.id.startsWith('recurring-');
};

/**
 * Get status key for filtering - handles reservations specially
 */
export const getStatusKey = (appointment: Appointment): keyof QuickFilters | null => {
    // Reservations always map to 'scheduled' filter
    if (isReservation(appointment)) {
        return 'scheduled';
    }

    // Recurring events have their own filter
    if (isRecurringEvent(appointment)) {
        return 'recurringEvents';
    }

    // Regular protocol status mapping (SCHEDULED protocols are NOT shown in 'scheduled' filter)
    switch (appointment.status) {
        case AppointmentStatus.SCHEDULED:
            // IMPORTANT: SCHEDULED protocols are no longer shown in 'scheduled' filter
            // They would need their own filter or be hidden
            return null; // This will filter them out
        case AppointmentStatus.IN_PROGRESS:
            return 'inProgress';
        case AppointmentStatus.READY_FOR_PICKUP:
            return 'readyForPickup';
        case AppointmentStatus.COMPLETED:
            return 'completed';
        case AppointmentStatus.CANCELLED:
            return 'cancelled';
        default:
            return null;
    }
};

/**
 * Get appropriate color for recurring events
 */
export const getRecurringEventColor = (event: Appointment): string => {
    if (event.status === AppointmentStatus.COMPLETED) {
        return '#10b981'; // Green for completed recurring events
    }
    if (event.status === AppointmentStatus.CANCELLED) {
        return '#ef4444'; // Red for cancelled recurring events
    }
    return '#8b5cf6'; // Purple for active recurring events
};

/**
 * Get appropriate color for reservations
 */
export const getReservationColor = (reservation: Appointment): string => {
    if (reservation.status === AppointmentStatus.CANCELLED) {
        return '#ef4444'; // Red for cancelled reservations
    }
    return '#3b82f6'; // Blue for confirmed reservations
};

/**
 * Get event background color based on type and status
 */
export const getEventBackgroundColor = (
    event: Appointment,
    calendarColors: Record<string, CalendarColor>
): string => {
    // Special handling for reservations
    if (isReservation(event)) {
        // Use calendar color if available, otherwise default reservation color
        if (event.calendarColorId && calendarColors[event.calendarColorId]) {
            return calendarColors[event.calendarColorId].color;
        }
        return getReservationColor(event);
    }

    // Special handling for recurring events
    if (isRecurringEvent(event)) {
        return getRecurringEventColor(event);
    }

    // Regular protocols use calendar color or status color
    if (event.calendarColorId && calendarColors[event.calendarColorId]) {
        return calendarColors[event.calendarColorId].color;
    }
    return AppointmentStatusColors[event.status];
};

export const getCurrentPeriodTitle = (currentDate: Date, currentView: CalendarView): string => {
    switch (currentView) {
        case 'dayGridMonth':
            return format(currentDate, 'LLLL yyyy', { locale: pl });
        case 'timeGridWeek':
            return `Tydzień ${format(currentDate, 'w, LLLL yyyy', { locale: pl })}`;
        case 'timeGridDay':
            return format(currentDate, 'EEEE, dd LLLL yyyy', { locale: pl });
        case 'listWeek':
            return `Lista - ${format(currentDate, 'LLLL yyyy', { locale: pl })}`;
        default:
            return format(currentDate, 'LLLL yyyy', { locale: pl });
    }
};

/**
 * Map appointments to FullCalendar events with proper filtering
 */
export const mapAppointmentsToFullCalendarEvents = (
    events: Appointment[],
    quickFilters: QuickFilters,
    calendarColors: Record<string, CalendarColor>
) => {
    return events
        .filter(event => {
            // Handle reservations
            if (isReservation(event)) {
                return quickFilters.scheduled;
            }

            // Handle recurring events
            if (isRecurringEvent(event)) {
                return quickFilters.recurringEvents;
            }

            // Handle regular protocols by status
            const statusKey = getStatusKey(event);
            if (!statusKey) return false; // Filter out SCHEDULED protocols

            return quickFilters[statusKey];
        })
        .map(event => {
            const isRecurr = isRecurringEvent(event);
            const isReserv = isReservation(event);
            const backgroundColor = getEventBackgroundColor(event, calendarColors);

            // Build class names
            const classNames = [
                'professional-event',
                `status-${event.status}`,
                `status-${event.status.toLowerCase()}`
            ];

            if (event.isProtocol) classNames.push('protocol-event');
            if (isReserv) classNames.push('reservation-event');
            if (isRecurr) classNames.push('recurring-event');
            if (event.status === AppointmentStatus.COMPLETED) classNames.push('completed-event');
            if (event.status === AppointmentStatus.CANCELLED) classNames.push('cancelled-event');

            return {
                id: event.id,
                title: event.title,
                start: event.start,
                end: event.end,
                extendedProps: {
                    ...event,
                    description: `${event.customerId} • ${event.vehicleId || 'Brak pojazdu'}`,
                    isRecurringEvent: isRecurr,
                    isReservation: isReserv
                },
                backgroundColor,
                borderColor: isRecurr
                    ? '#6b46c1'
                    : isReserv
                        ? '#2563eb'
                        : (event.isProtocol ? '#1a365d' : backgroundColor),
                textColor: '#ffffff',
                classNames: classNames.filter(Boolean)
            };
        });
};