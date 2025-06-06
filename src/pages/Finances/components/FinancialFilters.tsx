// src/pages/Finances/components/FinancialFilters.tsx - Professional Premium Automotive CRM
import React, { useState } from 'react';
import styled from 'styled-components';
import {
    FaFilter,
    FaChevronDown,
    FaChevronUp,
    FaTimes,
    FaSearch,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaExchangeAlt,
    FaFileInvoiceDollar,
    FaReceipt
} from 'react-icons/fa';
import {
    UnifiedDocumentFilters,
    DocumentType,
    DocumentTypeLabels,
    DocumentStatus,
    DocumentStatusLabels,
    TransactionDirection,
    TransactionDirectionLabels
} from '../../../types/finance';

// Professional Brand Theme - Premium Automotive CRM
const brandTheme = {
    // Primary Colors - Professional Blue Palette
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',

    // Surface Colors - Clean & Minimal
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',

    // Typography Colors
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },

    // Border Colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',

    // Status Colors - Automotive Grade
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2',
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },

    // Shadows - Professional Depth
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    // Spacing Scale
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    // Border Radius
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    }
};

interface FinancialFiltersProps {
    filters: UnifiedDocumentFilters;
    activeTypeFilter: DocumentType | 'ALL';
    onFiltersChange: (filters: UnifiedDocumentFilters) => void;
    onTypeFilterChange: (type: DocumentType | 'ALL') => void;
    documentsCount: number;
}

