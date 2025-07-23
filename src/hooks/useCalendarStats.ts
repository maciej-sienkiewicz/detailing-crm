// src/hooks/useCalendarStats.ts
import { useMemo } from 'react';
import { Appointment, AppointmentStatus } from '../types';

interface CalendarStats {
    total: number;
    today: number;
    thisWeek: number;
    protocols: number;
    inProgress: number;
    readyForPickup: number;
    cancelled: number;
}

export const useCalendarStats = (appointments: Appointment[]): CalendarStats => {
    return useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        // Wczoraj dla anulowanych
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        // Początek i koniec tygodnia (poniedziałek - niedziela)
        const dayOfWeek = now.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - daysFromMonday);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        // Filtrowanie wizyt
        const todayAppointments = appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.start);
            return appointmentDate >= today && appointmentDate < tomorrow;
        });

        const thisWeekAppointments = appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.start);
            return appointmentDate >= weekStart && appointmentDate <= weekEnd;
        });

        const cancelledYesterday = appointments.filter(appointment => {
            const appointmentDate = appointment.start.toISOString().split('T')[0];
            return appointment.status === AppointmentStatus.CANCELLED &&
                appointmentDate === yesterdayString;
        });

        return {
            total: appointments.length,
            today: todayAppointments.filter(a => a.status === AppointmentStatus.SCHEDULED).length,
            thisWeek: thisWeekAppointments.length,
            protocols: appointments.filter(a => a.isProtocol).length,
            inProgress: appointments.filter(a => a.status === AppointmentStatus.IN_PROGRESS).length,
            readyForPickup: appointments.filter(a => a.status === AppointmentStatus.READY_FOR_PICKUP).length,
            cancelled: cancelledYesterday.length
        };
    }, [appointments]);
};