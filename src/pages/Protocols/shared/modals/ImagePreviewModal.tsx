import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaTrash, FaArrowLeft, FaArrowRight, FaSpinner, FaImage } from 'react-icons/fa';
import { VehicleImage } from '../../../../types';
import { carReceptionApi } from '../../../../api/carReceptionApi';
import {apiClient} from "../../../../api/apiClient";

interface ImagePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: VehicleImage[];
    currentImageIndex: number;
    onDelete?: (imageId: string) => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 images,
                                                                 currentImageIndex,
                                                                 onDelete
                                                             }) => {
    const [activeIndex, setActiveIndex] = useState(currentImageIndex);
    const [loading, setLoading] = useState(false);
    // Nowy stan do przechowywania URL-i obrazów - tylko dla obrazów z serwera
    const [serverImageUrls, setServerImageUrls] = useState<Record<string, string>>({});

    // Ustaw początkowy indeks obrazu przy otwarciu
    useEffect(() => {
        setActiveIndex(currentImageIndex);
    }, [currentImageIndex, isOpen]);

    // Pobieranie obrazów z autoryzacją - TYLKO dla obrazów z serwera
    useEffect(() => {
        if (!isOpen) return;

        const fetchServerImages = async () => {
            setLoading(true);

            try {
                // Pobieramy tylko obrazy z serwera (nie lokalne blob/temp)
                const serverImages = images.filter(img =>
                    !img.id.startsWith('temp_') &&
                    !img.id.startsWith('img_') &&
                    !serverImageUrls[img.id] &&
                    (!img.url || !img.url.startsWith('blob:'))
                );

                if (serverImages.length === 0) {
                    setLoading(false);
                    return;
                }

                const fetchPromises = serverImages.map(async (image) => {
                    try {
                        const imageUrl = await carReceptionApi.fetchVehicleImageAsUrl(image.id);
                        return { id: image.id, url: imageUrl };
                    } catch (error) {
                        console.error(`Błąd podczas pobierania URL dla obrazu ${image.id}:`, error);
                        return { id: image.id, url: '' };
                    }
                });

                const results = await Promise.all(fetchPromises);

                // Aktualizujemy stan tylko raz po pobraniu wszystkich obrazów
                const newUrls = results.reduce((acc, { id, url }) => {
                    if (url) acc[id] = url;
                    return acc;
                }, {} as Record<string, string>);

                setServerImageUrls(prev => ({
                    ...prev,
                    ...newUrls
                }));
            } catch (error) {
                console.error('Błąd podczas pobierania obrazów:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchServerImages();
    }, [isOpen, images]);

    // Zwolnienie zasobów przy zamknięciu modalu - TYLKO dla URL-i pobranych z serwera
    useEffect(() => {
        return () => {
            Object.values(serverImageUrls).forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, []);

    // Funkcja do pobierania prawidłowego URL obrazu
    const getImageUrl = (image: VehicleImage): string => {
        // Jeśli obraz ma lokalny URL (np. tymczasowy), użyj go bezpośrednio
        if (image.url && (
            image.url.startsWith('blob:') ||
            image.url.startsWith('data:') ||
            image.id.startsWith('temp_') ||
            image.id.startsWith('img_')
        )) {
            return image.url;
        }

        // Jeśli mamy pobrany URL dla tego obrazu z serwera, użyj go
        if (serverImageUrls[image.id]) {
            return serverImageUrls[image.id];
        }

        // Bez URL zwracamy pusty string
        return '';
    };

    if (!isOpen) return null;

    // Sprawdzamy, czy mamy obrazy do wyświetlenia
    if (images.length === 0) {
        return (
            <ModalOverlay>
                <ModalContainer>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                    <EmptyMessage>Brak zdjęć do wyświetlenia</EmptyMessage>
                </ModalContainer>
            </ModalOverlay>
        );
    }

    const currentImage = images[activeIndex];

    // Funkcje nawigacyjne
    const goToPrevious = () => {
        setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
    };

    const goToNext = () => {
        setActiveIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
    };

    const handleDeleteImage = () => {
        if (onDelete && currentImage) {
            onDelete(currentImage.id);
            // Po usunięciu przejdź do następnego obrazu, jeśli to był ostatni, przejdź do poprzedniego
            if (activeIndex === images.length - 1 && activeIndex > 0) {
                setActiveIndex(activeIndex - 1);
            }
        }
    };

    const currentImageUrl = getImageUrl(currentImage);
    const isLoadingCurrentImage = !currentImageUrl && loading;

    return (
        <ModalOverlay>
            <ModalContainer>
                <CloseButton onClick={onClose}>
                    <FaTimes />
                </CloseButton>

                <ModalContent>
                    <ImageControls>
                        <NavigationButton onClick={goToPrevious} disabled={images.length <= 1}>
                            <FaArrowLeft />
                        </NavigationButton>

                        <ImageContainer>
                            {isLoadingCurrentImage ? (
                                <LoadingContainer>
                                    <FaSpinner />
                                    <span>Ładowanie...</span>
                                </LoadingContainer>
                            ) : currentImageUrl ? (
                                <LargeImage
                                    src={currentImageUrl}
                                    alt={currentImage.name || `Zdjęcie ${activeIndex + 1}`}
                                />
                            ) : (
                                <ImagePlaceholder>
                                    <FaImage size={48} />
                                    <span>Nie można załadować obrazu</span>
                                </ImagePlaceholder>
                            )}
                        </ImageContainer>

                        <NavigationButton onClick={goToNext} disabled={images.length <= 1}>
                            <FaArrowRight />
                        </NavigationButton>
                    </ImageControls>

                    <ImageInfo>
                        <ImageName>{currentImage.name || `Zdjęcie ${activeIndex + 1}`}</ImageName>
                        <ImageCounter>
                            {activeIndex + 1} / {images.length}
                        </ImageCounter>
                        {currentImage.tags && currentImage.tags.length > 0 && (
                            <TagsContainer>
                                {currentImage.tags.map(tag => (
                                    <TagBadge key={tag}>{tag}</TagBadge>
                                ))}
                            </TagsContainer>
                        )}

                        {onDelete && !currentImage.id.startsWith('temp_') && !currentImage.id.startsWith('img_') && (
                            <DeleteButton onClick={handleDeleteImage}>
                                <FaTrash /> Usuń zdjęcie
                            </DeleteButton>
                        )}
                    </ImageInfo>
                </ModalContent>

                {/* Miniatury */}
                {images.length > 1 && (
                    <ThumbnailsContainer>
                        {images.map((image, index) => {
                            const thumbnailUrl = getImageUrl(image);
                            return (
                                <Thumbnail
                                    key={image.id || index}
                                    active={index === activeIndex}
                                    onClick={() => setActiveIndex(index)}
                                >
                                    {thumbnailUrl ? (
                                        <ThumbnailImage
                                            src={thumbnailUrl}
                                            alt={image.name || `Zdjęcie ${index + 1}`}
                                        />
                                    ) : (
                                        <ThumbnailPlaceholder>
                                            <FaImage size={16} />
                                        </ThumbnailPlaceholder>
                                    )}
                                </Thumbnail>
                            );
                        })}
                    </ThumbnailsContainer>
                )}
            </ModalContainer>
        </ModalOverlay>
    );
};

// Style dla komponentów modalnych
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ModalContainer = styled.div`
    background-color: #fff;
    border-radius: 8px;
    width: 90%;
    max-width: 1200px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 15px;
    right: 15px;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;

    &:hover {
        background-color: rgba(0, 0, 0, 0.8);
    }
`;

const ModalContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow: hidden;
`;

const ImageControls = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    min-height: 0;
`;

const NavigationButton = styled.button`
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 5;
    margin: 0 15px;

    &:hover:not(:disabled) {
        background-color: rgba(0, 0, 0, 0.8);
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

const ImageContainer = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    max-height: 70vh;
    overflow: hidden;
`;

const LargeImage = styled.img`
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
`;

const ImagePlaceholder = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 300px;
    background-color: #f0f0f0;
    color: #999;
    gap: 15px;
`;

const ThumbnailsContainer = styled.div`
    display: flex;
    overflow-x: auto;
    padding: 10px 20px;
    background-color: #f0f0f0;
    gap: 10px;
`;

const Thumbnail = styled.div<{ active: boolean }>`
    width: 60px;
    height: 60px;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid ${props => props.active ? '#3498db' : 'transparent'};
    flex-shrink: 0;

    &:hover {
        border-color: ${props => props.active ? '#3498db' : '#ddd'};
    }
`;

const ThumbnailImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const ThumbnailPlaceholder = styled.div`
    width: 100%;
    height: 100%;
    background-color: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
`;

const ImageInfo = styled.div`
    padding: 15px 0;
    border-top: 1px solid #eee;
    margin-top: 15px;
`;

const ImageName = styled.h3`
    margin: 0;
    font-size: 16px;
    color: #2c3e50;
`;

const ImageCounter = styled.div`
    font-size: 14px;
    color: #7f8c8d;
    margin-top: 4px;
`;

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
`;

const TagBadge = styled.div`
    background-color: #f0f7ff;
    color: #3498db;
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 12px;
    border: 1px solid #d5e9f9;
`;

const DeleteButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background-color: #fdf1f0;
    color: #e74c3c;
    border: 1px solid #fbdbd9;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    margin-top: 15px;

    &:hover {
        background-color: #fbdbd9;
    }
`;

const EmptyMessage = styled.div`
    padding: 40px;
    text-align: center;
    color: #7f8c8d;
    font-size: 16px;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
    color: #3498db;

    svg {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

export default ImagePreviewModal;