// src/pages/RecurringEvents/RecurringEventDetailsPage.tsx - FINALNY DESIGN
/**
 * Finalny widok szczegółów cyklicznego wydarzenia
 * - Przycisk usunięcia w headerze z innymi akcjami
 * - Tabela zamiast grid dla kluczowych informacji
 * - Profesjonalny, czytelny design bez "cukierków"
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
    FaUsers,
    FaCheckCircle,
    FaTimes,
    FaExclamationTriangle
} from 'react-icons/fa';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
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

    // Handle toggle active
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

    // Calculate end date text
    const getEndDateText = () => {
        if (event?.recurrencePattern.endDate) {
            return format(new Date(event.recurrencePattern.endDate), 'dd.MM.yyyy', { locale: pl });
        }
        if (event?.recurrencePattern.maxOccurrences) {
            return `Po ${event.recurrencePattern.maxOccurrences} wystąpieniach`;
        }
        return 'Bez ograniczeń';
    };

    // Loading state
    if (isLoading) {
        return (
            <LoadingContainer>
                <LoadingText>Ładowanie...</LoadingText>
            </LoadingContainer>
        );
    }

    // Error state
    if (error || !event) {
        return (
            <ErrorContainer>
                <ErrorMessage>{error || 'Wydarzenie nie zostało znalezione'}</ErrorMessage>
                <BackButton onClick={() => navigate('/recurring-events')}>
                    Powrót do listy
                </BackButton>
            </ErrorContainer>
        );
    }

    // Show occurrences management view
    if (showOccurrencesView) {
        return (
            <OccurrenceManagement
                eventId={event.id}
                eventTitle={event.title}
                onBack={() => setShowOccurrencesView(false)}
            />
        );
    }

    return (
        <ErrorBoundary>
            <Container>
                {/* Header */}
                <Header>
                    <HeaderLeft>
                        <BackButton onClick={() => navigate('/recurring-events')}>
                            <FaArrowLeft /> {/* ZMIANA: FaArrowLeft zamiast FaTimes */}
                        </BackButton>
                        <HeaderInfo>
                            <Title>{event.title}</Title>
                            <Subtitle>
                                {EventTypeLabels[event.type]} • ID: {event.id}
                            </Subtitle>
                        </HeaderInfo>
                    </HeaderLeft>

                    <HeaderActions>
                        <ActionButton onClick={() => setShowEditModal(true)}>
                            <FaEdit />
                            Edytuj
                        </ActionButton>
                        <ActionButton
                            onClick={handleToggleActive}
                            disabled={isDeactivating}
                            $variant={event.isActive ? 'warning' : 'success'}
                        >
                            {event.isActive ? <FaPause /> : <FaPlay />}
                            {event.isActive ? 'Dezaktywuj' : 'Aktywuj'}
                        </ActionButton>
                        <ActionButton
                            onClick={() => setShowOccurrencesView(true)}
                            $variant="primary"
                        >
                            <FaUsers />
                            Wystąpienia
                        </ActionButton>
                        <ActionButton
                            onClick={() => setShowDeleteModal(true)}
                            $variant="primary"
                        >
                            <FaTrash />
                            Usuń
                        </ActionButton>
                    </HeaderActions>
                </Header>

                {/* Status Warning */}
                {!event.isActive && (
                    <StatusWarning>
                        <FaExclamationTriangle />
                        Wydarzenie nieaktywne - nie generuje nowych wystąpień
                    </StatusWarning>
                )}

                {/* Main Content */}
                <Content>
                    {/* Key Information Table */}
                    <InfoPanel>
                        <PanelTitle>Kluczowe informacje</PanelTitle>
                        <InfoTable>
                            <InfoRow>
                                <InfoLabelCell>Status</InfoLabelCell>
                                <InfoValueCell>
                                    <StatusValue $active={event.isActive}>
                                        {event.isActive ? (
                                            <>
                                                <FaCheckCircle />
                                                Aktywne
                                            </>
                                        ) : (
                                            <>
                                                <FaTimes />
                                                Nieaktywne
                                            </>
                                        )}
                                    </StatusValue>
                                </InfoValueCell>
                            </InfoRow>

                            <InfoRow>
                                <InfoLabelCell>Częstotliwość</InfoLabelCell>
                                <InfoValueCell>
                                    {RecurrenceFrequencyLabels[event.recurrencePattern.frequency]}
                                </InfoValueCell>
                            </InfoRow>

                            <InfoRow>
                                <InfoLabelCell>Interwał</InfoLabelCell>
                                <InfoValueCell>Co {event.recurrencePattern.interval}</InfoValueCell>
                            </InfoRow>

                            <InfoRow>
                                <InfoLabelCell>Zakończenie</InfoLabelCell>
                                <InfoValueCell>{getEndDateText()}</InfoValueCell>
                            </InfoRow>

                            <InfoRow>
                                <InfoLabelCell>Wystąpienia ogółem</InfoLabelCell>
                                <InfoValueCell>
                                    {stats?.totalOccurrences || 0}
                                </InfoValueCell>
                            </InfoRow>


                            {event.recurrencePattern.daysOfWeek && (
                                <InfoRow>
                                    <InfoLabelCell>Dni tygodnia</InfoLabelCell>
                                    <InfoValueCell>
                                        {event.recurrencePattern.daysOfWeek.join(', ')}
                                    </InfoValueCell>
                                </InfoRow>
                            )}

                            {event.recurrencePattern.dayOfMonth && (
                                <InfoRow>
                                    <InfoLabelCell>Dzień miesiąca</InfoLabelCell>
                                    <InfoValueCell>{event.recurrencePattern.dayOfMonth}</InfoValueCell>
                                </InfoRow>
                            )}

                            <InfoRow>
                                <InfoLabelCell>Utworzono</InfoLabelCell>
                                <InfoValueCell>
                                    {format(new Date(event.createdAt), 'dd.MM.yyyy HH:mm', { locale: pl })}
                                </InfoValueCell>
                            </InfoRow>

                            <InfoRow>
                                <InfoLabelCell>Ostatnia edycja</InfoLabelCell>
                                <InfoValueCell>
                                    {format(new Date(event.updatedAt), 'dd.MM.yyyy HH:mm', { locale: pl })}
                                </InfoValueCell>
                            </InfoRow>
                        </InfoTable>
                    </InfoPanel>

                    {/* Description Panel (if exists) */}
                    {event.description && (
                        <InfoPanel>
                            <PanelTitle>Opis</PanelTitle>
                            <Description>{event.description}</Description>
                        </InfoPanel>
                    )}

                    {/* Visit Template Panel (if exists) */}
                    {event.visitTemplate && (
                        <InfoPanel>
                            <PanelTitle>Szablon wizyty</PanelTitle>
                            <TemplateGrid>
                                <InfoItem>
                                    <InfoLabel>Czas trwania</InfoLabel>
                                    <InfoValue>{event.visitTemplate.estimatedDurationMinutes} min</InfoValue>
                                </InfoItem>

                                {event.visitTemplate.clientName && (
                                    <InfoItem>
                                        <InfoLabel>Domyślny klient</InfoLabel>
                                        <InfoValue>{event.visitTemplate.clientName}</InfoValue>
                                    </InfoItem>
                                )}

                                {event.visitTemplate.vehicleName && (
                                    <InfoItem>
                                        <InfoLabel>Domyślny pojazd</InfoLabel>
                                        <InfoValue>{event.visitTemplate.vehicleName}</InfoValue>
                                    </InfoItem>
                                )}

                                {event.visitTemplate.defaultServices.length > 0 && (
                                    <ServicesItem>
                                        <InfoLabel>Domyślne usługi</InfoLabel>
                                        <ServicesList>
                                            {event.visitTemplate.defaultServices.map((service, index) => (
                                                <ServiceItem key={index}>
                                                    <ServiceName>{service.name}</ServiceName>
                                                    <ServicePrice>{service.basePrice.toFixed(2)} zł</ServicePrice>
                                                </ServiceItem>
                                            ))}
                                        </ServicesList>
                                    </ServicesItem>
                                )}
                            </TemplateGrid>
                        </InfoPanel>
                    )}
                </Content>

                {/* Edit Modal */}
                <Modal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    title=""
                    size="xl"
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
                    <DeleteContent>
                        <DeleteMessage>
                            Czy na pewno chcesz usunąć wydarzenie <strong>"{event.title}"</strong>?
                            <br />
                            Ta operacja jest nieodwracalna.
                        </DeleteMessage>
                        <DeleteActions>
                            <CancelButton onClick={() => setShowDeleteModal(false)}>
                                Anuluj
                            </CancelButton>
                            <ConfirmButton onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? 'Usuwanie...' : 'Usuń'}
                            </ConfirmButton>
                        </DeleteActions>
                    </DeleteContent>
                </Modal>
            </Container>
        </ErrorBoundary>
    );
};

