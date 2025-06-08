import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaPlus, FaTags, FaImage, FaSpinner } from 'react-icons/fa';
import { carReceptionApi } from '../../../../api/carReceptionApi';

// Professional Brand Theme
const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2',
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    },
    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }
};

interface ImageEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, tags: string[]) => void;
    initialName: string;
    initialTags: string[];
    imageUrl: string;
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({
                                                           isOpen,
                                                           onClose,
                                                           onSave,
                                                           initialName,
                                                           initialTags,
                                                           imageUrl
                                                       }) => {
    const [name, setName] = useState(initialName);
    const [tags, setTags] = useState<string[]>(initialTags || []);
    const [newTag, setNewTag] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUrlWithAuth, setImageUrlWithAuth] = useState<string>('');
    const [temporaryBlobUrl, setTemporaryBlobUrl] = useState<string | null>(null);

    // Sugerowane tagi dla branży motoryzacyjnej
    const suggestedTags = [
        'Przed pracami', 'Po pracach', 'Uszkodzenia', 'Rysy', 'Lakier',
        'Wnętrze', 'Zewnątrz', 'Silnik', 'Felgi', 'Opony', 'Detale',
        'Problem', 'Naprawa', 'Czyszczenie', 'Polerowanie'
    ];

    // Ustaw początkowe wartości przy otwarciu
    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setTags(initialTags || []);
            setNewTag('');
        }
    }, [isOpen, initialName, initialTags]);

    // Pobierz URL obrazu z autoryzacją
    useEffect(() => {
        if (!isOpen || !imageUrl) return;

        if (imageUrl.startsWith('blob:') ||
            imageUrl.startsWith('data:') ||
            imageUrl.includes('temp_') ||
            imageUrl.includes('img_')) {
            setImageUrlWithAuth(imageUrl);
            return;
        }

        const fetchImage = async () => {
            setLoading(true);
            try {
                const urlParts = imageUrl.split('/');
                const imageId = urlParts[urlParts.length - 1].split('?')[0];

                if (imageId) {
                    const authUrl = await carReceptionApi.fetchVehicleImageAsUrl(imageId);
                    setImageUrlWithAuth(authUrl);
                    setTemporaryBlobUrl(authUrl);
                } else {
                    console.warn('Nie można wyodrębnić ID obrazu z URL:', imageUrl);
                    setImageUrlWithAuth(imageUrl);
                }
            } catch (error) {
                console.error('Błąd podczas pobierania obrazu:', error);
                setImageUrlWithAuth('');
            } finally {
                setLoading(false);
            }
        };

        fetchImage();
    }, [isOpen, imageUrl]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (temporaryBlobUrl && temporaryBlobUrl.startsWith('blob:')) {
                URL.revokeObjectURL(temporaryBlobUrl);
            }
        };
    }, [temporaryBlobUrl]);

    useEffect(() => {
        if (!isOpen) {
            setImageUrlWithAuth('');
            if (temporaryBlobUrl && temporaryBlobUrl.startsWith('blob:')) {
                URL.revokeObjectURL(temporaryBlobUrl);
                setTemporaryBlobUrl(null);
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddTag = () => {
        const trimmedTag = newTag.trim();
        if (trimmedTag !== '' && !tags.includes(trimmedTag)) {
            setTags([...tags, trimmedTag]);
            setNewTag('');
        }
    };

    const handleAddSuggestedTag = (tag: string) => {
        if (!tags.includes(tag)) {
            setTags([...tags, tag]);
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSave = () => {
        onSave(name.trim(), tags);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const availableSuggestedTags = suggestedTags.filter(tag => !tags.includes(tag));

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <HeaderIcon>
                            <FaImage />
                        </HeaderIcon>
                        <HeaderText>
                            <ModalTitle>Edytuj informacje o zdjęciu</ModalTitle>
                            <ModalSubtitle>Nadaj nazwę i dodaj tagi dla lepszej organizacji</ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <ImageSection>
                        <ImagePreviewArea>
                            {loading ? (
                                <LoadingIndicator>
                                    <FaSpinner className="spinner" />
                                    <span>Ładowanie obrazu...</span>
                                </LoadingIndicator>
                            ) : imageUrlWithAuth ? (
                                <ImagePreview src={imageUrlWithAuth} alt={name || 'Podgląd zdjęcia'} />
                            ) : (
                                <ImagePlaceholder>
                                    <FaImage />
                                    <span>Nie można załadować obrazu</span>
                                </ImagePlaceholder>
                            )}
                        </ImagePreviewArea>
                    </ImageSection>

                    <FormSection>
                        <FormGroup>
                            <Label htmlFor="imageName">
                                <FaImage />
                                Nazwa zdjęcia
                            </Label>
                            <Input
                                id="imageName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Wprowadź opisową nazwę zdjęcia"
                                maxLength={100}
                            />
                            <CharCounter>{name.length}/100</CharCounter>
                        </FormGroup>

                        <FormGroup>
                            <Label>
                                <FaTags />
                                Tagi
                            </Label>
                            <TagInputContainer>
                                <TagInput
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Dodaj tag i naciśnij Enter"
                                    maxLength={30}
                                />
                                <AddTagButton type="button" onClick={handleAddTag} disabled={!newTag.trim()}>
                                    <FaPlus />
                                </AddTagButton>
                            </TagInputContainer>

                            {availableSuggestedTags.length > 0 && (
                                <SuggestedTagsSection>
                                    <SuggestedTagsTitle>Sugerowane tagi:</SuggestedTagsTitle>
                                    <SuggestedTagsContainer>
                                        {availableSuggestedTags.slice(0, 8).map((tag) => (
                                            <SuggestedTag
                                                key={tag}
                                                onClick={() => handleAddSuggestedTag(tag)}
                                            >
                                                <FaPlus />
                                                {tag}
                                            </SuggestedTag>
                                        ))}
                                    </SuggestedTagsContainer>
                                </SuggestedTagsSection>
                            )}

                            <TagsContainer>
                                {tags.length > 0 ? (
                                    tags.map((tag, index) => (
                                        <Tag key={index}>
                                            <TagText>{tag}</TagText>
                                            <RemoveTagButton onClick={() => handleRemoveTag(tag)}>
                                                <FaTimes />
                                            </RemoveTagButton>
                                        </Tag>
                                    ))
                                ) : (
                                    <NoTagsMessage>
                                        <FaTags />
                                        Brak tagów - dodaj tagi aby łatwiej organizować zdjęcia
                                    </NoTagsMessage>
                                )}
                            </TagsContainer>
                        </FormGroup>
                    </FormSection>

                    <InfoSection>
                        <InfoIcon>💡</InfoIcon>
                        <InfoText>
                            Tagi pomogą Ci szybko znajdować zdjęcia w przyszłości. Używaj opisowych nazw jak "uszkodzenie", "efekt końcowy" czy "szczegóły".
                        </InfoText>
                    </InfoSection>
                </ModalBody>

                <ModalFooter>
                    <SecondaryButton onClick={onClose}>
                        <FaTimes />
                        Anuluj
                    </SecondaryButton>
                    <PrimaryButton onClick={handleSave}>
                        <FaTags />
                        Zapisz zmiany
                    </PrimaryButton>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components - Professional Automotive CRM Design
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
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    box-shadow: ${brandTheme.shadow.xl};
    width: 600px;
    max-width: 95%;
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
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 2px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const HeaderIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    border-radius: ${brandTheme.radius.lg};
    font-size: 18px;
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.025em;
`;

const ModalSubtitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${brandTheme.surfaceHover};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    color: ${brandTheme.text.muted};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};

    &:hover {
        background: ${brandTheme.status.errorLight};
        border-color: ${brandTheme.status.error};
        color: ${brandTheme.status.error};
        transform: translateY(-1px);
    }
`;

const ModalBody = styled.div`
    padding: ${brandTheme.spacing.xl};
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xl};

    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: ${brandTheme.surfaceAlt};
    }

    &::-webkit-scrollbar-thumb {
        background: ${brandTheme.border};
        border-radius: 3px;
    }
`;

const ImageSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const ImagePreviewArea = styled.div`
    height: 200px;
    border-radius: ${brandTheme.radius.lg};
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${brandTheme.surfaceAlt};
    border: 2px solid ${brandTheme.border};
`;

const ImagePreview = styled.img`
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: ${brandTheme.radius.md};
`;

const LoadingIndicator = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.md};
    color: ${brandTheme.primary};

    .spinner {
        font-size: 24px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    span {
        font-size: 14px;
        font-weight: 500;
    }
`;

const ImagePlaceholder = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.md};
    color: ${brandTheme.text.muted};

    svg {
        font-size: 32px;
    }

    span {
        font-size: 14px;
        font-weight: 500;
    }
`;

const FormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};

    svg {
        color: ${brandTheme.primary};
        font-size: 14px;
    }
`;

const Input = styled.input`
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all ${brandTheme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const CharCounter = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    text-align: right;
    font-variant-numeric: tabular-nums;
`;

const TagInputContainer = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
`;

const TagInput = styled(Input)`
    flex: 1;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: none;
`;

const AddTagButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: ${brandTheme.primary};
    color: white;
    border: none;
    border-top-right-radius: ${brandTheme.radius.md};
    border-bottom-right-radius: ${brandTheme.radius.md};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};

    &:hover:not(:disabled) {
        background: ${brandTheme.primaryDark};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: ${brandTheme.text.disabled};
    }
`;

const SuggestedTagsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const SuggestedTagsTitle = styled.div`
    font-size: 13px;
    font-weight: 600;
    color: ${brandTheme.text.secondary};
`;

const SuggestedTagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${brandTheme.spacing.xs};
`;

const SuggestedTag = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    background: ${brandTheme.surfaceAlt};
    color: ${brandTheme.text.secondary};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all ${brandTheme.transitions.fast};

    &:hover {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
    }

    svg {
        font-size: 10px;
    }
`;

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${brandTheme.spacing.xs};
    min-height: 40px;
    padding: ${brandTheme.spacing.sm};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    background: ${brandTheme.surfaceAlt};
`;

const Tag = styled.div`
    display: flex;
    align-items: center;
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
border-radius: ${brandTheme.radius.xl};
   font-size: 12px;
   border: 1px solid ${brandTheme.primary}30;
   gap: ${brandTheme.spacing.xs};
   max-width: 200px;
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
   color: ${brandTheme.primary};
   cursor: pointer;
   border-radius: 50%;
   transition: all ${brandTheme.transitions.fast};
   font-size: 10px;

   &:hover {
       background: ${brandTheme.status.error};
       color: white;
   }
`;

const NoTagsMessage = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   gap: ${brandTheme.spacing.sm};
   color: ${brandTheme.text.muted};
   font-size: 13px;
   font-style: italic;
   padding: ${brandTheme.spacing.lg};

   svg {
       font-size: 16px;
       opacity: 0.6;
   }
`;

const InfoSection = styled.div`
   background: ${brandTheme.status.infoLight};
   border: 1px solid ${brandTheme.status.info};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
`;

const InfoIcon = styled.div`
   font-size: 16px;
   flex-shrink: 0;
`;

const InfoText = styled.div`
   font-size: 13px;
   color: ${brandTheme.status.info};
   font-weight: 500;
   line-height: 1.4;
`;

const ModalFooter = styled.div`
   display: flex;
   justify-content: flex-end;
   gap: ${brandTheme.spacing.md};
   padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
   border-top: 2px solid ${brandTheme.border};
   background: ${brandTheme.surfaceAlt};
`;

const SecondaryButton = styled.button`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   background: ${brandTheme.surface};
   color: ${brandTheme.text.secondary};
   border: 2px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.md};
   font-weight: 600;
   font-size: 14px;
   cursor: pointer;
   transition: all ${brandTheme.transitions.spring};
   min-height: 44px;
   min-width: 120px;

   &:hover {
       background: ${brandTheme.surfaceHover};
       color: ${brandTheme.text.primary};
       border-color: ${brandTheme.borderHover};
       box-shadow: ${brandTheme.shadow.sm};
   }
`;

const PrimaryButton = styled.button`
   display: flex;
   align-items: center;
   justify-content: center;
   gap: ${brandTheme.spacing.sm};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
   color: white;
   border: 2px solid transparent;
   border-radius: ${brandTheme.radius.md};
   font-weight: 600;
   font-size: 14px;
   cursor: pointer;
   transition: all ${brandTheme.transitions.spring};
   box-shadow: ${brandTheme.shadow.sm};
   min-height: 44px;
   min-width: 140px;

   &:hover:not(:disabled) {
       background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
       transform: translateY(-1px);
       box-shadow: ${brandTheme.shadow.md};
   }

   &:disabled {
       opacity: 0.6;
       cursor: not-allowed;
       transform: none;
       background: ${brandTheme.text.disabled};
   }

   &:active:not(:disabled) {
       transform: translateY(0);
   }
`;

export default ImageEditModal;