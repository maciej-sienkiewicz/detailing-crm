// src/pages/Finances/components/FinancialSummaryCards.tsx
import React from 'react';
import styled from 'styled-components';
import {
    FaMoneyBillWave,
    FaArrowUp,
    FaArrowDown,
    FaChartLine,
    FaExclamationTriangle,
    FaUniversity,
    FaFileInvoiceDollar
} from 'react-icons/fa';
import { UnifiedDocumentSummary } from '../../../types/finance';
import { brandTheme } from '../styles/theme';

interface FinancialSummaryCardsProps {
    summary: UnifiedDocumentSummary;
    isLoading: boolean;
    period?: string;
}

const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
                                                                         summary,
                                                                         isLoading,
                                                                         period
                                                                     }) => {
    // Format amount
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
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
        </SummarySection>
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
    min-height: 110px; /* Jednakowa wysokość wszystkich kart */

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.sm};
        border-color: ${brandTheme.borderHover};
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
    height: 24px; /* Stała wysokość dla wartości */
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
    height: 17px; /* Stała wysokość dla etykiety */
    display: flex;
    align-items: center;
`;

const CardDetail = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.tertiary};
    font-weight: 500;
    line-height: 1.3;
    min-height: 16px; /* Minimalna wysokość dla detali */
    display: flex;
    align-items: center;
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

export default FinancialSummaryCards;