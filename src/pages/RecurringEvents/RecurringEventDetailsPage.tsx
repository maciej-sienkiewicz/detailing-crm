// src/pages/RecurringEvents/RecurringEventDetailsPage.tsx
/**
 * Recurring Event Details Page
 * Shows comprehensive information about a specific recurring event
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaArrowLeft,
    FaEdit,
    FaTrash,
    FaPause,
    FaPlay,
    FaCalendarAlt,
    FaChartLine,
    FaClock,
    FaUsers,
    FaCheckCircle,
    FaTimes
} from 'react-icons/fa';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { PageHeader, SecondaryButton, PrimaryButton } from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import RecurringEventForm from '../../components/recurringEvents/RecurringEventForm';
import OccurrenceManagement from '../../components/recurringEvents/OccurrenceManagement';
import {
    useRecurringEvent,
    useRecurringEvents,
    useEventStatistics
} from '../../hooks/useRecurringEvents';
import {
    EventTypeLabels,
    RecurrenceFrequencyLabels,
    CreateRecurringEventRequest
} from '../../types/recurringEvents';
import { theme } from '../../styles/theme';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

const RecurringEventDetailsPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    // State
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showOccurrencesView, setShowOccurrencesView] = useState(false);

    // Hooks
    const { event, isLoading, error, refetch } = useRecurringEvent(eventId || null);
    const { stats } = useEventStatistics(eventId || null);
    const {
        updateEvent,
        deleteEvent,
        deactivateEvent,
        isUpdating,
        isDeleting,
        isDeactivating
    } = useRecurringEvents();

    // Handle edit submission
    const handleEditSubmit = useCallback(async (data: CreateRecurringEventRequest) => {
        if (!eventId) return;

        try {
            const result = await updateEvent(eventId, data);
            if (result.success) {
                setShowEditModal(false);
                refetch();
                toast.success('Wydarzenie zostało zaktualizowane');
            } else {
                toast.error(result.error || 'Błąd podczas aktualizacji wydarzenia');
            }
        } catch (error) {
            console.error('Error updating event:', error);
            toast.error('Błąd podczas aktualizacji wydarzenia');
        }
    }, [eventId, updateEvent, refetch]);

    // Handle delete
    const handleDelete = useCallback(async () => {
        if (!eventId) return;

        try {
            const result = await deleteEvent(eventId);
            if (result.success) {
                toast.success('Wydarzenie zostało usunięte');
                navigate('/recurring-events');
            } else {
                toast.error(result.error || 'Błąd podczas usuwania wydarzenia');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Błąd podczas usuwania wydarzenia');
        }
    }, [eventId, deleteEvent, navigate]);

    // Handle deactivate/activate
    const handleToggleActive = useCallback(async () => {
        if (!eventId || !event) return;

        try {
            const result = await deactivateEvent(eventId);
            if (result.success) {
                refetch();
                toast.success(event.isActive ? 'Wydarzenie zostało dezaktywowane' : 'Wydarzenie zostało aktywowane');
            } else {
                toast.error(result.error || 'Błąd podczas zmiany statusu wydarzenia');
            }
        } catch (error) {
            console.error('Error toggling event status:', error);
            toast.error('Błąd podczas zmiany statusu wydarzenia');
        }
    }, [eventId, event, deactivateEvent, refetch]);

    // Show occurrences management
    const handleShowOccurrences = useCallback(() => {
        setShowOccurrencesView(true);
    }, []);

    // Hide occurrences management
    const handleHideOccurrences = useCallback(() => {
        setShowOccurrencesView(false);
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Ładowanie szczegółów wydarzenia...</LoadingText>
            </LoadingContainer>
        );
    }

    // Error state
    if (error || !event) {
        return (
            <ErrorContainer>
                <ErrorCard>
                    <ErrorIcon>⚠️</ErrorIcon>
                    <ErrorTitle>Nie można załadować wydarzenia</ErrorTitle>
                    <ErrorMessage>{error || 'Wydarzenie nie zostało znalezione'}</ErrorMessage>
                    <RetryButton onClick={() => navigate('/recurring-events')}>
                        Powrót do listy
                    </RetryButton>
                </ErrorCard>
            </ErrorContainer>
        );
    }

    // Show occurrences management view
    if (showOccurrencesView) {
        return (
            <OccurrenceManagement
                eventId={event.id}
                eventTitle={event.title}
                onBack={handleHideOccurrences}
            />
        );
    }

    return (
        <ErrorBoundary>
            <PageContainer>
                {/* Header */}
                <PageHeader
                    icon={FaCalendarAlt}
                    title={event.title}
                    subtitle={`${EventTypeLabels[event.type]} • ${RecurrenceFrequencyLabels[event.recurrencePattern.frequency]}`}
                    actions={
                        <HeaderActions>
                            <SecondaryButton onClick={() => navigate('/recurring-events')}>
                                <FaArrowLeft />
                                Powrót do listy
                            </SecondaryButton>
                            <SecondaryButton onClick={() => setShowEditModal(true)}>
                                <FaEdit />
                                Edytuj
                            </SecondaryButton>
                            <SecondaryButton
                                onClick={handleToggleActive}
                                disabled={isDeactivating}
                            >
                                {event.isActive ? <FaPause /> : <FaPlay />}
                                {event.isActive ? 'Dezaktywuj' : 'Aktywuj'}
                            </SecondaryButton>
                            <PrimaryButton onClick={handleShowOccurrences}>
                                <FaUsers />
                                Zarządzaj wystąpieniami
                            </PrimaryButton>
                        </HeaderActions>
                    }
                />

                {/* Status Banner */}
                {!event.isActive && (
                    <StatusBanner>
                        <FaPause />
                        <span>To wydarzenie jest obecnie nieaktywne i nie generuje nowych wystąpień</span>
                    </StatusBanner>
                )}

                {/* Main Content */}
                <ContentGrid>
                    {/* Event Information */}
                    <InfoSection>
                        <SectionTitle>Informacje podstawowe</SectionTitle>
                        <InfoGrid>
                            <InfoCard>
                                <InfoLabel>Typ wydarzenia</InfoLabel>
                                <InfoValue>{EventTypeLabels[event.type]}</InfoValue>
                            </InfoCard>
                            <InfoCard>
                                <InfoLabel>Częstotliwość</InfoLabel>
                                <InfoValue>{RecurrenceFrequencyLabels[event.recurrencePattern.frequency]}</InfoValue>
                            </InfoCard>
                            <InfoCard>
                                <InfoLabel>Interwał</InfoLabel>
                                <InfoValue>Co {event.recurrencePattern.interval}</InfoValue>
                            </InfoCard>
                            <InfoCard>
                                <InfoLabel>Status</InfoLabel>
                                <StatusBadge $active={event.isActive}>
                                    {event.isActive ? <FaCheckCircle /> : <FaTimes />}
                                    {event.isActive ? 'Aktywne' : 'Nieaktywne'}
                                </StatusBadge>
                            </InfoCard>
                        </InfoGrid>

                        {event.description && (
                            <DescriptionSection>
                                <DescriptionLabel>Opis</DescriptionLabel>
                                <DescriptionText>{event.description}</DescriptionText>
                            </DescriptionSection>
                        )}
                    </InfoSection>

                    {/* Recurrence Pattern Details */}
                    <InfoSection>
                        <SectionTitle>Wzorzec powtarzania</SectionTitle>
                        <PatternGrid>
                            <PatternCard>
                                <PatternLabel>Częstotliwość</PatternLabel>
                                <PatternValue>
                                    {RecurrenceFrequencyLabels[event.recurrencePattern.frequency]}
                                </PatternValue>
                            </PatternCard>

                            {event.recurrencePattern.daysOfWeek && (
                                <PatternCard>
                                    <PatternLabel>Dni tygodnia</PatternLabel>
                                    <PatternValue>
                                        {event.recurrencePattern.daysOfWeek.join(', ')}
                                    </PatternValue>
                                </PatternCard>
                            )}

                            {event.recurrencePattern.dayOfMonth && (
                                <PatternCard>
                                    <PatternLabel>Dzień miesiąca</PatternLabel>
                                    <PatternValue>{event.recurrencePattern.dayOfMonth}</PatternValue>
                                </PatternCard>
                            )}

                            {event.recurrencePattern.endDate && (
                                <PatternCard>
                                    <PatternLabel>Data zakończenia</PatternLabel>
                                    <PatternValue>
                                        {format(new Date(event.recurrencePattern.endDate), 'dd MMMM yyyy', { locale: pl })}
                                    </PatternValue>
                                </PatternCard>
                            )}

                            {event.recurrencePattern.maxOccurrences && (
                                <PatternCard>
                                    <PatternLabel>Maksymalne wystąpienia</PatternLabel>
                                    <PatternValue>{event.recurrencePattern.maxOccurrences}</PatternValue>
                                </PatternCard>
                            )}
                        </PatternGrid>
                    </InfoSection>

                    {/* Visit Template (if applicable) */}
                    {event.visitTemplate && (
                        <InfoSection>
                            <SectionTitle>Szablon wizyty</SectionTitle>
                            <TemplateGrid>
                                <TemplateCard>
                                    <TemplateLabel>Szacowany czas</TemplateLabel>
                                    <TemplateValue>
                                        {event.visitTemplate.estimatedDurationMinutes} minut
                                    </TemplateValue>
                                </TemplateCard>

                                {event.visitTemplate.clientName && (
                                    <TemplateCard>
                                        <TemplateLabel>Domyślny klient</TemplateLabel>
                                        <TemplateValue>{event.visitTemplate.clientName}</TemplateValue>
                                    </TemplateCard>
                                )}

                                {event.visitTemplate.vehicleName && (
                                    <TemplateCard>
                                        <TemplateLabel>Domyślny pojazd</TemplateLabel>
                                        <TemplateValue>{event.visitTemplate.vehicleName}</TemplateValue>
                                    </TemplateCard>
                                )}

                                {event.visitTemplate.defaultServices.length > 0 && (
                                    <TemplateCard $fullWidth>
                                        <TemplateLabel>Domyślne usługi</TemplateLabel>
                                        <ServicesList>
                                            {event.visitTemplate.defaultServices.map((service, index) => (
                                                <ServiceItem key={index}>
                                                    <ServiceName>{service.name}</ServiceName>
                                                    <ServicePrice>{service.basePrice.toFixed(2)} zł</ServicePrice>
                                                </ServiceItem>
                                            ))}
                                        </ServicesList>
                                    </TemplateCard>
                                )}
                            </TemplateGrid>
                        </InfoSection>
                    )}

                    {/* Statistics */}
                    {stats && (
                        <InfoSection>
                            <SectionTitle>Statystyki</SectionTitle>
                            <StatsGrid>
                                <StatCard>
                                    <StatIcon><FaCalendarAlt /></StatIcon>
                                    <StatContent>
                                        <StatValue>{stats.totalOccurrences}</StatValue>
                                        <StatLabel>Łącznie wystąpień</StatLabel>
                                    </StatContent>
                                </StatCard>
                                <StatCard>
                                    <StatIcon><FaCheckCircle /></StatIcon>
                                    <StatContent>
                                        <StatValue>{stats.completedOccurrences}</StatValue>
                                        <StatLabel>Ukończone</StatLabel>
                                    </StatContent>
                                </StatCard>
                                <StatCard>
                                    <StatIcon><FaUsers /></StatIcon>
                                    <StatContent>
                                        <StatValue>{stats.convertedOccurrences}</StatValue>
                                        <StatLabel>Przekształcone</StatLabel>
                                    </StatContent>
                                </StatCard>
                                <StatCard>
                                    <StatIcon><FaChartLine /></StatIcon>
                                    <StatContent>
                                        <StatValue>{(stats.completionRate * 100).toFixed(1)}%</StatValue>
                                        <StatLabel>Wskaźnik ukończenia</StatLabel>
                                    </StatContent>
                                </StatCard>
                            </StatsGrid>
                        </InfoSection>
                    )}
                </ContentGrid>

                {/* Action Bar */}
                <ActionBar>
                    <ActionGroup>
                        <DangerButton onClick={() => setShowDeleteModal(true)}>
                            <FaTrash />
                            Usuń wydarzenie
                        </DangerButton>
                    </ActionGroup>
                </ActionBar>

                {/* Edit Modal */}
                <Modal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    title=""
                    size="lg"
                >
                    <RecurringEventForm
                        mode="edit"
                        initialData={event}
                        onSubmit={handleEditSubmit}
                        onCancel={() => setShowEditModal(false)}
                        isLoading={isUpdating}
                    />
                </Modal>

                {/* Delete Modal */}
                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    title="Potwierdź usunięcie"
                    size="sm"
                >
                    <DeleteModalContent>
                        <DeleteIcon>🗑️</DeleteIcon>
                        <DeleteMessage>
                            <DeleteTitle>Czy na pewno chcesz usunąć to wydarzenie?</DeleteTitle>
                            <DeleteDescription>
                                Ta operacja jest nieodwracalna. Wszystkie zaplanowane wystąpienia
                                zostaną trwale usunięte.
                            </DeleteDescription>
                        </DeleteMessage>
                        <DeleteActions>
                            <SecondaryButton onClick={() => setShowDeleteModal(false)}>
                                Anuluj
                            </SecondaryButton>
                            <DangerButton onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? 'Usuwanie...' : 'Usuń wydarzenie'}
                            </DangerButton>
                        </DeleteActions>
                    </DeleteModalContent>
                </Modal>
            </PageContainer>
        </ErrorBoundary>
    );
};

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${theme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${theme.spacing.md};
    align-items: center;

    @media (max-width: 768px) {
        flex-direction: column;
        width: 100%;
    }
`;

const StatusBanner = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    background: ${theme.warning}15;
    border: 1px solid ${theme.warning}30;
    margin: ${theme.spacing.xl};
    border-radius: ${theme.radius.lg};
    color: ${theme.warning};
    font-weight: 500;

    svg {
        font-size: 16px;
    }
`;

const ContentGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
    padding: ${theme.spacing.xl};
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
`;

const InfoSection = styled.section`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
    box-shadow: ${theme.shadow.sm};
`;

const SectionTitle = styled.h2`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.border};
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xl};
`;

const InfoCard = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
`;

