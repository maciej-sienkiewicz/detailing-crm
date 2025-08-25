// src/pages/SMS/components/SmsStats.tsx
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {
    FaArrowDown,
    FaArrowUp,
    FaCalendarAlt,
    FaChartLine,
    FaCheckCircle,
    FaEnvelope,
    FaExclamationTriangle,
    FaListAlt,
    FaMoneyBillWave,
    FaPercentage
} from 'react-icons/fa';
import {smsApi} from '../../../api/smsApi';
import {SmsStatus, SmsStatusColors, SmsStatusLabels} from '../../../types/sms';

export const SmsStats: React.FC = () => {
    // Stan komponentu
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statistics, setStatistics] = useState<any>({
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        deliveryRate: 0,
        averageDailyCount: 0,
        monthlyCounts: [],
        byStatus: {},
        byTemplate: [],
        byCampaign: []
    });
    const [balance, setBalance] = useState({
        balance: 0,
        usedThisMonth: 0,
        limit: 0
    });

    // Stan filtrów
    const [dateRange, setDateRange] = useState({
        from: getDateBefore(30), // domyślnie ostatnie 30 dni
        to: new Date().toISOString().split('T')[0] // dzisiaj
    });

    // Pobierz statystyki przy pierwszym renderowaniu
    useEffect(() => {
        fetchStatistics();
    }, [dateRange]);

    // Pobierz saldo SMS
    useEffect(() => {
        fetchBalance();
    }, []);

    // Pobieranie statystyk
    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const data = await []
            setStatistics(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching SMS statistics:', err);
            setError('Nie udało się pobrać statystyk SMS');
        } finally {
            setLoading(false);
        }
    };

    // Pobieranie salda
    const fetchBalance = async () => {
        try {
            const data = await smsApi.fetchSmsBalance();
            setBalance(data);
        } catch (err) {
            console.error('Error fetching SMS balance:', err);
            // Nie ustawiamy błędu, aby nie blokować wyświetlania statystyk
        }
    };

    // Pomocnicza funkcja do pobierania daty x dni temu
    function getDateBefore(days: number): string {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    }

    // Obsługa zmiany zakresu dat
    const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Obsługa predefiniowanych okresów
    const handlePredefinedRange = (days: number) => {
        setDateRange({
            from: getDateBefore(days),
            to: new Date().toISOString().split('T')[0]
        });
    };

    // Helper function to get color based on delivery rate
    const getDeliveryRateColor = (rate: number): string => {
        if (rate >= 95) return '#2ecc71'; // zielony dla bardzo dobrego wyniku
        if (rate >= 85) return '#27ae60'; // ciemniejszy zielony dla dobrego wyniku
        if (rate >= 75) return '#f39c12'; // pomarańczowy dla średniego wyniku
        if (rate >= 65) return '#e67e22'; // ciemniejszy pomarańczowy
        return '#e74c3c'; // czerwony dla słabego wyniku
    };

    // Format daty
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'short'
        });
    };

    // Wyświetlanie trendu
    const renderTrend = (current: number, previous: number) => {
        if (current === previous) return null;

        const isPositive = current > previous;
        const percentChange = previous === 0
            ? 100
            : Math.round(Math.abs(current - previous) / previous * 100);

        return (
            <TrendIndicator positive={isPositive}>
                {isPositive ? <FaArrowUp /> : <FaArrowDown />}
                {percentChange}%
            </TrendIndicator>
        );
    };

    return (
        <Container>
            <PageHeader>
                <PageTitle>
                    <FaChartLine style={{ marginRight: '10px' }} />
                    Statystyki SMS
                </PageTitle>
                <HeaderControls>
                    <DateRangeContainer>
                        <DateRangeLabel>Zakres dat:</DateRangeLabel>
                        <DateInput
                            type="date"
                            name="from"
                            value={dateRange.from}
                            onChange={handleDateRangeChange}
                        />
                        <DateRangeSeparator>do</DateRangeSeparator>
                        <DateInput
                            type="date"
                            name="to"
                            value={dateRange.to}
                            onChange={handleDateRangeChange}
                        />
                    </DateRangeContainer>

                    <PresetButtons>
                        <PresetButton onClick={() => handlePredefinedRange(7)}>
                            7 dni
                        </PresetButton>
                        <PresetButton onClick={() => handlePredefinedRange(30)}>
                            30 dni
                        </PresetButton>
                        <PresetButton onClick={() => handlePredefinedRange(90)}>
                            90 dni
                        </PresetButton>
                    </PresetButtons>
                </HeaderControls>
            </PageHeader>

            {/* Wyświetlanie błędu */}
            {error && <ErrorMessage>{error}</ErrorMessage>}

            {loading ? (
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie statystyk SMS...</LoadingText>
                </LoadingContainer>
            ) : (
                <>
                    {/* Karta salda SMS */}
                    <BalanceCard>
                        <BalanceHeader>
                            <BalanceTitle>
                                <FaMoneyBillWave style={{ marginRight: '8px' }} />
                                Saldo SMS
                            </BalanceTitle>
                            <BalanceDate>
                                <FaCalendarAlt style={{ marginRight: '5px' }} />
                                Stan na dziś
                            </BalanceDate>
                        </BalanceHeader>

                        <BalanceMetrics>
                            <BalanceMetric>
                                <BalanceMetricValue>{balance.balance}</BalanceMetricValue>
                                <BalanceMetricLabel>Dostępne</BalanceMetricLabel>
                            </BalanceMetric>

                            <BalanceDivider />

                            <BalanceMetric>
                                <BalanceMetricValue>{balance.usedThisMonth}</BalanceMetricValue>
                                <BalanceMetricLabel>Wykorzystane (ten miesiąc)</BalanceMetricLabel>
                            </BalanceMetric>

                            <BalanceDivider />

                            <BalanceMetric>
                                <BalanceMetricValue>{balance.limit}</BalanceMetricValue>
                                <BalanceMetricLabel>Miesięczny limit</BalanceMetricLabel>
                            </BalanceMetric>
                        </BalanceMetrics>

                        <BalanceUsageBar
                            value={balance.usedThisMonth}
                            max={balance.limit}
                        >
                            <BalanceUsageFill
                                value={Math.min((balance.usedThisMonth / balance.limit) * 100, 100)}
                                critical={balance.usedThisMonth / balance.limit > 0.9}
                            />
                        </BalanceUsageBar>

                        <BalanceUsageInfo>
                            Wykorzystano {Math.round((balance.usedThisMonth / balance.limit) * 100)}% miesięcznego limitu
                        </BalanceUsageInfo>
                    </BalanceCard>

                    {/* Główne metryki */}
                    <MetricsGrid>
                        <MetricCard>
                            <MetricIcon color="#3498db">
                                <FaEnvelope />
                            </MetricIcon>
                            <MetricContent>
                                <MetricValue>{statistics.totalSent}</MetricValue>
                                <MetricLabel>Wysłanych</MetricLabel>
                            </MetricContent>
                        </MetricCard>

                        <MetricCard>
                            <MetricIcon color="#2ecc71">
                                <FaCheckCircle />
                            </MetricIcon>
                            <MetricContent>
                                <MetricValue>{statistics.totalDelivered}</MetricValue>
                                <MetricLabel>Dostarczonych</MetricLabel>
                            </MetricContent>
                        </MetricCard>

                        <MetricCard>
                            <MetricIcon color="#e74c3c">
                                <FaExclamationTriangle />
                            </MetricIcon>
                            <MetricContent>
                                <MetricValue>{statistics.totalFailed}</MetricValue>
                                <MetricLabel>Nieudanych</MetricLabel>
                            </MetricContent>
                        </MetricCard>

                        <MetricCard>
                            <MetricIcon color={getDeliveryRateColor(statistics.deliveryRate)}>
                                <FaPercentage />
                            </MetricIcon>
                            <MetricContent>
                                <MetricValue>{statistics.deliveryRate}%</MetricValue>
                                <MetricLabel>Skuteczność</MetricLabel>
                            </MetricContent>
                        </MetricCard>
                    </MetricsGrid>

                    {/* Wykres miesięczny */}
                    <ChartSection>
                        <SectionTitle>Miesięczne statystyki wysyłki</SectionTitle>
                        <ChartContainer>
                            {statistics.monthlyCounts.length === 0 ? (
                                <EmptyState>
                                    Brak danych do wyświetlenia wykresu
                                </EmptyState>
                            ) : (
                                <BarChartContainer>
                                    {statistics.monthlyCounts.map((monthData: any) => (
                                        <BarChartColumn key={monthData.month}>
                                            <BarValue>
                                                {monthData.count}
                                            </BarValue>
                                            <BarChart>
                                                <BarChartFill
                                                    height={calculateBarHeight(monthData.count, statistics.monthlyCounts)}
                                                />
                                            </BarChart>
                                            <BarLabel>
                                                {formatDate(monthData.month)}
                                            </BarLabel>
                                        </BarChartColumn>
                                    ))}
                                </BarChartContainer>
                            )}
                        </ChartContainer>
                    </ChartSection>

                    {/* Sekcja z podziałem na statusy */}
                    <SectionGrid>
                        <Section>
                            <SectionTitle>Podział według statusu</SectionTitle>
                            <StatusList>
                                {Object.entries(statistics.byStatus || {}).map(([status, count]: [string, any]) => (
                                    <StatusItem key={status}>
                                        <StatusBadge color={SmsStatusColors[status as SmsStatus]}>
                                            {SmsStatusLabels[status as SmsStatus]}
                                        </StatusBadge>
                                        <StatusCount>{count}</StatusCount>
                                    </StatusItem>
                                ))}
                            </StatusList>
                        </Section>

                        {/* Sekcja z popularnymi szablonami */}
                        <Section>
                            <SectionTitle>Najpopularniejsze szablony</SectionTitle>
                            {statistics.byTemplate.length === 0 ? (
                                <EmptyState>Brak danych o szablonach</EmptyState>
                            ) : (
                                <TemplatesList>
                                    {statistics.byTemplate.slice(0, 5).map((templateData: any) => (
                                        <TemplateItem key={templateData.templateId}>
                                            <TemplateNameContainer>
                                                <TemplateIcon>
                                                    <FaListAlt />
                                                </TemplateIcon>
                                                <TemplateName>
                                                    {templateData.templateName}
                                                </TemplateName>
                                            </TemplateNameContainer>
                                            <TemplateCount>
                                                {templateData.count} użyć
                                            </TemplateCount>
                                        </TemplateItem>
                                    ))}
                                </TemplatesList>
                            )}
                        </Section>
                    </SectionGrid>

                    {/* Sekcja z kampaniami */}
                    <Section>
                        <SectionTitle>Kampanie SMS</SectionTitle>
                        {statistics.byCampaign.length === 0 ? (
                            <EmptyState>Brak danych o kampaniach</EmptyState>
                        ) : (
                            <CampaignsTable>
                                <thead>
                                <tr>
                                    <TableHeader>Nazwa kampanii</TableHeader>
                                    <TableHeader>Odbiorcy</TableHeader>
                                    <TableHeader>Dostarczono</TableHeader>
                                    <TableHeader>Nieudane</TableHeader>
                                    <TableHeader>Skuteczność</TableHeader>
                                </tr>
                                </thead>
                                <tbody>
                                {statistics.byCampaign.map((campaignData: any) => (
                                    <TableRow key={campaignData.campaignId}>
                                        <TableCell>
                                            <CampaignName>{campaignData.campaignName}</CampaignName>
                                        </TableCell>
                                        <TableCell>{campaignData.recipientCount}</TableCell>
                                        <TableCell>{campaignData.deliveredCount}</TableCell>
                                        <TableCell>{campaignData.failedCount}</TableCell>
                                        <TableCell>
                                            <DeliveryRate
                                                rate={campaignData.deliveryRate}
                                                color={getDeliveryRateColor(campaignData.deliveryRate)}
                                            >
                                                {campaignData.deliveryRate}%
                                            </DeliveryRate>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </tbody>
                            </CampaignsTable>
                        )}
                    </Section>
                </>
            )}
        </Container>
    );
};

// Pomocnicza funkcja do obliczania wysokości słupka
const calculateBarHeight = (value: number, data: { count: number }[]): number => {
    const maxValue = Math.max(...data.map(item => item.count));
    return maxValue === 0 ? 0 : (value / maxValue) * 100;
};

// Styled components
const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    flex-wrap: wrap;
    gap: 16px;
`;

const PageTitle = styled.h1`
    font-size: 24px;
    display: flex;
    align-items: center;
    color: #2c3e50;
    margin: 0;
`;

const HeaderControls = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
`;

const DateRangeContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const DateRangeLabel = styled.span`
    font-size: 14px;
    color: #6c757d;
`;

const DateInput = styled.input`
    padding: 6px 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
`;

const DateRangeSeparator = styled.span`
    color: #6c757d;
`;

const PresetButtons = styled.div`
    display: flex;
    gap: 8px;
`;

const PresetButton = styled.button`
    padding: 6px 10px;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    font-size: 13px;
    color: #495057;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background-color: #e9ecef;
    }
`;

const ErrorMessage = styled.div`
    padding: 12px 16px;
    background-color: #fff5f5;
    border: 1px solid #fee2e2;
    border-radius: 4px;
    color: #e53e3e;
    margin-bottom: 10px;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
`;

const LoadingSpinner = styled.div`
    width: 36px;
    height: 36px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    margin-bottom: 16px;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    color: #6c757d;
    font-size: 14px;
`;

const BalanceCard = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    padding: 20px;
    border: 1px solid #e9ecef;
    margin-bottom: 20px;
`;

const BalanceHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const BalanceTitle = styled.h2`
    margin: 0;
    font-size: 18px;
    color: #2c3e50;
    display: flex;
    align-items: center;
`;

const BalanceDate = styled.div`
    font-size: 13px;
    color: #6c757d;
    display: flex;
    align-items: center;
`;

const BalanceMetrics = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
`;

const BalanceMetric = styled.div`
    flex: 1;
    text-align: center;
    padding: 0 10px;
`;

const BalanceMetricValue = styled.div`
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 5px;
`;

const BalanceMetricLabel = styled.div`
    font-size: 13px;
    color: #6c757d;
`;

const BalanceDivider = styled.div`
    width: 1px;
    height: 40px;
    background-color: #e9ecef;
`;

const BalanceUsageBar = styled.div<{ value: number, max: number }>`
    height: 8px;
    background-color: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
`;

const BalanceUsageFill = styled.div<{ value: number, critical: boolean }>`
    height: 100%;
    width: ${props => `${props.value}%`};
    background-color: ${props => props.critical ? '#e74c3c' : '#3498db'};
    border-radius: 4px;
    transition: width 0.3s ease;
`;

const BalanceUsageInfo = styled.div`
    text-align: right;
    font-size: 12px;
    color: #6c757d;
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
`;

const MetricCard = styled.div`
    display: flex;
    align-items: center;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    padding: 20px;
    border: 1px solid #e9ecef;
`;

const MetricIcon = styled.div<{ color: string }>`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${props => `${props.color}10`};
    color: ${props => props.color};
    font-size: 20px;
    margin-right: 16px;
`;

const MetricContent = styled.div`
    display: flex;
    flex-direction: column;
`;

const MetricValue = styled.div`
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
`;

const MetricLabel = styled.div`
    font-size: 13px;
    color: #6c757d;
    margin-top: 4px;
`;

const TrendIndicator = styled.div<{ positive: boolean }>`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
    color: ${props => props.positive ? '#2ecc71' : '#e74c3c'};
    margin-top: 4px;
`;

const ChartSection = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    padding: 20px;
    border: 1px solid #e9ecef;
    margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
    font-size: 16px;
    margin: 0 0 20px 0;
    color: #2c3e50;
`;

const ChartContainer = styled.div`
    height: 250px;
`;

const BarChartContainer = styled.div`
    display: flex;
    align-items: flex-end;
    height: 200px;
    padding-top: 20px;
    gap: 8px;
`;

const BarChartColumn = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
`;

const BarValue = styled.div`
    font-size: 12px;
    color: #6c757d;
    margin-bottom: 5px;
`;

const BarChart = styled.div`
    width: 100%;
    height: 150px;
    background-color: #f8f9fa;
    border-radius: 4px;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
`;

const BarChartFill = styled.div<{ height: number }>`
    width: 100%;
    height: ${props => `${props.height}%`};
    background-color: #3498db;
    transition: height 0.3s ease;
`;

const BarLabel = styled.div`
    font-size: 11px;
    color: #6c757d;
    margin-top: 8px;
    text-align: center;
`;

const SectionGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
`;

const Section = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    padding: 20px;
    border: 1px solid #e9ecef;
`;

const StatusList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const StatusItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f1f3f5;
    
    &:last-child {
        border-bottom: none;
    }
`;

const StatusBadge = styled.div<{ color: string }>`
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    background-color: ${props => `${props.color}20`};
    color: ${props => props.color};
`;

const StatusCount = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
`;

const TemplatesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const TemplateItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f1f3f5;
    
    &:last-child {
        border-bottom: none;
    }
`;

const TemplateNameContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const TemplateIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 6px;
    background-color: #e3f2fd;
    color: #3498db;
    font-size: 14px;
`;

const TemplateName = styled.div`
    font-size: 14px;
    color: #2c3e50;
`;

const TemplateCount = styled.div`
    font-size: 13px;
    color: #6c757d;
`;

const CampaignsTable = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHeader = styled.th`
    text-align: left;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #2c3e50;
    border-bottom: 2px solid #f1f3f5;
`;

const TableRow = styled.tr`
    border-bottom: 1px solid #f1f3f5;
    
    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.td`
    padding: 12px 16px;
    font-size: 14px;
    color: #2c3e50;
`;

const CampaignName = styled.div`
    font-weight: 500;
`;

const DeliveryRate = styled.div<{ rate: number, color: string }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${props => `${props.color}20`};
    color: ${props => props.color};
`;

const EmptyState = styled.div`
    padding: 30px;
    text-align: center;
    background-color: #f8f9fa;
    border-radius: 6px;
    color: #6c757d;
    font-size: 14px;
`;

export default SmsStats;