// Styled Components - Finalny design
const Container = styled.div`
    min-height: 100vh;
    background: ${theme.surfaceAlt};
`;

const Header = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.xl} ${theme.spacing.xxl};
    background: ${theme.surface};
    border-bottom: 1px solid ${theme.border};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${theme.spacing.lg};
        align-items: flex-start;
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
`;

const BackButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${theme.surfaceElevated};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    color: ${theme.text.secondary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        color: ${theme.primary}; // ZMIANA: Kolor hover na primary dla lepszej widoczności
        border-color: ${theme.primary};
        transform: translateX(-2px); // ZMIANA: Subtelna animacja przesunięcia w lewo
    }

    svg {
        font-size: 16px; // ZMIANA: Nieco większa ikona dla lepszej widoczności
    }
`;

const HeaderInfo = styled.div``;

const Title = styled.h1`
    font-size: 24px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.xs} 0;
`;

const Subtitle = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${theme.spacing.md};

    @media (max-width: 768px) {
        width: 100%;
    }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'success' | 'warning' | 'danger' }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${props => {
        switch (props.$variant) {
            case 'primary': return theme.primary;
            case 'success': return theme.success;
            case 'warning': return theme.warning;
            case 'danger': return theme.error;
            default: return theme.surface;
        }
    }};
    color: ${props => {
        switch (props.$variant) {
            case 'primary':
            case 'success':
            case 'warning':
            case 'danger': return 'white';
            default: return theme.text.secondary;
        }
    }};
    border: 1px solid ${props => {
        switch (props.$variant) {
            case 'primary': return theme.primary;
            case 'success': return theme.success;
            case 'warning': return theme.warning;
            case 'danger': return theme.error;
            default: return theme.border;
        }
    }};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        opacity: 0.9;
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    svg {
        font-size: 14px;
    }