const InfoLabel = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: ${theme.text.tertiary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const StatusBadge = styled.div<{ $active: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${props => props.$active ? theme.success : theme.error};
    color: ${props => props.$active ? theme.success : theme.error};
    border: 1px solid ${props => props.$active ? theme.success : theme.error};
    border-radius: ${theme.radius.sm};
    font-size: 14px;
    font-weight: 600;
    width: fit-content;

    svg {
        font-size: 12px;
    }
`;

const DescriptionSection = styled.div`
    padding: 0 ${theme.spacing.xl} ${theme.spacing.xl};
`;

const DescriptionLabel = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: ${theme.text.tertiary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: ${theme.spacing.sm};
`;

const DescriptionText = styled.p`
    font-size: 15px;
    color: ${theme.text.secondary};
    line-height: 1.6;
    margin: 0;
`;

const PatternGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xl};
`;

const PatternCard = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
`;

const PatternLabel = styled.div`
    font-size: 12px;
    font-weight: 500;
    color: ${theme.text.tertiary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const PatternValue = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const TemplateGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xl};
`;

const TemplateCard = styled.div<{ $fullWidth?: boolean }>`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    ${props => props.$fullWidth && `grid-column: 1 / -1;`}
`;

const TemplateLabel = styled.div`
    font-size: 12px;
    font-weight: 500;
    color: ${theme.text.tertiary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const TemplateValue = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const ServicesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    margin-top: ${theme.spacing.sm};
`;

const ServiceItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.sm};
    background: ${theme.surface};
    border-radius: ${theme.radius.sm};
