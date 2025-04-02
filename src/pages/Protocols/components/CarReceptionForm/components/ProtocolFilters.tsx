import React from 'react';
import { FilterButtons, FilterButton } from '../../../styles';

export type FilterType = 'Zaplanowane' | 'W realizacji' | 'Oczekujące na odbiór' | 'Archiwum' | 'Wszystkie';

interface ProtocolFiltersProps {
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

export const ProtocolFilters: React.FC<ProtocolFiltersProps> = ({ activeFilter, onFilterChange }) => {
    return (
        <FilterButtons>
            <FilterButton
                active={activeFilter === 'W realizacji'}
                onClick={() => onFilterChange('W realizacji')}
            >
                W realizacji
            </FilterButton>
            <FilterButton
                active={activeFilter === 'Oczekujące na odbiór'}
                onClick={() => onFilterChange('Oczekujące na odbiór')}
            >
                Oczekujące na odbiór
            </FilterButton>
            <FilterButton
                active={activeFilter === 'Zaplanowane'}
                onClick={() => onFilterChange('Zaplanowane')}
            >
                Zaplanowane
            </FilterButton>
            <FilterButton
                active={activeFilter === 'Wszystkie'}
                onClick={() => onFilterChange('Wszystkie')}
            >
                Wszystkie
            </FilterButton>
            <FilterButton
                active={activeFilter === 'Archiwum'}
                onClick={() => onFilterChange('Archiwum')}
            >
                Archiwum
            </FilterButton>
        </FilterButtons>
    );
};