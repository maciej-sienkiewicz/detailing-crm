// src/pages/Protocols/list/ActiveFiltersDisplay.tsx
import React from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { SearchCriteria } from './ProtocolSearchFilters';
import { ProtocolStatus, ProtocolStatusLabels } from '../../../types';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface ActiveFiltersDisplayProps {
    searchCriteria: SearchCriteria;
    onRemoveFilter: (key: keyof SearchCriteria) => void;
    onClearAll: () => void;
}

const ActiveFiltersDisplay: React.FC<ActiveFiltersDisplayProps> = ({
                                                                       searchCriteria,
                                                                       onRemoveFilter,
                                                                       onClearAll
                                                                   }) => {
    // Sprawdź, czy mamy jakiekolwiek aktywne filtry
    const hasActiveFilters = Object.keys(searchCriteria).length > 0;

    if (!hasActiveFilters) {
        return null;
    }

    // Format daty do wyświetlenia
    const formatDate = (date: Date | null | undefined): string => {
        if (!date) return '';
        return format(date, 'dd.MM.yyyy', { locale: pl });
    };

    // Mapowanie nazw filtrów na przyjazne dla użytkownika etykiety
    const getFilterLabel = (key: string): string => {
        const labels: Record<string, string> = {
            clientName: 'Klient',
            licensePlate: 'Nr rejestracyjny',
            make: 'Marka',
            model: 'Model',
            status: 'Status',
            dateFrom: 'Od daty',
            dateTo: 'Do daty',
            serviceName: 'Usługa',
            price: 'Cena'
        };
        return labels[key] || key;
    };

    const isPriceObject = (value: any): value is { min?: number; max?: number } => {
        return typeof value === 'object' &&
            value !== null &&
            !(value instanceof Date) &&
            ('min' in value || 'max' in value);
    };

    // Formatowanie wartości filtra dla wyświetlenia
    const getFilterValue = (key: string, value: any): string => {
        if (key === 'status') {
            return ProtocolStatusLabels[value as ProtocolStatus] || value;
        }
        if (key === 'dateFrom') {
            return formatDate(value as Date | null);
        }
        if (key === 'dateTo') {
            return formatDate(value as Date | null);
        }
        if (key === 'price' && isPriceObject(value)) {
            if (value.min && value.max) {
                return `${value.min} - ${value.max} PLN`;
            }
            if (value.min) {
                return `od ${value.min} PLN`;
            }
            if (value.max) {
                return `do ${value.max} PLN`;
            }
            return '';
        }
        return String(value);
    };

    return (
        <FiltersContainer>
            <FiltersHeader>
                <FiltersTitle>Aktywne filtry:</FiltersTitle>
                <ClearAllButton onClick={onClearAll}>
                    Wyczyść wszystkie
                </ClearAllButton>
            </FiltersHeader>

            <FilterTags>
                {Object.entries(searchCriteria).map(([key, value]) => {
                    // Pomijamy puste wartości
                    if (
                        value === undefined ||
                        value === null ||
                        value === '' ||
                        (key === 'price' && isPriceObject(value) && !value.min && !value.max)
                    ) {
                        return null;
                    }

                    return (
                        <FilterTag key={key} data-key={key}>
                            <FilterTagLabel>{getFilterLabel(key)}:</FilterTagLabel>
                            <FilterTagValue>{getFilterValue(key, value)}</FilterTagValue>
                            <RemoveFilterButton
                                onClick={() => onRemoveFilter(key as keyof SearchCriteria)}
                                title={`Usuń filtr: ${getFilterLabel(key)}`}
                            >
                                <FaTimes />
                            </RemoveFilterButton>
                        </FilterTag>
                    );
                })}
            </FilterTags>
        </FiltersContainer>
    );
};

// Styled components
const FiltersContainer = styled.div`
    margin: 15px 0;
    padding: 10px 15px;
    background-color: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #eee;
`;

const FiltersHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
`;

const FiltersTitle = styled.div`
    font-weight: 500;
    color: #34495e;
    font-size: 14px;
`;

const ClearAllButton = styled.button`
    background: none;
    border: none;
    color: #3498db;
    font-size: 13px;
    cursor: pointer;
    padding: 0;

    &:hover {
        text-decoration: underline;
        color: #2980b9;
    }
`;

const FilterTags = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const FilterTag = styled.div`
    display: flex;
    align-items: center;
    background-color: #eaf2fd;
    border: 1px solid #d5e9f9;
    color: #2980b9;
    border-radius: 16px;
    padding: 4px 8px 4px 12px;
    font-size: 13px;
`;

const FilterTagLabel = styled.span`
    font-weight: 500;
    margin-right: 4px;
`;

const FilterTagValue = styled.span`
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const RemoveFilterButton = styled.button`
    background: none;
    border: none;
    color: #3498db;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    cursor: pointer;
    margin-left: 6px;
    padding: 2px;
    border-radius: 50%;

    &:hover {
        background-color: #d5e9f9;
        color: #2980b9;
    }
`;

export default ActiveFiltersDisplay;