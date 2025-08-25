// src/utils/calendarUtils.ts
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
}

export const DEFAULT_QUICK_FILTERS: QuickFilters = {
    scheduled: true,
    inProgress: true,
    readyForPickup: false,
    completed: false,
    cancelled: false
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

export const getEventBackgroundColor = (
    event: Appointment,
    calendarColors: Record<string, CalendarColor>
): string => {
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
        .filter(event => quickFilters[getStatusKey(event.status)])
        .map(event => ({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            extendedProps: {
                ...event,
                description: `${event.customerId} • ${event.vehicleId || 'Brak pojazdu'}`
            },
            backgroundColor: getEventBackgroundColor(event, calendarColors),
            borderColor: event.isProtocol ? '#1a365d' : getEventBackgroundColor(event, calendarColors),
            textColor: '#ffffff',
            classNames: [
                'professional-event',
                `status-${event.status}`,
                `status-${event.status.toLowerCase()}`,
                event.isProtocol ? 'protocol-event' : 'appointment-event',
                event.status === AppointmentStatus.COMPLETED ? 'completed-event' : '',
                event.status === AppointmentStatus.CANCELLED ? 'cancelled-event' : ''
            ].filter(Boolean)
        }));
};