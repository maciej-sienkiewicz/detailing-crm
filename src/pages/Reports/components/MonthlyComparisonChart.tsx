import React from 'react';
import styled from 'styled-components';
import { FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';

interface MonthlyComparisonChartProps {
    currentMonth: number;
    previousMonth: number;
}

const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({
                                                                           currentMonth,
                                                                           previousMonth
                                                                       }) => {
    // Oblicz procent zmiany
    let percentChange = 0;
    let changeType: 'increase' | 'decrease' | 'equal' = 'equal';

    if (previousMonth > 0) {
        percentChange = ((currentMonth - previousMonth) / previousMonth) * 100;

        if (percentChange > 0) {
            changeType = 'increase';
        } else if (percentChange < 0) {
            changeType = 'decrease';
        }
    } else if (currentMonth > 0 && previousMonth === 0) {
        percentChange = 100;
        changeType = 'increase';
    }

    // Wysokość słupków wykresu
    const maxValue = Math.max(currentMonth, previousMonth);
    const prevBarHeight = maxValue > 0 ? (previousMonth / maxValue) * 100 : 0;
    const currBarHeight = maxValue > 0 ? (currentMonth / maxValue) * 100 : 0;

    // Nazwa aktualnego i poprzedniego miesiąca
    const now = new Date();
    const currentMonthName = now.toLocaleDateString('pl-PL', { month: 'long' });

    // Poprzedni miesiąc
    const prevMonth = new Date();
    prevMonth.setMonth(now.getMonth() - 1);
    const previousMonthName = prevMonth.toLocaleDateString('pl-PL', { month: 'long' });

    return (
        <Container>
            <ChartContainer>
                <BarGroup>
                    <BarLabel>{previousMonthName}</BarLabel>
                    <BarWrapper>
                        <Bar height={prevBarHeight} color="#95a5a6">
                            <BarValue>{previousMonth}</BarValue>
                        </Bar>
                    </BarWrapper>
                </BarGroup>

                <BarGroup>
                    <BarLabel>{currentMonthName}</BarLabel>
                    <BarWrapper>
                        <Bar
                            height={currBarHeight}
                            color={changeType === 'increase' ? '#27ae60' :
                                changeType === 'decrease' ? '#e74c3c' : '#3498db'}
                        >
                            <BarValue>{currentMonth}</BarValue>
                        </Bar>
                    </BarWrapper>
                </BarGroup>
            </ChartContainer>

            <ComparisonInfo changeType={changeType}>
                {changeType === 'increase' && (
                    <>
                        <FaArrowUp />
                        <span>{Math.abs(percentChange).toFixed(1)}% więcej niż w poprzednim miesiącu</span>
                    </>
                )}
                {changeType === 'decrease' && (
                    <>
                        <FaArrowDown />
                        <span>{Math.abs(percentChange).toFixed(1)}% mniej niż w poprzednim miesiącu</span>
                    </>
                )}
                {changeType === 'equal' && (
                    <>
                        <FaEquals />
                        <span>Bez zmian w porównaniu do poprzedniego miesiąca</span>
                    </>
                )}
            </ComparisonInfo>
        </Container>
    );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 10px;
`;

const ChartContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 200px;
  gap: 30px;
  margin-bottom: 20px;
`;

const BarGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
`;

const BarLabel = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 10px;
  text-align: center;
  width: 100%;
  text-transform: capitalize;
`;

const BarWrapper = styled.div`
  height: 180px;
  width: 100%;
  display: flex;
  align-items: flex-end;
`;

const Bar = styled.div<{ height: number; color: string }>`
  height: ${props => Math.max(props.height, 1)}%;
  width: 100%;
  background-color: ${props => props.color};
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  transition: height 0.5s;
  position: relative;
`;

const BarValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: white;
  padding: 6px 0;
`;

const ComparisonInfo = styled.div<{ changeType: 'increase' | 'decrease' | 'equal' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 10px;
  color: ${props => {
    if (props.changeType === 'increase') return '#27ae60';
    if (props.changeType === 'decrease') return '#e74c3c';
    return '#7f8c8d';
}};
`;

export default MonthlyComparisonChart;