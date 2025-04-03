import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
    FaCamera,
    FaUpload,
    FaTrash,
    FaImage,
    FaExclamationCircle,
    FaEye,
    FaEdit,
    FaTags, FaPlus, FaTimes
} from 'react-icons/fa';
import { CarReceptionProtocol, VehicleImage } from '../../../../types';
import { apiClient } from '../../../../api/apiClient';
import { carReceptionApi } from '../../../../api/carReceptionApi';
import ImagePreviewModal from "../../shared/modals/ImagePreviewModal";
import ImageEditModal from "../../shared/modals/ImageEditModal";

interface ProtocolGalleryProps {
    protocol: CarReceptionProtocol;
    onProtocolUpdate: (updatedProtocol: CarReceptionProtocol) => void;
}

const ProtocolGallery: React.FC<ProtocolGalleryProps> = ({ protocol, onProtocolUpdate }) => {
    const [images, setImages] = useState<VehicleImage[]>(protocol.vehicleImages || []);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUploadImage, setCurrentUploadImage] = useState<VehicleImage | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingImageIndex, setEditingImageIndex] = useState(-1);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Fetch images when component mounts
    useEffect(() => {
        if (!protocol.vehicleImages || protocol.vehicleImages.length === 0) {
            fetchImages();
        } else {
            setImages(protocol.vehicleImages);
        }
    }, [protocol.id, protocol.vehicleImages]);

    // Fetch images from API
    const fetchImages = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const fetchedImages = await carReceptionApi.fetchVehicleImages(protocol.id);
            setImages(fetchedImages);

            // Update protocol with fetched images
            if (fetchedImages.length > 0 && (!protocol.vehicleImages || protocol.vehicleImages.length === 0)) {
                const updatedProtocol = {
                    ...protocol,
                    vehicleImages: fetchedImages
                };
                onProtocolUpdate(updatedProtocol);
            }
        } catch (err) {
            console.error('Error fetching images:', err);
            setError('Wystąpił błąd podczas pobierania zdjęć. Spróbuj odświeżyć stronę.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handlers
    const handleImageClick = (index: number) => {
        setSelectedImageIndex(index);
        setShowPreviewModal(true);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            handleAddImages(event);

            // Reset input so the same file can be selected again if needed
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    // Function to handle adding new images
    const handleAddImages = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        const files = event.target.files;
        if (!files || files.length === 0) return;

        setError(null);

        // Convert FileList to array for easier processing
        const filesArray = Array.from(files);

        // Maximum file size (5MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024;

        // Check if all files are images and don't exceed size limit
        const invalidFiles = filesArray.filter(file =>
            !file.type.startsWith('image/') || file.size > MAX_FILE_SIZE
        );

        if (invalidFiles.length > 0) {
            setError(
                `Wykryto nieprawidłowe pliki. Akceptowane są tylko obrazy do ${MAX_FILE_SIZE / 1024 / 1024}MB.`
            );
            return;
        }

        // Obsługujemy tylko jeden plik na raz, zgodnie z API
        const file = filesArray[0];

        // Create temp image for preview with unique ID
        const tempImage: VehicleImage = {
            id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            url: URL.createObjectURL(file),
            name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
            size: file.size,
            type: file.type,
            createdAt: new Date().toISOString(),
            tags: [],
            file: file
        };

        // Set as current upload and add to images array
        setCurrentUploadImage(tempImage);
        setImages([...images, tempImage]);

        // Open modal to edit image info
        setEditingImageIndex(images.length);
        setEditModalOpen(true);
    };

    // Handle uploading the current image after editing
// Handle uploading the current image after editing
// Handle uploading the current image after editing
    const handleUploadCurrentImage = async () => {
        if (!currentUploadImage || !currentUploadImage.file) return;

        setIsLoading(true);
        setError(null);

        try {
            console.log('Przesyłanie obrazu z metadanymi:', currentUploadImage);

            // Upewniamy się, że wszystkie potrzebne metadane są ustawione
            const imageToUpload = {
                ...currentUploadImage,
                // Upewnij się, że nazwa i tagi są zdefiniowane
                name: currentUploadImage.name || currentUploadImage.file.name.replace(/\.[^/.]+$/, ""),
                tags: currentUploadImage.tags || []
            };

            // Użyj naszej nowej funkcji do przesyłania pojedynczego obrazu
            const uploadedImage = await carReceptionApi.uploadVehicleImage(protocol.id, imageToUpload);

            // Usuń tymczasowy obraz i dodaj nowy z serwera
            const updatedImages = [
                ...images.filter(img => !img.id.startsWith('temp_')),
                uploadedImage
            ];

            // Aktualizuj stan lokalny
            setImages(updatedImages);

            // Aktualizuj protokół w komponencie nadrzędnym
            const updatedProtocol = {
                ...protocol,
                vehicleImages: updatedImages
            };
            onProtocolUpdate(updatedProtocol);

            // Wyczyść bieżący obraz
            setCurrentUploadImage(null);
        } catch (err) {
            console.error('Error uploading image:', err);
            setError('Wystąpił błąd podczas przesyłania zdjęcia. Spróbuj ponownie.');

            // Usuń tymczasowy obraz ze stanu
            setImages(images.filter(img => !img.id.startsWith('temp_')));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveImageInfo = (newName: string, newTags: string[]) => {
        if (editingImageIndex >= 0 && editingImageIndex < images.length) {
            console.log('Zapisywanie informacji o obrazie:', { newName, newTags });

            // Pobierz obecny obraz
            const currentImage = images[editingImageIndex];
            console.log('Obecny obraz:', currentImage);

            // Tworzymy lokalne kopie obrazów do aktualizacji stanu
            const updatedImages = [...images];
            updatedImages[editingImageIndex] = {
                ...currentImage,
                name: newName,
                tags: newTags
            };

            // Aktualizujemy kolekcję obrazów w stanie lokalnym
            setImages(updatedImages);

            // Obsługa w zależności od tego, czy to tymczasowy czy istniejący obraz
            if (currentImage.id.startsWith('temp_') && currentUploadImage) {
                // Dla tymczasowych obrazów, które jeszcze nie zostały przesłane na serwer

                // Tworzymy kopię aktualnego obiektu z nowymi danymi
                const updatedUploadImage = {
                    ...currentUploadImage,
                    name: newName,
                    tags: newTags
                };

                console.log('Zaktualizowany obraz przed przesłaniem:', updatedUploadImage);
                setCurrentUploadImage(updatedUploadImage);

                // Zamykamy modal
                setEditModalOpen(false);
                setEditingImageIndex(-1);

                // Przesyłamy obraz z nowymi metadanymi
                setIsLoading(true);
                setError(null);

                // Używamy opóźnienia, aby mieć pewność, że stan został zaktualizowany
                setTimeout(() => {
                    carReceptionApi.uploadVehicleImage(protocol.id, updatedUploadImage)
                        .then(uploadedImage => {
                            console.log('Obraz przesłany pomyślnie:', uploadedImage);

                            // Aktualizujemy kolekcję obrazów, usuwając tymczasowy i dodając nowy
                            const finalImages = [
                                ...images.filter(img => !img.id.startsWith('temp_')),
                                uploadedImage
                            ];

                            setImages(finalImages);

                            // Aktualizujemy protokół w komponencie nadrzędnym
                            const updatedProtocol = {
                                ...protocol,
                                vehicleImages: finalImages
                            };
                            onProtocolUpdate(updatedProtocol);

                            // Czyszczenie
                            setCurrentUploadImage(null);
                        })
                        .catch(err => {
                            console.error('Błąd podczas przesyłania obrazu:', err);
                            setError('Wystąpił błąd podczas przesyłania zdjęcia. Spróbuj ponownie.');

                            // Usuwamy tymczasowy obraz w przypadku błędu
                            setImages(images.filter(img => !img.id.startsWith('temp_')));
                            setCurrentUploadImage(null);
                        })
                        .finally(() => {
                            setIsLoading(false);
                        });
                }, 100);
            } else if (!currentImage.id.startsWith('temp_')) {
                // Dla istniejących obrazów, które już są na serwerze

                // Zamykamy modal
                setEditModalOpen(false);
                setEditingImageIndex(-1);

                // Wywołanie API do aktualizacji metadanych
                setIsLoading(true);

                carReceptionApi.updateVehicleImage(protocol.id, currentImage.id, {
                    name: newName,
                    tags: newTags
                })
                    .then(updatedImage => {
                        if (updatedImage) {
                            console.log('Metadane obrazu zaktualizowane pomyślnie:', updatedImage);

                            // Znajdź index obrazu w kolekcji i zaktualizuj
                            const imageIndex = images.findIndex(img => img.id === updatedImage.id);
                            if (imageIndex !== -1) {
                                const finalImages = [...images];
                                finalImages[imageIndex] = updatedImage;

                                // Aktualizujemy stan lokalny
                                setImages(finalImages);

                                // Aktualizujemy protokół w komponencie nadrzędnym
                                const updatedProtocol = {
                                    ...protocol,
                                    vehicleImages: finalImages
                                };
                                onProtocolUpdate(updatedProtocol);
                            }
                        } else {
                            // W przypadku braku odpowiedzi, pozostaw zaktualizowany stan lokalny
                            console.warn('Brak odpowiedzi z serwera, zachowuję tylko stan lokalny');
                            onProtocolUpdate({
                                ...protocol,
                                vehicleImages: updatedImages
                            });
                        }
                    })
                    .catch(err => {
                        console.error('Błąd podczas aktualizacji metadanych obrazu:', err);
                        setError('Wystąpił błąd podczas aktualizacji informacji o zdjęciu.');

                        // Przywróć poprzedni stan w przypadku błędu
                        setImages([...images]);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            }
        }
    }


    const handleEditImage = (index: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening preview modal
        setEditingImageIndex(index);
        setEditModalOpen(true);
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć to zdjęcie?')) {
            return;
        }

        // Don't attempt to delete temporary images from the server
        if (imageId.startsWith('temp_')) {
            setImages(images.filter(img => img.id !== imageId));
            setCurrentUploadImage(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // API call to delete the image
            const success = await carReceptionApi.deleteVehicleImage(protocol.id, imageId);

            if (success) {
                // Remove from local state
                const updatedImages = images.filter(img => img.id !== imageId);
                setImages(updatedImages);

                // Update the protocol
                const updatedProtocol = {
                    ...protocol,
                    vehicleImages: updatedImages
                };

                onProtocolUpdate(updatedProtocol);
            } else {
                setError('Nie udało się usunąć zdjęcia. Spróbuj ponownie.');
            }
        } catch (err) {
            console.error('Error deleting image:', err);
            setError('Wystąpił błąd podczas usuwania zdjęcia.');
        } finally {
            setIsLoading(false);
        }
    };

    const getImageUrl = (image: VehicleImage): string => {
        // If the image has a URL (for example, from a temporary ObjectURL), use it
        if (image.url) return image.url;

        // Otherwise, construct URL from the API
        if (image.id) {
            return `${apiClient.getBaseUrl()}/receptions/image/${image.id}`;
        }

        return ''; // Fallback
    };

    const handleUploadClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleCameraClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (cameraInputRef.current) {
            cameraInputRef.current.click();
        }
    };

    // Format file size to readable format
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <GalleryContainer>
            <GalleryHeader>
                <GalleryTitle>
                    <FaCamera /> Zdjęcia pojazdu
                </GalleryTitle>
                <GalleryActions>
                    <UploadButton onClick={handleUploadClick} disabled={isLoading}>
                        <FaUpload /> Dodaj zdjęcie
                    </UploadButton>
                    <CameraButton onClick={handleCameraClick} disabled={isLoading}>
                        <FaCamera /> Zrób zdjęcie
                    </CameraButton>
                    <input
                        id="file-upload"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    <input
                        id="camera-upload"
                        type="file"
                        ref={cameraInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        capture="environment"
                        style={{ display: 'none' }}
                    />
                </GalleryActions>
            </GalleryHeader>

            {error && <ErrorMessage><FaExclamationCircle /> {error}</ErrorMessage>}

            {/* Upload progress */}
            {isLoading && currentUploadImage && (
                <UploadingMessage>
                    <FaSpinner /> Przesyłanie zdjęcia...
                </UploadingMessage>
            )}

            {/* Gallery section */}
            {isLoading && images.length === 0 ? (
                <LoadingContainer>
                    <FaSpinner /> Ładowanie zdjęć...
                </LoadingContainer>
            ) : images.length > 0 ? (
                <GalleryGrid>
                    {images.map((image, index) => (
                        <GalleryItem key={image.id || index} className={image.id.startsWith('temp_') ? 'temp-image' : ''}>
                            <ImageContainer onClick={() => handleImageClick(index)}>
                                <StyledImage src={getImageUrl(image)} alt={image.name || `Zdjęcie ${index + 1}`} />
                                {image.id.startsWith('temp_') && (
                                    <TempBadge>Przygotowywanie</TempBadge>
                                )}
                            </ImageContainer>
                            <ImageInfo>
                                <ImageNameContainer>
                                    <ImageName>{image.name || `Zdjęcie ${index + 1}`}</ImageName>
                                    <EditButton onClick={(e) => handleEditImage(index, e)}>
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
                            <RemoveButton onClick={() => handleDeleteImage(image.id)}>
                                <FaTrash />
                            </RemoveButton>
                        </GalleryItem>
                    ))}
                </GalleryGrid>
            ) : (
                <EmptyGallery>
                    <EmptyGalleryIcon><FaCamera /></EmptyGalleryIcon>
                    <EmptyGalleryMessage>Brak zdjęć dla tego pojazdu</EmptyGalleryMessage>
                    <EmptyGalleryAction onClick={handleUploadClick}>
                        <FaPlus /> Dodaj pierwsze zdjęcie
                    </EmptyGalleryAction>
                </EmptyGallery>
            )}

            {/* Image preview modal */}
            <ImagePreviewModal
                isOpen={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                images={images}
                currentImageIndex={selectedImageIndex}
                onDelete={handleDeleteImage}
            />

            {/* Image edit modal */}
            {editingImageIndex >= 0 && editingImageIndex < images.length && (
                <ImageEditModal
                    isOpen={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        setEditingImageIndex(-1);

                        // When the user closes the modal, abort the operation for temp images
                        if (currentUploadImage) {
                            setImages(images.filter(img => !img.id.startsWith('temp_')));
                            setCurrentUploadImage(null);
                        }
                    }}
                    onSave={handleSaveImageInfo}
                    initialName={images[editingImageIndex].name || ''}
                    initialTags={images[editingImageIndex].tags || []}
                    imageUrl={getImageUrl(images[editingImageIndex])}
                />
            )}
        </GalleryContainer>
    );
};

// Stylowanie komponentów
const GalleryContainer = styled.div`
    margin-bottom: 30px;
`;

const GalleryHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const GalleryTitle = styled.h3`
    font-size: 16px;
    margin: 0 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
    color: #3498db;
`;

const GalleryActions = styled.div`
    display: flex;
    gap: 10px;
`;

const UploadButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background-color: #f0f7ff;
    color: #3498db;
    border: 1px solid #d5e9f9;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;

    &:hover:not(:disabled) {
        background-color: #d5e9f9;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const CameraButton = styled(UploadButton)`
    background-color: #f4f9f0;
    color: #27ae60;
    border-color: #c8e6c9;

    &:hover:not(:disabled) {
        background-color: #c8e6c9;
    }
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

const UploadingMessage = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #e1f5fe;
    color: #0288d1;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 10px;
    font-size: 14px;
`;

const LoadingContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #7f8c8d;
    gap: 8px;
`;

const GalleryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;

    .temp-image {
        opacity: 0.8;
        border-color: #3498db;
        box-shadow: 0 0 0 1px #3498db;
    }
`;

const GalleryItem = styled.div`
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    background-color: white;
    transition: all 0.2s ease;

    &:hover {
        border-color: #3498db;
    }
`;

const ImageContainer = styled.div`
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

const TempBadge = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(52, 152, 219, 0.8);
    color: white;
    padding: 4px 8px;
    font-size: 11px;
    text-align: center;
`;

const StyledImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
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

const EmptyGallery = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    background-color: #f9f9f9;
    border-radius: 8px;
    color: #95a5a6;
    text-align: center;
`;

const EmptyGalleryIcon = styled.div`
    font-size: 32px;
    margin-bottom: 10px;
    opacity: 0.5;
`;

const EmptyGalleryMessage = styled.div`
    margin: 0;
    font-size: 14px;
`;

const EmptyGalleryAction = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    margin-top: 15px;

    &:hover {
        background-color: #2980b9;
    }
`;

const FaSpinner = styled.div`
    display: inline-block;
    width: 1em;
    height: 1em;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: #3498db;
    animation: spin 1s ease-in-out infinite;

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

export default ProtocolGallery;