// src/pages/Settings/styles/EmailSettings.styles.ts
import styled from 'styled-components';
import { theme } from '../../../../styles/theme';

export const StatusBanner = styled.div<{ $configured: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg} ${theme.spacing.xxl};
    background: ${props => props.$configured ? theme.successBg : theme.warningBg};
    color: ${props => props.$configured ? theme.success : theme.warning};
    border-bottom: 1px solid ${theme.border};
    font-weight: 500;
`;

export const ReadOnlyView = styled.div`
    padding: 0;
`;

export const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.xxl};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

export const InfoItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

export const InfoLabel = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${theme.text.tertiary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

export const InfoValue = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${theme.text.primary};
`;

export const StatusBadge = styled.span<{ $status: string }>`
    display: inline-flex;
    align-items: center;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border-radius: ${theme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    background: ${props => {
    switch (props.$status) {
        case 'VALID': return theme.successBg;
        case 'INVALID_CREDENTIALS':
        case 'INVALID_SETTINGS':
        case 'CONNECTION_ERROR': return theme.errorBg;
        default: return theme.warningBg;
    }
}};
    color: ${props => {
    switch (props.$status) {
        case 'VALID': return theme.success;
        case 'INVALID_CREDENTIALS':
        case 'INVALID_SETTINGS':
        case 'CONNECTION_ERROR': return theme.error;
        default: return theme.warning;
    }
}};
`;

export const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xxl};
`;

export const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

export const PasswordContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

export const PasswordToggle = styled.button`
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    color: ${theme.text.muted};
    cursor: pointer;
    padding: 4px;
    border-radius: ${theme.radius.sm};

    &:hover {
        color: ${theme.text.secondary};
        background: ${theme.surfaceHover};
    }
`;

export const SuggestionBox = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    background: ${theme.primaryGhost};
    color: ${theme.primary};
    border-radius: ${theme.radius.sm};
    font-size: 12px;
    font-weight: 500;
`;

export const SecuritySection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceElevated};
    border-radius: ${theme.radius.md};
    border: 1px solid ${theme.border};
`;

export const SecurityOption = styled.label`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 14px;
    font-weight: 500;
    color: ${theme.text.primary};
    cursor: pointer;

    input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: ${theme.primary};
        cursor: pointer;
    }
`;

export const ErrorBox = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg} ${theme.spacing.lg};
    background: ${theme.errorBg};
    color: ${theme.error};
    border-radius: ${theme.radius.md};
    border: 1px solid ${theme.error}30;
`;

export const ErrorText = styled.div`
    font-weight: 500;
    flex: 1;
`;