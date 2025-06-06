import React from 'react';
import styled from 'styled-components';
import { FaFilter, FaTimes, FaSearch, FaCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Professional Brand Theme - Premium Automotive CRM
const brandTheme = {
    // Primary Colors - Professional Blue Palette
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',

    // Surface Colors - Clean & Minimal
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',

    // Typography Colors
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },

    // Border Colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',

    // Status Colors - Automotive Grade
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2',
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },

    // Shadows - Professional Depth
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    // Spacing Scale
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    // Border Radius
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    }
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

    return (
        <FiltersContainer $expanded={showFilters}>
            {/* Filter Toggle Header */}
            <FiltersToggle onClick={onToggleFilters} $hasActiveFilters={hasActiveFilters()}>
                <ToggleLeft>
                    <FilterIcon $active={hasActiveFilters()}>
                        <FaFilter />
                    </FilterIcon>
                    <ToggleContent>
                        <ToggleTitle>
                            Filtry wyszukiwania
                            {activeFilterCount > 0 && (
                                <ActiveFiltersBadge>{activeFilterCount}</ActiveFiltersBadge>
                            )}
                        </ToggleTitle>
                        <ToggleSubtitle>
                            {hasActiveFilters()
                                ? `Wyniki: ${resultCount} ${resultCount === 1 ? 'klient' : resultCount > 1 && resultCount < 5 ? 'klientów' : 'klientów'}`
                                : 'Kliknij aby otworzyć opcje filtrowania'
                            }
                        </ToggleSubtitle>
                    </ToggleContent>
                </ToggleLeft>

                <ToggleActions>
                    {hasActiveFilters() && (
                        <ClearFiltersButton
                            onClick={(e) => {
                                e.stopPropagation();
                                onResetFilters();
                            }}
                        >
                            <FaTimes />
                            <span>Wyczyść</span>
                        </ClearFiltersButton>
                    )}
                    <ExpandIcon $expanded={showFilters}>
                        {showFilters ? <FaChevronUp /> : <FaChevronDown />}
                    </ExpandIcon>
                </ToggleActions>
            </FiltersToggle>

            {/* Expanded Filters Content */}
            {showFilters && (
                <FiltersContent>
                    <FiltersGrid>
                        <FilterGroup>
                            <FilterLabel htmlFor="name">
                                <FilterLabelIcon>
                                    <FaSearch />
                                </FilterLabelIcon>
                                Imię i nazwisko
                            </FilterLabel>
                            <FilterInputWrapper>
                                <FilterInput
                                    id="name"
                                    name="name"
                                    value={filters.name}
                                    onChange={onFilterChange}
                                    placeholder="Wyszukaj po imieniu i nazwisku..."
                                    $hasValue={!!filters.name}
                                />
                                {filters.name && (
                                    <ClearInputButton
                                        onClick={() => onFilterChange({
                                            target: { name: 'name', value: '' }
                                        } as React.ChangeEvent<HTMLInputElement>)}
                                    >
                                        <FaTimes />
                                    </ClearInputButton>
                                )}
                            </FilterInputWrapper>
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel htmlFor="email">
                                <FilterLabelIcon>
                                    <FaSearch />
                                </FilterLabelIcon>
                                Adres email
                            </FilterLabel>
                            <FilterInputWrapper>
                                <FilterInput
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={filters.email}
                                    onChange={onFilterChange}
                                    placeholder="Wyszukaj po adresie email..."
                                    $hasValue={!!filters.email}
                                />
                                {filters.email && (
                                    <ClearInputButton
                                        onClick={() => onFilterChange({
                                            target: { name: 'email', value: '' }
                                        } as React.ChangeEvent<HTMLInputElement>)}
                                    >
                                        <FaTimes />
                                    </ClearInputButton>
                                )}
                            </FilterInputWrapper>
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel htmlFor="phone">
                                <FilterLabelIcon>
                                    <FaSearch />
                                </FilterLabelIcon>
                                Numer telefonu
                            </FilterLabel>
                            <FilterInputWrapper>
                                <FilterInput
                                    id="phone"
                                    name="phone"
                                    value={filters.phone}
                                    onChange={onFilterChange}
                                    placeholder="Wyszukaj po numerze telefonu..."
                                    $hasValue={!!filters.phone}
                                />
                                {filters.phone && (
                                    <ClearInputButton
                                        onClick={() => onFilterChange({
                                            target: { name: 'phone', value: '' }
                                        } as React.ChangeEvent<HTMLInputElement>)}
                                    >
                                        <FaTimes />
                                    </ClearInputButton>
                                )}
                            </FilterInputWrapper>
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel htmlFor="minVisits">
                                <FilterLabelIcon>
                                    <FaFilter />
                                </FilterLabelIcon>
                                Minimalna liczba wizyt
                            </FilterLabel>
                            <FilterInputWrapper>
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
                                {filters.minVisits && (
                                    <ClearInputButton
                                        onClick={() => onFilterChange({
                                            target: { name: 'minVisits', value: '' }
                                        } as React.ChangeEvent<HTMLInputElement>)}
                                    >
                                        <FaTimes />
                                    </ClearInputButton>
                                )}
                            </FilterInputWrapper>
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel htmlFor="minTransactions">
                                <FilterLabelIcon>
                                    <FaFilter />
                                </FilterLabelIcon>
                                Minimalna liczba transakcji
                            </FilterLabel>
                            <FilterInputWrapper>
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
                                {filters.minTransactions && (
                                    <ClearInputButton
                                        onClick={() => onFilterChange({
                                            target: { name: 'minTransactions', value: '' }
                                        } as React.ChangeEvent<HTMLInputElement>)}
                                    >
                                        <FaTimes />
                                    </ClearInputButton>
                                )}
                            </FilterInputWrapper>
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel htmlFor="minRevenue">
                                <FilterLabelIcon>
                                    <FaFilter />
                                </FilterLabelIcon>
                                Minimalne przychody (PLN)
                            </FilterLabel>
                            <FilterInputWrapper>
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
                                {filters.minRevenue && (
                                    <ClearInputButton
                                        onClick={() => onFilterChange({
                                            target: { name: 'minRevenue', value: '' }
                                        } as React.ChangeEvent<HTMLInputElement>)}
                                    >
                                        <FaTimes />
                                    </ClearInputButton>
                                )}
                            </FilterInputWrapper>
                        </FilterGroup>
                    </FiltersGrid>

                    <FiltersFooter>
                        <ResultsSection>
                            {hasActiveFilters() ? (
                                <ResultsWithIcon>
                                    <FaCheck />
                                    <ResultsText>
                                        Znaleziono: {resultCount} {
                                        resultCount === 1 ? 'klienta' :
                                            resultCount > 1 && resultCount < 5 ? 'klientów' : 'klientów'
                                    }
                                    </ResultsText>
                                </ResultsWithIcon>
                            ) : (
                                <ResultsInfo>
                                    Skonfiguruj filtry aby zawęzić wyniki wyszukiwania
                                </ResultsInfo>
                            )}
                        </ResultsSection>

                        <FiltersActions>
                            {hasActiveFilters() && (
                                <SecondaryButton onClick={onResetFilters}>
                                    <FaTimes />
                                    <span>Wyczyść wszystkie</span>
                                </SecondaryButton>
                            )}
                            <PrimaryButton
                                onClick={onToggleFilters}
                                $hasFilters={hasActiveFilters()}
                            >
                                <FaSearch />
                                <span>Zamknij filtry</span>
                            </PrimaryButton>
                        </FiltersActions>
                    </FiltersFooter>
                </FiltersContent>
            )}
        </FiltersContainer>
    );
};

