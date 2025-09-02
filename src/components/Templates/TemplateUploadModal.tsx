// src/components/Templates/TemplateUploadModal.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCloudUploadAlt, FaSpinner, FaTimes } from 'react-icons/fa';
import Modal from '../common/Modal';
import { TemplateType, TemplateUploadData } from '../../types/template';
import { settingsTheme } from '../../pages/Settings/styles/theme';

interface TemplateUploadModalProps {
    templateTypes: TemplateType[];
    onUpload: (data: TemplateUploadData) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export const TemplateUploadModal: React.FC<TemplateUploadModalProps> = ({
                                                                            templateTypes,
                                                                            onUpload,
                                                                            onCancel,
                                                                            isLoading
                                                                        }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        isActive: true
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nazwa szablonu jest wymagana';
        }

        if (!formData.type) {
            newErrors.type = 'Typ dokumentu jest wymagany';
        }

        if (!selectedFile) {
            newErrors.file = 'Plik szablonu jest wymagany';
        } else {
            const selectedTemplateType = templateTypes.find(t => t.type === formData.type);
            if (selectedTemplateType) {
                const requiredContentType = getRequiredContentType(selectedTemplateType.type);
                if (requiredContentType && selectedFile.type !== requiredContentType) {
                    const expectedFormat = requiredContentType === 'application/pdf' ? 'PDF' : 'HTML';
                    newErrors.file = `Dla tego typu dokumentu wymagany jest format ${expectedFormat}`;
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getRequiredContentType = (type: string): string | null => {
        switch (type) {
            case 'SERVICE_AGREEMENT':
            case 'MARKETING_CONSENT':
            case 'VEHICLE_PICKUP':
                return 'application/pdf';
            case 'MAIL_ON_VISIT_STARTED':
            case 'MAIL_ON_VISIT_COMPLETED':
            case 'INVOICE':
                return 'text/html';
            default:
                return null;
        }
    };

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        setErrors(prev => ({ ...prev, file: '' }));

        if (!formData.name) {
            const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
            setFormData(prev => ({ ...prev, name: nameWithoutExtension }));
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            handleFileSelect(files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !selectedFile) {
            return;
        }

        const uploadData: TemplateUploadData = {
            file: selectedFile,
            name: formData.name.trim(),
            type: formData.type,
            isActive: formData.isActive
        };

        try {
            await onUpload(uploadData);
        } catch (error) {
        }
    };

    const getAcceptedFormats = () => {
        if (!formData.type) return '';

        const requiredContentType = getRequiredContentType(formData.type);
        switch (requiredContentType) {
            case 'application/pdf':
                return '.pdf';
            case 'text/html':
                return '.html,.htm';
            default:
                return '.pdf,.html,.htm';
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title="Dodaj nowy szablon"
            size="lg"
        >
            <Form onSubmit={handleSubmit}>
                <FormGrid>
                    <FormGroup>
                        <Label>
                            Nazwa szablonu *
                        </Label>
                        <Input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Wprowadź nazwę szablonu"
                            $hasError={!!errors.name}
                        />
                        {errors.name && <ErrorText>{errors.name}</ErrorText>}
                    </FormGroup>

                    <FormGroup>
                        <Label>
                            Typ dokumentu *
                        </Label>
                        <Select
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                            $hasError={!!errors.type}
                        >
                            <option value="">Wybierz typ dokumentu</option>
                            {templateTypes.map(type => (
                                <option key={type.type} value={type.type}>
                                    {type.displayName || type.type}
                                </option>
                            ))}
                        </Select>
                        {errors.type && <ErrorText>{errors.type}</ErrorText>}
                    </FormGroup>
                </FormGrid>

                <FormGroup>
                    <Label>
                        Plik szablonu *
                    </Label>
                    <UploadArea
                        $dragActive={dragActive}
                        $hasError={!!errors.file}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept={getAcceptedFormats()}
                            onChange={handleFileInputChange}
                            style={{ display: 'none' }}
                            id="file-upload"
                        />

                        {selectedFile ? (
                            <FilePreview>
                                <FileIcon>📄</FileIcon>
                                <FileInfo>
                                    <FileName>{selectedFile.name}</FileName>
                                    <FileSize>{(selectedFile.size / 1024).toFixed(1)} KB</FileSize>
                                </FileInfo>
                                <RemoveFileButton
                                    type="button"
                                    onClick={() => setSelectedFile(null)}
                                >
                                    <FaTimes />
                                </RemoveFileButton>
                            </FilePreview>
                        ) : (
                            <UploadContent>
                                <UploadIcon>
                                    <FaCloudUploadAlt />
                                </UploadIcon>
                                <UploadText>
                                    <strong>Kliknij aby wybrać plik</strong> lub przeciągnij tutaj
                                </UploadText>
                                <UploadHint>
                                    {formData.type ? (
                                        `Obsługiwane formaty: ${getRequiredContentType(formData.type) === 'application/pdf' ? 'PDF' : 'HTML'}`
                                    ) : (
                                        'Obsługiwane formaty: PDF, HTML'
                                    )}
                                </UploadHint>
                                <UploadButton
                                    type="button"
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    Wybierz plik
                                </UploadButton>
                            </UploadContent>
                        )}
                    </UploadArea>
                    {errors.file && <ErrorText>{errors.file}</ErrorText>}
                </FormGroup>

                <CheckboxGroup>
                    <CheckboxLabel>
                        <Checkbox
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        />
                        <span>Aktywuj szablon po przesłaniu</span>
                    </CheckboxLabel>
                </CheckboxGroup>

                <ButtonGroup>
                    <SecondaryButton type="button" onClick={onCancel} disabled={isLoading}>
                        Anuluj
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <FaSpinner className="spinning" />
                                Przesyłanie...
                            </>
                        ) : (
                            <>
                                <FaCloudUploadAlt />
                                Prześlij szablon
                            </>
                        )}
                    </PrimaryButton>
                </ButtonGroup>
            </Form>
        </Modal>
    );
};

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
    padding: ${settingsTheme.spacing.lg};
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${settingsTheme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.xs};
`;

const Label = styled.label`
    font-weight: 600;
    font-size: 14px;
    color: ${settingsTheme.text.primary};
`;

const Input = styled.input<{ $hasError?: boolean }>`
    height: 44px;
    padding: 0 ${settingsTheme.spacing.md};
    border: 2px solid ${props => props.$hasError ? settingsTheme.status.error : settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? settingsTheme.status.error : settingsTheme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? settingsTheme.status.error + '20' : settingsTheme.primaryGhost};
    }

