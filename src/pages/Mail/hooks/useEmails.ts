// src/pages/Mail/hooks/useEmails.ts
import { useState, useCallback, useEffect } from 'react';
import { Email, EmailFilter, MailFolderSummary } from '../../../types/mail';
import mailService from '../services/mailService';

export const useEmails = (labelId: string | null, accountId?: string) => {
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pageToken, setPageToken] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [folderSummaries, setFolderSummaries] = useState<MailFolderSummary[]>([]);

    // Funkcja do pobierania emaili
    const fetchEmails = useCallback(async (refresh = false) => {
        if (!labelId) return;

        try {
            setLoading(true);
            setError(null);

            const filter: EmailFilter = {
                labelIds: [labelId],
                maxResults: 20
            };

            // Jeśli to nie jest odświeżanie i mamy token do paginacji
            if (!refresh && pageToken) {
                filter.pageToken = pageToken;
            }

            const fetchedEmails = await mailService.getEmails(filter, accountId);

            // Jeśli odświeżamy, zastępujemy stan, w przeciwnym wypadku dołączamy
            setEmails(prev => refresh ? fetchedEmails : [...prev, ...fetchedEmails]);

            // Sprawdzamy, czy są kolejne strony (w rzeczywistej implementacji
            // API powinno zwrócić nextPageToken lub podobną informację)
            setHasMore(fetchedEmails.length === filter.maxResults);

            // Pobranie podsumowania folderów
            const summaries = await mailService.getFoldersSummary(accountId);
            setFolderSummaries(summaries);

        } catch (err) {
            setError('Wystąpił błąd podczas pobierania wiadomości');
            console.error('Error fetching emails:', err);
        } finally {
            setLoading(false);
        }
    }, [labelId, accountId, pageToken]);

    // Ładowanie emaili przy pierwszym renderowaniu
    useEffect(() => {
        if (labelId) {
            // Resetowanie stanu przy zmianie folderu
            setEmails([]);
            setPageToken(null);
            setHasMore(true);

            fetchEmails(true);
        }
    }, [labelId, fetchEmails]);

    // Funkcja do pobierania kolejnej strony emaili
    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            fetchEmails();
        }
    }, [loading, hasMore, fetchEmails]);

    // Funkcja do odświeżania listy emaili
    const refreshEmails = useCallback(() => {
        fetchEmails(true);
    }, [fetchEmails]);

    // Funkcja do oznaczania emaila jako przeczytany/nieprzeczytany
    const markAsRead = useCallback(async (emailId: string, isRead: boolean) => {
        try {
            console.log(`Oznaczanie wiadomości ${emailId} jako ${isRead ? 'przeczytana' : 'nieprzeczytana'}...`);

            // Najpierw aktualizujemy lokalny stan dla natychmiastowej reakcji UI
            setEmails(prev =>
                prev.map(email =>
                    email.id === emailId ? { ...email, isRead } : email
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
                    email.id === emailId ? { ...email, isRead: !isRead } : email
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