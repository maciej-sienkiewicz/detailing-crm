// src/pages/Finances/components/BalanceHistoryModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
    FaTimes,
    FaHistory,
    FaMoneyBillWave,
    FaUniversity,
    FaChevronLeft,
    FaChevronRight,
    FaFilter,
    FaCalendarAlt,
    FaSearch,
    FaUser,
    FaFileAlt,
    FaArrowUp,
    FaArrowDown,
    FaSpinner
} from 'react-icons/fa';
import { brandTheme } from '../styles/theme';
import { balanceOverrideApi, BalanceType, BalanceHistoryResponse, BalanceHistorySearchRequest, SpringPageResponse } from '../../../api/balanceOverrideApi';

// Operation type utilities inline (can be moved to separate file later)
const OperationTypeLabels: Record<string, string> = {
    'ADD': 'Dodanie środków',
    'SUBTRACT': 'Odjęcie środków',
    'CORRECTION': 'Korekta sald',
    'MANUAL_OVERRIDE': 'Ręczne nadpisanie',
    'CASH_WITHDRAWAL': 'Wypłata gotówki',
    'CASH_DEPOSIT': 'Wpłata gotówki',
    'BANK_RECONCILIATION': 'Uzgodnienie bankowe',
    'INVENTORY_ADJUSTMENT': 'Korekta inwentarzowa',
    'CASH_TO_SAFE': 'Przeniesienie do sejfu',
    'CASH_FROM_SAFE': 'Pobranie z sejfu'
};

const OperationTypeColors: Record<string, string> = {
    'ADD': brandTheme.status.success,
    'SUBTRACT': brandTheme.status.error,
    'CORRECTION': brandTheme.status.warning,
    'MANUAL_OVERRIDE': brandTheme.primary,
    'CASH_WITHDRAWAL': brandTheme.status.error,
    'CASH_DEPOSIT': brandTheme.status.success,
    'BANK_RECONCILIATION': brandTheme.status.info,
    'INVENTORY_ADJUSTMENT': brandTheme.status.warning,
    'CASH_TO_SAFE': brandTheme.status.info,
    'CASH_FROM_SAFE': brandTheme.status.info
};

const OperationTypeDescriptions: Record<string, string> = {
    'ADD': 'Automatyczne dodanie środków na podstawie dokumentu finansowego',
    'SUBTRACT': 'Automatyczne odjęcie środków na podstawie dokumentu finansowego',
    'CORRECTION': 'Korekta błędów w saldach przeprowadzona przez system',
    'MANUAL_OVERRIDE': 'Ręczna zmiana salda przez uprawnionego użytkownika',
    'CASH_WITHDRAWAL': 'Wypłata gotówki z kasy',
    'CASH_DEPOSIT': 'Wpłata gotówki do kasy',
    'BANK_RECONCILIATION': 'Uzgodnienie salda z wyciągiem bankowym',
    'INVENTORY_ADJUSTMENT': 'Korekta na podstawie inwentaryzacji fizycznej',
    'CASH_TO_SAFE': 'Przeniesienie gotówki z kasy do sejfu',
    'CASH_FROM_SAFE': 'Pobranie gotówki z sejfu do kasy'
};

const getOperationTypeLabel = (operationType: string): string => {
    return OperationTypeLabels[operationType] || operationType;
};

const getOperationTypeColor = (operationType: string): string => {
    return OperationTypeColors[operationType] || brandTheme.text.secondary;
};

