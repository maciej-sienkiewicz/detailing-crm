// src/pages/Settings/CompanySettingsPage.tsx
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import {
    FaBuilding,
    FaEnvelope,
    FaCheck,
    FaTimes,
    FaEdit,
    FaSave,
    FaSpinner,
    FaEye,
    FaEyeSlash,
    FaCheckCircle,
    FaExclamationTriangle,
    FaServer,
    FaCreditCard,
    FaShieldAlt,
    FaInfoCircle,
    FaGlobe,
    FaPhone,
    FaMapMarkerAlt,
    FaGoogleDrive,
    FaCloud,
    FaSync,
    FaFileArchive,
    FaTrashAlt,
    FaExternalLinkAlt,
    FaClipboard
} from 'react-icons/fa';

// Import API and types
import {
    companySettingsApi,
    companySettingsValidation,
    type CompanySettingsResponse,
    type UpdateCompanySettingsRequest,
    type TestEmailConnectionRequest,
    type EmailTestResponse,
    type NipValidationResponse,
    type GoogleDriveFolderSettings,
    type GoogleDriveSystemInfo,
    type ValidateFolderResponse
} from '../../api/companySettingsApi';
import {EmailSettingsCard} from "./EmailSettingsCard";

// Professional theme matching finances module
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
    },

    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }
};

type EditingSection = 'basic' | 'bank' | 'email' | null;

