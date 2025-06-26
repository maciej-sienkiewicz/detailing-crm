import React, { useState, useEffect } from 'react';
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
    FaIdCard,
    FaBriefcase,
    FaHeart,
    FaFileAlt,
    FaPlus,
    FaTrash,
    FaDownload,
    FaEye,
    FaHistory
} from 'react-icons/fa';
import { EmployeeDocument } from '../../../types';
import {
    fetchEmployeeDocuments,
    addEmployeeDocument,
    deleteEmployeeDocument
} from '../../../api/mocks/employeeDocumentsMocks';
import { DocumentFormModal } from './DocumentFormModal';
import {
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalBody,
    CloseButton,
    ButtonGroup,
    Button
} from '../styles/ModalStyles';
import {EmployeeHelpers, UserRoleLabels} from "../../../types/employeeTypes";

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
        lg: '24px',
        xl: '32px'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    divider: '#e5e7eb',
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

type TabType = 'overview' | 'employment' | 'documents' | 'permissions';

export const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
                                                                              employee,
                                                                              onClose,
                                                                              onEdit
                                                                          }) => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [showDocumentModal, setShowDocumentModal] = useState(false);

    // Ładowanie dokumentów
    useEffect(() => {
        if (activeTab === 'documents') {
            loadDocuments();
        }
    }, [activeTab, employee.id]);

    const loadDocuments = async () => {
        try {
            setLoadingDocuments(true);
            const employeeDocuments = await fetchEmployeeDocuments(employee.id);
            setDocuments(employeeDocuments);
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setLoadingDocuments(false);
        }
    };

    const handleDeleteDocument = async (documentId: string) => {
        if (window.confirm('Czy na pewno chcesz usunąć ten dokument?')) {
            try {
                const result = await deleteEmployeeDocument(documentId);
                if (result) {
                    setDocuments(documents.filter(doc => doc.id !== documentId));
                }
            } catch (error) {
                console.error('Error deleting document:', error);
            }
        }
    };

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

    const tabs = [
        { id: 'overview', label: 'Przegląd', icon: FaUser },
        { id: 'employment', label: 'Zatrudnienie', icon: FaBriefcase },
        { id: 'documents', label: 'Dokumenty', icon: FaFileAlt, badge: documents.length || undefined },
        { id: 'permissions', label: 'Uprawnienia', icon: FaShieldAlt }
    ];

    return (
        <ModalOverlay>
            <ModalContainer style={{ maxWidth: '900px', height: '90vh' }}>
                <ModalHeader>
                    {/* Header z podstawowymi informacjami */}
                    <EmployeeProfileHeader>
                        <ProfileAvatar>
                            {EmployeeHelpers.getInitials(employee.fullName)}
                        </ProfileAvatar>
                        <ProfileInfo>
                            <ProfileName>{employee.fullName}</ProfileName>
                            <ProfilePosition>{employee.position}</ProfilePosition>
                            <ProfileMeta>
                                <ProfileStatus $isActive={employee.isActive}>
                                    {employee.isActive ? '✓ Aktywny' : '⚠ Nieaktywny'}
                                </ProfileStatus>
                                <ProfileRole $role={employee.role}>
                                    <FaShieldAlt />
                                    {UserRoleLabels[employee.role]}
                                </ProfileRole>
                            </ProfileMeta>
                        </ProfileInfo>
                    </EmployeeProfileHeader>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </ModalHeader>

                <TabsContainer>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <TabButton
                                key={tab.id}
                                $active={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                            >
                                <Icon />
                                {tab.label}
                                {tab.badge && <TabBadge>{tab.badge}</TabBadge>}
                            </TabButton>
                        );
                    })}
                </TabsContainer>

                <ModalBody>
                    {/* Zawartość zakładek */}
                    {activeTab === 'overview' && (
                        <TabContent>
                            <QuickStatsGrid>
                                <StatCard>
                                    <StatIcon><FaCalendarAlt /></StatIcon>
                                    <StatContent>
                                        <StatValue>{EmployeeHelpers.calculateAge(employee.birthDate)} lat</StatValue>
                                        <StatLabel>Wiek</StatLabel>
                                    </StatContent>
                                </StatCard>
                                <StatCard>
                                    <StatIcon><FaClock /></StatIcon>
                                    <StatContent>
                                        <StatValue>{EmployeeHelpers.formatTenure(employee.hireDate)}</StatValue>
                                        <StatLabel>Staż pracy</StatLabel>
                                    </StatContent>
                                </StatCard>
                                <StatCard>
                                    <StatIcon><FaMoneyBillWave /></StatIcon>
                                    <StatContent>
                                        <StatValue>{employee.hourlyRate || 0} zł/h</StatValue>
                                        <StatLabel>Stawka godzinowa</StatLabel>
                                    </StatContent>
                                </StatCard>
                                <StatCard>
                                    <StatIcon><FaHistory /></StatIcon>
                                    <StatContent>
                                        <StatValue>{formatLastLogin(employee.lastLoginDate)}</StatValue>
                                        <StatLabel>Ostatnie logowanie</StatLabel>
                                    </StatContent>
                                </StatCard>
                            </QuickStatsGrid>

                            <DetailsSection>
                                <SectionTitle>Informacje kontaktowe</SectionTitle>
                                <DetailsGrid>
                                    <DetailItem>
                                        <DetailIcon><FaEnvelope /></DetailIcon>
                                        <DetailContent>
                                            <DetailLabel>Email</DetailLabel>
                                            <DetailValue>{employee.email}</DetailValue>
                                        </DetailContent>
                                    </DetailItem>
                                    <DetailItem>
                                        <DetailIcon><FaPhone /></DetailIcon>
                                        <DetailContent>
                                            <DetailLabel>Telefon</DetailLabel>
                                            <DetailValue>{employee.phone}</DetailValue>
                                        </DetailContent>
                                    </DetailItem>
                                    <DetailItem>
                                        <DetailIcon><FaCalendarAlt /></DetailIcon>
                                        <DetailContent>
                                            <DetailLabel>Data urodzenia</DetailLabel>
                                            <DetailValue>{formatDate(employee.birthDate)}</DetailValue>
                                        </DetailContent>
                                    </DetailItem>
                                </DetailsGrid>
                            </DetailsSection>

                            {employee.emergencyContact && (
                                <DetailsSection>
                                    <SectionTitle>Kontakt awaryjny</SectionTitle>
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
                                                <DetailLabel>Telefon</DetailLabel>
                                                <DetailValue>{employee.emergencyContact.phone}</DetailValue>
                                            </DetailContent>
                                        </DetailItem>
                                    </DetailsGrid>
                                </DetailsSection>
                            )}

                            {employee.notes && (
                                <DetailsSection>
                                    <SectionTitle>Dodatkowe informacje</SectionTitle>
                                    <NotesBox>{employee.notes}</NotesBox>
                                </DetailsSection>
                            )}
                        </TabContent>
                    )}

                    {activeTab === 'employment' && (
                        <TabContent>
                            <EmploymentOverview>
                                <OverviewCard>
                                    <OverviewIcon color={brandTheme.primary}>
                                        <FaMoneyBillWave />
                                    </OverviewIcon>
                                    <OverviewContent>
                                        <OverviewValue>{calculateMonthlySalary()}</OverviewValue>
                                        <OverviewLabel>Miesięczne wynagrodzenie brutto</OverviewLabel>
                                    </OverviewContent>
                                </OverviewCard>

                                <OverviewCard>
                                    <OverviewIcon color={brandTheme.status.success}>
                                        <FaClock />
                                    </OverviewIcon>
                                    <OverviewContent>
                                        <OverviewValue>{employee.workingHoursPerWeek || 40}h</OverviewValue>
                                        <OverviewLabel>Godziny tygodniowo</OverviewLabel>
                                    </OverviewContent>
                                </OverviewCard>

                                <OverviewCard>
                                    <OverviewIcon color={brandTheme.status.warning}>
                                        <FaMoneyBillWave />
                                    </OverviewIcon>
                                    <OverviewContent>
                                        <OverviewValue>{employee.bonusFromRevenue || 0}%</OverviewValue>
                                        <OverviewLabel>Bonus od obrotu</OverviewLabel>
                                    </OverviewContent>
                                </OverviewCard>
                            </EmploymentOverview>

                            <DetailsSection>
                                <SectionTitle>Szczegóły zatrudnienia</SectionTitle>
                                <DetailsGrid>
                                    <DetailItem>
                                        <DetailIcon><FaCalendarAlt /></DetailIcon>
                                        <DetailContent>
                                            <DetailLabel>Data zatrudnienia</DetailLabel>
                                            <DetailValue>{formatDate(employee.hireDate)}</DetailValue>
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
                                                {!employee.contractType && 'Nie określono'}
                                            </DetailValue>
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
                                        <DetailIcon><FaClock /></DetailIcon>
                                        <DetailContent>
                                            <DetailLabel>Staż pracy</DetailLabel>
                                            <DetailValue>{EmployeeHelpers.formatTenure(employee.hireDate)}</DetailValue>
                                        </DetailContent>
                                    </DetailItem>
                                </DetailsGrid>
                            </DetailsSection>

                            <DetailsSection>
                                <SectionTitle>Wynagrodzenie</SectionTitle>
                                <SalaryDetails>
                                    <SalaryItem>
                                        <SalaryLabel>Stawka podstawowa:</SalaryLabel>
                                        <SalaryValue>{employee.hourlyRate || 0} zł/h</SalaryValue>
                                    </SalaryItem>
                                    <SalaryItem>
                                        <SalaryLabel>Tygodniowe wynagrodzenie:</SalaryLabel>
                                        <SalaryValue>
                                            {employee.hourlyRate && employee.workingHoursPerWeek
                                                ? `${(employee.hourlyRate * employee.workingHoursPerWeek).toFixed(2)} zł`
                                                : 'Nie ustalono'
                                            }
                                        </SalaryValue>
                                    </SalaryItem>
                                    <SalaryItem>
                                        <SalaryLabel>Bonus od obrotu:</SalaryLabel>
                                        <SalaryValue>
                                            {employee.bonusFromRevenue > 0
                                                ? `${employee.bonusFromRevenue}% miesięcznego obrotu`
                                                : 'Brak bonusu'
                                            }
                                        </SalaryValue>
                                    </SalaryItem>
                                </SalaryDetails>
                            </DetailsSection>
                        </TabContent>
                    )}

                    {activeTab === 'documents' && (
                        <TabContent>
                            <DocumentsHeader>
                                <SectionTitle>Dokumenty pracownika</SectionTitle>
                                <AddDocumentButton onClick={() => setShowDocumentModal(true)}>
                                    <FaPlus />
                                    Dodaj dokument
                                </AddDocumentButton>
                            </DocumentsHeader>

                            {loadingDocuments ? (
                                <LoadingState>Ładowanie dokumentów...</LoadingState>
                            ) : documents.length === 0 ? (
                                <EmptyDocuments>
                                    <EmptyIcon><FaFileAlt /></EmptyIcon>
                                    <EmptyTitle>Brak dokumentów</EmptyTitle>
                                    <EmptyDescription>
                                        Ten pracownik nie ma jeszcze żadnych dokumentów w systemie
                                    </EmptyDescription>
                                </EmptyDocuments>
                            ) : (
                                <DocumentsList>
                                    {documents.map(document => (
                                        <DocumentItem key={document.id}>
                                            <DocumentIcon><FaFileAlt /></DocumentIcon>
                                            <DocumentInfo>
                                                <DocumentName>{document.name}</DocumentName>
                                                <DocumentMeta>
                                                    <DocumentType>{document.type}</DocumentType>
                                                    <DocumentDate>Dodano: {formatDate(document.uploadDate)}</DocumentDate>
                                                </DocumentMeta>
                                            </DocumentInfo>
                                            <DocumentActions>
                                                <DocumentActionButton title="Pobierz">
                                                    <FaDownload />
                                                </DocumentActionButton>
                                                <DocumentActionButton
                                                    title="Usuń"
                                                    onClick={() => handleDeleteDocument(document.id)}
                                                    $danger
                                                >
                                                    <FaTrash />
                                                </DocumentActionButton>
                                            </DocumentActions>
                                        </DocumentItem>
                                    ))}
                                </DocumentsList>
                            )}
                        </TabContent>
                    )}

                    {activeTab === 'permissions' && (
                        <TabContent>
                            <PermissionsOverview>
                                <PermissionCard $role={employee.role}>
                                    <PermissionIcon><FaShieldAlt /></PermissionIcon>
                                    <PermissionContent>
                                        <PermissionRole>{UserRoleLabels[employee.role]}</PermissionRole>
                                        <PermissionDescription>
                                            {employee.role === 'ADMIN' && 'Pełny dostęp do wszystkich funkcji systemu'}
                                            {employee.role === 'MANAGER' && 'Zarządzanie zespołem, klientami i raportami'}
                                            {employee.role === 'EMPLOYEE' && 'Standardowy dostęp do pracy z klientami'}
                                        </PermissionDescription>
                                    </PermissionContent>
                                </PermissionCard>
                            </PermissionsOverview>

                            <DetailsSection>
                                <SectionTitle>Status konta</SectionTitle>
                                <AccountStatus $isActive={employee.isActive}>
                                    <StatusIcon $isActive={employee.isActive}>
                                        {employee.isActive ? '✓' : '⚠'}
                                    </StatusIcon>
                                    <StatusContent>
                                        <StatusTitle>
                                            {employee.isActive ? 'Konto aktywne' : 'Konto nieaktywne'}
                                        </StatusTitle>
                                        <StatusDescription>
                                            {employee.isActive
                                                ? 'Pracownik może logować się do systemu i korzystać z przypisanych uprawnień'
                                                : 'Pracownik nie może logować się do systemu'
                                            }
                                        </StatusDescription>
                                    </StatusContent>
                                </AccountStatus>
                            </DetailsSection>

                            <DetailsSection>
                                <SectionTitle>Uprawnienia systemowe</SectionTitle>
                                <PermissionsList>
                                    {employee.role === 'ADMIN' && (
                                        <>
                                            <PermissionItem><FaSettings /> Administracja systemu</PermissionItem>
                                            <PermissionItem><FaUser /> Zarządzanie wszystkimi pracownikami</PermissionItem>
                                            <PermissionItem><FaMoneyBillWave /> Pełny dostęp do finansów</PermissionItem>
                                            <PermissionItem><FaFileAlt /> Wszystkie raporty i eksporty</PermissionItem>
                                        </>
                                    )}
                                    {employee.role === 'MANAGER' && (
                                        <>
                                            <PermissionItem><FaUser /> Zarządzanie zespołem</PermissionItem>
                                            <PermissionItem><FaFileAlt /> Raporty sprzedażowe</PermissionItem>
                                            <PermissionItem><FaEye /> Przeglądanie finansów</PermissionItem>
                                            <PermissionItem><FaBriefcase /> Zarządzanie klientami</PermissionItem>
                                        </>
                                    )}
                                    {employee.role === 'EMPLOYEE' && (
                                        <>
                                            <PermissionItem><FaBriefcase /> Obsługa klientów</PermissionItem>
                                            <PermissionItem><FaEye /> Przeglądanie własnych danych</PermissionItem>
                                            <PermissionItem><FaCalendarAlt /> Zarządzanie kalendarzem</PermissionItem>
                                        </>
                                    )}
                                </PermissionsList>
                            </DetailsSection>
                        </TabContent>
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

                {/* Modal dodawania dokumentu */}
                {showDocumentModal && (
                    <DocumentFormModal
                        employeeId={employee.id}
                        onSave={async (document) => {
                            try {
                                const savedDocument = await addEmployeeDocument(document);
                                setDocuments([...documents, savedDocument]);
                                setShowDocumentModal(false);
                            } catch (error) {
                                console.error('Error saving document:', error);
                            }
                        }}
                        onCancel={() => setShowDocumentModal(false)}
                    />
                )}
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
const EmployeeProfileHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    flex: 1;
`;

const ProfileAvatar = styled.div`
    width: 60px;
    height: 60px;
    background: ${brandTheme.primary};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
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
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.xs} 0;
    line-height: 1.2;
`;

const ProfilePosition = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    margin-bottom: ${brandTheme.spacing.sm};
`;

const ProfileMeta = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    flex-wrap: wrap;
`;

const ProfileStatus = styled.div<{ $isActive: boolean }>`
    display: inline-flex;
    align-items: center;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.md};
    font-size: 11px;
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
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.md};
    font-size: 11px;
    font-weight: 600;

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

