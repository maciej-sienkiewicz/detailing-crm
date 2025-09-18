// src/components/ClientAnalytics/ClientTopServices.tsx
import React from 'react';
import styled from 'styled-components';
import { FaTools, FaTrophy, FaChartBar, FaCalendarAlt } from 'react-icons/fa';
import { ServiceUsageResponse } from '../../api/clientAnalyticsApi';
import { theme } from '../../styles/theme';
import { formatCurrency, formatNumber, getRelativeTimeString } from '../../utils/clientAnalyticsUtils';

interface ClientTopServicesProps {
    data: ServiceUsageResponse[];
}

const ClientTopServices: React.FC<ClientTopServicesProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <Section>
                <SectionHeader>
                    <SectionTitle>
                        <TitleIcon>
                            <FaTools />
                        </TitleIcon>
                        <TitleText>Ulubione usługi</TitleText>
                    </SectionTitle>
                </SectionHeader>

                <EmptyState>
                    <EmptyIcon>
                        <FaTools />
                    </EmptyIcon>
                    <EmptyText>Brak danych o usługach</EmptyText>
                    <EmptySubtext>
                        Klient nie ma jeszcze historii korzystania z usług
                    </EmptySubtext>
                </EmptyState>
            </Section>
        );
    }

    const maxUsage = Math.max(...data.map(service => service.usageCount));
    const totalRevenue = data.reduce((sum, service) => sum + service.totalRevenue, 0);

    const getRankIcon = (index: number) => {
        if (index === 0) return <FaTrophy style={{ color: '#fbbf24' }} />;
        if (index === 1) return <FaTrophy style={{ color: '#94a3b8' }} />;
        if (index === 2) return <FaTrophy style={{ color: '#cd7c2f' }} />;
        return <FaChartBar />;
    };

    const getRankColor = (index: number) => {
        if (index === 0) return theme.warning;
        if (index === 1) return '#94a3b8';
        if (index === 2) return '#cd7c2f';
        return theme.primary;
    };

    const getUsagePercentage = (usageCount: number): number => {
        return maxUsage > 0 ? (usageCount / maxUsage) * 100 : 0;
    };

    const getRevenuePercentage = (revenue: number): number => {
        return totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
    };

    return (
        <Section>
            <SectionHeader>
                <SectionTitle>
                    <TitleIcon>
                        <FaTools />
                    </TitleIcon>
                    <TitleText>Ulubione usługi</TitleText>
                    <ServiceCount>{data.length} usług</ServiceCount>
                </SectionTitle>
                <SectionSubtitle>
                    Ranking najczęściej wybieranych usług
                </SectionSubtitle>
            </SectionHeader>

            {/* Top service highlight */}
            {data.length > 0 && (
                <TopServiceCard>
                    <TopServiceHeader>
                        <TopServiceIcon>
                            <FaTrophy />
                        </TopServiceIcon>
                        <TopServiceInfo>
                            <TopServiceName>{data[0].serviceName}</TopServiceName>
                            <TopServiceStats>
                                {formatNumber(data[0].usageCount)} wykonań • {formatCurrency(data[0].totalRevenue)} przychodu
                            </TopServiceStats>
                        </TopServiceInfo>
                        <TopServiceBadge>
                            #1 WYBÓR
                        </TopServiceBadge>
                    </TopServiceHeader>

                    <TopServiceMetrics>
                        <MetricItem>
                            <MetricLabel>Średnia cena</MetricLabel>
                            <MetricValue>{formatCurrency(data[0].averagePrice)}</MetricValue>
                        </MetricItem>
                        <MetricDivider />
                        <MetricItem>
                            <MetricLabel>Ostatnie użycie</MetricLabel>
                            <MetricValue>
                                {data[0].lastUsedDate ? getRelativeTimeString(data[0].lastUsedDate) : 'Nieznane'}
                            </MetricValue>
                        </MetricItem>
                        <MetricDivider />
                        <MetricItem>
                            <MetricLabel>Udział w przychodach</MetricLabel>
                            <MetricValue>{getRevenuePercentage(data[0].totalRevenue).toFixed(1)}%</MetricValue>
                        </MetricItem>
                    </TopServiceMetrics>
                </TopServiceCard>
            )}

            {/* Services list */}
            <ServicesList>
                <ServicesHeader>
                    <ServicesTitle>Wszystkie usługi</ServicesTitle>
                    <ServicesSubtitle>Posortowane według częstotliwości użycia</ServicesSubtitle>
                </ServicesHeader>

                {data.map((service, index) => (
                    <ServiceItem key={service.serviceId} $isTop={index === 0}>
                        <ServiceRank>
                            <RankPosition $rank={index + 1}>
                                {index + 1}
                            </RankPosition>
                            <RankIcon>
                                {getRankIcon(index)}
                            </RankIcon>
                        </ServiceRank>

                        <ServiceMainInfo>
                            <ServiceName>{service.serviceName}</ServiceName>
                            <ServiceMetrics>
                                <ServiceMetric>
                                    <MetricNumber>{formatNumber(service.usageCount)}</MetricNumber>
                                    <MetricText>wykonań</MetricText>
                                </ServiceMetric>
                                <ServiceMetric>
                                    <MetricNumber>{formatCurrency(service.totalRevenue)}</MetricNumber>
                                    <MetricText>przychód</MetricText>
                                </ServiceMetric>
                                <ServiceMetric>
                                    <MetricNumber>{formatCurrency(service.averagePrice)}</MetricNumber>
                                    <MetricText>śr. cena</MetricText>
                                </ServiceMetric>
                                {service.lastUsedDate && (
                                    <ServiceMetric>
                                        <MetricNumber>
                                            {getRelativeTimeString(service.lastUsedDate)}
                                        </MetricNumber>
                                        <MetricText>ostatnio</MetricText>
                                    </ServiceMetric>
                                )}
                            </ServiceMetrics>
                        </ServiceMainInfo>

                        <ServiceVisualization>
                            <UsageBar>
                                <UsageBarLabel>Popularność</UsageBarLabel>
                                <UsageProgress
                                    $percentage={getUsagePercentage(service.usageCount)}
                                    $color={getRankColor(index)}
                                />
                            </UsageBar>
                            <RevenueShare>
                                {getRevenuePercentage(service.totalRevenue).toFixed(1)}%
                            </RevenueShare>
                        </ServiceVisualization>
                    </ServiceItem>
                ))}
            </ServicesList>

            {/* Summary statistics */}
            <ServicesSummary>
                <SummaryTitle>Podsumowanie</SummaryTitle>
                <SummaryStats>
                    <SummaryStatItem>
                        <SummaryStatLabel>Łączny przychód</SummaryStatLabel>
                        <SummaryStatValue>{formatCurrency(totalRevenue)}</SummaryStatValue>
                    </SummaryStatItem>
                    <SummaryStatItem>
                        <SummaryStatLabel>Łączne wykonania</SummaryStatLabel>
                        <SummaryStatValue>{formatNumber(data.reduce((sum, s) => sum + s.usageCount, 0))}</SummaryStatValue>
                    </SummaryStatItem>
                    <SummaryStatItem>
                        <SummaryStatLabel>Średnia cena</SummaryStatLabel>
                        <SummaryStatValue>
                            {formatCurrency(totalRevenue / data.reduce((sum, s) => sum + s.usageCount, 0))}
                        </SummaryStatValue>
                    </SummaryStatItem>
                    <SummaryStatItem>
                        <SummaryStatLabel>Najdroższa usługa</SummaryStatLabel>
                        <SummaryStatValue>
                            {formatCurrency(Math.max(...data.map(s => s.averagePrice)))}
                        </SummaryStatValue>
                    </SummaryStatItem>
                </SummaryStats>
            </ServicesSummary>
        </Section>
    );
};

