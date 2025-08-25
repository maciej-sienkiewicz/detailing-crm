import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {format, subDays} from 'date-fns';
import {pl} from 'date-fns/locale';
import {
    FaBell,
    FaCalendarAlt,
    FaCar,
    FaCheck,
    FaClipboardCheck,
    FaCog,
    FaComment,
    FaFilter,
    FaTimes,
    FaUser
} from 'react-icons/fa';
import {ActivityFilter} from '../../../types/activity';
import {Employee} from '../../../types';

// Brand Theme
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    neutral: '#64748b',
    border: '#e2e8f0',
    text: {
        primary: '#1e293b',
        secondary: '#475569',
        muted: '#64748b'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px'
    },
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }
};

interface ActivityFiltersPanelProps {
    activeFilters: ActivityFilter[];
    dateRange: {
        startDate: string;
        endDate: string;
    };
    onFilterChange: (filters: ActivityFilter[]) => void;
    onDateRangeChange: (dateRange: { startDate: string; endDate: string }) => void;
}

// Kategorie aktywności (bez telefonów)
const activityCategories = [
    { id: 'all', label: 'Wszystkie aktywności', icon: <FaFilter /> },
    { id: 'APPOINTMENT', label: 'Wizyty i rezerwacje', icon: <FaCalendarAlt /> },
    { id: 'protocol', label: 'Protokoły przyjęcia', icon: <FaClipboardCheck /> },
    { id: 'COMMENT', label: 'Komentarze', icon: <FaComment /> },
    { id: 'client', label: 'Operacje na klientach', icon: <FaUser /> },
    { id: 'vehicle', label: 'Operacje na pojazdach', icon: <FaCar /> },
    { id: 'notification', label: 'Powiadomienia', icon: <FaBell /> },
    { id: 'system', label: 'Działania systemowe', icon: <FaCog /> }
];

