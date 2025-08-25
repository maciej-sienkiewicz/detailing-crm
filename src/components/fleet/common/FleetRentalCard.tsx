// src/components/fleet/common/FleetRentalCard.tsx

import React from 'react';
import styled from 'styled-components';
import {useNavigate} from 'react-router-dom';
import {FleetRental} from '../../../types/fleetRental';
import FleetStatusBadge from './FleetStatusBadge';
import {format} from 'date-fns';
import {pl} from 'date-fns/locale';
import {FaCalendarAlt, FaCar, FaUser} from 'react-icons/fa';

interface FleetRentalCardProps {
    rental: FleetRental;
    vehicleName?: string;
    clientName?: string;
}

const FleetRentalCard: React.FC<FleetRentalCardProps> = ({
                                                             rental,
                                                             vehicleName = "Nieznany pojazd",
                                                             clientName = "Nieznany klient"
                                                         }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/fleet/rentals/${rental.id}`);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd MMM yyyy', { locale: pl });
    };

    return (
        <CardContainer onClick={handleClick}>
            <CardHeader>
                <RentalTitle>
                    Wypożyczenie #{rental.id.substring(0, 6)}
                </RentalTitle>
                <FleetStatusBadge status={rental.status} type="rental" />
            </CardHeader>

            <CardContent>
                <InfoGrid>
                    <InfoItem>
                        <Icon><FaCar /></Icon>
                        <InfoText>{vehicleName}</InfoText>
                    </InfoItem>
                    {rental.clientId && (
                        <InfoItem>
                            <Icon><FaUser /></Icon>
                            <InfoText>{clientName}</InfoText>
                        </InfoItem>
                    )}
                    <InfoItem>
                        <Icon><FaCalendarAlt /></Icon>
                        <InfoText>{formatDate(rental.startDate)} - {formatDate(rental.plannedEndDate)}</InfoText>
                    </InfoItem>
                </InfoGrid>

                <MileageInfo>
                    <MileageItem>
                        <MileageLabel>Przebieg początkowy:</MileageLabel>
                        <MileageValue>{rental.startMileage.toLocaleString()} km</MileageValue>
                    </MileageItem>
                    {rental.endMileage && (
                        <MileageItem>
                            <MileageLabel>Przebieg końcowy:</MileageLabel>
                            <MileageValue>{rental.endMileage.toLocaleString()} km</MileageValue>
                        </MileageItem>
                    )}
                </MileageInfo>
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
    margin-bottom: 16px;
    
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

const RentalTitle = styled.h3`
    margin: 0;
    font-size: 16px;
    color: #2c3e50;
`;

const CardContent = styled.div`
    padding: 16px;
`;

const InfoGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
`;

const InfoItem = styled.div`
    display: flex;
    align-items: center;
`;

const Icon = styled.div`
    margin-right: 8px;
    color: #7f8c8d;
    font-size: 14px;
    width: 16px;
`;

const InfoText = styled.span`
    color: #34495e;
    font-size: 14px;
`;

const MileageInfo = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    border-top: 1px dashed #eee;
    padding-top: 12px;
    margin-top: 8px;
`;

const MileageItem = styled.div`
    display: flex;
    align-items: center;
`;

const MileageLabel = styled.span`
    font-size: 12px;
    color: #7f8c8d;
    margin-right: 4px;
`;

const MileageValue = styled.span`
    font-size: 12px;
    font-weight: 500;
    color: #34495e;
`;

export default FleetRentalCard;