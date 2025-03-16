import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaFilter,
    FaCalendarAlt,
    FaTags,
    FaCar,
    FaUser,
    FaClipboardCheck,
    FaPhoneAlt,
    FaComment
} from 'react-icons/fa';
import { ActivityFilter } from '../../../types/activity';
import { fetchUsers } from '../../../api/mocks/employeesMocks';
import { Employee } from '../../../types';

// Zdefiniowane kategorie aktywności
const activityCategories = [
    { id: 'all', label: 'Wszystkie aktywności', icon: <FaTags /> },
    { id: 'appointment', label: 'Wizyty i rezerwacje', icon: <FaCalendarAlt /> },
    { id: 'protocol', label: 'Protokoły przyjęcia', icon: <FaClipboardCheck /> },
    { id: 'call', label: 'Rozmowy telefoniczne', icon: <FaPhoneAlt /> },
    { id: 'comment', label: 'Komentarze', icon: <FaComment /> }
];

// Zdefiniowane typy encji
const entityTypes = [
    { id: 'all', label: 'Wszystkie obiekty', icon: <FaTags /> },
    { id: 'vehicle', label: 'Pojazdy', icon: <FaCar /> },
    { id: 'client', label: 'Klienci', icon: <FaUser /> }
];

interface ActivityFiltersProps {
    onFilterChange: (filters: ActivityFilter[]) => void;
    onDateRangeChange: (startDate: string, endDate: string) => void;
    activeFilters: ActivityFilter[];
    dateRange: {
        startDate: string;
        endDate: string;
    };
}

const ActivityFilters: React.FC<ActivityFiltersProps> = ({
                                                             onFilterChange,
                                                             onDateRangeChange,
                                                             activeFilters,
                                                             dateRange
                                                         }) => {
    const [showCategoryFilters, setShowCategoryFilters] = useState(true);
    const [showEntityFilters, setShowEntityFilters] = useState(false);
    const [showUserFilters, setShowUserFilters] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);

    // Pobieranie listy użytkowników
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const users = await fetchUsers();
                setEmployees(users);
            } catch (error) {
                console.error('Error loading users:', error);
            }
        };

        loadUsers();
    }, []);

    // Sprawdzanie czy filter jest aktywny
    const isFilterActive = (filterType: string, value: string): boolean => {
        return activeFilters.some(
            filter => filter.type === filterType && filter.value === value
        );
    };

    // Obsługa wyboru filtra
    const handleFilterSelect = (filterType: string, value: string) => {
        let updatedFilters: ActivityFilter[];

        // Jeśli wybrano "wszystkie", usuń inne filtry tego samego typu
        if (value === 'all') {
            updatedFilters = activeFilters.filter(filter => filter.type !== filterType);
            updatedFilters.push({ type: filterType, value: 'all' });
        }
        // Jeśli kliknięto już aktywny filtr, usuń go
        else if (isFilterActive(filterType, value)) {
            updatedFilters = activeFilters.filter(
                filter => !(filter.type === filterType && filter.value === value)
            );

            // Jeśli nie ma już żadnych filtrów tego typu, dodaj "wszystkie"
            if (!updatedFilters.some(filter => filter.type === filterType)) {
                updatedFilters.push({ type: filterType, value: 'all' });
            }
        }
        // W przeciwnym razie dodaj nowy filtr i usuń "wszystkie" dla tego typu
        else {
            updatedFilters = activeFilters.filter(
                filter => !(filter.type === filterType && filter.value === 'all')
            );
            updatedFilters.push({ type: filterType, value });
        }

        onFilterChange(updatedFilters);
    };

    // Obsługa zmiany daty
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'startDate') {
            onDateRangeChange(value, dateRange.endDate);
        } else if (name === 'endDate') {
            onDateRangeChange(dateRange.startDate, value);
        }
    };

    return (
        <FiltersContainer>
            <SectionTitle>
                <SectionIcon><FaFilter /></SectionIcon>
                Filtry
            </SectionTitle>

            {/* Filtry zakresu dat */}
            <FilterSection>
                <FilterSectionTitle>
                    <FilterIcon><FaCalendarAlt /></FilterIcon>
                    Zakres dat
                </FilterSectionTitle>

                <DateFilterContainer>
                    <DateInput>
                        <DateLabel>Od:</DateLabel>
                        <DateField
                            type="date"
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateChange}
                            max={dateRange.endDate}
                        />
                    </DateInput>

                    <DateInput>
                        <DateLabel>Do:</DateLabel>
                        <DateField
                            type="date"
                            name="endDate"
                            value={dateRange.endDate}
                            onChange={handleDateChange}
                            min={dateRange.startDate}
                            max={new Date().toISOString().split('T')[0]} // Max to dziś
                        />
                    </DateInput>
                </DateFilterContainer>
            </FilterSection>

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

                        {employees.map(employee => (
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
                        ))}
                    </FilterOptions>
                )}
            </FilterSection>
        </FiltersContainer>
    );
};

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

const DateFilterContainer = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DateInput = styled.div`
  display: flex;
  align-items: center;
`;

const DateLabel = styled.label`
  flex: 0 0 40px;
  font-size: 14px;
  color: #34495e;
`;

const DateField = styled.input`
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

export default ActivityFilters;