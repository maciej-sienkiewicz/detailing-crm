// src/components/ClientAnalytics/ClientReferralSources.tsx
import React from 'react';
import styled from 'styled-components';
import { FaUserFriends, FaGoogle, FaFacebook, FaInstagram, FaGlobe, FaPhone, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';
import { ReferralSourceResponse } from '../../api/clientAnalyticsApi';
import { theme } from '../../styles/theme';
import { formatCurrency, getRelativeTimeString } from '../../utils/clientAnalyticsUtils';

interface ClientReferralSourcesProps {
    data: ReferralSourceResponse[];
}

const ClientReferralSources: React.FC<ClientReferralSourcesProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <Section>
                <SectionHeader>
                    <SectionTitle>
                        <TitleIcon>
                            <FaUserFriends />
                        </TitleIcon>
                        <TitleText>Źródła pozyskania</TitleText>
                    </SectionTitle>
                </SectionHeader>

                <EmptyState>
                    <EmptyIcon>
                        <FaUserFriends />
                    </EmptyIcon>
                    <EmptyText>Brak danych o źródłach</EmptyText>
                    <EmptySubtext>
                        Nie udało się określić, w jaki sposób klient trafił do firmy
                    </EmptySubtext>
                </EmptyState>
            </Section>
        );
    }

    const getSourceIcon = (source: string) => {
        const lowerSource = source.toLowerCase();

        if (lowerSource.includes('google')) return <FaGoogle />;
        if (lowerSource.includes('facebook')) return <FaFacebook />;
        if (lowerSource.includes('instagram')) return <FaInstagram />;
        if (lowerSource.includes('internet') || lowerSource.includes('web')) return <FaGlobe />;
        if (lowerSource.includes('phone') || lowerSource.includes('telefon')) return <FaPhone />;
        if (lowerSource.includes('referral') || lowerSource.includes('polecenie')) return <FaUsers />;
        if (lowerSource.includes('local') || lowerSource.includes('lokalny')) return <FaMapMarkerAlt />;

        return <FaUserFriends />;
    };

    const getSourceColor = (source: string) => {
        const lowerSource = source.toLowerCase();

        if (lowerSource.includes('google')) return '#4285f4';
        if (lowerSource.includes('facebook')) return '#1877f2';
        if (lowerSource.includes('instagram')) return '#e4405f';
        if (lowerSource.includes('internet') || lowerSource.includes('web')) return theme.info;
        if (lowerSource.includes('phone') || lowerSource.includes('telefon')) return theme.success;
        if (lowerSource.includes('referral') || lowerSource.includes('polecenie')) return theme.warning;
        if (lowerSource.includes('local') || lowerSource.includes('lokalny')) return theme.primary;

        return theme.text.muted;
    };

    const totalVisits = data.reduce((sum, source) => sum + source.visitCount, 0);
    const totalRevenue = data.reduce((sum, source) => sum + source.totalRevenue, 0);

    return (
        <Section>
            <SectionHeader>
                <SectionTitle>
                    <TitleIcon>
                        <FaUserFriends />
                    </TitleIcon>
                    <TitleText>Źródła pozyskania</TitleText>
                    <SourceCount>{data.length} źródeł</SourceCount>
                </SectionTitle>
                <SectionSubtitle>
                    Jak klient trafia do firmy
                </SectionSubtitle>
            </SectionHeader>

            <SourcesList>
                {data.map((source, index) => {
                    const sourceIcon = getSourceIcon(source.source);
                    const sourceColor = getSourceColor(source.source);
                    const visitPercentage = totalVisits > 0 ? (source.visitCount / totalVisits) * 100 : 0;
                    const revenuePercentage = totalRevenue > 0 ? (source.totalRevenue / totalRevenue) * 100 : 0;

                    return (
                        <SourceItem key={source.source} $rank={index + 1}>
                            <SourceRank $color={sourceColor}>
                                #{index + 1}
                            </SourceRank>

                            <SourceMainContent>
                                <SourceHeader>
                                    <SourceIconWrapper $color={sourceColor}>
                                        {sourceIcon}
                                    </SourceIconWrapper>
                                    <SourceInfo>
                                        <SourceName>{source.sourceDisplayName}</SourceName>
                                        <SourceDate>
                                            Pierwszy kontakt: {getRelativeTimeString(source.firstVisitDate)}
                                        </SourceDate>
                                    </SourceInfo>
                                </SourceHeader>

                                <SourceMetrics>
                                    <MetricItem>
                                        <MetricLabel>Wizyty</MetricLabel>
                                        <MetricValue>{source.visitCount}</MetricValue>
                                        <MetricPercentage>
                                            {visitPercentage.toFixed(1)}%
                                        </MetricPercentage>
                                    </MetricItem>

                                    <MetricDivider />

                                    <MetricItem>
                                        <MetricLabel>Przychód</MetricLabel>
                                        <MetricValue>{formatCurrency(source.totalRevenue)}</MetricValue>
                                        <MetricPercentage>
                                            {revenuePercentage.toFixed(1)}%
                                        </MetricPercentage>
                                    </MetricItem>
                                </SourceMetrics>

                                <SourceProgress>
                                    <ProgressLabel>Udział w wizytach</ProgressLabel>
                                    <ProgressBar>
                                        <ProgressFill
                                            $percentage={visitPercentage}
                                            $color={sourceColor}
                                        />
                                    </ProgressBar>
                                </SourceProgress>
                            </SourceMainContent>
                        </SourceItem>
                    );
                })}
            </SourcesList>

            <SourcesSummary>
                <SummaryTitle>Podsumowanie źródeł</SummaryTitle>
                <SummaryGrid>
                    <SummaryItem>
                        <SummaryLabel>Najlepsze źródło</SummaryLabel>
                        <SummaryValue>
                            {data.length > 0 ? data[0].sourceDisplayName : 'Brak'}
                        </SummaryValue>
                    </SummaryItem>

                    <SummaryItem>
                        <SummaryLabel>Łączne wizyty</SummaryLabel>
                        <SummaryValue>{totalVisits}</SummaryValue>
                    </SummaryItem>

                    <SummaryItem>
                        <SummaryLabel>Łączny przychód</SummaryLabel>
                        <SummaryValue>{formatCurrency(totalRevenue)}</SummaryValue>
                    </SummaryItem>

                    <SummaryItem>
                        <SummaryLabel>Średni przychód/źródło</SummaryLabel>
                        <SummaryValue>
                            {data.length > 0 ? formatCurrency(totalRevenue / data.length) : '0 zł'}
                        </SummaryValue>
                    </SummaryItem>
                </SummaryGrid>
            </SourcesSummary>
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
    margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.sm};
    flex-wrap: wrap;
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

