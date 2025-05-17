import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FilterButtons, FilterButton } from '../styles';
import { protocolsApi } from '../../../api/protocolsApi';
import { ProtocolStatus } from '../../../types';

export type FilterType = 'Zaplanowane' | 'W realizacji' | 'Oczekujące na odbiór' | 'Archiwum' | 'Wszystkie' | 'Porzucone';

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
    'Wszystkie': 'all',
    'Porzucone': 'cancelled'
};

export const ProtocolFilters: React.FC<ProtocolFiltersProps> = ({ activeFilter, onFilterChange }) => {
    const [counters, setCounters] = useState<Record<string, number>>({
        'Zaplanowane': 0,
        'W realizacji': 0,
        'Oczekujące na odbiór': 0,
        'Archiwum': 0,
        'Wszystkie': 0,
        'Porzucone': 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounters = async () => {
            setLoading(true);
            try {
                const data = await protocolsApi.getProtocolCounters();

                // Mapowanie liczników na filtry - używamy nazw pól, jakie faktycznie przychodzą z serwera
                setCounters({
                    'Zaplanowane': data.scheduled || 0,
                    'W realizacji': data.in_progress || 0,
                    'Oczekujące na odbiór': data.ready_for_pickup || 0,
                    'Archiwum': data.completed || 0,
                    'Wszystkie': data.all || 0,
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

    return (
        <FilterButtons>
            <FilterButton
                active={activeFilter === 'W realizacji'}
                onClick={() => onFilterChange('W realizacji')}
            >
                W realizacji
                <Counter active={activeFilter === 'W realizacji'}>
                    {loading ? <CounterLoader /> : counters['W realizacji']}
                </Counter>
            </FilterButton>
            <FilterButton
                active={activeFilter === 'Oczekujące na odbiór'}
                onClick={() => onFilterChange('Oczekujące na odbiór')}
            >
                Oczekujące na odbiór
                <Counter active={activeFilter === 'Oczekujące na odbiór'}>
                    {loading ? <CounterLoader /> : counters['Oczekujące na odbiór']}
                </Counter>
            </FilterButton>
            <FilterButton
                active={activeFilter === 'Zaplanowane'}
                onClick={() => onFilterChange('Zaplanowane')}
            >
                Zaplanowane
                <Counter active={activeFilter === 'Zaplanowane'}>
                    {loading ? <CounterLoader /> : counters['Zaplanowane']}
                </Counter>
            </FilterButton>
            <FilterButton
                active={activeFilter === 'Wszystkie'}
                onClick={() => onFilterChange('Wszystkie')}
            >
                Wszystkie
                <Counter active={activeFilter === 'Wszystkie'}>
                    {loading ? <CounterLoader /> : counters['Wszystkie']}
                </Counter>
            </FilterButton>
            <FilterButton
                active={activeFilter === 'Archiwum'}
                onClick={() => onFilterChange('Archiwum')}
            >
                Archiwum
                <Counter active={activeFilter === 'Archiwum'}>
                    {loading ? <CounterLoader /> : counters['Archiwum']}
                </Counter>
            </FilterButton>
            <FilterButton
                active={activeFilter === 'Porzucone'}
                onClick={() => onFilterChange('Porzucone')}
            >
                Porzucone
                <Counter active={activeFilter === 'Porzucone'}>
                    {loading ? <CounterLoader /> : counters['Porzucone']}
                </Counter>
            </FilterButton>
        </FilterButtons>
    );
};

// Stylizowane komponenty
const Counter = styled.span<{ active: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 8px;
    margin-left: 8px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 12px;
    background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.08)'};
    color: ${props => props.active ? 'white' : '#666'};
    transition: all 0.2s ease;
    box-shadow: ${props => props.active
            ? '0 1px 3px rgba(0, 0, 0, 0.2)'
            : 'inset 0 1px 2px rgba(0, 0, 0, 0.05)'};
`;

// Loader dla liczników
const CounterLoader = styled.div`
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: ${props => props.theme.main || '#3498db'};
    animation: spin 1s linear infinite;

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;