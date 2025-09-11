// src/components/recurringEvents/FormComponents/FormElements.tsx
/**
 * Shared Form Elements
 * Common form components used across different steps
 */

import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const FormField = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
`;

export const FieldLabel = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

export const RequiredIndicator = styled.span`
    color: ${theme.error};
    font-size: 14px;
`;

export const ErrorMessage = styled.div`
    font-size: 13px;
    color: ${theme.error};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    margin-top: ${theme.spacing.xs};

    &::before {
        content: '⚠';
        font-size: 12px;
    }
`;

export const SectionDescription = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
    background: ${theme.primary}08;
    border: 1px solid ${theme.primary}20;
    border-radius: ${theme.radius.md};
    font-size: 14px;
    color: ${theme.text.secondary};
    line-height: 1.5;

    svg {
        color: ${theme.primary};
        font-size: 16px;
        margin-top: 2px;
        flex-shrink: 0;
    }
`;