import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import TabletManagementDashboard from './TabletManagementDashboard';
import SessionDetailsModal from './components/SessionDetailsModal';
import WebSocketManager from './components/WebSocketManager';
import {
    FaTabletAlt,
    FaSignature,
    FaChartLine,
    FaCog,
    FaUsers,
    FaExclamationTriangle,
    FaCheckCircle,
    FaClock,
    FaWifi,
    FaPlus
} from 'react-icons/fa';

// Main integration page that combines all components
const TabletIntegrationPage: React.FC = () => {
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [showSessionDetails, setShowSessionDetails] = useState(false);
    const [showPairingModal, setShowPairingModal] = useState(false);
    const [realtimeStats, setRealtimeStats] = useState({
        connectedTablets: 0,
        pendingSessions: 0,
        completedToday: 0,
        successRate: 0
    });

    // Mock data - in real app this would come from API/WebSocket
    const [dashboardData, setDashboardData] = useState({
        tablets: [],
        sessions: [],
        notifications: []
    });

    // WebSocket event handlers
    const handleTabletConnectionChange = useCallback((event: any) => {
        console.log('Tablet connection changed:', event);

        // Update realtime stats
        setRealtimeStats(prev => ({
            ...prev,
            connectedTablets: event.action === 'connected'
                ? prev.connectedTablets + 1
                : Math.max(0, prev.connectedTablets - 1)
        }));

        // Show toast notification
        showToast(
            event.action === 'connected' ? 'success' : 'info',
            `Tablet ${event.deviceName} ${event.action === 'connected' ? 'połączony' : 'rozłączony'}`
        );
    }, []);

    const handleSignatureUpdate = useCallback((event: any) => {
        console.log('Signature update:', event);

        // Update session status in dashboard
        setDashboardData(prev => ({
            ...prev,
            sessions: prev.sessions.map((session: any) =>
                session.id === event.sessionId
                    ? { ...session, status: event.status.toUpperCase(), signedAt: event.timestamp }
                    : session
            )
        }));

        // Update stats if completed today
        if (event.status === 'signed') {
            const today = new Date().toDateString();
            const eventDate = new Date(event.timestamp).toDateString();

            if (today === eventDate) {
                setRealtimeStats(prev => ({
                    ...prev,
                    completedToday: prev.completedToday + 1,
                    pendingSessions: Math.max(0, prev.pendingSessions - 1)
                }));
            }
        }

        showToast(
            event.status === 'signed' ? 'success' : 'warning',
            `Podpis ${event.status === 'signed' ? 'złożony' : 'wygasł'} dla ${event.customerName}`
        );
    }, []);

    const handleNotification = useCallback((notification: any) => {
        console.log('New notification:', notification);

        // Add to notifications list
        setDashboardData(prev => ({
            ...prev,
            notifications: [notification, ...prev.notifications.slice(0, 19)]
        }));
    }, []);

    // Toast notification system (simplified)
    const showToast = (type: 'success' | 'warning' | 'info', message: string) => {
        // In real app, this would use a proper toast library
        console.log(`${type.toUpperCase()}: ${message}`);
    };

    // Session details modal handlers
    const handleSessionClick = (session: any) => {
        setSelectedSession(session);
        setShowSessionDetails(true);
    };

    const handleRetrySession = async (sessionId: string) => {
        console.log('Retrying session:', sessionId);
        showToast('info', 'Ponowne wysyłanie żądania podpisu...');
        setShowSessionDetails(false);
    };

    const handleCancelSession = async (sessionId: string) => {
        console.log('Cancelling session:', sessionId);
        showToast('info', 'Anulowanie sesji...');
        setShowSessionDetails(false);
    };

    const handlePairTablet = () => {
        setShowPairingModal(true);
    };

    // Load initial data
    useEffect(() => {
        // Mock initial stats
        setRealtimeStats({
            connectedTablets: 2,
            pendingSessions: 3,
            completedToday: 8,
            successRate: 95.2
        });
    }, []);

    return (
        <PageContainer>
            {/* Professional Header */}
            <PageHeader>
                <HeaderContent>
                    <HeaderTitleSection>
                        <HeaderIcon>
                            <FaTabletAlt />
                        </HeaderIcon>
                        <HeaderTextGroup>
                            <HeaderTitle>Integracja Tabletów</HeaderTitle>
                            <HeaderSubtitle>
                                Centrum zarządzania urządzeniami mobilnymi i podpisami cyfrowymi
                            </HeaderSubtitle>
                        </HeaderTextGroup>
                    </HeaderTitleSection>
                </HeaderContent>

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

                    <PairTabletButton onClick={handlePairTablet}>
                        <FaPlus />
                        Sparuj Tablet
                    </PairTabletButton>
                </HeaderActions>
            </PageHeader>

            {/* WebSocket connection manager */}
            <ConnectionSection>
                <WebSocketManager
                    tenantId="tenant-1"
                    onTabletConnectionChange={handleTabletConnectionChange}
                    onSignatureUpdate={handleSignatureUpdate}
                    onNotification={handleNotification}
                />
            </ConnectionSection>

            {/* Main dashboard - now takes full width */}
            <DashboardSection>
                <TabletManagementDashboard
                    onSessionClick={handleSessionClick}
                    realtimeData={dashboardData}
                />
            </DashboardSection>

            {/* Session details modal */}
            {showSessionDetails && selectedSession && (
                <SessionDetailsModal
                    session={selectedSession}
                    onClose={() => setShowSessionDetails(false)}
                    onRetry={handleRetrySession}
                    onCancel={handleCancelSession}
                />
            )}

            {/* Pairing Modal */}
            {showPairingModal && (
                <PairingModalOverlay onClick={() => setShowPairingModal(false)}>
                    <PairingModal onClick={e => e.stopPropagation()}>
                        <PairingModalHeader>
                            <PairingModalTitle>
                                <FaTabletAlt />
                                Parowanie nowego tabletu
                            </PairingModalTitle>
                            <CloseButton onClick={() => setShowPairingModal(false)}>×</CloseButton>
                        </PairingModalHeader>
                        <PairingModalContent>
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
                                <PairingCode>123456</PairingCode>
                                <PairingCodeNote>Kod wygaśnie za 4:32</PairingCodeNote>
                            </PairingCodeSection>

                            <PairingActions>
                                <CancelPairingButton onClick={() => setShowPairingModal(false)}>
                                    Anuluj
                                </CancelPairingButton>
                                <GenerateNewCodeButton>
                                    Wygeneruj nowy kod
                                </GenerateNewCodeButton>
                            </PairingActions>
                        </PairingModalContent>
                    </PairingModal>
                </PairingModalOverlay>
            )}

            {/* System Status Bar */}
            <SystemStatusBar>
                <StatusItem status="healthy">
                    <StatusIndicator color="#10b981" />
                    <StatusText>API: Operacyjne</StatusText>
                </StatusItem>

                <StatusItem status="healthy">
                    <StatusIndicator color="#10b981" />
                    <StatusText>WebSocket: Połączony</StatusText>
                </StatusItem>

                <StatusItem status="healthy">
                    <StatusIndicator color="#10b981" />
                    <StatusText>Baza danych: Dostępna</StatusText>
                </StatusItem>

                <StatusTimestamp>
                    Ostatnia aktualizacja: {new Date().toLocaleTimeString('pl-PL')}
                </StatusTimestamp>
            </SystemStatusBar>
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    display: grid;
    grid-template-areas:
        "header"
        "connection"
        "dashboard"
        "status";
    grid-template-rows: auto auto 1fr auto;
    gap: 24px;
    padding: 24px;
`;

const PageHeader = styled.div`
    grid-area: header;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 24px;
    padding: 40px;
    box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(226, 232, 240, 0.8);
    display: flex;
    justify-content: space-between;
    align-items: center;
    backdrop-filter: blur(10px);

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 24px;
        align-items: flex-start;
        padding: 24px;
    }
`;

const HeaderContent = styled.div`
    flex: 1;
`;

const HeaderTitleSection = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
`;

const HeaderIcon = styled.div`
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: white;
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
`;

const HeaderTextGroup = styled.div``;

const HeaderTitle = styled.h1`
    font-size: 42px;
    font-weight: 800;
    background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 8px 0;
    letter-spacing: -0.02em;
    line-height: 1.1;
`;

const HeaderSubtitle = styled.p`
    color: #64748b;
    font-size: 18px;
    margin: 0;
    max-width: 600px;
    line-height: 1.6;
    font-weight: 400;
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;
    
    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
    }
`;

const ConnectedDevicesIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border: 2px solid #0ea5e9;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.1);
`;

const DeviceStatusIcon = styled.div`
    font-size: 24px;
    color: #0ea5e9;
`;

const DeviceStatusInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const DeviceCount = styled.div`
    font-size: 28px;
    font-weight: 700;
    color: #0c4a6e;
    line-height: 1;
`;

const DeviceLabel = styled.div`
    font-size: 14px;
    color: #0369a1;
    font-weight: 500;
    margin-top: 2px;
`;

const PairTabletButton = styled.button`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 32px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px 0 rgba(16, 185, 129, 0.5);
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
    }

    &:active {
        transform: translateY(0);
    }
