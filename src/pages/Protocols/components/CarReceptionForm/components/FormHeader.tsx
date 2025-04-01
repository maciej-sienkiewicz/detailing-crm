import React from 'react';
import { FormHeader as HeaderContainer } from '../styles/styles';

interface FormHeaderProps {
    isEditing: boolean;
    appointmentId?: string;
    isFullProtocol?: boolean;
}

const FormHeader: React.FC<FormHeaderProps> = ({ isEditing, appointmentId, isFullProtocol = true }) => {
    // Przygotowanie tytułu na podstawie kontekstu
    let title;

    if (isEditing) {
        title = 'Rozpoczęcie wizyty';
    } else if (appointmentId) {
        title = 'Rozpoczęcie wizyty';
    } else if (!isFullProtocol) {
        title = 'Rezerwacja wizyty';
    } else {
        title = 'Rezerwacja wizyty';
    }

    return (
        <HeaderContainer>
            <h2>{title}</h2>
        </HeaderContainer>
    );
};

export default FormHeader;