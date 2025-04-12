// src/pages/Mail/services/providers/ImapProvider.ts
import { MailProvider } from './MailProvider';
import {
    Email,
    EmailFilter,
    EmailLabel,
    EmailThread,
    EmailDraft,
    MailAccount,
    MailFolderSummary,
    MailServerConfig,
    EmailProviderType,
    EmailLabelType
} from '../../../../types/mail';
import axios from 'axios';
import {
    IMAP_FOLDER_MAPPING,
    MAIL_API_BASE_URL
} from '../config/imapConfig';

/**
 * Implementacja MailProvider dla serwera IMAP/SMTP dostępnego przez proxy backend
 */
export class ImapProvider implements MailProvider {
    private isAuthenticated = false;
    private accountInfo: MailAccount | null = null;
    private authToken: string | null = null;

    /**
     * Konstruktor
     * @param serverConfig Konfiguracja serwera IMAP/SMTP (opcjonalna, można podać później w authorize)
     */
    constructor(private serverConfig?: MailServerConfig) {}

    /**
     * Inicjalizacja providera
     */
    public async initialize(): Promise<boolean> {
        // W przypadku IMAP nie ma potrzeby osobnej inicjalizacji,
        // wszystko dzieje się w momencie autoryzacji
        return this.isAuthenticated;
    }

    /**
     * Autoryzacja użytkownika
     * @param credentials Dane uwierzytelniające (email, hasło, konfiguracja serwera)
     */
    public async authorize(credentials?: {
        email: string;
        password: string;
        serverConfig?: MailServerConfig;
    }): Promise<boolean> {
        if (this.isAuthenticated && this.accountInfo) {
            return true;
        }

        if (!credentials) {
            throw new Error('Brak danych uwierzytelniających dla serwera IMAP/SMTP');
        }

        try {
            // Używamy przekazanej konfiguracji lub tej z konstruktora
            const config = credentials.serverConfig || this.serverConfig;

            if (!config) {
                throw new Error('Brak konfiguracji serwera IMAP/SMTP');
            }

            // Wysyłamy żądanie uwierzytelnienia do naszego backendu proxy
            console.log("tu jestesmy");
            console.log(MAIL_API_BASE_URL);
            const response = await axios.post(`${MAIL_API_BASE_URL}/auth/login`, {
                email: credentials.email,
                password: credentials.password,
                imapHost: config.imapHost,
                imapPort: config.imapPort,
                imapSecure: config.imapSecure,
                smtpHost: config.smtpHost,
                smtpPort: config.smtpPort,
                smtpSecure: config.smtpSecure
            });

            if (response.data.success) {
                this.isAuthenticated = true;
                this.authToken = response.data.token;

                // Zapisanie informacji o koncie
                this.accountInfo = {
                    id: `imap_${credentials.email}`,
                    email: credentials.email,
                    name: credentials.email.split('@')[0],
                    providerType: 'imap',
                    isDefault: !credentials.serverConfig, // Domyślne tylko jeśli nie podano jawnie konfiguracji
                    serverConfig: config
                };

                // Zapisanie konfiguracji serwera jeśli jej nie mieliśmy
                if (!this.serverConfig) {
                    this.serverConfig = config;
                }

                return true;
            } else {
                throw new Error(response.data.message || 'Błąd uwierzytelniania');
            }
        } catch (error) {
            console.error('Błąd podczas autoryzacji IMAP/SMTP:', error);
            throw error;
        }
    }

    /**
     * Wylogowanie użytkownika
     */
    public async signOut(): Promise<void> {
        if (this.isAuthenticated && this.authToken) {
            try {
                await axios.post(`${MAIL_API_BASE_URL}/auth/logout`, {}, {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                });
            } catch (error) {
                console.error('Błąd podczas wylogowywania:', error);
            }
        }

        this.isAuthenticated = false;
        this.authToken = null;
        this.accountInfo = null;
    }

    /**
     * Sprawdzenie stanu autoryzacji
     */
    public isAuthorized(): boolean {
        return this.isAuthenticated;
    }

