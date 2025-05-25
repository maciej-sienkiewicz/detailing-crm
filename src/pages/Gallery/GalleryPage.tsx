// src/pages/Gallery/GalleryPage.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaImages, FaDownload, FaEye, FaTags, FaSearch } from 'react-icons/fa';
import { galleryApi, GalleryImage, GalleryFilters, GalleryStats } from '../../api/galleryApi';
import GalleryFiltersComponent from '../../components/Gallery/GalleryFilters';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { carReceptionApi } from '../../api/carReceptionApi';


const GalleryPage: React.FC = () => {
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
            console.log('📸 Response.data:', response.data);
            console.log('📊 Response.pagination:', response.pagination);

            // Sprawdź czy response ma oczekiwaną strukturę
            if (!response) {
                console.error('❌ Response is null/undefined');
                setImages([]);
                return;
            }

            if (!response.data) {
                console.error('❌ Response.data is null/undefined');
                setImages([]);
                return;
            }

            if (!Array.isArray(response.data)) {
                console.error('❌ Response.data is not an array:', typeof response.data, response.data);
                setImages([]);
                return;
            }

            console.log('🔄 Setting images state with:', response.data.length, 'items');
            setImages(response.data);

            console.log('🔄 Setting pagination - totalPages:', response.pagination?.totalPages, 'totalItems:', response.pagination?.totalItems);
            setTotalPages(response.pagination?.totalPages || 0);
            setTotalItems(response.pagination?.totalItems || 0);

            // Sprawdź stan po ustawieniu
            console.log('🔍 State should be updated now...');

        } catch (error) {
            console.error('❌ Error in searchImages:', error);
            console.error('❌ Error stack:', error.stack);
            setImages([]);
        } finally {
            console.log('⏹️ Setting isLoading to false');
            setIsLoading(false);
        }
    };

    const handleFiltersChange = (newFilters: GalleryFilters) => {
        setFilters(newFilters);
        setCurrentPage(0); // Reset do pierwszej strony przy zmianie filtrów
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page - 1); // Pagination używa 1-based, API używa 0-based
    };

    const handleImageClick = (image: GalleryImage) => {
        setSelectedImage(image);
        setShowImageModal(true);
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
                    console.log('🎨 Rendering gallery content:', {
                        isLoading,
                        imagesCount: images.length,
                        images: images.map(img => ({id: img.id, name: img.name}))
                    });

                    if (isLoading) {
                        return (
                            <LoadingContainer>
                                <LoadingSpinner/>
                                <LoadingText>Ładowanie zdjęć...</LoadingText>
                            </LoadingContainer>
                        );
                    } else if (images.length > 0) {
                        console.log('📋 About to render images grid with', images.length, 'images');
                        return (
                            <>
                                <ResultsInfo>
                                    Znaleziono {totalItems} {totalItems === 1 ? 'zdjęcie' : totalItems < 5 ? 'zdjęcia' : 'zdjęć'}
                                </ResultsInfo>

                                <ImagesGrid>
                                    {images.map(image => {
                                        console.log('🖼️ Rendering image:', image.id, image.name);
                                        return (
                                            <ImageCard key={image.id} onClick={() => handleImageClick(image)}>
                                                <ImageContainer>
                                                    <Image
                                                        src={getImageUrl(image)} // Zamiast galleryApi.getThumbnailUrl(image.id)
                                                        alt={image.name}
                                                        loading="lazy"
                                                        onLoad={() => console.log('✅ Image loaded successfully:', image.id)}
                                                        onError={(e) => {
                                                            console.error('❌ Image failed to load:', image.id);
                                                            console.log('🔗 URL that failed:', getImageUrl(image));
                                                            // Fallback
                                                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJyYWsgb2JyYXprYTwvdGV4dD48L3N2Zz4=';
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
                                        );
                                    })}
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
                        console.log('🚫 Showing empty state');
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
        </GalleryContainer>
    );
};

// Stylowanie komponentów
const GalleryContainer = styled.div`
   padding: 20px;
   max-width: 1400px;
   margin: 0 auto;
`;

const GalleryHeader = styled.div`
   background: white;
   border-radius: 8px;
   padding: 20px;
   margin-bottom: 20px;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   
   @media (max-width: 768px) {
       flex-direction: column;
       align-items: flex-start;
       gap: 15px;
   }
`;

const Title = styled.h1`
   display: flex;
   align-items: center;
   gap: 10px;
   margin: 0;
   color: #2c3e50;
   font-size: 24px;
`;

const StatsContainer = styled.div`
   display: flex;
   gap: 20px;
   
   @media (max-width: 768px) {
       gap: 15px;
   }
`;

const StatItem = styled.div`
   text-align: center;
`;

const StatLabel = styled.div`
   font-size: 12px;
   color: #7f8c8d;
   margin-bottom: 2px;
`;

const StatValue = styled.div`
   font-size: 16px;
   font-weight: 600;
   color: #2c3e50;
`;

const GalleryContent = styled.div`
   background: white;
   border-radius: 8px;
   padding: 20px;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const LoadingContainer = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: 40px;
`;

const LoadingSpinner = styled.div`
   width: 40px;
   height: 40px;
   border: 4px solid #f3f3f3;
   border-top: 4px solid #3498db;
   border-radius: 50%;
   animation: spin 1s linear infinite;
   margin-bottom: 15px;
   
   @keyframes spin {
       0% { transform: rotate(0deg); }
       100% { transform: rotate(360deg); }
   }
`;

const LoadingText = styled.div`
   color: #7f8c8d;
   font-size: 16px;
`;

const ResultsInfo = styled.div`
   margin-bottom: 20px;
   color: #7f8c8d;
   font-size: 14px;
`;

const ImagesGrid = styled.div`
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
   gap: 20px;
   margin-bottom: 30px;
`;

const ImageCard = styled.div`
   border: 1px solid #eee;
   border-radius: 8px;
   overflow: hidden;
   cursor: pointer;
   transition: all 0.2s ease;
   background: white;
   
   &:hover {
       border-color: #3498db;
       box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15);
       transform: translateY(-2px);
   }
`;

const ImageContainer = styled.div`
   position: relative;
   height: 200px;
   overflow: hidden;
`;

const Image = styled.img`
   width: 100%;
   height: 100%;
   object-fit: cover;
   transition: transform 0.3s ease;
   
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
   background: rgba(0, 0, 0, 0.5);
   display: flex;
   align-items: center;
   justify-content: center;
   opacity: 0;
   transition: opacity 0.2s ease;
   
   ${ImageCard}:hover & {
       opacity: 1;
   }
`;

const ImageActions = styled.div`
   display: flex;
   gap: 10px;
`;

const ActionButton = styled.button`
   width: 40px;
   height: 40px;
   border-radius: 50%;
   border: none;
   background: rgba(255, 255, 255, 0.9);
   color: #2c3e50;
   cursor: pointer;
   display: flex;
   align-items: center;
   justify-content: center;
   transition: all 0.2s ease;
   
   &:hover {
       background: white;
       transform: scale(1.1);
   }
`;

const ImageInfo = styled.div`
   padding: 15px;
`;

const ImageName = styled.div`
   font-weight: 600;
   color: #2c3e50;
   margin-bottom: 5px;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
`;

const ImageMeta = styled.div`
   display: flex;
   justify-content: space-between;
   margin-bottom: 8px;
`;

const MetaItem = styled.span`
   font-size: 12px;
   color: #7f8c8d;
`;

const ImageTags = styled.div`
   display: flex;
   align-items: center;
   gap: 6px;
   margin-bottom: 8px;
`;

const TagsIcon = styled.div`
   color: #3498db;
   font-size: 12px;
`;

const TagsList = styled.div`
   display: flex;
   flex-wrap: wrap;
   gap: 4px;
`;

const Tag = styled.span`
   background: #f0f7ff;
   color: #3498db;
   padding: 2px 6px;
   border-radius: 10px;
   font-size: 10px;
   border: 1px solid #d5e9f9;
`;

const ImageDescription = styled.div`
   font-size: 12px;
   color: #7f8c8d;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
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
   color: #bdc3c7;
   margin-bottom: 20px;
`;

const EmptyStateTitle = styled.h3`
   color: #2c3e50;
   margin-bottom: 10px;
`;

const EmptyStateMessage = styled.p`
   color: #7f8c8d;
   max-width: 400px;
   line-height: 1.5;
`;

const ImagePreviewContainer = styled.div`
   display: flex;
   gap: 20px;
   max-height: 80vh;
   
   @media (max-width: 768px) {
       flex-direction: column;
   }
`;

const PreviewImage = styled.img`
   flex: 1;
   max-width: 60%;
   max-height: 100%;
   object-fit: contain;
   border-radius: 4px;
   
   @media (max-width: 768px) {
       max-width: 100%;
       max-height: 400px;
   }
`;

const PreviewInfo = styled.div`
   flex: 0 0 300px;
   
   @media (max-width: 768px) {
       flex: none;
   }
`;

const InfoSection = styled.div`
   margin-bottom: 15px;
`;

const InfoLabel = styled.div`
   font-size: 12px;
   font-weight: 600;
   color: #7f8c8d;
   margin-bottom: 5px;
`;

const InfoValue = styled.div`
   color: #2c3e50;
`;

const TagsContainer = styled.div`
   display: flex;
   flex-wrap: wrap;
   gap: 6px;
`;

const PreviewTag = styled.span`
   background: #f0f7ff;
   color: #3498db;
   padding: 4px 8px;
   border-radius: 12px;
   font-size: 12px;
   border: 1px solid #d5e9f9;
`;

const DownloadButton = styled.button`
   display: flex;
   align-items: center;
   gap: 8px;
   padding: 10px 16px;
   background: #3498db;
   color: white;
   border: none;
   border-radius: 4px;
   cursor: pointer;
   font-size: 14px;
   width: 100%;
   justify-content: center;
   margin-top: 20px;
   
   &:hover {
       background: #2980b9;
   }
`;

export default GalleryPage;