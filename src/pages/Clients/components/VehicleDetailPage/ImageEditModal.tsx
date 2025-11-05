// src/pages/Clients/components/VehicleDetailPage/ImageEditModal.tsx - ZAKTUALIZOWANY z pobieraniem tagów z API
import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaPlus, FaTag, FaSave, FaSpinner } from 'react-icons/fa';
import { theme } from '../../../../styles/theme';
import { apiClientNew } from '../../../../shared/api/apiClientNew';

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

// NOWY INTERFEJS - odpowiadający MediaResponse z backendu
interface MediaResponse {
    id: string;
    context: string;
    entity_id?: number;
    visit_id?: string;
    vehicle_id?: string;
    name: string;
    description?: string;
    location?: string;
    tags: string[];
    type: string;
    size: number;
    content_type: string;
    created_at: string;
    download_url: string;
    thumbnail_url?: string;
}

interface ImageEditModalProps {
    isOpen: boolean;
    image: VehicleImage | null;
    imageUrl: string;
    onClose: () => void;
    onSave: (updatedImage: VehicleImage) => void;
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({
                                                           isOpen,
                                                           image,
                                                           imageUrl,
                                                           onClose,
                                                           onSave
                                                       }) => {
    const [tags, setTags] = useState<string[]>([]);
    const [customTagInput, setCustomTagInput] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [loadingMediaInfo, setLoadingMediaInfo] = useState(false); // NOWY STAN - ładowanie informacji o mediach
    const [mediaInfo, setMediaInfo] = useState<MediaResponse | null>(null); // NOWY STAN - informacje o mediach

    // Sugerowane tagi dla branży motoryzacyjnej
    const suggestedTags = [
        'Przed pracami', 'Po pracach', 'Uszkodzenia', 'Rysy', 'Lakier',
        'Wnętrze', 'Zewnątrz', 'Silnik', 'Felgi', 'Opony', 'Detale',
        'Problem', 'Naprawa', 'Czyszczenie', 'Polerowanie'
    ];

    // NOWA FUNKCJA - pobieranie informacji o mediach z API
    const loadMediaInfo = useCallback(async (mediaId: string) => {
        if (!mediaId) return;

        setLoadingMediaInfo(true);
        try {

            // Wywołanie endpointa /{mediaId}/info
            const response = await apiClientNew.get<MediaResponse>(
                `/media/${mediaId}/info`,
                undefined,
                { timeout: 10000 }
            );
            setMediaInfo(response);

            // Ustaw tagi na podstawie odpowiedzi z API
            setTags(response.tags || []);

        } catch (error) {
            console.error('❌ Error loading media info:', error);

            // Fallback - używaj tagów z image props jeśli API nie działa
            console.warn('⚠️ Using fallback tags from image props');
            setTags(image?.tags || []);
            setMediaInfo(null);
        } finally {
            setLoadingMediaInfo(false);
        }
    }, [image]);

    // ZAKTUALIZOWANY useEffect - ładuje informacje z API gdy modal się otwiera
    useEffect(() => {
        if (isOpen && image) {
            loadMediaInfo(image.id);
        } else {
            // Reset stanu gdy modal się zamyka
            setTags([]);
            setMediaInfo(null);
            setCustomTagInput('');
        }
    }, [isOpen, image, loadMediaInfo]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const addTag = useCallback((tag: string) => {
        const trimmedTag = tag.trim();
        if (!trimmedTag) return;

        setTags(prev => {
            if (prev.includes(trimmedTag)) return prev;
            return [...prev, trimmedTag];
        });
    }, []);

    const removeTag = useCallback((tagToRemove: string) => {
        setTags(prev => prev.filter(tag => tag !== tagToRemove));
    }, []);

    const handleCustomTagAdd = useCallback(() => {
        const customTag = customTagInput.trim();
        if (customTag) {
            addTag(customTag);
            setCustomTagInput('');
        }
    }, [customTagInput, addTag]);

    const handleCustomTagKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCustomTagAdd();
        }
    }, [handleCustomTagAdd]);

    const handleSave = useCallback(async () => {
        if (!image) return;

        setLoading(true);
        try {

            // Update tags via media API
            await apiClientNew.put(`/media/${image.id}/tags`, {
                tags: tags
            });

            // Create updated image object z nowymi tagami
            const updatedImage: VehicleImage = {
                ...image,
                tags: tags,
                // Opcjonalnie możemy również zaktualizować inne pola z mediaInfo
                name: mediaInfo?.name || image.name,
                description: mediaInfo?.description || image.description
            };

            onSave(updatedImage);
            onClose();
        } catch (error) {
            console.error('❌ Error updating image tags:', error);
            alert('Nie udało się zaktualizować tagów. Spróbuj ponownie.');
        } finally {
            setLoading(false);
        }
    }, [image, tags, mediaInfo, onSave, onClose]);

    if (!isOpen || !image) return null;

    const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJyYWsgb2JyYXprYTwvdGV4dD48L3N2Zz4=';

    return (
        <ModalOverlay onClick={handleOverlayClick}>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <HeaderIcon>
                            <FaTag />
                        </HeaderIcon>
                        <HeaderText>
                            <HeaderTitle>Edytuj zdjęcie</HeaderTitle>
                            <HeaderSubtitle>
                                {mediaInfo?.name || image.name || image.filename}
                            </HeaderSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={onClose} disabled={loading || loadingMediaInfo}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <ImageSection>
                        <PreviewImage
                            src={imageUrl}
                            alt={mediaInfo?.name || image.name || image.filename}
                            onError={(e) => {
                                e.currentTarget.src = fallbackImage;
                            }}
                        />
                    </ImageSection>

                    <EditSection>
                        {/* NOWE - Informacje o ładowaniu */}
                        {loadingMediaInfo && (
                            <LoadingSection>
                                <LoadingSpinner />
                                <LoadingText>Ładowanie informacji o zdjęciu...</LoadingText>
                            </LoadingSection>
                        )}
                        <SectionTitle>
                            <SectionTitleIcon><FaTag /></SectionTitleIcon>
                            Tagi zdjęcia
                        </SectionTitle>

                        {!loadingMediaInfo ? (
                            <>
                                {/* Current Tags */}
                                <TagsContainer>
                                    {tags.map((tag, index) => (
                                        <EditableTag key={index}>
                                            <TagText>{tag}</TagText>
                                            <RemoveTagButton
                                                onClick={() => removeTag(tag)}
                                                disabled={loading}
                                                type="button"
                                            >
                                                <FaTimes />
                                            </RemoveTagButton>
                                        </EditableTag>
                                    ))}
                                    {tags.length === 0 && (
                                        <EmptyTagsMessage>Brak tagów</EmptyTagsMessage>
                                    )}
                                </TagsContainer>

                                {/* Custom tag input */}
                                <CustomTagInputContainer>
                                    <CustomTagInput
                                        type="text"
                                        placeholder="Dodaj własny tag..."
                                        value={customTagInput}
                                        onChange={(e) => setCustomTagInput(e.target.value)}
                                        onKeyPress={handleCustomTagKeyPress}
                                        disabled={loading}
                                        maxLength={30}
                                    />
                                    <AddCustomTagButton
                                        type="button"
                                        onClick={handleCustomTagAdd}
                                        disabled={loading || !customTagInput.trim()}
                                        title="Dodaj tag"
                                    >
                                        <FaPlus />
                                    </AddCustomTagButton>
                                </CustomTagInputContainer>

                                {/* Suggested Tags */}
                                <SuggestedTagsSection>
                                    <SuggestedTagsTitle>Sugerowane tagi:</SuggestedTagsTitle>
                                    <SuggestedTagsContainer>
                                        {suggestedTags
                                            .filter(tag => !tags.includes(tag))
                                            .slice(0, 8)
                                            .map(tag => (
                                                <SuggestedTag
                                                    key={tag}
                                                    onClick={() => addTag(tag)}
                                                    disabled={loading}
                                                    type="button"
                                                >
                                                    <FaPlus />
                                                    {tag}
                                                </SuggestedTag>
                                            ))}
                                    </SuggestedTagsContainer>
                                </SuggestedTagsSection>
                            </>
                        ) : (
                            <LoadingTagsContainer>
                                <FaSpinner className="spinner" />
                                <span>Ładowanie tagów...</span>
                            </LoadingTagsContainer>
                        )}
                    </EditSection>
                </ModalBody>

                <ModalFooter>
                    <SecondaryButton onClick={onClose} disabled={loading || loadingMediaInfo}>
                        <FaTimes />
                        Anuluj
                    </SecondaryButton>
                    <PrimaryButton onClick={handleSave} disabled={loading || loadingMediaInfo}>
                        {loading ? (
                            <>
                                <FaSpinner className="spinner" />
                                Zapisywanie...
                            </>
                        ) : (
                            <>
                                <FaSave />
                                Zapisz zmiany
                            </>
                        )}
                    </PrimaryButton>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// NOWE STYLED COMPONENTS dla informacji o mediach
const LoadingSection = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md};
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.md};
    margin-bottom: ${theme.spacing.lg};
