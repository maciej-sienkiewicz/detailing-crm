import React from 'react';
import styled from 'styled-components';
import { FaArrowRight, FaCalendarAlt, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { SidebarSection, SidebarSectionTitle, EmptyMessage, EmptyIcon, EmptyText, EmptySubtext } from './ClientDetailStyles';
import { ProtocolStatus, ProtocolStatusColors, ProtocolStatusLabels, ClientProtocolHistory } from '../../../../types/protocol';
import { theme } from "../../../../styles/theme";

interface ClientVisitHistoryProps {
    visits: ClientProtocolHistory[]; // ZMIENIONY TYP
    onVisitClick: (visitId: string) => void;
    clientName: string;
}

const ClientVisitHistory: React.FC<ClientVisitHistoryProps> = ({
                                                                   visits,
                                                                   onVisitClick,
                                                                   clientName
                                                               }) => {
    const formatDate = (dateInput: string): string => {
        if (!dateInput) return 'Brak daty';

        try {
            const date = new Date(dateInput);
            if (isNaN(date.getTime())) return 'Nieprawidłowa data';

            return date.toLocaleDateString('pl-PL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            return 'Błąd formatowania';
        }
    };

    const formatCurrency = (amount: number): string => {
        if (amount === null || amount === undefined) return '0,00 zł';

        const numAmount = Number(amount);
        if (isNaN(numAmount)) return '0,00 zł';

        try {
            return new Intl.NumberFormat('pl-PL', {
                style: 'currency',
                currency: 'PLN',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numAmount);
        } catch (error) {
            return `${numAmount.toFixed(2)} zł`;
        }
    };

    const getStatusInfo = (status: ProtocolStatus) => {
        return {
            label: ProtocolStatusLabels[status] || status,
            color: ProtocolStatusColors[status] || theme.text.muted,
            icon: getStatusIcon(status)
        };
    };

    const getStatusIcon = (status: ProtocolStatus) => {
        switch (status) {
            case ProtocolStatus.COMPLETED:
                return <FaCheckCircle />;
            case ProtocolStatus.IN_PROGRESS:
                return <FaClock />;
            case ProtocolStatus.READY_FOR_PICKUP:
                return <FaCheckCircle />;
            case ProtocolStatus.SCHEDULED:
                return <FaCalendarAlt />;
            case ProtocolStatus.CANCELLED:
                return <FaExclamationTriangle />;
            default:
                return <FaClock />;
        }
    };

    if (!visits || visits.length === 0) {
        return (
            <SidebarSection>
                <SidebarSectionTitle>
                    <FaCalendarAlt />
                    Historia wizyt
                </SidebarSectionTitle>
                <EmptyMessage>
                    <EmptyIcon>
                        <FaCalendarAlt />
                    </EmptyIcon>
                    <EmptyText>Brak wizyt</EmptyText>
                    <EmptySubtext>Ten klient nie ma jeszcze żadnej historii wizyt</EmptySubtext>
                </EmptyMessage>
            </SidebarSection>
        );
    }

    return (
        <SidebarSection>
            <SidebarSectionTitle>
                <FaCalendarAlt />
                Historia wizyt ({visits.length})
            </SidebarSectionTitle>

            <VisitHistoryList>
                {visits.map((visit, index) => {
                    const statusInfo = getStatusInfo(visit.status);

                    return (
                        <VisitHistoryCard
                            key={visit.id || index}
                            onClick={() => onVisitClick(visit.id)}
                            $status={visit.status}
                        >
                            <VisitCardHeader>
                                <VisitMetadata>
                                    <VisitDate>
                                        {formatDate(visit.startDate)}
                                    </VisitDate>
                                    <VisitTitle>
                                        Wizyta serwisowa
                                    </VisitTitle>
                                </VisitMetadata>
                                <VisitStatusIndicator $status={visit.status}>
                                    <StatusDot $color={statusInfo.color} />
                                    <StatusText>{statusInfo.label}</StatusText>
                                </VisitStatusIndicator>
                            </VisitCardHeader>

                            <VisitVehicleSection>
                                <VehicleInfo>
                                    <VehicleBrand>
                                        {visit.carMake} {visit.carModel} {/* ZMIENIONE POLA */}
                                    </VehicleBrand>
                                    <VehiclePlateDisplay>
                                        {visit.licensePlate}
                                    </VehiclePlateDisplay>
                                </VehicleInfo>
                            </VisitVehicleSection>

                            <VisitFooter>
                                <VisitAmount>
                                    <AmountLabel>Wartość</AmountLabel>
                                    <AmountValue>
                                        {formatCurrency(visit.totalAmount)}
                                    </AmountValue>
                                </VisitAmount>
                                <VisitActionIcon>
                                    <FaArrowRight />
                                </VisitActionIcon>
                            </VisitFooter>
                        </VisitHistoryCard>
                    );
                })}
            </VisitHistoryList>
        </SidebarSection>
    );
};

// Pozostałe styled components bez zmian...
const VisitHistoryList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const VisitHistoryCard = styled.div<{ $status: ProtocolStatus }>`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    cursor: pointer;
    transition: all ${theme.transitions.fast};
    position: relative;
    border-left: 3px solid ${props => ProtocolStatusColors[props.$status] || theme.text.muted};

    &:hover {
        border-color: ${theme.borderHover};
        border-left-color: ${props => ProtocolStatusColors[props.$status] || theme.text.muted};
        box-shadow: ${theme.shadow.md};
        transform: translateX(2px);
    }

    &:active {
        transform: translateX(1px);
    }
`;

const VisitCardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${theme.spacing.md};
    gap: ${theme.spacing.sm};
`;

const VisitMetadata = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    flex: 1;
`;

const VisitDate = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
    letter-spacing: -0.01em;
`;

const VisitTitle = styled.div`
    font-size: 12px;
    color: ${theme.text.secondary};
    font-weight: 500;
    font-style: italic;
`;

const VisitStatusIndicator = styled.div<{ $status: ProtocolStatus }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    flex-shrink: 0;
`;

const StatusDot = styled.div<{ $color: string }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.$color};
    flex-shrink: 0;
`;

const StatusText = styled.span`
    font-size: 10px;
    font-weight: 500;
    color: ${theme.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const VisitVehicleSection = styled.div`
    margin-bottom: ${theme.spacing.md};
`;

const VehicleInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const VehicleBrand = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
    letter-spacing: -0.01em;
`;

const VehiclePlateDisplay = styled.div`
    display: inline-block;
    background: ${theme.text.primary};
    color: white;
    padding: 2px 6px;
    border-radius: ${theme.radius.sm};
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: 'Monaco', 'Consolas', monospace;
    width: fit-content;
`;

const VisitFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: ${theme.spacing.sm};
    border-top: 1px solid ${theme.borderLight};
`;

const VisitAmount = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const AmountLabel = styled.div`
    font-size: 10px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
`;

const AmountValue = styled.div`
    font-size: 14px;
    font-weight: 700;
    color: ${theme.text.primary};
    letter-spacing: -0.01em;
`;

const VisitActionIcon = styled.div`
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.text.muted};
    font-size: 8px;
    transition: all ${theme.transitions.fast};
    flex-shrink: 0;

    ${VisitHistoryCard}:hover & {
        color: ${theme.text.secondary};
        transform: translateX(2px);
    }
`;

export default ClientVisitHistory;