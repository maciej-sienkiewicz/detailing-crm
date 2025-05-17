// src/api/smsApi.ts
// API dla modułu SMS

import {
    SmsMessage,
    SmsTemplate,
    SmsCampaign,
    SmsAutomation,
    SmsFilters,
    SmsStatistics
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
            console.error('Error fetching SMS messages:', error);
            throw error;
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
            throw error;
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
            throw error;
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
            throw error;
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
            throw error;
        }
    },

    // Pobieranie salda SMS
    fetchSmsBalance: async (): Promise<{ balance: number, usedThisMonth: number, limit: number }> => {
        try {
            return await apiClient.get<{ balance: number, usedThisMonth: number, limit: number }>('/sms/balance');
        } catch (error) {
            console.error('Error fetching SMS balance:', error);
            throw error;
        }
    }
};