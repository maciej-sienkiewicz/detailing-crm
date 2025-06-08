// src/pages/Protocols/shared/modals/TabletSignatureRequestModal.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTabletAlt, FaSignature, FaTimes, FaSpinner, FaCheck, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import { tabletsApi, TabletDevice } from '../../../../api/tabletsApi';
import { protocolSignatureApi, ProtocolSignatureRequest } from '../../../../api/protocolSignatureApi';

interface TabletSignatureRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    protocolId: number;
    customerName: string;
    onSignatureRequested: (sessionId: string) => void;
}

const TabletSignatureRequestModal: React.FC<TabletSignatureRequestModalProps> = ({
                                                                                     isOpen,
                                                                                     onClose,
                                                                                     protocolId,
                                                                                     customerName,
                                                                                     onSignatureRequested
                                                                                 }) => {
    const [tablets, setTablets] = useState<TabletDevice[]>([]);
    const [selectedTabletId, setSelectedTabletId] = useState<string>('');
    const [instructions, setInstructions] = useState<string>('Proszę podpisać protokół przyjęcia pojazdu');
    const [timeoutMinutes, setTimeoutMinutes] = useState<number>(15);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Ładowanie listy tabletów
    useEffect(() => {
        if (isOpen) {
            loadTablets();
        }
    }, [isOpen]);

    const loadTablets = async () => {
        try {
            setLoading(true);
            setError(null);

            const tabletsData = await tabletsApi.getTablets();
            const onlineTablets = tabletsData.filter(tablet => tablet.isOnline);

            setTablets(onlineTablets);

            // Auto-select first online tablet
            if (onlineTablets.length > 0) {
                setSelectedTabletId(onlineTablets[0].id);
            }

            if (onlineTablets.length === 0) {
                setError('Brak dostępnych tabletów online. Sprawdź czy tablety są podłączone i sparowane.');
            }
        } catch (err) {
            console.error('Error loading tablets:', err);
            setError('Nie udało się załadować listy tabletów');
        } finally {
            setLoading(false);
        }
    };

    const handleSendSignatureRequest = async () => {
        if (!selectedTabletId) {
            setError('Wybierz tablet');
            return;
        }

        try {
            setSending(true);
            setError(null);

            const request: ProtocolSignatureRequest = {
                protocolId,
                tabletId: selectedTabletId,
                customerName,
                instructions: instructions.trim() || undefined,
                timeoutMinutes
            };

            const response = await protocolSignatureApi.requestProtocolSignature(request);

            if (response.success) {
                onSignatureRequested(response.sessionId);
                onClose();
            } else {
                setError(response.message || 'Nie udało się wysłać żądania podpisu');
            }
        } catch (err) {
            console.error('Error sending signature request:', err);
            setError(err instanceof Error ? err.message : 'Nie udało się wysłać żądania podpisu');
        } finally {
            setSending(false);
        }
    };

    const handleClose = () => {
        if (!sending) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <SignatureIcon>
                            <FaSignature />
                        </SignatureIcon>
                        <HeaderText>
                            <ModalTitle>Żądanie podpisu cyfrowego</ModalTitle>
                            <ModalSubtitle>Protokół #{protocolId} - {customerName}</ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={handleClose} disabled={sending}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    {loading ? (
                        <LoadingSection>
                            <LoadingSpinner>
                                <FaSpinner className="spinner" />
                            </LoadingSpinner>
                            <LoadingMessage>Ładowanie dostępnych tabletów...</LoadingMessage>
                        </LoadingSection>
                    ) : error && tablets.length === 0 ? (
                        <ErrorSection>
                            <ErrorIcon>
                                <FaExclamationTriangle />
                            </ErrorIcon>
                            <ErrorMessage>{error}</ErrorMessage>
                            <RetryButton onClick={loadTablets}>
                                Spróbuj ponownie
                            </RetryButton>
                        </ErrorSection>
                    ) : (
                        <>
                            <Section>
                                <SectionTitle>Wybierz tablet</SectionTitle>
                                <TabletsList>
                                    {tablets.map(tablet => (
                                        <TabletItem
                                            key={tablet.id}
                                            selected={selectedTabletId === tablet.id}
                                            onClick={() => setSelectedTabletId(tablet.id)}
                                        >
                                            <TabletIcon>
                                                <FaTabletAlt />
                                            </TabletIcon>
                                            <TabletInfo>
                                                <TabletName>{tablet.friendlyName}</TabletName>
                                                <TabletDetails>
                                                    Status: Online • Lokalizacja: {tablet.workstationId || 'Brak'}
                                                </TabletDetails>
                                            </TabletInfo>
                                            <StatusIndicator online={tablet.isOnline} />
                                        </TabletItem>
                                    ))}
                                </TabletsList>
                            </Section>

                            <Section>
                                <SectionTitle>Instrukcje dla klienta</SectionTitle>
                                <InstructionsInput
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    placeholder="Wprowadź instrukcje, które zobacży klient na tablecie"
                                    rows={3}
                                />
                            </Section>

                            <Section>
                                <SectionTitle>Limit czasu (minuty)</SectionTitle>
                                <TimeoutContainer>
                                    <TimeoutIcon>
                                        <FaClock />
                                    </TimeoutIcon>
                                    <TimeoutInput
                                        type="number"
                                        min={5}
                                        max={30}
                                        value={timeoutMinutes}
                                        onChange={(e) => setTimeoutMinutes(Number(e.target.value))}
                                    />
                                    <TimeoutLabel>minut</TimeoutLabel>
                                </TimeoutContainer>
                                <TimeoutDescription>
                                    Po tym czasie żądanie podpisu wygaśnie automatycznie
                                </TimeoutDescription>
                            </Section>

                            {error && (
                                <ErrorBanner>
                                    <FaExclamationTriangle />
                                    {error}
                                </ErrorBanner>
                            )}
                        </>
                    )}
                </ModalBody>

                <ModalFooter>
                    <ButtonGroup>
                        <SecondaryButton onClick={handleClose} disabled={sending}>
                            Anuluj
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={handleSendSignatureRequest}
                            disabled={loading || !selectedTabletId || sending || tablets.length === 0}
                        >
                            {sending ? (
                                <>
                                    <FaSpinner className="spinner" />
                                    Wysyłanie...
                                </>
                            ) : (
                                <>
                                    <FaSignature />
                                    Wyślij żądanie podpisu
                                </>
                            )}
                        </PrimaryButton>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