    &::placeholder {
        color: ${settingsTheme.text.muted};
        font-weight: 400;
    }
`;

const Select = styled.select<{ $hasError?: boolean }>`
    height: 44px;
    padding: 0 ${settingsTheme.spacing.md};
    border: 2px solid ${props => props.$hasError ? settingsTheme.status.error : settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.primary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? settingsTheme.status.error : settingsTheme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? settingsTheme.status.error + '20' : settingsTheme.primaryGhost};
    }
`;

const TextArea = styled.textarea`
    min-height: 80px;
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.primary};
    font-family: inherit;
    resize: vertical;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${settingsTheme.primary};
        box-shadow: 0 0 0 3px ${settingsTheme.primaryGhost};
    }

    &::placeholder {
        color: ${settingsTheme.text.muted};
        font-weight: 400;
    }
`;

const UploadArea = styled.div<{ $dragActive: boolean; $hasError: boolean }>`
    border: 2px dashed ${props =>
            props.$hasError ? settingsTheme.status.error :
                    props.$dragActive ? settingsTheme.primary : settingsTheme.border
    };
    border-radius: ${settingsTheme.radius.lg};
    padding: ${settingsTheme.spacing.xl};
    background: ${props => props.$dragActive ? settingsTheme.primaryGhost : settingsTheme.surfaceAlt};
    transition: all 0.2s ease;
    cursor: pointer;
`;

const UploadContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    text-align: center;
`;

const UploadIcon = styled.div`
    font-size: 48px;
    color: ${settingsTheme.primary};
    margin-bottom: ${settingsTheme.spacing.sm};
`;

const UploadText = styled.div`
    font-size: 16px;
    color: ${settingsTheme.text.primary};

    strong {
        font-weight: 600;
    }
`;

const UploadHint = styled.div`
    font-size: 14px;
    color: ${settingsTheme.text.secondary};
`;

const UploadButton = styled.button`
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.lg};
    background: ${settingsTheme.primary};
    color: white;
    border: none;
    border-radius: ${settingsTheme.radius.md};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${settingsTheme.primaryDark};
        transform: translateY(-1px);
    }
`;

const FilePreview = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    padding: ${settingsTheme.spacing.md};
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.md};
    border: 1px solid ${settingsTheme.border};
`;

const FileIcon = styled.div`
    font-size: 32px;
    flex-shrink: 0;
`;

const FileInfo = styled.div`
    flex: 1;
`;

const FileName = styled.div`
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    margin-bottom: ${settingsTheme.spacing.xs};
`;

const FileSize = styled.div`
    font-size: 12px;
    color: ${settingsTheme.text.secondary};
`;

const RemoveFileButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${settingsTheme.status.errorLight};
    color: ${settingsTheme.status.error};
    border: none;
    border-radius: ${settingsTheme.radius.sm};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${settingsTheme.status.error};
        color: white;
    }
`;

const CheckboxGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
`;

const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    font-size: 14px;
    font-weight: 500;
    color: ${settingsTheme.text.primary};
    cursor: pointer;
`;

const Checkbox = styled.input`
    width: 18px;
    height: 18px;
    accent-color: ${settingsTheme.primary};
    cursor: pointer;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${settingsTheme.spacing.sm};
    margin-top: ${settingsTheme.spacing.md};
    padding-top: ${settingsTheme.spacing.lg};
    border-top: 1px solid ${settingsTheme.border};

    @media (max-width: 576px) {
        flex-direction: column-reverse;
    }
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.lg};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @media (max-width: 576px) {
        justify-content: center;
    }
`;

const PrimaryButton = styled(BaseButton)`
    background: linear-gradient(135deg, ${settingsTheme.primary} 0%, ${settingsTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${settingsTheme.shadow.sm};

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${settingsTheme.primaryDark} 0%, ${settingsTheme.primary} 100%);
        box-shadow: ${settingsTheme.shadow.md};
    }
`;

const SecondaryButton = styled(BaseButton)`
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.secondary};
    border-color: ${settingsTheme.border};
    box-shadow: ${settingsTheme.shadow.xs};

    &:hover:not(:disabled) {
        background: ${settingsTheme.surfaceHover};
        color: ${settingsTheme.text.primary};
        border-color: ${settingsTheme.borderHover};
        box-shadow: ${settingsTheme.shadow.sm};
    }
`;

const ErrorText = styled.div`
    color: ${settingsTheme.status.error};
    font-size: 12px;
    font-weight: 500;
    margin-top: ${settingsTheme.spacing.xs};
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};

    &::before {
        content: '⚠';
        font-size: 14px;
    }
`;