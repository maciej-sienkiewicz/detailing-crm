// src/pages/Reservations/ReservationEditPage.tsx
/**
 * Page for editing existing reservations
 * Uses ReservationForm in edit mode
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ReservationForm } from '../../features/reservations/components/ReservationForm/ReservationForm';
import { useReservationEdit } from '../../features/reservations';

const brandTheme = {
    surface: '#ffffff',
    text: {
        primary: '#0f172a',
        secondary: '#475569'
    },
    spacing: {
        lg: '24px',
        xl: '32px'
    }
};

export const ReservationEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    if (!id) {
        return (
            <Container>
                <ErrorMessage>
                    <ErrorTitle>Błąd</ErrorTitle>
                    <ErrorText>Nie podano ID rezerwacji</ErrorText>
                </ErrorMessage>
            </Container>
        );
    }

    const {
        reservation,
        initialFormData,
        loading,
        fetchError,
        updateReservation,
        updating,
        updateError,
        goBack
    } = useReservationEdit({
        reservationId: id,
        onSuccess: () => {
            console.log('✅ Reservation updated successfully, navigating back...');
            goBack();
        },
        onError: (error) => {
            console.error('❌ Error in reservation edit:', error);
        }
    });

    // Loading state
    if (loading) {
        return (
            <Container>
                <LoadingContainer>
                    <Spinner />
                    <LoadingText>Ładowanie danych rezerwacji...</LoadingText>
                </LoadingContainer>
            </Container>
        );
    }

    // Error state
    if (fetchError || !reservation || !initialFormData) {
        return (
            <Container>
                <ErrorMessage>
                    <ErrorTitle>Nie udało się załadować rezerwacji</ErrorTitle>
                    <ErrorText>
                        {fetchError || 'Rezerwacja nie została znaleziona'}
                    </ErrorText>
                    <BackButton onClick={goBack}>
                        Powrót do listy
                    </BackButton>
                </ErrorMessage>
            </Container>
        );
    }

    // Cannot edit converted or cancelled reservations
    if (reservation.status === 'CONVERTED' || reservation.status === 'CANCELLED') {
        return (
            <Container>
                <WarningMessage>
                    <WarningTitle>Nie można edytować rezerwacji</WarningTitle>
                    <WarningText>
                        {reservation.status === 'CONVERTED'
                            ? 'Ta rezerwacja została już przekonwertowana na wizytę.'
                            : 'Ta rezerwacja została anulowana.'}
                    </WarningText>
                    <BackButton onClick={goBack}>
                        Powrót do listy
                    </BackButton>
                </WarningMessage>
            </Container>
        );
    }

    return (
        <Container>
            <PageHeader>
                <HeaderTitle>Edycja rezerwacji</HeaderTitle>
                <HeaderSubtitle>
                    Rezerwacja #{reservation.id} • {reservation.vehicleDisplay}
                </HeaderSubtitle>
            </PageHeader>

            {updateError && (
                <ErrorBanner>
                    <ErrorIcon>⚠️</ErrorIcon>
                    <ErrorText>{updateError}</ErrorText>
                </ErrorBanner>
            )}

            <ReservationForm
                mode="edit"
                initialData={initialFormData}
                onSubmit={updateReservation}
                onCancel={goBack}
                loading={updating}
            />
        </Container>
    );
};

// Styled Components
const Container = styled.div`
    padding: ${brandTheme.spacing.xl};
    max-width: 1400px;
    margin: 0 auto;

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.lg};
    }
`;

const PageHeader = styled.div`
    margin-bottom: ${brandTheme.spacing.xl};
`;

const HeaderTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 8px 0;
    letter-spacing: -0.025em;
`;

const HeaderSubtitle = styled.p`
    font-size: 16px;
    font-weight: 500;
    color: ${brandTheme.text.secondary};
    margin: 0;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 16px;
`;

const Spinner = styled.div`
    width: 48px;
    height: 48px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid var(--brand-primary, #1a365d);
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.p`
    font-size: 16px;
    font-weight: 500;
    color: ${brandTheme.text.secondary};
    margin: 0;
`;

const ErrorMessage = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 16px;
    padding: 32px;
    background: #fef2f2;
    border-radius: 12px;
    border: 1px solid #fecaca;
`;

const WarningMessage = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 16px;
    padding: 32px;
    background: #fef3c7;
    border-radius: 12px;
    border: 1px solid #fde68a;
`;

const ErrorTitle = styled.h2`
    font-size: 24px;
    font-weight: 700;
    color: #991b1b;
    margin: 0;
`;

const WarningTitle = styled.h2`
    font-size: 24px;
    font-weight: 700;
    color: #92400e;
    margin: 0;
`;

const ErrorText = styled.p`
    font-size: 16px;
    color: #dc2626;
    margin: 0;
    text-align: center;
`;

const WarningText = styled.p`
    font-size: 16px;
    color: #b45309;
    margin: 0;
    text-align: center;
`;

const ErrorBanner = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    background: #fee2e2;
    color: #dc2626;
    border-radius: 12px;
    border: 1px solid #fecaca;
    margin-bottom: ${brandTheme.spacing.xl};
`;

const ErrorIcon = styled.span`
    font-size: 20px;
`;

const BackButton = styled.button`
    padding: 12px 24px;
    background: var(--brand-primary, #1a365d);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: var(--brand-primary-dark, #0f2027);
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }
`;

export default ReservationEditPage;