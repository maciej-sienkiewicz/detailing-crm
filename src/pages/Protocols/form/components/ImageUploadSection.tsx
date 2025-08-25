import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {
    FaCamera,
    FaEdit,
    FaExclamationCircle,
    FaEye,
    FaImage,
    FaSpinner,
    FaTags,
    FaTrash,
    FaUpload
} from 'react-icons/fa';
import {VehicleImage} from '../../../../types';
import {apiClient} from '../../../../api/apiClient';
import {carReceptionApi} from '../../../../api/carReceptionApi';
import ImagePreviewModal from "../../shared/modals/ImagePreviewModal";
import ImageEditModal from "../../shared/modals/ImageEditModal";
import {brandTheme} from '../styles';

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
            const serverImages = images.filter(img =>
                !img.id.startsWith('temp_') &&
                !img.id.startsWith('img_') &&
                !blobUrls.has(img.id) &&
                (!img.url || !img.url.startsWith('blob:'))
            );

            if (serverImages.length === 0) return;

            setLoadingImages(prev => {
                const newSet = new Set(prev);
                serverImages.forEach(img => newSet.add(img.id));
                return newSet;
            });

            try {
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
        if (!image.id.startsWith('temp_') && !image.id.startsWith('img_')) {
            if (blobUrls.has(image.id)) {
                return blobUrls.get(image.id)!;
            }
            if (image.url && !image.url.startsWith('blob:')) {
                return image.url;
            }
            return '';
        }

        if (blobUrls.has(image.id)) {
            return blobUrls.get(image.id)!;
        }

        if (image.url && image.url.startsWith('blob:')) {
            setBlobUrls(prev => new Map(prev).set(image.id, image.url!));
            return image.url;
        }

        return '';
    };

    const isImageLoading = (imageId: string): boolean => {
        return loadingImages.has(imageId);
    };

    const handleAddImages = (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const files = event instanceof DragEvent
            ? (event as React.DragEvent<HTMLDivElement>).dataTransfer.files
            : (event.target as HTMLInputElement).files;

        if (!files || files.length === 0) return;

        setError(null);

        const filesArray = Array.from(files);

        const invalidFiles = filesArray.filter(file =>
            !file.type.startsWith('image/') || file.size > MAX_FILE_SIZE
        );

        if (invalidFiles.length > 0) {
            setError(
                `Wykryto nieprawidłowe pliki. Akceptowane są tylko obrazy do ${MAX_FILE_SIZE / 1024 / 1024}MB.`
            );
            return;
        }

        const newImages: VehicleImage[] = [];
        const newBlobUrls = new Map(blobUrls);

        filesArray.forEach(file => {
            const imageUrl = URL.createObjectURL(file);
            const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

            newBlobUrls.set(imageId, imageUrl);

            const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

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

        setBlobUrls(newBlobUrls);

        if (newImages.length > 0) {
            const updatedImages = [...images, ...newImages];
            onImagesChange(updatedImages);

            setEditingImageIndex(images.length);
            setEditModalOpen(true);
        }
    };

    const handleRemoveImage = (imageId: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const imageToRemove = images.find(img => img.id === imageId);

        if (blobUrls.has(imageId)) {
            const blobUrl = blobUrls.get(imageId)!;
            URL.revokeObjectURL(blobUrl);
            setBlobUrls(prev => {
                const newMap = new Map(prev);
                newMap.delete(imageId);
                return newMap;
            });
        }

        if (imageToRemove && imageToRemove.url && imageToRemove.url.startsWith('blob:')) {
            URL.revokeObjectURL(imageToRemove.url);
        }

        const updatedImages = images.filter(img => img.id !== imageId);
        onImagesChange(updatedImages);
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

    const handleOpenPreview = (index: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setPreviewImageIndex(index);
        setPreviewModalOpen(true);
    };

    const handleEditImage = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setEditingImageIndex(index);
        setEditModalOpen(true);
    };

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

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.stopPropagation();
        handleAddImages(e);
    };

    React.useEffect(() => {
        return () => {
            blobUrls.forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, []);

    return (
        <SectionContainer>
            <SectionHeader>
                <SectionTitle>Galeria zdjęć</SectionTitle>
                {images.length > 0 && (
                    <ImageCounter>
                        {images.length} {images.length === 1 ? 'zdjęcie' : images.length < 5 ? 'zdjęcia' : 'zdjęć'}
                    </ImageCounter>
                )}
            </SectionHeader>

            {error && (
                <ErrorMessage>
                    <ErrorIcon>
                        <FaExclamationCircle />
                    </ErrorIcon>
                    <ErrorText>{error}</ErrorText>
                </ErrorMessage>
            )}

            <UploadArea
                $isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <UploadContent>
                    <UploadIcon>
                        <FaImage />
                    </UploadIcon>
                    <UploadText>
                        <UploadTitle>Dodaj zdjęcia pojazdu</UploadTitle>
                        <UploadDescription>
                            Przeciągnij i upuść pliki lub wybierz z galerii
                        </UploadDescription>
                    </UploadText>
                    <UploadButtons>
                        <UploadButton type="button" onClick={handleUploadClick} $variant="primary">
                            <FaUpload />
                            Wybierz pliki
                        </UploadButton>
                        <UploadButton type="button" onClick={handleCameraClick} $variant="secondary">
                            <FaCamera />
                            Aparat
                        </UploadButton>
                    </UploadButtons>
                    <UploadHint>
                        Maksymalny rozmiar pliku: {MAX_FILE_SIZE / 1024 / 1024}MB
                    </UploadHint>
                </UploadContent>

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

            {images.length > 0 ? (
                <GalleryContainer>
                    <GalleryGrid>
                        {images.map((image, index) => {
                            const imageUrl = getImageUrl(image);
                            const isLoading = isImageLoading(image.id);

                            return (
                                <ImageCard key={image.id}>
                                    <ImageThumbnail onClick={(e) => handleOpenPreview(index, e)}>
                                        {isLoading ? (
                                            <LoadingState>
                                                <LoadingSpinner>
                                                    <FaSpinner className="spinner" />
                                                </LoadingSpinner>
                                                <LoadingText>Ładowanie...</LoadingText>
                                            </LoadingState>
                                        ) : imageUrl ? (
                                            <>
                                                <ImagePreview src={imageUrl} alt={image.name || 'Zdjęcie'} />
                                                <ImageOverlay>
                                                    <OverlayIcon>
                                                        <FaEye />
                                                    </OverlayIcon>
                                                </ImageOverlay>
                                            </>
                                        ) : (
                                            <ErrorState>
                                                <ErrorStateIcon>
                                                    <FaImage />
                                                </ErrorStateIcon>
                                                <ErrorStateText>Błąd ładowania</ErrorStateText>
                                            </ErrorState>
                                        )}
                                    </ImageThumbnail>

                                    <ImageMeta>
                                        <ImageNameRow>
                                            <ImageName title={image.name || 'Bez nazwy'}>
                                                {image.name || 'Bez nazwy'}
                                            </ImageName>
                                            <ImageActions>
                                                <ActionButton
                                                    type="button"
                                                    onClick={(e) => handleEditImage(index, e)}
                                                    title="Edytuj informacje"
                                                >
                                                    <FaEdit />
                                                </ActionButton>
                                                <ActionButton
                                                    type="button"
                                                    onClick={(e) => handleRemoveImage(image.id, e)}
                                                    title="Usuń zdjęcie"
                                                    $variant="danger"
                                                >
                                                    <FaTrash />
                                                </ActionButton>
                                            </ImageActions>
                                        </ImageNameRow>

                                        <ImageDetailsRow>
                                            <ImageSize>{formatFileSize(image.size)}</ImageSize>
                                            {image.tags && image.tags.length > 0 && (
                                                <TagsIndicator>
                                                    <FaTags />
                                                    <TagsCount>{image.tags.length}</TagsCount>
                                                </TagsIndicator>
                                            )}
                                        </ImageDetailsRow>

                                        {image.tags && image.tags.length > 0 && (
                                            <TagsRow>
                                                {image.tags.slice(0, 3).map(tag => (
                                                    <TagBadge key={tag}>{tag}</TagBadge>
                                                ))}
                                                {image.tags.length > 3 && (
                                                    <MoreTags>+{image.tags.length - 3}</MoreTags>
                                                )}
                                            </TagsRow>
                                        )}
                                    </ImageMeta>
                                </ImageCard>
                            );
                        })}
                    </GalleryGrid>
                </GalleryContainer>
            ) : (
                <EmptyGallery>
                    <EmptyIcon>
                        <FaImage />
                    </EmptyIcon>
                    <EmptyTitle>Brak zdjęć</EmptyTitle>
                    <EmptyDescription>
                        Dodaj zdjęcia, aby udokumentować stan pojazdu przed i po usługach
                    </EmptyDescription>
                </EmptyGallery>
            )}

            <ImagePreviewModal
                isOpen={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                images={images.map(img => ({ ...img, url: getImageUrl(img) }))}
                currentImageIndex={previewImageIndex}
                onDelete={handleRemoveImage}
            />

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

// Styled Components - Professional Automotive CRM Design
const SectionContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${brandTheme.spacing.md};
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};

    &::before {
        content: '';
        width: 4px;
        height: 18px;
        background: ${brandTheme.primary};
        border-radius: 2px;
    }
`;

const ImageCounter = styled.div`
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.xl};
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.status.error}30;
    box-shadow: ${brandTheme.shadow.xs};
`;

const ErrorIcon = styled.div`
    font-size: 16px;
    flex-shrink: 0;
`;

const ErrorText = styled.div`
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
`;

const UploadArea = styled.div<{ $isDragging: boolean }>`
    border: 2px dashed ${props => props.$isDragging ? brandTheme.primary : brandTheme.border};
    border-radius: ${brandTheme.radius.xl};
    background: ${props => props.$isDragging ? brandTheme.primaryGhost : brandTheme.surfaceAlt};
    transition: all ${brandTheme.transitions.normal};
    cursor: pointer;

    &:hover {
        border-color: ${brandTheme.primary};
        background: ${brandTheme.primaryGhost};
    }
`;

const UploadContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${brandTheme.spacing.lg};
    padding: ${brandTheme.spacing.xxl};
    text-align: center;

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.xl};
        gap: ${brandTheme.spacing.md};
    }
`;

const UploadIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    border-radius: ${brandTheme.radius.xl};
    font-size: 24px;
`;

const UploadText = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const UploadTitle = styled.h4`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const UploadDescription = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const UploadButtons = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.md};
    
    @media (max-width: 480px) {
        flex-direction: column;
        width: 100%;
    }
`;

const UploadButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all ${brandTheme.transitions.spring};
    min-height: 44px;
    min-width: 140px;

    ${props => props.$variant === 'primary' ? `
        background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
        color: white;
        border: 2px solid transparent;
        box-shadow: ${brandTheme.shadow.sm};
        
        &:hover {
            background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
            transform: translateY(-1px);
            box-shadow: ${brandTheme.shadow.md};
        }
    ` : `
        background: ${brandTheme.surface};
        color: ${brandTheme.text.secondary};
        border: 2px solid ${brandTheme.border};
        
        &:hover {
            background: ${brandTheme.surfaceHover};
            color: ${brandTheme.text.primary};
            border-color: ${brandTheme.borderHover};
            box-shadow: ${brandTheme.shadow.sm};
        }
    `}

    &:active {
        transform: translateY(0);
    }

    @media (max-width: 480px) {
        width: 100%;
    }
`;

const UploadHint = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 500;
`;

const GalleryContainer = styled.div`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.xl};
    padding: ${brandTheme.spacing.lg};
    box-shadow: ${brandTheme.shadow.sm};
