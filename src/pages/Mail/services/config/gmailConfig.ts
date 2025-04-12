export const GMAIL_API_CONFIG = {
    // Te wartości muszą być zastąpione rzeczywistymi danymi z Google Cloud Console
    CLIENT_ID:  '1074047885379-vtbutlfalgvilkivnrfphc0j49qj4haj.apps.googleusercontent.com\n',
    API_KEY:  'AIzaSyC7-jo1rCFdxTePIZJC-Us-RdEMi4roWf0',
    DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
    SCOPES: [
        'https://www.googleapis.com/auth/gmail.readonly',   // Odczyt maili
        'https://www.googleapis.com/auth/gmail.send',       // Wysyłanie maili
        'https://www.googleapis.com/auth/gmail.modify',     // Modyfikacja maili i etykiet
        'https://www.googleapis.com/auth/gmail.labels',     // Zarządzanie etykietami
        'https://www.googleapis.com/auth/gmail.compose',    // Tworzenie wiadomości jako draft
    ].join(' ')
};

// Mapowanie typów etykiet Gmail na nasze własne
export const GMAIL_LABEL_MAPPING = {
    'INBOX': { type: 'inbox', name: 'Odebrane' },
    'SENT': { type: 'sent', name: 'Wysłane' },
    'DRAFT': { type: 'draft', name: 'Wersje robocze' },
    'TRASH': { type: 'trash', name: 'Kosz' },
    'SPAM': { type: 'spam', name: 'Spam' },
    'IMPORTANT': { type: 'important', name: 'Ważne' },
    'STARRED': { type: 'starred', name: 'Oznaczone gwiazdką' },
} as const;

// Limity paginacji - ile emaili pobierać na raz
export const MAIL_PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
};