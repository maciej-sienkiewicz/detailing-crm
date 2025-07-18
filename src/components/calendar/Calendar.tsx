// src/components/calendar/Calendar.tsx - PRODUCTION VERSION
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import plLocale from '@fullcalendar/core/locales/pl';
import { Appointment, AppointmentStatus, AppointmentStatusColors } from '../../types';
import { CalendarColor } from "../../types/calendar";
import { addMinutes, format } from 'date-fns';
import {
    FaChevronLeft,
    FaChevronRight
} from 'react-icons/fa';
import {pl} from "date-fns/locale";

// Professional Automotive Design System
const automotiveTheme = {
    // Brand Color System - Clean & Professional
    primary: 'var(--brand-primary, #1a365d)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',

    // Professional Surfaces
    surface: '#ffffff',
    surfaceElevated: '#fafbfc',
    surfaceHover: '#f8fafc',
    surfaceActive: '#f1f5f9',

    // Typography
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',

    // Technical Borders
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderActive: '#cbd5e1',

    // Status Colors - Professional
    success: '#059669',
    successBg: '#ecfdf5',
    warning: '#d97706',
    warningBg: '#fffbeb',
    error: '#dc2626',
    errorBg: '#fef2f2',
    info: '#0891b2',
    infoBg: '#f0f9ff',

    // Professional Spacing
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px',
        xxxl: '32px'
    },

    // Clean Shadows
    shadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px'
    }
};

interface CalendarProps {
    events: Appointment[];
    onEventSelect: (event: Appointment) => void;
    onRangeChange?: (range: { start: Date; end: Date }) => void;
    onEventCreate?: (start: Date, end: Date) => void;
}

type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

