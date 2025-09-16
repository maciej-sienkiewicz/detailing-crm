// src/pages/Clients/components/VehicleFormModal.tsx - POPRAWIONY LAYOUT
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {
    FaBarcode,
    FaCalendarAlt,
    FaCar,
    FaCheck,
    FaEye,
    FaIdCard,
    FaPalette,
    FaSpinner,
    FaTimes,
    FaUser
} from 'react-icons/fa';
import {VehicleExpanded} from '../../../types/vehicle';
import {clientsApi} from '../../../api/clientsApi';
import {vehicleApi} from '../../../api/vehiclesApi';
import Modal from '../../../components/common/Modal';
import {useToast} from '../../../components/common/Toast/Toast';

const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',
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
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    }
};

interface VehicleFormModalProps {
    vehicle: VehicleExpanded | null;
    defaultOwnerId?: string;
    onSave: () => void;
    onCancel: () => void;
}

interface ClientOption {
    id: string;
    name: string;
    email: string;
    phone: string;
}

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
                                                               vehicle,
                                                               defaultOwnerId,
                                                               onSave,
                                                               onCancel
                                                           }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [loadingClients, setLoadingClients] = useState(false);
    const { showToast } = useToast();

    const [formData, setFormData] = useState<Partial<VehicleExpanded>>(
        vehicle || {
            make: '',
            model: '',
            year: new Date().getFullYear(),
            licensePlate: '',
            color: '',
            vin: '',
            totalServices: 0,
            totalSpent: 0,
            ownerIds: defaultOwnerId ? [defaultOwnerId] : []
        }
    );

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (vehicle) {
            setFormData({
                ...vehicle,
                ownerIds: vehicle.ownerIds || []
            });
        } else {
            setFormData({
                make: '',
                model: '',
                year: new Date().getFullYear(),
                licensePlate: '',
                color: '',
                vin: '',
                totalServices: 0,
                totalSpent: 0,
                ownerIds: defaultOwnerId ? [defaultOwnerId] : []
            });
        }
    }, [vehicle, defaultOwnerId]);

    useEffect(() => {
        const loadClients = async () => {
            try {
                setLoadingClients(true);
                const result = await clientsApi.getClients({
                    page: 0,
                    size: 1000
                });

                if (result.success && result.data) {
                    const clientsData = result.data.data.map(client => ({
                        id: client.id,
                        name: `${client.firstName} ${client.lastName}`,
                        email: client.email,
                        phone: client.phone
                    }));

                    setClients(clientsData);
                } else {
                    setError('Nie udało się załadować listy klientów.');
                }
            } catch (err) {
                setError('Nie udało się załadować listy klientów.');
            } finally {
                setLoadingClients(false);
            }
        };

        loadClients();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'year') {
            setFormData(prev => ({
                ...prev,
                [name]: parseInt(value) || new Date().getFullYear()
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);

        setFormData(prev => ({
            ...prev,
            ownerIds: selectedOptions
        }));

        if (errors.ownerIds) {
            setErrors(prev => ({
                ...prev,
                ownerIds: ''
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.make?.trim()) {
            newErrors.make = 'Marka jest wymagana';
        }

        if (!formData.model?.trim()) {
            newErrors.model = 'Model jest wymagany';
        }

        if (!formData.licensePlate?.trim()) {
            newErrors.licensePlate = 'Numer rejestracyjny jest wymagany';
        }

        const currentYear = new Date().getFullYear();
        if (!formData.year || formData.year < 1900 || formData.year > currentYear + 1) {
            newErrors.year = `Rok produkcji musi być pomiędzy 1900 a ${currentYear + 1}`;
        }

        if (!formData.ownerIds?.length) {
            newErrors.ownerIds = 'Wybierz co najmniej jednego właściciela';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const vehicleData = {
                make: formData.make!.trim(),
                model: formData.model!.trim(),
                year: formData.year!,
                licensePlate: formData.licensePlate!.trim(),
                color: formData.color?.trim() || undefined,
                vin: formData.vin?.trim() || undefined,
                ownerIds: formData.ownerIds || []
            };

            let result;
            if (vehicle?.id) {
                result = await vehicleApi.updateVehicle(vehicle.id, vehicleData);
                showToast('success', 'Pojazd został zaktualizowany pomyślnie');
            } else {
                result = await vehicleApi.createVehicle(vehicleData);
                showToast('success', 'Nowy pojazd został dodany pomyślnie');
            }

            onSave();

        } catch (err: any) {
            console.error('❌ Błąd podczas zapisywania pojazdu:', err);

            let errorMessage = 'Nie udało się zapisać pojazdu. Spróbuj ponownie.';

            if (err.message) {
                errorMessage = err.message;
            } else if (err.data?.message) {
                errorMessage = err.data.message;
            } else if (err.status === 409) {
                errorMessage = 'Pojazd z tym numerem rejestracyjnym już istnieje';
            } else if (err.status === 400) {
                errorMessage = 'Nieprawidłowe dane pojazdu';
            }

            setError(errorMessage);
            showToast('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper>
            <Modal
                isOpen={true}
                onClose={onCancel}
                title={vehicle ? 'Edycja pojazdu' : 'Nowy pojazd'}
            >
                <ModalLayout>
                    <ModalContent>
                        {error && (
                            <ErrorContainer>
                                <ErrorIcon>⚠️</ErrorIcon>
                                <ErrorText>{error}</ErrorText>
                            </ErrorContainer>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <FormSection>
                                <SectionHeader>
                                    <SectionIcon>
                                        <FaCar />
                                    </SectionIcon>
                                    <SectionContent>
                                        <SectionTitle>Dane pojazdu</SectionTitle>
                                        <SectionSubtitle>Podstawowe informacje o pojeździe</SectionSubtitle>
                                    </SectionContent>
                                </SectionHeader>

                                <FormRow>
                                    <FormGroup>
                                        <FormLabel htmlFor="make" $required>
                                            Marka pojazdu
                                        </FormLabel>
                                        <FormInput
                                            id="make"
                                            name="make"
                                            value={formData.make || ''}
                                            onChange={handleChange}
                                            placeholder="np. BMW, Audi, Mercedes"
                                            $hasError={!!errors.make}
                                            $hasValue={!!formData.make}
                                            disabled={loading}
                                        />
                                        {errors.make && (
                                            <ErrorMessage>{errors.make}</ErrorMessage>
                                        )}
                                    </FormGroup>

                                    <FormGroup>
                                        <FormLabel htmlFor="model" $required>
                                            Model pojazdu
                                        </FormLabel>
                                        <FormInput
                                            id="model"
                                            name="model"
                                            value={formData.model || ''}
                                            onChange={handleChange}
                                            placeholder="np. X5, A4, C-Class"
                                            $hasError={!!errors.model}
                                            $hasValue={!!formData.model}
                                            disabled={loading}
                                        />
                                        {errors.model && (
                                            <ErrorMessage>{errors.model}</ErrorMessage>
                                        )}
                                    </FormGroup>
                                </FormRow>

                                <FormRow>
                                    <FormGroup>
                                        <FormLabel htmlFor="year" $required>
                                            <FaCalendarAlt style={{ marginRight: '8px', fontSize: '12px' }} />
                                            Rok produkcji
                                        </FormLabel>
                                        <FormInput
                                            id="year"
                                            name="year"
                                            type="number"
                                            min="1900"
                                            max={new Date().getFullYear() + 1}
                                            value={formData.year || ''}
                                            onChange={handleChange}
                                            placeholder="2023"
                                            $hasError={!!errors.year}
                                            $hasValue={!!formData.year}
                                            disabled={loading}
                                        />
                                        {errors.year && (
                                            <ErrorMessage>{errors.year}</ErrorMessage>
                                        )}
                                    </FormGroup>

                                    <FormGroup>
                                        <FormLabel htmlFor="licensePlate" $required>
                                            <FaIdCard style={{ marginRight: '8px', fontSize: '12px' }} />
                                            Numer rejestracyjny
                                        </FormLabel>
                                        <FormInput
                                            id="licensePlate"
                                            name="licensePlate"
                                            value={formData.licensePlate || ''}
                                            onChange={handleChange}
                                            placeholder="ABC 123D"
                                            $hasError={!!errors.licensePlate}
                                            $hasValue={!!formData.licensePlate}
                                            style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}
                                            disabled={loading}
                                        />
                                        {errors.licensePlate && (
                                            <ErrorMessage>{errors.licensePlate}</ErrorMessage>
                                        )}
                                    </FormGroup>
                                </FormRow>

                                <FormRow>
                                    <FormGroup>
                                        <FormLabel htmlFor="color">
                                            <FaPalette style={{ marginRight: '8px', fontSize: '12px' }} />
                                            Kolor pojazdu
                                        </FormLabel>
                                        <FormInput
                                            id="color"
                                            name="color"
                                            value={formData.color || ''}
                                            onChange={handleChange}
                                            placeholder="np. Czarny metalik, Biały perła"
                                            $hasValue={!!formData.color}
                                            disabled={loading}
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <FormLabel htmlFor="vin">
                                            <FaBarcode style={{ marginRight: '8px', fontSize: '12px' }} />
                                            Numer VIN
                                        </FormLabel>
                                        <FormInput
                                            id="vin"
                                            name="vin"
                                            value={formData.vin || ''}
                                            onChange={handleChange}
                                            placeholder="WBAVD13576KX12345"
                                            maxLength={17}
                                            $hasValue={!!formData.vin}
                                            style={{ fontFamily: 'monospace', letterSpacing: '1px' }}
                                            disabled={loading}
                                        />
                                    </FormGroup>
                                </FormRow>
                            </FormSection>

                            <FormSection>
                                <SectionHeader>
                                    <SectionIcon>
                                        <FaUser />
                                    </SectionIcon>
                                    <SectionContent>
                                        <SectionTitle>Właściciele pojazdu</SectionTitle>
                                        <SectionSubtitle>Przypisz pojazd do klientów w systemie</SectionSubtitle>
                                    </SectionContent>
                                </SectionHeader>

                                <FormGroup>
                                    <FormLabel htmlFor="ownerIds" $required>
                                        Wybierz właścicieli z bazy klientów
                                    </FormLabel>
                                    {loadingClients ? (
                                        <LoadingOwnersContainer>
                                            <LoadingSpinner />
                                            <LoadingText>Ładowanie listy klientów...</LoadingText>
                                        </LoadingOwnersContainer>
                                    ) : (
                                        <FormSelect
                                            id="ownerIds"
                                            name="ownerIds"
                                            multiple
                                            size={5}
                                            value={formData.ownerIds || []}
                                            onChange={handleOwnerChange}
                                            $hasError={!!errors.ownerIds}
                                            $hasValue={!!(formData.ownerIds && formData.ownerIds.length > 0)}
                                            disabled={loading}
                                        >
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>
                                                    {client.name} ({client.email})
                                                </option>
                                            ))}
                                        </FormSelect>
                                    )}
                                    <HelpText>
                                        <strong>Instrukcja:</strong> Przytrzymaj Ctrl (lub Cmd na Mac) aby wybrać wielu właścicieli.
                                    </HelpText>
                                    {errors.ownerIds && (
                                        <ErrorMessage>{errors.ownerIds}</ErrorMessage>
                                    )}

                                    {formData.ownerIds && formData.ownerIds.length > 0 && (
                                        <SelectedOwnersContainer>
                                            <SelectedOwnersTitle>
                                                <FaEye style={{ marginRight: '8px' }} />
                                                Wybrani właściciele ({formData.ownerIds.length}):
                                            </SelectedOwnersTitle>
                                            <SelectedOwnersList>
                                                {formData.ownerIds.map(ownerId => {
                                                    const client = clients.find(c => c.id === ownerId);
                                                    return client ? (
                                                        <SelectedOwnerItem key={ownerId}>
                                                            <OwnerIcon>
                                                                <FaUser />
                                                            </OwnerIcon>
                                                            <OwnerDetails>
                                                                <OwnerName>{client.name}</OwnerName>
                                                                <OwnerContact>
                                                                    <ContactDetail>
                                                                        📧 {client.email}
                                                                    </ContactDetail>
                                                                    <ContactDetail>
                                                                        📞 {client.phone}
                                                                    </ContactDetail>
                                                                </OwnerContact>
                                                            </OwnerDetails>
                                                            <RemoveOwnerButton
                                                                type="button"
                                                                onClick={() => {
                                                                    const newOwnerIds = formData.ownerIds?.filter(id => id !== ownerId) || [];
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        ownerIds: newOwnerIds
                                                                    }));
                                                                }}
                                                                title="Usuń właściciela"
                                                                disabled={loading}
                                                            >
                                                                <FaTimes />
                                                            </RemoveOwnerButton>
                                                        </SelectedOwnerItem>
                                                    ) : null;
                                                })}
                                            </SelectedOwnersList>
                                        </SelectedOwnersContainer>
                                    )}
                                </FormGroup>
                            </FormSection>
                        </Form>
                    </ModalContent>

                    <ModalFooter>
                        <FormActions>
                            <SecondaryButton type="button" onClick={onCancel} disabled={loading}>
                                <FaTimes />
                                <span>Anuluj</span>
                            </SecondaryButton>
                            <PrimaryButton type="submit" onClick={handleSubmit} disabled={loading || loadingClients}>
                                {loading ? (
                                    <>
                                        <FaSpinner className="spinning" />
                                        <span>Zapisywanie...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaCheck />
                                        <span>{vehicle ? 'Zapisz zmiany' : 'Dodaj pojazd'}</span>
                                    </>
                                )}
                            </PrimaryButton>
                        </FormActions>
                    </ModalFooter>
                </ModalLayout>
            </Modal>
        </ModalWrapper>
    );
};

// POPRAWIONY LAYOUT - Modal z prawidłowymi proporcjami
const ModalWrapper = styled.div`
    /* Globalne nadpisanie stylów Modal */
    .modal-content {
        height: 90vh !important;
        max-height: 90vh !important;
        overflow: hidden !important;
        padding: 0 !important;
        display: flex !important;
        flex-direction: column !important;
    }
    
    .modal-body {
        flex: 1 !important;
        padding: 0 !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
        min-height: 0 !important;
    }
`;

const ModalLayout = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
`;

const ModalContent = styled.div`
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: ${brandTheme.spacing.xl};
    min-height: 0;

    /* Prettier scrollbar */
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: ${brandTheme.surfaceAlt};
        border-radius: 3px;
        margin: 4px 0;
    }
    &::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, ${brandTheme.border} 0%, ${brandTheme.borderHover} 100%);
        border-radius: 3px;

        &:hover {
            background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
        }
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.md};
    }
