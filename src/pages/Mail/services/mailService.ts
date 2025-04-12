// src/pages/Mail/services/mailService.ts
import {
    EmailProviderType,
    Email,
    EmailThread,
    EmailFilter,
    EmailLabel,
    EmailDraft,
    MailAccount,
    MailFolderSummary,
    MailServerConfig
} from '../../../types/mail';
import { MailProvider } from './providers/MailProvider';
import { GmailProvider } from './providers/GmailProvider';
import { ImapProvider } from './providers/ImapProvider';

/**
 * Główny serwis poczty - fasada obsługująca wielu dostawców
 */
class MailService {
    private static instance: MailService;
    private providers: Map<string, MailProvider> = new Map();
    private accounts: Map<string, MailAccount> = new Map();
    private defaultAccountId: string | null = null;

    // Singleton
    private constructor() {}

    // Metoda do pobierania instancji - wzorzec Singleton
    public static getInstance(): MailService {
        if (!MailService.instance) {
            MailService.instance = new MailService();
        }
        return MailService.instance;
    }

    /**
     * Inicjalizacja dostawcy poczty dla danego typu
     */
    public async initializeProvider(type: EmailProviderType): Promise<boolean> {
        try {
            const provider = this.createProvider(type);
            const isInitialized = await provider.initialize();
            return isInitialized;
        } catch (error) {
            console.error(`Błąd inicjalizacji dostawcy poczty typu ${type}:`, error);
            return false;
        }
    }

    /**
     * Autoryzacja konta pocztowego
     */
    public async authorizeAccount(
        providerType: EmailProviderType,
        credentials?: any
    ): Promise<string | null> {
        try {
            // Utworzenie i inicjalizacja dostawcy
            const provider = this.createProvider(providerType);
            const isAuthorized = await provider.authorize(credentials);

            if (!isAuthorized) {
                throw new Error('Nie udało się autoryzować konta.');
            }

            // Pobranie informacji o koncie
            const account = await provider.getAccount();

            // Zarejestrowanie konta i dostawcy
            this.accounts.set(account.id, account);
            this.providers.set(account.id, provider);

            // Ustawienie domyślnego konta jeśli nie mamy jeszcze żadnego
            if (!this.defaultAccountId) {
                this.defaultAccountId = account.id;
            }

            // Ustawienie tego konta jako domyślnego, jeśli jest tak oznaczone
            if (account.isDefault) {
                this.defaultAccountId = account.id;
            }

            return account.id;
        } catch (error) {
            console.error(`Błąd autoryzacji konta ${providerType}:`, error);
            return null;
        }
    }

    /**
     * Wylogowanie z konta
     */
    public async signOut(accountId: string): Promise<boolean> {
        const provider = this.providers.get(accountId);

        if (!provider) {
            console.error(`Nie znaleziono dostawcy dla konta ${accountId}`);
            return false;
        }

        try {
            await provider.signOut();
            this.providers.delete(accountId);
            this.accounts.delete(accountId);

            // Jeśli wylogowujemy się z domyślnego konta, trzeba ustawić nowe
            if (this.defaultAccountId === accountId) {
                this.defaultAccountId = this.accounts.size > 0 ?
                    [...this.accounts.keys()][0] : null;
            }

            return true;
        } catch (error) {
            console.error(`Błąd wylogowania z konta ${accountId}:`, error);
            return false;
        }
    }

    /**
     * Pobranie wszystkich zarejestrowanych kont
     */
    public getAccounts(): MailAccount[] {
        return [...this.accounts.values()];
    }

    /**
     * Pobranie domyślnego konta
     */
    public getDefaultAccount(): MailAccount | null {
        if (!this.defaultAccountId) return null;
        return this.accounts.get(this.defaultAccountId) || null;
    }

    /**
     * Ustawienie domyślnego konta
     */
    public setDefaultAccount(accountId: string): boolean {
        if (!this.accounts.has(accountId)) {
            return false;
        }

        this.defaultAccountId = accountId;

        // Aktualizacja flagi isDefault dla wszystkich kont
        for (const [id, account] of this.accounts) {
            this.accounts.set(id, {
                ...account,
                isDefault: id === accountId
            });
        }

        return true;
    }

