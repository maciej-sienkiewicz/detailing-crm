import React, { useState } from 'react';
import { FaFileUpload } from 'react-icons/fa';
import { EmployeeDocument } from '../../../types';
import { documentTypes } from '../../../api/mocks/employeeDocumentsMocks';
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

interface DocumentFormModalProps {
    employeeId: string;
    onSave: (document: Omit<EmployeeDocument, 'id'>) => void;
    onCancel: () => void;
}

export const DocumentFormModal: React.FC<DocumentFormModalProps> = ({
                                                                        employeeId,
                                                                        onSave,
                                                                        onCancel
                                                                    }) => {
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState<Omit<EmployeeDocument, 'id'>>({
        employeeId,
        name: '',
        type: documentTypes[0],
        uploadDate: today
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Usuwanie błędów przy edycji pola
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Walidacja
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) {
            errors.name = 'Nazwa dokumentu jest wymagana';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        onSave(formData);
    };

    return (
        <ModalOverlay>
            <ModalContainer style={{ width: '500px' }}>
                <ModalHeader>
                    <h2>Dodaj nowy dokument</h2>
                    <CloseButton onClick={onCancel}>&times;</CloseButton>
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label htmlFor="name">Nazwa dokumentu*</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Nazwa dokumentu"
                                required
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
                            >
                                {documentTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="uploadDate">Data dodania*</Label>
                            <Input
                                id="uploadDate"
                                name="uploadDate"
                                type="date"
                                value={formData.uploadDate}
                                onChange={handleChange}
                                max={today}
                                required
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="fileUpload">Plik</Label>
                            <FileUploadButton>
                                <FaFileUpload /> Wybierz plik
                                <FileInput
                                    id="fileUpload"
                                    type="file"
                                    onChange={() => {}} // W pełnej implementacji tu byłoby uploadowanie pliku
                                />
                            </FileUploadButton>
                            <HelpText>Obsługiwane formaty: PDF, DOC, DOCX, JPG (maks. 10MB)</HelpText>
                        </FormGroup>

                        <ButtonGroup>
                            <Button type="button" secondary onClick={onCancel}>
                                Anuluj
                            </Button>
                            <Button type="submit" primary>
                                Dodaj dokument
                            </Button>
                        </ButtonGroup>
                    </Form>
                </ModalBody>
            </ModalContainer>
        </ModalOverlay>
    );
};