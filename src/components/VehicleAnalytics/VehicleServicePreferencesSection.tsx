import React from 'react';
import styled from 'styled-components';
import { FaTools, FaTrophy, FaChartBar } from 'react-icons/fa';
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

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0:
                return <RankIcon $rank="gold">🥇</RankIcon>;
            case 1:
                return <RankIcon $rank="silver">🥈</RankIcon>;
            case 2:
                return <RankIcon $rank="bronze">🥉</RankIcon>;
            default:
                return <RankNumber>{index + 1}</RankNumber>;
        }
    };

    if (!data.top_services || data.top_services.length === 0) {
        return (
            <Section>
                <SectionTitle>
                    <FaTools />
                    Preferencje usługowe
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

    const topService = data.top_services[0];

    return (
        <Section>
            <SectionTitle>
                <FaTools />
                Preferencje usługowe
            </SectionTitle>

            <PreferencesContent>
                <TopServiceHighlight>
                    <TopServiceIcon>
                        <FaTrophy />
                    </TopServiceIcon>
                    <TopServiceInfo>
                        <TopServiceName>{topService.service_name}</TopServiceName>
                        <TopServiceStats>
                            <StatItem>
                                <StatValue>{topService.usage_count}</StatValue>
                                <StatLabel>razy</StatLabel>
                            </StatItem>
                            <StatDivider>•</StatDivider>
                            <StatItem>
                                <StatValue>{formatCurrency(topService.total_revenue)}</StatValue>
                                <StatLabel>łącznie</StatLabel>
                            </StatItem>
                        </TopServiceStats>
                        <TopServiceLabel>Najczęściej wybierana usługa</TopServiceLabel>
                    </TopServiceInfo>
                </TopServiceHighlight>

                <ServicesList>
                    {data.top_services.slice(0, 5).map((service, index) => (
                        <ServiceItem key={service.service_id} $isTop={index === 0}>
                            <ServiceRank>
                                {getRankIcon(index)}
                            </ServiceRank>
                            <ServiceInfo>
                                <ServiceName>{service.service_name}</ServiceName>
                                <ServiceDetails>
                                    <ServiceUsage>{service.usage_count} wizyt</ServiceUsage>
                                    <ServiceRevenue>{formatCurrency(service.total_revenue)}</ServiceRevenue>
                                </ServiceDetails>
                            </ServiceInfo>
                            <ServiceChart>
                                <ProgressBar
                                    $percentage={(service.usage_count / topService.usage_count) * 100}
                                    $isTop={index === 0}
                                />
                            </ServiceChart>
                        </ServiceItem>
                    ))}
                </ServicesList>
            </PreferencesContent>
        </Section>
    );
};
// Styled components...
const Section = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    padding: ${theme.spacing.xl};
    box-shadow: ${theme.shadow.sm};
    border: 1px solid ${theme.border};
`;

const SectionTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.lg} 0;
    padding-bottom: ${theme.spacing.md};
    border-bottom: 2px solid ${theme.primaryGhost};

    svg {
        color: ${theme.primary};
        font-size: 16px;
    }
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const MetricCard = styled.div`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    transition: all ${theme.transitions.normal};

    &:hover {
        background: ${theme.primaryGhost};
        border-color: ${theme.primary}30;
        transform: translateY(-2px);
        box-shadow: ${theme.shadow.md};
    }
`;

const MetricIcon = styled.div<{ $color: string }>`
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
    border-radius: ${theme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: ${theme.shadow.xs};
`;

const MetricContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const MetricValue = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
    line-height: 1.2;
`;

const MetricLabel = styled.div`
    font-size: 12px;
    color: ${theme.text.tertiary};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const TrendCard = styled.div`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    grid-column: 1 / -1;

    @media (max-width: 768px) {
        grid-column: auto;
    }
`;

const TrendIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: ${theme.shadow.xs};
`;

const TrendContent = styled.div`
    flex: 1;
`;

const TrendValue = styled.div<{ $color: string }>`
    font-size: 18px;
    font-weight: 700;
    color: ${props => props.$color};
    margin-bottom: ${theme.spacing.xs};
    line-height: 1.2;
`;

const TrendLabel = styled.div`
    font-size: 12px;
    color: ${theme.text.tertiary};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const ProfitabilityCard = styled.div`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    grid-column: 1 / -1;

    @media (max-width: 768px) {
        grid-column: auto;
    }
`;

const ProfitabilityScore = styled.div<{ $color: string }>`
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, ${props => props.$color}20 0%, ${props => props.$color}10 100%);
    border: 2px solid ${props => props.$color};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    color: ${props => props.$color};
    flex-shrink: 0;
`;

const ProfitabilityContent = styled.div`
    flex: 1;
`;

const ProfitabilityLabel = styled.div`
    font-size: 12px;
    color: ${theme.text.tertiary};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: ${theme.spacing.xs};
`;

const StarContainer = styled.div`
    display: flex;
    gap: 2px;
`;

const Star = styled.span<{ filled?: boolean }>`
    font-size: 14px;
    opacity: ${props => props.filled ? 1 : 0.3};
`;

// Visit Pattern Components
const PatternGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const PatternCard = styled.div`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
`;

const PatternIcon = styled.div<{ $color: string }>`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
    border-radius: ${theme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 16px;
    flex-shrink: 0;
`;

const PatternContent = styled.div`
    flex: 1;
`;

const PatternValue = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
`;

const PatternLabel = styled.div`
    font-size: 11px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const StatusCard = styled.div<{ $riskLevel: string }>`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    grid-column: 1 / -1;
`;

const StatusIcon = styled.div<{ $color: string }>`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
    border-radius: ${theme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 16px;
    flex-shrink: 0;
`;

const StatusContent = styled.div`
    flex: 1;
`;

const StatusValue = styled.div<{ $color: string }>`
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.$color};
    margin-bottom: ${theme.spacing.xs};
`;

const StatusLabel = styled.div`
    font-size: 11px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const NextVisitCard = styled.div`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    grid-column: 1 / -1;
`;

const NextVisitIcon = styled.div<{ $color: string }>`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
    border-radius: ${theme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 16px;
    flex-shrink: 0;
`;

const NextVisitContent = styled.div`
    flex: 1;
`;

const NextVisitValue = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
`;

const NextVisitLabel = styled.div`
    font-size: 11px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

// Service Preferences Components
const PreferencesContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
`;

const TopServiceHighlight = styled.div`
    background: linear-gradient(135deg, ${theme.primary}08 0%, ${theme.primary}04 100%);
    border: 1px solid ${theme.primary}20;
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.xl};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
`;

const TopServiceIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
    border-radius: ${theme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    flex-shrink: 0;
    box-shadow: ${theme.shadow.md};
`;

const TopServiceInfo = styled.div`
    flex: 1;
`;

const TopServiceName = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.sm};
`;

const TopServiceStats = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.sm};
`;

const StatItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const StatValue = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${theme.primary};
`;

const StatLabel = styled.div`
    font-size: 11px;
    color: ${theme.text.muted};
    text-transform: uppercase;
`;

const StatDivider = styled.div`
    color: ${theme.text.muted};
    font-weight: 700;
`;

const TopServiceLabel = styled.div`
    font-size: 12px;
    color: ${theme.text.secondary};
    font-style: italic;
`;

const ServicesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const ServiceItem = styled.div<{ $isTop: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
    background: ${props => props.$isTop ? theme.primaryGhost : theme.surfaceAlt};
    border: 1px solid ${props => props.$isTop ? theme.primary + '30' : theme.border};
    border-radius: ${theme.radius.md};
    transition: all ${theme.transitions.normal};

    &:hover {
        background: ${theme.primaryGhost};
        border-color: ${theme.primary}30;
        transform: translateX(4px);
    }
`;

const ServiceRank = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    flex-shrink: 0;
`;

const RankIcon = styled.span<{ $rank: string }>`
    font-size: 20px;
`;

const RankNumber = styled.div`
    width: 24px;
    height: 24px;
    background: ${theme.text.muted};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
`;

const ServiceInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const ServiceName = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ServiceDetails = styled.div`
    display: flex;
    gap: ${theme.spacing.md};
`;

const ServiceUsage = styled.div`
    font-size: 12px;
    color: ${theme.text.secondary};
`;

const ServiceRevenue = styled.div`
    font-size: 12px;
    color: ${theme.text.secondary};
    font-weight: 600;
`;

const ServiceChart = styled.div`
    width: 60px;
    height: 6px;
    background: ${theme.borderLight};
    border-radius: 3px;
    overflow: hidden;
    flex-shrink: 0;
`;

const ProgressBar = styled.div<{ $percentage: number; $isTop: boolean }>`
    height: 100%;
    width: ${props => props.$percentage}%;
    background: ${props => props.$isTop ? theme.primary : theme.info};
    border-radius: 3px;
    transition: width ${theme.transitions.normal};
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