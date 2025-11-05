// src/components/DocumentPreviewModal.tsx
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaDownload, FaExclamationTriangle, FaFileAlt, FaTimes} from 'react-icons/fa';
import {apiClient} from "../../../../shared/api/apiClient";

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

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: ProtocolDocument;
    onDownload?: (document: ProtocolDocument) => void;
}

// Supported file types for preview
const PREVIEWABLE_TYPES: Record<string, string> = {
    // PDF files
    'application/pdf': 'pdf',

    // Microsoft Office documents
    'application/msword': 'office',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'office',
    'application/vnd.ms-excel': 'office',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'office',
    'application/vnd.ms-powerpoint': 'office',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'office',

    // Text files
    'text/plain': 'text',
    'text/html': 'text',
    'text/css': 'text',
    'text/javascript': 'text',
    'application/json': 'text',
    'application/xml': 'text',
    'text/xml': 'text',

    // Images
    'image/jpeg': 'image',
    'image/jpg': 'image',
    'image/png': 'image',
    'image/gif': 'image',
    'image/webp': 'image',
    'image/svg+xml': 'image',
};

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       document,
                                                                       onDownload
                                                                   }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [textContent, setTextContent] = useState<string | null>(null);

    // Get file type category
    const getFileTypeCategory = (contentType: string): string => {
        return PREVIEWABLE_TYPES[contentType.toLowerCase()] || 'unsupported';
    };

    const fileTypeCategory = getFileTypeCategory(document.contentType);

    // Check if file is previewable
    const isPreviewable = fileTypeCategory !== 'unsupported';

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Fetch preview content
    const fetchPreviewContent = async () => {
        if (!isOpen || !isPreviewable) return;

        setIsLoading(true);
        setError(null);
        setPreviewUrl(null);
        setTextContent(null);

        try {
            const response = await fetch(`${apiClient.getBaseUrl()}/v1/protocols/document/${document.storageId}/preview`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiClient.getAuthToken()}`,
                    'Accept': '*/*'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Handle different file types
            if (fileTypeCategory === 'pdf') {
                // For PDF files, create blob URL
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                setPreviewUrl(blobUrl);
            } else if (fileTypeCategory === 'text') {
                // For text files, read content as text
                const text = await response.text();
                setTextContent(text);
            } else if (fileTypeCategory === 'image') {
                // For images, create blob URL
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                setPreviewUrl(blobUrl);
            } else if (fileTypeCategory === 'office') {
                // For Office documents, assume server converts to PDF
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                setPreviewUrl(blobUrl);
            }
        } catch (err) {
            console.error('Error fetching document preview:', err);
            setError(`Nie udało się załadować podglądu dokumentu: ${err instanceof Error ? err.message : 'Nieznany błąd'}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Effect to fetch content when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchPreviewContent();
        }

        // Cleanup blob URLs when modal closes
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [isOpen, document.storageId]);

    // Handle download
    const handleDownload = () => {
        if (onDownload) {
            onDownload(document);
        }
    };

    // Handle close
    const handleClose = () => {
        // Cleanup blob URLs
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        onClose();
    };

    // Don't render if not open
    if (!isOpen) return null;

    // For PDF files, use the existing PDFViewer component
    if (fileTypeCategory === 'pdf' && previewUrl && !isLoading && !error) {
        return (
            <ModalOverlay onClick={handleClose}>
                <PDFViewerContainer onClick={(e) => e.stopPropagation()}>
                    <PDFHeader>
                        <HeaderContent>
                            <HeaderTitle>{document.originalName}</HeaderTitle>
                            <HeaderSubtitle>
                                {document.documentTypeDisplay} • {formatFileSize(document.fileSize)}
                            </HeaderSubtitle>
                        </HeaderContent>
                        <HeaderActions>
                            {onDownload && (
                                <ActionButton onClick={handleDownload} title="Pobierz">
                                    <FaDownload />
                                </ActionButton>
                            )}
                            <ActionButton onClick={handleClose} title="Zamknij">
                                <FaTimes />
                            </ActionButton>
                        </HeaderActions>
                    </PDFHeader>
                    <PDFFrame
                        src={previewUrl}
                        title={`Podgląd dokumentu: ${document.originalName}`}
                        frameBorder="0"
                    />
                </PDFViewerContainer>
            </ModalOverlay>
        );
    }

    return (
        <ModalOverlay onClick={handleClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <HeaderContent>
                        <HeaderTitle>{document.originalName}</HeaderTitle>
                        <HeaderSubtitle>
                            {document.documentTypeDisplay} • {formatFileSize(document.fileSize)}
                        </HeaderSubtitle>
                    </HeaderContent>
                    <HeaderActions>
                        {onDownload && (
                            <ActionButton onClick={handleDownload} title="Pobierz">
                                <FaDownload />
                            </ActionButton>
                        )}
                        <ActionButton onClick={handleClose} title="Zamknij">
                            <FaTimes />
                        </ActionButton>
                    </HeaderActions>
                </ModalHeader>

                <ModalContent>
                    {isLoading && (
                        <LoadingState>
                            <LoadingSpinner />
                            <LoadingText>Ładowanie podglądu...</LoadingText>
                        </LoadingState>
                    )}

                    {error && (
                        <ErrorState>
                            <ErrorIcon>
                                <FaExclamationTriangle />
                            </ErrorIcon>
                            <ErrorText>{error}</ErrorText>
                            <RetryButton onClick={fetchPreviewContent}>
                                Spróbuj ponownie
                            </RetryButton>
                        </ErrorState>
                    )}

                    {!isLoading && !error && !isPreviewable && (
                        <UnsupportedState>
                            <UnsupportedIcon>
                                <FaFileAlt />
                            </UnsupportedIcon>
                            <UnsupportedTitle>Podgląd niedostępny</UnsupportedTitle>
                            <UnsupportedText>
                                Typ pliku {document.contentType} nie jest obsługiwany w podglądzie.
                                <br />
                                Pobierz plik, aby go otworzyć.
                            </UnsupportedText>
                            {onDownload && (
                                <DownloadButton onClick={handleDownload}>
                                    <FaDownload />
                                    <span>Pobierz plik</span>
                                </DownloadButton>
                            )}
                        </UnsupportedState>
                    )}

                    {!isLoading && !error && fileTypeCategory === 'image' && previewUrl && (
                        <ImagePreview>
                            <PreviewImage src={previewUrl} alt={document.originalName} />
                        </ImagePreview>
                    )}

                    {!isLoading && !error && fileTypeCategory === 'text' && textContent && (
                        <TextPreview>
                            <CodeBlock>
                                <pre>{textContent}</pre>
                            </CodeBlock>
                        </TextPreview>
                    )}

                    {!isLoading && !error && fileTypeCategory === 'office' && previewUrl && (
                        <OfficePreview>
                            <PDFFrame
                                src={previewUrl}
                                title={`Podgląd dokumentu: ${document.originalName}`}
                                frameBorder="0"
                            />
                        </OfficePreview>
                    )}
                </ModalContent>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
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
    z-index: 2000;
    backdrop-filter: blur(4px);
    padding: 20px;
`;

const ModalContainer = styled.div`
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    width: 90vw;
    max-width: 1200px;
    height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const PDFViewerContainer = styled.div`
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    width: 90vw;
    max-width: 1400px;
    height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const PDFHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
`;

const HeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const HeaderTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
    line-height: 1.4;
`;

const HeaderSubtitle = styled.div`
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 16px;

    &:hover {
        background: #f1f5f9;
        color: #334155;
        border-color: #cbd5e1;
    }

    &:active {
        transform: translateY(1px);
    }
`;

const ModalContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #ffffff;
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 16px;
`;

const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: #64748b;
    font-weight: 500;
`;

const ErrorState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 40px;
    text-align: center;
`;

const ErrorIcon = styled.div`
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #fef2f2;
    color: #dc2626;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 16px;
`;

const ErrorText = styled.div`
    font-size: 16px;
    color: #374151;
    margin-bottom: 24px;
    line-height: 1.5;
`;

const RetryButton = styled.button`
    padding: 12px 24px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #2563eb;
    }
`;

const UnsupportedState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 40px;
    text-align: center;
`;

const UnsupportedIcon = styled.div`
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #f3f4f6;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 16px;
`;

const UnsupportedTitle = styled.h4`
    font-size: 18px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 8px 0;
`;

const UnsupportedText = styled.div`
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 24px;
    line-height: 1.5;
`;

const DownloadButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: #059669;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #047857;
    }

    svg {
        font-size: 14px;
    }
`;

const ImagePreview = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 24px;
    background: #f8fafc;
`;

const PreviewImage = styled.img`
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const TextPreview = styled.div`
    height: 100%;
    overflow: auto;
    padding: 24px;
    background: #f8fafc;
`;

const CodeBlock = styled.div`
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: auto;

    pre {
        margin: 0;
        padding: 16px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 14px;
        line-height: 1.5;
        color: #374151;
        white-space: pre-wrap;
        word-wrap: break-word;
    }
`;

const OfficePreview = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const PDFFrame = styled.iframe`
    width: 100%;
    height: 100%;
    border: none;
    flex: 1;
`;

export default DocumentPreviewModal;