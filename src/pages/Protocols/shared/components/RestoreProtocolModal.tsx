import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaRegCalendar, FaRegClock } from 'react-icons/fa';

export type RestoreOption = 'SCHEDULED' | 'REALTIME';

interface RestoreProtocolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRestore: (option: RestoreOption) => void;
    protocolId: string;
}

const RestoreProtocolModal: React.FC<RestoreProtocolModalProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       onRestore,
                                                                       protocolId
                                                                   }) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContent>
                <ModalHeader>
                    <ModalTitle>Przywracanie wizyty</ModalTitle>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <InfoMessage>
                        Wybierz sposób przywrócenia anulowanej wizyty:
                    </InfoMessage>

                    <OptionContainer>
                        <OptionCard onClick={() => onRestore('SCHEDULED')}>
                            <OptionIcon>
                                <FaRegCalendar />
                            </OptionIcon>
                            <OptionTitle>Z nową datą</OptionTitle>
                            <OptionDescription>
                                Przywróć wizytę z możliwością ustawienia nowej daty. Wizyta otrzyma status "Zaplanowana".
                            </OptionDescription>
                        </OptionCard>

                        <OptionCard onClick={() => onRestore('REALTIME')}>
                            <OptionIcon>
                                <FaRegClock />
                            </OptionIcon>
                            <OptionTitle>W czasie rzeczywistym</OptionTitle>
                            <OptionDescription>
                                Przywróć wizytę i rozpocznij ją teraz. Wizyta otrzyma status "W realizacji".
                            </OptionDescription>
                        </OptionCard>
                    </OptionContainer>
                </ModalBody>

                <ModalFooter>
                    <CancelButton onClick={onClose}>
                        Anuluj
                    </CancelButton>
                </ModalFooter>
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
    width: 550px;
    max-width: 90%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    color: #34495e;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 18px;
    color: #7f8c8d;
    cursor: pointer;
    
    &:hover {
        color: #34495e;
    }
`;

const ModalBody = styled.div`
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const InfoMessage = styled.div`
    font-size: 14px;
    color: #34495e;
    text-align: center;
`;

const OptionContainer = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 16px;
    
    @media (max-width: 600px) {
        flex-direction: column;
    }
`;

const OptionCard = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    text-align: center;
    
    &:hover {
        border-color: #3498db;
        background-color: #f0f7ff;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
`;

const OptionIcon = styled.div`
    font-size: 24px;
    color: #3498db;
    margin-bottom: 16px;
`;

const OptionTitle = styled.h4`
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #34495e;
`;

const OptionDescription = styled.p`
    margin: 0;
    font-size: 13px;
    color: #7f8c8d;
    line-height: 1.4;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: 15px 20px;
    border-top: 1px solid #eee;
`;

const CancelButton = styled.button`
    padding: 8px 16px;
    background-color: #f8f9fa;
    color: #7f8c8d;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    
    &:hover {
        background-color: #f1f1f1;
    }
`;

export default RestoreProtocolModal;