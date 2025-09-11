import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaCamera, FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';
import { SidebarSection, SidebarSectionTitle, EmptyMessage, EmptyIcon, EmptyText } from './VehicleDetailStyles';
import {vehicleApi} from "../../../../api/vehiclesApi";
import {theme} from "../../../../styles/theme";

interface VehicleImage {
    id: string;
    url: string;
    thumbnailUrl: string;
    filename: string;
    uploadedAt: string;
}

interface VehicleGallerySectionProps {
    vehicleId: string | undefined;
}

const VehicleGallerySection: React.FC<VehicleGallerySectionProps> = ({ vehicleId }) => {
    const [images, setImages] = useState<VehicleImage[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadImages();
    }, [vehicleId]);

    const loadImages = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await vehicleApi.fetchVehicleImages(vehicleId, { page: 0, size: 3 });
            setImages(response.data || []);
            setCurrentIndex(0);
        } catch (err) {
            console.error('Error loading vehicle images:', err);
            setError('Nie udało się załadować zdjęć');
            setImages([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevious = () => {
        setCurrentIndex(prevIndex =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex(prevIndex =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handleAddImage = () => {
        console.log('Dodawanie zdjęcia - funkcjonalność w przygotowaniu');
    };

    if (loading) {
        return (
            <SidebarSection>
                <SidebarSectionTitle>
                    <FaCamera />
                    Galeria zdjęć
                </SidebarSectionTitle>
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie zdjęć...</LoadingText>
                </LoadingContainer>
            </SidebarSection>
        );
    }

    if (error || images.length === 0 || !vehicleId) {
        return (
            <SidebarSection>
                <SidebarSectionTitle>
                    <FaCamera />
                    Galeria zdjęć
                </SidebarSectionTitle>
                <EmptyMessage>
                    <EmptyIcon>
                        <FaCamera />
                    </EmptyIcon>
                    <EmptyText>
                        {error || (!vehicleId ? 'Brak ID pojazdu' : 'Brak zdjęć pojazdu')}
                    </EmptyText>
                </EmptyMessage>
                {vehicleId && (
                    <AddImageButton onClick={handleAddImage}>
                        <FaPlus />
                        Dodaj zdjęcie
                    </AddImageButton>
                )}
            </SidebarSection>
        );
    }

    const currentImage = images[currentIndex];

    return (
        <SidebarSection>
            <SidebarSectionTitle>
                <FaCamera />
                Galeria zdjęć ({images.length})
            </SidebarSectionTitle>

            <GalleryContainer>
                <ImageContainer>
                    <NavigationButton
                        position="left"
                        onClick={handlePrevious}
                        disabled={images.length <= 1}
                    >
                        <FaChevronLeft />
                    </NavigationButton>

                    <ImageDisplay>
                        <VehicleImage
                            src={currentImage.thumbnailUrl || currentImage.url}
                            alt={`Zdjęcie pojazdu ${currentIndex + 1}`}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-car-image.png';
                            }}
                        />
                        <ImageOverlay>
                            <ImageCounter>
                                {currentIndex + 1} / {images.length}
                            </ImageCounter>
                        </ImageOverlay>
                    </ImageDisplay>

                    <NavigationButton
                        position="right"
                        onClick={handleNext}
                        disabled={images.length <= 1}
                    >
                        <FaChevronRight />
                    </NavigationButton>
                </ImageContainer>

                <ImageInfo>
                    <ImageFilename>{currentImage.filename}</ImageFilename>
                    <ImageDate>
                        {new Date(currentImage.uploadedAt).toLocaleDateString('pl-PL')}
                    </ImageDate>
                </ImageInfo>

                {images.length > 1 && (
                    <DotsIndicator>
                        {images.map((_, index) => (
                            <Dot
                                key={index}
                                $active={index === currentIndex}
                                onClick={() => setCurrentIndex(index)}
                            />
                        ))}
                    </DotsIndicator>
                )}
            </GalleryContainer>

            <AddImageButton onClick={handleAddImage}>
                <FaPlus />
                Dodaj zdjęcie
            </AddImageButton>
        </SidebarSection>
    );
};

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xl};
    gap: ${theme.spacing.md};
`;

const LoadingSpinner = styled.div`
    width: 24px;
    height: 24px;
    border: 2px solid ${theme.borderLight};
    border-top: 2px solid ${theme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 12px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const GalleryContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.lg};
`;

const ImageContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
    height: 200px;
`;

const NavigationButton = styled.button<{ position: 'left' | 'right'; disabled: boolean }>`
    position: absolute;
    ${props => props.position}: ${theme.spacing.sm};
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all ${theme.transitions.normal};
    z-index: 2;
    opacity: ${props => props.disabled ? 0.3 : 1};
    pointer-events: ${props => props.disabled ? 'none' : 'auto'};

    &:hover:not(:disabled) {
        background: rgba(0, 0, 0, 0.8);
        transform: translateY(-50%) scale(1.1);
    }

    svg {
        font-size: 12px;
    }
`;

const ImageDisplay = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const VehicleImage = styled.img`
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
    border-radius: ${theme.radius.md};
`;

const ImageOverlay = styled.div`
    position: absolute;
    bottom: ${theme.spacing.sm};
    right: ${theme.spacing.sm};
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border-radius: ${theme.radius.sm};
    font-size: 11px;
    font-weight: 500;
`;

const ImageCounter = styled.span`
    font-family: 'Monaco', 'Consolas', monospace;
`;

const ImageInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    padding: 0 ${theme.spacing.sm};
`;

const ImageFilename = styled.div`
    font-size: 12px;
    font-weight: 500;
    color: ${theme.text.secondary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const ImageDate = styled.div`
    font-size: 11px;
    color: ${theme.text.muted};
`;

const DotsIndicator = styled.div`
    display: flex;
    justify-content: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.sm} 0;
`;

const Dot = styled.button<{ $active: boolean }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: none;
    background: ${props => props.$active ? theme.primary : theme.border};
    cursor: pointer;
    transition: all ${theme.transitions.fast};

    &:hover {
        background: ${props => props.$active ? theme.primaryDark : theme.borderHover};
        transform: scale(1.2);
    }
`;

const AddImageButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};
    width: 100%;
    padding: ${theme.spacing.md};
    background: white;
    color: ${theme.primary};
    border: 1px dashed ${theme.primary};
    border-radius: ${theme.radius.md};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all ${theme.transitions.normal};

    svg {
        font-size: 12px;
    }

    &:hover {
        background: ${theme.primaryGhost};
        border-style: solid;
    }
`;

export default VehicleGallerySection;