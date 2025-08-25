// src/components/Gallery/ImageCard.tsx
import React from 'react';
import styled from 'styled-components';
import {FaDownload, FaEye, FaTags} from 'react-icons/fa';
import {GalleryImage} from '../../api/galleryApi';
import {formatDate, formatFileSize, parseJavaLocalDateTime} from '../../utils/galleryUtils';
import {theme} from '../../styles/theme';

interface ImageCardProps {
    image: GalleryImage;
    imageUrl: string;
    onImageClick: (image: GalleryImage) => void;
    onProtocolClick: (protocolId: string, e: React.MouseEvent) => void;
    onDownload: (image: GalleryImage, e?: React.MouseEvent) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({
                                                 image,
                                                 imageUrl,
                                                 onImageClick,
                                                 onProtocolClick,
                                                 onDownload
                                             }) => {
    const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNmI3Njg0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QnJhayBvYnJhem7EhTwvdGV4dD48L3N2Zz4=';

    return (
        <Card onClick={() => onImageClick(image)}>
            <ImageContainer>
                <Image
                    src={imageUrl}
                    alt={image.name}
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.src = fallbackImage;
                    }}
                />
                <ImageOverlay>
                    <ImageActions>
                        <ActionButton
                            onClick={(e) => {
                                e.stopPropagation();
                                onImageClick(image);
                            }}
                            title="Podgląd"
                        >
                            <FaEye />
                        </ActionButton>
                        <ActionButton
                            onClick={(e) => onDownload(image, e)}
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
                        onClick={(e) => onProtocolClick(image.protocolId, e)}
                        title="Kliknij, aby przejść do protokołu"
                    >
                        #{image.protocolId}
                    </ProtocolBadge>
                </ImageHeader>

                <ImageMeta>
                    <MetaItem>{formatFileSize(image.size)}</MetaItem>
                    <MetaItem>{formatDate(parseJavaLocalDateTime(image.createdAt).toISOString())}</MetaItem>
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
        </Card>
    );
};

const Card = styled.div`
  border: 1px solid ${theme.border};
  border-radius: ${theme.radius.xl};
  overflow: hidden;
  cursor: pointer;
  transition: all ${theme.transitions.spring};
  background: ${theme.surface};
  box-shadow: ${theme.shadow.xs};

  &:hover {
    border-color: ${theme.primary};
    box-shadow: ${theme.shadow.lg};
    transform: translateY(-4px);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  height: 240px;
  overflow: hidden;
  background: ${theme.surfaceAlt};
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform ${theme.transitions.slow};

  ${Card}:hover & {
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
  transition: opacity ${theme.transitions.normal};
  backdrop-filter: blur(4px);

  ${Card}:hover & {
    opacity: 1;
  }
`;

const ImageActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;

const ActionButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: ${theme.radius.lg};
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.transitions.normal};
  font-size: 18px;
  backdrop-filter: blur(8px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px) scale(1.05);
    box-shadow: ${theme.shadow.lg};
  }
`;

const ImageInfo = styled.div`
  padding: ${theme.spacing.lg};
`;

const ImageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
  gap: ${theme.spacing.sm};
`;

const ImageName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.text.primary};
  line-height: 1.4;
  flex: 1;
`;

const ProtocolBadge = styled.div`
  background: linear-gradient(135deg, ${theme.primaryGhost} 0%, ${theme.surface} 100%);
  color: ${theme.primary};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.radius.sm};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  border: 1px solid ${theme.primary}30;
  flex-shrink: 0;

  &:hover {
    background: ${theme.primary};
    color: white;
    transform: translateY(-1px);
    box-shadow: ${theme.shadow.sm};
  }
`;

const ImageMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
  gap: ${theme.spacing.sm};
`;

const MetaItem = styled.span`
  font-size: 12px;
  color: ${theme.text.muted};
  font-weight: 500;
`;

const ImageTags = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
`;

const TagsIcon = styled.div`
  color: ${theme.text.muted};
  font-size: 12px;
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
`;

const Tag = styled.span`
  background: ${theme.surfaceAlt};
  color: ${theme.text.secondary};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.radius.sm};
  font-size: 11px;
  font-weight: 500;
  border: 1px solid ${theme.borderLight};
`;

const ImageDescription = styled.div`
  font-size: 13px;
  color: ${theme.text.tertiary};
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default ImageCard;