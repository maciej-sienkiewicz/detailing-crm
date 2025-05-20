// src/pages/Finances/components/FinancialDetailsSummary.tsx
import React from 'react';
import styled from 'styled-components';
import {
    FaChartLine,
    FaMoneyBillWave,
    FaChartPie,
    FaExclamationTriangle, FaUniversity
} from 'react-icons/fa';
import { FinancialSummary, PaymentMethod, PaymentMethodLabels } from '../../../types';

interface FinancialDetailsSummaryProps {
    summary: FinancialSummary;
    isLoading: boolean;
}

const FinancialDetailsSummary: React.FC<FinancialDetailsSummaryProps> = ({
                                                                             summary,
                                                                             isLoading
                                                                         }) => {
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
        return <SkeletonSummary />;
    }

    return (
        <SummaryContainer>
            <SummaryTitle>
                <FaChartLine />
                <span>Szczegółowe podsumowanie finansowe</span>
            </SummaryTitle>

            <GridLayout>
                <SummarySection>
                    <SectionTitle>
                        <FaMoneyBillWave />
                        <span>Stan finansów</span>
                    </SectionTitle>
                    <ItemsGrid>
                        <SummaryItem>
                            <ItemLabel>Stan kasy</ItemLabel>
                            <ItemValue positive={summary.cashBalance >= 0}>
                                {formatAmount(summary.cashBalance)}
                            </ItemValue>
                        </SummaryItem>
                        <SummaryItem>
                            <ItemLabel>Stan konta</ItemLabel>
                            <ItemValue positive={summary.bankAccountBalance >= 0}>
                                {formatAmount(summary.bankAccountBalance)}
                            </ItemValue>
                        </SummaryItem>
                        <SummaryItem>
                            <ItemLabel>Przychody</ItemLabel>
                            <ItemValue positive={true}>
                                {formatAmount(summary.totalIncome)}
                            </ItemValue>
                        </SummaryItem>
                        <SummaryItem>
                            <ItemLabel>Wydatki</ItemLabel>
                            <ItemValue positive={false}>
                                {formatAmount(summary.totalExpense)}
                            </ItemValue>
                        </SummaryItem>
                        <SummaryItem highlight>
                            <ItemLabel>Zysk</ItemLabel>
                            <ItemValue positive={summary.profit >= 0}>
                                {formatAmount(summary.profit)}
                            </ItemValue>
                        </SummaryItem>
                        <SummaryItem highlight>
                            <ItemLabel>Przepływ pieniędzy</ItemLabel>
                            <ItemValue positive={summary.cashFlow >= 0}>
                                {formatAmount(summary.cashFlow)}
                            </ItemValue>
                        </SummaryItem>
                    </ItemsGrid>
                </SummarySection>

                <SummarySection>
                    <SectionTitle>
                        <FaChartPie />
                        <span>Przychody wg metod płatności</span>
                    </SectionTitle>
                    <ItemsGrid>
                        {Object.entries(PaymentMethodLabels).map(([key, label]) => (
                            <SummaryItem key={key}>
                                <ItemLabel>{label}</ItemLabel>
                                <ItemValue positive={true}>
                                    {formatAmount(summary.incomeByMethod[key as PaymentMethod] || 0)}
                                </ItemValue>
                            </SummaryItem>
                        ))}
                        <SummaryItem highlight>
                            <ItemLabel>Razem</ItemLabel>
                            <ItemValue positive={true}>
                                {formatAmount(summary.totalIncome)}
                            </ItemValue>
                        </SummaryItem>
                    </ItemsGrid>
                </SummarySection>

                <SummarySection>
                    <SectionTitle>
                        <FaExclamationTriangle />
                        <span>Należności</span>
                    </SectionTitle>
                    <ItemsGrid>
                        <SummaryItem>
                            <ItemLabel>Bieżące</ItemLabel>
                            <ItemValue positive={true}>
                                {formatAmount(summary.receivablesByTimeframe.current)}
                            </ItemValue>
                        </SummaryItem>
                        <SummaryItem>
                            <ItemLabel>Do 30 dni</ItemLabel>
                            <ItemValue positive={true}>
                                {formatAmount(summary.receivablesByTimeframe.within30Days)}
                            </ItemValue>
                        </SummaryItem>
                        <SummaryItem>
                            <ItemLabel>30-60 dni</ItemLabel>
                            <ItemValue positive={true}>
                                {formatAmount(summary.receivablesByTimeframe.within60Days)}
                            </ItemValue>
                        </SummaryItem>
                        <SummaryItem>
                            <ItemLabel>60-90 dni</ItemLabel>
                            <ItemValue positive={true}>
                                {formatAmount(summary.receivablesByTimeframe.within90Days)}
                            </ItemValue>
                        </SummaryItem>
                        <SummaryItem warning>
                            <ItemLabel>Ponad 90 dni</ItemLabel>
                            <ItemValue positive={true}>
                                {formatAmount(summary.receivablesByTimeframe.over90Days)}
                            </ItemValue>
                        </SummaryItem>
                        <SummaryItem highlight>
                            <ItemLabel>Razem należności</ItemLabel>
                            <ItemValue positive={true}>
                                {formatAmount(summary.receivables)}
                            </ItemValue>
                        </SummaryItem>
                    </ItemsGrid>
                </SummarySection>

                <SummarySection>
                    <SectionTitle>
                        <FaUniversity />
                        <span>Zobowiązania</span>
                    </SectionTitle>
                    <ItemsGrid>
                        <SummaryItem>
                            <ItemLabel>Bieżące</ItemLabel>
                            <ItemValue positive={false}>
                                {formatAmount(summary.liabilitiesByTimeframe.current)}
                            </ItemValue>
                        </SummaryItem>
                        <SummaryItem>
                            <ItemLabel>Do 30 dni</ItemLabel>
                            <ItemValue positive={false}>
                                {formatAmount(summary.liabilitiesByTimeframe.within30Days)}
                            </ItemValue>
                        </SummaryItem>
                        <SummaryItem>
                            <ItemLabel>30-60 dni</ItemLabel>
                            <ItemValue positive={false}>
                                {formatAmount(summary.liabilitiesByTimeframe.within60Days)}
                            </ItemValue>
                        </SummaryItem>
                        <SummaryItem>
                            <ItemLabel>60-90 dni</ItemLabel>
                            <ItemValue positive={false}>
                                {formatAmount(summary.liabilitiesByTimeframe.within90Days)}
                            </ItemValue>
                        </SummaryItem>
                        <SummaryItem warning>
                            <ItemLabel>Ponad 90 dni</ItemLabel>
                            <ItemValue positive={false}>
                                {formatAmount(summary.liabilitiesByTimeframe.over90Days)}
                            </ItemValue>
                        </SummaryItem>
                        <SummaryItem highlight>
                            <ItemLabel>Razem zobowiązania</ItemLabel>
                            <ItemValue positive={false}>
                                {formatAmount(summary.liabilities)}
                            </ItemValue>
                        </SummaryItem>
                    </ItemsGrid>
                </SummarySection>
            </GridLayout>
        </SummaryContainer>
    );
};

const SummaryContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
`;

const SummaryTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  margin: 0 0 24px 0;
  color: #2c3e50;
  
  svg {
    color: #3498db;
  }
`;

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const SummarySection = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #eef2f7;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #2c3e50;
  
  svg {
    color: #3498db;
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

interface SummaryItemProps {
    highlight?: boolean;
    warning?: boolean;
}

const SummaryItem = styled.div<SummaryItemProps>`
  padding: 12px;
  border-radius: 4px;
  background-color: ${props => props.highlight
    ? '#e0f7fa'
    : props.warning
        ? '#fff3e0'
        : 'white'};
  border: 1px solid ${props => props.highlight
    ? '#b2ebf2'
    : props.warning
        ? '#ffe0b2'
        : '#eef2f7'};
`;

const ItemLabel = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 4px;
`;

interface ItemValueProps {
    positive: boolean;
}

const ItemValue = styled.div<ItemValueProps>`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.positive ? '#2ecc71' : '#e74c3c'};
`;

const SkeletonSummary = () => (
    <SummaryContainer>
        <SummaryTitle>
            <FaChartLine />
            <span>Szczegółowe podsumowanie finansowe</span>
        </SummaryTitle>

        <GridLayout>
            {[...Array(4)].map((_, index) => (
                <SummarySection key={index}>
                    <SectionTitle>
                        <SkeletonBox width="200px" height="20px" />
                    </SectionTitle>
                    <ItemsGrid>
                        {[...Array(6)].map((_, itemIndex) => (
                            <SummaryItem key={itemIndex}>
                                <SkeletonBox width="100px" height="16px" margin="0 0 8px 0" />
                                <SkeletonBox width="120px" height="24px" />
                            </SummaryItem>
                        ))}
                    </ItemsGrid>
                </SummarySection>
            ))}
        </GridLayout>
    </SummaryContainer>
);

interface SkeletonBoxProps {
    width: string;
    height: string;
    margin?: string;
}

const SkeletonBox = styled.div<SkeletonBoxProps>`
  width: ${props => props.width};
  height: ${props => props.height};
  margin: ${props => props.margin || '0'};
  background-color: #f0f0f0;
  border-radius: 4px;
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

export default FinancialDetailsSummary;