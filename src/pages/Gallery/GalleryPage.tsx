// src/pages/Gallery/GalleryPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaImages, FaDownload, FaEye, FaTags, FaSearch } from 'react-icons/fa';
import { galleryApi, GalleryImage, GalleryFilters, GalleryStats } from '../../api/galleryApi';
import GalleryFiltersComponent from '../../components/Gallery/GalleryFilters';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { carReceptionApi } from '../../api/carReceptionApi';

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
            <GalleryHeader>
                <HeaderContent>
                    <Title>
                        <FaImages/> Galeria zdjęć
                    </Title>
                    {stats && (
                        <StatsContainer>
                            <StatItem>
                                <StatLabel>Zdjęcia:</StatLabel>
                                <StatValue>{stats.totalImages}</StatValue>
                            </StatItem>
                            <StatItem>
                                <StatLabel>Rozmiar:</StatLabel>
                                <StatValue>{formatFileSize(stats.totalSize)}</StatValue>
                            </StatItem>
                            <StatItem>
                                <StatLabel>Tagi:</StatLabel>
                                <StatValue>{availableTags.length}</StatValue>
                            </StatItem>
                        </StatsContainer>
                    )}
                </HeaderContent>
            </GalleryHeader>

            <GalleryFiltersComponent
                availableTags={availableTags}
                onFiltersChange={handleFiltersChange}
                isLoading={isLoading}
            />

            <GalleryContent>
                {(() => {
                    if (isLoading) {
                        return (
                            <LoadingContainer>
                                <LoadingSpinner/>
                                <LoadingText>Ładowanie zdjęć...</LoadingText>
                            </LoadingContainer>
                        );
                    } else if (images.length > 0) {
                        return (
                            <>
                                <ResultsInfo>
                                    Znaleziono {totalItems} {totalItems === 1 ? 'zdjęcie' : totalItems < 5 ? 'zdjęcia' : 'zdjęć'}
                                </ResultsInfo>

                                <ImagesGrid>
                                    {images.map(image => (
                                        // W ImagesGrid, zastąp strukturę ImageCard tą:
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
                                <EmptyStateIcon><FaSearch/></EmptyStateIcon>
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

            {/* Modal podglądu zdjęcia */}
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
                                    <span
                                        onClick={(e) => handleProtocolClick(selectedImage.protocolId, e)}
                                        style={{
                                            color: '#3498db',
                                            cursor: 'pointer',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        #{selectedImage.protocolId}
                                    </span>
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

// Finalne profesjonalne style dla GalleryPage.tsx
const GalleryContainer = styled.div`
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
    background: #fafbfc;
    min-height: 100vh;
`;

const GalleryHeader = styled.div`
    background: white;
    border-radius: 8px;
    padding: 28px 32px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    border: 1px solid #e5e9f0;
`;

const HeaderContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
    }
`;

const Title = styled.h1`
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    color: #1e2329;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.3px;
`;

const StatsContainer = styled.div`
    display: flex;
    gap: 24px;
    
    @media (max-width: 768px) {
        gap: 16px;
        width: 100%;
        justify-content: space-between;
    }
`;

const StatItem = styled.div`
    text-align: center;
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 6px;
    min-width: 70px;
    border: 1px solid #f0f2f5;
`;

const StatLabel = styled.div`
    font-size: 11px;
    color: #6b7684;
    margin-bottom: 4px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.3px;
`;

const StatValue = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: #1e2329;
`;

const GalleryContent = styled.div`
    background: white;
    border-radius: 8px;
    padding: 28px 32px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    border: 1px solid #e5e9f0;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 40px;
`;

const LoadingSpinner = styled.div`
    width: 32px;
    height: 32px;
    border: 2px solid #e5e9f0;
    border-top: 2px solid #4f5d75;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    color: #6b7684;
    font-size: 14px;
    font-weight: 500;
`;

const ResultsInfo = styled.div`
    margin-bottom: 24px;
    color: #4f5d75;
    font-size: 14px;
    font-weight: 500;
    padding: 0 0 16px 0;
    border-bottom: 1px solid #f0f2f5;
`;

const ImagesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
`;

const ImageCard = styled.div`
    border: 1px solid #e5e9f0;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
    background: white;
    
    &:hover {
        border-color: #d0d7de;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
    }
`;

const ImageContainer = styled.div`
    position: relative;
    height: 200px;
    overflow: hidden;
    background: #f8f9fa;
`;

const Image = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
    
    ${ImageCard}:hover & {
        transform: scale(1.03);
    }
`;

const ImageOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(30, 35, 41, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.25s ease;
    
    ${ImageCard}:hover & {
        opacity: 1;
    }
`;

const ImageActions = styled.div`
    display: flex;
    gap: 12px;
`;

const ActionButton = styled.button`
    width: 40px;
    height: 40px;
    border-radius: 6px;
    border: none;
    background: rgba(255, 255, 255, 0.95);
    color: #4f5d75;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 14px;
    
    &:hover {
        background: white;
        color: #1e2329;
        transform: translateY(-1px);
    }
`;

const ImageInfo = styled.div`
    padding: 16px;
`;

const ImageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
`;

const ImageName = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #1e2329;
    line-height: 1.3;
    flex: 1;
    margin-right: 12px;
`;

const ProtocolBadge = styled.div`
    background: #f0f2f5;
    color: #4f5d75;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid #e5e9f0;
    
    &:hover {
        background: #e5e9f0;
        color: #1e2329;
        transform: translateY(-1px);
    }
`;

const ImageMeta = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
`;

const MetaItem = styled.span`
    font-size: 12px;
    color: #6b7684;
    font-weight: 500;
`;

const ImageTags = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
`;

const TagsIcon = styled.div`
    color: #6b7684;
    font-size: 12px;
`;

const TagsList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
`;

const Tag = styled.span`
    background: #f8f9fa;
    color: #4f5d75;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 500;
    border: 1px solid #e5e9f0;
`;

const ImageDescription = styled.div`
    font-size: 12px;
    color: #6b7684;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 6px;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
`;

const EmptyStateIcon = styled.div`
    font-size: 48px;
    color: #d0d7de;
    margin-bottom: 16px;
`;

const EmptyStateTitle = styled.h3`
    color: #4f5d75;
    margin-bottom: 8px;
    font-size: 18px;
    font-weight: 600;
`;

const EmptyStateMessage = styled.p`
    color: #6b7684;
    max-width: 400px;
    line-height: 1.5;
    font-size: 14px;
    margin: 0;
`;

// Style dla modalu podglądu obrazu
const ImagePreviewContainer = styled.div`
    display: flex;
    gap: 24px;
    max-height: 80vh;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 16px;
    }
`;

const PreviewImage = styled.img`
    flex: 1;
    max-width: 65%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    @media (max-width: 768px) {
        max-width: 100%;
        max-height: 400px;
    }
`;

const PreviewInfo = styled.div`
    flex: 0 0 280px;
    
    @media (max-width: 768px) {
        flex: none;
    }
`;

const InfoSection = styled.div`
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f2f5;
    
    &:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }
`;

const InfoLabel = styled.div`
    font-size: 11px;
    font-weight: 600;
    color: #6b7684;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
`;

const InfoValue = styled.div`
    color: #1e2329;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
`;

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
`;

const PreviewTag = styled.span`
    background: #f8f9fa;
    color: #4f5d75;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    border: 1px solid #e5e9f0;
`;

const DownloadButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    background: #1e2329;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    width: 100%;
    margin-top: 20px;
    transition: all 0.2s ease;
    
    &:hover {
        background: #0d1117;
        transform: translateY(-1px);
    }
`;

export default GalleryPage;