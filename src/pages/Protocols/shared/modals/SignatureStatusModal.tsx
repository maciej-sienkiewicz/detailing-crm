// src/pages/Protocols/shared/modals/SignatureStatusModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaSignature, FaTimes, FaSpinner, FaCheck, FaExclamationTriangle, FaClock, FaDownload, FaTabletAlt } from 'react-icons/fa';
import { protocolSignatureApi, ProtocolSignatureStatusResponse } from '../../../../api/protocolSignatureApi';

interface SignatureStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionId: string;
    protocolId: number;
    onCompleted: (signedDocumentUrl?: string) => void;
}

const SignatureStatusModal: React.FC<SignatureStatusModalProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       sessionId,
                                                                       protocolId,
                                                                       onCompleted
                                                                   }) => {
    const [status, setStatus] = useState<ProtocolSignatureStatusResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isOpen && sessionId) {
            loadStatus();
            startPolling();
        }

        return () => {
            stopPolling();
        };
    }, [isOpen, sessionId]);

    const loadStatus = async () => {
        try {
            setError(null);
            const statusData = await protocolSignatureApi.getSignatureStatus(sessionId);
            setStatus(statusData);

            if (statusData.status === 'COMPLETED') {
                setIsCompleted(true);
                stopPolling();
                setTimeout(() => {
                    onCompleted(statusData.signedDocumentUrl);
                }, 2000); // Delay to show success state
            } else if (statusData.status === 'EXPIRED' || statusData.status === 'CANCELLED' || statusData.status === 'ERROR') {
                stopPolling();
            }
        } catch (err) {
            console.error('Error loading signature status:', err);
            setError('Nie udało się pobrać statusu podpisu');
        } finally {
            setLoading(false);
        }
    };

    const startPolling = () => {
        intervalRef.current = setInterval(loadStatus, 3000); // Poll every 3 seconds
    };

    const stopPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const handleCancel = async () => {
        try {
            await protocolSignatureApi.cancelSignatureSession(sessionId, 'Anulowane przez użytkownika');
            onClose();
        } catch (err) {
            console.error('Error cancelling signature session:', err);
            onClose(); // Close anyway
        }
    };

    const handleDownload = async () => {
        if (!status?.signedDocumentUrl) return;

        try {
            const blob = await protocolSignatureApi.getSignedDocument(sessionId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `protokol-${protocolId}-podpisany.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading signed document:', err);
        }
    };

    const getStatusInfo = () => {
        if (!status) return null;

        switch (status.status) {
            case 'PENDING':
                return {
                    icon: <FaClock />,
                    title: 'Przygotowywanie żądania',
                    description: 'Inicjalizacja procesu podpisu...',
                    color: '#3b82f6',
                    showSpinner: true
                };
            case 'GENERATING_PDF':
                return {
                    icon: <FaSpinner />,
                    title: 'Generowanie dokumentu',
                    description: 'Przygotowywanie protokołu do podpisu...',
                    color: '#3b82f6',
                    showSpinner: true
                };
            case 'SENT_TO_TABLET':
                return {
                    icon: <FaTabletAlt />,
                    title: 'Wysłano do tableta',
                    description: 'Żądanie podpisu zostało wysłane. Oczekiwanie na reakcję klienta...',
                    color: '#8b5cf6',
                    showSpinner: true
                };
            case 'VIEWING_DOCUMENT':
                return {
                    icon: <FaTabletAlt />,
                    title: 'Klient przegląda dokument',
                    description: 'Klient otworzył protokół na tablecie...',
                    color: '#8b5cf6',
                    showSpinner: true
                };
            case 'SIGNING_IN_PROGRESS':
                return {
                    icon: <FaSignature />,
                    title: 'Trwa składanie podpisu',
                    description: 'Klient podpisuje dokument na tablecie...',
                    color: '#8b5cf6',
                    showSpinner: true
                };
            case 'COMPLETED':
                return {
                    icon: <FaCheck />,
                    title: 'Podpis złożony!',
                    description: 'Protokół został pomyślnie podpisany przez klienta.',
                    color: '#10b981',
                    showSpinner: false
                };
            case 'EXPIRED':
                return {
                    icon: <FaClock />,
                    title: 'Czas minął',
                    description: 'Żądanie podpisu wygasło. Możesz wysłać nowe żądanie.',
                    color: '#f59e0b',
                    showSpinner: false
                };
            case 'CANCELLED':
                return {
                    icon: <FaExclamationTriangle />,
                    title: 'Anulowano',
                    description: 'Żądanie podpisu zostało anulowane.',
                    color: '#ef4444',
                    showSpinner: false
                };
            case 'ERROR':
                return {
                    icon: <FaExclamationTriangle />,
                    title: 'Wystąpił błąd',
                    description: 'Nie udało się przetworzyć żądania podpisu.',
                    color: '#ef4444',
                    showSpinner: false
                };
            default:
                return {
                    icon: <FaSpinner />,
                    title: 'Przetwarzanie...',
                    description: 'Trwa przetwarzanie żądania podpisu.',
                    color: '#6b7280',
                    showSpinner: true
                };
        }
    };

    if (!isOpen) return null;

    const statusInfo = getStatusInfo();

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <SignatureIcon>
                            <FaSignature />
                        </SignatureIcon>
                        <HeaderText>
                            <ModalTitle>Status podpisu cyfrowego</ModalTitle>
                            <ModalSubtitle>Protokół #{protocolId}</ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    {loading ? (
                        <LoadingSection>
                            <LoadingSpinner>
                                <FaSpinner className="spinner" />
                            </LoadingSpinner>
                            <LoadingMessage>Sprawdzanie statusu...</LoadingMessage>
                        </LoadingSection>
                    ) : error ? (
                        <ErrorSection>
                            <ErrorIcon>
                                <FaExclamationTriangle />
                            </ErrorIcon>
                            <ErrorMessage>{error}</ErrorMessage>
                        </ErrorSection>
                    ) : statusInfo ? (
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

                                {status?.signedAt && (
                                    <SignedAtInfo>
                                        Podpisano: {new Date(status.signedAt).toLocaleString('pl-PL')}
                                    </SignedAtInfo>
                                )}
                            </StatusContent>

                            {status?.status === 'COMPLETED' && (
                                <CompletedActions>
                                    <SuccessMessage>
                                        <FaCheck />
                                        Protokół został pomyślnie podpisany!
                                    </SuccessMessage>

                                    {status.signedDocumentUrl && (
                                        <DownloadButton onClick={handleDownload}>
                                            <FaDownload />
                                            Pobierz podpisany protokół
                                        </DownloadButton>
                                    )}
                                </CompletedActions>
                            )}

                            {status?.timestamp && (
                                <TimestampInfo>
                                    Ostatnia aktualizacja: {new Date(status.timestamp).toLocaleString('pl-PL')}
                                </TimestampInfo>
                            )}
                        </StatusSection>
                    ) : null}
                </ModalBody>

                <ModalFooter>
                    <ButtonGroup>
                        {status?.status && ['PENDING', 'SENT_TO_TABLET', 'VIEWING_DOCUMENT', 'SIGNING_IN_PROGRESS'].includes(status.status) ? (
                            <CancelButton onClick={handleCancel}>
                                Anuluj żądanie
                            </CancelButton>
                        ) : null}

                        <CloseModalButton onClick={onClose}>
                            {isCompleted ? 'Zamknij' : 'OK'}
                        </CloseModalButton>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components dla SignatureStatusModal
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
   z-index: 1002;
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

const LoadingSection = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: 16px;
   padding: 24px 0;
`;

const LoadingSpinner = styled.div`
   .spinner {
       animation: spin 1s linear infinite;
       font-size: 24px;
       color: #1a365d;
   }

   @keyframes spin {
       from { transform: rotate(0deg); }
       to { transform: rotate(360deg); }
   }
`;

const LoadingMessage = styled.div`
   color: #475569;
   font-size: 14px;
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

const TimestampInfo = styled.div`
   font-size: 12px;
   color: #94a3b8;
   font-style: italic;
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

export default SignatureStatusModal;