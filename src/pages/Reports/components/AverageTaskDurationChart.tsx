import React from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ServiceDurationData {
    name: string;
    duration: number; // Czas trwania w godzinach
    count: number;    // Liczba wykonanych usług
}

interface AverageTaskDurationChartProps {
    data: ServiceDurationData[];
}

const AverageTaskDurationChart: React.FC<AverageTaskDurationChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <EmptyState>Brak danych o czasie trwania usług</EmptyState>;
    }

    // Formatowanie czasu trwania
    const formatDuration = (hours: number) => {
        if (hours < 1) {
            return `${Math.round(hours * 60)} min`;
        }
        if (Number.isInteger(hours)) {
            return `${hours} godz.`;
        }
        const wholeHours = Math.floor(hours);
        const minutes = Math.round((hours - wholeHours) * 60);
        return `${wholeHours} godz. ${minutes} min`;
    };

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
                        tickFormatter={(value) => `${value} godz.`}
                        tick={{ fill: '#7f8c8d', fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                    />
                    <Tooltip
                        formatter={(value: number) => [formatDuration(value), 'Średni czas']}
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #f0f0f0',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        labelFormatter={(name) => `Usługa: ${name}`}
                    />
                    <Legend />
                    <Bar
                        dataKey="duration"
                        name="Średni czas trwania"
                        fill="#9b59b6"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>

            <StatisticsSummary>
                <StatisticsRow>
                    <StatisticItem>
                        <StatisticLabel>Najdłuższa usługa:</StatisticLabel>
                        <StatisticValue>
                            {formatDuration(Math.max(...data.map(item => item.duration)))}
                            <ServiceName>
                                {data.find(item => item.duration === Math.max(...data.map(d => d.duration)))?.name}
                            </ServiceName>
                        </StatisticValue>
                    </StatisticItem>
                    <StatisticItem>
                        <StatisticLabel>Najkrótsza usługa:</StatisticLabel>
                        <StatisticValue>
                            {formatDuration(Math.min(...data.map(item => item.duration)))}
                            <ServiceName>
                                {data.find(item => item.duration === Math.min(...data.map(d => d.duration)))?.name}
                            </ServiceName>
                        </StatisticValue>
                    </StatisticItem>
                    <StatisticItem>
                        <StatisticLabel>Średni czas wszystkich usług:</StatisticLabel>
                        <StatisticValue>
                            {formatDuration(
                                data.reduce((acc, item) => acc + (item.duration * item.count), 0) /
                                data.reduce((acc, item) => acc + item.count, 0)
                            )}
                        </StatisticValue>
                    </StatisticItem>
                </StatisticsRow>
            </StatisticsSummary>
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

const StatisticsSummary = styled.div`
  margin-top: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 15px;
`;

const StatisticsRow = styled.div`
  display: flex;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const StatisticItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 10px;
`;

const StatisticLabel = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 4px;
`;

const StatisticValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
`;

const ServiceName = styled.span`
  font-size: 12px;
  font-weight: normal;
  color: #7f8c8d;
`;

export default AverageTaskDurationChart;