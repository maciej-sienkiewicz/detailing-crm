// src/pages/Settings/CompanySettingsPage.tsx
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import {
    FaUndo,
    FaBuilding,
    FaEnvelope,
    FaServer,
    FaImage,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTrash,
    FaUpload,
    FaEye,
    FaEyeSlash,
    FaCheck,
    FaSpinner, FaSave
} from 'react-icons/fa';

// Import real API and types
import {
    companySettingsApi,
    CompanySettingsResponse,
    UpdateCompanySettingsRequest,
    EmailTestResponse,
    NipValidationResponse
} from '../../api/companySettingsApi';

// Używamy theme z istniejących styli
const settingsTheme = {
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
    },
    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }
};

// Interfejs dla form data
interface FormData {
    basicInfo: {
        companyName: string;
        taxId: string;
        address: string;
        phone: string;
        website: string;
    };
    bankSettings: {
        bankAccountNumber: string;
        bankName: string;
        swiftCode: string;
        accountHolderName: string;
    };
    emailSettings: {
        smtpHost: string;
        smtpPort: number;
        smtpUsername: string;
        smtpPassword: string;
        imapHost: string;
        imapPort: number;
        imapUsername: string;
        imapPassword: string;
        senderEmail: string;
        senderName: string;
        useSSL: boolean;
        useTLS: boolean;
    };
}

