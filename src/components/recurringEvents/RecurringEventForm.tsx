// src/components/recurringEvents/RecurringEventForm.tsx - ZREFAKTORYZOWANY
/**
 * Main Recurring Event Form Component - SIMPLIFIED VERSION
 * Orchestrates the form views and delegates logic to custom hook
 */

import React from 'react';
import {
    CreateRecurringEventRequest,
    RecurringEventResponse
} from '../../types/recurringEvents';
import { useRecurringEventForm } from './hooks/useRecurringEventForm';
import { EditFormView } from './views/EditFormView';
import { CreateFormView } from './views/CreateFormView';

interface RecurringEventFormProps {
    mode: 'create' | 'edit';
    initialData?: RecurringEventResponse;
    onSubmit: (data: CreateRecurringEventRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const RecurringEventForm: React.FC<RecurringEventFormProps> = ({
                                                                   mode,
                                                                   initialData,
                                                                   onSubmit,
                                                                   onCancel,
                                                                   isLoading = false
                                                               }) => {
    const {
        // Form instances
        limitedEditForm,
        fullForm,

        // State
        currentStep,
        setCurrentStep,
        isLimitedEdit,
        watchedType,
        isFormValidForSubmit,

        // Handlers
        handleCustomSubmit,
        handleFormSubmit,
        canProceedToStepWrapper
    } = useRecurringEventForm({
        mode,
        initialData,
        onSubmit
    });

    // Render appropriate view based on mode
    if (isLimitedEdit && initialData) {
        return (
            <EditFormView
                initialData={initialData}
                form={limitedEditForm}
                onSubmit={handleFormSubmit}
                onCancel={onCancel}
                isLoading={isLoading}
            />
        );
    }

    return (
        <CreateFormView
            form={fullForm}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            watchedType={watchedType}
            canProceedToStep={canProceedToStepWrapper}
            isFormValidForSubmit={isFormValidForSubmit}
            onSubmit={handleCustomSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
        />
    );
};

export default RecurringEventForm;