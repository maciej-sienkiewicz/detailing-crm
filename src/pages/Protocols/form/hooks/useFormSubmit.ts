import { useState } from 'react';
import { CarReceptionProtocol, ProtocolStatus, ServiceApprovalStatus } from '../../../../types';
import { carReceptionApi } from '../../../../api/carReceptionApi';
import { useFormValidation } from './useFormValidation';

interface UseFormSubmitResult {
    loading: boolean;
    error: string | null;
    pendingSubmit: boolean;
    setPendingSubmit: React.Dispatch<React.SetStateAction<boolean>>;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    shouldShowConfirmationModal: boolean;
    isOpenProtocolAction: boolean;
}

interface ConfirmationOptions {
    print: boolean;
    sendEmail: boolean;
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

    const cleanDateFormat = (dateString: string): string => {
        if (!dateString) return '';

        // Jeśli data zawiera 'Z' na końcu (format ISO z UTC)
        if (dateString.endsWith('Z')) {
            // Usuń 'Z' i ewentualne milisekundy (.000)
            const dateParts = dateString.substring(0, dateString.length - 1).split('.');
            return dateParts[0]; // Zwróć część bez milisekund i Z
        }

        // Jeśli zawiera milisekundy, ale bez Z
        if (dateString.includes('.')) {
            return dateString.split('.')[0];
        }

        return dateString;
    };

    // Obsługa zapisania formularza
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('handleSubmit wywołane', { protocol, formData });

        // Upewniamy się, że daty mają odpowiedni format
        const updatedFormData = {
            ...formData
        };

        if (updatedFormData.startDate) {
            updatedFormData.startDate = cleanDateFormat(updatedFormData.startDate);
            console.log('Cleaned startDate:', updatedFormData.startDate);
        }

        if (updatedFormData.endDate) {
            updatedFormData.endDate = cleanDateFormat(updatedFormData.endDate);
            console.log('Cleaned endDate:', updatedFormData.endDate);
        }

        // Sprawdźmy format startDate - dodajemy domyślny czas, jeśli go nie ma
        if (updatedFormData.startDate && !updatedFormData.startDate.includes('T')) {
            updatedFormData.startDate = `${updatedFormData.startDate}T08:00:00`;
        }

        // Dla endDate zawsze ustawiamy koniec dnia
        if (updatedFormData.endDate && !updatedFormData.endDate.includes('T')) {
            updatedFormData.endDate = `${updatedFormData.endDate}T23:59:59`;
        } else if (updatedFormData.endDate && !updatedFormData.endDate.endsWith('23:59:59')) {
            // Jeśli już ma czas, ale nie jest to koniec dnia, zmieniamy na koniec dnia
            updatedFormData.endDate = `${updatedFormData.endDate.split('T')[0]}T23:59:59`;
        }

        // Automatycznie ustaw tytuł, jeśli pole jest puste
        if (!updatedFormData.title || updatedFormData.title.trim() === '') {
            // Generujemy tytuł na podstawie marki, modelu i imienia właściciela
            if (updatedFormData.make && updatedFormData.model && updatedFormData.ownerName) {
                updatedFormData.title = `${updatedFormData.make} ${updatedFormData.model} - ${updatedFormData.ownerName}`;
            }
        }

        if (!validateForm()) {
            console.log('Walidacja formularza nie powiodła się');
            return;
        }

        // Sprawdzamy czy istnieją usługi z ceną 0
        const hasZeroPriceServices = updatedFormData.selectedServices?.some(service => service.finalPrice === 0);

        if (hasZeroPriceServices && !pendingSubmit) {
            setPendingSubmit(true);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let savedProtocol: CarReceptionProtocol;
            let showConfirmationModal = false;

            // Wykrywamy, czy to akcja "Rozpocznij wizytę"
            // 1. Sprawdzamy, czy jest to edycja istniejącego protokołu
            // 2. Sprawdzamy, czy protokół jest w statusie IN_PROGRESS
            // 3. Sprawdzamy czy na URL mamy parametr isOpenProtocolAction
            const isStartVisitAction = protocol?.id &&
                formData.status === ProtocolStatus.IN_PROGRESS &&
                (window.location.search.includes('isOpenProtocolAction') ||
                    window.location.href.includes('isOpenProtocolAction'));

            console.log('isStartVisitAction:', isStartVisitAction);

            if (protocol?.id) {
                console.log('Aktualizacja istniejącego protokołu, id:', protocol.id);
                // Aktualizacja istniejącego protokołu
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
                    appointmentId: protocol.appointmentId, // Zachowujemy powiązanie z wizytą, jeśli istniało,
                    selectedServices: approvedServices,  // Używamy zaktualizowanych usług,
                };

                // Sprawdzamy czy przechodziliśmy ze stanu SCHEDULED do IN_PROGRESS
                console.log('Sprawdzanie zmiany statusu:');
                console.log('- Oryginalny status:', protocol.status);
                console.log('- Nowy status:', protocolToUpdate.status);
                console.log('- isStartVisitAction:', isStartVisitAction);

                // Pokazujemy modal jeśli wykryliśmy akcję "Rozpocznij wizytę"
                if (isStartVisitAction ||
                    (protocol.status === ProtocolStatus.SCHEDULED &&
                        protocolToUpdate.status === ProtocolStatus.IN_PROGRESS)) {
                    console.log('Wykryto akcję "Rozpocznij wizytę" lub zmianę statusu - będzie wyświetlony modal');
                    showConfirmationModal = true;
                }

                // Używamy API do aktualizacji protokołu
                savedProtocol = await carReceptionApi.updateCarReceptionProtocol(protocolToUpdate);

                console.log('Protocol updated successfully:', savedProtocol);
            } else {
                console.log('Tworzenie nowego protokołu');
                // Przygotowanie danych do utworzenia nowego protokołu
                const now = new Date().toISOString();

                // Ustaw status APPROVED dla wszystkich usług w nowym protokole
                const approvedServices = updatedFormData.selectedServices?.map(service => ({
                    ...service,
                    approvalStatus: ServiceApprovalStatus.APPROVED
                })) || [];

                // Ustaw status IN_PROGRESS dla nowo tworzonych protokołów
                const status = isOpenProtocolAction ? ProtocolStatus.IN_PROGRESS : ProtocolStatus.SCHEDULED;
                console.log('Status nowego protokołu:', status);

                const newProtocolData: Omit<CarReceptionProtocol, 'id' | 'createdAt' | 'updatedAt'> = {
                    ...updatedFormData,
                    status,
                    selectedServices: approvedServices,  // Używamy zaktualizowanych usług
                    statusUpdatedAt: now,
                    appointmentId: appointmentId // Powiązanie z wizytą, jeśli tworzymy z wizyty
                } as Omit<CarReceptionProtocol, 'id' | 'createdAt' | 'updatedAt'>;

                // Używamy API do utworzenia protokołu
                savedProtocol = await carReceptionApi.createCarReceptionProtocol(newProtocolData);

                if (status === ProtocolStatus.IN_PROGRESS) {
                    console.log('Nowy protokół z IN_PROGRESS, będzie wyświetlony modal');
                    showConfirmationModal = true;

                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                console.log('Protocol created successfully:', savedProtocol);
            }

            setShouldShowConfirmationModal(showConfirmationModal);
            console.log('Wywołanie onSave z parametrami:', savedProtocol.id, showConfirmationModal);

            if (onSave) {
                onSave(savedProtocol, showConfirmationModal);
            } else {
                console.warn('Brak funkcji onSave, protokół został zapisany ale nie jest obsługiwany przez UI');
            }
        } catch (err) {
            console.error('Error saving protocol:', err);
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