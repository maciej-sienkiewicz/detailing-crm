import React from 'react';
import styled from 'styled-components';
import {FaImage, FaDownload, FaEye, FaExternalLinkAlt} from 'react-icons/fa';
import {GalleryImage} from '../../api/galleryApi';
import {formatDate, formatFileSize, parseJavaLocalDateTime} from '../../utils/galleryUtils';
import {theme} from '../../styles/theme';
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
            <ContentWrapper>
                <LoadingState>
                    <Spinner />
                    <LoadingText>Ładowanie zdjęć...</LoadingText>
                </LoadingState>
            </ContentWrapper>
        );
    }

    if (images.length === 0) {
        return (
            <ContentWrapper>
                <EmptyState>
                    <EmptyIcon>
                        <FaImage />
                    </EmptyIcon>
                    <EmptyTitle>Brak zdjęć</EmptyTitle>
                    <EmptyText>
                        Nie znaleziono zdjęć spełniających kryteria wyszukiwania.
                    </EmptyText>
                </EmptyState>
            </ContentWrapper>
        );
    }

    return (
        <>
            <ContentWrapper>
                <ContentHeader>
                    <ResultsCount>
                        Wyświetlanie <strong>{images.length}</strong> z <strong>{totalItems}</strong> {
                        totalItems === 1 ? 'zdjęcia' : totalItems < 5 ? 'zdjęć' : 'zdjęć'
                    }
                    </ResultsCount>
                </ContentHeader>

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
            </ContentWrapper>

            {totalPages > 1 && (
                <PaginationWrapper>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                        totalItems={totalItems}
                        pageSize={pageSize}
                        showTotalItems={false}
                    />
                </PaginationWrapper>
            )}
        </>
    );
};

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
                <Image
                    src={imageUrl}
                    alt={image.name}
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.src = fallbackImage;
                    }}
                />
                <Overlay>
                    <Actions>
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
                    </Actions>
                </Overlay>
            </ImageWrapper>

            <CardBody>
                <CardHeader>
                    <CardTitle title={image.name}>{image.name}</CardTitle>
                    <ProtocolBadge
                        onClick={(e) => onProtocolClick(image.protocolId, e)}
                        title="Otwórz protokół"
                    >
                        #{image.protocolId}
                        <FaExternalLinkAlt />
                    </ProtocolBadge>
                </CardHeader>

                <MetaRow>
                    <MetaItem>
                        <MetaValue>{formatFileSize(image.size)}</MetaValue>
                    </MetaItem>
                    <MetaDivider />
                    <MetaItem>
                        <MetaValue>{formatDate(parseJavaLocalDateTime(image.createdAt).toISOString())}</MetaValue>
                    </MetaItem>
                </MetaRow>

                {image.tags.length > 0 && (
                    <TagsRow>
                        {image.tags.slice(0, 3).map(tag => (
                            <Tag key={tag}>{tag}</Tag>
                        ))}
                        {image.tags.length > 3 && (
                            <MoreTag>+{image.tags.length - 3}</MoreTag>
                        )}
                    </TagsRow>
                )}
            </CardBody>
        </Card>
    );
};

const ContentWrapper = styled.div`
    padding: 32px;

    @media (max-width: 768px) {
        padding: 24px;
    }
`;

const ContentHeader = styled.div`
    margin-bottom: 24px;
`;

const ResultsCount = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;

    strong {
        color: ${theme.text.primary};
        font-weight: 700;
    }
`;

const ImagesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 16px;
    }
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 0;
    gap: 20px;
`;

const Spinner = styled.div`
    width: 48px;
    height: 48px;
    border: 4px solid ${theme.borderLight};
    border-top-color: ${theme.primary};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 15px;
    color: ${theme.text.tertiary};
    font-weight: 600;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 0;
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 72px;
    height: 72px;
    border-radius: 16px;
    background: ${theme.surfaceAlt};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: ${theme.text.disabled};
    margin-bottom: 20px;
`;

const EmptyTitle = styled.h3`
    font-size: 20px;
    font-weight: 700;
    color: ${theme.text.secondary};
    margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
    font-size: 14px;
    color: ${theme.text.tertiary};
    max-width: 400px;
    margin: 0;
    line-height: 1.6;
`;

const PaginationWrapper = styled.div`
    display: flex;
    justify-content: center;
    padding: 24px 32px;
    border-top: 1px solid #f0f3f7;

    @media (max-width: 768px) {
        padding: 20px 24px;
    }
`;

const Card = styled.div`
    background: white;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);

    &:hover {
        border-color: ${theme.primary}30;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
        transform: translateY(-4px);
    }
`;

const ImageWrapper = styled.div`
    position: relative;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: ${theme.surfaceAlt};
    cursor: pointer;
`;

const Image = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;

    ${Card}:hover & {
        transform: scale(1.08);
    }
`;

const Overlay = styled.div`
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(15, 23, 42, 0.8) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;

    ${ImageWrapper}:hover & {
        opacity: 1;
    }
`;

const Actions = styled.div`
    display: flex;
    gap: 12px;
`;

const ActionButton = styled.button`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: white;
    border: none;
    color: ${theme.text.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    &:hover {
        background: ${theme.primary};
        color: white;
        transform: scale(1.1) translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    }

    &:active {
        transform: scale(0.95);
    }
`;

const CardBody = styled.div`
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const CardHeader = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
`;

const CardTitle = styled.h3`
    font-size: 15px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0;
    line-height: 1.3;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const ProtocolBadge = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: ${theme.primary}08;
    color: ${theme.primary};
    border: 2px solid ${theme.primary}30;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    flex-shrink: 0;

    svg {
        font-size: 10px;
    }

    &:hover {
        background: ${theme.primary};
        color: white;
        border-color: ${theme.primary};
        transform: translateY(-2px);
        box-shadow: 0 4px 12px ${theme.primary}30;
    }
`;

const MetaRow = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const MetaItem = styled.div`
    flex: 1;
`;

const MetaValue = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
    font-weight: 600;
`;

const MetaDivider = styled.div`
    width: 1px;
    height: 16px;
    background: ${theme.borderLight};
`;

const TagsRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const Tag = styled.span`
    padding: 6px 12px;
    background: ${theme.surfaceAlt};
    color: ${theme.text.secondary};
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
`;

const MoreTag = styled(Tag)`
    background: ${theme.primary}10;
    color: ${theme.primary};
    font-weight: 700;
`;

export default GalleryContent;