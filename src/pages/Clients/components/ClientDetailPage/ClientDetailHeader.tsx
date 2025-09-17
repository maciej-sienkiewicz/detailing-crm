import React from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaUser, FaEdit, FaTrash } from 'react-icons/fa';
import { theme } from "../../../../styles/theme";
import { ClientExpanded } from '../../../../types';

interface ClientDetailHeaderProps {
    client: ClientExpanded;
    onBack: () => void;
    onEdit: () => void;
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

// Styled components dla header...
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

    &:hover {
        color: ${theme.primaryDark};
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
    box-shadow: ${theme.shadow.sm};
    border: 1px solid ${theme.border};
`;

const ClientIcon = styled.div`
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
    border-radius: ${theme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 28px;
    box-shadow: ${theme.shadow.md};
    flex-shrink: 0;
`;

const ClientDetails = styled.div`
    flex: 1;
`;

const ClientTitle = styled.h1`
    font-size: 28px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.sm} 0;
    letter-spacing: -0.025em;
    line-height: 1.2;
`;

const ClientCompany = styled.div`
    display: inline-block;
    background: linear-gradient(135deg, ${theme.status.success} 0%, #0ea5e9 100%);
    color: white;
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    margin-bottom: ${theme.spacing.sm};
    box-shadow: ${theme.shadow.sm};
`;

const ClientMeta = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
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
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${theme.transitions.normal};
    min-height: 44px;

    ${props => props.variant === 'edit' && `
        background: ${theme.primary};
        color: white;

        &:hover {
            background: ${theme.primaryDark};
            transform: translateY(-1px);
            box-shadow: ${theme.shadow.md};
        }
    `}

    ${props => props.variant === 'delete' && `
        background: ${theme.status.error};
        color: white;

        &:hover {
            background: #b91c1c;
            transform: translateY(-1px);
            box-shadow: ${theme.shadow.md};
        }
    `}

    svg {
        font-size: 12px;
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