// ========================================================================================
// STYLED COMPONENTS
// ========================================================================================

const Section = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    padding: ${theme.spacing.xl};
    box-shadow: ${theme.shadow.sm};
    border: 1px solid ${theme.border};
    height: fit-content;
`;

const SectionHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing.md};
`;

const TitleIcon = styled.div`
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.primary};
    font-size: 16px;
`;

const TitleText = styled.h3`
    font-size: 18px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0;
    flex: 1;
`;

const ServiceCount = styled.div`
    font-size: 11px;
    color: ${theme.text.secondary};
    background: ${theme.surfaceAlt};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border-radius: ${theme.radius.sm};
    border: 1px solid ${theme.border};
    font-weight: 500;
`;

const SectionSubtitle = styled.div`
    font-size: 13px;
    color: ${theme.text.secondary};
    margin-left: 44px;
`;

const TopServiceCard = styled.div`
    background: linear-gradient(135deg, ${theme.warning}08 0%, ${theme.warning}04 100%);
    border: 1px solid ${theme.warning}30;
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.xl};
    margin-bottom: ${theme.spacing.xl};
`;

const TopServiceHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.lg};
`;

const TopServiceIcon = styled.div`
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, ${theme.warning} 0%, #fbbf24 100%);
    border-radius: ${theme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: ${theme.shadow.sm};
`;

const TopServiceInfo = styled.div`
    flex: 1;
`;

const TopServiceName = styled.div`
    font-size: 18px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
`;

const TopServiceStats = styled.div`
    font-size: 13px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const TopServiceBadge = styled.div`
    background: ${theme.warning};
    color: white;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.radius.md};
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    box-shadow: ${theme.shadow.sm};
`;

const TopServiceMetrics = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    flex-wrap: wrap;
`;

const MetricItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 80px;
`;

const MetricLabel = styled.div`
    font-size: 11px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
    text-align: center;
`;

const MetricValue = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
    text-align: center;
`;

const MetricDivider = styled.div`
    width: 1px;
    height: 32px;
    background: ${theme.border};
`;

const ServicesList = styled.div`
    margin-bottom: ${theme.spacing.xl};
`;

const ServicesHeader = styled.div`
    margin-bottom: ${theme.spacing.lg};
`;

const ServicesTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.xs} 0;
`;

const ServicesSubtitle = styled.div`
    font-size: 12px;
    color: ${theme.text.secondary};
`;

const ServiceItem = styled.div<{ $isTop: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
    background: ${props => props.$isTop ? theme.warning + '08' : theme.surfaceAlt};
    border: 1px solid ${props => props.$isTop ? theme.warning + '30' : theme.border};
    border-radius: ${theme.radius.md};
    margin-bottom: ${theme.spacing.sm};
    transition: all ${theme.transitions.normal};

    &:hover {
        background: ${theme.primaryGhost};
        border-color: ${theme.primary}30;
        transform: translateX(2px);
        box-shadow: ${theme.shadow.sm};
    }

    &:last-child {
        margin-bottom: 0;
    }
`;

const ServiceRank = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.xs};
    width: 48px;
    flex-shrink: 0;
`;

const RankPosition = styled.div<{ $rank: number }>`
    width: 24px;
    height: 24px;
    background: ${theme.text.muted}20;
    color: ${theme.text.secondary};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    border: 2px solid ${theme.border};
`;

const RankIcon = styled.div`
    font-size: 14px;
    height: 16px;
    display: flex;
    align-items: center;
`;

const ServiceMainInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const ServiceName = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.sm};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ServiceMetrics = styled.div`
    display: flex;
    gap: ${theme.spacing.lg};
    flex-wrap: wrap;
`;

const ServiceMetric = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const MetricNumber = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const MetricText = styled.div`
    font-size: 10px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.3px;
`;

const ServiceVisualization = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: ${theme.spacing.xs};
    width: 100px;
    flex-shrink: 0;
`;

const UsageBar = styled.div`
    width: 100%;
`;

const UsageBarLabel = styled.div`
    font-size: 10px;
    color: ${theme.text.muted};
    text-align: right;
    margin-bottom: 4px;
`;

const UsageProgress = styled.div<{ $percentage: number; $color: string }>`
    width: 100%;
    height: 6px;
    background: ${theme.borderLight};
    border-radius: 3px;
    overflow: hidden;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: ${props => props.$percentage}%;
        background: linear-gradient(90deg, ${props => props.$color} 0%, ${props => props.$color}CC 100%);
        border-radius: 3px;
        transition: width ${theme.transitions.normal};
    }
`;

const RevenueShare = styled.div`
    font-size: 11px;
    font-weight: 600;
    color: ${theme.text.secondary};
`;

const ServicesSummary = styled.div`
    background: ${theme.primaryGhost};
    border: 1px solid ${theme.primary}20;
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
`;

const SummaryTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.md};
`;

const SummaryStats = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.md};

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const SummaryStatItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const SummaryStatLabel = styled.div`
    font-size: 12px;
    color: ${theme.text.secondary};
`;

const SummaryStatValue = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xl};
    text-align: center;
    gap: ${theme.spacing.md};
`;

const EmptyIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${theme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: ${theme.text.tertiary};
`;

const EmptyText = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.secondary};
`;

const EmptySubtext = styled.div`
    font-size: 13px;
    color: ${theme.text.muted};
    max-width: 300px;
    line-height: 1.4;
`;

export default ClientTopServices;