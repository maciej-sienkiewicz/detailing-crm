import React from 'react';
import styled from 'styled-components';
import { FaFilter, FaTimes } from 'react-icons/fa';

// Client filters interface
export interface ClientFilters {
    name: string;
    email: string;
    phone: string;
    minVisits: string;
    minTransactions: string;
    minRevenue: string;
}

interface ClientFiltersProps {
    filters: ClientFilters;
    showFilters: boolean;
    onToggleFilters: () => void;
    onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onResetFilters: () => void;
    resultCount: number;
}

const ClientFilters: React.FC<ClientFiltersProps> = ({
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
                            <Label htmlFor="name">Imię i nazwisko</Label>
                            <Input
                                id="name"
                                name="name"
                                value={filters.name}
                                onChange={onFilterChange}
                                placeholder="Wyszukaj po imieniu i nazwisku..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                value={filters.email}
                                onChange={onFilterChange}
                                placeholder="Wyszukaj po emailu..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="phone">Telefon</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={filters.phone}
                                onChange={onFilterChange}
                                placeholder="Wyszukaj po telefonie..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="minVisits">Min. liczba wizyt</Label>
                            <Input
                                id="minVisits"
                                name="minVisits"
                                type="number"
                                min="0"
                                value={filters.minVisits}
                                onChange={onFilterChange}
                                placeholder="Min. liczba wizyt..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="minTransactions">Min. liczba transakcji</Label>
                            <Input
                                id="minTransactions"
                                name="minTransactions"
                                type="number"
                                min="0"
                                value={filters.minTransactions}
                                onChange={onFilterChange}
                                placeholder="Min. liczba transakcji..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="minRevenue">Min. przychody (zł)</Label>
                            <Input
                                id="minRevenue"
                                name="minRevenue"
                                type="number"
                                min="0"
                                value={filters.minRevenue}
                                onChange={onFilterChange}
                                placeholder="Min. kwota przychodów..."
                            />
                        </FilterGroup>
                    </FiltersGrid>

                    <FiltersActions>
                        {hasActiveFilters() && (
                            <FilterResults>
                                Znaleziono: {resultCount} {
                                resultCount === 1 ? 'klienta' :
                                    resultCount > 1 && resultCount < 5 ? 'klientów' : 'klientów'
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

export default ClientFilters;