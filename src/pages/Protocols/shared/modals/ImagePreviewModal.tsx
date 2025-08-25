import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaTrash, FaArrowLeft, FaArrowRight, FaSpinner, FaImage, FaDownload, FaExpand } from 'react-icons/fa';
import { VehicleImage } from '../../../../types';
import { carReceptionApi } from '../../../../api/carReceptionApi';

// Professional Brand Theme
const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2',
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    },
    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }
};

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
    const [serverImageUrls, setServerImageUrls] = useState<Record<string, string>>({});
    const [isFullscreen, setIsFullscreen] = useState(false);

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

    // Zwolnienie zasobów przy zamknięciu modalu
    useEffect(() => {
        return () => {
            Object.values(serverImageUrls).forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, []);

    // Obsługa klawiatury
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    if (isFullscreen) {
                        setIsFullscreen(false);
                    } else {
                        onClose();
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    goToPrevious();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    goToNext();
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    setIsFullscreen(!isFullscreen);
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isFullscreen, activeIndex, images.length]);

    // Funkcja do pobierania prawidłowego URL obrazu
    const getImageUrl = (image: VehicleImage): string => {
        if (image.url && (
            image.url.startsWith('blob:') ||
            image.url.startsWith('data:') ||
            image.id.startsWith('temp_') ||
            image.id.startsWith('img_')
        )) {
            return image.url;
        }

        if (serverImageUrls[image.id]) {
            return serverImageUrls[image.id];
        }

        return '';
    };

    if (!isOpen) return null;

    if (images.length === 0) {
        return (
            <ModalOverlay $isFullscreen={false}> {/* ✅ Dodana wymagana właściwość */}
                <ModalContainer $isFullscreen={false}> {/* ✅ Dodana wymagana właściwość */}
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                    <EmptyMessage>
                        <FaImage />
                        <h3>Brak zdjęć do wyświetlenia</h3>
                        <p>Nie znaleziono żadnych zdjęć w tym protokole</p>
                    </EmptyMessage>
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
            if (activeIndex === images.length - 1 && activeIndex > 0) {
                setActiveIndex(activeIndex - 1);
            }
        }
    };

    const handleDownloadImage = () => {
        const imageUrl = getImageUrl(currentImage);
        if (imageUrl) {
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = currentImage.name || `image-${activeIndex + 1}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const currentImageUrl = getImageUrl(currentImage);
    const isLoadingCurrentImage = !currentImageUrl && loading;

    return (
        <ModalOverlay $isFullscreen={isFullscreen}>
            <ModalContainer $isFullscreen={isFullscreen}>
                {!isFullscreen && (
                    <ModalHeader>
                        <HeaderInfo>
                            <ImageTitle>{currentImage.name || `Zdjęcie ${activeIndex + 1}`}</ImageTitle>
                            <ImageCounter>
                                {activeIndex + 1} z {images.length}
                            </ImageCounter>
                        </HeaderInfo>
                        <HeaderActions>
                            <ActionButton onClick={() => setIsFullscreen(true)} title="Pełny ekran (F)">
                                <FaExpand />
                            </ActionButton>
                            {currentImageUrl && (
                                <ActionButton onClick={handleDownloadImage} title="Pobierz">
                                    <FaDownload />
                                </ActionButton>
                            )}
                            <CloseButton onClick={onClose}>
                                <FaTimes />
                            </CloseButton>
                        </HeaderActions>
                    </ModalHeader>
                )}

                <ImageArea $isFullscreen={isFullscreen}>
                    {isFullscreen && (
                        <FullscreenControls>
                            <FullscreenInfo>
                                <span>{currentImage.name || `Zdjęcie ${activeIndex + 1}`}</span>
                                <span>{activeIndex + 1} / {images.length}</span>
                            </FullscreenInfo>
                            <FullscreenActions>
                                <ActionButton onClick={handleDownloadImage} title="Pobierz">
                                    <FaDownload />
                                </ActionButton>
                                <ActionButton onClick={() => setIsFullscreen(false)} title="Wyjdź z pełnego ekranu (Esc)">
                                    <FaTimes />
                                </ActionButton>
                            </FullscreenActions>
                        </FullscreenControls>
                    )}

                    <ImageControls>
                        <NavigationButton
                            onClick={goToPrevious}
                            disabled={images.length <= 1}
                            title="Poprzednie zdjęcie (←)"
                        >
                            <FaArrowLeft />
                        </NavigationButton>

                        <ImageContainer>
                            {isLoadingCurrentImage ? (
                                <LoadingContainer>
                                    <FaSpinner className="spinner" />
                                    <span>Ładowanie obrazu...</span>
                                </LoadingContainer>
                            ) : currentImageUrl ? (
                                <LargeImage
                                    src={currentImageUrl}
                                    alt={currentImage.name || `Zdjęcie ${activeIndex + 1}`}
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                />
                            ) : (
                                <ImagePlaceholder>
                                    <FaImage />
                                    <span>Nie można załadować obrazu</span>
                                </ImagePlaceholder>
                            )}
                        </ImageContainer>

                        <NavigationButton
                            onClick={goToNext}
                            disabled={images.length <= 1}
                            title="Następne zdjęcie (→)"
                        >
                            <FaArrowRight />
                        </NavigationButton>
                    </ImageControls>
                </ImageArea>

                {!isFullscreen && (
                    <>
                        <ImageInfo>
                            <InfoSection>
                                <InfoRow>
                                    <InfoLabel>Nazwa:</InfoLabel>
                                    <InfoValue>{currentImage.name || 'Bez nazwy'}</InfoValue>
                                </InfoRow>
                                {currentImage.size && (
                                    <InfoRow>
                                        <InfoLabel>Rozmiar:</InfoLabel>
                                        <InfoValue>{formatFileSize(currentImage.size)}</InfoValue>
                                    </InfoRow>
                                )}
                                {currentImage.createdAt && (
                                    <InfoRow>
                                        <InfoLabel>Data:</InfoLabel>
                                        <InfoValue>{formatDate(currentImage.createdAt)}</InfoValue>
                                    </InfoRow>
                                )}
                            </InfoSection>

                            {currentImage.tags && currentImage.tags.length > 0 && (
                                <TagsSection>
                                    <TagsLabel>Tagi:</TagsLabel>
                                    <TagsContainer>
                                        {currentImage.tags.map(tag => (
                                            <TagBadge key={tag}>{tag}</TagBadge>
                                        ))}
                                    </TagsContainer>
                                </TagsSection>
                            )}

                            {onDelete && !currentImage.id.startsWith('temp_') && !currentImage.id.startsWith('img_') && (
                                <ActionsSection>
                                    <DeleteButton onClick={handleDeleteImage}>
                                        <FaTrash />
                                        Usuń zdjęcie
                                    </DeleteButton>
                                </ActionsSection>
                            )}
                        </ImageInfo>

                        {/* Miniatury */}
                        {images.length > 1 && (
                            <ThumbnailsSection>
                                <ThumbnailsContainer>
                                    {images.map((image, index) => {
                                        const thumbnailUrl = getImageUrl(image);
                                        return (
                                            <Thumbnail
                                                key={image.id || index}
                                                $active={index === activeIndex}
                                                onClick={() => setActiveIndex(index)}
                                            >
                                                {thumbnailUrl ? (
                                                    <ThumbnailImage
                                                        src={thumbnailUrl}
                                                        alt={image.name || `Zdjęcie ${index + 1}`}
                                                    />
                                                ) : (
                                                    <ThumbnailPlaceholder>
                                                        <FaImage />
                                                    </ThumbnailPlaceholder>
                                                )}
                                                <ThumbnailOverlay>
                                                    {index + 1}
                                                </ThumbnailOverlay>
                                            </Thumbnail>
                                        );
                                    })}
                                </ThumbnailsContainer>
                            </ThumbnailsSection>
                        )}
                    </>
                )}
            </ModalContainer>
        </ModalOverlay>
    );
};

// Helper functions
const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Styled Components - Professional Automotive CRM Design
const ModalOverlay = styled.div<{ $isFullscreen: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$isFullscreen ? '#000000' : 'rgba(0, 0, 0, 0.9)'};
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div<{ $isFullscreen: boolean }>`
    background: ${props => props.$isFullscreen ? 'transparent' : brandTheme.surface};
    border-radius: ${props => props.$isFullscreen ? '0' : brandTheme.radius.xl};
    box-shadow: ${props => props.$isFullscreen ? 'none' : brandTheme.shadow.xl};
    width: ${props => props.$isFullscreen ? '100vw' : '95%'};
    height: ${props => props.$isFullscreen ? '100vh' : '90vh'};
    max-width: ${props => props.$isFullscreen ? 'none' : '1200px'};
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease;

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 2px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

const HeaderInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const ImageTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const ImageCounter = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: ${brandTheme.surfaceHover};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    color: ${brandTheme.text.secondary};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};

    &:hover {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const CloseButton = styled(ActionButton)`
    &:hover {
        background: ${brandTheme.status.errorLight};
        border-color: ${brandTheme.status.error};
        color: ${brandTheme.status.error};
    }
`;

const FullscreenControls = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg};
    background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%);
    z-index: 10;
`;

const FullscreenInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
    color: white;

    span:first-child {
        font-size: 18px;
        font-weight: 600;
    }

    span:last-child {
        font-size: 14px;
        opacity: 0.8;
    }
`;

const FullscreenActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};

    ${ActionButton} {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        color: white;

        &:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
        }
    }
