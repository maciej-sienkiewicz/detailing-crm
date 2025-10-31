// src/pages/Clients/components/ClientDetailPage/ClientVehicles.tsx
import React from 'react';
import styled from 'styled-components';
import {FaCar, FaArrowRight, FaTachometerAlt, FaCalendarAlt, FaEuroSign, FaWrench, FaMoneyBill} from 'react-icons/fa';
import { SidebarSection, SidebarSectionTitle, EmptyMessage, EmptyIcon, EmptyText, EmptySubtext } from './ClientDetailStyles';
import { theme } from "../../../../styles/theme";
import { VehicleExpanded } from '../../../../types';

interface ClientVehiclesProps {
    vehicles: VehicleExpanded[];
    onVehicleClick: (vehicleId: string) => void;
}

const ClientVehicles: React.FC<ClientVehiclesProps> = ({ vehicles, onVehicleClick }) => {
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatLastServiceDate = (dateString?: string): string => {
        if (!dateString) return 'Brak';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pl-PL', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Błąd daty';
        }
    };

    const getVehicleStatusColor = (vehicle: VehicleExpanded): string => {
        // Premium customer logic based on spending or visits
        if (vehicle.totalSpent.totalAmountNetto > 5000 || vehicle.totalServices > 10) {
            return theme.status.success;
        } else if (vehicle.totalSpent.totalAmountNetto > 2000 || vehicle.totalServices > 5) {
            return theme.primary;
        } else {
            return theme.text.muted;
        }
    };

    const getVehicleStatusLabel = (vehicle: VehicleExpanded): string => {
        if (vehicle.totalSpent.totalAmountNetto > 5000 || vehicle.totalServices > 10) {
            return 'VIP';
        } else if (vehicle.totalSpent.totalAmountNetto > 2000 || vehicle.totalServices > 5) {
            return 'Stały klient';
        } else {
            return 'Standard';
        }
    };

    if (vehicles.length === 0) {
        return (
            <SidebarSection>
                <SidebarSectionTitle>
                    <FaCar />
                    Pojazdy klienta
                </SidebarSectionTitle>
                <EmptyMessage>
                    <EmptyIcon>
                        <FaCar />
                    </EmptyIcon>
                    <EmptyText>Brak pojazdów</EmptyText>
                    <EmptySubtext>Ten klient nie ma jeszcze żadnych pojazdów w systemie</EmptySubtext>
                </EmptyMessage>
            </SidebarSection>
        );
    }

    return (
        <SidebarSection>
            <SidebarSectionTitle>
                <FaCar />
                Pojazdy klienta ({vehicles.length})
            </SidebarSectionTitle>

            <VehiclesList>
                {vehicles.map(vehicle => (
                    <VehicleCard
                        key={vehicle.id}
                        onClick={() => onVehicleClick(vehicle.id)}
                        $statusColor={getVehicleStatusColor(vehicle)}
                    >
                        <VehicleCardHeader>
                            <VehicleMainInfo>
                                <VehicleBrand>
                                    {vehicle.make} {vehicle.model}
                                </VehicleBrand>
                                <VehicleYear>{vehicle.year}</VehicleYear>
                            </VehicleMainInfo>
                            <VehicleStatus $color={getVehicleStatusColor(vehicle)}>
                                {getVehicleStatusLabel(vehicle)}
                            </VehicleStatus>
                        </VehicleCardHeader>

                        <VehiclePlateSection>
                            <VehiclePlateDisplay>
                                {vehicle.licensePlate}
                            </VehiclePlateDisplay>
                            {vehicle.color && (
                                <VehicleColor>
                                    {vehicle.color}
                                </VehicleColor>
                            )}
                        </VehiclePlateSection>

                        {/* Professional stats grid */}
                        <VehicleStatsGrid>
                            <VehicleStat>
                                <StatIcon $color={theme.primary}>
                                    <FaWrench />
                                </StatIcon>
                                <StatContent>
                                    <StatValue>{vehicle.totalServices}</StatValue>
                                    <StatLabel>Serwisów</StatLabel>
                                </StatContent>
                            </VehicleStat>

                            <VehicleStat>
                                <StatIcon $color={theme.status.success}>
                                    <FaMoneyBill />
                                </StatIcon>
                                <StatContent>
                                    <StatValue>{formatCurrency(vehicle.totalSpent.totalAmountNetto)}</StatValue>
                                    <StatLabel>Wydano (netto)</StatLabel>
                                </StatContent>
                            </VehicleStat>
                        </VehicleStatsGrid>

                        {/* Last service information */}
                        <LastServiceInfo>
                            <LastServiceIcon>
                                <FaCalendarAlt />
                            </LastServiceIcon>
                            <LastServiceText>
                                <LastServiceLabel>Ostatni serwis:</LastServiceLabel>
                                <LastServiceDate>
                                    {formatLastServiceDate(vehicle.lastServiceDate)}
                                </LastServiceDate>
                            </LastServiceText>
                        </LastServiceInfo>

                        <VehicleActionIcon>
                            <FaArrowRight />
                        </VehicleActionIcon>
                    </VehicleCard>
                ))}
            </VehiclesList>
        </SidebarSection>
    );
};

