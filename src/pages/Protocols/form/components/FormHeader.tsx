// src/pages/Protocols/form/components/FormHeader.tsx
import React from 'react';
import {FormHeader as HeaderContainer} from '../styles';

interface FormHeaderProps {
    isEditing: boolean;
    appointmentId?: string;
    isFullProtocol?: boolean;
    title?: string; // Dodajemy opcjonalną właściwość title
}

const FormHeader: React.FC<FormHeaderProps> = ({
                                                   isEditing,
                                                   appointmentId,
                                                   isFullProtocol = true,
                                                   title
                                               }) => {
    // Przygotowanie tytułu na podstawie kontekstu
    let headerTitle;

    if (title) {
        // Jeśli przekazano właściwość title, użyj jej
        headerTitle = title;
    } else if (isEditing) {
        headerTitle = 'Rozpoczęcie wizyty';
    } else if (appointmentId) {
        headerTitle = 'Rozpoczęcie wizyty';
    } else if (!isFullProtocol) {
        headerTitle = 'Rezerwacja wizyty';
    } else {
        headerTitle = 'Rezerwacja wizyty';
    }

    return (
        <HeaderContainer>
            <h2>{headerTitle}</h2>
        </HeaderContainer>
    );
};

export default FormHeader;