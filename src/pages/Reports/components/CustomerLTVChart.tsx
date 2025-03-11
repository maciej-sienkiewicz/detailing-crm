import React from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaUsers, FaUserCheck, FaUserClock } from 'react-icons/fa';

interface CustomerValueData {
    visits: number | string;
    averageValue: number;
}

interface LoyaltyData {
    newClients: number;
    returningClients: number;
    loyalClients: number;
}

interface CustomerLTVChartProps {
    customerValueData: CustomerValueData[];
    loyaltyData: LoyaltyData;
    repeatRate: number;
    averageVisitsPerClient: number;
}

const CustomerLTVChart: React.FC<CustomerLTVChartProps> = ({
                                                               customerValueData,
                                                               loyaltyData,
                                                               repeatRate,
                                                               averageVisitsPerClient
                                                           }) => {
    // Formatowanie wartości pieniężnych
    const formatCurrency = (value: number) => `${value.toFixed(2)} zł`;

    // Przygotowanie danych do wykresu kołowego lojalności
    const loyaltyChartData = [
        { name: 'Nowi klienci', value: loyaltyData.newClients, color: '#3498db' },
        { name: 'Powracający klienci', value: loyaltyData.returningClients, color: '#2ecc71' },
        { name: 'Lojalni klienci', value: loyaltyData.loyalClients, color: '#f39c12' }
    ];

    return (
        <Container>
            <SectionTitle>Wartość klienta w czasie</SectionTitle>

            <ChartsContainer>
                <ChartWrapper>
                    <ChartHeader>Średnia wartość klienta wg liczby wizyt</ChartHeader>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                            data={customerValueData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="visits"
                                tick={{ fill: '#7f8c8d', fontSize: 12 }}
                                axisLine={{ stroke: '#e0e0e0' }}
                                tickLine={{ stroke: '#e0e0e0' }}
                            />
                            <YAxis
                                tickFormatter={formatCurrency}
                                tick={{ fill: '#7f8c8d', fontSize: 12 }}
                                axisLine={{ stroke: '#e0e0e0' }}
                                tickLine={{ stroke: '#e0e0e0' }}
                            />
                            <Tooltip
                                formatter={(value: number) => [formatCurrency(value), 'Średnia wartość']}
                                labelFormatter={(label) => `Liczba wizyt: ${label}`}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #f0f0f0',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Bar
                                dataKey="averageValue"
                                name="Średnia wartość klienta"
                                fill="#3498db"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartWrapper>

                <ChartWrapper>
                    <ChartHeader>Struktura klientów</ChartHeader>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={loyaltyChartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                            >
                                {loyaltyChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => [`${value}%`, 'Udział']}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #f0f0f0',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartWrapper>
            </ChartsContainer>

            <StatsContainer>
                <StatCard icon={<FaUsers />} color="#3498db">
                    <StatTitle>Wskaźnik powrotu klientów</StatTitle>
                    <StatValue>{repeatRate}%</StatValue>
                    <StatDescription>klientów wraca na kolejną wizytę</StatDescription>
                </StatCard>

                <StatCard icon={<FaUserCheck />} color="#2ecc71">
                    <StatTitle>Średnia liczba wizyt</StatTitle>
                    <StatValue>{averageVisitsPerClient}</StatValue>
                    <StatDescription>wizyt na jednego klienta</StatDescription>
                </StatCard>

                <StatCard icon={<FaUserClock />} color="#f39c12">
                    <StatTitle>Przyrost wartości klienta</StatTitle>
                    <StatValue>
                        {customerValueData.length > 1 ?
                            `${(((customerValueData[customerValueData.length-1].averageValue / customerValueData[0].averageValue) - 1) * 100).toFixed(0)}%` :
                            'N/A'
                        }
                    </StatValue>
                    <StatDescription>od pierwszej do ostatniej wizyty</StatDescription>
                </StatCard>
            </StatsContainer>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 20px 0;
`;

const ChartsContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const ChartWrapper = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 15px;
    height: 100%;
`;

const ChartHeader = styled.h4`
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 15px 0;
    text-align: center;
`;

const StatsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

// Definiujemy Prop interface dla StatCard
interface StatCardProps {
    color: string;
    icon?: React.ReactNode;
}

// Tworzymy komponent funkcyjny zamiast styled-component
const StatCard: React.FC<StatCardProps & React.HTMLAttributes<HTMLDivElement>> = ({
                                                                                      color,
                                                                                      icon,
                                                                                      children,
                                                                                      ...rest
                                                                                  }) => {
    return (
        <StatCardContainer color={color} {...rest}>
            {icon && <IconWrapper color={color}>{icon}</IconWrapper>}
            {children}
        </StatCardContainer>
    );
};

// Style przeniesione do kontenera
const StatCardContainer = styled.div<{ color: string }>`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 5px;
        height: 100%;
        background-color: ${props => props.color};
    }
`;

// Dodatkowy komponent dla ikony
const IconWrapper = styled.div<{ color: string }>`
    color: ${props => props.color};
    font-size: 24px;
    margin-bottom: 10px;
`;

const StatTitle = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-bottom: 5px;
`;

const StatValue = styled.div`
    font-size: 24px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 5px;
`;

const StatDescription = styled.div`
    font-size: 12px;
    color: #7f8c8d;
`;

export default CustomerLTVChart;