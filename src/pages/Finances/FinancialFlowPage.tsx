// src/pages/Finances/FinancialFlowPage.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaChartLine, FaPlus, FaFileExport, FaCalendarAlt } from 'react-icons/fa';
import {
    FinancialOperation,
    FinancialOperationFilters,
    FinancialSummary,
    PaymentStatus
} from '../../types';
import { financialOperationsApi } from '../../api/financialOperationsApi';
import FinancialSummaryCards from './components/FinancialSummaryCards';
import FinancialOperationsFilters from './components/FinancialOperationsFilters';
import FinancialOperationsTable from './components/FinancialOperationsTable';
import FinancialDetailsSummary from './components/FinancialDetailsSummary';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast/Toast';
import FinancialOperationForm from './components/FinancialOperationForm';
import FinancialOperationDetails from './components/FinancialOperationDetails';

const FinancialFlowPage: React.FC = () => {
    // Stan dla operacji finansowych
    const [operations, setOperations] = useState<FinancialOperation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<FinancialOperationFilters>({});

    // Stan dla podsumowania finansowego
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [loadingSummary, setLoadingSummary] = useState<boolean>(true);

    // Stan dla paginacji
    const [pagination, setPagination] = useState({
        currentPage: 0,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
    });

    // Stan dla śledzenia okresów czasowych
    const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });

    // Modal do szczegółów operacji
    const [viewOperation, setViewOperation] = useState<FinancialOperation | null>(null);
    const [showViewModal, setShowViewModal] = useState<boolean>(false);

    // Stan dla modalu edycji/dodawania
    const [editOperation, setEditOperation] = useState<FinancialOperation | null>(null);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);

    // Hook do powiadomień
    const { showToast } = useToast();

    // Pobieranie danych przy pierwszym renderowaniu i przy zmianie strony lub filtrów
    useEffect(() => {
        fetchOperations();
    }, [pagination.currentPage, filters]);

    // Pobieranie podsumowania finansowego
    useEffect(() => {
        fetchFinancialSummary();
    }, [dateRange]);

    // Funkcja pobierająca operacje finansowe
    const fetchOperations = async () => {
        try {
            setLoading(true);
            const response = await financialOperationsApi.fetchFinancialOperations(
                filters,
                pagination.currentPage,
                pagination.pageSize
            );

            setOperations(response.data);
            setPagination({
                currentPage: response.pagination.currentPage,
                pageSize: response.pagination.pageSize,
                totalItems: response.pagination.totalItems,
                totalPages: response.pagination.totalPages
            });

            setError(null);
        } catch (err) {
            console.error('Błąd podczas pobierania operacji finansowych:', err);
            setError('Nie udało się pobrać listy operacji. Spróbuj ponownie później.');
        } finally {
            setLoading(false);
        }
    };

    // Funkcja pobierająca podsumowanie finansowe
    const fetchFinancialSummary = async () => {
        try {
            setLoadingSummary(true);
            const summaryData = await financialOperationsApi.getFinancialSummary(
                dateRange.from,
                dateRange.to
            );
            setSummary(summaryData);
        } catch (err) {
            console.error('Błąd podczas pobierania podsumowania finansowego:', err);
            showToast('error', 'Nie udało się pobrać podsumowania finansowego');
        } finally {
            setLoadingSummary(false);
        }
    };

    // Obsługa zmiany strony
    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({
            ...prev,
            currentPage: newPage - 1 // API używa indeksowania od 0, a komponent paginacji od 1
        }));
    };

    // Obsługa wyszukiwania / filtrowania
    const handleSearch = (newFilters: FinancialOperationFilters) => {
        setFilters(newFilters);
        // Resetujemy stronę przy nowym wyszukiwaniu
        setPagination(prev => ({
            ...prev,
            currentPage: 0
        }));
    };

    const handleSaveOperation = async (operationData: Partial<FinancialOperation>, file?: File | null) => {
        try {
            setLoading(true);

            if (editOperation && editOperation.id) {
                // Aktualizacja istniejącej operacji
                const updatedOperation = await financialOperationsApi.updateFinancialOperation(
                    editOperation.id,
                    operationData
                );

                setOperations(prevOperations =>
                    prevOperations.map(op =>
                        op.id === updatedOperation.id ? updatedOperation : op
                    )
                );

                showToast('success', 'Operacja została zaktualizowana');
            } else {
                // Dodawanie nowej operacji
                const newOperation = await financialOperationsApi.createFinancialOperation(
                    operationData as Omit<FinancialOperation, 'id' | 'createdAt' | 'updatedAt'>
                );

                // Dodajemy nową operację na początek listy
                setOperations(prevOperations => [newOperation, ...prevOperations]);

                showToast('success', 'Nowa operacja została dodana');
            }

            // Odświeżamy podsumowanie
            fetchFinancialSummary();

            // Zamykamy modal
            setShowEditModal(false);
        } catch (error) {
            console.error('Error saving operation:', error);
            showToast('error', 'Wystąpił błąd podczas zapisywania operacji');
        } finally {
            setLoading(false);
        }
    };

    // Obsługa zmiany okresu
    const handlePeriodChange = (period: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom') => {
        const now = new Date();
        let fromDate: Date;

        switch (period) {
            case 'day':
                fromDate = new Date(now);
                fromDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                fromDate = new Date(now);
                fromDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                fromDate = new Date(now.getFullYear(), quarter * 3, 1);
                break;
            case 'year':
                fromDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                // Dla custom zachowujemy obecny zakres dat
                return;
        }

        setDateRange({
            from: fromDate.toISOString().split('T')[0],
            to: now.toISOString().split('T')[0]
        });
    };

    // Obsługa podglądu operacji
    const handleViewOperation = (operation: FinancialOperation) => {
        setViewOperation(operation);
        setShowViewModal(true);
    };

    // Obsługa edycji operacji
    const handleEditOperation = (operation: FinancialOperation) => {
        setEditOperation(operation);
        setShowEditModal(true);
    };

    // Obsługa usuwania operacji
    const handleDeleteOperation = async (id: string) => {
        try {
            setLoading(true);
            const success = await financialOperationsApi.deleteFinancialOperation(id);

            if (success) {
                showToast('success', 'Operacja finansowa została usunięta');
                fetchOperations();
                fetchFinancialSummary();
            } else {
                showToast('error', 'Nie udało się usunąć operacji');
            }
        } catch (error) {
            console.error('Błąd podczas usuwania operacji:', error);
            showToast('error', 'Wystąpił błąd podczas usuwania operacji');
        } finally {
            setLoading(false);
        }
    };

    // Obsługa zmiany statusu operacji
    const handleStatusChange = async (id: string, status: PaymentStatus) => {
        try {
            await financialOperationsApi.updateOperationStatus(id, status);

            // Aktualizujemy lokalny stan
            setOperations(prev =>
                prev.map(operation =>
                    operation.id === id ? { ...operation, status } : operation
                )
            );

            // Odświeżamy podsumowanie
            fetchFinancialSummary();

            showToast('success', 'Status operacji został zaktualizowany');
        } catch (error) {
            console.error('Błąd podczas aktualizacji statusu:', error);
            showToast('error', 'Nie udało się zaktualizować statusu operacji');
        }
    };

    // Formatowanie okresu dla tytułu
    const formatPeriodTitle = (): string => {
        const from = new Date(dateRange.from);
        const to = new Date(dateRange.to);

        // Formatowanie dat
        const fromStr = from.toLocaleDateString('pl-PL');
        const toStr = to.toLocaleDateString('pl-PL');

        return `Okres: ${fromStr} - ${toStr}`;
    };

    return (
        <PageContainer>
            <Header>
                <Title>
                    <FaChartLine />
                    <span>Przepływ środków</span>
                </Title>
                <Actions>
                    <PeriodSelector>
                        <PeriodButton
                            onClick={() => handlePeriodChange('month')}
                            active={
                                dateRange.from === new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
                            }
                        >
                            <FaCalendarAlt />
                            <span>Ten miesiąc</span>
                        </PeriodButton>
                        <PeriodDropdown
                            onChange={(e) => handlePeriodChange(e.target.value as any)}
                        >
                            <option value="day">Dzisiaj</option>
                            <option value="week">Ostatni tydzień</option>
                            <option value="month">Ten miesiąc</option>
                            <option value="quarter">Ten kwartał</option>
                            <option value="year">Ten rok</option>
                            <option value="custom">Okres niestandardowy</option>
                        </PeriodDropdown>
                    </PeriodSelector>

                    <ButtonGroup>
                        <ExportButton>
                            <FaFileExport />
                            <span>Eksport danych</span>
                        </ExportButton>
                        <AddButton onClick={() => {
                            setEditOperation(null);
                            setShowEditModal(true);
                        }}>
                            <FaPlus />
                            <span>Dodaj operację</span>
                        </AddButton>
                    </ButtonGroup>
                </Actions>
            </Header>

            {summary && (
                <FinancialSummaryCards
                    summary={summary}
                    isLoading={loadingSummary}
                    period={formatPeriodTitle()}
                />
            )}

            <FinancialOperationsFilters
                onSearch={handleSearch}
                initialFilters={filters}
            />

            {error ? (
                <ErrorMessage>{error}</ErrorMessage>
            ) : (
                <>
                    <FinancialOperationsTable
                        operations={operations}
                        isLoading={loading}
                        onView={handleViewOperation}
                        onEdit={handleEditOperation}
                        onDelete={handleDeleteOperation}
                        onStatusChange={handleStatusChange}
                    />

                    {operations.length > 0 && (
                        <PaginationContainer>
                            <Pagination
                                currentPage={pagination.currentPage + 1} // Konwersja z indeksowania od 0 do indeksowania od 1
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                                totalItems={pagination.totalItems}
                                pageSize={pagination.pageSize}
                                showTotalItems={true}
                            />
                        </PaginationContainer>
                    )}
                </>
            )}

            {summary && (
                <FinancialDetailsSummary
                    summary={summary}
                    isLoading={loadingSummary}
                />
            )}

            {/* Modal ze szczegółami operacji */}
            {viewOperation && (
                <Modal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    title={`Szczegóły operacji: ${viewOperation.title}`}
                >
                    <FinancialOperationDetails
                        operation={viewOperation}
                        onEdit={() => {
                            setShowViewModal(false);
                            setEditOperation(viewOperation);
                            setShowEditModal(true);
                        }}
                    />
                </Modal>
            )}

            {/* Modal dodawania/edycji operacji */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title={editOperation ? 'Edytuj operację' : 'Dodaj nową operację'}
            >
                <FinancialOperationForm
                    operation={editOperation}
                    onSave={handleSaveOperation}
                    onCancel={() => setShowEditModal(false)}
                />
            </Modal>
        </PageContainer>
    );
};

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
  
  @media (max-width: 992px) {
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
  align-items: center;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
`;

const PeriodSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

interface PeriodButtonProps {
    active: boolean;
}

const PeriodButton = styled.button<PeriodButtonProps>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  background-color: ${props => props.active ? '#3498db' : 'white'};
  color: ${props => props.active ? 'white' : '#2c3e50'};
  border: 1px solid ${props => props.active ? '#3498db' : '#dfe6e9'};
  
  &:hover {
    background-color: ${props => props.active ? '#2980b9' : '#f5f6fa'};
  }
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const PeriodDropdown = styled.select`
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
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
  
  @media (max-width: 576px) {
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
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const ExportButton = styled(Button)`
  background-color: white;
  color: #2c3e50;
  border: 1px solid #dfe6e9;
  
  &:hover {
    background-color: #f8f9fa;
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
  margin-bottom: 24px;
`;

const PaginationContainer = styled.div`
  margin: 24px 0;
  display: flex;
  justify-content: center;
`;

const OperationDetails = styled.div`
  padding: 20px;
`;

const OperationForm = styled.div`
  padding: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  
  @media (max-width: 576px) {
    flex-direction: column-reverse;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #3498db;
  color: white;
  border: none;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: white;
  color: #2c3e50;
  border: 1px solid #dfe6e9;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

export default FinancialFlowPage;