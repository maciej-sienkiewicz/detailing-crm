// src/components/Templates/TemplateFiltersBar.tsx
import React from 'react';
import styled from 'styled-components';
import { FaFilter, FaSearch } from 'react-icons/fa';
import { TemplateFilters, TemplateType } from '../../types/template';
import { settingsTheme } from '../../pages/Settings/styles/theme';

interface TemplateFiltersBarProps {
    filters: TemplateFilters;
    templateTypes: TemplateType[];
    onFiltersChange: (filters: TemplateFilters) => void;
}

export const TemplateFiltersBar: React.FC<TemplateFiltersBarProps> = ({
                                                                          filters,
                                                                          templateTypes,
                                                                          onFiltersChange
                                                                      }) => {
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFiltersChange({
            ...filters,
            searchQuery: e.target.value
        });
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFiltersChange({
            ...filters,
            selectedType: e.target.value || undefined
        });
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onFiltersChange({
            ...filters,
            selectedStatus: value === '' ? null : value === 'true'
        });
    };

    const clearFilters = () => {
        onFiltersChange({
            ...filters,
            searchQuery: '',
            selectedType: undefined,
            selectedStatus: null
        });
    };

    const hasActiveFilters = filters.searchQuery || filters.selectedType || filters.selectedStatus !== null;

    return (
        <FilterContainer>
            <FilterGroup>
                <SearchContainer>
                    <SearchIcon>
                        <FaSearch />
                    </SearchIcon>
                    <SearchInput
                        type="text"
                        placeholder="Szukaj szablonów..."
                        value={filters.searchQuery}
                        onChange={handleSearchChange}
                    />
                </SearchContainer>

                <Select value={filters.selectedType || ''} onChange={handleTypeChange}>
                    <option value="">Wszystkie typy</option>
                    {templateTypes.map(type => (
                        <option key={type.type} value={type.type}>
                            {type.displayName}
                        </option>
                    ))}
                </Select>

                <Select value={filters.selectedStatus === null ? '' : filters.selectedStatus!!.toString()} onChange={handleStatusChange}>
                    <option value="">Wszystkie statusy</option>
                    <option value="true">Aktywne</option>
                    <option value="false">Nieaktywne</option>
                </Select>
            </FilterGroup>

            {hasActiveFilters && (
                <ClearButton onClick={clearFilters}>
                    Wyczyść filtry
                </ClearButton>
            )}
        </FilterContainer>
    );
};

const FilterContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${settingsTheme.spacing.lg};
    background: ${settingsTheme.surface};
    padding: ${settingsTheme.spacing.lg};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
    box-shadow: ${settingsTheme.shadow.sm};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: ${settingsTheme.spacing.md};
    }
`;

const FilterGroup = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.md};
    align-items: center;
    flex: 1;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const SearchContainer = styled.div`
    position: relative;
    flex: 1;
    min-width: 300px;

    @media (max-width: 768px) {
        min-width: auto;
        width: 100%;
    }
`;

const SearchIcon = styled.div`
    position: absolute;
    left: ${settingsTheme.spacing.md};
    top: 50%;
    transform: translateY(-50%);
    color: ${settingsTheme.text.muted};
    font-size: 14px;
`;

const SearchInput = styled.input`
    width: 100%;
    height: 44px;
    padding: 0 ${settingsTheme.spacing.md} 0 40px;
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${settingsTheme.primary};
        box-shadow: 0 0 0 3px ${settingsTheme.primaryGhost};
    }

    &::placeholder {
        color: ${settingsTheme.text.muted};
        font-weight: 400;
    }
`;

const Select = styled.select`
    height: 44px;
    padding: 0 ${settingsTheme.spacing.md};
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.primary};
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 150px;

    &:focus {
        outline: none;
        border-color: ${settingsTheme.primary};
        box-shadow: 0 0 0 3px ${settingsTheme.primaryGhost};
    }

    @media (max-width: 768px) {
        min-width: auto;
        width: 100%;
    }
`;

const ClearButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid ${settingsTheme.border};
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.secondary};
    white-space: nowrap;

    &:hover {
        background: ${settingsTheme.surfaceHover};
        color: ${settingsTheme.text.primary};
        border-color: ${settingsTheme.borderHover};
    }
`;