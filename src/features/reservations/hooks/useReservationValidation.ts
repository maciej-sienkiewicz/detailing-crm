// src/features/reservations/hooks/useReservationValidation.ts
/**
 * Validation hook for reservation form
 * Simplified validation - only essential fields required
 */

import { useState } from 'react';
import { ReservationFormData, ReservationFormErrors } from '../libs/types';
import { isValidPhoneNumber } from '../libs/utils';

export const useReservationValidation = (formData: ReservationFormData) => {
    const [errors, setErrors] = useState<ReservationFormErrors>({});

    const validateForm = (): boolean => {
        const newErrors: ReservationFormErrors = {};

        // Title validation (optional - will be auto-generated if empty)
        if (formData.title && formData.title.length > 100) {
            newErrors.title = 'Tytuł nie może przekraczać 100 znaków';
        }

        // Calendar color validation (required)
        if (!formData.calendarColorId || formData.calendarColorId.trim() === '') {
            newErrors.calendarColorId = 'Wybór koloru jest wymagany';
        }

        // Contact phone validation (required)
        if (!formData.contactPhone || formData.contactPhone.trim() === '') {
            newErrors.contactPhone = 'Numer telefonu jest wymagany';
        } else if (!isValidPhoneNumber(formData.contactPhone)) {
            newErrors.contactPhone = 'Podaj prawidłowy numer telefonu (9-11 cyfr)';
        }

        // Contact name validation (optional, but if provided should have at least 2 characters)
        if (formData.contactName && formData.contactName.trim().length > 0) {
            if (formData.contactName.trim().length < 2) {
                newErrors.contactName = 'Imię musi zawierać co najmniej 2 znaki';
            }
        }

        // Vehicle make validation (required)
        if (!formData.vehicleMake || formData.vehicleMake.trim() === '') {
            newErrors.vehicleMake = 'Marka pojazdu jest wymagana';
        }

        // Vehicle model validation (required)
        if (!formData.vehicleModel || formData.vehicleModel.trim() === '') {
            newErrors.vehicleModel = 'Model pojazdu jest wymagany';
        }

        // Start date validation (required)
        if (!formData.startDate) {
            newErrors.startDate = 'Data rozpoczęcia jest wymagana';
        }

        // End date validation (required if provided, must be after start date)
        if (formData.endDate) {
            if (formData.startDate) {
                const startDateObj = new Date(formData.startDate);
                const endDateObj = new Date(formData.endDate);

                if (endDateObj < startDateObj) {
                    newErrors.endDate = 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia';
                }
            }
        }

        // Services validation (at least one service recommended but not required)
        // This is a soft validation - we don't block submission
        if (!formData.selectedServices || formData.selectedServices.length === 0) {
            // Just a warning, not a blocking error
            console.info('ℹ️ No services selected for reservation');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearFieldError = (fieldName: string) => {
        if (errors[fieldName as keyof ReservationFormErrors]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName as keyof ReservationFormErrors];
                return newErrors;
            });
        }
    };

    const clearAllErrors = () => {
        setErrors({});
    };

    return {
        errors,
        validateForm,
        clearFieldError,
        clearAllErrors,
        setErrors
    };
};