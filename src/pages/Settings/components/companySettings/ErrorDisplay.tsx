// src/pages/Settings/components/ErrorDisplay.tsx
import React from 'react';
import styled from 'styled-components';

interface ErrorDisplayProps {
    error: string;
    onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
    return (
        <ErrorContainer>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorText>{error}</ErrorText>
            {onRetry && (
                <RetryButton onClick={onRetry}>
                    Spróbuj ponownie
                </RetryButton>
            )}
        </ErrorContainer>
    );
};

const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    gap: 16px;
    min-height: 400px;
`;

const ErrorIcon = styled.div`
    font-size: 48px;
    color: #dc2626;
`;

const ErrorText = styled.div`
    font-size: 16px;
    color: #475569;
    font-weight: 500;
    text-align: center;
    max-width: 400px;
`;

const RetryButton = styled.button`
    padding: 8px 16px;
    background: #1a365d;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #0f2027;
        transform: translateY(-1px);
    }
`;