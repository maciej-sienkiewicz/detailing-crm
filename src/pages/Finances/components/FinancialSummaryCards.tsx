// src/pages/Finances/components/FinancialSummaryCards.tsx
import React, {useState} from 'react';
import styled from 'styled-components';
import {
    FaArrowDown,
    FaArrowUp,
    FaChartLine,
    FaCreditCard,
    FaEdit,
    FaExclamationTriangle,
    FaFileInvoiceDollar,
    FaHistory,
    FaMoneyBillWave
} from 'react-icons/fa';
import {UnifiedDocumentSummary} from '../../../types/finance';
import {brandTheme} from '../styles/theme';
import BalanceHistoryModal from './BalanceHistoryModal';
import {BalanceType} from '../../../api/balanceOverrideApi';

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
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyBalanceType, setHistoryBalanceType] = useState<BalanceType | undefined>();

    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const handleEditBalance = () => {
        setShowEditModal(true);
    };

    const handleShowHistory = (type: BalanceType) => {
        setHistoryBalanceType(type);
        setShowHistoryModal(true);
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
                    <CardActions>
                        <ActionIcon
                            onClick={() => handleShowHistory(BalanceType.CASH)}
                            title="Zobacz historię zmian kasy"
                            className="history-icon"
                        >
                            <FaHistory />
                        </ActionIcon>
                        <ActionIcon
                            onClick={handleEditBalance}
                            title="Edytuj stan kasy"
                            className="edit-icon"
                        >
                            <FaEdit />
                        </ActionIcon>
                    </CardActions>
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

                <SummaryCard $type="liabilities">
                    <CardIcon $color={brandTheme.primary}>
                        <FaCreditCard />
                    </CardIcon>
                    <CardContent>
                        <CardValue>{formatAmount(summary.liabilities)}</CardValue>
                        <CardLabel>Zobowiązania</CardLabel>
                        <CardDetail>
                            {summary.liabilitiesOverdue > 0 ? (
                                <WarningText>
                                    <FaExclamationTriangle />
                                    Przeterminowane: {formatAmount(summary.liabilitiesOverdue)}
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
                    balanceType="cash"
                    currentCashBalance={summary.cashBalance}
                    currentBankBalance={0}
                    onSave={handleBalanceSaved}
                    onClose={() => setShowEditModal(false)}
                />
            )}

            <BalanceHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                balanceType={historyBalanceType}
            />
        </SummarySection>
    );
};

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
    const [newBalance, setNewBalance] = useState(currentCashBalance);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description.trim()) {
            setError('Opis jest wymagany');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { balanceOverrideApi, BalanceType } = await import('../../../api/balanceOverrideApi');

            const result = await balanceOverrideApi.manualOverride({
                balanceType: BalanceType.CASH,
                newBalance,
                description: description.trim()
            });

            if (result.success) {
                onSave(newBalance, currentBankBalance);
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

    const difference = newBalance - currentCashBalance;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>
                        <TitleIcon>
                            <FaMoneyBillWave />
                        </TitleIcon>
                        <TitleText>
                            Edytuj stan kasy
                        </TitleText>
                    </ModalTitle>
                    <CloseButton onClick={onClose}>×</CloseButton>
                </ModalHeader>

                <ModalContent>
                    <CurrentBalanceInfo>
                        <InfoLabel>Aktualny stan:</InfoLabel>
                        <InfoValue>{formatAmount(currentCashBalance)} PLN</InfoValue>
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
                            <Label htmlFor="description">Opis zmiany *</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Opisz powód zmiany salda (np. korekta po inwentaryzacji, uzgodnienie z wyciągiem bankowym, itp.)"
                                rows={4}
                                required
                            />
                            <FieldHint>
                                Podaj szczegółowy opis przyczyny zmiany salda. Informacja zostanie zapisana w historii operacji.
                            </FieldHint>
                        </FormGroup>

                        <FormActions>
                            <CancelButton type="button" onClick={onClose}>
                                Anuluj
                            </CancelButton>
                            <SaveButton type="submit" disabled={loading || !description.trim()}>
                                {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                            </SaveButton>
                        </FormActions>
                    </Form>
                </ModalContent>
            </ModalContainer>
        </ModalOverlay>
    );
};

const SummarySection = styled.section`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg} 0;

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md} 0;
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.sm} 0;
    }
`;

const CardsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.md};

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
    $type: 'balance' | 'income' | 'expense' | 'receivables' | 'liabilities' | 'profit';
}

const SummaryCard = styled.div<SummaryCardProps>`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.xs};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md};
    transition: all 0.2s ease;
    position: relative;
    min-height: 70px;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.sm};
        border-color: ${brandTheme.borderHover};

        ${props => props.$type === 'balance' && `
            .history-icon,
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
        height: 2px;
        background: ${brandTheme.primary};
        opacity: 0.8;
    }
