// src/pages/Finances/components/PaymentRecordModal.tsx
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaExclamationTriangle, FaFileInvoiceDollar, FaSave, FaTimes} from 'react-icons/fa';
import {brandTheme} from '../styles/theme';
import {FixedCost, PaymentStatus, PaymentStatusLabels, RecordPaymentRequest} from '../../../api/fixedCostsApi';

interface PaymentRecordModalProps {
    isOpen: boolean;
    fixedCost?: FixedCost;
    onSave: (data: RecordPaymentRequest) => Promise<void>;
    onClose: () => void;
}

const PaymentRecordModal: React.FC<PaymentRecordModalProps> = ({
                                                                   isOpen,
                                                                   fixedCost,
                                                                   onSave,
                                                                   onClose
                                                               }) => {
    const [formData, setFormData] = useState<RecordPaymentRequest>({
        paymentDate: new Date().toISOString().split('T')[0],
        amount: 0,
        plannedAmount: 0,
        status: 'PAID' as keyof PaymentStatus,
        paymentMethod: 'BANK_TRANSFER',
        documentId: '',
        notes: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // Initialize form data when modal opens or fixed cost changes
    useEffect(() => {
        if (isOpen && fixedCost) {
            setFormData({
                paymentDate: new Date().toISOString().split('T')[0],
                amount: fixedCost.calculatedMonthlyAmount,
                plannedAmount: fixedCost.calculatedMonthlyAmount,
                status: 'PAID' as keyof PaymentStatus,
                paymentMethod: 'BANK_TRANSFER',
                documentId: '',
                notes: ''
            });
            setErrors({});
        }
    }, [isOpen, fixedCost]);

    if (!isOpen || !fixedCost) return null;

    const handleChange = (field: keyof RecordPaymentRequest, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.paymentDate) {
            newErrors.paymentDate = 'Data płatności jest wymagana';
        }

        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = 'Kwota płatności musi być większa od 0';
        }

        if (!formData.plannedAmount || formData.plannedAmount <= 0) {
            newErrors.plannedAmount = 'Planowana kwota musi być większa od 0';
        }

        if (!formData.status) {
            newErrors.status = 'Status płatności jest wymagany';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            // Clean up optional fields
            const cleanFormData = { ...formData };
            if (!cleanFormData.documentId?.trim()) {
                cleanFormData.documentId = undefined;
            }
            if (!cleanFormData.notes?.trim()) {
                cleanFormData.notes = undefined;
            }
            if (!cleanFormData.paymentMethod?.trim()) {
                cleanFormData.paymentMethod = undefined;
            }

            await onSave(cleanFormData);
            onClose();
        } catch (error) {
            console.error('Error recording payment:', error);
            // Error is handled by parent component
        } finally {
            setLoading(false);
        }
    };

    // Calculate variance
    const variance = formData.amount - formData.plannedAmount;
    const hasVariance = Math.abs(variance) > 0.01;

    // Format amount for display
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>
                        <TitleIcon>
                            <FaFileInvoiceDollar />
                        </TitleIcon>
                        <TitleText>
                            <TitleMain>Zarejestruj płatność</TitleMain>
                            <TitleSub>{fixedCost.name}</TitleSub>
                        </TitleText>
                    </ModalTitle>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalContent>
                    {/* Fixed Cost Info */}
                    <CostInfoSection>
                        <CostInfoTitle>Informacje o koszcie stałym</CostInfoTitle>
                        <CostInfoGrid>
                            <CostInfoItem>
                                <CostInfoLabel>Nazwa:</CostInfoLabel>
                                <CostInfoValue>{fixedCost.name}</CostInfoValue>
                            </CostInfoItem>
                            <CostInfoItem>
                                <CostInfoLabel>Kategoria:</CostInfoLabel>
                                <CostInfoValue>{fixedCost.categoryDisplay}</CostInfoValue>
                            </CostInfoItem>
                            <CostInfoItem>
                                <CostInfoLabel>Miesięczna kwota:</CostInfoLabel>
                                <CostInfoValue>{formatAmount(fixedCost.calculatedMonthlyAmount)}</CostInfoValue>
                            </CostInfoItem>
                            <CostInfoItem>
                                <CostInfoLabel>Częstotliwość:</CostInfoLabel>
                                <CostInfoValue>{fixedCost.frequencyDisplay}</CostInfoValue>
                            </CostInfoItem>
                        </CostInfoGrid>
                        {fixedCost.supplierInfo && (
                            <SupplierInfo>
                                <SupplierLabel>Dostawca:</SupplierLabel>
                                <SupplierName>{fixedCost.supplierInfo.name}</SupplierName>
                                {fixedCost.supplierInfo.taxId && (
                                    <SupplierTaxId>NIP: {fixedCost.supplierInfo.taxId}</SupplierTaxId>
                                )}
                            </SupplierInfo>
                        )}
                    </CostInfoSection>

                    <Form onSubmit={handleSubmit}>
                        {/* Payment Details */}
                        <FormSection>
                            <SectionTitle>Szczegóły płatności</SectionTitle>
                            <FormGrid>
                                <FormGroup>
                                    <Label htmlFor="paymentDate">
                                        Data płatności *
                                    </Label>
                                    <Input
                                        id="paymentDate"
                                        type="date"
                                        value={formData.paymentDate}
                                        onChange={(e) => handleChange('paymentDate', e.target.value)}
                                        $hasError={!!errors.paymentDate}
                                    />
                                    {errors.paymentDate && <ErrorText>{errors.paymentDate}</ErrorText>}
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="status">
                                        Status płatności *
                                    </Label>
                                    <Select
                                        id="status"
                                        value={formData.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                        $hasError={!!errors.status}
                                    >
                                        {Object.entries(PaymentStatusLabels).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </Select>
                                    {errors.status && <ErrorText>{errors.status}</ErrorText>}
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="paymentMethod">
                                        Metoda płatności
                                    </Label>
                                    <Select
                                        id="paymentMethod"
                                        value={formData.paymentMethod || ''}
                                        onChange={(e) => handleChange('paymentMethod', e.target.value)}
                                    >
                                        <option value="">Wybierz metodę płatności</option>
                                        <option value="CASH">Gotówka</option>
                                        <option value="BANK_TRANSFER">Przelew bankowy</option>
                                        <option value="CARD">Karta</option>
                                        <option value="MOBILE_PAYMENT">Płatność mobilna</option>
                                        <option value="OTHER">Inna</option>
                                    </Select>
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="documentId">
                                        ID dokumentu
                                    </Label>
                                    <Input
                                        id="documentId"
                                        type="text"
                                        value={formData.documentId || ''}
                                        onChange={(e) => handleChange('documentId', e.target.value)}
                                        placeholder="np. numer faktury, rachunku"
                                    />
                                </FormGroup>
                            </FormGrid>
                        </FormSection>

                        {/* Amount Details */}
                        <FormSection>
                            <SectionTitle>Kwoty</SectionTitle>
                            <FormGrid>
                                <FormGroup>
                                    <Label htmlFor="plannedAmount">
                                        Planowana kwota *
                                    </Label>
                                    <Input
                                        id="plannedAmount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={formData.plannedAmount || ''}
                                        onChange={(e) => handleChange('plannedAmount', parseFloat(e.target.value) || 0)}
                                        $hasError={!!errors.plannedAmount}
                                    />
                                    {errors.plannedAmount && <ErrorText>{errors.plannedAmount}</ErrorText>}
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="amount">
                                        Rzeczywista kwota *
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={formData.amount || ''}
                                        onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                                        $hasError={!!errors.amount}
                                    />
                                    {errors.amount && <ErrorText>{errors.amount}</ErrorText>}
                                </FormGroup>
                            </FormGrid>

                            {/* Variance Display */}
                            {hasVariance && (
                                <VarianceSection $isPositive={variance > 0}>
                                    <VarianceIcon>
                                        <FaExclamationTriangle />
                                    </VarianceIcon>
                                    <VarianceText>
                                        <VarianceLabel>
                                            {variance > 0 ? 'Nadpłata:' : 'Niedopłata:'}
                                        </VarianceLabel>
                                        <VarianceAmount>
                                            {formatAmount(Math.abs(variance))}
                                        </VarianceAmount>
                                    </VarianceText>
                                </VarianceSection>
                            )}
                        </FormSection>

                        {/* Notes */}
                        <FormSection>
                            <SectionTitle>Uwagi</SectionTitle>
                            <FormGroup>
                                <Label htmlFor="notes">
                                    Dodatkowe uwagi
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes || ''}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    placeholder="Dodatkowe informacje o płatności (opcjonalnie)"
                                    rows={3}
                                />
                            </FormGroup>
                        </FormSection>

                        {/* Form Actions */}
                        <FormActions>
                            <CancelButton type="button" onClick={onClose}>
                                Anuluj
                            </CancelButton>
                            <SaveButton type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <LoadingSpinner />
                                        Zapisywanie...
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        Zarejestruj płatność
                                    </>
                                )}
                            </SaveButton>
                        </FormActions>
                    </Form>
                </ModalContent>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
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
    z-index: ${brandTheme.zIndex.modal};
    padding: ${brandTheme.spacing.lg};
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    background-color: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    box-shadow: ${brandTheme.shadow.xl};
    width: 95vw;
    max-width: 700px;
    max-height: 95vh;
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

    @media (max-width: ${brandTheme.breakpoints.md}) {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
    }
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
    flex-shrink: 0;
