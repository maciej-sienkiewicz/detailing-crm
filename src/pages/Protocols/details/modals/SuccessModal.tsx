import React from 'react';
import styled from 'styled-components';
import { FaCheckCircle, FaCarSide } from 'react-icons/fa';
import Modal from '../../../../components/common/Modal';

const brand = {
    primary: 'var(--brand-primary, #1a365d)',
    success: '#059669',
    successBg: '#ecfdf5',
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

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    icon?: React.ReactNode;
    buttonText?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       title,
                                                       message,
                                                       icon = <FaCheckCircle />,
                                                       buttonText = "OK"
                                                   }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            size="md"
            showCloseButton={false}
            closeOnBackdropClick={true}
        >
            <ModalContent>
                <SuccessContainer>
                    <SuccessIcon>
                        {icon}
                    </SuccessIcon>
                    <SuccessText>
                        <SuccessTitle>{title}</SuccessTitle>
                        <SuccessDescription>
                            {message}
                        </SuccessDescription>
                    </SuccessText>
                </SuccessContainer>

                <Actions>
                    <SuccessButton onClick={onClose}>
                        {buttonText}
                    </SuccessButton>
                </Actions>
            </ModalContent>
        </Modal>
    );
};

const ModalContent = styled.div`
    padding: ${brand.space.xxl};
    display: flex;
    flex-direction: column;
    gap: ${brand.space.xxl};
    text-align: center;
`;

const SuccessContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${brand.space.lg};
    padding: ${brand.space.xl};
    background: ${brand.successBg};
    border: 1px solid rgba(5, 150, 105, 0.2);
    border-radius: ${brand.radius.lg};
`;

const SuccessIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: ${brand.success}20;
    color: ${brand.success};
    border-radius: 50%;
    font-size: 28px;
    flex-shrink: 0;
    box-shadow: 0 0 0 8px ${brand.success}10;
`;

const SuccessText = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brand.space.md};
    max-width: 400px;
`;

const SuccessTitle = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${brand.textPrimary};
    line-height: 1.3;
`;

const SuccessDescription = styled.div`
    font-size: 15px;
    color: ${brand.textSecondary};
    line-height: 1.5;
`;

const Actions = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const SuccessButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${brand.space.md} ${brand.space.xxl};
    background: ${brand.success};
    color: white;
    border: 2px solid ${brand.success};
    border-radius: ${brand.radius.md};
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 48px;
    min-width: 120px;

    &:hover {
        background: #047857;
        border-color: #047857;
        transform: translateY(-1px);
        box-shadow: ${brand.shadow.moderate};
    }

    &:active {
        transform: translateY(0);
    }
`;

export default SuccessModal;