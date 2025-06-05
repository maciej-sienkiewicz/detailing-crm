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
    FaTags,
    FaPlus,
    FaTimes,
    FaFileImage
} from 'react-icons/fa';
import { CarReceptionProtocol, VehicleImage } from '../../../../types';
import { apiClient } from '../../../../api/apiClient';
import { carReceptionApi } from '../../../../api/carReceptionApi';
import ImagePreviewModal from "../../shared/modals/ImagePreviewModal";
import ImageEditModal from "../../shared/modals/ImageEditModal";

// Enterprise Design System - Professional Automotive Gallery
const enterprise = {
    // Brand Color System
    primary: 'var(--brand-primary, #2563eb)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',

    // Professional Surfaces
    surface: '#ffffff',
    surfaceSecondary: '#f8fafc',
    surfaceTertiary: '#f1f5f9',

    // Executive Typography
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',

    // Professional Borders & States
    border: '#e2e8f0',
    borderLight: '#f1f5f9',

    // Status Colors
    success: '#059669',
    successBg: '#ecfdf5',
    warning: '#d97706',
    warningBg: '#fffbeb',
    error: '#dc2626',
    errorBg: '#fef2f2',

    // Enterprise Spacing
    space: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    // Professional Typography Scale
    fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px'
    },

    // Enterprise Shadows
    shadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    radius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px'
    }
};

interface ProtocolGalleryProps {
    protocol: CarReceptionProtocol;
    onProtocolUpdate: (updatedProtocol: CarReceptionProtocol) => void;
    disabled: boolean;
}

