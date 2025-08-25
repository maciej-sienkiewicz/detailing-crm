// src/hooks/useNotifications.ts
import {useCallback, useState} from 'react';

interface Notification {
    id: string;
    type: 'success' | 'error';
    message: string;
    timestamp: number;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((type: 'success' | 'error', message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        const notification: Notification = {
            id,
            type,
            message,
            timestamp: Date.now()
        };

        setNotifications(prev => [...prev, notification]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);

        return id;
    }, []);

    const clearNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const showSuccess = useCallback((message: string) => {
        return addNotification('success', message);
    }, [addNotification]);

    const showError = useCallback((message: string) => {
        return addNotification('error', message);
    }, [addNotification]);

    return {
        notifications,
        showSuccess,
        showError,
        clearNotification,
        clearNotifications
    };
};