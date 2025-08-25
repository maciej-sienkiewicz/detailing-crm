// src/pages/Settings/components/EmployeeFormModal.tsx - Updated with API Integration
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaEye, FaEyeSlash, FaShieldAlt, FaSpinner, FaUser} from 'react-icons/fa';
import {ContractType, ExtendedEmployee, UserRole, UserRoleLabels} from '../../../types/employeeTypes';
import {
    Button,
    ButtonGroup,
    CloseButton,
    ErrorText,
    Form,
    FormGroup,
    FormRow,
    HelpText,
    Input,
    Label,
    ModalBody,
    ModalContainer,
    ModalHeader,
    ModalOverlay,
    Select
} from '../styles/ModalStyles';

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
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    divider: '#e5e7eb',
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

interface EmployeeFormModalProps {
    employee: ExtendedEmployee;
    onSave: (employee: ExtendedEmployee) => Promise<void>;
    onCancel: () => void;
    canManageRoles?: boolean;
    isLoading?: boolean;
    validationErrors?: Record<string, string>;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
                                                                        employee,
                                                                        onSave,
                                                                        onCancel,
                                                                        canManageRoles = true,
                                                                        isLoading = false,
                                                                        validationErrors = {}
                                                                    }) => {
    const [formData, setFormData] = useState<ExtendedEmployee>(employee);
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Merge external validation errors with local errors
    const allErrors = { ...localErrors, ...validationErrors };

    // Update form data when employee prop changes
    useEffect(() => {
        setFormData(employee);
        setIsDirty(false);
    }, [employee]);

    // Clear local errors when external validation errors change
    useEffect(() => {
        if (Object.keys(validationErrors).length > 0) {
            setLocalErrors({});
        }
    }, [validationErrors]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        let processedValue: any = value;
        if (type === 'number') {
            processedValue = value === '' ? undefined : parseFloat(value) || 0;
        } else if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));

        setIsDirty(true);

        // Clear error for this field when user starts typing
        if (allErrors[name]) {
            setLocalErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleEmergencyContactChange = (field: 'name' | 'phone', value: string) => {
        setFormData(prev => ({
            ...prev,
            emergencyContact: {
                name: field === 'name' ? value : prev.emergencyContact?.name || '',
                phone: field === 'phone' ? value : prev.emergencyContact?.phone || ''
            }
        }));
        setIsDirty(true);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Required field validations
        if (!formData.fullName?.trim()) {
            errors.fullName = 'Imię i nazwisko jest wymagane';
        }

        if (!formData.position?.trim()) {
            errors.position = 'Stanowisko jest wymagane';
        }

        if (!formData.email?.trim()) {
            errors.email = 'Adres email jest wymagany';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Podaj prawidłowy adres email';
        }

        if (!formData.phone?.trim()) {
            errors.phone = 'Numer telefonu jest wymagany';
        } else if (!/^[\+]?[\d\s\-\(\)]{9,}$/.test(formData.phone.replace(/\s/g, ''))) {
            errors.phone = 'Podaj prawidłowy numer telefonu';
        }

        if (!formData.birthDate) {
            errors.birthDate = 'Data urodzenia jest wymagana';
        } else {
            const birthDate = new Date(formData.birthDate);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();

            if (birthDate > today) {
                errors.birthDate = 'Data urodzenia nie może być w przyszłości';
            } else if (age < 16) {
                errors.birthDate = 'Pracownik musi mieć co najmniej 16 lat';
            } else if (age > 80) {
                errors.birthDate = 'Sprawdź poprawność daty urodzenia';
            }
        }

        if (!formData.hireDate) {
            errors.hireDate = 'Data zatrudnienia jest wymagana';
        } else {
            const hireDate = new Date(formData.hireDate);
            const today = new Date();

            if (hireDate > today) {
                errors.hireDate = 'Data zatrudnienia nie może być w przyszłości';
            }

            if (formData.birthDate) {
                const birthDate = new Date(formData.birthDate);
                const minHireAge = new Date(birthDate);
                minHireAge.setFullYear(birthDate.getFullYear() + 16);

                if (hireDate < minHireAge) {
                    errors.hireDate = 'Data zatrudnienia musi być po 16. roku życia';
                }
            }
        }

        // Optional field validations
        if (formData.hourlyRate !== undefined && formData.hourlyRate <= 0) {
            errors.hourlyRate = 'Stawka godzinowa musi być większa od 0';
        }

        if (formData.bonusFromRevenue !== undefined &&
            (formData.bonusFromRevenue < 0 || formData.bonusFromRevenue > 100)) {
            errors.bonusFromRevenue = 'Bonus musi być między 0 a 100%';
        }

        if (formData.workingHoursPerWeek !== undefined &&
            (formData.workingHoursPerWeek <= 0 || formData.workingHoursPerWeek > 168)) {
            errors.workingHoursPerWeek = 'Godziny pracy muszą być między 1 a 168 na tydzień';
        }

        // Emergency contact validation
        if (formData.emergencyContact?.name && !formData.emergencyContact?.phone) {
            errors.emergencyContactPhone = 'Podaj numer telefonu kontaktu awaryjnego';
        }
        if (formData.emergencyContact?.phone && !formData.emergencyContact?.name) {
            errors.emergencyContactName = 'Podaj imię i nazwisko kontaktu awaryjnego';
        }

        setLocalErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || isLoading) {
            return;
        }

        try {
            await onSave(formData);
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    const handleCancel = () => {
        if (isDirty && !isLoading) {
            if (window.confirm('Masz niezapisane zmiany. Czy na pewno chcesz zamknąć formularz?')) {
                onCancel();
            }
        } else {
            onCancel();
        }
    };

    // Calculate estimated monthly salary
    const calculateMonthlySalary = (): string => {
        if (!formData.hourlyRate || !formData.workingHoursPerWeek) return 'Nie ustalono';
        const monthly = formData.hourlyRate * formData.workingHoursPerWeek * 4.33;
        return `${monthly.toFixed(2)} zł`;
    };

    return (
        <ModalOverlay>
            <ModalContainer style={{ maxWidth: '800px' }}>
                <ModalHeader>
                    <HeaderContent>
                        <h2>{employee.id ? 'Edytuj pracownika' : 'Dodaj nowego pracownika'}</h2>
                        {employee.id && (
                            <StatusBadge $isActive={formData.isActive}>
                                {formData.isActive ? 'Aktywny' : 'Nieaktywny'}
                            </StatusBadge>
                        )}
                    </HeaderContent>
                    <CloseButton onClick={handleCancel} disabled={isLoading}>
                        &times;
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <Form onSubmit={handleSubmit}>
                        {/* Loading Overlay */}
                        {isLoading && (
                            <LoadingOverlay>
                                <LoadingSpinner>
                                    <FaSpinner />
                                </LoadingSpinner>
                                <LoadingText>
                                    {employee.id ? 'Aktualizowanie...' : 'Tworzenie pracownika...'}
                                </LoadingText>
                            </LoadingOverlay>
                        )}

                        {/* Podstawowe dane */}
                        <SectionTitle>
                            <FaUser />
                            Dane podstawowe
                        </SectionTitle>

                        <FormGroup>
                            <Label htmlFor="fullName">Imię i nazwisko*</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Imię i nazwisko"
                                required
                                disabled={isLoading}
                                style={{
                                    borderColor: allErrors.fullName ? brandTheme.status.error : undefined,
                                    boxShadow: allErrors.fullName ? `0 0 0 3px ${brandTheme.status.errorLight}` : undefined
                                }}
                            />
                            {allErrors.fullName && <ErrorText>{allErrors.fullName}</ErrorText>}
                        </FormGroup>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="birthDate">Data urodzenia*</Label>
                                <Input
                                    id="birthDate"
                                    name="birthDate"
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    max={new Date().toISOString().split('T')[0]}
                                    style={{
                                        borderColor: allErrors.birthDate ? brandTheme.status.error : undefined,
                                        boxShadow: allErrors.birthDate ? `0 0 0 3px ${brandTheme.status.errorLight}` : undefined
                                    }}
                                />
                                {allErrors.birthDate && <ErrorText>{allErrors.birthDate}</ErrorText>}
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="hireDate">Data zatrudnienia*</Label>
                                <Input
                                    id="hireDate"
                                    name="hireDate"
                                    type="date"
                                    value={formData.hireDate}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    max={new Date().toISOString().split('T')[0]}
                                    style={{
                                        borderColor: allErrors.hireDate ? brandTheme.status.error : undefined,
                                        boxShadow: allErrors.hireDate ? `0 0 0 3px ${brandTheme.status.errorLight}` : undefined
                                    }}
                                />
                                {allErrors.hireDate && <ErrorText>{allErrors.hireDate}</ErrorText>}
                            </FormGroup>
                        </FormRow>

                        <FormGroup>
                            <Label htmlFor="position">Stanowisko*</Label>
                            <Input
                                id="position"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                placeholder="np. Senior Detailer, Kierownik Sprzedaży"
                                required
                                disabled={isLoading}
                                style={{
                                    borderColor: allErrors.position ? brandTheme.status.error : undefined,
                                    boxShadow: allErrors.position ? `0 0 0 3px ${brandTheme.status.errorLight}` : undefined
                                }}
                            />
                            {allErrors.position && <ErrorText>{allErrors.position}</ErrorText>}
                        </FormGroup>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="email">Adres email*</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                    required
                                    disabled={isLoading}
                                    style={{
                                        borderColor: allErrors.email ? brandTheme.status.error : undefined,
                                        boxShadow: allErrors.email ? `0 0 0 3px ${brandTheme.status.errorLight}` : undefined
                                    }}
                                />
                                {allErrors.email && <ErrorText>{allErrors.email}</ErrorText>}
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="phone">Numer kontaktowy*</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+48 123 456 789"
                                    required
                                    disabled={isLoading}
                                    style={{
                                        borderColor: allErrors.phone ? brandTheme.status.error : undefined,
                                        boxShadow: allErrors.phone ? `0 0 0 3px ${brandTheme.status.errorLight}` : undefined
                                    }}
                                />
                                {allErrors.phone && <ErrorText>{allErrors.phone}</ErrorText>}
                            </FormGroup>
                        </FormRow>

                        {/* Rola i uprawnienia */}
                        {canManageRoles && (
                            <>
                                <SectionTitle>
                                    <FaShieldAlt />
                                    Rola i uprawnienia
                                </SectionTitle>

                                <FormRow>
                                    <FormGroup>
                                        <Label htmlFor="role">Rola w systemie*</Label>
                                        <Select
                                            id="role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            required
                                            disabled={isLoading}
                                        >
                                            {Object.entries(UserRoleLabels).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </Select>
                                        <RoleDescription role={formData.role} />
                                    </FormGroup>

                                    <FormGroup>
                                        <Label htmlFor="isActive">Status konta</Label>
                                        <StatusToggle>
                                            <StatusCheckbox
                                                id="isActive"
                                                name="isActive"
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                            />
                                            <StatusLabel htmlFor="isActive" $isActive={formData.isActive}>
                                                {formData.isActive ? (
                                                    <>
                                                        <FaEye />
                                                        Konto aktywne
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaEyeSlash />
                                                        Konto nieaktywne
                                                    </>
                                                )}
                                            </StatusLabel>
                                        </StatusToggle>
                                        <HelpText>
                                            {formData.isActive
                                                ? 'Pracownik może logować się do systemu'
                                                : 'Pracownik nie może logować się do systemu'
                                            }
                                        </HelpText>
                                    </FormGroup>
                                </FormRow>
                            </>
                        )}

                        {/* Szczegóły zatrudnienia - sekcja rozwijana */}
                        <AdvancedSection>
                            <AdvancedToggle
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                $expanded={showAdvanced}
                                disabled={isLoading}
                            >
                                Szczegóły zatrudnienia i wynagrodzenia
                                <ToggleIcon $expanded={showAdvanced}>▼</ToggleIcon>
                            </AdvancedToggle>

                            {showAdvanced && (
                                <AdvancedContent>
                                    <FormRow>
                                        <FormGroup>
                                            <Label htmlFor="contractType">Typ umowy</Label>
                                            <Select
                                                id="contractType"
                                                name="contractType"
                                                value={formData.contractType || ContractType.EMPLOYMENT}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                            >
                                                <option value={ContractType.EMPLOYMENT}>Umowa o pracę</option>
                                                <option value={ContractType.B2B}>Umowa B2B</option>
                                                <option value={ContractType.MANDATE}>Umowa zlecenie</option>
                                            </Select>
                                        </FormGroup>

                                        <FormGroup>
                                            <Label htmlFor="workingHoursPerWeek">Godziny pracy/tydzień</Label>
                                            <Input
                                                id="workingHoursPerWeek"
                                                name="workingHoursPerWeek"
                                                type="number"
                                                min="1"
                                                max="168"
                                                value={formData.workingHoursPerWeek || 40}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                                style={{
                                                    borderColor: allErrors.workingHoursPerWeek ? brandTheme.status.error : undefined,
                                                    boxShadow: allErrors.workingHoursPerWeek ? `0 0 0 3px ${brandTheme.status.errorLight}` : undefined
                                                }}
                                            />
                                            {allErrors.workingHoursPerWeek && (
                                                <ErrorText>{allErrors.workingHoursPerWeek}</ErrorText>
                                            )}
                                        </FormGroup>
                                    </FormRow>

                                    <FormRow>
                                        <FormGroup>
                                            <Label htmlFor="hourlyRate">Stawka godzinowa (zł)</Label>
                                            <Input
                                                id="hourlyRate"
                                                name="hourlyRate"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.hourlyRate || ''}
                                                onChange={handleChange}
                                                placeholder="25.00"
                                                disabled={isLoading}
                                                style={{
                                                    borderColor: allErrors.hourlyRate ? brandTheme.status.error : undefined,
                                                    boxShadow: allErrors.hourlyRate ? `0 0 0 3px ${brandTheme.status.errorLight}` : undefined
                                                }}
                                            />
                                            {allErrors.hourlyRate && (
                                                <ErrorText>{allErrors.hourlyRate}</ErrorText>
                                            )}
                                        </FormGroup>

                                        <FormGroup>
                                            <Label htmlFor="bonusFromRevenue">Bonus od obrotu (%)</Label>
                                            <Input
                                                id="bonusFromRevenue"
                                                name="bonusFromRevenue"
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={formData.bonusFromRevenue || ''}
                                                onChange={handleChange}
                                                placeholder="0"
                                                disabled={isLoading}
                                            />
                                            {allErrors.bonusFromRevenue && (
                                                <ErrorText>{allErrors.bonusFromRevenue}</ErrorText>
                                            )}
                                        </FormGroup>
                                    </FormRow>

                                    {/* Salary calculation preview */}
                                    {formData.hourlyRate && formData.workingHoursPerWeek && (
                                        <SalaryPreview>
                                            <SalaryPreviewTitle>Oszacowanie wynagrodzenia:</SalaryPreviewTitle>
                                            <SalaryAmount>{calculateMonthlySalary()} miesięcznie</SalaryAmount>
                                        </SalaryPreview>
                                    )}

                                    {/* Kontakt awaryjny */}
                                    <ContactSection>
                                        <SectionSubtitle>Kontakt awaryjny</SectionSubtitle>
                                        <FormRow>
                                            <FormGroup>
                                                <Label htmlFor="emergencyContactName">Imię i nazwisko</Label>
                                                <Input
                                                    id="emergencyContactName"
                                                    value={formData.emergencyContact?.name || ''}
                                                    onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                                                    placeholder="np. Jan Kowalski"
                                                    disabled={isLoading}
                                                    style={{
                                                        borderColor: allErrors.emergencyContactName ? brandTheme.status.error : undefined,
                                                        boxShadow: allErrors.emergencyContactName ? `0 0 0 3px ${brandTheme.status.errorLight}` : undefined
                                                    }}
                                                />
                                                {allErrors.emergencyContactName && (
                                                    <ErrorText>{allErrors.emergencyContactName}</ErrorText>
                                                )}
                                            </FormGroup>

                                            <FormGroup>
                                                <Label htmlFor="emergencyContactPhone">Telefon</Label>
                                                <Input
                                                    id="emergencyContactPhone"
                                                    value={formData.emergencyContact?.phone || ''}
                                                    onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                                                    placeholder="+48 123 456 789"
                                                    disabled={isLoading}
                                                    style={{
                                                        borderColor: allErrors.emergencyContactPhone ? brandTheme.status.error : undefined,
                                                        boxShadow: allErrors.emergencyContactPhone ? `0 0 0 3px ${brandTheme.status.errorLight}` : undefined
                                                    }}
                                                />
                                                {allErrors.emergencyContactPhone && (
                                                    <ErrorText>{allErrors.emergencyContactPhone}</ErrorText>
                                                )}
                                            </FormGroup>
                                        </FormRow>
                                    </ContactSection>

                                    <FormGroup>
                                        <Label htmlFor="notes">Dodatkowe notatki</Label>
                                        <NotesTextarea
                                            id="notes"
                                            name="notes"
                                            value={formData.notes || ''}
                                            onChange={handleChange}
                                            placeholder="Dodatkowe informacje o pracowniku, specjalizacje, uwagi..."
                                            rows={3}
                                            disabled={isLoading}
                                        />
                                    </FormGroup>
                                </AdvancedContent>
                            )}
                        </AdvancedSection>

                        <ButtonGroup>
                            <Button
                                type="button"
                                secondary
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                Anuluj
                            </Button>
                            <Button
                                type="submit"
                                primary
                                disabled={isLoading || Object.keys(allErrors).length > 0}
                            >
                                {isLoading ? (
                                    <>
                                        <FaSpinner />
                                        {employee.id ? 'Zapisywanie...' : 'Tworzenie...'}
                                    </>
                                ) : (
                                    employee.id ? 'Zapisz zmiany' : 'Dodaj pracownika'
                                )}
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
    font-size: 24px;
    color: ${brandTheme.primary};
    animation: spin 1s linear infinite;
    margin-bottom: ${brandTheme.spacing.md};

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const StatusBadge = styled.div<{ $isActive: boolean }>`
    display: inline-flex;
    align-items: center;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 600;

    ${({ $isActive }) => $isActive ? `
        background: ${brandTheme.status.successLight};
        color: ${brandTheme.status.success};
    ` : `
        background: ${brandTheme.status.errorLight};
        color: ${brandTheme.status.error};
    `}
`;

const SectionTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: ${brandTheme.spacing.lg} 0 ${brandTheme.spacing.md} 0;
    padding-bottom: ${brandTheme.spacing.sm};
    border-bottom: 2px solid ${brandTheme.surfaceAlt};

    &:first-of-type {
        margin-top: 0;
    }
`;

const SectionSubtitle = styled.h4`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.secondary};
    margin: 0 0 ${brandTheme.spacing.md} 0;
`;

const RoleDescription = styled.div<{ role: UserRole }>`
    font-size: 12px;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.md};
    margin-top: ${brandTheme.spacing.xs};

    ${({ role }) => {
        switch (role) {
            case UserRole.ADMIN:
                return `
                    background: ${brandTheme.status.errorLight};
                    color: ${brandTheme.status.error};
                `;
            case UserRole.MANAGER:
                return `
                    background: ${brandTheme.status.warningLight};
                    color: ${brandTheme.status.warning};
                `;
            case UserRole.EMPLOYEE:
                return `
                    background: ${brandTheme.primaryGhost};
                    color: ${brandTheme.primary};
                `;
        }
    }}

    &::before {
        content: "${({ role }) => {
            switch (role) {
                case UserRole.ADMIN: return '🔑 Pełny dostęp do wszystkich funkcji systemu';
                case UserRole.MANAGER: return '👥 Zarządzanie zespołem i klientami';
                case UserRole.EMPLOYEE: return '🛠️ Standardowy dostęp do pracy z klientami';
                default: return '';
            }
        }}";
    }
