// src/pages/Settings/styles/SectionCard.styles.ts
import styled from 'styled-components';
import {theme} from '../../../../styles/theme';

export const SettingsCard = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    border: 1px solid ${theme.border};
    overflow: hidden;
    box-shadow: ${theme.shadow.sm};
    transition: all ${theme.transitions.spring};

    &:hover {
        box-shadow: ${theme.shadow.md};
        border-color: ${theme.borderHover};
    }
`;

export const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.xxl};
    border-bottom: 1px solid ${theme.border};
    background: ${theme.surfaceAlt};
    gap: ${theme.spacing.xxl};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: ${theme.spacing.lg};
    }
`;

export const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    flex: 1;
    min-width: 0;
`;

export const HeaderIcon = styled.div`
    width: 40px;
    height: 40px;
    background: ${theme.primaryGhost};
    border-radius: ${theme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.primary};
    font-size: 18px;
    flex-shrink: 0;
`;

export const HeaderText = styled.div`
    flex: 1;
    min-width: 0;
`;

export const HeaderTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.xs} 0;
    letter-spacing: -0.025em;
`;

export const HeaderSubtitle = styled.p`
    font-size: 14px;
    color: ${theme.text.secondary};
    margin: 0;
    font-weight: 500;
`;

export const HeaderActions = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};
    align-items: center;
    flex-shrink: 0;

    @media (max-width: 768px) {
        justify-content: stretch;

        > * {
            flex: 1;
        }
    }
`;

export const ActionGroup = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};

    @media (max-width: 768px) {
        width: 100%;

        > * {
            flex: 1;
        }
    }
`;

export const CardBody = styled.div`
    padding: ${theme.spacing.xxxl};
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${theme.transitions.spring};
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;
    justify-content: center;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export const ActionButton = styled(BaseButton)<{
    $primary?: boolean;
    $secondary?: boolean;
    $danger?: boolean;
    $large?: boolean;
}>`
    ${props => props.$primary && `
        background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
        color: white;
        box-shadow: ${theme.shadow.sm};

        &:hover:not(:disabled) {
            background: linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 100%);
            box-shadow: ${theme.shadow.lg};
        }
    `}

    ${props => props.$secondary && `
        background: ${theme.surface};
        color: ${theme.text.secondary};
        border-color: ${theme.border};
        box-shadow: ${theme.shadow.xs};

        &:hover:not(:disabled) {
            background: ${theme.surfaceHover};
            color: ${theme.text.primary};
            border-color: ${theme.borderHover};
        }
    `}

    ${props => props.$danger && `
        background: ${theme.status.errorLight};
        color: ${theme.status.error};
        border-color: ${theme.status.error}30;

        &:hover:not(:disabled) {
            background: ${theme.status.error};
            color: white;
            border-color: ${theme.status.error};
        }
    `}

    ${props => props.$large && `
        padding: ${theme.spacing.lg} ${theme.spacing.xl};
        font-size: 16px;
        min-height: 48px;
    `}
`;