const corporateTheme = {
    primary: '#1a365d',
    primaryLight: '#2c5aa0',
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
        error: '#dc2626',
        errorLight: '#fef2f2',
        warning: '#d97706',
        warningLight: '#fffbeb'
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
    z-index: 1001;
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
    width: 600px;
    max-width: 95%;
    max-height: 90vh;
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
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.md};
`;

const SignatureIcon = styled.div`
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
`;

const ModalSubtitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${corporateTheme.text.secondary};
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    color: ${corporateTheme.text.tertiary};
    cursor: pointer;
    border-radius: ${corporateTheme.radius.sm};
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
        background: ${corporateTheme.surfaceHover};
        color: ${corporateTheme.text.primary};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const ModalBody = styled.div`
    padding: ${corporateTheme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.lg};
    overflow-y: auto;
    flex: 1;
`;

const LoadingSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${corporateTheme.spacing.md};
    padding: ${corporateTheme.spacing.xl} 0;
`;

const LoadingSpinner = styled.div`
    .spinner {
        animation: spin 1s linear infinite;
        font-size: 24px;
        color: ${corporateTheme.primary};
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const LoadingMessage = styled.div`
    color: ${corporateTheme.text.secondary};
    font-size: 14px;
`;

const ErrorSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${corporateTheme.spacing.md};
    padding: ${corporateTheme.spacing.xl} 0;
    text-align: center;
`;

