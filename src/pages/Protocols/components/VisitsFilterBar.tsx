import React, { useState } from 'react';
import styled from 'styled-components';
import { FaSearch, FaFilter, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';
import { VisitsFilterState } from '../hooks/useVisitsFilters';
import { ServiceAutocomplete, ServiceOption } from './ServiceAutocomplete';

const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0'
};

interface VisitsFilterBarProps {
    filters: VisitsFilterState;
    onFiltersChange: (filters: Partial<VisitsFilterState>) => void;
    onSearch: () => void;
    onClear: () => void;
    loading?: boolean;
    availableServices?: ServiceOption[];
}

export const VisitsFilterBar: React.FC<VisitsFilterBarProps> = ({
                                                                    filters,
                                                                    onFiltersChange,
                                                                    onSearch,
                                                                    onClear,
                                                                    loading = false,
                                                                    availableServices = []
                                                                }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleQuickSearchChange = (value: string) => {
        onFiltersChange({ quickSearch: value });
    };

    const handleFilterChange = (key: keyof VisitsFilterState, value: any) => {
        console.log(`🔧 Filter change: ${key} =`, value);
        onFiltersChange({ [key]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch();
    };

    const hasActiveFilters = Object.values(filters).some(value =>
        value !== undefined && value !== null && value !== ''
    );

    return (
        <FilterContainer>
            <QuickSearchSection>
                <SearchForm onSubmit={handleSubmit}>
                    <SearchInputWrapper>
                        <SearchIcon>
                            <FaSearch />
                        </SearchIcon>
                        <SearchInput
                            type="text"
                            value={filters.quickSearch || ''}
                            onChange={(e) => handleQuickSearchChange(e.target.value)}
                            placeholder="Szybkie wyszukiwanie - klient, pojazd, numer rejestracyjny..."
                            disabled={loading}
                        />
                        {filters.quickSearch && (
                            <ClearButton
                                type="button"
                                onClick={() => handleQuickSearchChange('')}
                                disabled={loading}
                            >
                                <FaTimes />
                            </ClearButton>
                        )}
                    </SearchInputWrapper>

                    <SearchButton type="submit" disabled={loading}>
                        {loading ? 'Szukam...' : 'Szukaj'}
                    </SearchButton>
                </SearchForm>

                <AdvancedToggle
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    $expanded={isExpanded}
                >
                    <FaFilter />
                    Filtry zaawansowane
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </AdvancedToggle>
            </QuickSearchSection>

            {isExpanded && (
                <AdvancedSection>
                    <FiltersGrid>
                        <FilterGroup>
                            <FilterLabel>Klient</FilterLabel>
                            <FilterInput
                                type="text"
                                value={filters.clientName || ''}
                                onChange={(e) => handleFilterChange('clientName', e.target.value)}
                                placeholder="Nazwa klienta"
                                disabled={loading}
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Nr rejestracyjny</FilterLabel>
                            <FilterInput
                                type="text"
                                value={filters.licensePlate || ''}
                                onChange={(e) => handleFilterChange('licensePlate', e.target.value)}
                                placeholder="Numer rejestracyjny"
                                disabled={loading}
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Marka</FilterLabel>
                            <FilterInput
                                type="text"
                                value={filters.make || ''}
                                onChange={(e) => handleFilterChange('make', e.target.value)}
                                placeholder="Marka pojazdu"
                                disabled={loading}
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Model</FilterLabel>
                            <FilterInput
                                type="text"
                                value={filters.model || ''}
                                onChange={(e) => handleFilterChange('model', e.target.value)}
                                placeholder="Model pojazdu"
                                disabled={loading}
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Rodzaj usługi</FilterLabel>
                            <ServiceAutocomplete
                                value={filters.serviceIds || []}
                                onChange={(value) => handleFilterChange('serviceIds', value)}
                                options={availableServices}
                                disabled={loading}
                                placeholder="Wyszukaj usługi..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Data od</FilterLabel>
                            <FilterInput
                                type="date"
                                value={filters.startDate || ''}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                disabled={loading}
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Data do</FilterLabel>
                            <FilterInput
                                type="date"
                                value={filters.endDate || ''}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                min={filters.startDate}
                                disabled={loading}
                            />
                        </FilterGroup>

                        <PriceGroup>
                            <FilterLabel>Cena (PLN)</FilterLabel>
                            <PriceInputs>
                                <FilterInput
                                    type="number"
                                    value={filters.minPrice || ''}
                                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder="Od"
                                    min="0"
                                    step="0.01"
                                    disabled={loading}
                                />
                                <PriceSeparator>-</PriceSeparator>
                                <FilterInput
                                    type="number"
                                    value={filters.maxPrice || ''}
                                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder="Do"
                                    min="0"
                                    step="0.01"
                                    disabled={loading}
                                />
                            </PriceInputs>
                        </PriceGroup>
                    </FiltersGrid>

                    <FilterActions>
                        <ClearAllButton
                            type="button"
                            onClick={onClear}
                            disabled={loading || !hasActiveFilters}
                        >
                            <FaTimes />
                            Wyczyść filtry
                        </ClearAllButton>
                        <ApplyButton
                            type="button"
                            onClick={onSearch}
                            disabled={loading}
                        >
                            <FaSearch />
                            Zastosuj filtry
                        </ApplyButton>
                    </FilterActions>
                </AdvancedSection>
            )}
        </FilterContainer>
    );
};

const FilterContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: 12px;
    overflow: hidden;
`;

const QuickSearchSection = styled.div`
    padding: 20px 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: 1px solid ${brandTheme.border};
`;

const SearchForm = styled.form`
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
`;

const SearchInputWrapper = styled.div`
    position: relative;
    flex: 1;
    max-width: 500px;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${brandTheme.neutral};
    font-size: 16px;
    z-index: 2;
`;

const SearchInput = styled.input`
    width: 100%;
    height: 48px;
    padding: 0 48px 0 48px;
    border: 2px solid ${brandTheme.border};
    border-radius: 12px;
    font-size: 16px;
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

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ClearButton = styled.button`
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    border: none;
    background: ${brandTheme.surfaceAlt};
    color: ${brandTheme.neutral};
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: #ef4444;
        color: white;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const SearchButton = styled.button`
    height: 48px;
    padding: 0 24px;
    border: none;
    background: ${brandTheme.primary};
    color: white;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover:not(:disabled) {
        background: ${brandTheme.primaryLight};
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const AdvancedToggle = styled.button<{ $expanded: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: 2px solid ${props => props.$expanded ? brandTheme.primary : brandTheme.border};
    background: ${props => props.$expanded ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${props => props.$expanded ? brandTheme.primary : brandTheme.neutral};
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
    }
`;

const AdvancedSection = styled.div`
    padding: 24px;
    background: ${brandTheme.surfaceAlt};
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px 24px;
    margin-bottom: 24px;

    @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const PriceGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const FilterLabel = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: #374151;
`;

const FilterInput = styled.input`
    height: 44px;
    padding: 0 16px;
    border: 2px solid ${brandTheme.border};
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: #374151;
    transition: all 0.2s ease;
    width: 100%;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.neutral};
        font-weight: 400;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const PriceInputs = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;

    input {
        flex: 1;
        min-width: 0;
    }
`;

const PriceSeparator = styled.span`
    font-weight: 600;
    color: ${brandTheme.neutral};
    flex-shrink: 0;
    padding: 0 4px;
`;

const FilterActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid ${brandTheme.border};
`;

const ClearAllButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: 2px solid ${brandTheme.border};
    background: ${brandTheme.surface};
    color: ${brandTheme.neutral};
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        border-color: #ef4444;
        color: #ef4444;
        background: #fef2f2;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const ApplyButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border: none;
    background: ${brandTheme.primary};
    color: white;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${brandTheme.primaryLight};
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;