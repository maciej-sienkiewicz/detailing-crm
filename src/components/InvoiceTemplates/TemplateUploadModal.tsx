import React, {useState} from 'react';
import {FaExclamationTriangle, FaSpinner, FaUpload} from 'react-icons/fa';
import {TemplateUploadData} from '../../types/invoiceTemplate';
import {
    Button,
    ButtonGroup,
    CloseButton,
    ErrorText,
    Form,
    FormGroup,
    Input,
    Label,
    ModalBody,
    ModalContainer,
    ModalHeader,
    ModalOverlay
} from '../../pages/Settings/styles/ModalStyles';
import {
    FileInput,
    FileUploadArea,
    FileUploadContent,
    FileUploadHint,
    FileUploadText
} from './TemplateUploadModal.styles';

interface TemplateUploadModalProps {
    onUpload: (data: TemplateUploadData) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export const TemplateUploadModal: React.FC<TemplateUploadModalProps> = ({
                                                                            onUpload,
                                                                            onCancel,
                                                                            isLoading
                                                                        }) => {
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/html' && !selectedFile.name.endsWith('.html')) {
                setError('Plik musi mieć rozszerzenie .html');
                return;
            }
            if (selectedFile.size > 1024 * 1024) {
                setError('Plik nie może być większy niż 1MB');
                return;
            }
            setFile(selectedFile);
            setError(null);
            if (!name) {
                setName(selectedFile.name.replace('.html', ''));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !name.trim()) {
            setError('Wybierz plik i podaj nazwę szablonu');
            return;
        }

        try {
            await onUpload({
                file,
                name: name.trim(),
                description: description.trim() || undefined
            });
            onCancel();
        } catch (error) {
            // Error is handled by the hook
        }
    };

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <h2>Dodaj nowy szablon faktury</h2>
                    <CloseButton onClick={onCancel} disabled={isLoading}>×</CloseButton>
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label>Plik HTML szablonu *</Label>
                            <FileUploadArea>
                                <FileInput
                                    type="file"
                                    accept=".html,text/html"
                                    onChange={handleFileChange}
                                    disabled={isLoading}
                                />
                                <FileUploadContent>
                                    <FaUpload />
                                    <FileUploadText>
                                        {file ? file.name : 'Wybierz plik HTML lub przeciągnij tutaj'}
                                    </FileUploadText>
                                    <FileUploadHint>
                                        Maksymalny rozmiar: 1MB, format: HTML z wbudowanym CSS
                                    </FileUploadHint>
                                </FileUploadContent>
                            </FileUploadArea>
                        </FormGroup>

                        <FormGroup>
                            <Label>Nazwa szablonu *</Label>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="np. Profesjonalny szablon firmowy"
                                required
                                disabled={isLoading}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Opis szablonu</Label>
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Opcjonalny opis szablonu..."
                                disabled={isLoading}
                            />
                        </FormGroup>

                        {error && (
                            <ErrorText>
                                <FaExclamationTriangle />
                                {error}
                            </ErrorText>
                        )}

                        <ButtonGroup>
                            <Button type="button" secondary onClick={onCancel} disabled={isLoading}>
                                Anuluj
                            </Button>
                            <Button type="submit" primary disabled={!file || !name.trim() || isLoading}>
                                {isLoading ? (
                                    <>
                                        <FaSpinner className="spinning" />
                                        Przesyłanie...
                                    </>
                                ) : (
                                    <>
                                        <FaUpload />
                                        Dodaj szablon
                                    </>
                                )}
                            </Button>
                        </ButtonGroup>
                    </Form>
                </ModalBody>
            </ModalContainer>
        </ModalOverlay>
    );
};