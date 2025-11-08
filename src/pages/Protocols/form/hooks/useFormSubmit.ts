// src/pages/Protocols/form/hooks/useFormSubmit.ts - POPRAWIONA WERSJA

import {useState} from 'react';
import {CarReceptionProtocol, ProtocolStatus, ServiceApprovalStatus} from '../../../../types';
import {carReceptionApi} from '../../../../api/carReceptionApi';
import {useFormValidation} from './useFormValidation';

interface UseFormSubmitResult {
    loading: boolean;
    error: string | null;
    pendingSubmit: boolean;
    setPendingSubmit: React.Dispatch<React.SetStateAction<boolean>>;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    shouldShowConfirmationModal: boolean;
    isOpenProtocolAction: boolean;
}

export const useFormSubmit = (
    formData: Partial<CarReceptionProtocol>,
    protocol: CarReceptionProtocol | null,
    appointmentId?: string,
    onSave?: (protocol: CarReceptionProtocol, showConfirmationModal: boolean) => void,
    isOpenProtocolAction: boolean = false
): UseFormSubmitResult => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingSubmit, setPendingSubmit] = useState(false);
    const [shouldShowConfirmationModal, setShouldShowConfirmationModal] = useState(false);

    const { validateForm } = useFormValidation(formData);

    // POPRAWKA: Drastycznie uproszczona funkcja formatowania dat
    const formatDateForAPI = (dateString: string): string => {
        if (!dateString) return '';

        try {

            // Usuń 'Z' i milisekundy jeśli są
            let cleanedDate = dateString.replace('Z', '').split('.')[0];

            // POPRAWKA: Obsłuż format ze spacją jak "2025-09-25 23:59:59"
            if (cleanedDate.includes(' ') && !cleanedDate.includes('T')) {
                cleanedDate = cleanedDate.replace(' ', 'T');
            }

            // Jeśli ma już poprawny format ISO (YYYY-MM-DDTHH:MM:SS), zwróć jak jest
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(cleanedDate)) {
                return cleanedDate;
            }

            // Jeśli to tylko data (YYYY-MM-DD), dodaj domyślny czas
            if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedDate)) {
                const withTime = `${cleanedDate}T08:00:00`;
                return withTime;
            }

            // Fallback - spróbuj utworzyć poprawną datę
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                const formatted = date.toISOString().split('.')[0]; // Usuń milisekundy
                return formatted;
            }

            console.warn('⚠️ Nie można sformatować daty:', dateString);
            return cleanedDate;

        } catch (error) {
            console.error('❌ Błąd podczas formatowania daty:', error, dateString);
            return '';
        }
    };

    // NOWA: Funkcja do przygotowania delivery person dla API
    const prepareDeliveryPersonForApi = (formData: Partial<CarReceptionProtocol>) => {
        if (!formData.deliveryPerson) {
            return null;
        }

        // Sprawdź czy pola są wypełnione
        if (!formData.deliveryPerson.name?.trim() || !formData.deliveryPerson.phone?.trim()) {
            return null;
        }

        return {
            id: formData.deliveryPerson.id, // może być null jeśli ręcznie wpisane
            name: formData.deliveryPerson.name.trim(),
            phone: formData.deliveryPerson.phone.trim()
        };
    };

    // Obsługa zapisania formularza
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Sprawdzamy czy istnieją usługi z ceną 0
        const hasZeroPriceServices = formData.selectedServices?.some(service => service.finalPrice.priceNetto === 0);

        if (hasZeroPriceServices && !pendingSubmit) {
            setPendingSubmit(true);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // POPRAWKA: Najprostsze możliwe formatowanie dat
            const updatedFormData = { ...formData };

            // Formatuj startDate
            if (updatedFormData.startDate) {
                updatedFormData.startDate = formatDateForAPI(updatedFormData.startDate);
            }

            // POPRAWKA: endDate nie jest modyfikowana logicznie, ale musi mieć poprawny format dla API
            // To jest planowany termin zakończenia wizyty - nie zmieniamy daty, tylko format
            if (updatedFormData.endDate) {
                const originalEndDate = updatedFormData.endDate;
                updatedFormData.endDate = formatDateForAPI(updatedFormData.endDate);
            }

            // Przygotuj delivery person
            updatedFormData.deliveryPerson = prepareDeliveryPersonForApi(updatedFormData);

            // Automatycznie ustaw tytuł, jeśli pole jest puste
            if (!updatedFormData.title || updatedFormData.title.trim() === '') {
                if (updatedFormData.make && updatedFormData.model && updatedFormData.ownerName) {
                    updatedFormData.title = `${updatedFormData.make} ${updatedFormData.model} - ${updatedFormData.ownerName}`;
                }
            }

            let savedProtocol: CarReceptionProtocol;
            let showConfirmationModal = false;

            // Wykrywamy, czy to akcja "Rozpocznij wizytę"
            const isStartVisitAction = protocol?.id &&
                formData.status === ProtocolStatus.IN_PROGRESS &&
                (window.location.search.includes('isOpenProtocolAction') ||
                    window.location.href.includes('isOpenProtocolAction') ||
                    window.location.pathname.includes('/open')); // DODANE: wykrycie po URL

            if (protocol?.id) {

                // Ustaw status APPROVED dla wszystkich usług
                const approvedServices = updatedFormData.selectedServices?.map(service => ({
                    ...service,
                    approvalStatus: ServiceApprovalStatus.APPROVED
                })) || [];

                const protocolToUpdate: CarReceptionProtocol = {
                    ...(updatedFormData as CarReceptionProtocol),
                    id: protocol.id,
                    createdAt: protocol.createdAt,
                    updatedAt: new Date().toISOString(),
                    statusUpdatedAt: updatedFormData.status !== protocol.status
                        ? new Date().toISOString()
                        : protocol.statusUpdatedAt || protocol.createdAt,
                    appointmentId: protocol.appointmentId,
                    selectedServices: approvedServices,
                };

                // Pokazuj modal jeśli wykryto akcję "Rozpocznij wizytę"
                if (isStartVisitAction ||
                    (protocolToUpdate.status === ProtocolStatus.IN_PROGRESS)) {
                    showConfirmationModal = true;
                }

                savedProtocol = await carReceptionApi.updateCarReceptionProtocol(protocolToUpdate);

            } else {

                const now = new Date().toISOString();

                // Ustaw status APPROVED dla wszystkich usług
                const approvedServices = updatedFormData.selectedServices?.map(service => ({
                    ...service,
                    approvalStatus: ServiceApprovalStatus.APPROVED
                })) || [];

                // Ustaw odpowiedni status
                const status = isOpenProtocolAction ? ProtocolStatus.IN_PROGRESS : ProtocolStatus.IN_PROGRESS;

                const newProtocolData: Omit<CarReceptionProtocol, 'id' | 'createdAt' | 'updatedAt'> = {
                    ...updatedFormData,
                    status,
                    selectedServices: approvedServices,
                    statusUpdatedAt: now,
                    appointmentId: appointmentId
                } as Omit<CarReceptionProtocol, 'id' | 'createdAt' | 'updatedAt'>;

                savedProtocol = await carReceptionApi.createCarReceptionProtocol(newProtocolData);

                if (status === ProtocolStatus.IN_PROGRESS) {
                    showConfirmationModal = true;
                }
            }

            setShouldShowConfirmationModal(showConfirmationModal);

            if (onSave) {
                onSave(savedProtocol, showConfirmationModal);
            } else {
                console.warn('⚠️ Brak funkcji onSave');
            }

        } catch (err) {
            console.error('❌ Błąd podczas zapisywania protokołu:', err);
            setError('Nie udało się zapisać protokołu. Spróbuj ponownie.');
        } finally {
            setLoading(false);
            setPendingSubmit(false);
        }
    };

    return {
        loading,
        error,
        pendingSubmit,
        setPendingSubmit,
        handleSubmit,
        shouldShowConfirmationModal,
        isOpenProtocolAction
    };
};