import React from 'react';
import styled from 'styled-components';
import { FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';

interface KPICardProps {
    title: string;
    value: string | number;
    prevValue?: string | number;
    icon: React.ReactNode;
    color: string;
    isCurrency?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
                                             title,
                                             value,
                                             prevValue,
                                             icon,
                                             color,
                                             isCurrency
                                         }) => {
    // Oblicz procent zmiany jeśli podano wartość poprzednią
    let percentChange: number | null = null;
    let changeDirection: 'up' | 'down' | 'equal' = 'equal';

    if (prevValue !== undefined && prevValue !== null) {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        const numPrevValue = typeof prevValue === 'string' ? parseFloat(prevValue) : prevValue;

        // Jeśli to waluta, usuwamy 'zł' z wartości
        const cleanValue = typeof numValue === 'string' ?
            parseFloat(numValue.toString().replace(' zł', '')) : numValue;
        const cleanPrevValue = typeof numPrevValue === 'string' ?
            parseFloat(numPrevValue.toString().replace(' zł', '')) : numPrevValue;

        if (cleanPrevValue !== 0) {
            percentChange = ((cleanValue - cleanPrevValue) / cleanPrevValue) * 100;

            if (percentChange > 0) {
                changeDirection = 'up';
            } else if (percentChange < 0) {
                changeDirection = 'down';
            } else {
                changeDirection = 'equal';
            }
        }
    }

    return (
        <CardContainer>
            <IconContainer color={color}>
                {icon}
            </IconContainer>
            <CardContent>
                <CardTitle>{title}</CardTitle>
                <CardValue>{value}</CardValue>

                {percentChange !== null && (
                    <ChangeIndicator direction={changeDirection}>
                        {changeDirection === 'up' && <FaArrowUp />}
                        {changeDirection === 'down' && <FaArrowDown />}
                        {changeDirection === 'equal' && <FaEquals />}
                        <span>{Math.abs(percentChange).toFixed(1)}% {changeDirection === 'up' ? 'więcej' : changeDirection === 'down' ? 'mniej' : ''}</span>
                    </ChangeIndicator>
                )}
            </CardContent>
        </CardContainer>
    );
};

const CardContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const IconContainer = styled.div<{ color: string }>`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background-color: ${props => `${props.color}15`}; /* Kolor z przezroczystością */
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
  flex-shrink: 0;
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardTitle = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 8px;
`;

const CardValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 6px;
`;

const ChangeIndicator = styled.div<{ direction: 'up' | 'down' | 'equal' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: ${props => {
    if (props.direction === 'up') return '#27ae60';
    if (props.direction === 'down') return '#e74c3c';
    return '#7f8c8d';
}};
`;

export default KPICard;