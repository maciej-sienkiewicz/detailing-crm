import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from '../../../../components/common/Modal';

interface PriceEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (price: number) => void;
    serviceName: string;
    isNewService: boolean;
    initialPrice?: number;
}

const PriceEditModal: React.FC<PriceEditModalProps> = ({
                                                           isOpen,
                                                           onClose,
                                                           onSave,
                                                           serviceName,
                                                           isNewService,
                                                           initialPrice = 0
                                                       }) => {
    const [price, setPrice] = useState<string>(initialPrice > 0 ? initialPrice.toString() : '');
    const [error, setError] = useState<string | null>(null);

    // Reset stanu przy otwarciu modalu
    useEffect(() => {
        if (isOpen) {
            setPrice(initialPrice >= 0 ? initialPrice.toString() : '');
            setError(null);
        }
    }, [isOpen, initialPrice]);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Pozwól na wprowadzanie tylko cyfr i kropki/przecinka
        if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
            setPrice(value);
            setError(null);
        }
    };

    const handleSave = () => {
        // Konwersja na liczbę i sprawdzenie czy jest prawidłowa
        const numericPrice = parseFloat(price.replace(',', '.'));

        if (numericPrice < 0) {
            setError('Cena nie może być ujemna');
            return;
        }

        onSave(numericPrice);
        setPrice('');
        setError(null);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isNewService ? "Dodaj nową usługę" : "Edytuj cenę usługi"}
        >
            <ModalContent>
                <ServiceInfo>
                    <InfoLabel>Nazwa usługi:</InfoLabel>
                    <InfoValue>{serviceName}</InfoValue>
                </ServiceInfo>

                <FormGroup>
                    <Label htmlFor="price">Cena (PLN)</Label>
                    <PriceInput
                        id="price"
                        type="text"
                        value={price}
                        onChange={handlePriceChange}
                        onKeyDown={handleKeyDown}
                        placeholder="0.00"
                        autoFocus
                    />
                    {error && <ErrorText>{error}</ErrorText>}
                </FormGroup>

                <ButtonGroup>
                    <CancelButton onClick={onClose}>Anuluj</CancelButton>
                    <SaveButton onClick={handleSave}>Zapisz</SaveButton>
                </ButtonGroup>
            </ModalContent>
        </Modal>
    );
};

// Styled components
const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ServiceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
`;

const InfoLabel = styled.div`
  font-size: 14px;
  color: #7f8c8d;
`;

const InfoValue = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #34495e;
  word-break: break-word;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const PriceInput = styled.input`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const ErrorText = styled.div`
  color: #e74c3c;
  font-size: 13px;
`;

const InfoText = styled.div`
  font-size: 14px;
  color: #3498db;
  background-color: #eaf6fd;
  padding: 10px;
  border-radius: 4px;
  border-left: 3px solid #3498db;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
`;

const CancelButton = styled(Button)`
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const SaveButton = styled(Button)`
  background-color: #3498db;
  color: white;
  border: none;
  
  &:hover {
    background-color: #2980b9;
  }
`;

export default PriceEditModal;