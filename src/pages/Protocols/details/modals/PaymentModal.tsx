import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaMoneyBill, FaCreditCard, FaFileInvoice, FaReceipt, FaFileAlt, FaCheck, FaEdit, FaListAlt, FaTimes, FaCalculator } from 'react-icons/fa';
import { useToast } from "../../../../components/common/Toast/Toast";
import { SelectedService } from "../../../../types";
import InvoiceItemsModal from "./InvoiceItemsModal";

// Professional Brand Theme
const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2',
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    },
    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }
};

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
    }, [isOpen, services]);

    if (!isOpen) return null;

    // Aktualna kwota do zapłaty
    const currentTotalAmount = modifiedTotalAmount !== null ? modifiedTotalAmount : initialTotalAmount;

    const handleEditInvoiceItems = () => {
        setShowInvoiceItemsModal(true);
    };

    const handleInvoiceItemsSave = (items: SelectedService[]) => {
        setCustomInvoiceItems(items);
        const newTotal = items.reduce((sum, item) => sum + item.finalPrice, 0);
        setModifiedTotalAmount(newTotal);
        setShowInvoiceItemsModal(false);
        onServicesChange(items);

        if (Math.abs(newTotal - initialTotalAmount) > 0.01) {
            showToast('info', `Suma po modyfikacji: ${newTotal.toFixed(2)} zł (oryginalna: ${initialTotalAmount.toFixed(2)} zł)`, 5000);
        }
    };

    const handleConfirm = () => {
        const paymentData = {
            paymentMethod,
            documentType,
            invoiceItems: documentType === 'invoice' && customInvoiceItems ? customInvoiceItems : undefined
        };

        if (documentType === 'invoice' && customInvoiceItems) {
            const originalTotal = initialTotalAmount;
            const customTotal = customInvoiceItems.reduce((sum, item) => sum + item.finalPrice, 0);

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

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <HeaderIcon>
                            <FaMoneyBill />
                        </HeaderIcon>
                        <HeaderText>
                            <ModalTitle>Płatność i dokumenty</ModalTitle>
                            <ModalSubtitle>Finalizacja transakcji i wystawienie dokumentów</ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <AmountSection>
                        <AmountCard $modified={modifiedTotalAmount !== null}>
                            <AmountIcon>
                                <FaCalculator />
                            </AmountIcon>
                            <AmountDetails>
                                <AmountLabel>Kwota do zapłaty</AmountLabel>
                                <AmountValue>{currentTotalAmount.toFixed(2)} zł</AmountValue>
                                {modifiedTotalAmount !== null && (
                                    <ModifiedHint>
                                        (zmodyfikowano z {initialTotalAmount.toFixed(2)} zł)
                                    </ModifiedHint>
                                )}
                            </AmountDetails>
                        </AmountCard>
                    </AmountSection>

                    <PaymentSection>
                        <SectionTitle>
                            <FaMoneyBill />
                            Metoda płatności
                        </SectionTitle>
                        <OptionsGrid>
                            <PaymentOption
                                $selected={paymentMethod === 'cash'}
                                onClick={() => setPaymentMethod('cash')}
                            >
                                <OptionIcon>
                                    <FaMoneyBill />
                                </OptionIcon>
                                <OptionContent>
                                    <OptionTitle>Gotówka</OptionTitle>
                                    <OptionDescription>Płatność bezpośrednia</OptionDescription>
                                </OptionContent>
                                <SelectionIndicator $selected={paymentMethod === 'cash'}>
                                    <FaCheck />
                                </SelectionIndicator>
                            </PaymentOption>

                            <PaymentOption
                                $selected={paymentMethod === 'card'}
                                onClick={() => setPaymentMethod('card')}
                            >
                                <OptionIcon>
                                    <FaCreditCard />
                                </OptionIcon>
                                <OptionContent>
                                    <OptionTitle>Karta płatnicza</OptionTitle>
                                    <OptionDescription>Płatność elektroniczna</OptionDescription>
                                </OptionContent>
                                <SelectionIndicator $selected={paymentMethod === 'card'}>
                                    <FaCheck />
                                </SelectionIndicator>
                            </PaymentOption>
                        </OptionsGrid>
                    </PaymentSection>

                    <DocumentSection>
                        <SectionTitle>
                            <FaFileInvoice />
                            Dokument sprzedaży
                        </SectionTitle>
                        <OptionsGrid>
                            <DocumentOption
                                $selected={documentType === 'invoice'}
                                onClick={() => setDocumentType('invoice')}
                            >
                                <OptionIcon>
                                    <FaFileInvoice />
                                </OptionIcon>
                                <OptionContent>
                                    <OptionTitle>Faktura VAT</OptionTitle>
                                    <OptionDescription>Dokument księgowy</OptionDescription>
                                </OptionContent>
                                <SelectionIndicator $selected={documentType === 'invoice'}>
                                    <FaCheck />
                                </SelectionIndicator>
                            </DocumentOption>

                            <DocumentOption
                                $selected={documentType === 'receipt'}
                                onClick={() => setDocumentType('receipt')}
                            >
                                <OptionIcon>
                                    <FaReceipt />
                                </OptionIcon>
                                <OptionContent>
                                    <OptionTitle>Paragon fiskalny</OptionTitle>
                                    <OptionDescription>Dokument kasowy</OptionDescription>
                                </OptionContent>
                                <SelectionIndicator $selected={documentType === 'receipt'}>
                                    <FaCheck />
                                </SelectionIndicator>
                            </DocumentOption>

                            <DocumentOption
                                $selected={documentType === 'other'}
                                onClick={() => setDocumentType('other')}
                            >
                                <OptionIcon>
                                    <FaFileAlt />
                                </OptionIcon>
                                <OptionContent>
                                    <OptionTitle>Inny dokument</OptionTitle>
                                    <OptionDescription>Dokument niestandardowy</OptionDescription>
                                </OptionContent>
                                <SelectionIndicator $selected={documentType === 'other'}>
                                    <FaCheck />
                                </SelectionIndicator>
                            </DocumentOption>
                        </OptionsGrid>
                    </DocumentSection>

                    {documentType === 'invoice' && (
                        <InvoiceOptionsSection>
                            <InvoiceOptionsTitle>Opcje faktury</InvoiceOptionsTitle>
                            {customInvoiceItems ? (
                                <CustomItemsSummary>
                                    <SummaryInfo>
                                        <SummaryIcon>
                                            <FaListAlt />
                                        </SummaryIcon>
                                        <SummaryText>
                                            <SummaryTitle>Pozycje faktury zostały zmodyfikowane</SummaryTitle>
                                            <SummaryDetails>
                                                {customInvoiceItems.length} {
                                                customInvoiceItems.length === 1 ? 'pozycja' :
                                                    customInvoiceItems.length < 5 ? 'pozycje' : 'pozycji'
                                            } • Suma: {modifiedTotalAmount?.toFixed(2)} zł
                                            </SummaryDetails>
                                        </SummaryText>
                                    </SummaryInfo>
                                    <EditInvoiceButton onClick={handleEditInvoiceItems}>
                                        <FaEdit />
                                        Edytuj ponownie
                                    </EditInvoiceButton>
                                </CustomItemsSummary>
                            ) : (
                                <EditInvoiceItemsButton onClick={handleEditInvoiceItems}>
                                    <FaListAlt />
                                    Edytuj pozycje faktury
                                </EditInvoiceItemsButton>
                            )}
                        </InvoiceOptionsSection>
                    )}
                </ModalBody>

                <ModalFooter>
                    <SecondaryButton onClick={onClose}>
                        <FaTimes />
                        Anuluj
                    </SecondaryButton>
                    <PrimaryButton onClick={handleConfirm}>
                        <FaCheck />
                        Zatwierdź i wydaj pojazd
                    </PrimaryButton>
                </ModalFooter>
            </ModalContainer>

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

// Styled Components - Professional Automotive CRM Design
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    box-shadow: ${brandTheme.shadow.xl};
    width: 700px;
    max-width: 95%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease;

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 2px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const HeaderIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${brandTheme.status.successLight};
    color: ${brandTheme.status.success};
    border-radius: ${brandTheme.radius.lg};
    font-size: 18px;
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.025em;
`;

const ModalSubtitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${brandTheme.surfaceHover};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    color: ${brandTheme.text.muted};
   cursor: pointer;
   transition: all ${brandTheme.transitions.normal};

   &:hover {
       background: ${brandTheme.status.errorLight};
       border-color: ${brandTheme.status.error};
       color: ${brandTheme.status.error};
       transform: translateY(-1px);
   }
`;

const ModalBody = styled.div`
   padding: ${brandTheme.spacing.xl};
   overflow-y: auto;
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xl};

   /* Custom scrollbar */
   &::-webkit-scrollbar {
       width: 6px;
   }

   &::-webkit-scrollbar-track {
       background: ${brandTheme.surfaceAlt};
   }

   &::-webkit-scrollbar-thumb {
       background: ${brandTheme.border};
       border-radius: 3px;
   }
`;

const AmountSection = styled.div`
   display: flex;
   justify-content: center;
`;

const AmountCard = styled.div<{ $modified: boolean }>`
   background: ${props => props.$modified ? brandTheme.status.infoLight : brandTheme.surfaceAlt};
   border: 2px solid ${props => props.$modified ? brandTheme.status.info : brandTheme.border};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.lg};
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.md};
   min-width: 280px;
   position: relative;
`;

const AmountIcon = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 48px;
   height: 48px;
   background: ${brandTheme.status.success};
   color: white;
   border-radius: ${brandTheme.radius.lg};
   font-size: 20px;
`;

const AmountDetails = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xs};
`;

const AmountLabel = styled.div`
   font-size: 14px;
   font-weight: 600;
   color: ${brandTheme.text.secondary};
   text-transform: uppercase;
   letter-spacing: 0.5px;
`;

const AmountValue = styled.div`
   font-size: 24px;
   font-weight: 700;
   color: ${brandTheme.status.success};
   font-variant-numeric: tabular-nums;
`;

const ModifiedHint = styled.div`
   font-size: 12px;
   color: ${brandTheme.status.info};
   font-style: italic;
   font-weight: 500;
`;

const PaymentSection = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.lg};
`;

const DocumentSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
    min-height: 200px; /* Dodane: stała wysokość sekcji */
`;

const SectionTitle = styled.h4`
   margin: 0;
   font-size: 16px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};

   svg {
       color: ${brandTheme.primary};
       font-size: 16px;
   }
`;

const OptionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* Zmieniamy na stałe 3 kolumny */
    gap: ${brandTheme.spacing.md};
    min-height: 120px; /* Dodane: stała wysokość siatki */
`;

const PaymentOption = styled.div<{ $selected: boolean }>`
    background: ${props => props.$selected ? brandTheme.primaryGhost : brandTheme.surface};
    border: 2px solid ${props => props.$selected ? brandTheme.primary : brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    cursor: pointer;
    transition: all ${brandTheme.transitions.spring};
    position: relative;
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
    min-height: 120px; /* Dodane: stała wysokość kafelka */
    width: 100%; /* Dodane: stała szerokość */

    &:hover {
        border-color: ${brandTheme.primary};
        transform: translateY(-2px);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const DocumentOption = styled(PaymentOption)`
    min-height: 120px; /* Dodane: stała wysokość kafelka */
    width: 100%; /* Dodane: stała szerokość */
`;

const OptionIcon = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 48px;
   height: 48px;
   background: ${brandTheme.surfaceAlt};
   color: ${brandTheme.primary};
   border-radius: ${brandTheme.radius.lg};
   font-size: 20px;
   margin-bottom: ${brandTheme.spacing.sm};
`;

const OptionContent = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xs};
`;

const OptionTitle = styled.div`
   font-size: 16px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
`;

const OptionDescription = styled.div`
   font-size: 13px;
   color: ${brandTheme.text.muted};
   line-height: 1.4;
`;

const SelectionIndicator = styled.div<{ $selected: boolean }>`
   position: absolute;
   top: ${brandTheme.spacing.sm};
   right: ${brandTheme.spacing.sm};
   display: flex;
   align-items: center;
   justify-content: center;
   width: 24px;
   height: 24px;
   background: ${props => props.$selected ? brandTheme.status.success : brandTheme.border};
   color: white;
   border-radius: 50%;
   font-size: 12px;
   transition: all ${brandTheme.transitions.normal};
   opacity: ${props => props.$selected ? 1 : 0.3};
`;

const InvoiceOptionsSection = styled.div<{ $isVisible: boolean }>`
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
    margin-top: ${brandTheme.spacing.md};
    opacity: ${props => props.$isVisible ? 1 : 0};
    max-height: ${props => props.$isVisible ? '200px' : '0'};
    overflow: hidden;
    transition: all ${brandTheme.transitions.normal};
    transform: ${props => props.$isVisible ? 'translateY(0)' : 'translateY(-10px)'};
`;

const InvoiceOptionsTitle = styled.h5`
   margin: 0;
   font-size: 14px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
   text-transform: uppercase;
   letter-spacing: 0.5px;
`;

const EditInvoiceItemsButton = styled.button`
   display: flex;
   align-items: center;
   justify-content: center;
   gap: ${brandTheme.spacing.sm};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   background: ${brandTheme.primaryGhost};
   color: ${brandTheme.primary};
   border: 2px solid ${brandTheme.primary}40;
   border-radius: ${brandTheme.radius.md};
   font-size: 14px;
   font-weight: 600;
   cursor: pointer;
   transition: all ${brandTheme.transitions.normal};
   width: 100%;

   &:hover {
       background: ${brandTheme.primary}20;
       border-color: ${brandTheme.primary};
       transform: translateY(-1px);
       box-shadow: ${brandTheme.shadow.sm};
   }
`;

const CustomItemsSummary = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
   background: ${brandTheme.status.successLight};
   border: 1px solid ${brandTheme.status.success};
   border-radius: ${brandTheme.radius.md};
   padding: ${brandTheme.spacing.md};
`;

const SummaryInfo = styled.div`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
`;

const SummaryIcon = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 32px;
   height: 32px;
   background: ${brandTheme.status.success};
   color: white;
   border-radius: ${brandTheme.radius.sm};
   font-size: 14px;
`;

const SummaryText = styled.div`
   display: flex;
   flex-direction: column;
   gap: 2px;
`;

const SummaryTitle = styled.div`
   font-size: 14px;
   font-weight: 600;
   color: ${brandTheme.status.success};
`;

const SummaryDetails = styled.div`
   font-size: 12px;
   color: ${brandTheme.text.secondary};
   font-weight: 500;
`;

const EditInvoiceButton = styled.button`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.xs};
   padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
   background: none;
   color: ${brandTheme.primary};
   border: 1px solid ${brandTheme.primary};
   border-radius: ${brandTheme.radius.sm};
   font-size: 13px;
   font-weight: 500;
   cursor: pointer;
   transition: all ${brandTheme.transitions.normal};

   &:hover {
       background: ${brandTheme.primaryGhost};
       transform: translateY(-1px);
   }
`;

const ModalFooter = styled.div`
   display: flex;
   justify-content: flex-end;
   gap: ${brandTheme.spacing.md};
   padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
   border-top: 2px solid ${brandTheme.border};
   background: ${brandTheme.surfaceAlt};
`;

const SecondaryButton = styled.button`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   background: ${brandTheme.surface};
   color: ${brandTheme.text.secondary};
   border: 2px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.md};
   font-weight: 600;
   font-size: 14px;
   cursor: pointer;
   transition: all ${brandTheme.transitions.spring};
   min-height: 44px;
   min-width: 120px;

   &:hover {
       background: ${brandTheme.surfaceHover};
       color: ${brandTheme.text.primary};
       border-color: ${brandTheme.borderHover};
       box-shadow: ${brandTheme.shadow.sm};
   }
`;

const PrimaryButton = styled.button`
   display: flex;
   align-items: center;
   justify-content: center;
   gap: ${brandTheme.spacing.sm};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   background: linear-gradient(135deg, ${brandTheme.status.success} 0%, #27ae60 100%);
   color: white;
   border: 2px solid transparent;
   border-radius: ${brandTheme.radius.md};
   font-weight: 600;
   font-size: 14px;
   cursor: pointer;
   transition: all ${brandTheme.transitions.spring};
   box-shadow: ${brandTheme.shadow.sm};
   min-height: 44px;
   min-width: 180px;

   &:hover:not(:disabled) {
       background: linear-gradient(135deg, #27ae60 0%, ${brandTheme.status.success} 100%);
       transform: translateY(-1px);
       box-shadow: ${brandTheme.shadow.md};
   }

   &:disabled {
       opacity: 0.6;
       cursor: not-allowed;
       transform: none;
       background: ${brandTheme.text.disabled};
   }

   &:active:not(:disabled) {
       transform: translateY(0);
   }
`;

export default PaymentModal;