import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaMobileAlt, FaEnvelope, FaTimes, FaCheck, FaExclamationCircle, FaBell } from 'react-icons/fa';

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

interface CustomerNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (notificationOptions: {
        sendSms: boolean;
        sendEmail: boolean;
    }) => void;
    customerPhone?: string;
    customerEmail?: string;
}

const CustomerNotificationModal: React.FC<CustomerNotificationModalProps> = ({
                                                                                 isOpen,
                                                                                 onClose,
                                                                                 onConfirm,
                                                                                 customerPhone,
                                                                                 customerEmail
                                                                             }) => {
    const [sendSms, setSendSms] = useState(false);
    const [sendEmail, setSendEmail] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm({
            sendSms,
            sendEmail
        });
    };

    const handleSkip = () => {
        onConfirm({
            sendSms: false,
            sendEmail: false
        });
    };

    const hasAnyContactMethod = !!customerPhone || !!customerEmail;
    const hasSelection = sendSms || sendEmail;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <HeaderIcon>
                            <FaPaperPlane />
                        </HeaderIcon>
                        <HeaderText>
                            <ModalTitle>Powiadom klienta o gotowym zleceniu</ModalTitle>
                            <ModalSubtitle>Automatyczne powiadomienie o możliwości odbioru pojazdu</ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <StatusInfo>
                        <StatusIcon>
                            <FaCheck />
                        </StatusIcon>
                        <StatusText>
                            Zlecenie zostało oznaczone jako gotowe do odbioru.
                            Wybierz sposób powiadomienia klienta o możliwości odbioru pojazdu.
                        </StatusText>
                    </StatusInfo>

                    {!hasAnyContactMethod && (
                        <WarningMessage>
                            <WarningIcon>
                                <FaExclamationCircle />
                            </WarningIcon>
                            <WarningText>
                                <WarningTitle>Brak danych kontaktowych</WarningTitle>
                                <WarningDescription>
                                    Klient nie posiada zapisanych danych kontaktowych.
                                    Skontaktuj się z nim telefonicznie lub osobiście.
                                </WarningDescription>
                            </WarningText>
                        </WarningMessage>
                    )}

                    <NotificationSection>
                        <SectionTitle>
                            <FaBell />
                            Wybierz sposób powiadomienia
                        </SectionTitle>

                        <NotificationOptions>
                            <NotificationOption $available={!!customerPhone}>
                                <OptionCheckbox
                                    type="checkbox"
                                    id="sms-notification"
                                    checked={sendSms}
                                    onChange={() => setSendSms(!sendSms)}
                                    disabled={!customerPhone}
                                />
                                <OptionContent htmlFor="sms-notification">
                                    <OptionIcon $available={!!customerPhone}>
                                        <FaMobileAlt />
                                    </OptionIcon>
                                    <OptionDetails>
                                        <OptionTitle>Powiadomienie SMS</OptionTitle>
                                        {customerPhone ? (
                                            <OptionInfo>
                                                <ContactValue>📱 {customerPhone}</ContactValue>
                                                <OptionDescription>
                                                    Szybkie powiadomienie tekstowe
                                                </OptionDescription>
                                            </OptionInfo>
                                        ) : (
                                            <OptionUnavailable>
                                                Brak numeru telefonu w danych klienta
                                            </OptionUnavailable>
                                        )}
                                    </OptionDetails>
                                    {!!customerPhone && (
                                        <OptionStatus $selected={sendSms}>
                                            {sendSms ? <FaCheck /> : <div />}
                                        </OptionStatus>
                                    )}
                                </OptionContent>
                            </NotificationOption>

                            <NotificationOption $available={!!customerEmail}>
                                <OptionCheckbox
                                    type="checkbox"
                                    id="email-notification"
                                    checked={sendEmail}
                                    onChange={() => setSendEmail(!sendEmail)}
                                    disabled={!customerEmail}
                                />
                                <OptionContent htmlFor="email-notification">
                                    <OptionIcon $available={!!customerEmail}>
                                        <FaEnvelope />
                                    </OptionIcon>
                                    <OptionDetails>
                                        <OptionTitle>Powiadomienie e-mail</OptionTitle>
                                        {customerEmail ? (
                                            <OptionInfo>
                                                <ContactValue>📧 {customerEmail}</ContactValue>
                                                <OptionDescription>
                                                    Szczegółowe powiadomienie z informacjami
                                                </OptionDescription>
                                            </OptionInfo>
                                        ) : (
                                            <OptionUnavailable>
                                                Brak adresu e-mail w danych klienta
                                            </OptionUnavailable>
                                        )}
                                    </OptionDetails>
                                    {!!customerEmail && (
                                        <OptionStatus $selected={sendEmail}>
                                            {sendEmail ? <FaCheck /> : <div />}
                                        </OptionStatus>
                                    )}
                                </OptionContent>
                            </NotificationOption>
                        </NotificationOptions>
                    </NotificationSection>

                    {hasSelection && (
                        <SelectedActionsInfo>
                            <InfoIcon>💡</InfoIcon>
                            <InfoText>
                                Klient otrzyma powiadomienie automatycznie po zatwierdzeniu.
                                Powiadomienie zawiera informacje o gotowości pojazdu do odbioru.
                            </InfoText>
                        </SelectedActionsInfo>
                    )}
                </ModalBody>

                <ModalFooter>
                    <SecondaryButton onClick={handleSkip}>
                        <FaTimes />
                        Nie wysyłaj powiadomienia
                    </SecondaryButton>
                    <PrimaryButton
                        onClick={handleConfirm}
                        disabled={!hasSelection && hasAnyContactMethod}
                    >
                        <FaCheck />
                        {hasSelection ? 'Wyślij powiadomienie' : 'Kontynuuj bez powiadomienia'}
                    </PrimaryButton>
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
    background: rgba(0, 0, 0, 0.7);
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
   max-height: 90vh;
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

