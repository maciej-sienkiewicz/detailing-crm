// src/pages/RecurringEvents/RecurringEventOccurrencesPage.tsx
/**
 * Recurring Event Occurrences Page
 * Wrapper component for occurrence management functionality
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OccurrenceManagement from '../../components/recurringEvents/OccurrenceManagement';
import { useRecurringEvent } from '../../hooks/useRecurringEvents';
import styled from 'styled-components';
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

// Styled Components
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

export default RecurringEventOccurrencesPage;