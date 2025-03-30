import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaCamera, FaUpload, FaTrash, FaImage, FaExclamationCircle, FaEye } from 'react-icons/fa';
import { VehicleImage } from '../../../../../types';
import ImagePreviewModal from '../../../components/ImagePreviewModal';

interface ImageUploadSectionProps {
    images: VehicleImage[];
    onImagesChange: (images: VehicleImage[]) => void;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({ images, onImagesChange }) => {
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Stan dla modalu podglądu
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewImageIndex, setPreviewImageIndex] = useState(0);

    // Maksymalny rozmiar pliku (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    // Obsługuje dodawanie nowych zdjęć
    const handleAddImages = (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
        // Zapobiega domyślnej akcji przeglądarki, która może powodować przesłanie formularza
        event.preventDefault();

        // Pobierz pliki z odpowiedniego źródła zdarzenia
        const files = event instanceof DragEvent
            ? (event as React.DragEvent<HTMLDivElement>).dataTransfer.files
            : (event.target as HTMLInputElement).files;

        if (!files || files.length === 0) return;

        setError(null);

        // Konwertuje FileList na array, żeby móc łatwiej go przetwarzać
        const filesArray = Array.from(files);

        // Sprawdza czy wszystkie pliki to obrazy i czy nie przekraczają rozmiaru
        const invalidFiles = filesArray.filter(file =>
            !file.type.startsWith('image/') || file.size > MAX_FILE_SIZE
        );

        if (invalidFiles.length > 0) {
            setError(
                `Wykryto nieprawidłowe pliki. Akceptowane są tylko obrazy do ${MAX_FILE_SIZE / 1024 / 1024}MB.`
            );
            return;
        }

        // Konwertuje pliki na obiekt VehicleImage
        const newImages: VehicleImage[] = [];

        filesArray.forEach(file => {
            // Tworzy URL do podglądu obrazu
            const imageUrl = URL.createObjectURL(file);

            // Dodaje nowy obraz do tablicy
            newImages.push({
                id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                url: imageUrl,
                name: file.name,
                size: file.size,
                type: file.type,
                createdAt: new Date().toISOString(),
                file: file // Dodajemy referencję do oryginalnego pliku
            });
        });

        // Aktualizuje stan
        onImagesChange([...images, ...newImages]);
    };

    // Obsługuje usuwanie zdjęcia
    const handleRemoveImage = (imageId: string) => {
        const imageToRemove = images.find(img => img.id === imageId);

        const updatedImages = images.filter(img => img.id !== imageId);
        onImagesChange(updatedImages);
    };

    // Obsługuje kliknięcie w przycisk "Dodaj zdjęcie"
    const handleUploadClick = (e: React.MouseEvent) => {
        // Zapobiega domyślnej akcji przeglądarki
        e.preventDefault();
        e.stopPropagation();

        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Obsługuje kliknięcie w przycisk "Zrób zdjęcie"
    const handleCameraClick = (e: React.MouseEvent) => {
        // Zapobiega domyślnej akcji przeglądarki
        e.preventDefault();
        e.stopPropagation();

        if (cameraInputRef.current) {
            cameraInputRef.current.click();
        }
    };

    // Obsługuje otwieranie podglądu zdjęcia
    const handleOpenPreview = (index: number) => {
        setPreviewImageIndex(index);
        setPreviewModalOpen(true);
    };

    // Obsługuje przeciągnięcie i upuszczenie plików
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleAddImages(e);
    };

    // Formatuje rozmiar pliku do czytelnej postaci
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <SectionContainer>
            <SectionTitle>Zdjęcia</SectionTitle>

            {error && (
                <ErrorMessage>
                    <FaExclamationCircle /> {error}
                </ErrorMessage>
            )}

            <UploadArea
                isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <UploadText>Przeciągnij i upuść zdjęcia tutaj lub użyj przycisków poniżej</UploadText>
                <UploadButtons>
                    <UploadButton type="button" onClick={handleUploadClick}>
                        <FaUpload /> Dodaj zdjęcie
                    </UploadButton>
                    <UploadButton type="button" onClick={handleCameraClick}>
                        <FaCamera /> Zrób zdjęcie
                    </UploadButton>
                </UploadButtons>

