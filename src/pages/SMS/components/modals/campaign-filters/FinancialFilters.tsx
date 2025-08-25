import React, {useEffect} from 'react';
import {FaInfinity, FaInfoCircle} from 'react-icons/fa';
import {
    FormGroup,
    FormHelp,
    FormInput,
    FormLabel,
    FormRangeInput,
    FormSelect
} from '../campaign-common/styled/FormComponents';
import styled from 'styled-components';

interface FinancialFiltersProps {
    filters: any;
    onFilterChange: (name: string, value: any) => void;
}

/**
 * Komponent z filtrami finansowymi dla kampanii SMS
 * Pozwala na filtrowanie odbiorców według całkowitych wydatków, liczby transakcji, itp.
 */
const FinancialFiltersComponent: React.FC<FinancialFiltersProps> = ({ filters, onFilterChange }) => {
    // Ustawia domyślne wartości segmentów dla różnych typów klientów
    useEffect(() => {
        if (filters.customerValueSegment) {
            // Automatycznie dostosuj suwaki na podstawie wybranego segmentu
            switch (filters.customerValueSegment) {
                case 'vip':
                    onFilterChange('minTotalRevenue', 10000);
                    onFilterChange('maxTotalRevenue', 0); // Bez górnego limitu
                    break;
                case 'premium':
                    onFilterChange('minTotalRevenue', 5000);
                    onFilterChange('maxTotalRevenue', 10000);
                    break;
                case 'standard':
                    onFilterChange('minTotalRevenue', 1000);
                    onFilterChange('maxTotalRevenue', 5000);
                    break;
                case 'economy':
                    onFilterChange('minTotalRevenue', 0);
                    onFilterChange('maxTotalRevenue', 1000);
                    break;
                default:
                    // Nie zmieniaj wartości dla opcji "Wszyscy klienci"
                    break;
            }
        }
    }, [filters.customerValueSegment, onFilterChange]);

    // Obsługa zmiany pól formularza
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numericValue = value === '' ? 0 : parseFloat(value);
        onFilterChange(name, numericValue);
    };

    // Obsługa zmiany zakresu (slider)
    const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numericValue = parseFloat(value);
        onFilterChange(name, numericValue);
    };

    // Obsługa przełączenia opcji "bez górnej granicy"
    const handleNoUpperLimitToggle = () => {
        onFilterChange('maxTotalRevenue', filters.maxTotalRevenue > 0 ? 0 : 20000);
    };

    // Formatowanie wartości pieniężnych
    const formatCurrency = (value: number): string => {
        if (value === 0 && filters.maxTotalRevenue === 0) {
            return "Bez limitu";
        }
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " zł";
    };

    return (
        <div>
            {/* Sekcja dla VIP/Premium klientów */}
            <FormGroup style={{ marginBottom: '20px' }}>
                <FormLabel>Segment klientów według wartości</FormLabel>
                <FormSelect
                    name="customerValueSegment"
                    value={filters.customerValueSegment || ''}
                    onChange={(e) => onFilterChange('customerValueSegment', e.target.value)}
                >
                    <option value="">Wszyscy klienci</option>
                    <option value="vip">Klienci VIP (powyżej 10 000 zł)</option>
                    <option value="premium">Klienci Premium (5 000 - 10 000 zł)</option>
                    <option value="standard">Klienci Standard (1 000 - 5 000 zł)</option>
                    <option value="economy">Klienci Economy (poniżej 1 000 zł)</option>
                </FormSelect>
                <FormHelp>
                    Wybór segmentu automatycznie dostosuje zakres wydatków
                </FormHelp>
            </FormGroup>

            {/* Przedział cenowy z suwakiem */}
            <FormGroup style={{ marginTop: '20px' }}>
                <FormLabel>Filtruj według zakresu wydatków</FormLabel>

                <RangeLabel>
                    Minimalna kwota:
                    <RangeValue>{formatCurrency(filters.minTotalRevenue || 0)}</RangeValue>
                </RangeLabel>
                <FormRangeInput
                    type="range"
                    name="minTotalRevenue"
                    min="0"
                    max="20000"
                    step="500"
                    value={filters.minTotalRevenue || 0}
                    onChange={handleRangeChange}
                />

                <RangeLabel style={{ marginTop: '20px' }}>
                    Maksymalna kwota:
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {filters.maxTotalRevenue > 0 ? (
                            <RangeValue>{formatCurrency(filters.maxTotalRevenue || 20000)}</RangeValue>
                        ) : (
                            <InfinityValue>
                                <FaInfinity style={{ marginRight: '5px' }} />
                                Bez górnej granicy
                            </InfinityValue>
                        )}
                    </div>
                </RangeLabel>
                {filters.maxTotalRevenue > 0 && (
                    <FormRangeInput
                        type="range"
                        name="maxTotalRevenue"
                        min="1000"
                        max="50000"
                        step="1000"
                        value={filters.maxTotalRevenue || 20000}
                        onChange={handleRangeChange}
                    />
                )}

                <NoLimitToggle
                    onClick={handleNoUpperLimitToggle}
                    active={filters.maxTotalRevenue === 0}
                >
                    {filters.maxTotalRevenue === 0 ? "Ustaw górny limit" : "Bez górnego limitu"}
                </NoLimitToggle>
            </FormGroup>

            <FormGroup>
                <FormLabel>Minimalna wartość pojedynczej usługi</FormLabel>
                <FormInput
                    type="number"
                    name="minServiceValue"
                    value={filters.minServiceValue || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="100"
                    placeholder="Np. 500"
                />
                <FormHelp>
                    Klienci, którzy skorzystali z usługi o wartości co najmniej wskazanej kwoty
                </FormHelp>
            </FormGroup>

            <FormHelp style={{ marginTop: '16px' }}>
                <FaInfoCircle style={{ marginRight: '5px' }} />
                Filtry finansowe pozwalają wybrać klientów na podstawie ich historii wydatków w Twojej firmie.
                Jest to szczególnie przydatne przy tworzeniu kampanii lojalnościowych lub ofert dla określonych
                segmentów klientów.
            </FormHelp>
        </div>
    );
};

// Dodatkowe styled components
const RangeLabel = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
    color: #495057;
`;

const RangeValue = styled.div`
    font-weight: 500;
    color: #3498db;
`;

const InfinityValue = styled.div`
    display: flex;
    align-items: center;
    font-weight: 500;
    color: #3498db;
`;

const NoLimitToggle = styled.button<{ active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 12px;
    padding: 6px 12px;
    background-color: ${props => props.active ? '#e3f2fd' : '#f8f9fa'};
    color: ${props => props.active ? '#3498db' : '#6c757d'};
    border: 1px solid ${props => props.active ? '#bee3f8' : '#dee2e6'};
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background-color: ${props => props.active ? '#d0e8f8' : '#e9ecef'};
    }
`;

export const FinancialFilters = FinancialFiltersComponent;
export default FinancialFiltersComponent;