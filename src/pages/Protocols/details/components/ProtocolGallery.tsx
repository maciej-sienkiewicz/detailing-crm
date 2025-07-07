import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
    FaCamera,
    FaUpload,
    FaTrash,
    FaImage,
    FaExclamationCircle,
    FaEye,
    FaEdit,
    FaTags,
    FaPlus,
    FaTimes,
    FaFileImage,
    FaFileAlt,
    FaFilePdf,
    FaFileWord,
    FaFileExcel,
    FaFile,
    FaDownload,
    FaClock,
    FaUser,
    FaFolder
} from 'react-icons/fa';
import { CarReceptionProtocol, VehicleImage } from '../../../../types';
import { apiClient } from '../../../../api/apiClient';
import { carReceptionApi } from '../../../../api/carReceptionApi';
import ImagePreviewModal from "../../shared/modals/ImagePreviewModal";
import ImageEditModal from "../../shared/modals/ImageEditModal";

// Enterprise Design System - Professional Automotive Gallery
const enterprise = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',

    surface: '#ffffff',
    surfaceSecondary: '#f8fafc',
    surfaceTertiary: '#f1f5f9',

    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',

    border: '#e2e8f0',
    borderLight: '#f1f5f9',

    success: '#059669',
    successBg: '#ecfdf5',
    warning: '#d97706',
    warningBg: '#fffbeb',
    error: '#dc2626',
    errorBg: '#fef2f2',

    space: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px'
    },

    shadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    radius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px'
    }
};

// Type definitions for protocol documents
interface ProtocolDocument {
    storageId: string;
    protocolId: string;
    originalName: string;
    fileSize: number;
    contentType: string;
    documentType: string;
    documentTypeDisplay: string;
    description?: string;
    createdAt: string;
    uploadedBy: string;
    downloadUrl: string;
}

// Document type options
const DOCUMENT_TYPES = [
    { value: 'MARKETING_CONSENT', label: 'Zgoda marketingowa' },
    { value: 'SERVICE_CONSENT', label: 'Zgoda na dodatkowe usługi' },
    { value: 'TERMS_ACCEPTANCE', label: 'Akceptacja regulaminu' },
    { value: 'PRIVACY_POLICY', label: 'Polityka prywatności' },
    { value: 'DAMAGE_WAIVER', label: 'Zwolnienie z odpowiedzialności' },
    { value: 'ACCEPTANCE_PROTOCOL', label: 'Protokół odbioru' },
    { value: 'OTHER', label: 'Inny dokument' }
];

interface ProtocolGalleryProps {
    protocol: CarReceptionProtocol;
    onProtocolUpdate: (updatedProtocol: CarReceptionProtocol) => void;
    disabled: boolean;
}