`;

const CardIcon = styled.div<{ $color: string }>`
    width: 32px;
    height: 32px;
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.text.secondary};
    font-size: 14px;
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
    font-size: 14px;
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
    height: 16px;
    display: flex;
    align-items: center;

    @media (max-width: 768px) {
        font-size: 13px;
    }
`;

const CardLabel = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.primary};
    font-weight: 600;
    margin-bottom: ${brandTheme.spacing.xs};
    text-transform: uppercase;
    letter-spacing: 0.3px;
    height: 12px;
    display: flex;
    align-items: center;
`;

const CardDetail = styled.div`
    font-size: 10px;
    color: ${brandTheme.text.tertiary};
    font-weight: 500;
    line-height: 1.3;
    min-height: 12px;
    display: flex;
    align-items: center;
`;

const WarningText = styled.span`
    color: ${brandTheme.status.error};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    font-size: 9px;
    font-weight: 600;

    svg {
        font-size: 8px;
    }
`;

const CardActions = styled.div`
    position: absolute;
    top: ${brandTheme.spacing.xs};
    right: ${brandTheme.spacing.xs};
    display: flex;
    gap: ${brandTheme.spacing.xs};
`;

const ActionIcon = styled.button`
    width: 20px;
    height: 20px;
    border: none;
    background: ${brandTheme.primary};
    color: white;
    border-radius: ${brandTheme.radius.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.2s ease;
    font-size: 9px;
    box-shadow: ${brandTheme.shadow.md};

    &:hover {
        background: ${brandTheme.primaryDark};
        transform: scale(1.1);
    }

    &:active {
        transform: scale(0.95);
    }
`;

const ModalContent = styled.div`
    padding: ${brandTheme.spacing.lg};
    overflow-y: auto;
    flex: 1;

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

    &::-webkit-scrollbar-thumb:hover {
        background: ${brandTheme.borderHover};
    }
`;

const CurrentBalanceInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.sm};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.sm};
    border: 1px solid ${brandTheme.border};
    margin-bottom: ${brandTheme.spacing.md};
`;

const InfoLabel = styled.span`
    font-size: 12px;
    color: ${brandTheme.text.secondary};
    font-weight: 600;
`;

const InfoValue = styled.span`
    font-size: 13px;
    color: ${brandTheme.text.primary};
    font-weight: 700;
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    padding: ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.sm};
    border: 1px solid ${brandTheme.status.error}30;
    font-weight: 500;
    font-size: 12px;
    margin-bottom: ${brandTheme.spacing.md};
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const Label = styled.label`
    font-size: 12px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const Input = styled.input`
    height: 32px;
    padding: 0 ${brandTheme.spacing.sm};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    font-size: 12px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 2px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const Textarea = styled.textarea`
    padding: ${brandTheme.spacing.sm};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    font-size: 12px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    resize: vertical;
    min-height: 70px;
    font-family: inherit;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 2px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const FieldHint = styled.div`
    font-size: 10px;
    color: ${brandTheme.text.secondary};
    margin-top: ${brandTheme.spacing.xs};
    line-height: 1.4;
`;

const DifferenceInfo = styled.div<{ $isPositive: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.sm};
    background: ${props => props.$isPositive ? brandTheme.status.successLight : brandTheme.status.warningLight};
    border: 1px solid ${props => props.$isPositive ? brandTheme.status.success + '44' : brandTheme.status.warning + '44'};
    border-radius: ${brandTheme.radius.sm};
    margin: ${brandTheme.spacing.sm} 0;
`;

const DifferenceLabel = styled.span`
    font-size: 12px;
    font-weight: 600;
    color: inherit;
`;

const DifferenceValue = styled.span`
    font-size: 13px;
    font-weight: 700;
    color: inherit;
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.sm};
    margin-top: ${brandTheme.spacing.md};

    @media (max-width: 576px) {
        flex-direction: column-reverse;
    }
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.sm};
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 32px;
    min-width: 90px;

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
    z-index: ${brandTheme.zIndex.modalEdit};
    padding: ${brandTheme.spacing.md};
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    background-color: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.lg};
    box-shadow: ${brandTheme.shadow.xl};
    width: 95vw;
    max-width: 420px;
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
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
    flex-shrink: 0;
`;

const ModalTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const TitleIcon = styled.div`
    width: 28px;
    height: 28px;
    background: ${brandTheme.primaryGhost};
    border-radius: ${brandTheme.radius.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.primary};
    font-size: 13px;
`;

const TitleText = styled.h2`
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.025em;
`;

const SkeletonCard = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.border};
    padding: ${brandTheme.spacing.md};
    height: 70px;
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

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: ${brandTheme.surfaceHover};
    color: ${brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.sm};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};
    font-size: 16px;

    &:hover {
        background: ${brandTheme.status.errorLight};
        color: ${brandTheme.status.error};
        transform: scale(1.05);
    }

    &:active {
        transform: scale(0.95);
    }
`;

export default FinancialSummaryCards;