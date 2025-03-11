import React from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyData {
    month: string;
    revenue: number;
}

interface MonthlyRevenueChartProps {
    data: MonthlyData[];
}

const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <EmptyState>Brak danych o przychodach</EmptyState>;
    }

    // Formatowanie liczb w tooltipie i na osi Y
    const formatValue = (value: number) => `${value.toFixed(2)} zł`;

    return (
        <ChartContainer>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="month"
                        tick={{ fill: '#7f8c8d', fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis
                        tickFormatter={formatValue}
                        tick={{ fill: '#7f8c8d', fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                    />
                    <Tooltip
                        formatter={(value: number) => [formatValue(value), 'Przychód']}
                        labelFormatter={(label) => `Miesiąc: ${label}`}
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #f0f0f0',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3498db"
                        strokeWidth={3}
                        activeDot={{ r: 6, stroke: '#2980b9', strokeWidth: 1, fill: '#3498db' }}
                        dot={{ r: 4, stroke: '#2980b9', strokeWidth: 1, fill: 'white' }}
                    />
                </LineChart>
            </ResponsiveContainer>

            <ChartSummary>
                <SummaryItem>
                    <SummaryLabel>Największy przychód:</SummaryLabel>
                    <SummaryValue>
                        {formatValue(Math.max(...data.map(item => item.revenue)))}
                        <SummaryMonth>
                            {data.find(item => item.revenue === Math.max(...data.map(d => d.revenue)))?.month}
                        </SummaryMonth>
                    </SummaryValue>
                </SummaryItem>

                <SummaryItem>
                    <SummaryLabel>Średni miesięczny przychód:</SummaryLabel>
                    <SummaryValue>
                        {formatValue(data.reduce((acc, item) => acc + item.revenue, 0) / data.length)}
                    </SummaryValue>
                </SummaryItem>
            </ChartSummary>
        </ChartContainer>
    );
};

const ChartContainer = styled.div`
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
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChartSummary = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 4px;
`;

const SummaryValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const SummaryMonth = styled.span`
  font-size: 12px;
  font-weight: normal;
  color: #7f8c8d;
  margin-left: 5px;
  text-transform: capitalize;
`;

export default MonthlyRevenueChart;