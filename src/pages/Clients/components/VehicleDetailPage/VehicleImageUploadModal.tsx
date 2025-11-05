// src/pages/Clients/components/VehicleDetailPage/VehicleImageUploadModal.tsx
import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import {
    FaImage,
    FaPlus,
    FaSpinner,
    FaTags,
    FaTimes,
    FaUpload,
    FaCheckCircle,
    FaExclamationTriangle,
    FaTrash,
    FaClock,
    FaKeyboard
} from 'react-icons/fa';
import { apiClientNew } from '../../../../shared/api/apiClientNew';
import vehicleImageApi from "../../../../api/vehicleImageApi";

// Professional Brand Theme (same as ImageEditModal for consistency)
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

interface VehicleImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    vehicleId: string;
    vehicleInfo: {
        make: string;
        model: string;
        licensePlate: string;
    };
}

interface UploadedImage {
    file: File;
    name: string;
    tags: string[];
    previewUrl: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    uploadProgress?: number;
    errorMessage?: string;
}

const VehicleImageUploadModal: React.FC<VehicleImageUploadModalProps> = ({
                                                                             isOpen,
                                                                             onClose,
                                                                             onSuccess,
                                                                             vehicleId,
                                                                             vehicleInfo
                                                                         }) => {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [customTagInputs, setCustomTagInputs] = useState<Record<number, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sugerowane tagi dla branży motoryzacyjnej
    const suggestedTags = [
        'Przed pracami', 'Po pracach', 'Uszkodzenia', 'Rysy', 'Lakier',
        'Wnętrze', 'Zewnątrz', 'Silnik', 'Felgi', 'Opony', 'Detale',
        'Problem', 'Naprawa', 'Czyszczenie', 'Polerowanie'
    ];

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        handleFiles(files);
    }, []);

    const handleFiles = useCallback((files: File[]) => {
        const validFiles = files.filter(file => {
            const isValidType = file.type.startsWith('image/');
            const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
            return isValidType && isValidSize;
        });

        const newImages: UploadedImage[] = validFiles.map(file => ({
            file,
            name: file.name.split('.').slice(0, -1).join('.'), // Remove extension
            tags: [],
            previewUrl: URL.createObjectURL(file),
            status: 'pending'
        }));

        setImages(prev => [...prev, ...newImages]);
    }, []);

    const updateImage = useCallback((index: number, updates: Partial<UploadedImage>) => {
        setImages(prev => prev.map((img, i) => i === index ? { ...img, ...updates } : img));
    }, []);

    const removeImage = useCallback((index: number) => {
        setImages(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].previewUrl);
            updated.splice(index, 1);
            return updated;
        });
        // Usuń również input dla custom taga
        setCustomTagInputs(prev => {
            const updated = { ...prev };
            delete updated[index];
            return updated;
        });
    }, []);

    const addTag = useCallback((imageIndex: number, tag: string) => {
        const trimmedTag = tag.trim();
        if (!trimmedTag) return;

        updateImage(imageIndex, {
            tags: [...(images[imageIndex]?.tags || []), trimmedTag].filter((t, i, arr) =>
                arr.indexOf(t) === i // Remove duplicates
            )
        });
    }, [images, updateImage]);

    const removeTag = useCallback((imageIndex: number, tagToRemove: string) => {
        updateImage(imageIndex, {
            tags: images[imageIndex]?.tags.filter(tag => tag !== tagToRemove) || []
        });
    }, [images, updateImage]);

    const handleCustomTagInputChange = useCallback((imageIndex: number, value: string) => {
        setCustomTagInputs(prev => ({
            ...prev,
            [imageIndex]: value
        }));
    }, []);

    const handleCustomTagAdd = useCallback((imageIndex: number) => {
        const customTag = customTagInputs[imageIndex]?.trim();
        if (customTag) {
            addTag(imageIndex, customTag);
            setCustomTagInputs(prev => ({
                ...prev,
                [imageIndex]: ''
            }));
        }
    }, [customTagInputs, addTag]);

    const handleCustomTagKeyPress = useCallback((e: React.KeyboardEvent, imageIndex: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCustomTagAdd(imageIndex);
        }
    }, [handleCustomTagAdd]);

    const uploadSingleImage = useCallback(async (image: UploadedImage, index: number): Promise<boolean> => {
        updateImage(index, { status: 'uploading', uploadProgress: 0 });

        try {
            // Użyj dedykowanej, poprawnej funkcji z vehicleImageApi
            await vehicleImageApi.uploadVehicleImage({
                vehicleId: vehicleId,
                file: image.file,
                name: image.name,
                tags: image.tags,
                // Przekazujemy callback do śledzenia postępu
                onProgress: (progress) => {
                    updateImage(index, { uploadProgress: progress });
                }
            });

            updateImage(index, {
                status: 'success',
                uploadProgress: 100
            });
            return true;

        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Błąd podczas przesyłania';
            updateImage(index, {
                status: 'error',
                errorMessage,
                uploadProgress: 0
            });
            return false;
        }
    }, [vehicleId, updateImage]);

    const handleUpload = useCallback(async () => {
        if (images.length === 0) return;

        setIsUploading(true);

        try {
            const uploadPromises = images.map((image, index) =>
                uploadSingleImage(image, index)
            );

            const results = await Promise.all(uploadPromises);
            const successCount = results.filter(Boolean).length;

            if (successCount > 0) {
                onSuccess();

                // Pokaż status "success" przez chwilę przed zamknięciem
                setTimeout(() => {
                    if (successCount === images.length) {
                        onClose();
                    }
                }, 1500);
            }
        } catch (error) {
            console.error('Upload process error:', error);
        } finally {
            setIsUploading(false);
        }
    }, [images, uploadSingleImage, onSuccess, onClose]);

    const handleClose = useCallback(() => {
        // Zwolnienie pamięci po URL-ach podglądu
        images.forEach(img => {
            URL.revokeObjectURL(img.previewUrl);
        });
        setImages([]);
        setCustomTagInputs({});
        onClose();
    }, [images, onClose]);

    if (!isOpen) return null;

    const pendingImages = images.filter(img => img.status === 'pending');
    const canUpload = pendingImages.length > 0 && !isUploading;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <HeaderIcon>
                            <FaUpload />
                        </HeaderIcon>
                        <HeaderText>
                            <ModalTitle>Dodaj zdjęcia pojazdu</ModalTitle>
                            <ModalSubtitle>
                                {vehicleInfo.make} {vehicleInfo.model} - {vehicleInfo.licensePlate}
                            </ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={handleClose} disabled={isUploading}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    {images.length === 0 ? (
                        <DropZone
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            $dragActive={dragActive}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <DropZoneIcon>
                                <FaUpload />
                            </DropZoneIcon>
                            <DropZoneTitle>
                                Przeciągnij i upuść zdjęcia lub kliknij aby wybrać
                            </DropZoneTitle>
                            <DropZoneSubtext>
                                Obsługiwane formaty: JPG, PNG, GIF (max. 10MB na plik)
                            </DropZoneSubtext>
                            <SelectFilesButton type="button">
                                <FaPlus />
                                Wybierz pliki
                            </SelectFilesButton>
                        </DropZone>
                    ) : (
                        <>
                            <UploadSummary>
                                <SummaryText>
                                    Wybrano {images.length} {images.length === 1 ? 'zdjęcie' : 'zdjęć'}
                                </SummaryText>
                                <AddMoreButton
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    <FaPlus />
                                    Dodaj więcej
                                </AddMoreButton>
                            </UploadSummary>

                            <ImagesList>
                                {images.map((image, index) => (
                                    <ImageCard key={index} $status={image.status}>
                                        <ImagePreviewSection>
                                            <ImagePreview src={image.previewUrl} alt={image.name} />
                                            <ImageStatus $status={image.status}>
                                                {image.status === 'pending' && <FaClock />}
                                                {image.status === 'uploading' && <FaSpinner className="spinner" />}
                                                {image.status === 'success' && <FaCheckCircle />}
                                                {image.status === 'error' && <FaExclamationTriangle />}
                                            </ImageStatus>
                                            {!isUploading && image.status !== 'success' && (
                                                <RemoveImageButton
                                                    onClick={() => removeImage(index)}
                                                    type="button"
                                                >
                                                    <FaTrash />
                                                </RemoveImageButton>
                                            )}
                                        </ImagePreviewSection>

                                        <ImageDetailsSection>
                                            <ImageNameInput
                                                type="text"
                                                value={image.name}
                                                onChange={(e) => updateImage(index, { name: e.target.value })}
                                                placeholder="Nazwa zdjęcia"
                                                disabled={isUploading}
                                                maxLength={100}
                                            />

                                            {image.status === 'uploading' && (
                                                <ProgressContainer>
                                                    <ProgressBar>
                                                        <ProgressFill $progress={image.uploadProgress || 0} />
                                                    </ProgressBar>
                                                    <ProgressText>{Math.round(image.uploadProgress || 0)}%</ProgressText>
                                                </ProgressContainer>
                                            )}

                                            {image.status === 'error' && (
                                                <ErrorMessage>
                                                    <FaExclamationTriangle />
                                                    {image.errorMessage}
                                                </ErrorMessage>
                                            )}

                                            {image.status === 'success' && (
                                                <SuccessMessage>
                                                    <FaCheckCircle />
                                                    Przesłano pomyślnie
                                                </SuccessMessage>
                                            )}

                                            <TagsSection>
                                                <TagsLabel>Tagi:</TagsLabel>
                                                <TagsContainer>
                                                    {image.tags.map(tag => (
                                                        <Tag key={tag}>
                                                            <TagText>{tag}</TagText>
                                                            <RemoveTagButton
                                                                onClick={() => removeTag(index, tag)}
                                                                disabled={isUploading}
                                                                type="button"
                                                            >
                                                                <FaTimes />
                                                            </RemoveTagButton>
                                                        </Tag>
                                                    ))}
                                                </TagsContainer>

                                                {/* Custom tag input */}
                                                <CustomTagInputContainer>
                                                    <CustomTagInput
                                                        type="text"
                                                        placeholder="Dodaj własny tag..."
                                                        value={customTagInputs[index] || ''}
                                                        onChange={(e) => handleCustomTagInputChange(index, e.target.value)}
                                                        onKeyPress={(e) => handleCustomTagKeyPress(e, index)}
                                                        disabled={isUploading}
                                                        maxLength={30}
                                                    />
                                                    <AddCustomTagButton
                                                        type="button"
                                                        onClick={() => handleCustomTagAdd(index)}
                                                        disabled={isUploading || !customTagInputs[index]?.trim()}
                                                        title="Dodaj tag"
                                                    >
                                                        <FaPlus />
                                                    </AddCustomTagButton>
                                                </CustomTagInputContainer>

                                                <SuggestedTagsContainer>
                                                    {suggestedTags
                                                        .filter(tag => !image.tags.includes(tag))
                                                        .slice(0, 6)
                                                        .map(tag => (
                                                            <SuggestedTag
                                                                key={tag}
                                                                onClick={() => addTag(index, tag)}
                                                                disabled={isUploading}
                                                                type="button"
                                                            >
                                                                <FaPlus />
                                                                {tag}
                                                            </SuggestedTag>
                                                        ))}
                                                </SuggestedTagsContainer>
                                            </TagsSection>
                                        </ImageDetailsSection>
                                    </ImageCard>
                                ))}
                            </ImagesList>
                        </>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                    />
                </ModalBody>

                <ModalFooter>
                    <SecondaryButton onClick={handleClose} disabled={isUploading}>
                        <FaTimes />
                        Anuluj
                    </SecondaryButton>

                    {images.length > 0 && (
                        <PrimaryButton
                            onClick={handleUpload}
                            disabled={!canUpload}
                        >
                            {isUploading ? (
                                <>
                                    <FaSpinner className="spinner" />
                                    Przesyłanie...
                                </>
                            ) : (
                                <>
                                    <FaUpload />
                                    Prześlij zdjęcia ({pendingImages.length})
                                </>
                            )}
                        </PrimaryButton>
                    )}
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// =============================================================================
// Styled Components
// =============================================================================

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
    width: 800px;
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

    &:hover:not(:disabled) {
        background: ${brandTheme.status.errorLight};
        border-color: ${brandTheme.status.error};
        color: ${brandTheme.status.error};
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ModalBody = styled.div`
    padding: ${brandTheme.spacing.xl};
    overflow-y: auto;
    flex: 1;

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

const DropZone = styled.div<{ $dragActive: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.lg};
    padding: ${brandTheme.spacing.xxl};
    border: 2px dashed ${props => props.$dragActive ? brandTheme.primary : brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    background: ${props => props.$dragActive ? brandTheme.primaryGhost : brandTheme.surfaceAlt};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};
    min-height: 300px;

    &:hover {
        border-color: ${brandTheme.primary};
        background: ${brandTheme.primaryGhost};
    }
`;

const DropZoneIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: ${brandTheme.primary};
    color: white;
    border-radius: ${brandTheme.radius.xl};
    font-size: 24px;
    box-shadow: ${brandTheme.shadow.md};
`;

const DropZoneTitle = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    text-align: center;
`;

const DropZoneSubtext = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    text-align: center;
`;

const SelectFilesButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.xl};
    background: ${brandTheme.primary};
    color: white;
    border: none;
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};
    box-shadow: ${brandTheme.shadow.sm};

    &:hover {
        background: ${brandTheme.primaryDark};
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const UploadSummary = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
    margin-bottom: ${brandTheme.spacing.lg};
    border: 1px solid ${brandTheme.border};
`;

const SummaryText = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const AddMoreButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: ${brandTheme.surface};
    color: ${brandTheme.primary};
    border: 1px solid ${brandTheme.primary};
    border-radius: ${brandTheme.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};

    &:hover:not(:disabled) {
        background: ${brandTheme.primaryGhost};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ImagesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
    padding-right: ${brandTheme.spacing.sm}; /* Space for scrollbar */
`;

const statusColors = {
    pending: brandTheme.borderHover,
    uploading: brandTheme.status.info,
    success: brandTheme.status.success,
    error: brandTheme.status.error
};

const ImageCard = styled.div<{ $status: UploadedImage['status'] }>`
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: ${brandTheme.spacing.lg};
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surface};
    border: 2px solid ${props => statusColors[props.$status] || brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    transition: all ${brandTheme.transitions.normal};
    box-shadow: ${brandTheme.shadow.xs};

    &:focus-within {
        border-color: ${brandTheme.primary};
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const ImagePreviewSection = styled.div`
    position: relative;
    width: 140px;
    height: 140px;
`;

const ImagePreview = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: ${brandTheme.radius.md};
    background-color: ${brandTheme.surfaceAlt};
`;

const ImageStatus = styled.div<{ $status: UploadedImage['status'] }>`
    position: absolute;
    top: ${brandTheme.spacing.sm};
    left: ${brandTheme.spacing.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: ${props => statusColors[props.$status] || brandTheme.text.muted};
    color: white;
    border-radius: 50%;
    font-size: 14px;
    box-shadow: ${brandTheme.shadow.sm};

    .spinner {
        animation: spin 1s linear infinite;
    }
`;

const RemoveImageButton = styled.button`
    position: absolute;
    top: ${brandTheme.spacing.sm};
    right: ${brandTheme.spacing.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all ${brandTheme.transitions.fast};
    opacity: 0;

    ${ImagePreviewSection}:hover & {
        opacity: 1;
    }

    &:hover {
        background: ${brandTheme.status.error};
        transform: scale(1.1);
    }
`;

const ImageDetailsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
    justify-content: space-between;
`;

const ImageNameInput = styled.input`
    width: 100%;
    padding: ${brandTheme.spacing.md};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    color: ${brandTheme.text.primary};
    background: ${brandTheme.surfaceAlt};
    transition: all ${brandTheme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        background: ${brandTheme.surface};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
    }
`;

const ProgressContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const ProgressBar = styled.div`
    flex: 1;
    height: 8px;
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.sm};
    overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number }>`
    height: 100%;
    width: ${props => props.$progress}%;
    background: linear-gradient(135deg, ${brandTheme.status.info} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.sm};
    transition: width 0.3s ease;
`;

const ProgressText = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${brandTheme.text.secondary};
    min-width: 35px;
    text-align: right;
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 500;
`;

const SuccessMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm};
    background: ${brandTheme.status.successLight};
    color: ${brandTheme.status.success};
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 500;
`;

const TagsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const TagsLabel = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${brandTheme.text.secondary};
`;

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${brandTheme.spacing.xs};
    min-height: 24px;
`;

const Tag = styled.div`
    display: flex;
    align-items: center;
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.xl};
    font-size: 11px;
    border: 1px solid ${brandTheme.primary}30;
    gap: ${brandTheme.spacing.xs};
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
    width: 14px;
    height: 14px;
    background: none;
    border: none;
    color: ${brandTheme.primary};
    cursor: pointer;
    border-radius: 50%;
    transition: all ${brandTheme.transitions.fast};
    font-size: 8px;

    &:hover:not(:disabled) {
        background: ${brandTheme.status.error};
        color: white;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const CustomTagInputContainer = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};
    align-items: center;
    margin-bottom: ${brandTheme.spacing.sm};
`;

const CustomTagInput = styled.input`
    flex: 1;
    padding: ${brandTheme.spacing.sm};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    font-size: 12px;
    color: ${brandTheme.text.primary};
    background: ${brandTheme.surface};
    transition: all ${brandTheme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 2px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-style: italic;
    }

    &:disabled {
        background: ${brandTheme.surfaceAlt};
        color: ${brandTheme.text.disabled};
    }
`;

const AddCustomTagButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: ${brandTheme.primary};
    color: white;
    border: none;
    border-radius: ${brandTheme.radius.sm};
    cursor: pointer;
    transition: all ${brandTheme.transitions.fast};
    font-size: 10px;

    &:hover:not(:disabled) {
        background: ${brandTheme.primaryDark};
        transform: scale(1.05);
    }

    &:disabled {
        background: ${brandTheme.text.disabled};
        cursor: not-allowed;
        transform: none;
    }
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
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all ${brandTheme.transitions.fast};

    &:hover:not(:disabled) {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
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
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-top: 2px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

const ButtonBase = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: ${brandTheme.spacing.sm};
	padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
	border-radius: ${brandTheme.radius.md};
	font-weight: 600;
	font-size: 14px;
	cursor: pointer;
	transition: all ${brandTheme.transitions.spring};
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
	background: ${brandTheme.surface};
	color: ${brandTheme.text.secondary};
	border: 2px solid ${brandTheme.border};
	min-width: 120px;

	&:hover:not(:disabled) {
		background: ${brandTheme.surfaceHover};
		color: ${brandTheme.text.primary};
		border-color: ${brandTheme.borderHover};
		box-shadow: ${brandTheme.shadow.sm};
	}
`;

const PrimaryButton = styled(ButtonBase)`
	background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
	color: white;
	border: 2px solid transparent;
	box-shadow: ${brandTheme.shadow.sm};
	min-width: 160px;

	&:hover:not(:disabled) {
		background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
		transform: translateY(-1px);
		box-shadow: ${brandTheme.shadow.md};
	}

	&:active:not(:disabled) {
		transform: translateY(0);
	}

	&:disabled {
		background: ${brandTheme.text.disabled};
	}
`;

export default VehicleImageUploadModal;