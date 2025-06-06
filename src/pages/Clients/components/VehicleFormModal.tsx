// VehicleFormModal.tsx - Professional Premium Automotive CRM
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCar, FaUser, FaIdCard, FaCheck, FaTimes, FaSpinner, FaCalendarAlt, FaMoneyBillWave, FaTools, FaPalette, FaBarcode } from 'react-icons/fa';
import { VehicleExpanded } from '../../../types/vehicle';
import { clientApi } from '../../../api/clientsApi';
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

interface VehicleFormModalProps {
    vehicle: VehicleExpanded | null;
    defaultOwnerId?: string;
    onSave: (vehicle: VehicleExpanded) => void;
    onCancel: () => void;
}

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
                                                               vehicle,
                                                               defaultOwnerId,
                                                               onSave,
                                                               onCancel
                                                           }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [owners, setOwners] = useState<{ id: string; name: string }[]>([]);
    const [loadingOwners, setLoadingOwners] = useState(false);

    // Initialize form with vehicle data or empty values
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
            serviceHistory: [],
            ownerIds: defaultOwnerId ? [defaultOwnerId] : []
        }
    );

    // Form validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load owners list
    useEffect(() => {
        const loadOwners = async () => {
            try {
                setLoadingOwners(true);
                const clientsData = await clientApi.fetchClients();

                const ownersData = clientsData.map(client => ({
                    id: client.id,
                    name: `${client.firstName} ${client.lastName}`
                }));

                setOwners(ownersData);
            } catch (err) {
                console.error('Error loading owners:', err);
                setError('Nie udało się załadować listy właścicieli.');
            } finally {
                setLoadingOwners(false);
            }
        };

        loadOwners();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Handle year as number
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

        // Clear error when field is edited
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

        // Clear error when field is edited
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        // Prepare the vehicle data by copying only necessary fields
        const vehicleData: Partial<VehicleExpanded> = {
            ...vehicle,
            make: formData.make,
            model: formData.model,
            year: formData.year,
            licensePlate: formData.licensePlate,
            color: formData.color,
            vin: formData.vin,
            ownerIds: formData.ownerIds || []
        };

        try {
            onSave(vehicleData as VehicleExpanded);
        } catch (err) {
            setError('Nie udało się zapisać pojazdu. Spróbuj ponownie.');
            setLoading(false);
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
    };

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title={vehicle ? 'Edycja pojazdu' : 'Nowy pojazd'}
        >
            <FormContainer>
                {error && (
                    <ErrorContainer>
                        <ErrorIcon>⚠️</ErrorIcon>
                        <ErrorText>{error}</ErrorText>
                    </ErrorContainer>
                )}

                <Form onSubmit={handleSubmit}>
                    {/* Vehicle Information Section */}
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
                                <LicensePlateInputWrapper>
                                    <FormInput
                                        id="licensePlate"
                                        name="licensePlate"
                                        value={formData.licensePlate || ''}
                                        onChange={handleChange}
                                        placeholder="ABC 123D"
                                        $hasError={!!errors.licensePlate}
                                        $hasValue={!!formData.licensePlate}
                                        style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}
                                    />
                                    {formData.licensePlate && (
                                        <LicensePlatePreview>
                                            {formData.licensePlate}
                                        </LicensePlatePreview>
                                    )}
                                </LicensePlateInputWrapper>
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
                                />
                                <HelpText>
                                    Podaj dokładny kolor dla lepszej identyfikacji pojazdu
                                </HelpText>
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
                                />
                                <HelpText>
                                    17-znakowy kod identyfikacyjny pojazdu (opcjonalne)
                                </HelpText>
                            </FormGroup>
                        </FormRow>
                    </FormSection>

                    {/* Owners Section */}
                    <FormSection>
                        <SectionHeader>
                            <SectionIcon>
                                <FaUser />
                            </SectionIcon>
                            <SectionContent>
                                <SectionTitle>Właściciele pojazdu</SectionTitle>
                                <SectionSubtitle>Przypisz pojazd do klientów w systemie CRM</SectionSubtitle>
                            </SectionContent>
                        </SectionHeader>

                        <FormGroup>
                            <FormLabel htmlFor="ownerIds" $required>
                                Wybierz właścicieli z bazy klientów
                            </FormLabel>
                            {loadingOwners ? (
                                <LoadingOwnersContainer>
                                    <LoadingSpinner />
                                    <LoadingText>Ładowanie listy klientów...</LoadingText>
                                </LoadingOwnersContainer>
                            ) : (
                                <FormSelect
                                    id="ownerIds"
                                    name="ownerIds"
                                    multiple
                                    size={6}
                                    value={formData.ownerIds || []}
                                    onChange={handleOwnerChange}
                                    $hasError={!!errors.ownerIds}
                                    $hasValue={!!(formData.ownerIds && formData.ownerIds.length > 0)}
                                >
                                    {owners.map(owner => (
                                        <option key={owner.id} value={owner.id}>
                                            {owner.name}
                                        </option>
                                    ))}
                                </FormSelect>
                            )}
                            <HelpText>
                                <strong>Instrukcja:</strong> Przytrzymaj Ctrl (lub Cmd na Mac) aby wybrać wielu właścicieli.
                                Można przypisać pojazd do maksymalnie 3 właścicieli.
                            </HelpText>
                            {errors.ownerIds && (
                                <ErrorMessage>{errors.ownerIds}</ErrorMessage>
                            )}

                            {formData.ownerIds && formData.ownerIds.length > 0 && (
                                <SelectedOwners>
                                    <SelectedOwnersTitle>Wybrani właściciele:</SelectedOwnersTitle>
                                    <SelectedOwnersList>
                                        {formData.ownerIds.map(ownerId => {
                                            const owner = owners.find(o => o.id === ownerId);
                                            return owner ? (
                                                <SelectedOwnerItem key={ownerId}>
                                                    <FaUser />
                                                    <span>{owner.name}</span>
                                                </SelectedOwnerItem>
                                            ) : null;
                                        })}
                                    </SelectedOwnersList>
                                </SelectedOwners>
                            )}
                        </FormGroup>
                    </FormSection>

                    {/* Statistics Section - Only for existing vehicles */}
                    {vehicle && (
                        <FormSection>
                            <SectionHeader>
                                <SectionIcon $color={brandTheme.status.success}>
                                    <FaCheck />
                                </SectionIcon>
                                <SectionContent>
                                    <SectionTitle>Statystyki CRM</SectionTitle>
                                    <SectionSubtitle>Dane aktualizowane automatycznie przez system</SectionSubtitle>
                                </SectionContent>
                            </SectionHeader>

                            <StatsGrid>
                                <StatCard>
                                    <StatIcon $color={brandTheme.status.info}>
                                        <FaTools />
                                    </StatIcon>
                                    <StatContent>
                                        <StatValue>{vehicle.totalServices}</StatValue>
                                        <StatLabel>Wykonanych usług</StatLabel>
                                    </StatContent>
                                </StatCard>

                                <StatCard>
                                    <StatIcon $color={brandTheme.status.success}>
                                        <FaMoneyBillWave />
                                    </StatIcon>
                                    <StatContent>
                                        <StatValue>{formatCurrency(vehicle.totalSpent)}</StatValue>
                                        <StatLabel>Suma przychodów</StatLabel>
                                    </StatContent>
                                </StatCard>

                                {vehicle.lastServiceDate && (
                                    <StatCard $fullWidth>
                                        <StatIcon $color={brandTheme.status.warning}>
                                            <FaCalendarAlt />
                                        </StatIcon>
                                        <StatContent>
                                            <StatValue>{formatDate(vehicle.lastServiceDate)}</StatValue>
                                            <StatLabel>Ostatnia usługa serwisowa</StatLabel>
                                        </StatContent>
                                    </StatCard>
                                )}
                            </StatsGrid>

                            <StatsNote>
                                💡 <strong>Informacja:</strong> Statystyki są automatycznie aktualizowane po każdej
                                wykonanej usłudze. Dane pochodzą z modułu protokołów serwisowych.
                            </StatsNote>
                        </FormSection>
                    )}

                    {/* Form Actions */}
                    <FormActions>
                        <SecondaryButton type="button" onClick={onCancel} disabled={loading}>
                            <FaTimes />
                            <span>Anuluj</span>
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={loading}>
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
                </Form>
            </FormContainer>
        </Modal>
    );
};