const CompanySettingsPage = forwardRef<{ handleSave: () => void }>((props, ref) => {
    // Stan główny
    const [settings, setSettings] = useState<CompanySettingsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Stan dla formularza
    const [formData, setFormData] = useState<FormData>({
        basicInfo: {
            companyName: '',
            taxId: '',
            address: '',
            phone: '',
            website: ''
        },
        bankSettings: {
            bankAccountNumber: '',
            bankName: '',
            swiftCode: '',
            accountHolderName: ''
        },
        emailSettings: {
            smtpHost: '',
            smtpPort: 587,
            smtpUsername: '',
            smtpPassword: '',
            imapHost: '',
            imapPort: 993,
            imapUsername: '',
            imapPassword: '',
            senderEmail: '',
            senderName: '',
            useSSL: true,
            useTLS: true
        }
    });

    // Stan dla walidacji
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [nipValidation, setNipValidation] = useState<NipValidationResponse | null>(null);
    const [isValidatingNip, setIsValidatingNip] = useState(false);

    // Stan dla haseł
    const [showPasswords, setShowPasswords] = useState({
        smtp: false,
        imap: false
    });

    // Stan dla logo
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [deletingLogo, setDeletingLogo] = useState(false);

    // Stan dla testu email
    const [testingEmail, setTestingEmail] = useState(false);
    const [emailTestResult, setEmailTestResult] = useState<EmailTestResponse | null>(null);

    // Referencje
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Expose handleSave method to parent component
    useImperativeHandle(ref, () => ({
        handleSave: handleSave
    }));

    // Ładowanie danych przy montowaniu komponentu
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await companySettingsApi.getCompanySettings();
            setSettings(data);
            setFormData({
                basicInfo: {
                    companyName: data.basicInfo.companyName || '',
                    taxId: data.basicInfo.taxId || '',
                    address: data.basicInfo.address || '',
                    phone: data.basicInfo.phone || '',
                    website: data.basicInfo.website || ''
                },
                bankSettings: {
                    bankAccountNumber: data.bankSettings.bankAccountNumber || '',
                    bankName: data.bankSettings.bankName || '',
                    swiftCode: data.bankSettings.swiftCode || '',
                    accountHolderName: data.bankSettings.accountHolderName || ''
                },
                emailSettings: {
                    smtpHost: data.emailSettings.smtpHost || '',
                    smtpPort: data.emailSettings.smtpPort || 587,
                    smtpUsername: data.emailSettings.smtpUsername || '',
                    smtpPassword: '', // Nie pokazujemy rzeczywistego hasła
                    imapHost: data.emailSettings.imapHost || '',
                    imapPort: data.emailSettings.imapPort || 993,
                    imapUsername: data.emailSettings.imapUsername || '',
                    imapPassword: '', // Nie pokazujemy rzeczywistego hasła
                    senderEmail: data.emailSettings.senderEmail || '',
                    senderName: data.emailSettings.senderName || '',
                    useSSL: data.emailSettings.useSSL ?? true,
                    useTLS: data.emailSettings.useTLS ?? true
                }
            });
            if (data.logoSettings.hasLogo && data.logoSettings.logoUrl) {
                setLogoPreview(data.logoSettings.logoUrl);
            }
        } catch (err) {
            setError('Nie udało się załadować ustawień firmy');
            console.error('Error loading settings:', err);
        } finally {
            setLoading(false);
        }
    };

    // Obsługa zmian w formularzu
    const handleInputChange = (section: keyof FormData, field: string, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
        setHasUnsavedChanges(true);

        // Usuwanie błędów walidacji
        const errorKey = `${section}.${field}`;
        if (validationErrors[errorKey]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[errorKey];
                return newErrors;
            });
        }

        // Walidacja NIP w czasie rzeczywistym
        if (section === 'basicInfo' && field === 'taxId' && typeof value === 'string') {
            validateNipDebounced(value);
        }
    };

    // Debounced walidacja NIP
    const validateNipDebounced = (() => {
        let timeout: NodeJS.Timeout;
        return (nip: string) => {
            clearTimeout(timeout);
            if (!nip.trim()) {
                setNipValidation(null);
                return;
            }
            timeout = setTimeout(async () => {
                setIsValidatingNip(true);
                try {
                    const result = await companySettingsApi.validateNIP(nip);
                    setNipValidation(result);
                } catch (err) {
                    setNipValidation({
                        nip: nip,
                        valid: false,
                        message: 'Błąd walidacji NIP'
                    });
                } finally {
                    setIsValidatingNip(false);
                }
            }, 500);
        };
    })();

    // Walidacja formularza
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Walidacja podstawowych informacji
        if (!formData.basicInfo.companyName.trim()) {
            errors['basicInfo.companyName'] = 'Nazwa firmy jest wymagana';
        }

        if (!formData.basicInfo.taxId.trim()) {
            errors['basicInfo.taxId'] = 'NIP jest wymagany';
        }

        // Walidacja email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.emailSettings.senderEmail && !emailRegex.test(formData.emailSettings.senderEmail)) {
            errors['emailSettings.senderEmail'] = 'Nieprawidłowy format adresu email';
        }

        if (formData.emailSettings.smtpUsername && !emailRegex.test(formData.emailSettings.smtpUsername)) {
            errors['emailSettings.smtpUsername'] = 'Nieprawidłowy format adresu email';
        }

        if (formData.emailSettings.imapUsername && !emailRegex.test(formData.emailSettings.imapUsername)) {
            errors['emailSettings.imapUsername'] = 'Nieprawidłowy format adresu email';
        }

        // Walidacja portów
        if (formData.emailSettings.smtpPort && (formData.emailSettings.smtpPort < 1 || formData.emailSettings.smtpPort > 65535)) {
            errors['emailSettings.smtpPort'] = 'Port SMTP musi być liczbą od 1 do 65535';
        }

        if (formData.emailSettings.imapPort && (formData.emailSettings.imapPort < 1 || formData.emailSettings.imapPort > 65535)) {
            errors['emailSettings.imapPort'] = 'Port IMAP musi być liczbą od 1 do 65535';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Zapisywanie ustawień
    const handleSave = async (): Promise<void> => {
        if (!validateForm()) {
            setError('Proszę poprawić błędy w formularzu');
            return;
        }

        if (nipValidation && !nipValidation.valid) {
            setError('NIP jest nieprawidłowy');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const requestData: UpdateCompanySettingsRequest = {
                basicInfo: formData.basicInfo,
                bankSettings: formData.bankSettings,
                emailSettings: formData.emailSettings
            };

            const updatedSettings = await companySettingsApi.updateCompanySettings(requestData);
            setSettings(prev => prev ? { ...prev, ...updatedSettings } : updatedSettings);
            setHasUnsavedChanges(false);
            setSuccessMessage('Ustawienia zostały zapisane pomyślnie');

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError('Nie udało się zapisać ustawień');
            console.error('Error saving settings:', err);
        } finally {
            setSaving(false);
        }
    };

    // Resetowanie formularza
    const handleReset = () => {
        if (settings) {
            setFormData({
                basicInfo: {
                    companyName: settings.basicInfo.companyName || '',
                    taxId: settings.basicInfo.taxId || '',
                    address: settings.basicInfo.address || '',
                    phone: settings.basicInfo.phone || '',
                    website: settings.basicInfo.website || ''
                },
                bankSettings: {
                    bankAccountNumber: settings.bankSettings.bankAccountNumber || '',
                    bankName: settings.bankSettings.bankName || '',
                    swiftCode: settings.bankSettings.swiftCode || '',
                    accountHolderName: settings.bankSettings.accountHolderName || ''
                },
                emailSettings: {
                    smtpHost: settings.emailSettings.smtpHost || '',
                    smtpPort: settings.emailSettings.smtpPort || 587,
                    smtpUsername: settings.emailSettings.smtpUsername || '',
                    smtpPassword: '',
                    imapHost: settings.emailSettings.imapHost || '',
                    imapPort: settings.emailSettings.imapPort || 993,
                    imapUsername: settings.emailSettings.imapUsername || '',
                    imapPassword: '',
                    senderEmail: settings.emailSettings.senderEmail || '',
                    senderName: settings.emailSettings.senderName || '',
                    useSSL: settings.emailSettings.useSSL ?? true,
                    useTLS: settings.emailSettings.useTLS ?? true
                }
            });
            setHasUnsavedChanges(false);
            setValidationErrors({});
            setNipValidation(null);
            setEmailTestResult(null);
        }
    };

    // Obsługa logo
    const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Walidacja pliku
            const maxSize = 5 * 1024 * 1024; // 5MB
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

            if (!allowedTypes.includes(file.type)) {
                setError('Dozwolone są tylko pliki JPG, PNG i WebP');
                return;
            }

            if (file.size > maxSize) {
                setError('Plik nie może być większy niż 5MB');
                return;
            }

            setLogoFile(file);

            // Podgląd
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setLogoPreview(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogoUpload = async () => {
        if (!logoFile) return;

        try {
            setUploadingLogo(true);
            setError(null);

            const result = await companySettingsApi.uploadLogo(logoFile);
            setSettings(prev => prev ? {
                ...prev,
                logoSettings: result.logoSettings
            } : null);
            setLogoFile(null);
            setSuccessMessage('Logo zostało zapisane pomyślnie');

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError('Nie udało się przesłać logo');
            console.error('Error uploading logo:', err);
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleLogoDelete = async () => {
        if (!window.confirm('Czy na pewno chcesz usunąć logo?')) return;

        try {
            setDeletingLogo(true);
            setError(null);

            const result = await companySettingsApi.deleteLogo();
            setSettings(prev => prev ? {
                ...prev,
                logoSettings: result.logoSettings
            } : null);
            setLogoPreview(null);
            setLogoFile(null);
            setSuccessMessage('Logo zostało usunięte');

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError('Nie udało się usunąć logo');
            console.error('Error deleting logo:', err);
        } finally {
            setDeletingLogo(false);
        }
    };

    // Test połączenia email
    const handleTestEmail = async () => {
        if (!formData.emailSettings.smtpHost || !formData.emailSettings.smtpUsername) {
            setError('Wypełnij dane SMTP przed testem');
            return;
        }

        try {
            setTestingEmail(true);
            setEmailTestResult(null);
            setError(null);

            const testData = {
                smtpHost: formData.emailSettings.smtpHost,
                smtpPort: formData.emailSettings.smtpPort,
                smtpUsername: formData.emailSettings.smtpUsername,
                smtpPassword: formData.emailSettings.smtpPassword,
                useSSL: formData.emailSettings.useSSL,
                useTLS: formData.emailSettings.useTLS,
                testEmail: formData.emailSettings.senderEmail || formData.emailSettings.smtpUsername
            };

            const result = await companySettingsApi.testEmailConnection(testData);
            setEmailTestResult(result);
        } catch (err) {
            setEmailTestResult(err as EmailTestResponse);
        } finally {
            setTestingEmail(false);
        }
    };

    if (loading) {
        return (
            <ContentContainer>
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie ustawień firmy...</LoadingText>
                </LoadingContainer>
            </ContentContainer>
        );
    }

    return (
        <ContentContainer>
            {/* Messages */}
            {successMessage && (
                <MessageContainer>
                    <SuccessMessage>
                        <MessageIcon><FaCheckCircle /></MessageIcon>
                        {successMessage}
                    </SuccessMessage>
                </MessageContainer>
            )}

            {error && (
                <MessageContainer>
                    <ErrorMessage>
                        <MessageIcon><FaExclamationTriangle /></MessageIcon>
                        {error}
                    </ErrorMessage>
                </MessageContainer>
            )}

            {/* Main Content */}
            <ContentGrid>
                {/* Company Basic Info */}
                <SectionCard>
                    <SectionHeader>
                        <SectionIcon>
                            <FaBuilding />
                        </SectionIcon>
                        <SectionTitle>Dane firmy</SectionTitle>
                    </SectionHeader>

                    <SectionContent>
                        <FormGrid>
                            <FormGroup>
                                <Label htmlFor="companyName">Nazwa firmy*</Label>
                                <Input
                                    id="companyName"
                                    value={formData.basicInfo.companyName}
                                    onChange={(e) => handleInputChange('basicInfo', 'companyName', e.target.value)}
                                    placeholder="Nazwa firmy"
                                    $hasError={!!validationErrors['basicInfo.companyName']}
                                />
                                {validationErrors['basicInfo.companyName'] && (
                                    <ErrorText>{validationErrors['basicInfo.companyName']}</ErrorText>
                                )}
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="taxId">
                                    NIP*
                                    {isValidatingNip && <ValidationSpinner><FaSpinner /></ValidationSpinner>}
                                    {nipValidation && (
                                        <ValidationStatus $valid={nipValidation.valid}>
                                            {nipValidation.valid ? <FaCheck /> : <FaExclamationTriangle />}
                                        </ValidationStatus>
                                    )}
                                </Label>
                                <Input
                                    id="taxId"
                                    value={formData.basicInfo.taxId}
                                    onChange={(e) => handleInputChange('basicInfo', 'taxId', e.target.value)}
                                    placeholder="123-456-78-90"
                                />
                                {validationErrors['basicInfo.taxId'] && (
                                    <ErrorText>{validationErrors['basicInfo.taxId']}</ErrorText>
                                )}
                                {nipValidation && !nipValidation.valid && (
                                    <ErrorText>{nipValidation.message}</ErrorText>
                                )}
                            </FormGroup>

                            <FormGroup $fullWidth>
                                <Label htmlFor="address">Adres</Label>
                                <Input
                                    id="address"
                                    value={formData.basicInfo.address}
                                    onChange={(e) => handleInputChange('basicInfo', 'address', e.target.value)}
                                    placeholder="ul. Motoryzacyjna 123, 00-001 Warszawa"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="phone">Telefon</Label>
                                <Input
                                    id="phone"
                                    value={formData.basicInfo.phone}
                                    onChange={(e) => handleInputChange('basicInfo', 'phone', e.target.value)}
                                    placeholder="+48 123 456 789"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="website">Strona WWW</Label>
                                <Input
                                    id="website"
                                    value={formData.basicInfo.website}
                                    onChange={(e) => handleInputChange('basicInfo', 'website', e.target.value)}
                                    placeholder="https://firma.pl"
                                />
                            </FormGroup>
                        </FormGrid>
                    </SectionContent>
                </SectionCard>

                {/* Bank Settings */}
                <SectionCard>
                    <SectionHeader>
                        <SectionIcon>
                            💳
                        </SectionIcon>
                        <SectionTitle>Dane bankowe</SectionTitle>
                    </SectionHeader>

                    <SectionContent>
                        <FormGrid>
                            <FormGroup $fullWidth>
                                <Label htmlFor="bankAccountNumber">Numer konta</Label>
                                <Input
                                    id="bankAccountNumber"
                                    value={formData.bankSettings.bankAccountNumber}
                                    onChange={(e) => handleInputChange('bankSettings', 'bankAccountNumber', e.target.value)}
                                    placeholder="12 3456 7890 1234 5678 9012 3456"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="bankName">Nazwa banku</Label>
                                <Input
                                    id="bankName"
                                    value={formData.bankSettings.bankName}
                                    onChange={(e) => handleInputChange('bankSettings', 'bankName', e.target.value)}
                                    placeholder="Nazwa banku"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="swiftCode">Kod SWIFT</Label>
                                <Input
                                    id="swiftCode"
                                    value={formData.bankSettings.swiftCode}
                                    onChange={(e) => handleInputChange('bankSettings', 'swiftCode', e.target.value)}
                                    placeholder="PREMBPLPW"
                                />
                            </FormGroup>

                            <FormGroup $fullWidth>
                                <Label htmlFor="accountHolderName">Właściciel konta</Label>
                                <Input
                                    id="accountHolderName"
                                    value={formData.bankSettings.accountHolderName}
                                    onChange={(e) => handleInputChange('bankSettings', 'accountHolderName', e.target.value)}
                                    placeholder="Nazwa właściciela konta"
                                />
                            </FormGroup>
                        </FormGrid>
                    </SectionContent>
                </SectionCard>

                {/* Email Settings */}
                <SectionCard>
                    <SectionHeader>
                        <SectionIcon>
                            <FaEnvelope />
                        </SectionIcon>
                        <SectionTitle>Ustawienia email</SectionTitle>
                        <TestEmailButton
                            onClick={handleTestEmail}
                            disabled={testingEmail}
                        >
                            {testingEmail ? <FaSpinner /> : <FaServer />}
                            {testingEmail ? 'Testowanie...' : 'Testuj połączenie'}
                        </TestEmailButton>
                    </SectionHeader>

                    {emailTestResult && (
                        <TestResultContainer $success={emailTestResult.success}>
                            <TestResultIcon>
                                {emailTestResult.success ? <FaCheckCircle /> : <FaExclamationTriangle />}
                            </TestResultIcon>
                            <TestResultText>
                                {emailTestResult.message}
                                {emailTestResult.errorDetails && (
                                    <TestErrorDetails>{emailTestResult.errorDetails}</TestErrorDetails>
                                )}
                            </TestResultText>
                        </TestResultContainer>
                    )}

                    <SectionContent>
                        <SubSectionTitle>Dane nadawcy</SubSectionTitle>
                        <FormGrid>
                            <FormGroup>
                                <Label htmlFor="senderEmail">Email nadawcy</Label>
                                <Input
                                    id="senderEmail"
                                    type="email"
                                    value={formData.emailSettings.senderEmail}
                                    onChange={(e) => handleInputChange('emailSettings', 'senderEmail', e.target.value)}
                                    placeholder="noreply@firma.pl"
                                    $hasError={!!validationErrors['emailSettings.senderEmail']}
                                />
                                {validationErrors['emailSettings.senderEmail'] && (
                                    <ErrorText>{validationErrors['emailSettings.senderEmail']}</ErrorText>
                                )}
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="senderName">Nazwa nadawcy</Label>
                                <Input
                                    id="senderName"
                                    value={formData.emailSettings.senderName}
                                    onChange={(e) => handleInputChange('emailSettings', 'senderName', e.target.value)}
                                    placeholder="Nazwa firmy"
                                />
                            </FormGroup>
                        </FormGrid>

                        <SubSectionTitle>Serwer SMTP (wysyłanie)</SubSectionTitle>
                        <FormGrid>
                            <FormGroup>
                                <Label htmlFor="smtpHost">Host SMTP</Label>
                                <Input
                                    id="smtpHost"
                                    value={formData.emailSettings.smtpHost}
                                    onChange={(e) => handleInputChange('emailSettings', 'smtpHost', e.target.value)}
                                    placeholder="smtp.gmail.com"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="smtpPort">Port SMTP</Label>
                                <Input
                                    id="smtpPort"
                                    type="number"
                                    value={formData.emailSettings.smtpPort}
                                    onChange={(e) => handleInputChange('emailSettings', 'smtpPort', parseInt(e.target.value) || 587)}
                                    placeholder="587"
                                    $hasError={!!validationErrors['emailSettings.smtpPort']}
                                />
                                {validationErrors['emailSettings.smtpPort'] && (
                                    <ErrorText>{validationErrors['emailSettings.smtpPort']}</ErrorText>
                                )}
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="smtpUsername">Użytkownik SMTP</Label>
                                <Input
                                    id="smtpUsername"
                                    type="email"
                                    value={formData.emailSettings.smtpUsername}
                                    onChange={(e) => handleInputChange('emailSettings', 'smtpUsername', e.target.value)}
                                    placeholder="email@firma.pl"
                                    $hasError={!!validationErrors['emailSettings.smtpUsername']}
                                />
                                {validationErrors['emailSettings.smtpUsername'] && (
                                    <ErrorText>{validationErrors['emailSettings.smtpUsername']}</ErrorText>
                                )}
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="smtpPassword">Hasło SMTP</Label>
                                <PasswordInputContainer>
                                    <Input
                                        id="smtpPassword"
                                        type={showPasswords.smtp ? 'text' : 'password'}
                                        value={formData.emailSettings.smtpPassword}
                                        onChange={(e) => handleInputChange('emailSettings', 'smtpPassword', e.target.value)}
                                        placeholder={settings?.emailSettings.smtpPasswordConfigured ? 'Hasło jest skonfigurowane' : 'Hasło SMTP'}
                                    />
                                    <PasswordToggle
                                        onClick={() => setShowPasswords(prev => ({ ...prev, smtp: !prev.smtp }))}
                                    >
                                        {showPasswords.smtp ? <FaEyeSlash /> : <FaEye />}
                                    </PasswordToggle>
                                </PasswordInputContainer>
                            </FormGroup>
                        </FormGrid>

                        <SubSectionTitle>Serwer IMAP (odbiór)</SubSectionTitle>
                        <FormGrid>
                            <FormGroup>
                                <Label htmlFor="imapHost">Host IMAP</Label>
                                <Input
                                    id="imapHost"
                                    value={formData.emailSettings.imapHost}
                                    onChange={(e) => handleInputChange('emailSettings', 'imapHost', e.target.value)}
                                    placeholder="imap.gmail.com"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="imapPort">Port IMAP</Label>
                                <Input
                                    id="imapPort"
                                    type="number"
                                    value={formData.emailSettings.imapPort}
                                    onChange={(e) => handleInputChange('emailSettings', 'imapPort', parseInt(e.target.value) || 993)}
                                    placeholder="993"
                                    $hasError={!!validationErrors['emailSettings.imapPort']}
                                />
                                {validationErrors['emailSettings.imapPort'] && (
                                    <ErrorText>{validationErrors['emailSettings.imapPort']}</ErrorText>
                                )}
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="imapUsername">Użytkownik IMAP</Label>
                                <Input
                                    id="imapUsername"
                                    type="email"
                                    value={formData.emailSettings.imapUsername}
                                    onChange={(e) => handleInputChange('emailSettings', 'imapUsername', e.target.value)}
                                    placeholder="email@firma.pl"
                                    $hasError={!!validationErrors['emailSettings.imapUsername']}
                                />
                                {validationErrors['emailSettings.imapUsername'] && (
                                    <ErrorText>{validationErrors['emailSettings.imapUsername']}</ErrorText>
                                )}
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="imapPassword">Hasło IMAP</Label>
                                <PasswordInputContainer>
                                    <Input
                                        id="imapPassword"
                                        type={showPasswords.imap ? 'text' : 'password'}
                                        value={formData.emailSettings.imapPassword}
                                        onChange={(e) => handleInputChange('emailSettings', 'imapPassword', e.target.value)}
                                        placeholder={settings?.emailSettings.imapPasswordConfigured ? 'Hasło jest skonfigurowane' : 'Hasło IMAP'}
                                    />
                                    <PasswordToggle
                                        onClick={() => setShowPasswords(prev => ({ ...prev, imap: !prev.imap }))}
                                    >
                                        {showPasswords.imap ? <FaEyeSlash /> : <FaEye />}
                                    </PasswordToggle>
                                </PasswordInputContainer>
                            </FormGroup>
                        </FormGrid>

                        <SubSectionTitle>Opcje bezpieczeństwa</SubSectionTitle>
                        <SecurityOptionsGrid>
                            <CheckboxGroup>
                                <Checkbox
                                    id="useSSL"
                                    checked={formData.emailSettings.useSSL}
                                    onChange={(e) => handleInputChange('emailSettings', 'useSSL', e.target.checked)}
                                />
                                <CheckboxLabel htmlFor="useSSL">Użyj SSL</CheckboxLabel>
                            </CheckboxGroup>

                            <CheckboxGroup>
                                <Checkbox
                                    id="useTLS"
                                    checked={formData.emailSettings.useTLS}
                                    onChange={(e) => handleInputChange('emailSettings', 'useTLS', e.target.checked)}
                                />
                                <CheckboxLabel htmlFor="useTLS">Użyj TLS</CheckboxLabel>
                            </CheckboxGroup>
                        </SecurityOptionsGrid>
                    </SectionContent>
                </SectionCard>

                {/* Logo Settings */}
                <SectionCard>
                    <SectionHeader>
                        <SectionIcon>
                            <FaImage />
                        </SectionIcon>
                        <SectionTitle>Logo firmy</SectionTitle>
                    </SectionHeader>

                    <SectionContent>
                        <LogoContainer>
                            <LogoPreviewArea>
                                {logoPreview ? (
                                    <LogoPreview>
                                        <LogoImage src={logoPreview} alt="Logo firmy" />
                                        <LogoInfo>
                                            {settings?.logoSettings.logoFileName && (
                                                <LogoFileName>{settings.logoSettings.logoFileName}</LogoFileName>
                                            )}
                                            {settings?.logoSettings.logoSize && (
                                                <LogoFileSize>{(settings.logoSettings.logoSize / 1024).toFixed(1)} KB</LogoFileSize>
                                            )}
                                        </LogoInfo>
                                    </LogoPreview>
                                ) : (
                                    <LogoPlaceholder>
                                        <FaImage />
                                        <span>Brak logo</span>
                                    </LogoPlaceholder>
                                )}
                            </LogoPreviewArea>

                            <LogoActions>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleLogoSelect}
                                    style={{ display: 'none' }}
                                />

                                <SecondaryButton onClick={() => fileInputRef.current?.click()}>
                                    <FaUpload />
                                    Wybierz plik
                                </SecondaryButton>

                                {logoFile && (
                                    <PrimaryButton
                                        onClick={handleLogoUpload}
                                        disabled={uploadingLogo}
                                    >
                                        {uploadingLogo ? <FaSpinner /> : <FaSave />}
                                        {uploadingLogo ? 'Przesyłanie...' : 'Prześlij logo'}
                                    </PrimaryButton>
                                )}

                                {logoPreview && !logoFile && (
                                    <DangerButton
                                        onClick={handleLogoDelete}
                                        disabled={deletingLogo}
                                    >
                                        {deletingLogo ? <FaSpinner /> : <FaTrash />}
                                        {deletingLogo ? 'Usuwanie...' : 'Usuń logo'}
                                    </DangerButton>
                                )}
                            </LogoActions>

                            <LogoHelpText>
                                Zalecane formaty: JPG, PNG, WebP. Maksymalny rozmiar: 5MB.
                                Optymalne wymiary: 200x200px (kwadrat) lub 300x100px (poziom).
                            </LogoHelpText>
                        </LogoContainer>
                    </SectionContent>
                </SectionCard>
            </ContentGrid>

            {/* Unsaved Changes Indicator */}
            {hasUnsavedChanges && (
                <UnsavedChangesIndicator>
                    <FaExclamationTriangle />
                    Masz niezapisane zmiany
                    <SecondaryButton onClick={handleReset} style={{ marginLeft: '12px', padding: '4px 8px', fontSize: '12px' }}>
                        <FaUndo />
                        Przywróć
                    </SecondaryButton>
                </UnsavedChangesIndicator>
            )}
        </ContentContainer>
    );
});

// Styled Components (bez zmian - te same co wcześniej)
const ContentContainer = styled.div`
   flex: 1;
   max-width: 1600px;
   margin: 0 auto;
   padding: 0 ${settingsTheme.spacing.xl} ${settingsTheme.spacing.xl};
   width: 100%;
   display: flex;
   flex-direction: column;
   gap: ${settingsTheme.spacing.lg};
   min-height: 0;

   @media (max-width: 1024px) {
       padding: 0 ${settingsTheme.spacing.lg} ${settingsTheme.spacing.lg};
   }

   @media (max-width: 768px) {
       padding: 0 ${settingsTheme.spacing.md} ${settingsTheme.spacing.md};
       gap: ${settingsTheme.spacing.md};
   }
`;

const LoadingContainer = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: ${settingsTheme.spacing.xxl};
   background: ${settingsTheme.surface};
   border-radius: ${settingsTheme.radius.xl};
   border: 1px solid ${settingsTheme.border};
   gap: ${settingsTheme.spacing.md};
   min-height: 400px;
`;

const LoadingSpinner = styled.div`
   width: 48px;
   height: 48px;
   border: 3px solid ${settingsTheme.borderLight};
   border-top: 3px solid ${settingsTheme.primary};
   border-radius: 50%;
   animation: spin 1s linear infinite;

   @keyframes spin {
       0% { transform: rotate(0deg); }
       100% { transform: rotate(360deg); }
   }
`;

const LoadingText = styled.div`
   font-size: 16px;
   color: ${settingsTheme.text.secondary};
   font-weight: 500;
`;

const MessageContainer = styled.div`
   margin-bottom: ${settingsTheme.spacing.lg};
`;

const SuccessMessage = styled.div`
   display: flex;
   align-items: center;
   gap: ${settingsTheme.spacing.sm};
   background: ${settingsTheme.status.successLight};
   color: ${settingsTheme.status.success};
   padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
   border-radius: ${settingsTheme.radius.lg};
   border: 1px solid ${settingsTheme.status.success}30;
   font-weight: 500;
   box-shadow: ${settingsTheme.shadow.xs};
`;

const ErrorMessage = styled.div`
   display: flex;
   align-items: center;
   gap: ${settingsTheme.spacing.sm};
   background: ${settingsTheme.status.errorLight};
   color: ${settingsTheme.status.error};
   padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
   border-radius: ${settingsTheme.radius.lg};
   border: 1px solid ${settingsTheme.status.error}30;
   font-weight: 500;
   box-shadow: ${settingsTheme.shadow.xs};
`;

const MessageIcon = styled.div`
   font-size: 18px;
   flex-shrink: 0;
`;

const ContentGrid = styled.div`
   display: grid;
   grid-template-columns: 1fr;
   gap: ${settingsTheme.spacing.lg};

   @media (min-width: 1200px) {
       grid-template-columns: 1fr 1fr;
   }
`;

const SectionCard = styled.div`
   background: ${settingsTheme.surface};
   border-radius: ${settingsTheme.radius.xl};
   border: 1px solid ${settingsTheme.border};
   overflow: hidden;
   box-shadow: ${settingsTheme.shadow.sm};
   transition: all ${settingsTheme.transitions.spring};

   &:hover {
       border-color: ${settingsTheme.borderHover};
       box-shadow: ${settingsTheme.shadow.md};
   }
`;

const SectionHeader = styled.div`
   display: flex;
   align-items: center;
   gap: ${settingsTheme.spacing.md};
   padding: ${settingsTheme.spacing.lg};
   border-bottom: 1px solid ${settingsTheme.border};
   background: ${settingsTheme.surfaceAlt};
`;

const SectionIcon = styled.div`
   width: 40px;
   height: 40px;
   background: ${settingsTheme.primaryGhost};
   border-radius: ${settingsTheme.radius.lg};
   display: flex;
   align-items: center;
   justify-content: center;
   color: ${settingsTheme.primary};
   font-size: 18px;
   flex-shrink: 0;
`;

const SectionTitle = styled.h3`
   font-size: 18px;
   font-weight: 600;
   color: ${settingsTheme.text.primary};
   margin: 0;
   letter-spacing: -0.025em;
   flex: 1;
`;

const TestEmailButton = styled.button`
   display: flex;
   align-items: center;
   gap: ${settingsTheme.spacing.sm};
   padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
   background: ${settingsTheme.status.infoLight};
   color: ${settingsTheme.status.info};
   border: 1px solid ${settingsTheme.status.info}30;
   border-radius: ${settingsTheme.radius.md};
   font-size: 14px;
   font-weight: 600;
   cursor: pointer;
   transition: all ${settingsTheme.transitions.spring};

   &:hover:not(:disabled) {
       background: ${settingsTheme.status.info};
       color: white;
       transform: translateY(-1px);
       box-shadow: ${settingsTheme.shadow.md};
   }

   &:disabled {
       opacity: 0.6;
       cursor: not-allowed;
       transform: none;
   }

   svg {
       animation: ${props => props.disabled ? 'spin 1s linear infinite' : 'none'};
   }

   @keyframes spin {
       0% { transform: rotate(0deg); }
       100% { transform: rotate(360deg); }
   }
`;

const TestResultContainer = styled.div<{ $success: boolean }>`
   display: flex;
   align-items: center;
   gap: ${settingsTheme.spacing.sm};
   padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
   background: ${props => props.$success ? settingsTheme.status.successLight : settingsTheme.status.errorLight};
   color: ${props => props.$success ? settingsTheme.status.success : settingsTheme.status.error};
   border-bottom: 1px solid ${settingsTheme.border};
   font-weight: 500;
`;

const TestResultIcon = styled.div`
   font-size: 16px;
   flex-shrink: 0;
`;

const TestResultText = styled.div`
   flex: 1;
`;

const TestErrorDetails = styled.div`
   font-size: 12px;
   opacity: 0.8;
   margin-top: 4px;
`;

const SectionContent = styled.div`
   padding: ${settingsTheme.spacing.lg};
`;

const SubSectionTitle = styled.h4`
   font-size: 16px;
   font-weight: 600;
   color: ${settingsTheme.text.primary};
   margin: 0 0 ${settingsTheme.spacing.md} 0;
   padding-top: ${settingsTheme.spacing.lg};
   border-top: 1px solid ${settingsTheme.borderLight};

   &:first-child {
       padding-top: 0;
       border-top: none;
   }
`;

const FormGrid = styled.div`
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: ${settingsTheme.spacing.md};

   @media (max-width: 768px) {
       grid-template-columns: 1fr;
   }
`;

const FormGroup = styled.div<{ $fullWidth?: boolean }>`
   display: flex;
   flex-direction: column;
   gap: ${settingsTheme.spacing.xs};
   ${props => props.$fullWidth && 'grid-column: 1 / -1;'}
`;

const Label = styled.label`
   font-weight: 600;
   font-size: 14px;
   color: ${settingsTheme.text.primary};
   display: flex;
   align-items: center;
   gap: ${settingsTheme.spacing.xs};
`;

const ValidationSpinner = styled.div`
   font-size: 12px;
   color: ${settingsTheme.text.muted};
   animation: spin 1s linear infinite;

   @keyframes spin {
       0% { transform: rotate(0deg); }
       100% { transform: rotate(360deg); }
   }
`;

const ValidationStatus = styled.div<{ $valid: boolean }>`
   font-size: 12px;
   color: ${props => props.$valid ? settingsTheme.status.success : settingsTheme.status.error};
`;

const Input = styled.input<{ $hasError?: boolean }>`
   height: 44px;
   padding: 0 ${settingsTheme.spacing.md};
   border: 2px solid ${props => props.$hasError ? settingsTheme.status.error : settingsTheme.border};
   border-radius: ${settingsTheme.radius.md};
   font-size: 14px;
   font-weight: 500;
   background: ${settingsTheme.surface};
   color: ${settingsTheme.text.primary};
   transition: all ${settingsTheme.transitions.spring};

   &:focus {
       outline: none;
       border-color: ${props => props.$hasError ? settingsTheme.status.error : settingsTheme.primary};
       box-shadow: 0 0 0 3px ${props => props.$hasError ? settingsTheme.status.error + '30' : settingsTheme.primaryGhost};
   }

   &::placeholder {
       color: ${settingsTheme.text.muted};
       font-weight: 400;
   }
`;

const PasswordInputContainer = styled.div`
   position: relative;
   display: flex;
   align-items: center;
`;

const PasswordToggle = styled.button`
   position: absolute;
   right: 12px;
   background: none;
   border: none;
   color: ${settingsTheme.text.muted};
   cursor: pointer;
   padding: 4px;
   border-radius: ${settingsTheme.radius.sm};
   transition: all ${settingsTheme.transitions.fast};

   &:hover {
       color: ${settingsTheme.text.primary};
       background: ${settingsTheme.surfaceAlt};
   }
`;

const SecurityOptionsGrid = styled.div`
   display: flex;
   gap: ${settingsTheme.spacing.lg};
   flex-wrap: wrap;
`;

const CheckboxGroup = styled.div`
   display: flex;
   align-items: center;
   gap: ${settingsTheme.spacing.sm};
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
   width: 18px;
   height: 18px;
   accent-color: ${settingsTheme.primary};
   cursor: pointer;
`;

const CheckboxLabel = styled.label`
   font-size: 14px;
   font-weight: 500;
   color: ${settingsTheme.text.primary};
   cursor: pointer;
`;

const ErrorText = styled.div`
   color: ${settingsTheme.status.error};
   font-size: 12px;
   font-weight: 500;
   margin-top: 2px;
   display: flex;
   align-items: center;
   gap: 4px;
`;

const LogoContainer = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${settingsTheme.spacing.lg};
`;

const LogoPreviewArea = styled.div`
   display: flex;
   justify-content: center;
   padding: ${settingsTheme.spacing.xl};
   border: 2px dashed ${settingsTheme.border};
   border-radius: ${settingsTheme.radius.lg};
   background: ${settingsTheme.surfaceAlt};
`;

const LogoPreview = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: ${settingsTheme.spacing.md};
`;

const LogoImage = styled.img`
   max-width: 200px;
   max-height: 200px;
   object-fit: contain;
   border-radius: ${settingsTheme.radius.md};
   box-shadow: ${settingsTheme.shadow.md};
`;

const LogoInfo = styled.div`
   text-align: center;
`;

const LogoFileName = styled.div`
   font-size: 14px;
   font-weight: 600;
   color: ${settingsTheme.text.primary};
`;

const LogoFileSize = styled.div`
   font-size: 12px;
   color: ${settingsTheme.text.muted};
`;

const LogoPlaceholder = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: ${settingsTheme.spacing.sm};
   color: ${settingsTheme.text.muted};
   font-size: 16px;
   font-weight: 500;

   svg {
       font-size: 32px;
       opacity: 0.5;
   }
`;

const LogoActions = styled.div`
   display: flex;
   gap: ${settingsTheme.spacing.sm};
   justify-content: center;
   flex-wrap: wrap;
`;

const LogoHelpText = styled.div`
   font-size: 12px;
   color: ${settingsTheme.text.muted};
   text-align: center;
   line-height: 1.4;
`;

const BaseButton = styled.button`
   display: flex;
   align-items: center;
   gap: ${settingsTheme.spacing.sm};
   padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
   border-radius: ${settingsTheme.radius.md};
   font-weight: 600;
   font-size: 14px;
   cursor: pointer;
   transition: all ${settingsTheme.transitions.spring};
   border: 1px solid transparent;
   white-space: nowrap;
   min-height: 44px;
   position: relative;
   overflow: hidden;

   &:hover:not(:disabled) {
       transform: translateY(-1px);
   }

   &:active:not(:disabled) {
       transform: translateY(0);
   }

   &:disabled {
       opacity: 0.5;
       cursor: not-allowed;
       transform: none;
   }

   @media (max-width: 576px) {
       justify-content: center;
   }
`;

const PrimaryButton = styled(BaseButton)`
   background: linear-gradient(135deg, ${settingsTheme.primary} 0%, ${settingsTheme.primaryLight} 100%);
   color: white;
   box-shadow: ${settingsTheme.shadow.sm};

   &:hover:not(:disabled) {
       background: linear-gradient(135deg, ${settingsTheme.primaryDark} 0%, ${settingsTheme.primary} 100%);
       box-shadow: ${settingsTheme.shadow.md};
   }
`;

const SecondaryButton = styled(BaseButton)`
   background: ${settingsTheme.surface};
   color: ${settingsTheme.text.secondary};
   border-color: ${settingsTheme.border};
   box-shadow: ${settingsTheme.shadow.xs};

   &:hover:not(:disabled) {
       background: ${settingsTheme.surfaceHover};
       color: ${settingsTheme.text.primary};
       border-color: ${settingsTheme.borderHover};
       box-shadow: ${settingsTheme.shadow.sm};
   }
`;

const DangerButton = styled(BaseButton)`
   background: ${settingsTheme.status.errorLight};
   color: ${settingsTheme.status.error};
   border-color: ${settingsTheme.status.error}30;

   &:hover:not(:disabled) {
       background: ${settingsTheme.status.error};
       color: white;
       border-color: ${settingsTheme.status.error};
       box-shadow: ${settingsTheme.shadow.md};
   }
`;

const UnsavedChangesIndicator = styled.div`
   position: fixed;
   bottom: 20px;
   right: 20px;
   display: flex;
   align-items: center;
   gap: ${settingsTheme.spacing.sm};
   background: ${settingsTheme.status.warningLight};
   color: ${settingsTheme.status.warning};
   padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
   border-radius: ${settingsTheme.radius.lg};
   border: 1px solid ${settingsTheme.status.warning}30;
   font-weight: 600;
   font-size: 14px;
   box-shadow: ${settingsTheme.shadow.lg};
   z-index: 1000;
   animation: slideIn 0.3s ease;

   @keyframes slideIn {
       from {
           transform: translateX(100%);
           opacity: 0;
       }
       to {
           transform: translateX(0);
           opacity: 1;
       }
   }
`;

export default CompanySettingsPage;