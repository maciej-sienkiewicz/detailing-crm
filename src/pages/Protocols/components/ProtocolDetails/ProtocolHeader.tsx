import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CarReceptionProtocol, ProtocolStatus, ProtocolStatusLabels } from '../../../../types';

interface ProtocolHeaderProps {
    protocol: CarReceptionProtocol;
    onStatusChange: (newStatus: ProtocolStatus) => void;
}

const ProtocolHeader: React.FC<ProtocolHeaderProps> = ({ protocol, onStatusChange }) => {
    // Format dates for display
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';

        return format(new Date(dateString), 'dd MMMM yyyy', { locale: pl });
    };

    // Calculate the total value of services
    const totalValue = protocol.selectedServices.reduce(
        (sum, service) => sum + service.finalPrice, 0
    );

    // Helper to get the next possible status based on current status
    const getNextStatus = (): ProtocolStatus | null => {
        switch (protocol.status) {
            case ProtocolStatus.PENDING_APPROVAL:
                return ProtocolStatus.CONFIRMED;
            case ProtocolStatus.CONFIRMED:
                return ProtocolStatus.IN_PROGRESS;
            case ProtocolStatus.IN_PROGRESS:
                return ProtocolStatus.READY_FOR_PICKUP;
            case ProtocolStatus.READY_FOR_PICKUP:
                return ProtocolStatus.COMPLETED;
            case ProtocolStatus.COMPLETED:
                return null; // No next status
            default:
                return null;
        }
    };

    const nextStatus = getNextStatus();

    return (
        <HeaderContainer>
            <StatusSection>
                <StatusLabel>Status</StatusLabel>
                <StatusSelect
                    value={protocol.status}
                    onChange={(e) => onStatusChange(e.target.value as ProtocolStatus)}
                >
                    {Object.entries(ProtocolStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </StatusSelect>

                {nextStatus && (
                    <NextStatusButton onClick={() => onStatusChange(nextStatus)}>
                        → {ProtocolStatusLabels[nextStatus]}
                    </NextStatusButton>
                )}
            </StatusSection>

            <InfoSection>
                <InfoGrid>
                    <InfoItem>
                        <InfoLabel>Data przyjęcia</InfoLabel>
                        <InfoValue>{formatDate(protocol.startDate)}</InfoValue>
                    </InfoItem>

                    <InfoItem>
                        <InfoLabel>Planowane wydanie</InfoLabel>
                        <InfoValue>{formatDate(protocol.endDate)}</InfoValue>
                    </InfoItem>

                    <InfoItem>
                        <InfoLabel>Wartość zlecenia</InfoLabel>
                        <InfoValue highlight>{totalValue.toFixed(2)} zł</InfoValue>
                    </InfoItem>

                    <InfoItem>
                        <InfoLabel>Liczba usług</InfoLabel>
                        <InfoValue>{protocol.selectedServices.length}</InfoValue>
                    </InfoItem>
                </InfoGrid>
            </InfoSection>
        </HeaderContainer>
    );
};

// Styled components
const HeaderContainer = styled.div`
    margin-bottom: 20px;
`;

const StatusSection = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 15px;
    margin-bottom: 15px;
`;

const StatusLabel = styled.label`
    display: block;
    font-weight: 500;
    font-size: 14px;
    color: #7f8c8d;
    margin-bottom: 8px;
`;

const StatusSelect = styled.select`
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    margin-bottom: 10px;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const NextStatusButton = styled.button`
    width: 100%;
    padding: 8px 12px;
    background-color: #f0f7ff;
    border: 1px solid #d5e9f9;
    color: #3498db;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    
    &:hover {
        background-color: #d5e9f9;
    }
`;

const InfoSection = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 15px;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
`;

const InfoItem = styled.div``;

const InfoLabel = styled.div`
    font-weight: 500;
    font-size: 12px;
    color: #7f8c8d;
    margin-bottom: 4px;
`;

const InfoValue = styled.div<{ highlight?: boolean }>`
    font-size: 14px;
    color: ${props => props.highlight ? '#27ae60' : '#34495e'};
    font-weight: ${props => props.highlight ? '600' : 'normal'};
`;

export default ProtocolHeader;