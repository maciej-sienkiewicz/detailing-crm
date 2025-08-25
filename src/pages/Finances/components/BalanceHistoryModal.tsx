// src/pages/Finances/components/BalanceHistoryModal.tsx
import React, {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {
    FaChevronLeft,
    FaChevronRight,
    FaFilter,
    FaHistory,
    FaMoneyBillWave,
    FaSearch,
    FaSpinner,
    FaTimes,
    FaUniversity
} from 'react-icons/fa';
import {brandTheme} from '../styles/theme';
import {
    BalanceHistoryResponse,
    BalanceHistorySearchRequest,
    balanceOverrideApi,
    BalanceType
} from '../../../api/balanceOverrideApi';
import {getOperationTypeLabel} from '../utils/operationTypeUtils';

interface BalanceHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    balanceType?: BalanceType;
    initialDocumentId?: string;
}

const BalanceHistoryModal: React.FC<BalanceHistoryModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     balanceType,
                                                                     initialDocumentId
                                                                 }) => {
    const [history, setHistory] = useState<BalanceHistoryResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState<BalanceHistorySearchRequest>({
        balanceType: balanceType,
        documentId: initialDocumentId,
        page: 0,
        size: 20
    });

    const fetchHistory = useCallback(async () => {
        if (!isOpen) return;

        setLoading(true);
        setError(null);

        try {
            const response = await balanceOverrideApi.getBalanceHistory(
                { ...filters, page: currentPage },
                currentPage,
                20
            );

            setHistory(response.content || []);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
        } catch (err) {
            console.error('Error fetching balance history:', err);
            setError('Nie udało się załadować historii operacji');
        } finally {
            setLoading(false);
        }
    }, [isOpen, filters, currentPage]);

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [fetchHistory]);

    useEffect(() => {
        if (isOpen) {
            setCurrentPage(0);
            const newFilters = {
                ...filters,
                documentId: initialDocumentId,
                page: 0
            };
            if (balanceType) {
                newFilters.balanceType = balanceType;
            }
            setFilters(newFilters);
        }
    }, [isOpen, balanceType, initialDocumentId]);

    const handleFilterChange = (newFilters: Partial<BalanceHistorySearchRequest>) => {
        const updatedFilters = { ...filters, ...newFilters };
        if (balanceType) {
            updatedFilters.balanceType = balanceType;
        }
        setFilters(updatedFilters);
        setCurrentPage(0);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: new Intl.DateTimeFormat('pl-PL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(date),
            time: new Intl.DateTimeFormat('pl-PL', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(date)
        };
    };

    const getBalanceTypeInfo = (type: string) => {
        return type === 'CASH'
            ? { label: 'Kasa', icon: FaMoneyBillWave, color: '#10B981' }
            : { label: 'Bank', icon: FaUniversity, color: '#3B82F6' };
    };

    const exportData = () => {
        // TODO: Implement export functionality
        console.log('Export data');
    };

    const clearFilters = () => {
        setFilters({
            balanceType: balanceType,
            page: 0,
            size: 20
        });
        setCurrentPage(0);
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <HeaderContent>
                        <HeaderLeft>
                            <HeaderIconContainer>
                                <FaHistory />
                            </HeaderIconContainer>
                            <HeaderTextContent>
                                <ModalTitle>Historia operacji finansowych</ModalTitle>
                                <ModalSubtitle>
                                    {balanceType
                                        ? `${getBalanceTypeInfo(balanceType).label} • ${totalElements} operacji`
                                        : `Wszystkie konta • ${totalElements} operacji`
                                    }
                                </ModalSubtitle>
                            </HeaderTextContent>
                        </HeaderLeft>

                        <HeaderActions>
                            <ActionButton
                                onClick={() => setShowFilters(!showFilters)}
                                $variant={showFilters ? "primary" : "secondary"}
                            >
                                <FaFilter />
                                Filtry
                            </ActionButton>
                            <CloseButton onClick={onClose}>
                                <FaTimes />
                            </CloseButton>
                        </HeaderActions>
                    </HeaderContent>

                    {showFilters && (
                        <FiltersSection>
                            <FiltersContainer>
                                {!balanceType && (
                                    <FilterGroup>
                                        <FilterLabel>Typ konta</FilterLabel>
                                        <SelectInput
                                            value={filters.balanceType || ''}
                                            onChange={(e) => handleFilterChange({
                                                balanceType: e.target.value || undefined
                                            })}
                                        >
                                            <option value="">Wszystkie konta</option>
                                            <option value="CASH">Kasa</option>
                                            <option value="BANK">Konto bankowe</option>
                                        </SelectInput>
                                    </FilterGroup>
                                )}

                                <FilterGroup>
                                    <FilterLabel>Od daty</FilterLabel>
                                    <DateInput
                                        type="date"
                                        value={filters.startDate?.split('T')[0] || ''}
                                        onChange={(e) => handleFilterChange({
                                            startDate: e.target.value ? `${e.target.value}T00:00:00` : undefined
                                        })}
                                    />
                                </FilterGroup>

                                <FilterGroup>
                                    <FilterLabel>Do daty</FilterLabel>
                                    <DateInput
                                        type="date"
                                        value={filters.endDate?.split('T')[0] || ''}
                                        onChange={(e) => handleFilterChange({
                                            endDate: e.target.value ? `${e.target.value}T23:59:59` : undefined
                                        })}
                                    />
                                </FilterGroup>

                                <FilterGroup>
                                    <FilterLabel>Wyszukaj w opisie</FilterLabel>
                                    <SearchInputContainer>
                                        <SearchIcon><FaSearch /></SearchIcon>
                                        <SearchInput
                                            type="text"
                                            placeholder="Wprowadź frazę..."
                                            value={filters.searchText || ''}
                                            onChange={(e) => handleFilterChange({
                                                searchText: e.target.value || undefined
                                            })}
                                        />
                                    </SearchInputContainer>
                                </FilterGroup>

                                <FilterActions>
                                    <ClearFiltersButton onClick={clearFilters}>
                                        Wyczyść
                                    </ClearFiltersButton>
                                </FilterActions>
                            </FiltersContainer>
                        </FiltersSection>
                    )}
                </ModalHeader>

                <ModalBody>
                    {error && (
                        <ErrorContainer>
                            <ErrorMessage>{error}</ErrorMessage>
                            <RetryButton onClick={fetchHistory}>Ponów próbę</RetryButton>
                        </ErrorContainer>
                    )}

                    {loading ? (
                        <LoadingState>
                            <LoadingSpinner><FaSpinner /></LoadingSpinner>
                            <LoadingText>Ładowanie danych...</LoadingText>
                        </LoadingState>
                    ) : history.length === 0 ? (
                        <EmptyState>
                            <EmptyIcon><FaHistory /></EmptyIcon>
                            <EmptyTitle>Brak operacji</EmptyTitle>
                            <EmptyDescription>
                                Nie znaleziono operacji spełniających wybrane kryteria
                            </EmptyDescription>
                        </EmptyState>
                    ) : (
                        <TableContainer>
                            <Table>
                                <thead>
                                <tr>
                                    <TableHeader $width="140px" $align="left">Data</TableHeader>
                                    <TableHeader $width="200px" $align="left">Typ operacji</TableHeader>
                                    <TableHeader $width="140px" $align="left">Saldo przed</TableHeader>
                                    <TableHeader $width="140px" $align="left">Zmiana</TableHeader>
                                    <TableHeader $width="140px" $align="left">Saldo po</TableHeader>
                                    <TableHeader $align="left">Opis operacji</TableHeader>
                                </tr>
                                </thead>
                                <tbody>
                                {history.map((item, index) => {
                                    const dateTime = formatDateTime(item.timestamp);

                                    return (
                                        <TableRow key={item.operationId} $index={index}>
                                            <TableCell $align="left">
                                                <DateTimeDisplay>
                                                    <DateText>{dateTime.date}</DateText>
                                                    <TimeText>{dateTime.time}</TimeText>
                                                </DateTimeDisplay>
                                            </TableCell>

                                            <TableCell $align="left">
                                                <DateText> {getOperationTypeLabel(item.operationType)} </DateText>
                                            </TableCell>

                                            <TableCell $align="right">
                                                <AmountDisplay $type="neutral">
                                                    {formatAmount(item.balanceBefore)}
                                                </AmountDisplay>
                                            </TableCell>

                                            <TableCell $align="right">
                                                <AmountDisplay $type={item.amountChanged >= 0 ? 'positive' : 'negative'}>
                                                    {item.amountChanged >= 0 ? '+' : ''}{formatAmount(item.amountChanged)}
                                                </AmountDisplay>
                                            </TableCell>

                                            <TableCell $align="left">
                                                <AmountDisplay $type="primary" $bold>
                                                    {formatAmount(item.balanceAfter)}
                                                </AmountDisplay>
                                            </TableCell>

                                            <TableCell $align="left">
                                                <DescriptionContainer>
                                                    <DescriptionText>{item.operationDescription}</DescriptionText>
                                                    {item.documentId && (
                                                        <DocumentReference>Dok. {item.documentId}</DocumentReference>
                                                    )}
                                                </DescriptionContainer>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                </tbody>
                            </Table>
                        </TableContainer>
                    )}
                </ModalBody>

                {totalPages > 1 && (
                    <PaginationFooter>
                        <PaginationInfo>
                            Wyniki {(currentPage * 20) + 1}–{Math.min((currentPage + 1) * 20, totalElements)} z {totalElements}
                        </PaginationInfo>

                        <PaginationControls>
                            <PaginationButton
                                onClick={() => handlePageChange(0)}
                                disabled={currentPage === 0}
                                $variant="navigation"
                            >
                                Pierwsza
                            </PaginationButton>

                            <PaginationButton
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                $variant="icon"
                            >
                                <FaChevronLeft />
                            </PaginationButton>

                            <PageIndicator>
                                <CurrentPage>{currentPage + 1}</CurrentPage>
                                <PageSeparator>z</PageSeparator>
                                <TotalPages>{totalPages}</TotalPages>
                            </PageIndicator>

                            <PaginationButton
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                                $variant="icon"
                            >
                                <FaChevronRight />
                            </PaginationButton>

                            <PaginationButton
                                onClick={() => handlePageChange(totalPages - 1)}
                                disabled={currentPage >= totalPages - 1}
                                $variant="navigation"
                            >
                                Ostatnia
                            </PaginationButton>
                        </PaginationControls>
                    </PaginationFooter>
                )}
            </ModalContainer>
        </ModalOverlay>
    );
};

// Premium Styled Components
const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${brandTheme.zIndex.modal};
    padding: 2rem;
    animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    background: #ffffff;
    border-radius: 16px;
    box-shadow:
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.05);
    width: 95vw;
    max-width: 1600px;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;

const ModalHeader = styled.header`
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 1px solid #e2e8f0;
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2rem 2.5rem;
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
`;

const HeaderIconContainer = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
`;

const HeaderTextContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const ModalTitle = styled.h1`
    font-size: 1.75rem;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.025em;
    margin: 0;
`;

const ModalSubtitle = styled.p`
    font-size: 0.95rem;
    color: #64748b;
    font-weight: 500;
    margin: 0;
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid;

    ${props => props.$variant === 'primary' ? `
        background: #3b82f6;
        border-color: #3b82f6;
        color: white;
        box-shadow: 0 4px 12px -2px rgba(59, 130, 246, 0.4);
        
        &:hover {
            background: #2563eb;
            border-color: #2563eb;
            transform: translateY(-1px);
            box-shadow: 0 8px 20px -4px rgba(59, 130, 246, 0.5);
        }
    ` : `
        background: white;
        border-color: #e2e8f0;
        color: #475569;
        
        &:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
            transform: translateY(-1px);
        }
    `}

    &:active {
        transform: translateY(0);
    }
`;

const CloseButton = styled.button`
    width: 44px;
    height: 44px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.125rem;

    &:hover {
        background: #fef2f2;
        border-color: #fecaca;
        color: #dc2626;
        transform: translateY(-1px);
    }
`;

const FiltersSection = styled.div`
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
`;

const FiltersContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    padding: 1.5rem 2.5rem;
    align-items: end;
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const FilterLabel = styled.label`
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    letter-spacing: -0.025em;
`;

const SelectInput = styled.select`
    height: 44px;
    padding: 0 1rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    background: white;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
`;

const DateInput = styled.input`
    height: 44px;
    padding: 0 1rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    background: white;
    color: #374151;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
`;

const SearchInputContainer = styled.div`
    position: relative;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    font-size: 0.875rem;
    pointer-events: none;
`;

const SearchInput = styled.input`
    height: 44px;
    padding: 0 1rem 0 2.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    background: white;
    color: #374151;
    width: 100%;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    &::placeholder {
        color: #9ca3af;
    }
`;

const FilterActions = styled.div`
    display: flex;
    align-items: end;
`;

const ClearFiltersButton = styled.button`
    height: 44px;
    padding: 0 1.5rem;
    border: 1px solid #e5e7eb;
    background: white;
    color: #6b7280;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #f9fafb;
        border-color: #d1d5db;
        color: #374151;
    }
`;

const ModalBody = styled.div`
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

const ErrorContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 1.5rem 2.5rem;
    padding: 1rem 1.5rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
`;

const ErrorMessage = styled.span`
    color: #dc2626;
    font-weight: 500;
`;

const RetryButton = styled.button`
    background: #dc2626;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
        background: #b91c1c;
    }
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1rem;
`;

const LoadingSpinner = styled.div`
    font-size: 2rem;
    color: #3b82f6;

    svg {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.span`
    font-size: 1rem;
    color: #64748b;
    font-weight: 500;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 80px;
    height: 80px;
    background: #f1f5f9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 2rem;
    margin-bottom: 1.5rem;
`;

const EmptyTitle = styled.h3`
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.5rem 0;
`;

const EmptyDescription = styled.p`
    font-size: 1rem;
    color: #6b7280;
    margin: 0;
    max-width: 400px;
`;

const TableContainer = styled.div`
    flex: 1;
    overflow: auto;
    padding: 1.5rem 2.5rem;

    &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    &::-webkit-scrollbar-track {
        background: #f1f5f9;
    }

    &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.9rem;
    margin: 1rem 0;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.th<{ $width?: string; $align?: 'left' | 'center' | 'right' }>`
    background: #f9fafb;
    padding: 1.25rem 1.5rem;
    text-align: ${props => props.$align || 'left'};
    font-weight: 600;
    color: #111827;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 1;
    ${props => props.$width && `width: ${props.$width};`}
    white-space: nowrap;
    font-size: 0.875rem;
    letter-spacing: -0.025em;
`;

const TableRow = styled.tr<{ $index: number }>`
    background: white;
    border-bottom: 1px solid #f3f4f6;
    transition: background-color 0.15s ease;

    &:hover {
        background: #f8fafc;
    }

    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.td<{ $align?: 'left' | 'center' | 'right' }>`
    padding: 1.25rem 1.5rem;
    text-align: ${props => props.$align || 'left'};
    vertical-align: middle;
    font-size: 0.875rem;
`;

const DateTimeDisplay = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const DateText = styled.div`
    font-weight: 600;
    color: #111827;
    font-size: 0.875rem;
`;

const TimeText = styled.div`
    font-size: 0.8rem;
    color: #6b7280;
    font-family: system-ui, sans-serif;
`;

const OperationTypeBadge = styled.div<{ $color: string }>`
    background: ${props => props.$color}10;
    color: ${props => props.$color};
    border: 1px solid ${props => props.$color}20;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    text-align: center;
    white-space: nowrap;
    display: inline-block;
`;

const AmountDisplay = styled.div<{
    $type: 'positive' | 'negative' | 'neutral' | 'primary';
    $bold?: boolean;
}>`
    font-family: system-ui, sans-serif;
    font-weight: ${props => props.$bold ? 700 : 600};
    font-size: 0.875rem;
    color: ${props => {
        switch (props.$type) {
            case 'positive': return '#059669';
            case 'negative': return '#dc2626';
            case 'primary': return '#111827';
            default: return '#6b7280';
        }
    }};
`;

const DescriptionContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const DescriptionText = styled.div`
    color: #374151;
    font-size: 0.875rem;
    line-height: 1.4;
    word-wrap: break-word;
`;

const DocumentReference = styled.div`
    background: #f0f9ff;
    color: #0369a1;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    font-family: system-ui, sans-serif;
`;

const PaginationFooter = styled.footer`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2.5rem;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
`;

const PaginationInfo = styled.div`
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
    letter-spacing: -0.025em;
`;

const PaginationControls = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const PaginationButton = styled.button<{ $variant: 'navigation' | 'icon' }>`
    ${props => props.$variant === 'navigation' ? `
        padding: 0.625rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        min-width: 80px;
    ` : `
        width: 40px;
        height: 40px;
        font-size: 0.875rem;
    `}

    border: 1px solid #d1d5db;
    background: white;
    color: #374151;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover:not(:disabled) {
        background: #f9fafb;
        border-color: #9ca3af;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1);
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
`;

const PageIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
`;

const CurrentPage = styled.span`
    color: #3b82f6;
    font-weight: 700;
`;

const PageSeparator = styled.span`
    color: #9ca3af;
    font-weight: 400;
`;

const TotalPages = styled.span`
    color: #6b7280;
`;

export default BalanceHistoryModal;