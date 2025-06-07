// src/pages/Finances/components/FixedCostViewModal.tsx
import React from 'react';
import styled from 'styled-components';
import {
    FaTimes,
    FaEdit,
    FaTrashAlt,
    FaFileInvoiceDollar,
    FaBuilding,
    FaCalendarAlt,
    FaUser,
    FaFileContract,
    FaStickyNote,
    FaHistory
} from 'react-icons/fa';
import { brandTheme } from '../styles/theme';
import {
    FixedCost,
    FixedCostStatusColors,
    FixedCostStatusLabels
} from '../../../api/fixedCostsApi';

interface FixedCostViewModalProps {
    isOpen: boolean;
    fixedCost?: FixedCost;
    onClose: () => void;
    onEdit: (fixedCost: FixedCost) => void;
    onDelete: (id: string, name: string) => void;
    onRecordPayment: (fixedCost: FixedCost) => void;
}

const FixedCostViewModal: React.FC<FixedCostViewModalProps> = ({
                                                                   isOpen,
                                                                   fixedCost,
                                                                   onClose,
                                                                   onEdit,
                                                                   onDelete,
                                                                   onRecordPayment
                                                               }) => {
    if (!isOpen || !fixedCost) return null;

    // Helper function to format dates from backend array format
    const formatDateFromArray = (dateArray: number[] | string): string => {
        if (!dateArray) return '-';

        if (Array.isArray(dateArray) && dateArray.length >= 3) {
            // Backend returns [year, month, day] - month is 1-based in backend
            const [year, month, day] = dateArray;
            const date = new Date(year, month - 1, day); // month is 0-based in JS Date
            return date.toLocaleDateString('pl-PL');
        }

        if (typeof dateArray === 'string') {
            return new Date(dateArray).toLocaleDateString('pl-PL');
        }

        return '-';
    };

    // Helper function to format amount
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Helper function to format datetime from backend array format
    const formatDateTimeFromArray = (dateTimeArray: number[]): string => {
        if (!dateTimeArray || !Array.isArray(dateTimeArray) || dateTimeArray.length < 6) {
            return '-';
        }

        const [year, month, day, hour, minute, second] = dateTimeArray;
        const date = new Date(year, month - 1, day, hour, minute, second);
        return date.toLocaleString('pl-PL');
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>
                        <TitleIcon>
                            <FaBuilding />
                        </TitleIcon>
                        <TitleText>
                            <TitleMain>Podgląd kosztu stałego</TitleMain>
                            <TitleSub>{fixedCost.name}</TitleSub>
                        </TitleText>
                    </ModalTitle>
                    <HeaderActions>
                        <ActionButton
                            onClick={() => onEdit(fixedCost)}
                            title="Edytuj koszt stały"
                            $variant="view"
                        >
                            <FaEdit />
                        </ActionButton>
                        <ActionButton
                            onClick={() => onRecordPayment(fixedCost)}
                            title="Zarejestruj płatność"
                            $variant="view"
                        >
                            <FaFileInvoiceDollar />
                        </ActionButton>
                        <ActionButton
                            onClick={() => onDelete(fixedCost.id, fixedCost.name)}
                            title="Usuń koszt stały"
                            $variant="view"
                        >
                            <FaTrashAlt />
                        </ActionButton>
                        <CloseButton onClick={onClose}>
                            <FaTimes />
                        </CloseButton>
                    </HeaderActions>
                </ModalHeader>

                <ModalContent>
                    {/* Basic Information */}
                    <InfoSection>
                        <SectionHeader>
                            <SectionIcon>
                                <FaBuilding />
                            </SectionIcon>
                            <SectionTitle>Podstawowe informacje</SectionTitle>
                        </SectionHeader>

                        <InfoGrid>
                            <InfoItem>
                                <InfoLabel>Nazwa</InfoLabel>
                                <InfoValue>{fixedCost.name}</InfoValue>
                            </InfoItem>

                            <InfoItem>
                                <InfoLabel>Kategoria</InfoLabel>
                                <InfoValue>
                                    <CategoryBadge category={fixedCost.category}>
                                        {fixedCost.categoryDisplay}
                                    </CategoryBadge>
                                </InfoValue>
                            </InfoItem>

                            <InfoItem>
                                <InfoLabel>Kwota miesięczna</InfoLabel>
                                <InfoValue>
                                    <AmountDisplay>
                                        {formatAmount(fixedCost.calculatedMonthlyAmount)}
                                    </AmountDisplay>
                                    {fixedCost.calculatedMonthlyAmount !== fixedCost.monthlyAmount && (
                                        <OriginalAmount>
                                        (bazowa: {formatAmount(fixedCost.monthlyAmount)})
                                        </OriginalAmount>
                                        )}
                                </InfoValue>
                            </InfoItem>

                            <InfoItem>
                                <InfoLabel>Częstotliwość</InfoLabel>
                                <InfoValue>{fixedCost.frequencyDisplay}</InfoValue>
                            </InfoItem>

                            <InfoItem>
                                <InfoLabel>Status</InfoLabel>
                                <InfoValue>
                                    <StatusBadge status={fixedCost.status}>
                                        {fixedCost.statusDisplay}
                                    </StatusBadge>
                                </InfoValue>
                            </InfoItem>

                            <InfoItem>
                                <InfoLabel>Automatyczne odnawianie</InfoLabel>
                                <InfoValue>{fixedCost.autoRenew ? 'Tak' : 'Nie'}</InfoValue>
                            </InfoItem>
                        </InfoGrid>

                        {fixedCost.description && (
                            <DescriptionSection>
                                <InfoLabel>Opis</InfoLabel>
                                <Description>{fixedCost.description}</Description>
                            </DescriptionSection>
                        )}
                    </InfoSection>

                    {/* Dates */}
                    <InfoSection>
                        <SectionHeader>
                            <SectionIcon>
                                <FaCalendarAlt />
                            </SectionIcon>
                            <SectionTitle>Daty</SectionTitle>
                        </SectionHeader>

                        <InfoGrid>
                            <InfoItem>
                                <InfoLabel>Data rozpoczęcia</InfoLabel>
                                <InfoValue>{formatDateFromArray(fixedCost.startDate)}</InfoValue>
                            </InfoItem>

                            <InfoItem>
                                <InfoLabel>Data zakończenia</InfoLabel>
                                <InfoValue>
                                    {fixedCost.endDate ? formatDateFromArray(fixedCost.endDate) : 'Bezterminowo'}
                                </InfoValue>
                            </InfoItem>

                            <InfoItem>
                                <InfoLabel>Ostatnia płatność</InfoLabel>
                                <InfoValue>
                                    {fixedCost.lastPaymentDate ? formatDateFromArray(fixedCost.lastPaymentDate) : 'Brak płatności'}
                                </InfoValue>
                            </InfoItem>

                            <InfoItem>
                                <InfoLabel>Następna płatność</InfoLabel>
                                <InfoValue>
                                    {fixedCost.nextPaymentDate ? (
                                        <NextPaymentDate>
                                            {formatDateFromArray(fixedCost.nextPaymentDate)}
                                            {Array.isArray(fixedCost.nextPaymentDate) && new Date(fixedCost.nextPaymentDate[0], fixedCost.nextPaymentDate[1] - 1, fixedCost.nextPaymentDate[2]) < new Date() && (
                                                <OverdueLabel>Przeterminowane</OverdueLabel>
                                            )}
                                        </NextPaymentDate>
                                    ) : 'Brak zaplanowanych płatności'}
                                </InfoValue>
                            </InfoItem>
                        </InfoGrid>
                    </InfoSection>

                    {/* Supplier Information */}
                    {fixedCost.supplierInfo && (
                        <InfoSection>
                            <SectionHeader>
                                <SectionIcon>
                                    <FaUser />
                                </SectionIcon>
                                <SectionTitle>Informacje o dostawcy</SectionTitle>
                            </SectionHeader>

                            <InfoGrid>
                                <InfoItem>
                                    <InfoLabel>Nazwa dostawcy</InfoLabel>
                                    <InfoValue>{fixedCost.supplierInfo.name}</InfoValue>
                                </InfoItem>

                                {fixedCost.supplierInfo.taxId && (
                                    <InfoItem>
                                        <InfoLabel>NIP</InfoLabel>
                                        <InfoValue>{fixedCost.supplierInfo.taxId}</InfoValue>
                                    </InfoItem>
                                )}

                                {fixedCost.contractNumber && (
                                    <InfoItem>
                                        <InfoLabel>Numer umowy</InfoLabel>
                                        <InfoValue>{fixedCost.contractNumber}</InfoValue>
                                    </InfoItem>
                                )}
                            </InfoGrid>
                        </InfoSection>
                    )}

                    {/* Financial Summary */}
                    <InfoSection>
                        <SectionHeader>
                            <SectionIcon>
                                <FaFileInvoiceDollar />
                            </SectionIcon>
                            <SectionTitle>Podsumowanie finansowe</SectionTitle>
                        </SectionHeader>

                        <FinancialGrid>
                            <FinancialItem>
                                <FinancialLabel>Łączna kwota zapłacona</FinancialLabel>
                                <FinancialValue $type="positive">
                                    {formatAmount(fixedCost.totalPaid)}
                                </FinancialValue>
                            </FinancialItem>

                            <FinancialItem>
                                <FinancialLabel>Łączna kwota planowana</FinancialLabel>
                                <FinancialValue>
                                    {formatAmount(fixedCost.totalPlanned)}
                                </FinancialValue>
                            </FinancialItem>

                            <FinancialItem>
                                <FinancialLabel>Liczba płatności</FinancialLabel>
                                <FinancialValue>{fixedCost.paymentsCount}</FinancialValue>
                            </FinancialItem>

                            <FinancialItem>
                                <FinancialLabel>Aktywny w bieżącym miesiącu</FinancialLabel>
                                <FinancialValue>
                                    {fixedCost.isActiveInCurrentMonth ? 'Tak' : 'Nie'}
                                </FinancialValue>
                            </FinancialItem>
                        </FinancialGrid>
                    </InfoSection>

                    {/* Notes */}
                    {fixedCost.notes && (
                        <InfoSection>
                            <SectionHeader>
                                <SectionIcon>
                                    <FaStickyNote />
                                </SectionIcon>
                                <SectionTitle>Uwagi</SectionTitle>
                            </SectionHeader>

                            <NotesContent>
                                {fixedCost.notes}
                            </NotesContent>
                        </InfoSection>
                    )}

                    {/* Payment History */}
                    {fixedCost.payments && fixedCost.payments.length > 0 && (
                        <InfoSection>
                            <SectionHeader>
                                <SectionIcon>
                                    <FaHistory />
                                </SectionIcon>
                                <SectionTitle>Historia płatności</SectionTitle>
                            </SectionHeader>

                            <PaymentsList>
                                {fixedCost.payments.map((payment, index) => (
                                    <PaymentItem key={payment.id || index}>
                                        <PaymentDate>
                                            {formatDateFromArray(payment.paymentDate)}
                                        </PaymentDate>
                                        <PaymentAmount>
                                            {formatAmount(payment.amount)}
                                        </PaymentAmount>
                                        <PaymentStatus status={payment.status}>
                                            {payment.statusDisplay}
                                        </PaymentStatus>
                                        {payment.variance !== 0 && (
                                            <PaymentVariance $isPositive={payment.variance > 0}>
                                                {payment.variance > 0 ? '+' : ''}{formatAmount(payment.variance)}
                                            </PaymentVariance>
                                        )}
                                    </PaymentItem>
                                ))}
                            </PaymentsList>
                        </InfoSection>
                    )}

                    {/* Metadata */}
                    <MetadataSection>
                        <MetadataItem>
                            <MetadataLabel>Utworzono:</MetadataLabel>
                            <MetadataValue>{formatDateTimeFromArray(fixedCost.createdAt)}</MetadataValue>
                        </MetadataItem>
                        <MetadataItem>
                            <MetadataLabel>Ostatnia modyfikacja:</MetadataLabel>
                            <MetadataValue>{formatDateTimeFromArray(fixedCost.updatedAt)}</MetadataValue>
                        </MetadataItem>
                    </MetadataSection>
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
    max-width: 900px;
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
    flex: 1;
    min-width: 0;
`;

const TitleIcon = styled.div`
    width: 40px;
    height: 40px;
    background: ${brandTheme.primaryGhost};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.primary};
    font-size: 18px;
    flex-shrink: 0;
`;

const TitleText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};
    align-items: center;
    flex-shrink: 0;
`;

const ActionButton = styled.button<{
    $variant: 'edit' | 'delete' | 'payment';
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: ${brandTheme.radius.md};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};
    font-size: 16px;

    ${({ $variant }) => {
    switch ($variant) {
        case 'edit':
            return `
                    background: ${brandTheme.status.warningLight};
                    color: ${brandTheme.status.warning};
                    &:hover {
                        background: ${brandTheme.status.warning};
                        color: white;
                        transform: scale(1.05);
                    }
                `;
        case 'payment':
            return `
                    background: ${brandTheme.status.successLight};
                    color: ${brandTheme.status.success};
                    &:hover {
                        background: ${brandTheme.status.success};
                        color: white;
                        transform: scale(1.05);
                    }
                `;
        case 'delete':
            return `
                    background: ${brandTheme.status.errorLight};
                    color: ${brandTheme.status.error};
                    &:hover {
                        background: ${brandTheme.status.error};
                        color: white;
                        transform: scale(1.05);
                    }
                `;
    }
}}

    &:active {
        transform: scale(0.95);
    }
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
    margin-left: ${brandTheme.spacing.sm};

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
    padding: ${brandTheme.spacing.xl};
    
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

const InfoSection = styled.div`
    margin-bottom: ${brandTheme.spacing.xl};
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    overflow: hidden;

    &:last-child {
        margin-bottom: 0;
    }
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-bottom: 1px solid ${brandTheme.border};
`;

const SectionIcon = styled.div`
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.primary};
    font-size: 16px;
`;

const SectionTitle = styled.h3`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${brandTheme.spacing.lg};
    padding: ${brandTheme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const InfoItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const InfoLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    line-height: 1.4;
`;

const CategoryBadge = styled.span<{ category: string }>`
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: ${brandTheme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    background-color: ${props => {
    switch (props.category) {
        case 'LOCATION': return 'rgba(155, 89, 182, 0.15)';
        case 'UTILITIES': return 'rgba(52, 152, 219, 0.15)';
        case 'INSURANCE': return 'rgba(231, 76, 60, 0.15)';
        case 'LICENSES': return 'rgba(46, 204, 113, 0.15)';
        case 'EQUIPMENT': return 'rgba(230, 126, 34, 0.15)';
        case 'MARKETING': return 'rgba(241, 196, 15, 0.15)';
        case 'PERSONNEL': return 'rgba(142, 68, 173, 0.15)';
        case 'FINANCIAL': return 'rgba(26, 188, 156, 0.15)';
        default: return 'rgba(149, 165, 166, 0.15)';
    }
}};
    color: ${props => {
    switch (props.category) {
        case 'LOCATION': return '#9b59b6';
        case 'UTILITIES': return '#3498db';
        case 'INSURANCE': return '#e74c3c';
        case 'LICENSES': return '#2ecc71';
        case 'EQUIPMENT': return '#e67e22';
        case 'MARKETING': return '#f1c40f';
        case 'PERSONNEL': return '#8e44ad';
        case 'FINANCIAL': return '#1abc9c';
        default: return '#95a5a6';
    }
}};
    border: 1px solid ${props => {
    switch (props.category) {
        case 'LOCATION': return 'rgba(155, 89, 182, 0.3)';
        case 'UTILITIES': return 'rgba(52, 152, 219, 0.3)';
        case 'INSURANCE': return 'rgba(231, 76, 60, 0.3)';
        case 'LICENSES': return 'rgba(46, 204, 113, 0.3)';
        case 'EQUIPMENT': return 'rgba(230, 126, 34, 0.3)';
        case 'MARKETING': return 'rgba(241, 196, 15, 0.3)';
        case 'PERSONNEL': return 'rgba(142, 68, 173, 0.3)';
        case 'FINANCIAL': return 'rgba(26, 188, 156, 0.3)';
        default: return 'rgba(149, 165, 166, 0.3)';
    }
}};
`;

const StatusBadge = styled.span<{ status: string }>`
    display: inline-block;
    padding: 6px 12px;
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 600;
    background-color: ${props => `${FixedCostStatusColors[props.status as keyof typeof FixedCostStatusColors]}22`};
    color: ${props => FixedCostStatusColors[props.status as keyof typeof FixedCostStatusColors]};
    border: 1px solid ${props => `${FixedCostStatusColors[props.status as keyof typeof FixedCostStatusColors]}44`};
`;

const AmountDisplay = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${brandTheme.primary};
`;

const OriginalAmount = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-style: italic;
    margin-top: 2px;
`;

const DescriptionSection = styled.div`
    padding: ${brandTheme.spacing.lg};
`;

const Description = styled.div`
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.border};
    font-style: italic;
    color: ${brandTheme.text.secondary};
    line-height: 1.5;
    margin-top: ${brandTheme.spacing.xs};
`;

const NextPaymentDate = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const OverdueLabel = styled.span`
    font-size: 11px;
    color: ${brandTheme.status.error};
    font-weight: 600;
    text-transform: uppercase;
`;

const FinancialGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FinancialItem = styled.div`
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.border};
    text-align: center;
`;

const FinancialLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 600;
    margin-bottom: ${brandTheme.spacing.xs};
`;

const FinancialValue = styled.div<{ $type?: string }>`
    font-size: 18px;
    font-weight: 700;
    color: ${props => {
    if (props.$type === 'positive') return brandTheme.status.success;
    return brandTheme.text.primary;
}};
`;

const NotesContent = styled.div`
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.border};
    font-style: italic;
    color: ${brandTheme.text.secondary};
    line-height: 1.6;
    white-space: pre-line;
    margin: ${brandTheme.spacing.lg};
