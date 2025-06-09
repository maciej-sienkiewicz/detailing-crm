import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import {
    FaBuilding,
    FaEnvelope,
    FaImage,
    FaCheck,
    FaTimes,
    FaEdit,
    FaSave,
    FaSpinner,
    FaEye,
    FaEyeSlash,
    FaCheckCircle,
    FaExclamationTriangle,
    FaUpload,
    FaTrash,
    FaServer,
    FaCreditCard,
    FaShieldAlt,
    FaInfoCircle,
    FaGlobe,
    FaPhone,
    FaMapMarkerAlt
} from 'react-icons/fa';

// Professional theme matching finances module
const brandTheme = {
    primary: '#1a365d',
    primaryLight: '#2c5aa0',
    primaryDark: '#0f2027',
    primaryGhost: 'rgba(26, 54, 93, 0.04)',

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
    },

    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }
};

// Mock data
const mockCompanyData = {
    basicInfo: {
        companyName: 'AutoSerwis Premium',
        taxId: '123-456-78-90',
        address: 'ul. Motoryzacyjna 123, 00-001 Warszawa',
        phone: '+48 123 456 789',
        website: 'https://autoserwis-premium.pl'
    },
    bankSettings: {
        bankAccountNumber: '12 3456 7890 1234 5678 9012 3456',
        bankName: 'PKO Bank Polski',
        swiftCode: 'PKOPPLPW',
        accountHolderName: 'AutoSerwis Premium Sp. z o.o.'
    },
    emailSettings: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUsername: 'noreply@autoserwis-premium.pl',
        senderEmail: 'noreply@autoserwis-premium.pl',
        senderName: 'AutoSerwis Premium',
        imapHost: 'imap.gmail.com',
        imapPort: 993,
        useSSL: true,
        useTLS: true,
        smtpConfigured: true,
        imapConfigured: false
    },
    logoSettings: {
        hasLogo: true,
        logoFileName: 'logo.png',
        logoUrl: 'https://via.placeholder.com/200x100/1a365d/ffffff?text=AutoSerwis'
    }
};

type EditingSection = 'basic' | 'bank' | 'email' | 'logo' | null;

