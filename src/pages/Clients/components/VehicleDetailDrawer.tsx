import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaTimes,
    FaCar,
    FaIdCard,
    FaCalendarAlt,
    FaTools,
    FaMoneyBillWave,
    FaUser,
    FaExternalLinkAlt
} from 'react-icons/fa';
import { VehicleExpanded } from '../../../types';
import { vehicleApi, ServiceHistoryResponse } from '../../../api/vehiclesApi';
import { clientApi } from '../../../api/clientsApi';

interface VehicleDetailDrawerProps {
    isOpen: boolean;
    vehicle: VehicleExpanded | null;
    onClose: () => void;
}

const VehicleDetailDrawer: React.FC<VehicleDetailDrawerProps> = ({
                                                                     isOpen,
                                                                     vehicle,
                                                                     onClose
                                                                 }) => {
    const [owners, setOwners] = useState<{ id: string; name: string }[]>([]);
    const [loadingOwners, setLoadingOwners] = useState(false);
    const [serviceHistory, setServiceHistory] = useState<ServiceHistoryResponse[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pobieranie właścicieli pojazdu
    useEffect(() => {
        const loadOwners = async () => {
            if (vehicle) {
                setLoadingOwners(true);
                try {
                    // Load owner details for each owner ID
                    const ownersData = await Promise.all(
                        vehicle.ownerIds.map(async (ownerId) => {
                            const client = await clientApi.fetchClientById(ownerId);
                            return client ? {
                                id: client.id,
                                name: `${client.firstName} ${client.lastName}`
                            } : null;
                        })
                    );

                    // Filter out null values (if any client failed to load)
                    setOwners(ownersData.filter(owner => owner !== null) as { id: string; name: string }[]);
                } catch (error) {
                    console.error('Error loading vehicle owners:', error);
                    setError('Nie udało się załadować właścicieli pojazdu');
                } finally {
                    setLoadingOwners(false);
                }
            }
        };

        loadOwners();
    }, [vehicle]);

    // Pobieranie historii serwisowej pojazdu
    useEffect(() => {
        const loadServiceHistory = async () => {
            if (vehicle) {
                setLoadingHistory(true);
                try {
                    const history = await vehicleApi.fetchVehicleServiceHistory(vehicle.id);
                    setServiceHistory(history);
                } catch (error) {
                    console.error('Error loading service history:', error);
                    setError('Nie udało się załadować historii serwisowej');
                } finally {
                    setLoadingHistory(false);
                }
            }
        };

        loadServiceHistory();
    }, [vehicle]);

    if (!vehicle) return null;

    return (
        <DrawerContainer isOpen={isOpen}>
            <DrawerHeader>
                <h2>Szczegóły pojazdu</h2>
                <CloseButton onClick={onClose}>
                    <FaTimes />
                </CloseButton>
            </DrawerHeader>

            <DrawerContent>
                <VehicleHeaderSection>
                    <VehicleTitle>{vehicle.make} {vehicle.model}</VehicleTitle>
                    <LicensePlate>{vehicle.licensePlate}</LicensePlate>
                    <VehicleYear>{vehicle.year}</VehicleYear>

                    {vehicle.color && <VehicleColor>Kolor: {vehicle.color}</VehicleColor>}
                </VehicleHeaderSection>

                <SectionTitle>Dane pojazdu</SectionTitle>

                <DetailSection>
                    {vehicle.vin && (
                        <DetailRow>
                            <DetailIcon><FaIdCard /></DetailIcon>
                            <DetailContent>
                                <DetailLabel>VIN</DetailLabel>
                                <DetailValue>{vehicle.vin}</DetailValue>
                            </DetailContent>
                        </DetailRow>
                    )}

                    <DetailRow>
                        <DetailIcon><FaCalendarAlt /></DetailIcon>
                        <DetailContent>
                            <DetailLabel>Rok produkcji</DetailLabel>
                            <DetailValue>{vehicle.year}</DetailValue>
                        </DetailContent>
                    </DetailRow>
                </DetailSection>

                <SectionTitle>Właściciele</SectionTitle>

                {loadingOwners ? (
                    <LoadingText>Ładowanie właścicieli...</LoadingText>
                ) : owners.length === 0 ? (
                    <EmptyMessage>Brak przypisanych właścicieli</EmptyMessage>
                ) : (
                    <OwnersList>
                        {owners.map(owner => (
                            <OwnerItem key={owner.id}>
                                <OwnerIcon><FaUser /></OwnerIcon>
                                <OwnerName>{owner.name}</OwnerName>
                            </OwnerItem>
                        ))}
                    </OwnersList>
                )}

                <SectionTitle>Statystyki serwisowe</SectionTitle>

                <MetricsGrid>
                    <MetricCard>
                        <MetricIcon $color="#3498db"><FaTools /></MetricIcon>
                        <MetricValue>{vehicle.totalServices}</MetricValue>
                        <MetricLabel>Liczba usług</MetricLabel>
                    </MetricCard>

                    <MetricCard>
                        <MetricIcon $color="#2ecc71"><FaMoneyBillWave /></MetricIcon>
                        <MetricValue>{vehicle.totalSpent.toFixed(2)} zł</MetricValue>
                        <MetricLabel>Suma wydatków</MetricLabel>
                    </MetricCard>

                    {vehicle.lastServiceDate && (
                        <MetricCard full>
                            <MetricIcon $color="#f39c12"><FaCalendarAlt /></MetricIcon>
                            <MetricValue>{formatDate(vehicle.lastServiceDate)}</MetricValue>
                            <MetricLabel>Ostatnia usługa</MetricLabel>
                        </MetricCard>
                    )}
                </MetricsGrid>

                <SectionTitle>Historia serwisowa</SectionTitle>

                {loadingHistory ? (
                    <LoadingText>Ładowanie historii serwisowej...</LoadingText>
                ) : serviceHistory.length === 0 ? (
                    <EmptyMessage>Brak historii serwisowej</EmptyMessage>
                ) : (
                    <ServiceHistoryList>
                        {serviceHistory
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date, newest first
                            .map(service => (
                                <ServiceHistoryItem key={service.id}>
                                    <ServiceDate>{formatDate(service.date)}</ServiceDate>
                                    <ServiceType>{service.service_type}</ServiceType>
                                    <ServiceDescription>{service.description}</ServiceDescription>
                                    <ServiceFooter>
                                        <ServicePrice>{service.price.toFixed(2)} zł</ServicePrice>

                                        {service.protocol_id && (
                                            <ProtocolLink
                                                href={`/orders/car-reception?id=${service.protocol_id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <FaExternalLinkAlt /> Protokół
                                            </ProtocolLink>
                                        )}
                                    </ServiceFooter>
                                </ServiceHistoryItem>
                            ))
                        }
                    </ServiceHistoryList>
                )}
            </DrawerContent>
        </DrawerContainer>
    );
};

// Helper functions
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
const DrawerContainer = styled.div<{ isOpen: boolean }>`
    position: fixed;
    top: 0;
    right: 0;
    width: 450px;
    max-width: 90vw;
    height: 100vh;
    background-color: white;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(100%)'};
    transition: transform 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
`;

const DrawerHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;

    h2 {
        margin: 0;
        font-size: 18px;
        color: #2c3e50;
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    color: #7f8c8d;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;

    &:hover {
        color: #34495e;
    }
`;

const DrawerContent = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 20px;
`;

const VehicleHeaderSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;
`;

const VehicleTitle = styled.h2`
    font-size: 20px;
    color: #2c3e50;
    margin: 0 0 8px 0;
    text-align: center;
`;

const LicensePlate = styled.div`
    background-color: #f0f7ff;
    color: #3498db;
    border: 1px solid #d5e9f9;
    border-radius: 4px;
    padding: 6px 12px;
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 8px;
`;

const VehicleYear = styled.div`
    font-size: 15px;
    color: #7f8c8d;
    margin-bottom: 4px;
`;

const VehicleColor = styled.div`
    font-size: 14px;
    color: #7f8c8d;
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    color: #3498db;
    margin: 20px 0 10px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;

    &:first-of-type {
        margin-top: 0;
    }
`;

const DetailSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const DetailRow = styled.div`
    display: flex;
    align-items: flex-start;
`;

const DetailIcon = styled.div`
    width: 20px;
    margin-right: 12px;
    color: #7f8c8d;
    margin-top: 2px;
`;

const DetailContent = styled.div`
    flex: 1;
`;

const DetailLabel = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-bottom: 2px;
`;

const DetailValue = styled.div`
    font-size: 15px;
    color: #34495e;
`;

const LoadingText = styled.div`
    font-size: 14px;
    color: #7f8c8d;
    padding: 12px 0;
    text-align: center;
`;

const EmptyMessage = styled.div`
    font-size: 14px;
    color: #7f8c8d;
    padding: 12px;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 4px;
`;

const OwnersList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const OwnerItem = styled.div`
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: #f9f9f9;
    border-radius: 4px;
`;

const OwnerIcon = styled.div`
    color: #3498db;
    margin-right: 10px;
`;

const OwnerName = styled.div`
    font-size: 14px;
    color: #34495e;
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
`;

const MetricCard = styled.div<{ full?: boolean }>`
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    ${props => props.full && `
    grid-column: 1 / -1;
  `}
`;

const MetricIcon = styled.div<{ $color: string }>`
    color: ${props => props.$color};
    font-size: 20px;
    margin-bottom: 8px;
`;

const MetricValue = styled.div`
    font-weight: 600;
    font-size: 18px;
    color: #34495e;
    margin-bottom: 4px;
`;

const MetricLabel = styled.div`
    font-size: 12px;
    color: #7f8c8d;
`;

const ServiceHistoryList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const ServiceHistoryItem = styled.div`
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 12px;
    border-left: 3px solid #3498db;
`;

const ServiceDate = styled.div`
    font-size: 13px;
    color: #7f8c8d;
    margin-bottom: 4px;
`;

const ServiceType = styled.div`
    font-weight: 500;
    font-size: 15px;
    color: #34495e;
    margin-bottom: 6px;
`;

const ServiceDescription = styled.div`
    font-size: 14px;
    color: #34495e;
    margin-bottom: 10px;
`;

const ServiceFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ServicePrice = styled.div`
    font-weight: 600;
    font-size: 15px;
    color: #2ecc71;
`;

const ProtocolLink = styled.a`
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

export default VehicleDetailDrawer;