import React from 'react';
import { FormActions as ActionsContainer, Button } from '../styles/styles';

interface FormActionsProps {
    onCancel: () => void;
    isLoading: boolean;
    isEditing: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
                                                     onCancel,
                                                     isLoading,
                                                     isEditing
                                                 }) => {
    return (
        <ActionsContainer>
            <Button type="button" secondary onClick={onCancel}>
                Anuluj
            </Button>
            <Button type="submit" primary disabled={isLoading}>
                {isLoading
                    ? 'Zapisywanie...'
                    : (isEditing ? 'Zapisz zmiany' : 'Utwórz protokół')
                }
            </Button>
        </ActionsContainer>
    );
};

export default FormActions;