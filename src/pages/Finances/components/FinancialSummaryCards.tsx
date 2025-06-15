// src/pages/Finances/components/FinancialSummaryCards.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import {
    FaMoneyBillWave,
    FaArrowUp,
    FaArrowDown,
    FaChartLine,
    FaExclamationTriangle,
    FaUniversity,
    FaFileInvoiceDollar,
    FaEdit
} from 'react-icons/fa';
import { UnifiedDocumentSummary } from '../../../types/finance';
import { brandTheme } from '../styles/theme';

interface FinancialSummaryCardsProps {
    summary: UnifiedDocumentSummary;
    isLoading: boolean;
    period?: string;
    onBalanceUpdate?: (newCashBalance: number, newBankBalance: number) => void;
}

const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
                                                                         summary,
                                                                         isLoading,
                                                                         period,
                                                                         onBalanceUpdate
                                                                     }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [editType, setEditType] = useState<'cash' | 'bank'>('cash');

    // Format amount
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const handleEditBalance = (type: 'cash' | 'bank') => {
        setEditType(type);
        setShowEditModal(true);
    };

    const handleBalanceSaved = (newCashBalance: number, newBankBalance: number) => {
        setShowEditModal(false);
        if (onBalanceUpdate) {
            onBalanceUpdate(newCashBalance, newBankBalance);
        }
    };

    if (isLoading) {
        return (
            <CardsContainer>
                {[...Array(6)].map((_, index) => (
                    <SkeletonCard key={index} />
                ))}
            </CardsContainer>
        );
    }

    return (
        <SummarySection>
            <CardsContainer>
                <SummaryCard $type="balance">
                    <CardIcon $color={brandTheme.primary}>
                        <FaMoneyBillWave />
                    </CardIcon>
                    <CardContent>
                        <CardValue>{formatAmount(summary.cashBalance)}</CardValue>
                        <CardLabel>Stan kasy</CardLabel>
                        <CardDetail>Gotówka w kasie</CardDetail>
                    </CardContent>
                    <EditIconContainer>
                        <EditIcon
                            onClick={() => handleEditBalance('cash')}
                            title="Edytuj stan kasy"
                        >
                            <FaEdit />
                        </EditIcon>
                    </EditIconContainer>
                </SummaryCard>

                <SummaryCard $type="bank">
                    <CardIcon $color={brandTheme.primary}>
                        <FaUniversity />
                    </CardIcon>
                    <CardContent>
                        <CardValue>{formatAmount(summary.bankAccountBalance)}</CardValue>
                        <CardLabel>Stan konta</CardLabel>
                        <CardDetail>Środki na koncie bankowym</CardDetail>
                    </CardContent>
                    <EditIconContainer>
                        <EditIcon
                            onClick={() => handleEditBalance('bank')}
                            title="Edytuj stan konta bankowego"
                        >
                            <FaEdit />
                        </EditIcon>
                    </EditIconContainer>
                </SummaryCard>

                <SummaryCard $type="income">
                    <CardIcon $color={brandTheme.primary}>
                        <FaArrowUp />
                    </CardIcon>
                    <CardContent>
                        <CardValue $type="income">{formatAmount(summary.totalIncome)}</CardValue>
                        <CardLabel>Przychody</CardLabel>
                        <CardDetail>{period ? `W okresie ${period}` : 'Całkowite przychody'}</CardDetail>
                    </CardContent>
                </SummaryCard>

                <SummaryCard $type="expense">
                    <CardIcon $color={brandTheme.primary}>
                        <FaArrowDown />
                    </CardIcon>
                    <CardContent>
                        <CardValue $type="expense">{formatAmount(summary.totalExpense)}</CardValue>
                        <CardLabel>Wydatki</CardLabel>
                        <CardDetail>{period ? `W okresie ${period}` : 'Całkowite wydatki'}</CardDetail>
                    </CardContent>
                </SummaryCard>

                <SummaryCard $type="receivables">
                    <CardIcon $color={brandTheme.primary}>
                        <FaFileInvoiceDollar />
                    </CardIcon>
                    <CardContent>
                        <CardValue>{formatAmount(summary.receivables)}</CardValue>
                        <CardLabel>Należności</CardLabel>
                        <CardDetail>
                            {summary.receivablesOverdue > 0 ? (
                                <WarningText>
                                    <FaExclamationTriangle />
                                    Przeterminowane: {formatAmount(summary.receivablesOverdue)}
                                </WarningText>
                            ) : (
                                <span>Brak przeterminowanych</span>
                            )}
                        </CardDetail>
                    </CardContent>
                </SummaryCard>

                <SummaryCard $type="profit">
                    <CardIcon $color={brandTheme.primary}>
                        <FaChartLine />
                    </CardIcon>
                    <CardContent>
                        <CardValue $profit={summary.profit}>{formatAmount(summary.profit)}</CardValue>
                        <CardLabel>Zysk</CardLabel>
                        <CardDetail>Przychody - Wydatki</CardDetail>
                    </CardContent>
                </SummaryCard>
            </CardsContainer>

            {showEditModal && (
                <BalanceEditModal
                    isOpen={showEditModal}
                    balanceType={editType}
                    currentCashBalance={summary.cashBalance}
                    currentBankBalance={summary.bankAccountBalance}
                    onSave={handleBalanceSaved}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </SummarySection>
    );
};

// Modal Component
interface BalanceEditModalProps {
    isOpen: boolean;
    balanceType: 'cash' | 'bank';
    currentCashBalance: number;
    currentBankBalance: number;
    onSave: (newCashBalance: number, newBankBalance: number) => void;
    onClose: () => void;
}

const BalanceEditModal: React.FC<BalanceEditModalProps> = ({
                                                               isOpen,
                                                               balanceType,
                                                               currentCashBalance,
                                                               currentBankBalance,
                                                               onSave,
                                                               onClose
                                                           }) => {
    const [newBalance, setNewBalance] = useState(
        balanceType === 'cash' ? currentCashBalance : currentBankBalance
    );
    const [reason, setReason] = useState<string>('MANAGER_ADJUSTMENT');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Import balanceOverrideApi dynamically to avoid circular dependencies
            const { balanceOverrideApi, BalanceType, OverrideReason } = await import('../../../api/balanceOverrideApi');

            const result = await balanceOverrideApi.manualOverride({
                balanceType: balanceType === 'cash' ? BalanceType.CASH : BalanceType.BANK,
                newBalance,
                reason: reason as keyof typeof OverrideReason,
                description: description || undefined
            });

            if (result.success) {
                // Calculate new balances
                const newCashBalance = balanceType === 'cash' ? newBalance : currentCashBalance;
                const newBankBalance = balanceType === 'bank' ? newBalance : currentBankBalance;

                onSave(newCashBalance, newBankBalance);
            } else {
                setError(result.error || 'Nie udało się zaktualizować salda');
            }
        } catch (err) {
            console.error('Error updating balance:', err);
            setError('Wystąpił błąd podczas aktualizacji salda');
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const currentBalance = balanceType === 'cash' ? currentCashBalance : currentBankBalance;
    const difference = newBalance - currentBalance;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>
                        <TitleIcon>
                            {balanceType === 'cash' ? <FaMoneyBillWave /> : <FaUniversity />}
                        </TitleIcon>
                        <TitleText>
                            Edytuj {balanceType === 'cash' ? 'stan kasy' : 'stan konta bankowego'}
                        </TitleText>
                    </ModalTitle>
                    <CloseButton onClick={onClose}>×</CloseButton>
                </ModalHeader>

                <ModalContent>
                    <CurrentBalanceInfo>
                        <InfoLabel>Aktualny stan:</InfoLabel>
                        <InfoValue>{formatAmount(currentBalance)} PLN</InfoValue>
                    </CurrentBalanceInfo>

                    {error && (
                        <ErrorMessage>
                            <FaExclamationTriangle />
                            {error}
                        </ErrorMessage>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label htmlFor="newBalance">Nowy stan *</Label>
                            <Input
                                id="newBalance"
                                type="number"
                                step="0.01"
                                min="0"
                                value={newBalance}
                                onChange={(e) => setNewBalance(parseFloat(e.target.value) || 0)}
                                required
                            />
                        </FormGroup>

                        {difference !== 0 && (
                            <DifferenceInfo $isPositive={difference > 0}>
                                <DifferenceLabel>
                                    {difference > 0 ? 'Zwiększenie o:' : 'Zmniejszenie o:'}
                                </DifferenceLabel>
                                <DifferenceValue>
                                    {formatAmount(Math.abs(difference))} PLN
                                </DifferenceValue>
                            </DifferenceInfo>
                        )}

                        <FormGroup>
                            <Label htmlFor="reason">Powód zmiany *</Label>
                            <Select
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            >
                                <option value="MANAGER_ADJUSTMENT">Korekta menedżerska</option>
                                <option value="CASH_TO_SAFE">Przeniesienie gotówki do sejfu</option>
                                <option value="CASH_FROM_SAFE">Pobranie gotówki z sejfu</option>
                                <option value="BANK_STATEMENT_RECONCILIATION">Uzgodnienie z wyciągiem bankowym</option>
                                <option value="INVENTORY_COUNT">Rezultat inwentaryzacji kasy</option>
                                <option value="ERROR_CORRECTION">Korekta błędu księgowego</option>
                                <option value="EXTERNAL_PAYMENT">Płatność zewnętrzna nie odnotowana w systemie</option>
                                <option value="SYSTEM_MIGRATION">Migracja danych systemowych</option>
                                <option value="OTHER">Inna przyczyna</option>
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="description">Opis (opcjonalnie)</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Dodatkowy opis przyczyny zmiany salda"
                                rows={3}
                            />
                        </FormGroup>

                        <FormActions>
                            <CancelButton type="button" onClick={onClose}>
                                Anuluj
                            </CancelButton>
                            <SaveButton type="submit" disabled={loading}>
                                {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                            </SaveButton>
                        </FormActions>
                    </Form>
                </ModalContent>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components - Updated to match VehiclesPage style
const SummarySection = styled.section`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl} 0;

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg} 0;
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.md} 0;
    }
`;

const CardsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: ${brandTheme.spacing.lg};
    margin-bottom: ${brandTheme.spacing.lg};

    @media (max-width: 1400px) {
        grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 992px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 576px) {
        grid-template-columns: 1fr;
    }
`;

interface SummaryCardProps {
    $type: 'balance' | 'income' | 'expense' | 'receivables' | 'bank' | 'profit';
}

const SummaryCard = styled.div<SummaryCardProps>`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.xs};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg};
    transition: all 0.2s ease;
    position: relative;
    min-height: 110px;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.sm};
        border-color: ${brandTheme.borderHover};
        
        ${props => (props.$type === 'balance' || props.$type === 'bank') && `
            .edit-icon {
                opacity: 1;
                transform: scale(1);
            }
        `}
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: ${brandTheme.primary};
        opacity: 0.8;
    }
`;

const CardIcon = styled.div<{ $color: string }>`
    width: 48px;
    height: 48px;
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.text.secondary};
    font-size: 20px;
    flex-shrink: 0;
    border: 1px solid ${brandTheme.border};
    transition: all 0.2s ease;

    ${SummaryCard}:hover & {
        background: ${brandTheme.primary};
        color: white;
        border-color: ${brandTheme.primary};
    }
