// src/components/fleet/common/FleetVehicleCard.tsx

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
    FleetVehicle,
    FleetVehicleCategoryLabels,
    FleetVehicleUsageTypeLabels
} from '../../../types/fleet';
import FleetStatusBadge from './FleetStatusBadge';
import { FaCar, FaGasPump, FaRoad, FaCalendarAlt } from 'react-icons/fa';

interface FleetVehicleCardProps {
    vehicle: FleetVehicle;
}

const FleetVehicleCard: React.FC<FleetVehicleCardProps> = ({ vehicle }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/fleet/vehicles/${vehicle.id}`);
    };

    return (
        <CardContainer onClick={handleClick}>
            <CardHeader>
                <VehicleName>
                    {vehicle.make} {vehicle.model}
                </VehicleName>
                <FleetStatusBadge status={vehicle.status} type="vehicle" />
            </CardHeader>

            <CardContent>
                <VehicleInfo>
                    <InfoItem>
                        <Icon><FaCar /></Icon>
                        <InfoText>{vehicle.licensePlate}</InfoText>
                    </InfoItem>
                    <InfoItem>
                        <Icon><FaCalendarAlt /></Icon>
                        <InfoText>{vehicle.year}</InfoText>
                    </InfoItem>
                    <InfoItem>
                        <Icon><FaRoad /></Icon>
                        <InfoText>{vehicle.currentMileage.toLocaleString()} km</InfoText>
                    </InfoItem>
                </VehicleInfo>

                <VehicleCategory>
                    {FleetVehicleCategoryLabels[vehicle.category]} • {FleetVehicleUsageTypeLabels[vehicle.usageType]}
                </VehicleCategory>
            </CardContent>
        </CardContainer>
    );
};

const CardContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #eee;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;
`;

const VehicleName = styled.h3`
    margin: 0;
    font-size: 18px;
    color: #2c3e50;
`;

const CardContent = styled.div`
    padding: 16px;
`;

const VehicleInfo = styled.div`
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
`;

const InfoItem = styled.div`
    display: flex;
    align-items: center;
`;

// Kontynuacja pliku src/components/fleet/common/FleetVehicleCard.tsx

const Icon = styled.div`
   margin-right: 6px;
   color: #7f8c8d;
   font-size: 14px;
`;

const InfoText = styled.span`
   color: #34495e;
   font-size: 14px;
`;

const VehicleCategory = styled.div`
   font-size: 12px;
   color: #7f8c8d;
   text-transform: uppercase;
`;

export default FleetVehicleCard;