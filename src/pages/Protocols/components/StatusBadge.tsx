import React from 'react';
import styled from 'styled-components';
import { ProtocolStatus, ProtocolStatusLabels, ProtocolStatusColors } from '../../../types';

interface StatusBadgeProps {
    status: ProtocolStatus;
    showLabel?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showLabel = true }) => {
    const statusColor = ProtocolStatusColors[status];
    const statusLabel = ProtocolStatusLabels[status];

    return (
        <Badge style={{ backgroundColor: statusColor }}>
            {showLabel && statusLabel}
        </Badge>
    );
};

const Badge = styled.div`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: white;
`;

export default StatusBadge;