const AppointmentCalendar: React.FC<CalendarProps> = ({
                                                          events,
                                                          onEventSelect,
                                                          onRangeChange,
                                                          onEventCreate
                                                      }) => {
    // PRODUCTION STATE MANAGEMENT - Single source of truth
    const [calendarColors, setCalendarColors] = useState<Record<string, CalendarColor>>({});
    const [currentView, setCurrentView] = useState<CalendarView>('dayGridMonth');
    const [currentDate, setCurrentDate] = useState<Date>(new Date()); // This tracks FullCalendar's actual date
    const [isCalendarReady, setIsCalendarReady] = useState(false); // Track calendar initialization
    const [quickFilters, setQuickFilters] = useState({
        scheduled: true,
        inProgress: true,
        readyForPickup: true,
        completed: true,  // Dodane - domyślnie włączone
        cancelled: true   // Dodane - domyślnie włączone
    });

    const calendarRef = useRef<FullCalendar>(null);

    // PRODUCTION: Reliable period title generation
    const getCurrentPeriodTitle = useCallback((): string => {
        // Always use currentDate state as single source of truth
        const displayDate = currentDate;

        switch (currentView) {
            case 'dayGridMonth':
                return format(displayDate, 'LLLL yyyy', { locale: pl });
            case 'timeGridWeek':
                return `Tydzień ${format(displayDate, 'w, LLLL yyyy', { locale: pl })}`;
            case 'timeGridDay':
                return format(displayDate, 'EEEE, dd LLLL yyyy', { locale: pl });
            case 'listWeek':
                return `Lista - ${format(displayDate, 'LLLL yyyy', { locale: pl })}`;
            default:
                return format(displayDate, 'LLLL yyyy', { locale: pl });
        }
    }, [currentDate, currentView]);

    // Enhanced Color System - Keep original logic
    const getEventBackgroundColor = (event: Appointment): string => {
        if (event.calendarColorId && calendarColors[event.calendarColorId]) {
            return calendarColors[event.calendarColorId].color;
        }
        return AppointmentStatusColors[event.status];
    };

    // Enterprise Event Mapping
    const mapAppointmentsToFullCalendarEvents = () => {
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
                backgroundColor: getEventBackgroundColor(event),
                borderColor: getEventBorderColor(event),
                textColor: getEventTextColor(event),
                classNames: [
                    'professional-event',
                    `status-${event.status}`,
                    `status-${event.status.toLowerCase()}`, // Dodane dla CSS
                    event.isProtocol ? 'protocol-event' : 'appointment-event',
                    // Dodaj klasy dla zakończonych statusów
                    event.status === AppointmentStatus.COMPLETED ? 'completed-event' : '',
                    event.status === AppointmentStatus.CANCELLED ? 'cancelled-event' : ''
                ].filter(Boolean) // Usuń puste stringi
            }));
    };

    // Status Key Mapping for Filters
    const getStatusKey = (status: AppointmentStatus): keyof typeof quickFilters => {
        switch (status) {
            case AppointmentStatus.SCHEDULED: return 'scheduled';
            case AppointmentStatus.IN_PROGRESS: return 'inProgress';
            case AppointmentStatus.READY_FOR_PICKUP: return 'readyForPickup';
            case AppointmentStatus.COMPLETED: return 'completed';    // Dodane
            case AppointmentStatus.CANCELLED: return 'cancelled';    // Dodane
            default: return 'scheduled';
        }
    };

    const getEventBorderColor = (event: Appointment): string => {
        if (event.isProtocol) {
            return automotiveTheme.primary;
        }
        return getEventBackgroundColor(event);
    };

    const getEventTextColor = (event: Appointment): string => {
        return '#ffffff';
    };

    // PRODUCTION: Reliable event handlers with proper synchronization
    const handleEventClick = (info: any) => {
        const appointment = info.event.extendedProps;
        onEventSelect(appointment);
    };

    const handleDateSelect = (info: any) => {
        if (onEventCreate) {
            let start = new Date(info.start);
            let end = new Date(info.end);

            if (start.getTime() === end.getTime()) {
                end = addMinutes(start, 60);
            }

            onEventCreate(start, end);
        }
    };

    // PRODUCTION: Critical handler for calendar date synchronization
    const handleDatesSet = useCallback((info: any) => {
        // CRITICAL: This is the authoritative source of current calendar date
        // We need to extract the actual current date being displayed from FullCalendar

        if (!calendarRef.current) return;

        // Get the ACTUAL current date from FullCalendar API - this is the single source of truth
        const calendarApi = calendarRef.current.getApi();
        const actualCalendarDate = calendarApi.getDate();

        // Update our state with FullCalendar's actual current date
        setCurrentDate(new Date(actualCalendarDate));

        // Mark calendar as ready after first datesSet
        if (!isCalendarReady) {
            setIsCalendarReady(true);
        }

        // Notify parent component of range change
        if (onRangeChange) {
            onRangeChange({
                start: info.start,
                end: info.end
            });
        }
    }, [isCalendarReady, onRangeChange]);

    // PRODUCTION: Bulletproof navigation with proper state management
    const handleNavigate = useCallback((action: 'prev' | 'next' | 'today') => {
        if (!calendarRef.current) return;

        const calendarApi = calendarRef.current.getApi();

        switch (action) {
            case 'prev':
                calendarApi.prev();
                // Let handleDatesSet update the currentDate
                break;
            case 'next':
                calendarApi.next();
                // Let handleDatesSet update the currentDate
                break;
            case 'today':
                calendarApi.today();
                // For today, we can immediately update since we know the target date
                setCurrentDate(new Date());
                break;
        }
    }, []);

    // PRODUCTION: View change handler with state synchronization
    const handleViewChange = useCallback((view: CalendarView) => {
        setCurrentView(view);
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.changeView(view);
            // handleDatesSet will be called automatically and update currentDate
        }
    }, []);

    // Filter Toggle
    const toggleFilter = (filterKey: keyof typeof quickFilters) => {
        setQuickFilters(prev => ({
            ...prev,
            [filterKey]: !prev[filterKey]
        }));
    };

    // PRODUCTION: Calendar initialization with proper error handling
    useEffect(() => {
        if (calendarRef.current && !isCalendarReady) {
            try {
                const calendarApi = calendarRef.current.getApi();
                // Set calendar to current date on initialization
                calendarApi.gotoDate(new Date());
                // Update our state to match
                setCurrentDate(new Date());
            } catch (error) {
                console.error('Calendar initialization error:', error);
                // Fallback: just set current date in state
                setCurrentDate(new Date());
            }
        }
    }, [isCalendarReady]);

    // PRODUCTION: Calendar colors initialization
    useEffect(() => {
        const fetchCalendarColors = async () => {
            try {
                const { calendarColorsApi } = await import('../../api/calendarColorsApi');
                const colors = await calendarColorsApi.fetchCalendarColors();

                const colorsMap = colors.reduce((acc, color) => {
                    acc[color.id] = color;
                    return acc;
                }, {} as Record<string, CalendarColor>);

                setCalendarColors(colorsMap);
            } catch (error) {
                console.error('Błąd podczas pobierania kolorów kalendarza:', error);
                // Graceful fallback - empty colors map
                setCalendarColors({});
            }
        };

        fetchCalendarColors();
    }, []);

    return (
        <CalendarContainer>
            {/* Professional Controls */}
            <CalendarControls>
                <ControlsLeft>
                    <NavigationGroup>
                        <NavButton onClick={() => handleNavigate('prev')}>
                            <FaChevronLeft />
                        </NavButton>
                        <CurrentPeriod>{getCurrentPeriodTitle()}</CurrentPeriod>
                        <TodayButton onClick={() => handleNavigate('today')}>
                            Dzisiaj
                        </TodayButton>
                        <NavButton onClick={() => handleNavigate('next')}>
                            <FaChevronRight />
                        </NavButton>
                    </NavigationGroup>

                    <ViewSelector>
                        <ViewButton
                            $active={currentView === 'dayGridMonth'}
                            onClick={() => handleViewChange('dayGridMonth')}
                        >
                            Miesiąc
                        </ViewButton>
                        <ViewButton
                            $active={currentView === 'timeGridWeek'}
                            onClick={() => handleViewChange('timeGridWeek')}
                        >
                            Tydzień
                        </ViewButton>
                        <ViewButton
                            $active={currentView === 'timeGridDay'}
                            onClick={() => handleViewChange('timeGridDay')}
                        >
                            Dzień
                        </ViewButton>
                        <ViewButton
                            $active={currentView === 'listWeek'}
                            onClick={() => handleViewChange('listWeek')}
                        >
                            Lista
                        </ViewButton>
                    </ViewSelector>
                </ControlsLeft>

                <ControlsRight>
                    <QuickFilters>
                        <FilterButton
                            $active={quickFilters.scheduled}
                            $color={automotiveTheme.primary}
                            onClick={() => toggleFilter('scheduled')}
                        >
                            Zaplanowane
                        </FilterButton>
                        <FilterButton
                            $active={quickFilters.inProgress}
                            $color={automotiveTheme.primary}
                            onClick={() => toggleFilter('inProgress')}
                        >
                            W trakcie
                        </FilterButton>
                        <FilterButton
                            $active={quickFilters.readyForPickup}
                            $color={automotiveTheme.primary}
                            onClick={() => toggleFilter('readyForPickup')}
                        >
                            Gotowe
                        </FilterButton>
                        {/* Nowe filtry dla zakończonych statusów */}
                        <FilterButton
                            $active={quickFilters.completed}
                            $color={automotiveTheme.primary}
                            onClick={() => toggleFilter('completed')}
                        >
                            Zakończone
                        </FilterButton>
                        <FilterButton
                            $active={quickFilters.cancelled}
                            $color={automotiveTheme.primary}
                            onClick={() => toggleFilter('cancelled')}
                        >
                            Anulowane
                        </FilterButton>
                    </QuickFilters>
                </ControlsRight>
            </CalendarControls>

            {/* Professional Calendar Component */}
            <CalendarWrapper>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    initialView={currentView}
                    initialDate={new Date()} // Ustaw na obecną datę
                    events={mapAppointmentsToFullCalendarEvents()}
                    locale={plLocale}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={3}
                    weekends={true}
                    eventClick={handleEventClick}
                    select={handleDateSelect}
                    datesSet={handleDatesSet}
                    height="calc(100vh - 280px)"
                    eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }}
                    headerToolbar={false}
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
                            },
                            slotMinTime: '06:00:00',
                            slotMaxTime: '22:00:00',
                            slotDuration: '01:00:00'
                        }
                    }}
                    allDayText="Cały dzień"
                    noEventsText="Brak wizyt w wybranym zakresie"
                    eventDisplay="block"
                    // Zaktualizuj eventDidMount w FullCalendar props
                    // Zamień eventDidMount w FullCalendar props
                    eventDidMount={(info) => {
                        const appointment = info.event.extendedProps as Appointment;

                        // Professional event styling - podstawowe style
                        info.el.style.borderRadius = '6px';
                        info.el.style.fontSize = '12px';
                        info.el.style.fontWeight = '600';
                        info.el.style.cursor = 'pointer';
                        info.el.style.transition = 'all 0.2s ease';

                        // Protocol styling
                        if (appointment.isProtocol) {
                            info.el.style.borderLeft = `3px solid ${automotiveTheme.primary}`;
                        }

                        // Specjalne style dla zakończonych statusów - WAŻNE: używamy !important lub setProperty
                        if (appointment.status === AppointmentStatus.COMPLETED) {
                            info.el.style.setProperty('opacity', '0.2', 'important');
                            info.el.style.setProperty('font-weight', '700', 'important');
                            info.el.style.setProperty('transform', 'scale(1.02)', 'important');
                            info.el.style.setProperty('box-shadow', '0 4px 12px rgba(5, 150, 105, 0.25)', 'important');
                            info.el.style.setProperty('background', 'linear-gradient(135deg, #059669 0%, #10b981 100%)', 'important');
                            info.el.style.setProperty('border', '2px solid #047857', 'important');
                            info.el.style.setProperty('color', 'white', 'important');
                        }

                        if (appointment.status === AppointmentStatus.CANCELLED) {
                            info.el.style.setProperty('opacity', '0.5', 'important');
                            info.el.style.setProperty('font-weight', '700', 'important');
                            info.el.style.setProperty('transform', 'scale(1.02)', 'important');
                            info.el.style.setProperty('box-shadow', '0 4px 12px rgba(220, 38, 38, 0.25)', 'important');
                            info.el.style.setProperty('background', 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', 'important');
                            info.el.style.setProperty('border', '2px solid #b91c1c', 'important');
                            info.el.style.setProperty('color', 'white', 'important');

                            const strikethrough = document.createElement('div');
                            strikethrough.style.position = 'absolute';
                            strikethrough.style.top = '50%';
                            strikethrough.style.left = '8%';
                            strikethrough.style.right = '8%';
                            strikethrough.style.height = '2px';
                            strikethrough.style.background = 'rgba(255, 255, 255, 0.9)';
                            strikethrough.style.transform = 'translateY(-50%)';
                            strikethrough.style.zIndex = '1';
                            strikethrough.style.borderRadius = '1px';
                            info.el.style.position = 'relative'; // Potrzebne dla absolute positioning
                            info.el.appendChild(strikethrough);
                        }

                        // Style dla pozostałych statusów - niższe opacity
                        if (appointment.status === AppointmentStatus.SCHEDULED) {
                            info.el.style.setProperty('opacity', '0.75', 'important');
                        }

                        if (appointment.status === AppointmentStatus.IN_PROGRESS) {
                            info.el.style.setProperty('opacity', '0.8', 'important');
                        }

                        if (appointment.status === AppointmentStatus.READY_FOR_PICKUP) {
                            info.el.style.setProperty('opacity', '0.8', 'important');
                        }

                        // Hover effects z uwzględnieniem statusów zakończonych
                        info.el.addEventListener('mouseenter', () => {
                            if (appointment.status === AppointmentStatus.COMPLETED) {
                                info.el.style.setProperty('transform', 'scale(1.05) translateY(-2px)', 'important');
                                info.el.style.setProperty('box-shadow', '0 8px 20px rgba(5, 150, 105, 0.4)', 'important');
                            } else if (appointment.status === AppointmentStatus.CANCELLED) {
                                info.el.style.setProperty('transform', 'scale(1.05) translateY(-2px)', 'important');
                                info.el.style.setProperty('box-shadow', '0 8px 20px rgba(220, 38, 38, 0.4)', 'important');
                            } else {
                                info.el.style.transform = 'translateY(-1px)';
                                info.el.style.boxShadow = automotiveTheme.shadow.sm;
                            }
                        });

                        info.el.addEventListener('mouseleave', () => {
                            if (appointment.status === AppointmentStatus.COMPLETED) {
                                info.el.style.setProperty('transform', 'scale(1.02)', 'important');
                                info.el.style.setProperty('box-shadow', '0 4px 12px rgba(5, 150, 105, 0.25)', 'important');
                            } else if (appointment.status === AppointmentStatus.CANCELLED) {
                                info.el.style.setProperty('transform', 'scale(1.02)', 'important');
                                info.el.style.setProperty('box-shadow', '0 4px 12px rgba(220, 38, 38, 0.25)', 'important');
                            } else {
                                info.el.style.transform = 'translateY(0)';
                                info.el.style.boxShadow = 'none';
                            }
                        });
                    }}
                />
            </CalendarWrapper>
        </CalendarContainer>
    );
};

