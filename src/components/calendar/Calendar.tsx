// src/components/calendar/Calendar.tsx - PRODUCTION READY VERSION
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import plLocale from '@fullcalendar/core/locales/pl';
import { Appointment } from '../../types';
import { addMinutes } from 'date-fns';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { theme } from '../../styles/theme';
import { useCalendarColors } from '../../hooks/useCalendarColors';
import {
    CalendarView,
    QuickFilters,
    DEFAULT_QUICK_FILTERS,
    getCurrentPeriodTitle,
    mapAppointmentsToFullCalendarEvents
} from '../../utils/calendarUtils';

interface CalendarProps {
    events: Appointment[];
    onEventSelect: (event: Appointment) => void;
    onRangeChange?: (range: { start: Date; end: Date }) => void;
    onEventCreate?: (start: Date, end: Date) => void;
}

const AppointmentCalendar: React.FC<CalendarProps> = React.memo(({
                                                                     events,
                                                                     onEventSelect,
                                                                     onRangeChange,
                                                                     onEventCreate
                                                                 }) => {
    // State Management
    const [currentView, setCurrentView] = useState<CalendarView>('dayGridMonth');
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [quickFilters, setQuickFilters] = useState<QuickFilters>(DEFAULT_QUICK_FILTERS);

    // Refs for FullCalendar control
    const calendarRef = useRef<FullCalendar>(null);

    // Simple state management
    const [isInitialized, setIsInitialized] = useState(false);
    const [isViewChanging, setIsViewChanging] = useState(false);

    // Prevent initial range update after mount
    const hasInitialRangeBeenSet = useRef(false);

    // Use optimized calendar colors hook
    const { calendarColors } = useCalendarColors();

    // Memoized events to prevent unnecessary re-renders
    const memoizedEvents = useMemo(() =>
            mapAppointmentsToFullCalendarEvents(events, quickFilters, calendarColors),
        [events, quickFilters, calendarColors]
    );

    // Event Handlers - all memoized for performance
    const handleEventClick = useCallback((info: any) => {
        const appointment = info.event.extendedProps;
        onEventSelect(appointment);
    }, [onEventSelect]);

    const handleDateSelect = useCallback((info: any) => {
        if (onEventCreate) {
            let start = new Date(info.start);
            let end = new Date(info.end);

            if (start.getTime() === end.getTime()) {
                end = addMinutes(start, 60);
            }

            onEventCreate(start, end);
        }
    }, [onEventCreate]);

    // PRODUCTION: Clean and simple datesSet handler
    const handleDatesSet = useCallback((info: any) => {
        if (!calendarRef.current) return;

        const calendarApi = calendarRef.current.getApi();
        const actualCalendarDate = calendarApi.getDate();

        // Always update current date for display
        setCurrentDate(new Date(actualCalendarDate));

        // Skip during view changes
        if (isViewChanging) {
            return;
        }

        // Mark as initialized
        if (!isInitialized) {
            setIsInitialized(true);
        }

        // Handle range changes
        if (onRangeChange) {
            // Set initial range only once
            if (!hasInitialRangeBeenSet.current) {
                hasInitialRangeBeenSet.current = true;
                // Use setTimeout to avoid conflicts with React rendering
                setTimeout(() => {
                    onRangeChange({
                        start: info.start,
                        end: info.end
                    });
                }, 0);
            } else {
                // Immediate range update for navigation
                onRangeChange({
                    start: info.start,
                    end: info.end
                });
            }
        }
    }, [isViewChanging, isInitialized, onRangeChange]);

    // PRODUCTION: Simple navigation
    const handleNavigate = useCallback((action: 'prev' | 'next' | 'today') => {
        if (!calendarRef.current) return;

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
    }, []);

    // PRODUCTION: Clean view change handler
    const handleViewChange = useCallback((view: CalendarView) => {
        if (!calendarRef.current || currentView === view) return;

        setIsViewChanging(true);
        const calendarApi = calendarRef.current.getApi();

        try {
            calendarApi.changeView(view);
            setCurrentView(view);
        } catch (error) {
            console.error('Error changing view:', error);
        } finally {
            // Reset view changing flag after a brief delay
            setTimeout(() => setIsViewChanging(false), 100);
        }
    }, [currentView]);

    const toggleFilter = useCallback((filterKey: keyof QuickFilters) => {
        setQuickFilters(prev => ({
            ...prev,
            [filterKey]: !prev[filterKey]
        }));
    }, []);

    // PRODUCTION: Simple one-time initialization
    useEffect(() => {
        if (calendarRef.current && !isInitialized) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.gotoDate(new Date());
        }
    }, []); // Empty deps - runs only once

    // Configuration for filter buttons with colors
    const filterConfig = {
        scheduled: { label: 'Zaplanowane', color: theme.primary },
        inProgress: { label: 'W trakcie', color: theme.primary },
        readyForPickup: { label: 'Oczekujące na odbiór', color: theme.primary },
        completed: { label: 'Zakończone', color: theme.primary },
        cancelled: { label: 'Anulowane', color: theme.primary }
    };

    return (
        <CalendarContainer>
            {/* Controls */}
            <CalendarControls>
                <ControlsLeft>
                    <NavigationGroup>
                        <NavButton onClick={() => handleNavigate('prev')}>
                            <FaChevronLeft />
                        </NavButton>
                        <CurrentPeriod>{getCurrentPeriodTitle(currentDate, currentView)}</CurrentPeriod>
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
                    <QuickFiltersContainer>
                        {Object.entries(filterConfig).map(([key, config]) => {
                            const isActive = quickFilters[key as keyof QuickFilters];
                            return (
                                <FilterButton
                                    key={key}
                                    $active={isActive}
                                    $color={config.color}
                                    onClick={() => toggleFilter(key as keyof QuickFilters)}
                                >
                                    <FilterContent>
                                        <FilterLabel>{config.label}</FilterLabel>
                                        <CheckIcon $active={isActive} $color={config.color}>
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="20,6 9,17 4,12" />
                                            </svg>
                                        </CheckIcon>
                                    </FilterContent>
                                </FilterButton>
                            );
                        })}
                    </QuickFiltersContainer>
                </ControlsRight>
            </CalendarControls>

            {/* Calendar */}
            <CalendarWrapper>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    initialView={currentView}
                    initialDate={new Date()}
                    events={memoizedEvents}
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

                        // Basic styling
                        info.el.style.borderRadius = '6px';
                        info.el.style.fontSize = '12px';
                        info.el.style.fontWeight = '600';
                        info.el.style.cursor = 'pointer';
                        info.el.style.transition = 'all 0.2s ease';

                        // Protocol styling
                        if (appointment.isProtocol) {
                            info.el.style.borderLeft = `3px solid ${theme.primary}`;
                        }

                        // Status-specific styling
                        if (appointment.status === 'COMPLETED') {
                            info.el.style.setProperty('opacity', '0.2', 'important');
                            info.el.style.setProperty('background', 'linear-gradient(135deg, #059669 0%, #10b981 100%)', 'important');
                        }

                        if (appointment.status === 'CANCELLED') {
                            info.el.style.setProperty('opacity', '0.5', 'important');
                            info.el.style.setProperty('background', 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', 'important');
                        }

                        // Hover effects
                        info.el.addEventListener('mouseenter', () => {
                            info.el.style.transform = 'translateY(-1px)';
                            info.el.style.boxShadow = theme.shadow.sm;
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
});

AppointmentCalendar.displayName = 'AppointmentCalendar';

// Styled Components
const CalendarContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: ${theme.surface};
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.border};
    overflow: hidden;
    box-shadow: ${theme.shadow.sm};
`;

const CalendarControls = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.xl} ${theme.spacing.xxxl};
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.borderLight};
`;

const ControlsLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xxl};
`;

const NavigationGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    padding: ${theme.spacing.sm};
    box-shadow: ${theme.shadow.sm};
`;

const NavButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: transparent;
    border: none;
    border-radius: ${theme.radius.sm};
    color: ${theme.text.secondary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        color: ${theme.primary};
    }

    svg {
        font-size: 14px;
    }
`;

const CurrentPeriod = styled.div`
    font-size: 18px;
    font-weight: 700;
    color: ${theme.text.primary};
    min-width: 200px;
    text-align: center;
    letter-spacing: -0.025em;
`;

const TodayButton = styled.button`
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    background: ${theme.primary};
    color: white;
    border: none;
    border-radius: ${theme.radius.sm};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.primaryDark};
    }
