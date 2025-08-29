// src/pages/Settings/components/companySettings/GoogleDriveSlide.tsx - Uproszczona wersja
import React, { useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { FaCloud, FaSpinner, FaSync, FaInfoCircle, FaExternalLinkAlt } from 'react-icons/fa';
import { type CompanySettingsResponse, companySettingsApi } from '../../../../api/companySettingsApi';
import type { GoogleDriveFolderSettings, GoogleDriveSystemInfo } from '../../../../api/companySettingsApi';
import { UnifiedFormField } from './UnifiedFormField';
import { GoogleDriveInstructionModal } from './GoogleDriveInstructionModal';
import {
    SlideContainer,
    SlideContent,
    FormGrid
} from '../../styles/companySettings/SlideComponents.styles';
import {
    GoogleDriveActions,
    ActionGroup,
    GoogleDriveHelp,
    HelpTitle,
    HelpList,
    HelpItem,
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

const GoogleDriveSlide = forwardRef<{ showInstructionModal: () => void }, GoogleDriveSlideProps>((props, ref) => {
    const { isEditing, saving, onSave, onCancel, onSuccess, onError } = props;
    const [googleDriveSettings, setGoogleDriveSettings] = useState<GoogleDriveFolderSettings | null>(null);
    const [googleDriveSystemInfo, setGoogleDriveSystemInfo] = useState<GoogleDriveSystemInfo | null>(null);
    const [testingGoogleDrive, setTestingGoogleDrive] = useState(false);
    const [backingUp, setBackingUp] = useState(false);
    const [showInstructionModal, setShowInstructionModal] = useState(false);
    const [folderIdInput, setFolderIdInput] = useState('');
    const [folderNameInput, setFolderNameInput] = useState('');
    const [configuringFolder, setConfiguringFolder] = useState(false);

    useImperativeHandle(ref, () => ({
        showInstructionModal: () => setShowInstructionModal(true)
    }));

    useEffect(() => {
        loadGoogleDriveSettings();
        loadGoogleDriveSystemInfo();
    }, []);

    // Initialize form data when editing starts or when data loads
    useEffect(() => {
        if (googleDriveSettings) {
            setFolderIdInput(googleDriveSettings.folderId || '');
            setFolderNameInput(googleDriveSettings.folderName || '');
        }
    }, [googleDriveSettings]);

    const handleSaveFromParent = async () => {
        if (!folderIdInput.trim()) {
            onError?.('Wprowadź ID folderu przed zapisaniem');
            return;
        }

        if (!folderNameInput.trim()) {
            onError?.('Wprowadź nazwę folderu przed zapisaniem');
            return;
        }

        try {
            setConfiguringFolder(true);

            // Call the backend API to update Google Drive settings
            const response = await companySettingsApi.updateGoogleDriveSettings({
                folderId: folderIdInput.trim(),
                folderName: folderNameInput.trim(),
                enabled: true,
                autoUploadInvoices: true,
                autoCreateFolders: false
            });

            if (response) {
                onSuccess?.('Ustawienia Google Drive zostały zapisane pomyślnie');
                await loadGoogleDriveSettings(); // Refresh data
                onSave();
            }
        } catch (err) {
            console.error('Error saving Google Drive settings:', err);
            onError?.('Nie udało się zapisać ustawień Google Drive');
        } finally {
            setConfiguringFolder(false);
        }
    };

    const handleCancelFromParent = () => {
        // Reset form data to original values
        if (googleDriveSettings) {
            setFolderIdInput(googleDriveSettings.folderId || '');
            setFolderNameInput(googleDriveSettings.folderName || '');
        }
        onCancel();
    };

    // Handle save from parent component
    useEffect(() => {
        if (isEditing && saving && !configuringFolder) {
            handleSaveFromParent();
        }
    }, [saving, isEditing]);

    // Handle cancel from parent
    useEffect(() => {
        if (!isEditing) {
            handleCancelFromParent();
        }
    }, [isEditing]);

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

    const isConfigured = googleDriveSettings?.isActive ?? false;
    const isSaving = saving || configuringFolder;

    return (
        <SlideContainer>
            <SlideContent>
                {/* Główny formularz - zawsze widoczny */}
                <FormGrid>
                    <UnifiedFormField
                        label="ID folderu Google Drive"
                        required
                        isEditing={isEditing}
                        value={folderIdInput}
                        onChange={setFolderIdInput}
                        placeholder="1PqsrjjfVbc-wMOCsrqPtjpiB2rPqgs4v"
                        displayFormatter={isConfigured && googleDriveSettings?.folderUrl ?
                            (value) => (
                                <ExternalLink href={googleDriveSettings.folderUrl} target="_blank">
                                    {value}
                                    <FaExternalLinkAlt style={{ marginLeft: '4px', fontSize: '12px' }} />
                                </ExternalLink>
                            ) : undefined
                        }
                        fullWidth
                    />

                    <UnifiedFormField
                        label="Nazwa folderu"
                        required
                        isEditing={isEditing}
                        value={folderNameInput}
                        onChange={setFolderNameInput}
                        placeholder="Faktury CRM - Backup"
                        fullWidth
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
                        label="Konto systemowe"
                        isEditing={false}
                        value={googleDriveSettings?.systemEmail || 'system@carslab.com'}
                        onChange={() => {}}
                    />
                </FormGrid>

                {/* Akcje - tylko gdy integracja jest aktywna i nie edytujemy */}
                {isConfigured && !isEditing && (
                    <GoogleDriveActions>
                        <ActionGroup>
                            <ActionButton
                                $secondary
                                onClick={testGoogleDriveConnection}
                                disabled={testingGoogleDrive || backingUp || isSaving}
                            >
                                {testingGoogleDrive ? <FaSpinner className="spinning" /> : <FaCloud />}
                                {testingGoogleDrive ? 'Testowanie...' : 'Test połączenia'}
                            </ActionButton>
                            <ActionButton
                                $danger
                                onClick={handleDeactivateIntegration}
                                disabled={testingGoogleDrive || backingUp || isSaving}
                            >
                                Dezaktywuj
                            </ActionButton>
                        </ActionGroup>
                    </GoogleDriveActions>
                )}

                {/* Pomoc - tylko gdy integracja jest aktywna i nie edytujemy */}
                {isConfigured && !isEditing && (
                    <GoogleDriveHelp>
                        <HelpTitle>
                            <FaInfoCircle />
                            Jak działa backup?
                        </HelpTitle>
                        <HelpList>
                            <HelpItem>Faktury są automatycznie organizowane w folderach: faktury/rok/miesiąc/kierunek</HelpItem>
                            <HelpItem>Kopie zapasowe zawierają wszystkie faktury z bieżącego miesiąca</HelpItem>
                            <HelpItem>Pliki są bezpiecznie przechowywane w Twoim folderze Google Drive</HelpItem>
                            <HelpItem>System używa konta: {googleDriveSettings?.systemEmail}</HelpItem>
                        </HelpList>
                    </GoogleDriveHelp>
                )}

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