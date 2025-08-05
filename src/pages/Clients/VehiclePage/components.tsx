import React from 'react';
import { FaCar, FaTrophy, FaMoneyBillWave, FaEye } from 'react-icons/fa';
import { VehicleStats } from './types';
import { useFormatters } from './hooks';
import {
    StatsSection,
    StatsGrid,
    StatCard,
    StatIcon,
    StatContent,
    StatValue,
    StatLabel,
    MostActiveVehicleCard,
    MostActiveHeader,
    MostActiveIcon,
    MostActiveContent,
    MostActiveTitle,
    MostActiveVehicleInfo,
    LicenseBadge,
    MostActiveStats,
    MostActiveStat,
    LoadingContainer,
    LoadingSpinner,
    LoadingText
} from './styles';

interface StatsDisplayProps {
    stats: VehicleStats;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
    const { formatCurrency } = useFormatters();

    return (
        <StatsSection>
            <StatsGrid>
                <StatCard>
                    <StatIcon $color="#475569">
                        <FaCar />
                    </StatIcon>
                    <StatContent>
                        <StatValue>{stats.totalVehicles}</StatValue>
                        <StatLabel>Łączna liczba pojazdów</StatLabel>
                    </StatContent>
                </StatCard>

                <StatCard>
                    <StatIcon $color="#475569">
                        <FaTrophy />
                    </StatIcon>
                    <StatContent>
                        <StatValue>{stats.premiumVehicles}</StatValue>
                        <StatLabel>Pojazdy Premium</StatLabel>
                    </StatContent>
                </StatCard>

                <StatCard>
                    <StatIcon $color="#475569">
                        <FaMoneyBillWave />
                    </StatIcon>
                    <StatContent>
                        <StatValue>{formatCurrency(stats.totalRevenue)}</StatValue>
                        <StatLabel>Łączne przychody</StatLabel>
                    </StatContent>
                </StatCard>

                <StatCard>
                    <StatIcon $color="#475569">
                        <FaEye />
                    </StatIcon>
                    <StatContent>
                        <StatValue>{formatCurrency(stats.visitRevenueMedian)}</StatValue>
                        <StatLabel>Mediana wartości wizyt</StatLabel>
                    </StatContent>
                </StatCard>
            </StatsGrid>

            {stats.mostActiveVehicle && (
                <MostActiveVehicleCard>
                    <MostActiveHeader>
                        <MostActiveIcon>
                            <FaTrophy />
                        </MostActiveIcon>
                        <MostActiveContent>
                            <MostActiveTitle>Najaktywniejszy pojazd</MostActiveTitle>
                            <MostActiveVehicleInfo>
                                <span>{stats.mostActiveVehicle.make} {stats.mostActiveVehicle.model}</span>
                                <LicenseBadge>{stats.mostActiveVehicle.licensePlate}</LicenseBadge>
                            </MostActiveVehicleInfo>
                        </MostActiveContent>
                    </MostActiveHeader>
                    <MostActiveStats>
                        <MostActiveStat>
                            <span>{stats.mostActiveVehicle.visitCount} wizyt</span>
                            <span>{formatCurrency(stats.mostActiveVehicle.totalRevenue)}</span>
                        </MostActiveStat>
                    </MostActiveStats>
                </MostActiveVehicleCard>
            )}
        </StatsSection>
    );
};

interface LoadingDisplayProps {
    hasActiveFilters: boolean;
}

export const LoadingDisplay: React.FC<LoadingDisplayProps> = ({ hasActiveFilters }) => (
    <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>
            {hasActiveFilters ? 'Wyszukiwanie pojazdów...' : 'Ładowanie danych pojazdów...'}
        </LoadingText>
    </LoadingContainer>
);