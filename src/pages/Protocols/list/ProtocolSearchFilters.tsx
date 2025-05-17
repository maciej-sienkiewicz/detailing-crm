import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { ProtocolStatus } from '../../../types';
import { format, isValid, parseISO } from 'date-fns';
import { useToast } from '../../../components/common/Toast/Toast';

interface ProtocolSearchFiltersProps {
    onSearch: (searchCriteria: SearchCriteria) => void;
    availableServices?: string[];
}

// Interface representing all possible search criteria
export interface SearchCriteria {
    clientName?: string;
    licensePlate?: string;
    make?: string;
    model?: string;
    title?: string;  // Pole title do szukania po tytule wizyty
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

    // Handle search query submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Filter out empty values to avoid unnecessary API calls
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

        // Validate date range if provided
        if (filteredCriteria.dateFrom && filteredCriteria.dateTo) {
            if (filteredCriteria.dateFrom > filteredCriteria.dateTo) {
                showToast('error', 'Data początkowa nie może być późniejsza niż data końcowa', 3000);
                return;
            }
        }

        onSearch(filteredCriteria);
    };

    // Reset all search criteria
    const handleReset = () => {
        setSearchCriteria({});
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

    // Handle date inputs (type="date")
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Jeśli wartość jest pusta, ustaw null
        if (!value) {
            setSearchCriteria(prev => ({
                ...prev,
                [name]: null
            }));
            return;
        }

        // Konwertuj string na Date
        const date = parseISO(value);

        // Sprawdź czy data jest prawidłowa
        if (isValid(date)) {
            setSearchCriteria(prev => ({
                ...prev,
                [name]: date
            }));
        }
    };

    // Toggle expanded/collapsed state of filters
    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    // Handle license plate field change
    const handleLicensePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setSearchCriteria(prev => ({ ...prev, licensePlate: value }));
    };

    // Format date for HTML date input (YYYY-MM-DD)
    const formatDateForInput = (date: Date | null | undefined): string => {
        if (!date || !isValid(date)) return '';
        return format(date, 'yyyy-MM-dd');
    };

    return (
        <FiltersContainer expanded={isExpanded}>
            <FiltersHeader onClick={toggleExpanded}>
                <FilterTitle>
                    <FilterIcon><FaFilter /></FilterIcon>
                    Filtry zaawansowane
                </FilterTitle>
                <FilterExpandIcon>
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </FilterExpandIcon>
            </FiltersHeader>

            {isExpanded && (
                <FiltersContent>
                    <Form onSubmit={handleSubmit}>
                        <FilterRow>
                            <FilterColumn>
                                <FormGroup>
                                    <Label htmlFor="clientName">Klient</Label>
                                    <StyledInput
                                        id="clientName"
                                        type="text"
                                        name="clientName"
                                        value={searchCriteria.clientName || ''}
                                        onChange={handleInputChange}
                                        placeholder="Imię, nazwisko lub firma"
                                    />
                                </FormGroup>
                            </FilterColumn>

                            <FilterColumn>
                                <FormGroup>
                                    <Label htmlFor="make">Marka pojazdu</Label>
                                    <StyledInput
                                        id="make"
                                        type="text"
                                        name="make"
                                        value={searchCriteria.make || ''}
                                        onChange={handleInputChange}
                                        placeholder="np. BMW, Audi"
                                    />
                                </FormGroup>
                            </FilterColumn>

                            <FilterColumn>
                                <FormGroup>
                                    <Label htmlFor="title">Tytuł wizyty</Label>
                                    <StyledInput
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={searchCriteria.title || ''}
                                        onChange={handleInputChange}
                                        placeholder="Tytuł wizyty"
                                    />
                                </FormGroup>
                            </FilterColumn>

                            <FilterColumn>
                                <FormGroup>
                                    <Label>Od daty</Label>
                                        <DateInputWrapper>
                                            <DateInputField
                                                type="date"
                                                name="dateFrom"
                                                value={formatDateForInput(searchCriteria.dateFrom)}
                                                onChange={handleDateChange}
                                                max={formatDateForInput(searchCriteria.dateTo)}
                                            />
                                        </DateInputWrapper>
                                </FormGroup>
                            </FilterColumn>

                            <FilterColumn>
                                <FormGroup>
                                    <DateInputWrapper>
                                        <Label>Do daty</Label>
                                        <DateInputField
                                            type="date"
                                            name="dateTo"
                                            value={formatDateForInput(searchCriteria.dateTo)}
                                            onChange={handleDateChange}
                                            min={formatDateForInput(searchCriteria.dateFrom)}
                                        />
                                    </DateInputWrapper>

                                </FormGroup>
                            </FilterColumn>
                        </FilterRow>

                        <FilterRow>
                            <FilterColumn>
                                <FormGroup>
                                    <Label htmlFor="licensePlate">Nr rejestracyjny</Label>
                                    <StyledInput
                                        id="licensePlate"
                                        type="text"
                                        name="licensePlate"
                                        value={searchCriteria.licensePlate || ''}
                                        onChange={handleLicensePlateChange}
                                        placeholder="Pełny lub częściowy"
                                    />
                                </FormGroup>
                            </FilterColumn>

                            <FilterColumn>
                                <FormGroup>
                                    <Label htmlFor="model">Model pojazdu</Label>
                                    <StyledInput
                                        id="model"
                                        type="text"
                                        name="model"
                                        value={searchCriteria.model || ''}
                                        onChange={handleInputChange}
                                        placeholder="np. 5, A4"
                                    />
                                </FormGroup>
                            </FilterColumn>

                            <FilterColumn>
                                <FormGroup>
                                    <Label htmlFor="serviceName">Rodzaj usługi</Label>
                                    <StyledSelect
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
                                    </StyledSelect>
                                </FormGroup>
                            </FilterColumn>

                            <FilterColumn>
                                <FormGroup>
                                    <PriceInputsContainer>
                                        <PriceInputWrapper>
                                            <PriceLabelContainer>
                                                <Label>Od ceny</Label>
                                            </PriceLabelContainer>
                                            <PriceInputField
                                                type="number"
                                                name="minPrice"
                                                value={searchCriteria.price?.min || ''}
                                                onChange={handlePriceChange}
                                                min="0"
                                                step="0.01"
                                            />
                                        </PriceInputWrapper>
                                    </PriceInputsContainer>
                                </FormGroup>
                            </FilterColumn>

                            <FilterColumn>
                                <FormGroup>
                                    <PriceInputsContainer>
                                        <PriceInputWrapper>
                                            <PriceLabelContainer>
                                                <Label>Do ceny</Label>
                                            </PriceLabelContainer>
                                            <PriceInputField
                                                type="number"
                                                name="maxPrice"
                                                value={searchCriteria.price?.max || ''}
                                                onChange={handlePriceChange}
                                                min="0"
                                                step="0.01"
                                            />
                                        </PriceInputWrapper>
                                    </PriceInputsContainer>
                                </FormGroup>
                            </FilterColumn>
                        </FilterRow>

                        <ButtonContainer>
                            <ResetButton type="button" onClick={handleReset}>
                                <FaTimes /> Wyczyść filtry
                            </ResetButton>
                            <SearchButton type="submit">
                                <FaSearch /> Szukaj
                            </SearchButton>
                        </ButtonContainer>
                    </Form>
                </FiltersContent>
            )}
        </FiltersContainer>
    );
};

