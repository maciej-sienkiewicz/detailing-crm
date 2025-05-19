// src/components/fleet/calendar/VehicleSidebar.tsx
import React from 'react';
import styled from 'styled-components';
import { FleetVehicle, FleetVehicleStatus } from '../../../types/fleet';
import {
    FaCar,
    FaSearch,
    FaFilter,
    FaTimes,
    FaTags,
    FaCheck,
    FaExclamationTriangle
} from 'react-icons/fa';

interface VehicleSidebarProps {
    vehicles: FleetVehicle[];
    filteredVehicles: FleetVehicle[];
    selectedVehicleId?: string;
    searchQuery: string;
    statusFilter: string;
    categoryFilter: string;
    showFilters: boolean;
    isLoading: boolean;
    onSelectVehicle: (id?: string) => void;
    onSearchChange: (query: string) => void;
    onStatusFilterChange: (status: string) => void;
    onCategoryFilterChange: (category: string) => void;
    onToggleFilters: () => void;
    onClearFilters: () => void;
}

const VehicleSidebar: React.FC<VehicleSidebarProps> = ({
                                                           vehicles,
                                                           filteredVehicles,
                                                           selectedVehicleId,
                                                           searchQuery,
                                                           statusFilter,
                                                           categoryFilter,
                                                           showFilters,
                                                           isLoading,
                                                           onSelectVehicle,
                                                           onSearchChange,
                                                           onStatusFilterChange,
                                                           onCategoryFilterChange,
                                                           onToggleFilters,
                                                           onClearFilters
                                                       }) => {
    return (
        <SidebarContainer>
            <SectionHeader>
                <SectionTitle>
                    <FaCar />
                    <span>Pojazdy</span>
                </SectionTitle>
                <FiltersToggle onClick={onToggleFilters} active={showFilters}>
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
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                {searchQuery && (
                    <ClearSearchButton onClick={() => onSearchChange('')}>×</ClearSearchButton>
                )}
            </SearchContainer>

            {showFilters && (
                <FiltersContainer>
                    <FilterGroup>
                        <FilterLabel>Status pojazdu</FilterLabel>
                        <FilterSelect
                            value={statusFilter}
                            onChange={(e) => onStatusFilterChange(e.target.value)}
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
                            onChange={(e) => onCategoryFilterChange(e.target.value)}
                        >
                            <option value="all">Wszystkie kategorie</option>
                            <option value="ECONOMY">Ekonomiczne</option>
                            <option value="STANDARD">Standardowe</option>
                            <option value="PREMIUM">Premium</option>
                            <option value="SUV">SUV</option>
                            <option value="UTILITY">Użytkowe</option>
                        </FilterSelect>
                    </FilterGroup>

                    <ClearFiltersButton onClick={onClearFilters}>
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
                            onClick={() => onSelectVehicle(undefined)}
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
                                onClick={() => onSelectVehicle(vehicle.id)}
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
        </SidebarContainer>
    );
};

const SidebarContainer = styled.div`
  background-color: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #eaedf3;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 160px);
  max-height: 800px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  background: linear-gradient(135deg, #f9f9fa, #f5f7fa);
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

const FiltersToggle = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background-color: ${props => props.active ? '#3498db' : 'transparent'};
  color: ${props => props.active ? 'white' : '#555'};
  border: 1px solid ${props => props.active ? '#3498db' : '#dde2e8'};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #3498db;
    color: ${props => props.active ? 'white' : '#3498db'};
    background-color: ${props => props.active ? '#2980b9' : 'rgba(52, 152, 219, 0.05)'};
  }

  svg {
    font-size: 12px;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  padding: 16px;
  border-bottom: 1px solid #eaedf3;
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
  border: 1px solid #eaedf3;
  border-radius: 8px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;

  &:hover {
    color: #e74c3c;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border-bottom: 1px solid #eaedf3;
  background-color: #f8f9fa;
`;

const FilterGroup = styled.div`
  flex: 1;
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #5d6778;
  font-weight: 500;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dde2e8;
  border-radius: 6px;
  font-size: 14px;
  color: #34495e;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const ClearFiltersButton = styled.button`
  width: 100%;
  padding: 8px;
  background-color: transparent;
  border: 1px solid #dde2e8;
  border-radius: 6px;
  color: #5d6778;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 4px;
  
  &:hover {
    color: #e74c3c;
    border-color: #e74c3c;
    background-color: rgba(231, 76, 60, 0.05);
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
    background: #f5f7fa;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
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
  border-radius: 10px;
  cursor: pointer;
  background-color: ${props => props.active ? '#ebf5fc' : 'white'};
// Kontynuacja pliku src/components/fleet/calendar/VehicleSidebar.tsx
  border: 1px solid ${props => props.active ? '#3498db30' : '#eaedf3'};
  box-shadow: ${props => props.active ? '0 2px 8px rgba(52, 152, 219, 0.15)' : 'none'};
  position: relative;
  transition: all 0.2s ease;
  
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
      border-top-left-radius: 10px;
      border-bottom-left-radius: 10px;
    }
  `}
  
  &:hover {
    background-color: ${props => props.active ? '#ebf5fc' : '#f8fafd'};
    transform: translateY(-1px);
  }
`;

const AllVehiclesIcon = styled.div`
  width: 38px;
  height: 38px;
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
  width: 38px;
  height: 38px;
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
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
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

export default VehicleSidebar;