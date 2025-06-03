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
    FaWifi
} from 'react-icons/fa';

// Main integration page that combines all components
const TabletIntegrationPage: React.FC = () => {
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [showSessionDetails, setShowSessionDetails] = useState(false);
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
        // In real app, this would call API to retry the session
        showToast('info', 'Ponowne wysyłanie żądania podpisu...');
        setShowSessionDetails(false);
    };

    const handleCancelSession = async (sessionId: string) => {
        console.log('Cancelling session:', sessionId);
        // In real app, this would call API to cancel the session
        showToast('info', 'Anulowanie sesji...');
        setShowSessionDetails(false);
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
            {/* Header with real-time WebSocket status */}
            <PageHeader>
                <HeaderContent>
                    <HeaderTitle>
                        <FaTabletAlt />
                        Integracja Tabletów
                    </HeaderTitle>
                    <HeaderSubtitle>
                        Zarządzanie urządzeniami i sesjami podpisów cyfrowych
                    </HeaderSubtitle>
                </HeaderContent>

                <HeaderStats>
                    <StatCard color="#10b981">
                        <StatIcon><FaWifi /></StatIcon>
                        <StatContent>
                            <StatNumber>{realtimeStats.connectedTablets}</StatNumber>
                            <StatLabel>Online</StatLabel>
                        </StatContent>
                    </StatCard>

                    <StatCard color="#3b82f6">
                        <StatIcon><FaClock /></StatIcon>
                        <StatContent>
                            <StatNumber>{realtimeStats.pendingSessions}</StatNumber>
                            <StatLabel>Oczekujące</StatLabel>
                        </StatContent>
                    </StatCard>

                    <StatCard color="#059669">
                        <StatIcon><FaCheckCircle /></StatIcon>
                        <StatContent>
                            <StatNumber>{realtimeStats.completedToday}</StatNumber>
                            <StatLabel>Dziś</StatLabel>
                        </StatContent>
                    </StatCard>

                    <StatCard color="#7c3aed">
                        <StatIcon><FaChartLine /></StatIcon>
                        <StatContent>
                            <StatNumber>{realtimeStats.successRate}%</StatNumber>
                            <StatLabel>Skuteczność</StatLabel>
                        </StatContent>
                    </StatCard>
                </HeaderStats>
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

            {/* Main dashboard */}
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

            {/* Quick Actions Sidebar */}
            <QuickActionsSidebar>
                <SidebarHeader>
                    <SidebarTitle>Szybkie akcje</SidebarTitle>
                </SidebarHeader>

                <ActionsList>
                    <ActionItem>
                        <ActionIcon><FaTabletAlt /></ActionIcon>
                        <ActionContent>
                            <ActionTitle>Sparuj nowy tablet</ActionTitle>
                            <ActionDescription>Dodaj urządzenie do systemu</ActionDescription>
                        </ActionContent>
                    </ActionItem>

                    <ActionItem>
                        <ActionIcon><FaSignature /></ActionIcon>
                        <ActionContent>
                            <ActionTitle>Wyślij podpis</ActionTitle>
                            <ActionDescription>Utwórz nową sesję podpisu</ActionDescription>
                        </ActionContent>
                    </ActionItem>

                    <ActionItem>
                        <ActionIcon><FaCog /></ActionIcon>
                        <ActionContent>
                            <ActionTitle>Ustawienia tabletów</ActionTitle>
                            <ActionDescription>Konfiguruj urządzenia</ActionDescription>
                        </ActionContent>
                    </ActionItem>

                    <ActionItem>
                        <ActionIcon><FaUsers /></ActionIcon>
                        <ActionContent>
                            <ActionTitle>Zarządzaj lokalizacjami</ActionTitle>
                            <ActionDescription>Przypisz tablety do miejsc</ActionDescription>
                        </ActionContent>
                    </ActionItem>
                </ActionsList>

                <SidebarFooter>
                    <FooterStats>
                        <FooterStat>
                            <FooterStatNumber>24/7</FooterStatNumber>
                            <FooterStatLabel>Dostępność</FooterStatLabel>
                        </FooterStat>
                        <FooterStat>
                            <FooterStatNumber>2s</FooterStatNumber>
                            <FooterStatLabel>Czas odpowiedzi</FooterStatLabel>
                        </FooterStat>
                    </FooterStats>
                </SidebarFooter>
            </QuickActionsSidebar>

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
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  display: grid;
  grid-template-areas:
    "header header header"
    "connection connection sidebar"
    "dashboard dashboard sidebar"
    "status status sidebar";
  grid-template-columns: 1fr 1fr 300px;
  grid-template-rows: auto auto 1fr auto;
  gap: 24px;
  padding: 24px;

  @media (max-width: 1200px) {
    grid-template-areas:
      "header"
      "connection"
      "dashboard"
      "sidebar"
      "status";
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr auto auto;
  }
`;

const PageHeader = styled.div`
  grid-area: header;
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 24px;
    align-items: flex-start;
  }
`;

const HeaderContent = styled.div``;

const HeaderTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;

  svg {
    color: #3b82f6;
  }
`;

const HeaderSubtitle = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
  max-width: 500px;
  line-height: 1.5;
`;

const HeaderStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    width: 100%;
  }
`;

const StatCard = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: ${props => props.color}10;
  border-radius: 12px;
  border: 1px solid ${props => props.color}20;
  min-width: 120px;
`;

const StatIcon = styled.div`
  font-size: 20px;
  color: inherit;
`;

const StatContent = styled.div``;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: inherit;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ConnectionSection = styled.div`
  grid-area: connection;
`;

const DashboardSection = styled.div`
  grid-area: dashboard;
`;

const QuickActionsSidebar = styled.div`
  grid-area: sidebar;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: fit-content;
  position: sticky;
  top: 24px;
`;

const SidebarHeader = styled.div`
  padding: 24px 20px 16px;
  border-bottom: 1px solid #f1f5f9;
`;

const SidebarTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const ActionsList = styled.div`
  padding: 16px 0;
`;

const ActionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const ActionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
`;

const ActionContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
`;

const ActionDescription = styled.div`
  font-size: 12px;
  color: #64748b;
  line-height: 1.3;
`;

const SidebarFooter = styled.div`
  padding: 16px 20px 20px;
  border-top: 1px solid #f1f5f9;
`;

const FooterStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const FooterStat = styled.div`
  text-align: center;
`;

const FooterStatNumber = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 2px;
`;

const FooterStatLabel = styled.div`
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const SystemStatusBar = styled.div`
  grid-area: status;
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 24px;
  
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
  font-size: 13px;
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

export default TabletIntegrationPage;