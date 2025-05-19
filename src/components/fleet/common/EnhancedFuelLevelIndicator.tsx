// src/components/fleet/common/EnhancedFuelLevelIndicator.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaGasPump, FaClock } from 'react-icons/fa';
import { fleetMaintenanceApi } from '../../../api/fleetMaintenanceApi';
import { getFuelLevelDescription } from '../../../types/fleetMaintenance';
import { format } from 'date-fns';

interface EnhancedFuelLevelIndicatorProps {
    vehicleId: string;
    size?: 'small' | 'medium' | 'large';
    showUpdatedAt?: boolean;
    onlyIcon?: boolean;
}

const EnhancedFuelLevelIndicator: React.FC<EnhancedFuelLevelIndicatorProps> = ({
                                                                                   vehicleId,
                                                                                   size = 'medium',
                                                                                   showUpdatedAt = false,
                                                                                   onlyIcon = false
                                                                               }) => {
    const [fuelLevel, setFuelLevel] = useState<number | null>(null);
    const [estimatedRange, setEstimatedRange] = useState<number | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchFuelStatus = async () => {
            setIsLoading(true);
            try {
                const status = await fleetMaintenanceApi.fetchFuelStatus(vehicleId);
                if (status) {
                    setFuelLevel(status.currentFuelLevel);
                    setEstimatedRange(status.estimatedRange || null);
                    setLastUpdated(status.lastUpdated);
                }
            } catch (error) {
                console.error('Error fetching fuel status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFuelStatus();
    }, [vehicleId]);

    // Określenie koloru na podstawie poziomu paliwa
    const getColor = () => {
        if (fuelLevel === null) return '#bdc3c7'; // szary dla braku danych
        if (fuelLevel <= 0.15) return '#e74c3c'; // czerwony dla niskiego poziomu
        if (fuelLevel <= 0.35) return '#f39c12';  // pomarańczowy
        return '#2ecc71'; // zielony dla wysokiego poziomu
    };

    // Formatowanie daty ostatniej aktualizacji
    const formatLastUpdated = () => {
        if (!lastUpdated) return '';
        const date = new Date(lastUpdated);
        return format(date, 'dd.MM.yyyy HH:mm');
    };

    if (isLoading) {
        return <LoadingPlaceholder size={size} />;
    }

    if (fuelLevel === null) {
        return (
            <Container size={size}>
                <FaGasPump />
                {!onlyIcon && <MissingData>Brak danych</MissingData>}
            </Container>
        );
    }

    // Dla wersji tylko z ikoną (miniaturka)
    if (onlyIcon) {
        return (
            <IconOnly color={getColor()} title={`Poziom paliwa: ${Math.round(fuelLevel * 100)}%`}>
                <FaGasPump />
            </IconOnly>
        );
    }

    return (
        <Container size={size}>
            <FuelLevelCard>
                <FuelHeader>
                    <FuelTitle>
                        <FaGasPump />
                        Poziom paliwa
                    </FuelTitle>
                    <FuelPercentage>{Math.round(fuelLevel * 100)}%</FuelPercentage>
                </FuelHeader>

                <FuelGaugeContainer>
                    <FuelGauge>
                        <FuelLevel level={fuelLevel} color={getColor()} />
                        <FuelMarkers>
                            <FuelMarker position={0}>E</FuelMarker>
                            <FuelMarker position={0.25}>¼</FuelMarker>
                            <FuelMarker position={0.5}>½</FuelMarker>
                            <FuelMarker position={0.75}>¾</FuelMarker>
                            <FuelMarker position={1}>F</FuelMarker>
                        </FuelMarkers>
                    </FuelGauge>
                    <FuelDescription>
                        {getFuelLevelDescription(fuelLevel)}
                        {estimatedRange && ` • Zasięg ~${estimatedRange} km`}
                    </FuelDescription>
                </FuelGaugeContainer>

                {showUpdatedAt && lastUpdated && (
                    <UpdateInfo>
                        <FaClock />
                        <span>Aktualizacja: {formatLastUpdated()}</span>
                    </UpdateInfo>
                )}
            </FuelLevelCard>
        </Container>
    );
};

const Container = styled.div<{ size: string }>`
    width: 100%;
`;

const FuelLevelCard = styled.div`
    background: linear-gradient(to right, rgba(243, 243, 243, 0.8), rgba(255, 255, 255, 0.9));
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(225, 225, 225, 0.7);
`;

const FuelHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
`;

const FuelTitle = styled.div`
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    color: #555;
    gap: 8px;

    svg {
        color: #555;
    }
`;

const FuelPercentage = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: #333;
`;

const FuelGaugeContainer = styled.div`
    margin-bottom: 12px;
`;

const FuelGauge = styled.div`
    position: relative;
    height: 12px;
    background-color: #f1f1f1;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FuelLevel = styled.div<{ level: number; color: string }>`
    height: 100%;
    width: ${props => `${props.level * 100}%`};
    background: ${props => `linear-gradient(to right, ${props.color}aa, ${props.color})`};
    border-radius: 6px;
    transition: width 0.5s ease;
`;

const FuelMarkers = styled.div`
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 2px;
`;

const FuelMarker = styled.div<{ position: number }>`
    position: absolute;
    left: ${props => `${props.position * 100}%`};
    transform: translateX(-50%);
    font-size: 10px;
    color: #888;
`;

const FuelDescription = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 20px;
    font-size: 12px;
    color: #666;
`;

const UpdateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #888;
  margin-top: 8px;
  
  svg {
    font-size: 10px;
  }
`;

const MissingData = styled.span`
  font-size: 12px;
  color: #95a5a6;
  font-style: italic;
`;

const LoadingPlaceholder = styled.div<{ size: string }>`
  display: flex;
  align-items: center;
  height: ${props => props.size === 'small' ? '60px' : props.size === 'large' ? '100px' : '80px'};
  width: 100%;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #eee;
  
  &::after {
    content: '';
    display: block;
    width: 20px;
    height: 20px;
    margin: 0 auto;
    border-radius: 50%;
    border: 2px solid #ddd;
    border-top-color: #3498db;
    animation: spin 1s infinite linear;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const IconOnly = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: ${props => props.color};
  cursor: help;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

export default EnhancedFuelLevelIndicator;