const CompanySettingsPage = forwardRef<{ handleSave: () => void }>((props, ref) => {
    const [formData, setFormData] = useState(mockCompanyData);
    const [originalData, setOriginalData] = useState(mockCompanyData);
    const [editingSection, setEditingSection] = useState<EditingSection>(null);
    const [saving, setSaving] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ smtp: false, imap: false });
    const [testingEmail, setTestingEmail] = useState(false);
    const [emailTestResult, setEmailTestResult] = useState<any>(null);

    useImperativeHandle(ref, () => ({
        handleSave: handleSaveAll
    }));

    const handleInputChange = (section: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSaveAll = async () => {
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOriginalData(formData);
        setEditingSection(null);
        setSaving(false);
    };

    const handleSaveSection = async (section: EditingSection) => {
        if (!section) return;
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setOriginalData(formData);
        setEditingSection(null);
        setSaving(false);
    };

    const handleCancelSection = (section: EditingSection) => {
        if (!section) return;
        setFormData(originalData);
        setEditingSection(null);
    };

    const testEmailConnection = async () => {
        setTestingEmail(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setEmailTestResult({
            success: Math.random() > 0.3,
            message: Math.random() > 0.3 ? 'Połączenie z serwerem SMTP udane' : 'Błąd połączenia - sprawdź dane konfiguracji'
        });
        setTestingEmail(false);
    };

    const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

    const getCompletionPercentage = () => {
        const fields = [
            formData.basicInfo.companyName,
            formData.basicInfo.taxId,
            formData.basicInfo.address,
            formData.basicInfo.phone,
            formData.bankSettings.bankAccountNumber,
            formData.emailSettings.smtpHost,
            formData.emailSettings.senderEmail,
            formData.logoSettings.hasLogo
        ];
        const completed = fields.filter(field => field && field !== false).length;
        return Math.round((completed / fields.length) * 100);
    };

    return (
        <PageContainer>
            {/* Progress Summary - matching finances style */}
            {/* Settings Content */}
            <ContentContainer>
                {/* Basic Information */}
                <SettingsCard>
                    <CardHeader>
                        <HeaderContent>
                            <HeaderIcon>
                                <FaBuilding />
                            </HeaderIcon>
                            <HeaderText>
                                <HeaderTitle>Dane podstawowe</HeaderTitle>
                                <HeaderSubtitle>Podstawowe informacje identyfikacyjne firmy</HeaderSubtitle>
                            </HeaderText>
                        </HeaderContent>
                        <HeaderActions>
                            {editingSection === 'basic' ? (
                                <ActionGroup>
                                    <SecondaryButton onClick={() => handleCancelSection('basic')}>
                                        <FaTimes />
                                        Anuluj
                                    </SecondaryButton>
                                    <PrimaryButton onClick={() => handleSaveSection('basic')} disabled={saving}>
                                        {saving ? <FaSpinner className="spinning" /> : <FaSave />}
                                        Zapisz
                                    </PrimaryButton>
                                </ActionGroup>
                            ) : (
                                <SecondaryButton onClick={() => setEditingSection('basic')}>
                                    <FaEdit />
                                    Edytuj
                                </SecondaryButton>
                            )}
                        </HeaderActions>
                    </CardHeader>

                    <CardBody>
                        <FormGrid>
                            <FormField>
                                <FieldLabel>
                                    <FaBuilding />
                                    Nazwa firmy
                                    <RequiredMark>*</RequiredMark>
                                </FieldLabel>
                                {editingSection === 'basic' ? (
                                    <Input
                                        value={formData.basicInfo.companyName}
                                        onChange={(e) => handleInputChange('basicInfo', 'companyName', e.target.value)}
                                        placeholder="Wprowadź nazwę firmy"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.basicInfo.companyName}>
                                        {formData.basicInfo.companyName || 'Nie podano'}
                                    </DisplayValue>
                                )}
                            </FormField>

                            <FormField>
                                <FieldLabel>
                                    <span className="icon">🏛️</span>
                                    NIP
                                    <RequiredMark>*</RequiredMark>
                                    <ValidationStatus $valid={!!formData.basicInfo.taxId}>
                                        {formData.basicInfo.taxId ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                    </ValidationStatus>
                                </FieldLabel>
                                {editingSection === 'basic' ? (
                                    <Input
                                        value={formData.basicInfo.taxId}
                                        onChange={(e) => handleInputChange('basicInfo', 'taxId', e.target.value)}
                                        placeholder="123-456-78-90"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.basicInfo.taxId}>
                                        {formData.basicInfo.taxId || 'Nie podano'}
                                    </DisplayValue>
                                )}
                            </FormField>

                            <FormField $fullWidth>
                                <FieldLabel>
                                    <FaMapMarkerAlt />
                                    Adres
                                </FieldLabel>
                                {editingSection === 'basic' ? (
                                    <Input
                                        value={formData.basicInfo.address}
                                        onChange={(e) => handleInputChange('basicInfo', 'address', e.target.value)}
                                        placeholder="ul. Nazwa 123, 00-000 Miasto"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.basicInfo.address}>
                                        {formData.basicInfo.address || 'Nie podano'}
                                    </DisplayValue>
                                )}
                            </FormField>

                            <FormField>
                                <FieldLabel>
                                    <FaPhone />
                                    Telefon
                                </FieldLabel>
                                {editingSection === 'basic' ? (
                                    <Input
                                        value={formData.basicInfo.phone}
                                        onChange={(e) => handleInputChange('basicInfo', 'phone', e.target.value)}
                                        placeholder="+48 123 456 789"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.basicInfo.phone}>
                                        {formData.basicInfo.phone || 'Nie podano'}
                                    </DisplayValue>
                                )}
                            </FormField>

                            <FormField>
                                <FieldLabel>
                                    <FaGlobe />
                                    Strona WWW
                                </FieldLabel>
                                {editingSection === 'basic' ? (
                                    <Input
                                        value={formData.basicInfo.website}
                                        onChange={(e) => handleInputChange('basicInfo', 'website', e.target.value)}
                                        placeholder="https://firma.pl"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.basicInfo.website}>
                                        {formData.basicInfo.website ? (
                                            <WebsiteLink href={formData.basicInfo.website} target="_blank">
                                                {formData.basicInfo.website}
                                            </WebsiteLink>
                                        ) : (
                                            'Nie podano'
                                        )}
                                    </DisplayValue>
                                )}
                            </FormField>
                        </FormGrid>
                    </CardBody>
                </SettingsCard>

                {/* Bank Settings */}
                <SettingsCard>
                    <CardHeader>
                        <HeaderContent>
                            <HeaderIcon>
                                <FaCreditCard />
                            </HeaderIcon>
                            <HeaderText>
                                <HeaderTitle>Dane bankowe</HeaderTitle>
                                <HeaderSubtitle>Informacje o koncie bankowym firmy</HeaderSubtitle>
                            </HeaderText>
                        </HeaderContent>
                        <HeaderActions>
                            {editingSection === 'bank' ? (
                                <ActionGroup>
                                    <SecondaryButton onClick={() => handleCancelSection('bank')}>
                                        <FaTimes />
                                        Anuluj
                                    </SecondaryButton>
                                    <PrimaryButton onClick={() => handleSaveSection('bank')} disabled={saving}>
                                        {saving ? <FaSpinner className="spinning" /> : <FaSave />}
                                        Zapisz
                                    </PrimaryButton>
                                </ActionGroup>
                            ) : (
                                <SecondaryButton onClick={() => setEditingSection('bank')}>
                                    <FaEdit />
                                    Edytuj
                                </SecondaryButton>
                            )}
                        </HeaderActions>
                    </CardHeader>

                    <CardBody>
                        <FormGrid>
                            <FormField $fullWidth>
                                <FieldLabel>Numer konta bankowego</FieldLabel>
                                {editingSection === 'bank' ? (
                                    <Input
                                        value={formData.bankSettings.bankAccountNumber}
                                        onChange={(e) => handleInputChange('bankSettings', 'bankAccountNumber', e.target.value)}
                                        placeholder="12 3456 7890 1234 5678 9012 3456"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.bankSettings.bankAccountNumber}>
                                        {formData.bankSettings.bankAccountNumber || 'Nie podano'}
                                    </DisplayValue>
                                )}
                            </FormField>

                            <FormField>
                                <FieldLabel>Nazwa banku</FieldLabel>
                                {editingSection === 'bank' ? (
                                    <Input
                                        value={formData.bankSettings.bankName}
                                        onChange={(e) => handleInputChange('bankSettings', 'bankName', e.target.value)}
                                        placeholder="Nazwa banku"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.bankSettings.bankName}>
                                        {formData.bankSettings.bankName || 'Nie podano'}
                                    </DisplayValue>
                                )}
                            </FormField>

                            <FormField>
                                <FieldLabel>Kod SWIFT</FieldLabel>
                                {editingSection === 'bank' ? (
                                    <Input
                                        value={formData.bankSettings.swiftCode}
                                        onChange={(e) => handleInputChange('bankSettings', 'swiftCode', e.target.value)}
                                        placeholder="PKOPPLPW"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.bankSettings.swiftCode}>
                                        {formData.bankSettings.swiftCode || 'Nie podano'}
                                    </DisplayValue>
                                )}
                            </FormField>
                        </FormGrid>
                    </CardBody>
                </SettingsCard>

                {/* Email Settings */}
                <SettingsCard>
                    <CardHeader>
                        <HeaderContent>
                            <HeaderIcon>
                                <FaEnvelope />
                            </HeaderIcon>
                            <HeaderText>
                                <HeaderTitle>Ustawienia email</HeaderTitle>
                                <HeaderSubtitle>Konfiguracja automatycznych powiadomień</HeaderSubtitle>
                            </HeaderText>
                        </HeaderContent>
                        <HeaderActions>
                            <SecondaryButton onClick={testEmailConnection} disabled={testingEmail}>
                                {testingEmail ? <FaSpinner className="spinning" /> : <FaServer />}
                                Testuj połączenie
                            </SecondaryButton>
                            {editingSection === 'email' ? (
                                <ActionGroup>
                                    <SecondaryButton onClick={() => handleCancelSection('email')}>
                                        <FaTimes />
                                        Anuluj
                                    </SecondaryButton>
                                    <PrimaryButton onClick={() => handleSaveSection('email')} disabled={saving}>
                                        {saving ? <FaSpinner className="spinning" /> : <FaSave />}
                                        Zapisz
                                    </PrimaryButton>
                                </ActionGroup>
                            ) : (
                                <SecondaryButton onClick={() => setEditingSection('email')}>
                                    <FaEdit />
                                    Edytuj
                                </SecondaryButton>
                            )}
                        </HeaderActions>
                    </CardHeader>

                    {emailTestResult && (
                        <TestResultBanner $success={emailTestResult.success}>
                            <TestResultIcon>
                                {emailTestResult.success ? <FaCheckCircle /> : <FaExclamationTriangle />}
                            </TestResultIcon>
                            <TestResultText>{emailTestResult.message}</TestResultText>
                        </TestResultBanner>
                    )}

                    <CardBody>
                        <ConfigStatusBanner $configured={formData.emailSettings.smtpConfigured}>
                            <StatusIcon>
                                {formData.emailSettings.smtpConfigured ? <FaCheckCircle /> : <FaExclamationTriangle />}
                            </StatusIcon>
                            <StatusText>
                                {formData.emailSettings.smtpConfigured
                                    ? 'Serwer SMTP skonfigurowany i gotowy'
                                    : 'Serwer SMTP wymaga konfiguracji'
                                }
                            </StatusText>
                        </ConfigStatusBanner>

                        <FormGrid>
                            <FormField>
                                <FieldLabel>Email nadawcy</FieldLabel>
                                {editingSection === 'email' ? (
                                    <Input
                                        type="email"
                                        value={formData.emailSettings.senderEmail}
                                        onChange={(e) => handleInputChange('emailSettings', 'senderEmail', e.target.value)}
                                        placeholder="noreply@firma.pl"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.emailSettings.senderEmail}>
                                        {formData.emailSettings.senderEmail || 'Nie podano'}
                                    </DisplayValue>
                                )}
                            </FormField>

                            <FormField>
                                <FieldLabel>Nazwa nadawcy</FieldLabel>
                                {editingSection === 'email' ? (
                                    <Input
                                        value={formData.emailSettings.senderName}
                                        onChange={(e) => handleInputChange('emailSettings', 'senderName', e.target.value)}
                                        placeholder="Nazwa firmy"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.emailSettings.senderName}>
                                        {formData.emailSettings.senderName || 'Nie podano'}
                                    </DisplayValue>
                                )}
                            </FormField>

                            <FormField>
                                <FieldLabel>Host SMTP</FieldLabel>
                                {editingSection === 'email' ? (
                                    <Input
                                        value={formData.emailSettings.smtpHost}
                                        onChange={(e) => handleInputChange('emailSettings', 'smtpHost', e.target.value)}
                                        placeholder="smtp.gmail.com"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.emailSettings.smtpHost}>
                                        {formData.emailSettings.smtpHost || 'Nie podano'}
                                    </DisplayValue>
                                )}
                            </FormField>

                            <FormField>
                                <FieldLabel>Port SMTP</FieldLabel>
                                {editingSection === 'email' ? (
                                    <Input
                                        type="number"
                                        value={formData.emailSettings.smtpPort}
                                        onChange={(e) => handleInputChange('emailSettings', 'smtpPort', parseInt(e.target.value))}
                                        placeholder="587"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.emailSettings.smtpPort}>
                                        {formData.emailSettings.smtpPort}
                                    </DisplayValue>
                                )}
                            </FormField>
                        </FormGrid>

                        {editingSection === 'email' && (
                            <SecuritySection>
                                <SecurityHeader>
                                    <FaShieldAlt />
                                    Opcje bezpieczeństwa
                                </SecurityHeader>
                                <SecurityOptions>
                                    <SecurityOption>
                                        <input
                                            type="checkbox"
                                            checked={formData.emailSettings.useSSL}
                                            onChange={(e) => handleInputChange('emailSettings', 'useSSL', e.target.checked)}
                                        />
                                        <span>Użyj SSL</span>
                                    </SecurityOption>
                                    <SecurityOption>
                                        <input
                                            type="checkbox"
                                            checked={formData.emailSettings.useTLS}
                                            onChange={(e) => handleInputChange('emailSettings', 'useTLS', e.target.checked)}
                                        />
                                        <span>Użyj TLS</span>
                                    </SecurityOption>
                                </SecurityOptions>
                            </SecuritySection>
                        )}
                    </CardBody>
                </SettingsCard>

                {/* Logo Settings */}
                <SettingsCard>
                    <CardHeader>
                        <HeaderContent>
                            <HeaderIcon>
                                <FaImage />
                            </HeaderIcon>
                            <HeaderText>
                                <HeaderTitle>Logo firmy</HeaderTitle>
                                <HeaderSubtitle>Identyfikacja wizualna w dokumentach i systemie</HeaderSubtitle>
                            </HeaderText>
                        </HeaderContent>
                    </CardHeader>

                    <CardBody>
                        <LogoSection>
                            <LogoPreview>
                                {formData.logoSettings.hasLogo ? (
                                    <LogoContainer>
                                        <LogoImage src={formData.logoSettings.logoUrl} alt="Logo firmy" />
                                        <LogoInfo>
                                            <LogoName>{formData.logoSettings.logoFileName}</LogoName>
                                            <LogoActions>
                                                <SecondaryButton>
                                                    <FaUpload />
                                                    Zmień logo
                                                </SecondaryButton>
                                                <DangerButton>
                                                    <FaTrash />
                                                    Usuń
                                                </DangerButton>
                                            </LogoActions>
                                        </LogoInfo>
                                    </LogoContainer>
                                ) : (
                                    <LogoPlaceholder>
                                        <LogoPlaceholderIcon>
                                            <FaImage />
                                        </LogoPlaceholderIcon>
                                        <LogoPlaceholderText>Brak logo</LogoPlaceholderText>
                                        <PrimaryButton>
                                            <FaUpload />
                                            Dodaj logo
                                        </PrimaryButton>
                                    </LogoPlaceholder>
                                )}
                            </LogoPreview>

                            <LogoRequirements>
                                <RequirementsTitle>Wymagania techniczne</RequirementsTitle>
                                <RequirementsList>
                                    <RequirementItem>Formaty: JPG, PNG, WebP</RequirementItem>
                                    <RequirementItem>Maksymalny rozmiar: 5MB</RequirementItem>
                                    <RequirementItem>Zalecane wymiary: 200x100px</RequirementItem>
                                    <RequirementItem>Przezroczyste tło: PNG</RequirementItem>
                                </RequirementsList>
                            </LogoRequirements>
                        </LogoSection>
                    </CardBody>
                </SettingsCard>
            </ContentContainer>
        </PageContainer>
    );
});