`;

const GalleryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: ${brandTheme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: ${brandTheme.spacing.md};
    }

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const ImageCard = styled.div`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    overflow: hidden;
    transition: all ${brandTheme.transitions.normal};
    position: relative;

    &:hover {
        border-color: ${brandTheme.primary};
        transform: translateY(-2px);
        box-shadow: ${brandTheme.shadow.lg};
    }
`;

const ImageThumbnail = styled.div`
    height: 200px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    background: ${brandTheme.surfaceAlt};
`;

const ImagePreview = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform ${brandTheme.transitions.normal};
`;

const ImageOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity ${brandTheme.transitions.normal};

    ${ImageThumbnail}:hover & {
        opacity: 1;
    }

    ${ImageThumbnail}:hover ${ImagePreview} {
        transform: scale(1.05);
    }
`;

const OverlayIcon = styled.div`
    color: white;
    font-size: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: ${brandTheme.spacing.md};
`;

const LoadingSpinner = styled.div`
    color: ${brandTheme.primary};
    font-size: 24px;

    .spinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 500;
`;

const ErrorState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: ${brandTheme.spacing.sm};
`;

const ErrorStateIcon = styled.div`
    color: ${brandTheme.text.muted};
    font-size: 32px;
    opacity: 0.6;
`;

