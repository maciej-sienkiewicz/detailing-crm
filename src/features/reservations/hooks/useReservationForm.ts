// src/features/reservations/hooks/useReservationForm.ts
/**
 * Main hook for reservation form state management
 */

import { useCallback, useEffect, useState } from 'react';
import { ReservationFormData } from '../libs/types';
import { useReservationValidation } from './useReservationValidation';
import { formatPhoneNumber, generateReservationTitle } from '../libs/utils';
import {ReservationSelectedServiceInput} from "../api/reservationsApi";

interface UseReservationFormProps {
    initialStartDate?: string;
    initialEndDate?: string;
}

export const useReservationForm = ({ initialStartDate, initialEndDate }: UseReservationFormProps = {}) => {
    // Initialize form data with defaults
    const [formData, setFormData] = useState<ReservationFormData>(() => {
        const now = new Date();
        const todayDate = now.toISOString().split('T')[0];
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        return {
            title: '',
            calendarColorId: '',
            contactPhone: '',
            contactName: '',
            vehicleMake: '',
            vehicleModel: '',
            startDate: initialStartDate || `${todayDate}T${currentTime}:00`,
            endDate: initialEndDate || `${todayDate}T23:59:59`,
            selectedServices: [],
            notes: ''
        };
    });

    const [isAllDay, setIsAllDay] = useState(false);

    const { errors, validateForm, clearFieldError, clearAllErrors } = useReservationValidation(formData);

    // Auto-generate title when vehicle or contact changes
    useEffect(() => {
        if (!formData.title || formData.title.trim() === '') {
            const autoTitle = generateReservationTitle(
                formData.vehicleMake,
                formData.vehicleModel,
                formData.contactName
            );

            if (autoTitle !== 'Nowa rezerwacja') {
                setFormData(prev => ({ ...prev, title: autoTitle }));
            }
        }
    }, [formData.vehicleMake, formData.vehicleModel, formData.contactName]);

    // Handle basic field changes
    const handleFieldChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        // Special handling for phone number
        if (name === 'contactPhone') {
            const formattedPhone = formatPhoneNumber(value);
            setFormData(prev => ({ ...prev, [name]: formattedPhone }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        clearFieldError(name);
    }, [clearFieldError]);

    // Handle all-day toggle
    const handleAllDayToggle = useCallback(() => {
        const newIsAllDay = !isAllDay;
        setIsAllDay(newIsAllDay);

        if (newIsAllDay) {
            const currentDate = formData.startDate
                ? formData.startDate.split('T')[0]
                : new Date().toISOString().split('T')[0];

            setFormData(prev => ({
                ...prev,
                startDate: `${currentDate}T00:00:00`,
                endDate: `${currentDate}T23:59:59`
            }));
        }
    }, [isAllDay, formData.startDate]);

    // Handle date changes
    const handleDateChange = useCallback((name: 'startDate' | 'endDate', value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        clearFieldError(name);
    }, [clearFieldError]);

    // Handle services
    const handleAddService = useCallback((service: ReservationSelectedServiceInput) => {
        setFormData(prev => ({
            ...prev,
            selectedServices: [...prev.selectedServices, service]
        }));
        clearFieldError('selectedServices');
    }, [clearFieldError]);

    const handleRemoveService = useCallback((serviceId: string) => {
        setFormData(prev => ({
            ...prev,
            selectedServices: prev.selectedServices.filter(s => s.serviceId !== serviceId)
        }));
    }, []);

    const handleUpdateService = useCallback((serviceId: string, updates: Partial<ReservationSelectedServiceInput>) => {
        setFormData(prev => ({
            ...prev,
            selectedServices: prev.selectedServices.map(s =>
                s.serviceId === serviceId ? { ...s, ...updates } : s
            )
        }));
    }, []);

    // Reset form
    const resetForm = useCallback(() => {
        const now = new Date();
        const todayDate = now.toISOString().split('T')[0];
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        setFormData({
            title: '',
            calendarColorId: '',
            contactPhone: '',
            contactName: '',
            vehicleMake: '',
            vehicleModel: '',
            startDate: `${todayDate}T${currentTime}:00`,
            endDate: `${todayDate}T23:59:59`,
            selectedServices: [],
            notes: ''
        });
        setIsAllDay(false);
        clearAllErrors();
    }, [clearAllErrors]);

    return {
        formData,
        setFormData,
        errors,
        validateForm,
        clearFieldError,
        handleFieldChange,
        handleAllDayToggle,
        handleDateChange,
        handleAddService,
        handleRemoveService,
        handleUpdateService,
        isAllDay,
        setIsAllDay,
        resetForm
    };
};