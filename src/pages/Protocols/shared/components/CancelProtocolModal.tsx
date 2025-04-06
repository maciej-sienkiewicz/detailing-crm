// src/pages/Protocols/shared/modals/CancelProtocolModal.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

export type CancellationReason = 'CLIENT_REFUSAL' | 'CANCELLED_WITH_CONSENT' | 'NOT_RELEVANT';

interface CancelProtocolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: CancellationReason) => void;
    protocolId: string;
}

const CancelProtocolModal: React.FC<CancelProtocolModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onConfirm,
                                                                     protocolId
                                                                 }) => {
    const [selectedReason, setSelectedReason] = useState<CancellationReason | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = () => {
        if (!selectedReason) return;

        setIsSubmitting(true);
        onConfirm(selectedReason);
        // resetowanie stanu po zamknięciu
        setTimeout(() => {
            setSelectedReason(null);
            setIsSubmitting(false);
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContent>
                <ModalHeader>
                    <WarningIcon>
                        <FaExclamationTriangle />
                    </WarningIcon>
                    <ModalTitle>Anulowanie wizyty</ModalTitle>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <WarningMessage>
                        Anulowanie wizyty jest nieodwracalne. Protokół zostanie oznaczony jako anulowany.
                    </WarningMessage>

                    <FormGroup>
                        <Label>Wybierz powód anulowania:</Label>

                        <ReasonOption
                            selected={selectedReason === 'CLIENT_REFUSAL'}
                            onClick={() => setSelectedReason('CLIENT_REFUSAL')}
                        >
                            <RadioButton selected={selectedReason === 'CLIENT_REFUSAL'} />
                            <ReasonText>Odmowa klienta</ReasonText>
                        </ReasonOption>

                        <ReasonOption
                            selected={selectedReason === 'CANCELLED_WITH_CONSENT'}
                            onClick={() => setSelectedReason('CANCELLED_WITH_CONSENT')}
                        >
                            <RadioButton selected={selectedReason === 'CANCELLED_WITH_CONSENT'} />
                            <ReasonText>Anulowano za zgodą</ReasonText>
                        </ReasonOption>

                        <ReasonOption
                            selected={selectedReason === 'NOT_RELEVANT'}
                            onClick={() => setSelectedReason('NOT_RELEVANT')}
                        >
                            <RadioButton selected={selectedReason === 'NOT_RELEVANT'} />
                            <ReasonText>Nieistotne</ReasonText>
                        </ReasonOption>
                    </FormGroup>
                </ModalBody>

                <ModalFooter>
                    <CancelButton onClick={onClose} disabled={isSubmitting}>
                        Wróć
                    </CancelButton>
                    <ConfirmButton
                        onClick={handleConfirm}
                        disabled={!selectedReason || isSubmitting}
                    >
                        {isSubmitting ? 'Anulowanie...' : 'Anuluj wizytę'}
                    </ConfirmButton>
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
    width: 450px;
    max-width: 90%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
`;

const WarningIcon = styled.div`
    color: #e74c3c;
    font-size: 20px;
    margin-right: 10px;
`;

const ModalTitle = styled.h3`
    margin: 0;
    flex-grow: 1;
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
    gap: 16px;
`;

const WarningMessage = styled.div`
    padding: 12px 15px;
    background-color: #fef2f2;
    border-left: 3px solid #e74c3c;
    color: #b91c1c;
    font-size: 14px;
    border-radius: 4px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const Label = styled.label`
    font-weight: 500;
    font-size: 14px;
    color: #34495e;
    margin-bottom: 6px;
`;

const ReasonOption = styled.div<{ selected: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 15px;
    border: 1px solid ${props => props.selected ? '#3498db' : '#e0e0e0'};
    border-radius: 6px;
    background-color: ${props => props.selected ? '#f0f7ff' : 'white'};
    cursor: pointer;
    
    &:hover {
        background-color: ${props => props.selected ? '#f0f7ff' : '#f9f9f9'};
    }
`;

const RadioButton = styled.div<{ selected: boolean }>`
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid ${props => props.selected ? '#3498db' : '#bdc3c7'};
    display: flex;
    align-items: center;
    justify-content: center;
    
    &::after {
        content: '';
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #3498db;
        display: ${props => props.selected ? 'block' : 'none'};
    }
`;

const ReasonText = styled.div`
    font-size: 14px;
    color: #34495e;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 15px 20px;
    border-top: 1px solid #eee;
`;

const Button = styled.button<{ disabled?: boolean }>`
    padding: 10px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    opacity: ${props => props.disabled ? 0.7 : 1};
`;

const CancelButton = styled(Button)`
    background-color: white;
    color: #7f8c8d;
    border: 1px solid #ddd;
    
    &:hover:not(:disabled) {
        background-color: #f5f5f5;
    }
`;

const ConfirmButton = styled(Button)`
    background-color: #e74c3c;
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
        background-color: #c0392b;
    }
`;

export default CancelProtocolModal;