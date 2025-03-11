import React from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaCar } from 'react-icons/fa';

interface VehicleMake {
    make: string;
    count: number;
    totalSpent: number;
    averageSpent: number;
    models: VehicleModel[];
}

interface VehicleModel {
    model: string;
    count: number;
    totalSpent: number;
    averageSpent: number;
}

interface YearRange {
    range: string;
    count: number;
    totalSpent: number;
    averageSpent: number;
}

interface VehicleStatsProps {
    topMakes: VehicleMake[];
    yearRanges: YearRange[];
    totalVehicles: number;
    totalRevenue: number;
    averageRevenuePerVehicle: number;
}

const VehicleStatsChart: React.FC<VehicleStatsProps> = ({
                                                            topMakes,
                                                            yearRanges,
                                                            totalVehicles,
                                                            totalRevenue,
                                                            averageRevenuePerVehicle
                                                        }) => {
    // Formatowanie wartości pieniężnych
    const formatCurrency = (value: number) => `${value.toFixed(2)} zł`;

    // Przygotowanie danych do wykresu popularności marek
    const makesChartData = topMakes.map((make, index) => ({
        name: make.make,
        value: make.count,
        color: getColorByIndex(index)
    }));

    // Przygotowanie danych do wykresu rozkładu roczników
    const yearChartData = [...yearRanges].sort((a, b) => {
        const aStart = parseInt(a.range.split('-')[0]);
        const bStart = parseInt(b.range.split('-')[0]);
        return aStart - bStart;
    });

    // Funkcja pomocnicza do generowania kolorów
    function getColorByIndex(index: number): string {
        const colors = ['#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e74c3c', '#1abc9c', '#34495e', '#d35400'];
        return colors[index % colors.length];
    }

    return (
        <Container>
            <SummarySection>
                <SummaryTitle>Podsumowanie floty pojazdów</SummaryTitle>
                <SummaryStats>
                    <StatItem>
                        <StatLabel>Liczba pojazdów</StatLabel>
                        <StatValue>{totalVehicles}</StatValue>
                    </StatItem>
                    <StatItem>
                        <StatLabel>Łączny przychód</StatLabel>
                        <StatValue>{formatCurrency(totalRevenue)}</StatValue>
                    </StatItem>
                    <StatItem>
                        <StatLabel>Średni przychód na pojazd</StatLabel>
                        <StatValue>{formatCurrency(averageRevenuePerVehicle)}</StatValue>
                    </StatItem>
                </SummaryStats>
            </SummarySection>

            <ChartsSection>
                <ChartContainer>
                    <ChartTitle>Najpopularniejsze marki pojazdów</ChartTitle>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={makesChartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                                nameKey="name"
                                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                            >
                                {makesChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => [value, 'Liczba pojazdów']}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #f0f0f0',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer>
                    <ChartTitle>Rozkład pojazdów według roczników</ChartTitle>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={yearChartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="range"
                                tick={{ fill: '#7f8c8d', fontSize: 12 }}
                                axisLine={{ stroke: '#e0e0e0' }}
                                tickLine={{ stroke: '#e0e0e0' }}
                            />
                            <YAxis
                                tick={{ fill: '#7f8c8d', fontSize: 12 }}
                                axisLine={{ stroke: '#e0e0e0' }}
                                tickLine={{ stroke: '#e0e0e0' }}
                            />
                            <Tooltip
                                formatter={(value: number) => [value, 'Liczba pojazdów']}
                                labelFormatter={(label) => `Roczniki: ${label}`}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #f0f0f0',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Bar
                                dataKey="count"
                                name="Liczba pojazdów"
                                fill="#3498db"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </ChartsSection>

            <MakeDetailsSection>
                <SectionTitle>Szczegóły najpopularniejszych marek</SectionTitle>
                <MakeDetailsList>
                    {topMakes.slice(0, 3).map((make, index) => (
                        <MakeDetailCard key={index}>
                            <MakeHeader color={getColorByIndex(index)}>
                                <MakeName>{make.make}</MakeName>
                                <MakeCount>{make.count} pojazdów</MakeCount>
                            </MakeHeader>
                            <MakeContent>
                                <MakeStatRow>
                                    <MakeStatLabel>Łączny przychód:</MakeStatLabel>
                                    <MakeStatValue>{formatCurrency(make.totalSpent)}</MakeStatValue>
                                </MakeStatRow>
                                <MakeStatRow>
                                    <MakeStatLabel>Średnio na pojazd:</MakeStatLabel>
                                    <MakeStatValue>{formatCurrency(make.averageSpent)}</MakeStatValue>
                                </MakeStatRow>
                                <ModelsList>
                                    <ModelsTitle>Najpopularniejsze modele:</ModelsTitle>
                                    {make.models.slice(0, 3).map((model, modelIndex) => (
                                        <ModelItem key={modelIndex}>
                                            <ModelName>{model.model}</ModelName>
                                            <ModelCount>{model.count} szt.</ModelCount>
                                        </ModelItem>
                                    ))}
                                </ModelsList>
                            </MakeContent>
                        </MakeDetailCard>
                    ))}
                </MakeDetailsList>
            </MakeDetailsSection>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
`;

const SummarySection = styled.div`
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
`;

const SummaryTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 15px 0;
    display: flex;
    align-items: center;
    gap: 10px;
    
    &::before {
        content: '🚗';
        font-size: 20px;
    }
`;

const SummaryStats = styled.div`
    display: flex;
    justify-content: space-between;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 15px;
    }
`;

const StatItem = styled.div`
    flex: 1;
    text-align: center;
    padding: 0 10px;
    
    &:not(:last-child) {
        border-right: 1px solid #eee;
    }
    
    @media (max-width: 768px) {
        padding: 10px;
        border-bottom: 1px solid #eee;
        
        &:not(:last-child) {
            border-right: none;
        }
    }
`;

const StatLabel = styled.div`
    font-size: 14px;
    color: #7f8c8d;
    margin-bottom: 5px;
`;

const StatValue = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: #2c3e50;
`;

const ChartsSection = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
    
    @media (max-width: 992px) {
        grid-template-columns: 1fr;
    }
`;

const ChartContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 20px;
`;

const ChartTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 15px 0;
    text-align: center;
`;

const MakeDetailsSection = styled.div`
    margin-top: 30px;
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 15px 0;
`;

const MakeDetailsList = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    
    @media (max-width: 992px) {
        grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: 576px) {
        grid-template-columns: 1fr;
    }
`;

const MakeDetailCard = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const MakeHeader = styled.div<{ color: string }>`
    background-color: ${props => props.color};
    color: white;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const MakeName = styled.div`
    font-size: 18px;
    font-weight: 600;
`;

const MakeCount = styled.div`
    font-size: 14px;
    background-color: rgba(255, 255, 255, 0.2);
    padding: 4px 8px;
    border-radius: 4px;
`;

const MakeContent = styled.div`
    padding: 15px;
`;

const MakeStatRow = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
`;

const MakeStatLabel = styled.div`
    font-size: 14px;
    color: #7f8c8d;
`;

const MakeStatValue = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
`;

const ModelsList = styled.div`
    margin-top: 15px;
    border-top: 1px solid #eee;
    padding-top: 15px;
`;

const ModelsTitle = styled.div`
    font-size: 14px;
    color: #7f8c8d;
    margin-bottom: 10px;
`;

const ModelItem = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    
    &:not(:last-child) {
        border-bottom: 1px dashed #eee;
    }
`;

const ModelName = styled.div`
    font-size: 14px;
    color: #2c3e50;
`;

const ModelCount = styled.div`
    font-size: 14px;
    color: #7f8c8d;
`;

export default VehicleStatsChart;