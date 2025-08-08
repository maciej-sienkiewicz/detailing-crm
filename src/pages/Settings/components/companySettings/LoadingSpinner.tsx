// src/pages/Settings/components/LoadingSpinner.tsx
import React from 'react';
import styled from 'styled-components';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium' }) => {
    return (
        <SpinnerContainer>
            <Spinner $size={size} />
            <LoadingText $size={size}>Ładowanie...</LoadingText>
        </SpinnerContainer>
    );
};

const SpinnerContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
`;

const Spinner = styled.div<{ $size: string }>`
    width: ${props => {
    switch (props.$size) {
        case 'small': return '24px';
        case 'large': return '48px';
        default: return '32px';
    }
}};
    height: ${props => {
    switch (props.$size) {
        case 'small': return '24px';
        case 'large': return '48px';
        default: return '32px';
    }
}};
    border: 3px solid #f1f5f9;
    border-top: 3px solid #1a365d;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div<{ $size: string }>`
    font-size: ${props => {
    switch (props.$size) {
        case 'small': return '12px';
        case 'large': return '18px';
        default: return '14px';
    }
}};
    color: #64748b;
    font-weight: 500;
`;