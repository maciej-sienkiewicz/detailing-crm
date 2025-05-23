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
    const [isPriceGross, setIsPriceGross] = useState<boolean>(true);

    // Domyślna stawka VAT
    const DEFAULT_VAT_RATE = 23;

    // Reset stanu przy otwarciu modalu
    useEffect(() => {
        if (isOpen) {
            setPrice(initialPrice >= 0 ? initialPrice.toString() : '');
            setError(null);
            setIsPriceGross(true);
        }
    }, [isOpen, initialPrice]);

    // Funkcje do przeliczania cen netto/brutto
    const calculateNetPrice = (grossPrice: number): number => {
        return grossPrice / (1 + DEFAULT_VAT_RATE / 100);
    };

    const calculateGrossPrice = (netPrice: number): number => {
        return netPrice * (1 + DEFAULT_VAT_RATE / 100);
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Pozwól na wprowadzanie tylko cyfr i kropki/przecinka
        if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
            setPrice(value);
            setError(null);
        }
    };

    // Zmiana typu ceny (brutto/netto)
    const handlePriceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newIsPriceGross = e.target.value === "gross";

        // Przelicz wartość w polu, jeśli jest liczbą
        const parsedPrice = parseFloat(price.replace(',', '.'));
        if (!isNaN(parsedPrice) && parsedPrice > 0) {
            if (isPriceGross && !newIsPriceGross) {
                // Zmiana z brutto na netto
                setPrice(calculateNetPrice(parsedPrice).toFixed(2));
            } else if (!isPriceGross && newIsPriceGross) {
                // Zmiana z netto na brutto
                setPrice(calculateGrossPrice(parsedPrice).toFixed(2));
            }
        }

        setIsPriceGross(newIsPriceGross);
    };

    const handleSave = () => {
        // Konwersja na liczbę i sprawdzenie czy jest prawidłowa
        const numericPrice = parseFloat(price.replace(',', '.'));

        if (isNaN(numericPrice)) {
            setError('Wprowadź poprawną cenę');
            return;
        }

        if (numericPrice < 0) {
            setError('Cena nie może być ujemna');
            return;
        }

        // Jeśli cena jest netto, przelicz ją na brutto przed zapisaniem
        const finalPrice = isPriceGross ? numericPrice : calculateGrossPrice(numericPrice);

        onSave(finalPrice);
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

    // Wyświetlanie przeliczonej ceny dla informacji użytkownika
    const displayConvertedPrice = () => {
        const parsedPrice = parseFloat(price.replace(',', '.'));
        if (!isNaN(parsedPrice) && parsedPrice > 0) {
            if (isPriceGross) {
                // Jeśli wprowadzamy brutto, pokazujemy netto
                const netPrice = calculateNetPrice(parsedPrice);
                return `${netPrice.toFixed(2)} zł netto`;
            } else {
                // Jeśli wprowadzamy netto, pokazujemy brutto
                const grossPrice = calculateGrossPrice(parsedPrice);
                return `${grossPrice.toFixed(2)} zł brutto`;
            }
        }
        return '';
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
                    <Label htmlFor="priceType">Typ ceny</Label>
                    <PriceTypeSelect
                        id="priceType"
                        value={isPriceGross ? "gross" : "net"}
                        onChange={handlePriceTypeChange}
                    >
                        <option value="gross">Cena brutto</option>
                        <option value="net">Cena netto</option>
                    </PriceTypeSelect>
                </FormGroup>

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
                    {displayConvertedPrice() && (
                        <ConversionInfo>{displayConvertedPrice()}</ConversionInfo>
                    )}
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

const PriceTypeSelect = styled.select`
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
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

const ConversionInfo = styled.div`
  font-size: 13px;
  color: #7f8c8d;
  margin-top: 4px;
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