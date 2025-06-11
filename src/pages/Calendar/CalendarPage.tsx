// src/pages/Calendar/CalendarPage.tsx
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {useNavigate} from 'react-router-dom';
import AppointmentCalendar from '../../components/calendar/Calendar';
import Modal from '../../components/common/Modal';
import AppointmentForm from '../../components/calendar/AppointmentForm';
import AppointmentDetails from '../../components/calendar/AppointmentDetails';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import {Appointment, AppointmentStatus, ProtocolStatus} from '../../types';
import {
    addAppointment,
    deleteAppointment,
    fetchAppointments,
    updateAppointment,
    updateAppointmentStatus
} from '../../api/mocks/appointmentMocks';
import {fetchProtocolsAsAppointments} from '../../services/ProtocolCalendarService';
import {mapAppointmentToProtocol} from '../../services/ProtocolMappingService';
import {useToast} from '../../components/common/Toast/Toast';
import {
    FaCalendarAlt,
    FaChartLine,
    FaClock,
    FaHeartBroken,
    FaPlus,
    FaSignOutAlt,
    FaSync,
    FaUsers
} from 'react-icons/fa';
import {brandTheme} from "../Finances/styles/theme";

// Enterprise Design System - Automotive Grade
const enterprise = {
    // Brand Color System
    primary: 'var(--brand-primary, #2563eb)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',

    // Professional Surfaces
    surface: '#ffffff',
    surfaceElevated: '#fafbfc',
    surfaceHover: '#f8fafc',
    surfaceActive: '#f1f5f9',

    // Executive Typography
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',

    // Technical Borders
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderActive: '#cbd5e1',

    // Status Colors
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

    // Industrial Shadows
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

const CalendarPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    // State Management
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    // Modal States
    const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
    const [showAppointmentDetailsModal, setShowAppointmentDetailsModal] = useState(false);
    const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);
    const [showNewVisitConfirmation, setShowNewVisitConfirmation] = useState(false);

    // Calendar States
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedEndDate, setSelectedEndDate] = useState<Date>(new Date());
    const [calendarRange, setCalendarRange] = useState<{ start: Date; end: Date } | null>(null);

    // Enhanced data loading with error handling
    const loadAppointmentsAndProtocols = async (showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            setError(null);

            // Parallel data fetching for optimal performance
            const [appointmentsData, protocolsData] = await Promise.all([
                fetchAppointments().catch(err => {
                    console.error('Error fetching appointments:', err);
                    return [];
                }),
                fetchProtocolsAsAppointments().catch(err => {
                    console.error('Error fetching protocols:', err);
                    return [];
                })
            ]);

            // Combine and sort data
            const combinedData = [...appointmentsData, ...protocolsData]
                .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

            setAppointments(combinedData);
            setLastRefresh(new Date());

        } catch (err) {
            const errorMessage = 'Nie udało się załadować danych kalendarza.';
            setError(errorMessage);
            showToast('error', errorMessage, 5000);
            console.error('Error loading calendar data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Initialize data on component mount
    useEffect(() => {
        loadAppointmentsAndProtocols();
    }, []);

    // Enhanced appointment selection with validation
    const handleAppointmentSelect = (appointment: Appointment) => {
        if (!appointment || !appointment.id) {
            showToast('error', 'Nieprawidłowe dane wizyty', 3000);
            return;
        }

        setSelectedAppointment(appointment);
        setShowAppointmentDetailsModal(true);
    };

    // Professional protocol creation workflow
    const handleCreateProtocol = async () => {
        if (!selectedAppointment) {
            showToast('error', 'Nie wybrano wizyty', 3000);
            return;
        }

        // Validate protocol creation conditions
        if (selectedAppointment.isProtocol &&
            (selectedAppointment.status as unknown as ProtocolStatus) === ProtocolStatus.SCHEDULED) {
            navigate(`/orders`, {
                state: {
                    editProtocolId: selectedAppointment.id,
                    isOpenProtocolAction: true
                }
            });
            return;
        }

        if (selectedAppointment.isProtocol) {
            showToast('warning', 'To wydarzenie jest już protokołem', 3000);
            return;
        }

        try {
            // Map appointment data to protocol structure
            const protocolData = mapAppointmentToProtocol(selectedAppointment);

            // Close current modal
            setShowAppointmentDetailsModal(false);

            // Navigate to protocol creation
            navigate('/orders/car-reception?createFromAppointment=true', {
                state: {
                    protocolData,
                    appointmentId: selectedAppointment.id
                }
            });

            showToast('info', 'Przekierowanie do tworzenia protokołu...', 2000);
        } catch (err) {
            console.error('Error creating protocol from appointment:', err);
            showToast('error', 'Nie udało się utworzyć protokołu z wizyty', 5000);
        }
    };

    // Enhanced date range handling
    const handleRangeChange = (range: { start: Date; end: Date }) => {
        setCalendarRange(range);
        console.log('Calendar range changed:', {
            start: range.start.toISOString(),
            end: range.end.toISOString()
        });
    };

    // Professional appointment creation workflow
    const handleAppointmentCreate = (start: Date, end: Date) => {
        // Validate date selection
        const now = new Date();
        if (start < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
            showToast('warning', 'Nie można tworzyć wizyt w przeszłości', 3000);
            return;
        }

        setSelectedDate(start);

        // Adjust end date for proper date range handling
        const correctedEndDate = new Date(end);
        correctedEndDate.setDate(correctedEndDate.getDate() - 1);

        setSelectedEndDate(correctedEndDate);
        setShowNewVisitConfirmation(true);

    };

    // Visit creation confirmation handler
    const handleConfirmNewVisit = () => {
        setShowNewVisitConfirmation(false);

        // Create local timezone dates to avoid timezone issues
        const localStartDate = new Date(selectedDate);
        localStartDate.setHours(12, 0, 0, 0);

        const localEndDate = new Date(selectedEndDate);
        localEndDate.setHours(23, 59, 0, 0);

        // Navigate to full protocol creation
        navigate('/orders', {
            state: {
                startDate: localStartDate.toISOString(),
                endDate: localEndDate.toISOString(),
                isFullProtocol: false
            }
        });
    };

    // Simple appointment creation fallback
    const handleCancelNewVisit = () => {
        setShowNewVisitConfirmation(false);
        setShowNewAppointmentModal(true);
    };

    // Quick appointment creation
    const handleNewAppointmentClick = () => {
        // Utwórz daty w lokalnej strefie czasowej z obecną godziną
        const startDate = new Date(); // Obecny czas lokalny

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1); // +1 dzień
        endDate.setHours(23, 59, 0, 0); // Koniec dnia

        // Funkcja do konwersji lokalnego czasu na string bez zmiany na UTC
        const toLocalISOString = (date: Date): string => {
            const offset = date.getTimezoneOffset() * 60000; // offset w milisekundach
            const localDate = new Date(date.getTime() - offset);
            return localDate.toISOString();
        };

        // Przekieruj do pełnego widoku tworzenia wizyty zamiast prostego formularza
        navigate('/orders', {
            state: {
                startDate: toLocalISOString(startDate),
                endDate: toLocalISOString(endDate),
                isFullProtocol: false, // Nowa wizyta, nie pełny protokół
                fromCalendar: true // Oznaczenie, że przyszliśmy z kalendarza
            }
        });
    };

    // Enhanced appointment saving with validation
    const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
        try {
            // Validate appointment data
            if (!appointmentData.title?.trim()) {
                showToast('error', 'Tytuł wizyty jest wymagany', 3000);
                return;
            }

            if (!appointmentData.customerId?.trim()) {
                showToast('error', 'Klient jest wymagany', 3000);
                return;
            }

            const newAppointment = await addAppointment(appointmentData);
            setAppointments(prev => [...prev, newAppointment].sort((a, b) =>
                new Date(a.start).getTime() - new Date(b.start).getTime()
            ));

            setShowNewAppointmentModal(false);
            showToast('success', 'Wizyta została zapisana pomyślnie', 3000);
        } catch (err) {
            console.error('Error saving appointment:', err);
            showToast('error', 'Nie udało się zapisać wizyty', 5000);
        }
    };

    // Professional edit workflow
    const handleEditClick = () => {
        if (!selectedAppointment) return;

        // Handle protocol editing
        if (selectedAppointment.isProtocol &&
            (selectedAppointment.status as unknown as ProtocolStatus) === ProtocolStatus.SCHEDULED) {
            navigate(`/orders`, {
                state: {
                    editProtocolId: selectedAppointment.id,
                    isOpenProtocolAction: false,
                    isFullProtocol: false
                }
            });
            return;
        }

        // Handle regular appointment editing
        setShowAppointmentDetailsModal(false);
        setShowEditAppointmentModal(true);
    };

    // Enhanced appointment updating
    const handleUpdateAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
        if (!selectedAppointment) return;

        try {
            const updatedAppointment = await updateAppointment({
                ...appointmentData,
                id: selectedAppointment.id,
            } as Appointment);

            setAppointments(prev => prev.map(appointment =>
                appointment.id === updatedAppointment.id ? updatedAppointment : appointment
            ));

            setSelectedAppointment(updatedAppointment);
            setShowEditAppointmentModal(false);
            setShowAppointmentDetailsModal(true);

            showToast('success', 'Wizyta została zaktualizowana', 3000);
        } catch (err) {
            console.error('Error updating appointment:', err);
            showToast('error', 'Nie udało się zaktualizować wizyty', 5000);
        }
    };

    // Enhanced appointment deletion with confirmation
    const handleDeleteAppointment = async () => {
        if (!selectedAppointment) return;

        // Prevent deletion of protocols from calendar
        if (selectedAppointment.isProtocol) {
            showToast('warning', 'Protokoły należy usuwać z widoku protokołów', 4000);
            return;
        }

        const confirmDelete = window.confirm(
            `Czy na pewno chcesz usunąć wizytę "${selectedAppointment.title}"?\n\nTa akcja jest nieodwracalna.`
        );

        if (!confirmDelete) return;

        try {
            await deleteAppointment(selectedAppointment.id);

            setAppointments(prev => prev.filter(appointment =>
                appointment.id !== selectedAppointment.id
            ));

            setShowAppointmentDetailsModal(false);
            setSelectedAppointment(null);

            showToast('success', 'Wizyta została usunięta', 3000);
        } catch (err) {
            console.error('Error deleting appointment:', err);
            showToast('error', 'Nie udało się usunąć wizyty', 5000);
        }
    };

    // Professional status change handling
    const handleStatusChange = async (newStatus: AppointmentStatus) => {
        if (!selectedAppointment) return;

        try {
            // Handle protocol status updates
            if (selectedAppointment.isProtocol) {
                const updatedAppointment = {
                    ...selectedAppointment,
                    status: newStatus,
                    statusUpdatedAt: new Date().toISOString()
                };

                setAppointments(prev => prev.map(appointment =>
                    appointment.id === updatedAppointment.id ? updatedAppointment : appointment
                ));

                setSelectedAppointment(updatedAppointment);
                showToast('info', 'Status protokołu został zaktualizowany', 3000);
                return;
            }

            // Handle standard appointment status updates
            const updatedAppointment = await updateAppointmentStatus(selectedAppointment.id, newStatus);

            setAppointments(prev => prev.map(appointment =>
                appointment.id === updatedAppointment.id ? updatedAppointment : appointment
            ));

            setSelectedAppointment(updatedAppointment);
            showToast('success', 'Status wizyty został zmieniony', 3000);
        } catch (err) {
            console.error('Error updating appointment status:', err);
            showToast('error', 'Nie udało się zmienić statusu wizyty', 5000);
        }
    };

    // Calculate page statistics
    const calculateStats = () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

        const todayAppointments = appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.start);
            return appointmentDate >= startOfDay && appointmentDate < endOfDay;
        });

        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        thisWeekStart.setHours(0, 0, 0, 0);

        const thisWeekEnd = new Date(thisWeekStart);
        thisWeekEnd.setDate(thisWeekStart.getDate() + 7);

        const thisWeekAppointments = appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.start);
            return appointmentDate >= thisWeekStart && appointmentDate < thisWeekEnd;
        });

        return {
            total: appointments.length,
            today: todayAppointments.filter(a => a.status === AppointmentStatus.SCHEDULED).length,
            thisWeek: thisWeekAppointments.length,
            protocols: appointments.filter(a => a.isProtocol).length,
            inProgress: appointments.filter(a => a.status === AppointmentStatus.IN_PROGRESS).length,
            done: appointments.filter(a => a.status === AppointmentStatus.READY_FOR_PICKUP).length,
            cancelled: appointments.filter(a => a.status === AppointmentStatus.CANCELLED && a.start.toISOString().split('T')[0] === yesterdayString).length
        };
    };

    const stats = calculateStats();

    return (
        <CalendarPageContainer>
            {/* Executive Header */}
            <HeaderContainer>
            <PageHeader>
                <HeaderLeft>
                    <HeaderTitle>
                        <TitleIcon>
                            <FaCalendarAlt />
                        </TitleIcon>
                        <TitleContent>
                            <MainTitle>Kalendarz wizyt</MainTitle>
                            <Subtitle>Zarządzanie terminami i protokołami</Subtitle>
                        </TitleContent>
                    </HeaderTitle>

                    {/* Professional Statistics */}
                </HeaderLeft>

                <HeaderActions>
                    <PrimaryAction onClick={handleNewAppointmentClick}>
                        <FaPlus />
                        <span>Nowa wizyta</span>
                    </PrimaryAction>
                </HeaderActions>
            </PageHeader>
            </HeaderContainer>

            <StatsSection>
                <StatsGrid>

                    <StatCard>
                        <StatIcon $color={enterprise.textPrimary}><FaClock /></StatIcon>
                        <StatContent>
                            <StatValue>{stats.inProgress}</StatValue>
                            <StatLabel>W trakcie realizacji</StatLabel>
                        </StatContent>
                    </StatCard>


                    <StatCard>
                        <StatIcon $color={enterprise.textPrimary}><FaUsers /></StatIcon>
                        <StatContent>
                            <StatValue>{stats.today}</StatValue>
                            <StatLabel>Do przyjęcia dzisiaj</StatLabel>
                        </StatContent>
                    </StatCard>

                    <StatCard>
                        <StatIcon $color={enterprise.textPrimary}><FaClock /></StatIcon>
                        <StatContent>
                            <StatValue>{stats.done}</StatValue>
                            <StatLabel>Oczekujące na odbiór</StatLabel>
                        </StatContent>
                    </StatCard>

                    <StatCard>
                        <StatIcon $color={enterprise.textPrimary}><FaChartLine /></StatIcon>
                        <StatContent>
                            <StatValue>{stats.thisWeek}</StatValue>
                            <StatLabel>Łącznie w tym tygodniu</StatLabel>
                        </StatContent>
                    </StatCard>

                    <StatCard>
                        <StatIcon $color={enterprise.textPrimary}><FaSignOutAlt /></StatIcon>
                        <StatContent>
                            <StatValue>{stats.cancelled}</StatValue>
                            <StatLabel>Wczoraj przucono</StatLabel>
                        </StatContent>
                    </StatCard>
                </StatsGrid>
            </StatsSection>

            {/* Loading State */}
            {loading && appointments.length === 0 && (
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie kalendarza...</LoadingText>
                </LoadingContainer>
            )}

            {/* Error State */}
            {error && !loading && (
                <ErrorContainer>
                    <ErrorCard>
                        <ErrorIcon>⚠️</ErrorIcon>
                        <ErrorMessage>{error}</ErrorMessage>
                        <RetryButton onClick={() => loadAppointmentsAndProtocols()}>
                            <FaSync />
                            Spróbuj ponownie
                        </RetryButton>
                    </ErrorCard>
                </ErrorContainer>
            )}

            {/* Main Calendar */}
            {!loading && !error && (
                <CalendarSection>
                    <AppointmentCalendar
                        events={appointments}
                        onEventSelect={handleAppointmentSelect}
                        onRangeChange={handleRangeChange}
                        onEventCreate={handleAppointmentCreate}
                    />
                </CalendarSection>
            )}

            {/* Professional Modals */}

            {/* New Appointment Modal */}
            <Modal
                isOpen={showNewAppointmentModal}
                onClose={() => setShowNewAppointmentModal(false)}
                title="Nowa wizyta"
                size="large"
            >
                <AppointmentForm
                    selectedDate={selectedDate}
                    onSave={handleSaveAppointment}
                    onCancel={() => setShowNewAppointmentModal(false)}
                />
            </Modal>

            {/* Appointment Details Modal */}
            {selectedAppointment && (
                <Modal
                    isOpen={showAppointmentDetailsModal}
                    onClose={() => setShowAppointmentDetailsModal(false)}
                    title="Szczegóły wizyty"
                >
                    <AppointmentDetails
                        appointment={selectedAppointment}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteAppointment}
                        onStatusChange={handleStatusChange}
                        onCreateProtocol={handleCreateProtocol}
                    />
                </Modal>
            )}

            {/* Edit Appointment Modal */}
            {selectedAppointment && selectedAppointment.status !== AppointmentStatus.IN_PROGRESS && (
                <Modal
                    isOpen={showEditAppointmentModal}
                    onClose={() => setShowEditAppointmentModal(false)}
                    title="Edycja wizyty"
                >
                    <AppointmentForm
                        selectedDate={selectedAppointment.start}
                        editingAppointment={selectedAppointment}
                        onSave={handleUpdateAppointment}
                        onCancel={() => {
                            setShowEditAppointmentModal(false);
                            setShowAppointmentDetailsModal(true);
                        }}
                    />
                </Modal>
            )}

            {/* Visit Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showNewVisitConfirmation}
                title="Nowa wizyta"
                message="Czy chcesz utworzyć pełną wizytę z protokołem przyjęcia?"
                confirmText="Tak, utwórz wizytę"
                cancelText="Nie, dodaj proste wydarzenie"
                onConfirm={handleConfirmNewVisit}
                onCancel={handleCancelNewVisit}
            />

            {/* Status Information */}
            {lastRefresh && (
                <StatusBar>
                    <StatusInfo>
                        Ostatnia aktualizacja: {lastRefresh.toLocaleTimeString('pl-PL')}
                        {calendarRange && (
                            <span> • Widok: {calendarRange.start.toLocaleDateString('pl-PL')} - {calendarRange.end.toLocaleDateString('pl-PL')}</span>
                        )}
                    </StatusInfo>
                </StatusBar>
            )}
        </CalendarPageContainer>
    );
};