`;

const ModalFooter = styled.div`
    flex-shrink: 0;
    background: linear-gradient(to bottom,
        rgba(255, 255, 255, 0.95) 0%,
        rgba(255, 255, 255, 1) 15%
    );
    backdrop-filter: blur(12px);
    border-top: 1px solid ${brandTheme.borderLight};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.xl};
    position: relative;
    z-index: 10;

    /* Subtle shadow for separation */
    &::before {
        content: '';
        position: absolute;
        top: -8px;
        left: 0;
        right: 0;
        height: 8px;
        background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.05));
        pointer-events: none;
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    }
`;

// Pozostałe styled components pozostają bez zmian...
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
    font-size: 20px;
    flex-shrink: 0;
`;

const ErrorText = styled.div`
    color: ${brandTheme.status.error};
    font-weight: 500;
    font-size: 14px;
    line-height: 1.4;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xl};
`;

const FormSection = styled.section`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.xl};
    padding: ${brandTheme.spacing.xl};
    box-shadow: ${brandTheme.shadow.sm};
    transition: all 0.2s ease;

    &:hover {
        box-shadow: ${brandTheme.shadow.md};
        border-color: ${brandTheme.primary}30;
    }
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.xl};
    padding-bottom: ${brandTheme.spacing.lg};
    border-bottom: 2px solid ${brandTheme.borderLight};
`;

