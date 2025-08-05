import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaFilter, FaCheck } from 'react-icons/fa';
import { VisitsFilterState } from '../hooks/useVisitsFilters';

const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    neutral: '#64748b',
    surface: '#ffffff',
    border: '#e2e8f0'
};

interface VisitsActiveFiltersProps {
    filters: VisitsFilterState;
    onRemoveFilter: (key: keyof VisitsFilterState) => void;
    onClearAll: () => void;
}

export const VisitsActiveFilters: React.FC<VisitsActiveFiltersProps> = ({
                                                                            filters,
                                                                            onRemoveFilter,
                                                                            onClearAll
                                                                        }) => {
    const hasActiveFilters = Object.keys(filters).length > 0;

    if (!hasActiveFilters) {
        return null;
    }

    const getFilterLabel = (key: string): string => {
        const labels: Record<string, string> = {
            quickSearch: 'Szybkie wyszukiwanie',
            clientName: 'Klient',
            licensePlate: 'Nr rejestracyjny',
            make: 'Marka',
            model: 'Model',
            startDate: 'Od daty',
            endDate: 'Do daty',
            serviceIds: 'Usługi',
            minPrice: 'Cena od',
            maxPrice: 'Cena do'
        };
        return labels[key] || key;
    };

    const getFilterValue = (key: string, value: any): string => {
        if (key === 'startDate' || key === 'endDate') {
            try {
                return new Date(value).toLocaleDateString('pl-PL');
            } catch {
                return value;
            }
        }
        if (key === 'minPrice' || key === 'maxPrice') {
            return `${value} PLN`;
        }
        if (key === 'serviceIds' && Array.isArray(value)) {
            return `${value.length} usług`;
        }
        return String(value);
    };

    const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
        if (value === undefined || value === null || value === '') return false;
        if (key === 'serviceIds' && Array.isArray(value) && value.length === 0) return false;
        console.log(`Filter ${key}:`, value, 'is active');
        return true;
    }).length;

    return (
        <FiltersContainer>
            <FiltersHeader>
                <HeaderLeft>
                    <FilterIcon>
                        <FaFilter />
                    </FilterIcon>
                    <FiltersTitle>
                        Aktywne filtry ({activeFilterCount})
                    </FiltersTitle>
                </HeaderLeft>
                <ClearAllButton onClick={onClearAll}>
                    <FaTimes />
                    Wyczyść wszystkie
                </ClearAllButton>
            </FiltersHeader>

            <FilterTags>
                {Object.entries(filters).map(([key, value]) => {
                    if (value === undefined || value === null || value === '') {
                        return null;
                    }
                    if (key === 'serviceIds' && Array.isArray(value) && value.length === 0) {
                        return null;
                    }

                    const filterValue = getFilterValue(key, value);

                    return (
                        <FilterTag key={key}>
                            <FilterTagContent>
                                <FilterTagLabel>{getFilterLabel(key)}:</FilterTagLabel>
                                <FilterTagValue>{filterValue}</FilterTagValue>
                            </FilterTagContent>
                            <RemoveFilterButton
                                onClick={() => onRemoveFilter(key as keyof VisitsFilterState)}
                                title={`Usuń filtr: ${getFilterLabel(key)}`}
                            >
                                <FaTimes />
                            </RemoveFilterButton>
                        </FilterTag>
                    );
                })}
            </FilterTags>

            {activeFilterCount > 0 && (
                <FiltersFooter>
                    <FooterText>
                        <FaCheck />
                        Wyświetlane wyniki zostały przefiltrowane
                    </FooterText>
                </FiltersFooter>
            )}
        </FiltersContainer>
    );
};

const FiltersContainer = styled.div`
  background: linear-gradient(135deg, ${brandTheme.primaryGhost} 0%, rgba(37, 99, 235, 0.04) 100%);
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 12px;
  margin: 16px 24px;
  overflow: hidden;
`;

const FiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(37, 99, 235, 0.1);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FilterIcon = styled.div`
  width: 32px;
  height: 32px;
  background: ${brandTheme.primary};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
`;

const FiltersTitle = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 16px;
`;

const ClearAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 2px solid ${brandTheme.border};
  color: ${brandTheme.neutral};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ef4444;
    color: #ef4444;
    background: #fef2f2;
    transform: translateY(-1px);
  }
`;

const FilterTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px;
`;

const FilterTag = styled.div`
  display: flex;
  align-items: center;
  background: ${brandTheme.surface};
  border: 2px solid rgba(37, 99, 235, 0.2);
  border-radius: 24px;
  padding: 8px 12px 8px 16px;
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: ${brandTheme.primary};
  }
`;

const FilterTagContent = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FilterTagLabel = styled.span`
  font-weight: 600;
  color: ${brandTheme.primary};
`;

const FilterTagValue = styled.span`
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #374151;
  font-weight: 500;
`;

const RemoveFilterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  margin-left: 8px;
  font-size: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: #ef4444;
    color: white;
    transform: scale(1.1);
  }
`;

const FiltersFooter = styled.div`
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-top: 1px solid rgba(37, 99, 235, 0.1);
`;

const FooterText = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: ${brandTheme.primary};
    font-weight: 500;
`;