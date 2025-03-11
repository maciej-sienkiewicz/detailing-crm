import React from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EmployeeData {
    name: string;
    completedTasks: number;
    revenue: number;
    color: string;
}

interface EmployeeProductivityChartProps {
    data: EmployeeData[];
    metricType: 'tasks' | 'revenue';
}

const EmployeeProductivityChart: React.FC<EmployeeProductivityChartProps> = ({
                                                                                 data,
                                                                                 metricType
                                                                             }) => {
    if (!data || data.length === 0) {
        return <EmptyState>Brak danych o wydajności pracowników</EmptyState>;
    }

    // Formatowanie liczb w tooltipie i na osi Y
    const formatValue = (value: number) => {
        if (metricType === 'revenue') {
            return `${value.toFixed(2)} zł`;
        }
        return value.toString();
    };

    // Określenie, które dane mają być wyświetlane
    const dataKey = metricType === 'revenue' ? 'revenue' : 'completedTasks';
    const label = metricType === 'revenue' ? 'Przychód' : 'Ukończone zlecenia';

    return (
        <ChartContainer>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="name"
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
                        formatter={(value: number) => [formatValue(value), label]}
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #f0f0f0',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    />
                    <Legend />
                    <Bar
                        dataKey={dataKey}
                        name={label}
                        fill="#3498db"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>

            <ChartSummary>
                <SummaryItem>
                    <SummaryLabel>Najwyższa wartość:</SummaryLabel>
                    <SummaryValue>
                        {formatValue(Math.max(...data.map(item => item[dataKey])))}
                        <SummaryName>
                            {data.find(item => item[dataKey] === Math.max(...data.map(d => d[dataKey])))?.name}
                        </SummaryName>
                    </SummaryValue>
                </SummaryItem>
                <SummaryItem>
                    <SummaryLabel>Średnia wartość:</SummaryLabel>
                    <SummaryValue>
                        {formatValue(data.reduce((acc, item) => acc + item[dataKey], 0) / data.length)}
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

const SummaryName = styled.span`
  font-size: 12px;
  font-weight: normal;
  color: #7f8c8d;
  margin-left: 5px;
`;

export default EmployeeProductivityChart;