// Professional Styled Components (pozostałe bez zmian)
const CalendarContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: ${automotiveTheme.surface};
    border-radius: ${automotiveTheme.radius.lg};
    border: 1px solid ${automotiveTheme.border};
    overflow: hidden;
    box-shadow: ${automotiveTheme.shadow.sm};
`;

const CalendarControls = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${automotiveTheme.spacing.xl} ${automotiveTheme.spacing.xxxl};
    background: ${automotiveTheme.surfaceElevated};
    border-bottom: 1px solid ${automotiveTheme.borderLight};
`;

const ControlsLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${automotiveTheme.spacing.xxl};
`;

const NavigationGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${automotiveTheme.spacing.lg};
    background: ${automotiveTheme.surface};
    border: 1px solid ${automotiveTheme.border};
    border-radius: ${automotiveTheme.radius.md};
    padding: ${automotiveTheme.spacing.sm};
    box-shadow: ${automotiveTheme.shadow.sm};
`;

const NavButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: transparent;
    border: none;
    border-radius: ${automotiveTheme.radius.sm};
    color: ${automotiveTheme.textSecondary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${automotiveTheme.surfaceHover};
        color: ${automotiveTheme.primary};
    }

    svg {
        font-size: 14px;
    }
`;

const CurrentPeriod = styled.div`
    font-size: 18px;
    font-weight: 700;
    color: ${automotiveTheme.textPrimary};
    min-width: 200px;
    text-align: center;
    letter-spacing: -0.025em;