// Professional Styled Components - Premium Automotive Design
const FiltersContainer = styled.div<{ $expanded: boolean }>`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    ${props => props.$expanded && `
        box-shadow: ${brandTheme.shadow.md};
    `}
`;

const FiltersToggle = styled.button<{ $hasActiveFilters: boolean }>`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg};
    background: ${props => props.$hasActiveFilters
    ? `linear-gradient(135deg, ${brandTheme.primaryGhost} 0%, rgba(26, 54, 93, 0.02) 100%)`
    : brandTheme.surfaceAlt
};
    border: none;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: left;

    &:hover {
        background: ${props => props.$hasActiveFilters
    ? `linear-gradient(135deg, ${brandTheme.primaryGhost} 0%, rgba(26, 54, 93, 0.04) 100%)`
    : brandTheme.surfaceHover
};
    }
`;

const ToggleLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    flex: 1;
    min-width: 0;
`;

const FilterIcon = styled.div<{ $active: boolean }>`
    width: 48px;
    height: 48px;
    background: ${props => props.$active
    ? `linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%)`
    : brandTheme.surfaceElevated
};
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$active ? 'white' : brandTheme.text.tertiary};
    font-size: 18px;
    box-shadow: ${props => props.$active ? brandTheme.shadow.md : brandTheme.shadow.xs};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