    /**
     * Pobieranie informacji o koncie
     */
    public async getAccount(): Promise<MailAccount> {
        if (!this.isAuthenticated || !this.authToken) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        if (this.accountInfo) {
            return this.accountInfo;
        }

        throw new Error('Brak informacji o koncie. Wymagana ponowna autoryzacja.');
    }

    /**
     * Pobieranie listy emaili
     */
    public async getEmails(filter: EmailFilter = {}): Promise<Email[]> {
        if (!this.isAuthenticated || !this.authToken) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            // Przygotowanie parametrów zapytania
            const params: any = {
                maxResults: filter.maxResults || 20
            };

            if (filter.q) {
                params.query = filter.q;
            }

            if (filter.labelIds && filter.labelIds.length > 0) {
                params.folders = filter.labelIds;
            }

            if (filter.pageToken) {
                params.pageToken = filter.pageToken;
            }

            // Pobieranie emaili z naszego backendu proxy
            const response = await axios.get(`${MAIL_API_BASE_URL}/emails`, {
                params,
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.data.success) {
                return response.data.emails.map((email: any) => this.mapBackendEmailToEmail(email));
            } else {
                throw new Error(response.data.message || 'Błąd pobierania emaili');
            }
        } catch (error) {
            console.error('Błąd podczas pobierania emaili IMAP:', error);
            throw error;
        }
    }