const TabsContainer = styled.div`
    display: flex;
    border-bottom: 1px solid ${brandTheme.surfaceAlt};
    background: ${brandTheme.surface};
    padding: 0 ${brandTheme.spacing.lg};
    gap: 2px;
`;

const TabButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border: none;
    background: ${({ $active }) => $active ? brandTheme.surfaceAlt : 'transparent'};
    color: ${({ $active }) => $active ? brandTheme.primary : brandTheme.text.secondary};
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: ${brandTheme.radius.md} ${brandTheme.radius.md} 0 0;
    position: relative;
    white-space: nowrap;

    &:hover {
        background: ${brandTheme.surfaceAlt};
        color: ${brandTheme.primary};
    }

    ${({ $active }) => $active && `
        &::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background: ${brandTheme.primary};
        }
    `}
`;

const TabBadge = styled.span`
    background: ${brandTheme.primary};
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 16px;
    text-align: center;
`;

const TabContent = styled.div`
    padding: ${brandTheme.spacing.lg} 0;
`;

const QuickStatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.lg};
`;

const StatCard = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.border};
`;

const StatIcon = styled.div`
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

const StatContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const StatValue = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: 2px;
`;

const StatLabel = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
`;

const DetailsSection = styled.div`
    margin-bottom: ${brandTheme.spacing.lg};
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.md} 0;
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
    border: 1px solid ${brandTheme.border};
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

const NotesBox = styled.div`
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.border};
    font-size: 14px;
    line-height: 1.5;
    color: ${brandTheme.text.secondary};
