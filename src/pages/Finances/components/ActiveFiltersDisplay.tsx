// src/pages/Finances/components/ActiveFiltersDisplay.tsx
import React from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { InvoiceFilters, InvoiceStatusLabels, InvoiceTypeLabels } from '../../../types';

interface ActiveFiltersDisplayProps {
    filters: InvoiceFilters;
    onRemoveFilter: (key: keyof InvoiceFilters) => void;
    onClearAll: () => void;
}

const ActiveFiltersDisplay: React.FC<ActiveFiltersDisplayProps> = ({
                                                                       filters,
                                                                       onRemoveFilter,
                                                                       onClearAll
                                                                   }) => {
    // Sprawdzamy, czy są aktywne filtry
    const hasActiveFilters = Object.keys(filters).length > 0;

    if (!hasActiveFilters) {
        return null;
    }

    // Funkcja formatująca wyświetlane nazwy filtrów
    const getFilterLabel = (key: string, value: any): string => {
        switch (key) {
            case 'number':
                return `Numer: ${value}`;
            case 'title':
                return `Tytuł: ${value}`;
            case 'buyerName':
                return `Płatnik: ${value}`;
            case 'status':
                return `Status: ${InvoiceStatusLabels[value]}`;
            case 'type':
                return `Typ: ${InvoiceTypeLabels[value]}`;
            case 'dateFrom':
                return `Od daty: ${new Date(value).toLocaleDateString('pl-PL')}`;
            case 'dateTo':
                return `Do daty: ${new Date(value).toLocaleDateString('pl-PL')}`;
            case 'protocolId':
                return `ID protokołu: ${value}`;
            case 'minAmount':
                return `Kwota od: ${value} PLN`;
            case 'maxAmount':
                return `Kwota do: ${value} PLN`;
            default:
                return `${key}: ${value}`;
        }
    };

    return (
        <FiltersDisplay>
            <FiltersTitle>
                Aktywne filtry:
                <ClearAllButton onClick={onClearAll}>
                    <FaTimes />
                    <span>Wyczyść wszystkie</span>
                </ClearAllButton>
            </FiltersTitle>
            <FilterTags>
                {Object.entries(filters).map(([key, value]) => (
                    <FilterTag key={key}>
                        {getFilterLabel(key, value)}
                        <RemoveFilterButton onClick={() => onRemoveFilter(key as keyof InvoiceFilters)}>
                            <FaTimes />
                        </RemoveFilterButton>
                    </FilterTag>
                ))}
            </FilterTags>
        </FiltersDisplay>
    );
};

const FiltersDisplay = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-bottom: 24px;
`;

const FiltersTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
  color: #2c3e50;
`;

const ClearAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
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
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background-color: #f0f7ff;
  border: 1px solid #d5e9f9;
  color: #3498db;
  font-size: 14px;
`;

const RemoveFilterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 12px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  
  &:hover {
    background-color: #3498db;
    color: white;
  }
`;

export default ActiveFiltersDisplay;