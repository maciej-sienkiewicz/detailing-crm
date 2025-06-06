import React, { useState } from 'react';
import styled from 'styled-components';
import { FaUser, FaBuilding, FaStickyNote, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { ClientExpanded } from '../../../types';
import { ClientData, clientApi } from '../../../api/clientsApi';
import Modal from '../../../components/common/Modal';

// Brand Theme System - Automotive Premium
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    accent: '#f8fafc',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
};

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

        if (!formData.firstName?.trim()) {
            newErrors.firstName = 'Imię jest wymagane';
        }

        if (!formData.lastName?.trim()) {
            newErrors.lastName = 'Nazwisko jest wymagane';
        }

        if (!formData.email?.trim() && !formData.phone?.trim()) {
            newErrors.email = 'Podaj adres email lub numer telefonu';
            newErrors.phone = 'Podaj adres email lub numer telefonu';
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
                savedClient = await clientApi.updateClient(client.id, formData);
            } else {
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
            title={client ? 'Edycja klienta' : 'Nowy klient'}
        >
            <FormContainer>
                {error && (
                    <ErrorContainer>
                        <ErrorIcon>⚠️</ErrorIcon>
                        <ErrorText>{error}</ErrorText>
                    </ErrorContainer>
                )}

                <Form onSubmit={handleSubmit}>
                    {/* Personal Information Section */}
                    <FormSection>
                        <SectionHeader>
                            <SectionIcon>
                                <FaUser />
                            </SectionIcon>
                            <SectionTitle>Dane osobowe</SectionTitle>
                        </SectionHeader>

                        <FormRow>
                            <FormGroup>
                                <FormLabel htmlFor="firstName" $required>
                                    Imię
                                </FormLabel>
                                <FormInput
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName || ''}
                                    onChange={handleChange}
                                    placeholder="Wprowadź imię"
                                    $hasError={!!errors.firstName}
                                    $hasValue={!!formData.email}
                                />
                                {errors.email && (
                                    <ErrorMessage>{errors.email}</ErrorMessage>
                                )}
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="phone">
                                    Numer telefonu
                                </FormLabel>
                                <FormInput
                                    id="phone"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    placeholder="+48 123 456 789"
                                    $hasError={!!errors.phone}
                                    $hasValue={!!formData.phone}
                                />
                                {errors.phone && (
                                    <ErrorMessage>{errors.phone}</ErrorMessage>
                                )}
                            </FormGroup>
                        </FormRow>

                        <FormGroup>
                            <FormLabel htmlFor="address">
                                Adres
                            </FormLabel>
                            <FormInput
                                id="address"
                                name="address"
                                value={formData.address || ''}
                                onChange={handleChange}
                                placeholder="Ulica, numer, kod pocztowy, miasto"
                                $hasValue={!!formData.address}
                            />
                        </FormGroup>
                    </FormSection>

                    {/* Company Information Section */}
                    <FormSection>
                        <SectionHeader>
                            <SectionIcon>
                                <FaBuilding />
                            </SectionIcon>
                            <SectionTitle>Dane firmowe</SectionTitle>
                            <SectionSubtitle>Opcjonalne - wypełnij jeśli klient prowadzi działalność</SectionSubtitle>
                        </SectionHeader>

                        <FormRow>
                            <FormGroup>
                                <FormLabel htmlFor="company">
                                    Nazwa firmy
                                </FormLabel>
                                <FormInput
                                    id="company"
                                    name="company"
                                    value={formData.company || ''}
                                    onChange={handleChange}
                                    placeholder="Nazwa firmy lub działalności"
                                    $hasValue={!!formData.company}
                                />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="taxId">
                                    NIP
                                </FormLabel>
                                <FormInput
                                    id="taxId"
                                    name="taxId"
                                    value={formData.taxId || ''}
                                    onChange={handleChange}
                                    placeholder="0000000000"
                                    $hasValue={!!formData.taxId}
                                />
                            </FormGroup>
                        </FormRow>
                    </FormSection>

                    {/* Notes Section */}
                    <FormSection>
                        <SectionHeader>
                            <SectionIcon>
                                <FaStickyNote />
                            </SectionIcon>
                            <SectionTitle>Notatki</SectionTitle>
                            <SectionSubtitle>Dodatkowe informacje o kliencie</SectionSubtitle>
                        </SectionHeader>

                        <FormGroup>
                            <FormLabel htmlFor="notes">
                                Uwagi i notatki
                            </FormLabel>
                            <FormTextarea
                                id="notes"
                                name="notes"
                                value={formData.notes || ''}
                                onChange={handleChange}
                                placeholder="Preferencje klienta, historia współpracy, specjalne uwagi..."
                                rows={4}
                                $hasValue={!!formData.notes}
                            />
                        </FormGroup>
                    </FormSection>

                    {/* Statistics Section - Only for existing clients */}
                    {client && (
                        <FormSection>
                            <SectionHeader>
                                <SectionIcon $color={brandTheme.success}>
                                    <FaCheck />
                                </SectionIcon>
                                <SectionTitle>Statystyki CRM</SectionTitle>
                                <SectionSubtitle>Dane aktualizowane automatycznie przez system</SectionSubtitle>
                            </SectionHeader>

                            <StatsGrid>
                                <StatCard>
                                    <StatValue>{client.totalVisits}</StatValue>
                                    <StatLabel>Liczba wizyt</StatLabel>
                                </StatCard>

                                <StatCard>
                                    <StatValue>{client.abandonedSales}</StatValue>
                                    <StatLabel>Porzucone szanse</StatLabel>
                                </StatCard>

                                <StatCard>
                                    <StatValue>{client.totalRevenue?.toFixed(2)} PLN</StatValue>
                                    <StatLabel>Suma przychodów</StatLabel>
                                </StatCard>

                                <StatCard>
                                    <StatValue>{client.contactAttempts}</StatValue>
                                    <StatLabel>Próby kontaktu</StatLabel>
                                </StatCard>
                            </StatsGrid>
                        </FormSection>
                    )}

                    {/* Form Actions */}
                    <FormActions>
                        <SecondaryButton type="button" onClick={onCancel}>
                            <FaTimes />
                            Anuluj
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <FaSpinner className="spinning" />
                                    Zapisywanie...
                                </>
                            ) : (
                                <>
                                    <FaCheck />
                                    {client ? 'Zapisz zmiany' : 'Dodaj klienta'}
                                </>
                            )}
                        </PrimaryButton>
                    </FormActions>
                </Form>
            </FormContainer>
        </Modal>
    );
};

