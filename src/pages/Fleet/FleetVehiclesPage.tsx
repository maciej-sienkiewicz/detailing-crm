// src/pages/Fleet/FleetVehiclesPage.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
    FleetVehicle,
    FleetVehicleStatus,
    FleetVehicleStatusLabels,
    FleetVehicleCategory,
    FleetVehicleCategoryLabels,
    FleetVehicleUsageType,
    FleetVehicleUsageTypeLabels
} from '../../types/fleet';
import { fleetVehicleApi } from '../../api/fleetApi';
import FleetVehicleCard from '../../components/fleet/common/FleetVehicleCard';
import { FaCar, FaPlus, FaSearch, FaFilter, FaTimesCircle } from 'react-icons/fa';
import { useToast } from '../../components/common/Toast/Toast';

const FleetVehiclesPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<FleetVehicle[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Stany filtrów
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<FleetVehicleStatus | ''>('');
    const [categoryFilter, setCategoryFilter] = useState<FleetVehicleCategory | ''>('');
    const [usageTypeFilter, setUsageTypeFilter] = useState<FleetVehicleUsageType | ''>('');

    // Stan rozwinięcia filtrów
    const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);

    // Pobieranie pojazdów
    useEffect(() => {
        const fetchVehicles = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await fleetVehicleApi.fetchVehicles();
                setVehicles(data);
                setFilteredVehicles(data);
            } catch (err) {
                console.error('Error fetching vehicles:', err);
                setError('Wystąpił błąd podczas ładowania danych. Spróbuj odświeżyć stronę.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    // Filtrowanie pojazdów
    useEffect(() => {
        let result = vehicles;

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
        if (statusFilter) {
            result = result.filter(vehicle => vehicle.status === statusFilter);
        }

        // Filtrowanie po kategorii
        if (categoryFilter) {
            result = result.filter(vehicle => vehicle.category === categoryFilter);
        }

        // Filtrowanie po typie użytkowania
        if (usageTypeFilter) {
            result = result.filter(vehicle => vehicle.usageType === usageTypeFilter);
        }

        setFilteredVehicles(result);
    }, [vehicles, searchQuery, statusFilter, categoryFilter, usageTypeFilter]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setCategoryFilter('');
        setUsageTypeFilter('');
    };

    const addNewVehicle = () => {
        navigate('/fleet/vehicles/new');
    };

    if (isLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Ładowanie pojazdów...</LoadingText>
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
                    <FaCar />
                    Pojazdy floty
                </PageTitle>
                <AddVehicleButton onClick={addNewVehicle}>
                    <FaPlus />
                    Dodaj pojazd
                </AddVehicleButton>
            </PageHeader>

            <FiltersContainer>
                <SearchContainer>
                    <SearchIcon>
                        <FaSearch />
                    </SearchIcon>
                    <SearchInput
                        type="text"
                        placeholder="Szukaj pojazdów..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    {searchQuery && (
                        <ClearSearchButton onClick={() => setSearchQuery('')}>
                            <FaTimesCircle />
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
                        <FilterLabel>Status pojazdu</FilterLabel>
                        <SelectFilter
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as FleetVehicleStatus | '')}
                        >
                            <option value="">Wszystkie statusy</option>
                            {Object.entries(FleetVehicleStatusLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </SelectFilter>
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel>Kategoria</FilterLabel>
                        <SelectFilter
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value as FleetVehicleCategory | '')}
                        >
                            <option value="">Wszystkie kategorie</option>
                            {Object.entries(FleetVehicleCategoryLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </SelectFilter>
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel>Typ użytkowania</FilterLabel>
                        <SelectFilter
                            value={usageTypeFilter}
                            onChange={(e) => setUsageTypeFilter(e.target.value as FleetVehicleUsageType | '')}
                        >
                            <option value="">Wszystkie typy</option>
                            {Object.entries(FleetVehicleUsageTypeLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </SelectFilter>
                    </FilterGroup>

                    <ClearFiltersButton onClick={clearFilters}>
                        Wyczyść filtry
                    </ClearFiltersButton>
                </ExpandedFilters>
            )}

            <ResultCount>
                Znaleziono {filteredVehicles.length} {filteredVehicles.length === 1 ? 'pojazd' :
                filteredVehicles.length > 1 && filteredVehicles.length < 5 ? 'pojazdy' : 'pojazdów'}
            </ResultCount>

            {filteredVehicles.length === 0 ? (
                <EmptyState>
                    <EmptyStateIcon>
                        <FaCar />
                    </EmptyStateIcon>
                    <EmptyStateText>
                        {vehicles.length === 0
                            ? 'Nie masz jeszcze żadnych pojazdów w systemie.'
                            : 'Nie znaleziono pojazdów spełniających kryteria wyszukiwania.'}
                    </EmptyStateText>
                    {vehicles.length === 0 && (
                        <EmptyStateButton onClick={addNewVehicle}>
                            Dodaj pierwszy pojazd
                        </EmptyStateButton>
                    )}
                </EmptyState>
            ) : (
                <VehiclesGrid>
                    {filteredVehicles.map(vehicle => (
                        <FleetVehicleCard key={vehicle.id} vehicle={vehicle} />
                    ))}
                </VehiclesGrid>
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

const AddVehicleButton = styled.button`
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
`;

const ResultCount = styled.div`
    margin-bottom: 20px;
    font-size: 14px;
    color: #7f8c8d;
`;

const VehiclesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    
    @media (max-width: 560px) {
        grid-template-columns: 1fr;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 40px 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px dashed #ddd;
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
    // Kontynuacja pliku src/pages/Fleet/FleetVehiclesPage.tsx

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

export default FleetVehiclesPage;