const ModalTitle = styled.h3`
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
   gap: ${brandTheme.spacing.xl};

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

const StatusInfo = styled.div`
   background: ${brandTheme.status.successLight};
   border: 1px solid ${brandTheme.status.success};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
`;

const StatusIcon = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 24px;
   height: 24px;
   background: ${brandTheme.status.success};
   color: white;
   border-radius: 50%;
   font-size: 12px;
   flex-shrink: 0;
`;

const StatusText = styled.div`
   font-size: 14px;
   color: ${brandTheme.status.success};
   font-weight: 500;
   line-height: 1.4;
`;

const WarningMessage = styled.div`
   background: ${brandTheme.status.warningLight};
   border: 1px solid ${brandTheme.status.warning};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   display: flex;
   align-items: flex-start;
   gap: ${brandTheme.spacing.sm};
`;

const WarningIcon = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 24px;
   height: 24px;
   color: ${brandTheme.status.warning};
   font-size: 16px;
   flex-shrink: 0;
   margin-top: 2px;
`;

const WarningText = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xs};
`;

const WarningTitle = styled.div`
   font-size: 14px;
   font-weight: 600;
   color: ${brandTheme.status.warning};
`;

const WarningDescription = styled.div`
   font-size: 13px;
   color: ${brandTheme.text.secondary};
   line-height: 1.4;
`;

const NotificationSection = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.lg};
`;

const SectionTitle = styled.h4`
   margin: 0;
   font-size: 16px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};

   svg {
       color: ${brandTheme.primary};
       font-size: 16px;
   }
`;

const NotificationOptions = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.md};
`;

