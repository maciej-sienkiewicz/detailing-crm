import React, { useState } from 'react';
import styled from 'styled-components';
import { FaShieldAlt, FaCheck, FaTimes, FaUserShield, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { ExtendedEmployee, UserRole, UserRoleLabels } from '../EmployeesPage';
import {
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalBody,
    CloseButton,
    Form,
    FormGroup,
    Label,
    Select,
    HelpText,
    ButtonGroup,
    Button
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
        error: '#dc2626',
        errorLight: '#fee2e2',
        warning: '#d97706',
        warningLight: '#fef3c7'
    }
};

// Definicja uprawnień w systemie
interface Permission {
    id: string;
    name: string;
    description: string;
    category: 'employees' | 'clients' | 'finances' | 'settings' | 'reports' | 'system';
    level: 'view' | 'edit' | 'delete' | 'admin';
}

// Wszystkie dostępne uprawnienia w systemie
const ALL_PERMISSIONS: Permission[] = [
    // Pracownicy
    { id: 'employees_view', name: 'Przeglądanie pracowników', description: 'Dostęp do listy i danych pracowników', category: 'employees', level: 'view' },
    { id: 'employees_edit', name: 'Edycja pracowników', description: 'Możliwość edycji danych pracowników', category: 'employees', level: 'edit' },
    { id: 'employees_delete', name: 'Usuwanie pracowników', description: 'Możliwość usuwania pracowników', category: 'employees', level: 'delete' },
    { id: 'employees_salary', name: 'Zarządzanie wynagrodzeniami', description: 'Dostęp do danych o wynagrodzeniach', category: 'employees', level: 'admin' },
    { id: 'employees_permissions', name: 'Zarządzanie uprawnieniami', description: 'Możliwość zmiany uprawnień użytkowników', category: 'employees', level: 'admin' },

    // Klienci
    { id: 'clients_view', name: 'Przeglądanie klientów', description: 'Dostęp do bazy klientów', category: 'clients', level: 'view' },
    { id: 'clients_edit', name: 'Edycja klientów', description: 'Możliwość edycji danych klientów', category: 'clients', level: 'edit' },
    { id: 'clients_delete', name: 'Usuwanie klientów', description: 'Możliwość usuwania klientów', category: 'clients', level: 'delete' },
    { id: 'vehicles_view', name: 'Przeglądanie pojazdów', description: 'Dostęp do bazy pojazdów', category: 'clients', level: 'view' },
    { id: 'vehicles_edit', name: 'Edycja pojazdów', description: 'Możliwość edycji danych pojazdów', category: 'clients', level: 'edit' },

    // Finanse
    { id: 'finances_view', name: 'Przeglądanie finansów', description: 'Dostęp do modułu finansowego', category: 'finances', level: 'view' },
    { id: 'finances_edit', name: 'Edycja dokumentów finansowych', description: 'Możliwość dodawania i edycji dokumentów', category: 'finances', level: 'edit' },
    { id: 'finances_delete', name: 'Usuwanie dokumentów', description: 'Możliwość usuwania dokumentów finansowych', category: 'finances', level: 'delete' },
    { id: 'finances_export', name: 'Eksport danych księgowych', description: 'Możliwość eksportu danych do księgowości', category: 'finances', level: 'admin' },

    // Raporty
    { id: 'reports_view', name: 'Przeglądanie raportów', description: 'Dostęp do raportów i analiz', category: 'reports', level: 'view' },
    { id: 'reports_export', name: 'Eksport raportów', description: 'Możliwość eksportowania raportów', category: 'reports', level: 'edit' },
    { id: 'reports_advanced', name: 'Zaawansowane raporty', description: 'Dostęp do zaawansowanych analiz finansowych', category: 'reports', level: 'admin' },

    // Ustawienia
    { id: 'settings_view', name: 'Przeglądanie ustawień', description: 'Dostęp do ustawień systemu', category: 'settings', level: 'view' },
    { id: 'settings_edit', name: 'Edycja ustawień', description: 'Możliwość zmiany ustawień systemu', category: 'settings', level: 'edit' },
    { id: 'settings_admin', name: 'Administracja systemu', description: 'Pełny dostęp administratora', category: 'system', level: 'admin' }
];