const ErrorStateText = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 500;
`;

const ImageMeta = styled.div`
    padding: ${brandTheme.spacing.md};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const ImageNameRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const ImageName = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
`;

const ImageActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};
    flex-shrink: 0;
`;

const ActionButton = styled.button<{ $variant?: 'danger' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: ${brandTheme.radius.sm};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};
    font-size: 12px;

    ${props => props.$variant === 'danger' ? `
        background: ${brandTheme.status.errorLight};
        color: ${brandTheme.status.error};
        
        &:hover {
            background: ${brandTheme.status.error};
            color: white;
            transform: translateY(-1px);
            box-shadow: ${brandTheme.shadow.sm};
        }
    ` : `
        background: ${brandTheme.primaryGhost};
        color: ${brandTheme.primary};
        
        &:hover {
            background: ${brandTheme.primary};
            color: white;
            transform: translateY(-1px);
            box-shadow: ${brandTheme.shadow.sm};
        }
    `}

    &:active {
        transform: translateY(0);
    }
`;

const ImageDetailsRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ImageSize = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 500;
    font-variant-numeric: tabular-nums;
`;

const TagsIndicator = styled.div`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.xs};
   color: ${brandTheme.primary};
`;

const TagsCount = styled.span`
   font-size: 12px;
   font-weight: 600;
   font-variant-numeric: tabular-nums;
`;