const NotificationOption = styled.div<{ $available: boolean }>`
   background: ${props => props.$available ? brandTheme.surface : brandTheme.surfaceAlt};
   border: 2px solid ${props => props.$available ? brandTheme.border : brandTheme.borderLight};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.lg};
   transition: all ${brandTheme.transitions.normal};
   opacity: ${props => props.$available ? 1 : 0.6};

   &:hover {
       border-color: ${props => props.$available ? brandTheme.primary : brandTheme.border};
       transform: ${props => props.$available ? 'translateY(-1px)' : 'none'};
       box-shadow: ${props => props.$available ? brandTheme.shadow.sm : 'none'};
   }
`;

const OptionCheckbox = styled.input`
   position: absolute;
   opacity: 0;
   width: 0;
   height: 0;

   &:disabled {
       cursor: not-allowed;
   }
`;

const OptionContent = styled.label`
   display: flex;
   align-items: flex-start;
   gap: ${brandTheme.spacing.md};
   cursor: pointer;
   width: 100%;

   input:disabled + & {
       cursor: not-allowed;
   }
`;

const OptionIcon = styled.div<{ $available: boolean }>`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 40px;
   height: 40px;
   background: ${props => props.$available ? brandTheme.primaryGhost : brandTheme.surfaceHover};
   color: ${props => props.$available ? brandTheme.primary : brandTheme.text.disabled};
   border-radius: ${brandTheme.radius.lg};
   font-size: 18px;
   flex-shrink: 0;
`;

const OptionDetails = styled.div`
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xs};
`;

const OptionTitle = styled.div`
   font-weight: 600;
   font-size: 16px;
   color: ${brandTheme.text.primary};
`;

const OptionInfo = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xs};
`;

const ContactValue = styled.div`
   font-size: 14px;
   color: ${brandTheme.text.secondary};
   font-weight: 500;
   font-family: 'Monaco', 'Menlo', monospace;
`;

const OptionDescription = styled.div`
   font-size: 13px;
   color: ${brandTheme.text.muted};
   line-height: 1.4;
`;

const OptionUnavailable = styled.div`
   font-size: 13px;
   color: ${brandTheme.status.error};
   font-style: italic;
   line-height: 1.4;
`;

const OptionStatus = styled.div<{ $selected: boolean }>`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 24px;
   height: 24px;
   background: ${props => props.$selected ? brandTheme.status.success : brandTheme.border};
   color: white;
   border-radius: 50%;
   font-size: 12px;
   flex-shrink: 0;
   transition: all ${brandTheme.transitions.normal};
`;

const SelectedActionsInfo = styled.div`
   background: ${brandTheme.status.infoLight};
   border: 1px solid ${brandTheme.status.info};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
`;

const InfoIcon = styled.div`
   font-size: 16px;
   flex-shrink: 0;
`;

const InfoText = styled.div`
   font-size: 13px;
   color: ${brandTheme.status.info};
   font-weight: 500;
   line-height: 1.4;
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
   min-width: 140px;

   &:hover {
       background: ${brandTheme.surfaceHover};
       color: ${brandTheme.text.primary};
       border-color: ${brandTheme.borderHover};
       box-shadow: ${brandTheme.shadow.sm};
   }
`;

const PrimaryButton = styled.button`
   display: flex;
   align-items: center;
   justify-content: center;
   gap: ${brandTheme.spacing.sm};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
   color: white;
   border: 2px solid transparent;
   border-radius: ${brandTheme.radius.md};
   font-weight: 600;
   font-size: 14px;
   cursor: pointer;
   transition: all ${brandTheme.transitions.spring};
   box-shadow: ${brandTheme.shadow.sm};
   min-height: 44px;
   min-width: 160px;

   &:hover:not(:disabled) {
       background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
       transform: translateY(-1px);
       box-shadow: ${brandTheme.shadow.md};
   }

   &:disabled {
       opacity: 0.6;
       cursor: not-allowed;
       transform: none;
       background: ${brandTheme.text.disabled};
   }

   &:active:not(:disabled) {
       transform: translateY(0);
   }
`;

export default CustomerNotificationModal;