import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaCheck, FaEnvelope, FaFileAlt, FaPrint, FaSpinner} from 'react-icons/fa';
import PDFViewer from "../../../../components/PdfViewer";
import TabletSignatureRequestModal from './TabletSignatureRequestModal';
import SignatureStatusModal from './SignatureStatusModal';
import {protocolsApi} from '../../../../api/protocolsApi';

// Professional Corporate Theme
const corporateTheme = {
    primary: '#1a365d',
    primaryLight: '#2c5aa0',
    primaryDark: '#0f2027',
    surface: '#ffffff',
    surfaceElevated: '#fafbfc',
    surfaceHover: '#f8fafc',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    status: {
        success: '#059669',
        successLight: '#f0fdf4',
        successBorder: '#bbf7d0',
        info: '#0369a1',
        infoLight: '#f0f9ff',
        infoBorder: '#bae6fd',
        error: '#dc2626',
        errorLight: '#fef2f2',
        warning: '#d97706',
        warningLight: '#fffbeb'
    },
    shadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        focus: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px'
    }
};

interface ProtocolConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    protocolId: string;
    clientEmail: string;
    onConfirm: (options: { print: boolean; sendEmail: boolean }) => void;
}

// Enum do śledzenia sekwencji modali
enum ModalSequence {
    SELECTION = 'selection',
    SIGNATURE = 'signature',
    SIGNATURE_STATUS = 'signature_status',
    PDF_PREVIEW = 'pdf_preview'
}

