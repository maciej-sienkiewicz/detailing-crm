// src/components/common/StableLogo.tsx - Naprawiona wersja bez infinite loop
import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';

interface StableLogoProps {
    logoSettings?: {
        hasLogo: boolean;
        logoFileName?: string;
        logoContentType?: string;
        logoSize?: number;
        logoUrl?: string;
        logoFileId?: string;
    };
    alt?: string;
    maxWidth?: string;
    maxHeight?: string;
    className?: string;
}

const StableLogo: React.FC<StableLogoProps> = ({
                                                   logoSettings,
                                                   alt = "Logo firmy",
                                                   maxWidth = "200px",
                                                   maxHeight = "100px",
                                                   className
                                               }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use ref to track current blob URL for cleanup
    const currentBlobRef = useRef<string | null>(null);

    // Use ref to prevent multiple simultaneous requests
    const loadingRef = useRef<boolean>(false);

    useEffect(() => {
        const loadLogo = async () => {
            console.log('🔍 Loading logo with settings:', logoSettings);

            // Prevent multiple simultaneous loads
            if (loadingRef.current) {
                console.log('⏸️ Already loading, skipping...');
                return;
            }

            // Check if logo exists
            if (!logoSettings?.hasLogo) {
                console.log('❌ No logo to load (hasLogo: false)');
                // Clean up previous image if any
                if (currentBlobRef.current) {
                    URL.revokeObjectURL(currentBlobRef.current);
                    currentBlobRef.current = null;
                }
                setImageSrc(null);
                setError(null);
                return;
            }

            // Extract logoFileId from logoUrl if logoFileId is missing
            let logoFileId = logoSettings.logoFileId;

            if (!logoFileId && logoSettings.logoUrl) {
                const match = logoSettings.logoUrl.match(/\/logo\/([^?]+)/);
                if (match) {
                    logoFileId = match[1];
                    console.log('✅ Extracted logoFileId from URL:', logoFileId);
                }
            }

            if (!logoFileId) {
                console.log('❌ No logoFileId available');
                setError('Brak identyfikatora logo');
                return;
            }

            // Check if we already have this logo loaded
            if (currentBlobRef.current && imageSrc) {
                console.log('✅ Logo already loaded, skipping reload');
                return;
            }

            loadingRef.current = true;
            setLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem('auth_token');
                console.log('🔑 Auth token exists:', !!token);

                if (!token) {
                    throw new Error('Brak tokena autoryzacyjnego');
                }

                const apiUrl = 'http://localhost:8080/api';
                const url = `${apiUrl}/company-settings/logo/${logoFileId}`;

                console.log('📡 Fetching from:', url);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'image/*'
                    }
                });

                console.log('📊 Response status:', response.status);

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Brak autoryzacji - sprawdź token');
                    } else if (response.status === 404) {
                        throw new Error('Logo nie zostało znalezione');
                    } else {
                        const errorText = await response.text();
                        throw new Error(`Błąd HTTP ${response.status}: ${errorText}`);
                    }
                }

                const blob = await response.blob();
                console.log('✅ Blob received - size:', blob.size, 'type:', blob.type);

                if (blob.size === 0) {
                    throw new Error('Otrzymano pusty plik');
                }

                // Clean up previous blob if exists
                if (currentBlobRef.current) {
                    URL.revokeObjectURL(currentBlobRef.current);
                }

                // Create new object URL
                const objectUrl = URL.createObjectURL(blob);
                currentBlobRef.current = objectUrl;
                setImageSrc(objectUrl);

                console.log('✅ Logo loaded successfully!');
            } catch (err: any) {
                console.error('❌ Logo loading error:', err);
                setError(err.message || 'Nieznany błąd');
            } finally {
                setLoading(false);
                loadingRef.current = false;
            }
        };

        loadLogo();

        // Cleanup function - NAPRAWKA: nie dodajemy imageSrc do dependencies
        return () => {
            // Cleanup will be handled when component unmounts or logoSettings change
        };
    }, [logoSettings?.hasLogo, logoSettings?.logoFileId, logoSettings?.logoUrl]); // NAPRAWKA: tylko istotne zależności

    // Separate useEffect for cleanup on unmount
    useEffect(() => {
        return () => {
            if (currentBlobRef.current) {
                console.log('🧹 Cleaning up blob URL on unmount');
                URL.revokeObjectURL(currentBlobRef.current);
                currentBlobRef.current = null;
            }
        };
    }, []); // Empty dependencies - only on unmount

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
        return (
            <ErrorContainer className={className}>
                <ErrorIcon>⚠️</ErrorIcon>
                <ErrorTitle>Błąd ładowania logo</ErrorTitle>
                <ErrorText>{error}</ErrorText>
            </ErrorContainer>
        );
    }

    // No logo state
    if (!logoSettings?.hasLogo) {
        return (
            <NoLogoContainer className={className}>
                <NoLogoIcon>📷</NoLogoIcon>
                <NoLogoText>Brak logo</NoLogoText>
            </NoLogoContainer>
        );
    }

    // Success state
    if (imageSrc) {
        return (
            <ImageContainer className={className}>
                <StyledImage
                    src={imageSrc}
                    alt={alt}
                    $maxWidth={maxWidth}
                    $maxHeight={maxHeight}
                    onLoad={() => console.log('✅ Image element displayed successfully')}
                    onError={() => {
                        console.error('❌ Image element failed to display');
                        setError('Błąd wyświetlania obrazu');
                    }}
                />
            </ImageContainer>
        );
    }

    // Fallback - should not happen
    return (
        <NoLogoContainer className={className}>
            <NoLogoText>Ładowanie...</NoLogoText>
        </NoLogoContainer>
    );
};

// Styled Components - same as before
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    min-height: 120px;
    background: #f8fafc;
    border-radius: 12px;
    border: 2px dashed #cbd5e1;
    gap: 12px;
`;

const Spinner = styled.div`
    width: 32px;
    height: 32px;
    border: 3px solid #e2e8f0;
    border-top: 3px solid #1a365d;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
`;

const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: #fef2f2;
    border-radius: 12px;
    border: 2px solid #fecaca;
    min-height: 120px;
    text-align: center;
    gap: 8px;
`;

const ErrorIcon = styled.div`
    font-size: 32px;
`;

const ErrorTitle = styled.div`
    color: #dc2626;
    font-size: 16px;
    font-weight: 600;
`;

const ErrorText = styled.div`
    color: #dc2626;
    font-size: 14px;
    margin: 4px 0;
`;

const NoLogoContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: #f1f5f9;
    border-radius: 12px;
    border: 2px dashed #cbd5e1;
    min-height: 120px;
    gap: 8px;
`;

const NoLogoIcon = styled.div`
    font-size: 32px;
    opacity: 0.5;
`;

const NoLogoText = styled.div`
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
`;

const ImageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StyledImage = styled.img<{ $maxWidth: string; $maxHeight: string }>`
    max-width: ${props => props.$maxWidth};
    max-height: ${props => props.$maxHeight};
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 8px;
    display: block;
`;

export default StableLogo;