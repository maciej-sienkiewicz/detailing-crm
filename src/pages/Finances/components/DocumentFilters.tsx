// src/pages/Finances/components/DocumentFilters.tsx
import React, {useState} from 'react';
import styled from 'styled-components';
import {
    FaChevronDown,
    FaChevronUp,
    FaExchangeAlt,
    FaFileInvoiceDollar,
    FaFilter,
    FaReceipt,
    FaSearch,
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

    // Quick search handler
    const handleQuickSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);
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

    return (
        <FiltersContainer>
            {/* Quick Search */}
            <QuickSearchSection>
                <SearchWrapper>
                    <SearchIcon>
                        <FaSearch />
                    </SearchIcon>
                    <SearchInput
                        type="text"
                        value={searchTerm}
                        onChange={handleQuickSearch}
                        placeholder="Szybkie wyszukiwanie - nazwa, kontrahent, numer..."
                    />
                    {searchTerm && (
                        <ClearSearchButton onClick={clearSearch}>
                            <FaTimes />
                        </ClearSearchButton>
                    )}
                </SearchWrapper>

                <AdvancedToggle
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    $expanded={showAdvancedFilters}
                >
                    <FaFilter />
                    Filtry zaawansowane
                    {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
                </AdvancedToggle>
            </QuickSearchSection>

            {/* Type Filters */}
            <TypeFiltersSection>
                <TypeFiltersGrid>
                    {typeFilters.map(({ type, label, icon: Icon }) => (
                        <TypeFilterCard
                            key={type}
                            $active={activeTypeFilter === type}
                            onClick={() => onTypeFilterChange(type)}
                        >
                            <TypeFilterIcon>
                                <Icon />
                            </TypeFilterIcon>
                            <TypeFilterLabel>{label}</TypeFilterLabel>
                        </TypeFilterCard>
                    ))}
                </TypeFiltersGrid>
            </TypeFiltersSection>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
                <AdvancedFiltersSection>
                    <FiltersGrid>
                        <FormGroup>
                            <Label>Nazwa dokumentu</Label>
                            <Input
                                value={filters.title || ''}
                                onChange={(e) => handleAdvancedFilterChange('title', e.target.value)}
                                placeholder="Nazwa dokumentu"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Kontrahent</Label>
                            <Input
                                value={filters.buyerName || ''}
                                onChange={(e) => handleAdvancedFilterChange('buyerName', e.target.value)}
                                placeholder="Nazwa kontrahenta"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Status</Label>
                            <Select
                                value={filters.status || ''}
                                onChange={(e) => handleAdvancedFilterChange('status', e.target.value)}
                            >
                                <option value="">Wszystkie statusy</option>
                                {Object.entries(DocumentStatusLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label>Kierunek</Label>
                            <Select
                                value={filters.direction || ''}
                                onChange={(e) => handleAdvancedFilterChange('direction', e.target.value)}
                            >
                                <option value="">Wszystkie</option>
                                {Object.entries(TransactionDirectionLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label>Data od</Label>
                            <Input
                                type="date"
                                value={filters.dateFrom || ''}
                                onChange={(e) => handleAdvancedFilterChange('dateFrom', e.target.value)}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Data do</Label>
                            <Input
                                type="date"
                                value={filters.dateTo || ''}
                                onChange={(e) => handleAdvancedFilterChange('dateTo', e.target.value)}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Kwota od</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={filters.minAmount || ''}
                                onChange={(e) => handleAdvancedFilterChange('minAmount', parseFloat(e.target.value) || undefined)}
                                placeholder="Minimalna kwota"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Kwota do</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={filters.maxAmount || ''}
                                onChange={(e) => handleAdvancedFilterChange('maxAmount', parseFloat(e.target.value) || undefined)}
                                placeholder="Maksymalna kwota"
                            />
                        </FormGroup>
                    </FiltersGrid>

                    <FiltersActions>
                        <ClearButton onClick={clearAllFilters}>
                            <FaTimes />
                            Wyczyść wszystkie
                        </ClearButton>
                    </FiltersActions>
                </AdvancedFiltersSection>
            )}

            {/* Results Counter */}
            <ResultsCounter>
                Znaleziono: <strong>{resultCount}</strong> {resultCount === 1 ? 'dokument' : 'dokumentów'}
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
`;

const QuickSearchSection = styled.div`
    padding: ${brandTheme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    border-bottom: 1px solid ${brandTheme.border};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const SearchWrapper = styled.div`
    position: relative;
    flex: 1;
    max-width: 500px;

    @media (max-width: 768px) {
        max-width: none;
    }
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${brandTheme.text.muted};
    font-size: 16px;
    z-index: 2;
`;

const SearchInput = styled.input`
    width: 100%;
    height: 48px;
    padding: 0 48px 0 48px;
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    font-size: 16px;
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
    width: 24px;
    height: 24px;
    border: none;
    background: ${brandTheme.surfaceAlt};
    color: ${brandTheme.text.muted};
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.status.error};
        color: white;
    }
`;

const AdvancedToggle = styled.button<{ $expanded: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: 2px solid ${props => props.$expanded ? brandTheme.primary : brandTheme.border};
    background: ${props => props.$expanded ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${props => props.$expanded ? brandTheme.primary : brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
    }
`;

const TypeFiltersSection = styled.div`
    padding: ${brandTheme.spacing.lg};
    border-bottom: 1px solid ${brandTheme.border};
`;

const TypeFiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${brandTheme.spacing.md};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const TypeFilterCard = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border: 2px solid ${props => props.$active ? brandTheme.primary : brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    background: ${props => props.$active ? brandTheme.primaryGhost : brandTheme.surface};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${brandTheme.primary};
        background: ${brandTheme.primaryGhost};
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const TypeFilterIcon = styled.div`
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.primary};
    font-size: 16px;
`;

const TypeFilterLabel = styled.div`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 14px;
`;

const AdvancedFiltersSection = styled.div`
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const Input = styled.input`
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
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

const Select = styled.select`
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }
`;

const FiltersActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.sm};
    padding-top: ${brandTheme.spacing.md};
    border-top: 1px solid ${brandTheme.border};
`;

const ClearButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${brandTheme.status.error};
        color: ${brandTheme.status.error};
        background: ${brandTheme.status.errorLight};
    }
`;

const ResultsCounter = styled.div`
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    border-top: 1px solid ${brandTheme.border};

    strong {
        font-weight: 700;
    }
`;

export default DocumentFilters;