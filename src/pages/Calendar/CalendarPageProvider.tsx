// src/pages/Calendar/CalendarPageProvider.tsx - COMPLETE WITHOUT NAVIGATION
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Appointment, AppointmentStatus } from '../../types';
import { useCalendar } from '../../hooks/useCalendar';
import { useCalendarNavigation } from '../../hooks/useCalendarNavigation';
import { useConvertToVisit } from '../../hooks/useConvertToVisit';
import { protocolsApi } from '../../api/protocolsApi';
import { useToast } from '../../components/common/Toast/Toast';
import { ConvertToVisitResponse } from '../../types/recurringEvents';
import { endOfDay, endOfWeek, startOfDay, startOfWeek } from 'date-fns';
import { isReservationAppointment, extractReservationId } from '../../services/CalendarIntegrationService';
import { Reservation } from '../../features/reservations/api/reservationsApi';
import { appointmentToReservation } from '../../utils/appointmentConverters';

interface CalendarStats {
    loading: boolean;
    error: string | null;
    today: number;
    inProgress: number;
    readyForPickup: number;
    thisWeek: number;
    cancelled: number;
}

// ✅ NOWY typ dla aktywnego widoku
type CalendarView = 'calendar' | 'convertReservation';

interface CalendarPageContextType {
    // Data
    appointments: Appointment[];
    loading: boolean;
    error: string | null;
    lastRefresh: Date | null;
    calendarRange: { start: Date; end: Date } | null;
    stats: CalendarStats;

    // ✅ NOWE: View state
    activeView: CalendarView;
    convertingReservation: Reservation | null;

    // Functions
    loadAppointments: (range?: { start: Date; end: Date }, force?: boolean) => Promise<void>;
    handleRangeChange: (range: { start: Date; end: Date }) => void;
    handleAppointmentCreate: (start: Date, end: Date) => void;

    // Modals
    modals: {
        selectedAppointment: Appointment | null;
        selectedReservation: Reservation | null;
        showAppointmentDetailsModal: boolean;
        setShowAppointmentDetailsModal: (show: boolean) => void;
    };

