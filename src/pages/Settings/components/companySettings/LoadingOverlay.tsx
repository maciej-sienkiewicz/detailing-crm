// src/pages/Settings/components/companySettings/LoadingOverlay.tsx
import React from 'react';
import {
    OverlayContainer,
    LoadingSpinnerLarge,
    LoadingText
} from '../../styles/companySettings/Overlays.styles';

export const LoadingOverlay: React.FC = () => {
    return (
        <OverlayContainer>
            <LoadingSpinnerLarge />
            <LoadingText>Ładowanie ustawień firmy...</LoadingText>
        </OverlayContainer>
    );
};