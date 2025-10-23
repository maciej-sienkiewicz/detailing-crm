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
        <PageContainer>
            <GalleryHeader />

            <ContentArea>
                <ContentInner>
                    <CompactCard>
                        <GalleryStatsComponent
                            stats={stats}
                            availableTagsCount={availableTags.length}
                            totalItems={totalItems}
                        />

                        <Divider />

                        <GalleryFiltersComponent
                            availableTags={availableTags}
                            onFiltersChange={handleFiltersChange}
                            isLoading={isLoading}
                        />
                    </CompactCard>

                    <CompactCard>
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
                    </CompactCard>
                </ContentInner>
            </ContentArea>

            <ImagePreviewModal
                isOpen={showImageModal}
                image={selectedImage}
                imageUrl={selectedImage ? getImageUrl(selectedImage.id) : ''}
                onClose={handleCloseModal}
                onProtocolClick={handleProtocolClick}
                onDownload={downloadImage}
            />
        </PageContainer>
    );
};

const PageContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
    min-height: 100vh;
`;

const ContentArea = styled.main`
    flex: 1;
    padding: 24px;

    @media (max-width: 768px) {
        padding: 16px;
    }
`;

const ContentInner = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const CompactCard = styled.div`
    background: white;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    border: 1px solid #e8ecef;
    overflow: hidden;
`;

const Divider = styled.div`
    height: 1px;
    background: #f5f7fa;
`;

export default GalleryPage;