// Professional Styled Components
const CalendarPageContainer = styled.div`
    min-height: 100vh;
    background: ${brandTheme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const HeaderContainer = styled.header`
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.sm};
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);
`;

const PageHeader = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.lg};

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
        flex-direction: column;
        align-items: stretch;
        gap: ${brandTheme.spacing.md};
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    min-width: 0;
    flex: 1;
`;

const HeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.spacing.lg};
`;

const TitleIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${brandTheme.shadow.md};
    flex-shrink: 0;
`;

const TitleContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.spacing.xs};
`;

const MainTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${enterprise.textPrimary};
    margin: 0;
    letter-spacing: -0.5px;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const Subtitle = styled.div`
    font-size: 16px;
    color: ${enterprise.textTertiary};
    font-weight: 500;
`;

const StatsSection = styled.section`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl} 0;

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg} 0;
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.md} 0;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr); /* Wymuś dokładnie 5 kolumn */
    gap: ${brandTheme.spacing.lg};
    margin-bottom: ${brandTheme.spacing.lg};

    /* Alternatywnie, jeśli chcesz dynamicznie dopasowywać minimalną szerokość: */
    /* grid-template-columns: repeat(5, minmax(180px, 1fr)); */

    @media (max-width: 1400px) {
        grid-template-columns: repeat(3, 1fr);
        gap: ${brandTheme.spacing.md};
    }

    @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
        gap: ${brandTheme.spacing.md};
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${brandTheme.spacing.md};
    }
