import React from 'react';
import styled from 'styled-components';
import {FaCheck, FaFilter, FaTimes} from 'react-icons/fa';
import {VisitsFilterState} from '../hooks/useVisitsFilters';
import {theme} from '../../../styles/theme';

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
                        Zastosuj filtry aby zobaczyć wyniki
                    </FooterText>
                </FiltersFooter>
            )}
        </FiltersContainer>
    );
};

const FiltersContainer = styled.div`
    background: linear-gradient(135deg, ${theme.primaryGhost} 0%, rgba(37, 99, 235, 0.04) 100%);
    border: 1px solid rgba(37, 99, 235, 0.2);
    border-radius: ${theme.radius.lg};
    margin: ${theme.spacing.lg} ${theme.spacing.xl};
    overflow: hidden;
`;

const FiltersHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(37, 99, 235, 0.1);
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
`;

const FilterIcon = styled.div`
    width: 24px;
    height: 24px;
    background: ${theme.primary};
    border-radius: ${theme.radius.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 11px;
`;

const FiltersTitle = styled.div`
    font-weight: 600;
    color: ${theme.text.primary};
    font-size: 13px;
`;

const ClearAllButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    background: none;
    border: 1px solid ${theme.border};
    color: ${theme.text.tertiary};
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.radius.sm};
    transition: all ${theme.transitions.normal};

    &:hover {
        border-color: ${theme.error};
        color: ${theme.error};
        background: ${theme.errorBg};
        transform: translateY(-1px);
    }
`;

const FilterTags = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
`;

const FilterTag = styled.div`
    display: flex;
    align-items: center;
    background: ${theme.surface};
    border: 1px solid rgba(37, 99, 235, 0.2);
    border-radius: 16px;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    font-size: 12px;
    transition: all ${theme.transitions.normal};
    box-shadow: ${theme.shadow.xs};

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.sm};
        border-color: ${theme.primary};
    }
`;

const FilterTagContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

const FilterTagLabel = styled.span`
    font-weight: 600;
    color: ${theme.primary};
`;

const FilterTagValue = styled.span`
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const RemoveFilterButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    background: ${theme.errorBg};
    color: ${theme.error};
    border: none;
    border-radius: 50%;
    cursor: pointer;
    margin-left: ${theme.spacing.sm};
    font-size: 8px;
    transition: all ${theme.transitions.normal};

    &:hover {
        background: ${theme.error};
        color: white;
        transform: scale(1.1);
    }
`;

const FiltersFooter = styled.div`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: rgba(255, 255, 255, 0.8);
    border-top: 1px solid rgba(37, 99, 235, 0.1);
`;

const FooterText = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 11px;
    color: ${theme.primary};
    font-weight: 500;
`;