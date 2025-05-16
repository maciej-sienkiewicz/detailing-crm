// src/pages/Protocols/list/ProtocolSearchFilters.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaFilter, FaCalendarAlt, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { ProtocolStatus, ProtocolStatusLabels } from '../../../types';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { pl } from 'date-fns/locale';
import { format, isValid } from 'date-fns';
import LicensePlateField from '../../../components/common/LicensePlateField';
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
    status?: ProtocolStatus;
    dateFrom?: Date | null;
    dateTo?: Date | null;
    serviceName?: string;
    price?: {
        min?: number;
        max?: number;
    };
    [key: string]: string | Date | null | ProtocolStatus | { min?: number; max?: number; } | undefined;
}

type DateRangeState = {
    startDate: Date | null;
    endDate: Date | null;
    key: string;
};

export const ProtocolSearchFilters: React.FC<ProtocolSearchFiltersProps> = ({
                                                                                onSearch,
                                                                                availableServices = []
                                                                            }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({});
    const [dateRange, setDateRange] = useState<DateRangeState>({
        startDate: null,
        endDate: null,
        key: 'selection',
    });
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

    // Update date range in search criteria
    useEffect(() => {
        if (dateRange.startDate || dateRange.endDate) {
            setSearchCriteria(prev => ({
                ...prev,
                dateFrom: dateRange.startDate,
                dateTo: dateRange.endDate
            }));
        }
    }, [dateRange]);

    // Reset all search criteria
    const handleReset = () => {
        setSearchCriteria({});
        setDateRange({
            startDate: null,
            endDate: null,
            key: 'selection',
        });
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

    // Format date for display
    const formatDate = (date: Date | null | undefined): string => {
        if (!date || !isValid(date)) return '';
        return format(date, 'dd.MM.yyyy', { locale: pl });
    };

    // Toggle expanded/collapsed state of filters
    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
        if (showDatePicker) {
            setShowDatePicker(false);
        }
    };

    // Open date picker
    const handleOpenDatePicker = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDatePicker(!showDatePicker);
    };

    // Close date picker when clicking outside
    const handleDatePickerOutsideClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDatePicker(false);
    };

    // Handle date range selection
    const handleDateRangeChange = (ranges: RangeKeyDict) => {
        const selection = ranges.selection;
        if (selection) {
            setDateRange({
                startDate: selection.startDate,
                endDate: selection.endDate,
                key: 'selection'
            });
        }
    };

    // Handle license plate field change
    const handleLicensePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setSearchCriteria(prev => ({ ...prev, licensePlate: value }));
    };

    return (
        <SearchContainer>
            <BasicSearch onSubmit={handleSubmit}>
                <InputGroup>
                    <SearchIcon><FaSearch /></SearchIcon>
                    <SearchInput
                        type="text"
                        name="clientName"
                        value={searchCriteria.clientName || ''}
                        onChange={handleInputChange}
                        placeholder="Szukaj po nazwie klienta lub firmie..."
                    />
                </InputGroup>

                <ExpandButton type="button" onClick={toggleExpanded}>
                    <FaFilter />
                    <ButtonText>{isExpanded ? 'Zwiń filtry' : 'Filtry zaawansowane'}</ButtonText>
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </ExpandButton>

                <SearchButton type="submit">Szukaj</SearchButton>
                <ResetButton type="button" onClick={handleReset}>
                    <FaTimes />
                </ResetButton>
            </BasicSearch>

            {isExpanded && (
                <AdvancedFilters>
                    <FilterRow>
                        <FilterColumn>
                            <FilterLabel>Status wizyty</FilterLabel>
                            <SelectInput
                                name="status"
                                value={searchCriteria.status || ''}
                                onChange={handleInputChange}
                            >
                                <option value="">Wszystkie statusy</option>
                                {Object.entries(ProtocolStatusLabels).map(([status, label]) => (
                                    <option key={status} value={status}>
                                        {label}
                                    </option>
                                ))}
                            </SelectInput>
                        </FilterColumn>

                        <FilterColumn>
                            <FilterLabel>Nr rejestracyjny</FilterLabel>
                            <LicensePlateWrapper>
                                <LicensePlateField
                                    id="licensePlateFilter"
                                    name="licensePlate"
                                    value={searchCriteria.licensePlate || ''}
                                    onChange={handleLicensePlateChange}
                                    placeholder="Podaj nr rejestracyjny"
                                    onSearchClick={() => {}}
                                />
                            </LicensePlateWrapper>
                        </FilterColumn>

                        <FilterColumn>
                            <FilterLabel>Okres wizyty</FilterLabel>
                            <DateRangeInputGroup onClick={handleOpenDatePicker}>
                                <DateRangeIcon><FaCalendarAlt /></DateRangeIcon>
                                <DateRangeText>
                                    {searchCriteria.dateFrom || searchCriteria.dateTo
                                        ? `${formatDate(searchCriteria.dateFrom)} - ${formatDate(searchCriteria.dateTo)}`
                                        : 'Wybierz zakres dat'}
                                </DateRangeText>
                            </DateRangeInputGroup>
                            {showDatePicker && (
                                <DatePickerWrapper onClick={handleDatePickerOutsideClick}>
                                    <DatePickerContent onClick={(e) => e.stopPropagation()}>
                                        <DateRangePicker
                                            ranges={[dateRange as any]}
                                            onChange={handleDateRangeChange}
                                            months={2}
                                            direction="horizontal"
                                            locale={pl}
                                            weekStartsOn={1}
                                        />
                                        <DatePickerButtons>
                                            <DatePickerButton
                                                type="button"
                                                onClick={() => setShowDatePicker(false)}
                                            >
                                                Zastosuj
                                            </DatePickerButton>
                                            <DatePickerClearButton
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDateRange({
                                                        startDate: null,
                                                        endDate: null,
                                                        key: 'selection',
                                                    });
                                                    setSearchCriteria(prev => ({
                                                        ...prev,
                                                        dateFrom: null,
                                                        dateTo: null
                                                    }));
                                                    setShowDatePicker(false);
                                                }}
                                            >
                                                Wyczyść
                                            </DatePickerClearButton>
                                        </DatePickerButtons>
                                    </DatePickerContent>
                                </DatePickerWrapper>
                            )}
                        </FilterColumn>
                    </FilterRow>

                    <FilterRow>
                        <FilterColumn>
                            <FilterLabel>Marka pojazdu</FilterLabel>
                            <Input
                                type="text"
                                name="make"
                                value={searchCriteria.make || ''}
                                onChange={handleInputChange}
                                placeholder="np. BMW, Audi, Mercedes"
                            />
                        </FilterColumn>

                        <FilterColumn>
                            <FilterLabel>Model pojazdu</FilterLabel>
                            <Input
                                type="text"
                                name="model"
                                value={searchCriteria.model || ''}
                                onChange={handleInputChange}
                                placeholder="np. X5, A4, E-Class"
                            />
                        </FilterColumn>

                        <FilterColumn>
                            <FilterLabel>Rodzaj usługi</FilterLabel>
                            <SelectInput
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
                            </SelectInput>
                        </FilterColumn>
                    </FilterRow>

                    <FilterRow>
                        <FilterColumn>
                            <FilterLabel>Cena (od)</FilterLabel>
                            <Input
                                type="number"
                                name="minPrice"
                                value={searchCriteria.price?.min || ''}
                                onChange={handlePriceChange}
                                placeholder="Minimalna kwota"
                                min="0"
                                step="0.01"
                            />
                        </FilterColumn>

                        <FilterColumn>
                            <FilterLabel>Cena (do)</FilterLabel>
                            <Input
                                type="number"
                                name="maxPrice"
                                value={searchCriteria.price?.max || ''}
                                onChange={handlePriceChange}
                                placeholder="Maksymalna kwota"
                                min="0"
                                step="0.01"
                            />
                        </FilterColumn>

                        <FilterColumn />
                    </FilterRow>
                </AdvancedFilters>
            )}
        </SearchContainer>
    );
};

