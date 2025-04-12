import { useState, useCallback, useEffect } from 'react';
import { Email, ClientContact } from '../../../types/mail';
import mailService from '../services/mailService';
import { SEARCH_CONFIG } from '../services/config/mailConfig';
import { useDebounce } from './useDebounce';
import { clientApi } from '../../../api/clientsApi';

/**
 * Hook do wyszukiwania emaili
 */
export const useMailSearch = (accountId?: string) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Email[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [contactSuggestions, setContactSuggestions] = useState<ClientContact[]>([]);

    // Debouncing zapytania, aby nie wysyłać zbyt wielu żądań
    const debouncedQuery = useDebounce(query, SEARCH_CONFIG.DEBOUNCE_TIME);

    // Wyszukiwanie emaili
    useEffect(() => {
        const searchEmails = async () => {
            // Nie wyszukuj przy pustym zapytaniu lub za krótkim
            if (!debouncedQuery || debouncedQuery.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
                setResults([]);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const filter = {
                    q: debouncedQuery,
                    maxResults: 20
                };

                const searchResults = await mailService.getEmails(filter, accountId);
                setResults(searchResults);

            } catch (err) {
                setError('Wystąpił błąd podczas wyszukiwania');
                console.error('Error searching emails:', err);
            } finally {
                setLoading(false);
            }
        };

        searchEmails();
    }, [debouncedQuery, accountId]);

    // Funkcja do obsługi zmiany zapytania
    const handleQueryChange = (newQuery: string) => {
        setQuery(newQuery);
    };

    // Funkcja do wyszukiwania kontaktów po zapytaniu (dla sugestii)
    const searchContacts = useCallback(async (contactQuery: string) => {
        if (!contactQuery || contactQuery.length < 2) {
            setContactSuggestions([]);
            return;
        }

        try {
            // Tutaj możemy wykorzystać API klientów z naszego CRM-a
            const contacts = await clientApi.fetchClients();

            // Filtrowanie po nazwie, emailu lub numerze telefonu
            const filteredContacts = contacts
                .filter(client =>
                    client.firstName?.toLowerCase().includes(contactQuery.toLowerCase()) ||
                    client.lastName?.toLowerCase().includes(contactQuery.toLowerCase()) ||
                    client.email?.toLowerCase().includes(contactQuery.toLowerCase()) ||
                    client.phone?.includes(contactQuery)
                )
                .map(client => ({
                    id: client.id,
                    name: `${client.firstName} ${client.lastName}`,
                    email: client.email,
                    phone: client.phone,
                    company: client.company
                }))
                .slice(0, SEARCH_CONFIG.MAX_SUGGESTIONS);

            setContactSuggestions(filteredContacts);

        } catch (err) {
            console.error('Error searching contacts:', err);
        }
    }, []);

    return {
        query,
        results,
        loading,
        error,
        contactSuggestions,
        handleQueryChange,
        searchContacts
    };
};