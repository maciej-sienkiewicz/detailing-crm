// src/components/Gallery/GalleryContent.tsx
import React from 'react';
import styled from 'styled-components';
import {FaSearch} from 'react-icons/fa';
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
            <ContentContainer>
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie zdjęć...</LoadingText>
                </LoadingContainer>
            </ContentContainer>
        );
    }

    if (images.length === 0) {
        return (
            <ContentContainer>
                <EmptyState>
                    <EmptyStateIcon><FaSearch /></EmptyStateIcon>
                    <EmptyStateTitle>Brak zdjęć</EmptyStateTitle>
                    <EmptyStateMessage>
                        Nie znaleziono zdjęć spełniających podane kryteria wyszukiwania.
                        Spróbuj zmienić filtry lub dodać nowe zdjęcia do protokołów.
                    </EmptyStateMessage>
                </EmptyState>
            </ContentContainer>
        );
    }

    return (
        <ContentContainer>
            <ResultsInfo>
                <ResultsText>
                    Znaleziono <strong>{totalItems}</strong> {
                    totalItems === 1 ? 'zdjęcie' :
                        totalItems < 5 ? 'zdjęcia' : 'zdjęć'
                }
                </ResultsText>
            </ResultsInfo>

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

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                totalItems={totalItems}
                pageSize={pageSize}
            />
        </ContentContainer>
    );
};

const ContentContainer = styled.div`
  max-width: 100%;
  margin: 0;
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: ${theme.surface};
  border-radius: ${theme.radius.xl};
  border: 1px solid ${theme.border};
  box-shadow: ${theme.shadow.sm};
  margin-top: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};

  @media (max-width: 1024px) {
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    margin: ${theme.spacing.md} ${theme.spacing.lg};
  }

  @media (max-width: 768px) {
    padding: ${theme.spacing.md};
    margin: ${theme.spacing.md};
    border-radius: ${theme.radius.lg};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: ${theme.spacing.xl};
  background: ${theme.surfaceAlt};
  border-radius: ${theme.radius.xl};
  border: 2px dashed ${theme.borderLight};
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid ${theme.borderLight};
  border-top: 3px solid ${theme.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 18px;
  color: ${theme.text.tertiary};
  font-weight: 500;
`;

const ResultsInfo = styled.div`
  margin-bottom: ${theme.spacing.xl};
  padding: ${theme.spacing.md} 0;
  border-bottom: 1px solid ${theme.borderLight};
`;

const ResultsText = styled.div`
  color: ${theme.text.secondary};
  font-size: 16px;
  font-weight: 500;

  strong {
    color: ${theme.text.primary};
    font-weight: 700;
  }
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xxl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.lg};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xxl};
  text-align: center;
  background: ${theme.surfaceAlt};
  border-radius: ${theme.radius.xl};
  border: 2px dashed ${theme.borderLight};
`;

const EmptyStateIcon = styled.div`
  font-size: 64px;
  color: ${theme.text.disabled};
  margin-bottom: ${theme.spacing.lg};
`;

const EmptyStateTitle = styled.h3`
  color: ${theme.text.secondary};
  margin-bottom: ${theme.spacing.sm};
  font-size: 20px;
  font-weight: 600;
`;

const EmptyStateMessage = styled.p`
  color: ${theme.text.muted};
  max-width: 500px;
  line-height: 1.6;
  font-size: 16px;
  margin: 0;
`;

export default GalleryContent;