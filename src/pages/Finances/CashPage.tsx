import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaPlus, FaMoneyBillWave, FaEdit, FaTrashAlt, FaCalendarAlt, FaArrowUp, FaArrowDown, FaFilter, FaTimes } from 'react-icons/fa';
import { CashTransaction, TransactionType, TransactionTypeLabels, TransactionTypeColors, CashTransactionFilters, Pagination as PaginationType } from '../../types/cash';
import { cashApi } from '../../api/cashApi';
import AddCashTransactionModal from './components/AddCashTransactionModal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import Pagination from '../../components/common/Pagination';

const CashPage: React.FC = () => {
    const [transactions, setTransactions] = useState<CashTransaction[]>([]);
    const [cashBalance, setCashBalance] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<CashTransactionFilters>({});
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<CashTransaction | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
    const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
    const [monthlyExpense, setMonthlyExpense] = useState<number>(0);

    // Stan dla paginacji
    const [pagination, setPagination] = useState<PaginationType>({
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
    });

    // Pobieranie danych przy pierwszym renderowaniu i przy zmianie filtrów lub strony
    useEffect(() => {
        fetchTransactions();
        fetchCashBalance();
        fetchMonthlyStatistics();
    }, [pagination.page]); // Wywołanie przy zmianie strony

    // Funkcja pobierająca statystyki miesięczne
    const fetchMonthlyStatistics = async () => {
        try {
            const stats = await cashApi.getMonthlyStatistics();
            setMonthlyIncome(stats.income);
            setMonthlyExpense(stats.expense);
        } catch (err) {
            console.error('Błąd podczas pobierania statystyk miesięcznych:', err);
        }
    };

    // Funkcja pobierająca transakcje
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await cashApi.fetchCashTransactions(
                filters,
                pagination.page,
                pagination.pageSize
            );

            setTransactions(response.data);
            setPagination(response.pagination);
            setError(null);
        } catch (err) {
            console.error('Błąd podczas pobierania transakcji:', err);
            setError('Nie udało się pobrać listy transakcji. Spróbuj ponownie później.');
        } finally {
            setLoading(false);
        }
    };

    // Funkcja pobierająca stan kasy
    const fetchCashBalance = async () => {
        try {
            const balance = await cashApi.getCashBalance();
            setCashBalance(balance);
        } catch (err) {
            console.error('Błąd podczas pobierania stanu kasy:', err);
            // Nie ustawiamy błędu, ponieważ to mogłoby przesłonić główną zawartość
        }
    };

    // Obsługa zmiany strony
    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({
            ...prev,
            page: newPage
        }));
    };

    // Funkcja do formatowania daty
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL');
    };

    // Funkcja do formatowania kwoty
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Obsługa dodawania nowej transakcji
    const handleAddTransaction = () => {
        setSelectedTransaction(null);
        setShowAddModal(true);
    };

    // Obsługa edycji transakcji
    const handleEditTransaction = (transaction: CashTransaction) => {
        setSelectedTransaction(transaction);
        setShowAddModal(true);
    };

    // Obsługa zapisywania transakcji
    const handleSaveTransaction = async (transaction: Omit<CashTransaction, 'id' | 'createdAt' | 'createdBy'>) => {
        try {
            setLoading(true);

            const newTransaction = await cashApi.createCashTransaction(transaction);

            // Jeśli jesteśmy na pierwszej stronie, dodajemy nową transakcję na początku listy
            if (pagination.page === 1) {
                setTransactions(prevTransactions => {
                    const updatedTransactions = [newTransaction, ...prevTransactions];

                    // Jeśli lista jest dłuższa niż rozmiar strony, usuwamy ostatni element
                    if (updatedTransactions.length > pagination.pageSize) {
                        updatedTransactions.pop();
                    }

                    return updatedTransactions;
                });
            }

            // Aktualizacja całkowitej liczby elementów
            setPagination(prev => ({
                ...prev,
                totalItems: prev.totalItems + 1,
                totalPages: Math.ceil((prev.totalItems + 1) / prev.pageSize)
            }));

            // Aktualizacja stanu kasy i statystyk
            await fetchCashBalance();
            await fetchMonthlyStatistics();

            // Zamknięcie modalu
            setShowAddModal(false);

        } catch (error) {
            console.error('Błąd podczas zapisywania transakcji:', error);
            setError('Nie udało się zapisać transakcji. Spróbuj ponownie później.');
        } finally {
            setLoading(false);
        }
    };

    // Obsługa usuwania transakcji
    const handleDeleteClick = (id: string) => {
        setTransactionToDelete(id);
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = async () => {
        if (!transactionToDelete) return;

        try {
            setLoading(true);
            const success = await cashApi.deleteCashTransaction(transactionToDelete);

            if (success) {
                // Usunięcie transakcji z listy
                setTransactions(prevTransactions =>
                    prevTransactions.filter(t => t.id !== transactionToDelete)
                );

                // Aktualizacja całkowitej liczby elementów
                setPagination(prev => {
                    const newTotalItems = Math.max(0, prev.totalItems - 1);
                    const newTotalPages = Math.max(1, Math.ceil(newTotalItems / prev.pageSize));

                    // Jeśli usunęliśmy ostatni element na stronie, a nie jesteśmy na pierwszej stronie,
                    // przechodzimy do poprzedniej strony
                    let newPage = prev.page;
                    if (transactions.length === 1 && prev.page > 1) {
                        newPage = prev.page - 1;
                    }

                    return {
                        ...prev,
                        page: newPage,
                        totalItems: newTotalItems,
                        totalPages: newTotalPages
                    };
                });

                // Aktualizacja stanu kasy i statystyk
                await fetchCashBalance();
                await fetchMonthlyStatistics();
            } else {
                setError('Nie udało się usunąć transakcji. Spróbuj ponownie później.');
            }
        } catch (error) {
            console.error('Błąd podczas usuwania transakcji:', error);
            setError('Nie udało się usunąć transakcji. Spróbuj ponownie później.');
        } finally {
            setLoading(false);
            setShowDeleteConfirmation(false);
            setTransactionToDelete(null);
        }
    };

    // Obsługa zmiany filtrów
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Obsługa czyszczenia filtrów
    const handleClearFilters = () => {
        setFilters({});
    };

    // Obsługa wysyłki formularza filtrów
    const handleSubmitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        // Resetuj stronę na 1 przy zmianie filtrów
        setPagination(prev => ({
            ...prev,
            page: 1
        }));
        fetchTransactions();
    };

    return (
        <PageContainer>
            <Header>
                <Title>
                    <FaMoneyBillWave />
                    <span>Gotówka</span>
                </Title>
                <Actions>
                    <SearchButton onClick={() => setShowFilters(!showFilters)}>
                        <FaSearch />
                        <span>Filtruj</span>
                    </SearchButton>
                    <AddButton onClick={handleAddTransaction}>
                        <FaPlus />
                        <span>Dodaj transakcję</span>
                    </AddButton>
                </Actions>
            </Header>

            <SummaryCardsGrid>
                <SummaryCard type="balance">
                    <CardLabel>Aktualny stan kasy</CardLabel>
                    <CardValue>{formatAmount(cashBalance)}</CardValue>
                    <CardDetail>Stan na dzień {new Date().toLocaleDateString('pl-PL')}</CardDetail>
                </SummaryCard>

                <SummaryCard type="income">
                    <CardLabel>Wpłaty w tym miesiącu</CardLabel>
                    <CardValue>{formatAmount(monthlyIncome)}</CardValue>
                    <CardDetail>
                        <FaArrowUp /> Wpływy gotówkowe
                    </CardDetail>
                </SummaryCard>

                <SummaryCard type="expense">
                    <CardLabel>Wypłaty w tym miesiącu</CardLabel>
                    <CardValue>{formatAmount(monthlyExpense)}</CardValue>
                    <CardDetail>
                        <FaArrowDown /> Wydatki gotówkowe
                    </CardDetail>
                </SummaryCard>
            </SummaryCardsGrid>

            {showFilters && (
                <FiltersContainer>
                    <FiltersForm onSubmit={handleSubmitFilters}>
                        <FiltersTitle>
                            <FaFilter />
                            <span>Filtry wyszukiwania</span>
                        </FiltersTitle>
                        <FiltersGrid>
                            <FormGroup>
                                <Label htmlFor="type">Typ transakcji</Label>
                                <Select
                                    id="type"
                                    name="type"
                                    value={filters.type || ''}
                                    onChange={handleFilterChange as any}
                                >
                                    <option value="">Wszystkie</option>
                                    {Object.entries(TransactionTypeLabels).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="description">Opis</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    value={filters.description || ''}
                                    onChange={handleFilterChange}
                                    placeholder="Wyszukaj w opisie"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="dateFrom">Data od</Label>
                                <Input
                                    id="dateFrom"
                                    name="dateFrom"
                                    type="date"
                                    value={filters.dateFrom || ''}
                                    onChange={handleFilterChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="dateTo">Data do</Label>
                                <Input
                                    id="dateTo"
                                    name="dateTo"
                                    type="date"
                                    value={filters.dateTo || ''}
                                    onChange={handleFilterChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="minAmount">Kwota od</Label>
                                <Input
                                    id="minAmount"
                                    name="minAmount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={filters.minAmount || ''}
                                    onChange={handleFilterChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="maxAmount">Kwota do</Label>
                                <Input
                                    id="maxAmount"
                                    name="maxAmount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={filters.maxAmount || ''}
                                    onChange={handleFilterChange}
                                />
                            </FormGroup>
                        </FiltersGrid>
                        <FiltersActions>
                            <ButtonSecondary type="button" onClick={handleClearFilters}>
                                <FaTimes />
                                <span>Wyczyść filtry</span>
                            </ButtonSecondary>
                            <ButtonPrimary type="submit">
                                <FaSearch />
                                <span>Zastosuj filtry</span>
                            </ButtonPrimary>
                        </FiltersActions>
                    </FiltersForm>
                </FiltersContainer>
            )}

            {loading && transactions.length === 0 ? (
                <LoadingIndicator>Ładowanie transakcji gotówkowych...</LoadingIndicator>
            ) : error ? (
                <ErrorMessage>{error}</ErrorMessage>
            ) : (
                <TableContainer>
                    <h2>Historia transakcji gotówkowych</h2>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>ID płatności</TableHeader>
                                <TableHeader>Rodzaj płatności</TableHeader>
                                <TableHeader>Opis płatności</TableHeader>
                                <TableHeader>Data płatności</TableHeader>
                                <TableHeader>Wizyta</TableHeader>
                                <TableHeader>Kwota brutto</TableHeader>
                                <TableHeader>Akcje</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} style={{ textAlign: 'center' }}>
                                        Brak transakcji spełniających kryteria wyszukiwania
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map(transaction => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>{transaction.id}</TableCell>
                                        <TableCell>
                                            <TransactionTypeBadge type={transaction.type}>
                                                {TransactionTypeLabels[transaction.type]}
                                            </TransactionTypeBadge>
                                        </TableCell>
                                        <TableCell>{transaction.description}</TableCell>
                                        <TableCell>{formatDate(transaction.date)}</TableCell>
                                        <TableCell>
                                            {transaction.visitNumber ? (
                                                <VisitLink href={`/orders/${transaction.visitId}`}>
                                                    {transaction.visitNumber}
                                                </VisitLink>
                                            ) : (
                                                <NoVisit>-</NoVisit>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <AmountDisplay type={transaction.type}>
                                                {formatAmount(transaction.amount)}
                                            </AmountDisplay>
                                        </TableCell>
                                        <TableCell>
                                            <ActionButtons>
                                                <ActionButton
                                                    title="Edytuj transakcję"
                                                    onClick={() => handleEditTransaction(transaction)}
                                                >
                                                    <FaEdit />
                                                </ActionButton>
                                                <ActionButton
                                                    title="Usuń transakcję"
                                                    className="delete"
                                                    onClick={() => handleDeleteClick(transaction.id)}
                                                >
                                                    <FaTrashAlt />
                                                </ActionButton>
                                            </ActionButtons>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Komponent paginacji */}
                    {transactions.length > 0 && (
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                            totalItems={pagination.totalItems}
                            pageSize={pagination.pageSize}
                            showTotalItems={true}
                        />
                    )}
                </TableContainer>
            )}

            {/* Modal dodawania/edycji transakcji */}
            {showAddModal && (
                <AddCashTransactionModal
                    isOpen={showAddModal}
                    transaction={selectedTransaction}
                    onSave={handleSaveTransaction}
                    onClose={() => setShowAddModal(false)}
                />
            )}

            {/* Dialog potwierdzenia usunięcia */}
            <ConfirmationDialog
                isOpen={showDeleteConfirmation}
                title="Potwierdzenie usunięcia"
                message="Czy na pewno chcesz usunąć tę transakcję? Tej operacji nie można cofnąć."
                confirmText="Usuń"
                cancelText="Anuluj"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirmation(false)}
            />
        </PageContainer>
    );
};

// Style komponentów
const PageContainer = styled.div`
    padding: 20px;
    background-color: #f8f9fa;
    min-height: calc(100vh - 60px);
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
`;

const Title = styled.h1`
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 24px;
    margin: 0;
    color: #2c3e50;

    svg {
        color: #3498db;
    }
`;

const Actions = styled.div`
    display: flex;
    gap: 12px;

    @media (max-width: 576px) {
        width: 100%;
        flex-direction: column;
    }
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    @media (max-width: 576px) {
        width: 100%;
    }
`;

const SearchButton = styled(Button)`
    background-color: #ecf0f1;
    color: #2c3e50;
    border: 1px solid #dfe6e9;

    &:hover {
        background-color: #dfe6e9;
    }
`;

const AddButton = styled(Button)`
    background-color: #3498db;
    color: white;
    border: none;

    &:hover {
        background-color: #2980b9;
    }
`;

const FiltersContainer = styled.div`
    margin-bottom: 24px;
`;

const FiltersForm = styled.form`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding: 20px;
`;

const FiltersTitle = styled.h3`
    margin: 0 0 16px 0;
    font-size: 18px;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 8px;

    svg {
        color: #3498db;
    }
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @media (max-width: 992px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 576px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Label = styled.label`
    font-size: 14px;
    color: #34495e;
    font-weight: 500;
`;

const Input = styled.input`
    padding: 8px 12px;
    border: 1px solid #dfe6e9;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
    }
`;

const Select = styled.select`
    padding: 8px 12px;
    border: 1px solid #dfe6e9;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
    }
`;

const FiltersActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;

    @media (max-width: 576px) {
        flex-direction: column;
    }
`;

const ButtonPrimary = styled(Button)`
    background-color: #3498db;
    color: white;
    border: none;

    &:hover {
        background-color: #2980b9;
    }
`;

const ButtonSecondary = styled(Button)`
    background-color: white;
    color: #2c3e50;
    border: 1px solid #dfe6e9;

    &:hover {
        background-color: #f8f9fa;
    }
`;

const TableContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding: 20px;
    overflow: hidden;

    h2 {
        font-size: 18px;
        color: #2c3e50;
        margin-top: 0;
        margin-bottom: 16px;
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHead = styled.thead`
    background-color: #f8f9fa;
    border-bottom: 2px solid #eef2f7;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
    border-bottom: 1px solid #eef2f7;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background-color: #f8f9fa;
    }
`;

const TableHeader = styled.th`
    padding: 14px 16px;
    text-align: left;
    font-weight: 600;
    color: #2c3e50;
    font-size: 14px;
`;

const TableCell = styled.td`
    padding: 14px 16px;
    color: #34495e;
    font-size: 14px;
`;

const TransactionTypeBadge = styled.span<{ type: TransactionType }>`
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${props => `${TransactionTypeColors[props.type]}22`};
    color: ${props => TransactionTypeColors[props.type]};
    border: 1px solid ${props => `${TransactionTypeColors[props.type]}44`};
`;

const VisitLink = styled.a`
    color: #3498db;
    text-decoration: none;
    font-weight: 500;

    &:hover {
        text-decoration: underline;
    }
`;

const NoVisit = styled.span`
    color: #95a5a6;
    font-style: italic;
`;

const AmountDisplay = styled.div<{ type: TransactionType }>`
    font-weight: 500;
    color: ${props => TransactionTypeColors[props.type]};
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    color: #3498db;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: rgba(52, 152, 219, 0.1);
    }

    &.delete {
        color: #e74c3c;

        &:hover {
            background-color: rgba(231, 76, 60, 0.1);
        }
    }
`;

const LoadingIndicator = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    color: #3498db;
    font-weight: 500;
`;

const ErrorMessage = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    background-color: #fef2f2;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    color: #e74c3c;
    font-weight: 500;
`;

const SummaryCardsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 24px;

    @media (max-width: 992px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const SummaryCard = styled.div<{ type: 'balance' | 'income' | 'expense' }>`
    background-color: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    border-top: 4px solid
    ${props => {
        switch (props.type) {
            case 'balance': return '#3498db';
            case 'income': return '#2ecc71';
            case 'expense': return '#e74c3c';
            default: return '#3498db';
        }
    }};
`;

const CardLabel = styled.div`
    font-size: 16px;
    color: #7f8c8d;
    margin-bottom: 8px;
`;

const CardValue = styled.div`
    font-size: 28px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 16px;
`;

const CardDetail = styled.div`
    font-size: 14px;
    color: #7f8c8d;
    display: flex;
    align-items: center;
    gap: 6px;
`;

export default CashPage;