`;

const ImageArea = styled.div<{ $isFullscreen: boolean }>`
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    background: ${props => props.$isFullscreen ? '#000000' : brandTheme.surface};
`;

const ImageControls = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    min-height: 0;
    padding: ${brandTheme.spacing.lg};
`;

const NavigationButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};
    z-index: 5;
    flex-shrink: 0;

    &:hover:not(:disabled) {
        background: rgba(0, 0, 0, 0.8);
        transform: scale(1.1);
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        transform: none;
    }
`;

const ImageContainer = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 ${brandTheme.spacing.lg};
    overflow: hidden;
`;

const LargeImage = styled.img`
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    cursor: zoom-in;
    border-radius: ${brandTheme.radius.md};
    transition: transform ${brandTheme.transitions.normal};

    &:hover {
        transform: scale(1.02);
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.lg};
    color: ${brandTheme.primary};

    .spinner {
        font-size: 32px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    span {
        font-size: 16px;
        font-weight: 500;
    }
`;

const ImagePlaceholder = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.lg};
    color: ${brandTheme.text.muted};
    padding: ${brandTheme.spacing.xxl};

    svg {
        font-size: 48px;
        opacity: 0.5;
    }

    span {
        font-size: 16px;
        font-weight: 500;
    }
`;

const ImageInfo = styled.div`
    padding: ${brandTheme.spacing.xl};
    border-top: 2px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
