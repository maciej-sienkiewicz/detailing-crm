// src/pages/Finances/components/DocumentFilters.tsx - Improved integrated design
import React, {useState} from 'react';
import styled from 'styled-components';
import {
    FaChevronDown,
    FaChevronUp,
    FaExchangeAlt,
    FaFileInvoiceDollar,
    FaFilter,
    FaReceipt,
    FaTimes
} from 'react-icons/fa';
import {
    DocumentStatusLabels,
    DocumentType,
    DocumentTypeLabels,
    TransactionDirectionLabels,
    UnifiedDocumentFilters
} from '../../../types/finance';
import {brandTheme} from '../styles/theme';

type FilterType = DocumentType | 'ALL';

interface DocumentFiltersProps {
    activeTypeFilter: FilterType;
    filters: UnifiedDocumentFilters;
    onTypeFilterChange: (filter: FilterType) => void;
    onFilterChange: (filters: UnifiedDocumentFilters) => void;
    onSearch: (searchTerm: string) => void;
    resultCount: number;
}

const DocumentFilters: React.FC<DocumentFiltersProps> = ({
                                                             activeTypeFilter,
                                                             filters,
                                                             onTypeFilterChange,
                                                             onFilterChange,
                                                             onSearch,
                                                             resultCount
                                                         }) => {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Quick search handler (removed as we don't have search field anymore)
    const handleQuickSearch = (searchValue: string) => {
        setSearchTerm(searchValue);
        onSearch(searchValue);
    };

    const clearSearch = () => {
        setSearchTerm('');
        onSearch('');
    };

    // Advanced filter handlers
    const handleAdvancedFilterChange = (field: keyof UnifiedDocumentFilters, value: any) => {
        const newFilters = { ...filters };
        if (value === '' || value === undefined) {
            delete newFilters[field];
        } else {
            newFilters[field] = value;
        }
        onFilterChange(newFilters);
    };

    const clearAllFilters = () => {
        onFilterChange({});
        setSearchTerm('');
        onSearch('');
    };

    // Type filter configuration
    const typeFilters = [
        { type: 'ALL' as FilterType, label: 'Wszystkie', icon: FaFilter },
        { type: DocumentType.INVOICE, label: DocumentTypeLabels[DocumentType.INVOICE], icon: FaFileInvoiceDollar },
        { type: DocumentType.RECEIPT, label: DocumentTypeLabels[DocumentType.RECEIPT], icon: FaReceipt },
        { type: DocumentType.OTHER, label: DocumentTypeLabels[DocumentType.OTHER], icon: FaExchangeAlt },
    ];

    // Check if any advanced filters are active
    const hasActiveFilters = Object.keys(filters).length > 0 || searchTerm.length > 0;

    return (
        <FiltersContainer>
            {/* Main Filter Row */}
            <MainFiltersRow>
                {/* Type Filters - now as tabs */}
                <TypeFiltersSection>
                    <FilterTabsList>
                        {typeFilters.map(({ type, label, icon: Icon }) => (
                            <FilterTab
                                key={type}
                                $active={activeTypeFilter === type}
                                onClick={() => onTypeFilterChange(type)}
                            >
                                <FilterTabIcon $active={activeTypeFilter === type}>
                                    <Icon />
                                </FilterTabIcon>
                                <FilterTabLabel>{label}</FilterTabLabel>
                            </FilterTab>
                        ))}
                    </FilterTabsList>
                </TypeFiltersSection>

                {/* Show Filters Toggle */}
                <FiltersToggleSection>
                    <FiltersToggleButton
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        $expanded={showAdvancedFilters}
                        $hasActiveFilters={hasActiveFilters}
                    >
                        <FaFilter />
                        Pokaż filtry
                        {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
                        {hasActiveFilters && <ActiveFiltersBadge />}
                    </FiltersToggleButton>
                </FiltersToggleSection>
            </MainFiltersRow>

            {/* Advanced Filters Panel - conditionally shown */}
            {showAdvancedFilters && (
                <AdvancedFiltersPanel>
                    {/* Filter Fields */}
                    <FiltersGrid>
                        <CompactFormGroup>
                            <CompactInput
                                value={filters.title || ''}
                                onChange={(e) => handleAdvancedFilterChange('title', e.target.value)}
                                placeholder="Nazwa dokumentu"
                            />
                        </CompactFormGroup>

                        <CompactFormGroup>
                            <CompactInput
                                value={filters.buyerName || ''}
                                onChange={(e) => handleAdvancedFilterChange('buyerName', e.target.value)}
                                placeholder="Kontrahent"
                            />
                        </CompactFormGroup>

                        <CompactFormGroup>
                            <CompactSelect
                                value={filters.status || ''}
                                onChange={(e) => handleAdvancedFilterChange('status', e.target.value)}
                            >
                                <option value="">Wszystkie statusy</option>
                                {Object.entries(DocumentStatusLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </CompactSelect>
                        </CompactFormGroup>

                        <CompactFormGroup>
                            <CompactSelect
                                value={filters.direction || ''}
                                onChange={(e) => handleAdvancedFilterChange('direction', e.target.value)}
                            >
                                <option value="">Kierunek</option>
                                {Object.entries(TransactionDirectionLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </CompactSelect>
                        </CompactFormGroup>

                        <CompactFormGroup>
                            <CompactInput
                                type="date"
                                value={filters.dateFrom || ''}
                                onChange={(e) => handleAdvancedFilterChange('dateFrom', e.target.value)}
                                placeholder="Data od"
                            />
                        </CompactFormGroup>

                        <CompactFormGroup>
                            <CompactInput
                                type="date"
                                value={filters.dateTo || ''}
                                onChange={(e) => handleAdvancedFilterChange('dateTo', e.target.value)}
                                placeholder="Data do"
                            />
                        </CompactFormGroup>

                        <CompactFormGroup>
                            <CompactInput
                                type="number"
                                step="0.01"
                                value={filters.minAmount || ''}
                                onChange={(e) => handleAdvancedFilterChange('minAmount', parseFloat(e.target.value) || undefined)}
                                placeholder="Kwota min"
                            />
                        </CompactFormGroup>

                        <CompactFormGroup>
                            <CompactInput
                                type="number"
                                step="0.01"
                                value={filters.maxAmount || ''}
                                onChange={(e) => handleAdvancedFilterChange('maxAmount', parseFloat(e.target.value) || undefined)}
                                placeholder="Kwota max"
                            />
                        </CompactFormGroup>

                        {/* Clear filters button */}
                        <CompactFormGroup>
                            <ClearFiltersButton
                                onClick={clearAllFilters}
                                $hasFilters={hasActiveFilters}
                                disabled={!hasActiveFilters}
                            >
                                <FaTimes />
                                Wyczyść wszystko
                            </ClearFiltersButton>
                        </CompactFormGroup>
                    </FiltersGrid>
                </AdvancedFiltersPanel>
            )}

            {/* Results Counter */}
            <ResultsCounter>
                <ResultsText>
                    Znaleziono: <strong>{resultCount}</strong> {resultCount === 1 ? 'dokument' : 'dokumentów'}
                </ResultsText>
            </ResultsCounter>
        </FiltersContainer>
    );
};

// Styled Components
const FiltersContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
    margin-top: 10px;
`;

const MainFiltersRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xl};
    padding: ${brandTheme.spacing.lg};
    border-bottom: 1px solid ${brandTheme.border};

    @media (max-width: 1024px) {
        flex-direction: column;
        gap: ${brandTheme.spacing.lg};
        align-items: stretch;
    }
`;

// Professional Tab-style Type Filters
const TypeFiltersSection = styled.div`
    flex-shrink: 0;
`;

const FilterTabsList = styled.div`
    display: flex;
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    overflow: hidden;
`;

const FilterTab = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border: none;
    background: ${props => props.$active ? brandTheme.primary : 'transparent'};
    color: ${props => props.$active ? 'white' : brandTheme.text.secondary};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: ${props => props.$active ? '600' : '500'};
    font-size: 14px;
    white-space: nowrap;

    &:hover {
        background: ${props => props.$active ? brandTheme.primaryDark : brandTheme.primaryGhost};
        color: ${props => props.$active ? 'white' : brandTheme.primary};
    }

    &:not(:last-child) {
        border-right: 1px solid ${brandTheme.border};
    }

    @media (max-width: 768px) {
        flex: 1;
        justify-content: center;
        padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    }
`;

const FilterTabIcon = styled.div<{ $active: boolean }>`
    font-size: 14px;
    display: flex;
    align-items: center;
`;

const FilterTabLabel = styled.span`
    @media (max-width: 640px) {
        display: none;
    }
`;

// Toggle Section
const FiltersToggleSection = styled.div`
    flex-shrink: 0;
`;

const FiltersToggleButton = styled.button<{ $expanded: boolean; $hasActiveFilters: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border: 2px solid ${props => props.$expanded ? brandTheme.primary : brandTheme.border};
    background: ${props => props.$expanded ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${props => props.$expanded ? brandTheme.primary : brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    position: relative;

    &:hover {
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
        background: ${brandTheme.primaryGhost};
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }

    svg:last-child {
        margin-left: ${brandTheme.spacing.xs};
        font-size: 12px;
    }
`;

const ActiveFiltersBadge = styled.span`
    position: absolute;
    top: -4px;
    right: -4px;
    width: 12px;
    height: 12px;
    background: ${brandTheme.status.warning};
    border-radius: 50%;
    border: 2px solid ${brandTheme.surface};
    animation: pulse 2s infinite;

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.1);
            opacity: 0.8;
        }
    }
`;

// Advanced Filters Panel
const AdvancedFiltersPanel = styled.div`
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-bottom: 1px solid ${brandTheme.border};
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
            max-height: 0;
            padding: 0 ${brandTheme.spacing.lg};
        }
        to {
            opacity: 1;
            transform: translateY(0);
            max-height: 500px;
            padding: ${brandTheme.spacing.lg};
        }
    }
`;

const SearchRow = styled.div`
    margin-bottom: ${brandTheme.spacing.lg};
    max-width: 400px;
`;

const SearchWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const SearchInput = styled.input`
    width: 100%;
    height: 44px;
    padding: 0 44px 0 16px;
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 15px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const ClearSearchButton = styled.button`
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
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
        transform: translateY(-50%) scale(1.1);
    }
`;

// Compact Advanced Filters - remove unused AdvancedFiltersRow
const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: ${brandTheme.spacing.sm};

    @media (max-width: 768px) {
        grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const CompactFormGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

const baseInputStyles = `
    height: 36px;
    padding: 0 ${brandTheme.spacing.sm};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    font-size: 13px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 2px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const CompactInput = styled.input`
    ${baseInputStyles}
`;

const CompactSelect = styled.select`
    ${baseInputStyles}
    cursor: pointer;
`;

const ClearFiltersButton = styled.button<{ $hasFilters: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.xs};
    height: 36px;
    padding: 0 ${brandTheme.spacing.sm};
    border: 1px solid ${props => props.$hasFilters ? brandTheme.status.error : brandTheme.border};
    background: ${props => props.$hasFilters ? brandTheme.status.errorLight : brandTheme.surface};
    color: ${props => props.$hasFilters ? brandTheme.status.error : brandTheme.text.muted};
    border-radius: ${brandTheme.radius.sm};
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover:not(:disabled) {
        background: ${brandTheme.status.error};
        color: white;
        border-color: ${brandTheme.status.error};
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const ResultsCounter = styled.div`
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.lg};
    background: ${brandTheme.primaryGhost};
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ResultsText = styled.div`
    font-size: 14px;
    color: ${brandTheme.primary};
    font-weight: 500;

    strong {
        font-weight: 700;
    }
`;

export default DocumentFilters;