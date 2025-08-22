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

    // NAPRAWKA: Całkowicie przepisana funkcja formatowania dat
    const cleanDateFormat = (dateString: string): string => {
        if (!dateString) return '';

        try {
            // Usuń 'Z' i milisekundy jeśli są
            let cleanedDate = dateString.replace('Z', '').split('.')[0];

            console.log('cleanDateFormat input:', dateString);
            console.log('cleanDateFormat after initial clean:', cleanedDate);

            // Przypadek 1: Format z błędną mieszanką - "2025-08-19 21:57:00T23:59:59"
            if (cleanedDate.includes(' ') && cleanedDate.includes('T')) {
                // Wyciągnij tylko część daty
                const datePart = cleanedDate.split(' ')[0]; // "2025-08-19"
                console.log('cleanDateFormat - mixed format, extracted date:', datePart);
                return datePart;
            }

            // Przypadek 2: Format ze spacją - "2025-08-19 21:57:00"
            if (cleanedDate.includes(' ') && !cleanedDate.includes('T')) {
                // Zamień spację na T
                cleanedDate = cleanedDate.replace(' ', 'T');
                console.log('cleanDateFormat - space format, converted to T:', cleanedDate);
                return cleanedDate;
            }

            // Przypadek 3: Format z T - "2025-08-19T21:57:00"
            if (cleanedDate.includes('T')) {
                console.log('cleanDateFormat - T format, returning as is:', cleanedDate);
                return cleanedDate;
            }

            // Przypadek 4: Tylko data - "2025-08-19"
            if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedDate)) {
                console.log('cleanDateFormat - date only format:', cleanedDate);
                return cleanedDate;
            }

            console.log('cleanDateFormat - fallback, returning as is:', cleanedDate);
            return cleanedDate;

        } catch (error) {
            console.error('Błąd podczas czyszczenia formatu daty:', error, dateString);
            return '';
        }
    };

    // Obsługa zapisania formularza
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('handleSubmit wywołane', { protocol, formData });

        // Upewniamy się, że daty mają odpowiedni format
        const updatedFormData = {
            ...formData
        };

        console.log('=== RAW FORM DATA ===');
        console.log('Original formData.startDate:', formData.startDate);
        console.log('Original formData.endDate:', formData.endDate);
        console.log('====================');

        // NAPRAWKA: Zdecydowanie uproszczona obsługa dat - zawsze format ISO z T
        if (updatedFormData.startDate) {
            const cleanedStartDate = cleanDateFormat(updatedFormData.startDate);
            console.log('Processing startDate - cleaned:', cleanedStartDate);

            if (cleanedStartDate) {
                if (cleanedStartDate.includes('T')) {
                    // Już ma poprawny format z T
                    updatedFormData.startDate = cleanedStartDate;
                } else {
                    // Tylko data, dodaj domyślny czas
                    updatedFormData.startDate = `${cleanedStartDate}T08:00:00`;
                }
            }

            console.log('Final startDate:', updatedFormData.startDate);
        }

        if (updatedFormData.endDate) {
            const cleanedEndDate = cleanDateFormat(updatedFormData.endDate);
            console.log('Processing endDate - cleaned:', cleanedEndDate);

            if (cleanedEndDate) {
                // Zawsze wyciągnij tylko datę i dodaj 23:59:59
                let datePart;

                if (cleanedEndDate.includes('T')) {
                    datePart = cleanedEndDate.split('T')[0];
                } else {
                    datePart = cleanedEndDate;
                }

                updatedFormData.endDate = `${datePart}T23:59:59`;
            }

            console.log('Final endDate:', updatedFormData.endDate);
        }

        console.log('=== FINAL DATA BEFORE API CALL ===');
        console.log('updatedFormData.startDate:', updatedFormData.startDate);
        console.log('updatedFormData.endDate:', updatedFormData.endDate);
        console.log('================================');

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

                console.log('=== DATA BEING SENT TO API ===');
                console.log('protocolToUpdate.startDate:', protocolToUpdate.startDate);
                console.log('protocolToUpdate.endDate:', protocolToUpdate.endDate);
                console.log('==============================');

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

                console.log('=== NEW PROTOCOL DATA BEING SENT TO API ===');
                console.log('newProtocolData.startDate:', newProtocolData.startDate);
                console.log('newProtocolData.endDate:', newProtocolData.endDate);
                console.log('==========================================');

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