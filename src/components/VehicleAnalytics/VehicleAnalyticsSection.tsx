// src/components/VehicleAnalytics/VehicleAnalyticsSection.tsx - Poprawione mapowanie danych
import React from 'react';
import styled from 'styled-components';
import { FaChartLine, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { useVehicleAnalytics } from '../../hooks/useVehicleAnalytics';
import { theme } from '../../styles/theme';
import VehicleBasicMetricsSection from "./VehicleBasicMetricsSection";
import VehicleTopServicesSection from "./VehicleTopServicesSection";

interface VehicleAnalyticsSectionProps {
    vehicleId?: string;
}

const VehicleAnalyticsSection: React.FC<VehicleAnalyticsSectionProps> = ({ vehicleId }) => {
    const { analytics, loading, error, refetch } = useVehicleAnalytics(vehicleId);

    console.log('🔍 VehicleAnalyticsSection Debug:');
    console.log('vehicleId:', vehicleId);
    console.log('loading:', loading);
    console.log('error:', error);
    console.log('analytics:', analytics);

    if (!vehicleId) {
        console.log('❌ No vehicleId provided to VehicleAnalyticsSection');
        return null;
    }

    if (loading) {
        console.log('⏳ VehicleAnalyticsSection is loading...');
        return (
            <AnalyticsWrapper>
                <LoadingContainer>
                    <LoadingSpinner>
                        <FaSpinner />
                    </LoadingSpinner>
                    <LoadingText>Analizowanie danych pojazdu...</LoadingText>
                    <LoadingSubtext>
                        Przetwarzamy historię serwisów, wydatki i wzorce użytkowania
                    </LoadingSubtext>
                </LoadingContainer>
            </AnalyticsWrapper>
        );
    }

    if (error) {
        console.log('❌ VehicleAnalyticsSection error:', error);
        return (
            <AnalyticsWrapper>
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

    if (!analytics) {
        console.log('❌ No analytics data received');
        return (
            <AnalyticsWrapper>
                <EmptyContainer>
                    <EmptyIcon>
                        <FaChartLine />
                    </EmptyIcon>
                    <EmptyTitle>Brak danych analitycznych</EmptyTitle>
                    <EmptyText>Ten pojazd nie ma jeszcze wystarczających danych do analizy</EmptyText>
                    <EmptySubtext>
                        Analityka będzie dostępna po pierwszych wizytach serwisowych
                    </EmptySubtext>
                </EmptyContainer>
            </AnalyticsWrapper>
        );
    }

    console.log('✅ VehicleAnalyticsSection rendering with data');

    return (
        <AnalyticsWrapper>
            {/* Header informacyjny - identyczny jak w klientach */}
            <AnalyticsHeader>
                <HeaderIcon>
                    <FaChartLine />
                </HeaderIcon>
                <HeaderContent>
                    <HeaderTitle>Analityka pojazdu</HeaderTitle>
                    <HeaderSubtitle>
                        Szczegółowe dane serwisowe i finansowe
                    </HeaderSubtitle>
                </HeaderContent>
            </AnalyticsHeader>

            <AnalyticsContainer>
                {/* Kluczowe metryki - zastąpione z "Analiza rentowności" */}
                {analytics.profitabilityAnalysis && (
                    <MetricsSection>
                        <VehicleBasicMetricsSection
                            data={{
                                // Dane z profitabilityAnalysis (już w camelCase po konwersji API)
                                averageVisitValue: analytics.profitabilityAnalysis.averageVisitValue,
                                monthlyRevenue: analytics.profitabilityAnalysis.monthlyRevenue,
                                trendPercentage: analytics.profitabilityAnalysis.trendPercentage,
                                trendDisplayName: analytics.profitabilityAnalysis.trendDisplayName,
                                trendChangeIndicator: analytics.profitabilityAnalysis.trendChangeIndicator,
                                profitabilityScore: analytics.profitabilityAnalysis.profitabilityScore,
                                // Dodatkowe dane z visitPattern (już w camelCase po konwersji API)
                                totalServices: analytics.visitPattern?.totalVisits || 0,
                                totalRevenue: analytics.profitabilityAnalysis.monthlyRevenue * 12,
                                daysSinceLastService: analytics.visitPattern?.daysSinceLastVisit,
                                lastServiceDate: undefined
                            }}
                        />
                    </MetricsSection>
                )}

                {/* Ulubione usługi - zastąpione z "Preferencje usługowe" */}
                {analytics.servicePreferences && (
                    <ServicesSection>
                        <VehicleTopServicesSection data={analytics.servicePreferences} />
                    </ServicesSection>
                )}
            </AnalyticsContainer>
        </AnalyticsWrapper>
    );
};

// ========================================================================================
// STYLED COMPONENTS - Identyczne jak w ClientAnalyticsSection
// ========================================================================================

const AnalyticsWrapper = styled.div`
    position: relative;
    width: 100%;
    margin-bottom: ${theme.spacing.xl};
`;

const AnalyticsHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    background: linear-gradient(135deg, ${theme.primaryGhost} 0%, rgba(26, 54, 93, 0.02) 100%);
    border: 1px solid ${theme.primary}20;
    border-radius: ${theme.radius.xl};
    margin-bottom: ${theme.spacing.lg};
    box-shadow: ${theme.shadow.sm};

    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
        gap: ${theme.spacing.md};
        padding: ${theme.spacing.lg};
    }
`;

const HeaderIcon = styled.div`
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
    border-radius: ${theme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    box-shadow: ${theme.shadow.md};
    flex-shrink: 0;
`;

const HeaderContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const HeaderTitle = styled.h2`
    font-size: 24px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.xs} 0;
    letter-spacing: -0.02em;

    @media (max-width: 768px) {
        font-size: 20px;
    }
`;

const HeaderSubtitle = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    line-height: 1.4;
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

const MetricsSection = styled.section`
    /* Kluczowe metryki */
`;

const PatternSection = styled.section`
    /* Wzorce wizyt */
`;

const ServicesSection = styled.section`
    /* Ulubione usługi */
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

export default VehicleAnalyticsSection;