const getOperationTypeDescription = (operationType: string): string => {
    return OperationTypeDescriptions[operationType] || 'Nieznany typ operacji';
};

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

    // Filtry - jeśli balanceType jest przekazany, nie pozwalamy na jego zmianę
    const [filters, setFilters] = useState<BalanceHistorySearchRequest>({
        balanceType: balanceType,
        documentId: initialDocumentId,
        page: 0,
        size: 10
    });

    const fetchHistory = useCallback(async () => {
        if (!isOpen) return;

        setLoading(true);
        setError(null);

        try {
            const response = await balanceOverrideApi.getBalanceHistory(
                { ...filters, page: currentPage },
                currentPage,
                10
            );

            // Backend zwraca Spring Data Page format
            setHistory(response.content || []);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
        } catch (err) {
            console.error('Error fetching balance history:', err);
            setError('Nie udało się załadować historii zmian sald');
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
            // Zawsze wymuszamy oryginalny balanceType, jeśli został przekazany
            const newFilters = {
                ...filters,
                documentId: initialDocumentId,
                page: 0
            };
            if (balanceType) {
                newFilters.balanceType = balanceType; // NIGDY nie pozwalamy na zmianę
            }
            setFilters(newFilters);
        }
    }, [isOpen, balanceType, initialDocumentId]);

    const handleFilterChange = (newFilters: Partial<BalanceHistorySearchRequest>) => {
        // Jeśli component został otwarty dla konkretnego typu salda, nie pozwalamy na jego zmianę
        const updatedFilters = { ...filters, ...newFilters };
        if (balanceType) {
            updatedFilters.balanceType = balanceType; // Zawsze wymuszamy oryginalny typ
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

    const formatDateTime = (dateString: string): string => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    };

    const getBalanceTypeIcon = (type: string) => {
        return type === 'CASH' ? <FaMoneyBillWave /> : <FaUniversity />;
    };

    const getBalanceTypeLabel = (type: string) => {
        return type === 'CASH' ? 'Kasa' : 'Konto bankowe';
    };

    const getChangeIcon = (amount: number) => {
        return amount >= 0 ? <FaArrowUp /> : <FaArrowDown />;
    };

    const getOperationTypeLabel = (operationType: string) => {
        const labels: Record<string, string> = {
            'ADD': 'Dodanie',
            'SUBTRACT': 'Odjęcie',
            'CORRECTION': 'Korekta',
            'MANUAL_OVERRIDE': 'Ręczne nadpisanie',
            'CASH_WITHDRAWAL': 'Wypłata gotówki',
            'CASH_DEPOSIT': 'Wpłata gotówki',
            'BANK_RECONCILIATION': 'Uzgodnienie bankowe',
            'INVENTORY_ADJUSTMENT': 'Korekta inwentarzowa',
            'CASH_TO_SAFE': 'Przeniesienie do sejfu',
            'CASH_FROM_SAFE': 'Pobranie z sejfu'
        };
        return labels[operationType] || operationType;
    };

    const getOperationTypeColor = (operationType: string) => {
        const colors: Record<string, string> = {
            'ADD': brandTheme.status.success,
            'SUBTRACT': brandTheme.status.error,
            'CORRECTION': brandTheme.status.warning,
            'MANUAL_OVERRIDE': brandTheme.primary,
            'CASH_WITHDRAWAL': brandTheme.status.error,
            'CASH_DEPOSIT': brandTheme.status.success,
            'BANK_RECONCILIATION': brandTheme.status.info,
            'INVENTORY_ADJUSTMENT': brandTheme.status.warning,
            'CASH_TO_SAFE': brandTheme.status.info,
            'CASH_FROM_SAFE': brandTheme.status.info
        };
        return colors[operationType] || brandTheme.text.secondary;
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <HeaderLeft>
                        <HeaderIcon>
                            <FaHistory />
                        </HeaderIcon>
                        <HeaderText>
                            <HeaderTitle>Historia zmian sald</HeaderTitle>
                            <HeaderSubtitle>
                                {balanceType ? `Tylko ${getBalanceTypeLabel(balanceType)}` : 'Wszystkie typy sald'}
                            </HeaderSubtitle>
                        </HeaderText>
                    </HeaderLeft>
                    <HeaderActions>
                        <FilterButton
                            onClick={() => setShowFilters(!showFilters)}
                            $active={showFilters}
                        >
                            <FaFilter />
                        </FilterButton>
                        <CloseButton onClick={onClose}>
                            <FaTimes />
                        </CloseButton>
                    </HeaderActions>
                </ModalHeader>

                {showFilters && (
                    <FiltersContainer>
                        <FiltersGrid $hasBalanceTypeFilter={!balanceType}>
                            {/* Pokazuj filtr typu salda tylko gdy nie ma predefiniowanego typu */}
                            {!balanceType && (
                                <FilterGroup>
                                    <FilterLabel>Typ salda</FilterLabel>
                                    <FilterSelect
                                        value={filters.balanceType || ''}
                                        onChange={(e) => handleFilterChange({
                                            balanceType: e.target.value || undefined
                                        })}
                                    >
                                        <option value="">Wszystkie</option>
                                        <option value="CASH">Kasa</option>
                                        <option value="BANK">Konto bankowe</option>
                                    </FilterSelect>
                                </FilterGroup>
                            )}

                            <FilterGroup>
                                <FilterLabel>Data od</FilterLabel>
                                <FilterInput
                                    type="datetime-local"
                                    value={filters.startDate || ''}
                                    onChange={(e) => handleFilterChange({
                                        startDate: e.target.value || undefined
                                    })}
                                />
                            </FilterGroup>

                            <FilterGroup>
                                <FilterLabel>Data do</FilterLabel>
                                <FilterInput
                                    type="datetime-local"
                                    value={filters.endDate || ''}
                                    onChange={(e) => handleFilterChange({
                                        endDate: e.target.value || undefined
                                    })}
                                />
                            </FilterGroup>

                            <FilterGroup>
                                <FilterLabel>Szukaj w opisie</FilterLabel>
                                <FilterInput
                                    type="text"
                                    placeholder="Wpisz tekst do wyszukania..."
                                    value={filters.searchText || ''}
                                    onChange={(e) => handleFilterChange({
                                        searchText: e.target.value || undefined
                                    })}
                                />
                            </FilterGroup>
                        </FiltersGrid>
                    </FiltersContainer>
                )}

                <ModalContent>
                    {error && (
                        <ErrorMessage>
                            <span>{error}</span>
                            <button onClick={fetchHistory}>Spróbuj ponownie</button>
                        </ErrorMessage>
                    )}

                    {loading ? (
                        <LoadingContainer>
                            <FaSpinner className="spinning" />
                            <span>Ładowanie historii...</span>
                        </LoadingContainer>
                    ) : history.length === 0 ? (
                        <EmptyState>
                            <EmptyIcon>
                                <FaHistory />
                            </EmptyIcon>
                            <EmptyTitle>Brak danych</EmptyTitle>
                            <EmptyDescription>
                                Nie znaleziono żadnych operacji spełniających kryteria wyszukiwania.
                            </EmptyDescription>
                        </EmptyState>
                    ) : (
                        <>
                            <HistoryList>
                                {history.map((item) => (
                                    <HistoryItem key={item.operationId}>
                                        <ItemHeader>
                                            <ItemLeft>
                                                <BalanceTypeIcon $type={item.balanceType}>
                                                    {getBalanceTypeIcon(item.balanceType)}
                                                </BalanceTypeIcon>
                                                <ItemInfo>
                                                    <ItemTitle>
                                                        {getBalanceTypeLabel(item.balanceType)} - Operacja #{item.operationId}
                                                    </ItemTitle>
                                                    <ItemTime>
                                                        <FaCalendarAlt />
                                                        {formatDateTime(item.timestamp)}
                                                    </ItemTime>
                                                </ItemInfo>
                                            </ItemLeft>
                                            <AmountChange
                                                $positive={item.amountChanged >= 0}
                                                $color={getOperationTypeColor(item.operationType)}
                                            >
                                                {getChangeIcon(item.amountChanged)}
                                                {formatAmount(Math.abs(item.amountChanged))}
                                            </AmountChange>
                                        </ItemHeader>

                                        <ItemBody>
                                            <Description>
                                                {item.operationDescription}
                                            </Description>

                                            <OperationTypeInfo>
                                                <OperationTypeBadge $color={getOperationTypeColor(item.operationType)}>
                                                    {getOperationTypeLabel(item.operationType)}
                                                </OperationTypeBadge>
                                                <OperationTypeDesc>
                                                    {getOperationTypeDescription(item.operationType)}
                                                </OperationTypeDesc>
                                            </OperationTypeInfo>

                                            <BalanceInfo>
                                                <BalanceItem>
                                                    <BalanceLabel>Saldo przed:</BalanceLabel>
                                                    <BalanceValue>{formatAmount(item.balanceBefore)}</BalanceValue>
                                                </BalanceItem>
                                                <BalanceArrow>→</BalanceArrow>
                                                <BalanceItem>
                                                    <BalanceLabel>Saldo po:</BalanceLabel>
                                                    <BalanceValue>{formatAmount(item.balanceAfter)}</BalanceValue>
                                                </BalanceItem>
                                            </BalanceInfo>

                                            {(item.documentId || item.userId || item.operationId) && (
                                                <MetaInfo>
                                                    <MetaItem>
                                                        <FaFileAlt />
                                                        <span>ID operacji: {item.operationId}</span>
                                                    </MetaItem>
                                                    {item.documentId && (
                                                        <MetaItem>
                                                            <FaFileAlt />
                                                            <span>Dokument: {item.documentId}</span>
                                                        </MetaItem>
                                                    )}
                                                    {item.userId && (
                                                        <MetaItem>
                                                            <FaUser />
                                                            <span>Użytkownik: {item.userId}</span>
                                                        </MetaItem>
                                                    )}
                                                    {item.ipAddress && (
                                                        <MetaItem>
                                                            <span>IP: {item.ipAddress}</span>
                                                        </MetaItem>
                                                    )}
                                                </MetaInfo>
                                            )}
                                        </ItemBody>
                                    </HistoryItem>
                                ))}
                            </HistoryList>

                            {totalPages > 1 && (
                                <PaginationContainer>
                                    <PaginationInfo>
                                        Strona {currentPage + 1} z {totalPages}
                                        ({totalElements} {totalElements === 1 ? 'operacja' : totalElements < 5 ? 'operacje' : 'operacji'})
                                    </PaginationInfo>
                                    <PaginationControls>
                                        <PaginationButton
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 0}
                                        >
                                            <FaChevronLeft />
                                        </PaginationButton>
                                        <PaginationButton
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= totalPages - 1}
                                        >
                                            <FaChevronRight />
                                        </PaginationButton>
                                    </PaginationControls>
                                </PaginationContainer>
                            )}
                        </>
                    )}
                </ModalContent>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${brandTheme.zIndex.modal};
    padding: ${brandTheme.spacing.lg};
    backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
    background-color: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    box-shadow: ${brandTheme.shadow.xl};
    width: 95vw;
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
    flex-shrink: 0;
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const HeaderIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${brandTheme.primaryGhost};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.primary};
    font-size: 20px;
