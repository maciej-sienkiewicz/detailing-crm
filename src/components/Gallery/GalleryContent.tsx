import React from 'react';
import styled from 'styled-components';
import {FaImage} from 'react-icons/fa';
import {GalleryImage} from '../../api/galleryApi';
import {theme} from '../../styles/theme';
import ImageCard from './ImageCard';
import Pagination from '../common/Pagination';

interface GalleryContentProps {
    images: GalleryImage[];
    isLoading: boolean;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    getImageUrl: (imageId: string) => string;
    onImageClick: (image: GalleryImage) => void;
    onProtocolClick: (protocolId: string, e: React.MouseEvent) => void;
    onDownload: (image: GalleryImage, e?: React.MouseEvent) => void;
    onPageChange: (page: number) => void;
}

const GalleryContent: React.FC<GalleryContentProps> = ({
                                                           images,
                                                           isLoading,
                                                           totalItems,
                                                           currentPage,
                                                           totalPages,
                                                           pageSize,
                                                           getImageUrl,
                                                           onImageClick,
                                                           onProtocolClick,
                                                           onDownload,
                                                           onPageChange
                                                       }) => {
    if (isLoading) {
        return (
            <ContentSection>
                <LoadingState>
                    <Spinner />
                    <LoadingText>Ładowanie zdjęć...</LoadingText>
                </LoadingState>
            </ContentSection>
        );
    }

    if (images.length === 0) {
        return (
            <ContentSection>
                <EmptyState>
                    <EmptyIcon>
                        <FaImage />
                    </EmptyIcon>
                    <EmptyTitle>Brak zdjęć</EmptyTitle>
                    <EmptyText>
                        Nie znaleziono zdjęć. Spróbuj zmienić filtry wyszukiwania.
                    </EmptyText>
                </EmptyState>
            </ContentSection>
        );
    }

    return (
        <>
            <ContentSection>
                <ImagesGrid>
                    {images.map(image => (
                        <ImageCard
                            key={image.id}
                            image={image}
                            imageUrl={getImageUrl(image.id)}
                            onImageClick={onImageClick}
                            onProtocolClick={onProtocolClick}
                            onDownload={onDownload}
                        />
                    ))}
                </ImagesGrid>
            </ContentSection>

            {totalPages > 1 && (
                <PaginationSection>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                        totalItems={totalItems}
                        pageSize={pageSize}
                        showTotalItems={false}
                    />
                </PaginationSection>
            )}
        </>
    );
};

const ContentSection = styled.div`
    padding: ${theme.spacing.xl};

    @media (max-width: 1024px) {
        padding: ${theme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: ${theme.spacing.md};
    }
`;

const ImagesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: ${theme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.md};
    }
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxxl} 0;
    gap: ${theme.spacing.lg};
`;

const Spinner = styled.div`
    width: 32px;
    height: 32px;
    border: 3px solid ${theme.borderLight};
    border-top-color: ${theme.primary};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: ${theme.fontSize.sm};
    color: ${theme.text.tertiary};
    font-weight: 500;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxxl} 0;
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: ${theme.radius.lg};
    background: ${theme.surfaceAlt};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${theme.fontSize.xxl};
    color: ${theme.text.disabled};
    margin-bottom: ${theme.spacing.lg};
`;

const EmptyTitle = styled.h3`
    font-size: ${theme.fontSize.lg};
    font-weight: 600;
    color: ${theme.text.secondary};
    margin: 0 0 ${theme.spacing.sm} 0;
`;

const EmptyText = styled.p`
    font-size: ${theme.fontSize.base};
    color: ${theme.text.tertiary};
    max-width: 400px;
    margin: 0;
    line-height: 1.5;
`;

const PaginationSection = styled.div`
    display: flex;
    justify-content: center;
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    border-top: 1px solid ${theme.borderLight};

    @media (max-width: 768px) {
        padding: ${theme.spacing.md};
    }
`;

export default GalleryContent;