`;

const ServiceName = styled.span`
    font-size: 13px;
    color: ${theme.text.primary};
`;

const ServicePrice = styled.span`
    font-size: 13px;
    font-weight: 600;
    color: ${theme.primary};
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xl};
`;

const StatCard = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadow.md};
        border-color: ${theme.primary};
    }
`;

const StatIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${theme.primary}15;
    color: ${theme.primary};
    border-radius: ${theme.radius.lg};
    font-size: 20px;
`;

const StatContent = styled.div`
    flex: 1;
`;

const StatValue = styled.div`
    font-size: 24px;
    font-weight: 700;
    color: ${theme.text.primary};
    line-height: 1.1;
`;

const StatLabel = styled.div`
    font-size: 13px;
    color: ${theme.text.secondary};
    font-weight: 500;
    margin-top: ${theme.spacing.xs};
`;

const ActionBar = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: ${theme.spacing.xl};
    background: ${theme.surface};
    border-top: 1px solid ${theme.border};
    margin-top: auto;
`;

const ActionGroup = styled.div`
    display: flex;
    gap: ${theme.spacing.md};
`;

const DangerButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.surface};
    color: ${theme.error};
    border: 1px solid ${theme.error}30;
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.errorBg};
        border-color: ${theme.error};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const LoadingContainer = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
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
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${theme.surfaceAlt};
    padding: ${theme.spacing.xl};
`;

const ErrorCard = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.xl};
    padding: ${theme.spacing.xxxl};
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    box-shadow: ${theme.shadow.lg};
    text-align: center;
    max-width: 500px;
    width: 100%;
`;

const ErrorIcon = styled.div`
    font-size: 64px;
`;

const ErrorTitle = styled.h1`
    font-size: 24px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0;
`;

const ErrorMessage = styled.p`
    font-size: 16px;
    color: ${theme.text.secondary};
    margin: 0;
    line-height: 1.5;
`;

const RetryButton = styled.button`
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
`;

const DeleteModalContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.xl};
    padding: ${theme.spacing.xl};
    text-align: center;
`;

const DeleteIcon = styled.div`
    font-size: 64px;
`;

const DeleteMessage = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const DeleteTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

const DeleteDescription = styled.p`
    font-size: 15px;
    color: ${theme.text.secondary};
    margin: 0;
    line-height: 1.5;
`;

const DeleteActions = styled.div`
    display: flex;
    gap: ${theme.spacing.md};
    justify-content: center;
`;

export default RecurringEventDetailsPage;