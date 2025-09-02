import React from 'react';
import styled from 'styled-components';
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import Modal from '../../../../components/common/Modal';

const brand = {
    primary: 'var(--brand-primary, #1a365d)',
    error: '#dc2626',
    errorBg: '#fef2f2',
    surface: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    space: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px'
    },
    radius: {
        md: '8px',
        lg: '12px'
    },
    shadow: {
        moderate: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
};

interface DeleteServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    serviceName: string;
    isDeleting?: boolean;
}

const DeleteServiceModal: React.FC<DeleteServiceModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   onConfirm,
                                                                   serviceName,
                                                                   isDeleting = false
                                                               }) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Usuwanie usługi"
            size="md"
            closeOnBackdropClick={!isDeleting}
        >
            <ModalContent>
                <AlertContainer>
                    <AlertIcon>
                        <FaExclamationTriangle />
                    </AlertIcon>
                    <AlertText>
                        <AlertTitle>Czy na pewno chcesz usunąć usługę?</AlertTitle>
                        <AlertDescription>
                            Usługa <strong>"{serviceName}"</strong> zostanie trwale usunięta z wizyty.
                            Ta akcja nie może być cofnięta.
                        </AlertDescription>
                    </AlertText>
                </AlertContainer>

                <Actions>
                    <CancelButton
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Anuluj
                    </CancelButton>
                    <DeleteButton
                        onClick={handleConfirm}
                        disabled={isDeleting}
                    >
                        <FaTrash />
                        {isDeleting ? 'Usuwanie...' : 'Usuń usługę'}
                    </DeleteButton>
                </Actions>
            </ModalContent>
        </Modal>
    );
};

const ModalContent = styled.div`
    padding: ${brand.space.xl};
    display: flex;
    flex-direction: column;
    gap: ${brand.space.xxl};
`;

const AlertContainer = styled.div`
    display: flex;
    gap: ${brand.space.lg};
    align-items: flex-start;
    padding: ${brand.space.xl};
    background: ${brand.errorBg};
    border: 1px solid rgba(220, 38, 38, 0.2);
    border-radius: ${brand.radius.lg};
`;

const AlertIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${brand.error}20;
    color: ${brand.error};
    border-radius: 50%;
    font-size: 20px;
    flex-shrink: 0;
`;

const AlertText = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${brand.space.sm};
`;

const AlertTitle = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${brand.textPrimary};
    line-height: 1.3;
`;

const AlertDescription = styled.div`
    font-size: 14px;
    color: ${brand.textSecondary};
    line-height: 1.5;

    strong {
        font-weight: 600;
        color: ${brand.textPrimary};
    }
`;

const Actions = styled.div`
    display: flex;
    gap: ${brand.space.md};
    justify-content: flex-end;
    align-items: center;
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brand.space.sm};
    padding: ${brand.space.md} ${brand.space.xl};
    border-radius: ${brand.radius.md};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    min-height: 44px;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: ${brand.shadow.moderate};
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const CancelButton = styled(BaseButton)`
    background: ${brand.surface};
    color: ${brand.textSecondary};
    border-color: ${brand.border};

    &:hover:not(:disabled) {
        background: #f8fafc;
        color: ${brand.textPrimary};
        border-color: ${brand.primary};
    }
`;

const DeleteButton = styled(BaseButton)`
    background: ${brand.error};
    color: white;
    border-color: ${brand.error};

    &:hover:not(:disabled) {
        background: #b91c1c;
        border-color: #b91c1c;
    }

    svg {
        font-size: 12px;
    }
`;

export default DeleteServiceModal;