// Styled Components - Professional style matching finances
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${brandTheme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const SummarySection = styled.section`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl} 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${brandTheme.spacing.lg};

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg} 0;
        grid-template-columns: 1fr;
    }
`;

const SummaryCard = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.xs};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg};
    transition: all ${brandTheme.transitions.spring};
    position: relative;
    min-height: 110px;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.sm};
        border-color: ${brandTheme.borderHover};
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: ${brandTheme.primary};
        opacity: 0.8;
    }
`;

const CardIcon = styled.div<{ $color: string }>`
    width: 48px;
    height: 48px;
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.text.secondary};
    font-size: 20px;
    flex-shrink: 0;
    border: 1px solid ${brandTheme.border};
    transition: all ${brandTheme.transitions.spring};

    ${SummaryCard}:hover & {
        background: ${brandTheme.primary};
        color: white;
        border-color: ${brandTheme.primary};
    }
`;

const CardContent = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
`;

const CardValue = styled.div`
    font-size: 20px;
    font-weight: 600;
   color: ${brandTheme.text.primary};
   margin-bottom: ${brandTheme.spacing.xs};
   letter-spacing: -0.025em;
   line-height: 1.2;
   height: 24px;
   display: flex;
   align-items: center;

   @media (max-width: 768px) {
       font-size: 18px;
   }
`;