// Modern Styled Components - Premium Automotive Design
const FormContainer = styled.div`
    padding: 0 16px;
    max-height: 80vh;
    overflow-y: auto;
`;

const ErrorContainer = styled.div`
    background: linear-gradient(135deg, #fef2f2 0%, #fdf2f8 100%);
    border: 1px solid #fecaca;
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);
`;

const ErrorIcon = styled.div`
    font-size: 18px;
`;

const ErrorText = styled.div`
    color: #dc2626;
    font-weight: 500;
    font-size: 14px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const FormSection = styled.section`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid ${brandTheme.border};
`;

const SectionIcon = styled.div<{ $color?: string }>`
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, ${props => props.$color || brandTheme.primary} 0%, ${props => props.$color ? `${props.$color}CC` : brandTheme.primaryLight} 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    box-shadow: 0 2px 8px ${props => props.$color ? `${props.$color}40` : brandTheme.primaryGhost};
`;

const SectionTitle = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    flex: 1;
`;

const SectionSubtitle = styled.div`
    font-size: 13px;
    color: ${brandTheme.neutral};
    font-style: italic;
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
    gap: 8px;
`;

const FormLabel = styled.label<{ $required?: boolean }>`
    font-weight: 600;
    font-size: 14px;
    color: #374151;

    ${props => props.$required && `
        &::after {
            content: ' *';
            color: ${brandTheme.error};
            font-weight: 700;
        }
    `}
`;

const FormInput = styled.input<{
    $hasError?: boolean;
    $hasValue?: boolean;
}>`
    height: 44px;
    padding: 0 16px;
    border: 2px solid ${props =>
            props.$hasError ? brandTheme.error :
                    props.$hasValue ? brandTheme.primary :
                            brandTheme.border
    };
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    background: ${props => props.$hasValue ? brandTheme.primaryGhost : brandTheme.surface};
    color: #374151;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
        background: ${brandTheme.surface};
    }

    &::placeholder {
        color: ${brandTheme.neutral};
        font-weight: 400;
    }

    ${props => props.$hasError && `
        &:focus {
            border-color: ${brandTheme.error};
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
    `}
`;

const FormTextarea = styled.textarea<{ $hasValue?: boolean }>`
    padding: 12px 16px;
    border: 2px solid ${props => props.$hasValue ? brandTheme.primary : brandTheme.border};
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    font-weight: 500;
    background: ${props => props.$hasValue ? brandTheme.primaryGhost : brandTheme.surface};
    color: #374151;
    resize: vertical;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
        background: ${brandTheme.surface};
    }

    &::placeholder {
        color: ${brandTheme.neutral};
        font-weight: 400;
    }
`;

const ErrorMessage = styled.div`
    color: ${brandTheme.error};
    font-size: 12px;
    font-weight: 500;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;

    &::before {
        content: '⚠';
        font-size: 10px;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
`;

const StatCard = styled.div`
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.border};
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary};
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
`;

const StatValue = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.primary};
    margin-bottom: 4px;
`;

const StatLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.neutral};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid ${brandTheme.border};
    margin-top: 20px;
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: ${brandTheme.surfaceAlt};
    color: ${brandTheme.neutral};
    border: 2px solid ${brandTheme.border};
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.border};
        color: #374151;
        transform: translateY(-1px);
    }
`;

const PrimaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: ${brandTheme.primary};
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover:not(:disabled) {
        background: ${brandTheme.primaryDark};
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:disabled {
        background: ${brandTheme.neutral};
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

export default ClientFormModal;