import React from 'react';
import styled from 'styled-components';
import { FaArrowRight, FaCalendarAlt, FaCar, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { SidebarSection, SidebarSectionTitle, EmptyMessage, EmptyIcon, EmptyText, EmptySubtext } from './VehicleDetailStyles';
import { ProtocolStatus, ProtocolStatusColors, ProtocolStatusLabels } from '../../../../types/protocol';
import {theme} from "../../../../styles/theme";

interface VehicleVisitHistoryProps {
    visitHistory: any[];
    onVisitClick: (visitId: string) => void;
    vehicleDisplay: {
        make: string;
        model: string;
        licensePlate: string;
    };
}

const VehicleVisitHistory: React.FC<VehicleVisitHistoryProps> = ({
                                                                          visitHistory,
                                                                          onVisitClick,
                                                                          vehicleDisplay
                                                                      }) => {
    const formatDate = (dateInput: any): string => {
        if (!dateInput) return 'Brak daty';

        try {
            if (typeof dateInput === 'string') {
                const date = new Date(dateInput);
                if (isNaN(date.getTime())) return 'Nieprawidłowa data';
                return date.toLocaleDateString('pl-PL', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            }

            if (Array.isArray(dateInput) && dateInput.length >= 3) {
                const [year, month, day] = dateInput;
                if (!year || !month || !day) return 'Nieprawidłowa data';

                const date = new Date(year, month - 1, day);
                if (isNaN(date.getTime())) return 'Nieprawidłowa data';

                return date.toLocaleDateString('pl-PL', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            }

            return 'Nieznany format daty';

        } catch (error) {
            return 'Błąd formatowania';
        }
    };

    const formatCurrency = (amount: any): string => {
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
            case ProtocolStatus.CANCELLED:
                return <FaExclamationTriangle />;
            default:
                return <FaClock />;
        }
    };

    if (!visitHistory || visitHistory.length === 0) {
        return (
            <SidebarSection>
                <SidebarSectionTitle>
                    <FaCalendarAlt />
                    Historia wizyt
                </SidebarSectionTitle>
                <EmptyMessage>
                    <EmptyIcon>
                        <FaCar />
                    </EmptyIcon>
                    <EmptyText>Brak historii wizyt</EmptyText>
                    <EmptySubtext>Ten pojazd nie ma jeszcze żadnej historii wizyt w systemie</EmptySubtext>
                </EmptyMessage>
            </SidebarSection>
        );
    }

    return (
        <SidebarSection>
            <SidebarSectionTitle>
                <FaCalendarAlt />
                Historia wizyt ({visitHistory.length})
            </SidebarSectionTitle>

            <VisitHistoryList>
                {visitHistory.map((visit, index) => {
                    const startDate = visit.startDate || visit.start_date || visit.startdate;
                    const totalAmount = visit.totalAmountNetto || visit.total_amount || visit.totalamount || visit.amount;
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
                                        {formatDate(startDate)}
                                    </VisitDate>
                                    <VisitTitle>
                                        {visit.title || 'Bez tytułu'}
                                    </VisitTitle>
                                </VisitMetadata>
                                <VisitStatusIndicator $status={visit.status}>
                                    <StatusDot $color={statusInfo.color} />
                                    <StatusText>{statusInfo.label}</StatusText>
                                </VisitStatusIndicator>
                            </VisitCardHeader>

                            <VisitFooter>
                                <VisitAmount>
                                    <AmountLabel>Wartość netto</AmountLabel>
                                    <AmountValue>
                                        {formatCurrency(totalAmount)}
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

export default VehicleVisitHistory;