const ProtocolGallery: React.FC<ProtocolGalleryProps> = ({ protocol, onProtocolUpdate, disabled = false }) => {
    const [images, setImages] = useState<VehicleImage[]>([]);
    const [documents, setDocuments] = useState<ProtocolDocument[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUploadImage, setCurrentUploadImage] = useState<VehicleImage | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingImageIndex, setEditingImageIndex] = useState(-1);
    const [activeTab, setActiveTab] = useState<'images' | 'documents'>('images');

    // File input refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

    // Document upload modal state
    const [showDocumentUploadModal, setShowDocumentUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentType, setDocumentType] = useState('OTHER');
    const [documentDescription, setDocumentDescription] = useState('');

    // Protocol documents API functions
    const protocolDocumentsApi = {
        getDocuments: async (protocolId: string): Promise<ProtocolDocument[]> => {
            return await apiClient.get<ProtocolDocument[]>(`/v1/protocols/${protocolId}/documents`);
        },

        uploadDocument: async (protocolId: string, file: File, documentType: string, description?: string) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', documentType);
            if (description) {
                formData.append('description', description);
            }

            return await apiClient.post(`/v1/protocols/${protocolId}/document`, formData);
        },

        deleteDocument: async (protocolId: string, documentId: string): Promise<boolean> => {
            try {
                await apiClient.delete(`/receptions/${protocolId}/document/${documentId}`);
                return true;
            } catch (error) {
                console.error('Error deleting document:', error);
                return false;
            }
        },

        downloadDocument: (documentId: string): string => {
            return `${apiClient.getBaseUrl()}/receptions/document/${documentId}`;
        }
    };

    // Synchronize images with protocol.vehicleImages
    useEffect(() => {
        console.log('🔄 Synchronizing images with protocol.vehicleImages:', protocol.vehicleImages?.length || 0);

        if (protocol.vehicleImages && protocol.vehicleImages.length > 0) {
            setImages(protocol.vehicleImages);
        } else {
            fetchImagesFromApi();
        }
    }, [protocol.id]);

    // Fetch documents from API
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const docs = await protocolDocumentsApi.getDocuments(protocol.id);
                setDocuments(docs);
            } catch (error) {
                console.error('Error fetching documents:', error);
            }
        };

        fetchDocuments();
    }, [protocol.id]);

    // Fetch image URLs
    useEffect(() => {
        const fetchImageUrls = async () => {
            console.log('🖼️ Fetching image URLs for', images.length, 'images');

            console.log(images)
            const imagesToFetch = images.filter(img =>
                !img.id.startsWith('temp_') &&
                !imageUrls[img.id]
            );

            console.log('🔍 Images to fetch URLs for:', imagesToFetch.length);

            if (imagesToFetch.length === 0) return;

            try {
                const fetchPromises = imagesToFetch.map(async (image) => {
                    try {
                        const imageUrl = await carReceptionApi.fetchVehicleImageAsUrl(image.id);
                        return { id: image.id, url: imageUrl };
                    } catch (error) {
                        console.error(`❌ Error fetching URL for image ${image.id}:`, error);
                        return { id: image.id, url: '' };
                    }
                });

                const results = await Promise.all(fetchPromises);

                const newUrls = results.reduce((acc, { id, url }) => {
                    if (url) acc[id] = url;
                    return acc;
                }, {} as Record<string, string>);

                if (Object.keys(newUrls).length > 0) {
                    console.log('✅ Fetched URLs for', Object.keys(newUrls).length, 'images');
                    setImageUrls(prev => ({
                        ...prev,
                        ...newUrls
                    }));
                }
            } catch (error) {
                console.error('❌ Error in fetchImageUrls:', error);
            }
        };

        if (images.length > 0) {
            fetchImageUrls();
        }
    }, [images]);

    // Cleanup effect for URLs
    useEffect(() => {
        return () => {
            Object.values(imageUrls).forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [imageUrls]);

    // Fetch images from API (only when protocol doesn't have vehicleImages)
    const fetchImagesFromApi = async () => {
        if (isLoading) return;

        console.log('📥 Fetching images from API for protocol:', protocol.id);
        setIsLoading(true);
        setError(null);

        try {
            const fetchedImages = await carReceptionApi.fetchVehicleImages(protocol.id);
            console.log('✅ Fetched images from API:', fetchedImages.length);

            setImages(fetchedImages);

            if (!protocol.vehicleImages || protocol.vehicleImages.length === 0) {
                const updatedProtocol = {
                    ...protocol,
                    vehicleImages: fetchedImages
                };
                onProtocolUpdate(updatedProtocol);
            }
        } catch (err) {
            console.error('❌ Error fetching images from API:', err);
            setError('Wystąpił błąd podczas pobierania dokumentacji. Spróbuj odświeżyć stronę.');
        } finally {
            setIsLoading(false);
        }
    };

    // Get image URL function
    const getImageUrl = (image: VehicleImage): string => {
        console.log(`🔍 Getting URL for image ${image.id}:`, {
            hasDirectUrl: !!image.url,
            hasCachedUrl: !!imageUrls[image.id],
            isTemp: image.id.startsWith('temp_')
        });

        if (image.id.startsWith('temp_') && image.url) {
            console.log(`✅ Using temp URL for ${image.id}`);
            return image.url;
        }

        if (imageUrls[image.id]) {
            console.log(`✅ Using cached URL for ${image.id}`);
            return imageUrls[image.id];
        }

        if (image.url) {
            console.log(`✅ Using direct URL for ${image.id}`);
            return image.url;
        }

        console.log(`❌ No URL found for ${image.id}`);
        return '';
    };

    // Get file icon based on content type
    const getFileIcon = (contentType: string) => {
        if (contentType.includes('pdf')) return <FaFilePdf style={{ color: '#dc2626' }} />;
        if (contentType.includes('word') || contentType.includes('document')) return <FaFileWord style={{ color: '#2563eb' }} />;
        if (contentType.includes('excel') || contentType.includes('spreadsheet')) return <FaFileExcel style={{ color: '#059669' }} />;
        if (contentType.includes('image')) return <FaFileImage style={{ color: '#7c3aed' }} />;
        return <FaFileAlt style={{ color: '#64748b' }} />;
    };

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Format date
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle image click
    const handleImageClick = (index: number) => {
        setSelectedImageIndex(index);
        setShowPreviewModal(true);
    };

    // Handle file select for images
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            handleAddImages(event);
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    // Handle document file select
    const handleDocumentFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];

            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                setError('Plik nie może być większy niż 10MB');
                return;
            }

            setSelectedFile(file);
            setShowDocumentUploadModal(true);
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    // Handle upload click
    const handleUploadClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handle camera click
    const handleCameraClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (cameraInputRef.current) {
            cameraInputRef.current.click();
        }
    };

    // Handle document upload click
    const handleDocumentUploadClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (documentInputRef.current) {
            documentInputRef.current.click();
        }
    };

    // Handle document upload
    const handleDocumentUpload = async () => {
        if (!selectedFile) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await protocolDocumentsApi.uploadDocument(
                protocol.id,
                selectedFile,
                documentType,
                documentDescription || undefined
            );

            // Refresh documents list
            const updatedDocuments = await protocolDocumentsApi.getDocuments(protocol.id);
            setDocuments(updatedDocuments);

            setShowDocumentUploadModal(false);
            setSelectedFile(null);
            setDocumentType('OTHER');
            setDocumentDescription('');
        } catch (error) {
            console.error('Error uploading document:', error);
            setError('Wystąpił błąd podczas przesyłania dokumentu. Spróbuj ponownie.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle document delete
    const handleDeleteDocument = async (documentId: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten dokument?')) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const success = await protocolDocumentsApi.deleteDocument(protocol.id, documentId);

            if (success) {
                const updatedDocuments = await protocolDocumentsApi.getDocuments(protocol.id);
                setDocuments(updatedDocuments);
            } else {
                setError('Nie udało się usunąć dokumentu. Spróbuj ponownie.');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            setError('Wystąpił błąd podczas usuwania dokumentu.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle download document
    const handleDownloadDocument = async (protocolDoc: ProtocolDocument) => {
        try {
            const downloadUrl = protocolDocumentsApi.downloadDocument(protocolDoc.storageId);
            await apiClient.downloadFile(downloadUrl, protocolDoc.originalName);
        } catch (error) {
            console.error('Error downloading document:', error);
            setError('Wystąpił błąd podczas pobierania dokumentu.');
        }
    };

    // Handle edit image
    const handleEditImage = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingImageIndex(index);
        setEditModalOpen(true);
    };

    // Handle add images (existing functionality)
    const handleAddImages = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        const files = event.target.files;
        if (!files || files.length === 0) return;

        setError(null);

        const filesArray = Array.from(files);
        const MAX_FILE_SIZE = 5 * 1024 * 1024;

        const invalidFiles = filesArray.filter(file =>
            !file.type.startsWith('image/') || file.size > MAX_FILE_SIZE
        );

        if (invalidFiles.length > 0) {
            setError(
                `Wykryto nieprawidłowe pliki. Akceptowane są tylko obrazy do ${MAX_FILE_SIZE / 1024 / 1024}MB.`
            );
            return;
        }

        const file = filesArray[0];

        const tempImage: VehicleImage = {
            id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            url: URL.createObjectURL(file),
            name: file.name.replace(/\.[^/.]+$/, ""),
            size: file.size,
            type: file.type,
            createdAt: new Date().toISOString(),
            tags: [],
            file: file
        };

        console.log('➕ Adding temporary image:', tempImage.id);

        const updatedImages = [...images, tempImage];
        setImages(updatedImages);

        setCurrentUploadImage(tempImage);
        setEditingImageIndex(updatedImages.length - 1);
        setEditModalOpen(true);
    };

    // Handle save image info (existing functionality)
    const handleSaveImageInfo = async (newName: string, newTags: string[]) => {
        if (editingImageIndex >= 0 && editingImageIndex < images.length) {
            const currentImage = images[editingImageIndex];

            console.log('💾 Saving image info for:', currentImage.id);

            if (currentImage.id.startsWith('temp_') && currentUploadImage) {
                setEditModalOpen(false);
                setEditingImageIndex(-1);
                setIsLoading(true);
                setError(null);

                try {
                    const updatedUploadImage = {
                        ...currentUploadImage,
                        name: newName,
                        tags: newTags
                    };

                    console.log('⬆️ Uploading new image:', updatedUploadImage.name);
                    const uploadedImage = await carReceptionApi.uploadVehicleImage(protocol.id, updatedUploadImage);

                    console.log('✅ Image uploaded successfully:', uploadedImage.id);

                    const finalImages = [
                        ...images.filter(img => !img.id.startsWith('temp_')),
                        uploadedImage
                    ];

                    setImages(finalImages);
                    setCurrentUploadImage(null);

                    const updatedProtocol = {
                        ...protocol,
                        vehicleImages: finalImages
                    };
                    onProtocolUpdate(updatedProtocol);

                } catch (err) {
                    console.error('❌ Error uploading image:', err);
                    setError('Wystąpił błąd podczas przesyłania dokumentu. Spróbuj ponownie.');

                    setImages(images.filter(img => !img.id.startsWith('temp_')));
                    setCurrentUploadImage(null);
                } finally {
                    setIsLoading(false);
                }
            } else {
                const updatedImages = [...images];
                updatedImages[editingImageIndex] = {
                    ...currentImage,
                    name: newName,
                    tags: newTags
                };

                setImages(updatedImages);
                setEditModalOpen(false);
                setEditingImageIndex(-1);
                setIsLoading(true);

                try {
                    console.log('📝 Updating existing image metadata:', currentImage.id);
                    const updatedImage = await carReceptionApi.updateVehicleImage(protocol.id, currentImage.id, {
                        name: newName,
                        tags: newTags
                    });

                    if (updatedImage) {
                        const imageIndex = images.findIndex(img => img.id === updatedImage.id);
                        if (imageIndex !== -1) {
                            const finalImages = [...updatedImages];
                            finalImages[imageIndex] = updatedImage;
                            setImages(finalImages);

                            const updatedProtocol = {
                                ...protocol,
                                vehicleImages: finalImages
                            };
                            onProtocolUpdate(updatedProtocol);
                        }
                    }
                } catch (err) {
                    console.error('❌ Error updating image metadata:', err);
                    setError('Wystąpił błąd podczas aktualizacji informacji o dokumencie.');
                    setImages([...images]);
                } finally {
                    setIsLoading(false);
                }
            }
        }
    };

    // Handle delete image (existing functionality)
    const handleDeleteImage = async (imageId: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten dokument?')) {
            return;
        }

        console.log('🗑️ Deleting image:', imageId);

        if (imageId.startsWith('temp_')) {
            const updatedImages = images.filter(img => img.id !== imageId);
            setImages(updatedImages);
            setCurrentUploadImage(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const success = await carReceptionApi.deleteVehicleImage(protocol.id, imageId);

            if (success) {
                console.log('✅ Image deleted successfully');

                const updatedImages = images.filter(img => img.id !== imageId);
                setImages(updatedImages);

                setImageUrls(prev => {
                    const newUrls = { ...prev };
                    delete newUrls[imageId];
                    return newUrls;
                });

                const updatedProtocol = {
                    ...protocol,
                    vehicleImages: updatedImages
                };
                onProtocolUpdate(updatedProtocol);
            } else {
                setError('Nie udało się usunąć dokumentu. Spróbuj ponownie.');
            }
        } catch (err) {
            console.error('❌ Error deleting image:', err);
            setError('Wystąpił błąd podczas usuwania dokumentu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DocumentationPanel>
            {/* Professional Header */}
            <DocumentationHeader>
                <HeaderContent>
                    <HeaderIcon>
                        <FaFolder />
                    </HeaderIcon>
                    <HeaderText>
                        <HeaderTitle>Dokumentacja wizyty</HeaderTitle>
                        <HeaderSubtitle>
                            {images.length} {images.length === 1 ? 'zdjęcie' : images.length < 5 ? 'zdjęcia' : 'zdjęć'} • {documents.length} {documents.length === 1 ? 'dokument' : documents.length < 5 ? 'dokumenty' : 'dokumentów'}
                        </HeaderSubtitle>
                    </HeaderText>
                </HeaderContent>

                <ActionGroup>
                    <UploadButton onClick={handleUploadClick} disabled={isLoading || disabled}>
                        <FaUpload />
                        <span>Dodaj zdjęcie</span>
                    </UploadButton>
                    <DocumentButton onClick={handleDocumentUploadClick} disabled={isLoading || disabled}>
                        <FaFileAlt />
                        <span>Dodaj dokument</span>
                    </DocumentButton>

                    {/* Hidden file inputs */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    <input
                        type="file"
                        ref={cameraInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        capture="environment"
                        style={{ display: 'none' }}
                    />
                    <input
                        type="file"
                        ref={documentInputRef}
                        onChange={handleDocumentFileSelect}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                        style={{ display: 'none' }}
                    />
                </ActionGroup>
            </DocumentationHeader>

            {/* Tab Navigation */}
            <TabContainer>
                <TabButton
                    $active={activeTab === 'images'}
                    onClick={() => setActiveTab('images')}
                >
                    <FaFileImage />
                    <span>Zdjęcia ({images.length})</span>
                </TabButton>
                <TabButton
                    $active={activeTab === 'documents'}
                    onClick={() => setActiveTab('documents')}
                >
                    <FaFileAlt />
                    <span>Dokumenty ({documents.length})</span>
                </TabButton>
            </TabContainer>

            {/* Error State */}
            {error && (
                <ErrorAlert>
                    <FaExclamationCircle />
                    <span>{error}</span>
                </ErrorAlert>
            )}

            {/* Loading State */}
            {isLoading && currentUploadImage && (
                <LoadingAlert>
                    <LoadingSpinner />
                    <span>Przesyłanie pliku...</span>
                </LoadingAlert>
            )}

            {/* Gallery Content */}
            <GalleryContent>
                {activeTab === 'images' ? (
                    // Images Tab Content
                    isLoading && images.length === 0 ? (
                        <LoadingState>
                            <LoadingSpinner />
                            <span>Ładowanie zdjęć...</span>
                        </LoadingState>
                    ) : images.length > 0 ? (
                        <DocumentGrid>
                            {images.map((image, index) => (
                                <DocumentCard
                                    key={image.id || index}
                                    $isTemp={image.id.startsWith('temp_')}
                                    onClick={() => handleImageClick(index)}
                                >
                                    <DocumentPreview>
                                        {imageUrls[image.id] || image.url ? (
                                            <DocumentImage
                                                src={getImageUrl(image)}
                                                alt={image.name || `Zdjęcie ${index + 1}`}
                                            />
                                        ) : (
                                            <DocumentPlaceholder>
                                                <FaImage />
                                            </DocumentPlaceholder>
                                        )}
                                        {image.id.startsWith('temp_') && (
                                            <ProcessingBadge>Przetwarzanie</ProcessingBadge>
                                        )}
                                    </DocumentPreview>

                                    <DocumentInfo>
                                        <DocumentHeader>
                                            <DocumentName>
                                                {image.name || `Zdjęcie ${index + 1}`}
                                            </DocumentName>
                                            <DocumentActions>
                                                <ActionButton
                                                    onClick={(e) => handleEditImage(index, e)}
                                                    title="Edytuj"
                                                >
                                                    <FaEdit />
                                                </ActionButton>
                                                <ActionButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteImage(image.id);
                                                    }}
                                                    title="Usuń"
                                                    $variant="danger"
                                                >
                                                    <FaTrash />
                                                </ActionButton>
                                            </DocumentActions>
                                        </DocumentHeader>

                                        <DocumentMeta>
                                            <MetaItem>
                                                <MetaLabel>Rozmiar</MetaLabel>
                                                <MetaValue>{formatFileSize(image.size)}</MetaValue>
                                            </MetaItem>
                                            {image.tags && image.tags.length > 0 && (
                                                <MetaItem>
                                                    <MetaLabel>Tagi</MetaLabel>
                                                    <TagsDisplay>
                                                        <FaTags />
                                                        <TagCount>{image.tags.length}</TagCount>
                                                    </TagsDisplay>
                                                </MetaItem>
                                            )}
                                        </DocumentMeta>

                                        {image.tags && image.tags.length > 0 && (
                                            <TagsList>
                                                {image.tags.slice(0, 3).map(tag => (
                                                    <TagBadge key={tag}>{tag}</TagBadge>
                                                ))}
                                                {image.tags.length > 3 && (
                                                    <TagBadge>+{image.tags.length - 3}</TagBadge>
                                                )}
                                            </TagsList>
                                        )}
                                    </DocumentInfo>
                                </DocumentCard>
                            ))}
                        </DocumentGrid>
                    ) : (
                        <EmptyState>
                            <EmptyIcon>
                                <FaFileImage />
                            </EmptyIcon>
                            <EmptyTitle>Brak zdjęć</EmptyTitle>
                            <EmptySubtitle>Dodaj zdjęcia związane z tym pojazdem</EmptySubtitle>
                            <EmptyAction onClick={handleUploadClick} disabled={disabled}>
                                <FaPlus />
                                <span>Dodaj pierwsze zdjęcie</span>
                            </EmptyAction>
                        </EmptyState>
                    )
                ) : (
                    // Documents Tab Content
                    documents.length > 0 ? (
                        <DocumentsList>
                            {documents.map((document) => (
                                <DocumentRow key={document.storageId}>
                                    <DocumentRowIcon>
                                        {getFileIcon(document.contentType)}
                                    </DocumentRowIcon>

                                    <DocumentRowContent>
                                        <DocumentRowHeader>
                                            <DocumentRowName>{document.originalName}</DocumentRowName>
                                            <DocumentRowType>{document.documentTypeDisplay}</DocumentRowType>
                                        </DocumentRowHeader>

                                        <DocumentRowMeta>
                                            <DocumentRowInfo>
                                                <FaClock />
                                                <span>{formatDate(document.createdAt)}</span>
                                            </DocumentRowInfo>
                                            <DocumentRowInfo>
                                                <FaUser />
                                                <span>{document.uploadedBy}</span>
                                            </DocumentRowInfo>
                                            <DocumentRowInfo>
                                                <span>{formatFileSize(document.fileSize)}</span>
                                            </DocumentRowInfo>
                                        </DocumentRowMeta>

                                        {document.description && (
                                            <DocumentRowDescription>
                                                {document.description}
                                            </DocumentRowDescription>
                                        )}
                                    </DocumentRowContent>

                                    <DocumentRowActions>
                                        <ActionButton
                                            onClick={() => handleDownloadDocument(document)}
                                            title="Pobierz"
                                        >
                                            <FaDownload />
                                        </ActionButton>
                                        <ActionButton
                                            onClick={() => handleDeleteDocument(document.storageId)}
                                            title="Usuń"
                                            $variant="danger"
                                        >
                                            <FaTrash />
                                        </ActionButton>
                                    </DocumentRowActions>
                                </DocumentRow>
                            ))}
                        </DocumentsList>
                    ) : (
                        <EmptyState>
                            <EmptyIcon>
                                <FaFileAlt />
                            </EmptyIcon>
                            <EmptyTitle>Brak dokumentów</EmptyTitle>
                            <EmptySubtitle>Dodaj dokumenty związane z wizytą</EmptySubtitle>
                            <EmptyAction onClick={handleDocumentUploadClick} disabled={disabled}>
                                <FaPlus />
                                <span>Dodaj pierwszy dokument</span>
                            </EmptyAction>
                        </EmptyState>
                    )
                )}
            </GalleryContent>

            {/* Document Upload Modal */}
            {showDocumentUploadModal && selectedFile && (
                <ModalOverlay>
                    <ModalContainer>
                        <ModalHeader>
                            <ModalTitle>Dodaj dokument</ModalTitle>
                            <CloseButton onClick={() => {
                                setShowDocumentUploadModal(false);
                                setSelectedFile(null);
                                setDocumentType('OTHER');
                                setDocumentDescription('');
                            }}>
                                <FaTimes />
                            </CloseButton>
                        </ModalHeader>

                        <ModalBody>
                            <FilePreview>
                                <FilePreviewIcon>
                                    {getFileIcon(selectedFile.type)}
                                </FilePreviewIcon>
                                <FilePreviewInfo>
                                    <FilePreviewName>{selectedFile.name}</FilePreviewName>
                                    <FilePreviewSize>{formatFileSize(selectedFile.size)}</FilePreviewSize>
                                </FilePreviewInfo>
                            </FilePreview>

                            <FormGroup>
                                <FormLabel>Typ dokumentu</FormLabel>
                                <FormSelect
                                    value={documentType}
                                    onChange={(e) => setDocumentType(e.target.value)}
                                >
                                    {DOCUMENT_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </FormSelect>
                            </FormGroup>

                            <FormGroup>
                                <FormLabel>Opis (opcjonalnie)</FormLabel>
                                <FormTextarea
                                    value={documentDescription}
                                    onChange={(e) => setDocumentDescription(e.target.value)}
                                    placeholder="Dodatkowe informacje o dokumencie..."
                                    rows={3}
                                />
                            </FormGroup>
                        </ModalBody>

                        <ModalFooter>
                            <SecondaryButton onClick={() => {
                                setShowDocumentUploadModal(false);
                                setSelectedFile(null);
                                setDocumentType('OTHER');
                                setDocumentDescription('');
                            }}>
                                Anuluj
                            </SecondaryButton>
                            <PrimaryButton onClick={handleDocumentUpload} disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner />
                                        <span>Przesyłanie...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaUpload />
                                        <span>Prześlij dokument</span>
                                    </>
                                )}
                            </PrimaryButton>
                        </ModalFooter>
                    </ModalContainer>
                </ModalOverlay>
            )}

            {/* Existing Modals */}
            <ImagePreviewModal
                isOpen={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                images={images}
                currentImageIndex={selectedImageIndex}
                onDelete={handleDeleteImage}
            />

            {editingImageIndex >= 0 && editingImageIndex < images.length && (
                <ImageEditModal
                    isOpen={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        setEditingImageIndex(-1);

                        if (currentUploadImage) {
                            setImages(images.filter(img => !img.id.startsWith('temp_')));
                            setCurrentUploadImage(null);
                        }
                    }}
                    onSave={handleSaveImageInfo}
                    initialName={images[editingImageIndex].name || ''}
                    initialTags={images[editingImageIndex].tags || []}
                    imageUrl={getImageUrl(images[editingImageIndex])}
                />
            )}
        </DocumentationPanel>
    );
};

// Enterprise-Grade Styled Components
const DocumentationPanel = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.lg};
`;

const DocumentationHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${enterprise.space.lg} ${enterprise.space.xl};
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.lg};
    box-shadow: ${enterprise.shadow.sm};
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.lg};
`;

const HeaderIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${enterprise.primary}15;
    color: ${enterprise.primary};
    border-radius: ${enterprise.radius.lg};
    font-size: 20px;
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.xs};
`;

const HeaderTitle = styled.h2`
    font-size: ${enterprise.fontSize.xl};
    font-weight: 700;
    color: ${enterprise.textPrimary};
    margin: 0;
`;

const HeaderSubtitle = styled.div`
    font-size: ${enterprise.fontSize.sm};
    color: ${enterprise.textTertiary};
    font-weight: 500;
`;

const ActionGroup = styled.div`
    display: flex;
    gap: ${enterprise.space.md};
    align-items: center;
`;

const UploadButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    padding: ${enterprise.space.md} ${enterprise.space.lg};
    background: ${enterprise.primary};
    color: white;
    border: none;
    border-radius: ${enterprise.radius.md};
    font-size: ${enterprise.fontSize.sm};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: ${enterprise.shadow.sm};

    &:hover:not(:disabled) {
        background: ${enterprise.primaryDark};
        transform: translateY(-1px);
        box-shadow: ${enterprise.shadow.md};
    }

    &:disabled {
        background: ${enterprise.textMuted};
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    svg {
        font-size: ${enterprise.fontSize.xs};
    }
`;

const CameraButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    padding: ${enterprise.space.md} ${enterprise.space.lg};
    background: ${enterprise.surface};
    color: ${enterprise.textSecondary};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.md};
    font-size: ${enterprise.fontSize.sm};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${enterprise.surfaceSecondary};
        border-color: ${enterprise.textTertiary};
        transform: translateY(-1px);
        box-shadow: ${enterprise.shadow.sm};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    svg {
        font-size: ${enterprise.fontSize.xs};
    }
