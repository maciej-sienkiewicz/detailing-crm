// src/pages/Protocols/details/modals/InvoiceSignatureRequestModal.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTabletAlt, FaSignature, FaTimes, FaSpinner, FaExclamationTriangle, FaClock, FaArrowRight, FaFileInvoice } from 'react-icons/fa';
import { tabletsApi, TabletDevice } from '../../../../api/tabletsApi';
import { invoiceSignatureApi, InvoiceSignatureRequest } from '../../../../api/invoiceSignatureApi';

interface InvoiceSignatureRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceId: string;
    customerName: string;
    onSignatureRequested: (sessionId: string) => void;
}

const InvoiceSignatureRequestModal: React.FC<InvoiceSignatureRequestModalProps> = ({
                                                                                       isOpen,
                                                                                       onClose,
                                                                                       invoiceId,
                                                                                       customerName,
                                                                                       onSignatureRequested
                                                                                   }) => {
    const [tablets, setTablets] = useState<TabletDevice[]>([]);
    const [selectedTabletId, setSelectedTabletId] = useState<string>('');
    const [signatureTitle, setSignatureTitle] = useState<string>('Podpis faktury');
    const [instructions, setInstructions] = useState<string>('Proszę podpisać fakturę za otrzymane usługi');
    const [timeoutMinutes, setTimeoutMinutes] = useState<number>(10);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showContinueOption, setShowContinueOption] = useState(false);

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
            setShowContinueOption(false);

            console.log('🔧 Loading tablets for invoice signature request...');

            const tabletsData = await tabletsApi.getTablets();
            const onlineTablets = tabletsData.filter(tablet => tablet.isOnline);

            console.log(`📊 Found ${tabletsData.length} tablets, ${onlineTablets.length} online`);

            setTablets(onlineTablets);

            // Auto-select first online tablet
            if (onlineTablets.length > 0) {
                setSelectedTabletId(onlineTablets[0].id);
            } else {
                console.warn('⚠️ No tablets available online');
                setError('Brak dostępnych tabletów online. Sprawdź czy tablety są podłączone i sparowane.');
                setShowContinueOption(true);
            }
        } catch (err) {
            console.error('❌ Error loading tablets:', err);
            setError('Nie udało się załadować listy tabletów');
            setShowContinueOption(true);
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

            console.log('🔧 Sending invoice signature request to tablet:', selectedTabletId);

            const request: InvoiceSignatureRequest = {
                tabletId: selectedTabletId,
                customerName,
                signatureTitle: signatureTitle.trim() || 'Podpis faktury',
                instructions: instructions.trim() || undefined,
                timeoutMinutes
            };

            const response = await invoiceSignatureApi.requestInvoiceSignature(invoiceId, request);

            if (response.success) {
                console.log('✅ Invoice signature request sent successfully:', response.sessionId);
                onSignatureRequested(response.sessionId);
                onClose();
            } else {
                console.error('❌ Failed to send invoice signature request:', response.message);
                setError(response.message || 'Nie udało się wysłać żądania podpisu');
                setShowContinueOption(true);
            }
        } catch (err) {
            console.error('❌ Error sending invoice signature request:', err);
            setError(err instanceof Error ? err.message : 'Nie udało się wysłać żądania podpisu');
            setShowContinueOption(true);
        } finally {
            setSending(false);
        }
    };

    const handleContinueWithoutSignature = () => {
        console.log('🔧 Continuing invoice process without digital signature...');
        onClose(); // To spowoduje kontynuację procesu bez podpisu
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
                            <FaFileInvoice />
                        </SignatureIcon>
                        <HeaderText>
                            <ModalTitle>Żądanie podpisu faktury</ModalTitle>
                            <ModalSubtitle>Faktura #{invoiceId} - {customerName}</ModalSubtitle>
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
                            <ErrorDescription>
                                Możesz kontynuować proces bez podpisu cyfrowego lub spróbować ponownie.
                            </ErrorDescription>
                            <ErrorActions>
                                <RetryButton onClick={loadTablets} disabled={loading}>
                                    {loading ? <FaSpinner className="spinner" /> : 'Spróbuj ponownie'}
                                </RetryButton>
                                <ContinueButton onClick={handleContinueWithoutSignature}>
                                    <FaArrowRight />
                                    Kontynuuj bez podpisu
                                </ContinueButton>
                            </ErrorActions>
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
                                <SectionTitle>Tytuł podpisu</SectionTitle>
                                <TitleInput
                                    value={signatureTitle}
                                    onChange={(e) => setSignatureTitle(e.target.value)}
                                    placeholder="Np. Podpis faktury, Potwierdzenie odbioru"
                                />
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
                                    Po tym czasie żądanie podpisu faktury wygaśnie automatycznie
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
                        {tablets.length === 0 && !loading ? (
                            <>
                                <SecondaryButton onClick={handleClose} disabled={sending}>
                                    Anuluj proces
                                </SecondaryButton>
                                <ContinueWithoutButton onClick={handleContinueWithoutSignature} disabled={sending}>
                                    <FaArrowRight />
                                    Kontynuuj bez podpisu
                                </ContinueWithoutButton>
                            </>
                        ) : (
                            <>
                                <SecondaryButton onClick={handleClose} disabled={sending}>
                                    Anuluj
                                </SecondaryButton>
                                {showContinueOption && (
                                    <ContinueWithoutButton onClick={handleContinueWithoutSignature} disabled={sending}>
                                        <FaArrowRight />
                                        Kontynuuj bez podpisu
                                    </ContinueWithoutButton>
                                )}
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
                            </>
                        )}
                    </ButtonGroup>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Professional Brand Theme (pozostaje bez zmian)
const brandTheme = {
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
        error: '#dc2626',
        errorLight: '#fef2f2',
        warning: '#d97706'
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

// Styled Components (pozostają bez zmian - już zdefiniowane w poprzednim artefakcie)
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
    z-index: 1201;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.15s ease-out;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.lg};
    width: 600px;
    max-width: 95%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid ${brandTheme.border};
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

// Tutaj zdefiniowałbym wszystkie pozostałe styled components,
// ale dla zwięzłości przykładu przeskoczę je - są identyczne jak w poprzednim artefakcie

const ModalHeader = styled.div`
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceElevated};
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const SignatureIcon = styled.div`
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
`;

const ModalSubtitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${brandTheme.text.secondary};
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    color: ${brandTheme.text.tertiary};
    cursor: pointer;
    border-radius: ${brandTheme.radius.sm};
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.text.primary};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const ModalBody = styled.div`
    padding: ${brandTheme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
    overflow-y: auto;
    flex: 1;
`;

// ... (pozostałe styled components - identyczne jak w poprzednim artefakcie)

// Skrócone wersje dla przykładu
const LoadingSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.xl} 0;
`;

const LoadingSpinner = styled.div`
    .spinner {
        animation: spin 1s linear infinite;
        font-size: 24px;
        color: ${brandTheme.primary};
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const LoadingMessage = styled.div`
    color: ${brandTheme.text.secondary};
    font-size: 14px;
`;

const ErrorSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.xl} 0;
    text-align: center;
`;

const ErrorIcon = styled.div`
    font-size: 32px;
    color: ${brandTheme.status.error};
`;

const ErrorMessage = styled.div`
    color: ${brandTheme.status.error};
    font-size: 14px;
    line-height: 1.5;
    font-weight: 600;
`;

const ErrorDescription = styled.div`
    color: ${brandTheme.text.secondary};
    font-size: 13px;
    line-height: 1.5;
    font-style: italic;
`;

const ErrorActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    margin-top: ${brandTheme.spacing.md};
`;

const RetryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
        background: ${brandTheme.surfaceHover};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .spinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const ContinueButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: ${brandTheme.status.success};
    color: white;
    border: none;
    border-radius: ${brandTheme.radius.sm};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: ${brandTheme.status.success};
        opacity: 0.9;
        transform: translateY(-1px);
    }
`;

const Section = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const SectionTitle = styled.h3`
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const TabletsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const TabletItem = styled.div<{ selected: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md};
    border: 2px solid ${props => props.selected ? brandTheme.primary : brandTheme.borderLight};
    border-radius: ${brandTheme.radius.md};
    cursor: pointer;
    transition: all 0.15s ease;
    background: ${props => props.selected ? brandTheme.primary + '08' : brandTheme.surface};

    &:hover {
        border-color: ${brandTheme.primary};
        background: ${brandTheme.primary + '08'};
    }
`;

const TabletIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${brandTheme.primary + '15'};
    color: ${brandTheme.primary};
    border-radius: ${brandTheme.radius.sm};
    font-size: 14px;
    flex-shrink: 0;
`;

const TabletInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const TabletName = styled.div`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 14px;
`;

const TabletDetails = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.tertiary};
`;

const StatusIndicator = styled.div<{ online: boolean }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.online ? brandTheme.status.success : brandTheme.status.error};
    flex-shrink: 0;
`;

const TitleInput = styled.input`
    width: 100%;
    padding: ${brandTheme.spacing.md};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.15s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
    }
