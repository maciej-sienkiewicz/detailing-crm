import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useWebSocket } from '../../../hooks/useWebSocket';
import {
    FaWifi,
    FaExclamationTriangle,
    FaCheckCircle,
    FaSpinner,
    FaTabletAlt,
    FaBell,
    FaSignature,
    FaTimes,
    FaRedo
} from 'react-icons/fa';

// Types for WebSocket messages
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
    const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const handleTabletConnectionChange = useCallback((event: TabletConnectionEvent) => {
        console.log('Tablet connection changed:', event);
        onTabletConnectionChange?.(event);

        // Create notification
        const notification: NotificationEvent = {
            id: `tablet-${event.action}-${Date.now()}`,
            type: event.action === 'connected' ? 'tablet_connected' : 'tablet_disconnected',
            title: event.action === 'connected' ? 'Tablet połączony' : 'Tablet rozłączony',
            message: `${event.deviceName || event.deviceId} jest teraz ${event.action === 'connected' ? 'online' : 'offline'}`,
            timestamp: new Date().toISOString(),
            read: false,
            deviceId: event.deviceId
        };

        addNotification(notification);
    }, [onTabletConnectionChange]);

    const handleSignatureUpdate = useCallback((event: SignatureRequestEvent) => {
        console.log('Signature update:', event);
        onSignatureUpdate?.(event);

        // Create notification based on status
        let notification: NotificationEvent;

        if (event.status === 'signed') {
            notification = {
                id: `signature-complete-${Date.now()}`,
                type: 'signature_completed',
                title: 'Podpis złożony',
                message: `${event.customerName} złożył podpis cyfrowy`,
                timestamp: new Date().toISOString(),
                read: false,
                sessionId: event.sessionId
            };
        } else if (event.status === 'expired') {
            notification = {
                id: `signature-expired-${Date.now()}`,
                type: 'signature_expired',
                title: 'Sesja wygasła',
                message: `Sesja podpisu dla ${event.customerName} wygasła`,
                timestamp: new Date().toISOString(),
                read: false,
                sessionId: event.sessionId
            };
        } else {
            return; // Don't create notification for other statuses
        }

        addNotification(notification);
    }, [onSignatureUpdate]);

    const handleNotificationReceived = useCallback((notification: NotificationEvent) => {
        console.log('New notification:', notification);
        addNotification(notification);
        onNotification?.(notification);
    }, [onNotification]);

    const {
        connectionStatus,
        connectedDevices,
        connect,
        disconnect
    } = useWebSocket({
        tenantId,
        onTabletConnectionChange: handleTabletConnectionChange,
        onSignatureUpdate: handleSignatureUpdate,
        onNotification: handleNotificationReceived,
        autoConnect: true
    });

    const addNotification = useCallback((notification: NotificationEvent) => {
        setNotifications(prev => [notification, ...prev].slice(0, 20)); // Keep last 20 notifications

        // Show browser notification if permission granted
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico'
            });
        }
    }, []);

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

    // Request notification permission on mount
    React.useEffect(() => {
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

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
                            Próba {connectionStatus.reconnectAttempts}/10
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

                    {connectionStatus.status === 'connected' && (
                        <DisconnectButton onClick={disconnect}>
                            <FaTimes />
                            Rozłącz
                        </DisconnectButton>
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
                                        {notification.type === 'tablet_disconnected' && <FaExclamationTriangle />}
                                        {notification.type === 'signature_completed' && <FaSignature />}
                                        {notification.type === 'signature_expired' && <FaExclamationTriangle />}
                                        {notification.type === 'system_alert' && <FaBell />}
                                    </NotificationIcon>
                                    <NotificationContent>
                                        <NotificationTitle>{notification.title}</NotificationTitle>
                                        <NotificationMessage>{notification.message}</NotificationMessage>
                                        <NotificationTime>
                                            {new Date(notification.timestamp).toLocaleTimeString('pl-PL')}
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

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 12px;
    }
`;

const ConnectionStatus = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
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

    @media (max-width: 768px) {
        display: none;
    }
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

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
    }
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
        transform: scale(1.05);
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
        transform: translateY(-1px);
    }
`;

const DisconnectButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    color: #64748b;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
        color: #475569;
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

    @media (max-width: 768px) {
        width: 350px;
        right: -20px;
    }
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
    transition: color 0.2s;

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
    transition: all 0.2s;

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