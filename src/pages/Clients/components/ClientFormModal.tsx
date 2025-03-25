import React, { useState } from 'react';
import styled from 'styled-components';
import { ClientExpanded } from '../../../types';
import { ClientData, clientApi } from '../../../api/clientsApi';
import Modal from '../../../components/common/Modal';

interface ClientFormModalProps {
    client: ClientExpanded | null;
    onSave: (client: ClientExpanded) => void;
    onCancel: () => void;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({ client, onSave, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<ClientData>(
        client ? {
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            phone: client.phone,
            address: client.address,
            company: client.company,
            taxId: client.taxId,
            notes: client.notes
        } : {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            company: '',
            taxId: '',
            notes: ''
        }
    );

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        // Czyszczenie błędu po edycji pola
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName?.trim()) {
            newErrors.firstName = 'Imię jest wymagane';
        }

        if (!formData.lastName?.trim()) {
            newErrors.lastName = 'Nazwisko jest wymagane';
        }

        if (!formData.email?.trim() && !formData.phone?.trim()) {
            newErrors.email = 'Podaj adres email lub/i numer telefonu.';
        } else if (formData.email?.trim() && !/^[^@]+@[^@]+\.[^@]+$/.test(formData.email)) {
            newErrors.email = 'Podaj prawidłowy adres email';
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

            let savedClient: ClientExpanded;

            if (client && client.id) {
                // Aktualizacja istniejącego klienta
                savedClient = await clientApi.updateClient(client.id, formData);
            } else {
                // Utworzenie nowego klienta
                savedClient = await clientApi.createClient(formData);
            }

            onSave(savedClient);
        } catch (err) {
            setError('Nie udało się zapisać klienta. Spróbuj ponownie.');
            console.error('Error saving client:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title={client ? 'Edytuj klienta' : 'Dodaj klienta'}
        >
            <FormContainer>
                {error && <ErrorMessage>{error}</ErrorMessage>}

                <Form onSubmit={handleSubmit}>
                    <FormSection>
                        <SectionTitle>Dane podstawowe</SectionTitle>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="firstName">Imię*</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName || ''}
                                    onChange={handleChange}
                                    placeholder="Imię"
                                    required
                                />
                                {errors.firstName && <ErrorText>{errors.firstName}</ErrorText>}
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="lastName">Nazwisko*</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName || ''}
                                    onChange={handleChange}
                                    placeholder="Nazwisko"
                                    required
                                />
                                {errors.lastName && <ErrorText>{errors.lastName}</ErrorText>}
                            </FormGroup>
                        </FormRow>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    placeholder="Email"
                                />
                                {errors.email && <ErrorText>{errors.email}</ErrorText>}
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="phone">Telefon</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    placeholder="Numer telefonu"
                                />
                                {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
                            </FormGroup>
                        </FormRow>

                        <FormGroup>
                            <Label htmlFor="address">Adres</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address || ''}
                                onChange={handleChange}
                                placeholder="Adres"
                            />
                        </FormGroup>
                    </FormSection>

                    <FormSection>
                        <SectionTitle>Dane firmowe</SectionTitle>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="company">Nazwa firmy</Label>
                                <Input
                                    id="company"
                                    name="company"
                                    value={formData.company || ''}
                                    onChange={handleChange}
                                    placeholder="Nazwa firmy (opcjonalnie)"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="taxId">NIP</Label>
                                <Input
                                    id="taxId"
                                    name="taxId"
                                    value={formData.taxId || ''}
                                    onChange={handleChange}
                                    placeholder="NIP (opcjonalnie)"
                                />
                            </FormGroup>
                        </FormRow>
                    </FormSection>

                    <FormSection>
                        <SectionTitle>Notatki</SectionTitle>

                        <FormGroup>
                            <Label htmlFor="notes">Uwagi</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                value={formData.notes || ''}
                                onChange={handleChange}
                                placeholder="Dodatkowe informacje o kliencie"
                                rows={4}
                            />
                        </FormGroup>
                    </FormSection>

                    {/* Sekcja statystyk tylko dla edycji istniejącego klienta */}
                    {client && (
                        <FormSection>
                            <SectionTitle>Statystyki CRM</SectionTitle>
                            <HelpText>Pola te są aktualizowane automatycznie przez system i nie można ich edytować ręcznie.</HelpText>

                            <FormRow>
                                <StatItem>
                                    <StatLabel>Liczba wizyt:</StatLabel>
                                    <StatValue>{client.totalVisits}</StatValue>
                                </StatItem>
                            </FormRow>

                            <FormRow>
                                <StatItem>
                                    <StatLabel>Porzucone szanse:</StatLabel>
                                    <StatValue>{client.abandonedSales}</StatValue>
                                </StatItem>

                                <StatItem>
                                    <StatLabel>Suma przychodów:</StatLabel>
                                    <StatValue>{client.totalRevenue?.toFixed(2)} zł</StatValue>
                                </StatItem>
                            </FormRow>

                            <StatItem>
                                <StatLabel>Próby kontaktu:</StatLabel>
                                <StatValue>{client.contactAttempts}</StatValue>
                            </StatItem>
                        </FormSection>
                    )}

                    <ButtonGroup>
                        <CancelButton type="button" onClick={onCancel}>
                            Anuluj
                        </CancelButton>
                        <SaveButton type="submit" disabled={loading}>
                            {loading ? 'Zapisywanie...' : (client ? 'Zapisz zmiany' : 'Dodaj klienta')}
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

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const FormSection = styled.section`
    margin-bottom: 10px;
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    color: #3498db;
    margin: 0 0 12px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
`;

const FormRow = styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 16px;

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

const HelpText = styled.p`
    font-size: 13px;
    color: #7f8c8d;
    margin: -5px 0 15px 0;
    font-style: italic;
`;

const StatItem = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background-color: #f9f9f9;
    border-radius: 4px;
    margin-bottom: 8px;
    flex: 1;
`;

const StatLabel = styled.div`
    font-weight: 500;
    font-size: 14px;
    color: #7f8c8d;
`;

const StatValue = styled.div`
    font-weight: 600;
    font-size: 14px;
    color: #34495e;
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

export default ClientFormModal;