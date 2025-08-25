// src/pages/Calendar/CalendarPage.tsx - PRODUCTION READY VERSION
import React from 'react';
import styled from 'styled-components';
import {CalendarPageProvider} from './CalendarPageProvider';
import {CalendarPageHeader} from './components/CalendarPageHeader';
import {CalendarPageStats} from './components/CalendarPageStats';
import {CalendarPageContent} from './components/CalendarPageContent';
import {CalendarPageModals} from './components/CalendarPageModals';
import {theme} from '../../styles/theme';
import {ErrorBoundary} from "../../components/common/ErrorBoundary";

/**
 * Production-ready Calendar Page
 * Features:
 * - Clean separation of concerns
 * - Error boundaries
 * - Performance optimizations
 * - Modular architecture
 */
const CalendarPage: React.FC = () => {
    return (
        <ErrorBoundary fallback={<CalendarErrorFallback />}>
            <CalendarPageProvider>
                <CalendarPageContainer>
                    <CalendarPageHeader />
                    <CalendarPageStats />
                    <CalendarPageContent />
                    <CalendarPageModals />
                </CalendarPageContainer>
            </CalendarPageProvider>
        </ErrorBoundary>
    );
};

const CalendarErrorFallback: React.FC = () => (
    <ErrorContainer>
        <ErrorCard>
            <ErrorIcon>📅</ErrorIcon>
            <ErrorTitle>Wystąpił problem z kalendarzem</ErrorTitle>
            <ErrorMessage>
                Nie można załadować kalendarza. Spróbuj odświeżyć stronę.
            </ErrorMessage>
            <RetryButton onClick={() => window.location.reload()}>
                Odśwież stronę
            </RetryButton>
        </ErrorCard>
    </ErrorContainer>
);

// Styled Components
const CalendarPageContainer = styled.div`
    min-height: 100vh;
    background: ${theme.surfaceAlt};
    display: flex;
    flex-direction: column;
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

export default CalendarPage;