// src/pages/Settings/components/companySettings/GoogleDriveSlide.tsx
import React, { useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { FaCloud, FaSpinner, FaSync, FaInfoCircle, FaCheckCircle, FaSave, FaExternalLinkAlt } from 'react-icons/fa';
import { type CompanySettingsResponse } from '../../../../api/companySettingsApi';
import type { GoogleDriveFolderSettings, GoogleDriveSystemInfo, ValidateFolderResponse } from '../../../../api/companySettingsApi';
import { companySettingsApi, companySettingsValidation } from '../../../../api/companySettingsApi';
import { UnifiedFormField } from './UnifiedFormField';
import { GoogleDriveInstructionModal } from './GoogleDriveInstructionModal';
import {
    SlideContainer,
    SlideContent,
    FormGrid
} from '../../styles/companySettings/SlideComponents.styles';
import {
    ConfigStatusBanner,
    GoogleDriveActions,
    ActionGroup,
    GoogleDriveHelp,
    HelpTitle,
    HelpList,
    HelpItem,
    UploadArea,
    UploadContent,
    UploadIcon,
    UploadTitle,
    UploadDescription,
    ValidationResultBox,
    ValidationIcon,
    ValidationText,
    ValidationMessage,
    ValidationInstructions,
    InstructionTitle,
    InstructionsList,
    InstructionItem,
    StatusBadge,
    ExternalLink
} from '../../styles/companySettings/GoogleDrive.styles';
import { ActionButton } from '../../styles/companySettings/SectionCard.styles';

interface GoogleDriveSlideProps {
    data: CompanySettingsResponse;
    isEditing: boolean;
    saving: boolean;
    onStartEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onChange: (section: keyof CompanySettingsResponse, field: string, value: any) => void;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

interface GoogleDriveSlideProps {
    data: CompanySettingsResponse;
    isEditing: boolean;
    saving: boolean;
    onStartEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onChange: (section: keyof CompanySettingsResponse, field: string, value: any) => void;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

const GoogleDriveSlide = forwardRef<{ showInstructionModal: () => void }, GoogleDriveSlideProps>((props, ref) => {
    const { onSuccess, onError } = props;
    const [googleDriveSettings, setGoogleDriveSettings] = useState<GoogleDriveFolderSettings | null>(null);
    const [googleDriveSystemInfo, setGoogleDriveSystemInfo] = useState<GoogleDriveSystemInfo | null>(null);
    const [testingGoogleDrive, setTestingGoogleDrive] = useState(false);
    const [backingUp, setBackingUp] = useState(false);
    const [showInstructionModal, setShowInstructionModal] = useState(false);
    const [folderIdInput, setFolderIdInput] = useState('');
    const [folderNameInput, setFolderNameInput] = useState('');
    const [validatingFolder, setValidatingFolder] = useState(false);
    const [configuringFolder, setConfiguringFolder] = useState(false);
    const [folderValidationResult, setFolderValidationResult] = useState<ValidateFolderResponse | null>(null);

    useImperativeHandle(ref, () => ({
        showInstructionModal: () => setShowInstructionModal(true)
    }));

    useEffect(() => {
        loadGoogleDriveSettings();
        loadGoogleDriveSystemInfo();
    }, []);

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

    const testGoogleDriveConnection = async () => {
        try {
            setTestingGoogleDrive(true);
            const settings = await companySettingsApi.getGoogleDriveIntegrationStatus();

            if (settings.systemServiceAvailable && settings.isActive) {
                onSuccess?.('Połączenie z Google Drive działa prawidłowo');
            } else {
                onError?.(settings.systemServiceAvailable
                    ? 'Integracja nie jest aktywna'
                    : 'Usługa systemowa nie jest dostępna'
                );
            }
        } catch (err) {
            console.error('Error testing Google Drive connection:', err);
            onError?.('Błąd podczas testowania połączenia');
        } finally {
            setTestingGoogleDrive(false);
        }
    };

    const handleBackupCurrentMonth = async () => {
        try {
            setBackingUp(true);
            const result = await companySettingsApi.backupCurrentMonth();

            if (result.status === 'success') {
                onSuccess?.('Backup bieżącego miesiąca wykonany pomyślnie');
                await loadGoogleDriveSettings();
            } else {
                onError?.(result.message || 'Nie udało się wykonać backup');
            }
        } catch (err) {
            console.error('Error running backup:', err);
            onError?.('Nie udało się wykonać backup');
        } finally {
            setBackingUp(false);
        }
    };

    const handleDeactivateIntegration = async () => {
        if (!window.confirm('Czy na pewno chcesz dezaktywować integrację z Google Drive?')) {
            return;
        }

        try {
            const result = await companySettingsApi.deactivateGoogleDriveIntegration();

            if (result.status === 'success') {
                onSuccess?.('Integracja z Google Drive została dezaktywowana');
                await loadGoogleDriveSettings();
            } else {
                onError?.(result.message || 'Nie udało się dezaktywować integracji');
            }
        } catch (err) {
            console.error('Error deactivating integration:', err);
            onError?.('Nie udało się dezaktywować integracji');
        }
    };

    const handleValidateFolder = async () => {
        if (!folderIdInput.trim()) {
            onError?.('Wprowadź ID folderu');
            return;
        }

        const validation = companySettingsValidation.validateGoogleDriveFolderId(folderIdInput);
        if (!validation.valid) {
            onError?.(validation.error || 'Nieprawidłowy format ID folderu');
            return;
        }

        try {
            setValidatingFolder(true);
            setFolderValidationResult(null);

            const result = await companySettingsApi.validateGoogleDriveFolder(folderIdInput.trim());
            setFolderValidationResult(result);

            if (!result.valid) {
                onError?.(result.message);
            }
        } catch (err) {
            console.error('Error validating folder:', err);
            onError?.('Nie udało się sprawdzić folderu');
        } finally {
            setValidatingFolder(false);
        }
    };

    const handleConfigureFolder = async () => {
        if (!folderIdInput.trim()) {
            onError?.('Wprowadź ID folderu');
            return;
        }

        if (!folderValidationResult?.valid) {
            await handleValidateFolder();
            return;
        }

        try {
            setConfiguringFolder(true);

            const result = await companySettingsApi.configureGoogleDriveFolder({
                folderId: folderIdInput.trim(),
                folderName: folderNameInput.trim() || undefined
            });

            if (result.status === 'success') {
                onSuccess?.('Folder Google Drive został skonfigurowany pomyślnie');
                setFolderIdInput('');
                setFolderNameInput('');
                setFolderValidationResult(null);
                loadGoogleDriveSettings();
            } else {
                onError?.(result.message || 'Nie udało się skonfigurować folderu');
            }
        } catch (err) {
            console.error('Error configuring folder:', err);
            onError?.('Nie udało się skonfigurować folderu');
        } finally {
            setConfiguringFolder(false);
        }
    };

    const isConfigured = googleDriveSettings?.isActive ?? false;

    return (
        <SlideContainer>
            <SlideContent>
                <ConfigStatusBanner $configured={isConfigured}>
                    {isConfigured
                        ? `Integracja aktywna - folder: ${googleDriveSettings?.folderName || 'Folder główny'}`
                        : 'Integracja wymaga konfiguracji folderu Google Drive'
                    }
                </ConfigStatusBanner>

                {/* Sekcja dla skonfigurowanych ustawień */}
                {isConfigured && (
                    <>
                        <FormGrid>
                            <UnifiedFormField
                                label="Folder"
                                isEditing={false}
                                value={googleDriveSettings?.folderName || googleDriveSettings?.folderId || ''}
                                onChange={() => {}}
                                displayFormatter={(value) => (
                                    googleDriveSettings?.folderUrl ? (
                                        <ExternalLink href={googleDriveSettings.folderUrl} target="_blank">
                                            {value}
                                            <FaExternalLinkAlt style={{ marginLeft: '4px', fontSize: '12px' }} />
                                        </ExternalLink>
                                    ) : value
                                )}
                            />

                            <UnifiedFormField
                                label="Status"
                                isEditing={false}
                                value={googleDriveSettings?.systemServiceAvailable ? 'Aktywny' : 'Niedostępny'}
                                onChange={() => {}}
                                displayFormatter={(value) => (
                                    <StatusBadge $active={googleDriveSettings?.systemServiceAvailable || false}>
                                        {value}
                                    </StatusBadge>
                                )}
                            />

                            <UnifiedFormField
                                label="Ostatni backup"
                                isEditing={false}
                                value={googleDriveSettings?.lastBackupAt
                                    ? new Date(googleDriveSettings.lastBackupAt).toLocaleString('pl-PL')
                                    : 'Nigdy'
                                }
                                onChange={() => {}}
                            />

                            <UnifiedFormField
                                label="Liczba backup-ów"
                                isEditing={false}
                                value={(googleDriveSettings?.backupCount || 0).toString()}
                                onChange={() => {}}
                            />

                            <UnifiedFormField
                                label="Konto systemowe"
                                isEditing={false}
                                value={googleDriveSettings?.systemEmail || ''}
                                onChange={() => {}}
                                fullWidth
                            />

                            <UnifiedFormField
                                label="Status ostatniego backup"
                                isEditing={false}
                                value={googleDriveSettings?.lastBackupStatus || 'Brak danych'}
                                onChange={() => {}}
                                displayFormatter={(value) => (
                                    <StatusBadge $active={googleDriveSettings?.lastBackupStatus === 'SUCCESS'}>
                                        {value}
                                    </StatusBadge>
                                )}
                            />
                        </FormGrid>

                        <GoogleDriveActions>
                            <ActionGroup>
                                <ActionButton
                                    $secondary
                                    onClick={testGoogleDriveConnection}
                                    disabled={testingGoogleDrive || backingUp}
                                >
                                    {testingGoogleDrive ? <FaSpinner className="spinning" /> : <FaCloud />}
                                    {testingGoogleDrive ? 'Testowanie...' : 'Test połączenia'}
                                </ActionButton>
                                <ActionButton
                                    $primary
                                    onClick={handleBackupCurrentMonth}
                                    disabled={testingGoogleDrive || backingUp}
                                >
                                    {backingUp ? <FaSpinner className="spinning" /> : <FaSync />}
                                    {backingUp ? 'Backup...' : 'Backup teraz'}
                                </ActionButton>
                                <ActionButton
                                    $danger
                                    onClick={handleDeactivateIntegration}
                                    disabled={testingGoogleDrive || backingUp}
                                >
                                    Dezaktywuj
                                </ActionButton>
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
                                <HelpItem>System używa konta: {googleDriveSettings?.systemEmail}</HelpItem>
                            </HelpList>
                        </GoogleDriveHelp>
                    </>
                )}

                {/* Główna sekcja konfiguracji - zawsze widoczna */}
                <UploadArea>
                    <UploadContent>
                        <UploadIcon>
                            <FaCloud />
                        </UploadIcon>
                        <UploadTitle>
                            {isConfigured ? 'Zmień konfigurację folderu' : 'Konfiguracja folderu Google Drive'}
                        </UploadTitle>
                        <UploadDescription>
                            Wprowadź ID folderu który udostępniłeś dla konta systemowego
                        </UploadDescription>

                        <FormGrid style={{ marginTop: '24px', width: '100%' }}>
                            <UnifiedFormField
                                label="ID folderu Google Drive"
                                required
                                isEditing={true}
                                value={folderIdInput}
                                onChange={setFolderIdInput}
                                placeholder="1PqsrjjfVbc-wMOCsrqPtjpiB2rPqgs4v"
                                helpText="Skopiuj ID z URL folderu Google Drive (część po '/folders/')"
                                fullWidth
                            />

                            <UnifiedFormField
                                label="Nazwa folderu (opcjonalnie)"
                                isEditing={true}
                                value={folderNameInput}
                                onChange={setFolderNameInput}
                                placeholder="Faktury CRM - Backup"
                                helpText="Opis dla łatwiejszej identyfikacji w systemie"
                                fullWidth
                            />
                        </FormGrid>

                        <ActionGroup style={{ marginTop: '24px', justifyContent: 'center' }}>
                            <ActionButton
                                $secondary
                                onClick={handleValidateFolder}
                                disabled={validatingFolder || !folderIdInput.trim()}
                            >
                                {validatingFolder ? <FaSpinner className="spinning" /> : <FaCheckCircle />}
                                {validatingFolder ? 'Sprawdzanie...' : 'Sprawdź folder'}
                            </ActionButton>

                            {folderValidationResult?.valid && (
                                <ActionButton
                                    $primary
                                    onClick={handleConfigureFolder}
                                    disabled={configuringFolder}
                                >
                                    {configuringFolder ? <FaSpinner className="spinning" /> : <FaSave />}
                                    {configuringFolder ? 'Konfigurowanie...' : (isConfigured ? 'Zapisz zmiany' : 'Skonfiguruj')}
                                </ActionButton>
                            )}
                        </ActionGroup>

                        {folderValidationResult && (
                            <ValidationResultBox $success={folderValidationResult.valid}>
                                <ValidationIcon>
                                    {folderValidationResult.valid ? <FaCheckCircle /> : <FaInfoCircle />}
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

                <GoogleDriveInstructionModal
                    isOpen={showInstructionModal}
                    onClose={() => setShowInstructionModal(false)}
                    systemInfo={googleDriveSystemInfo}
                    onSuccess={onSuccess}
                />
            </SlideContent>
        </SlideContainer>
    );
});

export default GoogleDriveSlide;