const CardLabel = styled.div`
   font-size: 14px;
   color: ${brandTheme.text.primary};
   font-weight: 600;
   margin-bottom: ${brandTheme.spacing.xs};
   text-transform: uppercase;
   letter-spacing: 0.5px;
   height: 17px;
   display: flex;
   align-items: center;
`;

const CardDetail = styled.div`
   font-size: 12px;
   color: ${brandTheme.text.tertiary};
   font-weight: 500;
   line-height: 1.3;
   min-height: 16px;
   display: flex;
   align-items: center;
`;

const ContentContainer = styled.div`
   flex: 1;
   max-width: 1600px;
   margin: 0 auto;
   padding: 0 ${brandTheme.spacing.xl} ${brandTheme.spacing.xl};
   width: 100%;
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.lg};
   min-height: 0;

   @media (max-width: 1024px) {
       padding: 0 ${brandTheme.spacing.lg} ${brandTheme.spacing.lg};
   }

   @media (max-width: 768px) {
       padding: 0 ${brandTheme.spacing.md} ${brandTheme.spacing.md};
       gap: ${brandTheme.spacing.md};
   }
`;

const SettingsCard = styled.div`
   background: ${brandTheme.surface};
   border-radius: ${brandTheme.radius.xl};
   border: 1px solid ${brandTheme.border};
   overflow: hidden;
   box-shadow: ${brandTheme.shadow.sm};
   transition: all ${brandTheme.transitions.spring};

   &:hover {
       box-shadow: ${brandTheme.shadow.md};
       border-color: ${brandTheme.borderHover};
   }
`;

