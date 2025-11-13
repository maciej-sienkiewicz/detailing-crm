// src/hooks/useCalendarNavigation.ts
import {useCallback, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useToast} from "../components/common/Toast/Toast";
import {Appointment} from "../types";
import {format, startOfDay, endOfDay, subDays} from 'date-fns';

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

        const timeoutId = setTimeout(() => {
            loadAppointments(range);
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [calendarRange, loadAppointments]);

    // ✅ POPRAWIONE: Używamy date-fns do właściwej konwersji
    const handleAppointmentCreate = useCallback((start: Date, end: Date) => {
        // Konwertuj UTC date na lokalną datę kalendarzową
        const startDateStr = format(start, 'yyyy-MM-dd');
        const endDateStr = format(end, 'yyyy-MM-dd');

        // Utwórz lokalne daty z tych stringów
        const localStart = new Date(startDateStr + 'T08:00:00');

        // FullCalendar zwraca end jako następny dzień o 00:00, więc cofamy o 1 dzień
        const localEnd = subDays(new Date(endDateStr + 'T00:00:00'), 1);
        localEnd.setHours(23, 59, 0, 0);

        setSelectedDate(localStart);
        setSelectedEndDate(localEnd);

        console.log('📅 Creating reservation for date range:', {
            originalStart: start.toISOString(),
            originalEnd: end.toISOString(),
            startDateStr,
            endDateStr,
            localStart: localStart.toISOString(),
            localEnd: localEnd.toISOString()
        });

        navigate('/reservations/new', {
            state: {
                startDate: localStart.toISOString(),
                endDate: localEnd.toISOString(),
                fromCalendar: true
            }
        });
    }, [navigate]);

    const handleNewAppointmentClick = useCallback(() => {
        const startDate = new Date();
        startDate.setHours(8, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setHours(23, 59, 0, 0);

        navigate('/visits', {
            state: {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
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