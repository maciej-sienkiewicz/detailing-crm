import { useState, useCallback, useEffect } from 'react';
import { MailAccount, EmailProviderType, MailServerConfig } from '../../../types/mail';
import mailService from '../services/mailService';
import { DEFAULT_MAIL_PROVIDERS } from '../services/config/imapConfig';

/**
 * Hook do zarządzania kontami pocztowymi
 */
export const useMailAccount = () => {
    const [accounts, setAccounts] = useState<MailAccount[]>([]);
    const [currentAccount, setCurrentAccount] = useState<MailAccount | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pobieranie kont przy pierwszym renderowaniu
    useEffect(() => {
        const fetchAccounts = () => {
            try {
                const allAccounts = mailService.getAccounts();
                setAccounts(allAccounts);

                const defaultAccount = mailService.getDefaultAccount();
                if (defaultAccount) {
                    setCurrentAccount(defaultAccount);
                } else if (allAccounts.length > 0) {
                    setCurrentAccount(allAccounts[0]);
                }
            } catch (err) {
                console.error('Error fetching accounts:', err);
            }
        };

        fetchAccounts();
    }, []);

    // Funkcja do autoryzacji konta Gmail
    const authorizeGmailAccount = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Inicjalizacja dostawcy Gmail
            await mailService.initializeProvider('gmail');

            // Autoryzacja
            const accountId = await mailService.authorizeAccount('gmail');

            if (accountId) {
                // Pobieranie zaktualizowanej listy kont
                const allAccounts = mailService.getAccounts();
                setAccounts(allAccounts);

                // Ustawienie nowego konta jako bieżące
                const gmailAccount = allAccounts.find(acc => acc.id === accountId);
                if (gmailAccount) {
                    setCurrentAccount(gmailAccount);
                }

                return true;
            }

            return false;

        } catch (err) {
            console.error('Error authorizing Gmail account:', err);
            setError('Nie udało się autoryzować konta Gmail');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Funkcja do autoryzacji konta IMAP
    const authorizeImapAccount = useCallback(async (
        email: string,
        password: string,
        serverConfig?: MailServerConfig
    ) => {
        try {
            setLoading(true);
            setError(null);

            // Automatyczne wykrywanie konfiguracji serwera dla znanych dostawców
            if (!serverConfig) {
                const domain = email.split('@')[1];
                if (domain && DEFAULT_MAIL_PROVIDERS[domain as keyof typeof DEFAULT_MAIL_PROVIDERS]) {
                    serverConfig = DEFAULT_MAIL_PROVIDERS[domain as keyof typeof DEFAULT_MAIL_PROVIDERS];
                }
            }

            if (!serverConfig) {
                setError('Nie można automatycznie wykryć konfiguracji serwera. Podaj ją ręcznie.');
                return false;
            }

            // Dodanie konfiguracji serwera
            const account = mailService.addImapServerConfig(email, serverConfig);

            // Autoryzacja
            const accountId = await mailService.authorizeAccount('imap', {
                email,
                password,
                serverConfig
            });

            if (accountId) {
                // Pobieranie zaktualizowanej listy kont
                const allAccounts = mailService.getAccounts();
                setAccounts(allAccounts);

                // Ustawienie nowego konta jako bieżące
                const imapAccount = allAccounts.find(acc => acc.id === accountId);
                if (imapAccount) {
                    setCurrentAccount(imapAccount);
                }

                return true;
            }

            return false;

        } catch (err) {
            console.error('Error authorizing IMAP account:', err);
            setError('Nie udało się autoryzować konta IMAP/SMTP');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Funkcja do wylogowania z konta
    const signOut = useCallback(async (accountIdToSignOut?: string) => {
        const idToSignOut = accountIdToSignOut || (currentAccount?.id || '');

        if (!idToSignOut) return false;

        try {
            setLoading(true);

            const success = await mailService.signOut(idToSignOut);

            if (success) {
                // Pobieranie zaktualizowanej listy kont
                const allAccounts = mailService.getAccounts();
                setAccounts(allAccounts);

                // Jeśli wylogowaliśmy się z bieżącego konta, zmieniamy bieżące konto
                if (currentAccount?.id === idToSignOut) {
                    const defaultAccount = mailService.getDefaultAccount();
                    if (defaultAccount) {
                        setCurrentAccount(defaultAccount);
                    } else if (allAccounts.length > 0) {
                        setCurrentAccount(allAccounts[0]);
                    } else {
                        setCurrentAccount(null);
                    }
                }
            }

            return success;

        } catch (err) {
            console.error(`Error signing out from account ${idToSignOut}:`, err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [currentAccount]);

    // Funkcja do zmiany bieżącego konta
    const switchAccount = useCallback((accountId: string) => {
        const account = accounts.find(acc => acc.id === accountId);
        if (account) {
            setCurrentAccount(account);

            // Ustawienie tego konta jako domyślnego
            mailService.setDefaultAccount(accountId);

            return true;
        }
        return false;
    }, [accounts]);

    return {
        accounts,
        currentAccount,
        loading,
        error,
        authorizeGmailAccount,
        authorizeImapAccount,
        signOut,
        switchAccount
    };
};