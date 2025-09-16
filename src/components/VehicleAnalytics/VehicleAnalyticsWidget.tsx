import React from 'react';
import styled from 'styled-components';
import { FaChartLine, FaClock } from 'react-icons/fa';
import { VehicleAnalyticsResponse } from '../../api/vehicleAnalyticsApi';
import { theme } from '../../styles/theme';
import {FaArrowTrendDown, FaArrowTrendUp} from "react-icons/fa6";

interface VehicleAnalyticsWidgetProps {
    analytics: VehicleAnalyticsResponse;
    compact?: boolean;
}

const VehicleAnalyticsWidget: React.FC<VehicleAnalyticsWidgetProps> = ({
                                                                           analytics,
                                                                           compact = false
                                                                       }) => {
    const formatCurrency = (amount: number): string => {
        if (amount >= 1000) {
            return `${(amount / 1000).toFixed(1)}k zł`;
        }
        return `${amount.toFixed(0)} zł`;
    };

    const getTrendIcon = (changeIndicator: string) => {
        switch (changeIndicator) {
            case 'POSITIVE':
                return <FaArrowTrendUp style={{ color: theme.success }} />;
            case 'NEGATIVE':
                return <FaArrowTrendDown style={{ color: theme.error }} />;
            default:
                return <FaClock style={{ color: theme.text.muted }} />;
        }
    };

    const getTrendColor = (changeIndicator: string) => {
        switch (changeIndicator) {
            case 'POSITIVE':
                return theme.success;
            case 'NEGATIVE':
                return theme.error;
            default:
                return theme.text.muted;
        }
    };

    if (compact) {
        return (
            <CompactWidget>
                {analytics.profitabilityAnalysis && (
                    <CompactMetric>
                        <CompactValue>
                            {formatCurrency(analytics.profitabilityAnalysis.monthly_revenue)}
                        </CompactValue>
                        <CompactTrend $color={getTrendColor(analytics.profitabilityAnalysis.trend_change_indicator)}>
                            {getTrendIcon(analytics.profitabilityAnalysis.trend_change_indicator)}
                        </CompactTrend>
                    </CompactMetric>
                )}
                {analytics.visitPattern && (
                    <CompactStatus $riskLevel={analytics.visitPattern.risk_level}>
                        {analytics.visitPattern.visit_regularity_status === 'REGULAR' ? '🟢' :
                            analytics.visitPattern.visit_regularity_status === 'IRREGULAR' ? '🟡' :
                                analytics.visitPattern.risk_level === 'HIGH' ? '🔴' : '⚫'}
                    </CompactStatus>
                )}
            </CompactWidget>
        );
    }

    return (
        <Widget>
            <WidgetHeader>
                <WidgetTitle>
                    <FaChartLine />
                    Analiza
                </WidgetTitle>
            </WidgetHeader>

            <WidgetContent>
                {analytics.profitabilityAnalysis && (
                    <WidgetSection>
                        <SectionLabel>Rentowność</SectionLabel>
                        <MetricRow>
                            <MetricValue>
                                {formatCurrency(analytics.profitabilityAnalysis.average_visit_value)}
                            </MetricValue>
                            <MetricLabel>średnia wizyta</MetricLabel>
                        </MetricRow>
                        <TrendRow>
                            <TrendIndicator $color={getTrendColor(analytics.profitabilityAnalysis.trend_change_indicator)}>
                                {getTrendIcon(analytics.profitabilityAnalysis.trend_change_indicator)}
                                <span>{analytics.profitabilityAnalysis.trend_display_name}</span>
                            </TrendIndicator>
                        </TrendRow>
                    </WidgetSection>
                )}

                {analytics.visitPattern && (
                    <WidgetSection>
                        <SectionLabel>Regularność</SectionLabel>
                        <StatusRow $riskLevel={analytics.visitPattern.risk_level}>
                            <StatusIndicator>
                                {analytics.visitPattern.visit_regularity_status === 'REGULAR' ? '🟢' :
                                    analytics.visitPattern.visit_regularity_status === 'IRREGULAR' ? '🟡' :
                                        analytics.visitPattern.risk_level === 'HIGH' ? '🔴' : '⚫'}
                            </StatusIndicator>
                            <StatusText>{analytics.visitPattern.regularity_display_name}</StatusText>
                        </StatusRow>
                        {analytics.visitPattern.days_since_last_visit !== null && (
                            <MetricRow>
                                <MetricValue>{analytics.visitPattern.days_since_last_visit}</MetricValue>
                                <MetricLabel>dni temu</MetricLabel>
                            </MetricRow>
                        )}
                    </WidgetSection>
                )}

                {analytics.servicePreferences && analytics.servicePreferences.top_services.length > 0 && (
                    <WidgetSection>
                        <SectionLabel>Top usługa</SectionLabel>
                        <ServiceRow>
                            <ServiceName>{analytics.servicePreferences.top_services[0].service_name}</ServiceName>
                            <ServiceCount>{analytics.servicePreferences.top_services[0].usage_count}x</ServiceCount>
                        </ServiceRow>
                    </WidgetSection>
                )}
            </WidgetContent>
        </Widget>
    );
};

// Widget Components
const Widget = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
    box-shadow: ${theme.shadow.xs};
`;

const WidgetHeader = styled.div`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.primaryGhost};
    border-bottom: 1px solid ${theme.border};
`;

const WidgetTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};

    svg {
        color: ${theme.primary};
        font-size: 12px;
    }
`;

const WidgetContent = styled.div`
    padding: ${theme.spacing.lg};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
`;

const WidgetSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
`;

const SectionLabel = styled.div`
    font-size: 11px;
    font-weight: 500;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const MetricRow = styled.div`
    display: flex;
    align-items: baseline;
    gap: ${theme.spacing.sm};
`;

const MetricValue = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${theme.text.primary};
`;

const MetricLabel = styled.div`
    font-size: 11px;
    color: ${theme.text.secondary};
`;

const TrendRow = styled.div`
    display: flex;
    align-items: center;
`;

const TrendIndicator = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: 11px;
    color: ${props => props.$color};
    font-weight: 500;

    svg {
        font-size: 10px;
    }
`;

const StatusRow = styled.div<{ $riskLevel: string }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
`;

const StatusIndicator = styled.div`
    font-size: 12px;
`;

const StatusText = styled.div`
    font-size: 12px;
    font-weight: 500;
    color: ${theme.text.primary};
`;

const ServiceRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ServiceName = styled.div`
    font-size: 12px;
    color: ${theme.text.primary};
    font-weight: 500;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ServiceCount = styled.div`
    font-size: 11px;
    color: ${theme.text.secondary};
    font-weight: 600;
    flex-shrink: 0;
`;

// Compact Widget Components
const CompactWidget = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.sm};
    border: 1px solid ${theme.border};
`;

const CompactMetric = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

const CompactValue = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const CompactTrend = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    color: ${props => props.$color};
    font-size: 10px;
`;

const CompactStatus = styled.div<{ $riskLevel: string }>`
    font-size: 12px;
`;

export { VehicleAnalyticsWidget };