`;

const CardContent = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
`;

const CardValue = styled.div<{ $profit?: number; $type?: string }>`
    font-size: 20px;
    font-weight: 600;
    color: ${props => {
    if (props.$profit !== undefined) {
        return props.$profit >= 0 ? brandTheme.status.success : brandTheme.status.error;
    }
    if (props.$type === 'income') {
        return brandTheme.status.success;
    }
    if (props.$type === 'expense') {
        return brandTheme.status.error;
    }
    return brandTheme.text.primary;
}};
    margin-bottom: ${brandTheme.spacing.xs};
    letter-spacing: -0.025em;
    line-height: 1.2;
    height: 24px;
    display: flex;
    align-items: center;

    @media (max-width: 768px) {
        font-size: 18px;
    }
`;

const CardLabel = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.primary};
    font-weight: 600;
    margin-bottom: ${brandTheme.spacing.xs};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    height: 17px;
    display: flex;
    align-items: center;
`;

const CardDetail = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.tertiary};
    font-weight: 500;
    line-height: 1.3;
    min-height: 16px;
    display: flex;
    align-items: center;
`;

const EditIconContainer = styled.div`
    position: absolute;
    top: ${brandTheme.spacing.sm};
    right: ${brandTheme.spacing.sm};
`;

const EditIcon = styled.button.attrs({ className: 'edit-icon' })`
    width: 32px;
    height: 32px;
    border: none;
    background: ${brandTheme.primary};
    color: white;
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.2s ease;
    font-size: 14px;
    box-shadow: ${brandTheme.shadow.md};

    &:hover {
        background: ${brandTheme.primaryDark};
        transform: scale(1.1);
    }

    &:active {
        transform: scale(0.95);
    }
`;