`;

const ConnectionSection = styled.div`
    grid-area: connection;
`;

const DashboardSection = styled.div`
    grid-area: dashboard;
`;

const SystemStatusBar = styled.div`
    grid-area: status;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 16px 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 32px;
    border: 1px solid rgba(226, 232, 240, 0.8);

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
    }
`;

const StatusItem = styled.div<{ status: string }>`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const StatusIndicator = styled.div<{ color: string }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.color};
    box-shadow: 0 0 0 2px ${props => props.color}20;
`;

const StatusText = styled.span`
    font-size: 14px;
    color: #475569;
    font-weight: 500;
`;

const StatusTimestamp = styled.div`
    font-size: 12px;
    color: #94a3b8;
    margin-left: auto;

    @media (max-width: 768px) {
        margin-left: 0;
    }
`;

// Pairing Modal Styles
const PairingModalOverlay = styled.div`
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
    backdrop-filter: blur(8px);
`;

const PairingModal = styled.div`
    background: white;
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow: hidden;
`;

const PairingModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32px 32px 0;
`;

const PairingModalTitle = styled.h2`
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;

    svg {
        color: #3b82f6;
        font-size: 32px;
    }
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 50%;
    background: #f1f5f9;
    color: #64748b;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: #ef4444;
        color: white;
        transform: scale(1.1);
    }
`;

