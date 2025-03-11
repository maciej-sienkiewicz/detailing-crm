import React from 'react';
import styled from 'styled-components';
import { FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';

interface RevenueComparisonWidgetProps {
    currentRevenue: number;
    previousRevenue: number;
}

const RevenueComparisonWidget: React.FC<RevenueComparisonWidgetProps> = ({
                                                                             currentRevenue,
                                                                             previousRevenue
                                                                         }) => {
    // Formatowanie liczb
    const formatCurrency = (value: number) => `${value.toFixed(2)} zł`;

    // Obliczenie procentu zmiany
    let percentChange = 0;
    let changeType: 'increase' | 'decrease' | 'equal' = 'equal';

    if (previousRevenue > 0) {
        percentChange = ((currentRevenue - previousRevenue) / previousRevenue) * 100;

        if (percentChange > 0) {
            changeType = 'increase';
        } else if (percentChange < 0) {
            changeType = 'decrease';
        }
    } else if (currentRevenue > 0 && previousRevenue === 0) {
        percentChange = 100;
        changeType = 'increase';
    }

    // Nazwa aktualnego i poprzedniego miesiąca
    const now = new Date();
    const currentMonthName = now.toLocaleDateString('pl-PL', { month: 'long' });

    const prevMonth = new Date();
    prevMonth.setMonth(now.getMonth() - 1);
    const previousMonthName = prevMonth.toLocaleDateString('pl-PL', { month: 'long' });

    return (
        <Container>
            <ComparisonCards>
                <RevenueCard>
                    <CardLabel>{previousMonthName}</CardLabel>
                    <CardValue>{formatCurrency(previousRevenue)}</CardValue>
                </RevenueCard>

                <ComparisonIndicator changeType={changeType}>
                    {changeType === 'increase' && <FaArrowUp />}
                    {changeType === 'decrease' && <FaArrowDown />}
                    {changeType === 'equal' && <FaEquals />}
                    <PercentValue>
                        {Math.abs(percentChange).toFixed(1)}%
                    </PercentValue>
                </ComparisonIndicator>

                <RevenueCard current>
                    <CardLabel>{currentMonthName}</CardLabel>
                    <CardValue>{formatCurrency(currentRevenue)}</CardValue>
                </RevenueCard>
            </ComparisonCards>

            <ComparisonText changeType={changeType}>
                {changeType === 'increase' && `Wzrost przychodów o ${Math.abs(percentChange).toFixed(1)}% w porównaniu z poprzednim miesiącem`}
                {changeType === 'decrease' && `Spadek przychodów o ${Math.abs(percentChange).toFixed(1)}% w porównaniu z poprzednim miesiącem`}
                {changeType === 'equal' && 'Przychody na tym samym poziomie co w poprzednim miesiącu'}
            </ComparisonText>

            {/* Wizualizacja różnicy */}
            <DifferenceBar>
                <DifferenceAmount>
                    Różnica: {formatCurrency(currentRevenue - previousRevenue)}
                </DifferenceAmount>
                <BarContainer>
                    <Bar
                        width={100}
                        color={changeType === 'increase' ? '#27ae60' :
                            changeType === 'decrease' ? '#e74c3c' : '#3498db'}
                    />
                </BarContainer>
            </DifferenceBar>
        </Container>
    );
};

const Container = styled.div`
  width: 100%;
  padding: 10px;
`;

const ComparisonCards = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const RevenueCard = styled.div<{ current?: boolean }>`
  background-color: ${props => props.current ? '#f0f7ff' : '#f9f9f9'};
  border: 1px solid ${props => props.current ? '#d5e9f9' : '#eee'};
  border-radius: 8px;
  padding: 15px;
  width: 140px;
  text-align: center;
  box-shadow: ${props => props.current ? '0 2px 8px rgba(52, 152, 219, 0.1)' : 'none'};
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

const CardLabel = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 8px;
  text-transform: capitalize;
`;

const CardValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
`;

const ComparisonIndicator = styled.div<{ changeType: 'increase' | 'decrease' | 'equal' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${props => {
    if (props.changeType === 'increase') return '#27ae60';
    if (props.changeType === 'decrease') return '#e74c3c';
    return '#7f8c8d';
}};
  font-size: 20px;
`;

const PercentValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-top: 4px;
`;

const ComparisonText = styled.div<{ changeType: 'increase' | 'decrease' | 'equal' }>`
  text-align: center;
  font-size: 14px;
  color: ${props => {
    if (props.changeType === 'increase') return '#27ae60';
    if (props.changeType === 'decrease') return '#e74c3c';
    return '#7f8c8d';
}};
  margin-bottom: 20px;
`;

const DifferenceBar = styled.div`
  margin-top: 20px;
`;

const DifferenceAmount = styled.div`
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 8px;
  color: #2c3e50;
`;

const BarContainer = styled.div`
  background-color: #f0f0f0;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
`;

const Bar = styled.div<{ width: number; color: string }>`
  width: ${props => props.width}%;
  height: 100%;
  background-color: ${props => props.color};
  border-radius: 4px;
  transition: width 0.5s;
`;

export default RevenueComparisonWidget;