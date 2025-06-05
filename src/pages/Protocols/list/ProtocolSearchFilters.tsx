// src/pages/Protocols/list/ProtocolSearchFilters.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaChevronDown, FaChevronUp, FaTimes, FaFilter } from 'react-icons/fa';
import { ProtocolStatus } from '../../../types';
import { format, isValid, parseISO } from 'date-fns';
import { useToast } from '../../../components/common/Toast/Toast';

// Brand Theme System
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

interface ProtocolSearchFiltersProps {
    onSearch: (searchCriteria: SearchCriteria) => void;
    availableServices?: string[];
}

export interface SearchCriteria {
    clientName?: string;
    licensePlate?: string;
    make?: string;
    model?: string;
    title?: string;
    dateFrom?: Date | null;
    dateTo?: Date | null;
    serviceName?: string;
    price?: {
        min?: number;
        max?: number;
    };
    [key: string]: string | Date | null | { min?: number; max?: number; } | undefined;
}

export const ProtocolSearchFilters: React.FC<ProtocolSearchFiltersProps> = ({
                                                                                onSearch,
                                                                                availableServices = []
                                                                            }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({});
    const { showToast } = useToast();

    // Quick search state
    const [quickSearch, setQuickSearch] = useState('');

    // Handle quick search
    const handleQuickSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuickSearch(value);

        // Search across multiple fields
        if (value.trim()) {
            const quickCriteria: SearchCriteria = {
                clientName: value,
                licensePlate: value,
                make: value,
                model: value,
                title: value
            };
            onSearch(quickCriteria);
        } else {
            onSearch({});
        }
    };

    // Handle advanced search submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const filteredCriteria = Object.entries(searchCriteria).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (key === 'price') {
                    const priceObj = value as { min?: number; max?: number };
                    if (priceObj.min || priceObj.max) {
                        acc[key] = priceObj;
                    }
                } else {
                    acc[key] = value;
                }
            }
            return acc;
        }, {} as SearchCriteria);

        // Validate date range
        if (filteredCriteria.dateFrom && filteredCriteria.dateTo) {
            if (filteredCriteria.dateFrom > filteredCriteria.dateTo) {
                showToast('error', 'Data początkowa nie może być późniejsza niż data końcowa', 3000);
                return;
            }
        }

        onSearch(filteredCriteria);
        setQuickSearch(''); // Clear quick search when using advanced
    };

    // Reset all search criteria
    const handleReset = () => {
        setSearchCriteria({});
        setQuickSearch('');
        onSearch({});
    };

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSearchCriteria(prev => ({ ...prev, [name]: value }));
    };

    // Handle price range inputs
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const priceType = name === 'minPrice' ? 'min' : 'max';

        setSearchCriteria(prev => ({
            ...prev,
            price: {
                ...(prev.price || {}),
                [priceType]: value ? Number(value) : undefined
            }
        }));
    };

    // Handle date inputs
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (!value) {
            setSearchCriteria(prev => ({
                ...prev,
                [name]: null
            }));
            return;
        }

        const date = parseISO(value);
        if (isValid(date)) {
            setSearchCriteria(prev => ({
                ...prev,
                [name]: date
            }));
        }
    };

    // Format date for HTML date input
    const formatDateForInput = (date: Date | null | undefined): string => {
        if (!date || !isValid(date)) return '';
        return format(date, 'yyyy-MM-dd');
    };

    const hasQuickSearch = quickSearch.trim().length > 0;
    const hasAdvancedCriteria = Object.keys(searchCriteria).some(key => {
        const value = searchCriteria[key];
        if (key === 'price') {
            const priceObj = value as { min?: number; max?: number } | undefined;
            return priceObj && (priceObj.min || priceObj.max);
        }
        return value !== undefined && value !== null && value !== '';
    });

    return (
        <SearchContainer>
            {/* Quick Search */}
            <QuickSearchSection>
                <QuickSearchWrapper>
                    <SearchIcon>
                        <FaSearch />
                    </SearchIcon>
                    <QuickSearchInput
                        type="text"
                        value={quickSearch}
                        onChange={handleQuickSearch}
                        placeholder="Szybkie wyszukiwanie - klient, pojazd, numer rejestracyjny..."
                    />
                    {hasQuickSearch && (
                        <ClearButton onClick={() => {
                            setQuickSearch('');
                            onSearch({});
                        }}>
                            <FaTimes />
                        </ClearButton>
                    )}
                </QuickSearchWrapper>

                <AdvancedToggle
                    onClick={() => setIsExpanded(!isExpanded)}
                    $expanded={isExpanded}
                >
                    <FaFilter />
                    Filtry zaawansowane
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </AdvancedToggle>
            </QuickSearchSection>

            {/* Advanced Search */}
            {isExpanded && (
                <AdvancedSearchSection>
                    <Form onSubmit={handleSubmit}>
                        <FormGrid>
                            {/* Row 1 */}
                            <FormGroup>
                                <Label htmlFor="clientName">Klient</Label>
                                <ModernInput
                                    id="clientName"
                                    type="text"
                                    name="clientName"
                                    value={searchCriteria.clientName || ''}
                                    onChange={handleInputChange}
                                    placeholder="Imię, nazwisko lub firma"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="licensePlate">Nr rejestracyjny</Label>
                                <ModernInput
                                    id="licensePlate"
                                    type="text"
                                    name="licensePlate"
                                    value={searchCriteria.licensePlate || ''}
                                    onChange={handleInputChange}
                                    placeholder="Pełny lub częściowy"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="make">Marka pojazdu</Label>
                                <ModernInput
                                    id="make"
                                    type="text"
                                    name="make"
                                    value={searchCriteria.make || ''}
                                    onChange={handleInputChange}
                                    placeholder="np. BMW, Audi"
                                />
                            </FormGroup>

                            {/* Row 2 */}
                            <FormGroup>
                                <Label htmlFor="model">Model pojazdu</Label>
                                <ModernInput
                                    id="model"
                                    type="text"
                                    name="model"
                                    value={searchCriteria.model || ''}
                                    onChange={handleInputChange}
                                    placeholder="np. 5, A4"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="title">Tytuł wizyty</Label>
                                <ModernInput
                                    id="title"
                                    type="text"
                                    name="title"
                                    value={searchCriteria.title || ''}
                                    onChange={handleInputChange}
                                    placeholder="Tytuł wizyty"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="serviceName">Rodzaj usługi</Label>
                                <ModernSelect
                                    id="serviceName"
                                    name="serviceName"
                                    value={searchCriteria.serviceName || ''}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Wszystkie usługi</option>
                                    {availableServices.map((service, index) => (
                                        <option key={index} value={service}>
                                            {service}
                                        </option>
                                    ))}
                                </ModernSelect>
                            </FormGroup>

                            {/* Row 3 - Date and Price Range */}
                            <FormGroup>
                                <Label>Od daty</Label>
                                <ModernInput
                                    type="date"
                                    name="dateFrom"
                                    value={formatDateForInput(searchCriteria.dateFrom)}
                                    onChange={handleDateChange}
                                    max={formatDateForInput(searchCriteria.dateTo)}
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Do daty</Label>
                                <ModernInput
                                    type="date"
                                    name="dateTo"
                                    value={formatDateForInput(searchCriteria.dateTo)}
                                    onChange={handleDateChange}
                                    min={formatDateForInput(searchCriteria.dateFrom)}
                                />
                            </FormGroup>

                            <PriceRangeGroup>
                                <Label>Zakres ceny (PLN)</Label>
                                <PriceInputs>
                                    <ModernInput
                                        type="number"
                                        name="minPrice"
                                        value={searchCriteria.price?.min || ''}
                                        onChange={handlePriceChange}
                                        placeholder="Od"
                                        min="0"
                                        step="0.01"
                                    />
                                    <PriceSeparator>-</PriceSeparator>
                                    <ModernInput
                                        type="number"
                                        name="maxPrice"
                                        value={searchCriteria.price?.max || ''}
                                        onChange={handlePriceChange}
                                        placeholder="Do"
                                        min="0"
                                        step="0.01"
                                    />
                                </PriceInputs>
                            </PriceRangeGroup>
                        </FormGrid>

                        <FormActions>
                            <SecondaryButton type="button" onClick={handleReset}>
                                <FaTimes />
                                Wyczyść
                            </SecondaryButton>
                            <PrimaryButton type="submit">
                                <FaSearch />
                                Wyszukaj
                            </PrimaryButton>
                        </FormActions>
                    </Form>
                </AdvancedSearchSection>
            )}

            {/* Search Status */}
            {(hasQuickSearch || hasAdvancedCriteria) && (
                <SearchStatus>
                    <StatusText>
                        Aktywne wyszukiwanie: {hasQuickSearch ? 'szybkie' : 'zaawansowane'}
                    </StatusText>
                    <ClearAllButton onClick={handleReset}>
                        Wyczyść wszystko
                    </ClearAllButton>
                </SearchStatus>
            )}
        </SearchContainer>
    );
};