const CardHeader = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: ${brandTheme.spacing.lg};
   border-bottom: 1px solid ${brandTheme.border};
   background: ${brandTheme.surfaceAlt};
   gap: ${brandTheme.spacing.lg};

   @media (max-width: 768px) {
       flex-direction: column;
       align-items: stretch;
       gap: ${brandTheme.spacing.md};
   }
`;

const HeaderContent = styled.div`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.md};
   flex: 1;
   min-width: 0;
`;

const HeaderIcon = styled.div`
   width: 40px;
   height: 40px;
   background: ${brandTheme.primaryGhost};
   border-radius: ${brandTheme.radius.md};
   display: flex;
   align-items: center;
   justify-content: center;
   color: ${brandTheme.primary};
   font-size: 18px;
   flex-shrink: 0;
`;

const HeaderText = styled.div`
   flex: 1;
   min-width: 0;
`;

const HeaderTitle = styled.h3`
   font-size: 18px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
   margin: 0 0 ${brandTheme.spacing.xs} 0;
   letter-spacing: -0.025em;
`;

const HeaderSubtitle = styled.p`
   font-size: 14px;
   color: ${brandTheme.text.secondary};
   margin: 0;
   font-weight: 500;
`;

const HeaderActions = styled.div`
   display: flex;
   gap: ${brandTheme.spacing.sm};
   align-items: center;
   flex-shrink: 0;

   @media (max-width: 768px) {
       justify-content: stretch;
       
       > * {
           flex: 1;
       }
   }
