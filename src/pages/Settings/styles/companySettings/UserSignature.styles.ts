// src/pages/Settings/styles/UserSignature.styles.ts
import styled from 'styled-components';
import { theme } from '../../../../styles/theme';

export const SignatureCreator = styled.div`
    background: ${theme.surfaceElevated};
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.border};
    overflow: hidden;
`;

export const CreatorHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.xxl};
    background: ${theme.surface};
    border-bottom: 1px solid ${theme.border};
    gap: ${theme.spacing.xxl};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${theme.spacing.lg};
    }
`;

export const CreatorTitle = styled.h4`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

export const CreatorActions = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};

    @media (max-width: 768px) {
        width: 100%;
        
        > * {
            flex: 1;
        }
    }
`;

export const CanvasContainer = styled.div`
    padding: ${theme.spacing.xxl};
    background: ${theme.surface};
`;

export const PreviewSection = styled.div`
    background: ${theme.surfaceElevated};
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.border};
    overflow: hidden;
`;

export const PreviewHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.xxl};
    background: ${theme.surface};
    border-bottom: 1px solid ${theme.border};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.xs};
    }
`;

export const PreviewTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

export const PreviewMeta = styled.span`
    font-size: 12px;
    color: ${theme.text.muted};
    font-weight: 500;
`;

export const PreviewContent = styled.div`
    padding: ${theme.spacing.xxxl};
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${theme.surfaceAlt};
    min-height: 120px;
`;

export const SignatureDisplay = styled.div`
    max-width: 100%;

    svg {
        max-width: 400px;
        max-height: 150px;
        border: 1px solid ${theme.borderLight};
        border-radius: ${theme.radius.sm};
        background: white;
        padding: ${theme.spacing.lg};
        box-shadow: ${theme.shadow.sm};
    }
`;

export const PreviewActions = styled.div`
    display: flex;
    justify-content: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xxl};
    background: ${theme.surface};
    border-top: 1px solid ${theme.border};

    @media (max-width: 768px) {
        > * {
            flex: 1;
        }
    }
`;

export const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: ${theme.spacing.xxxl};
    gap: ${theme.spacing.xxl};
`;

export const EmptyIcon = styled.div`
    width: 80px;
    height: 80px;
    background: ${theme.primaryGhost};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: ${theme.primary};
    margin-bottom: ${theme.spacing.lg};
`;

export const EmptyTitle = styled.h3`
    font-size: 24px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

export const EmptyDescription = styled.p`
    font-size: 16px;
    color: ${theme.text.secondary};
    margin: 0;
    max-width: 500px;
    line-height: 1.6;
`;

export const EmptyActions = styled.div`
    margin-top: ${theme.spacing.lg};
`;

export const CompactStatus = styled.div`
    background: ${theme.surfaceElevated};
    border-radius: ${theme.radius.md};
    padding: ${theme.spacing.xxl};
    border: 1px solid ${theme.border};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
`;

export const StatusRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export const StatusLabel = styled.span`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

export const StatusValue = styled.span<{ $success?: boolean }>`
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.$success ? theme.success : theme.text.primary};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

export const ActionButton = styled.button<{
    $primary?: boolean;
    $secondary?: boolean;
    $danger?: boolean;
    $large?: boolean;
}>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};
    padding: ${props => props.$large ? `${theme.spacing.lg} ${theme.spacing.xl}` : `${theme.spacing.sm} ${theme.spacing.lg}`};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: ${props => props.$large ? '16px' : '14px'};
    cursor: pointer;
    transition: all ${theme.transitions.spring};
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: ${props => props.$large ? '48px' : '40px'};
    position: relative;
    overflow: hidden;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    &:not(:disabled):hover {
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:not(:disabled):active {
        transform: translateY(0);
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    ${props => props.$primary && `
        background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
        color: white;
        box-shadow: ${theme.shadow.sm};

        &:not(:disabled):hover {
            background: linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 100%);
        }
    `}

    ${props => props.$secondary && `
        background: ${theme.surface};
        color: ${theme.text.secondary};
        border-color: ${theme.border};
        box-shadow: ${theme.shadow.sm};

        &:not(:disabled):hover {
            background: ${theme.surfaceAlt};
            color: ${theme.text.primary};
            border-color: ${theme.primary};
        }
    `}

    ${props => props.$danger && `
        background: ${theme.errorBg};
        color: ${theme.error};
        border-color: ${theme.error}30;

        &:not(:disabled):hover {
            background: ${theme.error};
            color: white;
            border-color: ${theme.error};
        }
    `}
`;