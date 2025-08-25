import React from 'react';
import {Button, FormActions as ActionsContainer} from '../styles';

interface FormActionsProps {
    onCancel: () => void;
    isLoading: boolean;
    isEditing: boolean;
    isFullProtocol?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
                                                     onCancel,
                                                     isLoading,
                                                     isEditing,
                                                     isFullProtocol = true
                                                 }) => {
    return (
        <ActionsContainer>
            <Button type="button" secondary onClick={onCancel}>
                Anuluj
            </Button>
            <Button type="submit" primary disabled={isLoading}>
                {isLoading
                    ? 'Zapisywanie...'
                    : (isEditing ? 'Zapisz zmiany' : (isFullProtocol ? 'Utwórz protokół' : 'Zaplanuj wizytę'))
                }
            </Button>
        </ActionsContainer>
    );
};

export default FormActions;