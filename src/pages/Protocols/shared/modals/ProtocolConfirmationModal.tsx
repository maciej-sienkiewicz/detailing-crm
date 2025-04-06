import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPrint, FaEnvelope, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { pdfService } from '../../../../api/pdfService';

interface ProtocolConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    protocolId: string;
    clientEmail: string;
    onConfirm: (options: { print: boolean; sendEmail: boolean }) => void;
}

const ProtocolConfirmationModal: React.FC<ProtocolConfirmationModalProps> = ({
                                                                                 isOpen,
                                                                                 onClose,
                                                                                 protocolId,
                                                                                 clientEmail,
                                                                                 onConfirm
                                                                             }) => {
    const [selectedOptions, setSelectedOptions] = useState<{ print: boolean; sendEmail: boolean }>({
        print: true,
        sendEmail: !!clientEmail
    });
    const [isPrinting, setIsPrinting] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [hasError, setHasError] = useState<string | null>(null);

    const handleOptionChange = (option: 'print' | 'sendEmail') => {
        setSelectedOptions(prev => ({
            ...prev,
            [option]: !prev[option]
        }));
    };

    const handlePrintProtocol = async () => {
        try {
            setIsPrinting(true);
            await pdfService.printProtocolPdf(protocolId);
            setIsPrinting(false);
        } catch (error) {
            console.error('Error printing protocol:', error);
            setHasError('Wystąpił błąd podczas generowania PDF');
            setIsPrinting(false);
        }
    };

    const handleSendEmail = async () => {
        if (!clientEmail) return;

        try {
            setIsSendingEmail(true);
            // await emailService.sendProtocolEmail(protocolId, clientEmail);
            setIsSendingEmail(false);
        } catch (error) {
            console.error('Error sending email:', error);
            setHasError('Wystąpił błąd podczas wysyłania emaila');
            setIsSendingEmail(false);
        }
    };

    const handleConfirm = async () => {
        setHasError(null);

        try {
            // Execute actions in parallel
            const actions = [];

            // Handle printing if selected
            if (selectedOptions.print) {
                actions.push(handlePrintProtocol());
            }

            // Handle email sending if selected
            if (selectedOptions.sendEmail && clientEmail) {
                actions.push(handleSendEmail());
            }

            // Wait for all actions to complete
            await Promise.all(actions);

            // Inform parent component about the confirmation
            onConfirm(selectedOptions);
            onClose();
        } catch (error) {
            console.error('Error during confirmation actions:', error);
            setHasError('Wystąpił błąd podczas wykonywania żądanych akcji');
        }
    };

    const handleSkip = () => {
        onConfirm({ print: false, sendEmail: false });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContent>
                <ModalTitle>Protokół utworzony pomyślnie</ModalTitle>
                <ModalBody>
                    <SuccessMessage>
                        <SuccessIcon>
                            <FaCheck />
                        </SuccessIcon>
                        <div>
                            <SuccessTitle>Protokół został utworzony</SuccessTitle>
                            <SuccessText>Wybierz jak chcesz udostępnić protokół klientowi:</SuccessText>
                        </div>
                    </SuccessMessage>

                    {hasError && (
                        <ErrorMessage>
                            {hasError}
                        </ErrorMessage>
                    )}

                    <OptionsContainer>
                        <Option
                            selected={selectedOptions.print}
                            onClick={() => handleOptionChange('print')}
                        >
                            <OptionIconBox selected={selectedOptions.print}>
                                {isPrinting ? <FaSpinner className="spinner" /> : <FaPrint />}
                            </OptionIconBox>
                            <OptionContent>
                                <OptionTitle>Wydrukuj protokół</OptionTitle>
                                <OptionDescription>
                                    Drukuje protokół przyjęcia pojazdu dla klienta
                                </OptionDescription>
                            </OptionContent>
                            <Checkbox selected={selectedOptions.print}>
                                <FaCheck />
                            </Checkbox>
                        </Option>

                        <Option
                            selected={selectedOptions.sendEmail}
                            onClick={() => handleOptionChange('sendEmail')}
                            disabled={!clientEmail}
                        >
                            <OptionIconBox selected={selectedOptions.sendEmail && !!clientEmail}>
                                {isSendingEmail ? <FaSpinner className="spinner" /> : <FaEnvelope />}
                            </OptionIconBox>
                            <OptionContent>
                                <OptionTitle>Wyślij na email</OptionTitle>
                                <OptionDescription>
                                    {clientEmail
                                        ? `Wyślij kopię protokołu na adres: ${clientEmail}`
                                        : 'Brak adresu email - opcja niedostępna'}
                                </OptionDescription>
                            </OptionContent>
                            <Checkbox selected={selectedOptions.sendEmail && !!clientEmail}>
                                <FaCheck />
                            </Checkbox>
                        </Option>
                    </OptionsContainer>
                </ModalBody>
                <ActionButtons>
                    <SkipButton onClick={handleSkip}>
                        <FaTimes /> Pomiń
                    </SkipButton>
                    <ConfirmButton
                        onClick={handleConfirm}
                        disabled={isPrinting || isSendingEmail}
                    >
                        <FaCheck /> Zatwierdź
                    </ConfirmButton>
                </ActionButtons>
            </ModalContent>
        </ModalOverlay>
    );
};

