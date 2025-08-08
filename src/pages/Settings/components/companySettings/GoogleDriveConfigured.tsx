// src/pages/Settings/components/GoogleDriveConfigured.tsx
import React from 'react';
import { FaEdit, FaTrashAlt, FaExternalLinkAlt, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import type { GoogleDriveFolderSettings } from '../../../../api/companySettingsApi';
import { ActionButton } from '../../styles/companySettings/SectionCard.styles';
import {
    GoogleDriveInfo,
    InfoGrid,
    InfoItem,
    InfoLabel,
    InfoValue,
    StatusBadge,
    GoogleDriveActions,
    ActionGroup,
    GoogleDriveHelp,
    HelpTitle,
    HelpList,
    HelpItem,
    ExternalLink
} from '../../styles/companySettings/GoogleDrive.styles';

interface GoogleDriveConfiguredProps {
    settings: GoogleDriveFolderSettings;
    onEdit: () => void;
    onDeactivate: () => void;
}

export const GoogleDriveConfigured: React.FC<GoogleDriveConfiguredProps> = ({
                                                                                settings,
                                                                                onEdit,
                                                                                onDeactivate
                                                                            }) => {
    return (
        <>
            <GoogleDriveInfo>
                <InfoGrid>
                    <InfoItem>
                        <InfoLabel>Folder</InfoLabel>
                        <InfoValue>
                            {settings.folderUrl ? (
                                <ExternalLink href={settings.folderUrl} target="_blank">
                                    {settings.folderName || settings.folderId}
                                    <FaExternalLinkAlt style={{ marginLeft: '4px', fontSize: '12px' }} />
                                </ExternalLink>
                            ) : (
                                settings.folderName || settings.folderId
                            )}
                        </InfoValue>
                    </InfoItem>

                    <InfoItem>
                        <InfoLabel>Status</InfoLabel>
                        <StatusBadge $active={settings.systemServiceAvailable}>
                            {settings.systemServiceAvailable ? 'Aktywny' : 'Niedostępny'}
                        </StatusBadge>
                    </InfoItem>

                    <InfoItem>
                        <InfoLabel>Ostatni backup</InfoLabel>
                        <InfoValue>
                            {settings.lastBackupAt
                                ? new Date(settings.lastBackupAt).toLocaleString('pl-PL')
                                : 'Nigdy'
                            }
                        </InfoValue>
                    </InfoItem>

                    <InfoItem>
                        <InfoLabel>Liczba backup-ów</InfoLabel>
                        <InfoValue>{settings.backupCount || 0}</InfoValue>
                    </InfoItem>

                    <InfoItem>
                        <InfoLabel>Konto systemowe</InfoLabel>
                        <InfoValue style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                            {settings.systemEmail}
                        </InfoValue>
                    </InfoItem>

                    <InfoItem>
                        <InfoLabel>Status ostatniego backup</InfoLabel>
                        <InfoValue>
                            <StatusBadge $active={settings.lastBackupStatus === 'SUCCESS'}>
                                {settings.lastBackupStatus || 'Brak danych'}
                            </StatusBadge>
                        </InfoValue>
                    </InfoItem>
                </InfoGrid>
            </GoogleDriveInfo>

            <GoogleDriveActions>
                <ActionGroup>
                    <ActionButton $secondary onClick={onEdit}>
                        <FaEdit />
                        Zmień folder
                    </ActionButton>
                    <ActionButton $danger onClick={onDeactivate}>
                        <FaTrashAlt />
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
                    <HelpItem>System używa konta: {settings.systemEmail}</HelpItem>
                </HelpList>
            </GoogleDriveHelp>
        </>
    );
};