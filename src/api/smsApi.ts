// src/api/smsApi.ts
// API dla modułu SMS

import {
    SmsMessage,
    SmsTemplate,
    SmsCampaign,
    SmsAutomation,
    SmsFilters,
    SmsStatistics, SmsAutomationTrigger, SmsStatus, SmsTemplateCategory
} from '../types/sms';
import { apiClient, PaginatedResponse } from './apiClient';

// API dla operacji związanych z SMS
export const smsApi = {
    // WIADOMOŚCI SMS

    // Pobieranie listy wiadomości SMS z paginacją
    fetchMessages: async (
        filters: SmsFilters = {},
        page: number = 0,
        size: number = 10
    ): Promise<PaginatedResponse<SmsMessage>> => {
        try {
            return await apiClient.getWithPagination<SmsMessage>(
                '/sms/messages',
                filters,
                { page, size }
            );
        } catch (error) {

            const mockSmsMessages: SmsMessage[] = [
                {
                    id: 'sms-001',
                    recipientId: 'client-001',
                    recipientName: 'Jan Kowalski',
                    recipientPhone: '+48123456789',
                    content: 'Twoja wizyta została potwierdzona.',
                    status: SmsStatus.DELIVERED,
                    statusUpdatedAt: '2025-05-17T10:15:00Z',
                    sentDate: '2025-05-17T10:00:00Z',
                    deliveredDate: '2025-05-17T10:10:00Z',
                    createdAt: '2025-05-17T09:50:00Z',
                    createdBy: 'user-001',
                    templateId: 'template-visit-confirmation',
                    campaignId: 'campaign-2025-01',
                    relatedEntityType: 'appointment',
                    relatedEntityId: 'appt-12345'
                },
                {
                    id: 'sms-002',
                    recipientId: 'client-002',
                    recipientName: 'Anna Nowak',
                    recipientPhone: '+48123456780',
                    content: 'Przypomnienie o wizycie jutro o 12:00.',
                    status: SmsStatus.SENT,
                    statusUpdatedAt: '2025-05-17T11:00:00Z',
                    sentDate: '2025-05-17T10:59:00Z',
                    createdAt: '2025-05-17T10:45:00Z',
                    createdBy: 'user-002',
                    automationId: 'auto-reminder-01',
                    relatedEntityType: 'appointment',
                    relatedEntityId: 'appt-12346'
                },
                {
                    id: 'sms-003',
                    recipientId: 'client-003',
                    recipientName: 'Tomasz Zieliński',
                    recipientPhone: '+48123456781',
                    content: 'Nie udało się wysłać wiadomości.',
                    status: SmsStatus.FAILED,
                    statusUpdatedAt: '2025-05-17T12:05:00Z',
                    failedReason: 'Błąd po stronie operatora',
                    createdAt: '2025-05-17T11:50:00Z',
                    createdBy: 'user-003',
                    relatedEntityType: 'protocol',
                    relatedEntityId: 'protocol-9876'
                },
                {
                    id: 'sms-004',
                    recipientId: 'client-004',
                    recipientName: 'Katarzyna Wiśniewska',
                    recipientPhone: '+48123456782',
                    content: 'Wiadomość została zaplanowana.',
                    status: SmsStatus.SCHEDULED,
                    statusUpdatedAt: '2025-05-17T08:00:00Z',
                    scheduledDate: '2025-05-18T09:00:00Z',
                    createdAt: '2025-05-17T07:55:00Z',
                    createdBy: 'user-004',
                    templateId: 'template-scheduled-msg'
                },
                {
                    id: 'sms-005',
                    recipientId: 'client-005',
                    recipientName: 'Piotr Kaczmarek',
                    recipientPhone: '+48123456783',
                    content: 'Wiadomość oczekuje na wysłanie.',
                    status: SmsStatus.PENDING,
                    statusUpdatedAt: '2025-05-17T13:00:00Z',
                    createdAt: '2025-05-17T12:58:00Z',
                    createdBy: 'user-005',
                    automationId: 'auto-msg-02'
                }
            ];
            const paginatedSmsMessages: PaginatedResponse<SmsMessage> = {
                data: mockSmsMessages,
                pagination: {
                    currentPage: 1,      // Przykład - aktualna strona
                    pageSize: 5,         // Liczba elementów na stronę
                    totalItems: mockSmsMessages.length,  // Całkowita liczba elementów
                    totalPages: Math.ceil(mockSmsMessages.length / 5),  // Całkowita liczba stron (zaokrąglone w górę)
                }
            };
            return paginatedSmsMessages;
        }
    },

    // Pobieranie pojedynczej wiadomości SMS
    fetchMessageById: async (id: string): Promise<SmsMessage> => {
        try {
            return await apiClient.get<SmsMessage>(`/sms/messages/${id}`);
        } catch (error) {
            console.error(`Error fetching SMS message ${id}:`, error);
            throw error;
        }
    },

    // Wysyłanie pojedynczej wiadomości SMS
    sendMessage: async (
        recipientId: string,
        content: string,
        scheduledDate?: string
    ): Promise<SmsMessage> => {
        try {
            return await apiClient.post<SmsMessage>('/sms/messages', {
                recipientId,
                content,
                scheduledDate
            });
        } catch (error) {
            console.error('Error sending SMS message:', error);
            throw error;
        }
    },

    // Anulowanie zaplanowanej wiadomości
    cancelScheduledMessage: async (id: string): Promise<boolean> => {
        try {
            return await apiClient.post<boolean>(`/sms/messages/${id}/cancel`, {});
        } catch (error) {
            console.error(`Error canceling scheduled SMS message ${id}:`, error);
            throw error;
        }
    },

    // Ponowna próba wysłania nieudanej wiadomości
    retryFailedMessage: async (id: string): Promise<SmsMessage> => {
        try {
            return await apiClient.post<SmsMessage>(`/sms/messages/${id}/retry`, {});
        } catch (error) {
            console.error(`Error retrying failed SMS message ${id}:`, error);
            throw error;
        }
    },

    // Pobieranie wiadomości dla klienta
    fetchMessagesByClientId: async (clientId: string): Promise<SmsMessage[]> => {
        try {
            return await apiClient.get<SmsMessage[]>(`/sms/messages/client/${clientId}`);
        } catch (error) {
            console.error(`Error fetching SMS messages for client ${clientId}:`, error);
            throw error;
        }
    },

    // SZABLONY SMS

    // Pobieranie wszystkich szablonów
    fetchTemplates: async (): Promise<SmsTemplate[]> => {
        try {
            return await apiClient.get<SmsTemplate[]>('/sms/templates');
        } catch (error) {
            console.error('Error fetching SMS templates:', error);
            const mockSmsTemplates: SmsTemplate[] = [
                {
                    id: '1',
                    name: 'Informacja o nowej promocji',
                    content: 'Cześć {{klient.imie}}! Pojawiła się u nas nowa promocja na samochody marki: {{pojazd.marka}}. Ostatni raz byłeś u nas: {{wizyta.data}} - może czas zobaczyć się ponownie?',
                    category: SmsTemplateCategory.APPOINTMENT_REMINDER,
                    createdAt: '2025-01-15T10:00:00Z',
                    updatedAt: '2025-01-15T10:00:00Z',
                    usageCount: 124,
                    isActive: true,
                    variables: ['customerName', 'orderNumber'],
                },
                {
                    id: '2',
                    name: 'Przypomnienie o wizycie',
                    content: 'Cześć {{clientName}}, przypominamy o wizycie dnia {{appointmentDate}} o godzinie {{appointmentTime}}.',
                    category: SmsTemplateCategory.APPOINTMENT_REMINDER,
                    createdAt: '2025-02-20T08:30:00Z',
                    updatedAt: '2025-04-10T09:45:00Z',
                    usageCount: 89,
                    isActive: true,
                    variables: ['clientName', 'appointmentDate', 'appointmentTime'],
                },
                {
                    id: '3',
                    name: 'Promocja sezonowa',
                    content: 'Tylko teraz {{discount}}% zniżki na wybrane produkty! Oferta ważna do {{expirationDate}}.',
                    category: SmsTemplateCategory.APPOINTMENT_REMINDER,
                    createdAt: '2024-12-01T12:00:00Z',
                    updatedAt: '2025-03-01T15:20:00Z',
                    usageCount: 305,
                    isActive: false,
                    variables: ['discount', 'expirationDate'],
                },
                {
                    id: '4',
                    name: 'Zmiana hasła',
                    content: 'Aby zresetować hasło, użyj tego kodu: {{resetCode}}. Kod ważny przez 15 minut.',
                    category: SmsTemplateCategory.APPOINTMENT_REMINDER,
                    createdAt: '2025-03-12T11:11:00Z',
                    updatedAt: '2025-03-12T11:11:00Z',
                    usageCount: 50,
                    isActive: true,
                    variables: ['resetCode'],
                },
                {
                    id: '5',
                    name: 'Podziękowanie za rejestrację',
                    content: 'Witaj {{userName}}! Dziękujemy za dołączenie do naszej społeczności.',
                    category: SmsTemplateCategory.APPOINTMENT_REMINDER,
                    createdAt: '2025-04-05T07:25:00Z',
                    updatedAt: '2025-04-05T07:25:00Z',
                    usageCount: 73,
                    isActive: true,
                    variables: ['userName'],
                }
            ];

            return mockSmsTemplates;
        }
    },

    // Pobieranie pojedynczego szablonu
    fetchTemplateById: async (id: string): Promise<SmsTemplate> => {
        try {
            return await apiClient.get<SmsTemplate>(`/sms/templates/${id}`);
        } catch (error) {
            console.error(`Error fetching SMS template ${id}:`, error);
            throw error;
        }
    },

    // Tworzenie nowego szablonu
    createTemplate: async (template: Omit<SmsTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<SmsTemplate> => {
        try {
            return await apiClient.post<SmsTemplate>('/sms/templates', template);
        } catch (error) {
            console.error('Error creating SMS template:', error);
            throw error;
        }
    },

    // Aktualizacja istniejącego szablonu
    updateTemplate: async (id: string, template: Partial<SmsTemplate>): Promise<SmsTemplate> => {
        try {
            return await apiClient.put<SmsTemplate>(`/sms/templates/${id}`, template);
        } catch (error) {
            console.error(`Error updating SMS template ${id}:`, error);
            throw error;
        }
    },

    // Usuwanie szablonu
    deleteTemplate: async (id: string): Promise<boolean> => {
        try {
            return await apiClient.delete<boolean>(`/sms/templates/${id}`);
        } catch (error) {
            console.error(`Error deleting SMS template ${id}:`, error);
            throw error;
        }
    },

    // Renderowanie szablonu z danymi
    renderTemplate: async (
        templateId: string,
        data: Record<string, any>
    ): Promise<string> => {
        try {
            const response = await apiClient.post<{content: string}>(`/sms/templates/${templateId}/render`, data);
            return response.content;
        } catch (error) {
            console.error(`Error rendering SMS template ${templateId}:`, error);
            throw error;
        }
    },

    // KAMPANIE SMS

    // Pobieranie wszystkich kampanii
    fetchCampaigns: async (): Promise<SmsCampaign[]> => {
        try {
            return await apiClient.get<SmsCampaign[]>('/sms/campaigns');
        } catch (error) {
            console.error('Error fetching SMS campaigns:', error);
            const smsCampaignMocks: SmsCampaign[] = [
                {
                    id: 'cmp_001',
                    name: 'Witamy nowych użytkowników',
                    description: 'Kampania powitalna dla nowych użytkowników aplikacji.',
                    templateId: 'tpl_welcome_001',
                    status: SmsStatus.DELIVERED,
                    recipientCount: 1500,
                    deliveredCount: 1450,
                    failedCount: 50,
                    scheduledDate: '2025-05-10T09:00:00Z',
                    sentDate: '2025-05-10T09:01:00Z',
                    completedDate: '2025-05-10T09:05:00Z',
                    createdAt: '2025-05-01T08:00:00Z',
                    createdBy: 'user_123',
                    filterCriteria: {
                        signupDateAfter: '2025-04-01',
                        region: 'PL'
                    }
                },
                {
                    id: 'cmp_002',
                    name: 'Promocja majowa',
                    customContent: 'Skorzystaj z 20% zniżki do końca maja! Szczegóły na stronie.',
                    status: SmsStatus.SENT,
                    recipientCount: 5000,
                    deliveredCount: 0,
                    failedCount: 0,
                    scheduledDate: '2025-05-15T10:00:00Z',
                    sentDate: '2025-05-15T10:00:30Z',
                    createdAt: '2025-05-12T14:20:00Z',
                    createdBy: 'user_456',
                    filterCriteria: {
                        subscribedToMarketing: true
                    }
                },
                {
                    id: 'cmp_003',
                    name: 'Zaplanowana kampania - test',
                    description: 'Testowa kampania zaplanowana na przyszłość.',
                    templateId: 'tpl_test_future',
                    status: SmsStatus.SCHEDULED,
                    recipientCount: 200,
                    deliveredCount: 0,
                    failedCount: 0,
                    scheduledDate: '2025-06-01T12:00:00Z',
                    createdAt: '2025-05-16T10:00:00Z',
                    createdBy: 'user_789'
                },
                {
                    id: 'cmp_004',
                    name: 'Przypomnienie o płatności',
                    customContent: 'Przypominamy o zaległej płatności. Skontaktuj się z nami.',
                    status: SmsStatus.FAILED,
                    recipientCount: 300,
                    deliveredCount: 0,
                    failedCount: 300,
                    sentDate: '2025-05-13T08:00:00Z',
                    completedDate: '2025-05-13T08:10:00Z',
                    createdAt: '2025-05-10T12:00:00Z',
                    createdBy: 'user_111',
                    filterCriteria: {
                        hasOverduePayments: true
                    }
                },
                {
                    id: 'cmp_005',
                    name: 'Kampania w trakcie',
                    templateId: 'tpl_inprogress',
                    status: SmsStatus.SENT,
                    recipientCount: 1000,
                    deliveredCount: 600,
                    failedCount: 50,
                    sentDate: '2025-05-17T09:30:00Z',
                    createdAt: '2025-05-16T08:00:00Z',
                    createdBy: 'user_222'
                },
                {
                    id: 'cmp_006',
                    name: 'Test bez szablonu',
                    customContent: 'To jest testowa wiadomość bez użycia szablonu.',
                    status: SmsStatus.PENDING,
                    recipientCount: 50,
                    deliveredCount: 0,
                    failedCount: 0,
                    createdAt: '2025-05-17T11:00:00Z',
                    createdBy: 'user_333'
                }
            ];
            return smsCampaignMocks;
        }
    },

    // Pobieranie pojedynczej kampanii
    fetchCampaignById: async (id: string): Promise<SmsCampaign> => {
        try {
            return await apiClient.get<SmsCampaign>(`/sms/campaigns/${id}`);
        } catch (error) {
            console.error(`Error fetching SMS campaign ${id}:`, error);
            throw error;
        }
    },

    // Tworzenie nowej kampanii
    createCampaign: async (campaign: Omit<SmsCampaign, 'id' | 'createdAt' | 'status' | 'recipientCount' | 'deliveredCount' | 'failedCount'>): Promise<SmsCampaign> => {
        try {
            return await apiClient.post<SmsCampaign>('/sms/campaigns', campaign);
        } catch (error) {
            console.error('Error creating SMS campaign:', error);
            throw error;
        }
    },

    // Aktualizacja kampanii
    updateCampaign: async (id: string, campaign: Partial<SmsCampaign>): Promise<SmsCampaign> => {
        try {
            return await apiClient.put<SmsCampaign>(`/sms/campaigns/${id}`, campaign);
        } catch (error) {
            console.error(`Error updating SMS campaign ${id}:`, error);
            throw error;
        }
    },

    // Uruchomienie kampanii
    startCampaign: async (id: string): Promise<SmsCampaign> => {
        try {
            return await apiClient.post<SmsCampaign>(`/sms/campaigns/${id}/start`, {});
        } catch (error) {
            console.error(`Error starting SMS campaign ${id}:`, error);
            throw error;
        }
    },

    // Anulowanie kampanii
    cancelCampaign: async (id: string): Promise<SmsCampaign> => {
        try {
            return await apiClient.post<SmsCampaign>(`/sms/campaigns/${id}/cancel`, {});
        } catch (error) {
            console.error(`Error canceling SMS campaign ${id}:`, error);
            throw error;
        }
    },

    // Pobieranie odbiorców kampanii
    fetchCampaignRecipients: async (id: string): Promise<{id: string, name: string, phone: string}[]> => {
        try {
            return await apiClient.get<{id: string, name: string, phone: string}[]>(`/sms/campaigns/${id}/recipients`);
        } catch (error) {
            console.error(`Error fetching recipients for SMS campaign ${id}:`, error);
            throw error;
        }
    },

    // Pobieranie wiadomości z kampanii
    fetchCampaignMessages: async (id: string): Promise<SmsMessage[]> => {
        try {
            return await apiClient.get<SmsMessage[]>(`/sms/campaigns/${id}/messages`);
        } catch (error) {
            console.error(`Error fetching messages for SMS campaign ${id}:`, error);
            throw error;
        }
    },

    // AUTOMATYZACJE SMS

    // Pobieranie wszystkich automatyzacji
    fetchAutomations: async (): Promise<SmsAutomation[]> => {
        try {
            return await apiClient.get<SmsAutomation[]>('/sms/automations');
        } catch (error) {
            console.error('Error fetching SMS automations:', error);
            const mockSmsAutomations: SmsAutomation[] = [
                {
                    id: 'auto-001',
                    name: 'Przypomnienie o wizycie',
                    description: 'Wysyła SMS dzień przed wizytą',
                    isActive: true,
                    trigger: SmsAutomationTrigger.CLIENT_BIRTHDAY,
                    triggerParameters: { daysBeforeAppointment: 1 },
                    templateId: 'tpl-visit-01',
                    createdAt: '2025-04-01T10:00:00Z',
                    updatedAt: '2025-05-10T12:30:00Z',
                    createdBy: 'user-123',
                    lastRun: '2025-05-16T09:00:00Z',
                    nextScheduledRun: '2025-05-17T09:00:00Z',
                    messagesSent: 150
                },
                {
                    id: 'auto-002',
                    name: 'Urodzinowe życzenia',
                    description: 'Automatyczne życzenia urodzinowe dla klientów',
                    isActive: false,
                    trigger: SmsAutomationTrigger.CLIENT_BIRTHDAY,
                    triggerParameters: { time: '09:00' },
                    templateId: 'tpl-birthday-01',
                    createdAt: '2025-01-15T08:00:00Z',
                    updatedAt: '2025-03-20T14:45:00Z',
                    createdBy: 'user-456',
                    messagesSent: 320
                },
                {
                    id: 'auto-003',
                    name: 'Ankieta po wizycie',
                    isActive: true,
                    trigger: SmsAutomationTrigger.CLIENT_BIRTHDAY,
                    triggerParameters: { delayHours: 2 },
                    templateId: 'tpl-survey-01',
                    createdAt: '2025-02-10T11:20:00Z',
                    updatedAt: '2025-04-05T16:10:00Z',
                    createdBy: 'user-789',
                    lastRun: '2025-05-16T18:00:00Z',
                    nextScheduledRun: '2025-05-17T18:00:00Z',
                    messagesSent: 75
                }
            ];

            return mockSmsAutomations;
        }
    },

    // Pobieranie pojedynczej automatyzacji
    fetchAutomationById: async (id: string): Promise<SmsAutomation> => {
        try {
            return await apiClient.get<SmsAutomation>(`/sms/automations/${id}`);
        } catch (error) {
            console.error(`Error fetching SMS automation ${id}:`, error);
            throw error;
        }
    },

    // Tworzenie nowej automatyzacji
    createAutomation: async (automation: Omit<SmsAutomation, 'id' | 'createdAt' | 'updatedAt' | 'messagesSent'>): Promise<SmsAutomation> => {
        try {
            return await apiClient.post<SmsAutomation>('/sms/automations', automation);
        } catch (error) {
            console.error('Error creating SMS automation:', error);
            throw error;
        }
    },

    // Aktualizacja automatyzacji
    updateAutomation: async (id: string, automation: Partial<SmsAutomation>): Promise<SmsAutomation> => {
        try {
            return await apiClient.put<SmsAutomation>(`/sms/automations/${id}`, automation);
        } catch (error) {
            console.error(`Error updating SMS automation ${id}:`, error);
            throw error;
        }
    },

    // Aktywacja automatyzacji
    activateAutomation: async (id: string): Promise<SmsAutomation> => {
        try {
            return await apiClient.post<SmsAutomation>(`/sms/automations/${id}/activate`, {});
        } catch (error) {
            console.error(`Error activating SMS automation ${id}:`, error);
            throw error;
        }
    },

    // Dezaktywacja automatyzacji
    deactivateAutomation: async (id: string): Promise<SmsAutomation> => {
        try {
            return await apiClient.post<SmsAutomation>(`/sms/automations/${id}/deactivate`, {});
        } catch (error) {
            console.error(`Error deactivating SMS automation ${id}:`, error);
            throw error;
        }
    },

    // Usuwanie automatyzacji
    deleteAutomation: async (id: string): Promise<boolean> => {
        try {
            return await apiClient.delete<boolean>(`/sms/automations/${id}`);
        } catch (error) {
            console.error(`Error deleting SMS automation ${id}:`, error);
            throw error;
        }
    },

    // Pobieranie wiadomości wygenerowanych przez automatyzację
    fetchAutomationMessages: async (id: string): Promise<SmsMessage[]> => {
        try {
            return await apiClient.get<SmsMessage[]>(`/sms/automations/${id}/messages`);
        } catch (error) {
            console.error(`Error fetching messages for SMS automation ${id}:`, error);
            throw error;
        }
    },

    // STATYSTYKI SMS

    // Pobieranie statystyk SMS
    fetchStatistics: async (dateFrom?: string, dateTo?: string): Promise<SmsStatistics> => {
        try {
            const params: Record<string, any> = {};
            if (dateFrom) params.dateFrom = dateFrom;
            if (dateTo) params.dateTo = dateTo;

            return await apiClient.get<SmsStatistics>('/sms/statistics', params);
        } catch (error) {
            console.error('Error fetching SMS statistics:', error);
            const smsStatisticsMock: SmsStatistics = {
                totalSent: 15000,
                totalDelivered: 14800,
                totalFailed: 200,
                deliveryRate: 98.67,
                averageDailyCount: 500,
                monthlyCounts: [
                    { month: 'January', count: 4500 },
                    { month: 'February', count: 4800 },
                    { month: 'March', count: 4500 },
                    { month: 'April', count: 1200 }, // Zdecydowanie mniej, np. w związku z jakimś problemem
                ],
                byStatus: {
                    'DELIVERED': 14800,
                    'FAILED': 200,
                },
                byTemplate: [
                    { templateId: 'TEMPL-001', templateName: 'Welcome SMS', count: 5000 },
                    { templateId: 'TEMPL-002', templateName: 'Promotion', count: 7000 },
                    { templateId: 'TEMPL-003', templateName: 'Reminder', count: 3000 },
                ],
                byCampaign: [
                    { campaignId: 'CAMPAIGN-001', campaignName: 'Summer Sale', count: 7000, deliveryRate: 99.0 },
                    { campaignId: 'CAMPAIGN-002', campaignName: 'Black Friday', count: 5000, deliveryRate: 98.5 },
                    { campaignId: 'CAMPAIGN-003', campaignName: 'New Year Offer', count: 3000, deliveryRate: 98.0 },
                ],
            };

            return smsStatisticsMock;
        }
    },

    // Pobieranie salda SMS
    fetchSmsBalance: async (): Promise<{ balance: number, usedThisMonth: number, limit: number }> => {
        try {
            return await apiClient.get<{ balance: number, usedThisMonth: number, limit: number }>('/sms/balance');
        } catch (error) {
            return {
                balance: 5000,            // Aktualne saldo
                usedThisMonth: 1200,      // Użyte w tym miesiącu
                limit: 10000,             // Limit SMS-ów
            };
        }
    }
};