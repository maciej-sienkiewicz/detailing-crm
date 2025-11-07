// src/features/reservations/hooks/useReservationEdit.ts
/**
 * Hook for handling reservation editing
 * UPDATED: Preserve discount information during edit
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Reservation, reservationsApi, UpdateReservationRequest, Discount } from '../api/reservationsApi';
import { ReservationFormData } from '../libs/types';
import { formatDateForAPI } from '../libs/utils';
import { PriceType } from '../../../types/service';

interface UseReservationEditProps {
    reservationId: string;
    onSuccess?: (reservationId: string) => void;
    onError?: (error: string) => void;
}

export const useReservationEdit = ({
                                       reservationId,
                                       onSuccess,
                                       onError
                                   }: UseReservationEditProps) => {
    const navigate = useNavigate();

    // Track if data was already fetched
    const isFetched = useRef(false);

    // Fetch state
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Update state
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);

    /**
     * Fetch reservation data
     */
    const fetchReservation = useCallback(async () => {
        if (isFetched.current) {
            console.log('⏭️ Already fetched, skipping...');
            return;
        }

        setLoading(true);
        setFetchError(null);

        try {
            console.log('📥 Fetching reservation:', reservationId);
            const data = await reservationsApi.getReservation(reservationId);
            setReservation(data);
            isFetched.current = true;
            console.log('✅ Reservation fetched:', data);
        } catch (err) {
            console.error('❌ Error fetching reservation:', err);
            const errorMessage = err instanceof Error
                ? err.message
                : 'Nie udało się pobrać danych rezerwacji';
            setFetchError(errorMessage);

            if (onError) {
                onError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }, [reservationId, onError]);

    /**
     * Update reservation
     */
    const updateReservation = async (formData: ReservationFormData): Promise<boolean> => {
        setUpdating(true);
        setUpdateError(null);

        try {
            console.log('📤 Updating reservation:', reservationId, formData);

            // Prepare request data
            const requestData: UpdateReservationRequest = {
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

            console.log('📤 Request data (with discounts):', requestData);

            // Call API
            const updatedReservation = await reservationsApi.updateReservation(
                reservationId,
                requestData
            );

            console.log('✅ Reservation updated:', updatedReservation);

            // Update local state
            setReservation(updatedReservation);

            // Success callback
            if (onSuccess) {
                onSuccess(reservationId);
            }

            return true;

        } catch (err) {
            console.error('❌ Error updating reservation:', err);

            const errorMessage = err instanceof Error
                ? err.message
                : 'Nie udało się zaktualizować rezerwacji. Spróbuj ponownie.';

            setUpdateError(errorMessage);

            if (onError) {
                onError(errorMessage);
            }

            return false;

        } finally {
            setUpdating(false);
        }
    };

    /**
     * Convert Reservation to ReservationFormData
     * UPDATED: Preserve discount information
     */
    const convertToFormData = useCallback((reservation: Reservation): ReservationFormData => {
        // Convert backend date format (array) to ISO string
        const convertDate = (date: string | number[] | undefined): string => {
            if (!date) return '';

            if (Array.isArray(date)) {
                const [year, month, day, hour = 0, minute = 0, second = 0] = date;
                const pad = (n: number) => String(n).padStart(2, '0');
                return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`;
            }

            return String(date);
        };

        return {
            title: reservation.title,
            calendarColorId: reservation.calendarColorId,
            contactPhone: reservation.contactPhone,
            contactName: reservation.contactName || '',
            vehicleMake: reservation.vehicleMake,
            vehicleModel: reservation.vehicleModel,
            startDate: convertDate(reservation.startDate as any),
            endDate: convertDate(reservation.endDate as any),
            // UPDATED: Map services with discount
            selectedServices: reservation.services.map(service => {
                // Check if service has discount
                const hasDiscount = service.discount && service.discount.discountValue > 0;

                const discount: Discount | undefined = hasDiscount ? {
                    discountType: service.discount!.discountType,
                    discountValue: service.discount!.discountValue
                } : undefined;

                return {
                    serviceId: service.id,
                    name: service.name,
                    basePrice: {
                        inputPrice: service.basePrice.priceNetto,
                        inputType: PriceType.NET
                    },
                    quantity: service.quantity,
                    discount, // ADDED: Include discount in form data
                    note: service.note
                };
            }),
            notes: reservation.notes || ''
        };
    }, []);

    /**
     * Navigate back to list
     */
    const goBack = useCallback(() => {
        navigate('/visits?tab=reservations');
    }, [navigate]);

    // Fetch on mount (only once)
    useEffect(() => {
        fetchReservation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty array - run only once on mount

    return {
        // Data
        reservation,
        initialFormData: reservation ? convertToFormData(reservation) : null,

        // Fetch state
        loading,
        fetchError,
        refetch: fetchReservation,

        // Update
        updateReservation,
        updating,
        updateError,

        // Navigation
        goBack
    };
};