import React from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyData {
    month: string;
    tasks: number;
    revenue: number;
}

interface SeasonalityChartProps {
    data: MonthlyData[];
    showRevenue?: boolean;
}

const SeasonalityChart: React.FC<SeasonalityChartProps> = ({
                                                               data,
                                                               showRevenue = true
                                                           }) => {
    if (!data || data.length === 0) {
        return <EmptyState>Brak danych o sezonowości</EmptyState>;
    }

    // Formatowanie liczb w tooltipie i na osi Y
    const formatCurrency = (value: number) => `${value.toFixed(2)} zł`;
    const formatTasks = (value: number) => value.toString();

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
                        yAxisId="left"
                        orientation="left"
                        tickFormatter={formatTasks}
                        tick={{ fill: '#7f8c8d', fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                    />
                    {showRevenue && (
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={formatCurrency}
                            tick={{ fill: '#7f8c8d', fontSize: 12 }}
                            axisLine={{ stroke: '#e0e0e0' }}
                            tickLine={{ stroke: '#e0e0e0' }}
                        />
                    )}
                    <Tooltip
                        formatter={(value: number, name: string) => {
                            if (name === 'Przychód') return [formatCurrency(value), name];
                            return [formatTasks(value), name];
                        }}
                        labelFormatter={(label) => `Miesiąc: ${label}`}
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #f0f0f0',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="tasks"
                        name="Liczba zleceń"
                        stroke="#3498db"
                        yAxisId="left"
                        strokeWidth={3}
                        activeDot={{ r: 6, stroke: '#2980b9', strokeWidth: 1, fill: '#3498db' }}
                        dot={{ r: 4, stroke: '#2980b9', strokeWidth: 1, fill: 'white' }}
                    />
                    {showRevenue && (
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            name="Przychód"
                            stroke="#2ecc71"
                            yAxisId="right"
                            strokeWidth={3}
                            activeDot={{ r: 6, stroke: '#27ae60', strokeWidth: 1, fill: '#2ecc71' }}
                            dot={{ r: 4, stroke: '#27ae60', strokeWidth: 1, fill: 'white' }}
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>

            <ChartSummary>
                <SummaryItem>
                    <SummaryLabel>Najlepszy miesiąc (zlecenia):</SummaryLabel>
                    <SummaryValue>
                        {Math.max(...data.map(item => item.tasks))}
                        <SummaryMonth>
                            {data.find(item => item.tasks === Math.max(...data.map(d => d.tasks)))?.month}
                        </SummaryMonth>
                    </SummaryValue>
                </SummaryItem>

                {showRevenue && (
                    <SummaryItem>
                        <SummaryLabel>Najlepszy miesiąc (przychód):</SummaryLabel>
                        <SummaryValue>
                            {formatCurrency(Math.max(...data.map(item => item.revenue)))}
                            <SummaryMonth>
                                {data.find(item => item.revenue === Math.max(...data.map(d => d.revenue)))?.month}
                            </SummaryMonth>
                        </SummaryValue>
                    </SummaryItem>
                )}
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

export default SeasonalityChart;