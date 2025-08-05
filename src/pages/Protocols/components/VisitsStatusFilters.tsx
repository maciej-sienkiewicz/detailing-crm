import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ProtocolStatus } from '../../../types';
import { protocolsApi } from '../../../api/protocolsApi';

const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0'
};

type StatusFilterType = 'all' | ProtocolStatus;

interface StatusFilterConfig {
    label: string;
    color: string;
    lightColor: string;
}

const statusConfig: Record<StatusFilterType, StatusFilterConfig> = {
    all: {
        label: 'Wszystkie',
        color: brandTheme.primary,
        lightColor: brandTheme.primaryGhost
    },
    [ProtocolStatus.IN_PROGRESS]: {
        label: 'W realizacji',
        color: '#9b59b6',
        lightColor: 'rgba(155, 89, 182, 0.1)'
    },
    [ProtocolStatus.READY_FOR_PICKUP]: {
        label: 'Gotowe do odbioru',
        color: '#2ecc71',
        lightColor: 'rgba(46, 204, 113, 0.1)'
    },
    [ProtocolStatus.SCHEDULED]: {
        label: 'Zaplanowane',
        color: '#3498db',
        lightColor: 'rgba(52, 152, 219, 0.1)'
    },
    [ProtocolStatus.COMPLETED]: {
        label: 'Zakończone',
        color: '#7f8c8d',
        lightColor: 'rgba(127, 140, 141, 0.1)'
    },
    [ProtocolStatus.CANCELLED]: {
        label: 'Anulowane',
        color: '#e74c3c',
        lightColor: 'rgba(231, 76, 60, 0.1)'
    }
};

interface VisitsStatusFiltersProps {
    activeStatus: StatusFilterType;
    onStatusChange: (status: StatusFilterType) => void;
}

export const VisitsStatusFilters: React.FC<VisitsStatusFiltersProps> = ({
                                                                            activeStatus,
                                                                            onStatusChange
                                                                        }) => {
    const [counters, setCounters] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounters = async () => {
            setLoading(true);
            try {
                const data = await protocolsApi.getProtocolCounters();
                setCounters({
                    all: data.all || 0,
                    [ProtocolStatus.SCHEDULED]: data.scheduled || 0,
                    [ProtocolStatus.IN_PROGRESS]: data.inProgress || 0,
                    [ProtocolStatus.READY_FOR_PICKUP]: data.readyForPickup || 0,
                    [ProtocolStatus.COMPLETED]: data.completed || 0,
                    [ProtocolStatus.CANCELLED]: data.cancelled || 0
                });
            } catch (error) {
                console.error('Błąd podczas pobierania liczników:', error);
                setCounters({});
            } finally {
                setLoading(false);
            }
        };

        fetchCounters();
    }, []);

    const filterOrder: StatusFilterType[] = [
        'all',
        ProtocolStatus.IN_PROGRESS,
        ProtocolStatus.READY_FOR_PICKUP,
        ProtocolStatus.SCHEDULED,
        ProtocolStatus.COMPLETED,
        ProtocolStatus.CANCELLED
    ];

    return (
        <FiltersContainer>
            <FiltersGrid>
                {filterOrder.map((status) => {
                    const config = statusConfig[status];
                    const count = counters[status] || 0;
                    const isActive = activeStatus === status;

                    return (
                        <FilterCard
                            key={status}
                            $active={isActive}
                            $color={config.color}
                            $lightColor={config.lightColor}
                            onClick={() => onStatusChange(status)}
                        >
                            <FilterContent>
                                <FilterLabel>{config.label}</FilterLabel>
                                <FilterCounter $active={isActive} $color={config.color}>
                                    {loading ? (
                                        <CounterLoader $color={config.color} />
                                    ) : (
                                        count
                                    )}
                                </FilterCounter>
                            </FilterContent>

                            {isActive && (
                                <ActiveIndicator $color={config.color} />
                            )}
                        </FilterCard>
                    );
                })}
            </FiltersGrid>
        </FiltersContainer>
    );
};

const FiltersContainer = styled.div`
  padding: 24px;
  background: ${brandTheme.surface};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const FilterCard = styled.div<{
    $active: boolean;
    $color: string;
    $lightColor: string;
}>`
  position: relative;
  background: ${props => props.$active ? props.$lightColor : brandTheme.surface};
  border: 2px solid ${props => props.$active ? props.$color : brandTheme.border};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    border-color: ${props => props.$color};
    background: ${props => props.$active ? props.$lightColor : props.$lightColor};
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const FilterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const FilterLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  flex: 1;
`;

const FilterCounter = styled.div<{ $active: boolean; $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 12px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 8px;
  background: ${props => props.$active ? props.$color : brandTheme.surfaceAlt};
  color: ${props => props.$active ? 'white' : 'black'};
  transition: all 0.2s ease;
  box-shadow: ${props => props.$active ? `0 2px 8px ${props.$color}40` : 'none'};
`;

const CounterLoader = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  border: 2px solid ${props => props.$color}30;
  border-radius: 50%;
  border-top-color: ${props => props.$color};
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ActiveIndicator = styled.div<{ $color: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, ${props => props.$color} 0%, ${props => props.$color} 100%);
  border-radius: 0 2px 2px 0;
`;