import React from 'react';
import styled from 'styled-components';
import { FaKey, FaFileAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface ReturnItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    keysProvided: boolean;
    documentsProvided: boolean;
}

const ReturnItemsModal: React.FC<ReturnItemsModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               keysProvided,
                                                               documentsProvided
                                                           }) => {
    if (!isOpen) return null;

    // Sprawdzamy, czy cokolwiek było przekazane. Jeśli nie, to nie ma co oddawać
    const hasItemsToReturn = keysProvided || documentsProvided;

    if (!hasItemsToReturn) {
        // Automatycznie zamykamy modal, jeśli nie ma co oddać
        onClose();
        return null;
    }

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>
                        <ModalIcon><FaKey /></ModalIcon>
                        Zwrot przedmiotów klientowi
                    </ModalTitle>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </ModalHeader>
                <ModalBody>
                    <ModalDescription>
                        Przy przyjęciu pojazdu klient zostawił następujące przedmioty, które należy mu zwrócić:
                    </ModalDescription>

                    <ItemsList>
                        {keysProvided && (
                            <ItemRow>
                                <ItemIcon><FaKey /></ItemIcon>
                                <ItemText>Kluczyki do pojazdu</ItemText>
                                <ItemCheckmark><FaCheckCircle /></ItemCheckmark>
                            </ItemRow>
                        )}

                        {documentsProvided && (
                            <ItemRow>
                                <ItemIcon><FaFileAlt /></ItemIcon>
                                <ItemText>Dokumenty pojazdu</ItemText>
                                <ItemCheckmark><FaCheckCircle /></ItemCheckmark>
                            </ItemRow>
                        )}
                    </ItemsList>

                    <AlertBox>
                        <AlertIcon><FaExclamationTriangle /></AlertIcon>
                        <AlertText>
                            Upewnij się, że wszystkie przedmioty zostały zwrócone klientowi przed wydaniem pojazdu.
                        </AlertText>
                    </AlertBox>
                </ModalBody>
                <ModalFooter>
                    <ConfirmButton onClick={onClose}>
                        Potwierdzam zwrot przedmiotów
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
  color: #f39c12;
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

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
`;

const ItemIcon = styled.div`
  color: #f39c12;
  font-size: 20px;
  margin-right: 15px;
`;

const ItemText = styled.div`
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #34495e;
`;

const ItemCheckmark = styled.div`
  color: #2ecc71;
  font-size: 20px;
`;

const AlertBox = styled.div`
  background-color: #fff8e1;
  border-left: 3px solid #f39c12;
  padding: 12px 15px;
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

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #eee;
`;

const ConfirmButton = styled.button`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #f39c12;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #e67e22;
  }
`;

export default ReturnItemsModal;