`;

const ActionGroup = styled.div`
   display: flex;
   gap: ${brandTheme.spacing.sm};

   @media (max-width: 768px) {
       width: 100%;
       
       > * {
           flex: 1;
       }
   }
`;

const BaseButton = styled.button`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
   border-radius: ${brandTheme.radius.md};
   font-weight: 600;
   font-size: 14px;
   cursor: pointer;
   transition: all ${brandTheme.transitions.spring};
   border: 1px solid transparent;
   white-space: nowrap;
   min-height: 44px;
   justify-content: center;

   &:hover:not(:disabled) {
       transform: translateY(-1px);
       box-shadow: ${brandTheme.shadow.md};
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
       0% { transform: rotate(0deg); }
       100% { transform: rotate(360deg); }
   }
`;

const PrimaryButton = styled(BaseButton)`
   background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
   color: white;
   box-shadow: ${brandTheme.shadow.sm};

   &:hover:not(:disabled) {
       background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
       box-shadow: ${brandTheme.shadow.lg};
   }
`;

const SecondaryButton = styled(BaseButton)`
   background: ${brandTheme.surface};
   color: ${brandTheme.text.secondary};
   border-color: ${brandTheme.border};
   box-shadow: ${brandTheme.shadow.xs};

   &:hover:not(:disabled) {
       background: ${brandTheme.surfaceHover};
       color: ${brandTheme.text.primary};
       border-color: ${brandTheme.borderHover};
   }
