import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa';
import { useToast } from "../../../../components/common/Toast/Toast";
import { SelectedService } from "../../../../types";
import InvoiceItemsModal from "./InvoiceItemsModal";
import InvoiceSignatureConfirmationModal from "./InvoiceSignatureConfirmationModal";
import * as S from './PaymentModalStyles';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (paymentData: {
        paymentMethod: 'cash' | 'card' | 'transfer';
        documentType: 'invoice' | 'receipt' | 'other';
        paymentDays?: number;
        overridenItems?: SelectedService[];
        invoiceSignatureSessionId?: string; // Nowe pole dla ID sesji podpisu faktury
    }) => void;
    totalAmount: number;
    services: SelectedService[];
    onServicesChange: (services: SelectedService[]) => void;
    protocolId: string;
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
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
    const [documentType, setDocumentType] = useState<'invoice' | 'receipt' | 'other'>('receipt');
    const [paymentDays, setPaymentDays] = useState<number>(7);
    const [showInvoiceItemsModal, setShowInvoiceItemsModal] = useState(false);
    const [showInvoiceSignatureModal, setShowInvoiceSignatureModal] = useState(false);
    const [pendingInvoiceItems, setPendingInvoiceItems] = useState<SelectedService[] | null>(null);
    const [invoiceSignatureSessionId, setInvoiceSignatureSessionId] = useState<string>('');

    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen && !showInvoiceItemsModal && !showInvoiceSignatureModal) {
            if (!pendingInvoiceItems) {
                setPaymentMethod('cash');
                setDocumentType('receipt');
                setPaymentDays(7);
                setInvoiceSignatureSessionId('');
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setPendingInvoiceItems(null);
            setPaymentMethod('cash');
            setDocumentType('receipt');
            setPaymentDays(7);
            setInvoiceSignatureSessionId('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const areItemsModified = (originalItems: SelectedService[], modifiedItems: SelectedService[] | null): boolean => {
        if (!modifiedItems) return false;

        if (originalItems.length !== modifiedItems.length) return true;

        for (let i = 0; i < originalItems.length; i++) {
            const original = originalItems[i];
            const modified = modifiedItems.find(item => item.id === original.id);

            if (!modified || modified.name !== original.name) {
                return true;
            }
        }

        const hasMergedItems = modifiedItems.some(item => item.id.startsWith('merged_'));
        return hasMergedItems;
    };

    const currentServices = pendingInvoiceItems || services;
    const currentTotalAmount = currentServices.reduce((sum, item) => sum + item.finalPrice, 0);

    const handleEditInvoiceItems = () => {
        setShowInvoiceItemsModal(true);
    };

    const handleInvoiceItemsSave = (items: SelectedService[]) => {
        setPendingInvoiceItems(items);
        setShowInvoiceItemsModal(false);

        const newTotal = items.reduce((sum, item) => sum + item.finalPrice, 0);

        if (Math.abs(newTotal - initialTotalAmount) > 0.01) {
            showToast('info', `Pozycje faktury zostały zmodyfikowane. Nowa suma: ${newTotal.toFixed(2)} zł`, 3000);
        }
    };

    const handleConfirm = () => {
        // Jeśli wybrano fakturę, pokaż modal z pytaniem o podpis
        if (documentType === 'invoice') {
            setShowInvoiceSignatureModal(true);
            return;
        }

        // Dla innych typów dokumentów, kontynuuj normalnie
        finalizePayment(false);
    };

    const handleInvoiceSignatureConfirm = (withSignature: boolean, sessionId?: string) => {
        if (withSignature && sessionId) {
            setInvoiceSignatureSessionId(sessionId);
            showToast('success', 'Podpis cyfrowy został zebrany i dołączony do faktury.', 4000);
        }

        setShowInvoiceSignatureModal(false);
        finalizePayment(withSignature, sessionId);
    };

    const finalizePayment = (withInvoiceSignature: boolean, sessionId?: string) => {
        const itemsWereModified = areItemsModified(services, pendingInvoiceItems);

        const paymentData = {
            paymentMethod,
            documentType,
            ...(paymentMethod === 'transfer' ? { paymentDays } : {}),
            ...(itemsWereModified && pendingInvoiceItems ? { overridenItems: pendingInvoiceItems } : {}),
            ...(withInvoiceSignature && sessionId ? { invoiceSignatureSessionId: sessionId } : {})
        };

        if (itemsWereModified && pendingInvoiceItems) {
            const originalTotal = initialTotalAmount;
            const customTotal = pendingInvoiceItems.reduce((sum, item) => sum + item.finalPrice, 0);

            if (Math.abs(originalTotal - customTotal) > 0.01) {
                const confirmed = window.confirm(
                    `Uwaga: Suma zmodyfikowanych pozycji (${customTotal.toFixed(2)} zł) ` +
                    `różni się od oryginalnej kwoty (${originalTotal.toFixed(2)} zł). ` +
                    `Czy na pewno chcesz kontynuować?`
                );

                if (!confirmed) return;
            }
        }

        if (paymentMethod === 'cash') {
            showToast('success', 'Dodano nowy rekord w kasie.', 3000);
        }

        if (documentType === 'invoice') {
            const signatureMsg = withInvoiceSignature ? ' z podpisem cyfrowym' : '';
            showToast('success', `Dodano nową pozycję w archiwum faktur${signatureMsg}`, 3000);
        }

        onConfirm(paymentData);
    };

    const handleCloseInvoiceModal = () => {
        setShowInvoiceItemsModal(false);
    };

    const handleCloseInvoiceSignatureModal = () => {
        setShowInvoiceSignatureModal(false);
    };

    const paymentOptions = [
        {
            id: 'cash',
            title: 'Gotówka',
            description: 'Płatność bezpośrednia',
            icon: 'money'
        },
        {
            id: 'card',
            title: 'Karta płatnicza',
            description: 'Płatność elektroniczna',
            icon: 'card'
        },
        {
            id: 'transfer',
            title: 'Przelew bankowy',
            description: 'Płatność z odroczeniem',
            icon: 'transfer'
        }
    ];

    const documentOptions = [
        {
            id: 'invoice',
            title: 'Faktura VAT',
            description: 'Dokument księgowy',
            icon: 'invoice'
        },
        {
            id: 'receipt',
            title: 'Paragon fiskalny',
            description: 'Dokument kasowy',
            icon: 'receipt'
        },
        {
            id: 'other',
            title: 'Inny dokument',
            description: 'Dokument niestandardowy',
            icon: 'other'
        }
    ];

    return (
        <>
            <S.ModalOverlay>
                <S.ModalContainer>
                    <S.ModalHeader>
                        <S.HeaderContent>
                            <S.HeaderIcon>
                                <S.MoneyIcon />
                            </S.HeaderIcon>
                            <S.HeaderText>
                                <S.ModalTitle>Płatność i dokumenty</S.ModalTitle>
                                <S.ModalSubtitle>Finalizacja transakcji i wystawienie dokumentów</S.ModalSubtitle>
                            </S.HeaderText>
                        </S.HeaderContent>
                        <S.CloseButton onClick={onClose}>
                            <FaTimes />
                        </S.CloseButton>
                    </S.ModalHeader>

                    <S.ModalBody>
                        <S.AmountSection>
                            <S.AmountCard $modified={pendingInvoiceItems !== null}>
                                <S.AmountIcon>
                                    <S.CalculatorIcon />
                                </S.AmountIcon>
                                <S.AmountDetails>
                                    <S.AmountLabel>Kwota do zapłaty</S.AmountLabel>
                                    <S.AmountValue>{currentTotalAmount.toFixed(2)} zł</S.AmountValue>
                                    {pendingInvoiceItems !== null && (
                                        <S.ModifiedHint>
                                            (zmodyfikowano nazwy pozycji faktury)
                                        </S.ModifiedHint>
                                    )}
                                </S.AmountDetails>
                            </S.AmountCard>
                        </S.AmountSection>

                        <S.PaymentSection>
                            <S.SectionTitle>
                                <S.MoneyIcon />
                                Metoda płatności
                            </S.SectionTitle>
                            <S.OptionsGrid>
                                {paymentOptions.map((option) => (
                                    <S.PaymentOption
                                        key={option.id}
                                        $selected={paymentMethod === option.id}
                                        onClick={() => setPaymentMethod(option.id as any)}
                                    >
                                        <S.OptionIcon>
                                            {option.icon === 'money' && <S.MoneyIcon />}
                                            {option.icon === 'card' && <S.CreditCardIcon />}
                                            {option.icon === 'transfer' && <S.BankIcon />}
                                        </S.OptionIcon>
                                        <S.OptionContent>
                                            <S.OptionTitle>{option.title}</S.OptionTitle>
                                            <S.OptionDescription>{option.description}</S.OptionDescription>
                                        </S.OptionContent>
                                        <S.SelectionIndicator $selected={paymentMethod === option.id}>
                                            <FaCheck />
                                        </S.SelectionIndicator>
                                    </S.PaymentOption>
                                ))}
                            </S.OptionsGrid>

                            {paymentMethod === 'transfer' && (
                                <S.PaymentDaysSection>
                                    <S.PaymentDaysLabel>Płatność w przeciągu:</S.PaymentDaysLabel>
                                    <S.PaymentDaysInput
                                        type="number"
                                        min="1"
                                        max="90"
                                        value={paymentDays}
                                        onChange={(e) => setPaymentDays(parseInt(e.target.value) || 1)}
                                    />
                                    <S.PaymentDaysUnit>dni</S.PaymentDaysUnit>
                                </S.PaymentDaysSection>
                            )}
                        </S.PaymentSection>

                        <S.DocumentSection>
                            <S.SectionTitle>
                                <S.FileInvoiceIcon />
                                Dokument sprzedaży
                            </S.SectionTitle>
                            <S.OptionsGrid>
                                {documentOptions.map((option) => (
                                    <S.DocumentOption
                                        key={option.id}
                                        $selected={documentType === option.id}
                                        onClick={() => setDocumentType(option.id as any)}
                                    >
                                        <S.OptionIcon>
                                            {option.icon === 'invoice' && <S.FileInvoiceIcon />}
                                            {option.icon === 'receipt' && <S.ReceiptIcon />}
                                            {option.icon === 'other' && <S.FileAltIcon />}
                                        </S.OptionIcon>
                                        <S.OptionContent>
                                            <S.OptionTitle>{option.title}</S.OptionTitle>
                                            <S.OptionDescription>{option.description}</S.OptionDescription>
                                        </S.OptionContent>
                                        <S.SelectionIndicator $selected={documentType === option.id}>
                                            <FaCheck />
                                        </S.SelectionIndicator>
                                    </S.DocumentOption>
                                ))}
                            </S.OptionsGrid>
                        </S.DocumentSection>

                        {documentType === 'invoice' && (
                            <S.InvoiceOptionsSection>
                                <S.InvoiceOptionsTitle>Opcje faktury</S.InvoiceOptionsTitle>
                                {pendingInvoiceItems ? (
                                    <S.CustomItemsSummary>
                                        <S.SummaryInfo>
                                            <S.SummaryIcon>
                                                <S.ListAltIcon />
                                            </S.SummaryIcon>
                                            <S.SummaryText>
                                                <S.SummaryTitle>Pozycje faktury zostały dostosowane</S.SummaryTitle>
                                                <S.SummaryDetails>
                                                    {pendingInvoiceItems.length} {
                                                    pendingInvoiceItems.length === 1 ? 'pozycja' :
                                                        pendingInvoiceItems.length < 5 ? 'pozycje' : 'pozycji'
                                                } • Suma: {currentTotalAmount.toFixed(2)} zł
                                                </S.SummaryDetails>
                                            </S.SummaryText>
                                        </S.SummaryInfo>
                                        <S.EditInvoiceButton onClick={handleEditInvoiceItems}>
                                            <S.EditIcon />
                                            Edytuj ponownie
                                        </S.EditInvoiceButton>
                                    </S.CustomItemsSummary>
                                ) : (
                                    <S.EditInvoiceItemsButton onClick={handleEditInvoiceItems}>
                                        <S.ListAltIcon />
                                        Dostosuj pozycje faktury
                                    </S.EditInvoiceItemsButton>
                                )}
                            </S.InvoiceOptionsSection>
                        )}
                    </S.ModalBody>

                    <S.ModalFooter>
                        <S.SecondaryButton onClick={onClose}>
                            <FaTimes />
                            Anuluj
                        </S.SecondaryButton>
                        <S.PrimaryButton onClick={handleConfirm}>
                            <FaCheck />
                            {documentType === 'invoice' ? 'Wystaw fakturę' : 'Zatwierdź i wydaj pojazd'}
                        </S.PrimaryButton>
                    </S.ModalFooter>
                </S.ModalContainer>
            </S.ModalOverlay>

            <InvoiceItemsModal
                isOpen={showInvoiceItemsModal}
                onClose={handleCloseInvoiceModal}
                onSave={handleInvoiceItemsSave}
                services={pendingInvoiceItems || services}
                protocolId={protocolId}
            />

            <InvoiceSignatureConfirmationModal
                isOpen={showInvoiceSignatureModal}
                onClose={handleCloseInvoiceSignatureModal}
                onConfirm={handleInvoiceSignatureConfirm}
                invoiceId={protocolId} // Używamy protocolId jako invoiceId
                customerName="Klient" // Możesz przekazać rzeczywiste dane klienta
                customerEmail="klient@example.com" // Możesz przekazać rzeczywisty email klienta
            />
        </>
    );
};

export default PaymentModal;