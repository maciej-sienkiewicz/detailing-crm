// src/components/VehicleAnalytics/VehicleTopServicesSection.tsx - W stylu ClientTopServices
import React from 'react';
import styled from 'styled-components';
import { FaTools, FaTrophy, FaChartBar, FaCalendarAlt } from 'react-icons/fa';
import { ServicePreferencesDto } from '../../api/vehicleAnalyticsApi';
import { theme } from '../../styles/theme';

interface VehicleTopServicesSectionProps {
    data: ServicePreferencesDto;
}

const VehicleTopServicesSection: React.FC<VehicleTopServicesSectionProps> = ({ data }) => {
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatNumber = (value: number): string => {
        return new Intl.NumberFormat('pl-PL').format(value);
    };

    const formatDate = (dateArray?: number[]): string => {
        if (!dateArray || dateArray.length < 3) return 'Brak danych';

        // Array format: [year, month, day, hour, minute, second]
        const [year, month, day] = dateArray;
        const date = new Date(year, month - 1, day); // month is 0-indexed in JS Date

        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const getRelativeTimeString = (dateArray?: number[]): string => {
        if (!dateArray) return 'Nieznane';

        try {
            let date: Date;

            if (Array.isArray(dateArray) && dateArray.length >= 3) {
                const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
                date = new Date(year, month - 1, day, hour, minute, second);
            } else {
                return 'Nieznany format';
            }

            if (isNaN(date.getTime())) {
                return 'Nieprawidłowa data';
            }

            const now = new Date();
            const diffInMs = now.getTime() - date.getTime();
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

            if (diffInDays === 0) return 'Dzisiaj';
            if (diffInDays === 1) return 'Wczoraj';
            if (diffInDays < 7) return `${diffInDays} dni temu`;
            if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tyg. temu`;
            if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} mies. temu`;

            return `${Math.floor(diffInDays / 365)} lat temu`;
        } catch (error) {
            console.error('Error calculating relative time:', dateArray, error);
            return 'Błąd obliczania';
        }
    };

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
        const maxUsage = Math.max(...data.topServices.map(s => s.usageCount));
        return maxUsage > 0 ? (usageCount / maxUsage) * 100 : 0;
    };

    const getRevenuePercentage = (revenue: number): number => {
        const totalRevenue = data.topServices.reduce((sum, s) => sum + s.totalRevenue, 0);
        return totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
    };

    if (!data.topServices || data.topServices.length === 0) {
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
                    <EmptySubtext>Ten pojazd nie ma jeszcze historii usług</EmptySubtext>
                </EmptyState>
            </Section>
        );
    }

    const topService = data.topServices[0];
    const maxUsage = Math.max(...data.topServices.map(s => s.usageCount));
    const totalRevenue = data.topServices.reduce((sum, s) => sum + s.totalRevenue, 0);

    return (
        <Section>
            <SectionHeader>
                <SectionTitle>
                    <TitleIcon>
                        <FaTools />
                    </TitleIcon>
                    <TitleText>Ulubione usługi</TitleText>
                    <ServiceCount>{data.topServices.length} usług</ServiceCount>
                </SectionTitle>
                <SectionSubtitle>
                    Ranking najczęściej wybieranych usług
                </SectionSubtitle>
            </SectionHeader>

            {/* Top service highlight - identyczny jak w ClientTopServices */}
            <TopServiceCard>
                <TopServiceHeader>
                    <TopServiceIcon>
                        <FaTrophy />
                    </TopServiceIcon>
                    <TopServiceInfo>
                        <TopServiceName>{topService.serviceName}</TopServiceName>
                        <TopServiceStats>
                            {formatNumber(topService.usageCount)} wykonań • {formatCurrency(topService.totalRevenue)} przychodu
                        </TopServiceStats>
                    </TopServiceInfo>
                    <TopServiceBadge>
                        #1 WYBÓR
                    </TopServiceBadge>
                </TopServiceHeader>

                <TopServiceMetrics>
                    <MetricItem>
                        <MetricLabel>Wykonania</MetricLabel>
                        <MetricValue>{formatNumber(topService.usageCount)}</MetricValue>
                    </MetricItem>
                    <MetricDivider />
                    <MetricItem>
                        <MetricLabel>Łączny przychód</MetricLabel>
                        <MetricValue>{formatCurrency(topService.totalRevenue)}</MetricValue>
                    </MetricItem>
                    <MetricDivider />
                    <MetricItem>
                        <MetricLabel>Średnia cena</MetricLabel>
                        <MetricValue>{formatCurrency(topService.averagePrice)}</MetricValue>
                    </MetricItem>
                    {topService.lastUsedDate && (
                        <>
                            <MetricDivider />
                            <MetricItem>
                                <MetricLabel>Ostatnie użycie</MetricLabel>
                                <MetricValue>{getRelativeTimeString(topService.lastUsedDate)}</MetricValue>
                            </MetricItem>
                        </>
                    )}
                </TopServiceMetrics>
            </TopServiceCard>

            {/* Services list - identyczny jak w ClientTopServices */}
            <ServicesHeader>
                <ServicesTitle>Wszystkie usługi</ServicesTitle>
                <ServicesSubtitle>Posortowane według częstotliwości użycia</ServicesSubtitle>
            </ServicesHeader>

            <ServicesList>
                {data.topServices.map((service, index) => (
                    <ServiceItem key={service.serviceId || index} $isTop={index === 0}>
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

            {/* Summary statistics - identyczny jak w ClientTopServices */}
            <ServicesSummary>
                <SummaryTitle>Podsumowanie</SummaryTitle>
                <SummaryStats>
                    <SummaryStatItem>
                        <SummaryStatLabel>Łączny przychód</SummaryStatLabel>
                        <SummaryStatValue>{formatCurrency(totalRevenue)}</SummaryStatValue>
                    </SummaryStatItem>
                    <SummaryStatItem>
                        <SummaryStatLabel>Łączne wykonania</SummaryStatLabel>
                        <SummaryStatValue>{formatNumber(data.topServices.reduce((sum, s) => sum + s.usageCount, 0))}</SummaryStatValue>
                    </SummaryStatItem>
                    <SummaryStatItem>
                        <SummaryStatLabel>Średnia cena</SummaryStatLabel>
                        <SummaryStatValue>
                            {formatCurrency(totalRevenue / data.topServices.reduce((sum, s) => sum + s.usageCount, 0))}
                        </SummaryStatValue>
                    </SummaryStatItem>
                    <SummaryStatItem>
                        <SummaryStatLabel>Najdroższa usługa</SummaryStatLabel>
                        <SummaryStatValue>
                            {formatCurrency(Math.max(...data.topServices.map(s => s.averagePrice)))}
                        </SummaryStatValue>
                    </SummaryStatItem>
                </SummaryStats>
            </ServicesSummary>
        </Section>
    );
};

// ========================================================================================
// STYLED COMPONENTS - Identyczne jak w ClientTopServices
// ========================================================================================

const Section = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    padding: ${theme.spacing.xl};
    box-shadow: ${theme.shadow.sm};
    border: 1px solid ${theme.border};
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

const ServicesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.xl};
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

export default VehicleTopServicesSection;