`;

const DangerButton = styled(BaseButton)`
   background: ${brandTheme.status.errorLight};
   color: ${brandTheme.status.error};
   border-color: ${brandTheme.status.error}30;

   &:hover:not(:disabled) {
       background: ${brandTheme.status.error};
       color: white;
       border-color: ${brandTheme.status.error};
   }
`;

const TestResultBanner = styled.div<{ $success: boolean }>`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.md};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.xl};
   background: ${props => props.$success ? brandTheme.status.successLight : brandTheme.status.errorLight};
   color: ${props => props.$success ? brandTheme.status.success : brandTheme.status.error};
   border-bottom: 1px solid ${brandTheme.border};
   font-weight: 500;
`;

const TestResultIcon = styled.div`
   font-size: 18px;
   flex-shrink: 0;
`;

const TestResultText = styled.div`
   flex: 1;
   font-weight: 600;
`;

const CardBody = styled.div`
   padding: ${brandTheme.spacing.xl};
`;

const ConfigStatusBanner = styled.div<{ $configured: boolean }>`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   background: ${props => props.$configured ? brandTheme.status.successLight : brandTheme.status.warningLight};
   color: ${props => props.$configured ? brandTheme.status.success : brandTheme.status.warning};
   border-radius: ${brandTheme.radius.md};
   margin-bottom: ${brandTheme.spacing.lg};
   border: 1px solid ${props => props.$configured ? brandTheme.status.success + '30' : brandTheme.status.warning + '30'};
`;

const StatusIcon = styled.div`
   font-size: 16px;
   flex-shrink: 0;
`;

const StatusText = styled.div`
   font-weight: 500;
   flex: 1;
`;

const FormGrid = styled.div`
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: ${brandTheme.spacing.lg};

   @media (max-width: 768px) {
       grid-template-columns: 1fr;
       gap: ${brandTheme.spacing.md};
   }
`;

const FormField = styled.div<{ $fullWidth?: boolean }>`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.sm};
   ${props => props.$fullWidth && 'grid-column: 1 / -1;'}
`;

const FieldLabel = styled.label`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   font-weight: 600;
   font-size: 14px;
   color: ${brandTheme.text.primary};
   
   .icon {
       font-size: 16px;
   }
   
   svg {
       font-size: 16px;
       color: ${brandTheme.text.tertiary};
   }
`;

const RequiredMark = styled.span`
   color: ${brandTheme.status.error};
   font-weight: 700;
   margin-left: ${brandTheme.spacing.xs};
`;

const ValidationStatus = styled.div<{ $valid: boolean }>`
   font-size: 14px;
   color: ${props => props.$valid ? brandTheme.status.success : brandTheme.status.warning};
   margin-left: auto;
`;

const Input = styled.input`
   height: 48px;
   padding: 0 ${brandTheme.spacing.md};
   border: 2px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.md};
   font-size: 15px;
   font-weight: 500;
   background: ${brandTheme.surface};
   color: ${brandTheme.text.primary};
   transition: all ${brandTheme.transitions.spring};

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

const DisplayValue = styled.div<{ $hasValue: boolean }>`
   padding: ${brandTheme.spacing.md};
   background: ${brandTheme.surfaceElevated};
   border: 2px solid ${brandTheme.borderLight};
   border-radius: ${brandTheme.radius.md};
   color: ${props => props.$hasValue ? brandTheme.text.primary : brandTheme.text.muted};
   font-weight: 500;
   font-size: 15px;
   min-height: 48px;
   display: flex;
   align-items: center;
   font-style: ${props => props.$hasValue ? 'normal' : 'italic'};
`;

const WebsiteLink = styled.a`
   color: ${brandTheme.primary};
   text-decoration: none;
   font-weight: 600;
   
   &:hover {
       text-decoration: underline;
   }
`;

const SecuritySection = styled.div`
   margin-top: ${brandTheme.spacing.lg};
   padding: ${brandTheme.spacing.lg};
   background: ${brandTheme.surfaceElevated};
   border-radius: ${brandTheme.radius.md};
   border: 1px solid ${brandTheme.border};
`;

const SecurityHeader = styled.h4`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   font-size: 16px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
   margin: 0 0 ${brandTheme.spacing.md} 0;
   
   svg {
       color: ${brandTheme.status.success};
   }
`;

