import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPrint, FaEnvelope, FaCheck, FaTimes, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import PDFViewer from "../../../../components/PdfViewer";

// Professional Brand Theme
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

interface ProtocolConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    protocolId: string;
    clientEmail: string;
    onConfirm: (options: { print: boolean; sendEmail: boolean }) => void;
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
    const [isPrinting, setIsPrinting] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [hasError, setHasError] = useState<string | null>(null);
    const [showPdfPreview, setShowPdfPreview] = useState(false);

    const handleOptionChange = (option: 'print' | 'sendEmail') => {
        setSelectedOptions(prev => ({
            ...prev,
            [option]: !prev[option]
        }));
    };

    const handlePrintProtocol = async () => {
        try {
            setIsPrinting(true);
            // Zamiast drukować od razu, pokazujemy podgląd
            setShowPdfPreview(true);
            setIsPrinting(false);
        } catch (error) {
            console.error('Error preparing PDF preview:', error);
            setHasError('Wystąpił błąd podczas generowania podglądu PDF');
            setIsPrinting(false);
        }
    };

    const handleSendEmail = async () => {
        if (!clientEmail) return;

        try {
            setIsSendingEmail(true);
            // await emailService.sendProtocolEmail(protocolId, clientEmail);
            setIsSendingEmail(false);
        } catch (error) {
            console.error('Error sending email:', error);
            setHasError('Wystąpił błąd podczas wysyłania emaila');
            setIsSendingEmail(false);
        }
    };

    const handleConfirm = async () => {
        setHasError(null);

        try {
            // Jeśli wybrano drukowanie, pokaż podgląd PDF
            if (selectedOptions.print) {
                handlePrintProtocol();
                return; // Nie zamykaj modalu, będzie obsłużone po zamknięciu podglądu
            }

            // Jeśli wybrano tylko email, wyślij go
            if (selectedOptions.sendEmail && clientEmail) {
                await handleSendEmail();
            }

            // Poinformuj komponenty nadrzędne o potwierdzeniu
            onConfirm(selectedOptions);
            onClose();
        } catch (error) {
            console.error('Error during confirmation actions:', error);
            setHasError('Wystąpił błąd podczas wykonywania żądanych akcji');
        }
    };

    const handlePdfPreviewClose = () => {
        setShowPdfPreview(false);

        // Jeśli wybrano też email, wyślij go teraz
        if (selectedOptions.sendEmail && clientEmail) {
            handleSendEmail().then(() => {
                // Poinformuj komponenty nadrzędne o potwierdzeniu po zamknięciu podglądu
                onConfirm(selectedOptions);
                onClose();
            }).catch(error => {
                console.error('Error sending email after PDF preview:', error);
                setHasError('Wystąpił błąd podczas wysyłania emaila');
            });
        } else {
            // Jeśli nie wybrano emaila, po prostu zamknij
            onConfirm(selectedOptions);
            onClose();
        }
    };

    const handleSkip = () => {
        onConfirm({ print: false, sendEmail: false });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <HeaderIcon>
                            <FaCheckCircle />
                        </HeaderIcon>
                        <HeaderText>
                            <ModalTitle>Protokół utworzony pomyślnie</ModalTitle>
                            <ModalSubtitle>Wybierz sposób udostępnienia klientowi</ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                </ModalHeader>

                <ModalBody>
                    <SuccessMessage>
                        <SuccessContent>
                            <SuccessTitle>✅ Protokół #{protocolId} został utworzony</SuccessTitle>
                            <SuccessDescription>
                                Dokument został zapisany w systemie. Wybierz jak chcesz go udostępnić klientowi:
                            </SuccessDescription>
                        </SuccessContent>
                    </SuccessMessage>

                    {hasError && (
                        <ErrorMessage>
                            <ErrorIcon>⚠️</ErrorIcon>
                            <ErrorText>{hasError}</ErrorText>
                        </ErrorMessage>
                    )}

                    <OptionsContainer>
                        <OptionCard
                            selected={selectedOptions.print}
                            onClick={() => handleOptionChange('print')}
                            disabled={isPrinting}
                        >
                            <OptionHeader>
                                <OptionIconBox selected={selectedOptions.print}>
                                    {isPrinting ? <FaSpinner className="spinner" /> : <FaPrint />}
                                </OptionIconBox>
                                <OptionContent>
                                    <OptionTitle>Wydrukuj protokół</OptionTitle>
                                    <OptionDescription>
                                        Otwiera protokół w podglądzie PDF gotowym do wydruku
                                    </OptionDescription>
                                </OptionContent>
                                <Checkbox selected={selectedOptions.print}>
                                    <FaCheck />
                                </Checkbox>
                            </OptionHeader>
                            {selectedOptions.print && (
                                <OptionDetails>
                                    Dokument zostanie otwarty w nowym oknie z możliwością wydruku
                                </OptionDetails>
                            )}
                        </OptionCard>

                        <OptionCard
                            selected={selectedOptions.sendEmail}
                            onClick={() => handleOptionChange('sendEmail')}
                            disabled={!clientEmail || isSendingEmail}
                        >
                            <OptionHeader>
                                <OptionIconBox selected={selectedOptions.sendEmail && !!clientEmail}>
                                    {isSendingEmail ? <FaSpinner className="spinner" /> : <FaEnvelope />}
                                </OptionIconBox>
                                <OptionContent>
                                    <OptionTitle>Wyślij na email</OptionTitle>
                                    <OptionDescription>
                                        {clientEmail
                                            ? `Wyślij kopię protokołu na adres klienta`
                                            : 'Brak adresu email w danych klienta'}
                                    </OptionDescription>
                                </OptionContent>
                                <Checkbox selected={selectedOptions.sendEmail && !!clientEmail}>
                                    <FaCheck />
                                </Checkbox>
                            </OptionHeader>
                            {selectedOptions.sendEmail && clientEmail && (
                                <OptionDetails>
                                    <EmailBadge>
                                        <FaEnvelope />
                                        <span>{clientEmail}</span>
                                    </EmailBadge>
                                </OptionDetails>
                            )}
                            {!clientEmail && (
                                <DisabledNote>
                                    Aby wysłać email, uzupełnij adres email w danych klienta
                                </DisabledNote>
                            )}
                        </OptionCard>
                    </OptionsContainer>

                    <QuickTip>
                        <TipIcon>💡</TipIcon>
                        <TipText>
                            Możesz wybrać oba sposoby lub pominąć ten krok - protokół zostanie zapisany w systemie
                        </TipText>
                    </QuickTip>
                </ModalBody>

                <ModalFooter>
                    <SecondaryButton onClick={handleSkip}>
                        <FaTimes />
                        Pomiń
                    </SecondaryButton>
                    <PrimaryButton
                        onClick={handleConfirm}
                        disabled={isPrinting || isSendingEmail || (!selectedOptions.print && !selectedOptions.sendEmail)}
                    >
                        <FaCheck />
                        {isPrinting || isSendingEmail ? 'Przetwarzanie...' : 'Zatwierdź wybór'}
                    </PrimaryButton>
                </ModalFooter>

                {/* Podgląd PDF */}
                {showPdfPreview && (
                    <PDFViewer
                        protocolId={protocolId}
                        onClose={handlePdfPreviewClose}
                        title={`Protokół przyjęcia pojazdu #${protocolId}`}
                    />
                )}
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components - Professional Automotive CRM Design
const ModalOverlay = styled.div`
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background: rgba(0, 0, 0, 0.6);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 1000;
   backdrop-filter: blur(4px);
   animation: fadeIn 0.2s ease;

   @keyframes fadeIn {
       from { opacity: 0; }
       to { opacity: 1; }
   }
`;

const ModalContainer = styled.div`
   background: ${brandTheme.surface};
   border-radius: ${brandTheme.radius.xl};
   box-shadow: ${brandTheme.shadow.xl};
   width: 600px;
   max-width: 95%;
   display: flex;
   flex-direction: column;
   overflow: hidden;
   animation: slideUp 0.3s ease;

   @keyframes slideUp {
       from {
           opacity: 0;
           transform: translateY(20px) scale(0.95);
       }
       to {
           opacity: 1;
           transform: translateY(0) scale(1);
       }
   }
`;

const ModalHeader = styled.div`
   padding: ${brandTheme.spacing.xl};
   border-bottom: 2px solid ${brandTheme.border};
   background: linear-gradient(135deg, ${brandTheme.status.successLight} 0%, ${brandTheme.surfaceAlt} 100%);
`;

const HeaderContent = styled.div`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.lg};
`;

const HeaderIcon = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 56px;
   height: 56px;
   background: ${brandTheme.status.success};
   color: white;
   border-radius: ${brandTheme.radius.xl};
   font-size: 24px;
   box-shadow: ${brandTheme.shadow.md};
`;

const HeaderText = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xs};
`;

const ModalTitle = styled.h2`
   margin: 0;
   font-size: 22px;
   font-weight: 700;
   color: ${brandTheme.text.primary};
   letter-spacing: -0.025em;
`;

const ModalSubtitle = styled.p`
   margin: 0;
   font-size: 15px;
   color: ${brandTheme.text.secondary};
   font-weight: 500;
`;

const ModalBody = styled.div`
   padding: ${brandTheme.spacing.xl};
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xl};
`;

const SuccessMessage = styled.div`
   background: linear-gradient(135deg, ${brandTheme.status.successLight} 0%, rgba(5, 150, 105, 0.05) 100%);
   border: 1px solid ${brandTheme.status.success};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.lg};
   box-shadow: ${brandTheme.shadow.xs};
`;

const SuccessContent = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.sm};
`;

const SuccessTitle = styled.h3`
   margin: 0;
   font-size: 16px;
   font-weight: 600;
   color: ${brandTheme.status.success};
