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