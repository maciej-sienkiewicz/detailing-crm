import React from 'react';
import styled from 'styled-components';
import {
    FaChartLine,
    FaPhoneAlt,
    FaPhoneVolume,
    FaCalendarCheck,
    FaCarSide,
    FaMoneyBillWave,
    FaUserPlus
} from 'react-icons/fa';
import { DailySummaryData } from '../../../types/activity';

interface ActivityStatisticsProps {
    summaryData: DailySummaryData | null;
    loading: boolean;
}

const ActivityStatistics: React.FC<ActivityStatisticsProps> = ({ summaryData, loading }) => {
    if (loading) {
        return <LoadingState>Ładowanie statystyk...</LoadingState>;
    }

    if (!summaryData) {
        return <EmptyState>Brak danych statystycznych dla wybranego okresu.</EmptyState>;
    }

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 2
        }).format(value);
    };

    return (
        <StatisticsContainer>
            <SectionHeader>
                <HeaderIcon><FaChartLine /></HeaderIcon>
                <HeaderTitle>Statystyki aktywności</HeaderTitle>
            </SectionHeader>

            <StatisticsGrid>
                <StatItem>
                    <StatIcon color="#e74c3c">
                        <FaPhoneVolume />
                    </StatIcon>
                    <StatContent>
                        <StatValue>{summaryData.callsMade}</StatValue>
                        <StatLabel>Wykonane telefony</StatLabel>
                    </StatContent>
                </StatItem>

                <StatItem>
                    <StatIcon color="#3498db">
                        <FaPhoneAlt />
                    </StatIcon>
                    <StatContent>
                        <StatValue>{summaryData.callsReceived}</StatValue>
                        <StatLabel>Odebrane telefony</StatLabel>
                    </StatContent>
                </StatItem>

                <StatItem>
                    <StatIcon color="#2ecc71">
                        <FaCalendarCheck />
                    </StatIcon>
                    <StatContent>
                        <StatValue>{summaryData.appointmentsScheduled}</StatValue>
                        <StatLabel>Nowe wizyty</StatLabel>
                    </StatContent>
                </StatItem>

                <StatItem>
                    <StatIcon color="#f39c12">
                        <FaCarSide />
                    </StatIcon>
                    <StatContent>
                        <StatValue>{summaryData.vehiclesServiced}</StatValue>
                        <StatLabel>Obsłużone pojazdy</StatLabel>
                    </StatContent>
                </StatItem>

                <StatItem wide>
                    <StatIcon color="#9b59b6">
                        <FaMoneyBillWave />
                    </StatIcon>
                    <StatContent>
                        <StatValue>{formatCurrency(summaryData.dailyRevenue)}</StatValue>
                        <StatLabel>Przychód</StatLabel>
                    </StatContent>
                </StatItem>

                <StatItem>
                    <StatIcon color="#1abc9c">
                        <FaUserPlus />
                    </StatIcon>
                    <StatContent>
                        <StatValue>{summaryData.newClients}</StatValue>
                        <StatLabel>Nowi klienci</StatLabel>
                    </StatContent>
                </StatItem>
            </StatisticsGrid>
        </StatisticsContainer>
    );
};

// Styled components
const StatisticsContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 25px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const HeaderIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f0f7ff;
  color: #3498db;
  font-size: 14px;
  margin-right: 10px;
`;

const HeaderTitle = styled.h3`
  font-size: 16px;
  color: #34495e;
  margin: 0;
`;

const StatisticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
`;

const StatItem = styled.div<{ wide?: boolean }>`
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  grid-column: ${props => props.wide ? 'span 2' : 'auto'};
  
  @media (max-width: 768px) {
    grid-column: auto;
  }
`;

const StatIcon = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => `${props.color}20`};
  color: ${props => props.color};
  font-size: 16px;
  margin-right: 15px;
  flex-shrink: 0;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #7f8c8d;
`;

const LoadingState = styled.div`
  padding: 25px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #7f8c8d;
  font-size: 14px;
  animation: pulse 1.5s infinite;
  
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;

const EmptyState = styled.div`
  padding: 25px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #7f8c8d;
  font-size: 14px;
`;

export default ActivityStatistics;