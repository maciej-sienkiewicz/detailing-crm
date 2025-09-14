// src/utils/calendarUtils.ts - ENHANCED VERSION WITH RECURRING EVENTS
import {Appointment, AppointmentStatus, AppointmentStatusColors} from '../types';
import {CalendarColor} from '../types/calendar';
import {format} from 'date-fns';
import {pl} from 'date-fns/locale';

export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

export interface QuickFilters {
    scheduled: boolean;
    inProgress: boolean;
    readyForPickup: boolean;
    completed: boolean;
    cancelled: boolean;
    recurringEvents: boolean; // New filter for recurring events
}

export const DEFAULT_QUICK_FILTERS: QuickFilters = {
    scheduled: true,
    inProgress: true,
    readyForPickup: false,
    completed: false,
    cancelled: false,
    recurringEvents: true // Show recurring events by default
};

export const getStatusKey = (status: AppointmentStatus): keyof QuickFilters => {
    switch (status) {
        case AppointmentStatus.SCHEDULED: return 'scheduled';
        case AppointmentStatus.IN_PROGRESS: return 'inProgress';
        case AppointmentStatus.READY_FOR_PICKUP: return 'readyForPickup';
        case AppointmentStatus.COMPLETED: return 'completed';
        case AppointmentStatus.CANCELLED: return 'cancelled';
        default: return 'scheduled';
    }
};

// Check if appointment is a recurring event
export const isRecurringEvent = (event: Appointment): boolean => {
    return (event as any).isRecurringEvent === true || event.id.startsWith('recurring-');
};

// Get appropriate color for recurring events
export const getRecurringEventColor = (event: Appointment): string => {
    if (event.status === AppointmentStatus.COMPLETED) {
        return '#10b981'; // Green for completed recurring events
    }
    if (event.status === AppointmentStatus.CANCELLED) {
        return '#ef4444'; // Red for cancelled recurring events
    }
    return '#8b5cf6'; // Purple for active recurring events
};

export const getEventBackgroundColor = (
    event: Appointment,
    calendarColors: Record<string, CalendarColor>
): string => {
    // Special handling for recurring events
    if (isRecurringEvent(event)) {
        return getRecurringEventColor(event);
    }

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

export const mapAppointmentsToFullCalendarEvents = (
    events: Appointment[],
    quickFilters: QuickFilters,
    calendarColors: Record<string, CalendarColor>
) => {
    return events
        .filter(event => {
            // Filter recurring events separately
            if (isRecurringEvent(event)) {
                return quickFilters.recurringEvents;
            }
            // Use existing status-based filtering for regular appointments
            return quickFilters[getStatusKey(event.status)];
        })
        .map(event => {
            const isRecurring = isRecurringEvent(event);
            const backgroundColor = getEventBackgroundColor(event, calendarColors);

            return {
                id: event.id,
                title: event.title,
                start: event.start,
                end: event.end,
                extendedProps: {
                    ...event,
                    description: `${event.customerId} • ${event.vehicleId || 'Brak pojazdu'}`,
                    isRecurringEvent: isRecurring
                },
                backgroundColor,
                borderColor: isRecurring ? '#6b46c1' : (event.isProtocol ? '#1a365d' : backgroundColor),
                textColor: '#ffffff',
                classNames: [
                    'professional-event',
                    `status-${event.status}`,
                    `status-${event.status.toLowerCase()}`,
                    event.isProtocol ? 'protocol-event' : 'appointment-event',
                    isRecurring ? 'recurring-event' : '',
                    event.status === AppointmentStatus.COMPLETED ? 'completed-event' : '',
                    event.status === AppointmentStatus.CANCELLED ? 'cancelled-event' : ''
                ].filter(Boolean)
            };
        });
};