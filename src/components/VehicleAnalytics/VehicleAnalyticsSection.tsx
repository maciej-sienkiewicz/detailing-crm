import React from 'react';
import styled from 'styled-components';
import { FaChartLine, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { useVehicleAnalytics } from '../../hooks/useVehicleAnalytics';
import { theme } from '../../styles/theme';
import VehicleServicePreferencesSection from "./VehicleServicePreferencesSection";
import VehicleProfitabilitySection from "./VehicleProfitabilitySection";
import VehicleVisitPatternSection from "./VehicleVisitPatternSection";

interface VehicleAnalyticsSectionProps {
    vehicleId?: string;
}

const VehicleAnalyticsSection: React.FC<VehicleAnalyticsSectionProps> = ({ vehicleId }) => {
    const { analytics, loading, error, refetch } = useVehicleAnalytics(vehicleId);

    // DEBUG: Dodaj logi
    console.log('🔍 VehicleAnalyticsSection Debug:');
    console.log('vehicleId:', vehicleId);
    console.log('loading:', loading);
    console.log('error:', error);
    console.log('analytics:', analytics);
    console.log('analytics?.profitabilityAnalysis:', analytics?.profitabilityAnalysis);

    if (!vehicleId) {
        console.log('❌ No vehicleId provided to VehicleAnalyticsSection');
        return null;
    }

    if (loading) {
        console.log('⏳ VehicleAnalyticsSection is loading...');
        return (
            <LoadingContainer>
                <LoadingSpinner>
                    <FaSpinner />
                </LoadingSpinner>
                <LoadingText>Ładowanie analiz pojazdu...</LoadingText>
            </LoadingContainer>
        );
    }

    if (error) {
        console.log('❌ VehicleAnalyticsSection error:', error);
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
                <EmptySubtext>Ten pojazd nie ma jeszcze wystarczających danych do analizy</EmptySubtext>
            </EmptyContainer>
        );
    }

    console.log('✅ VehicleAnalyticsSection rendering with data');

    return (
        <AnalyticsContainer>
            {analytics.profitabilityAnalysis ? (
                <>
                    <VehicleProfitabilitySection data={analytics.profitabilityAnalysis} />
                </>
            ) : (
                <div style={{ padding: '10px', background: '#ffcccc' }}>
                    No profitabilityAnalysis data
                </div>
            )}

            {analytics.visitPattern ? (
                <VehicleVisitPatternSection data={analytics.visitPattern} />
            ) : (
                <div style={{ padding: '10px', background: '#ffcccc' }}>
                    No visitPattern data
                </div>
            )}

            {analytics.servicePreferences ? (
                <VehicleServicePreferencesSection data={analytics.servicePreferences} />
            ) : (
                <div style={{ padding: '10px', background: '#ffcccc' }}>
                    No servicePreferences data
                </div>
            )}
        </AnalyticsContainer>
    );
};

// Styled components remain the same...
const AnalyticsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xl};
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    border: 1px solid ${theme.border};
`;

const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.primary};
    font-size: 20px;
    margin-bottom: ${theme.spacing.md};

    svg {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xl};
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    border: 1px solid ${theme.error}30;
`;

const ErrorIcon = styled.div`
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.error};
    font-size: 20px;
    margin-bottom: ${theme.spacing.md};
`;

const ErrorText = styled.div`
    font-size: 14px;
    color: ${theme.error};
    text-align: center;
    margin-bottom: ${theme.spacing.md};
`;

const RetryButton = styled.button`
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    background: ${theme.error};
    color: white;
    border: none;
    border-radius: ${theme.radius.md};
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all ${theme.transitions.normal};

    &:hover {
        background: #b91c1c;
        transform: translateY(-1px);
    }
`;

const EmptyContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xl};
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    border: 2px dashed ${theme.border};
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

export default VehicleAnalyticsSection;