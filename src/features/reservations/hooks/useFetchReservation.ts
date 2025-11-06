import { useState, useEffect, useCallback } from 'react';
import { Reservation, reservationsApi } from '../api/reservationsApi';

export const useFetchReservation = (reservationId: string | null) => {
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReservation = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        setReservation(null);
        try {
            const data = await reservationsApi.getReservation(id);
            setReservation(data);
        } catch (err) {
            setError('Nie udało się pobrać danych rezerwacji.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (reservationId) {
            fetchReservation(reservationId);
        } else {
            setReservation(null);
        }
    }, [reservationId, fetchReservation]);

    return { reservation, loading, error, refetch: fetchReservation };
};