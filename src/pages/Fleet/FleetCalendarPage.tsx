// src/pages/Fleet/FleetCalendarPage.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import FleetCalendar from '../../components/fleet/FleetCalendar';
import { fleetVehicleApi } from '../../api/fleetApi';
import { fleetRentalApi } from '../../api/fleetRentalApi';
import { FleetVehicle, FleetVehicleStatus } from '../../types/fleet';
import { format, addDays, isBefore, isAfter, parse, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    FaCalendarAlt,
    FaPlus,
    FaCar,
    FaArrowLeft,
    FaSearch,
    FaExclamationTriangle,
    FaFilter,
    FaTags,
    FaCheck,
    FaGasPump,
    FaTachometerAlt,
    FaCalendarCheck,
    FaMapMarkerAlt,
    FaTimes
} from 'react-icons/fa';
import EnhancedFuelLevelIndicator from '../../components/fleet/common/EnhancedFuelLevelIndicator';

const FleetCalendarPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);
    const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<FleetVehicle[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setcategoryFilter] = useState<string>('all');

    // Nowe stany dla wyszukiwania dostępności
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
        setcategoryFilter('all');
    };

    // Nowa funkcja - Sprawdzanie dostępności pojazdów
    const checkAvailability = async () => {
        if (!startDate || !endDate) {
            alert('Wybierz daty wyszukiwania');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isBefore(end, start)) {
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
    const selectAvailableVehicle = (vehicleId: string) => {
        setSelectedVehicleId(vehicleId);
        setShowAvailabilityPopup(false);
    };

    // Zamknięcie popup
    const closeAvailabilityPopup = () => {
        setShowAvailabilityPopup(false);
    };

    // Utworzenie rezerwacji dla wybranego pojazdu i dat
    const createReservation = (vehicleId: string) => {
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

            {/* Nowy panel szybkiego wyszukiwania dostępności */}
            <AvailabilitySearchPanel>
                <AvailabilitySearchTitle>
                    <FaCalendarCheck />
                    <span>Szybkie wyszukiwanie dostępności</span>
                </AvailabilitySearchTitle>

                <AvailabilityForm>
                    <DateInputGroup>
                        <DateInputLabel>Data rozpoczęcia</DateInputLabel>
                        <DateInput
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={format(new Date(), 'yyyy-MM-dd')}
                        />
                    </DateInputGroup>

                    <DateInputGroup>
                        <DateInputLabel>Data zakończenia</DateInputLabel>
                        <DateInput
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                        />
                    </DateInputGroup>

                    <SearchAvailabilityButton onClick={checkAvailability} disabled={isSearchingAvailability}>
                        {isSearchingAvailability ? (
                            <>
                                <SearchingSpinner />
                                <span>Szukam...</span>
                            </>
                        ) : (
                            <>
                                <FaSearch />
                                <span>Sprawdź dostępność</span>
                            </>
                        )}
                    </SearchAvailabilityButton>
                </AvailabilityForm>
            </AvailabilitySearchPanel>

            <ContentGrid>
                <Sidebar>
                    <SidebarSection>
                        <SectionHeader>
                            <SectionTitle>
                                <FaCar />
                                <span>Pojazdy</span>
                            </SectionTitle>
                            <FiltersToggle onClick={() => setShowFilters(!showFilters)}>
                                <FaFilter />
                                <span>Filtry</span>
                            </FiltersToggle>
                        </SectionHeader>

                        <SearchContainer>
                            <SearchIcon>
                                <FaSearch />
                            </SearchIcon>
                            <SearchInput
                                type="text"
                                placeholder="Szukaj pojazdu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <ClearSearchButton onClick={() => setSearchQuery('')}>×</ClearSearchButton>
                            )}
                        </SearchContainer>

                        {showFilters && (
                            <FiltersContainer>
                                <FilterGroup>
                                    <FilterLabel>Status pojazdu</FilterLabel>
                                    <FilterSelect
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">Wszystkie statusy</option>
                                        <option value={FleetVehicleStatus.AVAILABLE}>Dostępne</option>
                                        <option value={FleetVehicleStatus.RENTED}>Wypożyczone</option>
                                        <option value={FleetVehicleStatus.MAINTENANCE}>W serwisie</option>
                                        <option value={FleetVehicleStatus.UNAVAILABLE}>Niedostępne</option>
                                    </FilterSelect>
                                </FilterGroup>

                                <FilterGroup>
                                    <FilterLabel>Kategoria</FilterLabel>
                                    <FilterSelect
                                        value={categoryFilter}
                                        onChange={(e) => setcategoryFilter(e.target.value)}
                                    >
                                        <option value="all">Wszystkie kategorie</option>
                                        <option value="ECONOMY">Ekonomiczne</option>
                                        <option value="STANDARD">Standardowe</option>
                                        <option value="PREMIUM">Premium</option>
                                        <option value="SUV">SUV</option>
                                        <option value="UTILITY">Użytkowe</option>
                                    </FilterSelect>
                                </FilterGroup>

                                <ClearFiltersButton onClick={handleClearFilters}>
                                    Wyczyść filtry
                                </ClearFiltersButton>
                            </FiltersContainer>
                        )}

                        <ScrollArea>
                            {isLoading ? (
                                <LoadingVehicles>Ładowanie pojazdów...</LoadingVehicles>
                            ) : filteredVehicles.length === 0 ? (
                                <NoVehicles>
                                    <FaExclamationTriangle />
                                    <span>Brak pojazdów spełniających kryteria</span>
                                </NoVehicles>
                            ) : (
                                <VehicleList>
                                    <VehicleItem
                                        active={!selectedVehicleId}
                                        onClick={() => setSelectedVehicleId(undefined)}
                                    >
                                        <AllVehiclesIcon>
                                            <FaTags />
                                        </AllVehiclesIcon>
                                        <VehicleItemContent>
                                            <VehicleName>Wszystkie pojazdy</VehicleName>
                                            <VehicleSubInfo>{vehicles.length} pojazdów w systemie</VehicleSubInfo>
                                        </VehicleItemContent>
                                    </VehicleItem>

                                    {filteredVehicles.map(vehicle => (
                                        <VehicleItem
                                            key={vehicle.id}
                                            active={selectedVehicleId === vehicle.id}
                                            onClick={() => setSelectedVehicleId(vehicle.id)}
                                            status={vehicle.status}
                                        >
                                            <VehicleIcon>
                                                <FaCar />
                                            </VehicleIcon>
                                            <VehicleItemContent>
                                                <VehicleName>{vehicle.make} {vehicle.model}</VehicleName>
                                                <VehicleSubInfo>{vehicle.licensePlate}</VehicleSubInfo>
                                            </VehicleItemContent>
                                            {selectedVehicleId === vehicle.id && (
                                                <SelectedIcon>
                                                    <FaCheck />
                                                </SelectedIcon>
                                            )}
                                        </VehicleItem>
                                    ))}
                                </VehicleList>
                            )}
                        </ScrollArea>
                    </SidebarSection>
                </Sidebar>

                <CalendarWrapper>
                    <FleetCalendar
                        selectedVehicleId={selectedVehicleId}
                        onRentalClick={handleRentalClick}
                        onDateSelect={handleDateSelect}
                    />

                    {selectedVehicleId && (
                        <SelectedVehicleInfo>
                            <SelectedVehicleNote>
                                {vehicles.find(v => v.id === selectedVehicleId)?.status === FleetVehicleStatus.AVAILABLE
                                    ? 'Wybierz datę na kalendarzu, aby utworzyć nowe wypożyczenie dla tego pojazdu'
                                    : 'Ten pojazd jest obecnie niedostępny do wypożyczenia'}
                            </SelectedVehicleNote>
                        </SelectedVehicleInfo>
                    )}
                </CalendarWrapper>
            </ContentGrid>

            {/* Popup z dostępnymi pojazdami */}
            {showAvailabilityPopup && (
                <AvailabilityPopup>
                    <AvailabilityPopupContent>
                        <AvailabilityHeader>
                            <AvailabilityTitle>
                                <FaCalendarCheck />
                                <span>Dostępne pojazdy w wybranym terminie</span>
                            </AvailabilityTitle>
                            <AvailabilityDates>
                                {format(new Date(startDate), 'dd.MM.yyyy')} - {format(new Date(endDate), 'dd.MM.yyyy')}
                            </AvailabilityDates>
                            <ClosePopupButton onClick={closeAvailabilityPopup}>
                                <FaTimes />
                            </ClosePopupButton>
                        </AvailabilityHeader>

                        <AvailabilityBody>
                            {availableVehicles.length === 0 ? (
                                <NoAvailableVehicles>
                                    <FaExclamationTriangle />
                                    <span>Brak dostępnych pojazdów w wybranym terminie</span>
                                </NoAvailableVehicles>
                            ) : (
                                <AvailableVehiclesList>
                                    {availableVehicles.map(vehicle => (
                                        <AvailableVehicleCard key={vehicle.id}>
                                            <AvailableVehicleDetails>
                                                <AvailableVehicleImage>
                                                    <FaCar />
                                                </AvailableVehicleImage>
                                                <AvailableVehicleInfo>
                                                    <AvailableVehicleName>
                                                        {vehicle.make} {vehicle.model}
                                                    </AvailableVehicleName>
                                                    <AvailableVehicleSpecsGrid>
                                                        <AvailableVehicleSpec>
                                                            <FaMapMarkerAlt />
                                                            <span>{vehicle.licensePlate}</span>
                                                        </AvailableVehicleSpec>
                                                        <AvailableVehicleSpec>
                                                            <FaTachometerAlt />
                                                            <span>{vehicle.currentMileage.toLocaleString()} km</span>
                                                        </AvailableVehicleSpec>
                                                        <AvailableVehicleSpec>
                                                            <FaGasPump />
                                                            <span>
                                <EnhancedFuelLevelIndicator
                                    vehicleId={vehicle.id}
                                    size="small"
                                    onlyIcon={true}
                                />
                              </span>
                                                        </AvailableVehicleSpec>
                                                    </AvailableVehicleSpecsGrid>
                                                </AvailableVehicleInfo>
                                            </AvailableVehicleDetails>

                                            <AvailableVehicleActions>
                                                <SelectVehicleButton onClick={() => selectAvailableVehicle(vehicle.id)}>
                                                    <span>Wybierz w kalendarzu</span>
                                                </SelectVehicleButton>
                                                <CreateReservationButton onClick={() => createReservation(vehicle.id)}>
                                                    <FaCalendarCheck />
                                                    <span>Utwórz rezerwację</span>
                                                </CreateReservationButton>
                                            </AvailableVehicleActions>
                                        </AvailableVehicleCard>
                                    ))}
                                </AvailableVehiclesList>
                            )}
                        </AvailabilityBody>
                    </AvailabilityPopupContent>
                </AvailabilityPopup>
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
    border-radius: 6px;
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

const AvailabilitySearchPanel = styled.div`
    background: linear-gradient(135deg, #f5f7fa, #eaedf0);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid #e1e8ed;
`;

const AvailabilitySearchTitle = styled.h2`
    display: flex;
    align-items: center;
    font-size: 18px;
    color: #2c3e50;
    margin: 0 0 16px 0;
    gap: 10px;

    svg {
        color: #3498db;
    }
`;

const AvailabilityForm = styled.div`
    display: flex;
    gap: 16px;
    align-items: flex-end;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 12px;
    }
`;

const DateInputGroup = styled.div`
    flex: 1;
`;

const DateInputLabel = styled.label`
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #555;
    font-weight: 500;
`;

const DateInput = styled.input`
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }
`;

const SearchAvailabilityButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-width: 200px;
    padding: 12px 20px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(52, 152, 219, 0.2);

    &:hover:not(:disabled) {
        background-color: #2980b9;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    @media (max-width: 768px) {
        width: 100%;
    }
`;

const SearchingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
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

const SidebarSection = styled.div`
    background-color: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: 1px solid #eaedf0;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 160px);
    max-height: 800px;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: linear-gradient(135deg, #f9f9f9, #f5f5f5);
    border-bottom: 1px solid #eaedf0;
`;

const SectionTitle = styled.h2`
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;

    svg {
        color: #3498db;
    }
`;

const FiltersToggle = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background-color: transparent;
    border: 1px solid #ddd;
    border-radius: 4px;
    color: #555;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: #3498db;
        color: #3498db;
    }

    svg {
        font-size: 12px;
    }
`;

const SearchContainer = styled.div`
    position: relative;
    padding: 16px;
    border-bottom: 1px solid #eaedf0;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 26px;
    top: 50%;
    transform: translateY(-50%);
    color: #7f8c8d;
    font-size: 14px;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 10px 36px;
    background-color: #f8f9fa;
    border: 1px solid #eaedf0;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #3498db;
        background-color: white;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }
`;

const ClearSearchButton = styled.button`
    position: absolute;
    right: 26px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #7f8c8d;
    cursor: pointer;
    font-size: 20px;
    line-height: 1;

    &:hover {
        color: #e74c3c;
    }
`;

const FiltersContainer = styled.div`
    padding: 16px;
    border-bottom: 1px solid #eaedf0;
    background-color: #f8f9fa;
`;

const FilterGroup = styled.div`
    margin-bottom: 12px;
`;

const FilterLabel = styled.label`
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    color: #555;
    font-weight: 500;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #555;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const ClearFiltersButton = styled.button`
  width: 100%;
  padding: 8px;
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #555;
  font-size: 13px;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #e74c3c;
    border-color: #e74c3c;
  }
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #999;
  }
`;

const VehicleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const VehicleItem = styled.div<{ active: boolean; status?: string }>`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${props => props.active ? '#ebf5fb' : 'white'};
  border: 1px solid ${props => props.active ? '#3498db20' : '#eaedf0'};
  box-shadow: ${props => props.active ? '0 2px 8px rgba(52, 152, 219, 0.1)' : 'none'};
  position: relative;
  
  ${props => props.status && props.status !== 'AVAILABLE' && `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background-color: ${
    props.status === 'RENTED' ? '#3498db' :
        props.status === 'MAINTENANCE' ? '#f39c12' : '#e74c3c'
};
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
    }
  `}
  
  &:hover {
    background-color: ${props => props.active ? '#ebf5fb' : '#f8f9fa'};
  }
  
  transition: all 0.2s ease;
`;

const AllVehiclesIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  font-size: 16px;
`;

const VehicleIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e8f4fc;
  color: #3498db;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  font-size: 16px;
`;

const VehicleItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const VehicleName = styled.div`
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const VehicleSubInfo = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 2px;
`;

const SelectedIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  margin-left: 8px;
`;

const LoadingVehicles = styled.div`
  padding: 20px;
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
`;

const NoVehicles = styled.div`
  padding: 20px;
  text-align: center;
  color: #7f8c8d;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  
  svg {
    color: #f39c12;
    font-size: 24px;
  }
`;

const CalendarWrapper = styled.div`
  @media (max-width: 1024px) {
    order: 1;
  }
`;

const SelectedVehicleInfo = styled.div`
  margin-top: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #eaedf0;
`;

const SelectedVehicleNote = styled.div`
  font-size: 14px;
  color: #3498db;
  font-style: italic;
  text-align: center;
`;

// Style dla popup z dostępnymi pojazdami
const AvailabilityPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const AvailabilityPopupContent = styled.div`
  background-color: white;
  width: 100%;
  max-width: 800px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.15);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
`;

const AvailabilityHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  position: relative;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const AvailabilityTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  flex: 1;
  
  svg {
    font-size: 16px;
  }
`;

const AvailabilityDates = styled.div`
  font-size: 16px;
  font-weight: 500;
  padding: 6px 12px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  
  @media (max-width: 576px) {
    align-self: flex-start;
  }
`;

const ClosePopupButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const AvailabilityBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  max-height: calc(80vh - 80px);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #999;
  }
`;

const NoAvailableVehicles = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #7f8c8d;
  gap: 16px;
  text-align: center;
  
  svg {
    font-size: 48px;
    color: #f39c12;
  }
`;

const AvailableVehiclesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AvailableVehicleCard = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #eaedf0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const AvailableVehicleDetails = styled.div`
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #eee;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
`;

const AvailableVehicleImage = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #e8f4fc, #d6eaf8);
  color: #3498db;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  border-radius: 8px;
  margin-right: 16px;
  flex-shrink: 0;
  
  @media (max-width: 576px) {
    margin-right: 0;
  }
`;

const AvailableVehicleInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const AvailableVehicleName = styled.h4`
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #2c3e50;
`;

const AvailableVehicleSpecsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
`;

const AvailableVehicleSpec = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #7f8c8d;
  gap: 8px;
  
  svg {
    color: #3498db;
    font-size: 14px;
  }
`;

const AvailableVehicleActions = styled.div`
  display: flex;
  padding: 16px;
  gap: 12px;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const SelectVehicleButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  background-color: white;
  color: #3498db;
  border: 1px solid #3498db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f4f9fd;
  }
  
  @media (max-width: 576px) {
    order: 2;
  }
`;

const CreateReservationButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #2980b9;
  }
  
  @media (max-width: 576px) {
    order: 1;
  }
`;

export default FleetCalendarPage;