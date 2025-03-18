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
        title = 'Edycja protokołu przyjęcia pojazdu';
    } else if (appointmentId) {
        title = 'Nowy protokół przyjęcia pojazdu (z wizyty)';
    } else if (!isFullProtocol) {
        title = 'Nowa rezerwacja wizyty';
    } else {
        title = 'Nowy protokół przyjęcia pojazdu';
    }

    return (
        <HeaderContainer>
            <h2>{title}</h2>
        </HeaderContainer>
    );
};

export default FormHeader;