import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaFilter,
    FaTags,
    FaCar,
    FaUser,
    FaClipboardCheck,
    FaPhone,
    FaComment,
    FaCalendarAlt,
    FaBuilding,
    FaBell
} from 'react-icons/fa';
import { ActivityFilter } from '../../../types/activity';
import { fetchEmployees } from '../../../api/mocks/employeesMocks';
import { Employee } from '../../../types';

// Zdefiniowane kategorie aktywności
const activityCategories = [
    { id: 'all', label: 'Wszystkie aktywności', icon: <FaTags /> },
    { id: 'APPOINTMENT', label: 'Wizyty i rezerwacje', icon: <FaCalendarAlt /> },
    { id: 'protocol', label: 'Protokoły przyjęcia', icon: <FaClipboardCheck /> },
    { id: 'call', label: 'Rozmowy telefoniczne', icon: <FaPhone /> },
    { id: 'COMMENT', label: 'Komentarze', icon: <FaComment /> },
    { id: 'client', label: 'Operacje na klientach', icon: <FaUser /> },
    { id: 'vehicle', label: 'Operacje na pojazdach', icon: <FaCar /> },
    { id: 'notification', label: 'Powiadomienia', icon: <FaBell /> }
];

// Zdefiniowane typy encji
const entityTypes = [
    { id: 'all', label: 'Wszystkie obiekty', icon: <FaTags /> },
    { id: 'vehicle', label: 'Pojazdy', icon: <FaCar /> },
    { id: 'client', label: 'Klienci', icon: <FaUser /> },
    { id: 'APPOINTMENT', label: 'Wizyty', icon: <FaCalendarAlt /> },
    { id: 'protocol', label: 'Protokoły', icon: <FaClipboardCheck /> },
    { id: 'invoice', label: 'Faktury', icon: <FaBuilding /> }
];

interface ActivityFiltersProps {
    onFilterChange: (filters: ActivityFilter[]) => void;
    activeFilters: ActivityFilter[];
}

