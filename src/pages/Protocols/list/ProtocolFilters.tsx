// src/pages/Protocols/list/ProtocolFilters.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { protocolsApi } from '../../../api/protocolsApi';
import { ProtocolStatus } from '../../../types';

// Brand Theme System
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    accent: '#f8fafc',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0'
};

export type FilterType = 'Zaplanowane' | 'W realizacji' | 'Oczekujące na odbiór' | 'Archiwum' | 'Porzucone';

interface ProtocolFiltersProps {
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

// Mapowanie nazw filtrów na statusy protokołów
const filterToStatusMap: Record<FilterType, string> = {
    'Zaplanowane': 'scheduled',
    'W realizacji': 'in_progress',
    'Oczekujące na odbiór': 'ready_for_pickup',
    'Archiwum': 'completed',
    'Porzucone': 'cancelled'
};

// Konfiguracja kolorów dla różnych filtrów
const filterConfig = {
    'W realizacji': {
        color: '#8b5cf6',
        lightColor: 'rgba(139, 92, 246, 0.1)',
        darkColor: '#7c3aed'
    },
    'Oczekujące na odbiór': {
        color: '#10b981',
        lightColor: 'rgba(16, 185, 129, 0.1)',
        darkColor: '#059669'
    },
    'Zaplanowane': {
        color: '#3b82f6',
        lightColor: 'rgba(59, 130, 246, 0.1)',
        darkColor: '#2563eb'
    },
    'Archiwum': {
        color: '#6b7280',
        lightColor: 'rgba(107, 114, 128, 0.1)',
        darkColor: '#4b5563'
    },
    'Porzucone': {
        color: '#ef4444',
        lightColor: 'rgba(239, 68, 68, 0.1)',
        darkColor: '#dc2626'
    }
};

export const ProtocolFilters: React.FC<ProtocolFiltersProps> = ({ activeFilter, onFilterChange }) => {
    const [counters, setCounters] = useState<Record<string, number>>({
        'Zaplanowane': 0,
        'W realizacji': 0,
        'Oczekujące na odbiór': 0,
        'Archiwum': 0,
        'Porzucone': 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounters = async () => {
            setLoading(true);
            try {
                const data = await protocolsApi.getProtocolCounters();
                setCounters({
                    'Zaplanowane': data.scheduled || 0,
                    'W realizacji': data.inProgress || 0,
                    'Oczekujące na odbiór': data.readyForPickup || 0,
                    'Archiwum': data.completed || 0,
                    'Porzucone': data.cancelled || 0
                });
            } catch (error) {
                console.error('Błąd podczas pobierania liczników:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCounters();
    }, []);

    const filterOrder: FilterType[] = ['W realizacji', 'Oczekujące na odbiór', 'Zaplanowane', 'Archiwum', 'Porzucone'];

    return (
        <FiltersContainer>
            <FiltersGrid>
                {filterOrder.map((filter) => {
                    const config = filterConfig[filter];
                    const count = counters[filter];
                    const isActive = activeFilter === filter;

                    return (
                        <FilterCard
                            key={filter}
                            $active={isActive}
                            $color={config.color}
                            $lightColor={config.lightColor}
                            $darkColor={config.darkColor}
                            onClick={() => onFilterChange(filter)}
                        >
                            <FilterContent>
                                <FilterLabel>{filter}</FilterLabel>
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

// Styled Components
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
    $darkColor: string;
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
    color: ${props => props.$active ? 'white' : props.$color};
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
    background: linear-gradient(180deg, ${props => props.$color} 0%, ${props => props.$color}80 100%);
    border-radius: 0 2px 2px 0;
`;