const SectionIcon = styled.div`
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    box-shadow: ${brandTheme.shadow.md};
    flex-shrink: 0;
`;

const SectionContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const SectionTitle = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
    letter-spacing: -0.025em;
`;

const SectionSubtitle = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.tertiary};
    font-weight: 500;
    line-height: 1.4;
`;

const FormRow = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.lg};
    margin-bottom: ${brandTheme.spacing.lg};

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
    min-width: 0;
`;

const FormLabel = styled.label<{ $required?: boolean }>`
    font-weight: 600;
    font-size: 14px;
    color: ${brandTheme.text.primary};
    display: flex;
    align-items: center;
    margin-bottom: ${brandTheme.spacing.xs};

    ${props => props.$required && `
        &::after {
            content: ' *';
            color: ${brandTheme.status.error};
            font-weight: 700;
            margin-left: 2px;
        }
    `}
`;

const FormInput = styled.input<{
    $hasError?: boolean;
    $hasValue?: boolean;
}>`
    height: 52px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${props =>
    props.$hasError ? brandTheme.status.error :
        props.$hasValue ? brandTheme.primary :
            brandTheme.border
};
    border-radius: ${brandTheme.radius.lg};
    font-size: 15px;
    font-weight: 500;
    background: ${props => props.$hasValue ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 4px ${brandTheme.primaryGhost};
        background: ${brandTheme.surface};
        transform: translateY(-1px);
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const LoadingOwnersContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.xl};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
    border: 2px dashed ${brandTheme.border};
