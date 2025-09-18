// src/pages/Clients/components/VehicleDetailPage/SimpleImagePreviewModal.tsx - NAPRAWIONY
import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaTags } from 'react-icons/fa';
import { theme } from '../../../../styles/theme';

interface VehicleImage {
    id: string;
    url: string;
    thumbnailUrl: string;
    filename: string;
    uploadedAt: string;
    blobUrl?: string;
    name?: string;
    tags?: string[];
    description?: string;
    protocolId?: string;
    protocolTitle?: string;
    clientName?: string;
    vehicleInfo?: string;
    size?: number;
    createdAt?: string;
}

interface SimpleImagePreviewModalProps {
    isOpen: boolean;
    image: VehicleImage | null;
    imageUrl: string;
    onClose: () => void;
}

const SimpleImagePreviewModal: React.FC<SimpleImagePreviewModalProps> = ({
                                                                             isOpen,
                                                                             image,
                                                                             imageUrl,
                                                                             onClose
                                                                         }) => {
    if (!isOpen || !image) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJyYWsgb2JyYXprYTwvdGV4dD48L3N2Zz4=';

    return (
        <ModalOverlay onClick={handleOverlayClick}>
            <ModalContainer>
                <ModalHeader>
                    <HeaderTitle>{image.name || image.filename}</HeaderTitle>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ImageContainer>
                    <PreviewImage
                        src={imageUrl}
                        alt={image.name || image.filename}
                        onError={(e) => {
                            e.currentTarget.src = fallbackImage;
                        }}
                    />
                </ImageContainer>

                {image.tags && image.tags.length > 0 && (
                    <TagsSection>
                        <TagsHeader>
                            <FaTags />
                            Tagi
                        </TagsHeader>
                        <TagsContainer>
                            {image.tags.map((tag, index) => (
                                <Tag key={index}>{tag}</Tag>
                            ))}
                        </TagsContainer>
                    </TagsSection>
                )}
            </ModalContainer>
        </ModalOverlay>
    );
};

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
    padding: ${theme.spacing.lg}; /* Dodany padding dla bezpieczeństwa na małych ekranach */

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    background: white;
    border-radius: ${theme.radius.xl};
    box-shadow: ${theme.shadow.xl};
    width: 95vw; /* Zwiększona szerokość */
    max-width: 1200px; /* Zwiększona maksymalna szerokość */
    height: 95vh; /* Zwiększona wysokość */
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
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    border-bottom: 1px solid ${theme.border};
    background: ${theme.surfaceAlt};
    flex-shrink: 0; /* Zapobiega kurczeniu się headera */
`;

const HeaderTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 80%;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${theme.surfaceHover};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.sm};
    color: ${theme.text.muted};
    cursor: pointer;
    transition: all ${theme.transitions.normal};

    &:hover {
        background: ${theme.status.errorLight};
        border-color: ${theme.status.error};
        color: ${theme.status.error};
        transform: translateY(-1px);
    }
`;

/* NAPRAWIONY KONTENER ZDJĘCIA - dynamiczna wysokość */
const ImageContainer = styled.div`
    flex: 1; /* Zajmuje całą dostępną przestrzeń */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
    overflow: auto; /* Umożliwia przewijanie jeśli zdjęcie jest bardzo duże */
    min-height: 0; /* Pozwala na kurczenie się */

    /* Dodatkowy scroll jeśli potrzebny */
    &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 4px;

        &:hover {
            background: rgba(0, 0, 0, 0.5);
        }
    }
`;

/* NAPRAWIONE ZDJĘCIE - zawsze pokazuje całe zdjęcie */
const PreviewImage = styled.img`
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain; /* Zachowuje proporcje i pokazuje całe zdjęcie */
    border-radius: ${theme.radius.lg};
    box-shadow: ${theme.shadow.lg};
    display: block; /* Eliminuje potencjalne problemy z inline */

    /* Dla bardzo małych ekranów - pozwól na pełny rozmiar */
    @media (max-width: 768px) {
        max-width: calc(100% - ${theme.spacing.md});
        max-height: calc(100% - ${theme.spacing.md});
    }
`;

const TagsSection = styled.div`
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    border-top: 1px solid ${theme.border};
    background: white;
    flex-shrink: 0; /* Zapobiega kurczeniu się sekcji tagów */
    max-height: 150px; /* Ogranicza wysokość sekcji tagów */
    overflow-y: auto; /* Dodaje scroll jeśli za dużo tagów */

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-track {
        background: ${theme.surfaceAlt};
        border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
        background: ${theme.border};
        border-radius: 2px;
    }
`;

const TagsHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.md};
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.secondary};

    svg {
        font-size: 12px;
    }
`;

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.sm};
`;

const Tag = styled.span`
    background: ${theme.primaryGhost};
    color: ${theme.primary};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border-radius: ${theme.radius.xl};
    font-size: 12px;
    font-weight: 500;
    border: 1px solid ${theme.primary}30;
`;

export default SimpleImagePreviewModal;