`;

const DocumentButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    padding: ${enterprise.space.md} ${enterprise.space.lg};
    background: ${enterprise.success};
    color: white;
    border: none;
    border-radius: ${enterprise.radius.md};
    font-size: ${enterprise.fontSize.sm};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: ${enterprise.shadow.sm};

    &:hover:not(:disabled) {
        background: #047857;
        transform: translateY(-1px);
        box-shadow: ${enterprise.shadow.md};
    }

    &:disabled {
        background: ${enterprise.textMuted};
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    svg {
        font-size: ${enterprise.fontSize.xs};
    }
`;

const TabContainer = styled.div`
    display: flex;
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.lg} ${enterprise.radius.lg} 0 0;
    overflow: hidden;
`;

const TabButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    padding: ${enterprise.space.lg} ${enterprise.space.xl};
    background: ${props => props.$active ? enterprise.surfaceSecondary : enterprise.surface};
    color: ${props => props.$active ? enterprise.primary : enterprise.textSecondary};
    border: none;
    border-bottom: 3px solid ${props => props.$active ? enterprise.primary : 'transparent'};
    font-size: ${enterprise.fontSize.sm};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    justify-content: center;

    &:hover {
        background: ${enterprise.surfaceSecondary};
        color: ${enterprise.primary};
    }

    svg {
        font-size: ${enterprise.fontSize.base};
    }
