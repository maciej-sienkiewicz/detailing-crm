import { useState } from 'react';
import { CarReceptionProtocol } from '../../../../../types';

export interface FormErrors {
    [key: string]: string;
}

export const useFormValidation = (formData: Partial<CarReceptionProtocol>) => {
    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.make?.trim()) {
            newErrors.make = 'Marka pojazdu jest wymagana';
        }

        if (!formData.model?.trim()) {
            newErrors.model = 'Model pojazdu jest wymagany';
        }

        if (!formData.productionYear || formData.productionYear < 1900 || formData.productionYear > new Date().getFullYear() + 1) {
            newErrors.productionYear = 'Podaj prawidłowy rok produkcji';
        }

        if (!formData.mileage && formData.mileage !== 0) {
            newErrors.mileage = 'Przebieg jest wymagany';
        }

        if (!formData.ownerName?.trim()) {
            newErrors.ownerName = 'Imię i nazwisko właściciela jest wymagane';
        }

        if (!formData.email?.trim()) {
            newErrors.email = 'Adres email jest wymagany';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Podaj prawidłowy adres email';
        }

        if (!formData.phone?.trim()) {
            newErrors.phone = 'Numer telefonu jest wymagany';
        }

        if (!formData.startDate) {
            newErrors.startDate = 'Data rozpoczęcia usługi jest wymagana';
        }

        if (!formData.endDate) {
            newErrors.endDate = 'Data zakończenia usługi jest wymagana';
        } else if (formData.startDate && formData.endDate < formData.startDate) {
            newErrors.endDate = 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearFieldError = (fieldName: string) => {
        if (errors[fieldName]) {
            setErrors({
                ...errors,
                [fieldName]: ''
            });
        }
    };

    return {
        errors,
        validateForm,
        clearFieldError,
        setErrors
    };
};