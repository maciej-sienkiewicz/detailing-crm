import { useState, useCallback, useEffect } from 'react';
import { EmailLabel } from '../../../types/mail';
import mailService from '../services/mailService';

/**
 * Hook do zarządzania etykietami/folderami
 */
export const useMailLabels = (accountId?: string) => {
    const [labels, setLabels] = useState<EmailLabel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Funkcja do pobierania etykiet
    const fetchLabels = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const fetchedLabels = await mailService.getLabels(accountId);
            setLabels(fetchedLabels);

        } catch (err) {
            setError('Wystąpił błąd podczas pobierania etykiet');
            console.error('Error fetching labels:', err);
        } finally {
            setLoading(false);
        }
    }, [accountId]);

    // Ładowanie etykiet przy pierwszym renderowaniu
    useEffect(() => {
        fetchLabels();
    }, [fetchLabels]);

    // Funkcja do tworzenia nowej etykiety
    const createLabel = useCallback(async (name: string, color?: string) => {
        try {
            const newLabel = await mailService.createLabel(name, color, accountId);

            // Aktualizacja lokalnego stanu
            setLabels(prev => [...prev, newLabel]);

            return newLabel;
        } catch (err) {
            console.error('Error creating label:', err);
            throw err;
        }
    }, [accountId]);

    // Funkcja do usuwania etykiety
    const deleteLabel = useCallback(async (labelId: string) => {
        try {
            await mailService.deleteLabel(labelId, accountId);

            // Aktualizacja lokalnego stanu
            setLabels(prev => prev.filter(label => label.id !== labelId));

        } catch (err) {
            console.error('Error deleting label:', err);
            throw err;
        }
    }, [accountId]);

    return {
        labels,
        loading,
        error,
        refreshLabels: fetchLabels,
        createLabel,
        deleteLabel
    };
};