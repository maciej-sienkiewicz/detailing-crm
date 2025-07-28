// src/components/Gallery/ImagePreviewModal.tsx
import React from 'react';
import styled from 'styled-components';
import { FaDownload } from 'react-icons/fa';
import { GalleryImage } from '../../api/galleryApi';
import { formatFileSize, formatDate, parseJavaLocalDateTime } from '../../utils/galleryUtils';
import { theme } from '../../styles/theme';
import Modal from '../common/Modal';

interface ImagePreviewModalProps {
    isOpen: boolean;
    image: GalleryImage | null;
    imageUrl: string;
    onClose: () => void;
    onProtocolClick: (protocolId: string, e: React.MouseEvent) => void;
    onDownload: (image: GalleryImage) => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
                                                                 isOpen,
                                                                 image,
                                                                 imageUrl,
                                                                 onClose,
                                                                 onProtocolClick,
                                                                 onDownload
                                                             }) => {
    if (!image) return null;

    const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJyYWsgb2JyYXprYTwvdGV4dD48L3N2Zz4=';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Podgląd zdjęcia"
            size="lg"
        >
            <ImagePreviewContainer>
                <PreviewImage
                    src={imageUrl}
                    alt={image.name}
                    onError={(e) => {
                        e.currentTarget.src = fallbackImage;
                    }}
                />
                <PreviewInfo>
                    <InfoSection>
                        <InfoLabel>Nazwa</InfoLabel>
                        <InfoValue>{image.name}</InfoValue>
                    </InfoSection>

                    <InfoSection>
                        <InfoLabel>Protokół</InfoLabel>
                        <InfoValue>
                            <ProtocolLink
                                onClick={(e) => onProtocolClick(image.protocolId, e)}
                            >
                                #{image.protocolId}
                            </ProtocolLink>
                        </InfoValue>
                    </InfoSection>

                    {image.protocolTitle && (
                        <InfoSection>
                            <InfoLabel>Tytuł protokołu</InfoLabel>
                            <InfoValue>{image.protocolTitle}</InfoValue>
                        </InfoSection>
                    )}

                    {image.clientName && (
                        <InfoSection>
                            <InfoLabel>Klient</InfoLabel>
                            <InfoValue>{image.clientName}</InfoValue>
                        </InfoSection>
                    )}

                    {image.vehicleInfo && (
                        <InfoSection>
                            <InfoLabel>Pojazd</InfoLabel>
                            <InfoValue>{image.vehicleInfo}</InfoValue>
                        </InfoSection>
                    )}

                    <InfoSection>
                        <InfoLabel>Rozmiar</InfoLabel>
                        <InfoValue>{formatFileSize(image.size)}</InfoValue>
                    </InfoSection>

                    <InfoSection>
                        <InfoLabel>Data utworzenia</InfoLabel>
                        <InfoValue>{formatDate(parseJavaLocalDateTime(image.createdAt).toISOString())}</InfoValue>
                    </InfoSection>

                    {image.tags.length > 0 && (
                        <InfoSection>
                            <InfoLabel>Tagi</InfoLabel>
                            <TagsContainer>
                                {image.tags.map(tag => (
                                    <PreviewTag key={tag}>{tag}</PreviewTag>
                                ))}
                            </TagsContainer>
                        </InfoSection>
                    )}

                    {image.description && (
                        <InfoSection>
                            <InfoLabel>Opis</InfoLabel>
                            <InfoValue>{image.description}</InfoValue>
                        </InfoSection>
                    )}

                    <DownloadButton onClick={() => onDownload(image)}>
                        <FaDownload /> Pobierz zdjęcie
                    </DownloadButton>
                </PreviewInfo>
            </ImagePreviewContainer>
        </Modal>
    );
};

const ImagePreviewContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
  max-height: 80vh;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.lg};
  }
`;

const PreviewImage = styled.img`
  flex: 1;
  max-width: 65%;
  max-height: 100%;
  object-fit: contain;
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadow.lg};

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
  margin-bottom: ${theme.spacing.lg};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.borderLight};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${theme.text.muted};
  margin-bottom: ${theme.spacing.xs};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
  color: ${theme.text.primary};
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
`;

const ProtocolLink = styled.span`
  color: ${theme.primary};
  cursor: pointer;
  text-decoration: underline;
  font-weight: 600;

  &:hover {
    color: ${theme.primaryDark};
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

const PreviewTag = styled.span`
  background: ${theme.surfaceAlt};
  color: ${theme.text.secondary};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.radius.sm};
  font-size: 12px;
  font-weight: 500;
  border: 1px solid ${theme.borderLight};
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
  color: white;
  border: none;
  border-radius: ${theme.radius.lg};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  width: 100%;
  margin-top: ${theme.spacing.xl};
  transition: all ${theme.transitions.spring};
  box-shadow: ${theme.shadow.sm};

  &:hover {
    background: linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 100%);
    transform: translateY(-2px);
    box-shadow: ${theme.shadow.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

export default ImagePreviewModal;