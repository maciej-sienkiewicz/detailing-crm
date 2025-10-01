// src/pages/Protocols/details/modals/InvoiceSignatureStatusModal.tsx
import React, {useEffect, useState} from 'react';
import styled, {keyframes} from 'styled-components';
import {
    FaArrowRight,
    FaCheck,
    FaClock,
    FaDownload,
    FaExclamationTriangle,
    FaFileInvoice,
    FaSignature,
    FaSpinner,
    FaTabletAlt,
    FaTimes
} from 'react-icons/fa';
import {useInvoiceSignature} from '../../../../hooks/useInvoiceSignature';
import {InvoiceSignatureStatus} from '../../../../api/invoiceSignatureApi';

interface InvoiceSignatureStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionId: string;
    invoiceId: string;
    onCompleted: (signedInvoiceUrl?: string) => void;
    onProceedNext: () => void;
}

const InvoiceSignatureStatusModal: React.FC<InvoiceSignatureStatusModalProps> = ({
                                                                                     isOpen,
                                                                                     onClose,
                                                                                     sessionId,
                                                                                     invoiceId,
                                                                                     onCompleted,
                                                                                     onProceedNext
                                                                                 }) => {
    const [showProceedButton, setShowProceedButton] = useState(false);

    const {
        isPolling,
        currentStatus,
        error,
        startStatusPolling,
        stopStatusPolling,
        cancelSignature,
        downloadSignedInvoice,
        isSignatureCompleted,
        isSignatureFailed
    } = useInvoiceSignature();

    // Start polling when modal opens
    useEffect(() => {
        if (isOpen && sessionId && invoiceId) {
            startStatusPolling(sessionId, invoiceId);
            setShowProceedButton(false);
        }

        return () => {
            if (isOpen) {
                stopStatusPolling();
            }
        };
    }, [isOpen, sessionId, invoiceId, startStatusPolling, stopStatusPolling]);

    // Handle completion or failure
    useEffect(() => {

        if (isSignatureCompleted || isSignatureFailed) {
            setShowProceedButton(true);
        }
    }, [isSignatureCompleted, isSignatureFailed, currentStatus]);

    const handleCancel = async () => {
        try {
            await cancelSignature(sessionId, invoiceId, 'Anulowane przez użytkownika');
        } catch (err) {
            console.error('Error cancelling invoice signature session:', err);
        }
        onClose();
    };

    const handleProceedNext = () => {
        stopStatusPolling();

        if (isSignatureCompleted) {
            onCompleted(currentStatus?.signedInvoiceUrl);
        }
        onProceedNext(); // Proceed to next step regardless of signature result
    };

    const handleDownload = async () => {
        if (!currentStatus?.signedInvoiceUrl) return;

        try {
            await downloadSignedInvoice(sessionId, invoiceId);
        } catch (err) {
            console.error('Error downloading signed invoice:', err);
        }
    };

    const getStatusInfo = () => {
        if (!currentStatus) {
            return {
                icon: <FaSpinner />,
                title: 'Sprawdzanie statusu...',
                description: 'Ładowanie informacji o statusie podpisu faktury...',
                color: '#6b7280',
                showSpinner: true,
                canProceed: false
            };
        }

        switch (currentStatus.status) {
            case InvoiceSignatureStatus.PENDING:
                return {
                    icon: <FaClock />,
                    title: 'Przygotowywanie żądania',
                    description: 'Inicjalizacja procesu podpisu faktury...',
                    color: '#3b82f6',
                    showSpinner: true,
                    canProceed: false
                };
            case InvoiceSignatureStatus.SENT_TO_TABLET:
                return {
                    icon: <FaTabletAlt />,
                    title: 'Wysłano do tableta',
                    description: 'Żądanie podpisu faktury zostało wysłane. Oczekiwanie na reakcję klienta...',
                    color: '#8b5cf6',
                    showSpinner: true,
                    canProceed: false
                };
            case InvoiceSignatureStatus.VIEWING_INVOICE:
                return {
                    icon: <FaFileInvoice />,
                    title: 'Klient przegląda fakturę',
                    description: 'Klient otworzył fakturę na tablecie...',
                    color: '#8b5cf6',
                    showSpinner: true,
                    canProceed: false
                };
            case InvoiceSignatureStatus.SIGNING_IN_PROGRESS:
                return {
                    icon: <FaSignature />,
                    title: 'Trwa składanie podpisu',
                    description: 'Klient podpisuje fakturę na tablecie...',
                    color: '#8b5cf6',
                    showSpinner: true,
                    canProceed: false
                };
            case InvoiceSignatureStatus.COMPLETED:
                return {
                    icon: <FaCheck />,
                    title: 'Faktura podpisana!',
                    description: 'Faktura została pomyślnie podpisana przez klienta.',
                    color: '#10b981',
                    showSpinner: false,
                    canProceed: true
                };
            case InvoiceSignatureStatus.EXPIRED:
                return {
                    icon: <FaClock />,
                    title: 'Czas minął',
                    description: 'Żądanie podpisu faktury wygasło. Możesz kontynuować bez podpisu cyfrowego.',
                    color: '#f59e0b',
                    showSpinner: false,
                    canProceed: true
                };
            case InvoiceSignatureStatus.CANCELLED:
                return {
                    icon: <FaExclamationTriangle />,
                    title: 'Anulowano',
                    description: 'Żądanie podpisu faktury zostało anulowane. Możesz kontynuować bez podpisu cyfrowego.',
                    color: '#ef4444',
                    showSpinner: false,
                    canProceed: true
                };
            case InvoiceSignatureStatus.ERROR:
                return {
                    icon: <FaExclamationTriangle />,
                    title: 'Wystąpił błąd',
                    description: 'Nie udało się przetworzyć żądania podpisu faktury. Możesz kontynuować bez podpisu cyfrowego.',
                    color: '#ef4444',
                    showSpinner: false,
                    canProceed: true
                };
            default:
                return {
                    icon: <FaSpinner />,
                    title: 'Przetwarzanie...',
                    description: 'Trwa przetwarzanie żądania podpisu faktury.',
                    color: '#6b7280',
                    showSpinner: true,
                    canProceed: false
                };
        }
    };

    if (!isOpen) return null;

    const statusInfo = getStatusInfo();
    const canCancel = currentStatus?.status && [
        InvoiceSignatureStatus.PENDING,
        InvoiceSignatureStatus.SENT_TO_TABLET,
        InvoiceSignatureStatus.VIEWING_INVOICE,
        InvoiceSignatureStatus.SIGNING_IN_PROGRESS
    ].includes(currentStatus.status);

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <SignatureIcon>
                            <FaFileInvoice />
                        </SignatureIcon>
                        <HeaderText>
                            <ModalTitle>Status podpisu faktury</ModalTitle>
                            <ModalSubtitle>Faktura #{invoiceId}</ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    {error && !currentStatus ? (
                        <ErrorSection>
                            <ErrorIcon>
                                <FaExclamationTriangle />
                            </ErrorIcon>
                            <ErrorMessage>{error}</ErrorMessage>
                            <ErrorDescription>
                                Mimo błędu możesz kontynuować proces bez podpisu cyfrowego.
                            </ErrorDescription>
                        </ErrorSection>
                    ) : (
                        <StatusSection>
                            <StatusIconContainer color={statusInfo.color}>
                                {statusInfo.showSpinner ? (
                                    <SpinnerIcon className="spinner">
                                        <FaSpinner />
                                    </SpinnerIcon>
                                ) : (
                                    statusInfo.icon
                                )}
                            </StatusIconContainer>

                            <StatusContent>
                                <StatusTitle>{statusInfo.title}</StatusTitle>
                                <StatusDescription>{statusInfo.description}</StatusDescription>

                                {currentStatus?.signedAt && (
                                    <SignedAtInfo>
                                        Podpisano: {new Date(currentStatus.signedAt).toLocaleString('pl-PL')}
                                    </SignedAtInfo>
                                )}

                                {currentStatus?.timestamp && (
                                    <TimestampInfo>
                                        Ostatnia aktualizacja: {new Date(currentStatus.timestamp).toLocaleString('pl-PL')}
                                    </TimestampInfo>
                                )}
                            </StatusContent>

                            {currentStatus?.status === InvoiceSignatureStatus.COMPLETED && (
                                <CompletedActions>
                                    <SuccessMessage>
                                        <FaCheck />
                                        Faktura została pomyślnie podpisana!
                                    </SuccessMessage>

                                    {currentStatus.signedInvoiceUrl && (
                                        <DownloadButton onClick={handleDownload}>
                                            <FaDownload />
                                            Pobierz podpisaną fakturę
                                        </DownloadButton>
                                    )}
                                </CompletedActions>
                            )}

                            {(currentStatus?.status === InvoiceSignatureStatus.EXPIRED ||
                                currentStatus?.status === InvoiceSignatureStatus.CANCELLED ||
                                currentStatus?.status === InvoiceSignatureStatus.ERROR) && (
                                <WarningMessage>
                                    <FaExclamationTriangle />
                                    Proces może być kontynuowany bez podpisu cyfrowego
                                </WarningMessage>
                            )}
                        </StatusSection>
                    )}
                </ModalBody>

                <ModalFooter>
                    <ButtonGroup>
                        {canCancel && (
                            <CancelButton onClick={handleCancel}>
                                Anuluj żądanie
                            </CancelButton>
                        )}

                        {(showProceedButton || (error && !currentStatus)) && (
                            <ProceedButton onClick={handleProceedNext}>
                                <FaArrowRight />
                                {isSignatureCompleted ? 'Kontynuuj z podpisem' : 'Kontynuuj bez podpisu'}
                            </ProceedButton>
                        )}

                        <CloseModalButton onClick={onClose}>
                            {(showProceedButton || (error && !currentStatus)) ? 'Anuluj proces' : 'Zamknij'}
                        </CloseModalButton>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

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
    z-index: 1202;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.15s ease-out;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    background: white;
    border-radius: 12px;
    width: 500px;
    max-width: 95%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid #e2e8f0;
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
    padding: 24px 32px;
    border-bottom: 1px solid #e2e8f0;
    background: #fafbfc;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const SignatureIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: #1a365d;
    color: white;
    border-radius: 8px;
    font-size: 18px;
    flex-shrink: 0;
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
`;

const ModalSubtitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: #475569;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.15s ease;

    &:hover {
        background: #f8fafc;
        color: #0f172a;
    }
`;