`;

const StatCard = styled.div`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.xl};
    padding: ${brandTheme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${brandTheme.shadow.xs};
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${brandTheme.shadow.lg};
        border-color: ${brandTheme.primary};
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    &:hover::before {
        opacity: 1;
    }
`;

const StatIcon = styled.div<{ $color: string }>`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 24px;
    flex-shrink: 0;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;

const StatContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const StatValue = styled.div`
    font-size: 28px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
    letter-spacing: -0.025em;
    line-height: 1.1;

    @media (max-width: 768px) {
        font-size: 24px;
    }
`;

const StatLabel = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    line-height: 1.3;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${enterprise.spacing.lg};
    align-items: center;

    @media (max-width: 1024px) {
        width: 100%;
        justify-content: flex-start;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${enterprise.spacing.md};

        > * {
            width: 100%;
        }
    }
`;

const BaseAction = styled.button`
    display: flex;
    align-items: center;
    gap: ${enterprise.spacing.md};
    padding: ${enterprise.spacing.lg} ${enterprise.spacing.xl};
    border-radius: ${enterprise.radius.lg};
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid;
    white-space: nowrap;
    min-height: 48px;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: ${enterprise.shadow.lg};
    }

    &:active:not(:disabled) {
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    svg {
        font-size: 18px;
    }

    @media (max-width: 480px) {
        span {
            display: none;
        }
    }
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    span {
        @media (max-width: 480px) {
            display: block;
        }
    }
`;

const PrimaryAction = styled(BaseButton)`
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${brandTheme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
        box-shadow: ${brandTheme.shadow.md};
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const SecondaryAction = styled(BaseAction)`
    background: ${enterprise.surface};
    color: ${enterprise.textSecondary};
    border-color: ${enterprise.border};

    &:hover:not(:disabled) {
        background: ${enterprise.surfaceHover};
        border-color: ${enterprise.primary};
        color: ${enterprise.primary};
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: ${enterprise.spacing.xl};
    background: ${enterprise.surface};
    margin: ${enterprise.spacing.xl};
    border-radius: ${enterprise.radius.xl};
    border: 2px dashed ${enterprise.borderLight};
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${enterprise.borderLight};
    border-top: 3px solid ${enterprise.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 18px;
    color: ${enterprise.textTertiary};
    font-weight: 500;
`;

const ErrorContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: ${enterprise.spacing.xl};
`;

const ErrorCard = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${enterprise.spacing.xl};
    padding: ${enterprise.spacing.xxxl};
    background: ${enterprise.surface};
    border: 2px solid ${enterprise.error}30;
    border-radius: ${enterprise.radius.xl};
    box-shadow: ${enterprise.shadow.lg};
    text-align: center;
    max-width: 500px;
    width: 100%;
`;

const ErrorIcon = styled.div`
    font-size: 64px;
`;

const ErrorMessage = styled.div`
    font-size: 18px;
    color: ${enterprise.error};
    font-weight: 500;
    line-height: 1.5;
`;

const RetryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${enterprise.spacing.md};
    padding: ${enterprise.spacing.lg} ${enterprise.spacing.xl};
    background: ${enterprise.primary};
    color: white;
    border: none;
    border-radius: ${enterprise.radius.lg};
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${enterprise.primaryDark};
        transform: translateY(-1px);
        box-shadow: ${enterprise.shadow.md};
    }

    svg {
        font-size: 16px;
    }
`;

const CalendarSection = styled.section`
    flex: 1;
    margin: ${enterprise.spacing.xl};
    background: ${enterprise.surface};
    border-radius: ${enterprise.radius.xl};
    border: 1px solid ${enterprise.border};
    box-shadow: ${enterprise.shadow.lg};
    overflow: hidden;

    @media (max-width: 768px) {
        margin: ${enterprise.spacing.lg};
        border-radius: ${enterprise.radius.lg};
    }
`;

const StatusBar = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${enterprise.spacing.lg} ${enterprise.spacing.xl};
    background: ${enterprise.surfaceActive};
    border-top: 1px solid ${enterprise.borderLight};
`;

const StatusInfo = styled.div`
    font-size: 13px;
    color: ${enterprise.textMuted};
    font-weight: 500;
    text-align: center;

    span {
        margin-left: ${enterprise.spacing.md};
        
        @media (max-width: 768px) {
            display: block;
            margin-left: 0;
            margin-top: ${enterprise.spacing.xs};
        }
    }
`;

export default CalendarPage;