import React from 'react';
import styled from 'styled-components';
import {FaBuilding, FaCheck, FaEnvelope, FaIdCard, FaPhone, FaTimes, FaUser} from 'react-icons/fa';
import {ClientExpanded} from '../../../../types';

// Professional Brand Theme
const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2',
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    },
    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }
};

interface ClientSelectionModalProps {
    clients: ClientExpanded[];
    onSelect: (client: ClientExpanded) => void;
    onCancel: () => void;
}

const ClientSelectionModal: React.FC<ClientSelectionModalProps> = ({
                                                                       clients,
                                                                       onSelect,
                                                                       onCancel
                                                                   }) => {
    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <HeaderIcon>
                            <FaUser />
                        </HeaderIcon>
                        <HeaderText>
                            <ModalTitle>Wybierz klienta</ModalTitle>
                            <ModalSubtitle>
                                Znaleziono {clients.length} {clients.length === 1 ? 'klienta' :
                                clients.length < 5 ? 'klientów' : 'klientów'}
                            </ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={onCancel}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    {clients.length === 0 ? (
                        <EmptyState>
                            <EmptyStateIcon>
                                <FaUser />
                            </EmptyStateIcon>
                            <EmptyStateTitle>Nie znaleziono klientów</EmptyStateTitle>
                            <EmptyStateDescription>
                                Spróbuj zmienić kryteria wyszukiwania lub dodaj nowego klienta
                            </EmptyStateDescription>
                        </EmptyState>
                    ) : (
                        <>
                            <InfoMessage>
                                Wybierz klienta aby automatycznie uzupełnić dane w formularzu wizyt
                            </InfoMessage>
                            <ClientsList>
                                {clients.map(client => (
                                    <ClientItem key={client.id} onClick={() => onSelect(client)}>
                                        <ClientAvatar>
                                            <FaUser />
                                        </ClientAvatar>
                                        <ClientContent>
                                            <ClientHeader>
                                                <ClientName>{client.firstName} {client.lastName}</ClientName>
                                                {client.company && (
                                                    <CompanyBadge>
                                                        <FaBuilding />
                                                        <span>{client.company}</span>
                                                    </CompanyBadge>
                                                )}
                                            </ClientHeader>
                                            <ClientDetails>
                                                <ClientDetail>
                                                    <DetailIcon><FaPhone /></DetailIcon>
                                                    <DetailText>{client.phone}</DetailText>
                                                </ClientDetail>
                                                <ClientDetail>
                                                    <DetailIcon><FaEnvelope /></DetailIcon>
                                                    <DetailText>{client.email}</DetailText>
                                                </ClientDetail>
                                                {client.taxId && (
                                                    <ClientDetail>
                                                        <DetailIcon><FaIdCard /></DetailIcon>
                                                        <DetailText>NIP: {client.taxId}</DetailText>
                                                    </ClientDetail>
                                                )}
                                            </ClientDetails>
                                        </ClientContent>
                                        <SelectButton>
                                            <FaCheck />
                                        </SelectButton>
                                    </ClientItem>
                                ))}
                            </ClientsList>
                        </>
                    )}
                </ModalBody>

                <ModalFooter>
                    <SecondaryButton onClick={onCancel}>
                        <FaTimes />
                        Anuluj
                    </SecondaryButton>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components - Professional Automotive CRM Design
const ModalOverlay = styled.div`
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background: rgba(0, 0, 0, 0.6);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 1000;
   backdrop-filter: blur(4px);
   animation: fadeIn 0.2s ease;

   @keyframes fadeIn {
       from { opacity: 0; }
       to { opacity: 1; }
   }
`;

const ModalContainer = styled.div`
   background: ${brandTheme.surface};
   border-radius: ${brandTheme.radius.xl};
   box-shadow: ${brandTheme.shadow.xl};
   width: 600px;
   max-width: 95%;
   max-height: 85vh;
   display: flex;
   flex-direction: column;
   overflow: hidden;
   animation: slideUp 0.3s ease;

   @keyframes slideUp {
       from {
           opacity: 0;
           transform: translateY(20px) scale(0.95);
       }
       to {
           opacity: 1;
           transform: translateY(0) scale(1);
       }
   }
`;

const ModalHeader = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
   border-bottom: 2px solid ${brandTheme.border};
   background: ${brandTheme.surfaceAlt};
`;

const HeaderContent = styled.div`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.md};
`;

const HeaderIcon = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 40px;
   height: 40px;
   background: ${brandTheme.primaryGhost};
   color: ${brandTheme.primary};
   border-radius: ${brandTheme.radius.lg};
   font-size: 18px;
`;

const HeaderText = styled.div`
   display: flex;
   flex-direction: column;
   gap: 2px;
`;

const ModalTitle = styled.h2`
   margin: 0;
   font-size: 20px;
   font-weight: 700;
   color: ${brandTheme.text.primary};
   letter-spacing: -0.025em;
`;

const ModalSubtitle = styled.p`
   margin: 0;
   font-size: 14px;
   color: ${brandTheme.text.secondary};
   font-weight: 500;
`;

const CloseButton = styled.button`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 32px;
   height: 32px;
   background: ${brandTheme.surfaceHover};
   border: 1px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.sm};
   color: ${brandTheme.text.muted};
   cursor: pointer;
   transition: all ${brandTheme.transitions.normal};

   &:hover {
       background: ${brandTheme.status.errorLight};
       border-color: ${brandTheme.status.error};
       color: ${brandTheme.status.error};
       transform: translateY(-1px);
   }
`;