const ModalBody = styled.div`
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const ErrorSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px 0;
    text-align: center;
`;

const ErrorIcon = styled.div`
    font-size: 32px;
    color: #dc2626;
`;

const ErrorMessage = styled.div`
    color: #dc2626;
    font-size: 14px;
    line-height: 1.5;
    font-weight: 600;
`;

const ErrorDescription = styled.div`
    color: #475569;
    font-size: 13px;
    line-height: 1.5;
    font-style: italic;
`;

const StatusSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    text-align: center;
`;

const StatusIconContainer = styled.div<{ color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: ${props => props.color}15;
    color: ${props => props.color};
    border-radius: 50%;
    font-size: 32px;
    border: 3px solid ${props => props.color}30;
`;

const SpinnerIcon = styled.div`
    &.spinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const StatusContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const StatusTitle = styled.h3`
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #0f172a;
`;

const StatusDescription = styled.p`
    margin: 0;
    font-size: 14px;
    color: #475569;
    line-height: 1.5;
`;

const SignedAtInfo = styled.div`
    margin-top: 8px;
    padding: 8px 16px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 6px;
    color: #059669;
    font-size: 13px;
    font-weight: 500;
`;

const TimestampInfo = styled.div`
    font-size: 12px;
    color: #94a3b8;
    font-style: italic;
    margin-top: 4px;
`;

const CompletedActions = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
`;

const SuccessMessage = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    color: #059669;
    font-weight: 600;
    font-size: 14px;
`;

const DownloadButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    background: #1a365d;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: #2c5aa0;
        transform: translateY(-1px);
    }
`;

const WarningMessage = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 8px;
    color: #d97706;
    font-weight: 600;
    font-size: 14px;
`;

const ModalFooter = styled.div`
    padding: 24px 32px;
    border-top: 1px solid #e2e8f0;
    background: #fafbfc;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
`;

const CancelButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: white;
    color: #dc2626;
    border: 1px solid #dc2626;
    border-radius: 6px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: #fef2f2;
    }
`;

const ProceedButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #10b981;
    color: white;
    border: 1px solid #10b981;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: #059669;
        transform: translateY(-1px);
    }
`;

const CloseModalButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #1a365d;
    color: white;
    border: 1px solid #1a365d;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: #2c5aa0;
    }
`;

export default InvoiceSignatureStatusModal;