// Styled components
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

const ModalContent = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    width: 500px;
    max-width: 90%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const ModalTitle = styled.h2`
    font-size: 18px;
    margin: 0;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
`;

const ModalBody = styled.div`
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const ErrorMessage = styled.div`
    display: flex;
    padding: 15px;
    background-color: #fdecea;
    border-radius: 8px;
    color: #e74c3c;
    font-size: 14px;
    border-left: 3px solid #e74c3c;
`;

const SuccessMessage = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background-color: #eafaf1;
    border-radius: 8px;
`;

const SuccessIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: #2ecc71;
    color: white;
    border-radius: 50%;
    font-size: 18px;
`;

const SuccessTitle = styled.h3`
    margin: 0 0 5px 0;
    font-size: 16px;
    color: #27ae60;
`;

const SuccessText = styled.p`
    margin: 0;
    font-size: 14px;
    color: #2c3e50;
`;

const OptionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const Option = styled.div<{ selected: boolean, disabled?: boolean }>`
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid ${props => props.selected ? '#3498db' : '#e0e0e0'};
    background-color: ${props => props.selected ? '#f0f7ff' : 'white'};
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s;
    opacity: ${props => props.disabled ? 0.6 : 1};

    &:hover {
        background-color: ${props => !props.disabled && (props.selected ? '#f0f7ff' : '#f9f9f9')};
    }
`;

const OptionIconBox = styled.div<{ selected: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: ${props => props.selected ? '#3498db' : '#f5f5f5'};
    color: ${props => props.selected ? 'white' : '#7f8c8d'};
    border-radius: 8px;
    font-size: 18px;
    transition: all 0.2s;

    .spinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
`;

const OptionContent = styled.div`
    flex: 1;
`;

const OptionTitle = styled.h4`
    margin: 0 0 3px 0;
    font-size: 15px;
    color: #34495e;
`;

const OptionDescription = styled.p`
    margin: 0;
    font-size: 13px;
    color: #7f8c8d;
`;

const Checkbox = styled.div<{ selected: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background-color: ${props => props.selected ? '#3498db' : 'white'};
    border: 1px solid ${props => props.selected ? '#3498db' : '#ddd'};
    color: white;
    font-size: 12px;
    transition: all 0.2s;
    visibility: ${props => props.selected ? 'visible' : 'hidden'};
`;

const ActionButtons = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 15px 20px;
    border-top: 1px solid #eee;
`;

const ButtonBase = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
`;

const ConfirmButton = styled(ButtonBase)<{ disabled?: boolean }>`
    background-color: ${props => props.disabled ? '#95a5a6' : '#3498db'};
    color: white;
    border: none;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};

    &:hover:not(:disabled) {
        background-color: #2980b9;
    }
`;

const SkipButton = styled(ButtonBase)`
    background-color: white;
    color: #7f8c8d;
    border: 1px solid #ddd;

    &:hover {
        background-color: #f5f5f5;
    }
`;

export default ProtocolConfirmationModal;