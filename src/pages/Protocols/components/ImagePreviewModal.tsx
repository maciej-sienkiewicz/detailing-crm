import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaChevronLeft, FaChevronRight, FaTrash } from 'react-icons/fa';
import { VehicleImage } from '../../../types';
import { apiClient } from '../../../api/apiClient';

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

    if (!isOpen || images.length === 0) return null;

    const currentImage = images[activeIndex];

    // Helper function to get the image URL
    const getImageUrl = (image: VehicleImage): string => {
        // Dla lokalnych zdjęć (blobURL)
        if (image.url && image.url.startsWith('blob:')) {
            return image.url;
        }

        // Dla zdjęć z serwera
        if (image.id) {
            if (image.url && !image.url.startsWith('blob:')) {
                return image.url; // Jeśli url jest już prawidłowo ustawiony
            }

            // Konstruujemy URL do API
            const baseUrl = apiClient.getBaseUrl();
            return `${baseUrl}/receptions/image/${image.id}`;
        }

        return ''; // Fallback dla nieprawidłowych danych
    };

    const handlePrevious = () => {
        setActiveIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    };

    const handleNext = () => {
        setActiveIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            handlePrevious();
        } else if (e.key === 'ArrowRight') {
            handleNext();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleDelete = () => {
        if (onDelete && currentImage) {
            onDelete(currentImage.id);

            // Jeśli usuwamy ostatni element, zamykamy modal
            if (images.length === 1) {
                onClose();
            } else {
                // W przeciwnym razie przechodzimy do następnego obrazu
                setActiveIndex(activeIndex === images.length - 1 ? activeIndex - 1 : activeIndex);
            }
        }
    };

    return (
        <ModalOverlay tabIndex={0} onKeyDown={handleKeyDown}>
            <CloseButton onClick={onClose}>
                <FaTimes />
            </CloseButton>

            {images.length > 1 && (
                <>
                    <NavigationButton onClick={handlePrevious} position="left">
                        <FaChevronLeft />
                    </NavigationButton>
                    <NavigationButton onClick={handleNext} position="right">
                        <FaChevronRight />
                    </NavigationButton>
                </>
            )}

            <ModalContent>
                <ImageContainer>
                    <ImageElement src={getImageUrl(currentImage)} alt={currentImage.name} />
                </ImageContainer>

                <ImageInfo>
                    <ImageDetailsContainer>
                        <ImageName>{currentImage.name}</ImageName>
                        <ImageMeta>
                            {formatFileSize(currentImage.size)}
                            {currentImage.description && ` • ${currentImage.description}`}
                        </ImageMeta>
                    </ImageDetailsContainer>

                    {onDelete && (
                        <DeleteButton onClick={handleDelete}>
                            <FaTrash /> Usuń zdjęcie
                        </DeleteButton>
                    )}
                </ImageInfo>

                {images.length > 1 && (
                    <ThumbnailsContainer>
                        {images.map((image, index) => (
                            <Thumbnail
                                key={image.id}
                                selected={index === activeIndex}
                                onClick={() => setActiveIndex(index)}
                            >
                                <img src={getImageUrl(image)} alt={`Miniatura ${index + 1}`} />
                            </Thumbnail>
                        ))}
                    </ThumbnailsContainer>
                )}
            </ModalContent>
        </ModalOverlay>
    );
};

// Pomocnicza funkcja do formatowania rozmiaru pliku
const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Stylizacja komponentów
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1500;
    padding: 20px;
    outline: none;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    z-index: 1600;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        color: #ddd;
    }
`;

const NavigationButton = styled.button<{ position: 'left' | 'right' }>`
    position: absolute;
    top: 50%;
    ${props => props.position === 'left' ? 'left: 20px;' : 'right: 20px;'}
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    border: none;
    color: white;
    font-size: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 1600;

    &:hover {
        background: rgba(0, 0, 0, 0.8);
    }

    @media (max-width: 768px) {
        width: 40px;
        height: 40px;
        font-size: 16px;
    }
`;

const ModalContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    max-width: 1200px;
`;

const ImageContainer = styled.div`
    width: 100%;
    height: calc(100% - 150px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
`;

const ImageElement = styled.img`
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
`;

const ImageInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 15px 0;
    color: white;
`;

const ImageDetailsContainer = styled.div``;

const ImageName = styled.div`
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 5px;
`;

const ImageMeta = styled.div`
    font-size: 14px;
    color: #ccc;
`;

const DeleteButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: rgba(231, 76, 60, 0.8);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
        background-color: rgba(231, 76, 60, 1);
    }
`;

const ThumbnailsContainer = styled.div`
    display: flex;
    gap: 10px;
    overflow-x: auto;
    width: 100%;
    max-width: 100%;
    padding: 10px 0;

    &::-webkit-scrollbar {
        height: 6px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 10px;
    }
`;

const Thumbnail = styled.div<{ selected: boolean }>`
    width: 80px;
    height: 60px;
    cursor: pointer;
    border: 2px solid ${props => props.selected ? 'white' : 'transparent'};
    opacity: ${props => props.selected ? 1 : 0.6};
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
        opacity: 1;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

export default ImagePreviewModal;