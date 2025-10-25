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

    const typeFilters = [
        { type: 'ALL' as FilterType, label: 'Wszystkie', icon: FaFilter },
        { type: DocumentType.INVOICE, label: DocumentTypeLabels[DocumentType.INVOICE], icon: FaFileInvoiceDollar },
        { type: DocumentType.RECEIPT, label: DocumentTypeLabels[DocumentType.RECEIPT], icon: FaReceipt },
        { type: DocumentType.OTHER, label: DocumentTypeLabels[DocumentType.OTHER], icon: FaExchangeAlt },
    ];

    const hasActiveFilters = Object.keys(filters).length > 0 || searchTerm.length > 0;

    return (
        <FiltersContainer>
            <MainFiltersRow>
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

            {showAdvancedFilters && (
                <AdvancedFiltersPanel>
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

            <ResultsCounter>
                <ResultsText>
                    Znaleziono: <strong>{resultCount}</strong> {resultCount === 1 ? 'dokument' : 'dokumentów'}
                </ResultsText>
            </ResultsCounter>
        </FiltersContainer>
    );
};

const FiltersContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
    margin-top: ${brandTheme.spacing.sm};
`;

const MainFiltersRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.lg};
    padding: ${brandTheme.spacing.md};
    border-bottom: 1px solid ${brandTheme.border};

    @media (max-width: 1024px) {
        flex-direction: column;
        gap: ${brandTheme.spacing.md};
        align-items: stretch;
    }
`;

const TypeFiltersSection = styled.div`
    flex-shrink: 0;
`;

const FilterTabsList = styled.div`
    display: flex;
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    overflow: hidden;
`;

const FilterTab = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border: none;
    background: ${props => props.$active ? brandTheme.primary : 'transparent'};
    color: ${props => props.$active ? 'white' : brandTheme.text.secondary};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: ${props => props.$active ? '600' : '500'};
    font-size: 12px;
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
        padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    }
`;

const FilterTabIcon = styled.div<{ $active: boolean }>`
    font-size: 11px;
    display: flex;
    align-items: center;
`;

const FilterTabLabel = styled.span`
    @media (max-width: 640px) {
        display: none;
    }
`;

const FiltersToggleSection = styled.div`
    flex-shrink: 0;
`;

const FiltersToggleButton = styled.button<{ $expanded: boolean; $hasActiveFilters: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border: 2px solid ${props => props.$expanded ? brandTheme.primary : brandTheme.border};
    background: ${props => props.$expanded ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${props => props.$expanded ? brandTheme.primary : brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.sm};
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    position: relative;
    height: 30px;

    &:hover {
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
        background: ${brandTheme.primaryGhost};
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }

    svg:last-child {
        margin-left: ${brandTheme.spacing.xs};
        font-size: 10px;
    }
`;

const ActiveFiltersBadge = styled.span`
    position: absolute;
    top: -3px;
    right: -3px;
    width: 8px;
    height: 8px;
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

const AdvancedFiltersPanel = styled.div`
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surfaceAlt};
    border-bottom: 1px solid ${brandTheme.border};
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
            padding: 0 ${brandTheme.spacing.md};
        }
        to {
            opacity: 1;
            transform: translateY(0);
            max-height: 500px;
            padding: ${brandTheme.spacing.md};
        }
    }
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: ${brandTheme.spacing.xs};

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
    height: 28px;
    padding: 0 ${brandTheme.spacing.sm};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    font-size: 11px;
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
    height: 28px;
    padding: 0 ${brandTheme.spacing.sm};
    border: 1px solid ${props => props.$hasFilters ? brandTheme.status.error : brandTheme.border};
    background: ${props => props.$hasFilters ? brandTheme.status.errorLight : brandTheme.surface};
    color: ${props => props.$hasFilters ? brandTheme.status.error : brandTheme.text.muted};
    border-radius: ${brandTheme.radius.sm};
    font-weight: 600;
    font-size: 11px;
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
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.md};
    background: ${brandTheme.primaryGhost};
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ResultsText = styled.div`
    font-size: 11px;
    color: ${brandTheme.primary};
    font-weight: 500;

    strong {
        font-weight: 700;
    }
`;

export default DocumentFilters;