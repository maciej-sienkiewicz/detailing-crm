import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import {
    FaWifi,
    FaExclamationTriangle,
    FaCheckCircle,
    FaSpinner,
    FaTabletAlt,
    FaDesktop,
    FaBell,
    FaSignature,
    FaTimes,
    FaRedo
} from 'react-icons/fa';

// Types for WebSocket messages
interface WebSocketMessage {
    type: string;
    payload: any;
    timestamp?: string;
}

interface ConnectionStatus {
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    lastConnected?: Date;
    reconnectAttempts: number;
}

interface TabletConnectionEvent {
    deviceId: string;
    deviceName: string;
    tenantId: string;
    locationId: string;
    action: 'connected' | 'disconnected';
    timestamp: string;
}

interface SignatureRequestEvent {
    sessionId: string;
    deviceId: string;
    customerName: string;
    status: 'sent' | 'received' | 'signed' | 'expired' | 'error';
    timestamp: string;
}

interface NotificationEvent {
    id: string;
    type: 'tablet_connected' | 'tablet_disconnected' | 'signature_completed' | 'signature_expired' | 'system_alert';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    deviceId?: string;
    sessionId?: string;
}

interface WebSocketManagerProps {
    tenantId: string;
    onTabletConnectionChange?: (event: TabletConnectionEvent) => void;
    onSignatureUpdate?: (event: SignatureRequestEvent) => void;
    onNotification?: (notification: NotificationEvent) => void;
}

