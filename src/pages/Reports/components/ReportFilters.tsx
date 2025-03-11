import React from 'react';
import styled from 'styled-components';
import { FaCalendarAlt, FaFilter, FaChartLine, FaChartBar, FaChartPie } from 'react-icons/fa';

interface ReportFiltersProps {
    timeRange: 'day' | 'week' | 'month' | 'quarter' | 'year';
    onTimeRangeChange: (range: 'day' | 'week' | 'month' | 'quarter' | 'year') => void;
    reportType: string;
    onReportTypeChange: (type: string) => void;
    additionalFilters?: {
        employeeId?: string;
        serviceType?: string;
        clientType?: string;
    };
    onFilterChange: (name: string, value: string) => void;
    employees?: Array<{ id: string; name: string }>;
    serviceTypes?: Array<{ id: string; name: string }>;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
                                                         timeRange,
                                                         onTimeRangeChange,
                                                         reportType,
                                                         onReportTypeChange,
                                                         additionalFilters = {},
                                                         onFilterChange,
                                                         employees = [],
                                                         serviceTypes = []
                                                     }) => {
    return (
        <FiltersContainer>
            <FilterSection>
                <FilterLabel>
                    <FaCalendarAlt /> Zakres czasu
                </FilterLabel>
                <ButtonGroup>
                    <FilterButton
                        active={timeRange === 'day'}
                        onClick={() => onTimeRangeChange('day')}
                    >
                        Dzień
                    </FilterButton>
                    <FilterButton
                        active={timeRange === 'week'}
                        onClick={() => onTimeRangeChange('week')}
                    >
                        Tydzień
                    </FilterButton>
                    <FilterButton
                        active={timeRange === 'month'}
                        onClick={() => onTimeRangeChange('month')}
                    >
                        Miesiąc
                    </FilterButton>
                    <FilterButton
                        active={timeRange === 'quarter'}
                        onClick={() => onTimeRangeChange('quarter')}
                    >
                        Kwartał
                    </FilterButton>
                    <FilterButton
                        active={timeRange === 'year'}
                        onClick={() => onTimeRangeChange('year')}
                    >
                        Rok
                    </FilterButton>
                </ButtonGroup>
            </FilterSection>

            <FilterSection>
                <FilterLabel>
                    <FaChartLine /> Typ raportu
                </FilterLabel>
                <ButtonGroup>
                    <FilterButton
                        active={reportType === 'overview'}
                        onClick={() => onReportTypeChange('overview')}
                    >
                        <FaChartLine /> Przegląd
                    </FilterButton>
                    <FilterButton
                        active={reportType === 'tasks'}
                        onClick={() => onReportTypeChange('tasks')}
                    >
                        <FaChartBar /> Zlecenia
                    </FilterButton>
                    <FilterButton
                        active={reportType === 'revenue'}
                        onClick={() => onReportTypeChange('revenue')}
                    >
                        <FaChartPie /> Przychody
                    </FilterButton>
                    <FilterButton
                        active={reportType === 'customers'}
                        onClick={() => onReportTypeChange('customers')}
                    >
                        <FaChartBar /> Klienci
                    </FilterButton>
                    <FilterButton
                        active={reportType === 'services'}
                        onClick={() => onReportTypeChange('services')}
                    >
                        <FaChartPie /> Usługi
                    </FilterButton>
                </ButtonGroup>
            </FilterSection>

            <ExpandableFiltersSection>
                <ExpandableHeader>
                    <FaFilter /> Dodatkowe filtry
                </ExpandableHeader>

                <FiltersGrid>
                    {employees.length > 0 && (
                        <FilterItem>
                            <FilterLabel>Pracownik</FilterLabel>
                            <Select
                                value={additionalFilters.employeeId || ''}
                                onChange={(e) => onFilterChange('employeeId', e.target.value)}
                            >
                                <option value="">Wszyscy pracownicy</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name}
                                    </option>
                                ))}
                            </Select>
                        </FilterItem>
                    )}

                    {serviceTypes.length > 0 && (
                        <FilterItem>
                            <FilterLabel>Typ usługi</FilterLabel>
                            <Select
                                value={additionalFilters.serviceType || ''}
                                onChange={(e) => onFilterChange('serviceType', e.target.value)}
                            >
                                <option value="">Wszystkie usługi</option>
                                {serviceTypes.map(service => (
                                    <option key={service.id} value={service.id}>
                                        {service.name}
                                    </option>
                                ))}
                            </Select>
                        </FilterItem>
                    )}

                    <FilterItem>
                        <FilterLabel>Typ klienta</FilterLabel>
                        <Select
                            value={additionalFilters.clientType || ''}
                            onChange={(e) => onFilterChange('clientType', e.target.value)}
                        >
                            <option value="">Wszyscy klienci</option>
                            <option value="individual">Klienci indywidualni</option>
                            <option value="business">Klienci biznesowi</option>
                        </Select>
                    </FilterItem>
                </FiltersGrid>
            </ExpandableFiltersSection>
        </FiltersContainer>
    );
};

const FiltersContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 15px;
    margin-bottom: 20px;
`;

const FilterSection = styled.div`
    margin-bottom: 15px;
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const ExpandableFiltersSection = styled.div`
    border-top: 1px solid #eee;
    padding-top: 15px;
`;

const ExpandableHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 15px;
`;

const FilterLabel = styled.div`
    font-size: 14px;
    color: #7f8c8d;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 5px;
`;

const ButtonGroup = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`;

const FilterButton = styled.button<{ active: boolean }>`
    padding: 8px 16px;
    background-color: ${props => props.active ? '#3498db' : '#f5f5f5'};
    color: ${props => props.active ? 'white' : '#333'};
    border: 1px solid ${props => props.active ? '#3498db' : '#ddd'};
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 5px;
    
    &:hover {
        background-color: ${props => props.active ? '#2980b9' : '#e9e9e9'};
    }
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    
    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const FilterItem = styled.div`
    display: flex;
    flex-direction: column;
`;

const Select = styled.select`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    font-size: 14px;
    color: #2c3e50;
    
    &:hover {
        border-color: #bbb;
    }
    
    &:focus {
        border-color: #3498db;
        outline: none;
    }
`;

export default ReportFilters;