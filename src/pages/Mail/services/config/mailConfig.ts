export const DATE_FORMATS = {
    FULL: 'dd.MM.yyyy HH:mm',
    SHORT: 'dd.MM.yyyy',
    TIME: 'HH:mm',
    RELATIVE_THRESHOLD_HOURS: 24, // Używaj względnych czasów (np. "wczoraj") dla emaili w ciągu ostatnich 24h
};

// Konfiguracja załączników
export const ATTACHMENT_CONFIG = {
    MAX_SIZE: 25 * 1024 * 1024, // 25 MB
    ALLOWED_TYPES: [
        'image/*',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv'
    ]
};

// Konfiguracja wyszukiwania
export const SEARCH_CONFIG = {
    DEBOUNCE_TIME: 300,  // Czas oczekiwania przed wykonaniem wyszukiwania (ms)
    MIN_QUERY_LENGTH: 3, // Minimalna długość zapytania
    MAX_SUGGESTIONS: 10,  // Maksymalna liczba sugestii kontaktów
};

// Konfiguracja szablonów wiadomości
export const TEMPLATES = {
    SIGNATURE: `
    <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
      <p style="margin: 0;">Z poważaniem,</p>
      <p style="margin: 5px 0 0 0;"><strong>%NAME%</strong></p>
      <p style="margin: 0; color: #666;">%COMPANY%</p>
      <p style="margin: 0; color: #666;">Email: %EMAIL%</p>
      <p style="margin: 0; color: #666;">Tel: %PHONE%</p>
    </div>
  `,
    EMPTY_MESSAGE: `
    <div>
      <p></p>
    </div>
  `,
    REPLY_PREFIX: 'Odp: ',
    FORWARD_PREFIX: 'Fwd: '
};

// Limity
export const LIMITS = {
    MAX_RECIPIENTS: 100,  // Maksymalna liczba adresatów
    MAX_SUBJECT_LENGTH: 255,  // Maksymalna długość tematu
    MAX_BODY_LENGTH: 20 * 1024 * 1024  // Maksymalna wielkość treści (20 MB)
};