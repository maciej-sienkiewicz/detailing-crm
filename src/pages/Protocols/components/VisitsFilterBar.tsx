// src/pages/Protocols/components/VisitsFilterBar.tsx - FINALNA WERSJA
import React, {useRef} from 'react';
import styled from 'styled-components';
import {FaSearch, FaTimes} from 'react-icons/fa';
import {VisitsFilterState} from '../hooks/useVisitsFilters';
import {ServiceAutocomplete, ServiceOption} from './ServiceAutocomplete';

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
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    },
    radius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        xxl: '16px'
    }
};

interface VisitsFilterBarProps {
    filters: VisitsFilterState;
    onFiltersChange: (filters: Partial<VisitsFilterState>) => void;
    onApplyFilters: () => void;
    onClearAll: () => void;
    loading?: boolean;
    availableServices?: ServiceOption[];
    servicesLoading?: boolean;
}

export const VisitsFilterBar: React.FC<VisitsFilterBarProps> = ({
                                                                    filters,
                                                                    onFiltersChange,
                                                                    onApplyFilters,
                                                                    onClearAll,
                                                                    loading = false,
                                                                    availableServices = [],
                                                                    servicesLoading = false
                                                                }) => {
    // Ref do śledzenia czy jesteśmy w trakcie wykonywania wyszukiwania
    const isApplyingRef = useRef(false);

    // ✅ NOWE: Ref do śledzenia ostatnich zastosowanych filtrów
    const lastAppliedFiltersRef = useRef<string>(JSON.stringify(filters));

    // ✅ NOWE: Ref do śledzenia czy użytkownik dokonał zmian od ostatniego wyszukiwania
    const hasUnappliedChangesRef = useRef(false);

    const handleFilterChange = (key: keyof VisitsFilterState, value: any) => {
        onFiltersChange({ [key]: value });
        // Oznacz że są niezastosowane zmiany
        hasUnappliedChangesRef.current = true;
    };

    const clearField = (fieldName: keyof VisitsFilterState) => {
        onFiltersChange({ [fieldName]: fieldName === 'serviceIds' ? [] : '' });
        // Oznacz że są niezastosowane zmiany
        hasUnappliedChangesRef.current = true;
    };

    const hasChanges = () => {
        return Object.entries(filters).some(([key, value]) => {
            if (value === undefined || value === null || value === '') return false;
            if (key === 'serviceIds' && Array.isArray(value) && value.length === 0) return false;
            return true;
        });
    };

    // ✅ NOWE: Sprawdź czy filtry się zmieniły od ostatniego wyszukiwania
    const hasFiltersChanged = () => {
        const currentFilters = JSON.stringify(filters);
        return currentFilters !== lastAppliedFiltersRef.current;
    };

    // ✅ POPRAWIONE: Obsługa klawisza Enter
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !loading && hasFiltersChanged()) {
            e.preventDefault();
            isApplyingRef.current = true;
            hasUnappliedChangesRef.current = false;
            lastAppliedFiltersRef.current = JSON.stringify(filters);
            onApplyFilters();
            // Reset flagi po krótkiej chwili
            setTimeout(() => {
                isApplyingRef.current = false;
            }, 300);
        }
    };

    // ✅ POPRAWIONE: Obsługa wyjścia z pola (onBlur)
    const handleBlur = () => {
        // Sprawdź czy były jakiekolwiek zmiany od ostatniego wyszukiwania
        // (działa także gdy użytkownik wyczyści pole - wtedy też są zmiany!)
        if (!loading && !isApplyingRef.current && hasUnappliedChangesRef.current) {
            // Opóźnienie pozwala na kliknięcie przycisków (np. "Zastosuj filtry")
            // zanim wykona się wyszukiwanie
            setTimeout(() => {
                // Sprawdź ponownie czy użytkownik nie kliknął przycisku w międzyczasie
                if (!isApplyingRef.current && hasUnappliedChangesRef.current) {
                    isApplyingRef.current = true;
                    hasUnappliedChangesRef.current = false;
                    lastAppliedFiltersRef.current = JSON.stringify(filters);
                    onApplyFilters();
                    setTimeout(() => {
                        isApplyingRef.current = false;
                    }, 100);
                }
            }, 200);
        }
    };

    // ✅ POPRAWIONE: Obsługa kliknięcia przycisku "Zastosuj filtry"
    const handleApplyClick = () => {
        isApplyingRef.current = true;
        hasUnappliedChangesRef.current = false;
        lastAppliedFiltersRef.current = JSON.stringify(filters);
        onApplyFilters();
        // Reset flagi po krótkiej chwili
        setTimeout(() => {
            isApplyingRef.current = false;
        }, 300);
    };

    // ✅ POPRAWIONE: Obsługa kliknięcia przycisku "Wyczyść wszystkie"
    const handleClearAllClick = () => {
        isApplyingRef.current = true;
        hasUnappliedChangesRef.current = false;
        lastAppliedFiltersRef.current = JSON.stringify({});
        onClearAll();
        // Reset flagi po krótkiej chwili
        setTimeout(() => {
            isApplyingRef.current = false;
        }, 300);
    };

    return (
        <FiltersContent>
            <FiltersGrid>
                <FilterGroup>
                    <FilterLabel htmlFor="clientName">
                        <FilterLabelIcon>
                            <FaSearch />
                        </FilterLabelIcon>
                        Klient
                    </FilterLabel>
                    <FilterInputWrapper>
                        <FilterInput
                            id="clientName"
                            name="clientName"
                            value={filters.clientName || ''}
                            onChange={(e) => handleFilterChange('clientName', e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleBlur}
                            placeholder="Nazwa klienta"
                            disabled={loading}
                            $hasValue={!!filters.clientName}
                        />
                        {filters.clientName && (
                            <ClearInputButton onClick={() => clearField('clientName')}>
                                <FaTimes />
                            </ClearInputButton>
                        )}
                    </FilterInputWrapper>
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel htmlFor="licensePlate">
                        <FilterLabelIcon>
                            <FaSearch />
                        </FilterLabelIcon>
                        Nr rejestracyjny
                    </FilterLabel>
                    <FilterInputWrapper>
                        <FilterInput
                            id="licensePlate"
                            name="licensePlate"
                            value={filters.licensePlate || ''}
                            onChange={(e) => handleFilterChange('licensePlate', e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleBlur}
                            placeholder="Numer rejestracyjny"
                            disabled={loading}
                            $hasValue={!!filters.licensePlate}
                        />
                        {filters.licensePlate && (
                            <ClearInputButton onClick={() => clearField('licensePlate')}>
                                <FaTimes />
                            </ClearInputButton>
                        )}
                    </FilterInputWrapper>
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel htmlFor="make">
                        <FilterLabelIcon>
                            <FaSearch />
                        </FilterLabelIcon>
                        Marka
                    </FilterLabel>
                    <FilterInputWrapper>
                        <FilterInput
                            id="make"
                            name="make"
                            value={filters.make || ''}
                            onChange={(e) => handleFilterChange('make', e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleBlur}
                            placeholder="Marka pojazdu"
                            disabled={loading}
                            $hasValue={!!filters.make}
                        />
                        {filters.make && (
                            <ClearInputButton onClick={() => clearField('make')}>
                                <FaTimes />
                            </ClearInputButton>
                        )}
                    </FilterInputWrapper>
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel htmlFor="model">
                        <FilterLabelIcon>
                            <FaSearch />
                        </FilterLabelIcon>
                        Model
                    </FilterLabel>
                    <FilterInputWrapper>
                        <FilterInput
                            id="model"
                            name="model"
                            value={filters.model || ''}
                            onChange={(e) => handleFilterChange('model', e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleBlur}
                            placeholder="Model pojazdu"
                            disabled={loading}
                            $hasValue={!!filters.model}
                        />
                        {filters.model && (
                            <ClearInputButton onClick={() => clearField('model')}>
                                <FaTimes />
                            </ClearInputButton>
                        )}
                    </FilterInputWrapper>
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel htmlFor="serviceIds">
                        <FilterLabelIcon>
                            <FaSearch />
                        </FilterLabelIcon>
                        Rodzaj usługi
                    </FilterLabel>
                    <ServiceAutocomplete
                        value={filters.serviceIds || []}
                        onChange={(value) => handleFilterChange('serviceIds', value)}
                        options={availableServices}
                        disabled={loading}
                        loading={servicesLoading}
                        placeholder="Wyszukaj usługi..."
                    />
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel htmlFor="startDate">
                        <FilterLabelIcon>
                            <FaSearch />
                        </FilterLabelIcon>
                        Data od
                    </FilterLabel>
                    <FilterInputWrapper>
                        <FilterInput
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={filters.startDate || ''}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleBlur}
                            disabled={loading}
                            $hasValue={!!filters.startDate}
                        />
                        {filters.startDate && (
                            <ClearInputButton onClick={() => clearField('startDate')}>
                                <FaTimes />
                            </ClearInputButton>
                        )}
                    </FilterInputWrapper>
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel htmlFor="endDate">
                        <FilterLabelIcon>
                            <FaSearch />
                        </FilterLabelIcon>
                        Data do
                    </FilterLabel>
                    <FilterInputWrapper>
                        <FilterInput
                            id="endDate"
                            name="endDate"
                            type="date"
                            value={filters.endDate || ''}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            min={filters.startDate}
                            onKeyDown={handleKeyDown}
                            onBlur={handleBlur}
                            disabled={loading}
                            $hasValue={!!filters.endDate}
                        />
                        {filters.endDate && (
                            <ClearInputButton onClick={() => clearField('endDate')}>
                                <FaTimes />
                            </ClearInputButton>
                        )}
                    </FilterInputWrapper>
                </FilterGroup>

                <PriceGroup>
                    <FilterLabel>
                        <FilterLabelIcon>
                            <FaSearch />
                        </FilterLabelIcon>
                        Cena (PLN)
                    </FilterLabel>
                    <PriceInputs>
                        <FilterInputWrapper>
                            <FilterInput
                                type="number"
                                value={filters.minPrice || ''}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                                placeholder="Od"
                                min="0"
                                step="0.01"
                                disabled={loading}
                                $hasValue={!!filters.minPrice}
                            />
                            {filters.minPrice && (
                                <ClearInputButton onClick={() => clearField('minPrice')}>
                                    <FaTimes />
                                </ClearInputButton>
                            )}
                        </FilterInputWrapper>
                        <PriceSeparator>-</PriceSeparator>
                        <FilterInputWrapper>
                            <FilterInput
                                type="number"
                                value={filters.maxPrice || ''}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                                placeholder="Do"
                                min="0"
                                step="0.01"
                                disabled={loading}
                                $hasValue={!!filters.maxPrice}
                            />
                            {filters.maxPrice && (
                                <ClearInputButton onClick={() => clearField('maxPrice')}>
                                    <FaTimes />
                                </ClearInputButton>
                            )}
                        </FilterInputWrapper>
                    </PriceInputs>
                </PriceGroup>
            </FiltersGrid>

            <FiltersFooter>
                <ResultsSection>
                    {hasChanges() ? (
                        <ResultsInfo>
                            💡 Wyszukiwanie: naciśnij Enter, wyjdź z pola lub kliknij "Zastosuj filtry"
                        </ResultsInfo>
                    ) : (
                        <ResultsInfo>
                            Wprowadź kryteria filtrowania aby zawęzić wyniki
                        </ResultsInfo>
                    )}
                </ResultsSection>

                <FiltersActions>
                    {hasChanges() && (
                        <SecondaryButton onClick={handleClearAllClick} disabled={loading}>
                            <FaTimes />
                            <span>Wyczyść wszystkie</span>
                        </SecondaryButton>
                    )}
                    <PrimaryButton
                        onClick={handleApplyClick}
                        $hasChanges={hasChanges()}
                        disabled={loading}
                    >
                        <FaSearch />
                        <span>Zastosuj filtry</span>
                    </PrimaryButton>
                </FiltersActions>
            </FiltersFooter>
        </FiltersContent>
    );
};

// Styled Components (bez zmian)

const FiltersContent = styled.div`
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
            padding: 0 ${brandTheme.spacing.lg};
        }
        to {
            opacity: 1;
            transform: translateY(0);
            max-height: 400px;
            padding: ${brandTheme.spacing.lg};
        }
    }
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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

const PriceGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const FilterLabel = styled.label`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    font-weight: 600;
    font-size: 12px;
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
    flex: 1;
`;

const FilterInput = styled.input<{ $hasValue: boolean }>`
    width: 100%;
    height: 36px;
    padding: 0 ${brandTheme.spacing.md};
    padding-right: ${props => props.$hasValue ? '32px' : brandTheme.spacing.md};
    border: 1px solid ${props => props.$hasValue ? brandTheme.primary : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 500;
    background: ${props => props.$hasValue ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 2px ${brandTheme.primaryGhost};
        background: ${brandTheme.surface};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    ${props => props.$hasValue && `
        font-weight: 600;
    `}
`;

const ClearInputButton = styled.button`
    position: absolute;
    right: ${brandTheme.spacing.sm};
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

const PriceInputs = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    width: 100%;
`;

const PriceSeparator = styled.span`
    font-weight: 600;
    color: ${brandTheme.text.tertiary};
    flex-shrink: 0;
    padding: 0 ${brandTheme.spacing.xs};
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

const ResultsInfo = styled.div`
    font-size: 12px;
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
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 36px;

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

    &:hover:not(:disabled) {
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