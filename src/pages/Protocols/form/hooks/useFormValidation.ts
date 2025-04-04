import { useState } from 'react';
import { CarReceptionProtocol } from '../../../../types';

export interface FormErrors {
    [key: string]: string;
}

export const useFormValidation = (formData: Partial<CarReceptionProtocol>) => {
    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Walidacja tytułu nie jest wymagana, ponieważ będzie generowany automatycznie
        // Możemy ewentualnie dodać walidację maksymalnej długości
        if (formData.title && formData.title.length > 100) {
            newErrors.title = 'Tytuł wizyty nie może przekraczać 100 znaków';
        }

        if (!formData.make?.trim()) {
            newErrors.make = 'Marka pojazdu jest wymagana';
        }

        if (!formData.model?.trim()) {
            newErrors.model = 'Model pojazdu jest wymagany';
        }

        if (!formData.ownerName?.trim()) {
            newErrors.ownerName = 'Imię i nazwisko właściciela jest wymagane';
        }

        if (!formData.email?.trim() && !formData.phone?.trim()) {
            newErrors.contactInfo = 'Podaj przynajmniej jeden sposób kontaktu (email lub telefon)';
        } else {
            if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Podaj prawidłowy adres email';
            }
        }

        // Walidacja daty rozpoczęcia
        if (!formData.startDate) {
            newErrors.startDate = 'Data rozpoczęcia usługi jest wymagana';
        }

        // Walidacja daty zakończenia
        if (!formData.endDate) {
            newErrors.endDate = 'Data zakończenia usługi jest wymagana';
        } else if (formData.startDate && formData.endDate) {
            // Porównujemy daty z uwzględnieniem godziny
            const startDateObj = new Date(formData.startDate);
            const endDateObj = new Date(formData.endDate);

            if (endDateObj < startDateObj) {
                newErrors.endDate = 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia';
            }
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