const SourceCount = styled.div`
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

const SourcesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.xl};
`;

const SourceItem = styled.div<{ $rank: number }>`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    display: flex;
    gap: ${theme.spacing.lg};
    transition: all ${theme.transitions.normal};
    position: relative;
    
    ${props => props.$rank === 1 && `
        background: linear-gradient(135deg, ${theme.warning}08 0%, ${theme.warning}04 100%);
        border-color: ${theme.warning}30;
    `}

    &:hover {
        background: ${theme.primaryGhost};
        border-color: ${theme.primary}30;
        transform: translateY(-2px);
        box-shadow: ${theme.shadow.md};
    }
`;

const SourceRank = styled.div<{ $color: string }>`
    width: 32px;
    height: 32px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
`;

const SourceMainContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const SourceHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
`;

const SourceIconWrapper = styled.div<{ $color: string }>`
    width: 36px;
    height: 36px;
    background: ${props => props.$color}15;
    border-radius: ${theme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 16px;
    flex-shrink: 0;
`;

const SourceInfo = styled.div`
    flex: 1;
`;

const SourceName = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
`;

const SourceDate = styled.div`
    font-size: 12px;
    color: ${theme.text.secondary};
    font-style: italic;
`;

const SourceMetrics = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.sm} 0;
`;

const MetricItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    flex: 1;
`;

const MetricLabel = styled.div`
    font-size: 10px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
`;

const MetricValue = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const MetricPercentage = styled.div`
    font-size: 10px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const MetricDivider = styled.div`
    width: 1px;
    height: 32px;
    background: ${theme.border};
`;

const SourceProgress = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const ProgressLabel = styled.div`
    font-size: 11px;
    color: ${theme.text.muted};
    font-weight: 500;
`;

const ProgressBar = styled.div`
    width: 100%;
    height: 6px;
    background: ${theme.borderLight};
    border-radius: 3px;
    overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
    height: 100%;
    width: ${props => props.$percentage}%;
    background: linear-gradient(90deg, ${props => props.$color} 0%, ${props => props.$color}CC 100%);
    border-radius: 3px;
    transition: width 0.8s ease-out;
`;

const SourcesSummary = styled.div`
    background: ${theme.primaryGhost};
    border: 1px solid ${theme.primary}20;
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
`;

const SummaryTitle = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.md};
`;

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.md};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const SummaryItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.sm} 0;
`;

const SummaryLabel = styled.div`
    font-size: 13px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const SummaryValue = styled.div`
    font-size: 13px;
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

export default ClientReferralSources;