`;

const EmploymentOverview = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.lg};
`;

const OverviewCard = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
`;

const OverviewIcon = styled.div<{ color: string }>`
    width: 48px;
    height: 48px;
    background: ${props => props.color}15;
    color: ${props => props.color};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
`;

const OverviewContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const OverviewValue = styled.div`
    font-size: 18px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: 2px;
`;

const OverviewLabel = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
`;

const SalaryDetails = styled.div`
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    border: 1px solid ${brandTheme.border};
`;

const SalaryItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.sm} 0;
    border-bottom: 1px solid ${brandTheme.border};

    &:last-child {
        border-bottom: none;
    }
`;

const SalaryLabel = styled.div`
    font-size: 13px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const SalaryValue = styled.div`
    font-size: 13px;
    color: ${brandTheme.text.primary};
    font-weight: 600;
`;

const DocumentsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${brandTheme.spacing.lg};
`;

const AddDocumentButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    border: 1px solid ${brandTheme.primary}30;
    border-radius: ${brandTheme.radius.md};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primary};
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
`;

const LoadingState = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${brandTheme.spacing.xl};
    color: ${brandTheme.text.muted};
    font-size: 14px;
`;

const EmptyDocuments = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xl};
    text-align: center;
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
    border: 2px dashed ${brandTheme.border};
`;

const EmptyIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${brandTheme.surface};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: ${brandTheme.text.muted};
    margin-bottom: ${brandTheme.spacing.md};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const EmptyTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.xs} 0;
`;

const EmptyDescription = styled.p`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    margin: 0;
    line-height: 1.5;
`;

const DocumentsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const DocumentItem = styled.div`
    display: flex;
    align-items: center;
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    transition: all 0.2s ease;

    &:hover {
        border-color: ${brandTheme.primary};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
`;

const DocumentIcon = styled.div`
    color: ${brandTheme.primary};
    font-size: 18px;
    margin-right: ${brandTheme.spacing.md};
    flex-shrink: 0;
`;

const DocumentInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const DocumentName = styled.div`
    font-weight: 600;
    font-size: 14px;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
`;

const DocumentMeta = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    flex-wrap: wrap;
`;

const DocumentType = styled.div`
    font-size: 11px;
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.md};
    color: ${brandTheme.text.muted};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const DocumentDate = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
`;

const DocumentActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};
    margin-left: ${brandTheme.spacing.md};
`;

const DocumentActionButton = styled.button<{ $danger?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: ${brandTheme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 13px;

    ${({ $danger }) => $danger ? `
        background: ${brandTheme.status.errorLight};
        color: ${brandTheme.status.error};
        
        &:hover {
            background: ${brandTheme.status.error};
            color: white;
            transform: translateY(-1px);
        }
    ` : `
        background: ${brandTheme.primaryGhost};
        color: ${brandTheme.primary};
        
        &:hover {
            background: ${brandTheme.primary};
            color: white;
            transform: translateY(-1px);
        }
    `}
`;

