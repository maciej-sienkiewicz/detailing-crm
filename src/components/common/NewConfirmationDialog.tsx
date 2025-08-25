// src/components/common/ConfirmationDialog.tsx
import React from 'react';
import styled, {keyframes} from 'styled-components';
import {FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes} from 'react-icons/fa';
import {theme} from '../../styles/theme';

interface ConfirmationDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'info' | 'warning' | 'success' | 'error';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
                                                                          isOpen,
                                                                          title,
                                                                          message,
                                                                          confirmText,
                                                                          cancelText,
                                                                          onConfirm,
                                                                          onCancel,
                                                                          type = 'info'
                                                                      }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'warning': return <FaExclamationTriangle />;
            case 'success': return <FaCheck />;
            case 'error': return <FaTimes />;
            default: return <FaInfoCircle />;
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'warning': return theme.warning;
            case 'success': return theme.success;
            case 'error': return theme.error;
            default: return theme.primary;
        }
    };

    const getIconBgColor = () => {
        switch (type) {
            case 'warning': return theme.warningBg;
            case 'success': return theme.successBg;
            case 'error': return theme.errorBg;
            default: return theme.primaryGhost;
        }
    };

    return (
        <ModalOverlay onClick={onCancel}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalIcon $color={getIconColor()} $bgColor={getIconBgColor()}>
                        {getIcon()}
                    </ModalIcon>
                    <ModalTitle>{title}</ModalTitle>
                </ModalHeader>

                <ModalBody>
                    <ModalMessage>{message}</ModalMessage>
                </ModalBody>

                <ModalActions>
                    <ModalButton $variant="secondary" onClick={onCancel}>
                        <FaTimes />
                        {cancelText}
                    </ModalButton>
                    <ModalButton $variant="primary" onClick={onConfirm}>
                        <FaCheck />
                        {confirmText}
                    </ModalButton>
                </ModalActions>
            </ModalContainer>
        </ModalOverlay>
    );
};

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  animation: ${fadeIn} 0.2s ease-out;

  @media (max-width: 768px) {
    padding: ${theme.spacing.lg};
  }
`;

const ModalContainer = styled.div`
  background: ${theme.surface};
  border-radius: ${theme.radius.xl};
  box-shadow: ${theme.shadow.xl};
  max-width: 500px;
  width: 100%;
  overflow: hidden;
  border: 1px solid ${theme.border};
  animation: ${slideIn} 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    max-width: calc(100% - ${theme.spacing.xxxl});
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xxxl} ${theme.spacing.xxxl} ${theme.spacing.xl};
  background: ${theme.surfaceElevated};
  border-bottom: 1px solid ${theme.borderLight};
`;

const ModalIcon = styled.div<{ $color: string; $bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: ${props => props.$bgColor};
  color: ${props => props.$color};
  border-radius: ${theme.radius.lg};
  font-size: 24px;
  flex-shrink: 0;
  box-shadow: ${theme.shadow.sm};
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.text.primary};
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.025em;
`;

const ModalBody = styled.div`
  padding: ${theme.spacing.xl} ${theme.spacing.xxxl} ${theme.spacing.xxxl};
`;

const ModalMessage = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${theme.text.secondary};
  line-height: 1.6;
  margin: 0;
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl} ${theme.spacing.xxxl} ${theme.spacing.xxxl};
  background: ${theme.surfaceElevated};
  border-top: 1px solid ${theme.borderLight};

  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${theme.spacing.md};
  }
`;

const ModalButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg} ${theme.spacing.xxl};
  border-radius: ${theme.radius.lg};
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid;
  flex: 1;
  min-height: 48px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadow.md};
  }

  &:active {
    transform: translateY(0);
  }

  ${props => {
    switch (props.$variant) {
        case 'secondary':
            return `
          background: ${theme.surface};
          color: ${theme.text.secondary};
          border-color: ${theme.border};
          
          &:hover {
            background: ${theme.surfaceHover};
            border-color: ${theme.borderActive};
            color: ${theme.text.primary};
          }
        `;
        case 'primary':
            return `
          background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
          color: white;
          border-color: ${theme.primary};
          box-shadow: ${theme.shadow.sm};
          
          &:hover {
            background: linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 100%);
            border-color: ${theme.primaryDark};
          }
        `;
    }
}}

  svg {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    padding: ${theme.spacing.lg};
  }
`;