`;

const InstructionsInput = styled.textarea`
    width: 100%;
    min-height: 80px;
    padding: ${brandTheme.spacing.md};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    transition: border-color 0.15s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
    }
`;

const TimeoutContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const TimeoutIcon = styled.div`
    color: ${brandTheme.text.tertiary};
    font-size: 14px;
`;

const TimeoutInput = styled.input`
    width: 80px;
    padding: ${brandTheme.spacing.sm};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    font-size: 14px;
    text-align: center;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
    }
`;

const TimeoutLabel = styled.span`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
`;

const TimeoutDescription = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.tertiary};
    font-style: italic;
`;

const ErrorBanner = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.status.errorLight};
    border: 1px solid ${brandTheme.status.error};
    border-radius: ${brandTheme.radius.md};
    color: ${brandTheme.status.error};
    font-size: 14px;
`;

const ModalFooter = styled.div`
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-top: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceElevated};
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.sm};
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    min-height: 40px;

    &:hover:not(:disabled) {
        background: ${brandTheme.surfaceHover};
        border-color: ${brandTheme.text.muted};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const ContinueWithoutButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: ${brandTheme.status.success};
    color: white;
    border: 1px solid ${brandTheme.status.success};
    border-radius: ${brandTheme.radius.sm};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    min-height: 40px;
    min-width: 160px;

    &:hover:not(:disabled) {
        background: ${brandTheme.status.success};
        opacity: 0.9;
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const PrimaryButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.lg};
    background: ${brandTheme.primary};
    color: white;
    border: 1px solid ${brandTheme.primary};
    border-radius: ${brandTheme.radius.sm};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    min-height: 40px;
    min-width: 180px;

    &:hover:not(:disabled) {
        background: ${brandTheme.primaryLight};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: ${brandTheme.text.muted};
        border-color: ${brandTheme.text.muted};
    }

    .spinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

export default InvoiceSignatureRequestModal;