// Domyślne uprawnienia dla ról
const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
    'ADMIN': ALL_PERMISSIONS.map(p => p.id), // Administrator ma wszystkie uprawnienia
    'MANAGER': [
        'employees_view', 'employees_edit', 'employees_salary',
        'clients_view', 'clients_edit', 'clients_delete',
        'vehicles_view', 'vehicles_edit',
        'finances_view', 'finances_edit', 'finances_export',
        'reports_view', 'reports_export', 'reports_advanced',
        'settings_view', 'settings_edit'
    ],
    'EMPLOYEE': [
        'clients_view', 'clients_edit',
        'vehicles_view', 'vehicles_edit',
        'finances_view',
        'reports_view',
        'settings_view'
    ]
};

interface PermissionsModalProps {
    employee: ExtendedEmployee;
    onSave: (employee: ExtendedEmployee) => void;
    onCancel: () => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
                                                                      employee,
                                                                      onSave,
                                                                      onCancel
                                                                  }) => {
    const [selectedRole, setSelectedRole] = useState<UserRole>(employee.role);
    const [customPermissions, setCustomPermissions] = useState<string[]>(
        DEFAULT_ROLE_PERMISSIONS[employee.role] || []
    );
    const [isActive, setIsActive] = useState(employee.isActive);

    // Aktualizacja uprawnień przy zmianie roli
    const handleRoleChange = (newRole: UserRole) => {
        setSelectedRole(newRole);
        setCustomPermissions(DEFAULT_ROLE_PERMISSIONS[newRole] || []);
    };

    // Toggle pojedynczego uprawnienia
    const togglePermission = (permissionId: string) => {
        setCustomPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const updatedEmployee: ExtendedEmployee = {
            ...employee,
            role: selectedRole,
            isActive: isActive
        };

        onSave(updatedEmployee);
    };

    // Grupowanie uprawnień według kategorii
    const permissionsByCategory = ALL_PERMISSIONS.reduce((acc, permission) => {
        if (!acc[permission.category]) {
            acc[permission.category] = [];
        }
        acc[permission.category].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    const categoryLabels = {
        employees: 'Zarządzanie pracownikami',
        clients: 'Klienci i pojazdy',
        finances: 'Moduł finansowy',
        reports: 'Raporty i analizy',
        settings: 'Ustawienia systemu',
        system: 'Administracja'
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            employees: brandTheme.status.warning,
            clients: brandTheme.primary,
            finances: brandTheme.status.success,
            reports: '#9333ea',
            settings: '#64748b',
            system: brandTheme.status.error
        };
        return colors[category as keyof typeof colors] || brandTheme.primary;
    };

    return (
        <ModalOverlay>
            <ModalContainer style={{ maxWidth: '800px', maxHeight: '90vh' }}>
                <ModalHeader>
                    <h2>Uprawnienia - {employee.fullName}</h2>
                    <CloseButton onClick={onCancel}>&times;</CloseButton>
                </ModalHeader>

                <ModalBody>
                    <Form onSubmit={handleSubmit}>
                        {/* Podstawowe ustawienia */}
                        <UserStatusSection>
                            <StatusCard $isActive={isActive}>
                                <StatusIcon $isActive={isActive}>
                                    <FaUserShield />
                                </StatusIcon>
                                <StatusContent>
                                    <StatusTitle>Status użytkownika</StatusTitle>
                                    <StatusToggle>
                                        <ToggleButton
                                            type="button"
                                            $active={isActive}
                                            onClick={() => setIsActive(!isActive)}
                                        >
                                            {isActive ? (
                                                <>
                                                    <FaCheck />
                                                    Aktywny
                                                </>
                                            ) : (
                                                <>
                                                    <FaTimes />
                                                    Nieaktywny
                                                </>
                                            )}
                                        </ToggleButton>
                                    </StatusToggle>
                                </StatusContent>
                            </StatusCard>
                        </UserStatusSection>

                        {/* Wybór roli */}
                        <FormGroup>
                            <Label htmlFor="role">Rola użytkownika</Label>
                            <Select
                                id="role"
                                value={selectedRole}
                                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                            >
                                {Object.entries(UserRoleLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </Select>
                            <HelpText>
                                Wybór roli automatycznie ustawi odpowiednie uprawnienia.
                                Możesz je następnie dostosować indywidualnie.
                            </HelpText>
                        </FormGroup>

                        {/* Szczegółowe uprawnienia */}
                        <PermissionsSection>
                            <SectionTitle>Szczegółowe uprawnienia</SectionTitle>

                            {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                                <PermissionCategory key={category}>
                                    <CategoryHeader>
                                        <CategoryIcon $color={getCategoryColor(category)}>
                                            <FaShieldAlt />
                                        </CategoryIcon>
                                        <CategoryTitle>
                                            {categoryLabels[category as keyof typeof categoryLabels]}
                                        </CategoryTitle>
                                        <CategoryStats>
                                            {permissions.filter(p => customPermissions.includes(p.id)).length}/{permissions.length}
                                        </CategoryStats>
                                    </CategoryHeader>

                                    <PermissionsList>
                                        {permissions.map(permission => (
                                            <PermissionItem key={permission.id}>
                                                <PermissionCheckbox
                                                    type="checkbox"
                                                    checked={customPermissions.includes(permission.id)}
                                                    onChange={() => togglePermission(permission.id)}
                                                />
                                                <PermissionContent>
                                                    <PermissionName>
                                                        {permission.name}
                                                        <PermissionLevel level={permission.level}>
                                                            {permission.level === 'view' && <FaEye />}
                                                            {permission.level === 'edit' && <FaEdit />}
                                                            {permission.level === 'delete' && <FaTrash />}
                                                            {permission.level === 'admin' && <FaShieldAlt />}
                                                        </PermissionLevel>
                                                    </PermissionName>
                                                    <PermissionDescription>
                                                        {permission.description}
                                                    </PermissionDescription>
                                                </PermissionContent>
                                            </PermissionItem>
                                        ))}
                                    </PermissionsList>
                                </PermissionCategory>
                            ))}
                        </PermissionsSection>

                        {/* Podsumowanie */}
                        <PermissionsSummary>
                            <SummaryTitle>Podsumowanie uprawnień</SummaryTitle>
                            <SummaryStats>
                                <SummaryItem>
                                    <SummaryLabel>Aktywne uprawnienia:</SummaryLabel>
                                    <SummaryValue>{customPermissions.length}/{ALL_PERMISSIONS.length}</SummaryValue>
                                </SummaryItem>
                                <SummaryItem>
                                    <SummaryLabel>Rola:</SummaryLabel>
                                    <SummaryValue>{UserRoleLabels[selectedRole]}</SummaryValue>
                                </SummaryItem>
                                <SummaryItem>
                                    <SummaryLabel>Status:</SummaryLabel>
                                    <SummaryValue $status={isActive ? 'active' : 'inactive'}>
                                        {isActive ? 'Aktywny' : 'Nieaktywny'}
                                    </SummaryValue>
                                </SummaryItem>
                            </SummaryStats>
                        </PermissionsSummary>

                        <ButtonGroup>
                            <Button type="button" secondary onClick={onCancel}>
                                Anuluj
                            </Button>
                            <Button type="submit" primary>
                                Zapisz uprawnienia
                            </Button>
                        </ButtonGroup>
                    </Form>
                </ModalBody>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
const UserStatusSection = styled.div`
    margin-bottom: ${brandTheme.spacing.lg};
`;

const StatusCard = styled.div<{ $isActive: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg};
    background: ${props => props.$isActive ? brandTheme.status.successLight : brandTheme.status.errorLight};
    border: 1px solid ${props => props.$isActive ? brandTheme.status.success : brandTheme.status.error}30;
    border-radius: ${brandTheme.radius.lg};
`;

const StatusIcon = styled.div<{ $isActive: boolean }>`
    width: 48px;
    height: 48px;
    background: ${props => props.$isActive ? brandTheme.status.success : brandTheme.status.error};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
`;

const StatusContent = styled.div`
    flex: 1;
`;

const StatusTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
`;

const StatusToggle = styled.div`
    display: flex;
    align-items: center;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border: none;
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    background: ${props => props.$active ? brandTheme.status.success : brandTheme.status.error};
    color: white;

    &:hover {
        transform: scale(1.05);
    }
`;

const PermissionsSection = styled.div`
    margin: ${brandTheme.spacing.lg} 0;
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.lg} 0;
    padding-bottom: ${brandTheme.spacing.sm};
    border-bottom: 2px solid ${brandTheme.surfaceAlt};
`;

const PermissionCategory = styled.div`
    margin-bottom: ${brandTheme.spacing.lg};
    background: ${brandTheme.surface};
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: ${brandTheme.radius.lg};
    overflow: hidden;
`;

const CategoryHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const CategoryIcon = styled.div<{ $color: string }>`
    width: 32px;
    height: 32px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
`;

const CategoryTitle = styled.h4`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    flex: 1;
`;

const CategoryStats = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    background: ${brandTheme.surface};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
`;

const PermissionsList = styled.div`
    padding: ${brandTheme.spacing.sm};
`;

const PermissionItem = styled.label`
    display: flex;
    align-items: flex-start;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.surfaceAlt};
    }
`;

const PermissionCheckbox = styled.input`
    width: 18px;
    height: 18px;
    margin-top: 2px;
    accent-color: ${brandTheme.primary};
    cursor: pointer;
`;

const PermissionContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const PermissionName = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 500;
    color: ${brandTheme.text.primary};
    margin-bottom: 2px;
`;

const PermissionLevel = styled.div<{ level: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 10px;

    ${({ level }) => {
        switch (level) {
            case 'view':
                return `
                    background: ${brandTheme.primary}15;
                    color: ${brandTheme.primary};
                `;
            case 'edit':
                return `
                    background: ${brandTheme.status.warning}15;
                    color: ${brandTheme.status.warning};
                `;
            case 'delete':
                return `
                    background: ${brandTheme.status.error}15;
                    color: ${brandTheme.status.error};
                `;
            case 'admin':
                return `
                    background: #9333ea15;
                    color: #9333ea;
                `;
            default:
                return `
                    background: ${brandTheme.surfaceAlt};
                    color: ${brandTheme.text.muted};
                `;
        }
    }}
`;

const PermissionDescription = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    line-height: 1.4;
`;

const PermissionsSummary = styled.div`
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    margin: ${brandTheme.spacing.lg} 0;
`;

const SummaryTitle = styled.h4`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.md} 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const SummaryStats = styled.div`
    display: grid;
    gap: ${brandTheme.spacing.sm};
`;

const SummaryItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const SummaryLabel = styled.div`
    font-size: 13px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const SummaryValue = styled.div<{ $status?: 'active' | 'inactive' }>`
    font-size: 13px;
    font-weight: 600;

    ${({ $status }) => {
        if ($status === 'active') {
            return `color: ${brandTheme.status.success};`;
        } else if ($status === 'inactive') {
            return `color: ${brandTheme.status.error};`;
        } else {
            return `color: ${brandTheme.text.primary};`;
        }
    }}
`;