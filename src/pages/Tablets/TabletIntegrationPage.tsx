// src/pages/Tablets/TabletIntegrationPage.tsx
import React, {useCallback, useState, useEffect, useRef} from 'react';
import styled from 'styled-components';
import TabletManagementDashboard from './TabletManagementDashboard';
import SessionDetailsModal from './components/SessionDetailsModal';
import {useTablets} from '../../hooks/useTablets';
import {tabletsApi} from '../../api/tabletsApi';
import {FaExclamationTriangle, FaPlus, FaSpinner, FaTabletAlt, FaTimes, FaWifi} from 'react-icons/fa';

// Professional Brand Theme - Consistent with Finance module
const brandTheme = {
    // Primary Colors - Professional Blue Palette
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',

    // Surface Colors - Clean & Minimal
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',

    // Typography Colors
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },

    // Border Colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',

    // Status Colors - Automotive Grade
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

    // Shadows - Professional Depth
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    // Spacing Scale
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    // Border Radius
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    }
};

// Get company ID from localStorage
const getCompanyId = (): number | null => {
    const companyId = localStorage.getItem('companyId');
    return companyId ? parseInt(companyId, 10) : null;
};

// Main integration page that combines all components
const TabletIntegrationPage: React.FC = () => {
    const {
        tablets,
        sessions,
        realtimeStats,
        loading,
        error,
        pairingCode,
        isPairingCodeGenerating,
        pairingError,
        generatePairingCode,
        clearPairingState,
        retrySignatureSession,
        cancelSignatureSession,
        refreshData
    } = useTablets();

    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [showSessionDetails, setShowSessionDetails] = useState(false);
    const [showPairingModal, setShowPairingModal] = useState(false);
    const [pairingCodeTimer, setPairingCodeTimer] = useState<number>(0);

    // Refs for intervals to ensure proper cleanup
    const pairingCodeIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const codeStatusIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const currentPairingCodeRef = useRef<string | null>(null);

    const companyId = 10;

    // Cleanup function for all intervals
    const cleanupAllIntervals = useCallback(() => {
        if (pairingCodeIntervalRef.current) {
            console.log('🧹 Cleaning up pairing code timer interval');
            clearInterval(pairingCodeIntervalRef.current);
            pairingCodeIntervalRef.current = null;
        }

        if (codeStatusIntervalRef.current) {
            console.log('🧹 Cleaning up code status polling interval');
            clearInterval(codeStatusIntervalRef.current);
            codeStatusIntervalRef.current = null;
        }

        currentPairingCodeRef.current = null;
    }, []);

    // Clean up intervals on unmount
    useEffect(() => {
        return cleanupAllIntervals;
    }, [cleanupAllIntervals]);

    // Effect to handle code status polling when modal is open and code exists
    useEffect(() => {
        if (showPairingModal && pairingCode?.code) {
            console.log('🚀 Starting code status polling for code:', pairingCode.code);
            currentPairingCodeRef.current = pairingCode.code;

            // Function to check code status
            const checkCodeStatus = async (code: string): Promise<boolean> => {
                try {
                    console.log('🔍 Checking pairing code status:', code);

                    // Use direct fetch to have full control over the request
                    const authToken = localStorage.getItem('auth_token');
                    const response = tabletsApi.checkCodeStatus(code)

                    const result = await response
                    console.log('✅ Code status result:', result);
                    return result;

                } catch (error) {
                    console.error('❌ Error checking code status:', error);
                    return true; // Continue polling on network errors
                }
            };

            // Initial check
            console.log('🔍 Performing initial code status check');
            checkCodeStatus(pairingCode.code).then(isActive => {
                console.log('📊 Initial code status result:', { code: pairingCode.code, isActive });
            });

            // Set up polling interval
            const interval = setInterval(async () => {
                const currentCode = currentPairingCodeRef.current;
                if (!currentCode) {
                    console.log('🛑 No current code, stopping polling');
                    clearInterval(interval);
                    codeStatusIntervalRef.current = null;
                    return;
                }

                console.log('⏰ Scheduled code status check for:', currentCode);

                const isActive = await checkCodeStatus(currentCode);

                if (!isActive) {
                    console.log('🔒 Code is no longer active - tablet paired successfully!');

                    // Clean up intervals
                    clearInterval(interval);
                    codeStatusIntervalRef.current = null;

                    if (pairingCodeIntervalRef.current) {
                        clearInterval(pairingCodeIntervalRef.current);
                        pairingCodeIntervalRef.current = null;
                    }

                    // Close modal and reset state
                    setShowPairingModal(false);
                    clearPairingState();
                    setPairingCodeTimer(0);
                    currentPairingCodeRef.current = null;

                    // Refresh data and show success message
                    setTimeout(async () => {
                        console.log('🔄 Refreshing tablet data after successful pairing');
                        try {
                            await refreshData();
                            showToast('success', 'Tablet został pomyślnie sparowany!');
                        } catch (error) {
                            console.error('Error refreshing data:', error);
                            showToast('warning', 'Tablet sparowany, ale wystąpił błąd podczas odświeżania listy');
                        }
                    }, 100);
                }
            }, 3000);

            codeStatusIntervalRef.current = interval;
            console.log('✅ Code status polling interval started');

            // Cleanup function for this effect
            return () => {
                console.log('🧹 Cleaning up code status polling effect');
                if (interval) {
                    clearInterval(interval);
                }
                codeStatusIntervalRef.current = null;
            };
        }
    }, [showPairingModal, pairingCode, clearPairingState, refreshData]);

    // WebSocket event handlers
    const handleTabletConnectionChange = useCallback((event: any) => {
        console.log('Tablet connection changed:', event);
        showToast(
            event.action === 'connected' ? 'success' : 'info',
            `Tablet ${event.deviceName} ${event.action === 'connected' ? 'połączony' : 'rozłączony'}`
        );
    }, []);

    const handleSignatureUpdate = useCallback((event: any) => {
        console.log('Signature update:', event);
        showToast(
            event.status === 'signed' ? 'success' : 'warning',
            `Podpis ${event.status === 'signed' ? 'złożony' : 'wygasł'} dla ${event.customerName}`
        );
    }, []);

    const handleNotification = useCallback((notification: any) => {
        console.log('New notification:', notification);
    }, []);

    // Toast notification system (simplified)
    const showToast = (type: 'success' | 'warning' | 'info' | 'error', message: string) => {
        console.log(`${type.toUpperCase()}: ${message}`);
        // In real app, this would use a proper toast library like react-hot-toast
    };

    // Session details modal handlers
    const handleSessionClick = (session: any) => {
        setSelectedSession(session);
        setShowSessionDetails(true);
    };

    const handleRetrySession = async (sessionId: string) => {
        try {
            showToast('info', 'Ponowne wysyłanie żądania podpisu...');
            await retrySignatureSession(sessionId);
            showToast('success', 'Żądanie podpisu zostało ponownie wysłane');
            setShowSessionDetails(false);
        } catch (error) {
            showToast('error', 'Nie udało się ponownie wysłać żądania podpisu');
            console.error('Error retrying session:', error);
        }
    };

    const handleCancelSession = async (sessionId: string) => {
        try {
            showToast('info', 'Anulowanie sesji...');
            await cancelSignatureSession(sessionId);
            showToast('success', 'Sesja została anulowana');
            setShowSessionDetails(false);
        } catch (error) {
            showToast('error', 'Nie udało się anulować sesji');
            console.error('Error cancelling session:', error);
        }
    };

    const handlePairTablet = async () => {
        try {
            console.log('🔧 Starting tablet pairing process...');

            // Clean up any existing intervals
            cleanupAllIntervals();

            const pairingCodeResponse = await generatePairingCode();
            console.log('🔍 Pairing response:', pairingCodeResponse);

            const startTime = Date.now();
            const duration = pairingCodeResponse.expiresIn || 300;

            console.log('🔍 Timer setup:', {
                startTime: new Date(startTime).toISOString(),
                durationSeconds: duration,
                expiresAt: new Date(startTime + duration * 1000).toISOString(),
            });

            // Set initial timer value and show modal
            setPairingCodeTimer(duration);
            setShowPairingModal(true);

            // Start countdown timer
            const timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const timeLeft = Math.max(0, duration - elapsed);

                console.log('⏰ Timer update:', { elapsed, timeLeft, duration });
                setPairingCodeTimer(timeLeft);

                if (timeLeft <= 0) {
                    console.log('⏰ Timer expired!');
                    clearInterval(timerInterval);
                    pairingCodeIntervalRef.current = null;
                }
            }, 1000);

            pairingCodeIntervalRef.current = timerInterval;
            console.log('✅ Pairing process initiated with timer');

        } catch (error) {
            showToast('error', 'Nie udało się wygenerować kodu parowania');
            console.error('Error generating pairing code:', error);
        }
    };

    const handleClosePairingModal = () => {
        console.log('🚪 Closing pairing modal manually');

        cleanupAllIntervals();
        setShowPairingModal(false);
        clearPairingState();
        setPairingCodeTimer(0);
    };

    const handleGenerateNewCode = async () => {
        try {
            console.log('🔄 Generating new pairing code');
            cleanupAllIntervals();
            setShowPairingModal(false);

            // Small delay to ensure modal closes before reopening
            setTimeout(() => {
                handlePairTablet();
            }, 100);
        } catch (error) {
            showToast('error', 'Nie udało się wygenerować nowego kodu');
        }
    };

    const handleDataRefresh = async () => {
        try {
            await refreshData();
            showToast('success', 'Lista tabletów została odświeżona');
        } catch (error) {
            console.error('Error refreshing data:', error);
            showToast('error', 'Nie udało się odświeżyć listy tabletów');
        }
    };

    const formatTime = (seconds: number): string => {
        if (seconds <= 0) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Show error if no company ID is available
    if (!companyId) {
        return (
            <PageContainer>
                <ErrorContainer>
                    <ErrorIcon>
                        <FaExclamationTriangle />
                    </ErrorIcon>
                    <ErrorText>
                        Brak ID firmy. Proszę się zalogować ponownie.
                    </ErrorText>
                </ErrorContainer>
            </PageContainer>
        );
    }

    if (loading && tablets.length === 0) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie danych tabletów...</LoadingText>
                </LoadingContainer>
            </PageContainer>
        );
    }

    if (error && tablets.length === 0) {
        return (
            <PageContainer>
                <ErrorContainer>
                    <ErrorIcon>
                        <FaExclamationTriangle />
                    </ErrorIcon>
                    <ErrorText>Nie udało się załadować danych: {error}</ErrorText>
                </ErrorContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Professional Header */}
            <HeaderContainer>
                <HeaderContent>
                    <HeaderLeft>
                        <HeaderIcon>
                            <FaTabletAlt />
                        </HeaderIcon>
                        <HeaderText>
                            <HeaderTitle>Integracja Tabletów</HeaderTitle>
                            <HeaderSubtitle>
                                Centrum zarządzania urządzeniami mobilnymi i podpisami cyfrowymi
                            </HeaderSubtitle>
                        </HeaderText>
                    </HeaderLeft>

                    <HeaderActions>
                        <ConnectedDevicesIndicator>
                            <DeviceStatusIcon>
                                <FaWifi />
                            </DeviceStatusIcon>
                            <DeviceStatusInfo>
                                <DeviceCount>{realtimeStats.connectedTablets}</DeviceCount>
                                <DeviceLabel>urządzeń online</DeviceLabel>
                            </DeviceStatusInfo>
                        </ConnectedDevicesIndicator>

                        <PairTabletButton
                            onClick={handlePairTablet}
                            disabled={isPairingCodeGenerating}
                        >
                            {isPairingCodeGenerating ? <FaSpinner className="spin" /> : <FaPlus />}
                            {isPairingCodeGenerating ? 'Generowanie...' : 'Sparuj Tablet'}
                        </PairTabletButton>
                    </HeaderActions>
                </HeaderContent>
            </HeaderContainer>

            {/* Main dashboard */}
            <ContentContainer>
                <TabletManagementDashboard
                    tablets={tablets}
                    sessions={sessions}
                    onSessionClick={handleSessionClick}
                    onDataRefresh={handleDataRefresh}
                />
            </ContentContainer>

            {/* Session details modal */}
            {showSessionDetails && selectedSession && (
                <SessionDetailsModal
                    session={selectedSession}
                    tablet={tablets.find(t => t.id === selectedSession.assignedTabletId)}
                    onClose={() => setShowSessionDetails(false)}
                    onRetry={handleRetrySession}
                    onCancel={handleCancelSession}
                />
            )}

            {/* Pairing Modal */}
            {showPairingModal && (
                <PairingModalOverlay onClick={handleClosePairingModal}>
                    <PairingModal onClick={e => e.stopPropagation()}>
                        <PairingModalHeader>
                            <PairingModalTitle>
                                <FaTabletAlt />
                                Parowanie nowego tabletu
                            </PairingModalTitle>
                            <CloseButton onClick={handleClosePairingModal}>
                                <FaTimes />
                            </CloseButton>
                        </PairingModalHeader>

                        <PairingModalContent>
                            {pairingError && (
                                <ErrorMessage>
                                    <FaExclamationTriangle />
                                    {pairingError}
                                </ErrorMessage>
                            )}

                            {isPairingCodeGenerating ? (
                                <LoadingSection>
                                    <FaSpinner className="spin" />
                                    <LoadingText>Generowanie kodu parowania...</LoadingText>
                                </LoadingSection>
                            ) : pairingCode ? (
                                <>
                                    <PairingInstructions>
                                        <h3>Instrukcje parowania:</h3>
                                        <ol>
                                            <li>Upewnij się, że tablet jest połączony z internetem</li>
                                            <li>Otwórz aplikację CRM na tablecie</li>
                                            <li>Wprowadź poniższy kod parowania</li>
                                            <li>Poczekaj na potwierdzenie połączenia</li>
                                        </ol>
                                    </PairingInstructions>

                                    <PairingCodeSection>
                                        <PairingCodeLabel>Kod parowania:</PairingCodeLabel>
                                        <PairingCode>{pairingCode.code}</PairingCode>
                                        <PairingCodeNote>
                                            {pairingCodeTimer > 0 ? (
                                                <>Kod wygaśnie za {formatTime(pairingCodeTimer)}</>
                                            ) : (
                                                <ExpiredCodeNote>
                                                    <FaExclamationTriangle />
                                                    Kod wygasł
                                                </ExpiredCodeNote>
                                            )}
                                        </PairingCodeNote>
                                    </PairingCodeSection>

                                    <PairingActions>
                                        <CancelPairingButton onClick={handleClosePairingModal}>
                                            Anuluj
                                        </CancelPairingButton>
                                        <GenerateNewCodeButton
                                            onClick={handleGenerateNewCode}
                                            disabled={isPairingCodeGenerating}
                                        >
                                            {isPairingCodeGenerating ? <FaSpinner className="spin" /> : 'Wygeneruj nowy kod'}
                                        </GenerateNewCodeButton>
                                    </PairingActions>
                                </>
                            ) : (
                                <ErrorMessage>
                                    <FaExclamationTriangle />
                                    Nie udało się wygenerować kodu parowania
                                </ErrorMessage>
                            )}
                        </PairingModalContent>
                    </PairingModal>
                </PairingModalOverlay>
            )}

            <style>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </PageContainer>
    );
};

