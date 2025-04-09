import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaChartBar, FaCalendarAlt, FaChartPie, FaChartLine, FaFilePdf, FaDownload } from 'react-icons/fa';
import { Invoice, InvoiceType } from '../../types';

type SummaryPeriod = 'daily' | 'monthly' | 'yearly' | 'custom';

interface SummaryData {
    income: number;
    expense: number;
    balance: number;
    invoiceCount: {
        income: number;
        expense: number;
        total: number;
    };
    averageInvoiceValue: {
        income: number;
        expense: number;
    };
}

const FinancialSummaryPage: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<SummaryPeriod>('monthly');
    const [customDateRange, setCustomDateRange] = useState<{start: string; end: string}>({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    // Pobieranie danych
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                // Tymczasowo generujemy dane testowe
                const mockInvoices = Array.from({ length: 50 }, (_, i) => createMockInvoice(i));
                setInvoices(mockInvoices);

                // Generuj podsumowanie na podstawie wybranego okresu
                generateSummary(mockInvoices, selectedPeriod);
            } catch (error) {
                console.error('Błąd podczas pobierania danych finansowych:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, [selectedPeriod]);

    // Przykładowa funkcja tworząca dane testowe
    const createMockInvoice = (index: number): Invoice => {
        const isIncome = index % 2 === 0;
        const date = new Date();
        date.setDate(date.getDate() - (index % 60)); // Faktury z ostatnich 60 dni

        const totalNet = Math.round((500 + Math.random() * 5000) * 100) / 100;
        const totalTax = Math.round(totalNet * 0.23 * 100) / 100;
        const totalGross = totalNet + totalTax;

        return {
            id: `inv-${index + 1000}`,
            number: `FV/${date.getFullYear()}/${index + 101}`,
            title: isIncome
                ? `Usługi detailingowe ${index % 5 === 0 ? 'Premium' : 'Standard'}`
                : `Zakup materiałów ${index % 4 === 0 ? 'eksploatacyjnych' : 'detailingowych'}`,
            issuedDate: date.toISOString(),
            dueDate: new Date(date.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            sellerName: isIncome ? 'Detailing Pro Sp. z o.o.' : `Dostawca ${index % 5 + 1}`,
            sellerTaxId: isIncome ? '1234567890' : `${9876543210 - index}`,
            sellerAddress: isIncome ? 'ul. Polerska 15, 00-123 Warszawa' : `ul. Dostawcza ${index + 1}, 00-${index + 200} Warszawa`,
            buyerName: isIncome ? `Klient ${index + 1}` : 'Detailing Pro Sp. z o.o.',
            buyerTaxId: isIncome ? (index % 4 === 0 ? '9876543210' : undefined) : '1234567890',
            buyerAddress: isIncome ? `ul. Klienta ${index + 10}, 00-${index + 100} Warszawa` : 'ul. Polerska 15, 00-123 Warszawa',
            status: index % 5 === 0 ? 'PAID' : index % 5 === 1 ? 'ISSUED' : index % 5 === 2 ? 'SENT' : index % 5 === 3 ? 'OVERDUE' : 'PARTIALLY_PAID',
            type: isIncome ? InvoiceType.INCOME : InvoiceType.EXPENSE,
            paymentMethod: index % 3 === 0 ? 'BANK_TRANSFER' : index % 3 === 1 ? 'CASH' : 'CREDIT_CARD',
            totalNet,
            totalTax,
            totalGross,
            currency: 'PLN',
            notes: index % 7 === 0 ? 'Faktura korygująca' : undefined,
            createdAt: date.toISOString(),
            updatedAt: date.toISOString(),
            items: [
                {
                    id: `item-${index}-1`,
                    name: isIncome ? 'Usługa detailingowa' : 'Materiały detailingowe',
                    description: isIncome ? 'Usługa detailingu pojazdu' : 'Zakup materiałów eksploatacyjnych',
                    quantity: Math.floor(Math.random() * 3) + 1,
                    unitPrice: totalNet / (Math.floor(Math.random() * 3) + 1),
                    taxRate: 23,
                    totalNet: totalNet,
                    totalGross: totalGross
                }
            ],
            attachments: []
        };
    };

    // Zmiana okresu podsumowania
    const handlePeriodChange = (period: SummaryPeriod) => {
        setSelectedPeriod(period);
        generateSummary(invoices, period);
    };

    // Zmiana zakresu dat dla niestandardowego okresu
    const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCustomDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Zastosuj niestandardowy zakres dat
    const applyCustomDateRange = () => {
        generateSummary(invoices, 'custom');
    };

    // Generowanie danych podsumowania na podstawie okresu
    const generateSummary = (data: Invoice[], period: SummaryPeriod) => {
        let filteredInvoices: Invoice[] = [];

        // Filtrowanie faktur według wybranego okresu
        switch (period) {
            case 'daily':
                // Dzisiaj
                const today = new Date().setHours(0, 0, 0, 0);
                filteredInvoices = data.filter(invoice => {
                    const invoiceDate = new Date(invoice.issuedDate).setHours(0, 0, 0, 0);
                    return invoiceDate === today;
                });
                break;

            case 'monthly':
                // Bieżący miesiąc
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                filteredInvoices = data.filter(invoice => {
                    const invoiceDate = new Date(invoice.issuedDate);
                    return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
                });
                break;

            case 'yearly':
                // Bieżący rok
                const year = new Date().getFullYear();
                filteredInvoices = data.filter(invoice => {
                    return new Date(invoice.issuedDate).getFullYear() === year;
                });
                break;

            case 'custom':
                // Niestandardowy zakres dat
                const startDate = new Date(customDateRange.start).setHours(0, 0, 0, 0);
                const endDate = new Date(customDateRange.end).setHours(23, 59, 59, 999);
                filteredInvoices = data.filter(invoice => {
                    const invoiceDate = new Date(invoice.issuedDate).getTime();
                    return invoiceDate >= startDate && invoiceDate <= endDate;
                });
                break;
        }

        // Obliczanie wartości podsumowania
        const incomeInvoices = filteredInvoices.filter(inv => inv.type === InvoiceType.INCOME);
        const expenseInvoices = filteredInvoices.filter(inv => inv.type === InvoiceType.EXPENSE);

        const totalIncome = incomeInvoices.reduce((sum, inv) => sum + inv.totalGross, 0);
        const totalExpense = expenseInvoices.reduce((sum, inv) => sum + inv.totalGross, 0);

        const summary: SummaryData = {
            income: totalIncome,
            expense: totalExpense,
            balance: totalIncome - totalExpense,
            invoiceCount: {
                income: incomeInvoices.length,
                expense: expenseInvoices.length,
                total: filteredInvoices.length
            },
            averageInvoiceValue: {
                income: incomeInvoices.length ? totalIncome / incomeInvoices.length : 0,
                expense: expenseInvoices.length ? totalExpense / expenseInvoices.length : 0
            }
        };

        setSummaryData(summary);
    };

    // Formatowanie kwot
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Funkcja generująca tytuł okresu
    const getPeriodTitle = (): string => {
        switch (selectedPeriod) {
            case 'daily':
                return `Podsumowanie dzienne: ${new Date().toLocaleDateString('pl-PL')}`;
            case 'monthly':
                return `Podsumowanie miesięczne: ${new Date().toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}`;
            case 'yearly':
                return `Podsumowanie roczne: ${new Date().getFullYear()}`;
            case 'custom':
                return `Podsumowanie: ${new Date(customDateRange.start).toLocaleDateString('pl-PL')} - ${new Date(customDateRange.end).toLocaleDateString('pl-PL')}`;
        }
    };

    return (
        <PageContainer>
            <Header>
                <Title>
                    <FaChartBar />
                    <span>Podsumowanie finansowe</span>
                </Title>
                <Actions>
                    <ReportButton>
                        <FaFilePdf />
                        <span>Generuj raport PDF</span>
                    </ReportButton>
                </Actions>
            </Header>

            <PeriodSelector>
                <PeriodOption
                    active={selectedPeriod === 'daily'}
                    onClick={() => handlePeriodChange('daily')}
                >
                    Dzisiaj
                </PeriodOption>
                <PeriodOption
                    active={selectedPeriod === 'monthly'}
                    onClick={() => handlePeriodChange('monthly')}
                >
                    Bieżący miesiąc
                </PeriodOption>
                <PeriodOption
                    active={selectedPeriod === 'yearly'}
                    onClick={() => handlePeriodChange('yearly')}
                >
                    Bieżący rok
                </PeriodOption>
                <PeriodOption
                    active={selectedPeriod === 'custom'}
                    onClick={() => handlePeriodChange('custom')}
                >
                    Niestandardowy
                </PeriodOption>
            </PeriodSelector>

            {selectedPeriod === 'custom' && (
                <CustomDateRange>
                    <DateInput>
                        <Label htmlFor="start">Data początkowa</Label>
                        <Input
                            id="start"
                            name="start"
                            type="date"
                            value={customDateRange.start}
                            onChange={handleDateRangeChange}
                        />
                    </DateInput>
                    <DateInput>
                        <Label htmlFor="end">Data końcowa</Label>
                        <Input
                            id="end"
                            name="end"
                            type="date"
                            value={customDateRange.end}
                            onChange={handleDateRangeChange}
                        />
                    </DateInput>
                    <ApplyButton onClick={applyCustomDateRange}>
                        Zastosuj
                    </ApplyButton>
                </CustomDateRange>
            )}

            <SummaryTitle>
                <FaCalendarAlt />
                <span>{getPeriodTitle()}</span>
            </SummaryTitle>

            {loading ? (
                <LoadingIndicator>Ładowanie danych finansowych...</LoadingIndicator>
            ) : summaryData ? (
                <>
                    <SummaryCardsGrid>
                        <SummaryCard type="income">
                            <CardLabel>Przychody</CardLabel>
                            <CardValue>{formatAmount(summaryData.income)}</CardValue>
                            <CardDetail>Liczba faktur: {summaryData.invoiceCount.income}</CardDetail>
                            <CardDetail>
                                Średnia wartość: {formatAmount(summaryData.averageInvoiceValue.income)}
                            </CardDetail>
                        </SummaryCard>

                        <SummaryCard type="expense">
                            <CardLabel>Koszty</CardLabel>
                            <CardValue>{formatAmount(summaryData.expense)}</CardValue>
                            <CardDetail>Liczba faktur: {summaryData.invoiceCount.expense}</CardDetail>
                            <CardDetail>
                                Średnia wartość: {formatAmount(summaryData.averageInvoiceValue.expense)}
                            </CardDetail>
                        </SummaryCard>

                        <SummaryCard type={summaryData.balance >= 0 ? 'positive' : 'negative'}>
                            <CardLabel>Bilans</CardLabel>
                            <CardValue>{formatAmount(summaryData.balance)}</CardValue>
                            <CardDetail>Łączna liczba faktur: {summaryData.invoiceCount.total}</CardDetail>
                        </SummaryCard>
                    </SummaryCardsGrid>

                    <SectionTitle>
                        <FaChartPie />
                        <span>Statystyki miesięczne</span>
                    </SectionTitle>

                    <ChartContainer>
                        <ChartPlaceholder>
                            <FaChartLine size={32} />
                            <span>Tu będzie wykres podsumowujący przychody i koszty w wybranym okresie</span>
                        </ChartPlaceholder>
                    </ChartContainer>
                </>
            ) : (
                <NoDataMessage>
                    Brak danych finansowych dla wybranego okresu.
                </NoDataMessage>
            )}
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
    }
`;

const ReportButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    background-color: #16a085;
    color: white;
    border: none;
    
    &:hover {
        background-color: #138a72;
    }
    
    @media (max-width: 576px) {
        width: 100%;
    }
`;

const PeriodSelector = styled.div`
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    
    @media (max-width: 576px) {
        flex-direction: column;
    }
`;

const PeriodOption = styled.button<{ active: boolean }>`
    padding: 10px 16px;
    border-radius: 4px;
    font-weight: ${props => props.active ? '600' : '400'};
    cursor: pointer;
    background-color: ${props => props.active ? '#3498db' : 'white'};
    color: ${props => props.active ? 'white' : '#2c3e50'};
    border: 1px solid ${props => props.active ? '#3498db' : '#dfe6e9'};
    
    &:hover {
        background-color: ${props => props.active ? '#2980b9' : '#f5f6fa'};
    }
    
    @media (max-width: 576px) {
        width: 100%;
    }
`;

const CustomDateRange = styled.div`
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    align-items: flex-end;
    
    @media (max-width: 768px) {
        flex-wrap: wrap;
    }
    
    @media (max-width: 576px) {
        flex-direction: column;
    }
`;

const DateInput = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    
    @media (max-width: 576px) {
        width: 100%;
    }
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
    
    @media (max-width: 576px) {
        width: 100%;
    }
`;

const ApplyButton = styled.button`
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    background-color: #3498db;
    color: white;
    border: none;
    height: 36px;
    
    &:hover {
        background-color: #2980b9;
    }
    
    @media (max-width: 576px) {
        width: 100%;
    }
`;

const SummaryTitle = styled.h2`
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    margin: 0 0 24px 0;
    color: #2c3e50;
    
    svg {
        color: #3498db;
    }
`;

const SummaryCardsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 32px;
    
    @media (max-width: 992px) {
        grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const SummaryCard = styled.div<{ type: 'income' | 'expense' | 'positive' | 'negative' }>`
    background-color: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    border-top: 4px solid 
        ${props => {
    switch (props.type) {
        case 'income': return '#2ecc71';
        case 'expense': return '#e74c3c';
        case 'positive': return '#2ecc71';
        case 'negative': return '#e74c3c';
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
    margin-bottom: 4px;
`;

const SectionTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    margin: 0 0 16px 0;
    color: #2c3e50;
    
    svg {
        color: #3498db;
    }
`;

const ChartContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;
    min-height: 300px;
`;

const ChartPlaceholder = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #95a5a6;
    text-align: center;
    gap: 16px;
    
    span {
        max-width: 400px;
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

const NoDataMessage = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    color: #7f8c8d;
    font-weight: 500;
`;

export default FinancialSummaryPage;