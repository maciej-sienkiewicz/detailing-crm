import React, { useState } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CarReceptionProtocol, ProtocolStatus, ProtocolStatusLabels } from '../../../../types';
import { protocolsApi } from '../../../../api/protocolsApi';

interface ProtocolHeaderProps {
    protocol: CarReceptionProtocol;
    onStatusChange: (newStatus: ProtocolStatus) => void;
}

const ProtocolHeader: React.FC<ProtocolHeaderProps> = ({ protocol, onStatusChange }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Format dates for display
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';

        return format(new Date(dateString), 'dd MMMM yyyy', { locale: pl });
    };

    const formatDateTime = (dateString: string): string => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: pl });
    };

    // Calculate the total value of services
    const totalValue = protocol.selectedServices.reduce(
        (sum, service) => sum + service.finalPrice, 0
    );

    // Helper to get the next possible status based on current status
    const getNextStatus = (): ProtocolStatus | null => {
        switch (protocol.status) {
            case ProtocolStatus.SCHEDULED:
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

    // Obsługa zmiany statusu
    const handleStatusChange = async (newStatus: ProtocolStatus) => {
        if (newStatus === protocol.status) return; // Nie rób nic, jeśli status nie zmienił się

        try {
            setIsUpdating(true);
            setError(null);

            // Zamiast pobierać cały obiekt z API, aktualizujemy tylko status lokalnie
            // Wywołujemy callback z nowym statusem od razu
            onStatusChange(newStatus);

            // W tle aktualizujemy status w API
            await protocolsApi.updateProtocolStatus(protocol.id, newStatus);
        } catch (err) {
            console.error('Error changing protocol status:', err);
            // Nawet jeśli wystąpi błąd, nie przywracamy starego statusu,
            // aby uniknąć problemów z synchronizacją
            setError('Wystąpił błąd podczas zapisywania statusu na serwerze');
        } finally {
            setIsUpdating(false);
        }
    };

    const nextStatus = getNextStatus();

    return (
        <HeaderContainer>
            <StatusSection>
                <StatusLabel>Status</StatusLabel>
                <StatusSelect
                    value={protocol.status}
                    onChange={(e) => handleStatusChange(e.target.value as ProtocolStatus)}
                    disabled={isUpdating}
                >
                    {Object.entries(ProtocolStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </StatusSelect>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                {nextStatus && (
                    <NextStatusButton
                        onClick={() => handleStatusChange(nextStatus)}
                        disabled={isUpdating}
                    >
                        → {ProtocolStatusLabels[nextStatus]}
                    </NextStatusButton>
                )}
            </StatusSection>

            <InfoSection>
                <InfoGrid>
                    <InfoItem>
                        <InfoLabel>Data przyjęcia</InfoLabel>
                        <InfoValue>{formatDateTime(protocol.startDate)}</InfoValue>
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

    @media (max-width: 768px) {
        padding: 12px 10px;
        font-size: 16px;
    }

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    &:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.div`
    color: #e74c3c;
    font-size: 13px;
    margin-bottom: 10px;
    padding: 5px 8px;
    background-color: #fdecea;
    border-radius: 3px;
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

    @media (max-width: 768px) {
        padding: 10px 12px;
        font-size: 14px;
    }

    &:hover:not(:disabled) {
        background-color: #d5e9f9;
    }

    &:disabled {
        background-color: #f5f5f5;
        color: #95a5a6;
        border-color: #e0e0e0;
        cursor: not-allowed;
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

    @media (max-width: 768px) {
        grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
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