    /**
     * Pobranie emaili
     */
    public async getEmails(
        filter: EmailFilter,
        accountId?: string
    ): Promise<Email[]> {
        const provider = this.getProviderForAccount(accountId);

        try {
            return await provider.getEmails(filter);
        } catch (error) {
            console.error('Błąd podczas pobierania emaili:', error);
            throw error;
        }
    }

    /**
     * Pobranie pojedynczego emaila
     */
    public async getEmail(
        emailId: string,
        accountId?: string
    ): Promise<Email> {
        const provider = this.getProviderForAccount(accountId);

        try {
            return await provider.getEmail(emailId);
        } catch (error) {
            console.error(`Błąd podczas pobierania emaila (ID: ${emailId}):`, error);
            throw error;
        }
    }

    /**
     * Pobranie wątku emaili
     */
    public async getThread(
        threadId: string,
        accountId?: string
    ): Promise<EmailThread> {
        const provider = this.getProviderForAccount(accountId);

        try {
            return await provider.getThread(threadId);
        } catch (error) {
            console.error(`Błąd podczas pobierania wątku (ID: ${threadId}):`, error);
            throw error;
        }
    }

    /**
     * Pobranie załącznika
     */
    public async getAttachment(
        messageId: string,
        attachmentId: string,
        accountId?: string
    ): Promise<string> {
        const provider = this.getProviderForAccount(accountId);

        try {
            return await provider.getAttachment(messageId, attachmentId);
        } catch (error) {
            console.error(`Błąd podczas pobierania załącznika:`, error);
            throw error;
        }
    }

    /**
     * Pobranie etykiet/folderów
     */
    public async getLabels(accountId?: string): Promise<EmailLabel[]> {
        const provider = this.getProviderForAccount(accountId);

        try {
            return await provider.getLabels();
        } catch (error) {
            console.error('Błąd podczas pobierania etykiet:', error);
            throw error;
        }
    }

    /**
     * Pobranie podsumowania folderów
     */
    public async getFoldersSummary(accountId?: string): Promise<MailFolderSummary[]> {
        const provider = this.getProviderForAccount(accountId);

        try {
            return await provider.getFoldersSummary();
        } catch (error) {
            console.error('Błąd podczas pobierania podsumowania folderów:', error);
            throw error;
        }
    }

    /**
     * Wysyłanie emaila
     */
    public async sendEmail(
        draft: EmailDraft,
        accountId?: string
    ): Promise<string> {
        const provider = this.getProviderForAccount(accountId);

        try {
            return await provider.sendEmail(draft);
        } catch (error) {
            console.error('Błąd podczas wysyłania emaila:', error);
            throw error;
        }
    }

    /**
     * Zapisywanie wersji roboczej emaila
     */
    public async saveDraft(
        draft: EmailDraft,
        accountId?: string
    ): Promise<string> {
        const provider = this.getProviderForAccount(accountId);

        try {
            return await provider.saveDraft(draft);
        } catch (error) {
            console.error('Błąd podczas zapisywania wersji roboczej emaila:', error);
            throw error;
        }
    }

    /**
     * Oznaczanie emaila jako przeczytany/nieprzeczytany
     */
    public async markAsRead(
        emailId: string,
        isRead: boolean,
        accountId?: string
    ): Promise<void> {
        const provider = this.getProviderForAccount(accountId);

        try {
            await provider.markAsRead(emailId, isRead);
        } catch (error) {
            console.error(`Błąd podczas oznaczania emaila jako ${isRead ? 'przeczytany' : 'nieprzeczytany'}:`, error);
            throw error;
        }
    }

    /**
     * Oznaczanie emaila gwiazdką/usuwanie gwiazdki
     */
    public async toggleStar(
        emailId: string,
        isStarred: boolean,
        accountId?: string
    ): Promise<void> {
        const provider = this.getProviderForAccount(accountId);

        try {
            await provider.toggleStar(emailId, isStarred);
        } catch (error) {
            console.error(`Błąd podczas ${isStarred ? 'dodawania' : 'usuwania'} gwiazdki:`, error);
            throw error;
        }
    }

