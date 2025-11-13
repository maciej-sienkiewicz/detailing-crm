// src/pages/Calendar/CalendarPage.tsx - WITH CONVERSION VIEW
import React from 'react';
import styled from 'styled-components';
import { CalendarPageProvider, useCalendarPageContext } from './CalendarPageProvider';
import { CalendarPageHeader } from './components/CalendarPageHeader';
import { CalendarPageStats } from './components/CalendarPageStats';
import { CalendarPageContent } from './components/CalendarPageContent';
import { CalendarPageModals } from './components/CalendarPageModals';
import { ConvertReservationToVisitForm } from '../../features/reservations/components/ConvertReservationForm/ConvertReservationToVisitForm';
import { theme } from '../../styles/theme';
import { ErrorBoundary } from "../../components/common/ErrorBoundary";
import { FaArrowLeft, FaCalendarPlus } from 'react-icons/fa';
import { PageHeader } from '../../components/common/PageHeader';

/**
 * Inner component that can use context
 */
const CalendarPageContent_: React.FC = () => {
    const { activeView, convertingReservation, actions } = useCalendarPageContext();

    // ✅ CONVERT VIEW - pokazuj formularz konwersji
    if (activeView === 'convertReservation' && convertingReservation) {
        return (
            <ConvertViewContainer>
                <PageHeader
                    icon={FaCalendarPlus}
                    title="Rozpocznij wizytę"
                    subtitle={`Konwersja rezerwacji: ${convertingReservation.title}`}
                    actions={
                        <BackButton onClick={actions.handleCancelConversion}>
                            <FaArrowLeft />
                        </BackButton>
                    }
                />

                <FormWrapper>
                    <ConvertReservationToVisitForm
                        reservation={convertingReservation}
                        onSuccess={actions.handleConversionSuccess}
                        onCancel={actions.handleCancelConversion}
                    />
                </FormWrapper>
            </ConvertViewContainer>
        );
    }

    // ✅ CALENDAR VIEW - standardowy widok kalendarza
    return (
        <CalendarPageContainer>
            <CalendarPageHeader />
            <CalendarPageStats />
            <CalendarPageContent />
            <CalendarPageModals />
        </CalendarPageContainer>
    );
};

/**
 * Main Calendar Page with Provider
 */
const CalendarPage: React.FC = () => {
    return (
        <ErrorBoundary fallback={<CalendarErrorFallback />}>
            <CalendarPageProvider>
                <CalendarPageContent_ />
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

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const CalendarPageContainer = styled.div`
    min-height: 100vh;
    background: ${theme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const ConvertViewContainer = styled.div`
    min-height: 100vh;
    background: ${theme.surfaceHover};
`;

const FormWrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: ${theme.spacing.xxl};

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg};
    }
`;

const BackButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    color: ${theme.text.secondary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        color: ${theme.primary};
        border-color: ${theme.primary};
        transform: translateX(-2px);
    }

    svg {
        font-size: 16px;
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

export default CalendarPage;