`;

const PaymentsList = styled.div`
    padding: ${brandTheme.spacing.lg};
`;

const PaymentItem = styled.div`
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: ${brandTheme.spacing.md};
    align-items: center;
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    margin-bottom: ${brandTheme.spacing.sm};

    &:last-child {
        margin-bottom: 0;
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        text-align: center;
    }
`;

const PaymentDate = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const PaymentAmount = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${brandTheme.primary};
    text-align: right;

    @media (max-width: 768px) {
        text-align: center;
    }
`;

const PaymentStatus = styled.span<{ status: string }>`
    display: inline-block;
    padding: 4px 8px;
    border-radius: ${brandTheme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    background-color: ${brandTheme.status.successLight};
    color: ${brandTheme.status.success};
    border: 1px solid ${brandTheme.status.success}44;
`;

const PaymentVariance = styled.div<{ $isPositive: boolean }>`
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.$isPositive ? brandTheme.status.warning : brandTheme.status.error};
    text-align: right;

    @media (max-width: 768px) {
        text-align: center;
    }
`;

const MetadataSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-top: 1px solid ${brandTheme.border};
    margin-top: ${brandTheme.spacing.xl};
    border-radius: ${brandTheme.radius.md};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${brandTheme.spacing.sm};
        align-items: flex-start;
    }
`;

const MetadataItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const MetadataLabel = styled.span`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 600;
`;

const MetadataValue = styled.span`
    font-size: 12px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

export default FixedCostViewModal;