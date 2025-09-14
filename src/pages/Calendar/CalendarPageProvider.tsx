// src/pages/Calendar/CalendarPageProvider.tsx - NAPRAWIONA WERSJA
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Appointment, AppointmentStatus, ProtocolStatus } from '../../types';
import { useCalendar } from '../../hooks/useCalendar';
import { useCalendarNavigation } from '../../hooks/useCalendarNavigation';
import { useConvertToVisit } from '../../hooks/useConvertToVisit';
import { protocolsApi } from '../../api/protocolsApi';
import { useToast } from '../../components/common/Toast/Toast';
import { ConvertToVisitResponse } from '../../types/recurringEvents';
import { startOfWeek, endOfWeek, startOfDay, endOfDay, isToday, isYesterday } from 'date-fns';

interface CalendarStats {
    loading: boolean;
    error: string | null;
    today: number;
    inProgress: number;
    readyForPickup: number;
    thisWeek: number;
    cancelled: number;
}

interface CalendarPageContextType {
    // Data
    appointments: Appointment[];
    loading: boolean;
    error: string | null;
    lastRefresh: Date | null;
    calendarRange: { start: Date; end: Date } | null;
    stats: CalendarStats;

    // Functions
    loadAppointments: (range?: { start: Date; end: Date }, force?: boolean) => Promise<void>;
    handleRangeChange: (range: { start: Date; end: Date }) => void;
    handleAppointmentCreate: (start: Date, end: Date) => void;

    // Modals
    modals: {
        selectedAppointment: Appointment | null;
        showAppointmentDetailsModal: boolean;
        setShowAppointmentDetailsModal: (show: boolean) => void;
    };

    // Actions
    actions: {
        selectAppointment: (appointment: Appointment) => void;
        handleEditClick: () => void;
        handleDeleteAppointment: () => Promise<void>; // FIXED: Promise<void>
        handleStatusChange: (status: AppointmentStatus) => Promise<void>; // FIXED: Promise<void>
        handleCreateProtocol: () => void;
        handleNewAppointmentClick: () => void;
        handleConvertToVisit: (visitResponse: ConvertToVisitResponse) => void;
        refreshStats: () => Promise<void>; // FIXED: Dodano do interfejsu
    };
}

const CalendarPageContext = createContext<CalendarPageContextType | undefined>(undefined);

export const useCalendarPageContext = () => {
    const context = useContext(CalendarPageContext);
    if (context === undefined) {
        throw new Error('useCalendarPageContext must be used within a CalendarPageProvider');
    }
    return context;
};

interface CalendarPageProviderProps {
    children: React.ReactNode;
}