const ActivityFilters: React.FC<ActivityFiltersProps> = ({
                                                             onFilterChange,
                                                             activeFilters
                                                         }) => {
    const [showCategoryFilters, setShowCategoryFilters] = useState(true);
    const [showEntityFilters, setShowEntityFilters] = useState(false);
    const [showUserFilters, setShowUserFilters] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Pobieranie listy użytkowników
    useEffect(() => {
        const loadUsers = async () => {
            try {
                setIsLoading(true);
                const users = await fetchEmployees();
                setEmployees(users);
            } catch (error) {
                console.error('Error loading users:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUsers();
    }, []);

    // Sprawdzanie czy filtr jest aktywny
    const isFilterActive = (filterType: string, value: string): boolean => {
        return activeFilters.some(
            filter => filter.type === filterType && filter.value === value
        );
    };

    // Pobieranie aktywnego filtru danego typu
    const getActiveFilter = (filterType: string): string => {
        const filter = activeFilters.find(f => f.type === filterType);
        return filter ? filter.value : 'all';
    };

    // Obsługa wyboru filtru
    const handleFilterSelect = (filterType: "category" | "entity" | "user" | "all", value: string) => {
        // Tworzymy nową tablicę bez filtrów tego typu
        const updatedFilters = activeFilters.filter(filter => filter.type !== filterType);

        // Dodajemy nowy filtr
        updatedFilters.push({ type: filterType, value });

        onFilterChange(updatedFilters);
    };

    // Resetowanie wszystkich filtrów
    const handleResetFilters = () => {
        onFilterChange([
            { type: 'category', value: 'all' },
            { type: 'entity', value: 'all' },
            { type: 'user', value: 'all' }
        ]);
    };

    return (
        <FiltersContainer>
            <SectionTitle>
                <SectionIcon><FaFilter /></SectionIcon>
                Filtry
            </SectionTitle>

            {/* Filtry kategorii */}
            <FilterSection>
                <FilterSectionHeader onClick={() => setShowCategoryFilters(!showCategoryFilters)}>
                    <FilterSectionTitle>
                        <FilterIcon><FaTags /></FilterIcon>
                        Kategorie aktywności
                    </FilterSectionTitle>
                    <ToggleIcon>{showCategoryFilters ? '−' : '+'}</ToggleIcon>
                </FilterSectionHeader>

                {showCategoryFilters && (
                    <FilterOptions>
                        {activityCategories.map(category => (
                            <FilterOption
                                key={category.id}
                                active={isFilterActive('category', category.id)}
                                onClick={() => handleFilterSelect('category', category.id)}
                            >
                                <OptionIcon>{category.icon}</OptionIcon>
                                <OptionLabel>{category.label}</OptionLabel>
                            </FilterOption>
                        ))}
                    </FilterOptions>
                )}
            </FilterSection>

            {/* Filtry typów encji */}
            <FilterSection>
                <FilterSectionHeader onClick={() => setShowEntityFilters(!showEntityFilters)}>
                    <FilterSectionTitle>
                        <FilterIcon><FaCar /></FilterIcon>
                        Typ obiektu
                    </FilterSectionTitle>
                    <ToggleIcon>{showEntityFilters ? '−' : '+'}</ToggleIcon>
                </FilterSectionHeader>

                {showEntityFilters && (
                    <FilterOptions>
                        {entityTypes.map(entity => (
                            <FilterOption
                                key={entity.id}
                                active={isFilterActive('entity', entity.id)}
                                onClick={() => handleFilterSelect('entity', entity.id)}
                            >
                                <OptionIcon>{entity.icon}</OptionIcon>
                                <OptionLabel>{entity.label}</OptionLabel>
                            </FilterOption>
                        ))}
                    </FilterOptions>
                )}
            </FilterSection>

            {/* Filtry użytkowników */}
            <FilterSection>
                <FilterSectionHeader onClick={() => setShowUserFilters(!showUserFilters)}>
                    <FilterSectionTitle>
                        <FilterIcon><FaUser /></FilterIcon>
                        Użytkownik
                    </FilterSectionTitle>
                    <ToggleIcon>{showUserFilters ? '−' : '+'}</ToggleIcon>
                </FilterSectionHeader>

                {showUserFilters && (
                    <FilterOptions>
                        <FilterOption
                            active={isFilterActive('user', 'all')}
                            onClick={() => handleFilterSelect('user', 'all')}
                        >
                            <OptionIcon><FaUser /></OptionIcon>
                            <OptionLabel>Wszyscy użytkownicy</OptionLabel>
                        </FilterOption>

                        {isLoading ? (
                            <LoadingState>Ładowanie użytkowników...</LoadingState>
                        ) : (
                            employees.map(employee => (
                                <FilterOption
                                    key={employee.id}
                                    active={isFilterActive('user', employee.id)}
                                    onClick={() => handleFilterSelect('user', employee.id)}
                                >
                                    <UserAvatar color={employee.color}>
                                        {employee.fullName.split(' ').map(name => name[0]).join('')}
                                    </UserAvatar>
                                    <OptionLabel>{employee.fullName}</OptionLabel>
                                </FilterOption>
                            ))
                        )}
                    </FilterOptions>
                )}
            </FilterSection>

            {/* Podsumowanie filtrów */}
            <ActiveFiltersSection>
                <ActiveFiltersTitle>Aktywne filtry</ActiveFiltersTitle>
                <ActiveFiltersList>
                    <ActiveFilterItem>
                        <ActiveFilterLabel>Kategoria:</ActiveFilterLabel>
                        <ActiveFilterValue>
                            {activityCategories.find(c => c.id === getActiveFilter('category'))?.label || 'Wszystkie'}
                        </ActiveFilterValue>
                    </ActiveFilterItem>
                    <ActiveFilterItem>
                        <ActiveFilterLabel>Obiekt:</ActiveFilterLabel>
                        <ActiveFilterValue>
                            {entityTypes.find(e => e.id === getActiveFilter('entity'))?.label || 'Wszystkie'}
                        </ActiveFilterValue>
                    </ActiveFilterItem>
                    <ActiveFilterItem>
                        <ActiveFilterLabel>Użytkownik:</ActiveFilterLabel>
                        <ActiveFilterValue>
                            {getActiveFilter('user') === 'all'
                                ? 'Wszyscy'
                                : employees.find(e => e.id === getActiveFilter('user'))?.fullName || 'Nieznany'}
                        </ActiveFilterValue>
                    </ActiveFilterItem>
                </ActiveFiltersList>
                <ResetFiltersButton onClick={handleResetFilters}>
                    Resetuj filtry
                </ResetFiltersButton>
            </ActiveFiltersSection>
        </FiltersContainer>
    );
};

// Styled components
const FiltersContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const SectionTitle = styled.h2`
    display: flex;
    align-items: center;
    font-size: 16px;
    color: #34495e;
    margin: 0;
    padding: 15px;
    border-bottom: 1px solid #eee;
`;

const SectionIcon = styled.span`
    color: #3498db;
    margin-right: 10px;
`;

const FilterSection = styled.div`
    border-bottom: 1px solid #eee;

    &:last-child {
        border-bottom: none;
    }
`;

const FilterSectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    cursor: pointer;

    &:hover {
        background-color: #f9f9f9;
    }
`;

const FilterSectionTitle = styled.h3`
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #34495e;
    margin: 0;
    font-weight: 500;
`;

const FilterIcon = styled.span`
    color: #7f8c8d;
    margin-right: 10px;
    font-size: 14px;
`;

const ToggleIcon = styled.span`
    color: #7f8c8d;
    font-size: 16px;
    font-weight: bold;
`;

const FilterOptions = styled.div`
    padding: 0 15px 15px;
`;

const FilterOption = styled.div<{ active: boolean }>`
    display: flex;
    align-items: center;
    padding: 8px 10px;
    border-radius: 4px;
    background-color: ${props => props.active ? '#eaf6fd' : 'transparent'};
    color: ${props => props.active ? '#3498db' : '#34495e'};
    cursor: pointer;
    margin-bottom: 5px;

    &:hover {
        background-color: ${props => props.active ? '#eaf6fd' : '#f5f5f5'};
    }

    &:last-child {
        margin-bottom: 0;
    }
`;

const OptionIcon = styled.span`
    margin-right: 10px;
    width: 16px;
    text-align: center;
`;

const OptionLabel = styled.span`
    font-size: 14px;
`;

const UserAvatar = styled.div<{ color: string }>`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: ${props => props.color};
    color: white;
    font-size: 12px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
`;

const LoadingState = styled.div`
    padding: 10px;
    text-align: center;
    color: #7f8c8d;
    font-size: 13px;
    font-style: italic;
`;

const ActiveFiltersSection = styled.div`
    padding: 15px;
    background-color: #f9f9f9;
`;

const ActiveFiltersTitle = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #34495e;
    margin-bottom: 10px;
`;

const ActiveFiltersList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 15px;
`;

const ActiveFilterItem = styled.div`
  display: flex;
  font-size: 13px;
`;

const ActiveFilterLabel = styled.div`
  color: #7f8c8d;
  margin-right: 5px;
  min-width: 70px;
`;

const ActiveFilterValue = styled.div`
  color: #34495e;
  font-weight: 500;
  flex: 1;
`;

const ResetFiltersButton = styled.button`
  width: 100%;
  padding: 8px 0;
  background-color: #f0f7ff;
  color: #3498db;
  border: 1px solid #d5e9f9;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  
  &:hover {
    background-color: #d5e9f9;
  }
`;

export default ActivityFilters;