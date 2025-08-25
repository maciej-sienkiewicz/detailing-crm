// src/pages/SMS/components/SmsDashboard.tsx
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {useNavigate} from 'react-router-dom';
import {
    FaCalendarAlt,
    FaChartLine,
    FaCheckCircle,
    FaClock,
    FaEnvelope,
    FaExclamationTriangle,
    FaHistory,
    FaMoneyBillWave,
    FaRobot,
    FaUserFriends
} from 'react-icons/fa';
import {smsApi} from '../../../api/smsApi';
import {SmsStatus} from '../../../types/sms';

export const SmsDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Statystyki i saldo SMS
    const [stats] = useState({
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        deliveryRate: 0
    });
    const [balance, setBalance] = useState({
        balance: 0,
        usedThisMonth: 0,
        limit: 0
    });

    // Ostatnie wiadomości i zaplanowane
    const [recentMessages, setRecentMessages] = useState<any[]>([]);
    const [upcomingMessages] = useState<any[]>([]);

    // Pobieranie danych
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Pobieranie danych równolegle
                const [balanceData, recentMessagesData] = await Promise.all([
                    smsApi.fetchSmsBalance(),
                    smsApi.fetchMessages({ status: SmsStatus.SENT }, 0, 5),
                    smsApi.fetchMessages({ status: SmsStatus.SCHEDULED }, 0, 5)
                ]);

                setBalance(balanceData);
                setRecentMessages(recentMessagesData.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Nie udało się pobrać danych. Sprawdź połączenie z internetem i spróbuj ponownie.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Formatowanie daty
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Nawigacja do nowej wiadomości
    const handleNewMessage = () => {
        navigate('/sms/messages/new');
    };

    // Nawigacja do nowej kampanii
    const handleNewCampaign = () => {
        navigate('/sms/campaigns/new');
    };

    // Nawigacja do nowej automatyzacji
    const handleNewAutomation = () => {
        navigate('/sms/automations/new');
    };

    // Nawigacja do historii wiadomości
    const handleViewHistory = () => {
        navigate('/sms/messages');
    };

    // Widok ładowania
    if (isLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Ładowanie danych...</LoadingText>
            </LoadingContainer>
        );
    }

    // Widok błędu
    if (error) {
        return (
            <ErrorContainer>
                <ErrorIcon>
                    <FaExclamationTriangle />
                </ErrorIcon>
                <ErrorMessage>{error}</ErrorMessage>
                <ErrorButton onClick={() => window.location.reload()}>
                    Odśwież stronę
                </ErrorButton>
            </ErrorContainer>
        );
    }

    return (
        <DashboardContainer>
            {/* Sekcja statystyk i salda */}
            <StatsSectionContainer>
                <StatsSectionTitle>Statystyki SMS</StatsSectionTitle>
                <StatsCardsContainer>
                    <StatsCard>
                        <StatsIconContainer color="#3498db">
                            <FaEnvelope />
                        </StatsIconContainer>
                        <StatsContent>
                            <StatsValue>{stats.totalSent}</StatsValue>
                            <StatsLabel>Wysłanych w tym miesiącu</StatsLabel>
                        </StatsContent>
                    </StatsCard>

                    <StatsCard>
                        <StatsIconContainer color="#2ecc71">
                            <FaCheckCircle />
                        </StatsIconContainer>
                        <StatsContent>
                            <StatsValue>{stats.totalDelivered}</StatsValue>
                            <StatsLabel>Dostarczonych</StatsLabel>
                        </StatsContent>
                    </StatsCard>

                    <StatsCard>
                        <StatsIconContainer color="#e74c3c">
                            <FaExclamationTriangle />
                        </StatsIconContainer>
                        <StatsContent>
                            <StatsValue>{stats.totalFailed}</StatsValue>
                            <StatsLabel>Nieudanych</StatsLabel>
                        </StatsContent>
                    </StatsCard>

                    <StatsCard>
                        <StatsIconContainer color="#9b59b6">
                            <FaChartLine />
                        </StatsIconContainer>
                        <StatsContent>
                            <StatsValue>{stats.deliveryRate}%</StatsValue>
                            <StatsLabel>Współczynnik dostarczeń</StatsLabel>
                        </StatsContent>
                    </StatsCard>
                </StatsCardsContainer>

                <BalanceContainer>
                    <BalanceTitle>
                        <FaMoneyBillWave style={{ marginRight: '8px' }} />
                        Saldo SMS
                    </BalanceTitle>
                    <BalanceContent>
                        <BalanceItem>
                            <BalanceLabel>Dostępne</BalanceLabel>
                            <BalanceValue>{balance.balance}</BalanceValue>
                        </BalanceItem>
                        <BalanceDivider />
                        <BalanceItem>
                            <BalanceLabel>Wykorzystane w tym miesiącu</BalanceLabel>
                            <BalanceValue>{balance.usedThisMonth}</BalanceValue>
                        </BalanceItem>
                        <BalanceDivider />
                        <BalanceItem>
                            <BalanceLabel>Limit miesięczny</BalanceLabel>
                            <BalanceValue>{balance.limit}</BalanceValue>
                        </BalanceItem>
                    </BalanceContent>
                </BalanceContainer>
            </StatsSectionContainer>

            {/* Sekcja szybkich akcji */}
            <QuickActionsContainer>
                <SectionTitle>Szybkie akcje</SectionTitle>
                <QuickActionsGrid>
                    <QuickActionCard onClick={handleNewMessage}>
                        <QuickActionIcon>
                            <FaEnvelope />
                        </QuickActionIcon>
                        <QuickActionTitle>Wyślij wiadomość</QuickActionTitle>
                        <QuickActionDescription>
                            Wyślij pojedynczą wiadomość SMS do klienta
                        </QuickActionDescription>
                    </QuickActionCard>

                    <QuickActionCard onClick={handleNewCampaign}>
                        <QuickActionIcon>
                            <FaUserFriends />
                        </QuickActionIcon>
                        <QuickActionTitle>Utwórz kampanię</QuickActionTitle>
                        <QuickActionDescription>
                            Masowa wysyłka SMS do wielu odbiorców
                        </QuickActionDescription>
                    </QuickActionCard>

                    <QuickActionCard onClick={handleNewAutomation}>
                        <QuickActionIcon>
                            <FaRobot />
                        </QuickActionIcon>
                        <QuickActionTitle>Automatyzacja</QuickActionTitle>
                        <QuickActionDescription>
                            Automatyczne powiadomienia o wizytach i promocjach
                        </QuickActionDescription>
                    </QuickActionCard>

                    <QuickActionCard onClick={handleViewHistory}>
                        <QuickActionIcon>
                            <FaHistory />
                        </QuickActionIcon>
                        <QuickActionTitle>Historia SMS</QuickActionTitle>
                        <QuickActionDescription>
                            Przeglądaj wysłane i zaplanowane wiadomości
                        </QuickActionDescription>
                    </QuickActionCard>
                </QuickActionsGrid>
            </QuickActionsContainer>

            {/* Sekcja ostatnich i nadchodzących wiadomości */}
            <MessagesContainer>
                <MessagesColumn>
                    <SectionTitle>Ostatnie wiadomości</SectionTitle>
                    {recentMessages.length === 0 ? (
                        <EmptyState>
                            <EmptyStateText>Brak wysłanych wiadomości</EmptyStateText>
                        </EmptyState>
                    ) : (
                        <MessagesList>
                            {recentMessages.map(message => (
                                <MessageItem key={message.id}>
                                    <MessageHeader>
                                        <MessageRecipient>{message.recipientName}</MessageRecipient>
                                        <MessageStatus color="red">
                                            OK
                                        </MessageStatus>
                                    </MessageHeader>
                                    <MessageContent>{message.content}</MessageContent>
                                    <MessageFooter>
                                        <MessageTime>
                                            <FaClock style={{ marginRight: '4px' }} />
                                            {formatDate(message.sentDate || message.createdAt)}
                                        </MessageTime>
                                    </MessageFooter>
                                </MessageItem>
                            ))}
                        </MessagesList>
                    )}
                </MessagesColumn>

                <MessagesColumn>
                    <SectionTitle>Nadchodzące wiadomości</SectionTitle>
                    {upcomingMessages.length === 0 ? (
                        <EmptyState>
                            <EmptyStateText>Brak zaplanowanych wiadomości</EmptyStateText>
                        </EmptyState>
                    ) : (
                        <MessagesList>
                            {upcomingMessages.map(message => (
                                <MessageItem key={message.id}>
                                    <MessageHeader>
                                        <MessageRecipient>{message.recipientName}</MessageRecipient>
                                        <MessageTime>
                                            <FaCalendarAlt style={{ marginRight: '4px' }} />
                                            {formatDate(message.scheduledDate || message.createdAt)}
                                        </MessageTime>
                                    </MessageHeader>
                                    <MessageContent>{message.content}</MessageContent>
                                </MessageItem>
                            ))}
                        </MessagesList>
                    )}
                </MessagesColumn>
            </MessagesContainer>
        </DashboardContainer>
    );
};

