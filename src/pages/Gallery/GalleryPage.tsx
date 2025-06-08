// src/pages/Gallery/GalleryPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaImages, FaDownload, FaEye, FaTags, FaSearch, FaChartLine, FaDatabase, FaCubes } from 'react-icons/fa';
import { galleryApi, GalleryImage, GalleryFilters, GalleryStats } from '../../api/galleryApi';
import GalleryFiltersComponent from '../../components/Gallery/GalleryFilters';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { carReceptionApi } from '../../api/carReceptionApi';

// Brand Theme - zgodny z systemem designu
const brandTheme = {
    // Primary Colors
    primary: '#1a365d',
    primaryLight: '#2c5aa0',
    primaryDark: '#0f2027',
    primaryGhost: 'rgba(26, 54, 93, 0.04)',

    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',

    // Surface Colors
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',

    // Typography Colors
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },

    // Border Colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',

    // Status Colors
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

    // Shadows
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    // Spacing
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    // Border Radius
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    },

    // Transitions
    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }
};

const GalleryPage: React.FC = () => {
    const navigate = useNavigate();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [stats, setStats] = useState<GalleryStats | null>(null);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(20);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<GalleryFilters>({});
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

    // Ładowanie danych przy inicjalizacji
    useEffect(() => {
        loadGalleryStats();
        loadAvailableTags();
        searchImages();
    }, []);

    // Wyszukiwanie przy zmianie filtrów lub strony
    useEffect(() => {
        searchImages();
    }, [filters, currentPage]);

    useEffect(() => {
        const fetchImages = async () => {
            const imagesToFetch = images.filter(img => !imageUrls[img.id]);
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

            setImageUrls(prev => ({ ...prev, ...newUrls }));
        };

        fetchImages();
    }, [images]);

    const getImageUrl = (image: GalleryImage): string => {
        if (imageUrls[image.id]) return imageUrls[image.id];
        return '';
    };

    const loadGalleryStats = async () => {
        try {
            const galleryStats = await galleryApi.getGalleryStats();
            setStats(galleryStats);
        } catch (error) {
            console.error('Error loading gallery stats:', error);
        }
    };

    const loadAvailableTags = async () => {
        try {
            const tags = await galleryApi.getAllTags();
            setAvailableTags(tags);
        } catch (error) {
            console.error('Error loading available tags:', error);
        }
    };

    const searchImages = async () => {
        console.log('🔍 Starting image search with filters:', filters, 'page:', currentPage);
        setIsLoading(true);

        try {
            console.log('📡 Calling galleryApi.searchImages...');
            const response = await galleryApi.searchImages(filters, currentPage, pageSize);

            console.log('✅ Raw API Response:', response);

            if (!response || !response.data || !Array.isArray(response.data)) {
                console.error('❌ Invalid response structure');
                setImages([]);
                return;
            }

            setImages(response.data);
            setTotalPages(response.pagination?.totalPages || 0);
            setTotalItems(response.pagination?.totalItems || 0);

        } catch (error) {
            console.error('❌ Error in searchImages:', error);
            setImages([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFiltersChange = (newFilters: GalleryFilters) => {
        setFilters(newFilters);
        setCurrentPage(0);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page - 1);
    };

    const handleImageClick = (image: GalleryImage) => {
        setSelectedImage(image);
        setShowImageModal(true);
    };

    const handleProtocolClick = (protocolId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/orders/car-reception/${protocolId}`);
    };

    const handleDownloadImage = (image: GalleryImage, e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(galleryApi.getDownloadUrl(image.id), '_blank');
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <GalleryContainer>
            {/* Professional Header */}
            <HeaderContainer>
                <PageHeader>
                    <HeaderLeft>
                        <HeaderTitle>
                            <TitleIcon>
                                <FaImages />
                            </TitleIcon>
                            <TitleContent>
                                <MainTitle>Galeria zdjęć</MainTitle>
                                <Subtitle>Przeglądaj i zarządzaj zdjęciami z protokołów</Subtitle>
                            </TitleContent>
                        </HeaderTitle>
                    </HeaderLeft>
                </PageHeader>
            </HeaderContainer>

            {/* Professional Statistics */}
            {stats && (
                <StatsSection>
                    <StatsGrid>
                        <StatCard>
                            <StatIcon $color={brandTheme.primary}><FaImages /></StatIcon>
                            <StatContent>
                                <StatValue>{stats.totalImages}</StatValue>
                                <StatLabel>Zdjęć w galerii</StatLabel>
                            </StatContent>
                        </StatCard>

                        <StatCard>
                            <StatIcon $color={brandTheme.status.info}><FaDatabase /></StatIcon>
                            <StatContent>
                                <StatValue>{formatFileSize(stats.totalSize)}</StatValue>
                                <StatLabel>Rozmiar danych</StatLabel>
                            </StatContent>
                        </StatCard>

                        <StatCard>
                            <StatIcon $color={brandTheme.status.success}><FaTags /></StatIcon>
                            <StatContent>
                                <StatValue>{availableTags.length}</StatValue>
                                <StatLabel>Dostępnych tagów</StatLabel>
                            </StatContent>
                        </StatCard>

                        <StatCard>
                            <StatIcon $color={brandTheme.status.warning}><FaCubes /></StatIcon>
                            <StatContent>
                                <StatValue>{totalItems}</StatValue>
                                <StatLabel>Wyników wyszukiwania</StatLabel>
                            </StatContent>
                        </StatCard>
                    </StatsGrid>
                </StatsSection>
            )}

            {/* Enhanced Filters */}
            <GalleryFiltersComponent
                availableTags={availableTags}
                onFiltersChange={handleFiltersChange}
                isLoading={isLoading}
            />

            {/* Main Content */}
            <GalleryContent>
                {(() => {
                    if (isLoading) {
                        return (
                            <LoadingContainer>
                                <LoadingSpinner />
                                <LoadingText>Ładowanie zdjęć...</LoadingText>
                            </LoadingContainer>
                        );
                    } else if (images.length > 0) {
                        return (
                            <>
                                <ResultsInfo>
                                    <ResultsText>
                                        Znaleziono <strong>{totalItems}</strong> {totalItems === 1 ? 'zdjęcie' : totalItems < 5 ? 'zdjęcia' : 'zdjęć'}
                                    </ResultsText>
                                </ResultsInfo>

                                <ImagesGrid>
                                    {images.map(image => (
                                        <ImageCard key={image.id} onClick={() => handleImageClick(image)}>
                                            <ImageContainer>
                                                <Image
                                                    src={getImageUrl(image)}
                                                    alt={image.name}
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNmI3Njg0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QnJhayBvYnJhem7EhTwvdGV4dD48L3N2Zz4=';
                                                    }}
                                                />
                                                <ImageOverlay>
                                                    <ImageActions>
                                                        <ActionButton
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleImageClick(image);
                                                            }}
                                                            title="Podgląd"
                                                        >
                                                            <FaEye />
                                                        </ActionButton>
                                                        <ActionButton
                                                            onClick={(e) => handleDownloadImage(image, e)}
                                                            title="Pobierz"
                                                        >
                                                            <FaDownload />
                                                        </ActionButton>
                                                    </ImageActions>
                                                </ImageOverlay>
                                            </ImageContainer>

                                            <ImageInfo>
                                                <ImageHeader>
                                                    <ImageName>{image.name}</ImageName>
                                                    <ProtocolBadge
                                                        onClick={(e) => handleProtocolClick(image.protocolId, e)}
                                                        title="Kliknij, aby przejść do protokołu"
                                                    >
                                                        #{image.protocolId}
                                                    </ProtocolBadge>
                                                </ImageHeader>

                                                <ImageMeta>
                                                    <MetaItem>{formatFileSize(image.size)}</MetaItem>
                                                    <MetaItem>{formatDate(image.createdAt)}</MetaItem>
                                                </ImageMeta>

                                                {image.tags.length > 0 && (
                                                    <ImageTags>
                                                        <TagsIcon><FaTags /></TagsIcon>
                                                        <TagsList>
                                                            {image.tags.slice(0, 3).map(tag => (
                                                                <Tag key={tag}>{tag}</Tag>
                                                            ))}
                                                            {image.tags.length > 3 && (
                                                                <Tag>+{image.tags.length - 3}</Tag>
                                                            )}
                                                        </TagsList>
                                                    </ImageTags>
                                                )}

                                                {image.description && (
                                                    <ImageDescription title={image.description}>
                                                        {image.description}
                                                    </ImageDescription>
                                                )}
                                            </ImageInfo>
                                        </ImageCard>
                                    ))}
                                </ImagesGrid>

                                <Pagination
                                    currentPage={currentPage + 1}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    totalItems={totalItems}
                                    pageSize={pageSize}
                                />
                            </>
                        );
                    } else {
                        return (
                            <EmptyState>
                                <EmptyStateIcon><FaSearch /></EmptyStateIcon>
                                <EmptyStateTitle>Brak zdjęć</EmptyStateTitle>
                                <EmptyStateMessage>
                                    Nie znaleziono zdjęć spełniających podane kryteria wyszukiwania.
                                    Spróbuj zmienić filtry lub dodać nowe zdjęcia do protokołów.
                                </EmptyStateMessage>
                            </EmptyState>
                        );
                    }
                })()}
            </GalleryContent>

            {/* Professional Modal */}
            {selectedImage && (
                <Modal
                    isOpen={showImageModal}
                    onClose={() => {
                        setShowImageModal(false);
                        setSelectedImage(null);
                    }}
                    title="Podgląd zdjęcia"
                    size="large"
                >
                    <ImagePreviewContainer>
                        <PreviewImage
                            src={getImageUrl(selectedImage)}
                            alt={selectedImage.name}
                            onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJyYWsgb2JyYXprYTwvdGV4dD48L3N2Zz4=';
                            }}
                        />
                        <PreviewInfo>
                            <InfoSection>
                                <InfoLabel>Nazwa</InfoLabel>
                                <InfoValue>{selectedImage.name}</InfoValue>
                            </InfoSection>

                            <InfoSection>
                                <InfoLabel>Protokół</InfoLabel>
                                <InfoValue>
                                    <ProtocolLink
                                        onClick={(e) => handleProtocolClick(selectedImage.protocolId, e)}
                                    >
                                        #{selectedImage.protocolId}
                                    </ProtocolLink>
                                </InfoValue>
                            </InfoSection>

                            {selectedImage.protocolTitle && (
                                <InfoSection>
                                    <InfoLabel>Tytuł protokołu</InfoLabel>
                                    <InfoValue>{selectedImage.protocolTitle}</InfoValue>
                                </InfoSection>
                            )}

                            {selectedImage.clientName && (
                                <InfoSection>
                                    <InfoLabel>Klient</InfoLabel>
                                    <InfoValue>{selectedImage.clientName}</InfoValue>
                                </InfoSection>
                            )}

                            {selectedImage.vehicleInfo && (
                                <InfoSection>
                                    <InfoLabel>Pojazd</InfoLabel>
                                    <InfoValue>{selectedImage.vehicleInfo}</InfoValue>
                                </InfoSection>
                            )}

                            <InfoSection>
                                <InfoLabel>Rozmiar</InfoLabel>
                                <InfoValue>{formatFileSize(selectedImage.size)}</InfoValue>
                            </InfoSection>

                            <InfoSection>
                                <InfoLabel>Data utworzenia</InfoLabel>
                                <InfoValue>{formatDate(selectedImage.createdAt)}</InfoValue>
                            </InfoSection>

                            {selectedImage.tags.length > 0 && (
                                <InfoSection>
                                    <InfoLabel>Tagi</InfoLabel>
                                    <TagsContainer>
                                        {selectedImage.tags.map(tag => (
                                            <PreviewTag key={tag}>{tag}</PreviewTag>
                                        ))}
                                    </TagsContainer>
                                </InfoSection>
                            )}

                            {selectedImage.description && (
                                <InfoSection>
                                    <InfoLabel>Opis</InfoLabel>
                                    <InfoValue>{selectedImage.description}</InfoValue>
                                </InfoSection>
                            )}

                            <DownloadButton onClick={() => handleDownloadImage(selectedImage, {} as React.MouseEvent)}>
                                <FaDownload /> Pobierz zdjęcie
                            </DownloadButton>
                        </PreviewInfo>
                    </ImagePreviewContainer>
                </Modal>
            )}
        </GalleryContainer>
    );
};

// Professional Styled Components
const GalleryContainer = styled.div`
    min-height: 100vh;
    background: ${brandTheme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const HeaderContainer = styled.header`
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.sm};
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);
`;

const PageHeader = styled.div`
    max-width: 100%;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.lg};

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
        flex-direction: column;
        align-items: stretch;
        gap: ${brandTheme.spacing.md};
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    min-width: 0;
    flex: 1;
`;

const HeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.lg};
`;

const TitleIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${brandTheme.shadow.md};
    flex-shrink: 0;
`;

const TitleContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const MainTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${brandTheme.textPrimary};
    margin: 0;
    letter-spacing: -0.5px;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const Subtitle = styled.div`
    font-size: 16px;
    color: ${brandTheme.textTertiary};
    font-weight: 500;
`;

const StatsSection = styled.section`
    max-width: 100%;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl} 0;

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg} 0;
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.md} 0;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: ${brandTheme.spacing.lg};
    margin-bottom: ${brandTheme.spacing.lg};

    @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
        gap: ${brandTheme.spacing.md};
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${brandTheme.spacing.md};
    }
`;

const StatCard = styled.div`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.xl};
    padding: ${brandTheme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${brandTheme.shadow.xs};
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${brandTheme.shadow.lg};
        border-color: ${brandTheme.primary};
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    &:hover::before {
        opacity: 1;
    }
`;

const StatIcon = styled.div<{ $color: string }>`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 24px;
    flex-shrink: 0;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;

const StatContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const StatValue = styled.div`
    font-size: 28px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
    letter-spacing: -0.025em;
    line-height: 1.1;

    @media (max-width: 768px) {
        font-size: 24px;
    }
`;

const StatLabel = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    line-height: 1.3;
`;

const GalleryContent = styled.div`
    max-width: 100%;
    margin: 0;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.sm};
    margin-top: ${brandTheme.spacing.lg};
    margin-bottom: ${brandTheme.spacing.lg};

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
        margin: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md};
        margin: ${brandTheme.spacing.md};
        border-radius: ${brandTheme.radius.lg};
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: ${brandTheme.spacing.xl};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.xl};
    border: 2px dashed ${brandTheme.borderLight};
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${brandTheme.borderLight};
    border-top: 3px solid ${brandTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 18px;
    color: ${brandTheme.text.tertiary};
    font-weight: 500;
`;

const ResultsInfo = styled.div`
    margin-bottom: ${brandTheme.spacing.xl};
    padding: ${brandTheme.spacing.md} 0;
    border-bottom: 1px solid ${brandTheme.borderLight};
`;

const ResultsText = styled.div`
    color: ${brandTheme.text.secondary};
    font-size: 16px;
    font-weight: 500;

    strong {
        color: ${brandTheme.text.primary};
        font-weight: 700;
    }
`;

const ImagesGrid = styled.div`
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
   gap: ${brandTheme.spacing.xl};
   margin-bottom: ${brandTheme.spacing.xxl};

   @media (max-width: 768px) {
       grid-template-columns: 1fr;
       gap: ${brandTheme.spacing.lg};
   }
`;

const ImageCard = styled.div`
   border: 1px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.xl};
   overflow: hidden;
   cursor: pointer;
   transition: all ${brandTheme.transitions.spring};
   background: ${brandTheme.surface};
   box-shadow: ${brandTheme.shadow.xs};

   &:hover {
       border-color: ${brandTheme.primary};
       box-shadow: ${brandTheme.shadow.lg};
       transform: translateY(-4px);
   }
`;

const ImageContainer = styled.div`
   position: relative;
   height: 240px;
   overflow: hidden;
   background: ${brandTheme.surfaceAlt};
`;

const Image = styled.img`
   width: 100%;
   height: 100%;
   object-fit: cover;
   transition: transform ${brandTheme.transitions.slow};

   ${ImageCard}:hover & {
       transform: scale(1.05);
   }
`;

const ImageOverlay = styled.div`
   position: absolute;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background: linear-gradient(135deg, rgba(26, 54, 93, 0.9) 0%, rgba(15, 32, 39, 0.9) 100%);
   display: flex;
   align-items: center;
   justify-content: center;
   opacity: 0;
   transition: opacity ${brandTheme.transitions.normal};
   backdrop-filter: blur(4px);

   ${ImageCard}:hover & {
       opacity: 1;
   }
`;

const ImageActions = styled.div`
   display: flex;
   gap: ${brandTheme.spacing.md};
`;

const ActionButton = styled.button`
   width: 48px;
   height: 48px;
   border-radius: ${brandTheme.radius.lg};
   border: 2px solid rgba(255, 255, 255, 0.2);
   background: rgba(255, 255, 255, 0.1);
   color: white;
   cursor: pointer;
   display: flex;
   align-items: center;
   justify-content: center;
   transition: all ${brandTheme.transitions.normal};
   font-size: 18px;
   backdrop-filter: blur(8px);

   &:hover {
       background: rgba(255, 255, 255, 0.2);
       border-color: rgba(255, 255, 255, 0.4);
       transform: translateY(-2px) scale(1.05);
       box-shadow: ${brandTheme.shadow.lg};
   }
`;

const ImageInfo = styled.div`
   padding: ${brandTheme.spacing.lg};
`;

const ImageHeader = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: flex-start;
   margin-bottom: ${brandTheme.spacing.md};
   gap: ${brandTheme.spacing.sm};
`;

const ImageName = styled.div`
   font-size: 16px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
   line-height: 1.4;
   flex: 1;
`;

const ProtocolBadge = styled.div`
   background: linear-gradient(135deg, ${brandTheme.primaryGhost} 0%, ${brandTheme.surface} 100%);
   color: ${brandTheme.primary};
   padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
   border-radius: ${brandTheme.radius.sm};
   font-size: 12px;
   font-weight: 600;
   cursor: pointer;
   transition: all ${brandTheme.transitions.normal};
   border: 1px solid ${brandTheme.primary}30;
   flex-shrink: 0;

   &:hover {
       background: ${brandTheme.primary};
       color: white;
       transform: translateY(-1px);
       box-shadow: ${brandTheme.shadow.sm};
   }
`;

const ImageMeta = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: ${brandTheme.spacing.md};
   gap: ${brandTheme.spacing.sm};
`;

const MetaItem = styled.span`
   font-size: 12px;
   color: ${brandTheme.text.muted};
   font-weight: 500;
`;

const ImageTags = styled.div`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   margin-bottom: ${brandTheme.spacing.sm};
`;

const TagsIcon = styled.div`
   color: ${brandTheme.text.muted};
   font-size: 12px;
`;

const TagsList = styled.div`
   display: flex;
   flex-wrap: wrap;
   gap: ${brandTheme.spacing.xs};
`;

const Tag = styled.span`
   background: ${brandTheme.surfaceAlt};
   color: ${brandTheme.text.secondary};
   padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
   border-radius: ${brandTheme.radius.sm};
   font-size: 11px;
   font-weight: 500;
   border: 1px solid ${brandTheme.borderLight};
`;

const ImageDescription = styled.div`
   font-size: 13px;
   color: ${brandTheme.text.tertiary};
   line-height: 1.4;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
`;

const EmptyState = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: ${brandTheme.spacing.xxl};
   text-align: center;
   background: ${brandTheme.surfaceAlt};
   border-radius: ${brandTheme.radius.xl};
   border: 2px dashed ${brandTheme.borderLight};
`;

const EmptyStateIcon = styled.div`
   font-size: 64px;
   color: ${brandTheme.text.disabled};
   margin-bottom: ${brandTheme.spacing.lg};
`;

const EmptyStateTitle = styled.h3`
   color: ${brandTheme.text.secondary};
   margin-bottom: ${brandTheme.spacing.sm};
   font-size: 20px;
   font-weight: 600;
`;

const EmptyStateMessage = styled.p`
   color: ${brandTheme.text.muted};
   max-width: 500px;
   line-height: 1.6;
   font-size: 16px;
   margin: 0;
`;

// Modal Preview Styles
const ImagePreviewContainer = styled.div`
   display: flex;
   gap: ${brandTheme.spacing.xl};
   max-height: 80vh;
   
   @media (max-width: 768px) {
       flex-direction: column;
       gap: ${brandTheme.spacing.lg};
   }
`;

const PreviewImage = styled.img`
   flex: 1;
   max-width: 65%;
   max-height: 100%;
   object-fit: contain;
   border-radius: ${brandTheme.radius.lg};
   box-shadow: ${brandTheme.shadow.lg};
   
   @media (max-width: 768px) {
       max-width: 100%;
       max-height: 400px;
   }
`;

const PreviewInfo = styled.div`
   flex: 0 0 320px;
   
   @media (max-width: 768px) {
       flex: none;
   }
`;

const InfoSection = styled.div`
   margin-bottom: ${brandTheme.spacing.lg};
   padding-bottom: ${brandTheme.spacing.md};
   border-bottom: 1px solid ${brandTheme.borderLight};
   
   &:last-child {
       border-bottom: none;
       margin-bottom: 0;
   }
`;

const InfoLabel = styled.div`
   font-size: 12px;
   font-weight: 600;
   color: ${brandTheme.text.muted};
   margin-bottom: ${brandTheme.spacing.xs};
   text-transform: uppercase;
   letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
   color: ${brandTheme.text.primary};
   font-size: 15px;
   font-weight: 500;
   line-height: 1.5;
`;

const ProtocolLink = styled.span`
   color: ${brandTheme.primary};
   cursor: pointer;
   text-decoration: underline;
   font-weight: 600;
   
   &:hover {
       color: ${brandTheme.primaryDark};
   }
`;

const TagsContainer = styled.div`
   display: flex;
   flex-wrap: wrap;
   gap: ${brandTheme.spacing.sm};
`;

const PreviewTag = styled.span`
   background: ${brandTheme.surfaceAlt};
   color: ${brandTheme.text.secondary};
   padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
   border-radius: ${brandTheme.radius.sm};
   font-size: 12px;
   font-weight: 500;
   border: 1px solid ${brandTheme.borderLight};
`;

const DownloadButton = styled.button`
   display: flex;
   align-items: center;
   justify-content: center;
   gap: ${brandTheme.spacing.sm};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
   color: white;
   border: none;
   border-radius: ${brandTheme.radius.lg};
   cursor: pointer;
   font-size: 14px;
   font-weight: 600;
   width: 100%;
   margin-top: ${brandTheme.spacing.xl};
   transition: all ${brandTheme.transitions.spring};
   box-shadow: ${brandTheme.shadow.sm};

   &:hover {
       background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
       transform: translateY(-2px);
       box-shadow: ${brandTheme.shadow.md};
   }

   &:active {
       transform: translateY(0);
   }
`;

export default GalleryPage;