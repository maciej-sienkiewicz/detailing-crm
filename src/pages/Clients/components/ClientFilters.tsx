import React from 'react';
import styled from 'styled-components';
import { FaFilter, FaTimes, FaSearch, FaCheck } from 'react-icons/fa';

// Brand Theme System - Automotive Premium
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    accent: '#f8fafc',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0'
};

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

    const activeFilterCount = Object.values(filters).filter(val => val !== '').length;

    if (!showFilters) {
        return null;
    }

    return (
        <FiltersContainer>
            <FiltersHeader>
                <HeaderLeft>
                    <FilterIcon>
                        <FaFilter />
                    </FilterIcon>
                    <FiltersTitle>
                        Filtry wyszukiwania {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </FiltersTitle>
                </HeaderLeft>
                {hasActiveFilters() && (
                    <ClearAllButton onClick={onResetFilters}>
                        <FaTimes />
                        Wyczyść wszystkie
                    </ClearAllButton>
                )}
            </FiltersHeader>

            <FiltersContent>
                <FiltersGrid>
                    <FilterGroup>
                        <FilterLabel htmlFor="name">
                            Imię i nazwisko
                        </FilterLabel>
                        <FilterInput
                            id="name"
                            name="name"
                            value={filters.name}
                            onChange={onFilterChange}
                            placeholder="Wyszukaj po imieniu i nazwisku..."
                            $hasValue={!!filters.name}
                        />
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel htmlFor="email">
                            Adres email
                        </FilterLabel>
                        <FilterInput
                            id="email"
                            name="email"
                            type="email"
                            value={filters.email}
                            onChange={onFilterChange}
                            placeholder="Wyszukaj po adresie email..."
                            $hasValue={!!filters.email}
                        />
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel htmlFor="phone">
                            Numer telefonu
                        </FilterLabel>
                        <FilterInput
                            id="phone"
                            name="phone"
                            value={filters.phone}
                            onChange={onFilterChange}
                            placeholder="Wyszukaj po numerze telefonu..."
                            $hasValue={!!filters.phone}
                        />
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel htmlFor="minVisits">
                            Minimalna liczba wizyt
                        </FilterLabel>
                        <FilterInput
                            id="minVisits"
                            name="minVisits"
                            type="number"
                            min="0"
                            value={filters.minVisits}
                            onChange={onFilterChange}
                            placeholder="Min. liczba wizyt..."
                            $hasValue={!!filters.minVisits}
                        />
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel htmlFor="minTransactions">
                            Minimalna liczba transakcji
                        </FilterLabel>
                        <FilterInput
                            id="minTransactions"
                            name="minTransactions"
                            type="number"
                            min="0"
                            value={filters.minTransactions}
                            onChange={onFilterChange}
                            placeholder="Min. liczba transakcji..."
                            $hasValue={!!filters.minTransactions}
                        />
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel htmlFor="minRevenue">
                            Minimalne przychody (PLN)
                        </FilterLabel>
                        <FilterInput
                            id="minRevenue"
                            name="minRevenue"
                            type="number"
                            min="0"
                            step="0.01"
                            value={filters.minRevenue}
                            onChange={onFilterChange}
                            placeholder="Min. kwota przychodów..."
                            $hasValue={!!filters.minRevenue}
                        />
                    </FilterGroup>
                </FiltersGrid>

                <FiltersFooter>
                    <FiltersResults>
                        {hasActiveFilters() ? (
                            <ResultsWithIcon>
                                <FaCheck />
                                <span>
                                    Znaleziono: {resultCount} {
                                    resultCount === 1 ? 'klienta' :
                                        resultCount > 1 && resultCount < 5 ? 'klientów' : 'klientów'
                                }
                                </span>
                            </ResultsWithIcon>
                        ) : (
                            <ResultsInfo>
                                Skonfiguruj filtry aby zawęzić wyniki wyszukiwania
                            </ResultsInfo>
                        )}
                    </FiltersResults>

                    <FiltersActions>
                        <SearchButton
                            onClick={() => {/* Search is automatic */}}
                            $hasFilters={hasActiveFilters()}
                        >
                            <FaSearch />
                            Wyszukaj
                        </SearchButton>
                    </FiltersActions>
                </FiltersFooter>
            </FiltersContent>
        </FiltersContainer>
    );
};

// Modern Styled Components - Premium Automotive Design
const FiltersContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: 12px;
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const FiltersHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: ${brandTheme.surfaceAlt};
    border-bottom: 1px solid ${brandTheme.border};
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const FilterIcon = styled.div`
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
    box-shadow: 0 2px 4px ${brandTheme.primaryGhost};
`;

const FiltersTitle = styled.div`
    font-weight: 600;
    color: #1e293b;
    font-size: 16px;
`;

const ClearAllButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: 2px solid ${brandTheme.border};
    color: ${brandTheme.neutral};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
        border-color: #ef4444;
        color: #ef4444;
        background: #fef2f2;
        transform: translateY(-1px);
    }
`;

const FiltersContent = styled.div`
    padding: 24px;
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px 24px;
    margin-bottom: 24px;
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const FilterLabel = styled.label`
    font-weight: 600;
    font-size: 14px;
    color: #374151;
    margin-bottom: 2px;
`;

const FilterInput = styled.input<{ $hasValue: boolean }>`
    height: 44px;
    padding: 0 16px;
    border: 2px solid ${props => props.$hasValue ? brandTheme.primary : brandTheme.border};
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: #374151;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.neutral};
        font-weight: 400;
    }

    ${props => props.$hasValue && `
        background: ${brandTheme.primaryGhost};
        font-weight: 600;
    `}
`;

const FiltersFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    border-top: 1px solid ${brandTheme.border};
`;

const FiltersResults = styled.div`
    display: flex;
    align-items: center;
`;

const ResultsWithIcon = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: ${brandTheme.primary};
    font-weight: 600;

    svg {
        font-size: 12px;
    }
`;

const ResultsInfo = styled.div`
    font-size: 14px;
    color: ${brandTheme.neutral};
    font-style: italic;
`;

const FiltersActions = styled.div`
    display: flex;
    gap: 12px;
`;

const SearchButton = styled.button<{ $hasFilters: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: none;
    background: ${props => props.$hasFilters ? brandTheme.primary : brandTheme.surfaceAlt};
    color: ${props => props.$hasFilters ? 'white' : brandTheme.neutral};
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: ${props => props.$hasFilters ? 'pointer' : 'default'};
    transition: all 0.2s ease;
    box-shadow: ${props => props.$hasFilters ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'};

    ${props => props.$hasFilters && `
        &:hover {
            background: ${brandTheme.primaryDark};
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
    `}
`;

export default ClientFilters;