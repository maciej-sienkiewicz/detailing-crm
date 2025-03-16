import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    FaChartBar,
    FaPhoneAlt,
    FaCalendarCheck,
    FaCarSide,
    FaFileInvoiceDollar,
    FaUserPlus,
    FaSpinner
} from 'react-icons/fa';
import { DailySummaryData } from '../../../types/activity';

interface DailySummaryProps {
    summaryData: DailySummaryData | null;
    loading: boolean;
}

const DailySummary: React.FC<DailySummaryProps> = ({ summaryData, loading }) => {
    // Formatuj datę
    const formatDate = (dateString: string): string => {
        return format(new Date(dateString), 'd MMMM yyyy', { locale: pl });
    };

    if (loading) {
        return (
            <Container>
                <SectionTitle>
                    <SectionIcon><FaChartBar /></SectionIcon>
                    Podsumowanie dzienne
                </SectionTitle>
                <LoadingState>
                    <FaSpinner className="spinner" /> Ładowanie...
                </LoadingState>
            </Container>
        );
    }

    if (!summaryData) {
        return (
            <Container>
                <SectionTitle>
                    <SectionIcon><FaChartBar /></SectionIcon>
                    Podsumowanie dzienne
                </SectionTitle>
                <EmptyState>
                    Brak danych podsumowania
                </EmptyState>
            </Container>
        );
    }

    return (
        <Container>
            <SectionTitle>
                <SectionIcon><FaChartBar /></SectionIcon>
                Podsumowanie dzienne
            </SectionTitle>

            <SummaryDate>{formatDate(summaryData.date)}</SummaryDate>

            <SummaryGrid>
                <SummaryItem>
                    <SummaryIcon color="#3498db">
                        <FaPhoneAlt />
                    </SummaryIcon>
                    <SummaryContent>
                        <SummaryValue>{summaryData.callsMade}</SummaryValue>
                        <SummaryLabel>Wykonane telefony</SummaryLabel>
                    </SummaryContent>
                </SummaryItem>

                <SummaryItem>
                    <SummaryIcon color="#9b59b6">
                        <FaPhoneAlt />
                    </SummaryIcon>
                    <SummaryContent>
                        <SummaryValue>{summaryData.callsReceived}</SummaryValue>
                        <SummaryLabel>Odebrane telefony</SummaryLabel>
                    </SummaryContent>
                </SummaryItem>

                <SummaryItem>
                    <SummaryIcon color="#2ecc71">
                        <FaCalendarCheck />
                    </SummaryIcon>
                    <SummaryContent>
                        <SummaryValue>{summaryData.appointmentsScheduled}</SummaryValue>
                        <SummaryLabel>Nowe wizyty</SummaryLabel>
                    </SummaryContent>
                </SummaryItem>

                <SummaryItem>
                    <SummaryIcon color="#e74c3c">
                        <FaCarSide />
                    </SummaryIcon>
                    <SummaryContent>
                        <SummaryValue>{summaryData.vehiclesServiced}</SummaryValue>
                        <SummaryLabel>Obsłużone pojazdy</SummaryLabel>
                    </SummaryContent>
                </SummaryItem>
            </SummaryGrid>

            <SummaryGrid>
                <SummaryItem>
                    <SummaryIcon color="#f1c40f">
                        <FaFileInvoiceDollar />
                    </SummaryIcon>
                    <SummaryContent>
                        <SummaryValue>{summaryData.dailyRevenue.toFixed(2)} zł</SummaryValue>
                        <SummaryLabel>Przychód</SummaryLabel>
                    </SummaryContent>
                </SummaryItem>

                <SummaryItem>
                    <SummaryIcon color="#1abc9c">
                        <FaUserPlus />
                    </SummaryIcon>
                    <SummaryContent>
                        <SummaryValue>{summaryData.newClients}</SummaryValue>
                        <SummaryLabel>Nowi klienci</SummaryLabel>
                    </SummaryContent>
                </SummaryItem>
            </SummaryGrid>
        </Container>
    );
};

const Container = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 15px;
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #34495e;
  margin: 0 0 15px 0;
`;

const SectionIcon = styled.span`
  color: #3498db;
  margin-right: 10px;
`;

const SummaryDate = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 15px;
  text-align: center;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryItem = styled.div`
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 12px;
  display: flex;
  align-items: center;
`;

const SummaryIcon = styled.div<{ color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${props => props.color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-right: 12px;
  flex-shrink: 0;
`;

const SummaryContent = styled.div`
  flex: 1;
`;

const SummaryValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 2px;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: #7f8c8d;
`;

const LoadingState = styled.div`
  padding: 20px;
  text-align: center;
  color: #7f8c8d;
  font-size: 14px;
  
  .spinner {
    animation: spin 1s linear infinite;
    margin-right: 8px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  padding: 20px;
  text-align: center;
  color: #7f8c8d;
  font-size: 14px;
  background-color: #f9f9f9;
  border-radius: 4px;
`;

export default DailySummary;