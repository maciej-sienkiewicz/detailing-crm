// src/hooks/useWebSocket.ts
import { useState, useEffect, useCallback, useRef } from 'react';

// Types for WebSocket messages
interface TabletConnectionEvent {
    deviceId: string;
    deviceName: string;
    companyId: number;          // Changed from tenantId to companyId
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

interface ConnectionStatus {
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    lastConnected?: Date;
    reconnectAttempts: number;
    error?: string;
}

interface UseWebSocketOptions {
    companyId?: number;                    // Changed from tenantId to companyId
    onTabletConnectionChange?: (event: TabletConnectionEvent) => void;
    onSignatureUpdate?: (event: SignatureRequestEvent) => void;
    onNotification?: (notification: NotificationEvent) => void;
    autoConnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}

interface UseWebSocketResult {
    connectionStatus: ConnectionStatus;
    connectedDevices: Set<string>;
    connect: () => void;
    disconnect: () => void;
    sendMessage: (message: any) => void;
}

const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token') || localStorage.getItem('authToken');
};

const getCompanyId = (): number | null => {
    const companyId = localStorage.getItem('companyId');
    return companyId ? parseInt(companyId, 10) : null;
};

const getWorkstationId = (): string => {
    // Generate or get workstation ID for WebSocket connection
    let workstationId = localStorage.getItem('workstationId');
    if (!workstationId) {
        workstationId = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('workstationId', workstationId);
    }
    return workstationId;
};