const PairingModalContent = styled.div`
    padding: 32px;
`;

const PairingInstructions = styled.div`
    margin-bottom: 32px;

    h3 {
        color: #1e293b;
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 16px;
    }

    ol {
        color: #64748b;
        line-height: 1.7;
        padding-left: 20px;

        li {
            margin-bottom: 8px;
        }
    }
`;

const PairingCodeSection = styled.div`
    text-align: center;
    padding: 32px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 20px;
    border: 2px dashed #3b82f6;
    margin-bottom: 32px;
`;

const PairingCodeLabel = styled.div`
    font-size: 16px;
    color: #64748b;
    font-weight: 500;
    margin-bottom: 16px;
`;

const PairingCode = styled.div`
    font-size: 56px;
    font-weight: 800;
    color: #3b82f6;
    font-family: 'Courier New', monospace;
    letter-spacing: 8px;
    margin-bottom: 16px;
    text-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
`;

const PairingCodeNote = styled.div`
    font-size: 14px;
    color: #ef4444;
    font-weight: 500;
`;

const PairingActions = styled.div`
    display: flex;
    gap: 16px;
    justify-content: flex-end;
`;

const CancelPairingButton = styled.button`
    padding: 12px 24px;
    border: 2px solid #e2e8f0;
    background: white;
    color: #64748b;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        border-color: #cbd5e1;
        color: #475569;
        background: #f8fafc;
    }
`;

const GenerateNewCodeButton = styled.button`
    padding: 12px 24px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
`;

export default TabletIntegrationPage;