const ProtocolConfirmationModal: React.FC<ProtocolConfirmationModalProps> = ({
                                                                                 isOpen,
                                                                                 onClose,
                                                                                 protocolId,
                                                                                 clientEmail,
                                                                                 onConfirm
                                                                             }) => {
    const [selectedOptions, setSelectedOptions] = useState<{ print: boolean; sendEmail: boolean }>({
        print: true,
        sendEmail: !!clientEmail
    });

    // Stan sekwencji modali
    const [currentModal, setCurrentModal] = useState<ModalSequence>(ModalSequence.SELECTION);
    const [modalSequence, setModalSequence] = useState<ModalSequence[]>([]);
    const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);

    // Stany ładowania i błędów
    const [isPrinting, setIsPrinting] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [hasError, setHasError] = useState<string | null>(null);
    const [emailSendResult, setEmailSendResult] = useState<{ success: boolean; message?: string } | null>(null);

    // Stany modali podpisu
    const [signatureSessionId, setSignatureSessionId] = useState<string>('');
    const [wasSignatureCompleted, setWasSignatureCompleted] = useState(false);

    // Resetowanie stanów przy otwarciu modala
    useEffect(() => {
        if (isOpen) {
            setCurrentModal(ModalSequence.SELECTION);
            setModalSequence([]);
            setCurrentSequenceIndex(0);
            setHasError(null);
            setEmailSendResult(null);
            setIsPrinting(false);
            setIsSendingEmail(false);
            setSignatureSessionId('');
            setWasSignatureCompleted(false);
        }
    }, [isOpen]);

    const handleOptionChange = (option: 'print' | 'sendEmail') => {
        setSelectedOptions(prev => ({
            ...prev,
            [option]: !prev[option]
        }));
    };

    // Tworzenie sekwencji modali na podstawie wybranych opcji
    const createModalSequence = (options: { print: boolean; sendEmail: boolean }): ModalSequence[] => {
        const sequence: ModalSequence[] = [];

        // Jeśli wybrano email (podpis), dodaj modali podpisu
        if (options.sendEmail && clientEmail) {
            sequence.push(ModalSequence.SIGNATURE);
            sequence.push(ModalSequence.SIGNATURE_STATUS);
        }

        // Jeśli wybrano druk LUB mamy podpis, dodaj modal PDF
        if (options.print || (options.sendEmail && clientEmail)) {
            sequence.push(ModalSequence.PDF_PREVIEW);
        }

        return sequence;
    };

    // Wysyłanie emaila z protokołem
    const handleSendEmail = async (): Promise<boolean> => {
        try {
            setIsSendingEmail(true);
            console.log('🔧 Sending protocol email for visit:', protocolId);

            const response = await protocolsApi.sendProtocolEmail(protocolId);

            setEmailSendResult(response);

            if (response.success) {
                console.log('✅ Protocol email sent successfully:', response.message);
                return true;
            } else {
                console.error('❌ Failed to send protocol email:', response.message);
                setHasError(`Nie udało się wysłać emaila: ${response.message || 'Nieznany błąd'}`);
                return false;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Nie udało się wysłać emaila z protokołem';
            console.error('❌ Error sending protocol email:', error);
            setHasError(errorMessage);
            setEmailSendResult({ success: false, message: errorMessage });
            return false;
        } finally {
            setIsSendingEmail(false);
        }
    };

    const handleConfirm = async () => {
        setHasError(null);
        setEmailSendResult(null);

        // Jeśli żadna opcja nie jest wybrana
        if (!selectedOptions.print && !selectedOptions.sendEmail) {
            return;
        }

        // Tworzenie sekwencji modali
        const sequence = createModalSequence(selectedOptions);

        if (sequence.length === 0) {
            // Brak sekwencji - natychmiastowe zakończenie
            onConfirm(selectedOptions);
            onClose();
            return;
        }

        // Ustawienie sekwencji i przejście do pierwszego modala
        setModalSequence(sequence);
        setCurrentSequenceIndex(0);
        setCurrentModal(sequence[0]);
    };

    // Przejście do następnego modala w sekwencji
    const proceedToNextModal = async () => {
        const nextIndex = currentSequenceIndex + 1;

        if (nextIndex < modalSequence.length) {
            setCurrentSequenceIndex(nextIndex);
            setCurrentModal(modalSequence[nextIndex]);
        } else {
            // Koniec sekwencji - zakończenie całego procesu
            completeProcess();
        }
    };

    // Zakończenie całego procesu
    const completeProcess = async () => {
        // Jeśli był podpis i wybrano email, wyślij email na końcu
        if (wasSignatureCompleted && selectedOptions.sendEmail && clientEmail) {
            console.log('🔧 Sending email after process completion...');
            await handleSendEmail();
        }

        onConfirm(selectedOptions);
        onClose();
    };

    // Obsługa anulowania - różna logika w zależności od kontekstu
    const handleCancel = () => {
        if (currentModal === ModalSequence.SELECTION) {
            // Anulowanie z głównego modala - zamknij cały modal
            onClose();
        } else {
            // Anulowanie z modala w sekwencji - kontynuuj do następnego modala
            proceedToNextModal();
        }
    };

    // Obsługa żądania podpisu
    const handleSignatureRequested = (sessionId: string) => {
        setSignatureSessionId(sessionId);
        proceedToNextModal(); // Przejście do modal śledzenia podpisu
    };

    // Obsługa zakończenia podpisu
    const handleSignatureCompleted = (signedDocumentUrl?: string) => {
        console.log('🔧 Signature completed:', signedDocumentUrl);
        setWasSignatureCompleted(true);
        // NIE wywołujemy proceedToNextModal tutaj - użytkownik musi kliknąć "Kontynuuj"
    };

    // Wrapper dla proceedToNextModal do obsługi w SignatureStatusModal
    const handleProceedToNext = () => {
        proceedToNextModal().catch(error => {
            console.error('Error proceeding to next modal:', error);
            completeProcess();
        });
    };

    // Obsługa zamknięcia PDF preview
    const handlePdfPreviewClose = () => {
        console.log('🔧 PDF preview closed, completing process...');
        completeProcess(); // Zakończ cały proces
    };

    const handleSkip = async () => {
        // Jeśli tylko email był wybrany, wyślij go przed zamknięciem
        if (!selectedOptions.print && selectedOptions.sendEmail && clientEmail) {
            await handleSendEmail();
        }

        onConfirm({ print: false, sendEmail: selectedOptions.sendEmail });
        onClose();
    };

    if (!isOpen) return null;

    // Renderowanie modala wyboru opcji
    if (currentModal === ModalSequence.SELECTION) {
        return (
            <ModalOverlay>
                <ModalContainer>
                    <ModalHeader>
                        <HeaderContent>
                            <DocumentIcon>
                                <FaFileAlt />
                            </DocumentIcon>
                            <HeaderText>
                                <ModalTitle>Protokół #{protocolId} utworzony</ModalTitle>
                                <ModalSubtitle>Wybierz opcje udostępnienia dokumentu</ModalSubtitle>
                            </HeaderText>
                        </HeaderContent>
                    </ModalHeader>

                    <ModalBody>
                        <StatusSection>
                            <StatusIndicator>
                                <StatusIcon>
                                    <FaCheck />
                                </StatusIcon>
                                <StatusMessage>Protokół został pomyślnie zapisany w systemie</StatusMessage>
                            </StatusIndicator>
                        </StatusSection>

                        {hasError && (
                            <ErrorSection>
                                <ErrorMessage>{hasError}</ErrorMessage>
                            </ErrorSection>
                        )}

                        {emailSendResult && (
                            <EmailResultSection success={emailSendResult.success}>
                                <EmailResultMessage>
                                    {emailSendResult.success
                                        ? '✅ Email z protokołem został wysłany pomyślnie!'
                                        : `❌ Nie udało się wysłać emaila: ${emailSendResult.message}`
                                    }
                                </EmailResultMessage>
                            </EmailResultSection>
                        )}

                        <OptionsSection>
                            <SectionTitle>Opcje udostępnienia</SectionTitle>

                            <OptionsList>
                                <OptionItem>
                                    <OptionCheckbox
                                        type="checkbox"
                                        checked={selectedOptions.print}
                                        onChange={() => handleOptionChange('print')}
                                        disabled={isPrinting}
                                    />
                                    <OptionContent>
                                        <OptionHeader>
                                            <OptionIcon $primary>
                                                {isPrinting ? <FaSpinner className="spinner" /> : <FaPrint />}
                                            </OptionIcon>
                                            <OptionDetails>
                                                <OptionTitle>Podgląd i druk</OptionTitle>
                                                <OptionDescription>
                                                    Otwórz dokument w formacie PDF do wydruku lub pobrania
                                                </OptionDescription>
                                            </OptionDetails>
                                        </OptionHeader>
                                    </OptionContent>
                                </OptionItem>

                                <OptionItem>
                                    <OptionCheckbox
                                        type="checkbox"
                                        checked={selectedOptions.sendEmail}
                                        onChange={() => handleOptionChange('sendEmail')}
                                        disabled={!clientEmail || isSendingEmail}
                                    />
                                    <OptionContent>
                                        <OptionHeader>
                                            <OptionIcon $secondary={!clientEmail}>
                                                {isSendingEmail ? <FaSpinner className="spinner" /> : <FaEnvelope />}
                                            </OptionIcon>
                                            <OptionDetails>
                                                <OptionTitle>Wysyłka emailem z podpisem cyfrowym</OptionTitle>
                                                <OptionDescription>
                                                    {clientEmail
                                                        ? `Zbierz podpis cyfrowy i wyślij protokół na adres: ${clientEmail}`
                                                        : 'Nie można wysłać - brak adresu email w danych klienta'
                                                    }
                                                </OptionDescription>
                                            </OptionDetails>
                                        </OptionHeader>
                                    </OptionContent>
                                </OptionItem>
                            </OptionsList>
                        </OptionsSection>

                        <InfoSection>
                            <InfoMessage>
                                {selectedOptions.print && selectedOptions.sendEmail && clientEmail ? (
                                    "Zostanie wykonana następująca sekwencja: 1) zebranie podpisu cyfrowego, 2) wyświetlenie podpisanego protokołu, 3) wysłanie emaila po zatwierdzeniu."
                                ) : selectedOptions.sendEmail && clientEmail ? (
                                    "Klient zostanie poproszony o podpisanie protokołu na tablecie, następnie zostanie wyświetlony podpisany dokument do zatwierdzenia."
                                ) : selectedOptions.print ? (
                                    "Protokół zostanie wyświetlony do podglądu i druku."
                                ) : (
                                    "Możesz wybrać jedną lub obie opcje. Protokół zostanie zachowany w systemie niezależnie od wyboru."
                                )}
                            </InfoMessage>
                        </InfoSection>
                    </ModalBody>

                    <ModalFooter>
                        <ButtonGroup>
                            <SecondaryButton onClick={handleSkip}>
                                Pomiń
                            </SecondaryButton>
                            <PrimaryButton
                                onClick={handleConfirm}
                                disabled={isPrinting || isSendingEmail || (!selectedOptions.print && !selectedOptions.sendEmail)}
                            >
                                {isPrinting || isSendingEmail ? (
                                    <>
                                        <FaSpinner className="spinner" />
                                        Przetwarzanie...
                                    </>
                                ) : (
                                    <>
                                        <FaCheck />
                                        {selectedOptions.print && selectedOptions.sendEmail && clientEmail ? 'Rozpocznij sekwencję' : 'Wykonaj'}
                                    </>
                                )}
                            </PrimaryButton>
                        </ButtonGroup>
                    </ModalFooter>
                </ModalContainer>
            </ModalOverlay>
        );
    }

    // Renderowanie modala żądania podpisu
    if (currentModal === ModalSequence.SIGNATURE) {
        return (
            <TabletSignatureRequestModal
                isOpen={true}
                onClose={handleCancel}
                protocolId={parseInt(protocolId)}
                customerName={clientEmail}
                onSignatureRequested={handleSignatureRequested}
            />
        );
    }

    // Renderowanie modala śledzenia statusu podpisu
    if (currentModal === ModalSequence.SIGNATURE_STATUS && signatureSessionId) {
        return (
            <SignatureStatusModal
                isOpen={true}
                onClose={handleCancel}
                sessionId={signatureSessionId}
                protocolId={parseInt(protocolId)}
                onCompleted={handleSignatureCompleted}
                onProceedNext={handleProceedToNext}
            />
        );
    }

    // Renderowanie PDF preview
    if (currentModal === ModalSequence.PDF_PREVIEW) {
        return (
            <PDFViewer
                protocolId={protocolId}
                onClose={handlePdfPreviewClose}
                title={`Protokół przyjęcia pojazdu #${protocolId}`}
            />
        );
    }

    return null;
};

