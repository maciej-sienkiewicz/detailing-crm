// src/pages/Protocols/details/modals/InvoiceSignatureConfirmationModal.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaFileInvoice, FaSignature, FaTimes, FaCheck, FaTabletAlt, FaExclamationTriangle } from 'react-icons/fa';
import InvoiceSignatureRequestModal from './InvoiceSignatureRequestModal';
import InvoiceSignatureStatusModal from './InvoiceSignatureStatusModal';

interface InvoiceSignatureConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (withSignature: boolean, sessionId?: string) => void;
    visitId: string;
    customerName: string;
    customerEmail?: string;
}

enum SignatureModalStep {
    CONFIRMATION = 'confirmation',
    TABLET_REQUEST = 'tablet_request',
    SIGNATURE_STATUS = 'signature_status'
}

const InvoiceSignatureConfirmationModal: React.FC<InvoiceSignatureConfirmationModalProps> = ({
                                                                                                 isOpen,
                                                                                                 onClose,
                                                                                                 onConfirm,
                                                                                                 visitId,
                                                                                                 customerName,
                                                                                                 customerEmail
                                                                                             }) => {
    const [currentStep, setCurrentStep] = useState<SignatureModalStep>(SignatureModalStep.CONFIRMATION);
    const [signatureSessionId, setSignatureSessionId] = useState<string>('');
    const [signatureInvoiceId, setSignatureInvoiceId] = useState<string>('');

    const handleWithoutSignature = () => {
        onConfirm(false);
        onClose();
    };

    const handleWithSignature = () => {
        setCurrentStep(SignatureModalStep.TABLET_REQUEST);
    };

    const handleSignatureRequested = (sessionId: string, invoiceId: string) => {
        console.log('🔧 Signature requested, transitioning to status modal...', { sessionId, invoiceId });
        setSignatureSessionId(sessionId);
        setSignatureInvoiceId(invoiceId);
        setCurrentStep(SignatureModalStep.SIGNATURE_STATUS);
    };

    const handleSignatureCompleted = (signedInvoiceUrl?: string) => {
        onConfirm(true, signatureSessionId);
        onClose();
    };

    const handleBackToConfirmation = () => {
        setCurrentStep(SignatureModalStep.CONFIRMATION);
        setSignatureSessionId('');
        setSignatureInvoiceId('');
    };

    const handleModalClose = () => {
        if (currentStep === SignatureModalStep.CONFIRMATION) {
            onClose();
        } else {
            handleBackToConfirmation();
        }
    };

    if (!isOpen) return null;

    // Render confirmation modal
    if (currentStep === SignatureModalStep.CONFIRMATION) {
        return (
            <ModalOverlay>
                <ModalContainer>
                    <ModalHeader>
                        <HeaderContent>
                            <HeaderIcon>
                                <FaFileInvoice />
                            </HeaderIcon>
                            <HeaderText>
                                <ModalTitle>Podpis faktury</ModalTitle>
                                <ModalSubtitle>Wizyta #{visitId} - {customerName}</ModalSubtitle>
                            </HeaderText>
                        </HeaderContent>
                        <CloseButton onClick={handleModalClose}>
                            <FaTimes />
                        </CloseButton>
                    </ModalHeader>

                    <ModalBody>
                        <QuestionSection>
                            <QuestionIcon>
                                <FaSignature />
                            </QuestionIcon>
                            <QuestionContent>
                                <QuestionTitle>Czy chcesz zebrać podpis cyfrowy do faktury?</QuestionTitle>
                                <QuestionDescription>
                                    Podpis cyfrowy potwierdzi odbiór faktury przez klienta i zostanie dołączony do dokumentu.
                                    {customerEmail && (
                                        <> Podpisana faktura zostanie wysłana na adres: <strong>{customerEmail}</strong></>
                                    )}
                                </QuestionDescription>
                            </QuestionContent>
                        </QuestionSection>

                        <OptionsSection>
                            <OptionCard onClick={handleWithSignature}>
                                <OptionIcon $variant="primary">
                                    <FaTabletAlt />
                                </OptionIcon>
                                <OptionContent>
                                    <OptionTitle>Tak, zbierz podpis cyfrowy</OptionTitle>
                                    <OptionDescription>
                                        Klient podpisze fakturę na tablecie. Podpisany dokument zostanie automatycznie zapisany.
                                    </OptionDescription>
                                </OptionContent>
                                <OptionArrow>→</OptionArrow>
                            </OptionCard>

                            <OptionCard onClick={handleWithoutSignature}>
                                <OptionIcon $variant="secondary">
                                    <FaFileInvoice />
                                </OptionIcon>
                                <OptionContent>
                                    <OptionTitle>Nie, kontynuuj bez podpisu</OptionTitle>
                                    <OptionDescription>
                                        Faktura zostanie wystawiona bez podpisu cyfrowego klienta.
                                    </OptionDescription>
                                </OptionContent>
                                <OptionArrow>→</OptionArrow>
                            </OptionCard>
                        </OptionsSection>

                        <InfoSection>
                            <InfoIcon>
                                <FaExclamationTriangle />
                            </InfoIcon>
                            <InfoText>
                                <InfoTitle>Informacja</InfoTitle>
                                <InfoDescription>
                                    Podpis cyfrowy nie jest wymagany do wystawienia faktury, ale może być przydatny
                                    jako potwierdzenie odbioru usług przez klienta.
                                </InfoDescription>
                            </InfoText>
                        </InfoSection>
                    </ModalBody>

                    <ModalFooter>
                        <SecondaryButton onClick={handleModalClose}>
                            Anuluj
                        </SecondaryButton>
                    </ModalFooter>
                </ModalContainer>
            </ModalOverlay>
        );
    }

    // Render tablet selection modal
    if (currentStep === SignatureModalStep.TABLET_REQUEST) {
        return (
            <InvoiceSignatureRequestModal
                isOpen={true}
                onClose={handleBackToConfirmation}
                visitId={visitId}
                customerName={customerName}
                onSignatureRequested={handleSignatureRequested}
            />
        );
    }

    // Render signature status modal
    if (currentStep === SignatureModalStep.SIGNATURE_STATUS && signatureSessionId && signatureInvoiceId) {
        return (
            <InvoiceSignatureStatusModal
                isOpen={true}
                onClose={handleBackToConfirmation}
                sessionId={signatureSessionId}
                invoiceId={signatureInvoiceId}
                onCompleted={handleSignatureCompleted}
                onProceedNext={() => handleSignatureCompleted()}
            />
        );
    }

    return null;
};