const ErrorIcon = styled.div`
    font-size: 32px;
    color: ${corporateTheme.status.error};
`;

const ErrorMessage = styled.div`
    color: ${corporateTheme.status.error};
    font-size: 14px;
    line-height: 1.5;
`;

const RetryButton = styled.button`
    padding: ${corporateTheme.spacing.sm} ${corporateTheme.spacing.md};
    background: ${corporateTheme.primary};
    color: white;
    border: none;
    border-radius: ${corporateTheme.radius.sm};
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: ${corporateTheme.primaryLight};
    }
`;

const Section = styled.div`
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

const TabletsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.sm};
`;

const TabletItem = styled.div<{ selected: boolean }>`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.md};
    padding: ${corporateTheme.spacing.md};
    border: 2px solid ${props => props.selected ? corporateTheme.primary : corporateTheme.borderLight};
    border-radius: ${corporateTheme.radius.md};
    cursor: pointer;
    transition: all 0.15s ease;
    background: ${props => props.selected ? corporateTheme.primary + '08' : corporateTheme.surface};

    &:hover {
        border-color: ${corporateTheme.primary};
        background: ${corporateTheme.primary + '08'};
    }
`;

const TabletIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${corporateTheme.primary + '15'};
    color: ${corporateTheme.primary};
    border-radius: ${corporateTheme.radius.sm};
    font-size: 14px;
    flex-shrink: 0;
`;

const TabletInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.xs};
`;

const TabletName = styled.div`
    font-weight: 600;
    color: ${corporateTheme.text.primary};
    font-size: 14px;
`;

const TabletDetails = styled.div`
    font-size: 12px;
    color: ${corporateTheme.text.tertiary};
`;

const StatusIndicator = styled.div<{ online: boolean }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.online ? corporateTheme.status.success : corporateTheme.status.error};
    flex-shrink: 0;
`;

const InstructionsInput = styled.textarea`
    width: 100%;
    min-height: 80px;
    padding: ${corporateTheme.spacing.md};
    border: 1px solid ${corporateTheme.border};
    border-radius: ${corporateTheme.radius.md};
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    transition: border-color 0.15s ease;

    &:focus {
        outline: none;
        border-color: ${corporateTheme.primary};
    }

    &::placeholder {
        color: ${corporateTheme.text.muted};
    }
`;

const TimeoutContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.sm};
`;

const TimeoutIcon = styled.div`
    color: ${corporateTheme.text.tertiary};
    font-size: 14px;
`;

const TimeoutInput = styled.input`
    width: 80px;
    padding: ${corporateTheme.spacing.sm};
    border: 1px solid ${corporateTheme.border};
    border-radius: ${corporateTheme.radius.sm};
    font-size: 14px;
    text-align: center;

    &:focus {
        outline: none;
        border-color: ${corporateTheme.primary};
    }
`;

const TimeoutLabel = styled.span`
    font-size: 14px;
    color: ${corporateTheme.text.secondary};
`;

const TimeoutDescription = styled.div`
    font-size: 12px;
    color: ${corporateTheme.text.tertiary};
    font-style: italic;
`;

const ErrorBanner = styled.div`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.sm};
    padding: ${corporateTheme.spacing.md};
    background: ${corporateTheme.status.errorLight};
    border: 1px solid ${corporateTheme.status.error};
    border-radius: ${corporateTheme.radius.md};
    color: ${corporateTheme.status.error};
    font-size: 14px;
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

    &:hover:not(:disabled) {
        background: ${corporateTheme.surfaceHover};
        border-color: ${corporateTheme.text.muted};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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
    min-width: 180px;

    &:hover:not(:disabled) {
        background: ${corporateTheme.primaryLight};
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

export default TabletSignatureRequestModal;