// Styled Components - Updated to match the application theme
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${brandTheme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    gap: ${brandTheme.spacing.md};
    min-height: 400px;
    margin: ${brandTheme.spacing.xl};
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${brandTheme.borderLight};
    border-top: 3px solid ${brandTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 2px dashed ${brandTheme.border};
    text-align: center;
    min-height: 400px;
    margin: ${brandTheme.spacing.xl};
`;

const ErrorIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${brandTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: ${brandTheme.status.error};
    margin-bottom: ${brandTheme.spacing.lg};
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
`;

const ErrorText = styled.div`
    font-size: 18px;
    color: ${brandTheme.status.error};
    font-weight: 500;
    text-align: center;
    max-width: 600px;
`;

const HeaderContainer = styled.header`
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.sm};
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);
`;

const HeaderContent = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.lg};

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
        flex-direction: column;
        align-items: stretch;
        gap: ${brandTheme.spacing.md};
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    min-width: 0;
    flex: 1;
`;

const HeaderIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${brandTheme.shadow.md};
    flex-shrink: 0;
`;

const HeaderText = styled.div`
    min-width: 0;
    flex: 1;
`;

const HeaderTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.xs} 0;
    letter-spacing: -0.025em;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const HeaderSubtitle = styled.p`
    color: ${brandTheme.text.secondary};
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.4;

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.md};
    align-items: center;
    flex-wrap: wrap;

    @media (max-width: 1024px) {
        justify-content: flex-end;
        width: 100%;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${brandTheme.spacing.xs};

        > * {
            width: 100%;
        }
    }
`;

const ConnectedDevicesIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    box-shadow: ${brandTheme.shadow.xs};
`;

const DeviceStatusIcon = styled.div`
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.primary};
    font-size: 16px;
`;

const DeviceStatusInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const DeviceCount = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    line-height: 1;
`;

const DeviceLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.tertiary};
    font-weight: 500;
    margin-top: 2px;
`;

const PairTabletButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    border: none;
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${brandTheme.shadow.sm};
    min-height: 44px;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: ${brandTheme.shadow.xs};
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const ContentContainer = styled.div`
    flex: 1;
    max-width: 1600px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;

    @media (max-width: 1024px) {
        // Usuń padding tutaj
    }

    @media (max-width: 768px) {
        // Usuń padding tutaj
        gap: ${brandTheme.spacing.md};
    }
`;

const PairingModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    padding: ${brandTheme.spacing.lg};
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const PairingModal = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    box-shadow: ${brandTheme.shadow.xl};
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
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

    @media (max-width: 768px) {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
    }
`;

const PairingModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
    flex-shrink: 0;
`;

const PairingModalTitle = styled.h2`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;

    svg {
        color: ${brandTheme.primary};
        font-size: 24px;
    }
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: ${brandTheme.surfaceHover};
    color: ${brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 18px;

    &:hover {
        background: ${brandTheme.status.errorLight};
        color: ${brandTheme.status.error};
        transform: scale(1.05);
    }

    &:active {
        transform: scale(0.95);
    }
`;

const PairingModalContent = styled.div`
    padding: ${brandTheme.spacing.xl};
`;

const LoadingSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.xxl};

    svg {
        font-size: 48px;
        color: ${brandTheme.primary};
    }
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.status.error}30;
    font-weight: 500;
    margin-bottom: ${brandTheme.spacing.lg};
    box-shadow: ${brandTheme.shadow.xs};

    svg {
        color: ${brandTheme.status.error};
        font-size: 18px;
    }
`;

const PairingInstructions = styled.div`
    margin-bottom: ${brandTheme.spacing.xl};

    h3 {
        color: ${brandTheme.text.primary};
        font-size: 18px;
        font-weight: 600;
        margin-bottom: ${brandTheme.spacing.md};
        display: flex;
        align-items: center;
        gap: ${brandTheme.spacing.sm};

        &::before {
            content: '';
            width: 4px;
            height: 18px;
            background: ${brandTheme.primary};
            border-radius: 2px;
        }
    }

    ol {
        color: ${brandTheme.text.secondary};
        line-height: 1.6;
        padding-left: 20px;

        li {
            margin-bottom: ${brandTheme.spacing.sm};
        }
    }
`;

const PairingCodeSection = styled.div`
    text-align: center;
    padding: ${brandTheme.spacing.xl};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.xl};
    border: 2px dashed ${brandTheme.primary};
    margin-bottom: ${brandTheme.spacing.xl};
    box-shadow: ${brandTheme.shadow.xs};
`;

const PairingCodeLabel = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 600;
    margin-bottom: ${brandTheme.spacing.md};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const PairingCode = styled.div`
    font-size: 48px;
    font-weight: 800;
    color: ${brandTheme.primary};
    font-family: 'Courier New', monospace;
    letter-spacing: 8px;
    margin-bottom: ${brandTheme.spacing.md};
    text-shadow: 0 2px 4px rgba(26, 54, 93, 0.2);

    @media (max-width: 768px) {
        font-size: 36px;
        letter-spacing: 4px;
    }
`;

const PairingCodeNote = styled.div`
    font-size: 14px;
    color: ${brandTheme.status.success};
    font-weight: 500;
`;

const ExpiredCodeNote = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.xs};
    color: ${brandTheme.status.error};
    font-weight: 600;

    svg {
        font-size: 16px;
    }
`;

const PairingActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.md};
    justify-content: flex-end;

    @media (max-width: 576px) {
        flex-direction: column-reverse;
    }
`;

const CancelPairingButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border: 2px solid ${brandTheme.border};
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;

    &:hover {
        border-color: ${brandTheme.borderHover};
        color: ${brandTheme.text.primary};
        background: ${brandTheme.surfaceHover};
        box-shadow: ${brandTheme.shadow.xs};
    }
`;

const GenerateNewCodeButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    border: none;
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: ${brandTheme.shadow.sm};
    min-height: 44px;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: ${brandTheme.shadow.xs};
    }
`;

export default TabletIntegrationPage;