`;

const TodayButton = styled.button`
    padding: ${automotiveTheme.spacing.sm} ${automotiveTheme.spacing.lg};
    background: ${automotiveTheme.primary};
    color: white;
    border: none;
    border-radius: ${automotiveTheme.radius.sm};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${automotiveTheme.primaryDark};
    }
`;

const ViewSelector = styled.div`
    display: flex;
    background: ${automotiveTheme.surface};
    border: 1px solid ${automotiveTheme.border};
    border-radius: ${automotiveTheme.radius.md};
    overflow: hidden;
    box-shadow: ${automotiveTheme.shadow.sm};
`;

const ViewButton = styled.button<{ $active: boolean }>`
    padding: ${automotiveTheme.spacing.md} ${automotiveTheme.spacing.xl};
    background: ${props => props.$active ? automotiveTheme.primary : 'transparent'};
    color: ${props => props.$active ? 'white' : automotiveTheme.textSecondary};
    border: none;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-right: 1px solid ${automotiveTheme.borderLight};

    &:last-child {
        border-right: none;
    }

    &:hover:not([data-active="true"]) {
        background: ${automotiveTheme.surfaceHover};
        color: ${automotiveTheme.primary};
    }
`;

const ControlsRight = styled.div`
    display: flex;
    align-items: center;
    gap: ${automotiveTheme.spacing.lg};
