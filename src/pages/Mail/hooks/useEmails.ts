// src/pages/Mail/hooks/useEmails.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { Email, EmailFilter, MailFolderSummary } from '../../../types/mail';
import mailService from '../services/mailService';

export const useEmails = (labelId: string | null, accountId?: string) => {
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pageToken, setPageToken] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [folderSummaries, setFolderSummaries] = useState<MailFolderSummary[]>([]);

    // Dodaj referencję, aby śledzić, czy już wykonujemy zapytanie
    const isLoadingRef = useRef(false);

    // Dodaj licznik, aby debugować liczbę zapytań
    const requestCountRef = useRef(0);

    // Funkcja do pobierania emaili
    const fetchEmails = useCallback(async (refresh = false) => {
        if (!labelId) return;

        // Zapobiegaj równoczesnym wywołaniom
        if (isLoadingRef.current) {
            console.log('Już trwa ładowanie wiadomości, pomijam zapytanie');
            return;
        }

        isLoadingRef.current = true;
        setLoading(true);
        setError(null);

        // Inkrementuj licznik zapytań do debugowania
        requestCountRef.current++;
        console.log(`Fetch emails request #${requestCountRef.current}, refresh: ${refresh}, token: ${pageToken}`);

        try {
            const filter: EmailFilter = {
                labelIds: [labelId],
                maxResults: 20
            };

            // Jeśli to nie jest odświeżanie i mamy token do paginacji
            if (!refresh && pageToken) {
                filter.pageToken = pageToken;
                console.log('Using page token for pagination:', pageToken);
            }

            // Pobieranie emaili z API
            const response = await mailService.getEmails(filter, accountId);
            const fetchedEmails = response.emails;
            const nextPageToken = response.nextPageToken;

            console.log('Received emails:', fetchedEmails.length);
            console.log('Next page token:', nextPageToken);

            // Przetwarzanie emaili - konwersja pola read na isRead
            const processedEmails = fetchedEmails.map(email => ({
                ...email,
                isRead: email.read !== undefined ? Boolean(email.read) : Boolean(email.isRead)
            }));

            // Aktualizacja tokenu paginacji
            if (!refresh && nextPageToken) {
                setPageToken(nextPageToken);
            } else if (refresh) {
                // Resetowanie tokenu przy odświeżaniu
                setPageToken(nextPageToken);
            }

            // Aktualizacja stanu emaili
            if (refresh) {
                // Przy odświeżaniu zastępujemy cały stan
                setEmails(processedEmails);
            } else {
                // Przy ładowaniu kolejnych stron, dodajemy tylko unikalne emaile
                const existingIds = new Set(emails.map(e => e.id));
                const uniqueNewEmails = processedEmails.filter(email => !existingIds.has(email.id));

                console.log('Adding unique emails:', uniqueNewEmails.length);

                if (uniqueNewEmails.length > 0) {
                    setEmails(prev => [...prev, ...uniqueNewEmails]);
                }
            }

            // Aktualizacja flagi hasMore - bardzo ważne!
            // Musi być false jeśli nie otrzymaliśmy tokenów paginacji lub otrzymaliśmy pustą listę
            setHasMore(fetchedEmails.length > 0 && nextPageToken !== null);

            // Pobranie podsumowania folderów
            const summaries = await mailService.getFoldersSummary(accountId);
            setFolderSummaries(summaries);

        } catch (err) {
            setError('Wystąpił błąd podczas pobierania wiadomości');
            console.error('Error fetching emails:', err);
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    }, [labelId, accountId, pageToken, emails]);

    // Ładowanie emaili przy pierwszym renderowaniu i zmianie folderu
    useEffect(() => {
        if (labelId) {
            console.log('Label changed, resetting state and fetching emails');
            // Resetowanie stanu przy zmianie folderu
            setEmails([]);
            setPageToken(null);
            setHasMore(true);

            fetchEmails(true);
        }
    }, [labelId]); // Usuń fetchEmails z zależności, żeby uniknąć rekurencyjnych wywołań

    // Funkcja do pobierania kolejnej strony emaili
    const loadMore = useCallback(() => {
        if (loading || !hasMore || isLoadingRef.current) {
            console.log('Skip loadMore: loading:', loading, 'hasMore:', hasMore, 'isLoading:', isLoadingRef.current);
            return;
        }

        console.log('Loading more emails...');
        fetchEmails(false);
    }, [loading, hasMore, fetchEmails]);

    // Funkcja do odświeżania listy emaili
    const refreshEmails = useCallback(() => {
        console.log('Refreshing emails...');
        fetchEmails(true);
    }, [fetchEmails]);

    // Funkcja do oznaczania emaila jako przeczytany/nieprzeczytany
    const markAsRead = useCallback(async (emailId: string, isRead: boolean) => {
        try {
            console.log(`Oznaczanie wiadomości ${emailId} jako ${isRead ? 'przeczytana' : 'nieprzeczytana'}...`);

            // Najpierw aktualizujemy lokalny stan dla natychmiastowej reakcji UI
            setEmails(prev =>
                prev.map(email =>
                    email.id === emailId ? { ...email, isRead: isRead, read: isRead } : email
                )
            );

            // Następnie wywołujemy serwis
            await mailService.markAsRead(emailId, isRead, accountId);
            console.log(`Wiadomość ${emailId} oznaczona jako ${isRead ? 'przeczytana' : 'nieprzeczytana'}`);

            // Odświeżenie podsumowania folderów
            const summaries = await mailService.getFoldersSummary(accountId);
            setFolderSummaries(summaries);

        } catch (err) {
            console.error(`Error marking email as ${isRead ? 'read' : 'unread'}:`, err);

            // W przypadku błędu, przywracamy poprzedni stan
            setEmails(prev =>
                prev.map(email =>
                    email.id === emailId ? { ...email, isRead: !isRead, read: !isRead } : email
                )
            );

            throw err;
        }
    }, [accountId]);

    // Funkcja do oznaczania emaila gwiazdką
    const toggleStar = useCallback(async (emailId: string, isStarred: boolean) => {
        try {
            await mailService.toggleStar(emailId, isStarred, accountId);

            // Aktualizacja lokalnego stanu
            setEmails(prev =>
                prev.map(email =>
                    email.id === emailId ? { ...email, isStarred } : email
                )
            );

        } catch (err) {
            console.error(`Error ${isStarred ? 'starring' : 'unstarring'} email:`, err);
            throw err;
        }
    }, [accountId]);

    // Funkcja do przenoszenia emaila do kosza
    const moveToTrash = useCallback(async (emailId: string) => {
        try {
            await mailService.moveToTrash(emailId, accountId);

            // Usunięcie z lokalnego stanu jeśli nie jesteśmy w koszu
            if (labelId !== 'TRASH') {
                setEmails(prev => prev.filter(email => email.id !== emailId));
            } else {
                // Aktualizacja statusu jeśli jesteśmy w koszu
                setEmails(prev =>
                    prev.map(email =>
                        email.id === emailId ? { ...email, labelIds: [...email.labelIds, 'TRASH'] } : email
                    )
                );
            }

            // Odświeżenie podsumowania folderów
            const summaries = await mailService.getFoldersSummary(accountId);
            setFolderSummaries(summaries);

        } catch (err) {
            console.error('Error moving email to trash:', err);
            throw err;
        }
    }, [labelId, accountId]);

    // Funkcja do przywracania emaila z kosza
    const restoreFromTrash = useCallback(async (emailId: string) => {
        try {
            await mailService.restoreFromTrash(emailId, accountId);

            // Usunięcie z lokalnego stanu jeśli jesteśmy w koszu
            if (labelId === 'TRASH') {
                setEmails(prev => prev.filter(email => email.id !== emailId));
            } else {
                // Aktualizacja statusu jeśli nie jesteśmy w koszu
                setEmails(prev =>
                    prev.map(email =>
                        email.id === emailId ? {
                            ...email,
                            labelIds: email.labelIds.filter(id => id !== 'TRASH')
                        } : email
                    )
                );
            }

            // Odświeżenie podsumowania folderów
            const summaries = await mailService.getFoldersSummary(accountId);
            setFolderSummaries(summaries);

        } catch (err) {
            console.error('Error restoring email from trash:', err);
            throw err;
        }
    }, [labelId, accountId]);

    // Funkcja do trwałego usuwania emaila
    const permanentlyDelete = useCallback(async (emailId: string) => {
        try {
            await mailService.permanentlyDelete(emailId, accountId);

            // Usunięcie z lokalnego stanu
            setEmails(prev => prev.filter(email => email.id !== emailId));

            // Odświeżenie podsumowania folderów
            const summaries = await mailService.getFoldersSummary(accountId);
            setFolderSummaries(summaries);

        } catch (err) {
            console.error('Error permanently deleting email:', err);
            throw err;
        }
    }, [accountId]);

    return {
        emails,
        loading,
        error,
        hasMore,
        folderSummaries,
        loadMore,
        refreshEmails,
        markAsRead,
        toggleStar,
        moveToTrash,
        restoreFromTrash,
        permanentlyDelete
    };
};