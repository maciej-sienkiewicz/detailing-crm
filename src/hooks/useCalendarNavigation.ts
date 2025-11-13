// src/pages/Calendar/hooks/useCalendarNavigation.ts
import {useCallback, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useToast} from "../components/common/Toast/Toast";
import {Appointment} from "../types";

interface UseCalendarNavigationProps {
    loadAppointments: (range?: { start: Date; end: Date }) => Promise<void>;
    createAppointment: (data: Omit<Appointment, 'id'>) => Promise<void>;
}

export const useCalendarNavigation = ({
                                          loadAppointments,
                                          createAppointment
                                      }: UseCalendarNavigationProps) => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [calendarRange, setCalendarRange] = useState<{ start: Date; end: Date } | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedEndDate, setSelectedEndDate] = useState<Date>(new Date());

    const handleRangeChange = useCallback((range: { start: Date; end: Date }) => {
        const newRangeKey = `${range.start.toISOString().split('T')[0]}_${range.end.toISOString().split('T')[0]}`;
        const currentRangeKey = calendarRange ?
            `${calendarRange.start.toISOString().split('T')[0]}_${calendarRange.end.toISOString().split('T')[0]}` : '';

        if (newRangeKey === currentRangeKey) {
            return;
        }

        setCalendarRange(range);

        // Debounced data loading
        const timeoutId = setTimeout(() => {
            loadAppointments(range);
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [calendarRange, loadAppointments]);

    const handleAppointmentCreate = useCallback((start: Date, end: Date) => {
        setSelectedDate(start);
        const correctedEndDate = new Date(end);
        correctedEndDate.setDate(correctedEndDate.getDate() - 1);
        setSelectedEndDate(correctedEndDate);

        // Navigate to visit creation
        const localStartDate = new Date(start);
        localStartDate.setHours(12, 0, 0, 0);

        const localEndDate = new Date(correctedEndDate);
        localEndDate.setHours(23, 59, 0, 0);

        navigate('/visits', {
            state: {
                startDate: localStartDate.toISOString(),
                endDate: localEndDate.toISOString(),
                isFullProtocol: false
            }
        });
    }, [navigate, showToast]);

    const handleNewAppointmentClick = useCallback(() => {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(23, 59, 0, 0);

        const toLocalISOString = (date: Date): string => {
            const offset = date.getTimezoneOffset() * 60000;
            const localDate = new Date(date.getTime() - offset);
            return localDate.toISOString();
        };

        navigate('/visits', {
            state: {
                startDate: toLocalISOString(startDate),
                endDate: toLocalISOString(endDate),
                isFullProtocol: false,
                fromCalendar: true
            }
        });
    }, [navigate]);

    return {
        calendarRange,
        selectedDate,
        selectedEndDate,
        handleRangeChange,
        handleAppointmentCreate,
        handleNewAppointmentClick
    };
};