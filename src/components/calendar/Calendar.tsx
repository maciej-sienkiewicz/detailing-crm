// src/components/calendar/Calendar.tsx
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
    // Professional State Management
    const [calendarColors, setCalendarColors] = useState<Record<string, CalendarColor>>({});
    const [currentView, setCurrentView] = useState<CalendarView>('dayGridMonth');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [quickFilters, setQuickFilters] = useState({
        scheduled: true,
        inProgress: true,
        readyForPickup: true,
        completed: false,
        cancelled: false
    });

    const calendarRef = useRef<FullCalendar>(null);

    // Get current period title for display
    const getCurrentPeriodTitle = (): string => {
        const currentDate = selectedDate;
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
                    event.isProtocol ? 'protocol-event' : 'appointment-event'
                ]
            }));
    };

    // Status Key Mapping for Filters
    const getStatusKey = (status: AppointmentStatus): keyof typeof quickFilters => {
        switch (status) {
            case AppointmentStatus.SCHEDULED: return 'scheduled';
            case AppointmentStatus.IN_PROGRESS: return 'inProgress';
            case AppointmentStatus.READY_FOR_PICKUP: return 'readyForPickup';
            case AppointmentStatus.COMPLETED: return 'completed';
            case AppointmentStatus.CANCELLED: return 'cancelled';
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

    // Professional Event Handlers
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

    const handleDatesSet = (info: any) => {
        setSelectedDate(info.start);
        if (onRangeChange) {
            onRangeChange({
                start: info.start,
                end: info.end
            });
        }
    };

    // View Controls
    const handleViewChange = (view: CalendarView) => {
        setCurrentView(view);
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.changeView(view);
        }
    };

    const handleNavigate = (action: 'prev' | 'next' | 'today') => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            switch (action) {
                case 'prev':
                    calendarApi.prev();
                    break;
                case 'next':
                    calendarApi.next();
                    break;
                case 'today':
                    calendarApi.today();
                    break;
            }
        }
    };

    // Filter Toggle
    const toggleFilter = (filterKey: keyof typeof quickFilters) => {
        setQuickFilters(prev => ({
            ...prev,
            [filterKey]: !prev[filterKey]
        }));
    };

    // Initialize Calendar Colors
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
                            $color={automotiveTheme.info}
                            onClick={() => toggleFilter('scheduled')}
                        >
                            Zaplanowane
                        </FilterButton>
                        <FilterButton
                            $active={quickFilters.inProgress}
                            $color={automotiveTheme.warning}
                            onClick={() => toggleFilter('inProgress')}
                        >
                            W trakcie
                        </FilterButton>
                        <FilterButton
                            $active={quickFilters.readyForPickup}
                            $color={automotiveTheme.success}
                            onClick={() => toggleFilter('readyForPickup')}
                        >
                            Gotowe
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
                    eventDidMount={(info) => {
                        const appointment = info.event.extendedProps as Appointment;

                        // Professional event styling
                        info.el.style.borderRadius = '6px';
                        info.el.style.fontSize = '12px';
                        info.el.style.fontWeight = '600';
                        info.el.style.cursor = 'pointer';
                        info.el.style.transition = 'all 0.2s ease';

                        if (appointment.isProtocol) {
                            info.el.style.borderLeft = `3px solid ${automotiveTheme.primary}`;
                        }

                        // Subtle hover effects
                        info.el.addEventListener('mouseenter', () => {
                            info.el.style.transform = 'translateY(-1px)';
                            info.el.style.boxShadow = automotiveTheme.shadow.sm;
                        });

                        info.el.addEventListener('mouseleave', () => {
                            info.el.style.transform = 'translateY(0)';
                            info.el.style.boxShadow = 'none';
                        });
                    }}
                />
            </CalendarWrapper>
        </CalendarContainer>
    );
};

// Professional Styled Components
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
`;

export default AppointmentCalendar;