import React, {useCallback, useState} from 'react';
import styled from 'styled-components';
import {FaCar, FaCheck, FaEye, FaFilter, FaSearch, FaTimes, FaUser} from 'react-icons/fa';
import {VehicleFilters} from './types';

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
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    }
};

interface EnhancedVehicleFiltersProps {
    filters: VehicleFilters;
    appliedFilters: VehicleFilters;
    showFilters: boolean;
    onToggleFilters: () => void;
    onFiltersChange: (filters: VehicleFilters) => void;
    onApplyFilters: () => void;
    onResetFilters: () => void;
    resultCount: number;
}

// NOWY KOMPONENT - tylko panel filtrów bez nagłówka
const EnhancedVehicleFilters: React.FC<EnhancedVehicleFiltersProps> = ({
                                                                           filters,
                                                                           appliedFilters,
                                                                           showFilters,
                                                                           onFiltersChange,
                                                                           onApplyFilters,
                                                                           onResetFilters,
                                                                           resultCount
                                                                       }) => {
    const [localFilters, setLocalFilters] = useState<VehicleFilters>(filters);

    const hasActiveFilters = useCallback(() => {
        return Object.values(appliedFilters).some(val => val !== '');
    }, [appliedFilters]);

    const hasChanges = useCallback(() => {
        return Object.keys(localFilters).some(key =>
            localFilters[key as keyof VehicleFilters] !== appliedFilters[key as keyof VehicleFilters]
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
            licensePlate: '',
            make: '',
            model: '',
            ownerName: '',
            minServices: '',
            maxServices: ''
        };
        setLocalFilters(emptyFilters);
        onResetFilters();
    }, [onResetFilters]);

    const clearField = useCallback((fieldName: keyof VehicleFilters) => {
        const newFilters = {
            ...localFilters,
            [fieldName]: ''
        };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    }, [localFilters, onFiltersChange]);

    // Sync local filters when external filters change
    React.useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    if (!showFilters) return null;

    return (
        <FiltersContent>
            <FiltersGrid>
                <FilterGroup>
                    <FilterLabel htmlFor="licensePlate">
                        <FilterLabelIcon>
                            <FaCar />
                        </FilterLabelIcon>
                        Numer rejestracyjny
                    </FilterLabel>
                    <FilterInputWrapper>
                        <FilterInput
                            id="licensePlate"
                            name="licensePlate"
                            value={localFilters.licensePlate}
                            onChange={handleInputChange}
                            placeholder="np. ABC 123D, WZ 12345..."
                            $hasValue={!!localFilters.licensePlate}
                        />
                        {localFilters.licensePlate && (
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
                        Marka pojazdu
                    </FilterLabel>
                    <FilterInputWrapper>
                        <FilterInput
                            id="make"
                            name="make"
                            value={localFilters.make}
                            onChange={handleInputChange}
                            placeholder="np. BMW, Audi, Mercedes..."
                            $hasValue={!!localFilters.make}
                        />
                        {localFilters.make && (
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
                        Model pojazdu
                    </FilterLabel>
                    <FilterInputWrapper>
                        <FilterInput
                            id="model"
                            name="model"
                            value={localFilters.model}
                            onChange={handleInputChange}
                            placeholder="np. X5, A4, C-Class..."
                            $hasValue={!!localFilters.model}
                        />
                        {localFilters.model && (
                            <ClearInputButton onClick={() => clearField('model')}>
                                <FaTimes />
                            </ClearInputButton>
                        )}
                    </FilterInputWrapper>
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel htmlFor="ownerName">
                        <FilterLabelIcon>
                            <FaUser />
                        </FilterLabelIcon>
                        Właściciel pojazdu
                    </FilterLabel>
                    <FilterInputWrapper>
                        <FilterInput
                            id="ownerName"
                            name="ownerName"
                            value={localFilters.ownerName}
                            onChange={handleInputChange}
                            placeholder="np. Jan Kowalski, Anna..."
                            $hasValue={!!localFilters.ownerName}
                        />
                        {localFilters.ownerName && (
                            <ClearInputButton onClick={() => clearField('ownerName')}>
                                <FaTimes />
                            </ClearInputButton>
                        )}
                    </FilterInputWrapper>
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel htmlFor="minServices">
                        <FilterLabelIcon>
                            <FaEye />
                        </FilterLabelIcon>
                        Minimalna liczba wizyt
                    </FilterLabel>
                    <FilterInputWrapper>
                        <FilterInput
                            id="minServices"
                            name="minServices"
                            type="number"
                            min="0"
                            value={localFilters.minServices}
                            onChange={handleInputChange}
                            placeholder="np. 5, 10, 20..."
                            $hasValue={!!localFilters.minServices}
                        />
                        {localFilters.minServices && (
                            <ClearInputButton onClick={() => clearField('minServices')}>
                                <FaTimes />
                            </ClearInputButton>
                        )}
                    </FilterInputWrapper>
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel htmlFor="maxServices">
                        <FilterLabelIcon>
                            <FaEye />
                        </FilterLabelIcon>
                        Maksymalna liczba wizyt
                    </FilterLabel>
                    <FilterInputWrapper>
                        <FilterInput
                            id="maxServices"
                            name="maxServices"
                            type="number"
                            min="0"
                            value={localFilters.maxServices}
                            onChange={handleInputChange}
                            placeholder="np. 50, 100..."
                            $hasValue={!!localFilters.maxServices}
                        />
                        {localFilters.maxServices && (
                            <ClearInputButton onClick={() => clearField('maxServices')}>
                                <FaTimes />
                            </ClearInputButton>
                        )}
                    </FilterInputWrapper>
                </FilterGroup>
            </FiltersGrid>

            {(localFilters.minServices || localFilters.maxServices) && (
                <VisitRangeDisplay>
                    <VisitRangeTitle>
                        <FaEye />
                        Zakres liczby wizyt:
                    </VisitRangeTitle>
                    <VisitRangeInfo>
                        {localFilters.minServices && localFilters.maxServices
                            ? `${localFilters.minServices} - ${localFilters.maxServices} wizyt`
                            : localFilters.minServices
                                ? `Minimum ${localFilters.minServices} wizyt`
                                : `Maksimum ${localFilters.maxServices} wizyt`
                        }
                    </VisitRangeInfo>
                </VisitRangeDisplay>
            )}

            <FiltersFooter>
                <ResultsSection>
                    {hasActiveFilters() ? (
                        <ResultsWithIcon>
                            <FaCheck />
                            <ResultsText>
                                Znaleziono: {resultCount} {
                                resultCount === 1 ? 'pojazd' :
                                    resultCount > 1 && resultCount < 5 ? 'pojazdy' : 'pojazdów'
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

// Styled Components - podobne do klientów
const FiltersContent = styled.div`
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-bottom: 1px solid ${brandTheme.borderLight};
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
            max-height: 0;
            padding: 0 ${brandTheme.spacing.lg};
        }
        to {
            opacity: 1;
            transform: translateY(0);
            max-height: 500px;
            padding: ${brandTheme.spacing.lg};
        }
    }
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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

const VisitRangeDisplay = styled.div`
    background: linear-gradient(135deg, ${brandTheme.status.infoLight} 0%, #f0f9ff 100%);
    border: 1px solid ${brandTheme.status.info}30;
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const VisitRangeTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    font-weight: 600;
    color: ${brandTheme.status.info};
    font-size: 14px;

    svg {
        font-size: 12px;
    }
`;

const VisitRangeInfo = styled.div`
    background: ${brandTheme.surface};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 14px;
    border: 1px solid ${brandTheme.status.info}20;
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

export default EnhancedVehicleFilters;