// Predefiniowane zakresy dat
const dateRangePresets = [
    {
        label: 'Dzisiaj',
        getValue: () => {
            const today = format(new Date(), 'yyyy-MM-dd');
            return { startDate: today, endDate: today };
        }
    },
    {
        label: 'Wczoraj',
        getValue: () => {
            const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
            return { startDate: yesterday, endDate: yesterday };
        }
    },
    {
        label: 'Ostatnie 7 dni',
        getValue: () => ({
            startDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd')
        })
    },
    {
        label: 'Ostatnie 30 dni',
        getValue: () => ({
            startDate: format(subDays(new Date(), 29), 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd')
        })
    }
];

const ActivityFiltersPanel: React.FC<ActivityFiltersPanelProps> = ({
                                                                       activeFilters,
                                                                       dateRange,
                                                                       onFilterChange,
                                                                       onDateRangeChange
                                                                   }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);

    // Pobieranie listy pracowników
    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const employeesList = ([] as Employee[]);
                setEmployees(employeesList);
            } catch (error) {
                console.error('Error loading employees:', error);
            } finally {
                setLoadingEmployees(false);
            }
        };

        loadEmployees();
    }, []);

    // Sprawdzanie czy filtr jest aktywny
    const isFilterActive = (filterType: string, value: string): boolean => {
        return activeFilters.some(
            filter => filter.type === filterType && filter.value === value
        );
    };

    // Obsługa zmiany filtru
    const handleFilterChange = (filterType: 'category' | 'user', value: string) => {
        const updatedFilters = activeFilters.filter(filter => filter.type !== filterType);
        updatedFilters.push({ type: filterType, value });
        onFilterChange(updatedFilters);
    };

    // Obsługa zmiany zakresu dat - preset
    const handleDatePresetChange = (preset: { startDate: string; endDate: string }) => {
        onDateRangeChange(preset);
    };

    // Obsługa ręcznej zmiany dat
    const handleDateInputChange = (field: 'startDate' | 'endDate', value: string) => {
        onDateRangeChange({
            ...dateRange,
            [field]: value
        });
    };

    // Resetowanie filtrów
    const handleResetFilters = () => {
        onFilterChange([
            { type: 'category', value: 'all' },
            { type: 'user', value: 'all' }
        ]);
        onDateRangeChange({
            startDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd')
        });
    };

    // Sprawdzanie czy są zastosowane niestandardowe filtry
    const hasCustomFilters = activeFilters.some(f => f.value !== 'all') ||
        dateRange.startDate !== format(subDays(new Date(), 6), 'yyyy-MM-dd') ||
        dateRange.endDate !== format(new Date(), 'yyyy-MM-dd');

    return (
        <FiltersContainer>
            <FiltersHeader>
                <HeaderIcon>
                    <FaFilter />
                </HeaderIcon>
                <HeaderTitle>Filtry aktywności</HeaderTitle>
                {hasCustomFilters && (
                    <ResetButton onClick={handleResetFilters}>
                        <FaTimes />
                    </ResetButton>
                )}
            </FiltersHeader>

            <FiltersContent>
                {/* Zakres dat */}
                <FilterSection>
                    <SectionTitle>Okres czasu</SectionTitle>

                    <DatePresetsGrid>
                        {dateRangePresets.map((preset, index) => {
                            const presetValue = preset.getValue();
                            const isActive = dateRange.startDate === presetValue.startDate &&
                                dateRange.endDate === presetValue.endDate;

                            return (
                                <DatePresetButton
                                    key={index}
                                    $active={isActive}
                                    onClick={() => handleDatePresetChange(presetValue)}
                                >
                                    {isActive && <FaCheck />}
                                    {preset.label}
                                </DatePresetButton>
                            );
                        })}
                    </DatePresetsGrid>

                    <CustomDateSection>
                        <CustomDateTitle>Niestandardowy zakres</CustomDateTitle>
                        <DateInputsGrid>
                            <DateInputGroup>
                                <DateInputLabel>Od:</DateInputLabel>
                                <DateInput
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => handleDateInputChange('startDate', e.target.value)}
                                    max={dateRange.endDate}
                                />
                            </DateInputGroup>
                            <DateInputGroup>
                                <DateInputLabel>Do:</DateInputLabel>
                                <DateInput
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => handleDateInputChange('endDate', e.target.value)}
                                    min={dateRange.startDate}
                                    max={format(new Date(), 'yyyy-MM-dd')}
                                />
                            </DateInputGroup>
                        </DateInputsGrid>
                    </CustomDateSection>
                </FilterSection>

                {/* Kategorie aktywności */}
                <FilterSection>
                    <SectionTitle>Kategorie</SectionTitle>
                    <FilterOptions>
                        {activityCategories.map(category => (
                            <FilterOption
                                key={category.id}
                                $active={isFilterActive('category', category.id)}
                                onClick={() => handleFilterChange('category', category.id)}
                            >
                                <OptionIcon>{category.icon}</OptionIcon>
                                <OptionLabel>{category.label}</OptionLabel>
                                {isFilterActive('category', category.id) && (
                                    <OptionCheck>
                                        <FaCheck />
                                    </OptionCheck>
                                )}
                            </FilterOption>
                        ))}
                    </FilterOptions>
                </FilterSection>

                {/* Użytkownicy */}
                <FilterSection>
                    <SectionTitle>Użytkownicy</SectionTitle>
                    <FilterOptions>
                        <FilterOption
                            $active={isFilterActive('user', 'all')}
                            onClick={() => handleFilterChange('user', 'all')}
                        >
                            <OptionIcon><FaUser /></OptionIcon>
                            <OptionLabel>Wszyscy użytkownicy</OptionLabel>
                            {isFilterActive('user', 'all') && (
                                <OptionCheck>
                                    <FaCheck />
                                </OptionCheck>
                            )}
                        </FilterOption>

                        {loadingEmployees ? (
                            <LoadingState>Ładowanie użytkowników...</LoadingState>
                        ) : (
                            employees.map(employee => (
                                <FilterOption
                                    key={employee.id}
                                    $active={isFilterActive('user', employee.id)}
                                    onClick={() => handleFilterChange('user', employee.id)}
                                >
                                    <UserAvatar $color="red">
                                        {employee.fullName.split(' ').map(name => name[0]).join('')}
                                    </UserAvatar>
                                    <OptionLabel>{employee.fullName}</OptionLabel>
                                    {isFilterActive('user', employee.id) && (
                                        <OptionCheck>
                                            <FaCheck />
                                        </OptionCheck>
                                    )}
                                </FilterOption>
                            ))
                        )}
                    </FilterOptions>
                </FilterSection>

                {/* Podsumowanie aktywnych filtrów */}
                {hasCustomFilters && (
                    <ActiveFiltersSection>
                        <SectionTitle>Aktywne filtry</SectionTitle>
                        <ActiveFiltersList>
                            {activeFilters.map(filter => {
                                if (filter.value === 'all') return null;

                                let label = '';
                                if (filter.type === 'category') {
                                    const category = activityCategories.find(c => c.id === filter.value);
                                    label = `Kategoria: ${category?.label || filter.value}`;
                                } else if (filter.type === 'user') {
                                    const user = employees.find(e => e.id === filter.value);
                                    label = `Użytkownik: ${user?.fullName || filter.value}`;
                                }

                                return label ? (
                                    <ActiveFilterItem key={`${filter.type}-${filter.value}`}>
                                        {label}
                                    </ActiveFilterItem>
                                ) : null;
                            })}

                            <ActiveFilterItem>
                                Okres: {format(new Date(dateRange.startDate), 'd MMM', { locale: pl })} - {format(new Date(dateRange.endDate), 'd MMM yyyy', { locale: pl })}
                            </ActiveFilterItem>
                        </ActiveFiltersList>
                    </ActiveFiltersSection>
                )}
            </FiltersContent>
        </FiltersContainer>
    );
};

