// src/pages/Settings/components/companySettings/ErrorOverlay.tsx
import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import {
    OverlayContainer,
    ErrorIcon,
    ErrorTitle,
    ErrorMessage,
    RetryButton
} from '../../styles/companySettings/Overlays.styles';

interface ErrorOverlayProps {
    error: string;
    onRetry?: () => void;
}

export const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ error, onRetry }) => {
    return (
        <OverlayContainer>
            <ErrorIcon>
                <FaExclamationTriangle />
            </ErrorIcon>
            <ErrorTitle>Wystąpił błąd</ErrorTitle>
            <ErrorMessage>{error}</ErrorMessage>
            {onRetry && (
                <RetryButton onClick={onRetry}>
                    <FaRedo />
                    Spróbuj ponownie
                </RetryButton>
            )}
        </OverlayContainer>
    );
};