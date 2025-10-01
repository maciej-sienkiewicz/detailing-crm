// src/pages/Finances/components/FixedCostsPage.tsx - Improved filters design
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {
    FaBuilding,
    FaChartPie,
    FaChevronDown,
    FaChevronUp,
    FaClock,
    FaEdit,
    FaExclamationTriangle,
    FaEye,
    FaFileInvoiceDollar,
    FaFilter,
    FaSort,
    FaSortDown,
    FaSortUp,
    FaTimes,
    FaTrashAlt
} from 'react-icons/fa';
import {
    CategorySummary,
    FixedCost,
    FixedCostCategoryLabels,
    FixedCostFilters,
    fixedCostsApi,
    FixedCostStatusColors,
    FixedCostStatusLabels,
    UpcomingPayments
} from '../../api/fixedCostsApi';
import {useToast} from '../../components/common/Toast/Toast';
import Pagination from '../../components/common/Pagination';
import {brandTheme} from './styles/theme';

type SortField = 'name' | 'monthlyAmount' | 'startDate' | 'category' | 'status';
type SortDirection = 'asc' | 'desc' | null;

interface FixedCostsPageProps {
    onAddFixedCost?: () => void;
    onRefreshData?: (refreshFn: () => Promise<void>) => void;
    onViewFixedCost?: (cost: FixedCost) => void;
    onEditFixedCost?: (cost: FixedCost) => void;
    onRecordPayment?: (cost: FixedCost) => void;
    onDeleteFixedCost?: (id: string, name: string) => void;
}

