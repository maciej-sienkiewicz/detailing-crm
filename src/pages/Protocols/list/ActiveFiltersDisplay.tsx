// src/pages/Protocols/list/ActiveFiltersDisplay.tsx
import React from 'react';
import styled from 'styled-components';
import {FaCheck, FaFilter, FaTimes} from 'react-icons/fa';
import {SearchCriteria} from './ProtocolSearchFilters';
import {ProtocolStatus, ProtocolStatusLabels} from '../../../types';
import {format} from 'date-fns';
import {pl} from 'date-fns/locale';

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
            title: 'Tytuł wizyty',
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

    // Liczba aktywnych filtrów
    const activeFilterCount = Object.entries(searchCriteria).filter(([key, value]) => {
        if (value === undefined || value === null || value === '') return false;
        if (key === 'price' && isPriceObject(value) && !value.min && !value.max) return false;
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

                    const filterValue = getFilterValue(key, value);

                    return (
                        <FilterTag key={key}>
                            <FilterTagContent>
                                <FilterTagLabel>{getFilterLabel(key)}:</FilterTagLabel>
                                <FilterTagValue>{filterValue}</FilterTagValue>
                            </FilterTagContent>
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

// Modern Styled Components
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

export default ActiveFiltersDisplay;