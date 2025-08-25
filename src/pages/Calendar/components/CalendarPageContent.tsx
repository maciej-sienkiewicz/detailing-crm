// src/pages/Calendar/components/CalendarPageContent.tsx
import React from 'react';
import styled from 'styled-components';
import {FaSync} from 'react-icons/fa';
import AppointmentCalendar from '../../../components/calendar/Calendar';
import {useCalendarPageContext} from '../CalendarPageProvider';
import {theme} from '../../../styles/theme';

export const CalendarPageContent: React.FC = () => {
    const {
        appointments,
        loading,
        error,
        loadAppointments,
        handleRangeChange,
        handleAppointmentCreate,
        actions
    } = useCalendarPageContext();

    return (
        <CalendarSection>
            <AppointmentCalendar
                key="stable-calendar"
                events={appointments}
                onEventSelect={actions.selectAppointment}
                onRangeChange={handleRangeChange}
                onEventCreate={handleAppointmentCreate}
            />

            {/* Overlay loading/error states */}
            {loading && appointments.length === 0 && (
                <LoadingOverlay>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie kalendarza...</LoadingText>
                </LoadingOverlay>
            )}

            {error && !loading && (
                <ErrorOverlay>
                    <ErrorCard>
                        <ErrorIcon>⚠️</ErrorIcon>
                        <ErrorMessage>{error}</ErrorMessage>
                        <RetryButton onClick={() => loadAppointments()}>
                            <FaSync />
                            Spróbuj ponownie
                        </RetryButton>
                    </ErrorCard>
                </ErrorOverlay>
            )}
        </CalendarSection>
    );
};

const CalendarSection = styled.section`
    flex: 1;
    margin: ${theme.spacing.xl};
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    border: 1px solid ${theme.border};
    box-shadow: ${theme.shadow.lg};
    overflow: hidden;
    position: relative;

    @media (max-width: 768px) {
        margin: ${theme.spacing.lg};
        border-radius: ${theme.radius.lg};
    }
`;

const LoadingOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.xl};
    z-index: 10;
    backdrop-filter: blur(4px);
`;

const ErrorOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xl};
    z-index: 10;
    backdrop-filter: blur(4px);
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