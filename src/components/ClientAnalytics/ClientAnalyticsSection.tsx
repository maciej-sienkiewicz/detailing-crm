// src/components/ClientAnalytics/ClientAnalyticsSection.tsx - Enhanced Version
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaChartLine, FaSpinner, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { useClientAnalytics } from '../../hooks/useClientAnalytics';
import { theme } from '../../styles/theme';
import ClientBasicMetrics from './ClientBasicMetrics';
import ClientRevenueTrend from './ClientRevenueTrend';
import ClientTopServices from './ClientTopServices';
import ClientReferralSources from './ClientReferralSources';
import ClientComparison from './ClientComparison';
import AnalyticsToggle from './AnalyticsToggle';

interface ClientAnalyticsSectionProps {
    clientId?: string;
    compact?: boolean;
    clientName?: string;
    initialExpanded?: boolean;
}

const ClientAnalyticsSection: React.FC<ClientAnalyticsSectionProps> = ({
                                                                           clientId,
                                                                           compact = false,
                                                                           clientName,
                                                                           initialExpanded = false
                                                                       }) => {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);
    const { analytics, loading, error, refetch } = useClientAnalytics(clientId);

    console.log('🔍 ClientAnalyticsSection Debug:');
    console.log('clientId:', clientId);
    console.log('loading:', loading);
    console.log('error:', error);
    console.log('analytics:', analytics);
    console.log('isExpanded:', isExpanded);

    if (!clientId) {
        console.log('❌ No clientId provided to ClientAnalyticsSection');
        return null;
    }

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
    };

    // Render toggle button
    const renderToggle = () => (
        <AnalyticsToggle
            isVisible={isExpanded}
            onToggle={handleToggle}
            isLoading={loading}
            hasError={!!error}
            clientName={clientName}
        />
    );

    // Render loading state
    if (loading && isExpanded) {
        console.log('⏳ ClientAnalyticsSection is loading...');
        return (
            <AnalyticsWrapper>
                {renderToggle()}
                <LoadingContainer>
                    <LoadingSpinner>
                        <FaSpinner />
                    </LoadingSpinner>
                    <LoadingText>Analizowanie danych klienta...</LoadingText>
                    <LoadingSubtext>
                        Przetwarzamy historię wizyt, przychody i wzorce zachowań
                    </LoadingSubtext>
                </LoadingContainer>
            </AnalyticsWrapper>
        );
    }

    // Render error state
    if (error && isExpanded) {
        console.log('❌ ClientAnalyticsSection error:', error);
        return (
            <AnalyticsWrapper>
                {renderToggle()}
                <ErrorContainer>
                    <ErrorIcon>
                        <FaExclamationTriangle />
                    </ErrorIcon>
                    <ErrorTitle>Nie udało się załadować analityki</ErrorTitle>
                    <ErrorText>{error}</ErrorText>
                    <RetryButton onClick={refetch}>
                        Spróbuj ponownie
                    </RetryButton>
                </ErrorContainer>
            </AnalyticsWrapper>
        );
    }

    // Render empty state
    if (!analytics && isExpanded) {
        console.log('❌ No analytics data received');
        return (
            <AnalyticsWrapper>
                {renderToggle()}
                <EmptyContainer>
                    <EmptyIcon>
                        <FaChartLine />
                    </EmptyIcon>
                    <EmptyTitle>Brak danych analitycznych</EmptyTitle>
                    <EmptyText>
                        Ten klient nie ma jeszcze wystarczających danych do szczegółowej analizy
                    </EmptyText>
                    <EmptySubtext>
                        Analityka będzie dostępna po pierwszych wizytach i transakcjach
                    </EmptySubtext>
                </EmptyContainer>
            </AnalyticsWrapper>
        );
    }

    // Render compact version
    if (compact) {
        if (!analytics) {
            return null; // Don't render anything if no data in compact mode
        }

        return (
            <CompactAnalyticsContainer>
                {analytics.basicMetrics && (
                    <ClientBasicMetrics data={analytics.basicMetrics} compact />
                )}
                {analytics.comparison && (
                    <ClientComparison data={analytics.comparison} compact />
                )}
            </CompactAnalyticsContainer>
        );
    }

    // Show just the toggle when collapsed
    if (!isExpanded) {
        return renderToggle();
    }

    // Render full analytics - with null check
    if (!analytics) {
        console.log('❌ Analytics data is null');
        return renderToggle();
    }

    console.log('✅ ClientAnalyticsSection rendering with data');

    return (
        <AnalyticsWrapper>
            {renderToggle()}

            <AnalyticsContainer>
                {/* Basic Metrics - Always show first */}
                {analytics.basicMetrics && (
                    <MetricsSection>
                        <ClientBasicMetrics data={analytics.basicMetrics} />
                    </MetricsSection>
                )}

                {/* Revenue Trend - Show if available */}
                {analytics.revenueTrend && (
                    <TrendSection>
                        <ClientRevenueTrend data={analytics.revenueTrend} />
                    </TrendSection>
                )}

                {/* Two-column layout for charts */}
                <ChartsGrid>
                    {/* Top Services */}
                    {analytics.topServices && analytics.topServices.length > 0 && (
                        <ChartSection>
                            <ClientTopServices data={analytics.topServices} />
                        </ChartSection>
                    )}

                    {analytics.comparison && (
                        <BottomSection>
                            <ClientComparison data={analytics.comparison} />
                        </BottomSection>
                    )}
                </ChartsGrid>
                
            </AnalyticsContainer>
        </AnalyticsWrapper>
    );
};