// Styled components
const DashboardContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const StatsSectionContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const StatsSectionTitle = styled.h2`
    font-size: 18px;
    margin: 0;
    color: #2c3e50;
`;

const StatsCardsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
`;

const StatsCard = styled.div`
    display: flex;
    align-items: center;
    background-color: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #eee;
`;

const StatsIconContainer = styled.div<{ color: string }>`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${props => `${props.color}10`};
    color: ${props => props.color};
    font-size: 20px;
    margin-right: 16px;
`;

const StatsContent = styled.div`
    display: flex;
    flex-direction: column;
`;

const StatsValue = styled.div`
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
`;

const StatsLabel = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-top: 4px;
`;

const BalanceContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #eee;
`;

const BalanceTitle = styled.h3`
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #2c3e50;
    display: flex;
    align-items: center;
`;

const BalanceContent = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
`;

const BalanceItem = styled.div`
    flex: 1;
    min-width: 150px;
    text-align: center;
    padding: 0 16px;
`;

const BalanceLabel = styled.div`
    font-size: 13px;
    color: #7f8c8d;
    margin-bottom: 8px;
`;

const BalanceValue = styled.div`
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
`;

const BalanceDivider = styled.div`
    width: 1px;
    height: 40px;
    background-color: #eee;
`;

