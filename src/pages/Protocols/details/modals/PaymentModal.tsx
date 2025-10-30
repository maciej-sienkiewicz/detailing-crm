import React, {useEffect, useState} from 'react';
import {FaCheck, FaTimes} from 'react-icons/fa';
import {useToast} from "../../../../components/common/Toast/Toast";
// Importuje SelectedService z nowego modelu
import {SelectedService} from "../../../../types";
import InvoiceItemsModal from "./InvoiceItemsModal";
import * as S from './PaymentModalStyles';

// Pomocnicza funkcja do pobierania kwoty brutto
// Używamy opcjonalnego łańcuchowania, na wypadek gdyby obiekt był null/undefined,
// ale zakładamy, że w poprawnym SelectedService pole to jest zawsze dostępne
const getFinalAmount = (service: SelectedService): number => {
    return service.finalPrice?.priceBrutto ?? 0;
};

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (paymentData: {
        paymentMethod: 'cash' | 'card' | 'transfer';
        documentType: 'invoice' | 'receipt' | 'other';
        paymentDays?: number;
        overridenItems?: SelectedService[];
    }) => void;
    // initialTotalAmount nie jest już bezpośrednio używane w sumowaniu, ale jako punkt odniesienia
    totalAmount: number;
    services: SelectedService[];
    onServicesChange: (services: SelectedService[]) => void;
    protocolId: string;
    customerName?: string;
    customerEmail?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       onConfirm,
                                                       totalAmount: initialTotalAmount, // Nazwa initialTotalAmount jest myląca, lepiej przekazywać kwotę już wyliczoną na podstawie finalPrice
                                                       services,
                                                       onServicesChange,
                                                       protocolId,
                                                       customerName = 'Klient',
                                                       customerEmail
                                                   }) => {
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
    const [documentType, setDocumentType] = useState<'invoice' | 'receipt' | 'other'>('receipt');
    const [paymentDays, setPaymentDays] = useState<number>(7);
    const [showInvoiceItemsModal, setShowInvoiceItemsModal] = useState(false);
    const [pendingInvoiceItems, setPendingInvoiceItems] = useState<SelectedService[] | null>(null);

    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen && !showInvoiceItemsModal) {
            if (!pendingInvoiceItems) {
                setPaymentMethod('cash');
                setDocumentType('receipt');
                setPaymentDays(7);
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setPendingInvoiceItems(null);
            setPaymentMethod('cash');
            setDocumentType('receipt');
            setPaymentDays(7);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const areItemsModified = (originalItems: SelectedService[], modifiedItems: SelectedService[] | null): boolean => {
        if (!modifiedItems) return false;

        if (originalItems.length !== modifiedItems.length) return true;

        for (let i = 0; i < originalItems.length; i++) {
            const original = originalItems[i];
            const modified = modifiedItems.find(item => item.id === original.id);

            // Dodano sprawdzenie, czy cena brutto finalna się różni, co jest bardziej kompleksowe
            if (
                !modified ||
                modified.name !== original.name ||
                getFinalAmount(modified) !== getFinalAmount(original)
            ) {
                return true;
            }
        }

        const hasMergedItems = modifiedItems.some(item => item.id.startsWith('merged_'));
        return hasMergedItems;
    };

    // POBIERANIE AKTUALNEJ SUMY Z NOWEGO MODELU (priceBrutto)
    const currentServices = pendingInvoiceItems || services;
    const currentTotalAmount = currentServices.reduce((sum, item) => sum + getFinalAmount(item), 0);

    const handleEditInvoiceItems = () => {
        setShowInvoiceItemsModal(true);
    };

    const handleInvoiceItemsSave = (items: SelectedService[]) => {
        setPendingInvoiceItems(items);
        setShowInvoiceItemsModal(false);

        // POBIERANIE NOWEJ SUMY Z NOWEGO MODELU (priceBrutto)
        const newTotal = items.reduce((sum, item) => sum + getFinalAmount(item), 0);

        if (Math.abs(newTotal - initialTotalAmount) > 0.01) {
            showToast('info', `Pozycje faktury zostały zmodyfikowane. Nowa suma: ${newTotal.toFixed(2)} zł`, 3000);
        }
    };

    const handleConfirm = () => {
        const itemsWereModified = areItemsModified(services, pendingInvoiceItems);

        const paymentData = {
            paymentMethod,
            documentType,
            ...(paymentMethod === 'transfer' ? { paymentDays } : {}),
            ...(itemsWereModified && pendingInvoiceItems ? { overridenItems: pendingInvoiceItems } : {})
        };

        if (itemsWereModified && pendingInvoiceItems) {
            const originalTotal = initialTotalAmount;
            // POBIERANIE CUSTOMOWEJ SUMY Z NOWEGO MODELU (priceBrutto)
            const customTotal = pendingInvoiceItems.reduce((sum, item) => sum + getFinalAmount(item), 0);

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
            showToast('success', 'Dodano nową pozycję w archiwum faktur', 3000);
        }

        onConfirm(paymentData);
    };

    const handleCloseInvoiceModal = () => {
        setShowInvoiceItemsModal(false);
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
                            {documentType === 'invoice' ? 'Wystaw fakturę i wydaj pojazd' : 'Zatwierdź i wydaj pojazd'}
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
        </>
    );
};

export default PaymentModal;