`;

const ModalTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const TitleIcon = styled.div`
    width: 40px;
    height: 40px;
    background: ${brandTheme.status.successLight};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.status.success};
    font-size: 18px;
`;

const TitleText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const TitleMain = styled.h2`
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.025em;
`;

const TitleSub = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: ${brandTheme.surfaceHover};
    color: ${brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};
    font-size: 18px;

    &:hover {
        background: ${brandTheme.status.errorLight};
        color: ${brandTheme.status.error};
        transform: scale(1.05);
    }

    &:active {
        transform: scale(0.95);
    }
`;

const ModalContent = styled.div`
    overflow-y: auto;
    flex: 1;
    
    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: ${brandTheme.surfaceAlt};
    }
    
    &::-webkit-scrollbar-thumb {
        background: ${brandTheme.border};
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: ${brandTheme.borderHover};
    }
`;

const CostInfoSection = styled.div`
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    background: ${brandTheme.surfaceAlt};
    border-bottom: 1px solid ${brandTheme.border};
`;

const CostInfoTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.md} 0;
`;

const CostInfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.md};
`;

const CostInfoItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const CostInfoLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const CostInfoValue = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const SupplierInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.border};
`;

const SupplierLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 600;
`;

const SupplierName = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const SupplierTaxId = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.tertiary};
`;

const Form = styled.form`
    padding: ${brandTheme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xl};
