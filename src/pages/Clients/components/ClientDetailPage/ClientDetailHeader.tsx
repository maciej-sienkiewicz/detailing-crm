import React from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaUser, FaEdit, FaTrash } from 'react-icons/fa';
import { theme } from "../../../../styles/theme";
import { ClientExpanded } from '../../../../types';

interface ClientDetailHeaderProps {
    client: ClientExpanded;
    onBack: () => void;
    onEdit: () => void;  // ZMIANA: Teraz otwiera modal zamiast przekierowywać
    onDelete: () => void;
}

const ClientDetailHeader: React.FC<ClientDetailHeaderProps> = ({
                                                                   client,
                                                                   onBack,
                                                                   onEdit,
                                                                   onDelete
                                                               }) => {
    return (
        <HeaderContainer>
            <HeaderMain>
                <BackButton onClick={onBack}>
                    <FaArrowLeft />
                    Wróć do listy klientów
                </BackButton>

                <ClientHeaderInfo>
                    <ClientIcon>
                        <FaUser />
                    </ClientIcon>
                    <ClientDetails>
                        <ClientTitle>
                            {client.firstName} {client.lastName}
                        </ClientTitle>
                        {client.company && (
                            <ClientCompany>{client.company}</ClientCompany>
                        )}
                        <ClientMeta>
                            Klient od {client.createdAt ? new Date(client.createdAt).toLocaleDateString('pl-PL') : 'nieznana data'}
                        </ClientMeta>
                    </ClientDetails>

                    <ActionButtons>
                        {/* ZMIANA: Przycisk Edytuj teraz wywołuje funkcję onEdit która otwiera modal */}
                        <ActionButton onClick={onEdit} variant="edit">
                            <FaEdit />
                            <span>Edytuj</span>
                        </ActionButton>
                        <ActionButton onClick={onDelete} variant="delete">
                            <FaTrash />
                            <span>Usuń</span>
                        </ActionButton>
                    </ActionButtons>
                </ClientHeaderInfo>
            </HeaderMain>
        </HeaderContainer>
    );
};

// Styled components dla header - ulepszone stylizowanie
const HeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.xl};
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${theme.spacing.md};
    }
`;

const HeaderMain = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
    flex: 1;
`;

const BackButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: none;
    border: none;
    color: ${theme.primary};
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all ${theme.transitions.normal};
    width: fit-content;
    border-radius: ${theme.radius.md};

    &:hover {
        color: ${theme.primaryDark};
        background: ${theme.primaryGhost};
        transform: translateX(-2px);
    }

    svg {
        font-size: 12px;
    }
`;

const ClientHeaderInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    background: ${theme.surface};
    padding: ${theme.spacing.xl};
    border-radius: ${theme.radius.xl};
    box-shadow: ${theme.shadow.md};
    border: 1px solid ${theme.border};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
    }

    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
        gap: ${theme.spacing.md};
    }
`;

const ClientIcon = styled.div`
    width: 72px;
    height: 72px;
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
    border-radius: ${theme.radius.xl};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 32px;
    box-shadow: ${theme.shadow.lg};
    flex-shrink: 0;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        inset: -2px;
        background: linear-gradient(135deg, ${theme.primary}, ${theme.primaryLight});
        border-radius: inherit;
        z-index: -1;
        opacity: 0;
        transition: opacity ${theme.transitions.normal};
    }

    &:hover::after {
        opacity: 0.2;
    }
`;

const ClientDetails = styled.div`
    flex: 1;
    min-width: 0;
`;

const ClientTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.sm} 0;
    letter-spacing: -0.02em;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 26px;
    }
`;

const ClientCompany = styled.div`
    display: inline-block;
    background: linear-gradient(135deg, ${theme.status.success} 0%, #0ea5e9 100%);
    color: white;
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    border-radius: ${theme.radius.lg};
    font-weight: 600;
    font-size: 14px;
    margin-bottom: ${theme.spacing.sm};
    box-shadow: ${theme.shadow.sm};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s;
    }

    &:hover::before {
        left: 100%;
    }
`;

const ClientMeta = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const ActionButtons = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};
    flex-shrink: 0;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

const ActionButton = styled.button<{ variant: 'edit' | 'delete' }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    border: none;
    border-radius: ${theme.radius.lg};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${theme.transitions.normal};
    min-height: 48px;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s;
    }

    &:hover::before {
        left: 100%;
    }

    ${props => props.variant === 'edit' && `
        background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
        color: white;
        box-shadow: ${theme.shadow.sm};

        &:hover {
            background: linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 100%);
            transform: translateY(-2px);
            box-shadow: ${theme.shadow.lg};
        }

        &:active {
            transform: translateY(-1px);
        }
    `}

    ${props => props.variant === 'delete' && `
        background: linear-gradient(135deg, ${theme.status.error} 0%, #b91c1c 100%);
        color: white;
        box-shadow: ${theme.shadow.sm};

        &:hover {
            background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
            transform: translateY(-2px);
            box-shadow: ${theme.shadow.lg};
        }

        &:active {
            transform: translateY(-1px);
        }
    `}

    svg {
        font-size: 14px;
    }

    @media (max-width: 768px) {
        flex: 1;
        justify-content: center;
    }

    @media (max-width: 480px) {
        span {
            display: none;
        }

        svg {
            margin-right: 0;
        }
    }
`;

export default ClientDetailHeader;