const CompanySettingsPage = forwardRef<{ handleSave: () => void }>((props, ref) => {
    const [formData, setFormData] = useState<CompanySettingsResponse | null>(null);
    const [originalData, setOriginalData] = useState<CompanySettingsResponse | null>(null);
    const [editingSection, setEditingSection] = useState<EditingSection>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showPasswords, setShowPasswords] = useState({ smtp: false, imap: false });
    const [testingEmail, setTestingEmail] = useState(false);
    const [emailTestResult, setEmailTestResult] = useState<EmailTestResponse | null>(null);
    const [nipValidation, setNipValidation] = useState<{ isValid: boolean; message: string } | null>(null);
    const [validatingNip, setValidatingNip] = useState(false);

    // Google Drive state - NOWA WERSJA
    const [googleDriveSettings, setGoogleDriveSettings] = useState<GoogleDriveFolderSettings | null>(null);
    const [googleDriveSystemInfo, setGoogleDriveSystemInfo] = useState<GoogleDriveSystemInfo | null>(null);
    const [testingGoogleDrive, setTestingGoogleDrive] = useState(false);
    const [validatingFolder, setValidatingFolder] = useState(false);
    const [configuringFolder, setConfiguringFolder] = useState(false);
    const [backingUp, setBackingUp] = useState(false);
    const [googleDriveTestResult, setGoogleDriveTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [folderValidationResult, setFolderValidationResult] = useState<ValidateFolderResponse | null>(null);
    const [folderIdInput, setFolderIdInput] = useState('');
    const [folderNameInput, setFolderNameInput] = useState('');

    useImperativeHandle(ref, () => ({
        handleSave: handleSaveAll
    }));

    // Load company settings on component mount
    useEffect(() => {
        loadCompanySettings();
        loadGoogleDriveSettings();
        loadGoogleDriveSystemInfo();
    }, []);

    const loadCompanySettings = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await companySettingsApi.getCompanySettings();
            setFormData(data);
            setOriginalData(data);
        } catch (err) {
            console.error('Error loading company settings:', err);
            setError('Nie udało się załadować ustawień firmy');
        } finally {
            setLoading(false);
        }
    };

    // Google Drive functions - NOWA WERSJA
    const loadGoogleDriveSettings = async () => {
        try {
            const settings = await companySettingsApi.getGoogleDriveIntegrationStatus();
            setGoogleDriveSettings(settings);
        } catch (err) {
            console.error('Error loading Google Drive settings:', err);
        }
    };

    const loadGoogleDriveSystemInfo = async () => {
        try {
            const systemInfo = await companySettingsApi.getGoogleDriveSystemInfo();
            setGoogleDriveSystemInfo(systemInfo);
        } catch (err) {
            console.error('Error loading Google Drive system info:', err);
        }
    };

    const handleValidateFolder = async () => {
        if (!folderIdInput.trim()) {
            setError('Wprowadź ID folderu');
            return;
        }

        // Walidacja formatu ID folderu
        const validation = companySettingsValidation.validateGoogleDriveFolderId(folderIdInput);
        if (!validation.valid) {
            setError(validation.error || 'Nieprawidłowy format ID folderu');
            return;
        }

        try {
            setValidatingFolder(true);
            setError(null);
            setFolderValidationResult(null);

            const result = await companySettingsApi.validateGoogleDriveFolder(folderIdInput.trim());
            setFolderValidationResult(result);

            if (!result.valid) {
                setError(result.message);
            }
        } catch (err) {
            console.error('Error validating folder:', err);
            setError('Nie udało się sprawdzić folderu');
        } finally {
            setValidatingFolder(false);
        }
    };

    const handleConfigureFolder = async () => {
        if (!folderIdInput.trim()) {
            setError('Wprowadź ID folderu');
            return;
        }

        // Waliduj najpierw folder jeśli jeszcze nie zwalidowany
        if (!folderValidationResult?.valid) {
            await handleValidateFolder();
            return;
        }

        try {
            setConfiguringFolder(true);
            setError(null);

            const result = await companySettingsApi.configureGoogleDriveFolder({
                folderId: folderIdInput.trim(),
                folderName: folderNameInput.trim() || undefined
            });

            if (result.status === 'success') {
                setSuccessMessage('Folder Google Drive został skonfigurowany pomyślnie');
                setFolderIdInput('');
                setFolderNameInput('');
                setFolderValidationResult(null);
                await loadGoogleDriveSettings();
            } else {
                setError(result.message || 'Nie udało się skonfigurować folderu');
            }
        } catch (err) {
            console.error('Error configuring folder:', err);
            setError('Nie udało się skonfigurować folderu');
        } finally {
            setConfiguringFolder(false);
        }
    };

    const testGoogleDriveConnection = async () => {
        try {
            setTestingGoogleDrive(true);
            setGoogleDriveTestResult(null);

            const settings = await companySettingsApi.getGoogleDriveIntegrationStatus();

            if (settings.systemServiceAvailable && settings.isActive) {
                setGoogleDriveTestResult({
                    success: true,
                    message: 'Połączenie z Google Drive działa prawidłowo'
                });
            } else {
                setGoogleDriveTestResult({
                    success: false,
                    message: settings.systemServiceAvailable
                        ? 'Integracja nie jest aktywna'
                        : 'Usługa systemowa nie jest dostępna'
                });
            }
        } catch (err) {
            console.error('Error testing Google Drive connection:', err);
            setGoogleDriveTestResult({
                success: false,
                message: 'Błąd podczas testowania połączenia'
            });
        } finally {
            setTestingGoogleDrive(false);
        }
    };

    const handleBackupCurrentMonth = async () => {
        try {
            setBackingUp(true);
            setError(null);

            const result = await companySettingsApi.backupCurrentMonth();

            if (result.status === 'success') {
                setSuccessMessage('Backup bieżącego miesiąca wykonany pomyślnie');
                await loadGoogleDriveSettings(); // Odśwież statystyki
            } else {
                setError(result.message || 'Nie udało się wykonać backup');
            }
        } catch (err) {
            console.error('Error running backup:', err);
            setError('Nie udało się wykonać backup');
        } finally {
            setBackingUp(false);
        }
    };

    const handleDeactivateIntegration = async () => {
        if (!window.confirm('Czy na pewno chcesz dezaktywować integrację z Google Drive? Będziesz mógł ją ponownie skonfigurować w każdej chwili.')) {
            return;
        }

        try {
            setError(null);

            const result = await companySettingsApi.deactivateGoogleDriveIntegration();

            if (result.status === 'success') {
                setSuccessMessage('Integracja z Google Drive została dezaktywowana');
                await loadGoogleDriveSettings();
            } else {
                setError(result.message || 'Nie udało się dezaktywować integracji');
            }
        } catch (err) {
            console.error('Error deactivating integration:', err);
            setError('Nie udało się dezaktywować integracji');
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setSuccessMessage('Skopiowano do schowka');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleInputChange = (section: keyof CompanySettingsResponse, field: string, value: any) => {
        if (!formData) return;

        setFormData(prev => ({
            ...prev!,
            [section]: {
                ...prev![section],
                [field]: value
            }
        }));

        // Clear NIP validation when NIP changes
        if (section === 'basicInfo' && field === 'taxId') {
            setNipValidation(null);
        }
    };

    const validateNIP = async (nip: string) => {
        if (!nip || nip.length < 10) {
            setNipValidation(null);
            return;
        }

        try {
            setValidatingNip(true);
            const result = await companySettingsApi.validateNIP(nip);
            setNipValidation({
                isValid: result.valid,
                message: result.message
            });
        } catch (err) {
            console.error('Error validating NIP:', err);
            setNipValidation({
                isValid: false,
                message: 'Błąd walidacji NIP'
            });
        } finally {
            setValidatingNip(false);
        }
    };

    const handleSaveAll = async () => {
        if (!formData || !originalData) return;

        try {
            setSaving(true);
            setError(null);

            const updateRequest: UpdateCompanySettingsRequest = {
                basicInfo: formData.basicInfo,
                bankSettings: formData.bankSettings,
                emailSettings: formData.emailSettings,
                logoSettings: formData.logoSettings
            };

            const updatedData = await companySettingsApi.updateCompanySettings(updateRequest);

            setFormData(updatedData);
            setOriginalData(updatedData);
            setEditingSection(null);
            setSuccessMessage('Ustawienia zostały zapisane pomyślnie');

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error saving company settings:', err);
            setError('Nie udało się zapisać ustawień');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSection = async (section: EditingSection) => {
        if (!section || !formData) return;
        await handleSaveAll();
    };

    const handleCancelSection = (section: EditingSection) => {
        if (!section || !originalData) return;
        setFormData(originalData);
        setEditingSection(null);
        setError(null);
    };

    const testEmailConnection = async () => {
        if (!formData?.emailSettings) return;

        const { emailSettings } = formData;

        if (!emailSettings.smtpHost || !emailSettings.smtpPort || !emailSettings.smtpUsername || !emailSettings.senderEmail) {
            setEmailTestResult({
                success: false,
                message: 'Uzupełnij wszystkie wymagane pola SMTP',
                errorDetails: 'Brakuje host, port, username lub email nadawcy'
            });
            return;
        }

        try {
            setTestingEmail(true);
            setEmailTestResult(null);

            const testRequest: TestEmailConnectionRequest = {
                smtpHost: emailSettings.smtpHost,
                smtpPort: emailSettings.smtpPort,
                smtpUsername: emailSettings.smtpUsername,
                smtpPassword: emailSettings.smtpPassword || '',
                useSSL: emailSettings.useSSL,
                useTLS: emailSettings.useTLS,
                testEmail: emailSettings.senderEmail
            };

            const result = await companySettingsApi.testEmailConnection(testRequest);
            setEmailTestResult(result);
        } catch (err) {
            console.error('Error testing email connection:', err);
            setEmailTestResult({
                success: false,
                message: 'Błąd podczas testowania połączenia',
                errorDetails: err instanceof Error ? err.message : 'Nieznany błąd'
            });
        } finally {
            setTestingEmail(false);
        }
    };

    const hasUnsavedChanges = formData && originalData ?
        JSON.stringify(formData) !== JSON.stringify(originalData) : false;

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie ustawień...</LoadingText>
                </LoadingContainer>
            </PageContainer>
        );
    }

    if (!formData) {
        return (
            <PageContainer>
                <ErrorContainer>
                    <ErrorIcon>⚠️</ErrorIcon>
                    <ErrorText>{error || 'Nie udało się załadować danych'}</ErrorText>
                    <RetryButton onClick={loadCompanySettings}>
                        Spróbuj ponownie
                    </RetryButton>
                </ErrorContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Success/Error Messages */}
            {successMessage && (
                <MessageContainer>
                    <SuccessMessage>
                        <MessageIcon>✓</MessageIcon>
                        {successMessage}
                    </SuccessMessage>
                </MessageContainer>
            )}

            {error && (
                <MessageContainer>
                    <ErrorMessage>
                        <MessageIcon>⚠️</MessageIcon>
                        {error}
                    </ErrorMessage>
                </MessageContainer>
            )}

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
                                        value={formData.basicInfo?.companyName || ''}
                                        onChange={(e) => handleInputChange('basicInfo', 'companyName', e.target.value)}
                                        placeholder="Wprowadź nazwę firmy"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.basicInfo?.companyName}>
                                        {formData.basicInfo?.companyName || 'Nie podano'}
                                    </DisplayValue>
                                )}
                            </FormField>

                            <FormField>
                                <FieldLabel>
                                    <span className="icon">🏛️</span>
                                    NIP
                                    <RequiredMark>*</RequiredMark>
                                    <ValidationStatus $valid={nipValidation?.isValid ?? !!formData.basicInfo?.taxId}>
                                        {validatingNip ? (
                                            <FaSpinner className="spinning" />
                                        ) : nipValidation?.isValid ?? !!formData.basicInfo?.taxId ? (
                                            <FaCheckCircle />
                                        ) : (
                                            <FaExclamationTriangle />
                                        )}
                                    </ValidationStatus>
                                </FieldLabel>
                                {editingSection === 'basic' ? (
                                    <>
                                        <Input
                                            value={formData.basicInfo?.taxId || ''}
                                            onChange={(e) => handleInputChange('basicInfo', 'taxId', e.target.value)}
                                            onBlur={(e) => validateNIP(e.target.value)}
                                            placeholder="123-456-78-90"
                                        />
                                        {nipValidation && (
                                            <ValidationMessage $isValid={nipValidation.isValid}>
                                                {nipValidation.message}
                                            </ValidationMessage>
                                        )}
                                    </>
                                ) : (
                                    <DisplayValue $hasValue={!!formData.basicInfo?.taxId}>
                                        {formData.basicInfo?.taxId || 'Nie podano'}
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
                                        value={formData.basicInfo?.address || ''}
                                        onChange={(e) => handleInputChange('basicInfo', 'address', e.target.value)}
                                        placeholder="ul. Nazwa 123, 00-000 Miasto"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.basicInfo?.address}>
                                        {formData.basicInfo?.address || 'Nie podano'}
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
                                        value={formData.basicInfo?.phone || ''}
                                        onChange={(e) => handleInputChange('basicInfo', 'phone', e.target.value)}
                                        placeholder="+48 123 456 789"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.basicInfo?.phone}>
                                        {formData.basicInfo?.phone || 'Nie podano'}
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
                                        value={formData.basicInfo?.website || ''}
                                        onChange={(e) => handleInputChange('basicInfo', 'website', e.target.value)}
                                        placeholder="https://firma.pl"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.basicInfo?.website}>
                                        {formData.basicInfo?.website ? (
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
                                <HeaderSubtitle>Te dane będą wykorzystywane przy tworzeniu faktur</HeaderSubtitle>
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
                                        value={formData.bankSettings?.bankAccountNumber || ''}
                                        onChange={(e) => handleInputChange('bankSettings', 'bankAccountNumber', e.target.value)}
                                        placeholder="12 3456 7890 1234 5678 9012 3456"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.bankSettings?.bankAccountNumber}>
                                        {formData.bankSettings?.bankAccountNumber || 'Nie podano'}
                                    </DisplayValue>
                                )}
                            </FormField>

                            <FormField>
                                <FieldLabel>Nazwa banku</FieldLabel>
                                {editingSection === 'bank' ? (
                                    <Input
                                        value={formData.bankSettings?.bankName || ''}
                                        onChange={(e) => handleInputChange('bankSettings', 'bankName', e.target.value)}
                                        placeholder="Nazwa banku"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.bankSettings?.bankName}>
                                        {formData.bankSettings?.bankName || 'Nie podano'}
                                    </DisplayValue>
                                )}
                            </FormField>

                            <FormField>
                                <FieldLabel>Kod SWIFT</FieldLabel>
                                {editingSection === 'bank' ? (
                                    <Input
                                        value={formData.bankSettings?.swiftCode || ''}
                                        onChange={(e) => handleInputChange('bankSettings', 'swiftCode', e.target.value)}
                                        placeholder="PKOPPLPW"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.bankSettings?.swiftCode}>
                                        {formData.bankSettings?.swiftCode || 'Nie podano'}
                                    </DisplayValue>
                                )}
                            </FormField>

                            <FormField>
                                <FieldLabel>Właściciel konta</FieldLabel>
                                {editingSection === 'bank' ? (
                                    <Input
                                        value={formData.bankSettings?.accountHolderName || ''}
                                        onChange={(e) => handleInputChange('bankSettings', 'accountHolderName', e.target.value)}
                                        placeholder="Nazwa właściciela konta"
                                    />
                                ) : (
                                    <DisplayValue $hasValue={!!formData.bankSettings?.accountHolderName}>
                                        {formData.bankSettings?.accountHolderName || 'Nie podano'}
                                    </DisplayValue>
                                )}
                            </FormField>
                        </FormGrid>
                    </CardBody>
                </SettingsCard>

                {/* Email Settings */}
                <EmailSettingsCard
                    onSuccess={setSuccessMessage}
                    onError={setError}
                />

                {/* Google Drive Settings - NOWA WERSJA */}
                <SettingsCard>
                    <CardHeader>
                        <HeaderContent>
                            <HeaderIcon>
                                <FaGoogleDrive />
                            </HeaderIcon>
                            <HeaderText>
                                <HeaderTitle>Google Drive</HeaderTitle>
                                <HeaderSubtitle>Automatyczne kopie zapasowe faktur w folderze Google Drive</HeaderSubtitle>
                            </HeaderText>
                        </HeaderContent>
                        <HeaderActions>
                            <ActionGroup>
                                <SecondaryButton onClick={testGoogleDriveConnection} disabled={testingGoogleDrive}>
                                    {testingGoogleDrive ? <FaSpinner className="spinning" /> : <FaCloud />}
                                    Test połączenia
                                </SecondaryButton>
                                {googleDriveSettings?.isActive && (
                                    <PrimaryButton onClick={handleBackupCurrentMonth} disabled={backingUp}>
                                        {backingUp ? <FaSpinner className="spinning" /> : <FaSync />}
                                        Backup teraz
                                    </PrimaryButton>
                                )}
                            </ActionGroup>
                        </HeaderActions>
                    </CardHeader>

                    {googleDriveTestResult && (
                        <TestResultBanner $success={googleDriveTestResult.success}>
                            <TestResultIcon>
                                {googleDriveTestResult.success ? <FaCheckCircle /> : <FaExclamationTriangle />}
                            </TestResultIcon>
                            <TestResultText>
                                {googleDriveTestResult.message}
                            </TestResultText>
                        </TestResultBanner>
                    )}

                    <CardBody>
                        <ConfigStatusBanner $configured={googleDriveSettings?.isActive ?? false}>
                            <StatusIcon>
                                {googleDriveSettings?.isActive ? <FaCheckCircle /> : <FaExclamationTriangle />}
                            </StatusIcon>
                            <StatusText>
                                {googleDriveSettings?.isActive
                                    ? `Integracja aktywna - folder: ${googleDriveSettings.folderName || 'Folder główny'}`
                                    : 'Integracja wymaga konfiguracji folderu Google Drive'
                                }
                            </StatusText>
                        </ConfigStatusBanner>

                        {googleDriveSettings?.isActive ? (
                            // Stan skonfigurowany - NOWA WERSJA
                            <GoogleDriveConfigured>
                                <GoogleDriveInfo>
                                    <InfoGrid>
                                        <InfoItem>
                                            <InfoLabel>Folder</InfoLabel>
                                            <InfoValue>
                                                {googleDriveSettings.folderUrl ? (
                                                    <ExternalLink href={googleDriveSettings.folderUrl} target="_blank">
                                                        {googleDriveSettings.folderName || googleDriveSettings.folderId}
                                                        <FaExternalLinkAlt style={{ marginLeft: '4px', fontSize: '12px' }} />
                                                    </ExternalLink>
                                                ) : (
                                                    googleDriveSettings.folderName || googleDriveSettings.folderId
                                                )}
                                            </InfoValue>
                                        </InfoItem>

                                        <InfoItem>
                                            <InfoLabel>Status</InfoLabel>
                                            <StatusBadge $active={googleDriveSettings.systemServiceAvailable}>
                                                {googleDriveSettings.systemServiceAvailable ? 'Aktywny' : 'Niedostępny'}
                                            </StatusBadge>
                                        </InfoItem>

                                        <InfoItem>
                                            <InfoLabel>Ostatni backup</InfoLabel>
                                            <InfoValue>
                                                {googleDriveSettings.lastBackupAt
                                                    ? new Date(googleDriveSettings.lastBackupAt).toLocaleString('pl-PL')
                                                    : 'Nigdy'
                                                }
                                            </InfoValue>
                                        </InfoItem>

                                        <InfoItem>
                                            <InfoLabel>Liczba backup-ów</InfoLabel>
                                            <InfoValue>{googleDriveSettings.backupCount || 0}</InfoValue>
                                        </InfoItem>

                                        <InfoItem>
                                            <InfoLabel>Konto systemowe</InfoLabel>
                                            <InfoValue style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                                                {googleDriveSettings.systemEmail}
                                            </InfoValue>
                                        </InfoItem>

                                        <InfoItem>
                                            <InfoLabel>Status ostatniego backup</InfoLabel>
                                            <InfoValue>
                                                <StatusBadge $active={googleDriveSettings.lastBackupStatus === 'SUCCESS'}>
                                                    {googleDriveSettings.lastBackupStatus || 'Brak danych'}
                                                </StatusBadge>
                                            </InfoValue>
                                        </InfoItem>
                                    </InfoGrid>
                                </GoogleDriveInfo>

                                <GoogleDriveActions>
                                    <ActionGroup>
                                        <SecondaryButton onClick={() => {
                                            setGoogleDriveSettings(prev => prev ? { ...prev, isActive: false } : null);
                                            setFolderIdInput('');
                                            setFolderNameInput('');
                                        }}>
                                            <FaEdit />
                                            Zmień folder
                                        </SecondaryButton>
                                        <DangerButton onClick={handleDeactivateIntegration}>
                                            <FaTrashAlt />
                                            Dezaktywuj
                                        </DangerButton>
                                    </ActionGroup>
                                </GoogleDriveActions>

                                <GoogleDriveHelp>
                                    <HelpTitle>
                                        <FaInfoCircle />
                                        Jak działa backup?
                                    </HelpTitle>
                                    <HelpList>
                                        <HelpItem>Faktury są automatycznie organizowane w folderach: faktury/rok/miesiąc/kierunek</HelpItem>
                                        <HelpItem>Backup można uruchomić ręcznie przyciskiem "Backup teraz"</HelpItem>
                                        <HelpItem>Kopie zapasowe zawierają wszystkie faktury z bieżącego miesiąca</HelpItem>
                                        <HelpItem>Pliki są bezpiecznie przechowywane w Twoim folderze Google Drive</HelpItem>
                                        <HelpItem>System używa konta: {googleDriveSettings.systemEmail}</HelpItem>
                                    </HelpList>
                                </GoogleDriveHelp>
                            </GoogleDriveConfigured>
                        ) : (
                            // Stan niekonfigurowany - NOWA WERSJA
                            <GoogleDriveSetup>
                                <SetupSteps>
                                    <SetupTitle>Konfiguracja Google Drive w 4 prostych krokach:</SetupTitle>
                                    <StepsList>
                                        <SetupStep>
                                            <StepNumber>1</StepNumber>
                                            <StepContent>
                                                <StepTitle>Utwórz folder w Google Drive</StepTitle>
                                                <StepDescription>
                                                    Przejdź do <ExternalLink href="https://drive.google.com" target="_blank">Google Drive</ExternalLink> i utwórz nowy folder dla kopii zapasowych faktur
                                                </StepDescription>
                                            </StepContent>
                                        </SetupStep>
                                        <SetupStep>
                                            <StepNumber>2</StepNumber>
                                            <StepContent>
                                                <StepTitle>Udostępnij folder dla systemu</StepTitle>
                                                <StepDescription>
                                                    Kliknij prawym przyciskiem na folder → "Udostępnij" → dodaj email:
                                                    <EmailCopyBox style={{ marginTop: '8px' }}>
                                                        <EmailText>{googleDriveSystemInfo?.systemEmail || 'system@carslab.com'}</EmailText>
                                                        <CopyButton onClick={() => copyToClipboard(googleDriveSystemInfo?.systemEmail || '')}>
                                                            <FaClipboard />
                                                        </CopyButton>
                                                    </EmailCopyBox>
                                                    z uprawnieniami "Edytor"
                                                </StepDescription>
                                            </StepContent>
                                        </SetupStep>
                                        <SetupStep>
                                            <StepNumber>3</StepNumber>
                                            <StepContent>
                                                <StepTitle>Skopiuj ID folderu</StepTitle>
                                                <StepDescription>
                                                    Otwórz folder w przeglądarce i skopiuj ID z URL (długi ciąg znaków po "/folders/")
                                                </StepDescription>
                                                <ExampleUrl>
                                                    Przykład URL: https://drive.google.com/drive/folders/<HighlightText>1PqsrjjfVbc-wMOCsrqPtjpiB2rPqgs4v</HighlightText>
                                                </ExampleUrl>
                                            </StepContent>
                                        </SetupStep>
                                        <SetupStep>
                                            <StepNumber>4</StepNumber>
                                            <StepContent>
                                                <StepTitle>Skonfiguruj poniżej</StepTitle>
                                                <StepDescription>
                                                    Wklej ID folderu i opcjonalnie podaj nazwę dla łatwiejszej identyfikacji
                                                </StepDescription>
                                            </StepContent>
                                        </SetupStep>
                                    </StepsList>
                                </SetupSteps>

                                <UploadArea>
                                    <UploadContent>
                                        <UploadIcon>
                                            <FaFileArchive />
                                        </UploadIcon>
                                        <UploadTitle>Konfiguracja folderu Google Drive</UploadTitle>
                                        <UploadDescription>
                                            Wprowadź ID folderu który udostępniłeś dla konta systemowego
                                        </UploadDescription>

                                        <FormGrid style={{ marginTop: '24px', width: '100%' }}>
                                            <FormField $fullWidth>
                                                <FieldLabel>
                                                    ID folderu Google Drive
                                                    <RequiredMark>*</RequiredMark>
                                                </FieldLabel>
                                                <Input
                                                    value={folderIdInput}
                                                    onChange={(e) => setFolderIdInput(e.target.value)}
                                                    placeholder="1PqsrjjfVbc-wMOCsrqPtjpiB2rPqgs4v"
                                                    style={{ fontFamily: 'monospace', fontSize: '13px' }}
                                                />
                                                <HelpText>
                                                    Skopiuj ID z URL folderu Google Drive (część po "/folders/")
                                                </HelpText>
                                            </FormField>

                                            <FormField $fullWidth>
                                                <FieldLabel>Nazwa folderu (opcjonalnie)</FieldLabel>
                                                <Input
                                                    value={folderNameInput}
                                                    onChange={(e) => setFolderNameInput(e.target.value)}
                                                    placeholder="Faktury CRM - Backup"
                                                />
                                                <HelpText>
                                                    Opis dla łatwiejszej identyfikacji w systemie
                                                </HelpText>
                                            </FormField>
                                        </FormGrid>

                                        <ActionGroup style={{ marginTop: '24px', justifyContent: 'center' }}>
                                            <SecondaryButton
                                                onClick={handleValidateFolder}
                                                disabled={validatingFolder || !folderIdInput.trim()}
                                            >
                                                {validatingFolder ? <FaSpinner className="spinning" /> : <FaCheckCircle />}
                                                {validatingFolder ? 'Sprawdzanie...' : 'Sprawdź folder'}
                                            </SecondaryButton>

                                            {folderValidationResult?.valid && (
                                                <PrimaryButton
                                                    onClick={handleConfigureFolder}
                                                    disabled={configuringFolder}
                                                >
                                                    {configuringFolder ? <FaSpinner className="spinning" /> : <FaSave />}
                                                    {configuringFolder ? 'Konfigurowanie...' : 'Skonfiguruj'}
                                                </PrimaryButton>
                                            )}
                                        </ActionGroup>

                                        {folderValidationResult && (
                                            <ValidationResultBox $success={folderValidationResult.valid}>
                                                <ValidationIcon>
                                                    {folderValidationResult.valid ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                                </ValidationIcon>
                                                <ValidationText>
                                                    <ValidationMessage $success={folderValidationResult.valid}>
                                                        {folderValidationResult.message}
                                                    </ValidationMessage>
                                                    {!folderValidationResult.valid && folderValidationResult.instructions && (
                                                        <ValidationInstructions>
                                                            <InstructionTitle>Co należy zrobić:</InstructionTitle>
                                                            <InstructionsList>
                                                                <InstructionItem>{folderValidationResult.instructions.step1}</InstructionItem>
                                                                <InstructionItem>{folderValidationResult.instructions.step2}</InstructionItem>
                                                                <InstructionItem>{folderValidationResult.instructions.step3}</InstructionItem>
                                                            </InstructionsList>
                                                        </ValidationInstructions>
                                                    )}
                                                </ValidationText>
                                            </ValidationResultBox>
                                        )}
                                    </UploadContent>
                                </UploadArea>

                                <RequirementsBox>
                                    <RequirementsTitle>Wymagania:</RequirementsTitle>
                                    <RequirementsList>
                                        <RequirementItem>Folder musi być udostępniony dla: {googleDriveSystemInfo?.systemEmail || 'system@carslab.com'}</RequirementItem>
                                        <RequirementItem>Uprawnienia: Edytor (możliwość dodawania plików)</RequirementItem>
                                        <RequirementItem>Folder może być pusty lub zawierać inne pliki</RequirementItem>
                                        <RequirementItem>System automatycznie utworzy strukturę podfolderów</RequirementItem>
                                    </RequirementsList>
                                </RequirementsBox>
                            </GoogleDriveSetup>
                        )}
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

const LoadingContainer = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: ${brandTheme.spacing.xxl};
   background: ${brandTheme.surface};
   border-radius: ${brandTheme.radius.xl};
   margin: ${brandTheme.spacing.xl};
   gap: ${brandTheme.spacing.md};
   min-height: 400px;
`;

const LoadingSpinner = styled.div`
   width: 48px;
   height: 48px;
   border: 3px solid ${brandTheme.borderLight};
   border-top: 3px solid ${brandTheme.primary};
   border-radius: 50%;
   animation: spin 1s linear infinite;

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

const ErrorContainer = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: ${brandTheme.spacing.xxl};
   background: ${brandTheme.surface};
   border-radius: ${brandTheme.radius.xl};
   margin: ${brandTheme.spacing.xl};
   gap: ${brandTheme.spacing.md};
   min-height: 400px;
`;

const ErrorIcon = styled.div`
   font-size: 48px;
   color: ${brandTheme.status.error};
`;

const ErrorText = styled.div`
   font-size: 16px;
   color: ${brandTheme.text.secondary};
   font-weight: 500;
   text-align: center;
`;

const RetryButton = styled.button`
   padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
   background: ${brandTheme.primary};
   color: white;
   border: none;
   border-radius: ${brandTheme.radius.md};
   font-weight: 600;
   cursor: pointer;
   transition: all ${brandTheme.transitions.spring};

   &:hover {
       background: ${brandTheme.primaryDark};
       transform: translateY(-1px);
   }
`;

const MessageContainer = styled.div`
   position: fixed;
   bottom: 20px;
   right: 20px;
   z-index: 1000;
   max-width: 400px;
   width: auto;
   padding: 0;

   @media (max-width: 768px) {
       bottom: 10px;
       right: 10px;
       left: 10px;
       max-width: none;
   }
`;

const SuccessMessage = styled.div`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   background: ${brandTheme.status.successLight};
   color: ${brandTheme.status.success};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   border-radius: ${brandTheme.radius.lg};
   border: 1px solid ${brandTheme.status.success}30;
   font-weight: 500;
   box-shadow: ${brandTheme.shadow.lg};
   animation: slideInFromRight 0.3s ease-out;
   min-width: 300px;

   @keyframes slideInFromRight {
       from {
           transform: translateX(100%);
           opacity: 0;
       }
       to {
           transform: translateX(0);
           opacity: 1;
       }
   }

   @media (max-width: 768px) {
       min-width: auto;
       width: 100%;
   }
`;

const ErrorMessage = styled.div`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   background: ${brandTheme.status.errorLight};
   color: ${brandTheme.status.error};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   border-radius: ${brandTheme.radius.lg};
   border: 1px solid ${brandTheme.status.error}30;
   font-weight: 500;
   box-shadow: ${brandTheme.shadow.lg};
   animation: slideInFromRight 0.3s ease-out;
   min-width: 300px;

   @media (max-width: 768px) {
       min-width: auto;
       width: 100%;
   }
`;

const MessageIcon = styled.div`
   font-size: 18px;
   flex-shrink: 0;
`;

const ContentContainer = styled.div`
   flex: 1;
   max-width: 1600px;
   margin: 0 auto;
   padding: ${brandTheme.spacing.xl} ${brandTheme.spacing.xl} ${brandTheme.spacing.xl};
   width: 100%;
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.lg};
   min-height: 0;

   @media (max-width: 1024px) {
       padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.lg} ${brandTheme.spacing.lg};
   }

   @media (max-width: 768px) {
       padding: ${brandTheme.spacing.md} ${brandTheme.spacing.md} ${brandTheme.spacing.md};
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

const TestResultDetails = styled.div`
  font-size: 12px;
  font-weight: 400;
  margin-top: 4px;
  opacity: 0.8;
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

   .spinning {
       animation: spin 1s linear infinite;
   }
`;

const ValidationMessage = styled.div<{ $isValid: boolean }>`
   font-size: 12px;
   color: ${props => props.$isValid ? brandTheme.status.success : brandTheme.status.error};
   font-weight: 500;
   margin-top: ${brandTheme.spacing.xs};
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.xs};

   &::before {
       content: ${props => props.$isValid ? '"✓"' : '"⚠"'};
       font-size: 14px;
   }
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

const PasswordContainer = styled.div`
   position: relative;
   display: flex;
   align-items: center;
`;

const PasswordToggle = styled.button`
   position: absolute;
   right: 12px;
   background: none;
   border: none;
   color: ${brandTheme.text.muted};
   cursor: pointer;
   padding: 4px;
   border-radius: ${brandTheme.radius.sm};

   &:hover {
       color: ${brandTheme.text.secondary};
       background: ${brandTheme.surfaceHover};
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

// Google Drive styled components
const GoogleDriveConfigured = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.lg};
`;

const GoogleDriveInfo = styled.div`
   background: ${brandTheme.surfaceElevated};
   border-radius: ${brandTheme.radius.md};
   padding: ${brandTheme.spacing.lg};
   border: 1px solid ${brandTheme.border};
`;

const InfoGrid = styled.div`
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: ${brandTheme.spacing.md};

   @media (max-width: 768px) {
       grid-template-columns: 1fr;
   }
`;

const InfoItem = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xs};
`;

const InfoLabel = styled.div`
   font-size: 12px;
   font-weight: 600;
   color: ${brandTheme.text.tertiary};
   text-transform: uppercase;
   letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
   font-size: 14px;
   font-weight: 500;
   color: ${brandTheme.text.primary};
`;

const StatusBadge = styled.span<{ $active: boolean }>`
   display: inline-flex;
   align-items: center;
   padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
   border-radius: ${brandTheme.radius.sm};
   font-size: 12px;
   font-weight: 600;
   background: ${props => props.$active ? brandTheme.status.successLight : brandTheme.status.warningLight};
   color: ${props => props.$active ? brandTheme.status.success : brandTheme.status.warning};
   border: 1px solid ${props => props.$active ? brandTheme.status.success + '30' : brandTheme.status.warning + '30'};
`;

const GoogleDriveActions = styled.div`
   display: flex;
   justify-content: center;
   padding: ${brandTheme.spacing.lg} 0;
   border-top: 1px solid ${brandTheme.border};
   border-bottom: 1px solid ${brandTheme.border};
`;

const GoogleDriveHelp = styled.div`
   background: ${brandTheme.primaryGhost};
   border-radius: ${brandTheme.radius.md};
   padding: ${brandTheme.spacing.lg};
   border: 1px solid ${brandTheme.primary}20;
`;

const HelpTitle = styled.h4`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   font-size: 16px;
   font-weight: 600;
   color: ${brandTheme.primary};
   margin: 0 0 ${brandTheme.spacing.md} 0;
`;

const HelpList = styled.ul`
   list-style: none;
   padding: 0;
   margin: 0;
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.sm};
`;

const HelpItem = styled.li`
   font-size: 14px;
   color: ${brandTheme.text.secondary};
   font-weight: 500;
   display: flex;
   align-items: flex-start;
   gap: ${brandTheme.spacing.sm};

   &::before {
       content: '✓';
       color: ${brandTheme.status.success};
       font-weight: bold;
       font-size: 14px;
       margin-top: 1px;
       flex-shrink: 0;
   }
`;

const GoogleDriveSetup = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xl};
`;

const SetupSteps = styled.div`
   background: ${brandTheme.surfaceElevated};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.xl};
   border: 1px solid ${brandTheme.border};
