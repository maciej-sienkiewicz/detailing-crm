import React from 'react';
import {FaCar} from 'react-icons/fa';
import {
    EmptyStateAction,
    EmptyStateContainer,
    EmptyStateDescription,
    EmptyStateIcon,
    EmptyStateTitle
} from './styles/components';

export const EmptyState: React.FC = () => {
    return (
        <EmptyStateContainer>
            <EmptyStateIcon>
                <FaCar />
            </EmptyStateIcon>
            <EmptyStateTitle>Brak pojazdów</EmptyStateTitle>
            <EmptyStateDescription>
                Nie znaleziono żadnych pojazdów w bazie danych
            </EmptyStateDescription>
            <EmptyStateAction>
                Kliknij "Dodaj pojazd", aby utworzyć pierwszy wpis
            </EmptyStateAction>
        </EmptyStateContainer>
    );
};