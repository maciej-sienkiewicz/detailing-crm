// src/hooks/useWebSocket.ts
import { useState, useEffect, useRef, useCallback } from 'react';

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

interface UseWebSocketProps {
    tenantId: string;
    onTabletConnectionChange?: (event: TabletConnectionEvent) => void;
    onSignatureUpdate?: (event: SignatureRequestEvent) => void;
    onNotification?: (notification: NotificationEvent) => void;
    autoConnect?: boolean;
}

interface UseWebSocketReturn {
    connectionStatus: ConnectionStatus;
    connectedDevices: Set<string>;
    recentActivity: WebSocketMessage[];
    connect: () => void;
    disconnect: () => void;
    sendMessage: (message: WebSocketMessage) => boolean;
}

export const useWebSocket = ({
                                 tenantId,
                                 onTabletConnectionChange,
                                 onSignatureUpdate,
                                 onNotification,
                                 autoConnect = true
                             }: UseWebSocketProps): UseWebSocketReturn => {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
        status: 'disconnected',
        reconnectAttempts: 0
    });

    const [connectedDevices, setConnectedDevices] = useState<Set<string>>(new Set());
    const [recentActivity, setRecentActivity] = useState<WebSocketMessage[]>([]);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const maxReconnectAttempts = 10;
    const reconnectInterval = 3000;
    const connectionAttemptRef = useRef<boolean>(false);

    const connect = useCallback(() => {
        // Prevent multiple connection attempts
        if (connectionAttemptRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        connectionAttemptRef.current = true;
        setConnectionStatus(prev => ({ ...prev, status: 'connecting' }));

        try {
            // Generate unique workstation ID
            const workstationId = `workstation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Use pure WebSocket without SockJS
            const wsUrl = `ws://localhost:8080/ws/workstation/${workstationId}`;

            console.log('Attempting WebSocket connection to:', wsUrl);

            wsRef.current = new WebSocket(wsUrl);

            // Get auth token
            const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');

            wsRef.current.onopen = () => {
                console.log('WebSocket connected successfully to:', wsUrl);
                connectionAttemptRef.current = false;

                setConnectionStatus({
                    status: 'connected',
                    lastConnected: new Date(),
                    reconnectAttempts: 0
                });

                // Send authentication immediately after connection
                if (token) {
                    const authMessage: WebSocketMessage = {
                        type: 'authentication',
                        payload: {
                            token: token,
                            tenantId,
                            userType: 'workstation',
                            workstationId: workstationId,
                            timestamp: new Date().toISOString()
                        },
                        timestamp: new Date().toISOString()
                    };

                    console.log('Sending authentication message');
                    wsRef.current?.send(JSON.stringify(authMessage));
                } else {
                    console.warn('No auth token available - connection may be rejected');

                    // Send connection message without token
                    const connectionMessage: WebSocketMessage = {
                        type: 'connection',
                        payload: {
                            tenantId,
                            userType: 'workstation',
                            workstationId: workstationId,
                            timestamp: new Date().toISOString()
                        },
                        timestamp: new Date().toISOString()
                    };

                    wsRef.current?.send(JSON.stringify(connectionMessage));
                }
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    console.log('WebSocket message received:', message);
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
                connectionAttemptRef.current = false;

                setConnectionStatus(prev => ({
                    ...prev,
                    status: 'disconnected'
                }));

                // Only reconnect if it wasn't intentional closure (code 1000)
                if (event.code !== 1000 && connectionStatus.reconnectAttempts < maxReconnectAttempts) {
                    const delay = Math.min(
                        reconnectInterval * Math.pow(1.5, connectionStatus.reconnectAttempts),
                        30000 // Max 30 seconds delay
                    );

                    console.log(`Scheduling reconnection in ${delay}ms (attempt ${connectionStatus.reconnectAttempts + 1})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        setConnectionStatus(prev => ({
                            ...prev,
                            reconnectAttempts: prev.reconnectAttempts + 1
                        }));
                        connect();
                    }, delay);
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                connectionAttemptRef.current = false;
                setConnectionStatus(prev => ({ ...prev, status: 'error' }));
            };

        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            connectionAttemptRef.current = false;
            setConnectionStatus(prev => ({ ...prev, status: 'error' }));
        }
    }, [tenantId, connectionStatus.reconnectAttempts]);

    const disconnect = useCallback(() => {
        console.log('Disconnecting WebSocket...');

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = undefined;
        }

        connectionAttemptRef.current = false;

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
            case 'authentication':
                console.log('Authentication response:', message.payload);
                if (message.payload.status === 'authenticated') {
                    console.log('Successfully authenticated with WebSocket server');
                    console.log('User roles:', message.payload.roles);
                    console.log('User permissions:', message.payload.permissions);
                } else {
                    console.error('Authentication failed:', message.payload);
                }
                break;

            case 'connection':
                console.log('Connection status received:', message.payload);
                if (message.payload.status === 'connected' && !message.payload.authenticated) {
                    console.log('Connected to WebSocket, but not yet authenticated');
                }
                break;

            case 'tablet_connected':
                const connectEvent: TabletConnectionEvent = {
                    ...message.payload,
                    action: 'connected'
                };
                setConnectedDevices(prev => new Set([...prev, message.payload.deviceId]));
                onTabletConnectionChange?.(connectEvent);
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
                break;

            case 'signature_completed':
                const signatureEvent: SignatureRequestEvent = {
                    ...message.payload,
                    status: 'signed'
                };
                onSignatureUpdate?.(signatureEvent);
                break;

            case 'signature_expired':
                const expiredEvent: SignatureRequestEvent = {
                    ...message.payload,
                    status: 'expired'
                };
                onSignatureUpdate?.(expiredEvent);
                break;

            case 'heartbeat':
                // Handle heartbeat - no action needed
                break;

            case 'error':
                console.error('WebSocket error message received:', message.payload);

                // If authentication error, stop reconnect attempts
                if (message.payload.error && message.payload.error.includes('Authentication failed')) {
                    console.error('Authentication failed - stopping reconnection attempts');
                    setConnectionStatus(prev => ({
                        ...prev,
                        status: 'error',
                        reconnectAttempts: maxReconnectAttempts // Stop reconnection attempts
                    }));
                }
                break;

            default:
                console.log('Unknown message type:', message.type, message);
        }
    }, [onTabletConnectionChange, onSignatureUpdate, maxReconnectAttempts]);

    const sendMessage = useCallback((message: WebSocketMessage): boolean => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            try {
                wsRef.current.send(JSON.stringify({
                    ...message,
                    timestamp: new Date().toISOString()
                }));
                return true;
            } catch (error) {
                console.error('Error sending WebSocket message:', error);
                return false;
            }
        } else {
            console.warn('Cannot send message - WebSocket not connected');
            return false;
        }
    }, []);

    // Auto-connect on mount with proper cleanup
    useEffect(() => {
        let isMounted = true;
        let connectTimer: NodeJS.Timeout;

        const connectIfMounted = () => {
            if (isMounted && !connectionAttemptRef.current && autoConnect) {
                connect();
            }
        };

        // Delay initial connection to avoid React strict mode double mounting
        connectTimer = setTimeout(connectIfMounted, 500);

        return () => {
            isMounted = false;
            clearTimeout(connectTimer);
            disconnect();
        };
    }, [tenantId, autoConnect, connect, disconnect]);

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

    return {
        connectionStatus,
        connectedDevices,
        recentActivity,
        connect,
        disconnect,
        sendMessage
    };
};