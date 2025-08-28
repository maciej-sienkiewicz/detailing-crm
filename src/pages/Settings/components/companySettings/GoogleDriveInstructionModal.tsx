// src/pages/Settings/components/companySettings/GoogleDriveInstructionModal.tsx
import React from 'react';
import { FaClipboard, FaTimes } from 'react-icons/fa';
import type { GoogleDriveSystemInfo } from '../../../../api/companySettingsApi';
import {
    SetupSteps,
    SetupTitle,
    StepsList,
    SetupStep,
    StepNumber,
    StepContent,
    StepTitle,
    StepDescription,
    ExternalLink,
    EmailCopyBox,
    EmailText,
    CopyButton,
    ExampleUrl,
    HighlightText,
    RequirementsBox,
    RequirementsTitle,
    RequirementsList,
    RequirementItem
} from '../../styles/companySettings/GoogleDrive.styles';
import Modal from "../../../../components/common/Modal";

interface GoogleDriveInstructionModalProps {
    isOpen: boolean;
    onClose: () => void;
    systemInfo?: GoogleDriveSystemInfo | null;
    onSuccess?: (message: string) => void;
}

export const GoogleDriveInstructionModal: React.FC<GoogleDriveInstructionModalProps> = ({
                                                                                            isOpen,
                                                                                            onClose,
                                                                                            systemInfo,
                                                                                            onSuccess
                                                                                        }) => {
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            onSuccess?.('Skopiowano do schowka');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Instrukcja konfiguracji Google Drive"
            size="lg"
        >
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
                                    <EmailText>{systemInfo?.systemEmail || 'system@carslab.com'}</EmailText>
                                    <CopyButton onClick={() => copyToClipboard(systemInfo?.systemEmail || '')}>
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
                            <StepTitle>Skonfiguruj w systemie</StepTitle>
                            <StepDescription>
                                Wklej ID folderu w formularzu poniżej instrukcji i opcjonalnie podaj nazwę dla łatwiejszej identyfikacji
                            </StepDescription>
                        </StepContent>
                    </SetupStep>
                </StepsList>
            </SetupSteps>

            <RequirementsBox>
                <RequirementsTitle>Wymagania:</RequirementsTitle>
                <RequirementsList>
                    <RequirementItem>Folder musi być udostępniony dla: {systemInfo?.systemEmail || 'system@carslab.com'}</RequirementItem>
                    <RequirementItem>Uprawnienia: Edytor (możliwość dodawania plików)</RequirementItem>
                    <RequirementItem>Folder może być pusty lub zawierać inne pliki</RequirementItem>
                    <RequirementItem>System automatycznie utworzy strukturę podfolderów</RequirementItem>
                </RequirementsList>
            </RequirementsBox>
        </Modal>
    );
};