`;

const ErrorAlert = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    padding: ${enterprise.space.md} ${enterprise.space.lg};
    background: ${enterprise.errorBg};
    border: 1px solid #fecaca;
    border-radius: ${enterprise.radius.md};
    color: ${enterprise.error};
    font-size: ${enterprise.fontSize.sm};

    svg {
        font-size: ${enterprise.fontSize.base};
    }
`;

const LoadingAlert = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    padding: ${enterprise.space.md} ${enterprise.space.lg};
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: ${enterprise.radius.md};
    color: ${enterprise.primary};
    font-size: ${enterprise.fontSize.sm};
`;

const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const GalleryContent = styled.div`
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-top: none;
    border-radius: 0 0 ${enterprise.radius.lg} ${enterprise.radius.lg};
    box-shadow: ${enterprise.shadow.sm};
    overflow: hidden;
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${enterprise.space.lg};
    padding: ${enterprise.space.xxl};
    color: ${enterprise.textTertiary};

    span {
        font-size: ${enterprise.fontSize.base};
        font-weight: 500;
    }
`;

const DocumentGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: ${enterprise.space.lg};
    padding: ${enterprise.space.xl};

    @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: ${enterprise.space.md};
        padding: ${enterprise.space.lg};
    }
`;

const DocumentCard = styled.div<{ $isTemp?: boolean }>`
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.lg};
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: ${enterprise.shadow.sm};

    ${props => props.$isTemp && `
        opacity: 0.8;
        border-color: ${enterprise.primary};
        box-shadow: 0 0 0 1px ${enterprise.primary}40;
    `}

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${enterprise.shadow.lg};
        border-color: ${enterprise.primary}60;
    }
`;