// Professional Brand Theme
const brandTheme = {
    primary: '#1a365d',
    primaryLight: '#2c5aa0',
    primaryDark: '#0f2027',
    primaryGhost: 'rgba(26, 54, 93, 0.06)',
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
    divider: '#e5e7eb',
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        info: '#0369a1',
        infoLight: '#f0f9ff',
        warning: '#d97706',
        warningLight: '#fffbeb'
    },
    shadow: {
        soft: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
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
        lg: '12px',
        xl: '16px'
    }
};

// Styled Components
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1200;
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
    box-shadow: ${brandTheme.shadow.elevated};
    width: 600px;
    max-width: 95%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid ${brandTheme.border};
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceElevated};
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const HeaderIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${brandTheme.primary};
    color: white;
    border-radius: ${brandTheme.radius.md};
    font-size: 18px;
    flex-shrink: 0;
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.01em;
`;

const ModalSubtitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 400;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${brandTheme.surfaceHover};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    color: ${brandTheme.text.muted};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #fef2f2;
        border-color: #dc2626;
        color: #dc2626;
        transform: translateY(-1px);
    }
`;

const ModalBody = styled.div`
    padding: ${brandTheme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xl};
    overflow-y: auto;
    flex: 1;
`;

const QuestionSection = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${brandTheme.spacing.lg};
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.status.infoLight};
    border: 1px solid ${brandTheme.status.info}30;
    border-radius: ${brandTheme.radius.lg};
`;

const QuestionIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${brandTheme.status.info};
    color: white;
    border-radius: ${brandTheme.radius.lg};
    font-size: 20px;
    flex-shrink: 0;
`;

const QuestionContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const QuestionTitle = styled.h3`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    line-height: 1.4;
`;

const QuestionDescription = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    line-height: 1.5;

    strong {
        color: ${brandTheme.text.primary};
        font-weight: 600;
    }
`;

const OptionsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const OptionCard = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.lg};
    padding: ${brandTheme.spacing.lg};
    border: 2px solid ${brandTheme.borderLight};
    border-radius: ${brandTheme.radius.lg};
    cursor: pointer;
    transition: all 0.2s ease;
    background: ${brandTheme.surface};

    &:hover {
        border-color: ${brandTheme.primary};
        background: ${brandTheme.primaryGhost};
        transform: translateY(-2px);
        box-shadow: ${brandTheme.shadow.elevated};
    }
`;

const OptionIcon = styled.div<{ $variant: 'primary' | 'secondary' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${props => props.$variant === 'primary' ? brandTheme.primary + '15' : brandTheme.text.muted + '15'};
    color: ${props => props.$variant === 'primary' ? brandTheme.primary : brandTheme.text.muted};
    border-radius: ${brandTheme.radius.lg};
    font-size: 20px;
    flex-shrink: 0;
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
    line-height: 1.3;
`;

const OptionDescription = styled.p`
    margin: 0;
    font-size: 13px;
    color: ${brandTheme.text.secondary};
    line-height: 1.4;
`;

const OptionArrow = styled.div`
    font-size: 18px;
    color: ${brandTheme.text.muted};
    font-weight: bold;
    transition: all 0.2s ease;

    ${OptionCard}:hover & {
        color: ${brandTheme.primary};
        transform: translateX(4px);
    }
`;

const InfoSection = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.status.warningLight};
    border: 1px solid ${brandTheme.status.warning}30;
    border-radius: ${brandTheme.radius.md};
`;

const InfoIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: ${brandTheme.status.warning};
    font-size: 14px;
    flex-shrink: 0;
    margin-top: 2px;
`;

const InfoText = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const InfoTitle = styled.div`
    font-size: 13px;
    font-weight: 600;
    color: ${brandTheme.status.warning};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const InfoDescription = styled.div`
    font-size: 13px;
    color: ${brandTheme.text.secondary};
    line-height: 1.4;
`;

const ModalFooter = styled.div`
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-top: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceElevated};
    display: flex;
    justify-content: flex-end;
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.lg};
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 40px;
    min-width: 80px;

    &:hover {
        background: ${brandTheme.surfaceHover};
        border-color: ${brandTheme.text.muted};
        transform: translateY(-1px);
    }
`;

export default InvoiceSignatureConfirmationModal;