// src/pages/Fleet/FleetCalendarPage.tsx
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {useNavigate} from 'react-router-dom';
import {FleetVehicle, FleetVehicleStatus} from '../../types/fleet';
import {fleetVehicleApi} from '../../api/fleetApi';
import {fleetRentalApi} from '../../api/fleetRentalApi';
import FleetCalendar from '../../components/fleet/FleetCalendar';
import AvailabilitySearch from '../../components/fleet/calendar/AvailabilitySearch';
import VehicleSidebar from '../../components/fleet/calendar/VehicleSidebar';
import SelectedVehicleInfo from '../../components/fleet/calendar/SelectedVehicleInfo';
import AvailabilityModal from '../../components/fleet/calendar/AvailabilityModal';
import {addDays, format} from 'date-fns';
import {FaArrowLeft, FaCalendarAlt, FaPlus} from 'react-icons/fa';

const FleetCalendarPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);
    const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<FleetVehicle[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Stany filtrów pojazdów
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [showFilters, setShowFilters] = useState<boolean>(false);

    // Stany dla wyszukiwania dostępności
    const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState<string>(format(addDays(new Date(), 3), 'yyyy-MM-dd'));
    const [showAvailabilityPopup, setShowAvailabilityPopup] = useState<boolean>(false);
    const [availableVehicles, setAvailableVehicles] = useState<FleetVehicle[]>([]);
    const [isSearchingAvailability, setIsSearchingAvailability] = useState<boolean>(false);

    // Pobieranie pojazdów
    useEffect(() => {
        const fetchVehicles = async () => {
            setIsLoading(true);
            try {
                const data = await fleetVehicleApi.fetchVehicles();
                setVehicles(data);
                setFilteredVehicles(data);
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    // Filtrowanie pojazdów
    useEffect(() => {
        let result = [...vehicles];

        // Filtrowanie po wyszukiwanej frazie
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(vehicle =>
                vehicle.make.toLowerCase().includes(query) ||
                vehicle.model.toLowerCase().includes(query) ||
                vehicle.licensePlate.toLowerCase().includes(query)
            );
        }

        // Filtrowanie po statusie
        if (statusFilter !== 'all') {
            result = result.filter(vehicle => vehicle.status === statusFilter);
        }

        // Filtrowanie po kategorii
        if (categoryFilter !== 'all') {
            result = result.filter(vehicle => vehicle.category === categoryFilter);
        }

        setFilteredVehicles(result);
    }, [vehicles, searchQuery, statusFilter, categoryFilter]);

    // Obsługa kliknięcia w wypożyczenie
    const handleRentalClick = (rentalId: string) => {
        navigate(`/fleet/rentals/${rentalId}`);
    };

    // Obsługa wyboru daty do utworzenia nowego wypożyczenia
    const handleDateSelect = (start: Date, end: Date, vehicleId?: string) => {
        const startFormatted = format(start, 'yyyy-MM-dd');
        const endFormatted = format(end, 'yyyy-MM-dd');

        if (vehicleId) {
            navigate(`/fleet/rentals/new?vehicleId=${vehicleId}&startDate=${startFormatted}&endDate=${endFormatted}`);
        } else if (selectedVehicleId) {
            navigate(`/fleet/rentals/new?vehicleId=${selectedVehicleId}&startDate=${startFormatted}&endDate=${endFormatted}`);
        } else {
            // Komunikat o konieczności wyboru pojazdu
            alert('Wybierz pojazd przed utworzeniem nowego wypożyczenia');
        }
    };

    // Czyszczenie filtrów
    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setCategoryFilter('all');
    };

    // Sprawdzanie dostępności pojazdów
    const checkAvailability = async () => {
        if (!startDate || !endDate) {
            alert('Wybierz daty wyszukiwania');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            alert('Data końcowa nie może być wcześniejsza niż data początkowa');
            return;
        }

        setIsSearchingAvailability(true);

        try {
            // Pobieramy wszystkie wypożyczenia w tym okresie
            const allRentals = await fleetRentalApi.fetchRentals({
                startDateFrom: startDate,
                startDateTo: endDate,
                endDateFrom: startDate,
                endDateTo: endDate
            });

            // Tworzymy listę ID pojazdów, które są już wypożyczone w tym okresie
            const rentedVehicleIds = allRentals.map(rental => rental.vehicleId);

            // Filtrujemy pojazdy, które są dostępne i nie są wypożyczone w wybranym okresie
            const available = vehicles.filter(vehicle =>
                vehicle.status === FleetVehicleStatus.AVAILABLE &&
                !rentedVehicleIds.includes(vehicle.id)
            );

            setAvailableVehicles(available);
            setShowAvailabilityPopup(true);
        } catch (error) {
            console.error('Error checking vehicle availability:', error);
            alert('Wystąpił błąd podczas sprawdzania dostępności pojazdów');
        } finally {
            setIsSearchingAvailability(false);
        }
    };

    // Wybór pojazdu z listy dostępnych
    const handleSelectAvailableVehicle = (vehicleId: string) => {
        setSelectedVehicleId(vehicleId);
        setShowAvailabilityPopup(false);
    };

    // Utworzenie rezerwacji dla wybranego pojazdu i dat
    const handleCreateReservation = (vehicleId: string) => {
        navigate(`/fleet/rentals/new?vehicleId=${vehicleId}&startDate=${startDate}&endDate=${endDate}`);
        setShowAvailabilityPopup(false);
    };

    return (
        <PageContainer>
            <PageHeader>
                <LeftSection>
                    <BackLink onClick={() => navigate('/fleet')}>
                        <FaArrowLeft />
                        <span>Powrót</span>
                    </BackLink>
                    <PageTitle>
                        <FaCalendarAlt />
                        <span>Kalendarz wypożyczeń</span>
                    </PageTitle>
                </LeftSection>

                <RightSection>
                    <AddRentalButton onClick={() => navigate('/fleet/rentals/new')}>
                        <FaPlus />
                        <span>Nowe wypożyczenie</span>
                    </AddRentalButton>
                </RightSection>
            </PageHeader>

            <AvailabilitySearch
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onCheckAvailability={checkAvailability}
                isSearching={isSearchingAvailability}
            />

            <ContentGrid>
                <Sidebar>
                    <VehicleSidebar
                        vehicles={vehicles}
                        filteredVehicles={filteredVehicles}
                        selectedVehicleId={selectedVehicleId}
                        searchQuery={searchQuery}
                        statusFilter={statusFilter}
                        categoryFilter={categoryFilter}
                        showFilters={showFilters}
                        isLoading={isLoading}
                        onSelectVehicle={setSelectedVehicleId}
                        onSearchChange={setSearchQuery}
                        onStatusFilterChange={setStatusFilter}
                        onCategoryFilterChange={setCategoryFilter}
                        onToggleFilters={() => setShowFilters(!showFilters)}
                        onClearFilters={handleClearFilters}
                    />
                </Sidebar>

                <CalendarWrapper>
                    <FleetCalendar
                        selectedVehicleId={selectedVehicleId}
                        onRentalClick={handleRentalClick}
                        onDateSelect={handleDateSelect}
                    />

                    {selectedVehicleId &&
                        vehicles.find(v => v.id === selectedVehicleId) &&
                        (
                            <SelectedVehicleInfo
                                vehicle={vehicles.find(v => v.id === selectedVehicleId)!}
                            />
                        )
                    }
                </CalendarWrapper>
            </ContentGrid>

            {showAvailabilityPopup && (
                <AvailabilityModal
                    availableVehicles={availableVehicles}
                    startDate={startDate}
                    endDate={endDate}
                    onClose={() => setShowAvailabilityPopup(false)}
                    onSelectVehicle={handleSelectAvailableVehicle}
                    onCreateReservation={handleCreateReservation}
                />
            )}
        </PageContainer>
    );
};

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const RightSection = styled.div`
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const BackLink = styled.a`
  display: flex;
  align-items: center;
  color: #555;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 8px;

  &:hover {
    color: #3498db;
  }
`;

const PageTitle = styled.h1`
  display: flex;
  align-items: center;
  font-size: 28px;
  color: #2c3e50;
  margin: 0;
  gap: 12px;

  svg {
    color: #3498db;
  }

  @media (max-width: 576px) {
    font-size: 24px;
  }
`;

const AddRentalButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(52, 152, 219, 0.2);

  &:hover {
    background-color: #2980b9;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(52, 152, 219, 0.2);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  @media (max-width: 1024px) {
    order: 2;
  }
`;

const CalendarWrapper = styled.div`
  @media (max-width: 1024px) {
    order: 1;
  }
`;

export default FleetCalendarPage;