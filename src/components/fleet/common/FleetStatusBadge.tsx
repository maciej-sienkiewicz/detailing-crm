// src/components/fleet/common/FleetStatusBadge.tsx

import React from 'react';
import styled from 'styled-components';
import {
    FleetVehicleStatus,
    FleetVehicleStatusLabels,
    FleetVehicleStatusColors
} from '../../../types/fleet';
import {
    FleetRentalStatus,
    FleetRentalStatusLabels,
    FleetRentalStatusColors
} from '../../../types/fleetRental';

interface StatusBadgeProps {
    status: FleetVehicleStatus | FleetRentalStatus;
    type: 'vehicle' | 'rental';
}

const FleetStatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
    const getLabel = (): string => {
        if (type === 'vehicle') {
            return FleetVehicleStatusLabels[status as FleetVehicleStatus] || 'Nieznany';
        } else {
            return FleetRentalStatusLabels[status as FleetRentalStatus] || 'Nieznany';
        }
    };

    const getColor = (): string => {
        if (type === 'vehicle') {
            return FleetVehicleStatusColors[status as FleetVehicleStatus] || '#999';
        } else {
            return FleetRentalStatusColors[status as FleetRentalStatus] || '#999';
        }
    };

    return (
        <Badge color={getColor()}>
            {getLabel()}
        </Badge>
    );
};

const Badge = styled.span<{ color: string }>`
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    color: white;
    background-color: ${props => props.color};
    text-align: center;
`;

export default FleetStatusBadge;