// Modern Styled Components
const SearchContainer = styled.div`
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

const QuickSearchWrapper = styled.div`
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

const QuickSearchInput = styled.input`
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

    &:hover {
        background: #ef4444;
        color: white;
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

const AdvancedSearchSection = styled.div`
    padding: 24px;
    background: ${brandTheme.surfaceAlt};
`;

const Form = styled.form`
    width: 100%;
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px 24px;
    margin-bottom: 24px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const PriceRangeGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: #374151;
`;

const ModernInput = styled.input`
    height: 44px;
    padding: 0 16px;
    border: 2px solid ${brandTheme.border};
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
`;

const ModernSelect = styled.select`
    height: 44px;
    padding: 0 16px;
    border: 2px solid ${brandTheme.border};
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }
`;

const PriceInputs = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const PriceSeparator = styled.span`
    font-weight: 600;
    color: ${brandTheme.neutral};
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid ${brandTheme.border};
`;

const SecondaryButton = styled.button`
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

    &:hover {
        border-color: #ef4444;
        color: #ef4444;
        background: #fef2f2;
    }
`;

const PrimaryButton = styled.button`
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
        background: ${brandTheme.primaryDark};
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
`;

const SearchStatus = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: ${brandTheme.primaryGhost};
    border-top: 1px solid ${brandTheme.border};
`;

const StatusText = styled.span`
    font-size: 14px;
    font-weight: 500;
    color: ${brandTheme.primary};
`;

const ClearAllButton = styled.button`
    background: none;
    border: none;
    color: ${brandTheme.primary};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primary};
        color: white;
    }
`;

export default ProtocolSearchFilters;