// Professional Styled Components (pozostają bez zmian)
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.15s ease-out;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    background: ${corporateTheme.surface};
    border-radius: ${corporateTheme.radius.lg};
    box-shadow: ${corporateTheme.shadow.elevated};
    width: 580px;
    max-width: 95%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid ${corporateTheme.border};
    animation: slideUp 0.2s ease-out;

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;

const ModalHeader = styled.div`
    padding: ${corporateTheme.spacing.lg} ${corporateTheme.spacing.xl};
    border-bottom: 1px solid ${corporateTheme.border};
    background: ${corporateTheme.surfaceElevated};
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.md};
`;

const DocumentIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${corporateTheme.primary};
    color: white;
    border-radius: ${corporateTheme.radius.md};
    font-size: 18px;
    flex-shrink: 0;
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.xs};
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${corporateTheme.text.primary};
    letter-spacing: -0.01em;
`;

const ModalSubtitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${corporateTheme.text.secondary};
    font-weight: 400;
`;

const ModalBody = styled.div`
    padding: ${corporateTheme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.lg};
`;

const StatusSection = styled.div`
    background: ${corporateTheme.status.successLight};
    border: 1px solid ${corporateTheme.status.successBorder};
    border-radius: ${corporateTheme.radius.md};
    padding: ${corporateTheme.spacing.md};
`;

const StatusIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.sm};
`;

const StatusIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: ${corporateTheme.status.success};
    color: white;
    border-radius: 50%;
    font-size: 11px;
    flex-shrink: 0;
`;

const StatusMessage = styled.span`
    font-size: 14px;
    color: ${corporateTheme.status.success};
    font-weight: 500;
`;

const ErrorSection = styled.div`
    background: ${corporateTheme.status.errorLight};
    border: 1px solid ${corporateTheme.status.error};
    border-radius: ${corporateTheme.radius.md};
    padding: ${corporateTheme.spacing.md};
`;

const ErrorMessage = styled.div`
    color: ${corporateTheme.status.error};
    font-size: 14px;
    font-weight: 500;
`;

const EmailResultSection = styled.div<{ success: boolean }>`
    background: ${props => props.success ? corporateTheme.status.successLight : corporateTheme.status.errorLight};
    border: 1px solid ${props => props.success ? corporateTheme.status.successBorder : corporateTheme.status.error};
    border-radius: ${corporateTheme.radius.md};
    padding: ${corporateTheme.spacing.md};
`;

const EmailResultMessage = styled.div`
    font-size: 14px;
    font-weight: 500;
`;

const OptionsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.md};
`;

const SectionTitle = styled.h3`
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: ${corporateTheme.text.primary};
`;

const OptionsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.sm};
`;

