import { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Reservation, reservationsApi, UpdateReservationRequest } from '../api/reservationsApi';
import { ReservationFormData } from '../libs/types';
import { formatDateForAPI, parseDateFromBackend } from '../libs/utils';
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

    const isFetched = useRef(false);

    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);

    const fetchReservation = useCallback(async () => {
        if (isFetched.current) {
            return;
        }

        setLoading(true);
        setFetchError(null);

        try {
            const data = await reservationsApi.getReservation(reservationId);
            setReservation(data);
            isFetched.current = true;
        } catch (err) {
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

    const updateReservation = async (formData: ReservationFormData): Promise<boolean> => {
        setUpdating(true);
        setUpdateError(null);

        try {
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

            const updatedReservation = await reservationsApi.updateReservation(
                reservationId,
                requestData
            );

            setReservation(updatedReservation);

            if (onSuccess) {
                onSuccess(reservationId);
            }

            return true;

        } catch (err) {
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

    const convertToFormData = useCallback((reservation: Reservation): ReservationFormData => {
        return {
            title: reservation.title,
            calendarColorId: reservation.calendarColorId,
            contactPhone: reservation.contactPhone,
            contactName: reservation.contactName || '',
            vehicleMake: reservation.vehicleMake,
            vehicleModel: reservation.vehicleModel,
            startDate: parseDateFromBackend(reservation.startDate),
            endDate: parseDateFromBackend(reservation.endDate),
            selectedServices: reservation.services.map(service => {
                const hasDiscount = service.discount && service.discount.discountValue > 0;

                return {
                    serviceId: service.id,
                    name: service.name,
                    basePrice: {
                        inputPrice: service.basePrice.priceNetto,
                        inputType: PriceType.NET
                    },
                    quantity: service.quantity,
                    discount: hasDiscount ? {
                        discountType: service.discount!.discountType,
                        discountValue: service.discount!.discountValue
                    } : undefined,
                    note: service.note
                };
            }),
            notes: reservation.notes || ''
        };
    }, []);

    const goBack = useCallback(() => {
        navigate('/visits?tab=reservations');
    }, [navigate]);

    useEffect(() => {
        fetchReservation();
    }, []);

    return {
        reservation,
        initialFormData: reservation ? convertToFormData(reservation) : null,

        loading,
        fetchError,
        refetch: fetchReservation,

        updateReservation,
        updating,
        updateError,

        goBack
    };
};