const ProtocolGallery: React.FC<ProtocolGalleryProps> = ({ protocol, onProtocolUpdate, disabled = false }) => {
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
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchImages = async () => {
            console.log('ProtocolGallery - Fetching images, count:',
                images.filter(img => !img.id.startsWith('temp_') && !imageUrls[img.id]).length);
            console.log('Auth token present:', !!apiClient.getAuthToken());

            const imagesToFetch = images
                .filter(img => !img.id.startsWith('temp_') && !imageUrls[img.id]);

            if (imagesToFetch.length === 0) return;

            const fetchPromises = imagesToFetch.map(async (image) => {
                try {
                    const imageUrl = await carReceptionApi.fetchVehicleImageAsUrl(image.id);
                    return { id: image.id, url: imageUrl };
                } catch (error) {
                    console.error(`Błąd podczas pobierania URL dla obrazu ${image.id}:`, error);
                    return { id: image.id, url: '' };
                }
            });

            const results = await Promise.all(fetchPromises);

            const newUrls = results.reduce((acc, { id, url }) => {
                if (url) acc[id] = url;
                return acc;
            }, {} as Record<string, string>);

            setImageUrls(prev => ({
                ...prev,
                ...newUrls
            }));
        };

        fetchImages();
    }, [images]);

    useEffect(() => {
        if (!protocol.vehicleImages || protocol.vehicleImages.length === 0) {
            fetchImages();
        } else {
            setImages(protocol.vehicleImages);
        }
    }, [protocol.id, protocol.vehicleImages]);

    const fetchImages = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const fetchedImages = await carReceptionApi.fetchVehicleImages(protocol.id);
            setImages(fetchedImages);

            if (fetchedImages.length > 0 && (!protocol.vehicleImages || protocol.vehicleImages.length === 0)) {
                const updatedProtocol = {
                    ...protocol,
                    vehicleImages: fetchedImages
                };
                onProtocolUpdate(updatedProtocol);
            }
        } catch (err) {
            console.error('Error fetching images:', err);
            setError('Wystąpił błąd podczas pobierania dokumentacji. Spróbuj odświeżyć stronę.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageClick = (index: number) => {
        setSelectedImageIndex(index);
        setShowPreviewModal(true);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            handleAddImages(event);
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    const handleAddImages = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        const files = event.target.files;
        if (!files || files.length === 0) return;

        setError(null);

        const filesArray = Array.from(files);
        const MAX_FILE_SIZE = 5 * 1024 * 1024;

        const invalidFiles = filesArray.filter(file =>
            !file.type.startsWith('image/') || file.size > MAX_FILE_SIZE
        );

        if (invalidFiles.length > 0) {
            setError(
                `Wykryto nieprawidłowe pliki. Akceptowane są tylko obrazy do ${MAX_FILE_SIZE / 1024 / 1024}MB.`
            );
            return;
        }

        const file = filesArray[0];

        const tempImage: VehicleImage = {
            id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            url: URL.createObjectURL(file),
            name: file.name.replace(/\.[^/.]+$/, ""),
            size: file.size,
            type: file.type,
            createdAt: new Date().toISOString(),
            tags: [],
            file: file
        };

        setCurrentUploadImage(tempImage);
        setImages([...images, tempImage]);

        setEditingImageIndex(images.length);
        setEditModalOpen(true);
    };

    const handleUploadCurrentImage = async () => {
        if (!currentUploadImage || !currentUploadImage.file) return;

        setIsLoading(true);
        setError(null);

        try {
            const imageToUpload = {
                ...currentUploadImage,
                name: currentUploadImage.name || currentUploadImage.file.name.replace(/\.[^/.]+$/, ""),
                tags: currentUploadImage.tags || []
            };

            const uploadedImage = await carReceptionApi.uploadVehicleImage(protocol.id, imageToUpload);

            const updatedImages = [
                ...images.filter(img => !img.id.startsWith('temp_')),
                uploadedImage
            ];

            setImages(updatedImages);

            const updatedProtocol = {
                ...protocol,
                vehicleImages: updatedImages
            };
            onProtocolUpdate(updatedProtocol);

            setCurrentUploadImage(null);
        } catch (err) {
            console.error('Error uploading image:', err);
            setError('Wystąpił błąd podczas przesyłania dokumentu. Spróbuj ponownie.');
            setImages(images.filter(img => !img.id.startsWith('temp_')));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            Object.values(imageUrls).forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [imageUrls]);

    const handleSaveImageInfo = (newName: string, newTags: string[]) => {
        if (editingImageIndex >= 0 && editingImageIndex < images.length) {
            const currentImage = images[editingImageIndex];
            const updatedImages = [...images];
            updatedImages[editingImageIndex] = {
                ...currentImage,
                name: newName,
                tags: newTags
            };

            setImages(updatedImages);

            if (currentImage.id.startsWith('temp_') && currentUploadImage) {
                const updatedUploadImage = {
                    ...currentUploadImage,
                    name: newName,
                    tags: newTags
                };

                setCurrentUploadImage(updatedUploadImage);
                setEditModalOpen(false);
                setEditingImageIndex(-1);

                setIsLoading(true);
                setError(null);

                setTimeout(() => {
                    carReceptionApi.uploadVehicleImage(protocol.id, updatedUploadImage)
                        .then(uploadedImage => {
                            const finalImages = [
                                ...images.filter(img => !img.id.startsWith('temp_')),
                                uploadedImage
                            ];

                            setImages(finalImages);

                            const updatedProtocol = {
                                ...protocol,
                                vehicleImages: finalImages
                            };
                            onProtocolUpdate(updatedProtocol);

                            setCurrentUploadImage(null);
                        })
                        .catch(err => {
                            console.error('Błąd podczas przesyłania obrazu:', err);
                            setError('Wystąpił błąd podczas przesyłania dokumentu. Spróbuj ponownie.');
                            setImages(images.filter(img => !img.id.startsWith('temp_')));
                            setCurrentUploadImage(null);
                        })
                        .finally(() => {
                            setIsLoading(false);
                        });
                }, 100);
            } else if (!currentImage.id.startsWith('temp_')) {
                setEditModalOpen(false);
                setEditingImageIndex(-1);

                setIsLoading(true);

                carReceptionApi.updateVehicleImage(protocol.id, currentImage.id, {
                    name: newName,
                    tags: newTags
                })
                    .then(updatedImage => {
                        if (updatedImage) {
                            const imageIndex = images.findIndex(img => img.id === updatedImage.id);
                            if (imageIndex !== -1) {
                                const finalImages = [...images];
                                finalImages[imageIndex] = updatedImage;

                                setImages(finalImages);

                                const updatedProtocol = {
                                    ...protocol,
                                    vehicleImages: finalImages
                                };
                                onProtocolUpdate(updatedProtocol);
                            }
                        } else {
                            onProtocolUpdate({
                                ...protocol,
                                vehicleImages: updatedImages
                            });
                        }
                    })
                    .catch(err => {
                        console.error('Błąd podczas aktualizacji metadanych obrazu:', err);
                        setError('Wystąpił błąd podczas aktualizacji informacji o dokumencie.');
                        setImages([...images]);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            }
        }
    }

    const handleEditImage = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingImageIndex(index);
        setEditModalOpen(true);
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten dokument?')) {
            return;
        }

        if (imageId.startsWith('temp_')) {
            setImages(images.filter(img => img.id !== imageId));
            setCurrentUploadImage(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const success = await carReceptionApi.deleteVehicleImage(protocol.id, imageId);

            if (success) {
                const updatedImages = images.filter(img => img.id !== imageId);
                setImages(updatedImages);

                const updatedProtocol = {
                    ...protocol,
                    vehicleImages: updatedImages
                };

                onProtocolUpdate(updatedProtocol);
            } else {
                setError('Nie udało się usunąć dokumentu. Spróbuj ponownie.');
            }
        } catch (err) {
            console.error('Error deleting image:', err);
            setError('Wystąpił błąd podczas usuwania dokumentu.');
        } finally {
            setIsLoading(false);
        }
    };

    const getImageUrl = (image: VehicleImage): string => {
        if (image.url && image.id.startsWith('temp_')) return image.url;
        if (imageUrls[image.id]) return imageUrls[image.id];
        return '';
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

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <DocumentationPanel>
            {/* Professional Header */}
            <DocumentationHeader>
                <HeaderContent>
                    <HeaderIcon>
                        <FaFileImage />
                    </HeaderIcon>
                    <HeaderText>
                        <HeaderTitle>Dokumentacja pojazdu</HeaderTitle>
                        <HeaderSubtitle>
                            {images.length} {images.length === 1 ? 'dokument' : images.length < 5 ? 'dokumenty' : 'dokumentów'}
                        </HeaderSubtitle>
                    </HeaderText>
                </HeaderContent>

                <ActionGroup>
                    <UploadButton onClick={handleUploadClick} disabled={isLoading || disabled}>
                        <FaUpload />
                        <span>Dodaj plik</span>
                    </UploadButton>
                    <CameraButton onClick={handleCameraClick} disabled={isLoading || disabled}>
                        <FaCamera />
                        <span>Zrób zdjęcie</span>
                    </CameraButton>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    <input
                        type="file"
                        ref={cameraInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        capture="environment"
                        style={{ display: 'none' }}
                    />
                </ActionGroup>
            </DocumentationHeader>

            {/* Error State */}
            {error && (
                <ErrorAlert>
                    <FaExclamationCircle />
                    <span>{error}</span>
                </ErrorAlert>
            )}

            {/* Loading State */}
            {isLoading && currentUploadImage && (
                <LoadingAlert>
                    <LoadingSpinner />
                    <span>Przesyłanie dokumentu...</span>
                </LoadingAlert>
            )}

            {/* Gallery Content */}
            <GalleryContent>
                {isLoading && images.length === 0 ? (
                    <LoadingState>
                        <LoadingSpinner />
                        <span>Ładowanie dokumentacji...</span>
                    </LoadingState>
                ) : images.length > 0 ? (
                    <DocumentGrid>
                        {images.map((image, index) => (
                            <DocumentCard
                                key={image.id || index}
                                $isTemp={image.id.startsWith('temp_')}
                                onClick={() => handleImageClick(index)}
                            >
                                <DocumentPreview>
                                    {imageUrls[image.id] || image.url ? (
                                        <DocumentImage
                                            src={getImageUrl(image)}
                                            alt={image.name || `Dokument ${index + 1}`}
                                        />
                                    ) : (
                                        <DocumentPlaceholder>
                                            <FaImage />
                                        </DocumentPlaceholder>
                                    )}
                                    {image.id.startsWith('temp_') && (
                                        <ProcessingBadge>Przetwarzanie</ProcessingBadge>
                                    )}
                                </DocumentPreview>

                                <DocumentInfo>
                                    <DocumentHeader>
                                        <DocumentName>
                                            {image.name || `Dokument ${index + 1}`}
                                        </DocumentName>
                                        <DocumentActions>
                                            <ActionButton
                                                onClick={(e) => handleEditImage(index, e)}
                                                title="Edytuj"
                                            >
                                                <FaEdit />
                                            </ActionButton>
                                            <ActionButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteImage(image.id);
                                                }}
                                                title="Usuń"
                                                $variant="danger"
                                            >
                                                <FaTrash />
                                            </ActionButton>
                                        </DocumentActions>
                                    </DocumentHeader>

                                    <DocumentMeta>
                                        <MetaItem>
                                            <MetaLabel>Rozmiar</MetaLabel>
                                            <MetaValue>{formatFileSize(image.size)}</MetaValue>
                                        </MetaItem>
                                        {image.tags && image.tags.length > 0 && (
                                            <MetaItem>
                                                <MetaLabel>Tagi</MetaLabel>
                                                <TagsDisplay>
                                                    <FaTags />
                                                    <TagCount>{image.tags.length}</TagCount>
                                                </TagsDisplay>
                                            </MetaItem>
                                        )}
                                    </DocumentMeta>

                                    {image.tags && image.tags.length > 0 && (
                                        <TagsList>
                                            {image.tags.slice(0, 3).map(tag => (
                                                <TagBadge key={tag}>{tag}</TagBadge>
                                            ))}
                                            {image.tags.length > 3 && (
                                                <TagBadge>+{image.tags.length - 3}</TagBadge>
                                            )}
                                        </TagsList>
                                    )}
                                </DocumentInfo>
                            </DocumentCard>
                        ))}
                    </DocumentGrid>
                ) : (
                    <EmptyState>
                        <EmptyIcon>
                            <FaFileImage />
                        </EmptyIcon>
                        <EmptyTitle>Brak dokumentacji</EmptyTitle>
                        <EmptySubtitle>Dodaj zdjęcia i dokumenty związane z tym pojazdem</EmptySubtitle>
                        <EmptyAction onClick={handleUploadClick} disabled={disabled}>
                            <FaPlus />
                            <span>Dodaj pierwszy dokument</span>
                        </EmptyAction>
                    </EmptyState>
                )}
            </GalleryContent>

            {/* Modals */}
            <ImagePreviewModal
                isOpen={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                images={images}
                currentImageIndex={selectedImageIndex}
                onDelete={handleDeleteImage}
            />

            {editingImageIndex >= 0 && editingImageIndex < images.length && (
                <ImageEditModal
                    isOpen={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        setEditingImageIndex(-1);

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
        </DocumentationPanel>
    );
};

// Enterprise-Grade Styled Components
const DocumentationPanel = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.lg};
`;

// Professional Header
const DocumentationHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${enterprise.space.lg} ${enterprise.space.xl};
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.lg};
    box-shadow: ${enterprise.shadow.sm};
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.lg};
`;

const HeaderIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${enterprise.primary}15;
    color: ${enterprise.primary};
    border-radius: ${enterprise.radius.lg};
    font-size: 20px;
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.xs};
`;

const HeaderTitle = styled.h2`
    font-size: ${enterprise.fontSize.xl};
    font-weight: 700;
    color: ${enterprise.textPrimary};
    margin: 0;
`;

const HeaderSubtitle = styled.div`
    font-size: ${enterprise.fontSize.sm};
    color: ${enterprise.textTertiary};
    font-weight: 500;
`;

const ActionGroup = styled.div`
    display: flex;
    gap: ${enterprise.space.md};
    align-items: center;
`;

const UploadButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    padding: ${enterprise.space.md} ${enterprise.space.lg};
    background: ${enterprise.primary};
    color: white;
    border: none;
    border-radius: ${enterprise.radius.md};
    font-size: ${enterprise.fontSize.sm};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: ${enterprise.shadow.sm};

    &:hover:not(:disabled) {
        background: ${enterprise.primaryDark};
        transform: translateY(-1px);
        box-shadow: ${enterprise.shadow.md};
    }

    &:disabled {
        background: ${enterprise.textMuted};
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    svg {
        font-size: ${enterprise.fontSize.xs};
    }
`;

const CameraButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    padding: ${enterprise.space.md} ${enterprise.space.lg};
    background: ${enterprise.surface};
    color: ${enterprise.textSecondary};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.md};
    font-size: ${enterprise.fontSize.sm};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${enterprise.surfaceSecondary};
        border-color: ${enterprise.textTertiary};
        transform: translateY(-1px);
        box-shadow: ${enterprise.shadow.sm};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    svg {
        font-size: ${enterprise.fontSize.xs};
    }
`;

// Alert Components
const ErrorAlert = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    padding: ${enterprise.space.md} ${enterprise.space.lg};
    background: ${enterprise.errorBg};
    border: 1px solid #fecaca;
    border-radius: ${enterprise.radius.md};
    color: ${enterprise.error};
    font-size: ${enterprise.fontSize.sm};

    svg {
        font-size: ${enterprise.fontSize.base};
    }
`;

const LoadingAlert = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    padding: ${enterprise.space.md} ${enterprise.space.lg};
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: ${enterprise.radius.md};
    color: ${enterprise.primary};
    font-size: ${enterprise.fontSize.sm};
`;

const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Gallery Content
const GalleryContent = styled.div`
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.lg};
    box-shadow: ${enterprise.shadow.sm};
    overflow: hidden;
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${enterprise.space.lg};
    padding: ${enterprise.space.xxl};
    color: ${enterprise.textTertiary};

    span {
        font-size: ${enterprise.fontSize.base};
        font-weight: 500;
    }
`;

const DocumentGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: ${enterprise.space.lg};
    padding: ${enterprise.space.xl};

    @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: ${enterprise.space.md};
        padding: ${enterprise.space.lg};
    }
`;

const DocumentCard = styled.div<{ $isTemp?: boolean }>`
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.lg};
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: ${enterprise.shadow.sm};

    ${props => props.$isTemp && `
        opacity: 0.8;
        border-color: ${enterprise.primary};
        box-shadow: 0 0 0 1px ${enterprise.primary}40;
    `}

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${enterprise.shadow.lg};
        border-color: ${enterprise.primary}60;
    }
`;

const DocumentPreview = styled.div`
    position: relative;
    height: 200px;
    overflow: hidden;
    background: ${enterprise.surfaceTertiary};
`;

const DocumentImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;

    ${DocumentCard}:hover & {
        transform: scale(1.05);
    }
`;

const DocumentPlaceholder = styled.div`
    width: 100%;
    height: 100%;
    background: ${enterprise.surfaceSecondary};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${enterprise.textMuted};
    font-size: 32px;
`;

const ProcessingBadge = styled.div`
    position: absolute;
    top: ${enterprise.space.md};
    left: ${enterprise.space.md};
    padding: ${enterprise.space.xs} ${enterprise.space.sm};
    background: ${enterprise.primary};
    color: white;
    border-radius: ${enterprise.radius.sm};
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const DocumentInfo = styled.div`
    padding: ${enterprise.space.lg};
`;

const DocumentHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${enterprise.space.md};
`;

const DocumentName = styled.h4`
    font-size: ${enterprise.fontSize.base};
    font-weight: 600;
    color: ${enterprise.textPrimary};
    margin: 0;
    line-height: 1.4;
    flex: 1;
    margin-right: ${enterprise.space.md};
`;

const DocumentActions = styled.div`
    display: flex;
    gap: ${enterprise.space.xs};
    opacity: 0.7;
    transition: opacity 0.2s ease;

    ${DocumentCard}:hover & {
        opacity: 1;
    }
`;

const ActionButton = styled.button<{ $variant?: 'danger' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${props => props.$variant === 'danger' ? enterprise.error + '20' : enterprise.surfaceSecondary};
    color: ${props => props.$variant === 'danger' ? enterprise.error : enterprise.textSecondary};
    border: none;
    border-radius: ${enterprise.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: ${enterprise.fontSize.xs};

    &:hover {
        background: ${props => props.$variant === 'danger' ? enterprise.error : enterprise.primary};
        color: white;
        transform: translateY(-1px);
        box-shadow: ${enterprise.shadow.sm};
    }
`;

const DocumentMeta = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${enterprise.space.md};
`;

const MetaItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.xs};
`;

const MetaLabel = styled.div`
    font-size: 11px;
    color: ${enterprise.textTertiary};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const MetaValue = styled.div`
    font-size: ${enterprise.fontSize.sm};
    color: ${enterprise.textSecondary};
    font-weight: 500;
`;

const TagsDisplay = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.xs};
    color: ${enterprise.primary};
`;

const TagCount = styled.div`
    font-size: ${enterprise.fontSize.sm};
    font-weight: 600;
`;

const TagsList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${enterprise.space.xs};
`;

const TagBadge = styled.div`
    padding: 2px ${enterprise.space.sm};
    background: ${enterprise.primary}15;
    color: ${enterprise.primary};
    border: 1px solid ${enterprise.primary}30;
    border-radius: ${enterprise.radius.sm};
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

// Empty State
const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${enterprise.space.xxl} ${enterprise.space.xl};
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 80px;
    height: 80px;
    background: ${enterprise.surfaceSecondary};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${enterprise.textMuted};
    font-size: 32px;
    margin-bottom: ${enterprise.space.xl};
`;

const EmptyTitle = styled.h3`
    font-size: ${enterprise.fontSize.lg};
    font-weight: 600;
    color: ${enterprise.textSecondary};
    margin: 0 0 ${enterprise.space.sm} 0;
`;

const EmptySubtitle = styled.p`
    font-size: ${enterprise.fontSize.sm};
    color: ${enterprise.textTertiary};
    margin: 0 0 ${enterprise.space.xl} 0;
    line-height: 1.5;
`;

const EmptyAction = styled.button`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    padding: ${enterprise.space.md} ${enterprise.space.xl};
    background: ${enterprise.primary};
    color: white;
    border: none;
    border-radius: ${enterprise.radius.md};
    font-size: ${enterprise.fontSize.sm};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: ${enterprise.shadow.sm};

    &:hover:not(:disabled) {
        background: ${enterprise.primaryDark};
        transform: translateY(-1px);
        box-shadow: ${enterprise.shadow.md};
    }

    &:disabled {
        background: ${enterprise.textMuted};
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    svg {
        font-size: ${enterprise.fontSize.xs};
    }
`;

export default ProtocolGallery;