`;

const SetupTitle = styled.h4`
   font-size: 18px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
   margin: 0 0 ${brandTheme.spacing.lg} 0;
`;

const StepsList = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.lg};
`;

const SetupStep = styled.div`
   display: flex;
   gap: ${brandTheme.spacing.md};
   align-items: flex-start;
`;

const StepNumber = styled.div`
   width: 32px;
   height: 32px;
   background: ${brandTheme.primary};
   color: white;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-weight: 600;
   font-size: 14px;
   flex-shrink: 0;
`;

const StepContent = styled.div`
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xs};
`;

const StepTitle = styled.div`
   font-size: 16px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
`;

const StepDescription = styled.div`
   font-size: 14px;
   color: ${brandTheme.text.secondary};
   line-height: 1.5;
`;

const ExternalLink = styled.a`
   color: ${brandTheme.primary};
   text-decoration: none;
   font-weight: 600;
   display: inline-flex;
   align-items: center;
   gap: 4px;

   &:hover {
       text-decoration: underline;
   }
`;

const EmailCopyBox = styled.div`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   background: ${brandTheme.surfaceElevated};
   border: 1px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.md};
   padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
`;

const EmailText = styled.code`
   flex: 1;
   font-family: monospace;
   font-size: 13px;
   color: ${brandTheme.text.primary};
   background: none;
`;

