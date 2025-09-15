// src/pages/RecurringEvents/RecurringEventsPage.tsx - NAPRAWIONA WERSJA
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendarAlt,
    FaPlus,
    FaTrash
} from 'react-icons/fa';
import { PageHeader, SecondaryButton, PrimaryButton } from '../../components/common/PageHeader';
import RecurringEventsList from '../../components/recurringEvents/RecurringEventsList';
import RecurringEventForm from '../../components/recurringEvents/RecurringEventForm';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast/Toast';
import {
    useRecurringEvents,
    useRecurringEventsStatistics,
    useRecurringEvent
} from '../../hooks/useRecurringEvents'; // DODANO BRAKUJĄCE IMPORTY
import {
    RecurringEventListItem,
    CreateRecurringEventRequest,
} from '../../types/recurringEvents';
import { theme } from '../../styles/theme';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

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

    // NAPRAWKA: Hook był używany ale nie zaimportowany
    const { stats, isLoading: isStatsLoading } = useRecurringEventsStatistics();

    // NAPRAWKA: Hook był używany ale nie zaimportowany
    const {
        event: fullEventForEdit,
        isLoading: isLoadingEventForEdit
    } = useRecurringEvent(selectedEvent && showEditModal ? selectedEvent.id : null);

    // Event handlers
    const handleCreateClick = useCallback(() => {
        setShowCreateModal(true);
    }, []);

    const handleEditClick = useCallback((event: RecurringEventListItem) => {
        setSelectedEvent(event);
        setShowEditModal(true);
    }, []);

    const handleDeleteClick = useCallback((eventId: string) => {
        setSelectedEvent({ id: eventId } as RecurringEventListItem);
        setShowDeleteModal(true);
    }, []);

    const handleDeactivateClick = useCallback(async (eventId: string) => {
        try {
            const result = await deactivateEvent(eventId);
            if (result.success) {
                showToast('success', 'Status wydarzenia został zmieniony');
            } else {
                showToast('error', result.error || 'Błąd podczas zmiany statusu');
            }
        } catch (error) {
            console.error('Error deactivating event:', error);
            showToast('error', 'Błąd podczas zmiany statusu');
        }
    }, [deactivateEvent, showToast]);

    const handleViewOccurrences = useCallback((eventId: string) => {
        navigate(`/recurring-events/${eventId}/occurrences`);
    }, [navigate]);

    const handleViewDetails = useCallback((event: RecurringEventListItem) => {
        navigate(`/recurring-events/${event.id}`);
    }, [navigate]);

    const handleCreateSubmit = useCallback(async (data: CreateRecurringEventRequest) => {
        try {
            const result = await createEvent(data);
            if (result.success) {
                setShowCreateModal(false);
                showToast('success', 'Cykliczne wydarzenie zostało utworzone');
            } else {
                showToast('error', result.error || 'Błąd podczas tworzenia wydarzenia');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            showToast('error', 'Błąd podczas tworzenia wydarzenia');
        }
    }, [createEvent, showToast]);

    const handleEditSubmit = useCallback(async (data: CreateRecurringEventRequest) => {
        if (!selectedEvent) return;

        try {
            const result = await updateEvent(selectedEvent.id, data);
            if (result.success) {
                setShowEditModal(false);
                setSelectedEvent(null);
                showToast('success', 'Wydarzenie zostało zaktualizowane');
            } else {
                showToast('error', result.error || 'Błąd podczas aktualizacji wydarzenia');
            }
        } catch (error) {
            console.error('Error updating event:', error);
            showToast('error', 'Błąd podczas aktualizacji wydarzenia');
        }
    }, [selectedEvent, updateEvent, showToast]);

    const handleDeleteConfirm = useCallback(async () => {
        if (!selectedEvent) return;

        try {
            const result = await deleteEvent(selectedEvent.id);
            if (result.success) {
                setShowDeleteModal(false);
                setSelectedEvent(null);
                showToast('success', 'Wydarzenie zostało usunięte');
            } else {
                showToast('error', result.error || 'Błąd podczas usuwania wydarzenia');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            showToast('error', 'Błąd podczas usuwania wydarzenia');
        }
    }, [selectedEvent, deleteEvent, showToast]);

    const handleCloseCreateModal = useCallback(() => setShowCreateModal(false), []);
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
                    title="Cykliczne wydarzenia"
                    subtitle="Zarządzanie powtarzającymi się wydarzeniami i wizytami"
                    actions={
                        <HeaderActions>
                            <PrimaryButton onClick={handleCreateClick}>
                                <FaPlus />
                                Nowe wydarzenie
                            </PrimaryButton>
                        </HeaderActions>
                    }
                />

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
                    size="xl"
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
                    size="xl"
                >
                    {isLoadingEventForEdit ? (
                        <EditModalLoading>
                            <LoadingSpinner />
                            <LoadingText>Ładowanie danych wydarzenia...</LoadingText>
                        </EditModalLoading>
                    ) : fullEventForEdit ? (
                        <RecurringEventForm
                            mode="edit"
                            initialData={fullEventForEdit}
                            onSubmit={handleEditSubmit}
                            onCancel={handleCloseEditModal}
                            isLoading={isUpdating}
                        />
                    ) : (
                        <EditModalError>
                            <ErrorIcon>⚠️</ErrorIcon>
                            <ErrorText>Nie można załadować danych wydarzenia</ErrorText>
                            <SecondaryButton onClick={handleCloseEditModal}>
                                Zamknij
                            </SecondaryButton>
                        </EditModalError>
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
                                Ta operacja jest nieodwracalna. Wszystkie wystąpienia tego wydarzenia
                                również zostaną usunięte.
                            </DeleteDescription>
                        </DeleteMessage>
                        <DeleteActions>
                            <SecondaryButton onClick={handleCloseDeleteModal}>
                                Anuluj
                            </SecondaryButton>
                            <DangerButton
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                            >
                                <FaTrash />
                                {isDeleting ? 'Usuwanie...' : 'Usuń'}
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

const EditModalLoading = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xxxl};
`;

const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
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
    font-size: 16px;
    color: ${theme.text.tertiary};
    font-weight: 500;
`;

const EditModalError = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.xl};
    padding: ${theme.spacing.xxxl};
    text-align: center;
`;

const ErrorIcon = styled.div`
    font-size: 48px;
`;

const ErrorText = styled.div`
    font-size: 16px;
    color: ${theme.error};
    font-weight: 500;
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