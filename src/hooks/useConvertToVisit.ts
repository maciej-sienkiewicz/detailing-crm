// src/hooks/useConvertToVisit.ts
import { useCallback } from 'react';
import { useToast } from '../components/common/Toast/Toast';
import { ConvertToVisitResponse } from '../types/recurringEvents';
import { Appointment, AppointmentStatus } from '../types';

interface UseConvertToVisitProps {
    onVisitCreated?: (visitResponse: ConvertToVisitResponse) => void;
    onCalendarRefresh?: () => void;
}

interface UseConvertToVisitReturn {
    handleConvertToVisit: (visitResponse: ConvertToVisitResponse) => void;
}

/**
 * Hook do obsługi konwersji cyklicznych wizyt na zwykłe wizyty
 * Zarządza aktualizacją stanu kalendarza po konwersji
 */
export const useConvertToVisit = ({
                                      onVisitCreated,
                                      onCalendarRefresh
                                  }: UseConvertToVisitProps): UseConvertToVisitReturn => {
    const { showToast } = useToast();

    const handleConvertToVisit = useCallback((visitResponse: ConvertToVisitResponse) => {
        console.log('✅ Cykliczna wizyta została przekształcona:', visitResponse);

        // Pokaż powiadomienie o sukcesie
        showToast('success',
            `Wizyta "${visitResponse.title}" została utworzona pomyślnie`,
            4000
        );

        // Wywołaj callback z nową wizytą
        if (onVisitCreated) {
            onVisitCreated(visitResponse);
        }

        // Odśwież kalendarz aby pokazać nową wizytę i ukryć cykliczną
        if (onCalendarRefresh) {
            // Opóźnienie aby dać czas serwerowi na przetworzenie
            setTimeout(() => {
                onCalendarRefresh();
            }, 500);
        }

    }, [showToast, onVisitCreated, onCalendarRefresh]);

    return {
        handleConvertToVisit
    };
};