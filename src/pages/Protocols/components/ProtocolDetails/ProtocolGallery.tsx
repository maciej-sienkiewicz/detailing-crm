import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaCamera,
    FaPlus,
    FaUpload,
    FaDownload,
    FaTrashAlt,
    FaSpinner,
    FaTimesCircle,
    FaImage
} from 'react-icons/fa';
import { CarReceptionProtocol, VehicleImage } from '../../../../types';
import ImagePreviewModal from '../ImagePreviewModal';
import { apiClient } from '../../../../api/apiClient';
import { carReceptionApi } from '../../../../api/carReceptionApi';

interface ProtocolGalleryProps {
    protocol: CarReceptionProtocol;
    onProtocolUpdate: (updatedProtocol: CarReceptionProtocol) => void;
}

const ProtocolGallery: React.FC<ProtocolGalleryProps> = ({ protocol, onProtocolUpdate }) => {
    const [images, setImages] = useState<VehicleImage[]>(protocol.vehicleImages || []);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Fetch images when component mounts
    useEffect(() => {
        // Spróbuj pobrać zdjęcia, jeśli protocol.vehicleImages jest puste lub nie istnieje
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

            // Aktualizuj protokół z pobranymi zdjęciami
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
            const newFiles = Array.from(event.target.files);
            setUploadingFiles([...uploadingFiles, ...newFiles]);
        }
    };

    const handleUpload = async () => {
        if (uploadingFiles.length === 0) return;

        setIsLoading(true);
        setError(null);

        try {
            // Create temporary file uploads for UI
            const newImages: VehicleImage[] = uploadingFiles.map((file, index) => ({
                id: `temp_${Date.now()}_${index}`,
                url: URL.createObjectURL(file),
                name: file.name,
                size: file.size,
                type: file.type,
                createdAt: new Date().toISOString(),
                file: file, // Attach the file for upload
                protocolId: protocol.id
            }));

            // Update local state to show images immediately (with temporary URLs)
            setImages([...images, ...newImages]);

            // Prepare FormData
            const formData = new FormData();

            // Add each file to the FormData
            uploadingFiles.forEach((file, index) => {
                formData.append(`images[${index}]`, file);
            });

            // Upload using API
            const uploadedImages = await carReceptionApi.addVehicleImages(protocol.id, uploadingFiles);

            // Update the protocol with the new images
            const updatedImages = [...images.filter(img => !img.id.startsWith('temp_')), ...uploadedImages];
            const updatedProtocol = {
                ...protocol,
                vehicleImages: updatedImages
            };

            // Update parent component with new protocol data
            onProtocolUpdate(updatedProtocol);

            // Update local state with the proper image data from the server
            setImages(updatedImages);

            // Clear upload state
            setUploadingFiles([]);

        } catch (err) {
            console.error('Error uploading images:', err);
            setError('Wystąpił błąd podczas przesyłania zdjęć. Spróbuj ponownie.');

            // Remove temporary images from state
            setImages(images.filter(img => !img.id.startsWith('temp_')));
        } finally {
            setIsLoading(false);
        }
    };

    const cancelUpload = (index: number) => {
        const newFiles = [...uploadingFiles];
        newFiles.splice(index, 1);
        setUploadingFiles(newFiles);
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć to zdjęcie?')) {
            return;
        }

        // Don't attempt to delete temporary images from the server
        if (imageId.startsWith('temp_')) {
            setImages(images.filter(img => img.id !== imageId));
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
            return `${apiClient.getBaseUrl()}/receptions/${protocol.id}/images/${image.id}`;
        }

        return ''; // Fallback
    };

    return (
        <GalleryContainer>
            <GalleryHeader>
                <GalleryTitle>
                    <FaCamera /> Zdjęcia pojazdu
                </GalleryTitle>
                <GalleryActions>
                    <UploadButton onClick={() => document.getElementById('file-upload')?.click()}>
                        <FaUpload /> Dodaj zdjęcia
                    </UploadButton>
                    <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                </GalleryActions>
            </GalleryHeader>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            {/* Pending uploads section */}
            {uploadingFiles.length > 0 && (
                <UploadsSection>
                    <SectionTitle>Zdjęcia do przesłania</SectionTitle>
                    <PendingUploads>
                        {uploadingFiles.map((file, index) => (
                            <PendingUploadItem key={`${file.name}_${index}`}>
                                <PendingUploadPreview>
                                    <FaImage />
                                </PendingUploadPreview>
                                <PendingUploadInfo>
                                    <PendingUploadName>{file.name}</PendingUploadName>
                                    <PendingUploadSize>{formatFileSize(file.size)}</PendingUploadSize>
                                </PendingUploadInfo>
                                <CancelUploadButton onClick={() => cancelUpload(index)}>
                                    <FaTimesCircle />
                                </CancelUploadButton>
                            </PendingUploadItem>
                        ))}
                    </PendingUploads>
                    <UploadActionsBar>
                        <TotalFilesInfo>{uploadingFiles.length} {uploadingFiles.length === 1 ? 'plik' : 'plików'} do przesłania</TotalFilesInfo>
                        <UploadButtonMain onClick={handleUpload} disabled={isLoading}>
                            {isLoading ? <FaSpinner className="spinner" /> : <FaUpload />}
                            {isLoading ? 'Przesyłanie...' : 'Prześlij wszystkie'}
                        </UploadButtonMain>
                    </UploadActionsBar>
                </UploadsSection>
            )}

            {/* Gallery section */}
            {isLoading && images.length === 0 ? (
                <LoadingContainer>
                    <FaSpinner className="spinner" /> Ładowanie zdjęć...
                </LoadingContainer>
            ) : images.length > 0 ? (
                <GalleryGrid>
                    {images.map((image, index) => (
                        <GalleryItem key={image.id || index}>
                            <ImageContainer onClick={() => handleImageClick(index)}>
                                <StyledImage src={getImageUrl(image)} alt={image.name || `Zdjęcie ${index + 1}`} />
                            </ImageContainer>
                            <ImageInfo>
                                <ImageName>{image.name || `Zdjęcie ${index + 1}`}</ImageName>
                                <ImageActions>
                                    <ImageActionButton
                                        title="Pobierz zdjęcie"
                                        onClick={() => window.open(getImageUrl(image), '_blank')}
                                    >
                                        <FaDownload />
                                    </ImageActionButton>
                                    <ImageActionButton
                                        title="Usuń zdjęcie"
                                        onClick={() => handleDeleteImage(image.id)}
                                        danger
                                    >
                                        <FaTrashAlt />
                                    </ImageActionButton>
                                </ImageActions>
                            </ImageInfo>
                        </GalleryItem>
                    ))}
                </GalleryGrid>
            ) : (
                <EmptyGallery>
                    <EmptyGalleryIcon><FaCamera /></EmptyGalleryIcon>
                    <EmptyGalleryMessage>Brak zdjęć dla tego pojazdu</EmptyGalleryMessage>
                    <EmptyGalleryAction onClick={() => document.getElementById('file-upload')?.click()}>
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
        </GalleryContainer>
    );
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Styled components
const GalleryContainer = styled.div``;

const GalleryHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const GalleryTitle = styled.h3`
    font-size: 16px;
    margin: 0;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 8px;
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

    &:hover {
        background-color: #d5e9f9;
    }
`;

const ErrorMessage = styled.div`
    background-color: #fdecea;
    color: #e74c3c;
    padding: 10px 15px;
    border-radius: 4px;
    margin-bottom: 15px;
    font-size: 14px;
`;

const LoadingContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #7f8c8d;

    .spinner {
        animation: spin 1s linear infinite;
        margin-right: 10px;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const UploadsSection = styled.div`
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 20px;
`;

const SectionTitle = styled.div`
    font-weight: 500;
    font-size: 14px;
    color: #34495e;
    margin-bottom: 10px;
`;

const PendingUploads = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
`;

const PendingUploadItem = styled.div`
    display: flex;
    align-items: center;
    background-color: white;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 10px;
`;

const PendingUploadPreview = styled.div`
    width: 40px;
    height: 40px;
    background-color: #f0f7ff;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3498db;
    margin-right: 15px;
`;

const PendingUploadInfo = styled.div`
    flex: 1;
`;

const PendingUploadName = styled.div`
    font-size: 14px;
    color: #34495e;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
`;

const PendingUploadSize = styled.div`
    font-size: 12px;
    color: #7f8c8d;
`;

const CancelUploadButton = styled.button`
    background: none;
    border: none;
    color: #e74c3c;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        color: #c0392b;
    }
`;

const UploadActionsBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const TotalFilesInfo = styled.div`
    font-size: 13px;
    color: #7f8c8d;
`;

const UploadButtonMain = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 15px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;

    &:hover:not(:disabled) {
        background-color: #2980b9;
    }

    &:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
    }

    .spinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const GalleryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
`;

const GalleryItem = styled.div`
    background-color: white;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ImageContainer = styled.div`
    height: 150px;
    cursor: pointer;
    overflow: hidden;
    position: relative;

    &:hover::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.1);
    }
`;

const StyledImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const ImageInfo = styled.div`
    padding: 10px;
`;

const ImageName = styled.div`
    font-size: 13px;
    color: #34495e;
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ImageActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
`;

const ImageActionButton = styled.button<{ danger?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: ${props => props.danger ? '#fef5f5' : '#f0f7ff'};
    color: ${props => props.danger ? '#e74c3c' : '#3498db'};
    border: 1px solid ${props => props.danger ? '#fde8e8' : '#d5e9f9'};
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: ${props => props.danger ? '#fde8e8' : '#d5e9f9'};
    }
`;

const EmptyGallery = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 40px 20px;
    text-align: center;
`;

const EmptyGalleryIcon = styled.div`
    font-size: 32px;
    color: #bdc3c7;
    margin-bottom: 15px;
`;

const EmptyGalleryMessage = styled.div`
    font-size: 15px;
    color: #7f8c8d;
    margin-bottom: 20px;
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

    &:hover {
        background-color: #2980b9;
    }
`;

export default ProtocolGallery;