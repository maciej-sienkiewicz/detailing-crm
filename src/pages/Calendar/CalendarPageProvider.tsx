// src/pages/Calendar/CalendarPageProvider.tsx - STATE MANAGEMENT
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useCalendar } from '../../hooks/useCalendar';
import { useCalendarStats } from '../../hooks/useCalendarStats';
import { Appointment, AppointmentStatus } from '../../types';
import {useCalendarNavigation} from "../../hooks/useCalendarNavigation";
import {useCalendarModals} from "../../hooks/useCalendarModals";

interface CalendarPageContextType {
    // Data
    appointments: Appointment[];
    stats: ReturnType<typeof useCalendarStats>;
    loading: boolean;
    error: string | null;
    lastRefresh: Date | null;

    // Calendar operations
    loadAppointments: (range?: { start: Date; end: Date }) => Promise<void>;
    createAppointment: (data: Omit<Appointment, 'id'>) => Promise<void>;
    updateAppointmentData: (appointment: Appointment) => Promise<void>;
    removeAppointment: (id: string) => Promise<void>;
    changeAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;

    // Navigation
    calendarRange: { start: Date; end: Date } | null;
    handleRangeChange: (range: { start: Date; end: Date }) => void;
    handleAppointmentCreate: (start: Date, end: Date) => void;

    // Modals
    modals: ReturnType<typeof useCalendarModals>;

    // Actions
    actions: {
        selectAppointment: (appointment: Appointment) => void;
        handleCreateProtocol: () => Promise<void>;
        handleEditClick: () => void;
        handleUpdateAppointment: (data: Omit<Appointment, 'id'>) => Promise<void>;
        handleDeleteAppointment: () => Promise<void>;
        handleStatusChange: (status: AppointmentStatus) => Promise<void>;
        handleNewAppointmentClick: () => void;
    };
}

const CalendarPageContext = createContext<CalendarPageContextType | null>(null);

export const useCalendarPageContext = () => {
    const context = useContext(CalendarPageContext);
    if (!context) {
        throw new Error('useCalendarPageContext must be used within CalendarPageProvider');
    }
    return context;
};

interface CalendarPageProviderProps {
    children: React.ReactNode;
}

export const CalendarPageProvider: React.FC<CalendarPageProviderProps> = ({ children }) => {
    // Core calendar hook
    const {
        appointments,
        loading,
        error,
        lastRefresh,
        loadAppointments,
        createAppointment,
        updateAppointmentData,
        removeAppointment,
        changeAppointmentStatus
    } = useCalendar();

    // Derived data
    const stats = useCalendarStats(appointments);

    // Navigation hook
    const navigation = useCalendarNavigation({
        loadAppointments,
        createAppointment
    });

    // Modals hook
    const modals = useCalendarModals({
        updateAppointmentData,
        removeAppointment,
        changeAppointmentStatus
    });

    // Actions object - memoized for performance
    const actions = useMemo(() => ({
        selectAppointment: modals.selectAppointment,
        handleCreateProtocol: modals.handleCreateProtocol,
        handleEditClick: modals.handleEditClick,
        handleUpdateAppointment: modals.handleUpdateAppointment,
        handleDeleteAppointment: modals.handleDeleteAppointment,
        handleStatusChange: modals.handleStatusChange,
        handleNewAppointmentClick: navigation.handleNewAppointmentClick
    }), [modals, navigation]);

    // Context value - memoized to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        // Data
        appointments,
        stats,
        loading,
        error,
        lastRefresh,

        // Calendar operations
        loadAppointments,
        createAppointment,
        updateAppointmentData,
        removeAppointment,
        changeAppointmentStatus,

        // Navigation
        calendarRange: navigation.calendarRange,
        handleRangeChange: navigation.handleRangeChange,
        handleAppointmentCreate: navigation.handleAppointmentCreate,

        // Modals
        modals,

        // Actions
        actions
    }), [
        appointments,
        stats,
        loading,
        error,
        lastRefresh,
        loadAppointments,
        createAppointment,
        updateAppointmentData,
        removeAppointment,
        changeAppointmentStatus,
        navigation,
        modals,
        actions
    ]);

    return (
        <CalendarPageContext.Provider value={contextValue}>
            {children}
        </CalendarPageContext.Provider>
    );
};