const DocumentPreview = styled.div`
    position: relative;
    height: 200px;
    overflow: hidden;
    background: ${enterprise.surfaceTertiary};
`;

const DocumentImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;

    ${DocumentCard}:hover & {
        transform: scale(1.05);
    }
`;

const DocumentPlaceholder = styled.div`
    width: 100%;
    height: 100%;
    background: ${enterprise.surfaceSecondary};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${enterprise.textMuted};
    font-size: 32px;
`;

const ProcessingBadge = styled.div`
    position: absolute;
    top: ${enterprise.space.md};
    left: ${enterprise.space.md};
    padding: ${enterprise.space.xs} ${enterprise.space.sm};
    background: ${enterprise.primary};
    color: white;
    border-radius: ${enterprise.radius.sm};
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const DocumentInfo = styled.div`
    padding: ${enterprise.space.lg};
`;

const DocumentHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${enterprise.space.md};
`;

const DocumentName = styled.h4`
    font-size: ${enterprise.fontSize.base};
    font-weight: 600;
    color: ${enterprise.textPrimary};
    margin: 0;
    line-height: 1.4;
    flex: 1;
    margin-right: ${enterprise.space.md};
`;

const DocumentActions = styled.div`
    display: flex;
    gap: ${enterprise.space.xs};
    opacity: 0.7;
    transition: opacity 0.2s ease;

    ${DocumentCard}:hover & {
        opacity: 1;
    }