`;

const SuccessDescription = styled.p`
   margin: 0;
   font-size: 14px;
   color: ${brandTheme.text.secondary};
   line-height: 1.5;
`;

const ErrorMessage = styled.div`
   background: ${brandTheme.status.errorLight};
   border: 1px solid ${brandTheme.status.error};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.lg};
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.md};
`;

const ErrorIcon = styled.div`
   font-size: 20px;
   flex-shrink: 0;
`;

const ErrorText = styled.div`
   color: ${brandTheme.status.error};
   font-size: 14px;
   font-weight: 500;
`;

const OptionsContainer = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.md};
`;

const OptionCard = styled.div<{ selected: boolean; disabled?: boolean }>`
   background: ${props => props.selected ? brandTheme.primaryGhost : brandTheme.surface};
   border: 2px solid ${props => props.selected ? brandTheme.primary : brandTheme.border};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.lg};
   cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
   transition: all ${brandTheme.transitions.normal};
   opacity: ${props => props.disabled ? 0.6 : 1};
   position: relative;
   overflow: hidden;

   &:hover:not([disabled]) {
       border-color: ${brandTheme.primary};
       box-shadow: ${brandTheme.shadow.md};
       transform: translateY(-1px);
   }

   ${props => props.selected && `
       &::before {
           content: '';
           position: absolute;
           left: 0;
           top: 0;
           bottom: 0;
           width: 4px;
           background: ${brandTheme.primary};
       }
   `}
`;

