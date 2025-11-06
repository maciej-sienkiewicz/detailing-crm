// src/features/reservations/components/ReservationForm/ReservationFormHeader.tsx
/**
 * Header component for reservation form
 * Supports both create and edit modes
 */

import React from 'react';
import styled from 'styled-components';
import { FaCalendarPlus, FaEdit } from 'react-icons/fa';

const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    surfaceAlt: '#fafbfc',
    text: {
        primary: '#0f172a',
        secondary: '#475569'
    },
    spacing: {
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
    },
    radius: {
        lg: '12px',
        xl: '16px'
    },
    shadow: {
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }
};

interface ReservationFormHeaderProps {
    mode?: 'create' | 'edit';
}

export const ReservationFormHeader: React.FC<ReservationFormHeaderProps> = ({ mode = 'create' }) => {
    const isEditMode = mode === 'edit';

    return (
        <HeaderContainer>
            <HeaderIcon>
                {isEditMode ? <FaEdit /> : <FaCalendarPlus />}
            </HeaderIcon>
            <HeaderText>
                <Title>{isEditMode ? 'Edycja rezerwacji' : 'Nowa rezerwacja'}</Title>
                <Subtitle>
                    {isEditMode
                        ? 'Zaktualizuj dane rezerwacji'
                        : 'Zaplanuj wizytę bez tworzenia profilu klienta'}
                </Subtitle>
            </HeaderText>
        </HeaderContainer>
    );
};

const HeaderContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.lg};
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    background: linear-gradient(135deg, ${brandTheme.surfaceAlt} 0%, #ffffff 100%);
    border-bottom: 1px solid #e2e8f0;
`;

const HeaderIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${brandTheme.shadow.sm};
    flex-shrink: 0;
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const Title = styled.h2`
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.025em;
`;

const Subtitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;