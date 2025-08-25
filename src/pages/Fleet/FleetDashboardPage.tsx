// src/pages/Fleet/FleetDashboardPage.tsx

import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {useNavigate} from 'react-router-dom';
import {FleetVehicle, FleetVehicleStatus} from '../../types/fleet';
import {FleetRental, FleetRentalStatus} from '../../types/fleetRental';
import {fleetVehicleApi} from '../../api/fleetApi';
import {fleetRentalApi} from '../../api/fleetRentalApi';
import FleetVehicleCard from '../../components/fleet/common/FleetVehicleCard';
import FleetRentalCard from '../../components/fleet/common/FleetRentalCard';
import {FaBell, FaCalendarAlt, FaCar, FaExchangeAlt, FaTools} from 'react-icons/fa';
import {addDays, format} from 'date-fns';

const FleetDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
    const [activeRentals, setActiveRentals] = useState<FleetRental[]>([]);
    const [upcomingRentals, setUpcomingRentals] = useState<FleetRental[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Statystyki floty
    const [stats, setStats] = useState({
        totalVehicles: 0,
        availableVehicles: 0,
        rentedVehicles: 0,
        inMaintenanceVehicles: 0,
        activeRentals: 0,
        scheduledRentals: 0
    });

    // Alerty
    const [alerts, setAlerts] = useState<{
        id: string;
        type: 'insurance' | 'inspection' | 'service';
        vehicleId: string;
        vehicleName: string;
        dueDate: string;
        message: string;
    }[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Pobieranie pojazdów
                const vehiclesData = await fleetVehicleApi.fetchVehicles();
                setVehicles(vehiclesData);

                // Obliczanie statystyk pojazdów
                const availableCount = vehiclesData.filter(v => v.status === FleetVehicleStatus.AVAILABLE).length;
                const rentedCount = vehiclesData.filter(v => v.status === FleetVehicleStatus.RENTED).length;
                const maintenanceCount = vehiclesData.filter(v => v.status === FleetVehicleStatus.MAINTENANCE).length;

                // Pobieranie aktywnych wypożyczeń
                const activeRentalsData = await fleetRentalApi.fetchRentals({ status: FleetRentalStatus.ACTIVE });
                setActiveRentals(activeRentalsData);

                // Pobieranie nadchodzących wypożyczeń
                const upcomingRentalsData = await fleetRentalApi.fetchRentals({
                    status: FleetRentalStatus.SCHEDULED,
                    startDateFrom: format(new Date(), 'yyyy-MM-dd'),
                    startDateTo: format(addDays(new Date(), 7), 'yyyy-MM-dd')
                });
                setUpcomingRentals(upcomingRentalsData);

                // Aktualizacja statystyk
                setStats({
                    totalVehicles: vehiclesData.length,
                    availableVehicles: availableCount,
                    rentedVehicles: rentedCount,
                    inMaintenanceVehicles: maintenanceCount,
                    activeRentals: activeRentalsData.length,
                    scheduledRentals: upcomingRentalsData.length
                });

                // Generowanie alertów
                const now = new Date();
                const alertsList = [];

                // Sprawdzanie terminów ubezpieczeń
                for (const vehicle of vehiclesData) {
                    const insuranceDate = new Date(vehicle.insuranceExpiryDate);
                    const inspectionDate = new Date(vehicle.technicalInspectionDate);

                    // Dodawanie alertów dla ubezpieczeń kończących się w ciągu 30 dni
                    if (insuranceDate.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000) {
                        alertsList.push({
                            id: `insurance-${vehicle.id}`,
                            type: 'insurance',
                            vehicleId: vehicle.id,
                            vehicleName: `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
                            dueDate: vehicle.insuranceExpiryDate,
                            message: `Ubezpieczenie kończy się ${format(insuranceDate, 'dd.MM.yyyy')}`
                        });
                    }

                    // Dodawanie alertów dla przeglądów kończących się w ciągu 30 dni
                    if (inspectionDate.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000) {
                        alertsList.push({
                            id: `inspection-${vehicle.id}`,
                            type: 'inspection',
                            vehicleId: vehicle.id,
                            vehicleName: `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
                            dueDate: vehicle.technicalInspectionDate,
                            message: `Przegląd techniczny kończy się ${format(inspectionDate, 'dd.MM.yyyy')}`
                        });
                    }

                    // Dodawanie alertów dla serwisów na podstawie przebiegu
                    if (vehicle.currentMileage >= vehicle.nextServiceMileage - 500) {
                        alertsList.push({
                            id: `service-${vehicle.id}`,
                            type: 'service',
                            vehicleId: vehicle.id,
                            vehicleName: `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
                            dueDate: '', // Brak konkretnej daty
                            message: `Zbliża się przegląd serwisowy (${vehicle.nextServiceMileage} km)`
                        });
                    }
                }

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Wystąpił błąd podczas ładowania danych. Spróbuj odświeżyć stronę.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const goToVehicles = () => {
        navigate('/fleet/vehicles');
    };

    const goToRentals = () => {
        navigate('/fleet/rentals');
    };

    const goToVehicleDetails = (id: string) => {
        navigate(`/fleet/vehicles/${id}`);
    };

    const goToRentalDetails = (id: string) => {
        navigate(`/fleet/rentals/${id}`);
    };

    if (isLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Ładowanie danych floty...</LoadingText>
            </LoadingContainer>
        );
    }

    if (error) {
        return (
            <ErrorContainer>
                <ErrorMessage>{error}</ErrorMessage>
                <RefreshButton onClick={() => window.location.reload()}>
                    Odśwież stronę
                </RefreshButton>
            </ErrorContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <PageTitle>Zarządzanie flotą</PageTitle>
                <HeaderButtons>
                    <ActionButton onClick={() => navigate('/fleet/vehicles/new')}>
                        <FaCar />
                        Dodaj pojazd
                    </ActionButton>
                    <ActionButton onClick={() => navigate('/fleet/rentals/new')}>
                        <FaExchangeAlt />
                        Nowe wypożyczenie
                    </ActionButton>
                </HeaderButtons>
            </PageHeader>

            // Kontynuacja pliku src/pages/Fleet/FleetDashboardPage.tsx

            <DashboardGrid>
                <StatsSection>
                    <SectionTitle>
                        <SectionIcon>
                            <FaCar />
                        </SectionIcon>
                        Statystyki floty
                    </SectionTitle>
                    <StatsGrid>
                        <StatCard>
                            <StatValue>{stats.totalVehicles}</StatValue>
                            <StatLabel>Razem pojazdów</StatLabel>
                        </StatCard>
                        <StatCard highlight color="#2ecc71">
                            <StatValue>{stats.availableVehicles}</StatValue>
                            <StatLabel>Dostępne</StatLabel>
                        </StatCard>
                        <StatCard color="#3498db">
                            <StatValue>{stats.rentedVehicles}</StatValue>
                            <StatLabel>Wypożyczone</StatLabel>
                        </StatCard>
                        <StatCard color="#f39c12">
                            <StatValue>{stats.inMaintenanceVehicles}</StatValue>
                            <StatLabel>W serwisie</StatLabel>
                        </StatCard>
                    </StatsGrid>
                </StatsSection>

                <StatsSection>
                    <SectionTitle>
                        <SectionIcon>
                            <FaExchangeAlt />
                        </SectionIcon>
                        Wypożyczenia
                    </SectionTitle>
                    <StatsGrid>
                        <StatCard color="#3498db">
                            <StatValue>{stats.activeRentals}</StatValue>
                            <StatLabel>Aktywne</StatLabel>
                        </StatCard>
                        <StatCard color="#9b59b6">
                            <StatValue>{stats.scheduledRentals}</StatValue>
                            <StatLabel>Zaplanowane</StatLabel>
                        </StatCard>
                    </StatsGrid>
                </StatsSection>

                {alerts.length > 0 && (
                    <AlertsSection>
                        <SectionTitle>
                            <SectionIcon warning>
                                <FaBell />
                            </SectionIcon>
                            Alerty
                        </SectionTitle>
                        <AlertsList>
                            {alerts.map(alert => (
                                <AlertItem key={alert.id} type={alert.type}>
                                    <AlertIcon>
                                        {alert.type === 'insurance' && <FaCalendarAlt />}
                                        {alert.type === 'inspection' && <FaCalendarAlt />}
                                        {alert.type === 'service' && <FaTools />}
                                    </AlertIcon>
                                    <AlertContent>
                                        <AlertTitle>{alert.vehicleName}</AlertTitle>
                                        <AlertMessage>{alert.message}</AlertMessage>
                                    </AlertContent>
                                    <ViewButton onClick={() => goToVehicleDetails(alert.vehicleId)}>
                                        Szczegóły
                                    </ViewButton>
                                </AlertItem>
                            ))}
                        </AlertsList>
                    </AlertsSection>
                )}

                <ActiveRentalsSection>
                    <SectionHeaderWithAction>
                        <SectionTitle>
                            <SectionIcon>
                                <FaExchangeAlt />
                            </SectionIcon>
                            Aktywne wypożyczenia
                        </SectionTitle>
                        {activeRentals.length > 0 && (
                            <ViewAllButton onClick={goToRentals}>
                                Zobacz wszystkie
                            </ViewAllButton>
                        )}
                    </SectionHeaderWithAction>

                    {activeRentals.length === 0 ? (
                        <EmptyStateMessage>
                            Brak aktywnych wypożyczeń
                        </EmptyStateMessage>
                    ) : (
                        <RentalsGrid>
                            {activeRentals.slice(0, 3).map(rental => {
                                const vehicle = vehicles.find(v => v.id === rental.vehicleId);
                                const vehicleName = vehicle
                                    ? `${vehicle.make} ${vehicle.model}`
                                    : "Nieznany pojazd";

                                return (
                                    <FleetRentalCard
                                        key={rental.id}
                                        rental={rental}
                                        vehicleName={vehicleName}
                                    />
                                );
                            })}
                        </RentalsGrid>
                    )}
                </ActiveRentalsSection>

                <AvailableVehiclesSection>
                    <SectionHeaderWithAction>
                        <SectionTitle>
                            <SectionIcon>
                                <FaCar />
                            </SectionIcon>
                            Dostępne pojazdy
                        </SectionTitle>
                        <ViewAllButton onClick={goToVehicles}>
                            Zobacz wszystkie
                        </ViewAllButton>
                    </SectionHeaderWithAction>

                    {vehicles.filter(v => v.status === FleetVehicleStatus.AVAILABLE).length === 0 ? (
                        <EmptyStateMessage>
                            Brak dostępnych pojazdów
                        </EmptyStateMessage>
                    ) : (
                        <VehiclesGrid>
                            {vehicles
                                .filter(v => v.status === FleetVehicleStatus.AVAILABLE)
                                .slice(0, 4)
                                .map(vehicle => (
                                    <FleetVehicleCard
                                        key={vehicle.id}
                                        vehicle={vehicle}
                                    />
                                ))
                            }
                        </VehiclesGrid>
                    )}
                </AvailableVehiclesSection>
            </DashboardGrid>
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

const PageTitle = styled.h1`
   font-size: 24px;
   color: #2c3e50;
   margin: 0;
`;

const HeaderButtons = styled.div`
   display: flex;
   gap: 12px;
   
   @media (max-width: 768px) {
       width: 100%;
   }
`;

const ActionButton = styled.button`
   display: flex;
   align-items: center;
   padding: 10px 16px;
   background-color: #3498db;
   color: white;
   border: none;
   border-radius: 4px;
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
   
   @media (max-width: 768px) {
       flex: 1;
       justify-content: center;
   }
`;

const DashboardGrid = styled.div`
   display: grid;
   grid-template-columns: repeat(2, 1fr);
   gap: 24px;
   
   @media (max-width: 1024px) {
       grid-template-columns: 1fr;
   }
`;

const Section = styled.div`
   background-color: white;
   border-radius: 8px;
   padding: 20px;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const StatsSection = styled(Section)`
   grid-column: span 1;
`;

const AlertsSection = styled(Section)`
   grid-column: span 2;
   
   @media (max-width: 1024px) {
       grid-column: span 1;
   }
`;

const ActiveRentalsSection = styled(Section)`
   grid-column: span 1;
`;

const AvailableVehiclesSection = styled(Section)`
   grid-column: span 1;
`;

const SectionHeaderWithAction = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
   display: flex;
   align-items: center;
   font-size: 18px;
   color: #2c3e50;
   margin: 0 0 16px 0;
`;

const SectionIcon = styled.div<{ warning?: boolean }>`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 32px;
   height: 32px;
   border-radius: 8px;
   background-color: ${props => props.warning ? '#f39c12' : '#3498db'};
   color: white;
   margin-right: 12px;
`;

const ViewAllButton = styled.button`
   background: none;
   border: none;
   color: #3498db;
   font-size: 14px;
   cursor: pointer;
   display: flex;
   align-items: center;
   
   &:hover {
       text-decoration: underline;
   }
`;

const StatsGrid = styled.div`
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
   gap: 16px;
`;

const StatCard = styled.div<{ highlight?: boolean, color?: string }>`
   padding: 16px;
   border-radius: 8px;
   background-color: ${props => props.highlight
    ? props.color ? `${props.color}10` : '#f8f9fa'
    : 'white'};
   border: 1px solid ${props => props.color ? `${props.color}30` : '#eee'};
   text-align: center;
`;

const StatValue = styled.div`
   font-size: 28px;
   font-weight: 700;
   color: #2c3e50;
   margin-bottom: 4px;
`;

const StatLabel = styled.div`
   font-size: 14px;
   color: #7f8c8d;
`;

const AlertsList = styled.div`
   display: flex;
   flex-direction: column;
   gap: 12px;
`;

const AlertItem = styled.div<{ type: string }>`
   display: flex;
   align-items: center;
   padding: 12px;
   border-radius: 6px;
   background-color: ${props => {
    switch (props.type) {
        case 'insurance':
            return '#f39c1210';
        case 'inspection':
            return '#3498db10';
        case 'service':
            return '#9b59b610';
        default:
            return '#f8f9fa';
    }
}};
   border-left: 4px solid ${props => {
    switch (props.type) {
        case 'insurance':
            return '#f39c12';
        case 'inspection':
            return '#3498db';
        case 'service':
            return '#9b59b6';
        default:
            return '#bdc3c7';
    }
}};
`;

const AlertIcon = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 36px;
   height: 36px;
   border-radius: 50%;
   background-color: white;
   color: #7f8c8d;
   font-size: 16px;
   margin-right: 12px;
   flex-shrink: 0;
`;

const AlertContent = styled.div`
   flex: 1;
`;

const AlertTitle = styled.div`
   font-weight: 500;
   color: #2c3e50;
   margin-bottom: 4px;
`;

const AlertMessage = styled.div`
   font-size: 14px;
   color: #7f8c8d;
`;

const ViewButton = styled.button`
   padding: 6px 12px;
   background-color: white;
   border: 1px solid #ddd;
   border-radius: 4px;
   color: #3498db;
   font-size: 12px;
   cursor: pointer;
   
   &:hover {
       background-color: #f8f9fa;
   }
`;

const RentalsGrid = styled.div`
   display: flex;
   flex-direction: column;
   gap: 16px;
`;

const VehiclesGrid = styled.div`
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
   gap: 16px;
   
   @media (max-width: 567px) {
       grid-template-columns: 1fr;
   }
`;

const EmptyStateMessage = styled.div`
   padding: 24px;
   text-align: center;
   color: #7f8c8d;
   background-color: #f8f9fa;
   border-radius: 8px;
   font-size: 14px;
`;

const LoadingContainer = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   height: 300px;
`;

const LoadingSpinner = styled.div`
   border: 4px solid #f3f3f3;
   border-top: 4px solid #3498db;
   border-radius: 50%;
   width: 40px;
   height: 40px;
   animation: spin 1s linear infinite;
   margin-bottom: 16px;
   
   @keyframes spin {
       0% { transform: rotate(0deg); }
       100% { transform: rotate(360deg); }
   }
`;

const LoadingText = styled.div`
   color: #7f8c8d;
`;

const ErrorContainer = styled.div`
   text-align: center;
   padding: 40px;
`;

const ErrorMessage = styled.div`
   color: #e74c3c;
   margin-bottom: 16px;
`;

const RefreshButton = styled.button`
   padding: 8px 16px;
   background-color: #3498db;
   color: white;
   border: none;
   border-radius: 4px;
   cursor: pointer;
   
   &:hover {
       background-color: #2980b9;
   }
`;

export default FleetDashboardPage;