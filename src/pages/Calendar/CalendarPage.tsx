// src/pages/Calendar/CalendarPage.tsx - REFACTORED VERSION
import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AppointmentCalendar from '../../components/calendar/Calendar';
import Modal from '../../components/common/Modal';
import AppointmentForm from '../../components/calendar/AppointmentForm';
import AppointmentDetails from '../../components/calendar/AppointmentDetails';
import { ConfirmationDialog } from '../../components/common/NewConfirmationDialog';
import { Tooltip } from '../../components/common/Tooltip';
import { Appointment, AppointmentStatus, ProtocolStatus } from '../../types';
import { mapAppointmentToProtocol } from '../../services/ProtocolMappingService';
import { useToast } from '../../components/common/Toast/Toast';
import { useCalendar } from '../../hooks/useCalendar';
import { useCalendarStats } from '../../hooks/useCalendarStats';
import { theme } from '../../styles/theme';
import {
    FaCalendarAlt,
    FaChartLine,
    FaClock,
    FaPlus,
    FaSignOutAlt,
    FaSync,
    FaUsers,
    FaInfoCircle
} from 'react-icons/fa';

const CalendarPage: React.FC = () => {
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
        changeAppointmentStatus
    } = useCalendar();

    // Stats
    const stats = useCalendarStats(appointments);

    // Modal states
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showAppointmentDetailsModal, setShowAppointmentDetailsModal] = useState(false);
    const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);
    const [showNewVisitConfirmation, setShowNewVisitConfirmation] = useState(false);

    // Calendar states
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedEndDate, setSelectedEndDate] = useState<Date>(new Date());
    const [calendarRange, setCalendarRange] = useState<{ start: Date; end: Date } | null>(null);

    // Load appointments with date range dependency - FIXED to always use range
    useEffect(() => {
        // Always load with current range, or wait for initial range if not set yet
        if (calendarRange) {
            console.log('📅 Loading appointments for range:', {
                start: calendarRange.start.toISOString().split('T')[0],
                end: calendarRange.end.toISOString().split('T')[0]
            });

            const timeoutId = setTimeout(() => {
                loadAppointments(calendarRange);
            }, 300); // Debounce range changes

            return () => clearTimeout(timeoutId);
        }
        // Don't load initial data without range - wait for FullCalendar to provide it
    }, [calendarRange?.start?.toISOString().split('T')[0], calendarRange?.end?.toISOString().split('T')[0], loadAppointments]);

    // Event Handlers
    const handleAppointmentSelect = useCallback((appointment: Appointment) => {
        if (!appointment?.id) {
            showToast('error', 'Nieprawidłowe dane wizyty', 3000);
            return;
        }
        setSelectedAppointment(appointment);
        setShowAppointmentDetailsModal(true);
    }, [showToast]);

    const handleCreateProtocol = useCallback(async () => {
        if (!selectedAppointment) {
            showToast('error', 'Nie wybrano wizyty', 3000);
            return;
        }

        if (selectedAppointment.isProtocol &&
            (selectedAppointment.status as unknown as ProtocolStatus) === ProtocolStatus.SCHEDULED) {
            navigate(`/visits`, {
                state: {
                    editProtocolId: selectedAppointment.id,
                    isOpenProtocolAction: true
                }
            });
            return;
        }

        if (selectedAppointment.isProtocol) {
            showToast('info', 'To wydarzenie jest już protokołem', 3000);
            return;
        }

        try {
            const protocolData = mapAppointmentToProtocol(selectedAppointment);
            setShowAppointmentDetailsModal(false);

            navigate('/visits/car-reception?createFromAppointment=true', {
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
    }, [selectedAppointment, navigate, showToast]);

    const handleRangeChange = useCallback((range: { start: Date; end: Date }) => {
        console.log('🎯 Range changed in CalendarPage:', {
            start: range.start.toISOString().split('T')[0],
            end: range.end.toISOString().split('T')[0]
        });
        setCalendarRange(range);
    }, []);

    const handleAppointmentCreate = useCallback((start: Date, end: Date) => {
        const now = new Date();
        if (start < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
            showToast('error', 'Nie można tworzyć wizyt w przeszłości', 3000);
            return;
        }

        setSelectedDate(start);
        const correctedEndDate = new Date(end);
        correctedEndDate.setDate(correctedEndDate.getDate() - 1);
        setSelectedEndDate(correctedEndDate);
        setShowNewVisitConfirmation(true);
    }, [showToast]);

    const handleConfirmNewVisit = useCallback(() => {
        setShowNewVisitConfirmation(false);

        const localStartDate = new Date(selectedDate);
        localStartDate.setHours(12, 0, 0, 0);

        const localEndDate = new Date(selectedEndDate);
        localEndDate.setHours(23, 59, 0, 0);

        navigate('/visits', {
            state: {
                startDate: localStartDate.toISOString(),
                endDate: localEndDate.toISOString(),
                isFullProtocol: false
            }
        });
    }, [selectedDate, selectedEndDate, navigate]);

    const handleCancelNewVisit = useCallback(() => {
        setShowNewVisitConfirmation(false);
    }, []);

    const handleNewAppointmentClick = useCallback(() => {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(23, 59, 0, 0);

        const toLocalISOString = (date: Date): string => {
            const offset = date.getTimezoneOffset() * 60000;
            const localDate = new Date(date.getTime() - offset);
            return localDate.toISOString();
        };

        navigate('/visits', {
            state: {
                startDate: toLocalISOString(startDate),
                endDate: toLocalISOString(endDate),
                isFullProtocol: false,
                fromCalendar: true
            }
        });
    }, [navigate]);

    const handleEditClick = useCallback(() => {
        if (!selectedAppointment) return;

        if (selectedAppointment.isProtocol &&
            (selectedAppointment.status as unknown as ProtocolStatus) === ProtocolStatus.SCHEDULED) {
            navigate(`/visits`, {
                state: {
                    editProtocolId: selectedAppointment.id,
                    isOpenProtocolAction: false,
                    isFullProtocol: false
                }
            });
            return;
        }

        setShowAppointmentDetailsModal(false);
        setShowEditAppointmentModal(true);
    }, [selectedAppointment, navigate]);

    const handleUpdateAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id'>) => {
        if (!selectedAppointment) return;

        try {
            await updateAppointmentData({
                ...appointmentData,
                id: selectedAppointment.id,
            } as Appointment);

            setSelectedAppointment(prev => prev ? { ...prev, ...appointmentData } : null);
            setShowEditAppointmentModal(false);
            setShowAppointmentDetailsModal(true);
        } catch (err) {
            console.error('Error updating appointment:', err);
        }
    }, [selectedAppointment, updateAppointmentData]);

    const handleDeleteAppointment = useCallback(async () => {
        if (!selectedAppointment) return;

        if (selectedAppointment.isProtocol) {
            showToast('info', 'Protokoły należy usuwać z widoku protokołów', 4000);
            return;
        }

        const confirmDelete = window.confirm(
            `Czy na pewno chcesz usunąć wizytę "${selectedAppointment.title}"?\n\nTa akcja jest nieodwracalna.`
        );

        if (!confirmDelete) return;

        try {
            await removeAppointment(selectedAppointment.id);
            setShowAppointmentDetailsModal(false);
            setSelectedAppointment(null);
        } catch (err) {
            console.error('Error deleting appointment:', err);
        }
    }, [selectedAppointment, removeAppointment, showToast]);

    const handleStatusChange = useCallback(async (newStatus: AppointmentStatus) => {
        if (!selectedAppointment) return;

        try {
            if (selectedAppointment.isProtocol) {
                const updatedAppointment = {
                    ...selectedAppointment,
                    status: newStatus,
                    statusUpdatedAt: new Date().toISOString()
                };
                setSelectedAppointment(updatedAppointment);
                showToast('info', 'Status protokołu został zaktualizowany', 3000);
                return;
            }

            await changeAppointmentStatus(selectedAppointment.id, newStatus);
            setSelectedAppointment(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (err) {
            console.error('Error updating appointment status:', err);
        }
    }, [selectedAppointment, changeAppointmentStatus, showToast]);

    // Tooltip content
    const tooltipContent = {
        inProgress: "Pojazdy aktualnie znajdujące się na terenie zakładu, które są w trakcie realizacji usług detailingowych lub naprawczych.",
        today: "Liczba pojazdów zaplanowanych do przyjęcia w bieżącym dniu roboczym.",
        readyForPickup: "Pojazdy, dla których wszystkie zlecone prace zostały zakończone i oczekują na odbiór przez właściciela.",
        thisWeek: "Łączna liczba wizyt i protokołów zaplanowanych do realizacji w bieżącym tygodniu kalendarzowym.",
        cancelled: "Liczba wizyt, które były zaplanowane na poprzedni dzień roboczy, ale z różnych przyczyn nie doszły do skutku."
    };

    return (
        <CalendarPageContainer>
            {/* Header */}
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
                    </HeaderLeft>

                    <HeaderActions>
                        <PrimaryAction onClick={handleNewAppointmentClick}>
                            <FaPlus />
                            <span>Nowa wizyta</span>
                        </PrimaryAction>
                    </HeaderActions>
                </PageHeader>
            </HeaderContainer>

            {/* Statistics */}
            <StatsSection>
                <StatsGrid>
                    <Tooltip text={tooltipContent.inProgress} position="bottom">
                        <StatCard>
                            <StatIcon $color={theme.text.primary}><FaClock /></StatIcon>
                            <StatContent>
                                <StatValue>{stats.inProgress}</StatValue>
                                <StatLabel>W trakcie realizacji</StatLabel>
                            </StatContent>
                            <StatTooltipIcon>
                                <FaInfoCircle />
                            </StatTooltipIcon>
                        </StatCard>
                    </Tooltip>

                    <Tooltip text={tooltipContent.today} position="bottom">
                        <StatCard>
                            <StatIcon $color={theme.text.primary}><FaUsers /></StatIcon>
                            <StatContent>
                                <StatValue>{stats.today}</StatValue>
                                <StatLabel>Do przyjęcia dzisiaj</StatLabel>
                            </StatContent>
                            <StatTooltipIcon>
                                <FaInfoCircle />
                            </StatTooltipIcon>
                        </StatCard>
                    </Tooltip>

                    <Tooltip text={tooltipContent.readyForPickup} position="bottom">
                        <StatCard>
                            <StatIcon $color={theme.text.primary}><FaClock /></StatIcon>
                            <StatContent>
                                <StatValue>{stats.readyForPickup}</StatValue>
                                <StatLabel>Oczekujące na odbiór</StatLabel>
                            </StatContent>
                            <StatTooltipIcon>
                                <FaInfoCircle />
                            </StatTooltipIcon>
                        </StatCard>
                    </Tooltip>

                    <Tooltip text={tooltipContent.thisWeek} position="bottom">
                        <StatCard>
                            <StatIcon $color={theme.text.primary}><FaChartLine /></StatIcon>
                            <StatContent>
                                <StatValue>{stats.thisWeek}</StatValue>
                                <StatLabel>Łącznie w tym tygodniu</StatLabel>
                            </StatContent>
                            <StatTooltipIcon>
                                <FaInfoCircle />
                            </StatTooltipIcon>
                        </StatCard>
                    </Tooltip>

                    <Tooltip text={tooltipContent.cancelled} position="bottom">
                        <StatCard>
                            <StatIcon $color={theme.text.primary}><FaSignOutAlt /></StatIcon>
                            <StatContent>
                                <StatValue>{stats.cancelled}</StatValue>
                                <StatLabel>Wczoraj przucono</StatLabel>
                            </StatContent>
                            <StatTooltipIcon>
                                <FaInfoCircle />
                            </StatTooltipIcon>
                        </StatCard>
                    </Tooltip>
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
                        <RetryButton onClick={() => loadAppointments()}>
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

            {/* Modals */}
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

            <ConfirmationDialog
                isOpen={showNewVisitConfirmation}
                title="Nowa wizyta"
                message="Czy na pewno chcesz rozpocząć nową wizytę?"
                confirmText="Tak, rozpocznij wizytę"
                cancelText="Anuluj"
                onConfirm={handleConfirmNewVisit}
                onCancel={handleCancelNewVisit}
                type="info"
            />

            {/* Status Bar */}
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

// Styled Components
const CalendarPageContainer = styled.div`
    min-height: 100vh;
    background: ${theme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const HeaderContainer = styled.header`
    background: ${theme.surface};
    border-bottom: 1px solid ${theme.border};
    box-shadow: ${theme.shadow.sm};
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);
`;

const PageHeader = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${theme.spacing.lg};

    @media (max-width: 1024px) {
        padding: ${theme.spacing.md} ${theme.spacing.lg};
        flex-direction: column;
        align-items: stretch;
        gap: ${theme.spacing.md};
    }

    @media (max-width: 768px) {
        padding: ${theme.spacing.md};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    min-width: 0;
    flex: 1;
`;

const HeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
`;

const TitleIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
    border-radius: ${theme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${theme.shadow.md};
    flex-shrink: 0;
`;

const TitleContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const MainTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0;
    letter-spacing: -0.5px;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const Subtitle = styled.div`
    font-size: 16px;
    color: ${theme.text.tertiary};
    font-weight: 500;
`;

const StatsSection = styled.section`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${theme.spacing.lg} ${theme.spacing.xl} 0;

    @media (max-width: 1024px) {
        padding: ${theme.spacing.md} ${theme.spacing.lg} 0;
    }

    @media (max-width: 768px) {
        padding: ${theme.spacing.md} ${theme.spacing.md} 0;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.lg};

    @media (max-width: 1400px) {
        grid-template-columns: repeat(3, 1fr);
        gap: ${theme.spacing.md};
    }

    @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
        gap: ${theme.spacing.md};
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.md};
    }
`;

const StatCard = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.xl};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${theme.shadow.xs};
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadow.lg};
        border-color: ${theme.primary};
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    &:hover::before {
        opacity: 1;
    }
`;

const StatTooltipIcon = styled.div`
    position: absolute;
    top: ${theme.spacing.sm};
    right: ${theme.spacing.sm};
    color: ${theme.text.tertiary};
    font-size: 12px;
    opacity: 0.7;
    transition: opacity 0.2s ease;

    ${StatCard}:hover & {
        opacity: 1;
        color: ${theme.primary};
    }
`;

const StatIcon = styled.div<{ $color: string }>`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
    border-radius: ${theme.radius.lg};
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
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
    letter-spacing: -0.025em;
    line-height: 1.1;

    @media (max-width: 768px) {
        font-size: 24px;
    }
`;

const StatLabel = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
    line-height: 1.3;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${theme.spacing.lg};
    align-items: center;

    @media (max-width: 1024px) {
        width: 100%;
        justify-content: flex-start;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${theme.spacing.md};

        > * {
            width: 100%;
        }
    }
`;

const PrimaryAction = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
    color: white;
    box-shadow: ${theme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 100%);
        box-shadow: ${theme.shadow.md};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: ${theme.spacing.xl};
    background: ${theme.surface};
    margin: ${theme.spacing.xl};
    border-radius: ${theme.radius.xl};
    border: 2px dashed ${theme.borderLight};
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${theme.borderLight};
    border-top: 3px solid ${theme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 18px;
    color: ${theme.text.tertiary};
    font-weight: 500;
`;

const ErrorContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: ${theme.spacing.xl};
`;

const ErrorCard = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.xl};
    padding: ${theme.spacing.xxxl};
    background: ${theme.surface};
    border: 2px solid ${theme.error}30;
    border-radius: ${theme.radius.xl};
    box-shadow: ${theme.shadow.lg};
    text-align: center;
    max-width: 500px;
    width: 100%;
`;

const ErrorIcon = styled.div`
    font-size: 64px;
`;

const ErrorMessage = styled.div`
    font-size: 18px;
    color: ${theme.error};
    font-weight: 500;
    line-height: 1.5;
`;

const RetryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    background: ${theme.primary};
    color: white;
    border: none;
    border-radius: ${theme.radius.lg};
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.primaryDark};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    svg {
        font-size: 16px;
    }
`;

const CalendarSection = styled.section`
    flex: 1;
    margin: ${theme.spacing.xl};
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    border: 1px solid ${theme.border};
    box-shadow: ${theme.shadow.lg};
    overflow: hidden;

    @media (max-width: 768px) {
        margin: ${theme.spacing.lg};
        border-radius: ${theme.radius.lg};
    }
`;

const StatusBar = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    background: ${theme.surfaceActive};
    border-top: 1px solid ${theme.borderLight};
`;

const StatusInfo = styled.div`
    font-size: 13px;
    color: ${theme.text.muted};
    font-weight: 500;
    text-align: center;

    span {
        margin-left: ${theme.spacing.md};

        @media (max-width: 768px) {
            display: block;
            margin-left: 0;
            margin-top: ${theme.spacing.xs};
        }
    }
`;

export default CalendarPage;