const CopyButton = styled.button`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 32px;
   height: 32px;
   border: none;
   background: ${brandTheme.primary}20;
   color: ${brandTheme.primary};
   border-radius: ${brandTheme.radius.sm};
   cursor: pointer;
   transition: all ${brandTheme.transitions.normal};

   &:hover {
       background: ${brandTheme.primary};
       color: white;
   }
`;

const ExampleUrl = styled.div`
   font-family: monospace;
   font-size: 12px;
   background: ${brandTheme.surfaceElevated};
   padding: ${brandTheme.spacing.sm};
   border-radius: ${brandTheme.radius.sm};
   margin-top: ${brandTheme.spacing.sm};
   border: 1px solid ${brandTheme.border};
`;

const HighlightText = styled.span`
   background: ${brandTheme.status.warningLight};
   color: ${brandTheme.status.warning};
   padding: 2px 4px;
   border-radius: 3px;
   font-weight: 600;
`;

const UploadArea = styled.div`
   border: 2px dashed ${brandTheme.border};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.xxl};
   background: ${brandTheme.surfaceElevated};
   text-align: center;
   transition: all ${brandTheme.transitions.spring};

   &:hover {
       border-color: ${brandTheme.primary};
       background: ${brandTheme.primaryGhost};
   }
`;