`;

const ActionButton = styled.button<{ $variant?: 'danger' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${props => props.$variant === 'danger' ? enterprise.error + '20' : enterprise.surfaceSecondary};
    color: ${props => props.$variant === 'danger' ? enterprise.error : enterprise.textSecondary};
    border: none;
    border-radius: ${enterprise.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: ${enterprise.fontSize.xs};

    &:hover {
        background: ${props => props.$variant === 'danger' ? enterprise.error : enterprise.primary};
        color: white;
        transform: translateY(-1px);
        box-shadow: ${enterprise.shadow.sm};
    }
`;

const DocumentMeta = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${enterprise.space.md};
`;

const MetaItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.xs};
`;

const MetaLabel = styled.div`
    font-size: 11px;
    color: ${enterprise.textTertiary};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const MetaValue = styled.div`
    font-size: ${enterprise.fontSize.sm};
    color: ${enterprise.textSecondary};
    font-weight: 500;
`;

const TagsDisplay = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.xs};
    color: ${enterprise.primary};
`;

const TagCount = styled.div`
    font-size: ${enterprise.fontSize.sm};
    font-weight: 600;
`;

const TagsList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${enterprise.space.xs};
`;

const TagBadge = styled.div`
    padding: 2px ${enterprise.space.sm};
    background: ${enterprise.primary}15;
    color: ${enterprise.primary};
    border: 1px solid ${enterprise.primary}30;
    border-radius: ${enterprise.radius.sm};
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const DocumentsList = styled.div`
    display: flex;
    flex-direction: column;
    padding: ${enterprise.space.xl};
    gap: ${enterprise.space.md};
`;

const DocumentRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.lg};
    padding: ${enterprise.space.lg};
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.lg};
    transition: all 0.2s ease;

    &:hover {
        box-shadow: ${enterprise.shadow.md};
        border-color: ${enterprise.primary}40;
        transform: translateY(-1px);
    }
`;

const DocumentRowIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${enterprise.surfaceSecondary};
    border-radius: ${enterprise.radius.lg};
    font-size: 24px;
    flex-shrink: 0;
`;

const DocumentRowContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.sm};
    min-width: 0;
`;

const DocumentRowHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.md};
`;

const DocumentRowName = styled.div`
    font-size: ${enterprise.fontSize.base};
    font-weight: 600;
    color: ${enterprise.textPrimary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
`;

const DocumentRowType = styled.div`
    padding: ${enterprise.space.xs} ${enterprise.space.sm};
    background: ${enterprise.primary}15;
    color: ${enterprise.primary};
    border: 1px solid ${enterprise.primary}30;
    border-radius: ${enterprise.radius.sm};
    font-size: ${enterprise.fontSize.xs};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
`;

const DocumentRowMeta = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.lg};
    flex-wrap: wrap;
`;

const DocumentRowInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.xs};
    font-size: ${enterprise.fontSize.sm};
    color: ${enterprise.textTertiary};

    svg {
        font-size: ${enterprise.fontSize.xs};
    }
`;

const DocumentRowDescription = styled.div`
    font-size: ${enterprise.fontSize.sm};
    color: ${enterprise.textSecondary};
    font-style: italic;
    line-height: 1.4;
`;

const DocumentRowActions = styled.div`
    display: flex;
    gap: ${enterprise.space.xs};
    flex-shrink: 0;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${enterprise.space.xxl} ${enterprise.space.xl};
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 80px;
    height: 80px;
    background: ${enterprise.surfaceSecondary};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${enterprise.textMuted};
    font-size: 32px;
    margin-bottom: ${enterprise.space.xl};
`;

const EmptyTitle = styled.h3`
    font-size: ${enterprise.fontSize.lg};
    font-weight: 600;
    color: ${enterprise.textSecondary};
    margin: 0 0 ${enterprise.space.sm} 0;
`;

