// src/pages/Clients/components/VehicleDetailPage/VehicleGallerySection.tsx
import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { FaCamera, FaChevronLeft, FaChevronRight, FaPlus, FaEye, FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import { SidebarSection, SidebarSectionTitle, EmptyMessage, EmptyIcon, EmptyText } from './VehicleDetailStyles';
import { carReceptionApi } from "../../../../api/carReceptionApi";
import { theme } from "../../../../styles/theme";
import VehicleImageUploadModal from './VehicleImageUploadModal';
import SimpleImagePreviewModal from './SimpleImagePreviewModal';
import ImageEditModal from './ImageEditModal';
import { vehicleApi } from "../../../../api/vehiclesApi";
import vehicleImageApi from "../../../../api/vehicleImageApi";

interface VehicleImage {
    id: string;
    url: string;
    thumbnailUrl: string;
    filename: string;
    uploadedAt: string;
    blobUrl?: string;
    name?: string;
    tags?: string[];
    description?: string;
    protocolId?: string;
    protocolTitle?: string;
    clientName?: string;
    vehicleInfo?: string;
    size?: number;
    createdAt?: string;
}

interface VehicleGallerySectionProps {
    vehicleId: string | undefined;
    vehicleInfo?: {
        make: string;
        model: string;
        licensePlate: string;
    };
}

const VehicleGallerySection: React.FC<VehicleGallerySectionProps> = ({
                                                                         vehicleId,
                                                                         vehicleInfo = { make: 'Unknown', model: 'Unknown', licensePlate: 'Unknown' }
                                                                     }) => {
    const [images, setImages] = useState<VehicleImage[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
    const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

    // Modal states
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<VehicleImage | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');

    useEffect(() => {
        loadImages();

        // Cleanup function to revoke blob URLs
        return () => {
            imageUrls.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [vehicleId]);

    const loadImages = async () => {
        if (!vehicleId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await vehicleApi.fetchVehicleImages(vehicleId, { page: 0, size: 10 });
            const imageList = response.data || [];

            setImages(imageList);
            setCurrentIndex(0);

            // Załaduj autoryzowane URL-e dla wszystkich obrazów
            if (imageList.length > 0) {
                loadAuthorizedImageUrls(imageList);
            }
        } catch (err) {
            console.error('Error loading vehicle images:', err);
            setError('Nie udało się załadować zdjęć');
            setImages([]);
        } finally {
            setLoading(false);
        }
    };

    const loadAuthorizedImageUrls = async (imageList: VehicleImage[]) => {
        const newUrls = new Map<string, string>();
        const newLoadingSet = new Set(imageList.map(img => img.id));

        setLoadingImages(newLoadingSet);

        // Równoległe ładowanie wszystkich obrazów
        const imagePromises = imageList.map(async (image) => {
            try {
                const blobUrl = await carReceptionApi.fetchAuthorizedImageUrl(image.id);
                if (blobUrl) {
                    newUrls.set(image.id, blobUrl);
                }
            } catch (error) {
                console.error(`Failed to load image ${image.id}:`, error);
                newUrls.set(image.id, '/images/image-placeholder.png');
            } finally {
                setLoadingImages(prev => {
                    const updated = new Set(prev);
                    updated.delete(image.id);
                    return updated;
                });
            }
        });

        await Promise.all(imagePromises);

        setImageUrls(prevUrls => {
            // Zwolnij poprzednie blob URLs
            prevUrls.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
            return newUrls;
        });
    };

    const getCurrentImageUrl = useCallback((image: VehicleImage): string => {
        const authorizedUrl = imageUrls.get(image.id);
        if (authorizedUrl) {
            return authorizedUrl;
        }
        return '/images/image-placeholder.png';
    }, [imageUrls]);

    const isImageLoading = useCallback((imageId: string): boolean => {
        return loadingImages.has(imageId);
    }, [loadingImages]);

    // Navigation handlers
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

    // Upload handlers
    const handleOpenUploadModal = () => {
        setShowUploadModal(true);
    };

    const handleCloseUploadModal = () => {
        setShowUploadModal(false);
    };

    const handleUploadSuccess = () => {
        console.log('✅ Images uploaded successfully, reloading gallery...');
        loadImages();
    };

    // Preview handlers
    const handlePreviewImage = (image: VehicleImage) => {
        const imageUrl = getCurrentImageUrl(image);
        setSelectedImage(image);
        setSelectedImageUrl(imageUrl);
        setShowPreviewModal(true);
    };

    const handleClosePreviewModal = () => {
        setShowPreviewModal(false);
        setSelectedImage(null);
        setSelectedImageUrl('');
    };

    // Edit handlers
    const handleEditImage = (image: VehicleImage) => {
        const imageUrl = getCurrentImageUrl(image);
        setSelectedImage(image);
        setSelectedImageUrl(imageUrl);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedImage(null);
        setSelectedImageUrl('');
    };

    const handleEditSave = (updatedImage: VehicleImage) => {
        // Update the image in the current images list
        setImages(prev =>
            prev.map(img =>
                img.id === updatedImage.id
                    ? { ...img, tags: updatedImage.tags, name: updatedImage.name }
                    : img
            )
        );
        console.log('✅ Image updated successfully');
    };

    // Delete handler
    const handleDeleteImage = async (image: VehicleImage) => {
        if (!vehicleId) return;

        const confirmed = window.confirm(`Czy na pewno chcesz usunąć zdjęcie "${image.filename}"?`);
        if (!confirmed) return;

        try {
            console.log('🗑️ Deleting image:', image.id);
            await vehicleImageApi.deleteVehicleImage(vehicleId, image.id);

            // Reload images after successful deletion
            await loadImages();

            console.log('✅ Image deleted successfully');
        } catch (error) {
            console.error('❌ Error deleting image:', error);
            alert('Nie udało się usunąć zdjęcia. Spróbuj ponownie.');
        }
    };

    // Download handler
    const handleDownloadImage = async (image: VehicleImage) => {
        try {
            console.log('💾 Downloading image:', image.id);

            const imageUrl = getCurrentImageUrl(image);
            if (!imageUrl || imageUrl === '/images/image-placeholder.png') {
                alert('Nie można pobrać tego zdjęcia.');
                return;
            }

            // Create download link
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = image.filename || `image-${image.id}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('✅ Image download initiated');
        } catch (error) {
            console.error('❌ Error downloading image:', error);
            alert('Nie udało się pobrać zdjęcia.');
        }
    };

    // Loading state
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

    const formatDateFromArray = (dateArray: number[] | string): string => {
        if (!dateArray) return '-';

        if (Array.isArray(dateArray) && dateArray.length >= 3) {
            // Backend returns [year, month, day] - month is 1-based in backend
            const [year, month, day] = dateArray;
            const date = new Date(year, month - 1, day); // month is 0-based in JS Date
            return date.toLocaleDateString('pl-PL');
        }

        if (typeof dateArray === 'string') {
            return new Date(dateArray).toLocaleDateString('pl-PL');
        }

        return '-';
    };

    // Error state
    if (error || !vehicleId) {
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
                    <AddImageButton onClick={handleOpenUploadModal}>
                        <FaPlus />
                        Dodaj zdjęcie
                    </AddImageButton>
                )}
                {vehicleId && (
                    <VehicleImageUploadModal
                        isOpen={showUploadModal}
                        onClose={handleCloseUploadModal}
                        onSuccess={handleUploadSuccess}
                        vehicleId={vehicleId}
                        vehicleInfo={vehicleInfo}
                    />
                )}
            </SidebarSection>
        );
    }

    // Empty state
    if (images.length === 0) {
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
                    <EmptyText>Brak zdjęć pojazdu</EmptyText>
                </EmptyMessage>
                <AddImageButton onClick={handleOpenUploadModal}>
                    <FaPlus />
                    Dodaj pierwsze zdjęcie
                </AddImageButton>

                {vehicleId && (
                    <VehicleImageUploadModal
                        isOpen={showUploadModal}
                        onClose={handleCloseUploadModal}
                        onSuccess={handleUploadSuccess}
                        vehicleId={vehicleId}
                        vehicleInfo={vehicleInfo}
                    />
                )}
            </SidebarSection>
        );
    }

    const currentImage = images[currentIndex];
    const currentImageUrl = getCurrentImageUrl(currentImage);
    const isCurrentImageLoading = isImageLoading(currentImage.id);

    // Main gallery view
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
                        {isCurrentImageLoading && (
                            <ImageLoadingOverlay>
                                <ImageLoadingSpinner />
                                <ImageLoadingText>Ładowanie obrazu...</ImageLoadingText>
                            </ImageLoadingOverlay>
                        )}
                        <VehicleImage
                            src={currentImageUrl}
                            alt={`Zdjęcie pojazdu ${currentIndex + 1}`}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src !== '/images/image-placeholder.png') {
                                    target.src = '/images/image-placeholder.png';
                                }
                            }}
                            $loading={isCurrentImageLoading}
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

                {/* Action buttons moved below image */}
                <ImageActionsContainer>
                    <ImageActionButton
                        onClick={() => handlePreviewImage(currentImage)}
                        title="Podgląd na pełnym ekranie"
                        $variant="preview"
                    >
                        <FaEye />
                    </ImageActionButton>
                    <ImageActionButton
                        onClick={() => handleEditImage(currentImage)}
                        title="Edytuj zdjęcie"
                        $variant="edit"
                    >
                        <FaEdit />
                    </ImageActionButton>
                    <ImageActionButton
                        onClick={() => handleDownloadImage(currentImage)}
                        title="Pobierz zdjęcie"
                        $variant="download"
                    >
                        <FaDownload />
                    </ImageActionButton>
                    <ImageActionButton
                        onClick={() => handleDeleteImage(currentImage)}
                        title="Usuń zdjęcie"
                        $variant="delete"
                    >
                        <FaTrash />
                    </ImageActionButton>
                </ImageActionsContainer>

                <ImageInfo>
                    <ImageFilename>{currentImage.filename}</ImageFilename>
                    <ImageDate>
                        Utworzono dnia: {formatDateFromArray(currentImage.uploadedAt)}
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

            <AddImageButton onClick={handleOpenUploadModal}>
                <FaPlus />
                Dodaj zdjęcie
            </AddImageButton>

            {/* Modals */}
            {vehicleId && (
                <>
                    <VehicleImageUploadModal
                        isOpen={showUploadModal}
                        onClose={handleCloseUploadModal}
                        onSuccess={handleUploadSuccess}
                        vehicleId={vehicleId}
                        vehicleInfo={vehicleInfo}
                    />

                    <SimpleImagePreviewModal
                        isOpen={showPreviewModal}
                        image={selectedImage}
                        imageUrl={selectedImageUrl}
                        onClose={handleClosePreviewModal}
                    />

                    <ImageEditModal
                        isOpen={showEditModal}
                        image={selectedImage}
                        imageUrl={selectedImageUrl}
                        onClose={handleCloseEditModal}
                        onSave={handleEditSave}
                    />
                </>
            )}
        </SidebarSection>
    );
};

// Styled Components
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
    z-index: 3;
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

const ImageLoadingOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};
    z-index: 1;
    border-radius: ${theme.radius.md};
`;

const ImageLoadingSpinner = styled.div`
    width: 20px;
    height: 20px;
    border: 2px solid ${theme.borderLight};
    border-top: 2px solid ${theme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
`;

const ImageLoadingText = styled.div`
    font-size: 11px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const VehicleImage = styled.img<{ $loading?: boolean }>`
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
    border-radius: ${theme.radius.md};
    transition: opacity 0.3s ease;
    opacity: ${props => props.$loading ? 0.5 : 1};
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
    z-index: 2;
`;

const ImageCounter = styled.span`
    font-family: 'Monaco', 'Consolas', monospace;
`;

const ImageActionsContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} 0;
    border-bottom: 1px solid ${theme.border};
`;

const ImageActionButton = styled.button<{ $variant: 'preview' | 'edit' | 'download' | 'delete' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: ${theme.radius.md};
    cursor: pointer;
    transition: all ${theme.transitions.fast};
    box-shadow: ${theme.shadow.sm};
    font-size: 14px;

    ${props => {
        switch (props.$variant) {
            case 'preview':
                return `
                    background: #2196f3;
                    color: white;
                    &:hover {
                        background: #1976d2;
                        transform: translateY(-2px);
                        box-shadow: ${theme.shadow.md};
                    }
                `;
            case 'edit':
                return `
                    background: #ff9800;
                    color: white;
                    &:hover {
                        background: #f57c00;
                        transform: translateY(-2px);
                        box-shadow: ${theme.shadow.md};
                    }
                `;
            case 'download':
                return `
                    background: #4caf50;
                    color: white;
                    &:hover {
                        background: #388e3c;
                        transform: translateY(-2px);
                        box-shadow: ${theme.shadow.md};
                    }
                `;
            case 'delete':
                return `
                    background: #f44336;
                    color: white;
                    &:hover {
                        background: #d32f2f;
                        transform: translateY(-2px);
                        box-shadow: ${theme.shadow.md};
                    }
                `;
            default:
                return `
                    background: ${theme.surface};
                    color: ${theme.text.primary};
                    border: 1px solid ${theme.border};
                    &:hover {
                        background: ${theme.surfaceHover};
                        transform: translateY(-2px);
                        box-shadow: ${theme.shadow.md};
                    }
                `;
        }
    }}
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