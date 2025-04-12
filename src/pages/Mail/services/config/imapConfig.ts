export const MAIL_API_BASE_URL = 'http://localhost:8080/api/mail';

// Mapowanie standardowych folderów IMAP na nasze typy etykiet - w języku polskim
export const IMAP_FOLDER_MAPPING = {
    'inbox': { type: 'inbox', name: 'Odebrane' },
    'sent': { type: 'sent', name: 'Wysłane' },
    'drafts': { type: 'draft', name: 'Wersje robocze' },
    'trash': { type: 'trash', name: 'Kosz' },
    'junk': { type: 'spam', name: 'Spam' },
    'spam': { type: 'spam', name: 'Spam' },
    'flagged': { type: 'starred', name: 'Oznaczone gwiazdką' },
    'important': { type: 'important', name: 'Ważne' },

    // Dodajmy też typowe angielskie nazwy folderów, które mogą być używane na serwerach IMAP
    'sent items': { type: 'sent', name: 'Wysłane' },
    'sent mail': { type: 'sent', name: 'Wysłane' },
    'draft': { type: 'draft', name: 'Wersje robocze' },
    'deleted': { type: 'trash', name: 'Kosz' },
    'deleted items': { type: 'trash', name: 'Kosz' },
    'archived': { type: 'archive', name: 'Archiwum' },
    'archive': { type: 'archive', name: 'Archiwum' },
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