const ModalBody = styled.div`
   padding: ${brandTheme.spacing.xl};
   overflow-y: auto;
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.lg};

   /* Custom scrollbar */
   &::-webkit-scrollbar {
       width: 6px;
   }

   &::-webkit-scrollbar-track {
       background: ${brandTheme.surfaceAlt};
   }

   &::-webkit-scrollbar-thumb {
       background: ${brandTheme.border};
       border-radius: 3px;
   }
`;

const InfoMessage = styled.div`
   background: linear-gradient(135deg, ${brandTheme.status.infoLight} 0%, rgba(59, 130, 246, 0.05) 100%);
   color: ${brandTheme.status.info};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   border-radius: ${brandTheme.radius.lg};
   border: 1px solid rgba(59, 130, 246, 0.2);
   font-size: 14px;
   font-weight: 500;
   box-shadow: ${brandTheme.shadow.xs};
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};

   &::before {
       content: '💡';
       font-size: 16px;
   }
`;

const EmptyState = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: ${brandTheme.spacing.xxl};
   text-align: center;
`;

const EmptyStateIcon = styled.div`
   width: 64px;
   height: 64px;
   background: ${brandTheme.surfaceAlt};
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   margin-bottom: ${brandTheme.spacing.lg};
   font-size: 24px;
   color: ${brandTheme.text.muted};
`;

const EmptyStateTitle = styled.h3`
   font-size: 18px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
   margin: 0 0 ${brandTheme.spacing.sm} 0;
`;

const EmptyStateDescription = styled.p`
   font-size: 14px;
   color: ${brandTheme.text.muted};
   margin: 0;
   line-height: 1.5;
`;

const ClientsList = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.md};
`;

const ClientItem = styled.div`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.md};
   padding: ${brandTheme.spacing.lg};
   background: ${brandTheme.surface};
   border: 2px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.lg};
   cursor: pointer;
   transition: all ${brandTheme.transitions.normal};
   position: relative;
   overflow: hidden;

   &:hover {
       background: ${brandTheme.surfaceHover};
       border-color: ${brandTheme.primary};
       transform: translateY(-1px);
       box-shadow: ${brandTheme.shadow.md};
   }

   &::before {
       content: '';
       position: absolute;
       left: 0;
       top: 0;
       bottom: 0;
       width: 4px;
       background: ${brandTheme.primary};
       opacity: 0;
       transition: opacity ${brandTheme.transitions.normal};
   }

   &:hover::before {
       opacity: 1;
   }
`;

const ClientAvatar = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 48px;
   height: 48px;
   background: ${brandTheme.primaryGhost};
   color: ${brandTheme.primary};
   border-radius: ${brandTheme.radius.lg};
   font-size: 20px;
   flex-shrink: 0;
`;

const ClientContent = styled.div`
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.sm};
   min-width: 0;
`;

const ClientHeader = styled.div`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.md};
   margin-bottom: ${brandTheme.spacing.xs};
`;

const ClientName = styled.h4`
   margin: 0;
   font-size: 16px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
`;

const CompanyBadge = styled.div`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.xs};
   padding: 2px ${brandTheme.spacing.sm};
   background: ${brandTheme.surfaceAlt};
   border: 1px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.sm};
   font-size: 12px;
   color: ${brandTheme.text.secondary};
   white-space: nowrap;

   span {
       font-weight: 500;
   }
`;

const ClientDetails = styled.div`
   display: flex;
   flex-wrap: wrap;
   gap: ${brandTheme.spacing.md};
`;

const ClientDetail = styled.div`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.xs};
   font-size: 14px;
   color: ${brandTheme.text.secondary};
   min-width: 0;
`;

const DetailIcon = styled.span`
   color: ${brandTheme.text.muted};
   font-size: 12px;
   flex-shrink: 0;
`;

const DetailText = styled.span`
   font-weight: 500;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
`;

const SelectButton = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 32px;
   height: 32px;
   background: ${brandTheme.primaryGhost};
   color: ${brandTheme.primary};
   border-radius: ${brandTheme.radius.sm};
   font-size: 14px;
   opacity: 0;
   transition: all ${brandTheme.transitions.normal};
   flex-shrink: 0;

   ${ClientItem}:hover & {
       opacity: 1;
       background: ${brandTheme.primary};
       color: white;
   }
`;

const ModalFooter = styled.div`
   display: flex;
   justify-content: flex-end;
   gap: ${brandTheme.spacing.md};
   padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
   border-top: 2px solid ${brandTheme.border};
   background: ${brandTheme.surfaceAlt};
`;

const SecondaryButton = styled.button`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   background: ${brandTheme.surface};
   color: ${brandTheme.text.secondary};
   border: 2px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.md};
   font-weight: 600;
   font-size: 14px;
   cursor: pointer;
   transition: all ${brandTheme.transitions.spring};
   min-height: 44px;
   min-width: 120px;

   &:hover {
       background: ${brandTheme.surfaceHover};
       color: ${brandTheme.text.primary};
       border-color: ${brandTheme.borderHover};
       box-shadow: ${brandTheme.shadow.sm};
   }
`;

export default ClientSelectionModal;