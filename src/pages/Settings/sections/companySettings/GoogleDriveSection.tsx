// src/pages/Settings/sections/GoogleDriveSection.tsx
import React, { useState, useEffect } from 'react';
import { FaGoogleDrive, FaCloud, FaSync, FaSpinner } from 'react-icons/fa';
import { companySettingsApi } from '../../../../api/companySettingsApi';
import { SectionCard } from '../../components/companySettings/SectionCard';
import { GoogleDriveConfigured } from '../../components/companySettings/GoogleDriveConfigured';
import { GoogleDriveSetup } from '../../components/companySettings/GoogleDriveSetup';
import { ConfigStatusBanner } from '../../styles/companySettings/GoogleDrive.styles';
import type {
    GoogleDriveFolderSettings,
    GoogleDriveSystemInfo,
} from '../../../../api/companySettingsApi';

interface GoogleDriveSectionProps {
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export const GoogleDriveSection: React.FC<GoogleDriveSectionProps> = ({
                                                                          onSuccess,
                                                                          onError
                                                                      }) => {
    const [googleDriveSettings, setGoogleDriveSettings] = useState<GoogleDriveFolderSettings | null>(null);
    const [googleDriveSystemInfo, setGoogleDriveSystemInfo] = useState<GoogleDriveSystemInfo | null>(null);
    const [testingGoogleDrive, setTestingGoogleDrive] = useState(false);
    const [backingUp, setBackingUp] = useState(false);

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

    const isConfigured = googleDriveSettings?.isActive ?? false;

    return (
        <SectionCard
            icon={FaGoogleDrive}
            title="Google Drive"
            subtitle="Automatyczne kopie zapasowe faktur w folderze Google Drive"
            actions={[
                {
                    icon: testingGoogleDrive ? FaSpinner : FaCloud,
                    label: testingGoogleDrive ? 'Testowanie...' : 'Test połączenia',
                    onClick: testGoogleDriveConnection,
                    disabled: testingGoogleDrive,
                    secondary: true
                },
                ...(isConfigured ? [{
                    icon: backingUp ? FaSpinner : FaSync,
                    label: backingUp ? 'Backup...' : 'Backup teraz',
                    onClick: handleBackupCurrentMonth,
                    disabled: backingUp,
                    primary: true
                }] : [])
            ]}
        >
            <ConfigStatusBanner $configured={isConfigured}>
                {isConfigured
                    ? `Integracja aktywna - folder: ${googleDriveSettings?.folderName || 'Folder główny'}`
                    : 'Integracja wymaga konfiguracji folderu Google Drive'
                }
            </ConfigStatusBanner>

            {isConfigured ? (
                <GoogleDriveConfigured
                    settings={googleDriveSettings!}
                    onEdit={() => setGoogleDriveSettings(prev => prev ? { ...prev, isActive: false } : null)}
                    onDeactivate={handleDeactivateIntegration}
                />
            ) : (
                <GoogleDriveSetup
                    systemInfo={googleDriveSystemInfo}
                    onConfigured={loadGoogleDriveSettings}
                    onSuccess={onSuccess}
                    onError={onError}
                />
            )}
        </SectionCard>
    );
};