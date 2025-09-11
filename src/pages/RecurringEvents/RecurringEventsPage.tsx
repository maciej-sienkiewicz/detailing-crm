// src/pages/RecurringEvents/RecurringEventsPage.tsx
/**
 * Main Recurring Events Page
 * Provides comprehensive management interface for recurring events
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendarAlt,
    FaPlus,
    FaUpload,
    FaDownload,
    FaChartLine
} from 'react-icons/fa';
import { PageHeader, PrimaryButton, SecondaryButton } from '../../components/common/PageHeader';
import RecurringEventsList from '../../components/recurringEvents/RecurringEventsList';
import RecurringEventForm from '../../components/recurringEvents/RecurringEventForm';
import Modal from '../../components/common/Modal';
import { useRecurringEvents, useRecurringEventsStatistics } from '../../hooks/useRecurringEvents';
import {
    RecurringEventListItem,
    CreateRecurringEventRequest,
    RecurringEventResponse
} from '../../types/recurringEvents';
import { theme } from '../../styles/theme';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import toast, {useToast} from "../../components/common/Toast/Toast";

const RecurringEventsPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<RecurringEventListItem | null>(null);

    // Hooks
    const {
        createEvent,
        updateEvent,
        deleteEvent,
        deactivateEvent,
        isCreating,
        isUpdating,
        isDeleting,
        isDeactivating
    } = useRecurringEvents();

    const { stats, isLoading: isStatsLoading } = useRecurringEventsStatistics();

    // Event handlers
    const handleCreateClick = useCallback(() => {
        setShowCreateModal(true);
    }, []);

    const handleEditClick = useCallback((event: RecurringEventListItem) => {
        setSelectedEvent(event);
        setShowEditModal(true);
    }, []);

    const handleDeleteClick = useCallback((eventId: string) => {
        // Find the event to show in delete modal
        setSelectedEvent({ id: eventId } as RecurringEventListItem);
        setShowDeleteModal(true);
    }, []);

    const handleDeactivateClick = useCallback(async (eventId: string) => {
        try {
            const result = await deactivateEvent(eventId);
            if (result.success) {
                showToast('info', 'Wydarzenie zostało dezaktywowane');
            } else {
                showToast('info',  'Błąd podczas dezaktywacji wydarzenia');
            }
        } catch (error) {
            console.error('Error deactivating event:', error);
            showToast('info', 'Błąd podczas dezaktywacji wydarzenia');
        }
    }, [deactivateEvent]);

    const handleViewOccurrences = useCallback((eventId: string) => {
        navigate(`/recurring-events/${eventId}/occurrences`);
    }, [navigate]);

    const handleViewDetails = useCallback((event: RecurringEventListItem) => {
        navigate(`/recurring-events/${event.id}`);
    }, [navigate]);

    // Form submission handlers
    const handleCreateSubmit = useCallback(async (data: CreateRecurringEventRequest) => {
        try {
            const result = await createEvent(data);
            if (result.success) {
                setShowCreateModal(false);
                showToast('info', 'Cykliczne wydarzenie zostało utworzone');
            } else {
                showToast('info', 'Błąd podczas tworzenia wydarzenia');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            showToast('info','Błąd podczas tworzenia wydarzenia');
        }
    }, [createEvent]);

    const handleEditSubmit = useCallback(async (data: CreateRecurringEventRequest) => {
        if (!selectedEvent) return;

        try {
            const result = await updateEvent(selectedEvent.id, data);
            if (result.success) {
                setShowEditModal(false);
                setSelectedEvent(null);
                 showToast('info', 'Wydarzenie zostało zaktualizowane');
            } else {
                showToast('info', 'Błąd podczas aktualizacji wydarzenia');
            }
        } catch (error) {
            console.error('Error updating event:', error);
             showToast('info', 'Błąd podczas aktualizacji wydarzenia');
        }
    }, [selectedEvent, updateEvent]);

    const handleDeleteConfirm = useCallback(async () => {
        if (!selectedEvent) return;

        try {
            const result = await deleteEvent(selectedEvent.id);
            if (result.success) {
                setShowDeleteModal(false);
                setSelectedEvent(null);
                 showToast('info', 'Wydarzenie zostało usunięte');
            } else {
                showToast('info', 'Błąd podczas usuwania wydarzenia');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
             showToast('info', 'Błąd podczas usuwania wydarzenia');
        }
    }, [selectedEvent, deleteEvent]);

    // Modal close handlers
    const handleCloseCreateModal = useCallback(() => {
        setShowCreateModal(false);
    }, []);

    const handleCloseEditModal = useCallback(() => {
        setShowEditModal(false);
        setSelectedEvent(null);
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        setShowDeleteModal(false);
        setSelectedEvent(null);
    }, []);

    return (
        <ErrorBoundary fallback={<PageErrorFallback />}>
            <PageContainer>
                {/* Header */}
                <PageHeader
                    icon={FaCalendarAlt}
                    title="Cykliczne Wydarzenia"
                    subtitle="Zarządzanie powtarzającymi się wydarzeniami i wizytami"
                    actions={
                        <HeaderActions>
                            <SecondaryButton onClick={() => navigate('/calendar/events')}>
                                <FaChartLine />
                                Kalendarz wydarzeń
                            </SecondaryButton>
                            <PrimaryButton onClick={handleCreateClick}>
                                <FaPlus />
                                Nowe wydarzenie
                            </PrimaryButton>
                        </HeaderActions>
                    }
                />

                {/* Statistics */}
                <StatsSection>
                    <StatsGrid>
                        <StatCard>
                            <StatIcon $color={theme.primary}>
                                <FaCalendarAlt />
                            </StatIcon>
                            <StatContent>
                                <StatValue>{isStatsLoading ? '...' : stats.totalEvents}</StatValue>
                                <StatLabel>Łączne wydarzenia</StatLabel>
                            </StatContent>
                        </StatCard>

                        <StatCard>
                            <StatIcon $color={theme.success}>
                                <FaChartLine />
                            </StatIcon>
                            <StatContent>
                                <StatValue>{isStatsLoading ? '...' : stats.activeEvents}</StatValue>
                                <StatLabel>Aktywne wydarzenia</StatLabel>
                            </StatContent>
                        </StatCard>

                        <StatCard>
                            <StatIcon $color={theme.warning}>
                                <FaCalendarAlt />
                            </StatIcon>
                            <StatContent>
                                <StatValue>{isStatsLoading ? '...' : stats.upcomingOccurrences}</StatValue>
                                <StatLabel>Nadchodzące wystąpienia</StatLabel>
                            </StatContent>
                        </StatCard>

                        <StatCard>
                            <StatIcon $color={theme.primary}>
                                <FaChartLine />
                            </StatIcon>
                            <StatContent>
                                <StatValue>{isStatsLoading ? '...' : stats.completedOccurrences}</StatValue>
                                <StatLabel>Ukończone wystąpienia</StatLabel>
                            </StatContent>
                        </StatCard>

                        <StatCard>
                            <StatIcon $color={theme.success}>
                                <FaCalendarAlt />
                            </StatIcon>
                            <StatContent>
                                <StatValue>{isStatsLoading ? '...' : stats.convertedOccurrences}</StatValue>
                                <StatLabel>Przekształcone na wizyty</StatLabel>
                            </StatContent>
                        </StatCard>
                    </StatsGrid>
                </StatsSection>

                {/* Main Content */}
                <ContentSection>
                    <RecurringEventsList
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onDeactivate={handleDeactivateClick}
                        onViewOccurrences={handleViewOccurrences}
                        onViewDetails={handleViewDetails}
                    />
                </ContentSection>

                {/* Create Modal */}
                <Modal
                    isOpen={showCreateModal}
                    onClose={handleCloseCreateModal}
                    title=""
                    size="lg"
                >
                    <RecurringEventForm
                        mode="create"
                        onSubmit={handleCreateSubmit}
                        onCancel={handleCloseCreateModal}
                        isLoading={isCreating}
                    />
                </Modal>

                {/* Edit Modal */}
                <Modal
                    isOpen={showEditModal}
                    onClose={handleCloseEditModal}
                    title=""
                    size="lg"
                >
                    {selectedEvent && (
                        <RecurringEventForm
                            mode="edit"
                            // Note: We would need to fetch full event details here
                            // For now, we'll handle this with a separate component or fetch
                            onSubmit={handleEditSubmit}
                            onCancel={handleCloseEditModal}
                            isLoading={isUpdating}
                        />
                    )}
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={showDeleteModal}
                    onClose={handleCloseDeleteModal}
                    title="Potwierdź usunięcie"
                    size="sm"
                >
                    <DeleteConfirmationContent>
                        <DeleteIcon>🗑️</DeleteIcon>
                        <DeleteMessage>
                            <DeleteTitle>Czy na pewno chcesz usunąć to wydarzenie?</DeleteTitle>
                            <DeleteDescription>
                                Ta operacja jest nieodwracalna. Wszystkie zaplanowane wystąpienia
                                zostaną trwale usunięte.
                            </DeleteDescription>
                        </DeleteMessage>
                        <DeleteActions>
                            <SecondaryButton onClick={handleCloseDeleteModal}>
                                Anuluj
                            </SecondaryButton>
                            <DangerButton onClick={handleDeleteConfirm} disabled={isDeleting}>
                                {isDeleting ? 'Usuwanie...' : 'Usuń wydarzenie'}
                            </DangerButton>
                        </DeleteActions>
                    </DeleteConfirmationContent>
                </Modal>
            </PageContainer>
        </ErrorBoundary>
    );
};

// Error Fallback Component
const PageErrorFallback: React.FC = () => (
    <ErrorContainer>
        <ErrorCard>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>Wystąpił problem z modułem cyklicznych wydarzeń</ErrorTitle>
            <ErrorMessage>
                Nie można załadować strony. Spróbuj odświeżyć przeglądarkę.
            </ErrorMessage>
            <RetryButton onClick={() => window.location.reload()}>
                Odśwież stronę
            </RetryButton>
        </ErrorCard>
    </ErrorContainer>
);

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

    @media (max-width: 1400px) {
        grid-template-columns: repeat(3, 1fr);
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

const ContentSection = styled.section`
    flex: 1;
    max-width: 1600px;
    margin: 0 auto;
    padding: ${theme.spacing.xl};
    width: 100%;

    @media (max-width: 1024px) {
        padding: ${theme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: ${theme.spacing.md};
    }
`;

const DeleteConfirmationContent = styled.div`
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

const DangerButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.error};
    color: white;
    border: 1px solid ${theme.error};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;

    &:hover:not(:disabled) {
        background: ${theme.error};
        opacity: 0.9;
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

export default RecurringEventsPage;