const PermissionsOverview = styled.div`
    margin-bottom: ${brandTheme.spacing.lg};
`;

const PermissionCard = styled.div<{ $role: string }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.border};

    ${({ $role }) => {
        switch ($role) {
            case 'ADMIN':
                return `
                    background: ${brandTheme.status.errorLight};
                    border-color: ${brandTheme.status.error}30;
                `;
            case 'MANAGER':
                return `
                    background: ${brandTheme.status.warningLight};
                    border-color: ${brandTheme.status.warning}30;
                `;
            default:
                return `
                    background: ${brandTheme.primaryGhost};
                    border-color: ${brandTheme.primary}30;
                `;
        }
    }}
`;

const PermissionIcon = styled.div`
    width: 48px;
    height: 48px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: ${brandTheme.primary};
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PermissionContent = styled.div`
    flex: 1;
`;

const PermissionRole = styled.h4`
    font-size: 18px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.xs} 0;
`;

const PermissionDescription = styled.p`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    margin: 0;
    line-height: 1.4;
`;

const AccountStatus = styled.div<{ $isActive: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.border};

    ${({ $isActive }) => $isActive ? `
        background: ${brandTheme.status.successLight};
        border-color: ${brandTheme.status.success}30;
    ` : `
        background: ${brandTheme.status.errorLight};
        border-color: ${brandTheme.status.error}30;
    `}
`;

const StatusIcon = styled.div<{ $isActive: boolean }>`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    flex-shrink: 0;

    ${({ $isActive }) => $isActive ? `
        background: ${brandTheme.status.success};
        color: white;
    ` : `
        background: ${brandTheme.status.error};
        color: white;
    `}
`;

const StatusContent = styled.div`
    flex: 1;
`;

const StatusTitle = styled.h5`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.xs} 0;
`;

const StatusDescription = styled.p`
    font-size: 13px;
    color: ${brandTheme.text.secondary};
    margin: 0;
    line-height: 1.4;
`;

const PermissionsList = styled.div`
    display: grid;
    gap: ${brandTheme.spacing.sm};
`;

const PermissionItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    color: ${brandTheme.text.primary};
    font-weight: 500;

    svg {
        color: ${brandTheme.primary};
        flex-shrink: 0;
    }
`;