const OptionHeader = styled.div`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.md};
`;

const OptionIconBox = styled.div<{ selected: boolean }>`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 48px;
   height: 48px;
   background: ${props => props.selected ? brandTheme.primary : brandTheme.surfaceAlt};
   color: ${props => props.selected ? 'white' : brandTheme.text.muted};
   border-radius: ${brandTheme.radius.lg};
   font-size: 20px;
   transition: all ${brandTheme.transitions.normal};
   flex-shrink: 0;

   .spinner {
       animation: spin 1s linear infinite;
   }

   @keyframes spin {
       from { transform: rotate(0deg); }
       to { transform: rotate(360deg); }
   }
`;

const OptionContent = styled.div`
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xs};
`;

const OptionTitle = styled.h4`
   margin: 0;
   font-size: 16px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
`;

const OptionDescription = styled.p`
   margin: 0;
   font-size: 14px;
   color: ${brandTheme.text.secondary};
   line-height: 1.4;
`;

const Checkbox = styled.div<{ selected: boolean }>`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 24px;
   height: 24px;
   border-radius: ${brandTheme.radius.sm};
   background: ${props => props.selected ? brandTheme.primary : 'transparent'};
   border: 2px solid ${props => props.selected ? brandTheme.primary : brandTheme.border};
   color: white;
   font-size: 12px;
   transition: all ${brandTheme.transitions.normal};
   flex-shrink: 0;
   opacity: ${props => props.selected ? 1 : 0.6};
`;

