// src/components/common/OptimizedLogoDisplay.tsx
import React from 'react';
import styled from 'styled-components';
import { useLogoCache } from '../../context/LogoCacheContext';

interface OptimizedLogoDisplayProps {
    alt?: string;
    maxWidth?: string;
    maxHeight?: string;
    className?: string;
    showFallback?: boolean;
    fallbackText?: string;
    fallbackIcon?: React.ReactNode;
    hideOnError?: boolean; // Nowa prop - ukryj komponent przy błędzie
    hideOnEmpty?: boolean; // Nowa prop - ukryj komponent gdy nie ma logo
}

const OptimizedLogoDisplay: React.FC<OptimizedLogoDisplayProps> = ({
                                                                       alt = "Logo firmy",
                                                                       maxWidth = "200px",
                                                                       maxHeight = "100px",
                                                                       className,
                                                                       showFallback = true,
                                                                       fallbackText = "Brak logo",
                                                                       fallbackIcon = "📷",
                                                                       hideOnError = false,
                                                                       hideOnEmpty = false
                                                                   }) => {
    const { logoUrl, loading, error } = useLogoCache();

    // Loading state
    if (loading) {
        return (
            <LoadingContainer className={className}>
                <Spinner />
                <LoadingText>Ładowanie logo...</LoadingText>
            </LoadingContainer>
        );
    }

    // Error state
    if (error) {
        if (hideOnError) {
            return null;
        }
        return (
            <ErrorContainer className={className}>
                <ErrorIcon>⚠️</ErrorIcon>
                <ErrorTitle>Błąd ładowania logo</ErrorTitle>
                <ErrorText>{error}</ErrorText>
            </ErrorContainer>
        );
    }

    // Success state - show logo
    if (logoUrl) {
        return (
            <ImageContainer className={className}>
                <StyledImage
                    src={logoUrl}
                    alt={alt}
                    $maxWidth={maxWidth}
                    $maxHeight={maxHeight}
                    onError={(e) => {
                        console.error('Logo display error:', e);
                    }}
                />
            </ImageContainer>
        );
    }

    // No logo state
    if (hideOnEmpty) {
        return null;
    }

    if (showFallback) {
        return (
            <NoLogoContainer className={className}>
                <NoLogoIcon>{fallbackIcon}</NoLogoIcon>
                <NoLogoText>{fallbackText}</NoLogoText>
            </NoLogoContainer>
        );
    }

    return null;
};

// Styled Components
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    min-height: 80px;
    background: #f8fafc;
    border-radius: 8px;
    border: 2px dashed #cbd5e1;
    gap: 8px;
`;

const Spinner = styled.div`
    width: 24px;
    height: 24px;
    border: 2px solid #e2e8f0;
    border-top: 2px solid #1a365d;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    color: #64748b;
    font-size: 12px;
    font-weight: 500;
`;

const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: #fef2f2;
    border-radius: 8px;
    border: 2px solid #fecaca;
    min-height: 80px;
    text-align: center;
    gap: 4px;
`;

const ErrorIcon = styled.div`
    font-size: 24px;
`;

const ErrorTitle = styled.div`
    color: #dc2626;
    font-size: 12px;
    font-weight: 600;
`;

const ErrorText = styled.div`
    color: #dc2626;
    font-size: 10px;
    margin: 2px 0;
`;

const NoLogoContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: #f1f5f9;
    border-radius: 8px;
    border: 2px dashed #cbd5e1;
    min-height: 80px;
    gap: 4px;
`;

const NoLogoIcon = styled.div`
    font-size: 24px;
    opacity: 0.5;
`;

const NoLogoText = styled.div`
    color: #64748b;
    font-size: 12px;
    font-weight: 500;
`;

const ImageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StyledImage = styled.img<{ $maxWidth: string; $maxHeight: string }>`
    max-width: ${props => props.$maxWidth};
    max-height: ${props => props.$maxHeight};
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 4px;
    display: block;
`;

export default OptimizedLogoDisplay;