// src/components/ClientAnalytics/ClientAnalyticsSection.tsx
import React from 'react';
import styled from 'styled-components';
import { FaChartLine, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { useClientAnalytics } from '../../hooks/useClientAnalytics';
import { theme } from '../../styles/theme';
import ClientBasicMetrics from './ClientBasicMetrics';
import ClientRevenueTrend from './ClientRevenueTrend';
import ClientSeasonality from './ClientSeasonality';
import ClientTopServices from './ClientTopServices';
import ClientReferralSources from './ClientReferralSources';
import ClientGrowthChart from './ClientGrowthChart';
import ClientComparison from './ClientComparison';

interface ClientAnalyticsSectionProps {
    clientId?: string;
    compact?: boolean;
}

const ClientAnalyticsSection: React.FC<ClientAnalyticsSectionProps> = ({
                                                                           clientId,
                                                                           compact = false
                                                                       }) => {
    const { analytics, loading, error, refetch } = useClientAnalytics(clientId);

    console.log('🔍 ClientAnalyticsSection Debug:');
    console.log('clientId:', clientId);
    console.log('loading:', loading);
    console.log('error:', error);
    console.log('analytics:', analytics);

    if (!clientId) {
        console.log('❌ No clientId provided to ClientAnalyticsSection');
        return null;
    }

    if (loading) {
        console.log('⏳ ClientAnalyticsSection is loading...');
        return (
            <LoadingContainer>
                <LoadingSpinner>
                    <FaSpinner />
                </LoadingSpinner>
                <LoadingText>Ładowanie analiz klienta...</LoadingText>
            </LoadingContainer>
        );
    }

    if (error) {
        console.log('❌ ClientAnalyticsSection error:', error);
        return (
            <ErrorContainer>
                <ErrorIcon>
                    <FaExclamationTriangle />
                </ErrorIcon>
                <ErrorText>{error}</ErrorText>
                <RetryButton onClick={refetch}>
                    Spróbuj ponownie
                </RetryButton>
            </ErrorContainer>
        );
    }

    if (!analytics) {
        console.log('❌ No analytics data received');
        return (
            <EmptyContainer>
                <EmptyIcon>
                    <FaChartLine />
                </EmptyIcon>
                <EmptyText>Brak danych analitycznych</EmptyText>
                <EmptySubtext>Ten klient nie ma jeszcze wystarczających danych do analizy</EmptySubtext>
            </EmptyContainer>
        );
    }

    console.log('✅ ClientAnalyticsSection rendering with data');

    if (compact) {
        return (
            <CompactAnalyticsContainer>
                <ClientBasicMetrics data={analytics.basicMetrics} compact />
                {analytics.comparison && (
                    <ClientComparison data={analytics.comparison} compact />
                )}
            </CompactAnalyticsContainer>
        );
    }

    return (
        <AnalyticsContainer>
            {/* Basic Metrics - Always show */}
            <ClientBasicMetrics data={analytics.basicMetrics} />

            {/* Revenue Trend - Show if available */}
            {analytics.revenueTrend && (
                <ClientRevenueTrend data={analytics.revenueTrend} />
            )}

            {/* Two-column layout for charts */}
            <ChartsGrid>
                {/* Seasonality Analysis */}
                <ClientSeasonality data={analytics.seasonality} />

                {/* Top Services */}
                {analytics.topServices.length > 0 && (
                    <ClientTopServices data={analytics.topServices} />
                )}
            </ChartsGrid>

            {/* Growth Chart - Full width */}
            {analytics.growthChart.length > 0 && (
                <ClientGrowthChart data={analytics.growthChart} />
            )}

            {/* Bottom row */}
            <BottomGrid>
                {/* Referral Sources */}
                {analytics.referralSources.length > 0 && (
                    <ClientReferralSources data={analytics.referralSources} />
                )}

                {/* Comparison with company averages */}
                {analytics.comparison && (
                    <ClientComparison data={analytics.comparison} />
                )}
            </BottomGrid>
        </AnalyticsContainer>
    );
};

// ========================================================================================
// STYLED COMPONENTS
// ========================================================================================

const AnalyticsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
    padding: ${theme.spacing.lg};
    
    @media (max-width: 768px) {
        padding: ${theme.spacing.md};
        gap: ${theme.spacing.lg};
    }
`;

const CompactAnalyticsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md};
`;

const ChartsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.xl};

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.lg};
    }
`;

const BottomGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.xl};

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.lg};
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxxl};
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    border: 1px solid ${theme.border};
    gap: ${theme.spacing.lg};
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.primary};
    font-size: 24px;

    svg {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${theme.text.secondary};
    font-weight: 500;
    text-align: center;
`;

const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxxl};
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    border: 1px solid ${theme.error}30;
    gap: ${theme.spacing.lg};
`;

const ErrorIcon = styled.div`
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.error};
    font-size: 24px;
`;

const ErrorText = styled.div`
    font-size: 16px;
    color: ${theme.error};
    text-align: center;
    max-width: 400px;
    line-height: 1.5;
`;

const RetryButton = styled.button`
    padding: ${theme.spacing.md} ${theme.spacing.xl};
    background: ${theme.error};
    color: white;
    border: none;
    border-radius: ${theme.radius.md};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all ${theme.transitions.normal};

    &:hover {
        background: #b91c1c;
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:active {
        transform: translateY(0);
    }
`;

const EmptyContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxxl};
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    border: 2px dashed ${theme.border};
    text-align: center;
    gap: ${theme.spacing.lg};
`;

const EmptyIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${theme.surface};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: ${theme.text.tertiary};
    box-shadow: ${theme.shadow.sm};
`;

const EmptyText = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.secondary};
    margin-bottom: ${theme.spacing.xs};
`;

const EmptySubtext = styled.div`
    font-size: 14px;
    color: ${theme.text.muted};
    font-style: italic;
    max-width: 400px;
    line-height: 1.5;
`;

export default ClientAnalyticsSection;