export const CalendarPageProvider: React.FC<CalendarPageProviderProps> = ({ children }) => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Calendar hook
    const {
        appointments,
        loading,
        error,
        lastRefresh,
        loadAppointments,
        createAppointment,
        updateAppointmentData,
        removeAppointment,
        changeAppointmentStatus,
        clearCache
    } = useCalendar();

    // Stats state
    const [statsState, setStatsState] = useState<CalendarStats>({
        loading: false,
        error: null,
        today: 0,
        inProgress: 0,
        readyForPickup: 0,
        thisWeek: 0,
        cancelled: 0
    });

    // Navigation hook
    const {
        calendarRange,
        handleRangeChange,
        handleAppointmentCreate,
        handleNewAppointmentClick
    } = useCalendarNavigation({
        loadAppointments,
        createAppointment
    });

    // Convert to visit hook
    const { handleConvertToVisit: processConvertToVisit } = useConvertToVisit({
        onVisitCreated: (visitResponse) => {
            console.log('🎯 Nowa wizyta utworzona z cyklicznej:', visitResponse);

            // Pokazujemy dodatkowe powiadomienie z detalami
            showToast('success',
                `Wizyta "${visitResponse.title}" została utworzona pomyślnie`,
                4000
            );
        },
        onCalendarRefresh: () => {
            console.log('🔄 Odświeżanie kalendarza po konwersji');

            // Force refresh kalendarza aby pokazać nową wizytę i ukryć przekształconą cykliczną
            if (calendarRange) {
                loadAppointments(calendarRange, true);
            }
        }
    });

    // Modal state
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showAppointmentDetailsModal, setShowAppointmentDetailsModal] = useState(false);

    // Refs for preventing multiple actions
    const processingRef = useRef(false);

    // Stats calculation function
    const calculateStats = useCallback(async (): Promise<void> => {
        setStatsState(prev => ({ ...prev, loading: true, error: null }));

        try {
            // Pobierz liczniki z API
            const counters = await protocolsApi.getProtocolCounters();

            // Oblicz statystyki na podstawie aktualnych wizyt
            const now = new Date();
            const todayStart = startOfDay(now);
            const todayEnd = endOfDay(now);
            const yesterdayStart = startOfDay(new Date(now.getTime() - 24 * 60 * 60 * 1000));
            const yesterdayEnd = endOfDay(new Date(now.getTime() - 24 * 60 * 60 * 1000));
            const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Poniedziałek
            const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

            // Filtruj wizyty protokołowe (pomijamy cykliczne wydarzenia)
            const protocolVisits = appointments.filter(apt => apt.isProtocol);

            const todayVisits = protocolVisits.filter(apt => {
                const aptDate = new Date(apt.start);
                return aptDate >= todayStart && aptDate <= todayEnd;
            }).length;

            const weekVisits = protocolVisits.filter(apt => {
                const aptDate = new Date(apt.start);
                return aptDate >= weekStart && aptDate <= weekEnd;
            }).length;

            const yesterdayCancelled = protocolVisits.filter(apt => {
                const aptDate = new Date(apt.start);
                return aptDate >= yesterdayStart && aptDate <= yesterdayEnd &&
                    apt.status === AppointmentStatus.CANCELLED;
            }).length;

            setStatsState({
                loading: false,
                error: null,
                today: todayVisits,
                inProgress: counters.inProgress || 0,
                readyForPickup: counters.readyForPickup || 0,
                thisWeek: weekVisits,
                cancelled: yesterdayCancelled
            });

        } catch (error) {
            console.error('Error calculating stats:', error);
            setStatsState(prev => ({
                ...prev,
                loading: false,
                error: 'Nie udało się załadować statystyk'
            }));
        }
    }, [appointments]);

    // Auto-refresh stats when appointments change
    useEffect(() => {
        if (appointments.length > 0) {
            calculateStats();
        }
    }, [appointments, calculateStats]);

    // Refresh stats function
    const refreshStats = useCallback(async (): Promise<void> => {
        await calculateStats();
    }, [calculateStats]);

    // Action handlers
    const selectAppointment = useCallback((appointment: Appointment) => {
        console.log('📋 Selected appointment:', appointment.id, appointment.title);
        setSelectedAppointment(appointment);
        setShowAppointmentDetailsModal(true);
    }, []);

    const handleEditClick = useCallback(() => {
        if (!selectedAppointment) return;

        console.log('✏️ Edit appointment:', selectedAppointment.id);

        if (selectedAppointment.isProtocol && selectedAppointment.id) {
            const protocolId = selectedAppointment.id.replace('protocol-', '');
            navigate(`/visits/${protocolId}/edit`);
        } else {
            // For regular appointments, navigate to visit creation with pre-filled data
            navigate('/visits', {
                state: {
                    editProtocolId: selectedAppointment.id,
                    startDate: selectedAppointment.start.toISOString(),
                    endDate: selectedAppointment.end.toISOString(),
                    protocolData: {
                        title: selectedAppointment.title,
                        customerId: selectedAppointment.customerId,
                        vehicleId: selectedAppointment.vehicleId
                    }
                }
            });
        }

        setShowAppointmentDetailsModal(false);
    }, [selectedAppointment, navigate]);

    const handleDeleteAppointment = useCallback(async (): Promise<void> => {
        if (!selectedAppointment || processingRef.current) return;

        const confirmMessage = `Czy na pewno chcesz usunąć wizytę "${selectedAppointment.title}"?`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        processingRef.current = true;

        try {
            console.log('🗑️ Deleting appointment:', selectedAppointment.id);

            await removeAppointment(selectedAppointment.id);

            showToast('success', 'Wizyta została usunięta', 3000);
            setShowAppointmentDetailsModal(false);
            setSelectedAppointment(null);

        } catch (error) {
            console.error('Error deleting appointment:', error);
            showToast('error', 'Nie udało się usunąć wizyty', 5000);
        } finally {
            processingRef.current = false;
        }
    }, [selectedAppointment, removeAppointment, showToast]);

    const handleStatusChange = useCallback(async (status: AppointmentStatus): Promise<void> => {
        if (!selectedAppointment || processingRef.current) return;

        processingRef.current = true;

        try {
            console.log('🔄 Changing appointment status:', selectedAppointment.id, 'to', status);

            await changeAppointmentStatus(selectedAppointment.id, status);

            // Update local state
            setSelectedAppointment(prev => prev ? { ...prev, status } : null);

            showToast('success', 'Status wizyty został zmieniony', 3000);

        } catch (error) {
            console.error('Error changing appointment status:', error);
            showToast('error', 'Nie udało się zmienić statusu wizyty', 5000);
        } finally {
            processingRef.current = false;
        }
    }, [selectedAppointment, changeAppointmentStatus, showToast]);

    const handleCreateProtocol = useCallback(() => {
        if (!selectedAppointment) return;

        console.log('📋 Creating protocol for appointment:', selectedAppointment.id);

        if (selectedAppointment.isProtocol) {
            // If it's already a protocol, navigate to the protocol details/start visit
            const protocolId = selectedAppointment.id.replace('protocol-', '');

            if (selectedAppointment.status === AppointmentStatus.SCHEDULED) {
                // Start the visit
                navigate(`/visits/${protocolId}/open`);
            } else {
                // View the protocol
                navigate(`/visits/${protocolId}`);
            }
        } else {
            // Create new protocol from appointment
            navigate('/visits', {
                state: {
                    appointmentId: selectedAppointment.id,
                    startDate: selectedAppointment.start.toISOString(),
                    endDate: selectedAppointment.end.toISOString(),
                    isFullProtocol: true,
                    protocolData: {
                        title: selectedAppointment.title,
                        customerId: selectedAppointment.customerId,
                        vehicleId: selectedAppointment.vehicleId,
                        services: selectedAppointment.services || []
                    }
                }
            });
        }

        setShowAppointmentDetailsModal(false);
    }, [selectedAppointment, navigate]);

    // Obsługa konwersji cyklicznych wizyt
    const handleConvertToVisit = useCallback((visitResponse: ConvertToVisitResponse) => {
        console.log('🔄 Processing convert to visit in CalendarPageProvider:', visitResponse);

        // Wywołaj hook który obsłuży resztę logiki
        processConvertToVisit(visitResponse);

        // Zamknij modal szczegółów
        setShowAppointmentDetailsModal(false);
        setSelectedAppointment(null);

        // Opcjonalnie: pokaż dodatkowe akcje
        setTimeout(() => {
            const shouldNavigate = window.confirm(
                `Wizyta "${visitResponse.title}" została utworzona. Czy chcesz przejść do szczegółów wizyty?`
            );

            if (shouldNavigate) {
                navigate(`/visits/${visitResponse.id}`);
            }
        }, 1000);

    }, [processConvertToVisit, navigate]);

    // Context value
    const contextValue: CalendarPageContextType = {
        // Data
        appointments,
        loading,
        error,
        lastRefresh,
        calendarRange,
        stats: statsState, // FIXED: Użyj statsState zamiast stats

        // Functions
        loadAppointments,
        handleRangeChange,
        handleAppointmentCreate,

        // Modals
        modals: {
            selectedAppointment,
            showAppointmentDetailsModal,
            setShowAppointmentDetailsModal
        },

        // Actions
        actions: {
            selectAppointment,
            handleEditClick,
            handleDeleteAppointment, // Teraz Promise<void>
            handleStatusChange, // Teraz Promise<void>
            handleCreateProtocol,
            handleNewAppointmentClick,
            handleConvertToVisit,
            refreshStats // Dodano do interfejsu
        }
    };

    return (
        <CalendarPageContext.Provider value={contextValue}>
            {children}
        </CalendarPageContext.Provider>
    );
};