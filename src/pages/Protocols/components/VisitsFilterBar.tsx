import React, {useState} from 'react';
import styled from 'styled-components';
import {FaChevronDown, FaChevronUp, FaFilter, FaSearch, FaTimes} from 'react-icons/fa';
import {VisitsFilterState} from '../hooks/useVisitsFilters';
import {ServiceAutocomplete, ServiceOption} from './ServiceAutocomplete';
import {theme} from '../../../styles/theme';

interface VisitsFilterBarProps {
    filters: VisitsFilterState;
    onFiltersChange: (filters: Partial<VisitsFilterState>) => void;
    onApplyFilters: () => void;
    onClearAll: () => void;
    loading?: boolean;
    availableServices?: ServiceOption[];
    servicesLoading?: boolean; // Dodano prop dla ładowania usług
}

export const VisitsFilterBar: React.FC<VisitsFilterBarProps> = ({
                                                                    filters,
                                                                    onFiltersChange,
                                                                    onApplyFilters,
                                                                    onClearAll,
                                                                    loading = false,
                                                                    availableServices = [],
                                                                    servicesLoading = false // Dodano prop
                                                                }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleQuickSearchChange = (value: string) => {
        onFiltersChange({ quickSearch: value });
    };

    const handleFilterChange = (key: keyof VisitsFilterState, value: any) => {
        onFiltersChange({ [key]: value });
    };

    const handleClearQuickSearch = () => {
        onFiltersChange({ quickSearch: '' });
    };

    const handleClearAllFilters = () => {
        onClearAll();
    };

    const handleQuickSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onApplyFilters();
    };

    const handleQuickSearchBlur = () => {
        if (filters.quickSearch?.trim()) {
            onApplyFilters();
        }
    };

    const hasQuickSearch = Boolean(filters.quickSearch?.trim());
    const hasAdvancedFilters = Object.entries(filters).some(([key, value]) => {
        if (key === 'quickSearch') return false;
        if (value === undefined || value === null || value === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
    });

    return (
        <FilterContainer>
            <QuickSearchSection>
                <AdvancedToggle
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    $expanded={isExpanded}
                    $hasFilters={hasAdvancedFilters}
                >
                    <FaFilter />
                    Filtrowanie
                    {hasAdvancedFilters && <FilterIndicator>{Object.keys(filters).filter(key => {
                        const value = filters[key as keyof typeof filters];
                        if (key === 'quickSearch') return false;
                        if (value === undefined || value === null || value === '') return false;
                        if (Array.isArray(value) && value.length === 0) return false;
                        return true;
                    }).length}</FilterIndicator>}
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
                                loading={servicesLoading} // Przekazano prop loading
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
                            onClick={handleClearAllFilters}
                            disabled={loading}
                        >
                            <FaTimes />
                            Wyczyść filtry
                        </ClearAllButton>
                        <ApplyButton
                            type="button"
                            onClick={onApplyFilters}
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
    background: ${theme.surface};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
`;

const QuickSearchSection = styled.div`
    padding: ${theme.spacing.xl} ${theme.spacing.xxl};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    border-bottom: 1px solid ${theme.border};

    form {
        display: flex;
        align-items: center;
        gap: ${theme.spacing.lg};
        flex: 1;
    }
`;

const SearchInputWrapper = styled.div`
    position: relative;
    flex: 1;
    max-width: 500px;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: ${theme.spacing.lg};
    top: 50%;
    transform: translateY(-50%);
    color: ${theme.text.tertiary};
    font-size: 16px;
    z-index: 2;
`;

const SearchInput = styled.input`
    width: 100%;
    height: 48px;
    padding: 0 48px 0 48px;
    border: 2px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    font-size: 16px;
    font-weight: 500;
    background: ${theme.surface};
    color: ${theme.text.secondary};
    transition: all ${theme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primaryGhost};
    }

    &::placeholder {
        color: ${theme.text.tertiary};
        font-weight: 400;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ClearButton = styled.button`
    position: absolute;
    right: ${theme.spacing.lg};
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    border: none;
    background: ${theme.surfaceAlt};
    color: ${theme.text.tertiary};
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all ${theme.transitions.normal};

    &:hover:not(:disabled) {
        background: ${theme.error};
        color: white;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const AdvancedToggle = styled.button<{ $expanded: boolean; $hasFilters: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    border: 2px solid ${props => props.$expanded || props.$hasFilters ? theme.primary : theme.border};
    background: ${props => props.$expanded || props.$hasFilters ? theme.primaryGhost : theme.surface};
    color: ${props => props.$expanded || props.$hasFilters ? theme.primary : theme.text.tertiary};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${theme.transitions.normal};
    white-space: nowrap;
    position: relative;

    &:hover {
        border-color: ${theme.primary};
        color: ${theme.primary};
    }
`;

const FilterIndicator = styled.span`
    background: ${theme.primary};
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const AdvancedSection = styled.div`
    padding: ${theme.spacing.xxl};
    background: ${theme.surfaceAlt};
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${theme.spacing.xl} ${theme.spacing.xxl};
    margin-bottom: ${theme.spacing.xxl};

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
    gap: ${theme.spacing.sm};
`;

const PriceGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
`;

const FilterLabel = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.secondary};
`;

const FilterInput = styled.input`
    height: 44px;
    padding: 0 ${theme.spacing.lg};
    border: 2px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${theme.surface};
    color: ${theme.text.secondary};
    transition: all ${theme.transitions.normal};
    width: 100%;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primaryGhost};
    }

    &::placeholder {
        color: ${theme.text.tertiary};
        font-weight: 400;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const SearchButton = styled.button`
    height: 48px;
    padding: 0 ${theme.spacing.xxl};
    border: none;
    background: ${theme.primary};
    color: white;
    border-radius: ${theme.radius.lg};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${theme.transitions.normal};
    white-space: nowrap;

    &:hover:not(:disabled) {
        background: ${theme.primaryLight};
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const ApplyButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg} ${theme.spacing.xxl};
    border: none;
    background: ${theme.primary};
    color: white;
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${theme.transitions.normal};

    &:hover:not(:disabled) {
        background: ${theme.primaryLight};
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const PriceInputs = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    width: 100%;

    input {
        flex: 1;
        min-width: 0;
    }
`;

const PriceSeparator = styled.span`
    font-weight: 600;
    color: ${theme.text.tertiary};
    flex-shrink: 0;
    padding: 0 ${theme.spacing.xs};
`;

const FilterActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${theme.spacing.lg};
    padding-top: ${theme.spacing.xl};
    border-top: 1px solid ${theme.border};
`;

const ClearAllButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    border: 2px solid ${theme.border};
    background: ${theme.surface};
    color: ${theme.text.tertiary};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${theme.transitions.normal};

    &:hover:not(:disabled) {
        border-color: ${theme.error};
        color: ${theme.error};
        background: ${theme.errorBg};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;