`;

const StatusWarning = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md} ${theme.spacing.xxl};
    background: ${theme.warning}15;
    border-bottom: 1px solid ${theme.warning}30;
    color: ${theme.warning};
    font-size: 14px;
    font-weight: 500;

    svg {
        font-size: 16px;
    }
`;

const Content = styled.main`
    padding: ${theme.spacing.xxl};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
    max-width: 1200px;
    margin: 0 auto;
`;

const InfoPanel = styled.section`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.xl};
`;

const PanelTitle = styled.h2`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.lg} 0;
    padding-bottom: ${theme.spacing.md};
    border-bottom: 1px solid ${theme.borderLight};
`;

const InfoTable = styled.div`
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    overflow: hidden;
`;

const InfoRow = styled.div`
    display: flex;
    border-bottom: 1px solid ${theme.border};

    &:last-child {
        border-bottom: none;
    }
`;

const InfoLabelCell = styled.div`
    width: 200px;
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.surfaceElevated};
    border-right: 1px solid ${theme.border};
    font-size: 14px;
    font-weight: 500;
    color: ${theme.text.secondary};
    display: flex;
    align-items: center;
`;

const InfoValueCell = styled.div`
    flex: 1;
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.surface};
    font-size: 14px;
    font-weight: 500;
    color: ${theme.text.primary};
    display: flex;
    align-items: center;
    min-height: 48px;
`;

const InfoItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const InfoLabel = styled.span`
    font-size: 13px;
    color: ${theme.text.tertiary};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
    font-size: 15px;
    color: ${theme.text.primary};
    font-weight: 500;
`;

const StatusValue = styled.span<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: 15px;
    color: ${props => props.$active ? theme.success : theme.error};
    font-weight: 600;

    svg {
        font-size: 14px;
    }
`;

const CountValue = styled.span`
    font-size: 18px;
    font-weight: 700;
    color: ${theme.primary};
`;

const TimelineGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
`;

const TimelineItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.md} 0;
    border-bottom: 1px solid ${theme.borderLight};

    &:last-child {
        border-bottom: none;
    }
`;

const TimelineLabel = styled.span`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;

    svg {
        font-size: 14px;
        color: ${theme.text.tertiary};
    }
`;

const TimelineValue = styled.span`
    font-size: 14px;
    color: ${theme.text.primary};
    font-weight: 500;
`;

const Description = styled.p`
    font-size: 15px;
    color: ${theme.text.secondary};
    line-height: 1.6;
    margin: 0;
`;

const TemplateGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
`;

const ServicesItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const ServicesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
`;

const ServiceItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.md};
`;

const ServiceName = styled.span`
    font-size: 14px;
    color: ${theme.text.primary};
`;

const ServicePrice = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.success};
`;

// Loading & Error states
const LoadingContainer = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${theme.surfaceAlt};
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${theme.text.tertiary};
`;

const ErrorContainer = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
    padding: ${theme.spacing.xl};
`;

const ErrorMessage = styled.div`
    font-size: 16px;
    color: ${theme.error};
    text-align: center;
`;

// Delete Modal
const DeleteContent = styled.div`
    padding: ${theme.spacing.xl};
    text-align: center;
`;

const DeleteMessage = styled.p`
    font-size: 15px;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.xl} 0;
    line-height: 1.5;

    strong {
        color: ${theme.error};
    }
`;

const DeleteActions = styled.div`
    display: flex;
    gap: ${theme.spacing.md};
    justify-content: center;
`;

const CancelButton = styled.button`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        color: ${theme.text.primary};
    }
`;

const ConfirmButton = styled.button`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.error};
    color: white;
    border: 1px solid ${theme.error};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        opacity: 0.9;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

export default RecurringEventDetailsPage;