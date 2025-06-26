import React, { useState } from 'react';
import styled from 'styled-components';
import { FaUser, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Employee } from '../../../types';
import { ExtendedEmployee, UserRole, UserRoleLabels, ContractType } from '../../../types/employeeTypes';
import {
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalBody,
    CloseButton,
    Form,
    FormGroup,
    FormRow,
    Label,
    Input,
    Select,
    ColorPickerContainer,
    ColorPreview,
    ColorInput,
    HelpText,
    ButtonGroup,
    Button,
    ErrorText
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
    onSave: (employee: ExtendedEmployee) => void;
    onCancel: () => void;
    canManageRoles?: boolean;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
                                                                        employee,
                                                                        onSave,
                                                                        onCancel,
                                                                        canManageRoles = true
                                                                    }) => {
    const [formData, setFormData] = useState<ExtendedEmployee>(employee);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let processedValue: any = value;
        if (type === 'number') {
            processedValue = parseFloat(value) || 0;
        } else if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        }

        setFormData({
            ...formData,
            [name]: processedValue
        });

        // Usuwanie błędów przy edycji pola
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.fullName.trim()) {
            errors.fullName = 'Imię i nazwisko jest wymagane';
        }

        if (!formData.position.trim()) {
            errors.position = 'Stanowisko jest wymagane';
        }

        if (!formData.email.trim()) {
            errors.email = 'Adres email jest wymagany';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Podaj prawidłowy adres email';
        }

        if (!formData.phone.trim()) {
            errors.phone = 'Numer telefonu jest wymagany';
        }

        if (!formData.birthDate) {
            errors.birthDate = 'Data urodzenia jest wymagana';
        }

        if (!formData.hireDate) {
            errors.hireDate = 'Data zatrudnienia jest wymagana';
        }

        if (formData.hourlyRate && formData.hourlyRate <= 0) {
            errors.hourlyRate = 'Stawka godzinowa musi być większa od 0';
        }

        if (formData.bonusFromRevenue && (formData.bonusFromRevenue < 0 || formData.bonusFromRevenue > 100)) {
            errors.bonusFromRevenue = 'Bonus musi być między 0 a 100%';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSave(formData);
        }
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
                    <CloseButton onClick={onCancel}>&times;</CloseButton>
                </ModalHeader>

                <ModalBody>
                    <Form onSubmit={handleSubmit}>
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
                            />
                            {formErrors.fullName && <ErrorText>{formErrors.fullName}</ErrorText>}
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
                                />
                                {formErrors.birthDate && <ErrorText>{formErrors.birthDate}</ErrorText>}
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
                                />
                                {formErrors.hireDate && <ErrorText>{formErrors.hireDate}</ErrorText>}
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
                            />
                            {formErrors.position && <ErrorText>{formErrors.position}</ErrorText>}
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
                                />
                                {formErrors.email && <ErrorText>{formErrors.email}</ErrorText>}
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
                                />
                                {formErrors.phone && <ErrorText>{formErrors.phone}</ErrorText>}
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
                                            />
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
                                            />
                                            {formErrors.hourlyRate && <ErrorText>{formErrors.hourlyRate}</ErrorText>}
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
                                            />
                                            {formErrors.bonusFromRevenue && <ErrorText>{formErrors.bonusFromRevenue}</ErrorText>}
                                        </FormGroup>
                                    </FormRow>

                                    {/* Kontakt awaryjny */}
                                    <ContactSection>
                                        <SectionSubtitle>Kontakt awaryjny</SectionSubtitle>
                                        <FormRow>
                                            <FormGroup>
                                                <Label htmlFor="emergencyContactName">Imię i nazwisko</Label>
                                                <Input
                                                    id="emergencyContactName"
                                                    name="emergencyContactName"
                                                    value={formData.emergencyContact?.name || ''}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        emergencyContact: {
                                                            name: e.target.value,
                                                            phone: formData.emergencyContact?.phone || ''
                                                        }
                                                    })}
                                                    placeholder="np. Jan Kowalski"
                                                />
                                            </FormGroup>

                                            <FormGroup>
                                                <Label htmlFor="emergencyContactPhone">Telefon</Label>
                                                <Input
                                                    id="emergencyContactPhone"
                                                    name="emergencyContactPhone"
                                                    value={formData.emergencyContact?.phone || ''}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        emergencyContact: {
                                                            name: formData.emergencyContact?.name || '',
                                                            phone: e.target.value
                                                        }
                                                    })}
                                                    placeholder="+48 123 456 789"
                                                />
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
                                        />
                                    </FormGroup>
                                </AdvancedContent>
                            )}
                        </AdvancedSection>

                        <ButtonGroup>
                            <Button type="button" secondary onClick={onCancel}>
                                Anuluj
                            </Button>
                            <Button type="submit" primary>
                                {employee.id ? 'Zapisz zmiany' : 'Dodaj pracownika'}
                            </Button>
                        </ButtonGroup>
                    </Form>
                </ModalBody>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
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

const ColorLabel = styled.div`
    font-size: 13px;
    color: ${brandTheme.text.muted};
    line-height: 1.4;
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

    &:hover {
        transform: scale(1.02);
    }
`;

const AdvancedSection = styled.div`
    margin: ${brandTheme.spacing.lg} 0;
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

    &:hover {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
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
`;