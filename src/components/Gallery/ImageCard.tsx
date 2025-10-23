import React from 'react';
import styled from 'styled-components';
import {FaDownload, FaEye, FaExternalLinkAlt} from 'react-icons/fa';
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
        <Card>
            <ImageWrapper onClick={() => onImageClick(image)}>
                <StyledImage
                    src={imageUrl}
                    alt={image.name}
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.src = fallbackImage;
                    }}
                />
                <Overlay>
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
                </Overlay>
            </ImageWrapper>

            <CardContent>
                <CardTop>
                    <Title title={image.name}>{image.name}</Title>
                    <ProtocolLink
                        onClick={(e) => onProtocolClick(image.protocolId, e)}
                        title="Otwórz protokół"
                    >
                        #{image.protocolId}
                        <FaExternalLinkAlt />
                    </ProtocolLink>
                </CardTop>

                <MetaInfo>
                    <MetaText>{formatFileSize(image.size)}</MetaText>
                    <MetaDot>•</MetaDot>
                    <MetaText>{formatDate(parseJavaLocalDateTime(image.createdAt).toISOString())}</MetaText>
                </MetaInfo>

                {image.tags.length > 0 && (
                    <TagsWrapper>
                        {image.tags.slice(0, 3).map(tag => (
                            <Tag key={tag}>{tag}</Tag>
                        ))}
                        {image.tags.length > 3 && (
                            <MoreTags>+{image.tags.length - 3}</MoreTags>
                        )}
                    </TagsWrapper>
                )}
            </CardContent>
        </Card>
    );
};

const Card = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.md};
    overflow: hidden;
    transition: all ${theme.transitions.normal};
    border: 1px solid transparent;

    &:hover {
        border-color: ${theme.borderActive};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
    }
`;

const ImageWrapper = styled.div`
    position: relative;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: ${theme.surfaceAlt};
    cursor: pointer;
`;

const StyledImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform ${theme.transitions.slow};

    ${Card}:hover & {
        transform: scale(1.05);
    }
`;

const Overlay = styled.div`
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.md};
    opacity: 0;
    transition: opacity ${theme.transitions.normal};

    ${ImageWrapper}:hover & {
        opacity: 1;
    }
`;

const ActionButton = styled.button`
    width: 36px;
    height: 36px;
    border-radius: ${theme.radius.sm};
    background: rgba(255, 255, 255, 0.95);
    border: none;
    color: ${theme.text.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: ${theme.fontSize.md};
    transition: all ${theme.transitions.fast};

    &:hover {
        background: white;
        transform: scale(1.1);
    }

    &:active {
        transform: scale(0.95);
    }
`;

const CardContent = styled.div`
    padding: ${theme.spacing.lg};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const CardTop = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: ${theme.spacing.md};
`;

const Title = styled.h3`
    font-size: ${theme.fontSize.md};
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
    line-height: 1.3;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const ProtocolLink = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: transparent;
  color: ${theme.primary};
  border: 1px solid ${theme.primary}30;
  border-radius: ${theme.radius.sm};
  font-size: ${theme.fontSize.xs};
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all ${theme.transitions.fast};

  svg {
    font-size: ${theme.fontSize.xs};
  }

  &:hover {
    background: ${theme.primary};
    color: white;
    border-color: ${theme.primary};
  }
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const MetaText = styled.span`
    font-size: ${theme.fontSize.xs};
    color: ${theme.text.tertiary};
    font-weight: 500;
`;

const MetaDot = styled.span`
    color: ${theme.text.disabled};
    font-size: ${theme.fontSize.xs};
`;

const TagsWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.xs};
`;

const Tag = styled.span`
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${theme.surfaceAlt};
    color: ${theme.text.secondary};
    border-radius: ${theme.radius.sm};
    font-size: ${theme.fontSize.xs};
    font-weight: 500;
`;

const MoreTags = styled(Tag)`
    background: ${theme.primary}08;
    color: ${theme.primary};
    font-weight: 600;
`;

export default ImageCard;