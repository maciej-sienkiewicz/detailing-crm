// src/components/common/OptimizedLogoDisplay.tsx - BEZPIECZNA WERSJA z debugowaniem
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {usePersistentLogoCache} from '../../context/PersistentLogoCacheContext';

interface OptimizedLogoDisplayProps {
    alt?: string;
    maxWidth?: string;
    maxHeight?: string;
    className?: string;
    showFallback?: boolean;
    fallbackText?: string;
    fallbackIcon?: React.ReactNode;
    hideOnError?: boolean;
    hideOnEmpty?: boolean;
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
    const { logoUrl, loading, error } = usePersistentLogoCache();
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Debug info
    useEffect(() => {
        console.log('🖼️ OptimizedLogoDisplay render:', {
            logoUrl: logoUrl ? `${logoUrl.substring(0, 50)}...` : null,
            loading,
            error,
            imageError,
            imageLoaded
        });
    }, [logoUrl, loading, error, imageError, imageLoaded]);

    // Reset image states when logoUrl changes
    useEffect(() => {
        setImageError(false);
        setImageLoaded(false);
    }, [logoUrl]);

    const handleImageLoad = () => {
        console.log('✅ Image loaded successfully');
        setImageLoaded(true);
        setImageError(false);
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        console.error('❌ Image failed to load:', e);
        setImageError(true);
        setImageLoaded(false);
    };

    // Loading state
    if (loading) {
        return (
            <LoadingContainer className={className}>
                <Spinner />
                <LoadingText>Ładowanie logo...</LoadingText>
            </LoadingContainer>
        );
    }

    // Context error state
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

    // Image error state
    if (logoUrl && imageError) {
        if (hideOnError) {
            return null;
        }
        return (
            <ErrorContainer className={className}>
                <ErrorIcon>⚠️</ErrorIcon>
                <ErrorTitle>Błąd wyświetlania logo</ErrorTitle>
                <ErrorText>Nieprawidłowy format obrazu</ErrorText>
            </ErrorContainer>
        );
    }

    // Success state - show logo
    if (logoUrl && !imageError) {
        return (
            <ImageContainer className={className}>
                {!imageLoaded && (
                    <ImageLoadingOverlay>
                        <Spinner />
                    </ImageLoadingOverlay>
                )}
                <StyledImage
                    src={logoUrl}
                    alt={alt}
                    $maxWidth={maxWidth}
                    $maxHeight={maxHeight}
                    $loaded={imageLoaded}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
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
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const ImageLoadingOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(248, 250, 252, 0.8);
    z-index: 1;
`;

const StyledImage = styled.img<{
    $maxWidth: string;
    $maxHeight: string;
    $loaded: boolean;
}>`
    max-width: ${props => props.$maxWidth};
    max-height: ${props => props.$maxHeight};
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 4px;
    display: block;
    opacity: ${props => props.$loaded ? 1 : 0};
    transition: opacity 0.3s ease;
    
    /* Zapobieganie czarnemu prostokątowi */
    background: transparent;
    background-color: transparent;
`;

export default OptimizedLogoDisplay;