// src/types/sms.ts
// Typy danych dla modułu SMS

// Status wysyłki SMS
export enum SmsStatus {
    PENDING = 'PENDING',         // Oczekuje na wysłanie
    SENT = 'SENT',               // Wysłany do operatora
    DELIVERED = 'DELIVERED',     // Dostarczony do odbiorcy
    FAILED = 'FAILED',           // Błąd wysyłki
    SCHEDULED = 'SCHEDULED'      // Zaplanowany do wysłania
}

// Etykiety dla statusów SMS
export const SmsStatusLabels: Record<SmsStatus, string> = {
    [SmsStatus.PENDING]: 'Oczekuje',
    [SmsStatus.SENT]: 'Wysłany',
    [SmsStatus.DELIVERED]: 'Dostarczony',
    [SmsStatus.FAILED]: 'Błąd',
    [SmsStatus.SCHEDULED]: 'Zaplanowany'
};

// Kolory dla statusów SMS
export const SmsStatusColors: Record<SmsStatus, string> = {
    [SmsStatus.PENDING]: '#f39c12',    // Pomarańczowy
    [SmsStatus.SENT]: '#3498db',       // Niebieski
    [SmsStatus.DELIVERED]: '#2ecc71',  // Zielony
    [SmsStatus.FAILED]: '#e74c3c',     // Czerwony
    [SmsStatus.SCHEDULED]: '#9b59b6'   // Fioletowy
};

// Kategoria szablonu SMS
export enum SmsTemplateCategory {
    APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',    // Przypomnienia o wizytach
    VEHICLE_READY = 'VEHICLE_READY',                  // Informacje o gotowości pojazdu
    PAYMENT_NOTIFICATION = 'PAYMENT_NOTIFICATION',   // Powiadomienia o płatnościach
    BIRTHDAY = 'BIRTHDAY',                           // Urodziny i rocznice
    SEASONAL_PROMOTION = 'SEASONAL_PROMOTION',       // Promocje sezonowe
    VISIT_FOLLOWUP = 'VISIT_FOLLOWUP',               // Podziękowania po wizycie
    REVIEW_REQUEST = 'REVIEW_REQUEST',               // Prośby o recenzje
    SATISFACTION_SURVEY = 'SATISFACTION_SURVEY',     // Ankiety satysfakcji
    MARKETING = 'MARKETING',                         // Ogólny marketing
    OTHER = 'OTHER'                                  // Inne
}

// Etykiety dla kategorii szablonów
export const SmsTemplateCategoryLabels: Record<SmsTemplateCategory, string> = {
    [SmsTemplateCategory.APPOINTMENT_REMINDER]: 'Przypomnienia o wizytach',
    [SmsTemplateCategory.VEHICLE_READY]: 'Gotowość pojazdu',
    [SmsTemplateCategory.PAYMENT_NOTIFICATION]: 'Płatności',
    [SmsTemplateCategory.BIRTHDAY]: 'Urodziny/rocznice',
    [SmsTemplateCategory.SEASONAL_PROMOTION]: 'Promocje sezonowe',
    [SmsTemplateCategory.VISIT_FOLLOWUP]: 'Podziękowania po wizycie',
    [SmsTemplateCategory.REVIEW_REQUEST]: 'Prośby o recenzję',
    [SmsTemplateCategory.SATISFACTION_SURVEY]: 'Ankiety satysfakcji',
    [SmsTemplateCategory.MARKETING]: 'Marketing',
    [SmsTemplateCategory.OTHER]: 'Inne'
};

// Typy wyzwalaczy automatyzacji
export enum SmsAutomationTrigger {
    BEFORE_APPOINTMENT = 'BEFORE_APPOINTMENT',       // Przed wizytą (X dni)
    AFTER_APPOINTMENT = 'AFTER_APPOINTMENT',         // Po wizycie (X dni)
    STATUS_CHANGE = 'STATUS_CHANGE',                 // Zmiana statusu zlecenia
    CLIENT_BIRTHDAY = 'CLIENT_BIRTHDAY',             // Urodziny klienta
    NO_VISIT_PERIOD = 'NO_VISIT_PERIOD',             // Brak wizyty przez X miesięcy
    INVOICE_STATUS_CHANGE = 'INVOICE_STATUS_CHANGE', // Zmiana statusu faktury
    VEHICLE_ANNIVERSARY = 'VEHICLE_ANNIVERSARY',     // Rocznica pierwszej wizyty pojazdu
    VEHICLE_MILEAGE = 'VEHICLE_MILEAGE'              // Osiągnięcie określonego przebiegu
}

