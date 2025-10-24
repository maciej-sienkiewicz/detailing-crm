import React, {useState} from 'react';
import styled from 'styled-components';
import {format} from 'date-fns';
import {pl} from 'date-fns/locale';
import {FaCarSide} from 'react-icons/fa';
import {CarReceptionProtocol} from '../../../../types';

interface ProtocolVehicleStatusProps {
    protocol: CarReceptionProtocol;
    onProtocolUpdate: (updatedProtocol: CarReceptionProtocol) => void;
}

const ProtocolVehicleStatus: React.FC<ProtocolVehicleStatusProps> = ({ protocol, onProtocolUpdate }) => {
     const formatDateTime = (dateString: string): string => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: pl });
    };

    return (
        <VehicleStatusContainer>
            <Section>
                <SectionTitle>Informacje o pojeździe</SectionTitle>
                <VehicleInfoCard>
                    <VehicleIconWrapper>
                        <FaCarSide />
                    </VehicleIconWrapper>
                    <VehicleDetailsGrid>
                        <VehicleDetailItem>
                            <DetailLabel>Marka i model</DetailLabel>
                            <DetailValue>{protocol.make} {protocol.model}</DetailValue>
                        </VehicleDetailItem>

                        <VehicleDetailItem>
                            <DetailLabel>Numer rejestracyjny</DetailLabel>
                            <DetailValue>{protocol.licensePlate}</DetailValue>
                        </VehicleDetailItem>

                        <VehicleDetailItem>
                            <DetailLabel>Rok produkcji</DetailLabel>
                            <DetailValue>{protocol.productionYear}</DetailValue>
                        </VehicleDetailItem>

                        <VehicleDetailItem>
                            <DetailLabel>Data przyjęcia</DetailLabel>
                            <DetailValue>{formatDateTime(protocol.startDate)}</DetailValue>
                        </VehicleDetailItem>
                    </VehicleDetailsGrid>
                </VehicleInfoCard>
            </Section>
        </VehicleStatusContainer>
    );
};

const VehicleStatusContainer = styled.div``;

const Section = styled.div`
    margin-bottom: 18px;

    &:last-child {
        margin-bottom: 0;
    }
`;

const SectionTitle = styled.h3`
    font-size: 13px;
    margin: 0 0 12px 0;
    padding-bottom: 6px;
    border-bottom: 1px solid #eee;
    color: #2c3e50;
`;

const VehicleInfoCard = styled.div`
    display: flex;
    background-color: #f9f9f9;
    border-radius: 6px;
    padding: 14px;
`;

const VehicleIconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background-color: #e7f3ff;
    color: #3498db;
    font-size: 28px;
    border-radius: 6px;
    margin-right: 14px;
`;

const VehicleDetailsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    flex: 1;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const VehicleDetailItem = styled.div``;

const DetailLabel = styled.div`
    font-size: 10px;
    color: #7f8c8d;
    margin-bottom: 2px;
`;

const DetailValue = styled.div`
    font-size: 13px;
    color: #34495e;
    font-weight: 500;
`;

export default ProtocolVehicleStatus;