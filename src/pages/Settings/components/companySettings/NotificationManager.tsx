// src/pages/Settings/components/NotificationManager.tsx
import React from 'react';
import styled from 'styled-components';
import {useNotifications} from '../../../../hooks/useNotifications';

export const NotificationManager: React.FC = () => {
    const { notifications, clearNotification } = useNotifications();

    if (notifications.length === 0) return null;

    return (
        <NotificationContainer>
            {notifications.map(notification => (
                <NotificationMessage
                    key={notification.id}
                    $type={notification.type}
                    onClick={() => clearNotification(notification.id)}
                >
                    <MessageIcon>
                        {notification.type === 'success' ? '✓' : '⚠️'}
                    </MessageIcon>
                    <MessageText>{notification.message}</MessageText>
                </NotificationMessage>
            ))}
        </NotificationContainer>
    );
};

const NotificationContainer = styled.div`
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 400px;

    @media (max-width: 768px) {
        bottom: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
    }
`;

const NotificationMessage = styled.div<{ $type: 'success' | 'error' }>`
    display: flex;
    align-items: center;
    gap: 12px;
    background: ${props => props.$type === 'success' ? '#d1fae5' : '#fee2e2'};
    color: ${props => props.$type === 'success' ? '#059669' : '#dc2626'};
    padding: 16px 20px;
    border-radius: 12px;
    border: 1px solid ${props => props.$type === 'success' ? '#059669' : '#dc2626'}30;
    font-weight: 500;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    animation: slideInFromRight 0.3s ease-out;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }

    @keyframes slideInFromRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

const MessageIcon = styled.div`
    font-size: 18px;
    flex-shrink: 0;
`;

const MessageText = styled.div`
    flex: 1;
    font-weight: 500;
`;