`;

const HeaderText = styled.div``;

const HeaderTitle = styled.h2`
    margin: 0 0 ${brandTheme.spacing.xs} 0;
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
`;

const HeaderSubtitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${brandTheme.text.secondary};
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
`;

const FilterButton = styled.button<{ $active: boolean }>`
    width: 40px;
    height: 40px;
    border: none;
    background: ${props => props.$active ? brandTheme.primary : brandTheme.surfaceHover};
    color: ${props => props.$active ? 'white' : brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: ${props => props.$active ? brandTheme.primaryDark : brandTheme.primaryGhost};
        color: ${props => props.$active ? 'white' : brandTheme.primary};
    }
`;

const CloseButton = styled.button`
    width: 40px;
    height: 40px;
    border: none;
    background: ${brandTheme.surfaceHover};
    color: ${brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: ${brandTheme.status.errorLight};
        color: ${brandTheme.status.error};
    }
`;

const FiltersContainer = styled.div`
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    background: ${brandTheme.surfaceElevated};
    border-bottom: 1px solid ${brandTheme.border};
`;

const FiltersGrid = styled.div<{ $hasBalanceTypeFilter?: boolean }>`
    display: grid;
    grid-template-columns: ${props => props.$hasBalanceTypeFilter ? 'repeat(auto-fit, minmax(200px, 1fr))' : 'repeat(auto-fit, minmax(250px, 1fr))'};
    gap: ${brandTheme.spacing.md};
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const FilterLabel = styled.label`
    font-size: 12px;
    font-weight: 600;
    color: ${brandTheme.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const FilterInput = styled.input`
    height: 36px;
    padding: 0 ${brandTheme.spacing.sm};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    font-size: 14px;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 2px ${brandTheme.primaryGhost};
    }
`;

const FilterSelect = styled.select`
    height: 36px;
    padding: 0 ${brandTheme.spacing.sm};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    font-size: 14px;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 2px ${brandTheme.primaryGhost};
    }
`;

const ModalContent = styled.div`
    flex: 1;
    overflow-y: auto;
    min-height: 0;
`;

const ErrorMessage = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: ${brandTheme.spacing.lg};
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.status.error}30;

    button {
        background: ${brandTheme.status.error};
        color: white;
        border: none;
        padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
        border-radius: ${brandTheme.radius.sm};
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    gap: ${brandTheme.spacing.md};
    color: ${brandTheme.text.secondary};

    .spinning {
        animation: spin 1s linear infinite;
        font-size: 24px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${brandTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.text.muted};
    font-size: 24px;
    margin-bottom: ${brandTheme.spacing.lg};
`;

const EmptyTitle = styled.h3`
    margin: 0 0 ${brandTheme.spacing.sm} 0;
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const EmptyDescription = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    max-width: 300px;
`;

const HistoryList = styled.div`
    padding: ${brandTheme.spacing.lg};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const HistoryItem = styled.div`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    overflow: hidden;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${brandTheme.borderHover};
        box-shadow: ${brandTheme.shadow.sm};
    }
`;

const ItemHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-bottom: 1px solid ${brandTheme.border};
`;

const ItemLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const BalanceTypeIcon = styled.div<{ $type: string }>`
    width: 40px;
    height: 40px;
    background: ${props => props.$type === 'CASH' ? brandTheme.status.successLight : brandTheme.status.infoLight};
    color: ${props => props.$type === 'CASH' ? brandTheme.status.success : brandTheme.status.info};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
`;

const ItemInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const ItemTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const ItemTime = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    font-size: 12px;
    color: ${brandTheme.text.secondary};

    svg {
        font-size: 10px;
    }
`;

const AmountChange = styled.div<{ $positive: boolean; $color: string }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    font-size: 16px;
    font-weight: 700;
    color: ${props => props.$color};

    svg {
        font-size: 14px;
    }
`;

const ItemBody = styled.div`
    padding: ${brandTheme.spacing.lg};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const Description = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.primary};
    line-height: 1.5;
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    border-left: 3px solid ${brandTheme.primary};
`;

const OperationTypeInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const OperationTypeBadge = styled.div<{ $color: string }>`
    display: inline-flex;
    align-items: center;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    background: ${props => props.$color}20;
    color: ${props => props.$color};
    border: 1px solid ${props => props.$color}40;
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    align-self: flex-start;
`;

const OperationTypeDesc = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.secondary};
    font-style: italic;
    line-height: 1.4;
`;

const BalanceInfo = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surfaceElevated};
    border-radius: ${brandTheme.radius.md};
`;

const BalanceItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
`;

const BalanceLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.secondary};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const BalanceValue = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
`;

const BalanceArrow = styled.div`
    font-size: 18px;
    color: ${brandTheme.text.muted};
    font-weight: 600;
`;

const MetaInfo = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${brandTheme.spacing.md};
`;

const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    font-size: 12px;
    color: ${brandTheme.text.secondary};
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.sm};

    svg {
        font-size: 10px;
    }
`;

const PaginationContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg};
    border-top: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

const PaginationInfo = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const PaginationControls = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};
`;

const PaginationButton = styled.button`
    width: 32px;
    height: 32px;
    border: 1px solid ${brandTheme.border};
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.sm};
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover:not(:disabled) {
        background: ${brandTheme.primary};
        color: white;
        border-color: ${brandTheme.primary};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

export default BalanceHistoryModal;