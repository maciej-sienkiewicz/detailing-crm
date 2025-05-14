import React, { useState } from 'react';
import styled from 'styled-components';
import { FaMoneyBill, FaCreditCard, FaFileInvoice, FaReceipt, FaFileAlt, FaCheck } from 'react-icons/fa';
import {useToast} from "../../../../components/common/Toast/Toast";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (paymentData: {
        paymentMethod: 'cash' | 'card';
        documentType: 'invoice' | 'receipt' | 'other';
    }) => void;
    totalAmount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       onConfirm,
                                                       totalAmount
                                                   }) => {
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    const [documentType, setDocumentType] = useState<'invoice' | 'receipt' | 'other'>('receipt');
    const { showToast } = useToast(); // Hook do wyświetlania powiadomień

    if (!isOpen) return null;

    const handleConfirm = () => {
        // Przygotuj dane płatności
        const paymentData = {
            paymentMethod,
            documentType
        };

        // Wyświetl odpowiednie powiadomienia w zależności od wyborów
        if (paymentMethod === 'cash') {
            showToast('success', 'Dodano nowy rekord w kasie.', 3000);
        }

        if (documentType === 'invoice') {
            showToast('success', 'Dodano nową pozycję w archiwum faktur', 3000);
        }

        onConfirm(paymentData);
    };

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>
                        <ModalIcon><FaMoneyBill /></ModalIcon>
                        Płatność i dokumenty
                    </ModalTitle>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </ModalHeader>
                <ModalBody>
                    <ModalDescription>
                        Wybierz metodę płatności oraz rodzaj dokumentu, który ma zostać wystawiony.
                    </ModalDescription>

                    <AmountInfo>
                        <AmountLabel>Do zapłaty:</AmountLabel>
                        <AmountValue>{totalAmount.toFixed(2)} zł</AmountValue>
                    </AmountInfo>

                    <SectionTitle>Metoda płatności</SectionTitle>
                    <OptionsContainer>
                        <OptionCard
                            selected={paymentMethod === 'cash'}
                            onClick={() => setPaymentMethod('cash')}
                        >
                            <OptionIcon><FaMoneyBill /></OptionIcon>
                            <OptionLabel>Gotówka</OptionLabel>
                        </OptionCard>

                        <OptionCard
                            selected={paymentMethod === 'card'}
                            onClick={() => setPaymentMethod('card')}
                        >
                            <OptionIcon><FaCreditCard /></OptionIcon>
                            <OptionLabel>Karta płatnicza</OptionLabel>
                        </OptionCard>
                    </OptionsContainer>

                    <SectionTitle>Dokument sprzedaży</SectionTitle>
                    <OptionsContainer>
                        <OptionCard
                            selected={documentType === 'invoice'}
                            onClick={() => setDocumentType('invoice')}
                        >
                            <OptionIcon><FaFileInvoice /></OptionIcon>
                            <OptionLabel>Faktura VAT</OptionLabel>
                        </OptionCard>

                        <OptionCard
                            selected={documentType === 'receipt'}
                            onClick={() => setDocumentType('receipt')}
                        >
                            <OptionIcon><FaReceipt /></OptionIcon>
                            <OptionLabel>Paragon fiskalny</OptionLabel>
                        </OptionCard>

                        <OptionCard
                            selected={documentType === 'other'}
                            onClick={() => setDocumentType('other')}
                        >
                            <OptionIcon><FaFileAlt /></OptionIcon>
                            <OptionLabel>Inny dokument</OptionLabel>
                        </OptionCard>
                    </OptionsContainer>
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={onClose}>
                        Anuluj
                    </CancelButton>
                    <ConfirmButton onClick={handleConfirm}>
                        <FaCheck /> Zatwierdź i wydaj pojazd
                    </ConfirmButton>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled components pozostają bez zmian
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
    color: #2ecc71;
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

const AmountInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f0f7ff;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 20px;
`;

const AmountLabel = styled.div`
    font-weight: 500;
    font-size: 16px;
    color: #34495e;
`;

const AmountValue = styled.div`
    font-weight: 600;
    font-size: 18px;
    color: #2ecc71;
`;

const SectionTitle = styled.h3`
    font-size: 15px;
    margin: 0 0 10px 0;
    color: #34495e;
`;

const OptionsContainer = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
`;

const OptionCard = styled.div<{ selected: boolean }>`
    flex: 1;
    min-width: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: ${props => props.selected ? '#eafaf1' : '#f8f9fa'};
    border: 2px solid ${props => props.selected ? '#2ecc71' : 'transparent'};
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: ${props => props.selected ? '#eafaf1' : '#f0f0f0'};
    }
`;

const OptionIcon = styled.div`
    font-size: 24px;
    color: #2ecc71;
    margin-bottom: 10px;
`;

const OptionLabel = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #34495e;
    text-align: center;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: 15px 20px;
    border-top: 1px solid #eee;
    gap: 10px;
`;

const CancelButton = styled.button`
    padding: 8px 16px;
    background-color: white;
    color: #7f8c8d;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        background-color: #f5f5f5;
    }
`;

const ConfirmButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: #2ecc71;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        background-color: #27ae60;
    }
`;

export default PaymentModal;