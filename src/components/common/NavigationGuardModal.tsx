// src/components/common/NavigationGuardModal.tsx
import React from 'react';
import Modal from './Modal';
import { FaExclamationTriangle } from 'react-icons/fa';
import styled from 'styled-components';

interface NavigationGuardModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message?: string;
}

export const NavigationGuardModal: React.FC<NavigationGuardModalProps> = ({
                                                                              isOpen,
                                                                              onConfirm,
                                                                              onCancel,
                                                                              title = 'Niezapisane zmiany',
                                                                              message = 'Masz niezapisane zmiany w tej sekcji. Czy na pewno chcesz kontynuować bez zapisywania?'
                                                                          }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title={title}
            size="md"
            closeOnBackdropClick={false}
        >
            <ModalContent>
                <WarningIcon>
                    <FaExclamationTriangle />
                </WarningIcon>

                <Message>{message}</Message>

                <ActionsContainer>
                    <ActionButton $secondary onClick={onCancel}>
                        Anuluj
                    </ActionButton>
                    <ActionButton $danger onClick={onConfirm}>
                        Kontynuuj bez zapisywania
                    </ActionButton>
                </ActionsContainer>
            </ModalContent>
        </Modal>
    );
};

const ModalContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 48px 32px;
    text-align: center;
`;

const WarningIcon = styled.div`
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #d97706;
    font-size: 32px;
    box-shadow: 0 8px 32px rgba(217, 119, 6, 0.15);
`;

const Message = styled.p`
    font-size: 16px;
    color: #475569;
    margin: 0;
    line-height: 1.6;
    max-width: 400px;
    font-weight: 500;
`;

const ActionsContainer = styled.div`
    display: flex;
    gap: 16px;
    margin-top: 16px;
    
    @media (max-width: 480px) {
        flex-direction: column;
        width: 100%;
        
        > * {
            width: 100%;
        }
    }
`;

const ActionButton = styled.button<{ $secondary?: boolean; $danger?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;
    
    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    &:active {
        transform: translateY(0);
    }
    
    ${props => props.$secondary && `
        background: #f8fafc;
        color: #475569;
        border-color: #e2e8f0;
        
        &:hover {
            background: #f1f5f9;
            color: #334155;
            border-color: #cbd5e1;
        }
    `}
    
    ${props => props.$danger && `
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        
        &:hover {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        }
    `}
`;