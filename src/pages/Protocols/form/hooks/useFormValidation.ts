// src/pages/Protocols/form/hooks/useFormValidation.ts - ZAKTUALIZOWANA WERSJA
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

        if (formData.ownerName && formData.ownerName?.split(' ').length < 2) {
            newErrors.ownerName = 'Podaj pełne imię i nazwisko właściciela';
        }

        if (!formData.email?.trim() && !formData.phone?.trim()) {
            newErrors.contactInfo = 'Podaj przynajmniej jeden sposób kontaktu (email lub telefon)';
        } else {
            if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Podaj prawidłowy adres email';
            }
        }

        // NOWA: Walidacja delivery person
        if (formData.deliveryPerson !== null && formData.deliveryPerson !== undefined) {
            // Jeśli deliveryPerson jest ustawiony (checkbox zaznaczony)
            if (!formData.deliveryPerson.name?.trim()) {
                newErrors.deliveryPersonName = 'Imię i nazwisko osoby odbierającej jest wymagane';
            } else if (formData.deliveryPerson.name.split(' ').length < 2) {
                newErrors.deliveryPersonName = 'Podaj pełne imię i nazwisko osoby odbierającej';
            }

            if (!formData.deliveryPerson.phone?.trim()) {
                newErrors.deliveryPersonPhone = 'Numer telefonu osoby odbierającej jest wymagany';
            } else {
                // Podstawowa walidacja numeru telefonu
                const phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,15}$/;
                if (!phoneRegex.test(formData.deliveryPerson.phone.trim())) {
                    newErrors.deliveryPersonPhone = 'Podaj prawidłowy numer telefonu';
                }
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