// Professional Styled Components - Premium Automotive Design
const FormContainer = styled.div`
   padding: 0 ${brandTheme.spacing.md};
   max-height: 85vh;
   overflow-y: auto;

   /* Custom scrollbar */
   &::-webkit-scrollbar {
       width: 8px;
   }
   &::-webkit-scrollbar-track {
       background: ${brandTheme.surfaceAlt};
       border-radius: 4px;
   }
   &::-webkit-scrollbar-thumb {
       background: linear-gradient(135deg, ${brandTheme.border} 0%, ${brandTheme.borderHover} 100%);
       border-radius: 4px;
       
       &:hover {
           background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
       }
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

const SectionIcon = styled.div<{ $color?: string }>`
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, ${props => props.$color || brandTheme.primary} 0%, ${props => props.$color ? `${props.$color}CC` : brandTheme.primaryLight} 100%);
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

   ${props => props.$hasError && `
       &:focus {
           border-color: ${brandTheme.status.error};
           box-shadow: 0 0 0 4px ${brandTheme.status.errorLight};
       }
   `}
`;

const LicensePlateInputWrapper = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const LicensePlatePreview = styled.div`
   align-self: flex-start;
   background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
   color: white;
   padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.md};
   border-radius: ${brandTheme.radius.md};
   font-weight: 700;
   font-size: 14px;
   letter-spacing: 2px;
   text-transform: uppercase;
   box-shadow: ${brandTheme.shadow.sm};
   border: 2px solid white;
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
   min-height: 140px;

   &:focus {
       outline: none;
       border-color: ${brandTheme.primary};
       box-shadow: 0 0 0 4px ${brandTheme.primaryGhost};
       background: ${brandTheme.surface};
   }

   &[multiple] {
       height: auto;
   }

   option {
       padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
       margin: 2px 0;
       border-radius: ${brandTheme.radius.sm};

       &:checked {
           background: rgba(26, 54, 93, 0.08); // Jeszcze bardziej przezroczyste
           color: ${brandTheme.primary}; // Niebieski tekst dla lepszego kontrastu
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
       content: '⚠';
       font-size: 10px;
   }
`;

const SelectedOwners = styled.div`
   margin-top: ${brandTheme.spacing.md};
   padding: ${brandTheme.spacing.md};
   background: linear-gradient(135deg, ${brandTheme.primaryGhost} 0%, rgba(26, 54, 93, 0.02) 100%);
   border-radius: ${brandTheme.radius.lg};
   border: 1px solid ${brandTheme.primary}30;
`;

const SelectedOwnersTitle = styled.div`
   font-size: 14px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
   margin-bottom: ${brandTheme.spacing.sm};
`;

const SelectedOwnersList = styled.div`
   display: flex;
   flex-wrap: wrap;
   gap: ${brandTheme.spacing.sm};
`;

const SelectedOwnerItem = styled.div`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.xs};
   padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
   background: ${brandTheme.surface};
   border: 1px solid ${brandTheme.primary};
   border-radius: ${brandTheme.radius.md};
   font-size: 13px;
   font-weight: 500;
   color: ${brandTheme.primary};

   svg {
       font-size: 11px;
   }