const WebSocketManager: React.FC<WebSocketManagerProps> = ({
                                                               tenantId,
                                                               onTabletConnectionChange,
                                                               onSignatureUpdate,
                                                               onNotification
                                                           }) => {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
        status: 'disconnected',
        reconnectAttempts: 0
    });
    const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [connectedDevices, setConnectedDevices] = useState<Set<string>>(new Set());
    const [recentActivity, setRecentActivity] = useState<WebSocketMessage[]>([]);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const maxReconnectAttempts = 10;
    const reconnectInterval = 3000;

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        setConnectionStatus(prev => ({ ...prev, status: 'connecting' }));

        // Używamy SockJS zamiast czystego WebSocket - zgodnie z konfiguracją backendu
        const workstationId = `workstation-${Date.now()}`;
        const wsUrl = `ws://localhost:8080/ws/workstation/${workstationId}`;

        try {
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('WebSocket connected');
                setConnectionStatus({
                    status: 'connected',
                    lastConnected: new Date(),
                    reconnectAttempts: 0
                });

                // Send authentication message with proper headers expected by backend
                const authMessage: WebSocketMessage = {
                    type: 'connection',
                    payload: {
                        tenantId,
                        userType: 'workstation',
                        workstationId: workstationId,
                        timestamp: new Date().toISOString()
                    },
                    timestamp: new Date().toISOString()
                };

                wsRef.current?.send(JSON.stringify(authMessage));
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    handleMessage(message);

                    // Add to recent activity (keep last 50 messages)
                    setRecentActivity(prev => {
                        const updated = [message, ...prev].slice(0, 50);
                        return updated;
                    });
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            wsRef.current.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                setConnectionStatus(prev => ({
                    ...prev,
                    status: 'disconnected'
                }));

                // Tylko reconnect jeśli nie było to celowe zamknięcie
                if (event.code !== 1000 && connectionStatus.reconnectAttempts < maxReconnectAttempts) {
                    const delay = reconnectInterval * Math.pow(1.5, connectionStatus.reconnectAttempts);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        setConnectionStatus(prev => ({
                            ...prev,
                            reconnectAttempts: prev.reconnectAttempts + 1
                        }));
                        connect();
                    }, Math.min(delay, 30000)); // Max 30 sekund delay
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                setConnectionStatus(prev => ({ ...prev, status: 'error' }));
            };

        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            setConnectionStatus(prev => ({ ...prev, status: 'error' }));
        }
    }, [tenantId, connectionStatus.reconnectAttempts]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = undefined;
        }

        if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
            wsRef.current.close(1000, 'Component unmounting'); // Normal closure
            wsRef.current = null;
        }

        setConnectionStatus({
            status: 'disconnected',
            reconnectAttempts: 0
        });
    }, []);

    const handleMessage = useCallback((message: WebSocketMessage) => {
        switch (message.type) {
            case 'tablet_connected':
                const connectEvent: TabletConnectionEvent = {
                    ...message.payload,
                    action: 'connected'
                };
                setConnectedDevices(prev => new Set([...prev, message.payload.deviceId]));
                onTabletConnectionChange?.(connectEvent);

                addNotification({
                    id: `tablet-connect-${Date.now()}`,
                    type: 'tablet_connected',
                    title: 'Tablet połączony',
                    message: `${message.payload.deviceName} jest teraz online`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    deviceId: message.payload.deviceId
                });
                break;

            case 'tablet_disconnected':
                const disconnectEvent: TabletConnectionEvent = {
                    ...message.payload,
                    action: 'disconnected'
                };
                setConnectedDevices(prev => {
                    const updated = new Set(prev);
                    updated.delete(message.payload.deviceId);
                    return updated;
                });
                onTabletConnectionChange?.(disconnectEvent);

                addNotification({
                    id: `tablet-disconnect-${Date.now()}`,
                    type: 'tablet_disconnected',
                    title: 'Tablet rozłączony',
                    message: `${message.payload.deviceName} przeszedł offline`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    deviceId: message.payload.deviceId
                });
                break;

            case 'signature_completed':
                const signatureEvent: SignatureRequestEvent = {
                    ...message.payload,
                    status: 'signed'
                };
                onSignatureUpdate?.(signatureEvent);

                addNotification({
                    id: `signature-complete-${Date.now()}`,
                    type: 'signature_completed',
                    title: 'Podpis złożony',
                    message: `${message.payload.customerName} złożył podpis cyfrowy`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    sessionId: message.payload.sessionId
                });
                break;

            case 'signature_expired':
                const expiredEvent: SignatureRequestEvent = {
                    ...message.payload,
                    status: 'expired'
                };
                onSignatureUpdate?.(expiredEvent);

                addNotification({
                    id: `signature-expired-${Date.now()}`,
                    type: 'signature_expired',
                    title: 'Sesja wygasła',
                    message: `Sesja podpisu dla ${message.payload.customerName} wygasła`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    sessionId: message.payload.sessionId
                });
                break;

            case 'heartbeat':
                // Handle heartbeat - no action needed
                break;

            default:
                console.log('Unknown message type:', message.type);
        }
    }, [onTabletConnectionChange, onSignatureUpdate]);

    const addNotification = useCallback((notification: NotificationEvent) => {
        setNotifications(prev => [notification, ...prev].slice(0, 20)); // Keep last 20 notifications
        onNotification?.(notification);

        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico'
            });
        }
    }, [onNotification]);

    const markNotificationAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const sendMessage = useCallback((message: WebSocketMessage) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                ...message,
                timestamp: new Date().toISOString()
            }));
        }
    }, []);

    // Request notification permission on mount
    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Auto-connect on mount z proper cleanup
    useEffect(() => {
        let isMounted = true;

        const connectIfMounted = () => {
            if (isMounted) {
                connect();
            }
        };

        // Delay initial connection to avoid React strict mode double mounting
        const initialConnectionTimeout = setTimeout(connectIfMounted, 100);

        return () => {
            isMounted = false;
            clearTimeout(initialConnectionTimeout);
            disconnect();
        };
    }, [tenantId]); // Tylko tenantId jako dependency

    // Heartbeat
    useEffect(() => {
        if (connectionStatus.status === 'connected') {
            const interval = setInterval(() => {
                sendMessage({
                    type: 'heartbeat',
                    payload: { timestamp: new Date().toISOString() }
                });
            }, 30000); // Send heartbeat every 30 seconds

            return () => clearInterval(interval);
        }
    }, [connectionStatus.status, sendMessage]);

    const getStatusIcon = () => {
        switch (connectionStatus.status) {
            case 'connected':
                return <FaWifi style={{ color: '#10b981' }} />;
            case 'connecting':
                return <FaSpinner className="spin" style={{ color: '#f59e0b' }} />;
            case 'error':
                return <FaExclamationTriangle style={{ color: '#ef4444' }} />;
            default:
                return <FaWifi style={{ color: '#6b7280' }} />;
        }
    };

    const getStatusText = () => {
        switch (connectionStatus.status) {
            case 'connected':
                return 'Połączono';
            case 'connecting':
                return 'Łączenie...';
            case 'error':
                return 'Błąd połączenia';
            default:
                return 'Rozłączono';
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <ManagerContainer>
            <StatusBar>
                <ConnectionStatus>
                    <StatusIcon>{getStatusIcon()}</StatusIcon>
                    <StatusText status={connectionStatus.status}>
                        {getStatusText()}
                    </StatusText>
                    {connectionStatus.lastConnected && connectionStatus.status === 'connected' && (
                        <LastConnected>
                            Połączono: {connectionStatus.lastConnected.toLocaleTimeString()}
                        </LastConnected>
                    )}
                    {connectionStatus.reconnectAttempts > 0 && connectionStatus.status !== 'connected' && (
                        <ReconnectAttempts>
                            Próba {connectionStatus.reconnectAttempts}/{maxReconnectAttempts}
                        </ReconnectAttempts>
                    )}
                </ConnectionStatus>

                <StatusActions>
                    <DeviceCounter>
                        <FaTabletAlt />
                        {connectedDevices.size} online
                    </DeviceCounter>

                    <NotificationButton
                        onClick={() => setShowNotifications(!showNotifications)}
                        hasUnread={unreadCount > 0}
                    >
                        <FaBell />
                        {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
                    </NotificationButton>

                    {connectionStatus.status === 'disconnected' && (
                        <ReconnectButton onClick={connect}>
                            <FaRedo />
                            Połącz
                        </ReconnectButton>
                    )}
                </StatusActions>
            </StatusBar>

            {showNotifications && (
                <NotificationsPanel>
                    <NotificationsHeader>
                        <h3>Powiadomienia</h3>
                        <NotificationsActions>
                            {notifications.length > 0 && (
                                <ClearButton onClick={clearAllNotifications}>
                                    Wyczyść wszystkie
                                </ClearButton>
                            )}
                            <CloseButton onClick={() => setShowNotifications(false)}>
                                <FaTimes />
                            </CloseButton>
                        </NotificationsActions>
                    </NotificationsHeader>

                    <NotificationsList>
                        {notifications.length === 0 ? (
                            <EmptyNotifications>
                                <FaBell style={{ fontSize: '32px', opacity: 0.3 }} />
                                <p>Brak nowych powiadomień</p>
                            </EmptyNotifications>
                        ) : (
                            notifications.map(notification => (
                                <NotificationItem
                                    key={notification.id}
                                    unread={!notification.read}
                                    onClick={() => markNotificationAsRead(notification.id)}
                                >
                                    <NotificationIcon type={notification.type}>
                                        {notification.type === 'tablet_connected' && <FaCheckCircle />}
                                        {notification.type === 'tablet_disconnected' && <FaWifiSlash />}
                                        {notification.type === 'signature_completed' && <FaSignature />}
                                        {notification.type === 'signature_expired' && <FaExclamationTriangle />}
                                        {notification.type === 'system_alert' && <FaBell />}
                                    </NotificationIcon>
                                    <NotificationContent>
                                        <NotificationTitle>{notification.title}</NotificationTitle>
                                        <NotificationMessage>{notification.message}</NotificationMessage>
                                        <NotificationTime>
                                            {new Date(notification.timestamp).toLocaleTimeString()}
                                        </NotificationTime>
                                    </NotificationContent>
                                    {!notification.read && <UnreadIndicator />}
                                </NotificationItem>
                            ))
                        )}
                    </NotificationsList>
                </NotificationsPanel>
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
        </ManagerContainer>
    );
};

// Styled Components
const ManagerContainer = styled.div`
    position: relative;
`;

const StatusBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
`;

const ConnectionStatus = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const StatusIcon = styled.div`
    font-size: 18px;
`;

const StatusText = styled.span<{ status: string }>`
    font-weight: 600;
    color: ${props => {
        switch (props.status) {
            case 'connected': return '#10b981';
            case 'connecting': return '#f59e0b';
            case 'error': return '#ef4444';
            default: return '#6b7280';
        }
    }};
`;

const LastConnected = styled.span`
    font-size: 12px;
    color: #64748b;
`;

const ReconnectAttempts = styled.span`
    font-size: 12px;
    color: #ef4444;
    font-weight: 500;
`;

const StatusActions = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const DeviceCounter = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #f1f5f9;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    color: #475569;

    svg {
        color: #3b82f6;
    }
`;

const NotificationButton = styled.button<{ hasUnread: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: ${props => props.hasUnread ? '#3b82f6' : '#f1f5f9'};
    color: ${props => props.hasUnread ? 'white' : '#64748b'};
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: ${props => props.hasUnread ? '#2563eb' : '#e2e8f0'};
    }
`;

const NotificationBadge = styled.span`
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ef4444;
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 16px;
    text-align: center;
`;

const ReconnectButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background: #3b82f6;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: #2563eb;
    }
`;

const NotificationsPanel = styled.div`
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 400px;
    max-height: 500px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 1px solid #e2e8f0;
    z-index: 1000;
    overflow: hidden;
`;

const NotificationsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;

    h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
    }
`;

const NotificationsActions = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const ClearButton = styled.button`
    padding: 4px 8px;
    border: none;
    background: none;
    color: #64748b;
    font-size: 12px;
    cursor: pointer;

    &:hover {
        color: #ef4444;
    }
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 50%;
    background: #e2e8f0;
    color: #64748b;
    cursor: pointer;

    &:hover {
        background: #ef4444;
        color: white;
    }
`;

const NotificationsList = styled.div`
    max-height: 400px;
    overflow-y: auto;
`;

const EmptyNotifications = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: #94a3b8;

    p {
        margin: 8px 0 0 0;
        font-size: 14px;
    }
`;

const NotificationItem = styled.div<{ unread: boolean }>`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    background: ${props => props.unread ? '#f0f9ff' : 'white'};

    &:hover {
        background: #f8fafc;
    }

    &:last-child {
        border-bottom: none;
    }
`;

const NotificationIcon = styled.div<{ type: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 14px;
    color: white;
    flex-shrink: 0;
    background: ${props => {
        switch (props.type) {
            case 'tablet_connected': return '#10b981';
            case 'tablet_disconnected': return '#6b7280';
            case 'signature_completed': return '#3b82f6';
            case 'signature_expired': return '#f59e0b';
            case 'system_alert': return '#ef4444';
            default: return '#64748b';
        }
    }};
`;

const NotificationContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const NotificationTitle = styled.div`
    font-weight: 600;
    color: #1e293b;
    font-size: 14px;
    margin-bottom: 2px;
`;

const NotificationMessage = styled.div`
    color: #64748b;
    font-size: 13px;
    line-height: 1.4;
    margin-bottom: 4px;
`;

const NotificationTime = styled.div`
    color: #94a3b8;
    font-size: 11px;
`;

const UnreadIndicator = styled.div`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3b82f6;
    flex-shrink: 0;
    margin-top: 4px;
`;

export default WebSocketManager;