    /**
     * Przenoszenie emaila do kosza
     */
    public async moveToTrash(
        emailId: string,
        accountId?: string
    ): Promise<void> {
        const provider = this.getProviderForAccount(accountId);

        try {
            await provider.moveToTrash(emailId);
        } catch (error) {
            console.error('Błąd podczas przenoszenia emaila do kosza:', error);
            throw error;
        }
    }

    /**
     * Przywracanie emaila z kosza
     */
    public async restoreFromTrash(
        emailId: string,
        accountId?: string
    ): Promise<void> {
        const provider = this.getProviderForAccount(accountId);

        try {
            await provider.restoreFromTrash(emailId);
        } catch (error) {
            console.error('Błąd podczas przywracania emaila z kosza:', error);
            throw error;
        }
    }

    /**
     * Trwałe usuwanie emaila
     */
    public async permanentlyDelete(
        emailId: string,
        accountId?: string
    ): Promise<void> {
        const provider = this.getProviderForAccount(accountId);

        try {
            await provider.permanentlyDelete(emailId);
        } catch (error) {
            console.error('Błąd podczas trwałego usuwania emaila:', error);
            throw error;
        }
    }

    /**
     * Aktualizacja etykiet dla emaila
     */
    public async updateLabels(
        emailId: string,
        addLabelIds: string[],
        removeLabelIds: string[],
        accountId?: string
    ): Promise<void> {
        const provider = this.getProviderForAccount(accountId);

        try {
            await provider.updateLabels(emailId, addLabelIds, removeLabelIds);
        } catch (error) {
            console.error('Błąd podczas aktualizacji etykiet:', error);
            throw error;
        }
    }

    /**
     * Tworzenie nowej etykiety/folderu
     */
    public async createLabel(
        name: string,
        color?: string,
        accountId?: string
    ): Promise<EmailLabel> {
        const provider = this.getProviderForAccount(accountId);

        try {
            return await provider.createLabel(name, color);
        } catch (error) {
            console.error('Błąd podczas tworzenia etykiety:', error);
            throw error;
        }
    }

    /**
     * Usuwanie etykiety/folderu
     */
    public async deleteLabel(
        labelId: string,
        accountId?: string
    ): Promise<void> {
        const provider = this.getProviderForAccount(accountId);

        try {
            await provider.deleteLabel(labelId);
        } catch (error) {
            console.error('Błąd podczas usuwania etykiety:', error);
            throw error;
        }
    }

    /**
     * Dodanie konfiguracji serwera pocztowego IMAP/SMTP
     */
    public addImapServerConfig(
        email: string,
        config: MailServerConfig
    ): MailAccount {
        const id = `imap_${email}`;
        const account: MailAccount = {
            id,
            email,
            name: email.split('@')[0],
            providerType: 'imap',
            serverConfig: config
        };

        this.accounts.set(id, account);
        return account;
    }

    /**
     * Tworzenie dostawcy dla danego typu
     */
    private createProvider(type: EmailProviderType): MailProvider {
        switch (type) {
            case 'gmail':
                return new GmailProvider();
            case 'imap':
                return new ImapProvider();
            default:
                throw new Error(`Nieobsługiwany typ dostawcy poczty: ${type}`);
        }
    }

    /**
     * Pobranie dostawcy dla danego konta lub domyślnego
     */
    private getProviderForAccount(accountId?: string): MailProvider {
        const id = accountId || this.defaultAccountId;

        if (!id) {
            throw new Error('Brak aktywnego konta pocztowego');
        }

        const provider = this.providers.get(id);

        if (!provider) {
            throw new Error(`Nie znaleziono dostawcy dla konta ${id}`);
        }

        if (!provider.isAuthorized()) {
            throw new Error(`Konto ${id} nie jest autoryzowane`);
        }

        return provider;
    }
}

// Eksport instancji serwisu jako singleton
export default MailService.getInstance();