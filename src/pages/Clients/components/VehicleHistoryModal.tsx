import React from 'react';
import styled from 'styled-components';
import {
    FaCalendarAlt,
    FaTools,
    FaClipboardList,
    FaMoneyBillWave,
    FaExternalLinkAlt
} from 'react-icons/fa';
import { VehicleExpanded, ServiceHistoryItem } from '../../../types';
import Modal from '../../../components/common/Modal';

interface VehicleHistoryModalProps {
    vehicle: VehicleExpanded;
    onClose: () => void;
}

const VehicleHistoryModal: React.FC<VehicleHistoryModalProps> = ({
                                                                     vehicle,
                                                                     onClose
                                                                 }) => {
    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Historia serwisowa pojazdu"
        >
            <ModalContent>
                <VehicleInfo>
                    <VehicleName>{vehicle.make} {vehicle.model}</VehicleName>
                    <LicensePlateDisplay>{vehicle.licensePlate}</LicensePlateDisplay>
                    <VehicleDetails>
                        <DetailItem>Rok produkcji: {vehicle.year}</DetailItem>
                        {vehicle.color && <DetailItem>Kolor: {vehicle.color}</DetailItem>}
                        {vehicle.vin && <DetailItem>VIN: {vehicle.vin}</DetailItem>}
                    </VehicleDetails>
                </VehicleInfo>

                <SummarySection>
                    <SectionTitle>Podsumowanie serwisowe</SectionTitle>
                    <StatGridContainer>
                        <StatGrid>
                            <StatItem>
                                <StatIcon $color="#3498db">
                                    <FaTools />
                                </StatIcon>
                                <StatValue>{vehicle.totalServices}</StatValue>
                                <StatLabel>Wykonanych usług</StatLabel>
                            </StatItem>

                            <StatItem>
                                <StatIcon $color="#2ecc71">
                                    <FaMoneyBillWave />
                                </StatIcon>
                                <StatValue>{vehicle.totalSpent.toFixed(2)} zł</StatValue>
                                <StatLabel>Suma wydatków</StatLabel>
                            </StatItem>

                            <StatItem>
                                <StatIcon $color="#f39c12">
                                    <FaCalendarAlt />
                                </StatIcon>
                                <StatValue>{vehicle.lastServiceDate ? formatDate(vehicle.lastServiceDate) : 'Brak'}</StatValue>
                                <StatLabel>Ostatnia usługa</StatLabel>
                            </StatItem>
                        </StatGrid>
                    </StatGridContainer>
                </SummarySection>

                <HistorySection>
                    <SectionTitle>Historia usług</SectionTitle>

                    {vehicle.serviceHistory.length === 0 ? (
                        <EmptyHistory>
                            <EmptyIcon><FaClipboardList /></EmptyIcon>
                            <EmptyText>Brak historii serwisowej dla tego pojazdu</EmptyText>
                        </EmptyHistory>
                    ) : (
                        <HistoryTimeline>
                            {/* Sort history items by date (newest first) */}
                            {[...vehicle.serviceHistory]
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((item, index) => (
                                    <TimelineItem key={item.id}>
                                        <TimelineDot />
                                        <TimelineContent>
                                            <TimelineHeader>
                                                <TimelineDate>
                                                    <FaCalendarAlt /> {formatDate(item.date)}
                                                </TimelineDate>
                                                <TimelineServiceType>{item.serviceType}</TimelineServiceType>
                                            </TimelineHeader>

                                            <TimelineDescription>{item.description}</TimelineDescription>

                                            <TimelineFooter>
                                                <TimelinePrice>{item.price.toFixed(2)} zł</TimelinePrice>

                                                {item.protocolId && (
                                                    <TimelineProtocolLink
                                                        href={`/orders/car-reception?id=${item.protocolId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <FaExternalLinkAlt /> Protokół
                                                    </TimelineProtocolLink>
                                                )}
                                            </TimelineFooter>
                                        </TimelineContent>
                                    </TimelineItem>
                                ))}
                        </HistoryTimeline>
                    )}
                </HistorySection>
            </ModalContent>
        </Modal>
    );
};

// Helper function to format dates
const formatDate = (dateString: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

// Styled components
const ModalContent = styled.div`
    padding: 0 16px 16px;
`;

const VehicleInfo = styled.div`
    background-color: #f9f9f9;
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 20px;
`;

const VehicleName = styled.h3`
    margin: 0 0 8px 0;
    font-size: 18px;
    color: #34495e;
`;

const LicensePlateDisplay = styled.div`
    display: inline-block;
    background-color: white;
    border: 2px solid #3498db;
    border-radius: 4px;
    padding: 5px 12px;
    font-weight: 600;
    color: #34495e;
    font-size: 16px;
    margin-bottom: 10px;
`;

const VehicleDetails = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
`;

const DetailItem = styled.div`
    font-size: 14px;
    color: #7f8c8d;
    background-color: white;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #eee;
`;

const SummarySection = styled.div`
    margin-bottom: 20px;
`;

const SectionTitle = styled.h4`
    font-size: 16px;
    color: #3498db;
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
`;

const StatGridContainer = styled.div`
    background-color: #f9f9f9;
    border-radius: 6px;
    padding: 16px;
`;

const StatGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    
    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const StatItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    background-color: white;
    border-radius: 6px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const StatIcon = styled.div<{ $color: string }>`
    color: ${props => props.$color};
    font-size: 24px;
    margin-bottom: 8px;
`;

const StatValue = styled.div`
    font-weight: 600;
    font-size: 18px;
    color: #34495e;
    margin-bottom: 4px;
`;

const StatLabel = styled.div`
    font-size: 12px;
    color: #7f8c8d;
`;

const HistorySection = styled.div`
    margin-bottom: 20px;
`;

const EmptyHistory = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f9f9f9;
    border-radius: 6px;
    padding: 32px 16px;
`;

const EmptyIcon = styled.div`
    font-size: 48px;
    color: #bdc3c7;
    margin-bottom: 16px;
`;

const EmptyText = styled.div`
    font-size: 16px;
    color: #7f8c8d;
`;

const HistoryTimeline = styled.div`
    position: relative;
    padding-left: 20px;
    
    &:before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 8px;
        width: 2px;
        background-color: #eee;
    }
`;

const TimelineItem = styled.div`
    position: relative;
    margin-bottom: 20px;
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const TimelineDot = styled.div`
    position: absolute;
    left: -20px;
    top: 0;
    width: 16px;
    height: 16px;
    background-color: #3498db;
    border-radius: 50%;
    z-index: 2;
`;

const TimelineContent = styled.div`
    background-color: white;
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 16px;
    margin-left: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const TimelineHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    @media (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
`;

const TimelineDate = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #7f8c8d;
`;

const TimelineServiceType = styled.div`
    display: inline-block;
    background-color: #f0f7ff;
    color: #3498db;
    border: 1px solid #d5e9f9;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 13px;
    font-weight: 500;
`;

const TimelineDescription = styled.div`
    font-size: 15px;
    color: #34495e;
    margin-bottom: 12px;
    line-height: 1.5;
`;

const TimelineFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const TimelinePrice = styled.div`
    font-weight: 600;
    font-size: 16px;
    color: #2ecc71;
`;

const TimelineProtocolLink = styled.a`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #3498db;
    text-decoration: none;
    
    &:hover {
        text-decoration: underline;
    }
`;

export default VehicleHistoryModal;