const EmptySubtitle = styled.p`
    font-size: ${enterprise.fontSize.sm};
    color: ${enterprise.textTertiary};
    margin: 0 0 ${enterprise.space.xl} 0;
    line-height: 1.5;
`;

const EmptyAction = styled.button`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    padding: ${enterprise.space.md} ${enterprise.space.xl};
    background: ${enterprise.primary};
    color: white;
    border: none;
    border-radius: ${enterprise.radius.md};
    font-size: ${enterprise.fontSize.sm};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: ${enterprise.shadow.sm};

    &:hover:not(:disabled) {
        background: ${enterprise.primaryDark};
        transform: translateY(-1px);
        box-shadow: ${enterprise.shadow.md};
    }

    &:disabled {
        background: ${enterprise.textMuted};
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    svg {
        font-size: ${enterprise.fontSize.xs};
    }
`;

// Modal Components
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
`;

const ModalContainer = styled.div`
    background: ${enterprise.surface};
    border-radius: ${enterprise.radius.xl};
    box-shadow: ${enterprise.shadow.xl};
    width: 500px;
    max-width: 95%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${enterprise.space.lg} ${enterprise.space.xl};
    border-bottom: 1px solid ${enterprise.border};
    background: ${enterprise.surfaceSecondary};
`;

const ModalTitle = styled.h3`
    font-size: ${enterprise.fontSize.lg};
    font-weight: 600;
    color: ${enterprise.textPrimary};
    margin: 0;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${enterprise.surfaceSecondary};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.sm};
    color: ${enterprise.textMuted};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${enterprise.errorBg};
        border-color: ${enterprise.error};
        color: ${enterprise.error};
    }
`;

const ModalBody = styled.div`
    padding: ${enterprise.space.xl};
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.lg};
`;

const FilePreview = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.lg};
    padding: ${enterprise.space.lg};
    background: ${enterprise.surfaceSecondary};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.lg};
`;

const FilePreviewIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${enterprise.surface};
    border-radius: ${enterprise.radius.lg};
    font-size: 24px;
`;

const FilePreviewInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.xs};
`;

const FilePreviewName = styled.div`
    font-size: ${enterprise.fontSize.base};
    font-weight: 600;
    color: ${enterprise.textPrimary};
    word-break: break-word;
`;

const FilePreviewSize = styled.div`
    font-size: ${enterprise.fontSize.sm};
    color: ${enterprise.textTertiary};
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.sm};
`;

const FormLabel = styled.label`
    font-size: ${enterprise.fontSize.sm};
    font-weight: 600;
    color: ${enterprise.textPrimary};
`;

const FormSelect = styled.select`
    padding: ${enterprise.space.md};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.md};
    font-size: ${enterprise.fontSize.sm};
    background: ${enterprise.surface};
    color: ${enterprise.textPrimary};
    
    &:focus {
       outline: none;
       border-color: ${enterprise.primary};
       box-shadow: 0 0 0 3px ${enterprise.primary}20;
   }
`;

const FormTextarea = styled.textarea`
   padding: ${enterprise.space.md};
   border: 1px solid ${enterprise.border};
   border-radius: ${enterprise.radius.md};
   font-size: ${enterprise.fontSize.sm};
   background: ${enterprise.surface};
   color: ${enterprise.textPrimary};
   resize: vertical;
   min-height: 80px;

   &:focus {
       outline: none;
       border-color: ${enterprise.primary};
       box-shadow: 0 0 0 3px ${enterprise.primary}20;
   }

   &::placeholder {
       color: ${enterprise.textMuted};
   }
`;

const ModalFooter = styled.div`
   display: flex;
   justify-content: flex-end;
   gap: ${enterprise.space.md};
   padding: ${enterprise.space.lg} ${enterprise.space.xl};
   border-top: 1px solid ${enterprise.border};
   background: ${enterprise.surfaceSecondary};
`;

const SecondaryButton = styled.button`
   display: flex;
   align-items: center;
   gap: ${enterprise.space.sm};
   padding: ${enterprise.space.md} ${enterprise.space.lg};
   background: ${enterprise.surface};
   color: ${enterprise.textSecondary};
   border: 1px solid ${enterprise.border};
   border-radius: ${enterprise.radius.md};
   font-weight: 600;
   font-size: ${enterprise.fontSize.sm};
   cursor: pointer;
   transition: all 0.2s ease;

   &:hover {
       background: ${enterprise.surfaceSecondary};
       color: ${enterprise.textPrimary};
       border-color: ${enterprise.textTertiary};
   }
`;

const PrimaryButton = styled.button`
   display: flex;
   align-items: center;
   gap: ${enterprise.space.sm};
   padding: ${enterprise.space.md} ${enterprise.space.lg};
   background: ${enterprise.primary};
   color: white;
   border: none;
   border-radius: ${enterprise.radius.md};
   font-weight: 600;
   font-size: ${enterprise.fontSize.sm};
   cursor: pointer;
   transition: all 0.2s ease;
   box-shadow: ${enterprise.shadow.sm};

   &:hover:not(:disabled) {
       background: ${enterprise.primaryDark};
       transform: translateY(-1px);
       box-shadow: ${enterprise.shadow.md};
   }

   &:disabled {
       background: ${enterprise.textMuted};
       cursor: not-allowed;
       transform: none;
       box-shadow: none;
   }
`;

export default ProtocolGallery;