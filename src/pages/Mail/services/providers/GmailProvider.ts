// src/pages/Mail/services/providers/GmailProvider.ts
import { MailProvider } from './MailProvider';
import {
    Email,
    EmailFilter,
    EmailLabel,
    EmailThread,
    EmailDraft,
    MailAccount,
    MailFolderSummary,
    EmailProviderType
} from '../../../../types/mail';
import { GMAIL_API_CONFIG, GMAIL_LABEL_MAPPING, MAIL_PAGINATION } from '../config/gmailConfig';
import { gapi } from 'gapi-script';



/**
 * Implementacja MailProvider dla Gmail API
 */
export class GmailProvider implements MailProvider {
    private gapiLoaded = false;
    private gisLoaded = false;
    private isInitialized = false;
    private isAuthorizedd = false;
    private tokenClient: any = null;
    private accountInfo: MailAccount | null = null;

    /**
     * Inicjalizacja klienta Gmail API
     */
    public async initialize(): Promise<boolean> {
        if (this.isInitialized) {
            return this.isAuthorizedd;
        }

        try {
            // Ładowanie biblioteki gapi
            if (!this.gapiLoaded) {
                await this.loadGapiScript();
            }

            // Ładowanie biblioteki gis (Google Identity Services)
            if (!this.gisLoaded) {
                await this.loadGisScript();
            }

            // Inicjalizacja gapi
            await new Promise<void>((resolve) => {
                gapi.load('client', async () => {
                    await gapi.client.init({
                        apiKey: GMAIL_API_CONFIG.API_KEY,
                        discoveryDocs: GMAIL_API_CONFIG.DISCOVERY_DOCS,
                    });
                    this.gapiLoaded = true;
                    resolve();
                });
            });

            // Inicjalizacja klienta tokenów
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: GMAIL_API_CONFIG.CLIENT_ID,
                scope: GMAIL_API_CONFIG.SCOPES,
                callback: (tokenResponse: any) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        this.isAuthorizedd = true;
                    }
                },
            });
            this.isAuthorizedd = true
            console.log(this.isAuthorized())


            this.isInitialized = true;

            // Sprawdzenie, czy użytkownik jest już zalogowany
            const token = gapi.client.getToken();
            console.log(token)
            this.isAuthorizedd = token !== null;

            return this.isAuthorizedd;
        } catch (error) {
            console.error('Błąd podczas inicjalizacji Gmail API:', error);
            throw error;
        }
    }

    /**
     * Autoryzacja użytkownika
     */
    public async authorize(): Promise<boolean> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (this.isAuthorizedd) {
            return true;
        }

        return new Promise<boolean>((resolve, reject) => {
            try {
                this.tokenClient.callback = (response: any) => {
                    if (response.error) {
                        reject(response);
                        return;
                    }
                    this.isAuthorizedd = true;
                    resolve(true);
                };
                this.tokenClient.requestAccessToken({ prompt: 'consent' });
            } catch (error) {
                reject(error);
                return false;
            }
        });
    }

    /**
     * Wylogowanie użytkownika
     */
    public async signOut(): Promise<void> {
        const token = gapi.client.getToken();
        if (token) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken(null);
            this.isAuthorizedd = false;
            this.accountInfo = null;
        }
    }

    /**
     * Sprawdzenie stanu autoryzacji
     */
    public isAuthorized(): boolean {
        return this.isAuthorizedd;
    }

    /**
     * Pobieranie informacji o koncie
     */
    public async getAccount(): Promise<MailAccount> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        if (this.accountInfo) {
            return this.accountInfo;
        }

        try {
            const profile = await this.callApi<any>('profile');

            this.accountInfo = {
                id: `gmail_${profile.emailAddress}`,
                email: profile.emailAddress,
                name: profile.emailAddress.split('@')[0], // Prosta nazwa użytkownika z adresu email
                providerType: 'gmail' as EmailProviderType,
                isDefault: true
            };

            return this.accountInfo;
        } catch (error) {
            console.error('Błąd podczas pobierania profilu użytkownika:', error);
            throw error;
        }
    }

    /**
     * Pobieranie listy emaili
     */
    public async getEmails(filter: EmailFilter = {}): Promise<Email[]> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const params: any = {
                maxResults: filter.maxResults || MAIL_PAGINATION.DEFAULT_PAGE_SIZE
            };

            if (filter.q) {
                params.q = filter.q;
            }

            if (filter.labelIds && filter.labelIds.length > 0) {
                params.labelIds = filter.labelIds;
            }

            if (filter.pageToken) {
                params.pageToken = filter.pageToken;
            }

            const response = await this.callApi<{ messages?: { id: string, threadId: string }[], nextPageToken?: string }>('messages', 'GET', params);

            if (!response.messages || response.messages.length === 0) {
                return [];
            }

            // Pobieranie pełnych danych każdej wiadomości
            const emailPromises = response.messages.map(async (msg) => {
                const messageData = await this.callApi<any>(`messages/${msg.id}`, 'GET', { format: 'full' });
                return this.parseGmailMessage(messageData);
            });

            return await Promise.all(emailPromises);
        } catch (error) {
            console.error('Błąd podczas pobierania emaili:', error);
            throw error;
        }
    }

    /**
     * Pobieranie pojedynczego emaila
     */
    public async getEmail(emailId: string): Promise<Email> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const messageData = await this.callApi<any>(`messages/${emailId}`, 'GET', { format: 'full' });
            return this.parseGmailMessage(messageData);
        } catch (error) {
            console.error(`Błąd podczas pobierania emaila (ID: ${emailId}):`, error);
            throw error;
        }
    }

    /**
     * Pobieranie wątku emaili
     */
    public async getThread(threadId: string): Promise<EmailThread> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const threadData = await this.callApi<any>(`threads/${threadId}`, 'GET', { format: 'full' });

            const messages = threadData.messages.map((message: any) => this.parseGmailMessage(message));

            return {
                id: threadData.id,
                snippet: threadData.snippet || '',
                historyId: threadData.historyId,
                messages
            };
        } catch (error) {
            console.error(`Błąd podczas pobierania wątku (ID: ${threadId}):`, error);
            throw error;
        }
    }

    /**
     * Pobieranie załącznika
     */
    public async getAttachment(messageId: string, attachmentId: string): Promise<string> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const response = await this.callApi<{ data: string }>(
                `messages/${messageId}/attachments/${attachmentId}`,
                'GET'
            );

            return response.data;
        } catch (error) {
            console.error(`Błąd podczas pobierania załącznika:`, error);
            throw error;
        }
    }

    /**
     * Pobieranie etykiet
     */
    public async getLabels(): Promise<EmailLabel[]> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const response = await this.callApi<{ labels: any[] }>('labels', 'GET');

            return response.labels.map(label => {
                const mappedLabel = GMAIL_LABEL_MAPPING[label.id as keyof typeof GMAIL_LABEL_MAPPING];

                return {
                    id: label.id,
                    name: mappedLabel?.name || label.name,
                    type: mappedLabel?.type || 'custom',
                    color: label.color?.backgroundColor || undefined
                };
            });
        } catch (error) {
            console.error('Błąd podczas pobierania etykiet:', error);
            throw error;
        }
    }

    /**
     * Pobieranie podsumowania folderów
     */
    public async getFoldersSummary(): Promise<MailFolderSummary[]> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            // Pobieramy najpierw etykiety
            const labels = await this.getLabels();

            // Dla każdej etykiety pobieramy liczbę wszystkich i nieprzeczytanych wiadomości
            const summaryPromises = labels.map(async (label) => {
                // Wszystkie wiadomości z etykietą
                const totalResponse = await this.callApi<{ resultSizeEstimate: number }>(
                    'messages',
                    'GET',
                    {
                        labelIds: [label.id],
                        maxResults: 1 // Potrzebujemy tylko liczby, nie samych wiadomości
                    }
                );

                // Nieprzeczytane wiadomości z etykietą
                const unreadResponse = await this.callApi<{ resultSizeEstimate: number }>(
                    'messages',
                    'GET',
                    {
                        labelIds: [label.id, 'UNREAD'],
                        maxResults: 1
                    }
                );

                return {
                    labelId: label.id,
                    name: label.name,
                    type: label.type,
                    totalCount: totalResponse.resultSizeEstimate || 0,
                    unreadCount: unreadResponse.resultSizeEstimate || 0,
                    color: label.color
                };
            });

            return await Promise.all(summaryPromises);
        } catch (error) {
            console.error('Błąd podczas pobierania podsumowania folderów:', error);
            throw error;
        }
    }

    /**
     * Wysyłanie emaila
     */
    public async sendEmail(draft: EmailDraft): Promise<string> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            // Budowanie treści wiadomości w formacie MIME
            let emailContent = '';

            // Nagłówki
            emailContent += `From: ${draft.from ? draft.from.email : 'me'}\r\n`;
            emailContent += `To: ${draft.to.map(to => to.email).join(', ')}\r\n`;

            if (draft.cc && draft.cc.length > 0) {
                emailContent += `Cc: ${draft.cc.map(cc => cc.email).join(', ')}\r\n`;
            }

            if (draft.bcc && draft.bcc.length > 0) {
                emailContent += `Bcc: ${draft.bcc.map(bcc => bcc.email).join(', ')}\r\n`;
            }

            emailContent += `Subject: ${draft.subject}\r\n`;
            emailContent += 'Content-Type: text/html; charset=utf-8\r\n\r\n';

            // Treść wiadomości
            emailContent += draft.body.html || draft.body.plain;

            // Konwersja do base64url
            const encodedEmail = this.encodeBase64Url(emailContent);

            // Wysłanie emaila
            const response = await this.callApi<{ id: string }>(
                'messages/send',
                'POST',
                {},
                { raw: encodedEmail }
            );

            return response.id;
        } catch (error) {
            console.error('Błąd podczas wysyłania emaila:', error);
            throw error;
        }
    }

    /**
     * Zapisywanie wersji roboczej emaila
     */
    public async saveDraft(draft: EmailDraft): Promise<string> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            // Podobnie jak w sendEmail, budujemy treść w formacie MIME
            let emailContent = '';

            // Nagłówki
            emailContent += `From: ${draft.from ? draft.from.email : 'me'}\r\n`;
            emailContent += `To: ${draft.to.map(to => to.email).join(', ')}\r\n`;

            if (draft.cc && draft.cc.length > 0) {
                emailContent += `Cc: ${draft.cc.map(cc => cc.email).join(', ')}\r\n`;
            }

            if (draft.bcc && draft.bcc.length > 0) {
                emailContent += `Bcc: ${draft.bcc.map(bcc => bcc.email).join(', ')}\r\n`;
            }

            emailContent += `Subject: ${draft.subject}\r\n`;
            emailContent += 'Content-Type: text/html; charset=utf-8\r\n\r\n';

            // Treść wiadomości
            emailContent += draft.body.html || draft.body.plain;

            // Konwersja do base64url
            const encodedEmail = this.encodeBase64Url(emailContent);

            // Zapisanie wersji roboczej
            const response = await this.callApi<{ message: { id: string } }>(
                'drafts',
                'POST',
                {},
                { message: { raw: encodedEmail } }
            );

            return response.message.id;
        } catch (error) {
            console.error('Błąd podczas zapisywania wersji roboczej emaila:', error);
            throw error;
        }
    }

    /**
     * Oznaczanie emaila jako przeczytany/nieprzeczytany
     */
    public async markAsRead(emailId: string, isRead: boolean): Promise<void> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const addLabelIds = [];
            const removeLabelIds = [];

            if (isRead) {
                removeLabelIds.push('UNREAD');
            } else {
                addLabelIds.push('UNREAD');
            }

            await this.callApi(
                `messages/${emailId}/modify`,
                'POST',
                {},
                { addLabelIds, removeLabelIds }
            );
        } catch (error) {
            console.error(`Błąd podczas oznaczania emaila jako ${isRead ? 'przeczytany' : 'nieprzeczytany'}:`, error);
            throw error;
        }
    }

    /**
     * Oznaczanie emaila gwiazdką/usuwanie gwiazdki
     */
    public async toggleStar(emailId: string, isStarred: boolean): Promise<void> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const addLabelIds = [];
            const removeLabelIds = [];

            if (isStarred) {
                addLabelIds.push('STARRED');
            } else {
                removeLabelIds.push('STARRED');
            }

            await this.callApi(
                `messages/${emailId}/modify`,
                'POST',
                {},
                { addLabelIds, removeLabelIds }
            );
        } catch (error) {
            console.error(`Błąd podczas ${isStarred ? 'dodawania' : 'usuwania'} gwiazdki:`, error);
            throw error;
        }
    }

    /**
     * Przenoszenie emaila do kosza
     */
    public async moveToTrash(emailId: string): Promise<void> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            await this.callApi(
                `messages/${emailId}/trash`,
                'POST'
            );
        } catch (error) {
            console.error('Błąd podczas przenoszenia emaila do kosza:', error);
            throw error;
        }
    }

    /**
     * Przywracanie emaila z kosza
     */
    public async restoreFromTrash(emailId: string): Promise<void> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            await this.callApi(
                `messages/${emailId}/untrash`,
                'POST'
            );
        } catch (error) {
            console.error('Błąd podczas przywracania emaila z kosza:', error);
            throw error;
        }
    }

    /**
     * Trwałe usuwanie emaila
     */
    public async permanentlyDelete(emailId: string): Promise<void> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            await this.callApi(
                `messages/${emailId}`,
                'DELETE'
            );
        } catch (error) {
            console.error('Błąd podczas trwałego usuwania emaila:', error);
            throw error;
        }
    }

    /**
     * Aktualizacja etykiet dla emaila
     */
    public async updateLabels(emailId: string, addLabelIds: string[], removeLabelIds: string[]): Promise<void> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            await this.callApi(
                `messages/${emailId}/modify`,
                'POST',
                {},
                { addLabelIds, removeLabelIds }
            );
        } catch (error) {
            console.error('Błąd podczas aktualizacji etykiet:', error);
            throw error;
        }
    }

    /**
     * Tworzenie nowej etykiety
     */
    public async createLabel(name: string, color?: string): Promise<EmailLabel> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const labelData: any = {
                name,
                labelListVisibility: 'labelShow',
                messageListVisibility: 'show'
            };

            if (color) {
                labelData.color = {
                    backgroundColor: color,
                    textColor: this.getContrastColor(color)
                };
            }

            const response = await this.callApi<any>(
                'labels',
                'POST',
                {},
                labelData
            );

            return {
                id: response.id,
                name: response.name,
                type: 'custom',
                color: response.color?.backgroundColor
            };
        } catch (error) {
            console.error('Błąd podczas tworzenia etykiety:', error);
            throw error;
        }
    }

    /**
     * Usuwanie etykiety
     */
    public async deleteLabel(labelId: string): Promise<void> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            await this.callApi(
                `labels/${labelId}`,
                'DELETE'
            );
        } catch (error) {
            console.error('Błąd podczas usuwania etykiety:', error);
            throw error;
        }
    }

    // Prywatne metody pomocnicze

    /**
     * Wykonanie żądania do Gmail API
     */
    private async callApi<T>(
        endpoint: string,
        method: string = 'GET',
        params: object = {},
        body: object | null = null
    ): Promise<T> {
        if (!this.isAuthorized) {
            throw new Error('Użytkownik nie jest zalogowany. Wymagana autoryzacja.');
        }

        try {
            const requestOptions: gapi.client.RequestOptions = {
                path: `https://gmail.googleapis.com/gmail/v1/users/me/${endpoint}`,
                method,
                params,
            };

            if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                requestOptions.body = JSON.stringify(body);
            }

            const response = await gapi.client.request(requestOptions);
            return response.result as T;
        } catch (error) {
            console.error(`Błąd wywołania Gmail API (${endpoint}):`, error);
            throw error;
        }
    }

    /**
     * Konwersja surowej wiadomości z Gmail API do naszego formatu Email
     */
    private parseGmailMessage(message: any): Email {
        // Domyślne wartości
        let subject = '';
        let from = { email: '' };
        let to: { email: string, name?: string }[] = [];
        let cc: { email: string, name?: string }[] = [];
        let bcc: { email: string, name?: string }[] = [];
        let bodyPlain = '';
        let bodyHtml = '';
        let attachments: any[] = [];

        // Przetwarzanie nagłówków
        const headers = message.payload.headers;
        if (headers) {
            for (const header of headers) {
                switch (header.name.toLowerCase()) {
                    case 'subject':
                        subject = header.value;
                        break;
                    case 'from':
                        // Przykład: "Jan Kowalski <jan@example.com>"
                        const fromMatch = header.value.match(/(.+)?\s*<(.+@.+)>/);
                        from = fromMatch
                            ? { name: fromMatch[1]?.trim(), email: fromMatch[2] }
                            : { email: header.value };
                        break;
                    case 'to':
                        to = header.value.split(',').map((addr: string) => {
                            const match = addr.match(/(.+)?\s*<(.+@.+)>/);
                            return match
                                ? { name: match[1]?.trim(), email: match[2] }
                                : { email: addr.trim() };
                        });
                        break;
                    case 'cc':
                        cc = header.value.split(',').map((addr: string) => {
                            const match = addr.match(/(.+)?\s*<(.+@.+)>/);
                            return match
                                ? { name: match[1]?.trim(), email: match[2] }
                                : { email: addr.trim() };
                        });
                        break;
                    case 'bcc':
                        bcc = header.value.split(',').map((addr: string) => {
                            const match = addr.match(/(.+)?\s*<(.+@.+)>/);
                            return match
                                ? { name: match[1]?.trim(), email: match[2] }
                                : { email: addr.trim() };
                        });
                        break;
                }
            }
        }

        // Rekurencyjne przeszukiwanie części wiadomości (w tym załączników)
        const processMessageParts = (part: any) => {
            if (part.mimeType === 'text/plain' && part.body.data) {
                bodyPlain = this.decodeBase64Url(part.body.data);
            } else if (part.mimeType === 'text/html' && part.body.data) {
                bodyHtml = this.decodeBase64Url(part.body.data);
            } else if (part.filename && part.body.attachmentId) {
                attachments.push({
                    id: part.body.attachmentId,
                    filename: part.filename,
                    mimeType: part.mimeType,
                    size: parseInt(part.body.size || '0', 10)
                });
            }

            // Rekurencyjne przetwarzanie części zagnieżdżonych
            if (part.parts && part.parts.length) {
                part.parts.forEach(processMessageParts);
            }
        };

        // Przetwarzanie treści wiadomości
        if (message.payload) {
            if (message.payload.body && message.payload.body.data) {
                bodyPlain = this.decodeBase64Url(message.payload.body.data);
            }
            if (message.payload.parts) {
                message.payload.parts.forEach(processMessageParts);
            }
        }

        // Sprawdzenie, czy wiadomość jest przeczytana
        const isRead = !message.labelIds.includes('UNREAD');
        const isStarred = message.labelIds.includes('STARRED');
        const isImportant = message.labelIds.includes('IMPORTANT');

        return {
            id: message.id,
            threadId: message.threadId,
            labelIds: message.labelIds || [],
            snippet: message.snippet || '',
            historyId: message.historyId,
            internalDate: parseInt(message.internalDate || '0', 10),
            subject,
            from,
            to,
            cc,
            bcc,
            body: {
                plain: bodyPlain,
                html: bodyHtml || undefined
            },
            attachments: attachments.length > 0 ? attachments : undefined,
            isRead,
            isStarred,
            isImportant,
            providerId: 'gmail'
        };
    }

    // Funkcje pomocnicze dla formatów danych

    private decodeBase64Url(data: string): string {
        // Konwersja base64url do standardowego base64
        const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
        return atob(base64);
    }

    private encodeBase64Url(str: string): string {
        // Konwersja string do base64url
        const base64 = btoa(str);
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    // Ładowanie skryptów Google API
    private loadGapiScript(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                this.gapiLoaded = true;
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load Google API script'));
            };
            document.body.appendChild(script);
        });
    }

    private loadGisScript(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.onload = () => {
                this.gisLoaded = true;
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load Google Identity Services script'));
            };
            document.body.appendChild(script);
        });
    }

    // Obliczanie kontrastowego koloru tekstu dla koloru tła
    private getContrastColor(hexColor: string): string {
        // Usunięcie '#' jeśli istnieje
        const hex = hexColor.replace('#', '');

        // Konwersja do RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // Obliczenie jasności (używając wag dla ludzkiego oka)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        // Jasny kolor dla ciemnego tła, ciemny kolor dla jasnego tła
        return brightness > 125 ? '#000000' : '#FFFFFF';
    }
}