    // Actions
    actions: {
        selectAppointment: (appointment: Appointment) => void;
        handleEditClick: () => void;
        handleDeleteAppointment: () => Promise<void>;
        handleStatusChange: (status: AppointmentStatus) => Promise<void>;
        handleCreateProtocol: () => void;
        handleNewAppointmentClick: () => void;
        handleConvertToVisit: (visitResponse: ConvertToVisitResponse) => void;
        refreshStats: () => Promise<void>;
        // ✅ ZMIENIONE: Nie przyjmują już parametrów
        handleEditReservation: (reservationId: string) => void;
        handleStartVisitFromReservation: (reservation: Reservation) => void;
        handleCancelConversion: () => void;
        handleConversionSuccess: (visitId: string) => void;
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

    // ✅ NOWE: View state
    const [activeView, setActiveView] = useState<CalendarView>('calendar');
    const [convertingReservation, setConvertingReservation] = useState<Reservation | null>(null);

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
            showToast('success',
                `Wizyta "${visitResponse.title}" została utworzona pomyślnie`,
                4000
            );
        },
        onCalendarRefresh: () => {
            if (calendarRange) {
                loadAppointments(calendarRange, true);
            }
        }
    });

    // Modal state
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [showAppointmentDetailsModal, setShowAppointmentDetailsModal] = useState(false);

    // Refs for preventing multiple actions
    const processingRef = useRef(false);

    // Stats calculation function
    const calculateStats = useCallback(async (): Promise<void> => {
        setStatsState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const counters = await protocolsApi.getProtocolCounters();
            const now = new Date();
            const todayStart = startOfDay(now);
            const todayEnd = endOfDay(now);
            const yesterdayStart = startOfDay(new Date(now.getTime() - 24 * 60 * 60 * 1000));
            const yesterdayEnd = endOfDay(new Date(now.getTime() - 24 * 60 * 60 * 1000));
            const weekStart = startOfWeek(now, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

            const protocolVisits = appointments.filter(apt => apt.isProtocol);

            const todayVisits = protocolVisits.filter(apt => {
                const aptDate = new Date(apt.start);
                return aptDate >= todayStart && aptDate <= todayEnd && apt.status == AppointmentStatus.SCHEDULED;
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

    useEffect(() => {
        if (appointments.length > 0) {
            calculateStats();
        }
    }, [appointments, calculateStats]);

    const refreshStats = useCallback(async (): Promise<void> => {
        await calculateStats();
    }, [calculateStats]);

    // ============================================================================
    // APPOINTMENT SELECTION
    // ============================================================================
    const selectAppointment = useCallback((appointment: Appointment) => {
        setSelectedAppointment(appointment);

        if (isReservationAppointment(appointment.id)) {
            const reservation = appointmentToReservation(appointment);
            setSelectedReservation(reservation);
        } else {
            setSelectedReservation(null);
        }

        setShowAppointmentDetailsModal(true);
    }, []);

    // ============================================================================
    // PROTOCOL ACTIONS
    // ============================================================================
    const handleEditClick = useCallback(() => {
        if (!selectedAppointment) return;

        if (selectedAppointment.isProtocol && selectedAppointment.id) {
            const protocolId = selectedAppointment.id.replace('protocol-', '');
            navigate(`/visits/${protocolId}/edit`);
        } else {
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
            await changeAppointmentStatus(selectedAppointment.id, status);
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

        if (selectedAppointment.isProtocol) {
            const protocolId = selectedAppointment.id.replace('protocol-', '');

            if (selectedAppointment.status === AppointmentStatus.SCHEDULED) {
                navigate(`/visits/${protocolId}/open`);
            } else {
                navigate(`/visits/${protocolId}`);
            }
        } else {
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

    // ============================================================================
    // ✅ RESERVATION ACTIONS - BEZ NAWIGACJI
    // ============================================================================
    const handleEditReservation = useCallback((reservationId: string) => {
        setShowAppointmentDetailsModal(false);
        navigate(`/reservations/${reservationId}/edit`);
    }, [navigate]);

    const handleStartVisitFromReservation = useCallback((reservation: Reservation) => {
        console.log('🚀 Starting visit conversion from reservation:', reservation);

        // Zamknij modal
        setShowAppointmentDetailsModal(false);
        setSelectedAppointment(null);
        setSelectedReservation(null);

        // ✅ ZMIENIONE: Ustaw stan konwersji i zmień widok
        setConvertingReservation(reservation);
        setActiveView('convertReservation');
    }, []);

    // ✅ NOWE: Anuluj konwersję i wróć do kalendarza
    const handleCancelConversion = useCallback(() => {
        setConvertingReservation(null);
        setActiveView('calendar');
    }, []);

    // ✅ NOWE: Po udanej konwersji
    const handleConversionSuccess = useCallback((visitId: string) => {
        console.log('✅ Reservation converted to visit:', visitId);

        // Wyczyść stan
        setConvertingReservation(null);
        setActiveView('calendar');

        // Odśwież kalendarz
        if (calendarRange) {
            loadAppointments(calendarRange, true);
        }

        // Odśwież statystyki
        refreshStats();

        // Pokazuj sukces
        showToast('success', 'Rezerwacja została przekształcona w wizytę', 4000);

        // Opcjonalnie: zapytaj czy przejść do wizyty
        setTimeout(() => {
            const shouldNavigate = window.confirm(
                'Czy chcesz przejść do szczegółów nowej wizyty?'
            );

            if (shouldNavigate) {
                navigate(`/visits/${visitId}`);
            }
        }, 1000);
    }, [calendarRange, loadAppointments, refreshStats, showToast, navigate]);

    // ============================================================================
    // CONVERT TO VISIT (recurring events)
    // ============================================================================
    const handleConvertToVisit = useCallback((visitResponse: ConvertToVisitResponse) => {
        processConvertToVisit(visitResponse);
        setShowAppointmentDetailsModal(false);
        setSelectedAppointment(null);

        setTimeout(() => {
            const shouldNavigate = window.confirm(
                `Wizyta "${visitResponse.title}" została utworzona. Czy chcesz przejść do szczegółów wizyty?`
            );

            if (shouldNavigate) {
                navigate(`/visits/${visitResponse.id}`);
            }
        }, 1000);
    }, [processConvertToVisit, navigate]);

    // ============================================================================
    // CONTEXT VALUE
    // ============================================================================
    const contextValue: CalendarPageContextType = {
        appointments,
        loading,
        error,
        lastRefresh,
        calendarRange,
        stats: statsState,

        // ✅ NOWE
        activeView,
        convertingReservation,

        loadAppointments,
        handleRangeChange,
        handleAppointmentCreate,

        modals: {
            selectedAppointment,
            selectedReservation,
            showAppointmentDetailsModal,
            setShowAppointmentDetailsModal
        },

        actions: {
            selectAppointment,
            handleEditClick,
            handleDeleteAppointment,
            handleStatusChange,
            handleCreateProtocol,
            handleNewAppointmentClick,
            handleConvertToVisit,
            refreshStats,
            handleEditReservation,
            handleStartVisitFromReservation,
            handleCancelConversion,        // ✅ NOWE
            handleConversionSuccess        // ✅ NOWE
        }
    };

    return (
        <CalendarPageContext.Provider value={contextValue}>
            {children}
        </CalendarPageContext.Provider>
    );
};