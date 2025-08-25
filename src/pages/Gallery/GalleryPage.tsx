// src/pages/Gallery/GalleryPage.tsx
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {GalleryImage} from '../../api/galleryApi';
import {theme} from '../../styles/theme';
import {useGallery} from '../../hooks/useGallery';
import {useImageDownload} from '../../hooks/useImageDownload';
import GalleryHeader from '../../components/Gallery/GalleryHeader';
import GalleryStatsComponent from '../../components/Gallery/GalleryStats';
import GalleryFiltersComponent from '../../components/Gallery/GalleryFilters';
import GalleryContent from '../../components/Gallery/GalleryContent';
import ImagePreviewModal from '../../components/Gallery/ImagePreviewModal';

const GalleryPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);

    const {
        images,
        stats,
        availableTags,
        currentPage,
        totalPages,
        totalItems,
        pageSize,
        isLoading,
        handleFiltersChange,
        handlePageChange,
        getImageUrl
    } = useGallery();

    const { downloadImage } = useImageDownload();

    const handleImageClick = (image: GalleryImage) => {
        setSelectedImage(image);
        setShowImageModal(true);
    };

    const handleProtocolClick = (protocolId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/visits/${protocolId}`);
    };

    const handleCloseModal = () => {
        setShowImageModal(false);
        setSelectedImage(null);
    };

    return (
        <GalleryContainer>
            <GalleryHeader />

            {stats && (
                <GalleryStatsComponent
                    stats={stats}
                    availableTagsCount={availableTags.length}
                    totalItems={totalItems}
                />
            )}

            <GalleryFiltersComponent
                availableTags={availableTags}
                onFiltersChange={handleFiltersChange}
                isLoading={isLoading}
            />

            <GalleryContent
                images={images}
                isLoading={isLoading}
                totalItems={totalItems}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                getImageUrl={getImageUrl}
                onImageClick={handleImageClick}
                onProtocolClick={handleProtocolClick}
                onDownload={downloadImage}
                onPageChange={handlePageChange}
            />

            <ImagePreviewModal
                isOpen={showImageModal}
                image={selectedImage}
                imageUrl={selectedImage ? getImageUrl(selectedImage.id) : ''}
                onClose={handleCloseModal}
                onProtocolClick={handleProtocolClick}
                onDownload={downloadImage}
            />
        </GalleryContainer>
    );
};

const GalleryContainer = styled.div`
  min-height: 100vh;
  background: ${theme.surfaceAlt};
  display: flex;
  flex-direction: column;
`;

export default GalleryPage;