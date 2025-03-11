import React from 'react';
import styled from 'styled-components';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StatusDistribution {
    name: string;
    value: number;
    color: string;
}

interface TasksStatusPieChartProps {
    data: StatusDistribution[];
}

const TasksStatusPieChart: React.FC<TasksStatusPieChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <EmptyState>Brak danych o statusach zadań</EmptyState>;
    }

    const totalTasks = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <Container>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => [`${value} (${((value / totalTasks) * 100).toFixed(1)}%)`, 'Liczba zadań']}
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #f0f0f0',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    />
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        formatter={(value, entry, index) => {
                            const { color } = data[index];
                            return <LegendItem color={color}>{value}</LegendItem>;
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>

            <SummaryText>
                Łączna liczba zadań: <strong>{totalTasks}</strong>
            </SummaryText>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
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

const LegendItem = styled.span<{ color: string }>`
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #2c3e50;
    
    &::before {
        content: '';
        display: inline-block;
        width: 10px;
        height: 10px;
        margin-right: 5px;
        background-color: ${props => props.color};
        border-radius: 50%;
    }
`;

const SummaryText = styled.div`
    font-size: 14px;
    color: #7f8c8d;
    margin-top: 10px;
`;

export default TasksStatusPieChart;