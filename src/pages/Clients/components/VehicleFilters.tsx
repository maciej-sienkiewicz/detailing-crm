import React from 'react';
import styled from 'styled-components';
import { FaFilter, FaTimes } from 'react-icons/fa';

// Vehicle filters interface
export interface VehicleFilters {
    licensePlate: string;
    make: string;
    model: string;
    minYear: string;
    minServices: string;
    minSpent: string;
}

interface VehicleFiltersProps {
    filters: VehicleFilters;
    showFilters: boolean;
    onToggleFilters: () => void;
    onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onResetFilters: () => void;
    resultCount: number;
}

const VehicleFilters: React.FC<VehicleFiltersProps> = ({
                                                           filters,
                                                           showFilters,
                                                           onToggleFilters,
                                                           onFilterChange,
                                                           onResetFilters,
                                                           resultCount
                                                       }) => {
    // Check if any filters are active
    const hasActiveFilters = () => {
        return Object.values(filters).some(val => val !== '');
    };

    return (
        <FilterContainer>
            <FilterToggle onClick={onToggleFilters}>
                <FaFilter /> {showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
            </FilterToggle>

            {showFilters && (
                <FiltersContainer>
                    <FiltersGrid>
                        <FilterGroup>
                            <Label htmlFor="licensePlate">Numer rejestracyjny</Label>
                            <Input
                                id="licensePlate"
                                name="licensePlate"
                                value={filters.licensePlate}
                                onChange={onFilterChange}
                                placeholder="Wyszukaj po numerze..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="make">Marka</Label>
                            <Input
                                id="make"
                                name="make"
                                value={filters.make}
                                onChange={onFilterChange}
                                placeholder="Wyszukaj po marce..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="model">Model</Label>
                            <Input
                                id="model"
                                name="model"
                                value={filters.model}
                                onChange={onFilterChange}
                                placeholder="Wyszukaj po modelu..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="minYear">Min. rok produkcji</Label>
                            <Input
                                id="minYear"
                                name="minYear"
                                type="number"
                                min="1900"
                                value={filters.minYear}
                                onChange={onFilterChange}
                                placeholder="Min. rok produkcji..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="minServices">Min. liczba usług</Label>
                            <Input
                                id="minServices"
                                name="minServices"
                                type="number"
                                min="0"
                                value={filters.minServices}
                                onChange={onFilterChange}
                                placeholder="Min. liczba usług..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="minSpent">Min. przychód (zł)</Label>
                            <Input
                                id="minSpent"
                                name="minSpent"
                                type="number"
                                min="0"
                                value={filters.minSpent}
                                onChange={onFilterChange}
                                placeholder="Min. kwota przychodu..."
                            />
                        </FilterGroup>
                    </FiltersGrid>

                    <FiltersActions>
                        {hasActiveFilters() && (
                            <FilterResults>
                                Znaleziono: {resultCount} {
                                resultCount === 1 ? 'pojazd' :
                                    (resultCount > 1 && resultCount < 5) ? 'pojazdy' : 'pojazdów'
                            }
                            </FilterResults>
                        )}

                        <ClearFiltersButton
                            onClick={onResetFilters}
                            disabled={!hasActiveFilters()}
                        >
                            <FaTimes /> Wyczyść filtry
                        </ClearFiltersButton>
                    </FiltersActions>
                </FiltersContainer>
            )}
        </FilterContainer>
    );
};

// Styled components
const FilterContainer = styled.div`
    width: 100%;
`;

const FilterToggle = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #f9f9f9;
    color: #34495e;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px 16px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        background-color: #f0f0f0;
    }
`;

const FiltersContainer = styled.div`
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 16px;
  margin-top: 10px;
  margin-bottom: 20px;
  border: 1px solid #eee;
  width: 100%;
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Label = styled.label`
    font-weight: 500;
    font-size: 14px;
    color: #333;
`;

const Input = styled.input`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const FiltersActions = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
`;

const FilterResults = styled.div`
    font-size: 14px;
    color: #7f8c8d;
`;

const ClearFiltersButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: #e74c3c;
    font-size: 14px;
    cursor: pointer;
    padding: 4px 8px;

    &:hover:not(:disabled) {
        text-decoration: underline;
    }

    &:disabled {
        color: #bdc3c7;
        cursor: not-allowed;
    }
`;

export default VehicleFilters;