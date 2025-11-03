// src/pages/Protocols/components/ReservationStatusBadge.tsx
/**
 * Badge component for displaying reservation status
 * Matches the styling of ProtocolStatusBadge for consistency
 */

import React from 'react';
import styled from 'styled-components';
import { ReservationStatus } from '../../../api/reservationsApi';

interface ReservationStatusBadgeProps {
    status: ReservationStatus;
    className?: string;
}

// Status labels in Polish
const STATUS_LABELS: Record<ReservationStatus, string> = {
    [ReservationStatus.PENDING]: 'Oczekująca',
    [ReservationStatus.CONFIRMED]: 'Potwierdzona',
    [ReservationStatus.CONVERTED]: 'Przekształcona',
    [ReservationStatus.CANCELLED]: 'Anulowana'
};

// Status colors matching the design system
const STATUS_COLORS: Record<ReservationStatus, { bg: string; color: string; border: string }> = {
    [ReservationStatus.PENDING]: {
        bg: 'rgba(251, 191, 36, 0.1)',
        color: '#d97706',
        border: 'rgba(251, 191, 36, 0.3)'
    },
    [ReservationStatus.CONFIRMED]: {
        bg: 'rgba(59, 130, 246, 0.1)',
        color: '#1d4ed8',
        border: 'rgba(59, 130, 246, 0.3)'
    },
    [ReservationStatus.CONVERTED]: {
        bg: 'rgba(16, 185, 129, 0.1)',
        color: '#059669',
        border: 'rgba(16, 185, 129, 0.3)'
    },
    [ReservationStatus.CANCELLED]: {
        bg: 'rgba(239, 68, 68, 0.1)',
        color: '#dc2626',
        border: 'rgba(239, 68, 68, 0.3)'
    }
};

export const ReservationStatusBadge: React.FC<ReservationStatusBadgeProps> = ({
                                                                                  status,
                                                                                  className
                                                                              }) => {
    const colors = STATUS_COLORS[status];
    const label = STATUS_LABELS[status];

    return (
        <StatusBadge
            className={className}
            $bg={colors.bg}
            $color={colors.color}
            $border={colors.border}
        >
            <StatusDot $color={colors.color} />
            {label}
        </StatusBadge>
    );
};

// Styled Components
const StatusBadge = styled.div<{
    $bg: string;
    $color: string;
    $border: string;
}>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.2s ease;
    background: ${props => props.$bg};
    color: ${props => props.$color};
    border: 1px solid ${props => props.$border};
    box-shadow: 0 2px 4px ${props => props.$border};
    white-space: nowrap;
`;

const StatusDot = styled.span<{ $color: string }>`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${props => props.$color};
    flex-shrink: 0;
`;

export default ReservationStatusBadge;