// Styled components
const FiltersContainer = styled.div<{ expanded: boolean }>`
    margin-bottom: 20px;
    background-color: white;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: all 0.3s ease;
`;

const FiltersHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    background-color: #f9f9f9;
    user-select: none;

    &:hover {
        background-color: #f0f0f0;
    }
`;

const FilterTitle = styled.div`
    font-weight: 500;
    font-size: 14px;
    color: #34495e;
    display: flex;
    align-items: center;
`;

const FilterIcon = styled.span`
    margin-right: 8px;
    color: #3498db;
    font-size: 14px;
`;

const FilterExpandIcon = styled.span`
    color: #7f8c8d;
    font-size: 12px;
`;

const FiltersContent = styled.div`
    padding: 16px;
`;

const Form = styled.form`
    width: 100%;
`;

const FilterRow = styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 16px;

    @media (max-width: 1200px) {
        flex-wrap: wrap;
    }
`;

const FilterColumn = styled.div`
    flex: 1;
    min-width: 200px;

    @media (max-width: 1200px) {
        min-width: calc(50% - 8px);
    }

    @media (max-width: 768px) {
        min-width: 100%;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 500;
    color: #34495e;
    margin-bottom: 6px;
`;

const StyledInput = styled.input`
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    height: 38px;

    &:focus {
        outline: none;
        border-color: #3498db;
    }

    &::placeholder {
        color: #bbb;
    }
`;

const StyledSelect = styled.select`
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;
    height: 38px;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237f8c8d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 12px;

    &:focus {
        outline: none;
        border-color: #3498db;
    }
`;

// Nowo zoptymalizowane komponenty dla pól daty
const DateInputsContainer = styled.div`
    display: flex;
    gap: 8px;
    width: 100%;
`;

const DateInputWrapper = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
`;

const DateLabelContainer = styled.div`
    margin-bottom: 0px;
`;

const DateLabel = styled.span`
    font-size: 12px;
    color: #7f8c8d;
`;

const DateInputField = styled.input`
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    height: 38px;

    &:focus {
        outline: none;
        border-color: #3498db;
    }

    &::-webkit-calendar-picker-indicator {
        cursor: pointer;
        opacity: 0.6;
    }
`;

// Nowo zoptymalizowane komponenty dla pól ceny
const PriceInputsContainer = styled.div`
    display: flex;
    gap: 8px;
    width: 100%;
`;

const PriceInputWrapper = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
`;

const PriceLabelContainer = styled.div`
    margin-bottom: 0px;
`;

const PriceLabel = styled.span`
    font-size: 12px;
    color: #7f8c8d;
`;

const PriceInputField = styled.input`
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    height: 38px;

    &:focus {
        outline: none;
        border-color: #3498db;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    height: 38px;
`;

const SearchButton = styled(Button)`
    background-color: #3498db;
    color: white;
    border: none;

    &:hover {
        background-color: #2980b9;
    }
`;

const ResetButton = styled(Button)`
    background-color: #f8f9fa;
    color: #7f8c8d;
    border: 1px solid #ddd;

    &:hover {
        background-color: #f1f1f1;
        color: #e74c3c;
    }
`;

export default ProtocolSearchFilters;