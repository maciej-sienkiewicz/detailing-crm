// src/pages/RecurringEvents/RecurringEventOccurrencesPage.tsx - POPRAWKA IKONY
/**
 * Recurring Event Occurrences Page
 * Wrapper component for occurrence management functionality
 * POPRAWKA: Konsekwentnie używa FaArrowLeft w całej aplikacji
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OccurrenceManagement from '../../components/recurringEvents/OccurrenceManagement';
import { useRecurringEvent } from '../../hooks/useRecurringEvents';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa'; // ZMIANA: Importujemy FaArrowLeft
import { theme } from '../../styles/theme';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

const RecurringEventOccurrencesPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    // Fetch event details for title
    const { event, isLoading, error } = useRecurringEvent(eventId || null);

    // Handle back navigation
    const handleBack = () => {
        navigate(`/recurring-events/${eventId}`);
    };

    // Loading state
    if (isLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Ładowanie wystąpień...</LoadingText>
            </LoadingContainer>
        );
    }

    // Error state
    if (error || !event || !eventId) {
        return (
            <ErrorContainer>
                <ErrorCard>
                    <ErrorIcon>⚠️</ErrorIcon>
                    <ErrorTitle>Nie można załadować wystąpień</ErrorTitle>
                    <ErrorMessage>{error || 'Wydarzenie nie zostało znalezione'}</ErrorMessage>
                    <RetryButton onClick={() => navigate('/recurring-events')}>
                        <FaArrowLeft /> {/* ZMIANA: Używamy FaArrowLeft */}
                        Powrót do listy wydarzeń
                    </RetryButton>
                </ErrorCard>
            </ErrorContainer>
        );
    }

    return (
        <ErrorBoundary>
            <OccurrenceManagement
                eventId={eventId}
                eventTitle={event.title}
                onBack={handleBack}
            />
        </ErrorBoundary>
    );
};

// Styled Components - zaktualizowane dla profesjonalnego wyglądu
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
    width: 40px;
    height: 40px;
    border: 3px solid ${theme.border};
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
    color: ${theme.text.secondary};
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
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.border};
    box-shadow: ${theme.shadow.sm};
    text-align: center;
    max-width: 400px;
    width: 100%;
`;

const ErrorIcon = styled.div`
    font-size: 48px;
`;

const ErrorTitle = styled.h1`
    font-size: 20px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

const ErrorMessage = styled.p`
    font-size: 14px;
    color: ${theme.text.secondary};
    margin: 0;
    line-height: 1.5;
`;

const RetryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.primary};
    color: white;
    border: 1px solid ${theme.primary};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: ${theme.primaryDark};
        border-color: ${theme.primaryDark};
    }

    svg {
        font-size: 14px;
    }
`;

export default RecurringEventOccurrencesPage;