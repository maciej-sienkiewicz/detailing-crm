import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaCheck, FaTimesCircle, FaTasks, FaClipboardCheck, FaExclamationTriangle, FaBan} from 'react-icons/fa';
import {CarReceptionProtocol} from "../../../../types";

interface QualityVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    protocol: CarReceptionProtocol;
}

const QualityVerificationModal: React.FC<QualityVerificationModalProps> = ({
                                                                               isOpen,
                                                                               onClose,
                                                                               onConfirm,
                                                                               protocol
                                                                           }) => {
    const [hasPendingServices, setHasPendingServices] = useState(false);
    const [pendingServicesCount, setPendingServicesCount] = useState(0);

    // Sprawdź, czy istnieją usługi w statusie "Oczekujące"
    useEffect(() => {
        if (protocol && protocol.selectedServices) {
            const pendingServices = protocol.selectedServices.filter(
                service => service.approvalStatus === 'PENDING'
            );
            setHasPendingServices(pendingServices.length > 0);
            setPendingServicesCount(pendingServices.length);
        }
    }, [protocol]);

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>
                        <ModalIcon><FaClipboardCheck /></ModalIcon>
                        Weryfikacja jakości
                    </ModalTitle>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </ModalHeader>
                <ModalBody>
                    <ModalDescription>
                        Pracownik zgłosił zakończenie prac. Zweryfikuj jakość wykonanej pracy przed zmianą statusu zlecenia.
                    </ModalDescription>

                    {hasPendingServices ? (
                        <ErrorBox>
                            <ErrorIcon><FaBan /></ErrorIcon>
                            <ErrorText>
                                <ErrorTitle>Oczekujące usługi wykryte</ErrorTitle>
                                <ErrorDescription>
                                    Zlecenie zawiera {pendingServicesCount} {pendingServicesCount === 1 ? 'usługę' :
                                    pendingServicesCount < 5 ? 'usługi' : 'usług'} oczekujących na potwierdzenie.
                                    Przed zmianą statusu należy zatwierdzić lub usunąć oczekujące usługi.
                                </ErrorDescription>
                            </ErrorText>
                        </ErrorBox>
                    ) : (
                        <AlertBox>
                            <AlertIcon><FaExclamationTriangle /></AlertIcon>
                            <AlertText>
                                Potwierdzenie zmieni status zlecenia na "Oczekiwanie na odbiór". Upewnij się, że wszystkie prace zostały wykonane prawidłowo.
                            </AlertText>
                        </AlertBox>
                    )}

                    <ChecklistSection>
                        <ChecklistTitle>Lista kontrolna:</ChecklistTitle>
                        <ChecklistItem>
                            <CheckIcon><FaTasks /></CheckIcon>
                            <CheckContent>
                                <CheckLabel>Zgodność z zakresem usługi</CheckLabel>
                                <CheckDescription>Wszystkie zamówione usługi zostały wykonane</CheckDescription>
                            </CheckContent>
                        </ChecklistItem>
                        <ChecklistItem>
                            <CheckIcon><FaTasks /></CheckIcon>
                            <CheckContent>
                                <CheckLabel>Jakość wykonania</CheckLabel>
                                <CheckDescription>Praca została wykonana starannie (brak niedokładności)</CheckDescription>
                            </CheckContent>
                        </ChecklistItem>
                        <ChecklistItem>
                            <CheckIcon><FaTasks /></CheckIcon>
                            <CheckContent>
                                <CheckLabel>Stan pojazdu</CheckLabel>
                                <CheckDescription>Pojazd nie posiada dodatkowych uszkodzeń</CheckDescription>
                            </CheckContent>
                        </ChecklistItem>
                    </ChecklistSection>
                </ModalBody>
                <ModalFooter>
                    <RejectButton onClick={onClose}>
                        <FaTimesCircle /> Wymaga poprawek
                    </RejectButton>

                    <ConfirmButton onClick={onConfirm} disabled={hasPendingServices}>
                        <FaCheck /> Gotowe
                    </ConfirmButton>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styl dla ErrorBox - ostrzeżenie o oczekujących usługach
const ErrorBox = styled.div`
    background-color: #fdecea;  // Jasne czerwone tło
    border-left: 3px solid #e74c3c;  // Czerwony pasek z lewej strony
    padding: 12px 15px;
    margin-bottom: 15px;
    border-radius: 4px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
`;

const ErrorIcon = styled.div`
    color: #e74c3c;  // Czerwona ikona
    font-size: 16px;
    margin-top: 2px;
`;

const ErrorText = styled.div`
    flex: 1;
`;

const ErrorTitle = styled.div`
    font-weight: 600;
    color: #e74c3c;  // Czerwony tytuł błędu
    margin-bottom: 4px;
    font-size: 14px;
`;

const ErrorDescription = styled.div`
    font-size: 13px;
    color: #34495e;
    line-height: 1.4;
`;

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
    width: 500px;
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
    margin-bottom: 15px;
`;

const AlertBox = styled.div`
    background-color: #fff8e1;
    border-left: 3px solid #f39c12;
    padding: 12px 15px;
    margin-bottom: 15px;
    border-radius: 4px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
`;

const AlertIcon = styled.div`
    color: #f39c12;
    font-size: 16px;
    margin-top: 2px;
`;

const AlertText = styled.div`
    font-size: 13px;
    color: #34495e;
`;

const ChecklistSection = styled.div`
    margin-top: 20px;
    background-color: #f8f9fa;
    border-radius: 6px;
    padding: 15px;
`;

const ChecklistTitle = styled.h3`
    font-size: 15px;
    margin: 0 0 15px 0;
    color: #2c3e50;
`;

const ChecklistItem = styled.div`
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;

    &:last-child {
        margin-bottom: 0;
    }
`;

const CheckIcon = styled.div`
    color: #3498db;
    margin-right: 10px;
    margin-top: 2px;
`;

const CheckContent = styled.div`
    flex: 1;
`;

const CheckLabel = styled.div`
    font-weight: 500;
    font-size: 14px;
    color: #34495e;
    margin-bottom: 2px;
`;

const CheckDescription = styled.div`
    font-size: 13px;
    color: #7f8c8d;
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

const RejectButton = styled(Button)`
    background-color: white;
    color: #e74c3c;
    border: 1px solid #e74c3c;

    &:hover {
        background-color: #fef5f5;
    }
`;

const ConfirmButton = styled(Button)<{ disabled?: boolean }>`
    background-color: ${props => props.disabled ? '#bdc3c7' : '#2ecc71'};
    color: white;
    border: none;

    &:hover {
        background-color: ${props => props.disabled ? '#bdc3c7' : '#27ae60'};
    }
`;

export default QualityVerificationModal;