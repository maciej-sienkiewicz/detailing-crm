// src/pages/Protocols/form/components/CreateReservationForm.tsx
/**
 * Simplified form for creating reservations
 * Only collects minimal data: phone, dates, vehicle info, notes
 */

import React, { useState, useEffect } from 'react';
import { FaPhone, FaUser, FaCar, FaStickyNote } from 'react-icons/fa';
import {
    Form,
    FormContainer,
    FormSection,
    SectionTitle,
    FormRow,
    FormGroup,
    Label,
    Input,
    Textarea,
    FormActions,
    Button,
    ErrorMessage,
    ErrorText,
    brandTheme
} from '../styles';
import VisitTitleSection from './VisitTitleSection';
import { CreateReservationRequest } from '../../../../api/reservationsApi';
import { LabelWithBadge } from './LabelWithBadge';
import { BrandAutocomplete } from '../../components/BrandAutocomplete';

interface CreateReservationFormProps {
    initialData?: Partial<CreateReservationRequest>;
    onSubmit: (data: CreateReservationRequest) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

interface FormErrors {
    [key: string]: string;
}

export const CreateReservationForm: React.FC<CreateReservationFormProps> = ({
                                                                                initialData,
                                                                                onSubmit,
                                                                                onCancel,
                                                                                loading = false
                                                                            }) => {
    const [formData, setFormData] = useState<CreateReservationRequest>(() => {
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;

        return {
            title: initialData?.title || '',
            contactPhone: initialData?.contactPhone || '',
            contactName: initialData?.contactName || '',
            vehicleMake: initialData?.vehicleMake || '',
            vehicleModel: initialData?.vehicleModel || '',
            startDate: initialData?.startDate || `${currentDate}T${currentTime}:00`,
            endDate: initialData?.endDate || `${currentDate}T23:59:59`,
            notes: initialData?.notes || '',
            calendarColorId: initialData?.calendarColorId || ''
        };
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Phone is required
        if (!formData.contactPhone?.trim()) {
            newErrors.contactPhone = 'Numer telefonu jest wymagany';
        } else {
            // Basic phone validation
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,15}$/;
            if (!phoneRegex.test(formData.contactPhone.trim())) {
                newErrors.contactPhone = 'Podaj prawidłowy numer telefonu';
            }
        }

        // Vehicle make is required
        if (!formData.vehicleMake?.trim()) {
            newErrors.vehicleMake = 'Marka pojazdu jest wymagana';
        }

        // Vehicle model is required
        if (!formData.vehicleModel?.trim()) {
            newErrors.vehicleModel = 'Model pojazdu jest wymagany';
        }

        // Start date is required
        if (!formData.startDate) {
            newErrors.startDate = 'Data rozpoczęcia jest wymagana';
        }

        // Calendar color is required
        if (!formData.calendarColorId) {
            newErrors.calendarColorId = 'Kolor w kalendarzu jest wymagany';
        }

        // Validate date range
        if (formData.startDate && formData.endDate) {
            const startDateObj = new Date(formData.startDate);
            const endDateObj = new Date(formData.endDate);

            if (endDateObj < startDateObj) {
                newErrors.endDate = 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!validateForm()) {
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('❌ Error submitting reservation:', error);
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : 'Nie udało się utworzyć rezerwacji. Spróbuj ponownie.'
            );
        }
    };

    const extractDateFromISO = (dateString: string): string => {
        if (!dateString) return '';
        try {
            let cleanedDate = dateString.replace('Z', '').split('.')[0];
            if (cleanedDate.includes('T')) {
                return cleanedDate.split('T')[0];
            }
            if (cleanedDate.includes(' ')) {
                return cleanedDate.split(' ')[0];
            }
            if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedDate)) {
                return cleanedDate;
            }
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
            return '';
        } catch (e) {
            console.warn('⚠️ Błąd podczas parsowania daty:', dateString, e);
            return '';
        }
    };

    const extractTimeFromISO = (dateString: string, defaultTime = '08:00'): string => {
        if (!dateString) return defaultTime;
        try {
            let cleanedDate = dateString.replace('Z', '').split('.')[0];
            if (cleanedDate.includes('T')) {
                const timePart = cleanedDate.split('T')[1];
                if (timePart) {
                    return timePart.substring(0, 5);
                }
            }
            if (cleanedDate.includes(' ')) {
                const timePart = cleanedDate.split(' ')[1];
                if (timePart) {
                    return timePart.substring(0, 5);
                }
            }
            return defaultTime;
        } catch (e) {
            return defaultTime;
        }
    };

    return (
        <FormContainer>
            {submitError && <ErrorMessage>{submitError}</ErrorMessage>}

            <Form onSubmit={handleSubmit}>
                <VisitTitleSection
                    title={formData.title || ''}
                    selectedColorId={formData.calendarColorId}
                    onChange={handleChange}
                    error={errors.title || errors.calendarColorId}
                />

                {/* Contact Information */}
                <FormSection>
                    <SectionTitle>Dane kontaktowe</SectionTitle>
                    <FormRow className="responsive-row">
                        <FormGroup>
                            <LabelWithBadge
                                htmlFor="contactPhone"
                                required={true}
                                badgeVariant="modern"
                            >
                                Numer telefonu kontaktowego
                            </LabelWithBadge>
                            <Input
                                id="contactPhone"
                                name="contactPhone"
                                type="tel"
                                value={formData.contactPhone}
                                onChange={handleChange}
                                placeholder="np. +48 123 456 789"
                                required
                                $hasError={!!errors.contactPhone}
                            />
                            {errors.contactPhone && (
                                <ErrorText>{errors.contactPhone}</ErrorText>
                            )}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="contactName">
                                Nazwa kontaktu (opcjonalnie)
                            </Label>
                            <Input
                                id="contactName"
                                name="contactName"
                                value={formData.contactName || ''}
                                onChange={handleChange}
                                placeholder="np. Jan Kowalski"
                            />
                        </FormGroup>
                    </FormRow>
                </FormSection>

                {/* Vehicle Information */}
                <FormSection>
                    <SectionTitle>Informacje o pojeździe</SectionTitle>
                    <FormRow className="responsive-row">
                        <FormGroup>
                            <LabelWithBadge
                                htmlFor="vehicleMake"
                                required={true}
                                badgeVariant="modern"
                            >
                                Marka pojazdu
                            </LabelWithBadge>
                            <BrandAutocomplete
                                value={formData.vehicleMake}
                                onChange={(value) => {
                                    const syntheticEvent = {
                                        target: {
                                            name: 'vehicleMake',
                                            value: value,
                                            type: 'text'
                                        }
                                    } as React.ChangeEvent<HTMLInputElement>;
                                    handleChange(syntheticEvent);
                                }}
                                placeholder="Wybierz lub wpisz markę"
                                required
                                error={errors.vehicleMake}
                            />
                        </FormGroup>

                        <FormGroup>
                            <LabelWithBadge
                                htmlFor="vehicleModel"
                                required={true}
                                badgeVariant="modern"
                            >
                                Model pojazdu
                            </LabelWithBadge>
                            <Input
                                id="vehicleModel"
                                name="vehicleModel"
                                value={formData.vehicleModel}
                                onChange={handleChange}
                                placeholder="np. A6, Golf, Corolla"
                                required
                                $hasError={!!errors.vehicleModel}
                            />
                            {errors.vehicleModel && (
                                <ErrorText>{errors.vehicleModel}</ErrorText>
                            )}
                        </FormGroup>
                    </FormRow>
                </FormSection>

                {/* Schedule */}
                <FormSection>
                    <SectionTitle>Termin rezerwacji</SectionTitle>
                    <FormRow className="responsive-row">
                        <FormGroup className="date-time-group">
                            <LabelWithBadge
                                htmlFor="startDate"
                                required={true}
                                badgeVariant="modern"
                            >
                                Data i godzina rozpoczęcia
                            </LabelWithBadge>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto',
                                gap: brandTheme.spacing.sm
                            }}>
                                <Input
                                    id="startDate"
                                    name="startDate"
                                    type="date"
                                    value={extractDateFromISO(formData.startDate)}
                                    onChange={(e) => {
                                        const date = e.target.value;
                                        const time = extractTimeFromISO(formData.startDate, '08:00');
                                        const newDateTime = `${date}T${time}:00`;
                                        const syntheticEvent = {
                                            target: {
                                                name: 'startDate',
                                                value: newDateTime,
                                                type: 'text'
                                            }
                                        } as React.ChangeEvent<HTMLInputElement>;
                                        handleChange(syntheticEvent);
                                    }}
                                    required
                                    $hasError={!!errors.startDate}
                                />
                                <Input
                                    id="startTime"
                                    name="startTime"
                                    type="time"
                                    value={extractTimeFromISO(formData.startDate, '08:00')}
                                    onChange={(e) => {
                                        const date = extractDateFromISO(formData.startDate);
                                        const newDateTime = `${date}T${e.target.value}:00`;
                                        const syntheticEvent = {
                                            target: {
                                                name: 'startDate',
                                                value: newDateTime,
                                                type: 'text'
                                            }
                                        } as React.ChangeEvent<HTMLInputElement>;
                                        handleChange(syntheticEvent);
                                    }}
                                    required
                                    style={{ width: '120px' }}
                                />
                            </div>
                            {errors.startDate && (
                                <ErrorText>{errors.startDate}</ErrorText>
                            )}
                        </FormGroup>

                        <FormGroup>
                            <LabelWithBadge
                                htmlFor="endDate"
                                required={false}
                                badgeVariant="modern"
                            >
                                Data zakończenia
                            </LabelWithBadge>
                            <Input
                                id="endDate"
                                name="endDate"
                                type="date"
                                value={extractDateFromISO(formData.endDate || '')}
                                onChange={(e) => {
                                    const newDateTime = e.target.value ? `${e.target.value}T23:59:59` : '';
                                    const syntheticEvent = {
                                        target: {
                                            name: 'endDate',
                                            value: newDateTime,
                                            type: 'text'
                                        }
                                    } as React.ChangeEvent<HTMLInputElement>;
                                    handleChange(syntheticEvent);
                                }}
                                $hasError={!!errors.endDate}
                            />
                            {errors.endDate && (
                                <ErrorText>{errors.endDate}</ErrorText>
                            )}
                        </FormGroup>
                    </FormRow>
                </FormSection>

                {/* Notes */}
                <FormSection>
                    <SectionTitle>Uwagi</SectionTitle>
                    <FormGroup>
                        <Label htmlFor="notes">Uwagi do rezerwacji (opcjonalnie)</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            value={formData.notes || ''}
                            onChange={handleChange}
                            placeholder="Dodatkowe informacje, uwagi..."
                            rows={4}
                        />
                    </FormGroup>
                </FormSection>

                {/* Form Actions */}
                <FormActions>
                    <Button type="button" secondary onClick={onCancel}>
                        Anuluj
                    </Button>
                    <Button type="submit" primary disabled={loading}>
                        {loading ? 'Zapisywanie...' : 'Utwórz rezerwację'}
                    </Button>
                </FormActions>
            </Form>
        </FormContainer>
    );
};

export default CreateReservationForm;