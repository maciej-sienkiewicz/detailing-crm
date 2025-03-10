import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaUser,
    FaBuilding,
    FaIdCard,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaHistory,
    FaCar,
    FaMoneyBillWave,
    FaExternalLinkAlt
} from 'react-icons/fa';
import { CarReceptionProtocol } from '../../../../types';
import { ClientExpanded, VehicleExpanded } from '../../../../types';
import {
    fetchClients,
    fetchVehiclesByOwnerId
} from '../../../../api/mocks/clientMocks';
import { useNavigate } from 'react-router-dom';

interface ProtocolClientInfoProps {
    protocol: CarReceptionProtocol;
}

const ProtocolClientInfo: React.FC<ProtocolClientInfoProps> = ({ protocol }) => {
    const navigate = useNavigate();
    const [client, setClient] = useState<ClientExpanded | null>(null);
    const [vehicles, setVehicles] = useState<VehicleExpanded[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load client data based on protocol's owner name
    useEffect(() => {
        const loadClientData = async () => {
            try {
                setLoading(true);
                // In a real app, you'd search by ID, but we'll search by name in this mock
                const clients = await fetchClients();
                const matchedClient = clients.find(c =>
                    `${c.firstName} ${c.lastName}` === protocol.ownerName
                );

                if (matchedClient) {
                    setClient(matchedClient);

                    // Load client's vehicles
                    const clientVehicles = await fetchVehiclesByOwnerId(matchedClient.id);
                    setVehicles(clientVehicles);
                } else {
                    setError('Nie znaleziono klienta w bazie danych.');
                }
            } catch (err) {
                setError('Wystąpił błąd podczas ładowania danych klienta.');
            } finally {
                setLoading(false);
            }
        };

        loadClientData();
    }, [protocol.ownerName]);

    // Format currency for display
    const formatCurrency = (value: number): string => {
        return value.toFixed(2) + ' zł';
    };

    // Navigate to client details
    const handleGoToClient = () => {
        if (client) {
            navigate(`/clients/owners?id=${client.id}`);
        }
    };

    // Navigate to vehicle details
    const handleGoToVehicle = (vehicleId: string) => {
        navigate(`/clients/vehicles?id=${vehicleId}`);
    };

    if (loading) {
        return <LoadingState>Ładowanie informacji o kliencie...</LoadingState>;
    }

    if (error) {
        return (
            <ErrorState>
                <p>{error}</p>
                <ClientInfoBasic>
                    <InfoItem>
                        <InfoIcon><FaUser /></InfoIcon>
                        <InfoContent>
                            <InfoLabel>Imię i nazwisko</InfoLabel>
                            <InfoValue>{protocol.ownerName}</InfoValue>
                        </InfoContent>
                    </InfoItem>

                    <InfoItem>
                        <InfoIcon><FaPhone /></InfoIcon>
                        <InfoContent>
                            <InfoLabel>Telefon</InfoLabel>
                            <InfoValue>{protocol.phone}</InfoValue>
                        </InfoContent>
                    </InfoItem>

                    <InfoItem>
                        <InfoIcon><FaEnvelope /></InfoIcon>
                        <InfoContent>
                            <InfoLabel>Email</InfoLabel>
                            <InfoValue>{protocol.email}</InfoValue>
                        </InfoContent>
                    </InfoItem>
                </ClientInfoBasic>
            </ErrorState>
        );
    }

    if (!client) {
        return <EmptyState>Brak danych klienta w systemie CRM.</EmptyState>;
    }

    return (
        <ClientInfoContainer>
            <ClientHeader>
                <ClientName>{client.firstName} {client.lastName}</ClientName>
                <ViewClientButton onClick={handleGoToClient}>
                    <FaExternalLinkAlt /> Przejdź do klienta
                </ViewClientButton>
            </ClientHeader>

            <Section>
                <SectionTitle>Dane kontaktowe</SectionTitle>
                <TwoColumnGrid>
                    <InfoItem>
                        <InfoIcon><FaPhone /></InfoIcon>
                        <InfoContent>
                            <InfoLabel>Telefon</InfoLabel>
                            <InfoValue>{client.phone}</InfoValue>
                        </InfoContent>
                    </InfoItem>

                    <InfoItem>
                        <InfoIcon><FaEnvelope /></InfoIcon>
                        <InfoContent>
                            <InfoLabel>Email</InfoLabel>
                            <InfoValue>{client.email}</InfoValue>
                        </InfoContent>
                    </InfoItem>

                    {client.address && (
                        <InfoItem>
                            <InfoIcon><FaMapMarkerAlt /></InfoIcon>
                            <InfoContent>
                                <InfoLabel>Adres</InfoLabel>
                                <InfoValue>{client.address}</InfoValue>
                            </InfoContent>
                        </InfoItem>
                    )}

                    {client.company && (
                        <InfoItem>
                            <InfoIcon><FaBuilding /></InfoIcon>
                            <InfoContent>
                                <InfoLabel>Firma</InfoLabel>
                                <InfoValue>{client.company}</InfoValue>
                            </InfoContent>
                        </InfoItem>
                    )}

                    {client.taxId && (
                        <InfoItem>
                            <InfoIcon><FaIdCard /></InfoIcon>
                            <InfoContent>
                                <InfoLabel>NIP</InfoLabel>
                                <InfoValue>{client.taxId}</InfoValue>
                            </InfoContent>
                        </InfoItem>
                    )}
                </TwoColumnGrid>
            </Section>

            <Section>
                <SectionTitle>Statystyki klienta</SectionTitle>
                <StatsGrid>
                    <StatItem>
                        <StatIcon><FaHistory /></StatIcon>
                        <StatValue>{client.totalVisits}</StatValue>
                        <StatLabel>Liczba wizyt</StatLabel>
                    </StatItem>

                    <StatItem>
                        <StatIcon><FaMoneyBillWave /></StatIcon>
                        <StatValue>{formatCurrency(client.totalRevenue)}</StatValue>
                        <StatLabel>Wartość zamówień</StatLabel>
                    </StatItem>

                    <StatItem>
                        <StatIcon><FaCar /></StatIcon>
                        <StatValue>{client.vehicles.length}</StatValue>
                        <StatLabel>Liczba pojazdów</StatLabel>
                    </StatItem>
                </StatsGrid>
            </Section>

            <Section>
                <SectionTitle>Pojazdy klienta</SectionTitle>
                {vehicles.length === 0 ? (
                    <EmptyState>Klient nie ma jeszcze pojazdów w systemie.</EmptyState>
                ) : (
                    <VehiclesList>
                        {vehicles.map(vehicle => (
                            <VehicleItem
                                key={vehicle.id}
                                onClick={() => handleGoToVehicle(vehicle.id)}
                                highlight={vehicle.licensePlate === protocol.licensePlate}
                            >
                                <VehicleInfo>
                                    <VehicleName>
                                        {vehicle.make} {vehicle.model} ({vehicle.year})
                                    </VehicleName>
                                    <VehiclePlate>{vehicle.licensePlate}</VehiclePlate>
                                </VehicleInfo>
                                <VehicleDetails>
                                    <VehicleDetailItem>
                                        <DetailLabel>Wizyt:</DetailLabel>
                                        <DetailValue>{vehicle.totalServices}</DetailValue>
                                    </VehicleDetailItem>
                                    <VehicleDetailItem>
                                        <DetailLabel>Wydatki:</DetailLabel>
                                        <DetailValue>{formatCurrency(vehicle.totalSpent)}</DetailValue>
                                    </VehicleDetailItem>
                                </VehicleDetails>
                            </VehicleItem>
                        ))}
                    </VehiclesList>
                )}
            </Section>

            {client.notes && (
                <Section>
                    <SectionTitle>Notatki o kliencie</SectionTitle>
                    <NotesContent>{client.notes}</NotesContent>
                </Section>
            )}
        </ClientInfoContainer>
    );
};

// Styled components
const ClientInfoContainer = styled.div``;

const LoadingState = styled.div`
    padding: 30px;
    text-align: center;
    color: #7f8c8d;
`;

const ErrorState = styled.div`
    p {
        color: #e74c3c;
        padding: 10px 15px;
        background-color: #fdecea;
        border-radius: 4px;
        margin-bottom: 20px;
    }
`;

const ClientInfoBasic = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 4px;
`;

const EmptyState = styled.div`
    padding: 20px;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 4px;
    color: #7f8c8d;
    font-size: 14px;
`;

const ClientHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const ClientName = styled.h2`
    font-size: 20px;
    margin: 0;
    color: #2c3e50;
`;

const ViewClientButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #f0f7ff;
    color: #3498db;
    border: 1px solid #d5e9f9;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
    
    &:hover {
        background-color: #d5e9f9;
    }
`;

const Section = styled.div`
    margin-bottom: 25px;
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    margin: 0 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
    color: #2c3e50;
`;

const TwoColumnGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const InfoItem = styled.div`
    display: flex;
    align-items: flex-start;
`;

const InfoIcon = styled.div`
    width: 20px;
    margin-right: 10px;
    color: #7f8c8d;
    padding-top: 2px;
`;

const InfoContent = styled.div`
    flex: 1;
`;

const InfoLabel = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-bottom: 2px;
`;

const InfoValue = styled.div`
    font-size: 14px;
    color: #34495e;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const StatItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f9f9f9;
    padding: 20px 15px;
    border-radius: 4px;
`;

const StatIcon = styled.div`
    color: #3498db;
    font-size: 20px;
    margin-bottom: 8px;
`;

const StatValue = styled.div`
    font-weight: 600;
    font-size: 18px;
    color: #2c3e50;
    margin-bottom: 5px;
`;

const StatLabel = styled.div`
    font-size: 13px;
    color: #7f8c8d;
`;

const VehiclesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const VehicleItem = styled.div<{ highlight?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: ${props => props.highlight ? '#f0f7ff' : '#f9f9f9'};
    border-left: 3px solid ${props => props.highlight ? '#3498db' : 'transparent'};
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
        background-color: ${props => props.highlight ? '#e7f3ff' : '#f0f0f0'};
    }
`;

const VehicleInfo = styled.div``;

const VehicleName = styled.div`
    font-weight: 500;
    font-size: 14px;
    color: #34495e;
    margin-bottom: 2px;
`;

const VehiclePlate = styled.div`
    font-size: 13px;
    color: #7f8c8d;
`;

const VehicleDetails = styled.div`
    display: flex;
    gap: 15px;
`;

const VehicleDetailItem = styled.div`
    display: flex;
    align-items: center;
`;

const DetailLabel = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-right: 5px;
`;

const DetailValue = styled.div`
    font-size: 13px;
    color: #34495e;
    font-weight: 500;
`;

const NotesContent = styled.div`
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 15px;
    font-size: 14px;
    color: #34495e;
    white-space: pre-line;
`;

export default ProtocolClientInfo;