`;

const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid ${theme.borderLight};
    border-top: 2px solid ${theme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const MediaInfoSection = styled.div`
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.md};
    padding: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.lg};
    border: 1px solid ${theme.border};
`;

const MediaInfoTitle = styled.h4`
    margin: 0 0 ${theme.spacing.sm} 0;
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const MediaInfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: ${theme.spacing.sm};
`;

const MediaInfoItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const MediaInfoLabel = styled.div`
    font-size: 11px;
    font-weight: 500;
    color: ${theme.text.tertiary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const MediaInfoValue = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const LoadingTagsContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.xl};
    color: ${theme.text.secondary};
    font-style: italic;
    
    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid ${theme.borderLight};
        border-top: 2px solid ${theme.primary};
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
`;

// POZOSTAŁE STYLED COMPONENTS (bez zmian - kopiuję istniejące)
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    background: white;
    border-radius: ${theme.radius.xl};
    box-shadow: ${theme.shadow.xl};
    width: 800px;
    max-width: 90vw;
    max-height: 90vh;
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
    border-bottom: 2px solid ${theme.border};
    background: ${theme.surfaceAlt};
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
`;

const HeaderIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${theme.primaryGhost};
    color: ${theme.primary};
    border-radius: ${theme.radius.lg};
    font-size: 18px;
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const HeaderTitle = styled.h3`
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: ${theme.text.primary};
`;

const HeaderSubtitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 400px;
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

    &:hover:not(:disabled) {
        background: ${theme.status.errorLight};
        border-color: ${theme.status.error};
        color: ${theme.status.error};
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ModalBody = styled.div`
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: ${theme.spacing.xl};
    padding: ${theme.spacing.xl};
    flex: 1;
    overflow: hidden;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.lg};
    }
`;

const ImageSection = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.md};
    min-height: 200px;
`;

const PreviewImage = styled.img`
    max-width: 100%;
    max-height: 250px;
    object-fit: contain;
    border-radius: ${theme.radius.md};
    box-shadow: ${theme.shadow.sm};
`;

const EditSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
    overflow-y: auto;
`;

const SectionTitle = styled.h4`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    border-bottom: 1px solid ${theme.border};
    padding-bottom: ${theme.spacing.sm};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
`;

const SectionTitleIcon = styled.div`
    color: ${theme.primary};
    font-size: 14px;
`;

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.sm};
    min-height: 40px;
    padding: ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    background: ${theme.surfaceAlt};
`;

const EditableTag = styled.div`
    display: flex;
    align-items: center;
    background: ${theme.primary};
    color: white;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border-radius: ${theme.radius.xl};
    font-size: 12px;
    font-weight: 500;
    gap: ${theme.spacing.xs};
    max-width: 150px;
`;

const TagText = styled.span`
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const RemoveTagButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    border-radius: 50%;
    transition: all ${theme.transitions.fast};
    font-size: 10px;

    &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const EmptyTagsMessage = styled.div`
    color: ${theme.text.muted};
    font-style: italic;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
`;

const CustomTagInputContainer = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};
    align-items: center;
`;

const CustomTagInput = styled.input`
    flex: 1;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    color: ${theme.text.primary};
    background: white;
    transition: all ${theme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primaryGhost};
    }

    &::placeholder {
        color: ${theme.text.muted};
        font-style: italic;
    }

    &:disabled {
        background: ${theme.surfaceAlt};
        color: ${theme.text.disabled};
    }
`;

const AddCustomTagButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${theme.primary};
    color: white;
    border: none;
    border-radius: ${theme.radius.md};
    cursor: pointer;
    transition: all ${theme.transitions.fast};
    font-size: 12px;

    &:hover:not(:disabled) {
        background: ${theme.primaryDark};
        transform: scale(1.05);
    }

    &:disabled {
        background: ${theme.text.disabled};
        cursor: not-allowed;
        transform: none;
    }
`;

const SuggestedTagsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
`;

const SuggestedTagsTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.secondary};
`;

const SuggestedTagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.xs};
`;

const SuggestedTag = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${theme.surfaceAlt};
    color: ${theme.text.secondary};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all ${theme.transitions.fast};

    &:hover:not(:disabled) {
        background: ${theme.primaryGhost};
        border-color: ${theme.primary};
        color: ${theme.primary};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    svg {
        font-size: 8px;
    }
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    border-top: 2px solid ${theme.border};
    background: ${theme.surfaceAlt};
`;

const ButtonBase = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${theme.transitions.spring};
    min-height: 44px;

    .spinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const SecondaryButton = styled(ButtonBase)`
    background: white;
    color: ${theme.text.secondary};
    border: 2px solid ${theme.border};
    min-width: 120px;

    &:hover:not(:disabled) {
        background: ${theme.surfaceHover};
        color: ${theme.text.primary};
        border-color: ${theme.borderHover};
        box-shadow: ${theme.shadow.sm};
    }
`;

const PrimaryButton = styled(ButtonBase)`
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
    color: white;
    border: 2px solid transparent;
    box-shadow: ${theme.shadow.sm};
    min-width: 150px;

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 100%);
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        background: ${theme.text.disabled};
    }
`;

export default ImageEditModal;