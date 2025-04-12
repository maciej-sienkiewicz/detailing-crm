export const MAIL_API_BASE_URL = 'http://localhost:8080/api/mail';

// Mapowanie standardowych folderów IMAP na nasze typy etykiet
export const IMAP_FOLDER_MAPPING = {
    'inbox': { type: 'inbox', name: 'Odebrane' },
    'sent': { type: 'sent', name: 'Wysłane' },
    'drafts': { type: 'draft', name: 'Wersje robocze' },
    'trash': { type: 'trash', name: 'Kosz' },
    'junk': { type: 'spam', name: 'Spam' },
    'spam': { type: 'spam', name: 'Spam' },
    'flagged': { type: 'starred', name: 'Oznaczone gwiazdką' },
    'important': { type: 'important', name: 'Ważne' },
} as const;

// Konfiguracja domyślnych serwerów dla popularnych dostawców poczty
export const DEFAULT_MAIL_PROVIDERS = {
    'sienkiewicz-maciej.pl': {
        imapHost: 'serwer2486743.home.pl',
        imapPort: 143,
        imapSecure: false,
        smtpHost: 'serwer2486743.home.pl',
        smtpPort: 587,
        smtpSecure: false
    }
};