// Styled Components
const FiltersContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
    height: fit-content;
    position: sticky;
    top: ${brandTheme.spacing.lg};
`;

const FiltersHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-bottom: 1px solid ${brandTheme.border};
`;

const HeaderIcon = styled.div`
    color: ${brandTheme.primary};
    font-size: 16px;
`;

const HeaderTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    flex: 1;
`;

const ResetButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.muted};
    border-radius: ${brandTheme.radius.sm};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #fee2e2;
        color: #dc2626;
    }
`;

const FiltersContent = styled.div`
    display: flex;
    flex-direction: column;
`;

const FilterSection = styled.div`
    padding: ${brandTheme.spacing.lg};
    border-bottom: 1px solid ${brandTheme.border};

    &:last-child {
        border-bottom: none;
    }
`;

const SectionTitle = styled.h4`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.md} 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const DatePresetsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${brandTheme.spacing.sm};
    margin-bottom: ${brandTheme.spacing.lg};
`;

const DatePresetButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.sm};
    border: 1px solid ${props => props.$active ? brandTheme.primary : brandTheme.border};
    background: ${props => props.$active ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${props => props.$active ? brandTheme.primary : brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 36px;

    &:hover {
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
    }

    svg {
        font-size: 10px;
    }
`;

const CustomDateSection = styled.div`
    padding-top: ${brandTheme.spacing.md};
    border-top: 1px solid ${brandTheme.border};
`;

const CustomDateTitle = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${brandTheme.text.muted};
    margin-bottom: ${brandTheme.spacing.sm};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const DateInputsGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const DateInputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const DateInputLabel = styled.label`
    font-size: 12px;
    font-weight: 500;
    color: ${brandTheme.text.secondary};
`;

const DateInput = styled.input`
    padding: ${brandTheme.spacing.sm};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }
`;

const FilterOptions = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const FilterOption = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border: none;
    background: ${props => props.$active ? brandTheme.primaryGhost : 'transparent'};
    color: ${props => props.$active ? brandTheme.primary : brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
        background: ${props => props.$active ? brandTheme.primaryGhost : brandTheme.surfaceAlt};
        color: ${brandTheme.primary};
    }
`;

const OptionIcon = styled.div`
    font-size: 14px;
    width: 16px;
    text-align: center;
    flex-shrink: 0;
`;

const OptionLabel = styled.span`
    font-size: 14px;
    font-weight: 500;
    flex: 1;
`;

const OptionCheck = styled.div`
    font-size: 12px;
    color: ${brandTheme.primary};
`;

const UserAvatar = styled.div<{ $color: string }>`
    width: 20px;
    height: 20px;
    background: ${props => props.$color};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    flex-shrink: 0;
`;

const LoadingState = styled.div`
    padding: ${brandTheme.spacing.md};
    text-align: center;
    color: ${brandTheme.text.muted};
    font-size: 13px;
    font-style: italic;
`;

const ActiveFiltersSection = styled.div`
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.lg};
`;

const ActiveFiltersList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const ActiveFilterItem = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.secondary};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.sm};
    border: 1px solid ${brandTheme.border};
`;

export default ActivityFiltersPanel;