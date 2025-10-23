import React, {useCallback, useState} from 'react';
import styled from 'styled-components';
import {FaCheck, FaChevronDown, FaChevronUp, FaFilter, FaSearch, FaTimes} from 'react-icons/fa';

const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',
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
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px'
    },
    radius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        xxl: '16px'
    }
};

export interface ClientFilters {
    name: string;
    email: string;
    phone: string;
    minVisits: string;
    minVehicles: string;
    minRevenue: string;
}

interface EnhancedClientFilters {
    filters: ClientFilters;
    appliedFilters: ClientFilters;
    showFilters: boolean;
    onToggleFilters: () => void;
    onFiltersChange: (filters: ClientFilters) => void;
    onApplyFilters: () => void;
    onResetFilters: () => void;
    resultCount: number;
}

const EnhancedClientFilters: React.FC<EnhancedClientFilters> = ({
                                                                    filters,
                                                                    appliedFilters,
                                                                    showFilters,
                                                                    onFiltersChange,
                                                                    onApplyFilters,
                                                                    onResetFilters,
                                                                    resultCount
                                                                }) => {
    const [localFilters, setLocalFilters] = useState<ClientFilters>(filters);

    const hasActiveFilters = useCallback(() => {
        return Object.values(appliedFilters).some(val => val !== '');
    }, [appliedFilters]);

    const hasChanges = useCallback(() => {
        return Object.keys(localFilters).some(key =>
            localFilters[key as keyof ClientFilters] !== appliedFilters[key as keyof ClientFilters]
        );
    }, [localFilters, appliedFilters]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newFilters = {
            ...localFilters,
            [name]: value
        };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    }, [localFilters, onFiltersChange]);

    const handleApplyFilters = useCallback(() => {
        onApplyFilters();
    }, [onApplyFilters]);

    const handleResetFilters = useCallback(() => {
        const emptyFilters = {
            name: '',
            email: '',
            phone: '',
            minVisits: '',
            minVehicles: '',
            minRevenue: ''
        };
        setLocalFilters(emptyFilters);
        onResetFilters();
    }, [onResetFilters]);

    const clearField = useCallback((fieldName: keyof ClientFilters) => {
        const newFilters = {
            ...localFilters,
            [fieldName]: ''
        };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    }, [localFilters, onFiltersChange]);

    React.useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    if (!showFilters) return null;

    return (
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
                            value={localFilters.name}
                            onChange={handleInputChange}
                            placeholder="Wyszukaj po imieniu i nazwisku..."
                            $hasValue={!!localFilters.name}
                        />
                        {localFilters.name && (
                            <ClearInputButton onClick={() => clearField('name')}>
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
                            value={localFilters.email}
                            onChange={handleInputChange}
                            placeholder="Wyszukaj po adresie email..."
                            $hasValue={!!localFilters.email}
                        />
                        {localFilters.email && (
                            <ClearInputButton onClick={() => clearField('email')}>
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
                            value={localFilters.phone}
                            onChange={handleInputChange}
                            placeholder="Wyszukaj po numerze telefonu..."
                            $hasValue={!!localFilters.phone}
                        />
                        {localFilters.phone && (
                            <ClearInputButton onClick={() => clearField('phone')}>
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
                            value={localFilters.minVisits}
                            onChange={handleInputChange}
                            placeholder="Min. liczba wizyt..."
                            $hasValue={!!localFilters.minVisits}
                        />
                        {localFilters.minVisits && (
                            <ClearInputButton onClick={() => clearField('minVisits')}>
                                <FaTimes />
                            </ClearInputButton>
                        )}
                    </FilterInputWrapper>
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel htmlFor="minVehicles">
                        <FilterLabelIcon>
                            <FaFilter />
                        </FilterLabelIcon>
                        Minimalna liczba pojazdów
                    </FilterLabel>
                    <FilterInputWrapper>
                        <FilterInput
                            id="minVehicles"
                            name="minVehicles"
                            type="number"
                            min="0"
                            value={localFilters.minVehicles}
                            onChange={handleInputChange}
                            placeholder="Min. liczba pojazdów..."
                            $hasValue={!!localFilters.minVehicles}
                        />
                        {localFilters.minVehicles && (
                            <ClearInputButton onClick={() => clearField('minVehicles')}>
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
                            value={localFilters.minRevenue}
                            onChange={handleInputChange}
                            placeholder="Min. kwota przychodów..."
                            $hasValue={!!localFilters.minRevenue}
                        />
                        {localFilters.minRevenue && (
                            <ClearInputButton onClick={() => clearField('minRevenue')}>
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
                            Wprowadź kryteria i kliknij "Zastosuj filtry"
                        </ResultsInfo>
                    )}
                </ResultsSection>

                <FiltersActions>
                    {hasActiveFilters() && (
                        <SecondaryButton onClick={handleResetFilters}>
                            <FaTimes />
                            <span>Wyczyść wszystkie</span>
                        </SecondaryButton>
                    )}
                    <PrimaryButton
                        onClick={handleApplyFilters}
                        $hasChanges={hasChanges()}
                        disabled={!hasChanges()}
                    >
                        <FaSearch />
                        <span>Zastosuj filtry</span>
                    </PrimaryButton>
                </FiltersActions>
            </FiltersFooter>
        </FiltersContent>
    );
};

const FiltersContent = styled.div`
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surfaceAlt};
    border-bottom: 1px solid ${brandTheme.borderLight};
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
            max-height: 0;
            padding: 0 ${brandTheme.spacing.md};
        }
        to {
            opacity: 1;
            transform: translateY(0);
            max-height: 500px;
            padding: ${brandTheme.spacing.md};
        }
    }
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.md};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${brandTheme.spacing.sm};
    }
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const FilterLabel = styled.label`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    font-weight: 600;
    font-size: 11px;
    color: ${brandTheme.text.primary};
    margin-bottom: 2px;
`;

const FilterLabelIcon = styled.div`
    color: ${brandTheme.text.muted};
    font-size: 10px;
`;

const FilterInputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const FilterInput = styled.input<{ $hasValue: boolean }>`
    width: 100%;
    height: 36px;
    padding: 0 ${brandTheme.spacing.sm};
    padding-right: ${props => props.$hasValue ? '32px' : brandTheme.spacing.sm};
    border: 1.5px solid ${props => props.$hasValue ? brandTheme.primary : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 500;
    background: ${props => props.$hasValue ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 2px ${brandTheme.primaryGhost};
        background: ${brandTheme.surface};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
        font-size: 11px;
    }

    ${props => props.$hasValue && `
        font-weight: 600;
    `}
`;

const ClearInputButton = styled.button`
    position: absolute;
    right: ${brandTheme.spacing.xs};
    width: 20px;
    height: 20px;
    border: none;
    background: ${brandTheme.text.muted};
    color: white;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
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
    padding-top: ${brandTheme.spacing.md};
    border-top: 1px solid ${brandTheme.border};
    gap: ${brandTheme.spacing.sm};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: ${brandTheme.spacing.sm};
    }
`;

const ResultsSection = styled.div`
    display: flex;
    align-items: center;
`;

const ResultsWithIcon = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    color: ${brandTheme.status.success};
    font-weight: 600;
    font-size: 11px;

    svg {
        font-size: 12px;
    }
`;

const ResultsText = styled.span`
    color: ${brandTheme.text.primary};
`;

const ResultsInfo = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.muted};
    font-style: italic;
`;

const FiltersActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};

    @media (max-width: 768px) {
        justify-content: flex-end;
    }
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: 6px ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 32px;

    &:hover {
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    svg {
        font-size: 10px;
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

const PrimaryButton = styled(BaseButton)<{ $hasChanges: boolean }>`
    background: ${props => props.$hasChanges
            ? `linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%)`
            : brandTheme.surfaceElevated
    };
    color: ${props => props.$hasChanges ? 'white' : brandTheme.text.tertiary};
    box-shadow: ${props => props.$hasChanges ? brandTheme.shadow.sm : brandTheme.shadow.xs};

    &:hover:not(:disabled) {
        background: ${props => props.$hasChanges
                ? `linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%)`
                : brandTheme.surfaceHover
        };
        box-shadow: ${props => props.$hasChanges ? brandTheme.shadow.md : brandTheme.shadow.sm};
    }
`;

export default EnhancedClientFilters;