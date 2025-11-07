// src/features/reservations/hooks/useReservationSubmit.ts
/**
 * Hook for handling reservation form submission
 * UPDATED: Enhanced logging for discount debugging
 */

import { useState } from 'react';
import { ReservationFormData } from '../libs/types';
import { formatDateForAPI } from '../libs/utils';
import {CreateReservationRequest, reservationsApi} from "../api/reservationsApi";

interface UseReservationSubmitProps {
    onSuccess?: (reservationId: string) => void;
    onError?: (error: string) => void;
}

export const useReservationSubmit = ({ onSuccess, onError }: UseReservationSubmitProps = {}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitReservation = async (formData: ReservationFormData): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            // Prepare request data
            const requestData: CreateReservationRequest = {
                title: formData.title.trim(),
                contactPhone: formData.contactPhone.trim(),
                contactName: formData.contactName?.trim() || undefined,
                vehicleMake: formData.vehicleMake.trim(),
                vehicleModel: formData.vehicleModel.trim(),
                startDate: formatDateForAPI(formData.startDate),
                endDate: formData.endDate ? formatDateForAPI(formData.endDate) : undefined,
                notes: formData.notes?.trim() || undefined,
                calendarColorId: formData.calendarColorId,
                selectedServices: formData.selectedServices.length > 0
                    ? formData.selectedServices
                    : undefined
            };

            console.log('📤 Submitting reservation:', requestData);

            // ADDED: Log discount information for debugging
            if (requestData.selectedServices) {
                console.log('📊 Services with discounts:', requestData.selectedServices.map(s => ({
                    name: s.name,
                    hasDiscount: !!s.discount,
                    discount: s.discount
                })));
            }

            // Call API
            const reservation = await reservationsApi.createReservation(requestData);

            console.log('✅ Reservation created:', reservation);

            // Success callback
            if (onSuccess) {
                onSuccess(reservation.id);
            }

            return true;

        } catch (err) {
            console.error('❌ Error creating reservation:', err);

            const errorMessage = err instanceof Error
                ? err.message
                : 'Nie udało się utworzyć rezerwacji. Spróbuj ponownie.';

            setError(errorMessage);

            if (onError) {
                onError(errorMessage);
            }

            return false;

        } finally {
            setLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
    };

    return {
        submitReservation,
        loading,
        error,
        clearError
    };
};