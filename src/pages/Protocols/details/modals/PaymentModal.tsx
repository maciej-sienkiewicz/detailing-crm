// PaymentModal.tsx - główne zmiany w tym komponencie
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaMoneyBill, FaCreditCard, FaFileInvoice, FaReceipt, FaFileAlt, FaCheck, FaEdit, FaListAlt } from 'react-icons/fa';
import { useToast } from "../../../../components/common/Toast/Toast";
import { SelectedService } from "../../../../types";
import InvoiceItemsModal from "./InvoiceItemsModal";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (paymentData: {
        paymentMethod: 'cash' | 'card';
        documentType: 'invoice' | 'receipt' | 'other';
        invoiceItems?: SelectedService[];
    }) => void;
    totalAmount: number;
    services: SelectedService[];
    onServicesChange: (services: SelectedService[]) => void; // Callback do aktualizacji usług
    protocolId: string; // Dodany parametr ID protokołu
}

const PaymentModal: React.FC<PaymentModalProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       onConfirm,
                                                       totalAmount: initialTotalAmount,
                                                       services,
                                                       onServicesChange,
                                                       protocolId
                                                   }) => {
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    const [documentType, setDocumentType] = useState<'invoice' | 'receipt' | 'other'>('receipt');
    const [showInvoiceItemsModal, setShowInvoiceItemsModal] = useState(false);
    const [customInvoiceItems, setCustomInvoiceItems] = useState<SelectedService[] | null>(null);
    const [modifiedTotalAmount, setModifiedTotalAmount] = useState<number | null>(null);
    const { showToast } = useToast();

    // Resetuj stan przy otwarciu modalu
    useEffect(() => {
        if (isOpen) {
            setPaymentMethod('cash');
            setDocumentType('receipt');
            setCustomInvoiceItems(null);
            setModifiedTotalAmount(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Aktualna kwota do zapłaty - użyj zmodyfikowanej lub oryginalnej
    const currentTotalAmount = modifiedTotalAmount !== null ? modifiedTotalAmount : initialTotalAmount;

    // Funkcja otwierająca modal edycji pozycji faktury
    const handleEditInvoiceItems = () => {
        setShowInvoiceItemsModal(true);
    };

    // Funkcja obsługująca zapisanie niestandardowych pozycji faktury
    const handleInvoiceItemsSave = (items: SelectedService[]) => {
        setCustomInvoiceItems(items);

        // Obliczamy sumę cen zmodyfikowanych pozycji i aktualizujemy kwotę do zapłaty
        const newTotal = items.reduce((sum, item) => sum + item.finalPrice, 0);
        setModifiedTotalAmount(newTotal);

        setShowInvoiceItemsModal(false);

        // Wywołujemy callback do aktualizacji usług w protokole
        onServicesChange(items);

        // Jeśli suma różni się od oryginalnej kwoty, pokaż informacyjną wiadomość
        if (Math.abs(newTotal - initialTotalAmount) > 0.01) {
            showToast('info', `Suma po modyfikacji pozycji: ${newTotal.toFixed(2)} zł (oryginalna kwota: ${initialTotalAmount.toFixed(2)} zł)`, 5000);
        }
    };

    const handleConfirm = () => {
        // Przygotuj dane płatności
        const paymentData = {
            paymentMethod,
            documentType,
            // Dodaj niestandardowe pozycje faktury, jeśli są dostępne i typ dokumentu to faktura
            invoiceItems: documentType === 'invoice' && customInvoiceItems ? customInvoiceItems : undefined
        };

        // Dodaj dodatkowe walidacje, jeśli potrzebne
        if (documentType === 'invoice' && customInvoiceItems) {
            // Sprawdź, czy suma się zgadza
            const originalTotal = initialTotalAmount;
            const customTotal = customInvoiceItems.reduce((sum, item) => sum + item.finalPrice, 0);

            // Jeśli różnica jest większa niż 1 grosz, wyświetl ostrzeżenie
            if (Math.abs(originalTotal - customTotal) > 0.01) {
                const confirmed = window.confirm(
                    `Uwaga: Suma zmodyfikowanych pozycji (${customTotal.toFixed(2)} zł) ` +
                    `różni się od oryginalnej kwoty (${originalTotal.toFixed(2)} zł). ` +
                    `Czy na pewno chcesz kontynuować?`
                );

                if (!confirmed) {
                    return; // Anuluj jeśli użytkownik nie potwierdzi
                }
            }
        }

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

                    <AmountInfo modified={modifiedTotalAmount !== null}>
                        <AmountLabel>Do zapłaty:</AmountLabel>
                        <AmountValue>{currentTotalAmount.toFixed(2)} zł</AmountValue>
                        {modifiedTotalAmount !== null && (
                            <ModifiedAmountHint>(zmodyfikowano)</ModifiedAmountHint>
                        )}
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

                    {/* Dodatkowe opcje dla faktury */}
                    {documentType === 'invoice' && (
                        <InvoiceOptionsContainer>
                            {customInvoiceItems ? (
                                <CustomItemsSummary>
                                    <CustomItemsInfo>
                                        Zmodyfikowano {customInvoiceItems.length} {
                                        customInvoiceItems.length === 1 ? 'pozycję' :
                                            customInvoiceItems.length < 5 ? 'pozycje' : 'pozycji'
                                    }
                                    </CustomItemsInfo>
                                    <EditButton onClick={handleEditInvoiceItems}>
                                        <FaEdit /> Edytuj
                                    </EditButton>
                                </CustomItemsSummary>
                            ) : (
                                <EditInvoiceItemsButton onClick={handleEditInvoiceItems}>
                                    <FaListAlt /> Edytuj pozycje faktury
                                </EditInvoiceItemsButton>
                            )}
                        </InvoiceOptionsContainer>
                    )}
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={onClose}>Anuluj</CancelButton>
                    <ConfirmButton onClick={handleConfirm}>
                        <FaCheck /> Zatwierdź i wydaj pojazd
                    </ConfirmButton>
                </ModalFooter>
            </ModalContainer>

            {/* Modal do edycji pozycji faktury - przekazujemy protocolId */}
            <InvoiceItemsModal
                isOpen={showInvoiceItemsModal}
                onClose={() => setShowInvoiceItemsModal(false)}
                onSave={handleInvoiceItemsSave}
                services={customInvoiceItems || services}
                protocolId={protocolId}
            />
        </ModalOverlay>
    );
};

const ModifiedAmountHint = styled.div`
    position: absolute;
    bottom: 5px;
    right: 15px;
    font-size: 11px;
    color: #3498db;
    font-style: italic;
`;

const EditInvoiceItemsButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    background-color: #f0f7ff;
    color: #3498db;
    border: 1px solid #d5e9f9;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
    justify-content: center;
    
    &:hover {
        background-color: #d5e9f9;
    }
`;

// Pozostawiamy wszystkie style bez zmian

// Style komponentów (zachowujemy istniejące style)
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

const AmountInfo = styled.div<{ modified?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${props => props.modified ? '#f0f7ff' : '#f0f7ff'};
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 20px;
    border-left: 3px solid ${props => props.modified ? '#3498db' : '#3498db'};
    position: relative;
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

// Nowe komponenty do obsługi edycji pozycji faktury
const InvoiceOptionsContainer = styled.div`
    margin-top: 5px;
    padding-top: 15px;
    border-top: 1px dashed #eee;
`;

const CheckboxContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
`;

const CheckboxInput = styled.input`
    margin-right: 8px;
`;

const CheckboxLabel = styled.label`
    font-size: 14px;
    color: #34495e;
    cursor: pointer;
`;

const CustomItemsSummary = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #eafaf1;
    border-radius: 4px;
    padding: 10px 12px;
    margin-top: 10px;
`;

const CustomItemsInfo = styled.div`
    font-size: 13px;
    color: #27ae60;
`;

const EditButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: #2980b9;
    font-size: 13px;
    cursor: pointer;
    padding: 5px 8px;
    border-radius: 4px;
    
    &:hover {
        background-color: rgba(52, 152, 219, 0.1);
    }
`;

export default PaymentModal;