`;

const ViewSelector = styled.div`
    display: flex;
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    overflow: hidden;
    box-shadow: ${theme.shadow.sm};
`;

const ViewButton = styled.button<{ $active: boolean }>`
    padding: ${theme.spacing.md} ${theme.spacing.xl};
    background: ${props => props.$active ? theme.primary : 'transparent'};
    color: ${props => props.$active ? 'white' : theme.text.secondary};
    border: none;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-right: 1px solid ${theme.borderLight};

    &:last-child {
        border-right: none;
    }

    &:hover:not([data-active="true"]) {
        background: ${theme.surfaceHover};
        color: ${theme.primary};
    }
`;

const ControlsRight = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
`;

const QuickFiltersContainer = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};
`;

const FilterButton = styled.button<{ $active: boolean; $color: string }>`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${theme.surface};
    border: 2px solid ${props => props.$active ? props.$color : '#e2e8f0'};
    border-radius: ${theme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 100px;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.sm};
        border-color: ${props => props.$color};
    }
`;

const FilterContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

const FilterLabel = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${theme.text.secondary};
    text-align: center;
`;

const CheckIcon = styled.div<{ $active: boolean; $color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: ${props => props.$active ? props.$color : '#94a3b8'};
    transition: all 0.2s ease;

    svg {
        transition: all 0.2s ease;
        transform: ${props => props.$active ? 'scale(1)' : 'scale(0.8)'};
        opacity: ${props => props.$active ? 1 : 0.6};
    }
`;

const CalendarWrapper = styled.div`
    flex: 1;
    padding: ${theme.spacing.xl} ${theme.spacing.xxxl};
    background: ${theme.surface};

    .fc {
        height: 100%;
        font-family: inherit;
    }

    .fc-theme-standard td, .fc-theme-standard th {
        border-color: ${theme.borderLight};
    }

    .fc-theme-standard .fc-scrollgrid {
        border-color: ${theme.border};
        border-radius: ${theme.radius.lg};
        overflow: hidden;
    }

    .fc-col-header-cell {
        background: ${theme.surfaceActive};
        font-weight: 600;
        color: ${theme.text.secondary};
        font-size: 13px;
        padding: ${theme.spacing.lg};
    }

    .fc-daygrid-day {
        transition: background-color 0.2s ease;

        &:hover {
            background: ${theme.surfaceHover};
        }
    }

    .fc-daygrid-day-number {
        color: ${theme.text.secondary};
        font-weight: 600;
        padding: ${theme.spacing.sm};
    }

    .fc-day-today {
        background: ${theme.surfaceHover} !important;

        .fc-daygrid-day-number {
            background: ${theme.primary};
            color: white;
            border-radius: ${theme.radius.sm};
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    .fc-event {
        border-radius: ${theme.radius.sm};
        border: none;
        font-weight: 600;
        font-size: 12px;
        margin: 2px;
        padding: 2px 6px;

        &.protocol-event {
            border-left: 3px solid ${theme.primary};
            font-weight: 700;
        }
    }

    .fc-timegrid-slot {
        height: 60px;
        border-color: ${theme.borderLight};
    }

    .fc-timegrid-slot-label {
        color: ${theme.text.tertiary};
        font-weight: 500;
        font-size: 12px;
    }

    .fc-list-event {
        border-radius: ${theme.radius.md};
        margin-bottom: ${theme.spacing.sm};

        &:hover {
            transform: translateY(-1px);
            box-shadow: ${theme.shadow.sm};
        }
    }

    .fc-list-event-time {
        font-weight: 600;
        color: ${theme.primary};
    }

    .fc-list-event-title {
        font-weight: 500;
        color: ${theme.text.primary};
    }

    .fc-scroller::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    .fc-scroller::-webkit-scrollbar-track {
        background: ${theme.surfaceHover};
        border-radius: 3px;
    }

    .fc-scroller::-webkit-scrollbar-thumb {
        background: ${theme.border};
        border-radius: 3px;

        &:hover {
            background: ${theme.text.muted};
        }
    }

    .professional-event {
        transition: all 0.2s ease;

        &:hover {
            z-index: 10;
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

    .completed-event:hover {
        transform: scale(1.05) translateY(-2px) !important;
        box-shadow: 0 8px 20px rgba(5, 150, 105, 0.4) !important;
    }

    .cancelled-event:hover {
        transform: scale(1.05) translateY(-2px) !important;
        box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4) !important;
    }

    .status-scheduled {
        opacity: 0.75;
    }

    .status-in_progress {
        opacity: 0.8;
    }

    .status-ready_for_pickup {
        opacity: 0.8;
    }

    @media (max-width: 768px) {
        .fc-event {
            font-size: 11px;
            padding: 1px 4px;
        }
    }
`;

export default AppointmentCalendar;