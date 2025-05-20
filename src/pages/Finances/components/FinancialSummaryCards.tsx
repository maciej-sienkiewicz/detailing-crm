// src/pages/Finances/components/FinancialSummaryCards.tsx
import React from 'react';
import styled from 'styled-components';
import { FaMoneyBillWave, FaArrowUp, FaArrowDown, FaChartLine, FaExclamationTriangle, FaUniversity, FaFileInvoiceDollar } from 'react-icons/fa';
import { FinancialSummary } from '../../../types';

interface FinancialSummaryCardsProps {
    summary: FinancialSummary;
    isLoading: boolean;
    period?: string;
}

const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({ summary, isLoading, period }) => {
    // Formatowanie kwoty
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
        <CardsContainer>
            <SummaryCard type="balance">
                <CardIcon>
                    <FaMoneyBillWave />
                </CardIcon>
                <CardContent>
                    <CardLabel>Stan kasy</CardLabel>
                    <CardValue>{formatAmount(summary.cashBalance)}</CardValue>
                    <CardDetail>Gotówka w kasie</CardDetail>
                </CardContent>
            </SummaryCard>

            <SummaryCard type="bank">
                <CardIcon>
                    <FaUniversity />
                </CardIcon>
                <CardContent>
                    <CardLabel>Stan konta</CardLabel>
                    <CardValue>{formatAmount(summary.bankAccountBalance)}</CardValue>
                    <CardDetail>Środki na koncie bankowym</CardDetail>
                </CardContent>
            </SummaryCard>

            <SummaryCard type="income">
                <CardIcon>
                    <FaArrowUp />
                </CardIcon>
                <CardContent>
                    <CardLabel>Przychody</CardLabel>
                    <CardValue>{formatAmount(summary.totalIncome)}</CardValue>
                    <CardDetail>{period ? `W okresie ${period}` : 'Całkowite przychody'}</CardDetail>
                </CardContent>
            </SummaryCard>

            <SummaryCard type="expense">
                <CardIcon>
                    <FaArrowDown />
                </CardIcon>
                <CardContent>
                    <CardLabel>Wydatki</CardLabel>
                    <CardValue>{formatAmount(summary.totalExpense)}</CardValue>
                    <CardDetail>{period ? `W okresie ${period}` : 'Całkowite wydatki'}</CardDetail>
                </CardContent>
            </SummaryCard>

            <SummaryCard type="receivables">
                <CardIcon>
                    <FaFileInvoiceDollar />
                </CardIcon>
                <CardContent>
                    <CardLabel>Należności</CardLabel>
                    <CardValue>{formatAmount(summary.receivables)}</CardValue>
                    <CardDetail>
                        {summary.receivablesOverdue > 0 && (
                            <WarningText>
                                <FaExclamationTriangle /> Przeterminowane: {formatAmount(summary.receivablesOverdue)}
                            </WarningText>
                        )}
                    </CardDetail>
                </CardContent>
            </SummaryCard>

            <SummaryCard type="profit">
                <CardIcon>
                    <FaChartLine />
                </CardIcon>
                <CardContent>
                    <CardLabel>Zysk</CardLabel>
                    <CardValue>{formatAmount(summary.profit)}</CardValue>
                    <CardDetail>Przychody - Wydatki</CardDetail>
                </CardContent>
            </SummaryCard>
        </CardsContainer>
    );
};

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

interface SummaryCardProps {
    type: 'balance' | 'income' | 'expense' | 'receivables' | 'bank' | 'profit';
}

const SummaryCard = styled.div<SummaryCardProps>`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-top: 4px solid ${props => {
    switch (props.type) {
        case 'balance': return '#3498db';  // Niebieski
        case 'income': return '#2ecc71';   // Zielony
        case 'expense': return '#e74c3c';  // Czerwony
        case 'receivables': return '#f39c12'; // Pomarańczowy
        case 'bank': return '#9b59b6';     // Fioletowy
        case 'profit': return '#1abc9c';   // Morski
        default: return '#3498db';
    }
}};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background-color: #f8f9fa;
  color: #3498db;
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardLabel = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 4px;
`;

const CardValue = styled.div`
  font-size: 22px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 6px;
`;

const CardDetail = styled.div`
  font-size: 12px;
  color: #7f8c8d;
`;

const WarningText = styled.span`
  color: #e74c3c;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
`;

const SkeletonCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  height: 110px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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