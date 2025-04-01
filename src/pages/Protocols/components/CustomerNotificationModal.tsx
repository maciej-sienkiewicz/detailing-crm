import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaMobileAlt, FaEnvelope, FaTimes, FaCheck } from 'react-icons/fa';

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

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>
                        <ModalIcon><FaPaperPlane /></ModalIcon>
                        Powiadom klienta o gotowym zleceniu
                    </ModalTitle>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </ModalHeader>
                <ModalBody>
                    <ModalDescription>
                        Zlecenie zostało oznaczone jako gotowe do odbioru. Chcesz teraz poinformować klienta o możliwości odbioru pojazdu?
                    </ModalDescription>

                    <NotificationOptions>
                        <NotificationOption>
                            <OptionCheckbox
                                type="checkbox"
                                id="sms-notification"
                                checked={sendSms}
                                onChange={() => setSendSms(!sendSms)}
                                disabled={!customerPhone}
                            />
                            <OptionLabel htmlFor="sms-notification" disabled={!customerPhone}>
                                <OptionIcon available={!!customerPhone}><FaMobileAlt /></OptionIcon>
                                <div>
                                    <OptionTitle>Wyślij SMS</OptionTitle>
                                    {customerPhone ? (
                                        <OptionDetails>na numer: {customerPhone}</OptionDetails>
                                    ) : (
                                        <OptionUnavailable>Brak numeru telefonu</OptionUnavailable>
                                    )}
                                </div>
                            </OptionLabel>
                        </NotificationOption>

                        <NotificationOption>
                            <OptionCheckbox
                                type="checkbox"
                                id="email-notification"
                                checked={sendEmail}
                                onChange={() => setSendEmail(!sendEmail)}
                                disabled={!customerEmail}
                            />
                            <OptionLabel htmlFor="email-notification" disabled={!customerEmail}>
                                <OptionIcon available={!!customerEmail}><FaEnvelope /></OptionIcon>
                                <div>
                                    <OptionTitle>Wyślij e-mail</OptionTitle>
                                    {customerEmail ? (
                                        <OptionDetails>na adres: {customerEmail}</OptionDetails>
                                    ) : (
                                        <OptionUnavailable>Brak adresu e-mail</OptionUnavailable>
                                    )}
                                </div>
                            </OptionLabel>
                        </NotificationOption>
                    </NotificationOptions>
                </ModalBody>
                <ModalFooter>
                    <SkipButton onClick={handleSkip}>
                        <FaTimes /> Nie informuj
                    </SkipButton>
                    <ConfirmButton
                        onClick={handleConfirm}
                        disabled={!sendSms && !sendEmail}
                    >
                        <FaCheck /> Wyślij powiadomienie
                    </ConfirmButton>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 550px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 1001;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  color: #34495e;
  display: flex;
  align-items: center;
`;

const ModalIcon = styled.span`
  color: #3498db;
  margin-right: 10px;
  font-size: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #7f8c8d;
  
  &:hover {
    color: #34495e;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const ModalDescription = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: #34495e;
  margin-top: 0;
  margin-bottom: 20px;
`;

const NotificationOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
`;

const NotificationOption = styled.div`
  display: flex;
  align-items: flex-start;
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
`;

const OptionCheckbox = styled.input`
  margin-right: 15px;
  margin-top: 3px;
  cursor: pointer;
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const OptionLabel = styled.label<{ disabled?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
`;

const OptionIcon = styled.div<{ available: boolean }>`
  color: ${props => props.available ? '#3498db' : '#95a5a6'};
  font-size: 20px;
  margin-top: 2px;
`;

const OptionTitle = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #34495e;
  margin-bottom: 3px;
`;

const OptionDetails = styled.div`
  font-size: 13px;
  color: #7f8c8d;
`;

const OptionUnavailable = styled.div`
  font-size: 13px;
  color: #e74c3c;
  font-style: italic;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #eee;
  gap: 10px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 15px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
`;

const SkipButton = styled(Button)`
  background-color: white;
  color: #7f8c8d;
  border: 1px solid #ddd;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ConfirmButton = styled(Button)<{ disabled?: boolean }>`
  background-color: ${props => props.disabled ? '#95a5a6' : '#3498db'};
  color: white;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover:not(:disabled) {
    background-color: #2980b9;
  }
`;

export default CustomerNotificationModal;