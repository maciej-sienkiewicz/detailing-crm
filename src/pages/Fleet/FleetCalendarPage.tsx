// src/pages/Fleet/FleetCalendarPage.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import FleetCalendar from '../../components/fleet/FleetCalendar';
import { fleetVehicleApi } from '../../api/fleetApi';
import { FleetVehicle, FleetVehicleStatus } from '../../types/fleet';
import { FaCalendarAlt, FaPlus, FaCar, FaArrowLeft } from 'react-icons/fa';

const FleetCalendarPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);
    const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Pobieranie pojazdów
    React.useEffect(() => {
        const fetchVehicles = async () => {
            setIsLoading(true);
            try {
                const data = await fleetVehicleApi.fetchVehicles();
                setVehicles(data);
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    // Obsługa kliknięcia w wypożyczenie
    const handleRentalClick = (rentalId: string) => {
        navigate(`/fleet/rentals/${rentalId}`);
    };

    // Obsługa wyboru daty do utworzenia nowego wypożyczenia
    const handleDateSelect = (start: Date, end: Date, vehicleId?: string) => {
        if (vehicleId) {
            navigate(`/fleet/rentals/new?vehicleId=${vehicleId}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`);
        } else {
            // Jeśli nie wybrano pojazdu, pokażemy komunikat
            alert('Wybierz pojazd przed utworzeniem nowego wypożyczenia');
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <BackLink onClick={() => navigate('/fleet')}>
                    <FaArrowLeft /> Wróć do panelu floty
                </BackLink>
                <PageTitle>
                    <FaCalendarAlt />
                    Kalendarz wypożyczeń flotowych
                </PageTitle>
            </PageHeader>

            <ContentGrid>
                <Sidebar>
                    <SidebarSection>
                        <SectionTitle>Pojazdy</SectionTitle>
                        <VehicleList>
                            <VehicleItem
                                active={!selectedVehicleId}
                                onClick={() => setSelectedVehicleId(undefined)}
                            >
                                Wszystkie pojazdy
                            </VehicleItem>

                            {vehicles
                                .filter(v => v.status === FleetVehicleStatus.AVAILABLE || v.status === FleetVehicleStatus.RENTED)
                                .map(vehicle => (
                                    <VehicleItem
                                        key={vehicle.id}
                                        active={selectedVehicleId === vehicle.id}
                                        onClick={() => setSelectedVehicleId(vehicle.id)}
                                    >
                                        <VehicleIcon>
                                            <FaCar />
                                        </VehicleIcon>
                                        <VehicleInfo>
                                            <VehicleName>{vehicle.make} {vehicle.model}</VehicleName>
                                            <VehiclePlate>{vehicle.licensePlate}</VehiclePlate>
                                        </VehicleInfo>
                                    </VehicleItem>
                                ))
                            }
                        </VehicleList>
                    </SidebarSection>

                    <AddButton onClick={() => navigate('/fleet/rentals/new')}>
                        <FaPlus />
                        Nowe wypożyczenie
                    </AddButton>
                </Sidebar>

                <CalendarWrapper>
                    <FleetCalendar
                        selectedVehicleId={selectedVehicleId}
                        onRentalClick={handleRentalClick}
                        onDateSelect={handleDateSelect}
                    />
                </CalendarWrapper>
            </ContentGrid>
        </PageContainer>
    );
};

const PageContainer = styled.div`
  padding: 24px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const BackLink = styled.a`
  display: flex;
  align-items: center;
  color: #3498db;
  font-size: 14px;
  cursor: pointer;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    text-decoration: underline;
  }
`;

const PageTitle = styled.h1`
  display: flex;
  align-items: center;
  font-size: 24px;
  color: #2c3e50;
  margin: 0;
  
  svg {
    margin-right: 12px;
    color: #3498db;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SidebarSection = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  color: #2c3e50;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
`;

const VehicleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
`;

const VehicleItem = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.active ? '#ebf5fb' : 'transparent'};
  border-left: 3px solid ${props => props.active ? '#3498db' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.active ? '#ebf5fb' : '#f8f9fa'};
  }
`;

const VehicleIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const VehicleInfo = styled.div`
  flex: 1;
`;

const VehicleName = styled.div`
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
`;

const VehiclePlate = styled.div`
  font-size: 12px;
  color: #7f8c8d;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: #2980b9;
  }
`;

const CalendarWrapper = styled.div`
  min-height: 600px;
`;

export default FleetCalendarPage;