`;

const ToggleContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const ToggleTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 18px;
    margin-bottom: ${brandTheme.spacing.xs};
    letter-spacing: -0.025em;
`;

const ActiveFiltersBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    background: ${brandTheme.primary};
    color: white;
    border-radius: ${brandTheme.radius.lg};
    font-size: 12px;
    font-weight: 700;
    padding: 0 ${brandTheme.spacing.xs};
    box-shadow: ${brandTheme.shadow.sm};
`;

const ToggleSubtitle = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    line-height: 1.4;
`;

const ToggleActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const ClearFiltersButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    border: 1px solid ${brandTheme.status.error}30;
    border-radius: ${brandTheme.radius.md};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.status.error};
        color: white;
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }

    span {
        @media (max-width: 640px) {
            display: none;
        }
    }
`;

const ExpandIcon = styled.div<{ $expanded: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: ${brandTheme.text.tertiary};
    font-size: 14px;
    transition: all 0.2s ease;
    transform: ${props => props.$expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const FiltersContent = styled.div`
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-top: 1px solid ${brandTheme.borderLight};
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: ${brandTheme.spacing.lg};
    margin-bottom: ${brandTheme.spacing.lg};
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${brandTheme.spacing.md};
    }
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const FilterLabel = styled.label`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    font-weight: 600;
    font-size: 14px;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
`;

const FilterLabelIcon = styled.div`
    color: ${brandTheme.text.muted};
    font-size: 12px;
`;

const FilterInputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const FilterInput = styled.input<{ $hasValue: boolean }>`
    width: 100%;
    height: 48px;
    padding: 0 ${brandTheme.spacing.md};
    padding-right: ${props => props.$hasValue ? '40px' : brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasValue ? brandTheme.primary : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${props => props.$hasValue ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
        background: ${brandTheme.surface};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }

    ${props => props.$hasValue && `
        font-weight: 600;
    `}
`;

const ClearInputButton = styled.button`
    position: absolute;
    right: ${brandTheme.spacing.sm};
    width: 24px;
    height: 24px;
    border: none;
    background: ${brandTheme.text.muted};
    color: white;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.status.error};
        transform: scale(1.1);
    }
`;

const FiltersFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: ${brandTheme.spacing.lg};
    border-top: 1px solid ${brandTheme.border};
    gap: ${brandTheme.spacing.md};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: ${brandTheme.spacing.md};
    }
`;

const ResultsSection = styled.div`
    display: flex;
    align-items: center;
`;

const ResultsWithIcon = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    color: ${brandTheme.status.success};
    font-weight: 600;
    font-size: 14px;

    svg {
        font-size: 16px;
    }
`;

const ResultsText = styled.span`
    color: ${brandTheme.text.primary};
`;

const ResultsInfo = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.muted};
    font-style: italic;
`;

const FiltersActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};

    @media (max-width: 768px) {
        justify-content: flex-end;
    }
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;

    &:hover {
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    span {
        @media (max-width: 480px) {
            display: none;
        }
    }
`;

const SecondaryButton = styled(BaseButton)`
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border-color: ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.xs};

    &:hover {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.text.primary};
        border-color: ${brandTheme.borderHover};
        box-shadow: ${brandTheme.shadow.sm};
    }
`;

const PrimaryButton = styled(BaseButton)<{ $hasFilters: boolean }>`
    background: ${props => props.$hasFilters
    ? `linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%)`
    : brandTheme.surfaceElevated
};
    color: ${props => props.$hasFilters ? 'white' : brandTheme.text.tertiary};
    box-shadow: ${props => props.$hasFilters ? brandTheme.shadow.sm : brandTheme.shadow.xs};

    &:hover {
        background: ${props => props.$hasFilters
    ? `linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%)`
    : brandTheme.surfaceHover
};
        box-shadow: ${props => props.$hasFilters ? brandTheme.shadow.md : brandTheme.shadow.sm};
    }
`;

export default ClientFilters;