// Styled components
const SearchContainer = styled.div`
    margin-bottom: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const BasicSearch = styled.form`
    display: flex;
    align-items: center;
    padding: 15px 20px;
    gap: 10px;

    @media (max-width: 768px) {
        flex-wrap: wrap;
    }
`;

const InputGroup = styled.div`
    position: relative;
    flex: 1;
    min-width: 200px;

    @media (max-width: 768px) {
        width: 100%;
    }
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #95a5a6;
    font-size: 14px;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 10px 10px 10px 36px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.2s;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const ExpandButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f8f9fa;
    color: #34495e;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
    white-space: nowrap;

    &:hover {
        background-color: #f1f1f1;
    }

    @media (max-width: 768px) {
        flex: 1;
        justify-content: center;
    }
`;

const ButtonText = styled.span`
    @media (max-width: 576px) {
        display: none;
    }
`;

const SearchButton = styled.button`
    padding: 10px 15px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
        background-color: #2980b9;
    }

    @media (max-width: 768px) {
        flex: 1;
    }
`;

const ResetButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    background-color: #f8f9fa;
    color: #7f8c8d;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
        background-color: #f1f1f1;
        color: #e74c3c;
    }
`;

const AdvancedFilters = styled.div`
    padding: 20px;
    border-top: 1px solid #eee;
    background-color: #f9f9f9;
`;

const FilterRow = styled.div`
    display: flex;
    gap: 20px;
    margin-bottom: 15px;

    &:last-child {
        margin-bottom: 0;
    }

    @media (max-width: 992px) {
        flex-direction: column;
        gap: 15px;
    }
`;

const FilterColumn = styled.div`
    flex: 1;
`;

const FilterLabel = styled.label`
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #34495e;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const SelectInput = styled.select`
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const DateRangeInputGroup = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    transition: border-color 0.2s;

    &:hover {
        border-color: #bbdefb;
    }
`;

const DateRangeIcon = styled.div`
    color: #7f8c8d;
    font-size: 14px;
    margin-right: 10px;
`;

const DateRangeText = styled.div`
    font-size: 14px;
    color: #34495e;
`;

const DatePickerWrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const DatePickerContent = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    overflow: hidden;

    @media (max-width: 768px) {
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    }
`;

const DatePickerButtons = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 10px 20px;
    background-color: #f8f9fa;
    border-top: 1px solid #eee;
`;

const DatePickerButton = styled.button`
    padding: 8px 16px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
        background-color: #2980b9;
    }
`;

const DatePickerClearButton = styled.button`
    padding: 8px 16px;
    background-color: white;
    color: #34495e;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
        background-color: #f5f5f5;
    }
`;

const LicensePlateWrapper = styled.div`
    // Może potrzebować dodatkowych stylów dla ładnego wyświetlania
`;

export default ProtocolSearchFilters;