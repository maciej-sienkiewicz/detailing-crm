// src/components/common/Toast/Toast.tsx
import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    onClose?: (id: string) => void;
    visible?: boolean;
}

const Toast: React.FC<ToastProps> = ({
                                         id,
                                         type,
                                         message,
                                         duration = 5000,
                                         onClose,
                                         visible = true
                                     }) => {
    const [isVisible, setIsVisible] = useState(visible);

    useEffect(() => {
        setIsVisible(visible);
    }, [visible]);

    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onClose) {
                    setTimeout(() => onClose(id), 300); // Allow animation to complete
                }
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose, id]);

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) {
            setTimeout(() => onClose(id), 300); // Allow animation to complete
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheckCircle />;
            case 'error':
                return <FaExclamationTriangle />;
            case 'info':
                return <FaInfoCircle />;
            default:
                return <FaInfoCircle />;
        }
    };

    return (
        <ToastContainer type={type} visible={isVisible}>
            <IconContainer>{getIcon()}</IconContainer>
            <MessageText>{message}</MessageText>
            <CloseButton onClick={handleClose}>
                <FaTimes />
            </CloseButton>
        </ToastContainer>
    );
};

// Toast context for app-wide notifications
interface ToastContextType {
    showToast: (type: ToastType, message: string, duration?: number) => void;
    hideToast: (id: string) => void;
    hideAllToasts: () => void;
}

interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

export const ToastContext = React.createContext<ToastContextType>({
    showToast: () => {},
    hideToast: () => {},
    hideAllToasts: () => {}
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = (type: ToastType, message: string, duration?: number) => {
        const newToast: ToastItem = {
            id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type,
            message,
            duration
        };
        setToasts(prevToasts => [...prevToasts, newToast]);
    };

    const hideToast = (id: string) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    };

    const hideAllToasts = () => {
        setToasts([]);
    };

    return (
        <ToastContext.Provider value={{ showToast, hideToast, hideAllToasts }}>
            {children}
            <ToastsContainer>
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        id={toast.id}
                        type={toast.type}
                        message={toast.message}
                        duration={toast.duration}
                        onClose={hideToast}
                    />
                ))}
            </ToastsContainer>
        </ToastContext.Provider>
    );
};

// Custom hook to use the toast
export const useToast = () => {
    return React.useContext(ToastContext);
};

// Animations
const slideIn = keyframes`
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
`;

const slideOut = keyframes`
    from {
        transform: translateY(0);
        opacity: 1;
    }
    to {
        transform: translateY(100%);
        opacity: 0;
    }
`;

// Styled components
const ToastsContainer = styled.div`
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 9999;
`;

const ToastContainer = styled.div<{ type: ToastType; visible: boolean }>`
  display: flex;
  align-items: center;
  min-width: 280px;
  max-width: 450px;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: ${props => props.visible ? css`${slideIn} 0.3s forwards` : css`${slideOut} 0.3s forwards`};

  ${props => {
    switch (props.type) {
        case 'success':
            return `
          background-color: #eafaf1;
          border-left: 4px solid #2ecc71;
          color: #27ae60;
        `;
        case 'error':
            return `
          background-color: #fdecea;
          border-left: 4px solid #e74c3c;
          color: #c0392b;
        `;
        case 'info':
            return `
          background-color: #eaf2fd;
          border-left: 4px solid #3498db;
          color: #2980b9;
        `;
        default:
            return '';
    }
}}
`;

const IconContainer = styled.div`
    font-size: 20px;
    margin-right: 12px;
    display: flex;
    align-items: center;
`;

const MessageText = styled.div`
    flex: 1;
    font-size: 14px;
    font-weight: 500;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    color: inherit;
    margin-left: 8px;

    &:hover {
        opacity: 1;
    }
`;

export default Toast;