const SectionTitle = styled.h2`
    font-size: 18px;
    margin: 0 0 16px 0;
    color: #2c3e50;
`;

const QuickActionsContainer = styled.div``;

const QuickActionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
`;

const QuickActionCard = styled.div`
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #eee;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border-color: #3498db;
    }
`;

const QuickActionIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e8f4fd;
    color: #3498db;
    font-size: 20px;
    margin-bottom: 12px;
`;

const QuickActionTitle = styled.h3`
    font-size: 16px;
    margin: 0 0 8px 0;
    color: #2c3e50;
`;

const QuickActionDescription = styled.p`
    font-size: 13px;
    color: #7f8c8d;
    margin: 0;
    line-height: 1.4;
`;

const MessagesContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
`;

const MessagesColumn = styled.div``;

const MessagesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const MessageItem = styled.div`
    background-color: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #eee;
`;

const MessageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
`;

const MessageRecipient = styled.div`
    font-weight: 500;
    color: #2c3e50;
`;

const MessageStatus = styled.div<{ color: string }>`
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 12px;
    background-color: ${props => `${props.color}20`};
    color: ${props => props.color};
`;

const MessageContent = styled.div`
    font-size: 14px;
    color: #34495e;
    margin-bottom: 12px;
    line-height: 1.4;
`;

const MessageFooter = styled.div`
    display: flex;
    justify-content: flex-end;
`;

const MessageTime = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    display: flex;
    align-items: center;
`;

const EmptyState = styled.div`
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 24px;
    text-align: center;
    border: 1px dashed #dee2e6;
`;

const EmptyStateText = styled.p`
    color: #6c757d;
    margin: 0;
`;

// Komponenty dla stanu ładowania
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
`;

const LoadingSpinner = styled.div`
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    color: #7f8c8d;
    font-size: 16px;
`;

// Komponenty dla stanu błędu
const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    background-color: #fff9fa;
    border-radius: 8px;
    border: 1px solid #ffdbdb;
`;

const ErrorIcon = styled.div`
    font-size: 40px;
    color: #e74c3c;
    margin-bottom: 16px;
`;

const ErrorMessage = styled.p`
    color: #2c3e50;
    text-align: center;
    margin-bottom: 24px;
    font-size: 16px;
    max-width: 500px;
`;

const ErrorButton = styled.button`
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    font-weight: 500;
    cursor: pointer;
    
    &:hover {
        background-color: #2980b9;
    }
`;
