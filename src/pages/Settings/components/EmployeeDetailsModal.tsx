import React from 'react';
import styled from 'styled-components';
import {
    FaUser,
    FaCalendarAlt,
    FaEnvelope,
    FaPhone,
    FaClock,
    FaMoneyBillWave,
    FaShieldAlt,
    FaEdit,
    FaUserTie,
    FaMapMarkerAlt,
    FaIdCard,
    FaBriefcase,
    FaHeart
} from 'react-icons/fa';
import { ExtendedEmployee, UserRoleLabels } from '../EmployeesPage';
import {
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalBody,
    CloseButton,
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
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2'
    }
};

interface EmployeeDetailsModalProps {
    employee: ExtendedEmployee;
    onClose: () => void;
    onEdit: () => void;
}

export const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
                                                                              employee,
                                                                              onClose,
                                                                              onEdit
                                                                          }) => {
    // Formatowanie daty
    const formatDate = (dateString: string): string => {
        if (!dateString) return 'Nie podano';
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Obliczanie wieku
    const calculateAge = (birthDate: string): number => {
        if (!birthDate) return 0;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    // Obliczanie stażu pracy
    const calculateWorkExperience = (hireDate: string): string => {
        if (!hireDate) return 'Nie podano';

        const hire = new Date(hireDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - hire.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);

        if (years > 0) {
            return `${years} ${years === 1 ? 'rok' : years < 5 ? 'lata' : 'lat'}${months > 0 ? ` i ${months} mies.` : ''}`;
        } else if (months > 0) {
            return `${months} ${months === 1 ? 'miesiąc' : months < 5 ? 'miesiące' : 'miesięcy'}`;
        } else {
            return 'Mniej niż miesiąc';
        }
    };

    // Obliczanie miesięcznego wynagrodzenia
    const calculateMonthlySalary = (): string => {
        if (!employee.hourlyRate || !employee.workingHoursPerWeek) return 'Nie ustalono';
        const monthly = employee.hourlyRate * employee.workingHoursPerWeek * 4.33;
        return `${monthly.toFixed(2)} zł`;
    };

    // Formatowanie ostatniego logowania
    const formatLastLogin = (lastLoginDate?: string): string => {
        if (!lastLoginDate) return 'Nigdy';

        const lastLogin = new Date(lastLoginDate);
        const now = new Date();
        const diffTime = now.getTime() - lastLogin.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Dzisiaj';
        } else if (diffDays === 1) {
            return 'Wczoraj';
        } else if (diffDays < 7) {
            return `${diffDays} dni temu`;
        } else {
            return formatDate(lastLoginDate);
        }
    };

    return (
        <ModalOverlay>
            <ModalContainer style={{ maxWidth: '700px' }}>
                <ModalHeader>
                    <h2>Szczegóły pracownika</h2>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </ModalHeader>

                <ModalBody>
                    {/* Header z podstawowymi informacjami */}
                    <EmployeeProfileHeader>
                        <ProfileAvatar color={employee.color}>
                            {employee.fullName.split(' ').map(name => name[0]).join('')}
                        </ProfileAvatar>
                        <ProfileInfo>
                            <ProfileName>{employee.fullName}</ProfileName>
                            <ProfilePosition>{employee.position}</ProfilePosition>
                            <ProfileStatus $isActive={employee.isActive}>
                                {employee.isActive ? '✓ Aktywny' : '⚠ Nieaktywny'}
                            </ProfileStatus>
                        </ProfileInfo>
                        <ProfileRole $role={employee.role}>
                            <FaShieldAlt />
                            {UserRoleLabels[employee.role]}
                        </ProfileRole>
                    </EmployeeProfileHeader>

                    {/* Szczegółowe informacje */}
                    <DetailsSection>
                        <SectionTitle>
                            <FaUser />
                            Informacje osobiste
                        </SectionTitle>

                        <DetailsGrid>
                            <DetailItem>
                                <DetailIcon><FaIdCard /></DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Wiek</DetailLabel>
                                    <DetailValue>
                                        {employee.birthDate ? `${calculateAge(employee.birthDate)} lat` : 'Nie podano'}
                                    </DetailValue>
                                </DetailContent>
                            </DetailItem>

                            <DetailItem>
                                <DetailIcon><FaCalendarAlt /></DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Data urodzenia</DetailLabel>
                                    <DetailValue>{formatDate(employee.birthDate)}</DetailValue>
                                </DetailContent>
                            </DetailItem>

                            <DetailItem>
                                <DetailIcon><FaEnvelope /></DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Adres email</DetailLabel>
                                    <DetailValue>{employee.email}</DetailValue>
                                </DetailContent>
                            </DetailItem>

                            <DetailItem>
                                <DetailIcon><FaPhone /></DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Numer telefonu</DetailLabel>
                                    <DetailValue>{employee.phone}</DetailValue>
                                </DetailContent>
                            </DetailItem>
                        </DetailsGrid>
                    </DetailsSection>

                    {/* Informacje o zatrudnieniu */}
                    <DetailsSection>
                        <SectionTitle>
                            <FaBriefcase />
                            Zatrudnienie
                        </SectionTitle>

                        <DetailsGrid>
                            <DetailItem>
                                <DetailIcon><FaCalendarAlt /></DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Data zatrudnienia</DetailLabel>
                                    <DetailValue>{formatDate(employee.hireDate)}</DetailValue>
                                </DetailContent>
                            </DetailItem>

                            <DetailItem>
                                <DetailIcon><FaClock /></DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Staż pracy</DetailLabel>
                                    <DetailValue>{calculateWorkExperience(employee.hireDate)}</DetailValue>
                                </DetailContent>
                            </DetailItem>

                            <DetailItem>
                                <DetailIcon><FaUserTie /></DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Stanowisko</DetailLabel>
                                    <DetailValue>{employee.position}</DetailValue>
                                </DetailContent>
                            </DetailItem>

                            <DetailItem>
                                <DetailIcon><FaBriefcase /></DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Typ umowy</DetailLabel>
                                    <DetailValue>
                                        {employee.contractType === 'EMPLOYMENT' && 'Umowa o pracę'}
                                        {employee.contractType === 'B2B' && 'Umowa B2B'}
                                        {employee.contractType === 'MANDATE' && 'Umowa zlecenie'}
                                    </DetailValue>
                                </DetailContent>
                            </DetailItem>

                            <DetailItem>
                                <DetailIcon><FaClock /></DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Godziny pracy</DetailLabel>
                                    <DetailValue>{employee.workingHoursPerWeek || 40}h/tydzień</DetailValue>
                                </DetailContent>
                            </DetailItem>

                            <DetailItem>
                                <DetailIcon><FaCalendarAlt /></DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Ostatnie logowanie</DetailLabel>
                                    <DetailValue>{formatLastLogin(employee.lastLoginDate)}</DetailValue>
                                </DetailContent>
                            </DetailItem>
                        </DetailsGrid>
                    </DetailsSection>

                    {/* Informacje o wynagrodzeniu */}
                    <DetailsSection>
                        <SectionTitle>
                            <FaMoneyBillWave />
                            Wynagrodzenie
                        </SectionTitle>

                        <SalaryGrid>
                            <SalaryCard>
                                <SalaryIcon>
                                    <FaMoneyBillWave />
                                </SalaryIcon>
                                <SalaryContent>
                                    <SalaryValue>{employee.hourlyRate || 0} zł</SalaryValue>
                                    <SalaryLabel>Stawka godzinowa</SalaryLabel>
                                </SalaryContent>
                            </SalaryCard>

                            <SalaryCard>
                                <SalaryIcon>
                                    <FaCalendarAlt />
                                </SalaryIcon>
                                <SalaryContent>
                                    <SalaryValue>{calculateMonthlySalary()}</SalaryValue>
                                    <SalaryLabel>Miesięczne brutto</SalaryLabel>
                                </SalaryContent>
                            </SalaryCard>

                            <SalaryCard>
                                <SalaryIcon>
                                    <FaMoneyBillWave />
                                </SalaryIcon>
                                <SalaryContent>
                                    <SalaryValue>{employee.bonusFromRevenue || 0}%</SalaryValue>
                                    <SalaryLabel>Bonus od obrotu</SalaryLabel>
                                </SalaryContent>
                            </SalaryCard>
                        </SalaryGrid>
                    </DetailsSection>

                    {/* Kontakt awaryjny */}
                    {employee.emergencyContact && (
                        <DetailsSection>
                            <SectionTitle>
                                <FaHeart />
                                Kontakt awaryjny
                            </SectionTitle>

                            <DetailsGrid>
                                <DetailItem>
                                    <DetailIcon><FaUser /></DetailIcon>
                                    <DetailContent>
                                        <DetailLabel>Imię i nazwisko</DetailLabel>
                                        <DetailValue>{employee.emergencyContact.name}</DetailValue>
                                    </DetailContent>
                                </DetailItem>

                                <DetailItem>
                                    <DetailIcon><FaPhone /></DetailIcon>
                                    <DetailContent>
                                        <DetailLabel>Numer telefonu</DetailLabel>
                                        <DetailValue>{employee.emergencyContact.phone}</DetailValue>
                                    </DetailContent>
                                </DetailItem>

                                <DetailItem>
                                    <DetailIcon><FaHeart /></DetailIcon>
                                    <DetailContent>
                                        <DetailLabel>Stopień pokrewieństwa</DetailLabel>
                                        <DetailValue>{employee.emergencyContact.relation}</DetailValue>
                                    </DetailContent>
                                </DetailItem>
                            </DetailsGrid>
                        </DetailsSection>
                    )}

                    <ButtonGroup>
                        <Button type="button" secondary onClick={onClose}>
                            Zamknij
                        </Button>
                        <Button type="button" primary onClick={onEdit}>
                            <FaEdit />
                            Edytuj pracownika
                        </Button>
                    </ButtonGroup>
                </ModalBody>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
const EmployeeProfileHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.lg};
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
    margin-bottom: ${brandTheme.spacing.lg};

    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
    }
`;

const ProfileAvatar = styled.div<{ color: string }>`
    width: 80px;
    height: 80px;
    background: ${props => props.color};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 700;
    text-transform: uppercase;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ProfileInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const ProfileName = styled.h2`
    font-size: 24px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.xs} 0;
    line-height: 1.2;
`;

const ProfilePosition = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    margin-bottom: ${brandTheme.spacing.sm};
`;

const ProfileStatus = styled.div<{ $isActive: boolean }>`
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

const ProfileRole = styled.div<{ $role: string }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    font-size: 13px;
    font-weight: 600;
    flex-shrink: 0;
    
    ${({ $role }) => {
    switch ($role) {
        case 'ADMIN':
            return `
                    background: ${brandTheme.status.errorLight};
                    color: ${brandTheme.status.error};
                `;
        case 'MANAGER':
            return `
                    background: ${brandTheme.status.warningLight};
                    color: ${brandTheme.status.warning};
                `;
        default:
            return `
                    background: ${brandTheme.primaryGhost};
                    color: ${brandTheme.primary};
                `;
    }
}}
`;

const DetailsSection = styled.div`
    margin-bottom: ${brandTheme.spacing.lg};
`;

const SectionTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.lg} 0;
    padding-bottom: ${brandTheme.spacing.sm};
    border-bottom: 2px solid ${brandTheme.surfaceAlt};
`;

const DetailsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${brandTheme.spacing.md};
`;

const DetailItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surface};
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: ${brandTheme.radius.md};
`;

const DetailIcon = styled.div`
    width: 20px;
    color: ${brandTheme.text.muted};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
`;

const DetailContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const DetailLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
`;

const DetailValue = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.primary};
    font-weight: 500;
    word-break: break-word;
`;

const SalaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: ${brandTheme.spacing.md};
`;

const SalaryCard = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surface};
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: ${brandTheme.radius.lg};
`;

const SalaryIcon = styled.div`
    width: 40px;
    height: 40px;
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
`;

const SalaryContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const SalaryValue = styled.div`
    font-size: 18px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: 2px;
`;

const SalaryLabel = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
`;