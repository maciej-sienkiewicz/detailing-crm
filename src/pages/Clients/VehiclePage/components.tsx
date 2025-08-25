import React from 'react';
import {LoadingContainer, LoadingSpinner, LoadingText} from './styles';

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