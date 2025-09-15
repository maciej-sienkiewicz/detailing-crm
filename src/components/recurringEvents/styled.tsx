// src/components/recurringEvents/styled.tsx - UPDATED VERSION
import styled from 'styled-components';
import { EventType } from '../../types/recurringEvents';

// Theme definition - replace with your actual theme
const theme = {
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    success: '#10b981',
    successLight: '#34d399',
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    error: '#ef4444',
    errorLight: '#f87171',

    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    surfaceElevated: '#f1f5f9',
    surfaceHover: '#f8fafc',

    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#94a3b8',
        muted: '#cbd5e1'
    },

    border: '#e2e8f0',
    borderLight: '#f1f5f9',

    spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        xxl: '32px',
        xxxl: '48px'
    },

    radius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px'
    },

    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    }
};

export const Container = styled.div`
    width: 100%;
`;

export const LoadingContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxxl};
    font-size: 16px;
    color: ${theme.text.secondary};
`;

// Cell Components - UPDATED FOR PROFESSIONAL LOOK
export const SelectionCheckbox = styled.div<{ $selected: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    cursor: pointer;
    font-size: 16px;
    color: ${props => props.$selected ? theme.primary : theme.text.tertiary};
    transition: all 0.2s ease;

    &:hover {
        color: ${props => props.$selected ? theme.primary : theme.text.secondary};
        transform: scale(1.1);
    }
`;

export const EventTitle = styled.div`
    font-weight: 600;
    font-size: 14px;
    color: ${theme.text.primary};
    line-height: 1.4;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    &:hover {
        color: ${theme.primary};
        cursor: pointer;
    }
`;

export const EventTypeChip = styled.span<{ $type: EventType }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${props => props.$type === EventType.SIMPLE_EVENT ?
    `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.primary}08 100%)` :
    `linear-gradient(135deg, ${theme.success}15 0%, ${theme.success}08 100%)`
};
    color: ${props => props.$type === EventType.SIMPLE_EVENT ? theme.primary : theme.success};
    border: 1px solid ${props => props.$type === EventType.SIMPLE_EVENT ?
    `${theme.primary}30` : `${theme.success}30`
};
    border-radius: ${theme.radius.lg};
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    min-width: 80px;
    box-shadow: ${theme.shadow.xs};
`;

export const FrequencyInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: 13px;
    color: ${theme.text.secondary};
    font-weight: 500;

    svg {
        font-size: 12px;
        color: ${theme.primary};
        flex-shrink: 0;
    }
    
    span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

export const StatusIndicator = styled.div<{ $status: 'active' | 'inactive' }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: 13px;
    font-weight: 600;
    color: ${props => props.$status === 'active' ? theme.success : theme.text.tertiary};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${props => props.$status === 'active' ?
    `${theme.success}10` : `${theme.text.tertiary}10`
};
    border-radius: ${theme.radius.md};
    border: 1px solid ${props => props.$status === 'active' ?
    `${theme.success}30` : `${theme.text.tertiary}30`
};
    white-space: nowrap;

    svg {
        font-size: 12px;
        flex-shrink: 0;
    }
`;

export const NextOccurrence = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: 13px;
    color: ${theme.text.secondary};
    font-weight: 500;

    svg {
        font-size: 12px;
        color: ${theme.primary};
        flex-shrink: 0;
    }
    
    span {
        white-space: nowrap;
    }
`;

export const EmptyValue = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: 12px;
    color: ${theme.text.tertiary};
    font-style: italic;

    svg {
        font-size: 11px;
        opacity: 0.7;
    }
`;

export const OccurrenceStats = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${theme.surfaceElevated};
    border-radius: ${theme.radius.md};
    border: 1px solid ${theme.border};
    min-width: 60px;
`;

export const CompletedCount = styled.span`
    font-weight: 700;
    font-size: 14px;
    color: ${theme.success};
    line-height: 1;
`;

export const StatsSeparator = styled.span`
    color: ${theme.text.tertiary};
    font-size: 12px;
    font-weight: 500;
`;

export const TotalCount = styled.span`
    font-weight: 600;
    font-size: 14px;
    color: ${theme.text.secondary};
    line-height: 1;
`;

export const CreatedDate = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
    font-weight: 500;
    white-space: nowrap;
`;

// Filters Panel
export const FiltersPanel = styled.div`
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
    border-top: 1px solid ${theme.border};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

export const FilterRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${theme.spacing.md};
    align-items: end;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

export const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

export const FilterLabel = styled.label`
    font-size: 12px;
    font-weight: 600;
    color: ${theme.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

export const FilterInput = styled.input`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primary}20;
    }

    &::placeholder {
        color: ${theme.text.tertiary};
    }
`;

export const FilterSelect = styled.select`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    transition: all 0.2s ease;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primary}20;
    }
`;

export const FilterActions = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};
    align-items: center;
    justify-content: flex-end;
    padding-top: ${theme.spacing.md};
    border-top: 1px solid ${theme.border};

    @media (max-width: 768px) {
        justify-content: stretch;
        
        button {
            flex: 1;
        }
    }
`;

export const ClearFiltersButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        color: ${theme.text.primary};
        border-color: ${theme.primary};
    }

    svg {
        font-size: 12px;
    }
`;

export const ApplyFiltersButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${theme.primary};
    color: white;
    border: 1px solid ${theme.primary};
    border-radius: ${theme.radius.md};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.primaryLight};
        border-color: ${theme.primaryLight};
    }

    svg {
        font-size: 12px;
    }
`;

export const FiltersBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    background: ${theme.error};
    color: white;
    font-size: 10px;
    font-weight: 700;
    border-radius: 50%;
    margin-left: ${theme.spacing.xs};
`;

// Professional loading and empty states
export const TableLoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxxl};
    gap: ${theme.spacing.lg};
    min-height: 300px;
`;

export const LoadingSpinner = styled.div`
    width: 32px;
    height: 32px;
    border: 3px solid ${theme.border};
    border-top: 3px solid ${theme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export const LoadingText = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

export const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxxl};
    gap: ${theme.spacing.lg};
    min-height: 300px;
    text-align: center;
`;

export const ErrorIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${theme.errorLight};
    color: ${theme.error};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
`;