const OptionDetails = styled.div`
   margin-top: ${brandTheme.spacing.md};
   padding-top: ${brandTheme.spacing.md};
   border-top: 1px solid ${brandTheme.borderLight};
   font-size: 13px;
   color: ${brandTheme.text.tertiary};
`;

const EmailBadge = styled.div`
   display: inline-flex;
   align-items: center;
   gap: ${brandTheme.spacing.xs};
   padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
   background: ${brandTheme.surfaceAlt};
   border: 1px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.sm};
   font-size: 13px;
   font-weight: 500;
   color: ${brandTheme.text.secondary};

   span {
       font-family: monospace;
   }
`;

const DisabledNote = styled.div`
   margin-top: ${brandTheme.spacing.md};
   padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
   background: ${brandTheme.status.warningLight};
   border: 1px solid ${brandTheme.status.warning};
   border-radius: ${brandTheme.radius.sm};
   font-size: 13px;
   color: ${brandTheme.status.warning};
   font-weight: 500;
`;

const QuickTip = styled.div`
   background: ${brandTheme.surfaceAlt};
   border: 1px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
`;

const TipIcon = styled.div`
   font-size: 16px;
   flex-shrink: 0;
`;

const TipText = styled.div`
   font-size: 13px;
   color: ${brandTheme.text.secondary};
   font-weight: 500;
   line-height: 1.4;
`;

const ModalFooter = styled.div`
   display: flex;
   justify-content: flex-end;
   gap: ${brandTheme.spacing.md};
   padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
   border-top: 2px solid ${brandTheme.border};
   background: ${brandTheme.surfaceAlt};
`;

const SecondaryButton = styled.button`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   background: ${brandTheme.surface};
   color: ${brandTheme.text.secondary};
   border: 2px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.md};
   font-weight: 600;
   font-size: 14px;
   cursor: pointer;
   transition: all ${brandTheme.transitions.spring};
   min-height: 44px;
   min-width: 120px;

   &:hover {
       background: ${brandTheme.surfaceHover};
       color: ${brandTheme.text.primary};
       border-color: ${brandTheme.borderHover};
       box-shadow: ${brandTheme.shadow.sm};
   }
`;

const PrimaryButton = styled.button`
   display: flex;
   align-items: center;
   justify-content: center;
   gap: ${brandTheme.spacing.sm};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
   color: white;
   border: 2px solid transparent;
   border-radius: ${brandTheme.radius.md};
   font-weight: 600;
   font-size: 14px;
   cursor: pointer;
   transition: all ${brandTheme.transitions.spring};
   box-shadow: ${brandTheme.shadow.sm};
   min-height: 44px;
   min-width: 140px;

   &:hover:not(:disabled) {
       background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
       transform: translateY(-1px);
       box-shadow: ${brandTheme.shadow.md};
   }

   &:disabled {
       opacity: 0.6;
       cursor: not-allowed;
       transform: none;
       background: ${brandTheme.text.disabled};
   }

   &:active:not(:disabled) {
       transform: translateY(0);
   }
`;

export default ProtocolConfirmationModal;