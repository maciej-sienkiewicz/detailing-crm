// src/pages/Settings/components/DocumentFormModal.tsx - FIXED: File upload functionality
import React, { useState, useRef } from 'react';
import { FaFileUpload, FaFile, FaTimes } from 'react-icons/fa';
import { EmployeeDocument } from '../../../types';
import {
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalBody,
    CloseButton,
    Form,
    FormGroup,
    Label,
    Input,
    Select,
    HelpText,
    ButtonGroup,
    Button,
    ErrorText,
    FileUploadButton,
    FileInput
} from '../styles/ModalStyles';
import styled from 'styled-components';

// Brand Theme
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    text: {
        primary: '#1e293b',
        secondary: '#475569',
        muted: '#64748b'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px'
    },
    radius: {
        md: '8px',
        lg: '12px'
    },
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2'
    }
};

// Typy dokumentów
const documentTypes = [
    'Umowa o pracę',
    'Umowa o poufności',
    'Zgoda RODO',
    'Karta szkolenia BHP',
    'Badania lekarskie',
    'Certyfikat',
    'CV',
    'Dyplom',
    'Inne'
];

interface DocumentFormModalProps {
    employeeId: string;
    onSave: (documentData: {
        employeeId: string;
        name: string;
        type: string;
        file: File;
        description?: string;
    }) => Promise<void>;
    onCancel: () => void;
}