const TagsRow = styled.div`
   display: flex;
   flex-wrap: wrap;
   gap: ${brandTheme.spacing.xs};
   align-items: center;
`;

const TagBadge = styled.div`
   background: ${brandTheme.primaryGhost};
   color: ${brandTheme.primary};
   padding: 2px ${brandTheme.spacing.xs};
   border-radius: ${brandTheme.radius.xl};
   font-size: 10px;
   font-weight: 500;
   border: 1px solid ${brandTheme.primary}20;
   max-width: 80px;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
`;

const MoreTags = styled.div`
   background: ${brandTheme.text.muted};
   color: white;
   padding: 2px ${brandTheme.spacing.xs};
   border-radius: ${brandTheme.radius.xl};
   font-size: 10px;
   font-weight: 600;
`;

const EmptyGallery = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: ${brandTheme.spacing.xxl};
   background: ${brandTheme.surfaceAlt};
   border: 1px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.xl};
   text-align: center;
   gap: ${brandTheme.spacing.lg};
`;

const EmptyIcon = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 80px;
   height: 80px;
   background: ${brandTheme.surfaceHover};
   color: ${brandTheme.text.muted};
   border-radius: ${brandTheme.radius.xl};
   font-size: 32px;
   opacity: 0.6;
`;

const EmptyTitle = styled.h4`
   margin: 0;
   font-size: 18px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
`;

const EmptyDescription = styled.p`
   margin: 0;
   font-size: 14px;
   color: ${brandTheme.text.secondary};
   line-height: 1.5;
   max-width: 300px;
`;

export default ImageUploadSection;