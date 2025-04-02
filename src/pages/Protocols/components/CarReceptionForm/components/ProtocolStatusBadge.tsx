import React from 'react';
import { ProtocolStatus, ProtocolStatusLabels } from '../../../../../types';
import { StatusBadge } from '../../../styles';

interface ProtocolStatusBadgeProps {
    status: ProtocolStatus;
}

export const ProtocolStatusBadge: React.FC<ProtocolStatusBadgeProps> = ({ status }) => {
    // Funkcja pomocnicza do uzyskania etykiety statusu
    const getStatusLabel = (status: ProtocolStatus): string => {
        return ProtocolStatusLabels[status] || status;
    };

    return (
        <StatusBadge status={status}>
            {getStatusLabel(status)}
        </StatusBadge>
    );
};