export const useWebSocket = (options: UseWebSocketOptions): UseWebSocketResult => {
    const {
        companyId: optionsCompanyId,
        onTabletConnectionChange,
        onSignatureUpdate,
        onNotification,
        autoConnect = true,
        reconnectInterval = 5000,
        maxReconnectAttempts = 10
    } = options;

    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
        status: 'disconnected',
        reconnectAttempts: 0
    });

    const [connectedDevices, setConnectedDevices] = useState<Set<string>>(new Set());

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Get company ID from options or localStorage
    const companyId = optionsCompanyId || getCompanyId();

    const clearTimeouts = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
    }, []);

    const startHeartbeat = useCallback(() => {
        clearTimeouts();

        heartbeatIntervalRef.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'heartbeat',
                    payload: {
                        timestamp: new Date().toISOString(),
                        companyId
                    }
                }));
            }
        }, 30000); // Send heartbeat every 30 seconds
    }, [companyId, clearTimeouts]);

    const handleMessage = useCallback((event: MessageEvent) => {
        try {
            const message = JSON.parse(event.data);
            console.log('📨 WebSocket message received:', message);

            switch (message.type) {
                case 'tablet_connection':
                    const tabletEvent: TabletConnectionEvent = {
                        deviceId: message.payload.deviceId,
                        deviceName: message.payload.deviceName || message.payload.deviceId,
                        companyId: message.payload.companyId,
                        locationId: message.payload.locationId,
                        action: message.payload.action,
                        timestamp: message.payload.timestamp || new Date().toISOString()
                    };

                    // Update connected devices
                    setConnectedDevices(prev => {
                        const newSet = new Set(prev);
                        if (tabletEvent.action === 'connected') {
                            newSet.add(tabletEvent.deviceId);
                        } else {
                            newSet.delete(tabletEvent.deviceId);
                        }
                        return newSet;
                    });

                    onTabletConnectionChange?.(tabletEvent);
                    break;

                case 'signature_update':
                    const signatureEvent: SignatureRequestEvent = {
                        sessionId: message.payload.sessionId,
                        deviceId: message.payload.deviceId,
                        customerName: message.payload.customerName,
                        status: message.payload.status,
                        timestamp: message.payload.timestamp || new Date().toISOString()
                    };

                    onSignatureUpdate?.(signatureEvent);
                    break;

                case 'notification':
                    const notification: NotificationEvent = {
                        id: message.payload.id || `notif-${Date.now()}`,
                        type: message.payload.type,
                        title: message.payload.title,
                        message: message.payload.message,
                        timestamp: message.payload.timestamp || new Date().toISOString(),
                        read: false,
                        deviceId: message.payload.deviceId,
                        sessionId: message.payload.sessionId
                    };

                    onNotification?.(notification);
                    break;

                case 'heartbeat':
                    // Response to heartbeat - connection is healthy
                    console.log('💓 Heartbeat response received');
                    break;

                case 'connection':
                    if (message.payload.status === 'authenticated') {
                        console.log('✅ WebSocket authentication successful');
                        setConnectionStatus(prev => ({
                            ...prev,
                            status: 'connected',
                            lastConnected: new Date(),
                            reconnectAttempts: 0,
                            error: undefined
                        }));
                        startHeartbeat();
                    }
                    break;

                case 'error':
                    console.error('❌ WebSocket error message:', message.payload);
                    setConnectionStatus(prev => ({
                        ...prev,
                        error: message.payload.error || 'Unknown error'
                    }));
                    break;

                default:
                    console.log('🤷 Unknown WebSocket message type:', message.type);
            }
        } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error, event.data);
        }
    }, [onTabletConnectionChange, onSignatureUpdate, onNotification, startHeartbeat]);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log('🔗 WebSocket already connected');
            return;
        }

        if (!companyId) {
            console.error('❌ Cannot connect: No company ID available');
            setConnectionStatus(prev => ({
                ...prev,
                status: 'error',
                error: 'No company ID available'
            }));
            return;
        }

        const token = getAuthToken();
        if (!token) {
            console.error('❌ Cannot connect: No auth token available');
            setConnectionStatus(prev => ({
                ...prev,
                status: 'error',
                error: 'No authentication token available'
            }));
            return;
        }

        const workstationId = getWorkstationId();
        const wsUrl = `ws://localhost:8080/ws/workstation/${workstationId}`;

        console.log('🔗 Connecting to WebSocket...', {
            url: wsUrl,
            companyId,
            workstationId: workstationId.substring(0, 20) + '...'
        });

        setConnectionStatus(prev => ({
            ...prev,
            status: 'connecting'
        }));

        try {
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('🔗 WebSocket connection opened');

                // Send authentication message
                const authMessage = {
                    type: 'authentication',
                    payload: {
                        token,
                        workstationId,
                        companyId,
                        timestamp: new Date().toISOString()
                    }
                };

                wsRef.current?.send(JSON.stringify(authMessage));
                console.log('🔐 Authentication message sent');
            };

            wsRef.current.onmessage = handleMessage;

            wsRef.current.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                setConnectionStatus(prev => ({
                    ...prev,
                    status: 'error',
                    error: 'Connection error'
                }));
            };

            wsRef.current.onclose = (event) => {
                console.log('🔗 WebSocket connection closed:', event.code, event.reason);
                clearTimeouts();

                setConnectionStatus(prev => ({
                    ...prev,
                    status: 'disconnected'
                }));

                setConnectedDevices(new Set());

                // Auto-reconnect if not manually disconnected
                if (event.code !== 1000 && connectionStatus.reconnectAttempts < maxReconnectAttempts) {
                    console.log(`🔄 Attempting to reconnect in ${reconnectInterval}ms... (attempt ${connectionStatus.reconnectAttempts + 1}/${maxReconnectAttempts})`);

                    setConnectionStatus(prev => ({
                        ...prev,
                        reconnectAttempts: prev.reconnectAttempts + 1
                    }));

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, reconnectInterval);
                } else if (connectionStatus.reconnectAttempts >= maxReconnectAttempts) {
                    console.error('❌ Max reconnection attempts reached');
                    setConnectionStatus(prev => ({
                        ...prev,
                        status: 'error',
                        error: 'Max reconnection attempts reached'
                    }));
                }
            };
        } catch (error) {
            console.error('❌ Error creating WebSocket connection:', error);
            setConnectionStatus(prev => ({
                ...prev,
                status: 'error',
                error: 'Failed to create connection'
            }));
        }
    }, [companyId, connectionStatus.reconnectAttempts, maxReconnectAttempts, reconnectInterval, handleMessage, clearTimeouts]);

    const disconnect = useCallback(() => {
        console.log('🔗 Disconnecting WebSocket...');
        clearTimeouts();

        if (wsRef.current) {
            wsRef.current.close(1000, 'Manual disconnect');
            wsRef.current = null;
        }

        setConnectionStatus({
            status: 'disconnected',
            reconnectAttempts: 0
        });

        setConnectedDevices(new Set());
    }, [clearTimeouts]);

    const sendMessage = useCallback((message: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const messageWithCompany = {
                ...message,
                companyId,
                timestamp: new Date().toISOString()
            };

            wsRef.current.send(JSON.stringify(messageWithCompany));
            console.log('📤 WebSocket message sent:', messageWithCompany);
        } else {
            console.warn('⚠️ Cannot send message: WebSocket not connected');
        }
    }, [companyId]);

    // Auto-connect on mount if enabled
    useEffect(() => {
        if (autoConnect && companyId) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [autoConnect, companyId]); // Don't include connect/disconnect to avoid loops

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearTimeouts();
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [clearTimeouts]);

    return {
        connectionStatus,
        connectedDevices,
        connect,
        disconnect,
        sendMessage
    };
};