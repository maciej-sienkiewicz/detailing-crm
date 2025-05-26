import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaCamera, FaUpload, FaTrash, FaImage, FaExclamationCircle, FaEye, FaEdit, FaTags } from 'react-icons/fa';
import { VehicleImage } from '../../../../types';
import { apiClient } from '../../../../api/apiClient';
import { carReceptionApi } from '../../../../api/carReceptionApi';
import ImagePreviewModal from "../../shared/modals/ImagePreviewModal";
import ImageEditModal from "../../shared/modals/ImageEditModal";

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

    // Stan dla modalu edycji informacji o zdjęciu
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingImageIndex, setEditingImageIndex] = useState(-1);

    // Mapa do przechowywania URL-i blob dla każdego zdjęcia
    const [blobUrls, setBlobUrls] = useState<Map<string, string>>(new Map());

    // Stan ładowania obrazów z serwera
    const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

    // Maksymalny rozmiar pliku (25MB)
    const MAX_FILE_SIZE = 25 * 1024 * 1024;

    // Automatyczne ładowanie obrazów z serwera przy montowaniu komponentu
    useEffect(() => {
        const loadServerImages = async () => {
            // Znajdź obrazy z serwera (nie lokalne/tymczasowe)
            const serverImages = images.filter(img =>
                !img.id.startsWith('temp_') &&
                !img.id.startsWith('img_') &&
                !blobUrls.has(img.id) &&
                (!img.url || !img.url.startsWith('blob:'))
            );

            if (serverImages.length === 0) return;

            // Oznacz obrazy jako ładowane
            setLoadingImages(prev => {
                const newSet = new Set(prev);
                serverImages.forEach(img => newSet.add(img.id));
                return newSet;
            });

            try {
                // Pobierz wszystkie obrazy równolegle
                const imagePromises = serverImages.map(async (image) => {
                    try {
                        const imageUrl = await carReceptionApi.fetchVehicleImageAsUrl(image.id);
                        return { id: image.id, url: imageUrl };
                    } catch (error) {
                        console.error(`Błąd podczas pobierania URL dla obrazu ${image.id}:`, error);
                        return { id: image.id, url: '' };
                    }
                });

                const results = await Promise.all(imagePromises);

                // Aktualizuj mapę URL-i
                setBlobUrls(prev => {
                    const newMap = new Map(prev);
                    results.forEach(({ id, url }) => {
                        if (url) {
                            newMap.set(id, url);
                        }
                    });
                    return newMap;
                });
            } catch (error) {
                console.error('Błąd podczas ładowania obrazów z serwera:', error);
                setError('Błąd podczas ładowania niektórych zdjęć');
            } finally {
                // Usuń obrazy z listy ładowanych
                setLoadingImages(prev => {
                    const newSet = new Set(prev);
                    serverImages.forEach(img => newSet.delete(img.id));
                    return newSet;
                });
            }
        };

        if (images.length > 0) {
            loadServerImages();
        }
    }, [images]);

    // Funkcja do generowania URL zdjęcia z lepszym zarządzaniem blob URLs
    const getImageUrl = (image: VehicleImage): string => {
        // Dla zdjęć z serwera sprawdź czy mamy zapisany blob URL
        if (!image.id.startsWith('temp_') && !image.id.startsWith('img_')) {
            if (blobUrls.has(image.id)) {
                return blobUrls.get(image.id)!;
            }
            // Jeśli obraz ma URL ale nie jest to blob, znaczy że został już pobrany wcześniej
            if (image.url && !image.url.startsWith('blob:')) {
                return image.url;
            }
            // W przeciwnym razie czekamy na załadowanie
            return '';
        }

        // Dla lokalnych zdjęć sprawdź czy mamy zapisany blob URL
        if (blobUrls.has(image.id)) {
            return blobUrls.get(image.id)!;
        }

        // Jeśli jest to lokalny blob URL w image.url, użyj go i zapisz w mapie
        if (image.url && image.url.startsWith('blob:')) {
            setBlobUrls(prev => new Map(prev).set(image.id, image.url!));
            return image.url;
        }

        return ''; // Fallback dla nieprawidłowych danych
    };

    // Sprawdza czy obraz jest w trakcie ładowania
    const isImageLoading = (imageId: string): boolean => {
        return loadingImages.has(imageId);
    };

    // Obsługuje dodawanie nowych zdjęć
    const handleAddImages = (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
        // Zapobiega domyślnej akcji przeglądarki, która może powodować przesłanie formularza
        event.preventDefault();
        event.stopPropagation();

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
        const newBlobUrls = new Map(blobUrls);

        filesArray.forEach(file => {
            // Tworzy URL do podglądu obrazu
            const imageUrl = URL.createObjectURL(file);
            const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

            // Zapisz blob URL w mapie
            newBlobUrls.set(imageId, imageUrl);

            // Przygotuj nazwę - usunięcie rozszerzenia pliku
            const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

            // Dodaje nowy obraz do tablicy
            newImages.push({
                id: imageId,
                url: imageUrl,
                name: fileNameWithoutExt,
                size: file.size,
                type: file.type,
                createdAt: new Date().toISOString(),
                tags: [],
                file: file
            });
        });

        // Aktualizuj mapy blob URLs
        setBlobUrls(newBlobUrls);

        // Otwórz modal edycji informacji dla pierwszego nowo dodanego zdjęcia
        if (newImages.length > 0) {
            const updatedImages = [...images, ...newImages];
            onImagesChange(updatedImages);

            // Otwórz modal do edycji informacji pierwszego nowego zdjęcia
            setEditingImageIndex(images.length); // Indeks pierwszego nowego zdjęcia
            setEditModalOpen(true);
        }
    };

    // Obsługuje usuwanie zdjęcia
    const handleRemoveImage = (imageId: string, e?: React.MouseEvent) => {
        // Prevent default if the event is provided
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const imageToRemove = images.find(img => img.id === imageId);

        // Zwolnij blob URL jeśli istnieje w mapie
        if (blobUrls.has(imageId)) {
            const blobUrl = blobUrls.get(imageId)!;
            URL.revokeObjectURL(blobUrl);
            setBlobUrls(prev => {
                const newMap = new Map(prev);
                newMap.delete(imageId);
                return newMap;
            });
        }

        // Jeśli to jest blobURL w image.url, również go zwolnij
        if (imageToRemove && imageToRemove.url && imageToRemove.url.startsWith('blob:')) {
            URL.revokeObjectURL(imageToRemove.url);
        }

        const updatedImages = images.filter(img => img.id !== imageId);
        onImagesChange(updatedImages);
    };

    // Obsługuje kliknięcie w przycisk "Dodaj zdjęcie"
    const handleUploadClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Obsługuje kliknięcie w przycisk "Zrób zdjęcie"
    const handleCameraClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (cameraInputRef.current) {
            cameraInputRef.current.click();
        }
    };

    // Obsługuje otwieranie podglądu zdjęcia
    const handleOpenPreview = (index: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setPreviewImageIndex(index);
        setPreviewModalOpen(true);
    };

    // Obsługuje otwieranie modalu edycji informacji o zdjęciu
    const handleEditImage = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setEditingImageIndex(index);
        setEditModalOpen(true);
    };

    // Obsługuje zapisanie zmienionych informacji o zdjęciu
    const handleSaveImageInfo = (newName: string, newTags: string[], e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (editingImageIndex >= 0 && editingImageIndex < images.length) {
            const updatedImages = [...images];
            updatedImages[editingImageIndex] = {
                ...updatedImages[editingImageIndex],
                name: newName,
                tags: newTags
            };
            onImagesChange(updatedImages);

            setEditModalOpen(false);
            setEditingImageIndex(-1);
        }
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

    // Obsługa zdarzenia zmiany pliku dla file input, zapobiegająca zatwierdzeniu formularza
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.stopPropagation();
        handleAddImages(e);
    };

    // Czyszczenie blob URLs przy unmount komponentu
    React.useEffect(() => {
        return () => {
            // Zwolnij wszystkie blob URLs przy odmontowywaniu komponentu
            blobUrls.forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, []);

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
                    onChange={handleFileInputChange}
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onClick={(e) => e.stopPropagation()}
                />
                <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleFileInputChange}
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    onClick={(e) => e.stopPropagation()}
                />
            </UploadArea>

            {images.length > 0 && (
                <ImagesList>
                    {images.map((image, index) => {
                        const imageUrl = getImageUrl(image);
                        const isLoading = isImageLoading(image.id);

                        return (
                            <ImageItem key={image.id}>
                                <ImageThumbnail onClick={(e) => handleOpenPreview(index, e)}>
                                    {isLoading ? (
                                        <LoadingIndicator>
                                            <div className="spinner"></div>
                                            <span>Ładowanie...</span>
                                        </LoadingIndicator>
                                    ) : imageUrl ? (
                                        <>
                                            <img src={imageUrl} alt={image.name || 'Zdjęcie'} />
                                            <ViewOverlay>
                                                <FaEye />
                                            </ViewOverlay>
                                        </>
                                    ) : (
                                        <ImagePlaceholder>
                                            <FaImage />
                                            <span>Błąd ładowania</span>
                                        </ImagePlaceholder>
                                    )}
                                </ImageThumbnail>
                                <ImageInfo>
                                    <ImageNameContainer>
                                        <ImageName>{image.name || 'Bez nazwy'}</ImageName>
                                        <EditButton type="button" onClick={(e) => handleEditImage(index, e)}>
                                            <FaEdit />
                                        </EditButton>
                                    </ImageNameContainer>
                                    <ImageMetaContainer>
                                        <ImageSize>{formatFileSize(image.size)}</ImageSize>
                                        {image.tags && image.tags.length > 0 && (
                                            <TagsContainer>
                                                <TagsIcon><FaTags /></TagsIcon>
                                                <TagsCount>{image.tags.length}</TagsCount>
                                            </TagsContainer>
                                        )}
                                    </ImageMetaContainer>

                                    {image.tags && image.tags.length > 0 && (
                                        <TagsList>
                                            {image.tags.map(tag => (
                                                <TagBadge key={tag}>{tag}</TagBadge>
                                            ))}
                                        </TagsList>
                                    )}
                                </ImageInfo>
                                <RemoveButton type="button" onClick={(e) => handleRemoveImage(image.id, e)}>
                                    <FaTrash />
                                </RemoveButton>
                            </ImageItem>
                        );
                    })}
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
                images={images.map(img => ({ ...img, url: getImageUrl(img) }))} // Zapewniamy aktualne URL-e
                currentImageIndex={previewImageIndex}
                onDelete={handleRemoveImage}
            />

            {/* Modal edycji informacji o zdjęciu */}
            {editingImageIndex >= 0 && editingImageIndex < images.length && (
                <ImageEditModal
                    isOpen={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        setEditingImageIndex(-1);
                    }}
                    onSave={handleSaveImageInfo}
                    initialName={images[editingImageIndex].name || ''}
                    initialTags={images[editingImageIndex].tags || []}
                    imageUrl={getImageUrl(images[editingImageIndex])}
                />
            )}
        </SectionContainer>
    );
};

