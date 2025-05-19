// src/pages/Fleet/FleetRentalsPage.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
    FleetRental,
    FleetRentalStatus,
    FleetRentalStatusLabels,
    FleetRentalStatusColors
} from '../../types/fleetRental';
import { fleetRentalApi } from '../../api/fleetRentalApi';
import { fleetVehicleApi } from '../../api/fleetApi';
import { clientApi } from '../../api/clientsApi';
import FleetStatusBadge from '../../components/fleet/common/FleetStatusBadge';
import { useToast } from '../../components/common/Toast/Toast';
import { format, isAfter, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    FaExchangeAlt,
    FaPlus,
    FaSearch,
    FaFilter,
    FaTimes,
    FaCalendarAlt,
    FaCar,
    FaUser,
    FaArrowRight,
    FaChevronDown,
    FaChevronUp,
    FaMobileAlt
} from 'react-icons/fa';

const FleetRentalsPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [rentals, setRentals] = useState<FleetRental[]>([]);
    const [filteredRentals, setFilteredRentals] = useState<FleetRental[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Dane pomocnicze do wyświetlania
    const [vehicles, setVehicles] = useState<Record<string, any>>({});
    const [clients, setClients] = useState<Record<string, any>>({});

    // Stany filtrów
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<FleetRentalStatus | ''>('');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
    const [customDateFrom, setCustomDateFrom] = useState<string>('');
    const [customDateTo, setCustomDateTo] = useState<string>('');
    const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);
    const [sortField, setSortField] = useState<string>('startDate');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Pobieranie wypożyczeń i danych pomocniczych
    useEffect(() => {
        const fetchRentalsData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Pobieranie wypożyczeń
                const rentalsData = await fleetRentalApi.fetchRentals();
                setRentals(rentalsData);

                // Pobieranie danych pojazdów
                const vehiclesData = await fleetVehicleApi.fetchVehicles();
                const vehiclesMap: Record<string, any> = {};
                vehiclesData.forEach(vehicle => {
                    vehiclesMap[vehicle.id] = {
                        name: `${vehicle.make} ${vehicle.model}`,
                        licensePlate: vehicle.licensePlate
                    };
                });
                setVehicles(vehiclesMap);

                // Pobieranie danych klientów
                const clientsData = await clientApi.fetchClients();
                const clientsMap: Record<string, any> = {};
                clientsData.forEach(client => {
                    clientsMap[client.id] = {
                        name: `${client.firstName} ${client.lastName}`,
                        company: client.company
                    };
                });
                setClients(clientsMap);
            } catch (err) {
                console.error('Error fetching rentals data:', err);
                setError('Wystąpił błąd podczas ładowania danych. Spróbuj odświeżyć stronę.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRentalsData();
    }, []);

    // Filtrowanie i sortowanie wypożyczeń
    useEffect(() => {
        let result = [...rentals];

        // Filtrowanie po wyszukiwanej frazie
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(rental => {
                const vehicleName = vehicles[rental.vehicleId]?.name.toLowerCase() || '';
                const vehiclePlate = vehicles[rental.vehicleId]?.licensePlate.toLowerCase() || '';
                const clientName = clients[rental.clientId || '']?.name.toLowerCase() || '';

                return vehicleName.includes(query) ||
                    vehiclePlate.includes(query) ||
                    clientName.includes(query);
            });
        }

        // Filtrowanie po statusie
        if (statusFilter) {
            result = result.filter(rental => rental.status === statusFilter);
        }

        // Filtrowanie po dacie
// Kontynuacja pliku src/pages/Fleet/FleetRentalsPage.tsx

        // Filtrowanie po dacie
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        if (dateFilter === 'today') {
            result = result.filter(rental => {
                const startDate = parseISO(rental.startDate);
                const endDate = rental.actualEndDate ? parseISO(rental.actualEndDate) :
                    rental.plannedEndDate ? parseISO(rental.plannedEndDate) : null;

                // Wypożyczenie rozpoczyna się dzisiaj lub trwa dzisiaj
                return (startDate >= today && startDate < new Date(today.getTime() + 86400000)) ||
                    (startDate <= today && (!endDate || endDate >= today));
            });
        } else if (dateFilter === 'week') {
            result = result.filter(rental => {
                const startDate = parseISO(rental.startDate);
                const endDate = rental.actualEndDate ? parseISO(rental.actualEndDate) :
                    rental.plannedEndDate ? parseISO(rental.plannedEndDate) : null;

                // Wypożyczenie rozpoczyna się w tym tygodniu lub trwa w tym tygodniu
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 7);

                return (startDate >= weekStart && startDate < weekEnd) ||
                    (startDate <= weekEnd && (!endDate || endDate >= weekStart));
            });
        } else if (dateFilter === 'month') {
            result = result.filter(rental => {
                const startDate = parseISO(rental.startDate);
                const endDate = rental.actualEndDate ? parseISO(rental.actualEndDate) :
                    rental.plannedEndDate ? parseISO(rental.plannedEndDate) : null;

                // Wypożyczenie rozpoczyna się w tym miesiącu lub trwa w tym miesiącu
                const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

                return (startDate >= monthStart && startDate <= monthEnd) ||
                    (startDate <= monthEnd && (!endDate || endDate >= monthStart));
            });
        } else if (dateFilter === 'custom' && customDateFrom && customDateTo) {
            const fromDate = parseISO(customDateFrom);
            const toDate = parseISO(customDateTo);
            toDate.setHours(23, 59, 59, 999); // Koniec dnia

            result = result.filter(rental => {
                const startDate = parseISO(rental.startDate);
                const endDate = rental.actualEndDate ? parseISO(rental.actualEndDate) :
                    rental.plannedEndDate ? parseISO(rental.plannedEndDate) : null;

                // Wypożyczenie zachodzi na wybrany zakres dat
                return (startDate >= fromDate && startDate <= toDate) ||
                    (startDate <= toDate && (!endDate || endDate >= fromDate));
            });
        }

        // Sortowanie
        result.sort((a, b) => {
            let valueA, valueB;

            if (sortField === 'startDate') {
                valueA = new Date(a.startDate).getTime();
                valueB = new Date(b.startDate).getTime();
            } else if (sortField === 'endDate') {
                valueA = a.actualEndDate ? new Date(a.actualEndDate).getTime() :
                    new Date(a.plannedEndDate).getTime();
                valueB = b.actualEndDate ? new Date(b.actualEndDate).getTime() :
                    new Date(b.plannedEndDate).getTime();
            } else if (sortField === 'status') {
                valueA = a.status;
                valueB = b.status;
            } else {
                valueA = a[sortField as keyof FleetRental];
                valueB = b[sortField as keyof FleetRental];
            }

            if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredRentals(result);
    }, [rentals, searchQuery, statusFilter, dateFilter, customDateFrom, customDateTo, sortField, sortOrder, vehicles, clients]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSortChange = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setDateFilter('all');
        setCustomDateFrom('');
        setCustomDateTo('');
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd MMM yyyy', { locale: pl });
    };

    const getStatusClass = (status: FleetRentalStatus) => {
        return {
            [FleetRentalStatus.SCHEDULED]: 'scheduled',
            [FleetRentalStatus.ACTIVE]: 'active',
            [FleetRentalStatus.COMPLETED]: 'completed',
            [FleetRentalStatus.CANCELLED]: 'cancelled'
        }[status];
    };

    const getVehicleName = (vehicleId: string) => {
        return vehicles[vehicleId]?.name || 'Nieznany pojazd';
    };

    const getVehiclePlate = (vehicleId: string) => {
        return vehicles[vehicleId]?.licensePlate || '';
    };

    const getClientName = (clientId?: string) => {
        if (!clientId) return 'Pracownik';
        return clients[clientId]?.name || 'Nieznany klient';
    };

    const handleViewRental = (id: string) => {
        navigate(`/fleet/rentals/${id}`);
    };

    const handleMobileReturn = (id: string) => {
        navigate(`/fleet/mobile/rental/${id}/return`);
    };

    const checkIsOverdue = (rental: FleetRental): boolean => {
        if (rental.status !== FleetRentalStatus.ACTIVE) return false;

        const now = new Date();
        const plannedEndDate = new Date(rental.plannedEndDate);

        return isAfter(now, plannedEndDate);
    };

    const addNewRental = () => {
        navigate('/fleet/rentals/new');
    };

    if (isLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Ładowanie wypożyczeń...</LoadingText>
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
                <PageTitle>
                    <FaExchangeAlt />
                    Wypożyczenia
                </PageTitle>
                <AddRentalButton onClick={addNewRental}>
                    <FaPlus />
                    Nowe wypożyczenie
                </AddRentalButton>
            </PageHeader>

            <FiltersContainer>
                <SearchContainer>
                    <SearchIcon>
                        <FaSearch />
                    </SearchIcon>
                    <SearchInput
                        type="text"
                        placeholder="Szukaj wypożyczeń..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    {searchQuery && (
                        <ClearSearchButton onClick={() => setSearchQuery('')}>
                            <FaTimes />
                        </ClearSearchButton>
                    )}
                </SearchContainer>

                <FilterToggleButton
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    active={isFilterExpanded}
                >
                    <FaFilter />
                    Filtry
                </FilterToggleButton>
            </FiltersContainer>

            {isFilterExpanded && (
                <ExpandedFilters>
                    <FilterGroup>
                        <FilterLabel>Status</FilterLabel>
                        <SelectFilter
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as FleetRentalStatus | '')}
                        >
                            <option value="">Wszystkie statusy</option>
                            {Object.entries(FleetRentalStatusLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </SelectFilter>
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel>Zakres dat</FilterLabel>
                        <RadioGroup>
                            <RadioItem>
                                <Radio
                                    type="radio"
                                    name="dateFilter"
                                    checked={dateFilter === 'all'}
                                    onChange={() => setDateFilter('all')}
                                />
                                <RadioLabel>Wszystkie</RadioLabel>
                            </RadioItem>
                            <RadioItem>
                                <Radio
                                    type="radio"
                                    name="dateFilter"
                                    checked={dateFilter === 'today'}
                                    onChange={() => setDateFilter('today')}
                                />
                                <RadioLabel>Dzisiaj</RadioLabel>
                            </RadioItem>
                            <RadioItem>
                                <Radio
                                    type="radio"
                                    name="dateFilter"
                                    checked={dateFilter === 'week'}
                                    onChange={() => setDateFilter('week')}
                                />
                                <RadioLabel>Ten tydzień</RadioLabel>
                            </RadioItem>
                            <RadioItem>
                                <Radio
                                    type="radio"
                                    name="dateFilter"
                                    checked={dateFilter === 'month'}
                                    onChange={() => setDateFilter('month')}
                                />
                                <RadioLabel>Ten miesiąc</RadioLabel>
                            </RadioItem>
                            <RadioItem>
                                <Radio
                                    type="radio"
                                    name="dateFilter"
                                    checked={dateFilter === 'custom'}
                                    onChange={() => setDateFilter('custom')}
                                />
                                <RadioLabel>Niestandardowy</RadioLabel>
                            </RadioItem>
                        </RadioGroup>

                        {dateFilter === 'custom' && (
                            <DateRangeContainer>
                                <DateInput
                                    type="date"
                                    value={customDateFrom}
                                    onChange={(e) => setCustomDateFrom(e.target.value)}
                                    placeholder="Od"
                                />
                                <DateRangeSeparator>do</DateRangeSeparator>
                                <DateInput
                                    type="date"
                                    value={customDateTo}
                                    onChange={(e) => setCustomDateTo(e.target.value)}
                                    placeholder="Do"
                                />
                            </DateRangeContainer>
                        )}
                    </FilterGroup>

                    <ClearFiltersButton onClick={clearFilters}>
                        Wyczyść filtry
                    </ClearFiltersButton>
                </ExpandedFilters>
            )}

            <ResultCount>
                Znaleziono {filteredRentals.length} {filteredRentals.length === 1 ? 'wypożyczenie' :
                filteredRentals.length > 1 && filteredRentals.length < 5 ? 'wypożyczenia' : 'wypożyczeń'}
            </ResultCount>

            {filteredRentals.length === 0 ? (
                <EmptyState>
                    <EmptyStateIcon>
                        <FaExchangeAlt />
                    </EmptyStateIcon>
                    <EmptyStateText>
                        {rentals.length === 0
                            ? 'Nie masz jeszcze żadnych wypożyczeń w systemie.'
                            : 'Nie znaleziono wypożyczeń spełniających kryteria wyszukiwania.'}
                    </EmptyStateText>
                    {rentals.length === 0 && (
                        <EmptyStateButton onClick={addNewRental}>
                            Dodaj pierwsze wypożyczenie
                        </EmptyStateButton>
                    )}
                </EmptyState>
            ) : (
                <TableWrapper>
                    <RentalsTable>
                        <TableHead>
                            <TableRow>
                                <TableHeader onClick={() => handleSortChange('startDate')}>
                                    <SortableHeader>
                                        <FaCalendarAlt />
                                        Data rozpoczęcia
                                        {sortField === 'startDate' && (
                                            <SortIcon>
                                                {sortOrder === 'asc' ? <FaChevronUp /> : <FaChevronDown />}
                                            </SortIcon>
                                        )}
                                    </SortableHeader>
                                </TableHeader>
                                <TableHeader onClick={() => handleSortChange('endDate')}>
                                    <SortableHeader>
                                        <FaCalendarAlt />
                                        Data zakończenia
                                        {sortField === 'endDate' && (
                                            <SortIcon>
                                                {sortOrder === 'asc' ? <FaChevronUp /> : <FaChevronDown />}
                                            </SortIcon>
                                        )}
                                    </SortableHeader>
                                </TableHeader>
                                <TableHeader>
                                    <TableHeaderContent>
                                        <FaCar />
                                        Pojazd
                                    </TableHeaderContent>
                                </TableHeader>
                                <TableHeader>
                                    <TableHeaderContent>
                                        <FaUser />
                                        Klient
                                    </TableHeaderContent>
                                </TableHeader>
                                <TableHeader onClick={() => handleSortChange('status')}>
                                    <SortableHeader>
                                        Status
                                        {sortField === 'status' && (
                                            <SortIcon>
                                                {sortOrder === 'asc' ? <FaChevronUp /> : <FaChevronDown />}
                                            </SortIcon>
                                        )}
                                    </SortableHeader>
                                </TableHeader>
                                <TableHeader>Akcje</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRentals.map(rental => (
                                <TableRow
                                    key={rental.id}
                                    className={`${getStatusClass(rental.status)} ${checkIsOverdue(rental) ? 'overdue' : ''}`}
                                >
                                    <TableCell>{formatDate(rental.startDate)}</TableCell>
                                    <TableCell>
                                        {rental.actualEndDate ? formatDate(rental.actualEndDate) :
                                            rental.plannedEndDate ? formatDate(rental.plannedEndDate) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <CellWithDetails>
                                            <div>{getVehicleName(rental.vehicleId)}</div>
                                            <CellDetails>{getVehiclePlate(rental.vehicleId)}</CellDetails>
                                        </CellWithDetails>
                                    </TableCell>
                                    <TableCell>{getClientName(rental.clientId)}</TableCell>
                                    <TableCell>
                                        <FleetStatusBadge status={rental.status} type="rental" />
                                        {checkIsOverdue(rental) && (
                                            <OverdueTag>Opóźnione</OverdueTag>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <ActionButtons>
                                            <ActionButton onClick={() => handleViewRental(rental.id)}>
                                                <FaArrowRight />
                                            </ActionButton>
                                            {rental.status === FleetRentalStatus.ACTIVE && (
                                                <MobileReturnButton onClick={() => handleMobileReturn(rental.id)}>
                                                    <FaMobileAlt />
                                                </MobileReturnButton>
                                            )}
                                        </ActionButtons>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </RentalsTable>
                </TableWrapper>
            )}
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

const AddRentalButton = styled.button`
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
       width: 100%;
       justify-content: center;
   }
`;

const FiltersContainer = styled.div`
   display: flex;
   gap: 16px;
   margin-bottom: 20px;
   
   @media (max-width: 768px) {
       flex-direction: column;
   }
`;

const SearchContainer = styled.div`
   position: relative;
   flex: 1;
`;

const SearchIcon = styled.div`
   position: absolute;
   left: 12px;
   top: 50%;
   transform: translateY(-50%);
   color: #7f8c8d;
`;

const SearchInput = styled.input`
   width: 100%;
   padding: 10px 12px 10px 36px;
   border: 1px solid #ddd;
   border-radius: 4px;
   font-size: 14px;
   
   &:focus {
       outline: none;
       border-color: #3498db;
   }
`;

const ClearSearchButton = styled.button`
   position: absolute;
   right: 12px;
   top: 50%;
   transform: translateY(-50%);
   background: none;
   border: none;
   color: #7f8c8d;
   cursor: pointer;
   display: flex;
   align-items: center;
   justify-content: center;
   
   &:hover {
       color: #e74c3c;
   }
`;

const FilterToggleButton = styled.button<{ active: boolean }>`
   display: flex;
   align-items: center;
   padding: 10px 16px;
   background-color: ${props => props.active ? '#3498db' : 'white'};
   color: ${props => props.active ? 'white' : '#3498db'};
   border: 1px solid ${props => props.active ? '#3498db' : '#ddd'};
   border-radius: 4px;
   font-size: 14px;
   cursor: pointer;
   transition: all 0.2s;
   
   svg {
       margin-right: 8px;
   }
   
   &:hover {
       background-color: ${props => props.active ? '#2980b9' : '#f8f9fa'};
   }
   
   @media (max-width: 768px) {
       justify-content: center;
   }
`;

const ExpandedFilters = styled.div`
   display: flex;
   flex-wrap: wrap;
   gap: 16px;
   margin-bottom: 20px;
   padding: 16px;
   background-color: #f8f9fa;
   border-radius: 4px;
   border: 1px solid #ddd;
   
   @media (max-width: 768px) {
       flex-direction: column;
   }
`;

const FilterGroup = styled.div`
   flex: 1;
   min-width: 200px;
   
   @media (max-width: 768px) {
       width: 100%;
   }
`;

const FilterLabel = styled.label`
   display: block;
   margin-bottom: 8px;
   font-size: 14px;
   color: #7f8c8d;
`;

const SelectFilter = styled.select`
   width: 100%;
   padding: 10px;
   border: 1px solid #ddd;
   border-radius: 4px;
   font-size: 14px;
   background-color: white;
   
   &:focus {
       outline: none;
       border-color: #3498db;
   }
`;

const RadioGroup = styled.div`
   display: flex;
   flex-wrap: wrap;
   gap: 12px;
`;

const RadioItem = styled.div`
   display: flex;
   align-items: center;
`;

const Radio = styled.input`
   margin-right: 6px;
`;

const RadioLabel = styled.label`
   font-size: 14px;
   color: #34495e;
`;

const DateRangeContainer = styled.div`
   display: flex;
   align-items: center;
   gap: 8px;
   margin-top: 12px;
`;

const DateInput = styled.input`
   flex: 1;
   padding: 8px;
   border: 1px solid #ddd;
   border-radius: 4px;
   font-size: 14px;
   
   &:focus {
       outline: none;
       border-color: #3498db;
   }
`;

const DateRangeSeparator = styled.span`
   color: #7f8c8d;
   font-size: 14px;
`;

const ClearFiltersButton = styled.button`
   padding: 10px 16px;
   background: none;
   border: 1px solid #ddd;
   border-radius: 4px;
   color: #7f8c8d;
   font-size: 14px;
   cursor: pointer;
   transition: all 0.2s;
   align-self: flex-end;
   
   &:hover {
       background-color: #f1f1f1;
       color: #e74c3c;
   }
   
   @media (max-width: 768px) {
       align-self: stretch;
   }
`;

const ResultCount = styled.div`
   margin-bottom: 20px;
   font-size: 14px;
   color: #7f8c8d;
`;

const TableWrapper = styled.div`
   overflow-x: auto;
   background-color: white;
   border-radius: 8px;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const RentalsTable = styled.table`
   width: 100%;
   border-collapse: collapse;
`;

const TableHead = styled.thead`
   background-color: #f8f9fa;
`;

const TableRow = styled.tr`
   &:not(:last-child) {
       border-bottom: 1px solid #eee;
   }
   
   &.scheduled {
       background-color: #ebf5fb;
   }
   
   &.active {
       background-color: #eafaf1;
   }
   
   &.completed {
       background-color: #f8f9fa;
   }
   
   &.cancelled {
       background-color: #fef9e7;
       color: #7f8c8d;
   }
   
   &.overdue {
       background-color: #fdedec;
   }
`;

const TableHeader = styled.th`
   padding: 16px;
   text-align: left;
   font-weight: 500;
   color: #2c3e50;
   cursor: pointer;
   
   &:last-child {
       text-align: right;
   }
`;

const TableHeaderContent = styled.div`
   display: flex;
   align-items: center;
   
   svg {
       margin-right: 8px;
       color: #7f8c8d;
   }
`;

const SortableHeader = styled.div`
   display: flex;
   align-items: center;
   
   svg {
       margin-right: 8px;
       color: #7f8c8d;
   }
`;

const SortIcon = styled.span`
   margin-left: 6px;
   color: #3498db;
   display: flex;
   align-items: center;
`;

const TableBody = styled.tbody``;

const TableCell = styled.td`
   padding: 16px;
   
   &:last-child {
       text-align: right;
   }
`;

const CellWithDetails = styled.div`
   display: flex;
   flex-direction: column;
`;

const CellDetails = styled.div`
   font-size: 12px;
   color: #7f8c8d;
   margin-top: 4px;
`;

const OverdueTag = styled.div`
   display: inline-block;
   margin-top: 8px;
   padding: 2px 6px;
   background-color: #e74c3c;
   color: white;
   border-radius: 4px;
   font-size: 11px;
   font-weight: 500;
`;

const ActionButtons = styled.div`
   display: flex;
   justify-content: flex-end;
   gap: 8px;
`;

const ActionButton = styled.button`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 32px;
   height: 32px;
   border-radius: 4px;
   background-color: #3498db;
   color: white;
   border: none;
   cursor: pointer;
   
   &:hover {
       background-color: #2980b9;
   }
`;

const MobileReturnButton = styled(ActionButton)`
   background-color: #2ecc71;
   
   &:hover {
       background-color: #27ae60;
   }
`;

const EmptyState = styled.div`
   text-align: center;
   padding: 40px 20px;
   background-color: white;
   border-radius: 8px;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const EmptyStateIcon = styled.div`
   font-size: 48px;
   color: #bdc3c7;
   margin-bottom: 16px;
`;

const EmptyStateText = styled.p`
   font-size: 16px;
   color: #7f8c8d;
   margin: 0 0 20px 0;
`;

const EmptyStateButton = styled.button`
   padding: 10px 20px;
   background-color: #3498db;
   color: white;
   border: none;
   border-radius: 4px;
   font-size: 14px;
   cursor: pointer;
   transition: background-color 0.2s;
   
   &:hover {
       background-color: #2980b9;
   }
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

export default FleetRentalsPage;