`;

const LoadingSpinner = styled.div`
    width: 24px;
    height: 24px;
    border: 2px solid ${brandTheme.borderLight};
    border-top: 2px solid ${brandTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

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

const FormSelect = styled.select<{
    $hasError?: boolean;
    $hasValue?: boolean;
}>`
    padding: ${brandTheme.spacing.md};
    border: 2px solid ${props =>
    props.$hasError ? brandTheme.status.error :
        props.$hasValue ? brandTheme.primary :
            brandTheme.border
};
    border-radius: ${brandTheme.radius.lg};
    font-size: 14px;
    font-family: inherit;
    font-weight: 500;
    background: ${props => props.$hasValue ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 120px;
    width: 100%;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 4px ${brandTheme.primaryGhost};
        background: ${brandTheme.surface};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    &[multiple] {
        height: auto;
    }

    option {
        padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
        margin: 2px 0;
        border-radius: ${brandTheme.radius.sm};

        &:checked {
            background: rgba(26, 54, 93, 0.08);
            color: ${brandTheme.primary};
            font-weight: 600;
        }

        &:hover {
            background: ${brandTheme.primaryGhost};
        }
    }

    ${props => props.$hasError && `
        &:focus {
            border-color: ${brandTheme.status.error};
            box-shadow: 0 0 0 4px ${brandTheme.status.errorLight};
        }
    `}
`;

const HelpText = styled.p`
    font-size: 13px;
    color: ${brandTheme.text.tertiary};
    margin: 0;
    font-style: italic;
    line-height: 1.4;
    word-wrap: break-word;

    strong {
        color: ${brandTheme.text.secondary};
        font-weight: 600;
    }
`;

const ErrorMessage = styled.div`
    color: ${brandTheme.status.error};
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    margin-top: ${brandTheme.spacing.xs};

    &::before {
        content: '⚠ ';
        font-size: 10px;
    }
`;

const SelectedOwnersContainer = styled.div`
    margin-top: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg};
    background: linear-gradient(135deg, ${brandTheme.primaryGhost} 0%, rgba(26, 54, 93, 0.02) 100%);
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.primary}30;
    width: 100%;
    box-sizing: border-box;
`;

const SelectedOwnersTitle = styled.div`
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.lg};
    width: 100%;
    box-sizing: border-box;
    gap: ${brandTheme.spacing.xs};

    svg {
        color: ${brandTheme.primary};
        flex-shrink: 0;
    }
`;

const SelectedOwnersList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
    width: 100%;
`;

const SelectedOwnerItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    transition: all 0.2s ease;
    width: 100%;
    box-sizing: border-box;
    min-height: 80px;

    &:hover {
        border-color: ${brandTheme.primary};
        box-shadow: ${brandTheme.shadow.sm};
    }
`;

const OwnerIcon = styled.div`
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, ${brandTheme.primary}15 0%, ${brandTheme.primary}08 100%);
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.primary};
    font-size: 18px;
    flex-shrink: 0;
    margin-top: ${brandTheme.spacing.xs};
`;

const OwnerDetails = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const OwnerName = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    line-height: 1.3;
    word-wrap: break-word;
`;

const OwnerContact = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
    width: 100%;
`;

const ContactDetail = styled.div`
    font-size: 13px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    line-height: 1.3;
    word-wrap: break-word;
`;

const RemoveOwnerButton = styled.button`
    width: 32px;
    height: 32px;
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    border: 1px solid ${brandTheme.status.error}30;
    border-radius: ${brandTheme.radius.sm};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    transition: all 0.2s ease;
    flex-shrink: 0;
    margin-top: ${brandTheme.spacing.xs};

    &:hover:not(:disabled) {
        background: ${brandTheme.status.error};
        color: white;
        transform: scale(1.05);
        box-shadow: ${brandTheme.shadow.sm};
    }

    &:active:not(:disabled) {
        transform: scale(0.95);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.md};
    width: 100%;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${brandTheme.spacing.sm};
    }

    @media (max-width: 480px) {
        gap: ${brandTheme.spacing.xs};
    }
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.xl};
    border-radius: ${brandTheme.radius.lg};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 48px;
    border: 1px solid transparent;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    min-width: 140px;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.lg};
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

    @media (max-width: 768px) {
        width: 100%;
        min-width: auto;
    }

    @media (max-width: 480px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
        font-size: 13px;
        min-height: 44px;
    }
`;

const SecondaryButton = styled(BaseButton)`
    background: ${brandTheme.surfaceAlt};
    color: ${brandTheme.text.secondary};
    border-color: ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.sm};

    &:hover:not(:disabled) {
        background: ${brandTheme.borderLight};
        color: ${brandTheme.text.primary};
        border-color: ${brandTheme.borderHover};
    }
`;

const PrimaryButton = styled(BaseButton)`
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${brandTheme.shadow.md};
    position: relative;

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
    }

    &:hover:not(:disabled)::before {
        left: 100%;
    }
`;

export default VehicleFormModal;