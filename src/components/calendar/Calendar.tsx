// src/components/calendar/CalendarWithFullCalendar.tsx
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import plLocale from '@fullcalendar/core/locales/pl';
import { Appointment, AppointmentStatus, AppointmentStatusColors } from '../../types';
import { CalendarColor } from "../../types/calendar";
import { addMinutes } from 'date-fns';

interface CalendarProps {
    events: Appointment[];
    onEventSelect: (event: Appointment) => void;
    onRangeChange?: (range: { start: Date; end: Date }) => void;
    onEventCreate?: (start: Date, end: Date) => void;
}

const AppointmentCalendar: React.FC<CalendarProps> = ({
                                                          events,
                                                          onEventSelect,
                                                          onRangeChange,
                                                          onEventCreate
                                                      }) => {
    // Stan do przechowywania kolorów kalendarza
    const [calendarColors, setCalendarColors] = useState<Record<string, CalendarColor>>({});
    const calendarRef = useRef<FullCalendar>(null);

    // Konwersja wydarzeń do formatu FullCalendar
    const mapAppointmentsToFullCalendarEvents = () => {
        return events.map(event => ({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            extendedProps: {
                ...event
            },
            backgroundColor: getEventBackgroundColor(event),
            borderColor: getEventBorderColor(event),
            textColor: 'white',
            opacity: getEventOpacity(event)
        }));
    };

    // Funkcja do pobierania koloru tła dla wydarzenia
    const getEventBackgroundColor = (event: Appointment): string => {
        if (event.calendarColorId && calendarColors[event.calendarColorId]) {
            return calendarColors[event.calendarColorId].color;
        }

        return AppointmentStatusColors[event.status];
    };

    // Funkcja do pobierania koloru ramki dla wydarzenia
    const getEventBorderColor = (event: Appointment): string => {
        if (event.isProtocol) {
            return '#2c3e50'; // Grubsza obwódka dla protokołów
        }
        return getEventBackgroundColor(event);
    };

    // Funkcja do pobierania przezroczystości wydarzenia
    const getEventOpacity = (event: Appointment): number => {
        if (event.isProtocol) {
            if (event.status === AppointmentStatus.COMPLETED) {
                return 0.5;
            }
            if (event.status === AppointmentStatus.CANCELLED) {
                return 0.7;
            }
        }
        return 0.95;
    };

    // Obsługa wyboru wydarzenia
    const handleEventClick = (info: any) => {
        const appointment = info.event.extendedProps;
        onEventSelect(appointment);
    };

    // Obsługa wyboru slotu (tworzenie nowego wydarzenia)
    const handleDateSelect = (info: any) => {
        if (onEventCreate) {
            let start = new Date(info.start);
            let end = new Date(info.end);

            // Jeśli to samo co początek, dodaj 1 godzinę
            if (start.getTime() === end.getTime()) {
                end = addMinutes(start, 60);
            }

            onEventCreate(start, end);
        }
    };

    // Obsługa zmiany zakresu dat
    const handleDatesSet = (info: any) => {
        if (onRangeChange) {
            onRangeChange({
                start: info.start,
                end: info.end
            });
        }
    };

    // Pobieranie kolorów kalendarza przy pierwszym renderowaniu
    useEffect(() => {
        const fetchCalendarColors = async () => {
            try {
                // Tu importujemy dynamicznie API kolorów kalendarza
                const { calendarColorsApi } = await import('../../api/calendarColorsApi');
                const colors = await calendarColorsApi.fetchCalendarColors();

                // Konwersja tablicy kolorów na obiekt z kluczami ID dla łatwego dostępu
                const colorsMap = colors.reduce((acc, color) => {
                    acc[color.id] = color;
                    return acc;
                }, {} as Record<string, CalendarColor>);

                setCalendarColors(colorsMap);
            } catch (error) {
                console.error('Błąd podczas pobierania kolorów kalendarza:', error);
            }
        };

        fetchCalendarColors();
    }, []);

    return (
        <CalendarContainer>
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                }}
                events={mapAppointmentsToFullCalendarEvents()}
                locale={plLocale}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                eventClick={handleEventClick}
                select={handleDateSelect}
                datesSet={handleDatesSet}
                height="calc(100vh - 100px)"
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }}
                buttonText={{
                    today: 'Dzisiaj',
                    month: 'Miesiąc',
                    week: 'Tydzień',
                    day: 'Dzień',
                    list: 'Lista'
                }}
                views={{
                    dayGrid: {
                        titleFormat: {
                            year: 'numeric',
                            month: 'long'
                        }
                    },
                    timeGrid: {
                        titleFormat: {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }
                    }
                }}
                allDayText="Cały dzień"
                noEventsText="Brak wizyt w wybranym zakresie"
                eventDisplay="block"
                eventDidMount={(info) => {
                    // Dodatkowe modyfikacje wyglądu wydarzenia
                    const appointment = info.event.extendedProps as Appointment;
                    if (appointment.isProtocol) {
                        info.el.style.borderWidth = '2px';
                        info.el.style.borderStyle = 'solid';
                        info.el.style.fontWeight = 'normal';
                        info.el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
                    }
                }}
            />
        </CalendarContainer>
    );
};

const CalendarContainer = styled.div`
    height: 100%;
    padding: 20px;

    /* Style dla kalendarza */
    .fc-event {
        cursor: pointer;
        border-radius: 4px;
    }

    .fc-today {
        background-color: rgba(52, 152, 219, 0.1);
    }

    .fc-list-event-dot {
        margin-right: 5px;
    }

    .fc-toolbar-title {
        font-size: 1.5em;
    }

    .fc-button {
        background-color: #3498db;
        border-color: #3498db;
        text-transform: capitalize;
    }

    .fc-button:hover {
        background-color: #2980b9;
        border-color: #2980b9;
    }

    .fc-button-active {
        background-color: #2980b9 !important;
        border-color: #2980b9 !important;
    }

    /* Styl dla urządzeń mobilnych */
    @media (max-width: 768px) {
        padding: 10px;

        .fc-toolbar {
            flex-direction: column;
        }

        .fc-toolbar-chunk {
            margin-bottom: 10px;
        }
    }
`;

export default AppointmentCalendar;