// Professional styled components
const VehiclesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
`;

const VehicleCard = styled.div<{ $statusColor: string }>`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.xl};
    padding: ${theme.spacing.lg};
    cursor: pointer;
    transition: all ${theme.transitions.normal};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, ${props => props.$statusColor}, ${props => props.$statusColor}80);
        opacity: 0;
        transition: opacity ${theme.transitions.normal};
    }

    &:hover {
        border-color: ${theme.borderHover};
        box-shadow: ${theme.shadow.lg};
        transform: translateY(-2px);

        &::before {
            opacity: 1;
        }
    }

    &:active {
        transform: translateY(-1px);
    }
`;

const VehicleCardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${theme.spacing.md};
    gap: ${theme.spacing.sm};
`;

const VehicleMainInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    flex: 1;
`;

const VehicleBrand = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${theme.text.primary};
    letter-spacing: -0.02em;
    line-height: 1.2;
`;

const VehicleYear = styled.div`
    font-size: 13px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const VehicleStatus = styled.div<{ $color: string }>`
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border: 1px solid ${props => props.$color}30;
    border-radius: ${theme.radius.md};
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex-shrink: 0;
`;

const VehiclePlateSection = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.md};
`;

const VehiclePlateDisplay = styled.div`
    display: inline-block;
    background: ${theme.text.primary};
    color: white;
    padding: 6px 12px;
    border-radius: ${theme.radius.sm};
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-family: 'Monaco', 'Consolas', monospace;
    box-shadow: ${theme.shadow.sm};
`;

const VehicleColor = styled.div`
    font-size: 12px;
    color: ${theme.text.tertiary};
    font-weight: 500;
    font-style: italic;
`;

const VehicleStatsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.md};
    padding: ${theme.spacing.sm};
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.md};
    border: 1px solid ${theme.borderLight};
`;

const VehicleStat = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
`;

const StatIcon = styled.div<{ $color: string }>`
    width: 28px;
    height: 28px;
    background: ${props => props.$color}15;
    border-radius: ${theme.radius.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 12px;
    flex-shrink: 0;
`;

const StatContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
`;

const StatValue = styled.div`
    font-size: 14px;
    font-weight: 700;
    color: ${theme.text.primary};
    letter-spacing: -0.01em;
    line-height: 1;
`;

const StatLabel = styled.div`
    font-size: 10px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
`;

const LastServiceInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm};
    background: ${theme.primaryGhost};
    border-radius: ${theme.radius.sm};
    border: 1px solid ${theme.primary}10;
    margin-bottom: ${theme.spacing.sm};
`;

const LastServiceIcon = styled.div`
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.primary};
    font-size: 10px;
    flex-shrink: 0;
`;

const LastServiceText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1;
`;

const LastServiceLabel = styled.div`
    font-size: 10px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
`;

const LastServiceDate = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${theme.text.secondary};
    letter-spacing: -0.01em;
`;

const VehicleActionIcon = styled.div`
    position: absolute;
    top: ${theme.spacing.lg};
    right: ${theme.spacing.lg};
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.text.muted};
    font-size: 10px;
    transition: all ${theme.transitions.fast};
    flex-shrink: 0;

    ${VehicleCard}:hover & {
        color: ${theme.primary};
        transform: translateX(3px);
    }
`;

export default ClientVehicles;