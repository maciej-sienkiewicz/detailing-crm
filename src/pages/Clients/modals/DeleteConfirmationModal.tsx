// components/modals/DeleteConfirmationModal.tsx
import React from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle, FaTimes, FaTrash } from 'react-icons/fa';
import {ClientExpanded} from "../../../types";
import Modal from "../../../components/common/Modal";

// Professional Brand Theme
const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',

    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',

    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
    },

    border: '#e2e8f0',
    borderLight: '#f1f5f9',

    status: {
        error: '#dc2626',
        errorLight: '#fee2e2',
    },

    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },

    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
    },

    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
    }
};

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    client: ClientExpanded | null;
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
                                                                             isOpen,
                                                                             client,
                                                                             onConfirm,
                                                                             onCancel
                                                                         }) => {
    if (!client) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title="Potwierdź usunięcie"
            size="sm"
            closeOnBackdropClick={false}
        >
            <ModalContent>
                <IconSection>
                    <WarningIcon>
                        <FaExclamationTriangle />
                    </WarningIcon>
                </IconSection>

                <ContentSection>
                    <MainTitle>Czy na pewno chcesz usunąć klienta?</MainTitle>

                    <ClientInfo>
                        <ClientName>
                            {client.firstName} {client.lastName}
                        </ClientName>
                        <ClientDetails>
                            {client.email} • {client.phone}
                        </ClientDetails>
                        {client.company && (
                            <ClientCompany>
                                {client.company}
                            </ClientCompany>
                        )}
                    </ClientInfo>

                    <WarningText>
                        Ta operacja jest <strong>nieodwracalna</strong>. Wszystkie dane klienta,
                        w tym historia wizyt i kontaktów, zostaną permanentnie usunięte.
                    </WarningText>

                    {client.totalVisits > 0 && (
                        <AdditionalWarning>
                            ⚠️ Klient ma {client.totalVisits} {client.totalVisits === 1 ? 'wizytę' : 'wizyt'} w historii
                        </AdditionalWarning>
                    )}
                </ContentSection>

                <ActionsSection>
                    <CancelButton onClick={onCancel}>
                        <FaTimes />
                        <span>Anuluj</span>
                    </CancelButton>

                    <DeleteButton onClick={onConfirm}>
                        <FaTrash />
                        <span>Usuń klienta</span>
                    </DeleteButton>
                </ActionsSection>
            </ModalContent>
        </Modal>
    );
};

// Professional Styled Components
const ModalContent = styled.div`
    padding: ${brandTheme.spacing.lg};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
`;

const IconSection = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: ${brandTheme.spacing.md};
`;

const WarningIcon = styled.div`
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, ${brandTheme.status.errorLight} 0%, #fef2f2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.status.error};
    font-size: 28px;
    box-shadow: ${brandTheme.shadow.md};
    border: 3px solid white;
`;

const ContentSection = styled.div`
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const MainTitle = styled.h3`
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;
`;

const ClientInfo = styled.div`
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.borderLight};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.md};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const ClientName = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const ClientDetails = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const ClientCompany = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.tertiary};
    font-style: italic;
`;

const WarningText = styled.p`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    line-height: 1.5;
    margin: 0;
    
    strong {
        color: ${brandTheme.status.error};
        font-weight: 600;
    }
`;

const AdditionalWarning = styled.div`
    background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 10%, #fff7ed 100%);
    border: 1px solid #fed7aa;
    border-radius: ${brandTheme.radius.md};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    font-size: 13px;
    color: #c2410c;
    font-weight: 500;
    text-align: left;
`;

const ActionsSection = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    justify-content: flex-end;
    padding-top: ${brandTheme.spacing.md};
    border-top: 1px solid ${brandTheme.borderLight};
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 44px;
    border: 1px solid transparent;

    &:hover {
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    span {
        @media (max-width: 480px) {
            display: none;
        }
    }
`;

const CancelButton = styled(BaseButton)`
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border-color: ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.xs};

    &:hover {
        background: ${brandTheme.surfaceAlt};
        color: ${brandTheme.text.primary};
        box-shadow: ${brandTheme.shadow.sm};
    }
`;

const DeleteButton = styled(BaseButton)`
    background: linear-gradient(135deg, ${brandTheme.status.error} 0%, #b91c1c 100%);
    color: white;
    box-shadow: ${brandTheme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

export default DeleteConfirmationModal;