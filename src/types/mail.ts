// src/pages/Mail/types/mail.ts
export interface EmailAttachment {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    url?: string;
}

export interface EmailAddress {
    name?: string;
    email: string;
}

export type EmailLabelType =
    | 'inbox'
    | 'sent'
    | 'draft'
    | 'trash'
    | 'spam'
    | 'important'
    | 'starred'
    | 'custom';

export interface EmailLabel {
    id: string;
    name: string;
    type: EmailLabelType;
    color?: string;
    path?: string; // Ścieżka do folderu w przypadku IMAP
}

export interface EmailThread {
    id: string;
    snippet: string;
    historyId: string;
    messages: Email[];
}

export interface Email {
    id: string;
    threadId: string;
    labelIds: string[];
    snippet: string;
    historyId?: string;
    internalDate: number;
    subject: string;
    from: EmailAddress;
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    body?: {
        plain: string;
        html?: string;
    };
    attachments?: EmailAttachment[];
    isRead: boolean;
    isStarred: boolean;
    isImportant: boolean;
    providerId?: string; // Identyfikator providera (dla rozróżnienia źródła emaila)
}

export interface EmailFilter {
    q?: string;
    labelIds?: string[];
    maxResults?: number;
    pageToken?: string;
}

export interface EmailDraft {
    id?: string;
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    subject: string;
    from?: EmailAddress; // Dodane dla wielu kont
    body: {
        plain: string;
        html?: string;
    };
    attachments?: File[];
}

export interface ClientContact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    notes?: string;
}

export interface MailFolderSummary {
    labelId: string;
    name: string;
    type: EmailLabelType;
    unreadCount: number;
    totalCount: number;
    color?: string;
    path?: string; // Ścieżka do folderu w przypadku IMAP
}

// Nowe typy dla zarządzania wieloma kontami

export type EmailProviderType =
    | 'gmail'   // Gmail API
    | 'imap'    // IMAP/SMTP
    | 'outlook' // Microsoft Graph API (opcjonalnie w przyszłości)
    | 'other';  // Inny typ

export interface MailServerConfig {
    imapHost: string;
    imapPort: number;
    imapSecure: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
}

export interface MailAccount {
    id: string;             // Unikalny identyfikator konta
    email: string;          // Adres email
    name?: string;          // Nazwa wyświetlana
    providerType: EmailProviderType;  // Typ dostawcy
    isDefault?: boolean;    // Czy domyślne konto
    serverConfig?: MailServerConfig;  // Konfiguracja serwera (tylko dla IMAP/SMTP)
}

// Rozszerzone stany aplikacji

export interface MailState {
    accounts: MailAccount[];
    currentAccountId: string | null;
    emails: Record<string, Email[]>; // Emaile dla każdego konta
    threads: Record<string, Record<string, EmailThread>>; // Wątki dla każdego konta
    labels: Record<string, EmailLabel[]>; // Etykiety dla każdego konta
    folderSummaries: Record<string, MailFolderSummary[]>; // Podsumowania folderów dla każdego konta
    selectedEmail: Email | null;
    selectedThreadId: string | null;
    selectedLabelId: string | null;
    isLoading: boolean;
    error: string | null;
}