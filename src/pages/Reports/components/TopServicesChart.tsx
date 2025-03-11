import React from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ServiceData {
    id: string;
    name: string;
    count: number;
    totalValue: number;
    color: string;
}

interface TopServicesChartProps {
    data: ServiceData[];
}

const TopServicesChart: React.FC<TopServicesChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <EmptyState>Brak danych o usługach</EmptyState>;
    }

    // Przygotowanie danych do wykresu
    const chartData = data.map(item => ({
        name: item.name.length > 20 ? item.name.substring(0, 18) + '...' : item.name,
        count: item.count,
        value: item.totalValue,
        color: item.color,
        fullName: item.name  // Zachowanie pełnej nazwy dla tooltip
    }));

    // Funkcja do formatowania wartości pieniężnych
    const formatCurrency = (value: number) => `${value.toFixed(2)} zł`;

    return (
        <Container>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                        formatter={(value: number, name: string) => {
                            if (name === 'count') {
                                return [`${value} zleceń`, 'Liczba'];
                            }
                            return [formatCurrency(value), 'Wartość'];
                        }}
                        labelFormatter={(label: string, props: any) => {
                            // Używamy any dla props, ponieważ typowanie Recharts jest problematyczne
                            if (props?.payload?.[0]?.payload?.fullName) {
                                return props.payload[0].payload.fullName;
                            }
                            return label;
                        }}
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #f0f0f0',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    />
                    <Bar
                        dataKey="count"
                        fill="#3498db"
                        name="Liczba zleceń"
                        radius={[0, 4, 4, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>

            <Summary>
                <SummaryItem>
                    <SummaryLabel>Najpopularniejsza usługa:</SummaryLabel>
                    <SummaryValue>
                        {data[0]?.name || 'Brak danych'}
                        <SummaryCount>({data[0]?.count || 0} zleceń)</SummaryCount>
                    </SummaryValue>
                </SummaryItem>

                <SummaryItem>
                    <SummaryLabel>Największa wartość:</SummaryLabel>
                    <SummaryValue>
                        {formatCurrency(data.reduce((max, item) => Math.max(max, item.totalValue), 0))}
                        <SummaryCount>
                            {data.find(item => item.totalValue === data.reduce((max, i) => Math.max(max, i.totalValue), 0))?.name}
                        </SummaryCount>
                    </SummaryValue>
                </SummaryItem>
            </Summary>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const EmptyState = styled.div`
    padding: 20px;
    text-align: center;
    color: #7f8c8d;
    background-color: #f9f9f9;
    border-radius: 4px;
    width: 100%;
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Summary = styled.div`
    margin-top: 15px;
    display: flex;
    justify-content: space-between;

    @media (max-width: 576px) {
        flex-direction: column;
        gap: 10px;
    }
`;

const SummaryItem = styled.div`
    display: flex;
    flex-direction: column;
`;

const SummaryLabel = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-bottom: 3px;
`;

const SummaryValue = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 5px;
`;

const SummaryCount = styled.span`
    font-size: 12px;
    font-weight: normal;
    color: #7f8c8d;
`;

export default TopServicesChart;