`;

const QuickFilters = styled.div`
    display: flex;
    gap: ${automotiveTheme.spacing.sm};
`;

const FilterButton = styled.button<{ $active: boolean; $color: string }>`
    padding: ${automotiveTheme.spacing.sm} ${automotiveTheme.spacing.lg};
    background: ${props => props.$active ? props.$color : automotiveTheme.surface};
    color: ${props => props.$active ? 'white' : automotiveTheme.textSecondary};
    border: 1px solid ${props => props.$active ? props.$color : automotiveTheme.border};
    border-radius: ${automotiveTheme.radius.md};
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$active ? props.$color : props.$color + '15'};
        border-color: ${props => props.$color};
        color: ${props => props.$active ? 'white' : props.$color};
    }
`;

const CalendarWrapper = styled.div`
    flex: 1;
    padding: ${automotiveTheme.spacing.xl} ${automotiveTheme.spacing.xxxl};
    background: ${automotiveTheme.surface};

    /* Professional FullCalendar Styling */
    .fc {
        height: 100%;
        font-family: inherit;
    }

    .fc-theme-standard td, .fc-theme-standard th {
        border-color: ${automotiveTheme.borderLight};
    }

    .fc-theme-standard .fc-scrollgrid {
        border-color: ${automotiveTheme.border};
        border-radius: ${automotiveTheme.radius.lg};
        overflow: hidden;
    }

    .fc-col-header-cell {
        background: ${automotiveTheme.surfaceActive};
        font-weight: 600;
        color: ${automotiveTheme.textSecondary};
        font-size: 13px;
        padding: ${automotiveTheme.spacing.lg};
    }

    .fc-daygrid-day {
        transition: background-color 0.2s ease;

        &:hover {
            background: ${automotiveTheme.surfaceHover};
        }
    }

    .fc-daygrid-day-number {
        color: ${automotiveTheme.textSecondary};
        font-weight: 600;
        padding: ${automotiveTheme.spacing.sm};
    }

    .fc-day-today {
        background: ${automotiveTheme.surfaceHover} !important;

        .fc-daygrid-day-number {
            background: ${automotiveTheme.primary};
            color: white;
            border-radius: ${automotiveTheme.radius.sm};
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    .fc-event {
        border-radius: ${automotiveTheme.radius.sm};
        border: none;
        font-weight: 600;
        font-size: 12px;
        margin: 2px;
        padding: 2px 6px;

        &.protocol-event {
            border-left: 3px solid ${automotiveTheme.primary};
            font-weight: 700;
        }
    }

    .fc-timegrid-slot {
        height: 60px;
        border-color: ${automotiveTheme.borderLight};
    }

    .fc-timegrid-slot-label {
        color: ${automotiveTheme.textTertiary};
        font-weight: 500;
        font-size: 12px;
    }

    .fc-list-event {
        border-radius: ${automotiveTheme.radius.md};
        margin-bottom: ${automotiveTheme.spacing.sm};

        &:hover {
            transform: translateY(-1px);
            box-shadow: ${automotiveTheme.shadow.sm};
        }
    }

    .fc-list-event-time {
        font-weight: 600;
        color: ${automotiveTheme.primary};
    }

    .fc-list-event-title {
        font-weight: 500;
        color: ${automotiveTheme.textPrimary};
    }

    /* Professional scrollbar */
    .fc-scroller::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    .fc-scroller::-webkit-scrollbar-track {
        background: ${automotiveTheme.surfaceHover};
        border-radius: 3px;
    }

    .fc-scroller::-webkit-scrollbar-thumb {
        background: ${automotiveTheme.border};
        border-radius: 3px;

        &:hover {
            background: ${automotiveTheme.textMuted};
        }
    }

    /* Professional event styling */
    .professional-event {
        transition: all 0.2s ease;

        &:hover {
            z-index: 10;
        }
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .fc-event {
            font-size: 11px;
            padding: 1px 4px;
        }
    }

    .completed-event {
        opacity: 0.95 !important;
        background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
        border: 2px solid #047857 !important;
        color: white !important;
        font-weight: 700 !important;
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25) !important;
        transform: scale(1.02);
    }

    .cancelled-event {
        opacity: 0.9 !important;
        background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%) !important;
        border: 2px solid #b91c1c !important;
        color: white !important;
        font-weight: 700 !important;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25) !important;
        position: relative;
        transform: scale(1.02);
    }

    /* Opcjonalne przekreślenie dla anulowanych */
    .cancelled-event::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 8%;
        right: 8%;
        height: 2px;
        background: rgba(255, 255, 255, 0.9);
        transform: translateY(-50%);
        z-index: 1;
        border-radius: 1px;
    }

    /* Hover effects dla zakończonych statusów */
    .completed-event:hover {
        transform: scale(1.05) translateY(-2px) !important;
        box-shadow: 0 8px 20px rgba(5, 150, 105, 0.4) !important;
    }

    .cancelled-event:hover {
        transform: scale(1.05) translateY(-2px) !important;
        box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4) !important;
    }

    /* Style dla pozostałych statusów - niższe opacity dla kontrastu */
    .status-scheduled {
        opacity: 0.75;
    }

    .status-in_progress {
        opacity: 0.8;
    }

    .status-ready_for_pickup {
        opacity: 0.8;
    }
`;

export default AppointmentCalendar;