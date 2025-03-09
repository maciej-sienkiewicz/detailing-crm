import React, { useState } from 'react';
import styled from 'styled-components';
import { ClientExpanded, ContactAttempt } from '../../../types/client';
import { addContactAttempt } from '../../../api/mocks/clientMocks';
import Modal from '../../../components/common/Modal';

interface ContactAttemptModalProps {
    client: ClientExpanded;
    onSave: () => void;
    onCancel: () => void;
}

const ContactAttemptModal: React.FC<ContactAttemptModalProps> = ({
                                                                     client,
                                                                     onSave,
                                                                     onCancel
                                                                 }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const today = new Date().toISOString().split('T')[0];

    // Contact attempt form data
    const [formData, setFormData] = useState<Omit<ContactAttempt, 'id'>>({
        clientId: client.id,
        date: today,
        type: 'PHONE',
        description: '',
        result: 'SUCCESS'
    });

    // Form validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when field is edited
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.date) {
            newErrors.date = 'Data jest wymagana';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Opis jest wymagany';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await addContactAttempt(formData);
            onSave();
        } catch (err) {
            setError('Nie udało się zapisać próby kontaktu. Spróbuj ponownie.');
            console.error('Error saving contact attempt:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title="Nowa próba kontaktu"
        >
            <FormContainer>
                <ClientInfo>
                    <ClientName>{client.firstName} {client.lastName}</ClientName>
                    <ClientContact>{client.phone} | {client.email}</ClientContact>
                </ClientInfo>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                <Form onSubmit={handleSubmit}>
                    <FormRow>
                        <FormGroup>
                            <Label htmlFor="date">Data kontaktu*</Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleChange}
                                max={today}
                                required
                            />
                            {errors.date && <ErrorText>{errors.date}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="type">Typ kontaktu*</Label>
                            <Select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                            >
                                <option value="PHONE">Telefon</option>
                                <option value="EMAIL">Email</option>
                                <option value="SMS">SMS</option>
                                <option value="OTHER">Inny</option>
                            </Select>
                        </FormGroup>
                    </FormRow>

                    <FormGroup>
                        <Label htmlFor="description">Opis kontaktu*</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Opisz cel i przebieg kontaktu..."
                            rows={4}
                            required
                        />
                        {errors.description && <ErrorText>{errors.description}</ErrorText>}
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="result">Rezultat kontaktu*</Label>
                        <Select
                            id="result"
                            name="result"
                            value={formData.result}
                            onChange={handleChange}
                            required
                        >
                            <option value="SUCCESS">Skuteczny</option>
                            <option value="NO_ANSWER">Brak odpowiedzi</option>
                            <option value="CALLBACK_REQUESTED">Prośba o kontakt później</option>
                            <option value="REJECTED">Odmowa</option>
                        </Select>
                    </FormGroup>

                    <ButtonGroup>
                        <CancelButton type="button" onClick={onCancel}>
                            Anuluj
                        </CancelButton>
                        <SaveButton type="submit" disabled={loading}>
                            {loading ? 'Zapisywanie...' : 'Zapisz kontakt'}
                        </SaveButton>
                    </ButtonGroup>
                </Form>
            </FormContainer>
        </Modal>
    );
};

// Styled components
const FormContainer = styled.div`
    padding: 0 16px;
`;

const ClientInfo = styled.div`
    padding: 12px 16px;
    background-color: #f9f9f9;
    border-radius: 4px;
    margin-bottom: 16px;
`;

const ClientName = styled.div`
    font-weight: 600;
    font-size: 16px;
    color: #34495e;
    margin-bottom: 4px;
`;

const ClientContact = styled.div`
    font-size: 14px;
    color: #7f8c8d;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const FormRow = styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 4px;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 16px;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const Label = styled.label`
    font-weight: 500;
    font-size: 14px;
    color: #333;
    margin-bottom: 6px;
`;

const Input = styled.input`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const Select = styled.select`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const Textarea = styled.textarea`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 10px;
`;

const Button = styled.button`
    padding: 10px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const CancelButton = styled(Button)`
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    
    &:hover:not(:disabled) {
        background-color: #e9e9e9;
    }
`;

const SaveButton = styled(Button)`
    background-color: #3498db;
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
        background-color: #2980b9;
    }
`;

const ErrorMessage = styled.div`
    background-color: #fdecea;
    color: #e74c3c;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 14px;
`;

const ErrorText = styled.div`
    color: #e74c3c;
    font-size: 12px;
    margin-top: 4px;
`;

export default ContactAttemptModal;