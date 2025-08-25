import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaSignature,
    FaUser,
    FaCar,
    FaTabletAlt,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationTriangle,
    FaDownload,
    FaEye,
    FaRedo,
    FaTimes,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaFileAlt
} from 'react-icons/fa';

interface SignatureSessionDetails {
    id: string;
    sessionId: string;
    tenantId: string;
    workstationId: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    vehicleInfo: {
        make: string;
        model: string;
        licensePlate: string;
        vin?: string;
        year?: number;
        color?: string;
    };
    serviceType: string;
    documentType: string;
    status: 'PENDING' | 'SENT_TO_TABLET' | 'SIGNED' | 'EXPIRED' | 'CANCELLED';
    expiresAt: string;
    createdAt: string;
    signedAt?: string;
    assignedTabletId?: string;
    signatureImageUrl?: string;
    location?: string;
    notes?: string;
    metadata?: {
        ipAddress?: string;
        userAgent?: string;
        signatureDuration?: number;
    };
}

interface TabletInfo {
    id: string;
    friendlyName: string;
    locationId: string;
    isOnline: boolean;
}

interface SessionDetailsModalProps {
    session: SignatureSessionDetails;
    tablet?: TabletInfo;
    onClose: () => void;
    onRetry?: (sessionId: string) => void;
    onCancel?: (sessionId: string) => void;
}