// ========================================================================================
// STYLED COMPONENTS
// ========================================================================================

const AnalyticsWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const AnalyticsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
    background: ${theme.surface};
    border: 1px solid ${theme.primary}20;
    border-radius: ${theme.radius.xl};
    padding: ${theme.spacing.xl};
    box-shadow: ${theme.shadow.lg};
    position: relative;
    overflow: hidden;

    /* Gradient border effect */
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, ${theme.primary} 0%, ${theme.primaryLight} 50%, ${theme.primary} 100%);
        z-index: 1;
    }

    /* Subtle background pattern */
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image:
                radial-gradient(circle at 25% 25%, ${theme.primary}05 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, ${theme.primaryLight}05 0%, transparent 50%);
        pointer-events: none;
        z-index: 0;
    }

    /* Ensure content is above background */
    > * {
        position: relative;
        z-index: 2;
    }

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg};
        gap: ${theme.spacing.lg};
    }
`;

const CompactAnalyticsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    box-shadow: ${theme.shadow.sm};
`;

const MetricsSection = styled.section`
    /* Basic metrics get special styling */
`;

const TrendSection = styled.section`
    /* Revenue trend section */
`;

const ChartsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.xl};

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.lg};
    }
`;

const ChartSection = styled.section`
    /* Individual chart sections */
`;

const GrowthSection = styled.section`
    /* Full-width growth chart */
`;

const BottomGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.xl};

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.lg};
    }
`;

const BottomSection = styled.section`
    /* Bottom row sections */
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
    min-height: 300px;
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
    font-size: 18px;
    color: ${theme.text.primary};
    font-weight: 600;
    text-align: center;
`;

const LoadingSubtext = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    text-align: center;
    max-width: 400px;
    line-height: 1.5;
    font-style: italic;
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
    min-height: 300px;
`;

const ErrorIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${theme.error}15;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.error};
    font-size: 28px;
    margin-bottom: ${theme.spacing.md};
`;

const ErrorTitle = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${theme.text.primary};
    text-align: center;
    margin-bottom: ${theme.spacing.sm};
`;

const ErrorText = styled.div`
    font-size: 16px;
    color: ${theme.error};
    text-align: center;
    max-width: 400px;
    line-height: 1.5;
    margin-bottom: ${theme.spacing.md};
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
    gap: ${theme.spacing.md};
    min-height: 300px;
`;

const EmptyIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${theme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: ${theme.text.tertiary};
    box-shadow: ${theme.shadow.sm};
    margin-bottom: ${theme.spacing.md};
`;

const EmptyTitle = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.sm};
`;

const EmptyText = styled.div`
    font-size: 16px;
    color: ${theme.text.secondary};
    margin-bottom: ${theme.spacing.xs};
    line-height: 1.5;
    max-width: 400px;
`;

const EmptySubtext = styled.div`
    font-size: 14px;
    color: ${theme.text.muted};
    font-style: italic;
    line-height: 1.5;
    max-width: 350px;
`;

const AnalyticsFooter = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
    background: ${theme.primaryGhost};
    border: 1px solid ${theme.primary}10;
    border-radius: ${theme.radius.lg};
    margin-top: ${theme.spacing.lg};
`;

const FooterIcon = styled.div`
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.primary};
    font-size: 14px;
    flex-shrink: 0;
    margin-top: 2px;
`;

const FooterContent = styled.div`
    flex: 1;
`;

const FooterText = styled.div`
    font-size: 13px;
    color: ${theme.text.secondary};
    font-weight: 500;
    line-height: 1.4;
`;

const FooterSubtext = styled.div`
    font-size: 12px;
    color: ${theme.text.muted};
    font-style: italic;
    margin-top: 2px;
`;

export default ClientAnalyticsSection;