const UploadContent = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: ${brandTheme.spacing.lg};
`;

const UploadIcon = styled.div`
   width: 64px;
   height: 64px;
   background: ${brandTheme.primaryGhost};
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 24px;
   color: ${brandTheme.primary};
`;

const UploadTitle = styled.h4`
   font-size: 18px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
   margin: 0;
`;

const UploadDescription = styled.p`
   font-size: 14px;
   color: ${brandTheme.text.secondary};
   margin: 0;
   font-weight: 500;
`;

const HelpText = styled.div`
   font-size: 12px;
   color: ${brandTheme.text.muted};
   line-height: 1.4;
`;

const ValidationResultBox = styled.div<{ $success: boolean }>`
   display: flex;
   gap: ${brandTheme.spacing.md};
   padding: ${brandTheme.spacing.md};
   margin-top: ${brandTheme.spacing.md};
   background: ${props => props.$success ? brandTheme.status.successLight : brandTheme.status.errorLight};
   border: 1px solid ${props => props.$success ? brandTheme.status.success + '30' : brandTheme.status.error + '30'};
   border-radius: ${brandTheme.radius.md};
`;

const ValidationIcon = styled.div`
   font-size: 20px;
   flex-shrink: 0;
   margin-top: 2px;
`;

const ValidationText = styled.div`
   flex: 1;
