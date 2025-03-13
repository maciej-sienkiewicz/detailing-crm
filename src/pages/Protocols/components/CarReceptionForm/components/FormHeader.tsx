import React from 'react';
import { FormHeader as HeaderContainer } from '../styles/styles';

interface FormHeaderProps {
    isEditing: boolean;
    appointmentId?: string;
}

const FormHeader: React.FC<FormHeaderProps> = ({ isEditing, appointmentId }) => {
    // Przygotowanie tytułu na podstawie kontekstu
    let title = isEditing
        ? 'Edycja protokołu przyjęcia pojazdu'
        : appointmentId
            ? 'Nowy protokół przyjęcia pojazdu (z wizyty)'
            : 'Nowy protokół przyjęcia pojazdu';

    return (
        <HeaderContainer>
            <h2>{title}</h2>
        </HeaderContainer>
    );
};

export default FormHeader;