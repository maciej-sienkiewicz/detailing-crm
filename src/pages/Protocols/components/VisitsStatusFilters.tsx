import React from 'react';
import styled from 'styled-components';
import {ProtocolStatus} from '../../../types';
import {theme} from '../../../styles/theme';

type StatusFilterType = 'all' | ProtocolStatus;

interface StatusFilterConfig {
    label: string;
    color: string;
    lightColor: string;
}

const statusConfig: Record<StatusFilterType, StatusFilterConfig> = {
    [ProtocolStatus.SCHEDULED]: {
        label: 'Zaplanowane',
        color: theme.info,
        lightColor: theme.infoBg
    },
    [ProtocolStatus.IN_PROGRESS]: {
        label: 'W realizacji',
        color: '#9b59b6',
        lightColor: 'rgba(155, 89, 182, 0.1)'
    },
    [ProtocolStatus.READY_FOR_PICKUP]: {
        label: 'Gotowe do odbioru',
        color: theme.success,
        lightColor: theme.successBg
    },
    [ProtocolStatus.COMPLETED]: {
        label: 'Zakończone',
        color: theme.text.tertiary,
        lightColor: 'rgba(100, 116, 139, 0.1)'
    },
    [ProtocolStatus.CANCELLED]: {
        label: 'Porzucone',
        color: theme.error,
        lightColor: theme.errorBg
    },
    all: {
        label: 'Wszystkie',
        color: theme.primary,
        lightColor: theme.primaryGhost
    },
};

interface VisitsStatusFiltersProps {
    activeStatus: StatusFilterType;
    onStatusChange: (status: StatusFilterType) => void;
    counters: Record<string, number>;
    loading: boolean;
}

export const VisitsStatusFilters: React.FC<VisitsStatusFiltersProps> = ({
                                                                            activeStatus,
                                                                            onStatusChange,
                                                                            counters,
                                                                            loading
                                                                        }) => {
    const filterOrder: StatusFilterType[] = [
        ProtocolStatus.SCHEDULED,
        ProtocolStatus.IN_PROGRESS,
        ProtocolStatus.READY_FOR_PICKUP,
        ProtocolStatus.COMPLETED,
        ProtocolStatus.CANCELLED,
        'all',
    ];

    const handleFilterClick = (status: StatusFilterType) => {
        if (status !== activeStatus) {
            onStatusChange(status);
        }
    };

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
                            onClick={() => handleFilterClick(status)}
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
    padding: ${theme.spacing.xl};
    background: ${theme.surface};
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: ${theme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.lg};
    }
`;

const FilterCard = styled.div<{
    $active: boolean;
    $color: string;
    $lightColor: string;
}>`
    position: relative;
    background: ${props => props.$active ? props.$lightColor : theme.surface};
    border: 1px solid ${props => props.$active ? props.$color : theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    cursor: pointer;
    transition: all ${theme.transitions.normal};
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadow.md};
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
    gap: ${theme.spacing.md};
`;

const FilterLabel = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${theme.text.secondary};
    flex: 1;
`;

const FilterCounter = styled.div<{ $active: boolean; $color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 ${theme.spacing.md};
    font-size: 12px;
    font-weight: 700;
    border-radius: ${theme.radius.sm};
    background: ${props => props.$active ? props.$color : theme.surfaceAlt};
    color: ${props => props.$active ? 'white' : theme.text.primary};
    transition: all ${theme.transitions.normal};
    box-shadow: ${props => props.$active ? `0 2px 8px ${props.$color}40` : 'none'};
`;

const CounterLoader = styled.div<{ $color: string }>`
    width: 14px;
    height: 14px;
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
    width: 3px;
    height: 100%;
    background: linear-gradient(180deg, ${props => props.$color} 0%, ${props => props.$color} 100%);
    border-radius: 0 2px 2px 0;
`;