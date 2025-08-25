// ClientListTable/EmptyState.tsx
import React from 'react';
import {FaList} from 'react-icons/fa';
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
                <FaList />
            </EmptyStateIcon>
            <EmptyStateTitle>Brak klientów</EmptyStateTitle>
            <EmptyStateDescription>
                Nie znaleziono żadnych klientów w bazie danych
            </EmptyStateDescription>
            <EmptyStateAction>
                Kliknij "Dodaj klienta", aby utworzyć pierwszy wpis
            </EmptyStateAction>
        </EmptyStateContainer>
    );
};