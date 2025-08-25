// src/pages/Settings/styles/Form.styles.ts
import styled from 'styled-components';
import {theme} from '../../../../styles/theme';

export const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.xxl};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.lg};
    }
`;

export const FormFieldContainer = styled.div<{ $fullWidth?: boolean }>`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    ${props => props.$fullWidth && 'grid-column: 1 / -1;'}
`;

export const FieldLabel = styled.label`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-weight: 600;
    font-size: 14px;
    color: ${theme.text.primary};
    
    .field-icon {
        font-size: 16px;
        color: ${theme.text.tertiary};
    }
    
    svg {
        font-size: 16px;
        color: ${theme.text.tertiary};
    }
`;

export const RequiredMark = styled.span`
    color: ${theme.status.error};
    font-weight: 700;
    margin-left: ${theme.spacing.xs};
`;

export const Input = styled.input`
    height: 48px;
    padding: 0 ${theme.spacing.lg};
    border: 2px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 15px;
    font-weight: 500;
    background: ${theme.surface};
    color: ${theme.text.primary};
    transition: all ${theme.transitions.spring};

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primaryGhost};
    }

    &::placeholder {
        color: ${theme.text.muted};
        font-weight: 400;
    }
`;

export const DisplayValue = styled.div<{ $hasValue: boolean }>`
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceElevated};
    border: 2px solid ${theme.borderLight};
    border-radius: ${theme.radius.md};
    color: ${props => props.$hasValue ? theme.text.primary : theme.text.muted};
    font-weight: 500;
    font-size: 15px;
    min-height: 48px;
    display: flex;
    align-items: center;
    font-style: ${props => props.$hasValue ? 'normal' : 'italic'};
`;

export const ValidationMessage = styled.div<{ $isValid: boolean }>`
    font-size: 12px;
    color: ${props => props.$isValid ? theme.success : theme.error};
    font-weight: 500;
    margin-top: ${theme.spacing.xs};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};

    &::before {
        content: ${props => props.$isValid ? '"✓"' : '"⚠"'};
        font-size: 14px;
    }
`;

export const HelpText = styled.div`
    font-size: 12px;
    color: ${theme.text.muted};
    line-height: 1.4;
`;

export const WebsiteLink = styled.a`
    color: ${theme.primary};
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
        text-decoration: underline;
    }
`;