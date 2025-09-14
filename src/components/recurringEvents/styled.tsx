// src/components/recurringEvents/styled.ts
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { EventType } from '../../types/recurringEvents';

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

// Cell Components
export const SelectionCheckbox = styled.div<{ $selected: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    cursor: pointer;
    font-size: 18px;
    color: ${props => props.$selected ? theme.primary : theme.text.tertiary};

    &:hover {
        color: ${props => props.$selected ? theme.primaryDark : theme.text.secondary};
    }
`;

export const EventTitle = styled.div`
    font-weight: 600;
    font-size: 14px;
    color: ${theme.text.primary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const EventTypeChip = styled.span<{ $type: EventType }>`
    display: inline-flex;
    align-items: center;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${props => props.$type === EventType.SIMPLE_EVENT ? theme.primary + '20' : theme.success + '20'};
    color: ${props => props.$type === EventType.SIMPLE_EVENT ? theme.primary : theme.success};
    border: 1px solid ${props => props.$type === EventType.SIMPLE_EVENT ? theme.primary + '40' : theme.success + '40'};
    border-radius: ${theme.radius.sm};
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
`;

export const FrequencyInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: 13px;
    color: ${theme.text.secondary};

    svg {
        font-size: 12px;
        color: ${theme.text.tertiary};
    }
`;

export const StatusIndicator = styled.div<{ $status: 'active' | 'inactive' }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: 13px;
    font-weight: 500;
    color: ${props => props.$status === 'active' ? theme.success : theme.text.tertiary};

    svg {
        font-size: 12px;
    }
`;

export const NextOccurrence = styled.div`
    font-size: 13px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

export const OccurrenceStats = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

export const CompletedCount = styled.span`
    font-weight: 600;
    color: ${theme.success};
`;

export const StatsSeparator = styled.span`
    color: ${theme.text.tertiary};
    font-size: 12px;
`;

export const TotalCount = styled.span`
    font-weight: 500;
    color: ${theme.text.secondary};
`;

export const CreatedDate = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
`;

// Filters Panel
export const FiltersPanel = styled.div`
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
`;