// src/pages/Mail/services/providers/MailProvider.ts
import {
    Email,
    EmailFilter,
    EmailLabel,
    EmailThread,
    EmailDraft,
    EmailAttachment,
    MailAccount,
    MailFolderSummary
} from '../../../../types/mail';

/**
 * Interfejs dostawcy poczty - abstrakcja dla różnych serwerów pocztowych.
 * Implementowany przez konkretnych dostawców (Gmail, IMAP/SMTP, itd.)
 */
export interface MailProvider {
    /**
     * Inicjalizacja providera
     */
    initialize(): Promise<boolean>;

    /**
     * Autoryzacja użytkownika
     */
    authorize(credentials?: any): Promise<boolean>;

    /**
     * Wylogowanie użytkownika
     */
    signOut(): Promise<void>;

    /**
     * Sprawdzenie, czy użytkownik jest zalogowany
     */
    isAuthorized(): boolean;

    /**
     * Pobieranie informacji o koncie pocztowym
     */
    getAccount(): Promise<MailAccount>;

    /**
     * Pobieranie listy emaili
     */
    getEmails(filter: EmailFilter): Promise<Email[]>;

    /**
     * Pobieranie pojedynczego emaila
     */
    getEmail(emailId: string): Promise<Email>;

    /**
     * Pobieranie wątku emaili
     */
    getThread(threadId: string): Promise<EmailThread>;

    /**
     * Pobieranie załącznika
     */
    getAttachment(messageId: string, attachmentId: string): Promise<string>;

    /**
     * Pobieranie etykiet/folderów
     */
    getLabels(): Promise<EmailLabel[]>;

    /**
     * Pobieranie podsumowania folderów (liczba nieprzeczytanych, itd.)
     */
    getFoldersSummary(): Promise<MailFolderSummary[]>;

    /**
     * Wysyłanie emaila
     */
    sendEmail(draft: EmailDraft): Promise<string>;

    /**
     * Zapisywanie wersji roboczej emaila
     */
    saveDraft(draft: EmailDraft): Promise<string>;

    /**
     * Oznaczanie emaila jako przeczytany/nieprzeczytany
     */
    markAsRead(emailId: string, isRead: boolean): Promise<void>;

    /**
     * Oznaczanie emaila gwiazdką/usuwanie gwiazdki
     */
    toggleStar(emailId: string, isStarred: boolean): Promise<void>;

    /**
     * Przenoszenie emaila do kosza
     */
    moveToTrash(emailId: string): Promise<void>;

    /**
     * Przywracanie emaila z kosza
     */
    restoreFromTrash(emailId: string): Promise<void>;

    /**
     * Trwałe usuwanie emaila
     */
    permanentlyDelete(emailId: string): Promise<void>;

    /**
     * Dodawanie/usuwanie etykiet dla emaila
     */
    updateLabels(emailId: string, addLabelIds: string[], removeLabelIds: string[]): Promise<void>;

    /**
     * Tworzenie nowej etykiety/folderu
     */
    createLabel(name: string, color?: string): Promise<EmailLabel>;

    /**
     * Usuwanie etykiety/folderu
     */
    deleteLabel(labelId: string): Promise<void>;
}