`;

const FormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};

    &::before {
        content: '';
        width: 4px;
        height: 18px;
        background: ${brandTheme.status.success};
        border-radius: 2px;
    }
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${brandTheme.spacing.md};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
`;

const Input = styled.input<{ $hasError?: boolean }>`
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasError ? brandTheme.status.error : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? brandTheme.status.error : brandTheme.status.success};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? brandTheme.status.errorLight : brandTheme.status.successLight};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }

    &:disabled {
        background: ${brandTheme.surfaceAlt};
        color: ${brandTheme.text.disabled};
        cursor: not-allowed;
    }
`;

const Select = styled.select<{ $hasError?: boolean }>`
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasError ? brandTheme.status.error : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? brandTheme.status.error : brandTheme.status.success};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? brandTheme.status.errorLight : brandTheme.status.successLight};
    }

    &:disabled {
        background: ${brandTheme.surfaceAlt};
        color: ${brandTheme.text.disabled};
        cursor: not-allowed;
    }
`;

const Textarea = styled.textarea`
    padding: ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.status.success};
        box-shadow: 0 0 0 3px ${brandTheme.status.successLight};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const ErrorText = styled.div`
    font-size: 12px;
    color: ${brandTheme.status.error};
    font-weight: 500;
    margin-top: ${brandTheme.spacing.xs};
`;

const VarianceSection = styled.div<{ $isPositive: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md};
    background: ${props => props.$isPositive ? brandTheme.status.warningLight : brandTheme.status.errorLight};
    border: 1px solid ${props => props.$isPositive ? brandTheme.status.warning : brandTheme.status.error};
    border-radius: ${brandTheme.radius.md};
    margin-top: ${brandTheme.spacing.md};
`;

const VarianceIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: inherit;
    font-size: 14px;
`;

const VarianceText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const VarianceLabel = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: inherit;
`;

const VarianceAmount = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: inherit;
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.md};
    padding-top: ${brandTheme.spacing.lg};
    border-top: 1px solid ${brandTheme.border};

    @media (max-width: 576px) {
        flex-direction: column-reverse;
    }
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 44px;
    min-width: 120px;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    &:not(:disabled):hover {
        transform: translateY(-1px);
    }

    &:not(:disabled):active {
        transform: translateY(0);
    }
`;

const CancelButton = styled(BaseButton)`
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border: 2px solid ${brandTheme.border};

    &:hover:not(:disabled) {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.text.primary};
        border-color: ${brandTheme.borderHover};
        box-shadow: ${brandTheme.shadow.sm};
    }
`;

const SaveButton = styled(BaseButton)`
    background: linear-gradient(135deg, ${brandTheme.status.success} 0%, #27ae60 100%);
    color: white;
    border: 2px solid transparent;
    box-shadow: ${brandTheme.shadow.sm};

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #27ae60 0%, ${brandTheme.status.success} 100%);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export default PaymentRecordModal;