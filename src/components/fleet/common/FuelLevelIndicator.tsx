// src/components/fleet/common/FuelLevelIndicator.tsx

import React from 'react';
import styled from 'styled-components';
import {FaGasPump} from 'react-icons/fa';

interface FuelLevelIndicatorProps {
    level: number; // 0-1 (procent)
    size?: 'small' | 'medium' | 'large';
    showText?: boolean;
}

const FuelLevelIndicator: React.FC<FuelLevelIndicatorProps> = ({
                                                                   level,
                                                                   size = 'medium',
                                                                   showText = true
                                                               }) => {
    // Zapewnienie, że poziom jest między 0 a 1
    const normalizedLevel = Math.max(0, Math.min(1, level));

    // Określenie koloru na podstawie poziomu paliwa
    const getColor = () => {
        if (normalizedLevel <= 0.25) return '#e74c3c'; // czerwony
        if (normalizedLevel <= 0.5) return '#f39c12';  // pomarańczowy
        return '#2ecc71'; // zielony
    };

    return (
        <Container size={size}>
            <IconWrapper>
                <FaGasPump />
            </IconWrapper>
            <BarContainer>
                <FilledBar level={normalizedLevel} color={getColor()} />
            </BarContainer>
            {showText && (
                <Percentage>
                    {Math.round(normalizedLevel * 100)}%
                </Percentage>
            )}
        </Container>
    );
};

const Container = styled.div<{ size: string }>`
    display: flex;
    align-items: center;
    gap: ${props => props.size === 'small' ? '4px' : props.size === 'large' ? '10px' : '8px'};
`;

const IconWrapper = styled.div`
    color: #7f8c8d;
    font-size: 14px;
`;

const BarContainer = styled.div`
    height: 8px;
    width: 60px;
    background-color: #f1f1f1;
    border-radius: 4px;
    overflow: hidden;
`;

const FilledBar = styled.div<{ level: number; color: string }>`
    height: 100%;
    width: ${props => `${props.level * 100}%`};
    background-color: ${props => props.color};
    border-radius: 4px;
    transition: width 0.3s ease;
`;

const Percentage = styled.span`
    font-size: 12px;
    color: #7f8c8d;
    min-width: 32px;
`;

export default FuelLevelIndicator;