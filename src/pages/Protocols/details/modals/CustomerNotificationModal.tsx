import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaMobileAlt, FaEnvelope, FaTimes, FaCheck, FaExclamationCircle, FaBell } from 'react-icons/fa';

// Professional Corporate Theme
const corporateTheme = {
    primary: '#1a365d',
    primaryLight: '#2c5aa0',
    surface: '#ffffff',
    surfaceElevated: '#fafbfc',
    surfaceHover: '#f8fafc',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    status: {
        success: '#059669',
        successLight: '#f0fdf4',
        successBorder: '#bbf7d0',
        info: '#0369a1',
        infoLight: '#f0f9ff',
        infoBorder: '#bae6fd',
        warning: '#d97706',
        warningLight: '#fffbeb'
    },
    shadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px'
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
        onConfirm({ sendSms, sendEmail });
    };

    const handleSkip = () => {
        onConfirm({ sendSms: false, sendEmail: false });
    };

    const hasAnyContactMethod = !!customerPhone || !!customerEmail;
    const hasSelection = sendSms || sendEmail;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <DocumentIcon>
                            <FaBell />
                        </DocumentIcon>
                        <HeaderText>
                            <ModalTitle>Powiadomienie klienta</ModalTitle>
                            <ModalSubtitle>Automatyczne powiadomienie o gotowości pojazdu</ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <StatusSection>
                        <StatusIndicator>
                            <StatusIcon>
                                <FaCheck />
                            </StatusIcon>
                            <StatusMessage>
                                Zlecenie oznaczono jako gotowe do odbioru. Wybierz sposób powiadomienia klienta.
                            </StatusMessage>
                        </StatusIndicator>
                    </StatusSection>

                    {!hasAnyContactMethod && (
                        <ErrorSection>
                            <ErrorMessage>
                                Brak danych kontaktowych. Skontaktuj się z klientem bezpośrednio.
                            </ErrorMessage>
                        </ErrorSection>
                    )}

                    <OptionsSection>
                        <SectionTitle>Opcje powiadomienia</SectionTitle>

                        <OptionsList>
                            <OptionItem>
                                <OptionCheckbox
                                    type="checkbox"
                                    checked={sendSms}
                                    onChange={() => setSendSms(!sendSms)}
                                    disabled={!customerPhone}
                                />
                                <OptionContent>
                                    <OptionHeader>
                                        <OptionIcon $disabled={!customerPhone}>
                                            <FaMobileAlt />
                                        </OptionIcon>
                                        <OptionDetails>
                                            <OptionTitle>Powiadomienie SMS</OptionTitle>
                                            <OptionDescription>
                                                {customerPhone
                                                    ? `Wyślij SMS na numer: ${customerPhone}`
                                                    : 'Brak numeru telefonu w danych klienta'
                                                }
                                            </OptionDescription>
                                        </OptionDetails>
                                    </OptionHeader>
                                </OptionContent>
                            </OptionItem>

                            <OptionItem>
                                <OptionCheckbox
                                    type="checkbox"
                                    checked={sendEmail}
                                    onChange={() => setSendEmail(!sendEmail)}
                                    disabled={!customerEmail}
                                />
                                <OptionContent>
                                    <OptionHeader>
                                        <OptionIcon $disabled={!customerEmail}>
                                            <FaEnvelope />
                                        </OptionIcon>
                                        <OptionDetails>
                                            <OptionTitle>Powiadomienie email</OptionTitle>
                                            <OptionDescription>
                                                {customerEmail
                                                    ? `Wyślij email na adres: ${customerEmail}`
                                                    : 'Brak adresu email w danych klienta'
                                                }
                                            </OptionDescription>
                                        </OptionDetails>
                                    </OptionHeader>
                                </OptionContent>
                            </OptionItem>
                        </OptionsList>
                    </OptionsSection>

                    {hasSelection && (
                        <InfoSection>
                            <InfoMessage>
                                Klient otrzyma powiadomienie automatycznie po zatwierdzeniu.
                            </InfoMessage>
                        </InfoSection>
                    )}
                </ModalBody>

                <ModalFooter>
                    <ButtonGroup>
                        <SecondaryButton onClick={handleSkip}>
                            Pomiń
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={handleConfirm}
                            disabled={!hasSelection && hasAnyContactMethod}
                        >
                            <FaCheck />
                            {hasSelection ? 'Wyślij powiadomienie' : 'Kontynuuj'}
                        </PrimaryButton>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.15s ease-out;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    background: ${corporateTheme.surface};
    border-radius: ${corporateTheme.radius.lg};
    box-shadow: ${corporateTheme.shadow.elevated};
    width: 580px;
    max-width: 95%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid ${corporateTheme.border};
    animation: slideUp 0.2s ease-out;

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;

const ModalHeader = styled.div`
    padding: ${corporateTheme.spacing.lg} ${corporateTheme.spacing.xl};
    border-bottom: 1px solid ${corporateTheme.border};
    background: ${corporateTheme.surfaceElevated};
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.md};
`;

const DocumentIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${corporateTheme.primary}15;
    color: ${corporateTheme.primary};
    border-radius: ${corporateTheme.radius.md};
    font-size: 18px;
    flex-shrink: 0;
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.xs};
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${corporateTheme.text.primary};
    letter-spacing: -0.01em;
