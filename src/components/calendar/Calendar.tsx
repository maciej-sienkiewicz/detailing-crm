import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns';
import { pl } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import styled from 'styled-components';
import { Appointment, AppointmentStatus, AppointmentStatusColors } from '../../types';
import { calendarColorsApi } from '../../api/calendarColorsApi';
import {CalendarColor} from "../../types/calendar";

// Konfiguracja lokalizera date-fns
const locales = {
    'pl': pl,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarProps {
    events: Appointment[];
    onEventSelect: (event: Appointment) => void;
    onRangeChange?: (range: Date[] | { start: Date; end: Date }) => void;
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

    // Pobieranie kolorów kalendarza przy pierwszym renderowaniu
    useEffect(() => {
        const fetchCalendarColors = async () => {
            try {
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

    // Obsługa wyboru wydarzenia
    const handleSelectEvent = (event: Appointment) => {
        onEventSelect(event);
    };

    // Obsługa wyboru slotu (tworzenie nowego wydarzenia)
    const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        // Domyślnie dodajemy 1 godzinę do czasu zakończenia, jeśli jest taki sam jak początkowy
        if (start.getTime() === end.getTime()) {
            end = addMinutes(start, 60);
        }

        if (onEventCreate) {
            onEventCreate(start, end);
        }
    };

    // Dostosowanie wyglądu wydarzenia
    const eventStyleGetter = (event: Appointment) => {
        // Sprawdzenie, czy wydarzenie ma przypisany kolor kalendarza
        console.log(event.title)
        console.log(event.calendarColorId);
        if (event.calendarColorId && calendarColors[event.calendarColorId]) {
            // Jeśli ma przypisany kolor kalendarza, użyj go
            console.log(event.title)
            console.log(event.calendarColorId);
            const calendarColor = calendarColors[event.calendarColorId].color;
            let opacity = 0.95;

            // Specjalne formatowanie dla protokołów
            if (event.isProtocol) {
                // Sprawdzamy czy to protokół zakończony (COMPLETED)
                if (event.status === AppointmentStatus.COMPLETED) {
                    opacity = 0.3; // Zakończone protokoły są bardziej przeźroczyste
                }

                // Sprawdzamy czy to protokół anulowany (CANCELLED)
                if (event.status === AppointmentStatus.CANCELLED) {
                    opacity = 0.7;
                }

                return {
                    style: {
                        backgroundColor: calendarColor,
                        borderRadius: '4px',
                        opacity,
                        color: 'white',
                        border: '2px solid #2c3e50', // Grubsza obwódka dla protokołów
                        display: 'block',
                        fontWeight: 'normal', // Normalna czcionka, nie pogrubiona
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }
                };
            }

            return {
                style: {
                    backgroundColor: calendarColor,
                    borderRadius: '4px',
                    opacity,
                    color: 'white',
                    border: '0',
                    display: 'block'
                }
            };
        } else {
            // Jeśli nie ma przypisanego koloru kalendarza, użyj kolorów bazujących na statusie wizyty
            let backgroundColor = AppointmentStatusColors[event.status];
            let opacity = 0.8;

            // Specjalne formatowanie dla protokołów
            if (event.isProtocol) {
                // Sprawdzamy czy to protokół zakończony (COMPLETED)
                if (event.status === AppointmentStatus.COMPLETED) {
                    opacity = 0.5; // Zakończone protokoły są bardziej przeźroczyste
                }

                // Sprawdzamy czy to protokół anulowany (CANCELLED)
                // Musimy użyć sprawdzenia wartości, ponieważ typy nie są zgodne między AppointmentStatus i ProtocolStatus
                if (event.status === AppointmentStatus.CANCELLED) {
                    backgroundColor = '#444444'; // Ciemno szary dla anulowanych protokołów
                    opacity = 0.7;
                }

                return {
                    style: {
                        backgroundColor,
                        borderRadius: '4px',
                        opacity,
                        color: 'white',
                        border: '2px solid #2c3e50', // Grubsza obwódka dla protokołów
                        display: 'block',
                        fontWeight: 'normal', // Normalna czcionka, nie pogrubiona
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }
                };
            }

            return {
                style: {
                    backgroundColor,
                    borderRadius: '4px',
                    opacity,
                    color: 'white',
                    border: '0',
                    display: 'block'
                }
            };
        }
    };

    return (
        <CalendarContainer>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 'calc(100vh - 100px)' }}
                selectable
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                onRangeChange={onRangeChange}
                eventPropGetter={eventStyleGetter}
                defaultView={Views.MONTH}
                views={['month', 'week', 'day', 'agenda']}
                step={30}
                timeslots={2}
                messages={{
                    today: 'Dzisiaj',
                    previous: 'Poprzedni',
                    next: 'Następny',
                    month: 'Miesiąc',
                    week: 'Tydzień',
                    day: 'Dzień',
                    agenda: 'Lista',
                    date: 'Data',
                    time: 'Czas',
                    event: 'Wizyta',
                    allDay: 'Cały dzień',
                    work_week: 'Tydzień pracy',
                    yesterday: 'Wczoraj',
                    tomorrow: 'Jutro',
                    noEventsInRange: 'Brak wizyt w wybranym zakresie'
                }}
            />
        </CalendarContainer>
    );
};

const CalendarContainer = styled.div`
    height: 100%;
    padding: 20px;

    .rbc-event {
        padding: 5px;
    }

    .rbc-event-label {
        font-size: 12px;
    }

    .rbc-today {
        background-color: rgba(52, 152, 219, 0.1);
    }
`;

export default AppointmentCalendar;