// src/pages/Calendar/CalendarPageProvider.tsx - ZAKTUALIZOWANA WERSJA
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useCalendar } from '../../hooks/useCalendar';
import { useCalendarStats } from '../../hooks/useCalendarStats';
import { Appointment, AppointmentStatus } from '../../types';
import { useCalendarNavigation } from "../../hooks/useCalendarNavigation";
import { useCalendarModals } from "../../hooks/useCalendarModals";

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
        refreshStats: () => Promise<void>; // Nowa akcja
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
    // Core calendar hook - dla wydarzeń w widoku kalendarza
    const {
        appointments,
        loading: calendarLoading,
        error: calendarError,
        lastRefresh,
        loadAppointments,
        createAppointment,
        updateAppointmentData,
        removeAppointment,
        changeAppointmentStatus
    } = useCalendar();

    // Niezależny hook dla statystyk - nie zależy od zakresu kalendarza
    const statsHook = useCalendarStats();

    // Navigation hook
    const navigation = useCalendarNavigation({
        loadAppointments,
        createAppointment
    });

    // Modals hook z odświeżaniem statystyk po zmianach
    const modals = useCalendarModals({
        updateAppointmentData: useCallback(async (appointment: Appointment) => {
            await updateAppointmentData(appointment);
            // Odśwież statystyki po aktualizacji
            await statsHook.refreshStats();
        }, [updateAppointmentData, statsHook.refreshStats]),

        removeAppointment: useCallback(async (id: string) => {
            await removeAppointment(id);
            // Odśwież statystyki po usunięciu
            await statsHook.refreshStats();
        }, [removeAppointment, statsHook.refreshStats]),

        changeAppointmentStatus: useCallback(async (id: string, status: AppointmentStatus) => {
            await changeAppointmentStatus(id, status);
            // Odśwież statystyki po zmianie statusu
            await statsHook.refreshStats();
        }, [changeAppointmentStatus, statsHook.refreshStats])
    });

    // Actions object - memoized for performance
    const actions = useMemo(() => ({
        selectAppointment: modals.selectAppointment,
        handleCreateProtocol: modals.handleCreateProtocol,
        handleEditClick: modals.handleEditClick,
        handleUpdateAppointment: useCallback(async (data: Omit<Appointment, 'id'>) => {
            await modals.handleUpdateAppointment(data);
            // Odśwież statystyki po aktualizacji
            await statsHook.refreshStats();
        }, [modals.handleUpdateAppointment, statsHook.refreshStats]),
        handleDeleteAppointment: useCallback(async () => {
            await modals.handleDeleteAppointment();
            // Odśwież statystyki po usunięciu
            await statsHook.refreshStats();
        }, [modals.handleDeleteAppointment, statsHook.refreshStats]),
        handleStatusChange: modals.handleStatusChange,
        handleNewAppointmentClick: navigation.handleNewAppointmentClick,
        refreshStats: statsHook.refreshStats
    }), [modals, navigation, statsHook.refreshStats]);

    // Połącz loading states - calendar może się ładować niezależnie od statystyk
    const combinedLoading = calendarLoading;
    const combinedError = calendarError || statsHook.error;

    // Context value - memoized to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        // Data
        appointments,
        stats: statsHook, // Zawiera stats + loading + error + refreshStats
        loading: combinedLoading,
        error: combinedError,
        lastRefresh,

        // Calendar operations
        loadAppointments,
        createAppointment: useCallback(async (data: Omit<Appointment, 'id'>) => {
            await createAppointment(data);
            // Odśwież statystyki po utworzeniu
            await statsHook.refreshStats();
        }, [createAppointment, statsHook.refreshStats]),
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
        statsHook,
        combinedLoading,
        combinedError,
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