export const DocumentFormModal: React.FC<DocumentFormModalProps> = ({
                                                                        employeeId,
                                                                        onSave,
                                                                        onCancel
                                                                    }) => {
    const today = new Date().toISOString().split('T')[0];
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        type: documentTypes[0],
        description: '',
        uploadDate: today
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Usuwanie błędów przy edycji pola
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // 🔧 FIX: Obsługa wyboru pliku
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);

            // Automatycznie ustaw nazwę dokumentu na podstawie nazwy pliku (jeśli jest pusta)
            if (!formData.name.trim()) {
                const fileName = file.name.replace(/\.[^/.]+$/, ""); // Usuń rozszerzenie
                setFormData(prev => ({
                    ...prev,
                    name: fileName
                }));
            }

            // Wyczyść błąd pliku jeśli istnieje
            if (formErrors.file) {
                setFormErrors(prev => ({
                    ...prev,
                    file: ''
                }));
            }
        }
    };

    // 🔧 FIX: Usuwanie wybranego pliku
    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // 🔧 FIX: Walidacja z plikiem
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = 'Nazwa dokumentu jest wymagana';
        }

        if (!selectedFile) {
            errors.file = 'Plik jest wymagany';
        } else {
            // Walidacja rozmiaru pliku (maks. 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (selectedFile.size > maxSize) {
                errors.file = 'Plik nie może być większy niż 10MB';
            }

            // Walidacja typu pliku
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg',
                'image/jpg',
                'image/png',
                'text/plain'
            ];

            if (!allowedTypes.includes(selectedFile.type)) {
                errors.file = 'Obsługiwane formaty: PDF, DOC, DOCX, JPG, PNG, TXT';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // 🔧 FIX: Obsługa submita z plikiem
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onSave({
                employeeId,
                name: formData.name.trim(),
                type: formData.type,
                file: selectedFile!,
                description: formData.description.trim() || undefined
            });

            console.log('✅ Document uploaded successfully');
        } catch (error) {
            console.error('❌ Error uploading document:', error);
            setFormErrors(prev => ({
                ...prev,
                submit: 'Wystąpił błąd podczas przesyłania dokumentu. Spróbuj ponownie.'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Formatowanie rozmiaru pliku
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <ModalOverlay>
            <ModalContainer style={{ width: '600px' }}>
                <ModalHeader>
                    <h2>Dodaj nowy dokument</h2>
                    <CloseButton onClick={onCancel} disabled={isSubmitting}>&times;</CloseButton>
                </ModalHeader>

                <ModalBody>
                    <Form onSubmit={handleSubmit}>
                        {/* Loading overlay */}
                        {isSubmitting && (
                            <LoadingOverlay>
                                <LoadingSpinner />
                                <LoadingText>Przesyłanie dokumentu...</LoadingText>
                            </LoadingOverlay>
                        )}

                        <FormGroup>
                            <Label htmlFor="name">Nazwa dokumentu*</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Nazwa dokumentu"
                                required
                                disabled={isSubmitting}
                                style={{
                                    borderColor: formErrors.name ? brandTheme.status.error : undefined,
                                    boxShadow: formErrors.name ? `0 0 0 3px ${brandTheme.status.errorLight}` : undefined
                                }}
                            />
                            {formErrors.name && <ErrorText>{formErrors.name}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="type">Typ dokumentu*</Label>
                            <Select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                            >
                                {documentTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="description">Opis (opcjonalnie)</Label>
                            <DescriptionTextarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Dodatkowy opis dokumentu..."
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </FormGroup>

                        {/* 🔧 FIX: Poprawiona sekcja wyboru pliku */}
                        <FormGroup>
                            <Label htmlFor="fileUpload">Plik*</Label>

                            {!selectedFile ? (
                                <FileUploadArea>
                                    <FileUploadButton>
                                        <FaFileUpload />
                                        Wybierz plik
                                        <FileInput
                                            ref={fileInputRef}
                                            id="fileUpload"
                                            type="file"
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                            disabled={isSubmitting}
                                        />
                                    </FileUploadButton>
                                    <FileUploadText>
                                        Przeciągnij plik tutaj lub kliknij aby wybrać
                                    </FileUploadText>
                                </FileUploadArea>
                            ) : (
                                <SelectedFileInfo>
                                    <FileDetails>
                                        <FileIcon>
                                            <FaFile />
                                        </FileIcon>
                                        <FileInfo>
                                            <FileName>{selectedFile.name}</FileName>
                                            <FileSize>{formatFileSize(selectedFile.size)}</FileSize>
                                        </FileInfo>
                                    </FileDetails>
                                    <RemoveFileButton
                                        type="button"
                                        onClick={handleRemoveFile}
                                        disabled={isSubmitting}
                                        title="Usuń plik"
                                    >
                                        <FaTimes />
                                    </RemoveFileButton>
                                </SelectedFileInfo>
                            )}

                            <HelpText>
                                Obsługiwane formaty: PDF, DOC, DOCX, JPG, PNG, TXT (maks. 10MB)
                            </HelpText>
                            {formErrors.file && <ErrorText>{formErrors.file}</ErrorText>}
                        </FormGroup>

                        {/* Błąd ogólny */}
                        {formErrors.submit && (
                            <ErrorContainer>
                                <ErrorText>{formErrors.submit}</ErrorText>
                            </ErrorContainer>
                        )}

                        <ButtonGroup>
                            <Button
                                type="button"
                                secondary
                                onClick={onCancel}
                                disabled={isSubmitting}
                            >
                                Anuluj
                            </Button>
                            <Button
                                type="submit"
                                primary
                                disabled={isSubmitting || !selectedFile}
                            >
                                {isSubmitting ? 'Przesyłanie...' : 'Dodaj dokument'}
                            </Button>
                        </ButtonGroup>
                    </Form>
                </ModalBody>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
const LoadingOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
`;

const LoadingSpinner = styled.div`
    width: 24px;
    height: 24px;
    border: 2px solid ${brandTheme.status.success}30;
    border-top: 2px solid ${brandTheme.status.success};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: ${brandTheme.spacing.md};

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const DescriptionTextarea = styled.textarea`
    width: 100%;
    min-height: 80px;
    padding: ${brandTheme.spacing.md};
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    resize: vertical;
    transition: all 0.2s ease;
    font-family: inherit;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }

    &:disabled {
        background: ${brandTheme.surfaceAlt};
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const FileUploadArea = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.lg};
    border: 2px dashed rgba(0, 0, 0, 0.2);
    border-radius: ${brandTheme.radius.lg};
    background: ${brandTheme.surfaceAlt};
    transition: all 0.2s ease;

    &:hover {
        border-color: ${brandTheme.primary};
        background: ${brandTheme.primaryGhost};
    }
`;

const FileUploadText = styled.div`
    font-size: 13px;
    color: ${brandTheme.text.muted};
    text-align: center;
`;

const SelectedFileInfo = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.status.successLight};
    border: 1px solid ${brandTheme.status.success}30;
    border-radius: ${brandTheme.radius.md};
`;

const FileDetails = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    flex: 1;
`;

const FileIcon = styled.div`
    width: 40px;
    height: 40px;
    background: ${brandTheme.status.success}20;
    color: ${brandTheme.status.success};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
`;

const FileInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const FileName = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin-bottom: 2px;
    word-break: break-word;
`;

const FileSize = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
`;

const RemoveFileButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    border-radius: ${brandTheme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 12px;

    &:hover:not(:disabled) {
        background: ${brandTheme.status.error};
        color: white;
        transform: scale(1.1);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const ErrorContainer = styled.div`
    background: ${brandTheme.status.errorLight};
    border: 1px solid ${brandTheme.status.error}30;
    border-radius: ${brandTheme.radius.md};
    padding: ${brandTheme.spacing.md};
    margin: ${brandTheme.spacing.md} 0;
`;

export default DocumentFormModal;