const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
                                                                     session,
                                                                     tablet,
                                                                     onClose,
                                                                     onRetry,
                                                                     onCancel
                                                                 }) => {
    const [showSignature, setShowSignature] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<string>('');

    useEffect(() => {
        if (session.status === 'SENT_TO_TABLET') {
            const interval = setInterval(() => {
                const now = new Date().getTime();
                const expiry = new Date(session.expiresAt).getTime();
                const difference = expiry - now;

                if (difference > 0) {
                    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                    setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
                } else {
                    setTimeRemaining('Wygasła');
                    clearInterval(interval);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [session.expiresAt, session.status]);

    const getStatusInfo = () => {
        switch (session.status) {
            case 'PENDING':
                return {
                    icon: <FaClock />,
                    color: '#f59e0b',
                    label: 'Oczekuje na wysłanie',
                    description: 'Sesja została utworzona i oczekuje na przypisanie do tabletu.'
                };
            case 'SENT_TO_TABLET':
                return {
                    icon: <FaTabletAlt />,
                    color: '#3b82f6',
                    label: 'Wysłano do tabletu',
                    description: 'Żądanie podpisu zostało wysłane do tabletu i oczekuje na podpis klienta.'
                };
            case 'SIGNED':
                return {
                    icon: <FaCheckCircle />,
                    color: '#10b981',
                    label: 'Podpisano pomyślnie',
                    description: 'Klient złożył podpis cyfrowy. Dokument jest gotowy.'
                };
            case 'EXPIRED':
                return {
                    icon: <FaTimesCircle />,
                    color: '#6b7280',
                    label: 'Sesja wygasła',
                    description: 'Czas na złożenie podpisu minął. Można utworzyć nową sesję.'
                };
            case 'CANCELLED':
                return {
                    icon: <FaExclamationTriangle />,
                    color: '#ef4444',
                    label: 'Anulowano',
                    description: 'Sesja została anulowana przez użytkownika.'
                };
            default:
                return {
                    icon: <FaClock />,
                    color: '#6b7280',
                    label: 'Nieznany status',
                    description: ''
                };
        }
    };

    const statusInfo = getStatusInfo();

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const downloadSignature = () => {
        if (session.signatureImageUrl) {
            const link = document.createElement('a');
            link.href = session.signatureImageUrl;
            link.download = `podpis-${session.customerName}-${session.id}.png`;
            link.click();
        }
    };

    const isSessionSentToTablet = (status: string): boolean => {
        return ['SENT_TO_TABLET', 'SIGNED', 'EXPIRED', 'CANCELLED'].includes(status);
    };

    return (
        <ModalOverlay onClick={onClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <HeaderInfo>
                        <ModalTitle>
                            <FaSignature />
                            Szczegóły Sesji Podpisu
                        </ModalTitle>
                        <SessionId>ID: {session.sessionId}</SessionId>
                    </HeaderInfo>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalContent>
                    {/* Status Section */}
                    <StatusSection>
                        <StatusHeader>
                            <StatusIndicator color={statusInfo.color}>
                                {statusInfo.icon}
                                {statusInfo.label}
                            </StatusIndicator>
                            {session.status === 'SENT_TO_TABLET' && timeRemaining && (
                                <TimeRemaining>
                                    <FaClock />
                                    Pozostało: {timeRemaining}
                                </TimeRemaining>
                            )}
                        </StatusHeader>
                        <StatusDescription>{statusInfo.description}</StatusDescription>
                    </StatusSection>

                    {/* Main Content Grid */}
                    <ContentGrid>
                        {/* Customer Information */}
                        <InfoCard>
                            <CardHeader>
                                <CardTitle>
                                    <FaUser />
                                    Informacje o kliencie
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <InfoRow>
                                    <InfoLabel>Imię i nazwisko:</InfoLabel>
                                    <InfoValue>{session.customerName}</InfoValue>
                                </InfoRow>
                                {session.customerEmail && (
                                    <InfoRow>
                                        <InfoLabel>Email:</InfoLabel>
                                        <InfoValue>{session.customerEmail}</InfoValue>
                                    </InfoRow>
                                )}
                                {session.customerPhone && (
                                    <InfoRow>
                                        <InfoLabel>Telefon:</InfoLabel>
                                        <InfoValue>{session.customerPhone}</InfoValue>
                                    </InfoRow>
                                )}
                            </CardContent>
                        </InfoCard>

                        {/* Vehicle Information */}
                        <InfoCard>
                            <CardHeader>
                                <CardTitle>
                                    <FaCar />
                                    Informacje o pojeździe
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <InfoRow>
                                    <InfoLabel>Pojazd:</InfoLabel>
                                    <InfoValue>
                                        {session.vehicleInfo.make} {session.vehicleInfo.model}
                                        {session.vehicleInfo.year && ` (${session.vehicleInfo.year})`}
                                    </InfoValue>
                                </InfoRow>
                                <InfoRow>
                                    <InfoLabel>Nr rejestracyjny:</InfoLabel>
                                    <LicensePlate>{session.vehicleInfo.licensePlate}</LicensePlate>
                                </InfoRow>
                                {session.vehicleInfo.vin && (
                                    <InfoRow>
                                        <InfoLabel>VIN:</InfoLabel>
                                        <InfoValue style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                                            {session.vehicleInfo.vin}
                                        </InfoValue>
                                    </InfoRow>
                                )}
                                {session.vehicleInfo.color && (
                                    <InfoRow>
                                        <InfoLabel>Kolor:</InfoLabel>
                                        <InfoValue>{session.vehicleInfo.color}</InfoValue>
                                    </InfoRow>
                                )}
                            </CardContent>
                        </InfoCard>

                        {/* Service Information */}
                        <InfoCard>
                            <CardHeader>
                                <CardTitle>
                                    <FaFileAlt />
                                    Informacje o usłudze
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <InfoRow>
                                    <InfoLabel>Rodzaj usługi:</InfoLabel>
                                    <InfoValue>{session.serviceType}</InfoValue>
                                </InfoRow>
                                <InfoRow>
                                    <InfoLabel>Typ dokumentu:</InfoLabel>
                                    <InfoValue>{session.documentType}</InfoValue>
                                </InfoRow>
                                {session.location && (
                                    <InfoRow>
                                        <InfoLabel>Lokalizacja:</InfoLabel>
                                        <InfoValue>
                                            <FaMapMarkerAlt style={{ marginRight: '6px' }} />
                                            {session.location}
                                        </InfoValue>
                                    </InfoRow>
                                )}
                            </CardContent>
                        </InfoCard>

                        {/* Tablet Information */}
                        {tablet && (
                            <InfoCard>
                                <CardHeader>
                                    <CardTitle>
                                        <FaTabletAlt />
                                        Przypisany tablet
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <InfoRow>
                                        <InfoLabel>Nazwa:</InfoLabel>
                                        <InfoValue>{tablet.friendlyName}</InfoValue>
                                    </InfoRow>
                                    <InfoRow>
                                        <InfoLabel>Status:</InfoLabel>
                                        <TabletStatus online={tablet.isOnline}>
                                            {tablet.isOnline ? 'Online' : 'Offline'}
                                        </TabletStatus>
                                    </InfoRow>
                                </CardContent>
                            </InfoCard>
                        )}
                    </ContentGrid>

                    {/* Timeline */}
                    <TimelineSection>
                        <SectionTitle>Historia sesji</SectionTitle>
                        <Timeline>
                            <TimelineItem completed>
                                <TimelineIcon color="#10b981">
                                    <FaCheckCircle />
                                </TimelineIcon>
                                <TimelineContent>
                                    <TimelineTitle>Sesja utworzona</TimelineTitle>
                                    <TimelineTime>
                                        <FaCalendarAlt />
                                        {formatDateTime(session.createdAt)}
                                    </TimelineTime>
                                </TimelineContent>
                            </TimelineItem>

                            {isSessionSentToTablet(session.status) && (
                                <TimelineItem completed={true}>
                                    <TimelineIcon color="#3b82f6">
                                        <FaTabletAlt />
                                    </TimelineIcon>
                                    <TimelineContent>
                                        <TimelineTitle>Wysłano do tabletu</TimelineTitle>
                                        <TimelineTime>
                                            <FaCalendarAlt />
                                            Wysłano
                                        </TimelineTime>
                                    </TimelineContent>
                                </TimelineItem>
                            )}

                            {session.signedAt && (
                                <TimelineItem completed>
                                    <TimelineIcon color="#10b981">
                                        <FaSignature />
                                    </TimelineIcon>
                                    <TimelineContent>
                                        <TimelineTitle>Podpis złożony</TimelineTitle>
                                        <TimelineTime>
                                            <FaCalendarAlt />
                                            {formatDateTime(session.signedAt)}
                                        </TimelineTime>
                                        {session.metadata?.signatureDuration && (
                                            <TimelineSubtext>
                                                Czas podpisu: {session.metadata.signatureDuration}s
                                            </TimelineSubtext>
                                        )}
                                    </TimelineContent>
                                </TimelineItem>
                            )}
                        </Timeline>
                    </TimelineSection>

                    {/* Signature Preview */}
                    {session.signatureImageUrl && (
                        <SignatureSection>
                            <SectionTitle>Podpis cyfrowy</SectionTitle>
                            <SignaturePreview>
                                <SignatureImage
                                    src={session.signatureImageUrl}
                                    alt="Podpis cyfrowy"
                                    onClick={() => setShowSignature(true)}
                                />
                                <SignatureActions>
                                    <ActionButton onClick={() => setShowSignature(true)}>
                                        <FaEye />
                                        Podgląd
                                    </ActionButton>
                                    <ActionButton onClick={downloadSignature}>
                                        <FaDownload />
                                        Pobierz
                                    </ActionButton>
                                </SignatureActions>
                            </SignaturePreview>
                        </SignatureSection>
                    )}

                    {/* Notes */}
                    {session.notes && (
                        <NotesSection>
                            <SectionTitle>Uwagi</SectionTitle>
                            <NotesContent>{session.notes}</NotesContent>
                        </NotesSection>
                    )}

                    {/* Metadata */}
                    {session.metadata && (
                        <MetadataSection>
                            <SectionTitle>Informacje techniczne</SectionTitle>
                            <MetadataGrid>
                                {session.metadata.ipAddress && (
                                    <MetadataItem>
                                        <MetadataLabel>Adres IP:</MetadataLabel>
                                        <MetadataValue>{session.metadata.ipAddress}</MetadataValue>
                                    </MetadataItem>
                                )}
                                {session.metadata.userAgent && (
                                    <MetadataItem>
                                        <MetadataLabel>Przeglądarka:</MetadataLabel>
                                        <MetadataValue>{session.metadata.userAgent}</MetadataValue>
                                    </MetadataItem>
                                )}
                            </MetadataGrid>
                        </MetadataSection>
                    )}
                </ModalContent>

                {/* Actions */}
                <ModalActions>
                    <ActionButtonGroup>
                        {session.status === 'EXPIRED' && onRetry && (
                            <ActionButton primary onClick={() => onRetry(session.id)}>
                                <FaRedo />
                                Ponów żądanie
                            </ActionButton>
                        )}
                        {session.status === 'SENT_TO_TABLET' && onCancel && (
                            <ActionButton danger onClick={() => onCancel(session.id)}>
                                <FaTimesCircle />
                                Anuluj sesję
                            </ActionButton>
                        )}
                        <ActionButton onClick={onClose}>
                            Zamknij
                        </ActionButton>
                    </ActionButtonGroup>
                </ModalActions>

                {/* Full Signature Modal */}
                {showSignature && session.signatureImageUrl && (
                    <SignatureModal onClick={() => setShowSignature(false)}>
                        <SignatureModalContent onClick={e => e.stopPropagation()}>
                            <SignatureModalHeader>
                                <h3>Podpis cyfrowy - {session.customerName}</h3>
                                <CloseButton onClick={() => setShowSignature(false)}>
                                    <FaTimes />
                                </CloseButton>
                            </SignatureModalHeader>
                            <FullSignatureImage src={session.signatureImageUrl} alt="Podpis cyfrowy" />
                            <SignatureModalActions>
                                <ActionButton onClick={downloadSignature}>
                                    <FaDownload />
                                    Pobierz podpis
                                </ActionButton>
                            </SignatureModalActions>
                        </SignatureModalContent>
                    </SignatureModal>
                )}
            </Modal>
        </ModalOverlay>
    );
};

// Styled Components
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
`;

const Modal = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 1000px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ModalTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;

  svg {
    color: #3b82f6;
  }
`;

const SessionId = styled.div`
  font-size: 14px;
  color: #64748b;
  font-family: monospace;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ef4444;
    color: white;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StatusSection = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border-left: 4px solid #3b82f6;
`;

const StatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const StatusIndicator = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
`;

const TimeRemaining = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #ef4444;
  font-weight: 600;
`;

const StatusDescription = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
`;

const InfoCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;

  svg {
    color: #3b82f6;
  }
`;

const CardContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const InfoLabel = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  min-width: 120px;
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: #1e293b;
  font-weight: 600;
  text-align: right;
  flex: 1;
`;

const LicensePlate = styled.span`
  font-family: monospace;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  color: #1e293b;
  border: 1px solid #e2e8f0;
`;

const TabletStatus = styled.span<{ online: boolean }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.online ? '#059669' : '#dc2626'};
  background: ${props => props.online ? '#dcfce7' : '#fee2e2'};
`;

const TimelineSection = styled.div``;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
`;

const Timeline = styled.div`
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 16px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e2e8f0;
  }
`;

const TimelineItem = styled.div<{ completed: boolean }>`
  position: relative;
  padding-left: 56px;
  padding-bottom: 24px;
  
  &:last-child {
    padding-bottom: 0;
  }
`;

const TimelineIcon = styled.div<{ color: string }>`
  position: absolute;
  left: 0;
  top: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  z-index: 1;
`;

const TimelineContent = styled.div``;

const TimelineTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const TimelineTime = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
`;

const TimelineSubtext = styled.div`
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
`;

const SignatureSection = styled.div``;

const SignaturePreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
`;

const SignatureImage = styled.img`
  max-width: 100%;
  height: auto;
  max-height: 200px;
  object-fit: contain;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const SignatureActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const NotesSection = styled.div``;

const NotesContent = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  color: #374151;
  line-height: 1.6;
  border-left: 4px solid #3b82f6;
`;

const MetadataSection = styled.div``;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const MetadataItem = styled.div`
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const MetadataLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MetadataValue = styled.div`
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
  word-break: break-all;
`;

const ModalActions = styled.div`
  padding: 24px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 0 0 20px 20px;
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ActionButton = styled.button<{ primary?: boolean; danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    if (props.primary) {
        return `
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
      `;
    } else if (props.danger) {
        return `
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }
      `;
    } else {
        return `
        background: #f1f5f9;
        color: #64748b;
        border: 1px solid #e2e8f0;
        
        &:hover {
          background: #e2e8f0;
          color: #475569;
        }
      `;
    }
}}
`;

const SignatureModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  backdrop-filter: blur(4px);
`;

const SignatureModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 90%;
  max-height: 90%;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const SignatureModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
  }
`;

const FullSignatureImage = styled.img`
  display: block;
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  margin: 0 auto;
  padding: 24px;
`;

const SignatureModalActions = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  justify-content: center;
`;

export default SessionDetailsModal;