`;

const ModalSubtitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${corporateTheme.text.secondary};
    font-weight: 400;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${corporateTheme.surfaceHover};
    border: 1px solid ${corporateTheme.border};
    border-radius: ${corporateTheme.radius.sm};
    color: ${corporateTheme.text.muted};
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: #fef2f2;
        border-color: #dc2626;
        color: #dc2626;
    }
`;

const ModalBody = styled.div`
    padding: ${corporateTheme.spacing.xl};
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.lg};
`;

const StatusSection = styled.div`
    background: ${corporateTheme.status.successLight};
    border: 1px solid ${corporateTheme.status.successBorder};
    border-radius: ${corporateTheme.radius.md};
    padding: ${corporateTheme.spacing.md};
`;

const StatusIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.sm};
`;

const StatusIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: ${corporateTheme.status.success};
    color: white;
    border-radius: 50%;
    font-size: 11px;
    flex-shrink: 0;
`;

const StatusMessage = styled.span`
    font-size: 14px;
    color: ${corporateTheme.status.success};
    font-weight: 500;
`;

const ErrorSection = styled.div`
    background: ${corporateTheme.status.warningLight};
    border: 1px solid ${corporateTheme.status.warning};
    border-radius: ${corporateTheme.radius.md};
    padding: ${corporateTheme.spacing.md};
`;

const ErrorMessage = styled.div`
    color: ${corporateTheme.status.warning};
    font-size: 14px;
    font-weight: 500;
`;

const OptionsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.md};
`;

const SectionTitle = styled.h3`
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: ${corporateTheme.text.primary};
`;

const OptionsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.sm};
`;

const OptionItem = styled.label`
    display: flex;
    align-items: flex-start;
    gap: ${corporateTheme.spacing.md};
    padding: ${corporateTheme.spacing.md};
    border: 1px solid ${corporateTheme.borderLight};
    border-radius: ${corporateTheme.radius.md};
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        border-color: ${corporateTheme.primary};
        background: ${corporateTheme.surfaceHover};
    }

    &:has(input:checked) {
        border-color: ${corporateTheme.primary};
        background: rgba(26, 54, 93, 0.02);
    }

    &:has(input:disabled) {
        opacity: 0.6;
        cursor: not-allowed;
        
        &:hover {
            border-color: ${corporateTheme.borderLight};
            background: transparent;
        }
    }
`;

const OptionCheckbox = styled.input`
    width: 18px;
    height: 18px;
    margin-top: 2px;
    accent-color: ${corporateTheme.primary};
    cursor: pointer;
    flex-shrink: 0;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`;

const OptionContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const OptionHeader = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${corporateTheme.spacing.sm};
`;

const OptionIcon = styled.div<{ $disabled?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${props =>
            props.$disabled
                    ? corporateTheme.text.muted + '20'
                    : corporateTheme.primary + '15'
    };
    color: ${props =>
            props.$disabled
                    ? corporateTheme.text.muted
                    : corporateTheme.primary
    };
    border-radius: ${corporateTheme.radius.sm};
    font-size: 14px;
    flex-shrink: 0;
    margin-top: 2px;
`;

const OptionDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.xs};
`;

const OptionTitle = styled.h4`
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: ${corporateTheme.text.primary};
    line-height: 1.3;
`;

const OptionDescription = styled.p`
    margin: 0;
    font-size: 13px;
    color: ${corporateTheme.text.secondary};
    line-height: 1.4;
`;

const InfoSection = styled.div`
    background: ${corporateTheme.status.infoLight};
    border: 1px solid ${corporateTheme.status.infoBorder};
    border-radius: ${corporateTheme.radius.md};
    padding: ${corporateTheme.spacing.md};
`;

const InfoMessage = styled.div`
    font-size: 13px;
    color: ${corporateTheme.status.info};
    font-weight: 500;
    line-height: 1.4;
`;

const ModalFooter = styled.div`
    padding: ${corporateTheme.spacing.lg} ${corporateTheme.spacing.xl};
    border-top: 1px solid ${corporateTheme.border};
    background: ${corporateTheme.surfaceElevated};
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${corporateTheme.spacing.sm};
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.sm};
    padding: ${corporateTheme.spacing.sm} ${corporateTheme.spacing.md};
    background: ${corporateTheme.surface};
    color: ${corporateTheme.text.secondary};
    border: 1px solid ${corporateTheme.border};
    border-radius: ${corporateTheme.radius.sm};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    min-height: 40px;
    min-width: 80px;

    &:hover {
        background: ${corporateTheme.surfaceHover};
        border-color: ${corporateTheme.text.muted};
    }
`;

const PrimaryButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${corporateTheme.spacing.sm};
    padding: ${corporateTheme.spacing.sm} ${corporateTheme.spacing.lg};
    background: ${corporateTheme.primary};
    color: white;
    border: 1px solid ${corporateTheme.primary};
    border-radius: ${corporateTheme.radius.sm};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    min-height: 40px;
    min-width: 120px;

    &:hover:not(:disabled) {
        background: ${corporateTheme.primaryLight};
        border-color: ${corporateTheme.primaryLight};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: ${corporateTheme.text.muted};
        border-color: ${corporateTheme.text.muted};
    }
`;

export default CustomerNotificationModal;