`;

const StatsGrid = styled.div`
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
   gap: ${brandTheme.spacing.md};
   margin-bottom: ${brandTheme.spacing.lg};
`;

const StatCard = styled.div<{ $fullWidth?: boolean }>`
   background: ${brandTheme.surfaceAlt};
   border: 1px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.md};
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.md};
   transition: all 0.2s ease;

   ${props => props.$fullWidth && `
       grid-column: 1 / -1;
   `}

   &:hover {
       background: ${brandTheme.primaryGhost};
       border-color: ${brandTheme.primary};
       transform: translateY(-2px);
       box-shadow: ${brandTheme.shadow.md};
   }
`;

const StatIcon = styled.div<{ $color: string }>`
   width: 40px;
   height: 40px;
   background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
   border-radius: ${brandTheme.radius.md};
   display: flex;
   align-items: center;
   justify-content: center;
   color: ${props => props.$color};
   font-size: 18px;
   flex-shrink: 0;
`;

const StatContent = styled.div`
   flex: 1;
   min-width: 0;
`;

const StatValue = styled.div`
   font-size: 18px;
   font-weight: 700;
   color: ${brandTheme.text.primary};
   margin-bottom: ${brandTheme.spacing.xs};
   line-height: 1.2;
`;

const StatLabel = styled.div`
   font-size: 12px;
   color: ${brandTheme.text.tertiary};
   font-weight: 500;
   text-transform: uppercase;
   letter-spacing: 0.5px;
`;

const StatsNote = styled.div`
   background: linear-gradient(135deg, ${brandTheme.status.infoLight} 0%, #f0f9ff 100%);
   border: 1px solid ${brandTheme.status.info}30;
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.md};
   font-size: 13px;
   color: ${brandTheme.text.secondary};
   line-height: 1.4;

   strong {
       color: ${brandTheme.text.primary};
   }
`;

const FormActions = styled.div`
   display: flex;
   justify-content: flex-end;
   gap: ${brandTheme.spacing.sm};
   padding-top: ${brandTheme.spacing.xl};
   border-top: 2px solid ${brandTheme.borderLight};
   margin-top: ${brandTheme.spacing.lg};
`;

const BaseButton = styled.button`
   display: flex;
   align-items: center;
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

   &:hover:not(:disabled) {
       transform: translateY(-2px);
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

   span {
       @media (max-width: 480px) {
           display: none;
       }
   }
`;

const SecondaryButton = styled(BaseButton)`
   background: ${brandTheme.surfaceAlt};
   color: ${brandTheme.text.secondary};
   border-color: ${brandTheme.border};
   box-shadow: ${brandTheme.shadow.xs};

   &:hover:not(:disabled) {
       background: ${brandTheme.borderLight};
       color: ${brandTheme.text.primary};
       box-shadow: ${brandTheme.shadow.sm};
   }
`;

const PrimaryButton = styled(BaseButton)`
   background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
   color: white;
   box-shadow: ${brandTheme.shadow.md};

   &:hover:not(:disabled) {
       background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
       box-shadow: ${brandTheme.shadow.lg};
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

   &:hover::before {
       left: 100%;
   }
`;

export default VehicleFormModal;