// Stylowanie komponentów - dodane style dla ładowania
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
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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

const LoadingIndicator = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #3498db;
    gap: 10px;

    .spinner {
        width: 24px;
        height: 24px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    span {
        font-size: 12px;
    }
`;

const ImagePlaceholder = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #95a5a6;
    gap: 8px;

    svg {
        font-size: 24px;
    }

    span {
        font-size: 12px;
    }
`;

const ImageInfo = styled.div`
    padding: 10px;
`;

const ImageNameContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3px;
`;

const ImageName = styled.div`
    font-size: 13px;
    color: #34495e;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 5px;
    flex: 1;
`;

const EditButton = styled.button`
    background: none;
    border: none;
    color: #3498db;
    font-size: 12px;
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;

    &:hover {
        opacity: 1;
        color: #2980b9;
    }
`;

const ImageMetaContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
`;

const ImageSize = styled.div`
    font-size: 12px;
    color: #7f8c8d;
`;

const TagsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 3px;
`;

const TagsIcon = styled.span`
    color: #3498db;
    font-size: 10px;
    display: flex;
    align-items: center;
`;

const TagsCount = styled.span`
    font-size: 12px;
    color: #3498db;
    font-weight: 500;
`;

const TagsList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 3px;
`;

const TagBadge = styled.div`
    background-color: #f0f7ff;
    color: #3498db;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 10px;
    border: 1px solid #d5e9f9;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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