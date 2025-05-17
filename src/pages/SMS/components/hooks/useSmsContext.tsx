// src/hooks/useSmsContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { SmsCampaign, SmsTemplate, SmsAutomation } from '../types/sms';
import { ClientExpanded } from '../types/client';

// Typy dla kontekstu SMS
interface SmsContextType {
    // Flagi modali
    isSmsMessageModalOpen: boolean;
    isSmsCampaignModalOpen: boolean;
    isSmsTemplateModalOpen: boolean;
    isSmsAutomationModalOpen: boolean;

    // Dane początkowe dla modali
    selectedClient: ClientExpanded | null;
    selectedCampaign: SmsCampaign | null;
    selectedTemplate: SmsTemplate | null;
    selectedAutomation: SmsAutomation | null;

    // Flaga edycji
    isEditing: boolean;

    // Funkcje otwierające modale
    openSmsMessageModal: (client?: ClientExpanded) => void;
    openSmsCampaignModal: (campaign?: SmsCampaign) => void;
    openSmsTemplateModal: (template?: SmsTemplate) => void;
    openSmsAutomationModal: (automation?: SmsAutomation) => void;

    // Zamykanie modali
    closeSmsModals: () => void;
}

// Kontekst SMS
const SmsContext = createContext<SmsContextType | undefined>(undefined);

// Provider kontekstu SMS
export const SmsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    // Stan modali
    const [isSmsMessageModalOpen, setIsSmsMessageModalOpen] = useState(false);
    const [isSmsCampaignModalOpen, setIsSmsCampaignModalOpen] = useState(false);
    const [isSmsTemplateModalOpen, setIsSmsTemplateModalOpen] = useState(false);
    const [isSmsAutomationModalOpen, setIsSmsAutomationModalOpen] = useState(false);

    // Stan wybranych elementów
    const [selectedClient, setSelectedClient] = useState<ClientExpanded | null>(null);
    const [selectedCampaign, setSelectedCampaign] = useState<SmsCampaign | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplate | null>(null);
    const [selectedAutomation, setSelectedAutomation] = useState<SmsAutomation | null>(null);

    // Flaga edycji
    const [isEditing, setIsEditing] = useState(false);

    // Otwieranie modalu wiadomości SMS
    const openSmsMessageModal = (client?: ClientExpanded) => {
        // Zamknij inne modale
        closeSmsModals();

        // Ustaw klienta i otwórz modal
        setSelectedClient(client || null);
        setIsSmsMessageModalOpen(true);
    };

    // Otwieranie modalu kampanii SMS
    const openSmsCampaignModal = (campaign?: SmsCampaign) => {
        // Zamknij inne modale
        closeSmsModals();

        // Ustaw kampanię, flagę edycji i otwórz modal
        setSelectedCampaign(campaign || null);
        setIsEditing(!!campaign);
        setIsSmsCampaignModalOpen(true);
    };

    // Otwieranie modalu szablonu SMS
    const openSmsTemplateModal = (template?: SmsTemplate) => {
        // Zamknij inne modale
        closeSmsModals();

        // Ustaw szablon, flagę edycji i otwórz modal
        setSelectedTemplate(template || null);
        setIsEditing(!!template);
        setIsSmsTemplateModalOpen(true);
    };

    // Otwieranie modalu automatyzacji SMS
    const openSmsAutomationModal = (automation?: SmsAutomation) => {
        // Zamknij inne modale
        closeSmsModals();

        // Ustaw automatyzację, flagę edycji i otwórz modal
        setSelectedAutomation(automation || null);
        setIsEditing(!!automation);
        setIsSmsAutomationModalOpen(true);
    };

    // Zamykanie wszystkich modali
    const closeSmsModals = () => {
        setIsSmsMessageModalOpen(false);
        setIsSmsCampaignModalOpen(false);
        setIsSmsTemplateModalOpen(false);
        setIsSmsAutomationModalOpen(false);

        // Reset wybranych elementów
        setSelectedClient(null);
        setSelectedCampaign(null);
        setSelectedTemplate(null);
        setSelectedAutomation(null);

        // Reset flagi edycji
        setIsEditing(false);
    };

    // Wartość kontekstu
    const contextValue: SmsContextType = {
        // Flagi modali
        isSmsMessageModalOpen,
        isSmsCampaignModalOpen,
        isSmsTemplateModalOpen,
        isSmsAutomationModalOpen,

        // Dane początkowe dla modali
        selectedClient,
        selectedCampaign,
        selectedTemplate,
        selectedAutomation,

        // Flaga edycji
        isEditing,

        // Funkcje otwierające modale
        openSmsMessageModal,
        openSmsCampaignModal,
        openSmsTemplateModal,
        openSmsAutomationModal,

        // Zamykanie modali
        closeSmsModals
    };

    return (
        <SmsContext.Provider value={contextValue}>
            {children}
        </SmsContext.Provider>
    );
};

// Hook kontekstu SMS
export const useSmsContext = () => {
    const context = useContext(SmsContext);

    if (context === undefined) {
        throw new Error('useSmsContext must be used within a SmsProvider');
    }

    return context;
};

export default useSmsContext;