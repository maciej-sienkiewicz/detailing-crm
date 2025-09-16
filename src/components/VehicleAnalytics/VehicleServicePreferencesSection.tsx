import React from 'react';
import styled from 'styled-components';
import { FaTools, FaTrophy, FaChartBar, FaCheckCircle } from 'react-icons/fa';
import { ServicePreferencesDto } from '../../api/vehicleAnalyticsApi';
import { theme } from '../../styles/theme';

interface VehicleServicePreferencesSectionProps {
    data: ServicePreferencesDto;
}

const VehicleServicePreferencesSection: React.FC<VehicleServicePreferencesSectionProps> = ({ data }) => {
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
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

    const getRankBadge = (index: number) => {
        if (index === 0) {
            return (
                <RankBadge $rank="first">
                    <FaTrophy />
                    <span>TOP</span>
                </RankBadge>
            );
        }
        return (
            <RankNumber $rank={index + 1}>
                {index + 1}
            </RankNumber>
        );
    };

    const getServiceUsagePercentage = (usageCount: number, maxUsage: number) => {
        return maxUsage > 0 ? (usageCount / maxUsage) * 100 : 0;
    };

    if (!data.topServices || data.topServices.length === 0) {
        return (
            <Section>
                <SectionTitle>
                    <TitleIcon>
                        <FaTools />
                    </TitleIcon>
                    <TitleText>Preferencje usługowe</TitleText>
                </SectionTitle>
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

    return (
        <Section>
            <SectionTitle>
                <TitleIcon>
                    <FaTools />
                </TitleIcon>
                <TitleText>Preferencje usługowe</TitleText>
                <ServiceCount>{data.topServices.length} usług</ServiceCount>
            </SectionTitle>

            <PreferencesContent>
                {/* Top Service Highlight */}
                <TopServiceCard>
                    <TopServiceHeader>
                        <TopServiceIcon>
                            <FaTrophy />
                        </TopServiceIcon>
                        <TopServiceInfo>
                            <TopServiceName>{topService.serviceName}</TopServiceName>
                            <TopServiceLabel>Najczęściej wybierana usługa</TopServiceLabel>
                        </TopServiceInfo>
                        <TopServiceBadge>
                            <FaCheckCircle />
                            Preferowana
                        </TopServiceBadge>
                    </TopServiceHeader>

                    <TopServiceMetrics>
                        <MetricItem>
                            <MetricValue>{topService.usageCount}</MetricValue>
                            <MetricLabel>Wykonań</MetricLabel>
                        </MetricItem>
                        <MetricDivider />
                        <MetricItem>
                            <MetricValue>{formatCurrency(topService.totalRevenue)}</MetricValue>
                            <MetricLabel>Łączny przychód</MetricLabel>
                        </MetricItem>
                        <MetricDivider />
                        <MetricItem>
                            <MetricValue>{formatCurrency(topService.averagePrice)}</MetricValue>
                            <MetricLabel>Średnia cena</MetricLabel>
                        </MetricItem>
                        {topService.lastUsedDate && (
                            <>
                                <MetricDivider />
                                <MetricItem>
                                    <MetricValue>{formatDate(topService.lastUsedDate)}</MetricValue>
                                    <MetricLabel>Ostatnie użycie</MetricLabel>
                                </MetricItem>
                            </>
                        )}
                    </TopServiceMetrics>
                </TopServiceCard>

                {/* Services List */}
                <ServicesHeader>
                    <ServicesTitle>Wszystkie usługi</ServicesTitle>
                    <ServicesSubtitle>Ranking według częstotliwości użycia</ServicesSubtitle>
                </ServicesHeader>

                <ServicesList>
                    {data.topServices.map((service, index) => (
                        <ServiceItem key={service.serviceId || index} $isTop={index === 0}>
                            <ServiceRank>
                                {getRankBadge(index)}
                            </ServiceRank>

                            <ServiceMainInfo>
                                <ServiceName>{service.serviceName}</ServiceName>
                                <ServiceMetrics>
                                    <ServiceMetric>
                                        <MetricNumber>{service.usageCount}</MetricNumber>
                                        <MetricText>wykonań</MetricText>
                                    </ServiceMetric>
                                    <ServiceMetric>
                                        <MetricNumber>{formatCurrency(service.totalRevenue)}</MetricNumber>
                                        <MetricText>przychód</MetricText>
                                    </ServiceMetric>
                                    <ServiceMetric>
                                        <MetricNumber>{formatDate(service.lastUsedDate)}</MetricNumber>
                                        <MetricText>ostatnio</MetricText>
                                    </ServiceMetric>
                                </ServiceMetrics>
                            </ServiceMainInfo>

                            <ServiceVisualization>
                                <UsageBar>
                                    <UsageProgress
                                        $percentage={getServiceUsagePercentage(service.usageCount, maxUsage)}
                                        $isTop={index === 0}
                                    />
                                </UsageBar>
                                <UsagePercentage>
                                    {Math.round(getServiceUsagePercentage(service.usageCount, maxUsage))}%
                                </UsagePercentage>
                            </ServiceVisualization>
                        </ServiceItem>
                    ))}
                </ServicesList>
            </PreferencesContent>
        </Section>
    );
};

// Styled Components
const Section = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    padding: ${theme.spacing.xl};
    box-shadow: ${theme.shadow.sm};
    border: 1px solid ${theme.border};
`;

const SectionTitle = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${theme.spacing.xl};
    padding-bottom: ${theme.spacing.lg};
    border-bottom: 2px solid ${theme.primaryGhost};
`;

const TitleIcon = styled.div`
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.primary};
    font-size: 18px;
`;

const TitleText = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
    flex: 1;
    margin-left: ${theme.spacing.md};
`;

const ServiceCount = styled.div`
    font-size: 12px;
    color: ${theme.text.secondary};
    background: ${theme.surfaceAlt};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border-radius: ${theme.radius.sm};
    border: 1px solid ${theme.border};
`;

const PreferencesContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
`;

const TopServiceCard = styled.div`
    background: linear-gradient(135deg, ${theme.primary}06 0%, ${theme.primary}02 100%);
    border: 1px solid ${theme.primary}20;
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.xl};
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
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
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

const TopServiceLabel = styled.div`
    font-size: 12px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const TopServiceBadge = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    background: ${theme.success}15;
    color: ${theme.success};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.radius.md};
    font-size: 12px;
    font-weight: 600;
    border: 1px solid ${theme.success}30;

    svg {
        font-size: 10px;
    }
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

const MetricValue = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${theme.primary};
    margin-bottom: ${theme.spacing.xs};
`;

const MetricLabel = styled.div`
    font-size: 11px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: center;
`;

const MetricDivider = styled.div`
    width: 1px;
    height: 32px;
    background: ${theme.border};
`;

const ServicesHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const ServicesTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

const ServicesSubtitle = styled.div`
    font-size: 12px;
    color: ${theme.text.secondary};
`;

const ServicesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
`;

const ServiceItem = styled.div<{ $isTop: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
    background: ${props => props.$isTop ? theme.primaryGhost : theme.surfaceAlt};
    border: 1px solid ${props => props.$isTop ? theme.primary + '20' : theme.border};
    border-radius: ${theme.radius.md};
    transition: all ${theme.transitions.normal};

    &:hover {
        background: ${theme.primaryGhost};
        border-color: ${theme.primary}30;
        transform: translateX(2px);
        box-shadow: ${theme.shadow.sm};
    }
`;

const ServiceRank = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    flex-shrink: 0;
`;

const RankBadge = styled.div<{ $rank: string }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    color: ${theme.warning};

    svg {
        font-size: 16px;
    }

    span {
        font-size: 8px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
`;

const RankNumber = styled.div<{ $rank: number }>`
    width: 32px;
    height: 32px;
    background: ${theme.text.muted}20;
    color: ${theme.text.secondary};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    border: 2px solid ${theme.border};
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
    width: 80px;
    flex-shrink: 0;
`;

const UsageBar = styled.div`
    width: 100%;
    height: 8px;
    background: ${theme.borderLight};
    border-radius: 4px;
    overflow: hidden;
`;

const UsageProgress = styled.div<{ $percentage: number; $isTop: boolean }>`
    height: 100%;
    width: ${props => props.$percentage}%;
    background: linear-gradient(90deg, 
        ${props => props.$isTop ? theme.primary : theme.info} 0%, 
        ${props => props.$isTop ? theme.primaryLight : theme.info} 100%
    );
    border-radius: 4px;
    transition: width ${theme.transitions.normal};
`;

const UsagePercentage = styled.div`
    font-size: 10px;
    font-weight: 600;
    color: ${theme.text.secondary};
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xl};
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${theme.surface};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: ${theme.text.tertiary};
    box-shadow: ${theme.shadow.xs};
    margin-bottom: ${theme.spacing.md};
`;

const EmptyText = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.secondary};
    margin-bottom: ${theme.spacing.xs};
`;

const EmptySubtext = styled.div`
    font-size: 14px;
    color: ${theme.text.muted};
    font-style: italic;
`;

export default VehicleServicePreferencesSection;