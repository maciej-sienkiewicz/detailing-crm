import React from 'react';
import { LoadingContainer, LoadingSpinner, LoadingText, ErrorContainer, ErrorMessage, BackButton } from './VehicleDetailStyles';

export const LoadingDisplay: React.FC = () => (
    <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Ładowanie szczegółów pojazdu...</LoadingText>
    </LoadingContainer>
);

interface ErrorDisplayProps {
    message: string;
    onBack: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onBack }) => (
    <ErrorContainer>
        <ErrorMessage>{message}</ErrorMessage>
        <BackButton onClick={onBack}>
            Wróć do listy pojazdów
        </BackButton>
    </ErrorContainer>
);