// Etykiety dla wyzwalaczy automatyzacji
export const SmsAutomationTriggerLabels: Record<SmsAutomationTrigger, string> = {
    [SmsAutomationTrigger.BEFORE_APPOINTMENT]: 'Przed wizytą',
    [SmsAutomationTrigger.AFTER_APPOINTMENT]: 'Po wizycie',
    [SmsAutomationTrigger.STATUS_CHANGE]: 'Zmiana statusu zlecenia',
    [SmsAutomationTrigger.CLIENT_BIRTHDAY]: 'Urodziny klienta',
    [SmsAutomationTrigger.NO_VISIT_PERIOD]: 'Brak wizyty przez okres',
    [SmsAutomationTrigger.INVOICE_STATUS_CHANGE]: 'Zmiana statusu faktury',
    [SmsAutomationTrigger.VEHICLE_ANNIVERSARY]: 'Rocznica pierwszej wizyty',
    [SmsAutomationTrigger.VEHICLE_MILEAGE]: 'Osiągnięty przebieg pojazdu'
};

// Podstawowy interfejs dla wiadomości SMS
export interface SmsMessage {
    id: string;
    recipientId: string;     // ID klienta-odbiorcy
    recipientName: string;   // Imię i nazwisko odbiorcy
    recipientPhone: string;  // Numer telefonu odbiorcy
    content: string;         // Treść wiadomości
    status: SmsStatus;       // Status wysyłki
    statusUpdatedAt: string; // Data ostatniej aktualizacji statusu
    scheduledDate?: string;  // Data zaplanowanej wysyłki (opcjonalne)
    sentDate?: string;       // Data wysłania (opcjonalne)
    deliveredDate?: string;  // Data dostarczenia (opcjonalne)
    failedReason?: string;   // Powód błędu (opcjonalne)
    createdAt: string;       // Data utworzenia
    createdBy: string;       // ID użytkownika, który utworzył
    templateId?: string;     // ID użytego szablonu (opcjonalne)
    campaignId?: string;     // ID kampanii (opcjonalne)
    automationId?: string;   // ID automatyzacji (opcjonalne)
    relatedEntityType?: string; // Typ powiązanej encji (np. "appointment", "protocol")
    relatedEntityId?: string;   // ID powiązanej encji
}

// Interfejs dla szablonu SMS
export interface SmsTemplate {
    id: string;
    name: string;           // Nazwa szablonu
    content: string;        // Treść szablonu z placeholderami zmiennych
    category: SmsTemplateCategory; // Kategoria szablonu
    createdAt: string;      // Data utworzenia
    updatedAt: string;      // Data ostatniej aktualizacji
    usageCount: number;     // Licznik użyć
    isActive: boolean;      // Czy szablon jest aktywny
    variables?: string[];   // Lista obsługiwanych zmiennych
}

// Interfejs dla kampanii SMS
export interface SmsCampaign {
    id: string;
    name: string;              // Nazwa kampanii
    description?: string;      // Opis kampanii
    templateId?: string;       // ID szablonu (opcjonalne)
    customContent?: string;    // Niestandardowa treść (jeśli bez szablonu)
    status: SmsStatus;         // Status kampanii
    recipientCount: number;    // Liczba odbiorców
    deliveredCount: number;    // Liczba dostarczonych wiadomości
    failedCount: number;       // Liczba nieudanych wysyłek
    scheduledDate?: string;    // Data zaplanowanej wysyłki
    sentDate?: string;         // Data rozpoczęcia wysyłki
    completedDate?: string;    // Data zakończenia wysyłki
    createdAt: string;         // Data utworzenia
    createdBy: string;         // ID użytkownika, który utworzył
    filterCriteria?: Record<string, any>; // Kryteria filtrowania odbiorców
}

// Interfejs dla automatyzacji SMS
export interface SmsAutomation {
    id: string;
    name: string;                      // Nazwa automatyzacji
    description?: string;              // Opis automatyzacji
    isActive: boolean;                 // Czy automatyzacja jest aktywna
    trigger: SmsAutomationTrigger;     // Typ wyzwalacza
    triggerParameters: Record<string, any>; // Parametry wyzwalacza (np. daysBeforeAppointment: 1)
    templateId: string;                // ID szablonu
    createdAt: string;                 // Data utworzenia
    updatedAt: string;                 // Data ostatniej aktualizacji
    createdBy: string;                 // ID użytkownika, który utworzył
    lastRun?: string;                  // Data ostatniego uruchomienia
    nextScheduledRun?: string;         // Data następnego zaplanowanego uruchomienia
    messagesSent: number;              // Liczba wysłanych wiadomości
}

// Struktura dla filtrów wyszukiwania SMS
export interface SmsFilters {
    status?: SmsStatus;
    recipientId?: string;
    recipientPhone?: string;
    dateFrom?: string;
    dateTo?: string;
    templateId?: string;
    campaignId?: string;
    automationId?: string;
}

// Struktura dla statystyk SMS
export interface SmsStatistics {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: number;
    averageDailyCount: number;
    monthlyCounts: Array<{
        month: string;
        count: number;
    }>;
    byStatus: Record<SmsStatus, number>;
    byTemplate: Array<{
        templateId: string;
        templateName: string;
        count: number;
    }>;
    byCampaign: Array<{
        campaignId: string;
        campaignName: string;
        count: number;
        deliveryRate: number;
    }>;
}