`;

const ValidationInstructions = styled.div`
   margin-top: ${brandTheme.spacing.sm};
`;

const InstructionTitle = styled.div`
   font-weight: 600;
   font-size: 13px;
   margin-bottom: ${brandTheme.spacing.xs};
   color: ${brandTheme.text.primary};
`;

const InstructionsList = styled.ul`
   margin: 0;
   padding-left: ${brandTheme.spacing.md};
   list-style-type: disc;
`;

const InstructionItem = styled.li`
   font-size: 12px;
   color: ${brandTheme.text.secondary};
   margin-bottom: ${brandTheme.spacing.xs};
   line-height: 1.4;
`;

const RequirementsBox = styled.div`
   background: ${brandTheme.surface};
   border: 1px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.md};
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

const SystemInfoBox = styled.div`
   background: ${brandTheme.primaryGhost};
   border-radius: ${brandTheme.radius.md};
   padding: ${brandTheme.spacing.lg};
   border: 1px solid ${brandTheme.primary}20;
`;

const SystemInfoTitle = styled.h4`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   font-size: 16px;
   font-weight: 600;
   color: ${brandTheme.primary};
   margin: 0 0 ${brandTheme.spacing.md} 0;
`;

const SystemInfoGrid = styled.div`
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: ${brandTheme.spacing.md};

   @media (max-width: 768px) {
       grid-template-columns: 1fr;
   }
`;

const SystemInfoItem = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xs};
`;

const SystemInfoLabel = styled.div`
   font-size: 12px;
   font-weight: 600;
   color: ${brandTheme.text.tertiary};
   text-transform: uppercase;
   letter-spacing: 0.5px;
`;

const SystemInfoValue = styled.div`
   font-size: 14px;
   font-weight: 500;
   color: ${brandTheme.text.primary};
   font-family: monospace;
`;

export default CompanySettingsPage;