// src/features/reservations/components/ReservationFormActions.tsx
/**
 * Form actions component for reservation form
 */

import React from 'react';
import styled from 'styled-components';
import { FaCalendarPlus, FaTimes } from 'react-icons/fa';

const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    surface: '#ffffff',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569'
    },
    border: '#e2e8f0',
    spacing: {
        md: '16px',
        lg: '24px',
        xl: '32px'
    },
    radius: {
        md: '8px'
    },
    transitions: {
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    shadow: {
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
};

interface ReservationFormActionsProps {
    onCancel: () => void;
    loading: boolean;
}

export const ReservationFormActions: React.FC<ReservationFormActionsProps> = ({
                                                                                  onCancel,
                                                                                  loading
                                                                              }) => {
    return (
        <ActionsContainer>
            <SecondaryButton type="button" onClick={onCancel} disabled={loading}>
                <FaTimes />
                <span>Anuluj</span>
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={loading}>
                <FaCalendarPlus />
                <span>{loading ? 'Zapisywanie...' : 'Utwórz rezerwację'}</span>
            </PrimaryButton>
        </ActionsContainer>
    );
};

// Styled Components
const ActionsContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.md};
    margin-top: ${brandTheme.spacing.xl};
    padding-top: ${brandTheme.spacing.lg};
    border-top: 1px solid ${brandTheme.border};

    @media (max-width: 576px) {
        flex-direction: column-reverse;
        gap: ${brandTheme.spacing.md};
    }
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${brandTheme.transitions.spring};
    min-height: 44px;
    min-width: 140px;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    @media (max-width: 576px) {
        width: 100%;
        min-height: 48px;
    }
`;

const PrimaryButton = styled(Button)`
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    border: 2px solid transparent;
    box-shadow: ${brandTheme.shadow.sm};

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const SecondaryButton = styled(Button)`
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border: 2px solid ${brandTheme.border};

    &:hover:not(:disabled) {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.text.primary};
        border-color: #cbd5e1;
        box-shadow: ${brandTheme.shadow.sm};
    }
`;