// src/pages/Clients/components/ClientDetailPage/ClientVehicles.tsx
import React from 'react';
import styled from 'styled-components';
import { FaCar, FaArrowRight } from 'react-icons/fa';
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
            maximumFractionDigits: 0
        }).format(amount);
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
                    >
                        <VehicleCardHeader>
                            <VehicleInfo>
                                <VehicleBrand>
                                    {vehicle.make} {vehicle.model}
                                    {vehicle.year && ` (${vehicle.year})`}
                                </VehicleBrand>
                                <VehiclePlateDisplay>
                                    {vehicle.licensePlate}
                                </VehiclePlateDisplay>
                            </VehicleInfo>
                        </VehicleCardHeader>

                        <VehicleStats>
                            <VehicleStat>
                                <StatLabel>Wizyt</StatLabel>
                                <StatValue>{vehicle.totalServices}</StatValue>
                            </VehicleStat>
                            <VehicleStat>
                                <StatLabel>Wydano</StatLabel>
                                <StatValue>{formatCurrency(vehicle.totalSpent)}</StatValue>
                            </VehicleStat>
                        </VehicleStats>

                        <VehicleActionIcon>
                            <FaArrowRight />
                        </VehicleActionIcon>
                    </VehicleCard>
                ))}
            </VehiclesList>
        </SidebarSection>
    );
};

const VehiclesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const VehicleCard = styled.div`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.borderLight};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    cursor: pointer;
    transition: all ${theme.transitions.fast};
    position: relative;

    &:hover {
        border-color: ${theme.borderHover};
        box-shadow: ${theme.shadow.md};
        transform: translateX(2px);
    }

    &:active {
        transform: translateX(1px);
    }
`;

const VehicleCardHeader = styled.div`
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

const VehicleStats = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing.sm};
`;

const VehicleStat = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
`;

const StatLabel = styled.div`
    font-size: 10px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
`;

const StatValue = styled.div`
    font-size: 12px;
    font-weight: 700;
    color: ${theme.text.primary};
    letter-spacing: -0.01em;
`;

const VehicleActionIcon = styled.div`
    position: absolute;
    top: ${theme.spacing.lg};
    right: ${theme.spacing.lg};
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.text.muted};
    font-size: 8px;
    transition: all ${theme.transitions.fast};
    flex-shrink: 0;

    ${VehicleCard}:hover & {
        color: ${theme.text.secondary};
        transform: translateX(2px);
    }
`;

export default ClientVehicles;