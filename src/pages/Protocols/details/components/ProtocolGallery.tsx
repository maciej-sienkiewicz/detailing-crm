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
    FaTags, FaPlus
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
    const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Add state for the image edit modal
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingImageIndex, setEditingImageIndex] = useState(-1);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Fetch images when component mounts
    useEffect(() => {
        // Try to get images if protocol.vehicleImages is empty or doesn't exist
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
            // Process files and open edit modal for the first one
            handleAddImages(event);

            // Reset input so the same file can be selected again if needed
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    // Function to handle adding new images
    const handleAddImages = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Prevent default browser action that might cause form submission
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

        // Set these files as the uploading files (they'll be sent to server after modal confirmation)
        setUploadingFiles(filesArray);

        // Convert files to VehicleImage objects for preview only
        const newImages: VehicleImage[] = [];

        filesArray.forEach(file => {
            // Create URL for image preview
            const imageUrl = URL.createObjectURL(file);

            // Prepare name - remove file extension
            const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

            // Add new image to array
            newImages.push({
                id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                url: imageUrl,
                name: fileNameWithoutExt, // Use name without extension as initial name
                size: file.size,
                type: file.type,
                createdAt: new Date().toISOString(),
                tags: [], // Initialize empty tags array
                file: file // Add reference to original file
            });
        });

        // Add temporary preview images to the state
        if (newImages.length > 0) {
            const updatedImages = [...images, ...newImages];
            setImages(updatedImages);

            // Open modal to edit information for the first new image
            setEditingImageIndex(images.length); // Index of the first new image
            setEditModalOpen(true);
        }
    };

    const handleUpload = async () => {
        if (uploadingFiles.length === 0) return;

        setIsLoading(true);
        setError(null);

        try {
            // Get temporary images that were already added to the UI
            const tempImages = images.filter(img => img.id.startsWith('temp_'));

            // Create a map of temporary images by file name to retrieve their names and tags
            const tempImageMap = new Map(
                tempImages.map(img => [
                    img.file?.name || '',
                    { name: img.name, tags: img.tags || [] }
                ])
            );

            // Create FormData for upload
            const formData = new FormData();

            // Add each file to formData
            uploadingFiles.forEach((file, index) => {
                formData.append(`images[${index}]`, file);
            });

            // Add metadata for each file if we want to send that to the server
            // This would require backend support for this format
            const imageMetadata = uploadingFiles.map((file, index) => {
                const tempImageInfo = tempImageMap.get(file.name);
                return {
                    index,
                    name: tempImageInfo?.name || file.name.replace(/\.[^/.]+$/, ""),
                    tags: tempImageInfo?.tags || []
                };
            });

            // If your API supports sending metadata along with the files
            // formData.append('metadata', JSON.stringify(imageMetadata));

            // Upload using API
            const uploadedImages = await carReceptionApi.addVehicleImages(protocol.id, uploadingFiles);

            // Update the uploaded images with the names and tags from temporary images
            const finalImages = uploadedImages.map(serverImage => {
                // Try to find corresponding temp image by matching file names or other properties
                const matchingTempImage = tempImages.find(
                    tempImg => tempImg.file?.name === serverImage.name ||
                        tempImg.name === serverImage.name
                );

                if (matchingTempImage) {
                    return {
                        ...serverImage,
                        name: matchingTempImage.name,
                        tags: matchingTempImage.tags
                    };
                }

                return serverImage;
            });

            // Update the protocol with the new images
            const updatedImages = [...images.filter(img => !img.id.startsWith('temp_')), ...finalImages];
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

    const handleSaveImageInfo = (newName: string, newTags: string[]) => {
        if (editingImageIndex >= 0 && editingImageIndex < images.length) {
            const updatedImages = [...images];
            updatedImages[editingImageIndex] = {
                ...updatedImages[editingImageIndex],
                name: newName,
                tags: newTags
            };
            setImages(updatedImages);

            // Check if this is a temp image (one of the newly added ones)
            const isTemp = updatedImages[editingImageIndex].id.startsWith('temp_');

            // Check if we should process more new images
            const nextTempIndex = images.findIndex((img, idx) =>
                idx > editingImageIndex && img.id.startsWith('temp_')
            );

            if (nextTempIndex !== -1) {
                // Move to the next temporary image
                setEditingImageIndex(nextTempIndex);
            } else {
                // All images processed, if we were working with temp images, upload them
                if (isTemp && uploadingFiles.length > 0) {
                    handleUpload();
                }
                setEditModalOpen(false);
                setEditingImageIndex(-1);
            }
        }
    };

    const handleEditImage = (index: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening preview modal
        setEditingImageIndex(index);
        setEditModalOpen(true);
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
                    <UploadButton onClick={handleUploadClick}>
                        <FaUpload /> Dodaj zdjęcia
                    </UploadButton>
                    <input
                        id="file-upload"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        multiple
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

                        // When the user closes the modal, completely abort the operation
                        // Remove all temporary images and clear upload queue
                        setImages(images.filter(img => !img.id.startsWith('temp_')));
                        setUploadingFiles([]);
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

    &:hover {
        background-color: #d5e9f9;
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

const GalleryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
`;

const GalleryItem = styled.div`
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    background-color: white;

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

const FaTimesCircle = styled(FaEdit)`
    /* Replacement for FaTimesCircle which may not be imported */
`;

const FaSpinner = styled.div`
    display: inline-block;
    width: 1em;
    height: 1em;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
    margin-right: 0.5em;

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

export default ProtocolGallery;