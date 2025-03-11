import React from 'react';
import styled from 'styled-components';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaStar, FaSmile, FaMeh, FaFrown } from 'react-icons/fa';

interface SatisfactionData {
    name: string;
    value: number;
    color: string;
    icon: React.ReactNode;
}

interface CustomerSatisfactionChartProps {
    data: SatisfactionData[];
    averageRating: number;
    totalReviews: number;
}

const CustomerSatisfactionChart: React.FC<CustomerSatisfactionChartProps> = ({
                                                                                 data,
                                                                                 averageRating,
                                                                                 totalReviews
                                                                             }) => {
    if (!data || data.length === 0) {
        return <EmptyState>Brak danych o satysfakcji klientów</EmptyState>;
    }

    // Generowanie gwiazdek dla średniej oceny
    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating - fullStars >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<StarIcon key={i} $filled />);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<StarIcon key={i} $halfFilled />);
            } else {
                stars.push(<StarIcon key={i} />);
            }
        }

        return stars;
    };

    return (
        <Container>
            <ChartSection>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            label={(entry) => `${entry.value}%`}
                            labelLine={false}
                        >
                            {data.map((entry, index) => (
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
                        <Legend
                            formatter={(value, entry, index) => (
                                <LegendItem>
                                    {data[index].icon}
                                    <span>{value}</span>
                                </LegendItem>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </ChartSection>

            <StatsSection>
                <RatingContainer>
                    <RatingLabel>Średnia ocena klientów</RatingLabel>
                    <RatingValue>{averageRating.toFixed(1)}</RatingValue>
                    <StarsContainer>
                        {renderStars(averageRating)}
                    </StarsContainer>
                    <ReviewsCount>Liczba ocen: {totalReviews}</ReviewsCount>
                </RatingContainer>

                <SatisfactionBreakdown>
                    {data.map((item, index) => (
                        <BreakdownItem key={index}>
                            <BreakdownIcon style={{ color: item.color }}>
                                {item.icon}
                            </BreakdownIcon>
                            <BreakdownInfo>
                                <BreakdownName>{item.name}</BreakdownName>
                                <BreakdownValue>{item.value}%</BreakdownValue>
                            </BreakdownInfo>
                        </BreakdownItem>
                    ))}
                </SatisfactionBreakdown>
            </StatsSection>
        </Container>
    );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
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

const ChartSection = styled.div`
  height: 200px;
  margin-bottom: 20px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  
  svg {
    font-size: 16px;
  }
`;

const StatsSection = styled.div`
  display: flex;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const RatingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  width: 48%;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const RatingLabel = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 10px;
`;

const RatingValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
`;

const StarsContainer = styled.div`
  display: flex;
  margin: 10px 0;
  gap: 5px;
`;

const StarIcon = styled(FaStar)<{ $filled?: boolean; $halfFilled?: boolean }>`
  color: ${props => props.$filled ? '#f39c12' : props.$halfFilled ? '#f39c12' : '#ecf0f1'};
  font-size: 20px;
`;

const ReviewsCount = styled.div`
  font-size: 12px;
  color: #7f8c8d;
`;

const SatisfactionBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  width: 48%;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const BreakdownItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BreakdownIcon = styled.div`
  font-size: 24px;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BreakdownInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
`;

const BreakdownName = styled.div`
  font-size: 14px;
  color: #2c3e50;
`;

const BreakdownValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
`;

export default CustomerSatisfactionChart;