`;

const InfoSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const InfoRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const InfoLabel = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.secondary};
    min-width: 80px;
`;

const InfoValue = styled.span`
    font-size: 14px;
    color: ${brandTheme.text.primary};
    font-weight: 500;
`;

const TagsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const TagsLabel = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.secondary};
`;

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${brandTheme.spacing.xs};
`;

const TagBadge = styled.div`
   background: ${brandTheme.primaryGhost};
   color: ${brandTheme.primary};
   padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
   border-radius: ${brandTheme.radius.xl};
   font-size: 12px;
   border: 1px solid ${brandTheme.primary}30;
   font-weight: 500;
   max-width: 150px;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
`;

const ActionsSection = styled.div`
   display: flex;
   justify-content: flex-start;
   padding-top: ${brandTheme.spacing.md};
   border-top: 1px solid ${brandTheme.border};
`;

const DeleteButton = styled.button`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
   background: ${brandTheme.status.errorLight};
   color: ${brandTheme.status.error};
   border: 1px solid ${brandTheme.status.error}30;
   border-radius: ${brandTheme.radius.md};
   font-size: 13px;
   font-weight: 500;
   cursor: pointer;
   transition: all ${brandTheme.transitions.normal};

   &:hover {
       background: ${brandTheme.status.error};
       color: white;
       border-color: ${brandTheme.status.error};
       transform: translateY(-1px);
       box-shadow: ${brandTheme.shadow.sm};
   }
`;

const ThumbnailsSection = styled.div`
   background: ${brandTheme.surfaceAlt};
   border-top: 2px solid ${brandTheme.border};
   padding: ${brandTheme.spacing.lg};
`;

const ThumbnailsContainer = styled.div`
   display: flex;
   gap: ${brandTheme.spacing.sm};
   overflow-x: auto;
   padding: ${brandTheme.spacing.sm} 0;

   /* Custom scrollbar */
   &::-webkit-scrollbar {
       height: 6px;
   }

   &::-webkit-scrollbar-track {
       background: ${brandTheme.surfaceHover};
       border-radius: 3px;
   }

   &::-webkit-scrollbar-thumb {
       background: ${brandTheme.border};
       border-radius: 3px;
   }
`;

const Thumbnail = styled.div<{ $active: boolean }>`
   position: relative;
   width: 80px;
   height: 80px;
   border-radius: ${brandTheme.radius.md};
   overflow: hidden;
   cursor: pointer;
   border: 3px solid ${props => props.$active ? brandTheme.primary : brandTheme.border};
   transition: all ${brandTheme.transitions.normal};
   flex-shrink: 0;

   &:hover {
       border-color: ${brandTheme.primary};
       transform: translateY(-2px);
       box-shadow: ${brandTheme.shadow.md};
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
   background: ${brandTheme.surfaceHover};
   display: flex;
   align-items: center;
   justify-content: center;
   color: ${brandTheme.text.muted};
   font-size: 16px;
`;

const ThumbnailOverlay = styled.div`
   position: absolute;
   top: 2px;
   right: 2px;
   background: rgba(0, 0, 0, 0.7);
   color: white;
   font-size: 10px;
   font-weight: 600;
   padding: 2px 6px;
   border-radius: ${brandTheme.radius.sm};
   min-width: 16px;
   text-align: center;
`;

const EmptyMessage = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: ${brandTheme.spacing.xxl};
   text-align: center;
   color: ${brandTheme.text.muted};

   svg {
       font-size: 64px;
       margin-bottom: ${brandTheme.spacing.lg};
       opacity: 0.5;
   }

   h3 {
       font-size: 20px;
       font-weight: 600;
       color: ${brandTheme.text.primary};
       margin: 0 0 ${brandTheme.spacing.sm} 0;
   }

   p {
       font-size: 14px;
       margin: 0;
       line-height: 1.5;
   }
`;

export default ImagePreviewModal;