const WarningText = styled.span`
    color: ${brandTheme.status.error};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    font-size: 11px;
    font-weight: 600;

    svg {
        font-size: 10px;
    }
`;

const SkeletonCard = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    padding: ${brandTheme.spacing.lg};
    height: 110px;
    box-shadow: ${brandTheme.shadow.sm};
    position: relative;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        transform: translateX(-100%);
        background-image: linear-gradient(
                90deg,
                rgba(255, 255, 255, 0) 0,
                rgba(255, 255, 255, 0.2) 20%,
                rgba(255, 255, 255, 0.5) 60%,
                rgba(255, 255, 255, 0)
        );
        animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
        100% {
            transform: translateX(100%);
        }
    }
`;

// Modal Styled Components
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
    max-width: 500px;
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
    background: ${brandTheme.primaryGhost};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.primary};
    font-size: 18px;
`;

const TitleText = styled.h2`
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.025em;
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
    font-size: 20px;

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
    padding: ${brandTheme.spacing.xl};
    overflow-y: auto;
    flex: 1;
    
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

const CurrentBalanceInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.border};
    margin-bottom: ${brandTheme.spacing.lg};
`;

const InfoLabel = styled.span`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 600;
`;

const InfoValue = styled.span`
    font-size: 16px;
    color: ${brandTheme.text.primary};
    font-weight: 700;
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    padding: ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.status.error}30;
    font-weight: 500;
    font-size: 14px;
    margin-bottom: ${brandTheme.spacing.lg};
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
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
`;

const Input = styled.input`
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const Select = styled.select`
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
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
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const DifferenceInfo = styled.div<{ $isPositive: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.md};
    background: ${props => props.$isPositive ? brandTheme.status.successLight : brandTheme.status.warningLight};
    border: 1px solid ${props => props.$isPositive ? brandTheme.status.success + '44' : brandTheme.status.warning + '44'};
    border-radius: ${brandTheme.radius.md};
    margin: ${brandTheme.spacing.md} 0;
`;

const DifferenceLabel = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: inherit;
`;

const DifferenceValue = styled.span`
    font-size: 16px;
    font-weight: 700;
    color: inherit;
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.md};
    margin-top: ${brandTheme.spacing.lg};

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
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    border: 2px solid transparent;
    box-shadow: ${brandTheme.shadow.sm};

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

export default FinancialSummaryCards;