    /**
     * Pobieranie pojedynczego emaila
     */
    public async getEmail(emailId: string): Promise<Email> {
        if (!this.isAuthenticated || !this.authToken) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const response = await axios.get(`${MAIL_API_BASE_URL}/emails/${emailId}`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.data.success) {
                return this.mapBackendEmailToEmail(response.data.email);
            } else {
                throw new Error(response.data.message || `Nie można pobrać emaila o ID: ${emailId}`);
            }
        } catch (error) {
            console.error(`Błąd podczas pobierania emaila IMAP (ID: ${emailId}):`, error);
            throw error;
        }
    }

    /**
     * Pobieranie wątku emaili
     */
    public async getThread(threadId: string): Promise<EmailThread> {
        if (!this.isAuthenticated || !this.authToken) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const response = await axios.get(`${MAIL_API_BASE_URL}/threads/${threadId}`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.data.success) {
                return {
                    id: response.data.thread.id,
                    snippet: response.data.thread.snippet || '',
                    historyId: response.data.thread.historyId || '',
                    messages: response.data.thread.messages.map((msg: any) => this.mapBackendEmailToEmail(msg))
                };
            } else {
                throw new Error(response.data.message || `Nie można pobrać wątku o ID: ${threadId}`);
            }
        } catch (error) {
            console.error(`Błąd podczas pobierania wątku IMAP (ID: ${threadId}):`, error);
            throw error;
        }
    }

    /**
     * Pobieranie załącznika
     */
    public async getAttachment(messageId: string, attachmentId: string): Promise<string> {
        if (!this.isAuthenticated || !this.authToken) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const response = await axios.get(
                `${MAIL_API_BASE_URL}/emails/${messageId}/attachments/${attachmentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                }
            );

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Nie można pobrać załącznika');
            }
        } catch (error) {
            console.error(`Błąd podczas pobierania załącznika IMAP:`, error);
            throw error;
        }
    }

    /**
     * Pobieranie etykiet (folderów IMAP)
     */
    public async getLabels(): Promise<EmailLabel[]> {
        if (!this.isAuthenticated || !this.authToken) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const response = await axios.get(`${MAIL_API_BASE_URL}/folders`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.data.success) {
                return response.data.folders.map((folder: any) => {
                    // Mapowanie nazw folderów IMAP na nasze standardowe typy
                    const mappedFolder = IMAP_FOLDER_MAPPING[folder.name.toLowerCase() as keyof typeof IMAP_FOLDER_MAPPING];

                    return {
                        id: folder.path, // Używamy ścieżki jako identyfikatora
                        name: folder.name,
                        type: mappedFolder?.type || 'custom',
                        path: folder.path
                    };
                });
            } else {
                throw new Error(response.data.message || 'Nie można pobrać folderów');
            }
        } catch (error) {
            console.error('Błąd podczas pobierania folderów IMAP:', error);
            throw error;
        }
    }

    /**
     * Pobieranie podsumowania folderów
     */
    public async getFoldersSummary(): Promise<MailFolderSummary[]> {
        if (!this.isAuthenticated || !this.authToken) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const response = await axios.get(`${MAIL_API_BASE_URL}/folders/summary`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.data.success) {
                return response.data.summary.map((folder: any) => {
                    const mappedFolder = IMAP_FOLDER_MAPPING[folder.name.toLowerCase() as keyof typeof IMAP_FOLDER_MAPPING];

                    return {
                        labelId: folder.path,
                        name: folder.name,
                        type: mappedFolder?.type || 'custom',
                        totalCount: folder.total || 0,
                        unreadCount: folder.unread || 0,
                        path: folder.path
                    };
                });
            } else {
                throw new Error(response.data.message || 'Nie można pobrać podsumowania folderów');
            }
        } catch (error) {
            console.error('Błąd podczas pobierania podsumowania folderów IMAP:', error);
            throw error;
        }
    }

    /**
     * Wysyłanie emaila
     */
    public async sendEmail(draft: EmailDraft): Promise<string> {
        if (!this.isAuthenticated || !this.authToken) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const response = await axios.post(`${MAIL_API_BASE_URL}/emails/send`, draft, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.data.success) {
                return response.data.messageId;
            } else {
                throw new Error(response.data.message || 'Błąd wysyłania emaila');
            }
        } catch (error) {
            console.error('Błąd podczas wysyłania emaila SMTP:', error);
            throw error;
        }
    }

    /**
     * Zapisywanie wersji roboczej emaila
     */
    public async saveDraft(draft: EmailDraft): Promise<string> {
        if (!this.isAuthenticated || !this.authToken) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const response = await axios.post(`${MAIL_API_BASE_URL}/emails/draft`, draft, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.data.success) {
                return response.data.messageId;
            } else {
                throw new Error(response.data.message || 'Błąd zapisywania wersji roboczej');
            }
        } catch (error) {
            console.error('Błąd podczas zapisywania wersji roboczej emaila IMAP:', error);
            throw error;
        }
    }

    /**
     * Oznaczanie emaila jako przeczytany/nieprzeczytany
     */
    public async markAsRead(emailId: string, isRead: boolean): Promise<void> {
        if (!this.isAuthenticated || !this.authToken) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const response = await axios.patch(
                `${MAIL_API_BASE_URL}/emails/${emailId}/read`,
                { isRead },
                {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || `Błąd oznaczania emaila jako ${isRead ? 'przeczytany' : 'nieprzeczytany'}`);
            }
        } catch (error) {
            console.error(`Błąd podczas oznaczania emaila IMAP jako ${isRead ? 'przeczytany' : 'nieprzeczytany'}:`, error);
            throw error;
        }
    }

    /**
     * Oznaczanie emaila gwiazdką/usuwanie gwiazdki
     */
    public async toggleStar(emailId: string, isStarred: boolean): Promise<void> {
        if (!this.isAuthenticated || !this.authToken) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const response = await axios.patch(
                `${MAIL_API_BASE_URL}/emails/${emailId}/flag`,
                {
                    flagName: '\\Flagged',
                    value: isStarred
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || `Błąd ${isStarred ? 'dodawania' : 'usuwania'} gwiazdki`);
            }
        } catch (error) {
            console.error(`Błąd podczas ${isStarred ? 'dodawania' : 'usuwania'} gwiazdki IMAP:`, error);
            throw error;
        }
    }

    /**
     * Przenoszenie emaila do kosza
     */
    public async moveToTrash(emailId: string): Promise<void> {
        if (!this.isAuthenticated || !this.authToken) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const response = await axios.patch(
                `${MAIL_API_BASE_URL}/emails/${emailId}/move`,
                { destinationFolder: 'Trash' },
                {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Błąd przenoszenia emaila do kosza');
            }
        } catch (error) {
            console.error('Błąd podczas przenoszenia emaila IMAP do kosza:', error);
            throw error;
        }
    }

    /**
     * Przywracanie emaila z kosza
     */
    public async restoreFromTrash(emailId: string): Promise<void> {
        if (!this.isAuthenticated || !this.authToken) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const response = await axios.patch(
                `${MAIL_API_BASE_URL}/emails/${emailId}/move`,
                { destinationFolder: 'INBOX' },
                {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Błąd przywracania emaila z kosza');
            }
        } catch (error) {
            console.error('Błąd podczas przywracania emaila IMAP z kosza:', error);
            throw error;
        }
    }

    /**
     * Trwałe usuwanie emaila
     */
    public async permanentlyDelete(emailId: string): Promise<void> {
        if (!this.isAuthenticated || !this.authToken) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const response = await axios.delete(`${MAIL_API_BASE_URL}/emails/${emailId}`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Błąd trwałego usuwania emaila');
            }
        } catch (error) {
            console.error('Błąd podczas trwałego usuwania emaila IMAP:', error);
            throw error;
        }
    }

    /**
     * Aktualizacja etykiet/folderów dla emaila
     */
    public async updateLabels(emailId: string, addLabelIds: string[], removeLabelIds: string[]): Promise<void> {
        if (!this.isAuthenticated || !this.authToken) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const response = await axios.patch(
                `${MAIL_API_BASE_URL}/emails/${emailId}/folders`,
                {
                    addFolders: addLabelIds,
                    removeFolders: removeLabelIds
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Błąd aktualizacji folderów');
            }
        } catch (error) {
            console.error('Błąd podczas aktualizacji folderów IMAP:', error);
            throw error;
        }
    }

    /**
     * Tworzenie nowego folderu
     */
    public async createLabel(name: string, color?: string): Promise<EmailLabel> {
        if (!this.isAuthenticated || !this.authToken) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const response = await axios.post(
                `${MAIL_API_BASE_URL}/folders`,
                {
                    name,
                    color
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                }
            );

            if (response.data.success) {
                return {
                    id: response.data.folder.path,
                    name: response.data.folder.name,
                    type: 'custom',
                    color,
                    path: response.data.folder.path
                };
            } else {
                throw new Error(response.data.message || 'Błąd tworzenia folderu');
            }
        } catch (error) {
            console.error('Błąd podczas tworzenia folderu IMAP:', error);
            throw error;
        }
    }

    /**
     * Usuwanie folderu
     */
    public async deleteLabel(labelId: string): Promise<void> {
        if (!this.isAuthenticated || !this.authToken) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const response = await axios.delete(`${MAIL_API_BASE_URL}/folders/${encodeURIComponent(labelId)}`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Błąd usuwania folderu');
            }
        } catch (error) {
            console.error('Błąd podczas usuwania folderu IMAP:', error);
            throw error;
        }
    }

    // Prywatne metody pomocnicze

    /**
     * Mapowanie emaila z formatu backendu na nasz format
     */
    private mapBackendEmailToEmail(email: any): Email {
        // Domyślne wartości
        const result: Email = {
            id: email.id,
            threadId: email.threadId || email.id, // Niektóre serwery IMAP mogą nie obsługiwać wątków
            labelIds: email.folders || [],
            snippet: email.snippet || '',
            internalDate: new Date(email.date).getTime(),
            subject: email.subject || '',
            from: email.from || { email: '' },
            to: email.to || [],
            isRead: email.isRead || false,
            isStarred: email.isStarred || false,
            isImportant: email.isImportant || false,
            providerId: 'imap'
        };

        // Opcjonalne pola
        if (email.cc && email.cc.length > 0) {
            result.cc = email.cc;
        }

        if (email.bcc && email.bcc.length > 0) {
            result.bcc = email.bcc;
        }

        if (email.htmlBody || email.textBody) {
            result.body = {
                plain: email.textBody || '',
                html: email.htmlBody
            };
        }

        if (email.attachments && email.attachments.length > 0) {
            result.attachments = email.attachments;
        }

        return result;
    }
}