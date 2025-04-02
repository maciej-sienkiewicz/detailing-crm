import { useState } from 'react';
import { CarReceptionProtocol, ServiceApprovalStatus } from '../../../../types';
import { carReceptionApi } from '../../../../api/carReceptionApi';
import { useFormValidation } from './useFormValidation';

interface UseFormSubmitResult {
    loading: boolean;
    error: string | null;
    pendingSubmit: boolean;
    setPendingSubmit: React.Dispatch<React.SetStateAction<boolean>>;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const useFormSubmit = (
    formData: Partial<CarReceptionProtocol>,
    protocol: CarReceptionProtocol | null,
    appointmentId?: string,
    onSave?: (protocol: CarReceptionProtocol) => void
): UseFormSubmitResult => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingSubmit, setPendingSubmit] = useState(false);

    const { validateForm } = useFormValidation(formData);

    // Obsługa zapisania formularza
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Upewniamy się, że daty mają odpowiedni format
        const updatedFormData = {
            ...formData
        };

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

            if (protocol?.id) {
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
                    selectedServices: approvedServices  // Używamy zaktualizowanych usług
                };

                // Używamy API do aktualizacji protokołu
                savedProtocol = await carReceptionApi.updateCarReceptionProtocol(protocolToUpdate);

                console.log('Protocol updated successfully:', savedProtocol);
            } else {
                // Przygotowanie danych do utworzenia nowego protokołu
                const now = new Date().toISOString();

                // Ustaw status APPROVED dla wszystkich usług w nowym protokole
                const approvedServices = updatedFormData.selectedServices?.map(service => ({
                    ...service,
                    approvalStatus: ServiceApprovalStatus.APPROVED
                })) || [];

                const newProtocolData: Omit<CarReceptionProtocol, 'id' | 'createdAt' | 'updatedAt'> = {
                    ...updatedFormData,
                    selectedServices: approvedServices,  // Używamy zaktualizowanych usług
                    statusUpdatedAt: now,
                    appointmentId: appointmentId // Powiązanie z wizytą, jeśli tworzymy z wizyty
                } as Omit<CarReceptionProtocol, 'id' | 'createdAt' | 'updatedAt'>;

                // Używamy API do utworzenia protokołu
                savedProtocol = await carReceptionApi.createCarReceptionProtocol(newProtocolData);

                console.log('Protocol created successfully:', savedProtocol);
            }

            if (onSave) {
                onSave(savedProtocol);
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
        handleSubmit
    };
};