                {/* Ukryte inputy do dodawania plików */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAddImages}
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                />
                <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleAddImages}
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                />
            </UploadArea>

            {images.length > 0 && (
                <ImagesList>
                    {images.map((image, index) => (
                        <ImageItem key={image.id}>
                            <ImageThumbnail onClick={() => handleOpenPreview(index)}>
                                <img src={image.url} alt={image.name} />
                                <ViewOverlay>
                                    <FaEye />
                                </ViewOverlay>
                            </ImageThumbnail>
                            <ImageInfo>
                                <ImageName>{image.name}</ImageName>
                                <ImageSize>{formatFileSize(image.size)}</ImageSize>
                            </ImageInfo>
                            <RemoveButton onClick={() => handleRemoveImage(image.id)}>
                                <FaTrash />
                            </RemoveButton>
                        </ImageItem>
                    ))}
                </ImagesList>
            )}

            {images.length === 0 && (
                <EmptyImagesMessage>
                    <FaImage />
                    <p>Brak zdjęć. Dodaj zdjęcie, aby udokumentować stan pojazdu.</p>
                </EmptyImagesMessage>
            )}

            {/* Modal podglądu zdjęcia */}
            <ImagePreviewModal
                isOpen={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                images={images}
                currentImageIndex={previewImageIndex}
                onDelete={handleRemoveImage}
            />
        </SectionContainer>
    );
};

// Stylowanie komponentów
const SectionContainer = styled.div`
    margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    margin: 0 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
    color: #3498db;
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #fdecea;
    color: #e74c3c;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 10px;
    font-size: 14px;
`;

const UploadArea = styled.div<{ isDragging: boolean }>`
    border: 2px dashed ${props => props.isDragging ? '#3498db' : '#ddd'};
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    background-color: ${props => props.isDragging ? '#f0f7ff' : '#f9f9f9'};
    transition: all 0.2s;
    margin-bottom: 20px;

    &:hover {
        border-color: #3498db;
        background-color: #f0f7ff;
    }
`;

const UploadText = styled.p`
    color: #7f8c8d;
    margin: 0 0 15px 0;
    font-size: 14px;
`;

const UploadButtons = styled.div`
    display: flex;
    gap: 15px;
    justify-content: center;

    @media (max-width: 480px) {
        flex-direction: column;
        align-items: center;
    }
`;

const UploadButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #f0f7ff;
    color: #3498db;
    border: 1px solid #d5e9f9;
    border-radius: 4px;
    padding: 10px 15px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
        background-color: #d5e9f9;
    }

    @media (max-width: 480px) {
        width: 100%;
        justify-content: center;
    }
`;

const ImagesList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const ImageItem = styled.div`
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    background-color: white;

    &:hover {
        border-color: #3498db;
    }
`;

const ImageThumbnail = styled.div`
    height: 150px;
    overflow: hidden;
    position: relative;
    cursor: pointer;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
    }

    &:hover {
        img {
            transform: scale(1.05);
        }
    }
`;

const ViewOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    opacity: 0;
    transition: opacity 0.3s;

    ${ImageThumbnail}:hover & {
        opacity: 1;
    }
`;

const ImageInfo = styled.div`
    padding: 10px;
`;

const ImageName = styled.div`
    font-size: 13px;
    color: #34495e;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 3px;
`;

const ImageSize = styled.div`
    font-size: 12px;
    color: #7f8c8d;
`;

const RemoveButton = styled.button`
    position: absolute;
    top: 5px;
    right: 5px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0.7;
    z-index: 10;

    &:hover {
        opacity: 1;
        background-color: rgba(231, 76, 60, 0.8);
    }
`;

const EmptyImagesMessage = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    background-color: #f9f9f9;
    border-radius: 8px;
    color: #95a5a6;
    text-align: center;

    svg {
        font-size: 32px;
        margin-bottom: 10px;
        opacity: 0.5;
    }

    p {
        margin: 0;
        font-size: 14px;
    }
`;

export default ImageUploadSection;