const OptionItem = styled.label`
    display: flex;
    align-items: flex-start;
    gap: ${corporateTheme.spacing.md};
    padding: ${corporateTheme.spacing.md};
    border: 1px solid ${corporateTheme.borderLight};
    border-radius: ${corporateTheme.radius.md};
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        border-color: ${corporateTheme.primary};
        background: ${corporateTheme.surfaceHover};
    }

    &:has(input:checked) {
        border-color: ${corporateTheme.primary};
        background: rgba(26, 54, 93, 0.02);
    }

    &:has(input:disabled) {
        opacity: 0.6;
        cursor: not-allowed;

        &:hover {
            border-color: ${corporateTheme.borderLight};
            background: transparent;
        }
    }
`;

const OptionCheckbox = styled.input`
    width: 18px;
    height: 18px;
    margin-top: 2px;
    accent-color: ${corporateTheme.primary};
    cursor: pointer;
    flex-shrink: 0;

    &:disabled {
        cursor: not-allowed;
    }
`;

const OptionContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const OptionHeader = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${corporateTheme.spacing.sm};
`;

const OptionIcon = styled.div<{ $primary?: boolean; $secondary?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${props =>
            props.$secondary
                    ? corporateTheme.text.muted + '20'
                    : corporateTheme.primary + '15'
    };
    color: ${props =>
            props.$secondary
                    ? corporateTheme.text.muted
                    : corporateTheme.primary
    };
    border-radius: ${corporateTheme.radius.sm};
    font-size: 14px;
    flex-shrink: 0;
    margin-top: 2px;

    .spinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const OptionDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.xs};
`;

const OptionTitle = styled.h4`
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: ${corporateTheme.text.primary};
    line-height: 1.3;
`;

const OptionDescription = styled.p`
    margin: 0;
    font-size: 13px;
    color: ${corporateTheme.text.secondary};
    line-height: 1.4;
`;

const InfoSection = styled.div`
    background: ${corporateTheme.status.infoLight};
    border: 1px solid ${corporateTheme.status.infoBorder};
    border-radius: ${corporateTheme.radius.md};
    padding: ${corporateTheme.spacing.md};
`;

const InfoMessage = styled.div`
    font-size: 13px;
    color: ${corporateTheme.status.info};
    font-weight: 500;
    line-height: 1.4;
`;

const ModalFooter = styled.div`
    padding: ${corporateTheme.spacing.lg} ${corporateTheme.spacing.xl};
    border-top: 1px solid ${corporateTheme.border};
    background: ${corporateTheme.surfaceElevated};
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${corporateTheme.spacing.sm};
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.sm};
    padding: ${corporateTheme.spacing.sm} ${corporateTheme.spacing.md};
    background: ${corporateTheme.surface};
    color: ${corporateTheme.text.secondary};
    border: 1px solid ${corporateTheme.border};
    border-radius: ${corporateTheme.radius.sm};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    min-height: 40px;
    min-width: 80px;

    &:hover {
        background: ${corporateTheme.surfaceHover};
        border-color: ${corporateTheme.text.muted};
    }

    &:focus {
        outline: none;
        box-shadow: ${corporateTheme.shadow.focus};
    }
`;

const PrimaryButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${corporateTheme.spacing.sm};
    padding: ${corporateTheme.spacing.sm} ${corporateTheme.spacing.lg};
    background: ${corporateTheme.primary};
    color: white;
    border: 1px solid ${corporateTheme.primary};
    border-radius: ${corporateTheme.radius.sm};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    min-height: 40px;
    min-width: 120px;

    &:hover:not(:disabled) {
        background: ${corporateTheme.primaryDark};
        border-color: ${corporateTheme.primaryDark};
    }

    &:focus {
        outline: none;
        box-shadow: ${corporateTheme.shadow.focus};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: ${corporateTheme.text.muted};
        border-color: ${corporateTheme.text.muted};
    }

    .spinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

export default ProtocolConfirmationModal;