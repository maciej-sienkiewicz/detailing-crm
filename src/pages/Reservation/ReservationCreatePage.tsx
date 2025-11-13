// src/pages/Reservations/ReservationCreatePage.tsx
/**
 * Page for creating new reservations
 * Uses ReservationForm in create mode
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ReservationForm } from '../../features/reservations/components/ReservationForm/ReservationForm';

const brandTheme = {
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    text: {
        primary: '#0f172a',
        secondary: '#475569'
    },
    spacing: {
        lg: '24px',
        xl: '32px'
    },
    primary: 'var(--brand-primary, #1a365d)'
};

export const ReservationCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get dates from navigation state (from calendar)
    const { startDate, endDate, fromCalendar } = location.state || {};

    console.log('📅 ReservationCreatePage - received dates:', {
        startDate,
        endDate,
        fromCalendar
    });

    const handleSuccess = (reservationId: string) => {
        console.log('✅ Reservation created successfully:', reservationId);

        // Navigate to visits page with reservations tab
        navigate('/visits?tab=reservations', {
            state: { highlightId: reservationId, showSuccessToast: true }
        });
    };

    const handleCancel = () => {
        console.log('❌ Reservation creation cancelled');

        if (fromCalendar) {
            navigate('/calendar');
        } else {
            navigate('/visits?tab=reservations');
        }
    };

    return (
        <Container>
            <PageHeader>
                <HeaderTitle>Nowa rezerwacja</HeaderTitle>
                <HeaderSubtitle>
                    Zaplanuj wizytę bez tworzenia profilu klienta
                </HeaderSubtitle>
            </PageHeader>

            <FormContainer>
                <ReservationForm
                    mode="create"
                    initialStartDate={startDate}
                    initialEndDate={endDate}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </FormContainer>
        </Container>
    );
};

// Styled Components
const Container = styled.div`
    min-height: 100vh;
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.xl};

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.lg};
    }

    @media (max-width: 576px) {
        padding: 16px;
    }
`;

const PageHeader = styled.div`
    max-width: 1200px;
    margin: 0 auto ${brandTheme.spacing.xl} auto;
`;

const HeaderTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 8px 0;
    letter-spacing: -0.025em;

    @media (max-width: 768px) {
        font-size: 28px;
    }

    @media (max-width: 576px) {
        font-size: 24px;
    }
`;

const HeaderSubtitle = styled.p`
    font-size: 16px;
    font-weight: 500;
    color: ${brandTheme.text.secondary};
    margin: 0;

    @media (max-width: 576px) {
        font-size: 14px;
    }
`;

const FormContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;

export default ReservationCreatePage;