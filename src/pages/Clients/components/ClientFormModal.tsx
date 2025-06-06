import React, { useState } from 'react';
import styled from 'styled-components';
import { FaUser, FaBuilding, FaStickyNote, FaCheck, FaTimes, FaSpinner, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa';
import { ClientExpanded } from '../../../types';
import { ClientData, clientApi } from '../../../api/clientsApi';
import Modal from '../../../components/common/Modal';

// Professional Brand Theme - Premium Automotive CRM
const brandTheme = {
    // Primary Colors - Professional Blue Palette
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',

    // Surface Colors - Clean & Minimal
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',

    // Typography Colors
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },

    // Border Colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',

    // Status Colors - Automotive Grade
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

    // Shadows - Professional Depth
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    // Spacing Scale
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    // Border Radius
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    }
};

interface ClientFormModalProps {
    client: ClientExpanded | null;
    onSave: (client: ClientExpanded) => void;
    onCancel: () => void;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({ client, onSave, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize form data with all required fields
    const [formData, setFormData] = useState<ClientData>(() => {
        if (client) {
            return {
                firstName: client.firstName || '',
                lastName: client.lastName || '',
                email: client.email || '',
                phone: client.phone || '',
                address: client.address || '',
                company: client.company || '',
                taxId: client.taxId || '',
                notes: client.notes || ''
            };
        } else {
            return {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                company: '',
                taxId: '',
                notes: ''
            };
        }
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Required fields validation
        if (!formData.firstName?.trim()) {
            newErrors.firstName = 'Imię jest wymagane';
        }

        if (!formData.lastName?.trim()) {
            newErrors.lastName = 'Nazwisko jest wymagane';
        }

        // At least email OR phone required
        if (!formData.email?.trim() && !formData.phone?.trim()) {
            newErrors.email = 'Podaj adres email lub numer telefonu';
            newErrors.phone = 'Podaj adres email lub numer telefonu';
        }

        // Email format validation
        if (formData.email?.trim() && !/^[^@]+@[^@]+\.[^@]+$/.test(formData.email)) {
            newErrors.email = 'Podaj prawidłowy adres email';
        }

        // Phone format validation (basic)
        if (formData.phone?.trim() && formData.phone.length < 9) {
            newErrors.phone = 'Numer telefonu jest za krótki';
        }

        // Tax ID validation (if company provided)
        if (formData.company?.trim() && formData.taxId?.trim()) {
            const taxIdClean = formData.taxId.replace(/[^0-9]/g, '');
            if (taxIdClean.length !== 10) {
                newErrors.taxId = 'NIP musi mieć 10 cyfr';
            }
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
                // Update existing client
                console.log('Updating client:', client.id, formData);
                savedClient = await clientApi.updateClient(client.id, formData);
            } else {
                // Create new client
                console.log('Creating new client:', formData);
                savedClient = await clientApi.createClient(formData);
            }

            console.log('Client saved successfully:', savedClient);
            onSave(savedClient);
        } catch (err) {
            console.error('Error saving client:', err);
            setError('Nie udało się zapisać klienta. Spróbuj ponownie.');
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
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Wprowadź imię"
                                    $hasError={!!errors.firstName}
                                    $hasValue={!!formData.firstName}
                                />
                                {errors.firstName && (
                                    <ErrorMessage>{errors.firstName}</ErrorMessage>
                                )}
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="lastName" $required>
                                    Nazwisko
                                </FormLabel>
                                <FormInput
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Wprowadź nazwisko"
                                    $hasError={!!errors.lastName}
                                    $hasValue={!!formData.lastName}
                                />
                                {errors.lastName && (
                                    <ErrorMessage>{errors.lastName}</ErrorMessage>
                                )}
                            </FormGroup>
                        </FormRow>

                        <FormRow>
                            <FormGroup>
                                <FormLabel htmlFor="email">
                                    <FaEnvelope style={{ marginRight: '8px', fontSize: '12px' }} />
                                    Adres email
                                </FormLabel>
                                <FormInput
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="nazwa@domena.pl"
                                    $hasError={!!errors.email}
                                    $hasValue={!!formData.email}
                                />
                                {errors.email && (
                                    <ErrorMessage>{errors.email}</ErrorMessage>
                                )}
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="phone">
                                    <FaPhone style={{ marginRight: '8px', fontSize: '12px' }} />
                                    Numer telefonu
                                </FormLabel>
                                <FormInput
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
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
                                <FaMapMarkerAlt style={{ marginRight: '8px', fontSize: '12px' }} />
                                Adres
                            </FormLabel>
                            <FormInput
                                id="address"
                                name="address"
                                value={formData.address}
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
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder="Nazwa firmy lub działalności"
                                    $hasValue={!!formData.company}
                                />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="taxId">
                                    <FaIdCard style={{ marginRight: '8px', fontSize: '12px' }} />
                                    NIP
                                </FormLabel>
                                <FormInput
                                    id="taxId"
                                    name="taxId"
                                    value={formData.taxId}
                                    onChange={handleChange}
                                    placeholder="0000000000"
                                    $hasError={!!errors.taxId}
                                    $hasValue={!!formData.taxId}
                                />
                                {errors.taxId && (
                                    <ErrorMessage>{errors.taxId}</ErrorMessage>
                                )}
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
                                value={formData.notes}
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
                                <SectionIcon $color={brandTheme.status.success}>
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
                                    <StatValue>{client.abandonedSales || 0}</StatValue>
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
                        <SecondaryButton type="button" onClick={onCancel} disabled={loading}>
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

// Professional Styled Components - Premium Automotive Design
const FormContainer = styled.div`
    padding: 0 ${brandTheme.spacing.md};
    max-height: 80vh;
    overflow-y: auto;

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

const ErrorContainer = styled.div`
    background: linear-gradient(135deg, ${brandTheme.status.errorLight} 0%, #fdf2f8 100%);
    border: 1px solid #fecaca;
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    margin-bottom: ${brandTheme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    box-shadow: ${brandTheme.shadow.sm};
`;

const ErrorIcon = styled.div`
    font-size: 18px;
`;

const ErrorText = styled.div`
    color: ${brandTheme.status.error};
    font-weight: 500;
    font-size: 14px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
`;

const FormSection = styled.section`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    box-shadow: ${brandTheme.shadow.xs};
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    margin-bottom: ${brandTheme.spacing.lg};
    padding-bottom: ${brandTheme.spacing.sm};
    border-bottom: 1px solid ${brandTheme.border};
`;

const SectionIcon = styled.div<{ $color?: string }>`
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, ${props => props.$color || brandTheme.primary} 0%, ${props => props.$color ? `${props.$color}CC` : brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    box-shadow: ${brandTheme.shadow.sm};
`;

const SectionTitle = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    flex: 1;
`;

const SectionSubtitle = styled.div`
    font-size: 13px;
    color: ${brandTheme.text.tertiary};
    font-style: italic;
`;

const FormRow = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.md};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${brandTheme.spacing.md};
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: ${brandTheme.spacing.sm};
`;

const FormLabel = styled.label<{ $required?: boolean }>`
    font-weight: 600;
    font-size: 14px;
    color: ${brandTheme.text.primary};
    display: flex;
    align-items: center;

    ${props => props.$required && `
        &::after {
            content: ' *';
            color: ${brandTheme.status.error};
            font-weight: 700;
        }
    `}
`;

const FormInput = styled.input<{
    $hasError?: boolean;
    $hasValue?: boolean;
}>`
    height: 48px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${props =>
            props.$hasError ? brandTheme.status.error :
                    props.$hasValue ? brandTheme.primary :
                            brandTheme.border
    };
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${props => props.$hasValue ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
        background: ${brandTheme.surface};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }

    ${props => props.$hasError && `
        &:focus {
            border-color: ${brandTheme.status.error};
            box-shadow: 0 0 0 3px ${brandTheme.status.errorLight};
        }
    `}
`;

const FormTextarea = styled.textarea<{ $hasValue?: boolean }>`
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasValue ? brandTheme.primary : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-family: inherit;
    font-weight: 500;
    background: ${props => props.$hasValue ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${brandTheme.text.primary};
    resize: vertical;
    transition: all 0.2s ease;
    min-height: 100px;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
        background: ${brandTheme.surface};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const ErrorMessage = styled.div`
    color: ${brandTheme.status.error};
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};

    &::before {
        content: '⚠';
        font-size: 10px;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: ${brandTheme.spacing.md};
`;

const StatCard = styled.div`
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.md};
    text-align: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary};
        transform: translateY(-2px);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const StatValue = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.primary};
    margin-bottom: ${brandTheme.spacing.xs};
`;

const StatLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.tertiary};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.sm};
    padding-top: ${brandTheme.spacing.lg};
    border-top: 1px solid ${brandTheme.border};
    margin-top: ${brandTheme.spacing.lg};
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 44px;
    border: 1px solid transparent;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const SecondaryButton = styled(BaseButton)`
    background: ${brandTheme.surfaceAlt};
    color: ${brandTheme.text.secondary};
    border-color: ${brandTheme.border};

    &:hover:not(:disabled) {
        background: ${brandTheme.borderLight};
        color: ${brandTheme.text.primary};
    }
`;

const PrimaryButton = styled(BaseButton)`
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${brandTheme.shadow.sm};

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

export default ClientFormModal;