`;

const StatusToggle = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const StatusCheckbox = styled.input`
    display: none;
`;

const StatusLabel = styled.label<{ $isActive: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    ${({ $isActive }) => $isActive ? `
        background: ${brandTheme.status.successLight};
        color: ${brandTheme.status.success};
        border: 1px solid ${brandTheme.status.success}30;
    ` : `
        background: ${brandTheme.status.errorLight};
        color: ${brandTheme.status.error};
        border: 1px solid ${brandTheme.status.error}30;
    `}

    &:hover:not(:disabled) {
        transform: scale(1.02);
    }
`;

const AdvancedSection = styled.div`
    margin: ${brandTheme.spacing.lg} 0;
    position: relative;
`;

const AdvancedToggle = styled.button<{ $expanded: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    color: ${brandTheme.text.primary};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ToggleIcon = styled.span<{ $expanded: boolean }>`
    transition: transform 0.2s ease;
    transform: ${({ $expanded }) => $expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const AdvancedContent = styled.div`
    margin-top: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.border};
`;

const SalaryPreview = styled.div`
    background: ${brandTheme.primaryGhost};
    border: 1px solid ${brandTheme.primary}30;
    border-radius: ${brandTheme.radius.md};
    padding: ${brandTheme.spacing.md};
    margin: ${brandTheme.spacing.md} 0;
`;

const SalaryPreviewTitle = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: ${brandTheme.spacing.xs};
`;

const SalaryAmount = styled.div`
    font-size: 16px;
    color: ${brandTheme.primary};
    font-weight: 700;
`;

const ContactSection = styled.div`
    margin: ${brandTheme.spacing.lg} 0;
    padding: ${brandTheme.spacing.md} 0;
    border-top: 1px solid ${brandTheme.border};
`;

const NotesTextarea = styled.textarea`
    width: 100%;
    min-height: 80px;
    padding: ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
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

export default EmployeeFormModal;