const SecurityOptions = styled.div`
   display: flex;
   gap: ${brandTheme.spacing.lg};

   @media (max-width: 480px) {
       flex-direction: column;
       gap: ${brandTheme.spacing.md};
   }
`;

const SecurityOption = styled.label`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   font-size: 14px;
   font-weight: 500;
   color: ${brandTheme.text.primary};
   cursor: pointer;

   input[type="checkbox"] {
       width: 18px;
       height: 18px;
       accent-color: ${brandTheme.primary};
       cursor: pointer;
   }
`;

const LogoSection = styled.div`
   display: grid;
   grid-template-columns: 2fr 1fr;
   gap: ${brandTheme.spacing.xl};
   align-items: start;

   @media (max-width: 768px) {
       grid-template-columns: 1fr;
       gap: ${brandTheme.spacing.lg};
   }
`;

const LogoPreview = styled.div`
   border: 2px dashed ${brandTheme.border};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.xl};
   background: ${brandTheme.surfaceElevated};
   display: flex;
   align-items: center;
   justify-content: center;
   min-height: 200px;
   transition: all ${brandTheme.transitions.spring};

   &:hover {
       border-color: ${brandTheme.borderHover};
   }
`;

const LogoContainer = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: ${brandTheme.spacing.lg};
   text-align: center;
`;

const LogoImage = styled.img`
   max-width: 200px;
   max-height: 100px;
   object-fit: contain;
   border-radius: ${brandTheme.radius.md};
   box-shadow: ${brandTheme.shadow.sm};
   border: 1px solid ${brandTheme.border};
`;

const LogoInfo = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.md};
`;

const LogoName = styled.div`
   font-weight: 600;
   color: ${brandTheme.text.primary};
   font-size: 14px;
`;

const LogoActions = styled.div`
   display: flex;
   gap: ${brandTheme.spacing.sm};
   justify-content: center;
`;

const LogoPlaceholder = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: ${brandTheme.spacing.lg};
   color: ${brandTheme.text.muted};
   text-align: center;
`;

const LogoPlaceholderIcon = styled.div`
   width: 64px;
   height: 64px;
   background: ${brandTheme.borderLight};
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 24px;
   color: ${brandTheme.text.tertiary};
`;

const LogoPlaceholderText = styled.div`
   font-size: 16px;
   font-weight: 500;
   color: ${brandTheme.text.secondary};
`;

const LogoRequirements = styled.div`
   background: ${brandTheme.surface};
   border: 1px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.lg};
`;

const RequirementsTitle = styled.h4`
   font-size: 16px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
   margin: 0 0 ${brandTheme.spacing.md} 0;
`;

const RequirementsList = styled.ul`
   list-style: none;
   padding: 0;
   margin: 0;
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.sm};
`;

const RequirementItem = styled.li`
   font-size: 14px;
   color: ${brandTheme.text.secondary};
   font-weight: 500;
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};

   &::before {
       content: '•';
       color: ${brandTheme.primary};
       font-weight: bold;
       font-size: 16px;
   }
`;

const FloatingSaveButton = styled.button`
   position: fixed;
   bottom: ${brandTheme.spacing.xl};
   right: ${brandTheme.spacing.xl};
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.md};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.xl};
   background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
   color: white;
   border: none;
   border-radius: ${brandTheme.radius.xl};
   font-weight: 600;
   font-size: 16px;
   cursor: pointer;
   box-shadow: ${brandTheme.shadow.xl};
   transition: all ${brandTheme.transitions.spring};
   z-index: 1000;
   min-width: 220px;
   justify-content: center;

   &:hover:not(:disabled) {
       transform: translateY(-2px);
       box-shadow: 0 20px 40px -5px rgba(26, 54, 93, 0.4);
       background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
   }

   &:disabled {
       opacity: 0.8;
       cursor: not-allowed;
       transform: none;
   }

   .spinning {
       animation: spin 1s linear infinite;
   }

   @media (max-width: 768px) {
       bottom: ${brandTheme.spacing.lg};
       right: ${brandTheme.spacing.lg};
       left: ${brandTheme.spacing.lg};
       min-width: auto;
   }
`;

export default CompanySettingsPage;