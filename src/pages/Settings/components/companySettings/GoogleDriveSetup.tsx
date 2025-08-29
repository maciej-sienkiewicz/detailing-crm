// src/pages/Settings/components/GoogleDriveSetup.tsx
import React, {useState} from 'react';
import {FaCheckCircle, FaClipboard, FaExclamationTriangle, FaFileArchive, FaSave, FaSpinner} from 'react-icons/fa';
import type {GoogleDriveSystemInfo, ValidateFolderResponse} from '../../../../api/companySettingsApi';
import {companySettingsApi, companySettingsValidation} from '../../../../api/companySettingsApi';
import {ActionButton} from '../../styles/companySettings/SectionCard.styles';
import {FormField} from './FormField';
import {FormGrid} from '../../styles/companySettings/Form.styles';
import {
    ActionGroup,
    CopyButton,
    EmailCopyBox,
    EmailText,
    ExampleUrl,
    ExternalLink,
    GoogleDriveSetupContainer,
    HighlightText,
    InstructionItem,
    InstructionsList,
    InstructionTitle,
    RequirementItem,
    RequirementsBox,
    RequirementsList,
    RequirementsTitle,
    SetupStep,
    SetupSteps,
    SetupTitle,
    StepContent,
    StepDescription,
    StepNumber,
    StepsList,
    StepTitle,
    UploadArea,
    UploadContent,
    UploadDescription,
    UploadIcon,
    UploadTitle,
    ValidationIcon,
    ValidationInstructions,
    ValidationMessage,
    ValidationResultBox,
    ValidationText
} from '../../styles/companySettings/GoogleDrive.styles';

interface GoogleDriveSetupProps {
    systemInfo?: GoogleDriveSystemInfo | null;
    onConfigured: () => void;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export const GoogleDriveSetup: React.FC<GoogleDriveSetupProps> = ({
                                                                      systemInfo,
                                                                      onConfigured,
                                                                      onSuccess,
                                                                      onError
                                                                  }) => {
    const [folderIdInput, setFolderIdInput] = useState('');
    const [folderNameInput, setFolderNameInput] = useState('');
    const [validatingFolder, setValidatingFolder] = useState(false);
    const [configuringFolder, setConfiguringFolder] = useState(false);
    const [folderValidationResult, setFolderValidationResult] = useState<ValidateFolderResponse | null>(null);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            onSuccess?.('Skopiowano do schowka');
        } catch (err) {
            console.error('Failed to copy:', err);
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
                onConfigured();
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

    return (
        <GoogleDriveSetupContainer>
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
                        <FormField
                            label="ID folderu Google Drive"
                            required
                            isEditing={true}
                            value={folderIdInput}
                            onChange={setFolderIdInput}
                            placeholder="1PqsrjjfVbc-wMOCsrqPtjpiB2rPqgs4v"
                            fullWidth
                        />

                        <FormField
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
                                {configuringFolder ? 'Konfigurowanie...' : 'Skonfiguruj'}
                            </ActionButton>
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
                    <RequirementItem>Folder musi być udostępniony dla: {systemInfo?.systemEmail || 'system@carslab.com'}</RequirementItem>
                    <RequirementItem>Uprawnienia: Edytor (możliwość dodawania plików)</RequirementItem>
                    <RequirementItem>Folder może być pusty lub zawierać inne pliki</RequirementItem>
                    <RequirementItem>System automatycznie utworzy strukturę podfolderów</RequirementItem>
                </RequirementsList>
            </RequirementsBox>
        </GoogleDriveSetupContainer>
    )
};