const FixedCostsPage: React.FC<FixedCostsPageProps> = ({
                                                           onAddFixedCost,
                                                           onRefreshData,
                                                           onViewFixedCost,
                                                           onEditFixedCost,
                                                           onRecordPayment,
                                                           onDeleteFixedCost
                                                       }) => {
    const { showToast } = useToast();

    // State
    const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
    const [categorySummary, setCategorySummary] = useState<CategorySummary | null>(null);
    const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayments | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters and search
    const [filters, setFilters] = useState<FixedCostFilters>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Sorting
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Pagination
    const [pagination, setPagination] = useState({
        currentPage: 0,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0
    });

    // Load data
    const loadData = async (currentPage = pagination.currentPage || 0, currentPageSize = pagination.pageSize || 20) => {
        try {
            setLoading(true);
            setError(null);

            // Add fallback data for development/testing
            const isDevelopment = process.env.NODE_ENV === 'development';

            try {
                const [costsResponse, summary, payments] = await Promise.all([
                    fixedCostsApi.fetchFixedCosts(filters, currentPage, currentPageSize),
                    fixedCostsApi.getCategorySummary().catch(() => ({
                        categories: [],
                        totalFixedCosts: 0,
                        period: new Date().toISOString().split('T')[0],
                        activeCostsCount: 0,
                        inactiveCostsCount: 0
                    })),
                    fixedCostsApi.getUpcomingPayments(30).catch(() => ({
                        period: '30 dni',
                        totalAmount: 0,
                        paymentsCount: 0,
                        overdueCount: 0,
                        overdueAmount: 0,
                        payments: []
                    }))
                ]);

                setFixedCosts(costsResponse.data);
                setPagination({
                    currentPage: costsResponse.pagination.currentPage,
                    pageSize: costsResponse.pagination.pageSize,
                    totalItems: costsResponse.pagination.totalItems,
                    totalPages: costsResponse.pagination.totalPages
                });
                setCategorySummary(summary);
                setUpcomingPayments(payments);

            } catch (apiError) {
                console.error('API Error:', apiError);

                if (isDevelopment) {
                    setFixedCosts([]);
                    setPagination({
                        currentPage: 0,
                        pageSize: 20,
                        totalItems: 0,
                        totalPages: 0
                    });
                    setCategorySummary({
                        categories: [],
                        totalFixedCosts: 0,
                        period: new Date().toISOString().split('T')[0],
                        activeCostsCount: 0,
                        inactiveCostsCount: 0
                    });
                    setUpcomingPayments({
                        period: '30 dni',
                        totalAmount: 0,
                        paymentsCount: 0,
                        overdueCount: 0,
                        overdueAmount: 0,
                        payments: []
                    });
                    setError('Tryb deweloperski - backend API niedostępny');
                } else {
                    throw apiError;
                }
            }

        } catch (err) {
            console.error('Error loading fixed costs data:', err);
            setError('Nie udało się załadować danych o kosztach stałych. Sprawdź połączenie z serwerem.');
        } finally {
            setLoading(false);
        }
    };

    // Effects
    useEffect(() => {
        loadData(0, 20);
    }, []);

    useEffect(() => {
        if (Object.keys(filters).length > 0 || searchTerm) {
            loadData(0, pagination.pageSize);
        }
    }, [filters, searchTerm]);

    useEffect(() => {
        if (pagination.currentPage > 0) {
            loadData(pagination.currentPage, pagination.pageSize);
        }
    }, [pagination.currentPage]);

    // Helper functions
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('pl-PL');
    };

    // Handle sorting
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev =>
                prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
            );
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <FaSort />;
        if (sortDirection === 'asc') return <FaSortUp />;
        if (sortDirection === 'desc') return <FaSortDown />;
        return <FaSort />;
    };

    // Apply client-side sorting
    const sortedFixedCosts = React.useMemo(() => {
        if (!sortDirection) return fixedCosts;

        return [...fixedCosts].sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            if (sortField === 'startDate') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [fixedCosts, sortField, sortDirection]);

    // Apply search filter
    const filteredFixedCosts = React.useMemo(() => {
        if (!searchTerm) return sortedFixedCosts;

        const searchLower = searchTerm.toLowerCase();
        return sortedFixedCosts.filter(cost =>
            cost.name.toLowerCase().includes(searchLower) ||
            cost.description?.toLowerCase().includes(searchLower) ||
            cost.supplierInfo?.name.toLowerCase().includes(searchLower) ||
            cost.contractNumber?.toLowerCase().includes(searchLower)
        );
    }, [sortedFixedCosts, searchTerm]);

    // Handle actions
    const handleDeleteFixedCost = async (id: string, name: string) => {
        if (onDeleteFixedCost) {
            onDeleteFixedCost(id, name);
        } else {
            if (window.confirm(`Czy na pewno chcesz usunąć koszt stały "${name}"?`)) {
                try {
                    const success = await fixedCostsApi.deleteFixedCost(id);
                    if (success) {
                        showToast('success', 'Koszt stały został usunięty');
                    } else {
                        showToast('error', 'Nie udało się usunąć kosztu stałego');
                    }
                } catch (error) {
                    console.error('Error deleting fixed cost:', error);
                    showToast('error', 'Wystąpił błąd podczas usuwania kosztu stałego');
                }
            }
        }
    };

    const handleQuickAction = (action: string, cost: FixedCost, e: React.MouseEvent) => {
        e.stopPropagation();

        switch (action) {
            case 'view':
                handleViewCost(cost);
                break;
            case 'edit':
                handleEditCost(cost);
                break;
            case 'delete':
                handleDeleteFixedCost(cost.id, cost.name);
                break;
            case 'payment':
                handleRecordPaymentForCost(cost);
                break;
        }
    };

    // Separate handlers for table row clicks
    const handleViewCost = (cost: FixedCost) => {
        if (onViewFixedCost) {
            onViewFixedCost(cost);
        } else {
        }
    };

    const handleEditCost = (cost: FixedCost) => {
        if (onEditFixedCost) {
            onEditFixedCost(cost);
        } else {
        }
    };

    const handleRecordPaymentForCost = (cost: FixedCost) => {
        if (onRecordPayment) {
            onRecordPayment(cost);
        } else {
        }
    };

    // Handle filter changes
    const handleFilterChange = (field: keyof FixedCostFilters, value: any) => {
        const newFilters = { ...filters };
        if (value === '' || value === undefined) {
            delete newFilters[field];
        } else {
            newFilters[field] = value;
        }
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, currentPage: 0 }));
    };

    const clearAllFilters = () => {
        setFilters({});
        setSearchTerm('');
        setPagination(prev => ({ ...prev, currentPage: 0 }));
    };

    const handleQuickSearch = (searchValue: string) => {
        setSearchTerm(searchValue);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    // Check if any filters are active
    const hasActiveFilters = Object.keys(filters).length > 0 || searchTerm.length > 0;

    if (loading && fixedCosts.length === 0) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie kosztów stałych...</LoadingText>
                </LoadingContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Summary Cards */}
            {categorySummary && (
                <SummarySection>
                    <SummaryCardsGrid>
                        <SummaryCard>
                            <CardIcon $color={brandTheme.primary}>
                                <FaBuilding />
                            </CardIcon>
                            <CardContent>
                                <CardValue>{formatAmount(categorySummary.totalFixedCosts)}</CardValue>
                                <CardLabel>Całkowite koszty</CardLabel>
                                <CardDetail>Miesięczne koszty stałe</CardDetail>
                            </CardContent>
                        </SummaryCard>

                        <SummaryCard>
                            <CardIcon $color={brandTheme.primary}>
                                <FaChartPie />
                            </CardIcon>
                            <CardContent>
                                <CardValue>{categorySummary.activeCostsCount}</CardValue>
                                <CardLabel>Aktywne koszty</CardLabel>
                                <CardDetail>Obecnie aktywnych pozycji</CardDetail>
                            </CardContent>
                        </SummaryCard>

                        <SummaryCard>
                            <CardIcon $color={brandTheme.primary}>
                                <FaClock />
                            </CardIcon>
                            <CardContent>
                                <CardValue>{upcomingPayments?.paymentsCount}</CardValue>
                                <CardLabel>Nadchodzące płatności</CardLabel>
                                <CardDetail>W ciągu najbliższych 30 dni</CardDetail>
                            </CardContent>
                        </SummaryCard>

                        {upcomingPayments && upcomingPayments.overdueCount > 0 && (
                            <SummaryCard $type="warning">
                                <CardIcon $color={brandTheme.primary}>
                                    <FaExclamationTriangle />
                                </CardIcon>
                                <CardContent>
                                    <CardValue $type="error">{upcomingPayments.overdueCount}</CardValue>
                                    <CardLabel>Przeterminowane</CardLabel>
                                    <CardDetail>Wymaga natychmiastowej uwagi</CardDetail>
                                </CardContent>
                            </SummaryCard>
                        )}
                    </SummaryCardsGrid>
                </SummarySection>
            )}

            {/* Main Content */}
            <ContentContainer>
                {/* IMPROVED Filters */}
                <FiltersContainer>

                    {/* Advanced Filters Panel - conditionally shown */}
                    {showAdvancedFilters && (
                        <AdvancedFiltersPanel>
                            {/* Filter Fields - search removed since it's in main row */}
                            <FiltersGrid>
                                <CompactFormGroup>
                                    <CompactSelect
                                        value={filters.category || ''}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                    >
                                        <option value="">Wszystkie kategorie</option>
                                        {Object.entries(FixedCostCategoryLabels).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </CompactSelect>
                                </CompactFormGroup>

                                <CompactFormGroup>
                                    <CompactSelect
                                        value={filters.status || ''}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    >
                                        <option value="">Wszystkie statusy</option>
                                        {Object.entries(FixedCostStatusLabels).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </CompactSelect>
                                </CompactFormGroup>

                                <CompactFormGroup>
                                    <CompactInput
                                        value={filters.supplierName || ''}
                                        onChange={(e) => handleFilterChange('supplierName', e.target.value)}
                                        placeholder="Dostawca"
                                    />
                                </CompactFormGroup>

                                <CompactFormGroup>
                                    <CompactInput
                                        type="number"
                                        step="0.01"
                                        value={filters.minAmount || ''}
                                        onChange={(e) => handleFilterChange('minAmount', parseFloat(e.target.value) || undefined)}
                                        placeholder="Kwota min"
                                    />
                                </CompactFormGroup>

                                <CompactFormGroup>
                                    <CompactInput
                                        type="number"
                                        step="0.01"
                                        value={filters.maxAmount || ''}
                                        onChange={(e) => handleFilterChange('maxAmount', parseFloat(e.target.value) || undefined)}
                                        placeholder="Kwota max"
                                    />
                                </CompactFormGroup>

                                <CompactFormGroup>
                                    <CompactInput
                                        type="date"
                                        value={filters.startDateFrom || ''}
                                        onChange={(e) => handleFilterChange('startDateFrom', e.target.value)}
                                        placeholder="Data rozpoczęcia od"
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
                            Znaleziono: <strong>{filteredFixedCosts.length}</strong> {filteredFixedCosts.length === 1 ? 'koszt' : 'kosztów'}
                        </ResultsText>
                    </ResultsCounter>
                </FiltersContainer>

                {/* Error Display */}
                {error && (
                    <ErrorMessage>
                        <ErrorIcon>⚠️</ErrorIcon>
                        <ErrorText>{error}</ErrorText>
                    </ErrorMessage>
                )}

                {/* Fixed Costs Table */}
                <TableContainer>
                    <TableHeader>
                        <TableTitle>
                            Koszty stałe ({filteredFixedCosts.length})
                        </TableTitle>

                        {/* Search and Filters in Table Header */}
                        <TableHeaderControls>
                            {/* Quick Search */}
                            <SearchWrapper>
                                {searchTerm && (
                                    <ClearSearchButton onClick={clearSearch}>
                                        <FaTimes />
                                    </ClearSearchButton>
                                )}
                            </SearchWrapper>

                            {/* Advanced Filters Toggle */}
                            <FiltersToggleButton
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                $expanded={showAdvancedFilters}
                                $hasActiveFilters={hasActiveFilters}
                            >
                                <FaFilter />
                                Filtry
                                {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
                                {hasActiveFilters && <ActiveFiltersBadge />}
                            </FiltersToggleButton>
                        </TableHeaderControls>
                    </TableHeader>

                    {filteredFixedCosts.length === 0 ? (
                        <EmptyStateContainer>
                            <EmptyStateIcon>
                                <FaBuilding />
                            </EmptyStateIcon>
                            <EmptyStateTitle>Brak kosztów stałych</EmptyStateTitle>
                            <EmptyStateDescription>
                                {searchTerm || Object.keys(filters).length > 0
                                    ? 'Nie znaleziono kosztów stałych spełniających kryteria wyszukiwania'
                                    : 'Nie masz jeszcze żadnych kosztów stałych w systemie'
                                }
                            </EmptyStateDescription>
                            {!searchTerm && Object.keys(filters).length === 0 && (
                                <EmptyStateAction>
                                    Kliknij przycisk "Dodaj koszt stały", aby dodać pierwszy koszt
                                </EmptyStateAction>
                            )}
                        </EmptyStateContainer>
                    ) : (
                        <TableWrapper>
                            <Table>
                                <TableHead>
                                    <TableRowHeader>
                                        <SortableHeaderCell onClick={() => handleSort('name')}>
                                            Nazwa
                                            <SortIconWrapper>
                                                {getSortIcon('name')}
                                            </SortIconWrapper>
                                        </SortableHeaderCell>
                                        <SortableHeaderCell onClick={() => handleSort('category')}>
                                            Kategoria
                                            <SortIconWrapper>
                                                {getSortIcon('category')}
                                            </SortIconWrapper>
                                        </SortableHeaderCell>
                                        <TableHeaderCell>Dostawca</TableHeaderCell>
                                        <SortableHeaderCell onClick={() => handleSort('monthlyAmount')}>
                                            Kwota miesięczna
                                            <SortIconWrapper>
                                                {getSortIcon('monthlyAmount')}
                                            </SortIconWrapper>
                                        </SortableHeaderCell>
                                        <TableHeaderCell>Częstotliwość</TableHeaderCell>
                                        <SortableHeaderCell onClick={() => handleSort('startDate')}>
                                            Data rozpoczęcia
                                            <SortIconWrapper>
                                                {getSortIcon('startDate')}
                                            </SortIconWrapper>
                                        </SortableHeaderCell>
                                        <TableHeaderCell>Następna płatność</TableHeaderCell>
                                        <SortableHeaderCell onClick={() => handleSort('status')}>
                                            Status
                                            <SortIconWrapper>
                                                {getSortIcon('status')}
                                            </SortIconWrapper>
                                        </SortableHeaderCell>
                                        <TableHeaderCell>Akcje</TableHeaderCell>
                                    </TableRowHeader>
                                </TableHead>
                                <TableBody>
                                    {filteredFixedCosts.map(cost => (
                                        <TableRow key={cost.id} onClick={() => handleViewCost(cost)}>
                                            <TableCell>
                                                <NameCell>
                                                    <CostName>{cost.name}</CostName>
                                                    {cost.description && (
                                                        <CostDescription>{cost.description}</CostDescription>
                                                    )}
                                                    {cost.contractNumber && (
                                                        <ContractNumber>Umowa: {cost.contractNumber}</ContractNumber>
                                                    )}
                                                </NameCell>
                                            </TableCell>
                                            <TableCell>
                                                <FrequencyBadge>
                                                    {cost.categoryDisplay}
                                                </FrequencyBadge>
                                            </TableCell>
                                            <TableCell>
                                                <SupplierCell>
                                                    {cost.supplierInfo ? (
                                                        <>
                                                            <SupplierName>{cost.supplierInfo.name}</SupplierName>
                                                            {cost.supplierInfo.taxId && (
                                                                <SupplierTaxId>NIP: {cost.supplierInfo.taxId}</SupplierTaxId>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <NoSupplier>-</NoSupplier>
                                                    )}
                                                </SupplierCell>
                                            </TableCell>
                                            <TableCell>
                                                <AmountCell>
                                                    <MainAmount>{formatAmount(cost.calculatedMonthlyAmount)}</MainAmount>
                                                    {cost.calculatedMonthlyAmount !== cost.monthlyAmount && (
                                                        <OriginalAmount>
                                                            (bazowa {formatAmount(cost.monthlyAmount)})
                                                        </OriginalAmount>
                                                    )}
                                                </AmountCell>
                                            </TableCell>
                                            <TableCell>
                                                <FrequencyBadge>
                                                    {cost.frequencyDisplay}
                                                </FrequencyBadge>
                                            </TableCell>
                                            <TableCell>{formatDate(cost.startDate)}</TableCell>
                                            <TableCell>
                                                {cost.nextPaymentDate ? (
                                                    <NextPaymentCell>
                                                        <PaymentDate>{formatDate(cost.nextPaymentDate)}</PaymentDate>
                                                        {new Date(cost.nextPaymentDate) < new Date() && (
                                                            <OverdueWarning>
                                                                <FaExclamationTriangle />
                                                                Przeterminowane
                                                            </OverdueWarning>
                                                        )}
                                                    </NextPaymentCell>
                                                ) : (
                                                    <NoPayment>-</NoPayment>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={cost.status}>
                                                    {cost.statusDisplay}
                                                </StatusBadge>
                                            </TableCell>
                                            <TableCell>
                                                <ActionButtons>
                                                    <ActionButton
                                                        onClick={(e) => handleQuickAction('view', cost, e)}
                                                        title="Podgląd"
                                                        $variant="view"
                                                    >
                                                        <FaEye />
                                                    </ActionButton>
                                                    <ActionButton
                                                        onClick={(e) => handleQuickAction('edit', cost, e)}
                                                        title="Edytuj"
                                                        $variant="view"
                                                    >
                                                        <FaEdit />
                                                    </ActionButton>
                                                    <ActionButton
                                                        onClick={(e) => handleQuickAction('payment', cost, e)}
                                                        title="Zarejestruj płatność"
                                                        $variant="view"
                                                    >
                                                        <FaFileInvoiceDollar />
                                                    </ActionButton>
                                                    <ActionButton
                                                        onClick={(e) => handleQuickAction('delete', cost, e)}
                                                        title="Usuń"
                                                        $variant="view"
                                                    >
                                                        <FaTrashAlt />
                                                    </ActionButton>
                                                </ActionButtons>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableWrapper>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <PaginationContainer>
                            <Pagination
                                currentPage={pagination.currentPage + 1}
                                totalPages={pagination.totalPages}
                                onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page - 1 }))}
                                totalItems={pagination.totalItems}
                                pageSize={pagination.pageSize}
                                showTotalItems={true}
                            />
                        </PaginationContainer>
                    )}
                </TableContainer>
            </ContentContainer>
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${brandTheme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    gap: ${brandTheme.spacing.md};
    min-height: 400px;
    margin: ${brandTheme.spacing.xl};
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${brandTheme.borderLight};
    border-top: 3px solid ${brandTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const SummarySection = styled.section`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl} 0;

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg} 0;
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.md} 0;
    }
`;

const SummaryCardsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${brandTheme.spacing.lg};
    margin-bottom: ${brandTheme.spacing.lg};

    @media (max-width: 992px) {
        grid-template-columns: 1fr;
    }

    @media (max-width: 768px) {
        gap: ${brandTheme.spacing.md};
    }
`;

const SummaryCard = styled.div<{ $type?: 'warning' }>`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${props => props.$type === 'warning' ? brandTheme.status.error : brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.xs};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg};
    transition: all 0.2s ease;
    position: relative;
    min-height: 110px;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.sm};
        border-color: ${brandTheme.borderHover};
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: ${props => props.$type === 'warning' ? brandTheme.status.error : brandTheme.primary};
        opacity: 0.8;
    }
`;

const CardIcon = styled.div<{ $color: string }>`
    width: 48px;
    height: 48px;
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.text.secondary};
    font-size: 20px;
    flex-shrink: 0;
    border: 1px solid ${brandTheme.border};
    transition: all 0.2s ease;

    ${SummaryCard}:hover & {
        background: ${brandTheme.primary};
        color: white;
        border-color: ${brandTheme.primary};
    }
`;

const CardContent = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
`;

const CardValue = styled.div<{ $type?: string }>`
    font-size: 20px;
    font-weight: 600;
    color: ${props => {
        if (props.$type === 'error') return brandTheme.status.error;
        return brandTheme.text.primary;
    }};
    margin-bottom: ${brandTheme.spacing.xs};
    letter-spacing: -0.025em;
    line-height: 1.2;
    height: 24px;
    display: flex;
    align-items: center;

    @media (max-width: 768px) {
        font-size: 18px;
    }
`;

const CardLabel = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.primary};
    font-weight: 600;
    margin-bottom: ${brandTheme.spacing.xs};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    height: 17px;
    display: flex;
    align-items: center;
`;

const CardDetail = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.tertiary};
    font-weight: 500;
    line-height: 1.3;
    min-height: 16px;
    display: flex;
    align-items: center;
`;

const ContentContainer = styled.div`
    flex: 1;
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 ${brandTheme.spacing.xl} ${brandTheme.spacing.xl};
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
    min-height: 0;

    @media (max-width: 1024px) {
        padding: 0 ${brandTheme.spacing.lg} ${brandTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${brandTheme.spacing.md} ${brandTheme.spacing.md};
        gap: ${brandTheme.spacing.md};
    }
`;

// IMPROVED Filters Components - only what's needed
const FiltersContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
    margin-bottom: ${brandTheme.spacing.lg};
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

    @media (max-width: 768px) {
        gap: ${brandTheme.spacing.md};
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

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.status.error}30;
    font-weight: 500;
    box-shadow: ${brandTheme.shadow.xs};
`;

const ErrorIcon = styled.div`
    font-size: 18px;
    flex-shrink: 0;
`;

const ErrorText = styled.div`
    flex: 1;
`;

const FiltersToggleSection = styled.div`
    flex-shrink: 0;
`;

const TableContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

const TableHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg};
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
    flex-shrink: 0;
    gap: ${brandTheme.spacing.xl};

    @media (max-width: 1024px) {
        flex-direction: column;
        align-items: stretch;
        gap: ${brandTheme.spacing.lg};
    }
`;

const TableTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;
    flex-shrink: 0;
`;

// New component for header controls
const TableHeaderControls = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    flex-shrink: 0;

    @media (max-width: 768px) {
        flex-direction: column;
        width: 100%;
        gap: ${brandTheme.spacing.sm};
    }
`;

const SearchWrapper = styled.div`
    position: relative;
    width: 300px;
    flex-shrink: 0;

    @media (max-width: 768px) {
        width: 100%;
    }
`;

const SearchInput = styled.input`
    width: 100%;
    height: 40px;
    padding: 0 40px 0 16px;
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

const ClearSearchButton = styled.button`
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    border: none;
    background: ${brandTheme.text.muted};
    color: white;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.status.error};
        transform: translateY(-50%) scale(1.1);
    }
`;

const FiltersToggleButton = styled.button<{ $expanded: boolean; $hasActiveFilters: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
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
    height: 40px; /* Match search input height */
    flex-shrink: 0;

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

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

const TableWrapper = styled.div`
    flex: 1;
    overflow: auto;
    min-height: 0;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHead = styled.thead`
    background: ${brandTheme.surfaceAlt};
    border-bottom: 2px solid ${brandTheme.border};
    position: sticky;
    top: 0;
    z-index: 10;
`;

const TableRowHeader = styled.tr``;

const TableHeaderCell = styled.th`
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.md};
    text-align: left;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 14px;
    border-right: 1px solid ${brandTheme.border};

    &:last-child {
        border-right: none;
    }
`;

const SortableHeaderCell = styled(TableHeaderCell)`
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
    position: relative;
    display: table-cell;

    &:hover {
        background: ${brandTheme.primaryGhost};
        color: ${brandTheme.primary};
    }
`;

const SortIconWrapper = styled.span`
    margin-left: ${brandTheme.spacing.xs};
    opacity: 0.6;
    font-size: 12px;
`;

const TableBody = styled.tbody`
    background: ${brandTheme.surface};
`;

const TableRow = styled.tr`
    border-bottom: 1px solid ${brandTheme.borderLight};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
        background: ${brandTheme.surfaceHover};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.td`
    padding: ${brandTheme.spacing.md};
    border-right: 1px solid ${brandTheme.borderLight};
    vertical-align: middle;

    &:last-child {
        border-right: none;
    }
`;

const NameCell = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const CostName = styled.div`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 14px;
`;

const CostDescription = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    line-height: 1.4;
`;

const ContractNumber = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.tertiary};
    font-weight: 500;
`;

const SupplierCell = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const SupplierName = styled.div`
    font-weight: 500;
    color: ${brandTheme.text.primary};
    font-size: 13px;
`;

const SupplierTaxId = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.tertiary};
`;

const NoSupplier = styled.div`
    color: ${brandTheme.text.muted};
    font-style: italic;
    font-size: 13px;
`;

const AmountCell = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
`;

const MainAmount = styled.div`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 14px;
`;

const OriginalAmount = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.muted};
    font-style: italic;
`;

const FrequencyBadge = styled.span`
    display: inline-block;
    padding: 4px 8px;
    border-radius: ${brandTheme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    background-color: ${brandTheme.surfaceAlt};
    color: ${brandTheme.text.secondary};
    border: 1px solid ${brandTheme.border};
`;

const NextPaymentCell = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const PaymentDate = styled.div`
    font-weight: 500;
    color: ${brandTheme.text.primary};
    font-size: 13px;
`;

const OverdueWarning = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: ${brandTheme.status.error};
    font-weight: 600;

    svg {
        font-size: 10px;
    }
`;

const NoPayment = styled.div`
    color: ${brandTheme.text.muted};
    font-style: italic;
    font-size: 13px;
`;

const StatusBadge = styled.span<{ status: string }>`
    display: inline-block;
    padding: 6px 12px;
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 600;
    background-color: ${props => `${FixedCostStatusColors[props.status as keyof typeof FixedCostStatusColors]}22`};
    color: ${props => FixedCostStatusColors[props.status as keyof typeof FixedCostStatusColors]};
    border: 1px solid ${props => `${FixedCostStatusColors[props.status as keyof typeof FixedCostStatusColors]}44`};
`;

const ActionButtons = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};
    align-items: center;
`;

const ActionButton = styled.button<{
    $variant: 'view' | 'edit' | 'delete' | 'payment';
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: ${brandTheme.radius.sm};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 13px;
    position: relative;
    overflow: hidden;

    ${({ $variant }) => {
        switch ($variant) {
            case 'view':
                return `
                    background: ${brandTheme.primaryGhost};
                    color: ${brandTheme.primary};
                    &:hover {
                        background: ${brandTheme.primary};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            case 'edit':
                return `
                    background: ${brandTheme.status.warningLight};
                    color: ${brandTheme.status.warning};
                    &:hover {
                        background: ${brandTheme.status.warning};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            case 'payment':
                return `
                    background: ${brandTheme.status.successLight};
                    color: ${brandTheme.status.success};
                    &:hover {
                        background: ${brandTheme.status.success};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            case 'delete':
                return `
                    background: ${brandTheme.status.errorLight};
                    color: ${brandTheme.status.error};
                    &:hover {
                        background: ${brandTheme.status.error};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
        }
    }}
`;

const EmptyStateContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 2px dashed ${brandTheme.border};
    text-align: center;
    min-height: 400px;
    margin: ${brandTheme.spacing.lg};
`;

const EmptyStateIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${brandTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: ${brandTheme.text.tertiary};
    margin-bottom: ${brandTheme.spacing.lg};
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
`;

const EmptyStateTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
    letter-spacing: -0.025em;
`;

const EmptyStateDescription = styled.p`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
    line-height: 1.5;
`;

const EmptyStateAction = styled.p`
    font-size: 14px;
    color: ${brandTheme.primary};
    margin: 0;
    font-weight: 500;
`;

const PaginationContainer = styled.div`
    display: flex;
    justify-content: center;
    padding: ${brandTheme.spacing.lg} 0;
`;

export default FixedCostsPage;