const FinancialFilters: React.FC<FinancialFiltersProps> = ({
                                                               filters,
                                                               activeTypeFilter,
                                                               onFiltersChange,
                                                               onTypeFilterChange,
                                                               documentsCount
                                                           }) => {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

    const hasActiveFilters = Object.keys(filters).length > 0 || activeTypeFilter !== 'ALL';

    const handleFilterChange = (field: keyof UnifiedDocumentFilters, value: any) => {
        const newFilters = { ...filters };
        if (value === '' || value === undefined) {
            delete newFilters[field];
        } else {
            newFilters[field] = value;
        }
        onFiltersChange(newFilters);
    };

    const clearAllFilters = () => {
        onFiltersChange({});
        onTypeFilterChange('ALL');
    };

    const getDocumentIcon = (type: DocumentType) => {
        switch (type) {
            case DocumentType.INVOICE:
                return <FaFileInvoiceDollar />;
            case DocumentType.RECEIPT:
                return <FaReceipt />;
            case DocumentType.OTHER:
                return <FaExchangeAlt />;
            default:
                return <FaExchangeAlt />;
        }
    };

    return (
        <FiltersContainer $expanded={showAdvancedFilters}>
            <FiltersToggle
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                $hasActiveFilters={hasActiveFilters}
            >
                <ToggleLeft>
                    <FilterIcon $active={hasActiveFilters}>
                        <FaFilter />
                    </FilterIcon>
                    <ToggleContent>
                        <ToggleTitle>
                            Filtry i wyszukiwanie
                            {hasActiveFilters && (
                                <ActiveFiltersBadge>
                                    {Object.keys(filters).length + (activeTypeFilter !== 'ALL' ? 1 : 0)}
                                </ActiveFiltersBadge>
                            )}
                        </ToggleTitle>
                        <ToggleSubtitle>
                            {hasActiveFilters
                                ? `Wyniki: ${documentsCount} dokumentów`
                                : 'Kliknij aby otworzyć opcje filtrowania i wyszukiwania dokumentów'
                            }
                        </ToggleSubtitle>
                    </ToggleContent>
                </ToggleLeft>

                <ToggleActions>
                    {hasActiveFilters && (
                        <ClearFiltersButton
                            onClick={(e) => {
                                e.stopPropagation();
                                clearAllFilters();
                            }}
                        >
                            <FaTimes />
                            <span>Wyczyść</span>
                        </ClearFiltersButton>
                    )}
                    <ExpandIcon $expanded={showAdvancedFilters}>
                        {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
                    </ExpandIcon>
                </ToggleActions>
            </FiltersToggle>

            {showAdvancedFilters && (
                <FiltersContent>
                    {/* Type Filter Section */}
                    <FilterSection>
                        <SectionTitle>Typ dokumentu</SectionTitle>
                        <TypeFilterButtons>
                            <TypeFilterButton
                                $active={activeTypeFilter === 'ALL'}
                                onClick={() => onTypeFilterChange('ALL')}
                            >
                                <FilterButtonIcon>
                                    <FaFilter />
                                </FilterButtonIcon>
                                <FilterButtonText>Wszystkie</FilterButtonText>
                            </TypeFilterButton>

                            {Object.values(DocumentType).map((type) => (
                                <TypeFilterButton
                                    key={type}
                                    $active={activeTypeFilter === type}
                                    onClick={() => onTypeFilterChange(type)}
                                    $documentType={type}
                                >
                                    <FilterButtonIcon>
                                        {getDocumentIcon(type)}
                                    </FilterButtonIcon>
                                    <FilterButtonText>
                                        {DocumentTypeLabels[type]}
                                    </FilterButtonText>
                                </TypeFilterButton>
                            ))}
                        </TypeFilterButtons>
                    </FilterSection>

                    {/* Advanced Filters Section */}
                    <FilterSection>
                        <SectionTitle>Wyszukiwanie zaawansowane</SectionTitle>
                        <AdvancedFiltersGrid>
                            {/* Title Search */}
                            <FilterGroup>
                                <FilterLabel htmlFor="title">
                                    <FilterLabelIcon><FaSearch /></FilterLabelIcon>
                                    Nazwa dokumentu
                                </FilterLabel>
                                <FilterInputWrapper>
                                    <FilterInput
                                        id="title"
                                        value={filters.title || ''}
                                        onChange={(e) => handleFilterChange('title', e.target.value)}
                                        placeholder="Wyszukaj po nazwie dokumentu..."
                                        $hasValue={!!filters.title}
                                    />
                                    {filters.title && (
                                        <ClearInputButton
                                            onClick={() => handleFilterChange('title', '')}
                                        >
                                            <FaTimes />
                                        </ClearInputButton>
                                    )}
                                </FilterInputWrapper>
                            </FilterGroup>

                            {/* Buyer Name Search */}
                            <FilterGroup>
                                <FilterLabel htmlFor="buyerName">
                                    <FilterLabelIcon><FaSearch /></FilterLabelIcon>
                                    Kontrahent
                                </FilterLabel>
                                <FilterInputWrapper>
                                    <FilterInput
                                        id="buyerName"
                                        value={filters.buyerName || ''}
                                        onChange={(e) => handleFilterChange('buyerName', e.target.value)}
                                        placeholder="Wyszukaj po nazwie kontrahenta..."
                                        $hasValue={!!filters.buyerName}
                                    />
                                    {filters.buyerName && (
                                        <ClearInputButton
                                            onClick={() => handleFilterChange('buyerName', '')}
                                        >
                                            <FaTimes />
                                        </ClearInputButton>
                                    )}
                                </FilterInputWrapper>
                            </FilterGroup>

                            {/* Status Filter */}
                            <FilterGroup>
                                <FilterLabel htmlFor="status">
                                    <FilterLabelIcon><FaFilter /></FilterLabelIcon>
                                    Status
                                </FilterLabel>
                                <FilterSelect
                                    id="status"
                                    value={filters.status || ''}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    $hasValue={!!filters.status}
                                >
                                    <option value="">Wszystkie statusy</option>
                                    {Object.entries(DocumentStatusLabels).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </FilterSelect>
                            </FilterGroup>

                            {/* Direction Filter */}
                            <FilterGroup>
                                <FilterLabel htmlFor="direction">
                                    <FilterLabelIcon><FaExchangeAlt /></FilterLabelIcon>
                                    Kierunek
                                </FilterLabel>
                                <FilterSelect
                                    id="direction"
                                    value={filters.direction || ''}
                                    onChange={(e) => handleFilterChange('direction', e.target.value)}
                                    $hasValue={!!filters.direction}
                                >
                                    <option value="">Wszystkie</option>
                                    {Object.entries(TransactionDirectionLabels).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </FilterSelect>
                            </FilterGroup>

                            {/* Date Range */}
                            <FilterGroup>
                                <FilterLabel htmlFor="dateFrom">
                                    <FilterLabelIcon><FaCalendarAlt /></FilterLabelIcon>
                                    Data od
                                </FilterLabel>
                                <FilterInput
                                    id="dateFrom"
                                    type="date"
                                    value={filters.dateFrom || ''}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                    $hasValue={!!filters.dateFrom}
                                />
                            </FilterGroup>

                            <FilterGroup>
                                <FilterLabel htmlFor="dateTo">
                                    <FilterLabelIcon><FaCalendarAlt /></FilterLabelIcon>
                                    Data do
                                </FilterLabel>
                                <FilterInput
                                    id="dateTo"
                                    type="date"
                                    value={filters.dateTo || ''}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                    $hasValue={!!filters.dateTo}
                                />
                            </FilterGroup>

                            {/* Amount Range */}
                            <FilterGroup>
                                <FilterLabel htmlFor="minAmount">
                                    <FilterLabelIcon><FaMoneyBillWave /></FilterLabelIcon>
                                    Kwota od
                                </FilterLabel>
                                <FilterInput
                                    id="minAmount"
                                    type="number"
                                    step="0.01"
                                    value={filters.minAmount || ''}
                                    onChange={(e) => handleFilterChange('minAmount', parseFloat(e.target.value))}
                                    placeholder="Minimalna kwota"
                                    $hasValue={!!filters.minAmount}
                                />
                            </FilterGroup>

                            <FilterGroup>
                                <FilterLabel htmlFor="maxAmount">
                                    <FilterLabelIcon><FaMoneyBillWave /></FilterLabelIcon>
                                    Kwota do
                                </FilterLabel>
                                <FilterInput
                                    id="maxAmount"
                                    type="number"
                                    step="0.01"
                                    value={filters.maxAmount || ''}
                                    onChange={(e) => handleFilterChange('maxAmount', parseFloat(e.target.value))}
                                    placeholder="Maksymalna kwota"
                                    $hasValue={!!filters.maxAmount}
                                />
                            </FilterGroup>
                        </AdvancedFiltersGrid>
                    </FilterSection>
                </FiltersContent>
            )}
        </FiltersContainer>
    );
};

// Professional Styled Components - Minimal & Elegant
const FiltersContainer = styled.div<{ $expanded: boolean }>`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${props => props.$expanded ? brandTheme.border : brandTheme.borderLight};
    overflow: hidden;
    box-shadow: ${props => props.$expanded ? brandTheme.shadow.md : brandTheme.shadow.xs};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const FiltersToggle = styled.button<{ $hasActiveFilters?: boolean }>`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    background: ${props => props.$hasActiveFilters ? brandTheme.primaryGhost : brandTheme.surface};
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;

    &:hover {
        background: ${props => props.$hasActiveFilters ? brandTheme.primaryGhost : brandTheme.surfaceHover};
    }
`;

const ToggleLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.lg};
    flex: 1;
    min-width: 0;
`;

const FilterIcon = styled.div<{ $active: boolean }>`
    width: 48px;
    height: 48px;
    background: ${props => props.$active
    ? `linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%)`
    : brandTheme.surfaceElevated
};
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$active ? 'white' : brandTheme.text.muted};
    font-size: 18px;
    box-shadow: ${props => props.$active ? brandTheme.shadow.md : brandTheme.shadow.xs};
    transition: all 0.3s ease;
    flex-shrink: 0;
`;

const ToggleContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const ToggleTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 18px;
    margin-bottom: ${brandTheme.spacing.xs};
    letter-spacing: -0.02em;
`;

const ActiveFiltersBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    border-radius: ${brandTheme.radius.lg};
    font-size: 12px;
    font-weight: 700;
    padding: 0 ${brandTheme.spacing.sm};
    box-shadow: ${brandTheme.shadow.sm};
`;

const ToggleSubtitle = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    line-height: 1.4;
`;

const ToggleActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const ClearFiltersButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    border: 1px solid ${brandTheme.status.error}30;
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.status.error};
        color: white;
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }

    span {
        @media (max-width: 640px) {
            display: none;
        }
    }
`;

const ExpandIcon = styled.div<{ $expanded: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: ${brandTheme.text.muted};
    font-size: 16px;
    transition: all 0.3s ease;
    transform: ${props => props.$expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const FiltersContent = styled.div`
    padding: ${brandTheme.spacing.xl};
    background: ${brandTheme.surfaceAlt};
    border-top: 1px solid ${brandTheme.borderLight};
`;

const FilterSection = styled.div`
    margin-bottom: ${brandTheme.spacing.xl};

    &:last-child {
        margin-bottom: 0;
    }
`;

const SectionTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.md} 0;
    letter-spacing: -0.02em;
`;

const TypeFilterButtons = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    flex-wrap: wrap;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const TypeFilterButton = styled.button<{
    $active: boolean;
    $documentType?: DocumentType;
}>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    font-weight: ${props => props.$active ? '600' : '500'};
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid ${props => props.$active ? brandTheme.primary : brandTheme.border};
    white-space: nowrap;
    background: ${props => props.$active ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${props => props.$active ? brandTheme.primary : brandTheme.text.secondary};
    box-shadow: ${brandTheme.shadow.xs};

    &:hover {
        background: ${props => props.$active ? brandTheme.primaryGhost : brandTheme.surfaceHover};
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.sm};
    }

    @media (max-width: 768px) {
        width: 100%;
        justify-content: flex-start;
    }
`;

const FilterButtonIcon = styled.div`
    font-size: 16px;
    flex-shrink: 0;
`;

const FilterButtonText = styled.span`
    font-size: 14px;
`;

const AdvancedFiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: ${brandTheme.spacing.lg};
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${brandTheme.spacing.md};
    }
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const FilterLabel = styled.label`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    font-weight: 600;
    font-size: 14px;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
`;

const FilterLabelIcon = styled.div`
    color: ${brandTheme.text.muted};
    font-size: 12px;
`;

const FilterInputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const FilterInput = styled.input<{ $hasValue: boolean }>`
    width: 100%;
    height: 48px;
    padding: 0 ${brandTheme.spacing.md};
    padding-right: ${props => props.$hasValue ? '44px' : brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasValue ? brandTheme.primary : brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    font-size: 14px;
    font-weight: 500;
    background: ${props => props.$hasValue ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
        background: ${brandTheme.surface};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }

    ${props => props.$hasValue && `
        font-weight: 600;
    `}
`;

const FilterSelect = styled.select<{ $hasValue: boolean }>`
    width: 100%;
    height: 48px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasValue ? brandTheme.primary : brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    font-size: 14px;
    font-weight: 500;
    background: ${props => props.$hasValue ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
        background: ${brandTheme.surface};
    }

    ${props => props.$hasValue && `
        font-weight: 600;
    `}
`;

const ClearInputButton = styled.button`
    position: absolute;
    right: ${brandTheme.spacing.sm};
    width: 28px;
    height: 28px;
    border: none;
    background: ${brandTheme.text.muted};
    color: white;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.status.error};
        transform: scale(1.1);
    }
`;

export default FinancialFilters;