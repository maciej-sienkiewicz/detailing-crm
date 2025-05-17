// src/pages/SMS/containers/SmsModalsContainer.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../../components/common/Toast/Toast';
import {
    SmsMessage,
    SmsStatus,
    SmsCampaign,
    SmsTemplate,
    SmsAutomation
} from "../../../../types/sms";
import NewSmsCampaignModal from "./NewSmsCampaignModal";
import TemplateEditorModal from "./TemplateEditorModal";
import NewSmsMessageModal from "./NewSmsMessageModal";
import {smsApi} from "../../../../api/smsApi";

// Interfejs kontekstu modali SMS
interface SmsModalsContextType {
    // Metody otwierania poszczególnych modali
    openNewMessage: (initialRecipientId?: string) => void;
    openNewCampaign: (initialCampaignData?: Partial<SmsCampaign>) => void;
    openTemplateEditor: (initialTemplate?: SmsTemplate) => void;

    // Obsługa automatyzacji (do potencjalnej implementacji)
    openNewAutomation: () => void;

    // Metoda zamykania wszystkich modali
    closeAllModals: () => void;
}

// Tworzenie kontekstu dla modali SMS
export const SmsModalsContext = React.createContext<SmsModalsContextType>({
    openNewMessage: () => {},
    openNewCampaign: () => {},
    openTemplateEditor: () => {},
    openNewAutomation: () => {},
    closeAllModals: () => {}
});

// Hook do korzystania z kontekstu modali SMS
export const useSmsModals = () => React.useContext(SmsModalsContext);

// Kontener dla modali SMS
const SmsModalsContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Stan modali
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
    const [showTemplateEditorModal, setShowTemplateEditorModal] = useState(false);
    const [showNewAutomationModal, setShowNewAutomationModal] = useState(false);

    // Stan dla danych inicjujących modali
    const [initialRecipientId, setInitialRecipientId] = useState<string | undefined>();
    const [initialCampaignData, setInitialCampaignData] = useState<Partial<SmsCampaign> | undefined>();
    const [initialTemplate, setInitialTemplate] = useState<SmsTemplate | undefined>();
    const [isEditing, setIsEditing] = useState(false);

    // Otwarcie modalu nowej wiadomości
    const openNewMessage = (recipientId?: string) => {
        setInitialRecipientId(recipientId);
        setShowNewMessageModal(true);

        // Zamknij inne otwarte modale dla uniknięcia konfliktów
        setShowNewCampaignModal(false);
        setShowTemplateEditorModal(false);
        setShowNewAutomationModal(false);
    };

    // Otwarcie modalu nowej kampanii
    const openNewCampaign = (campaignData?: Partial<SmsCampaign>) => {
        setInitialCampaignData(campaignData);
        setIsEditing(!!campaignData);
        setShowNewCampaignModal(true);

        // Zamknij inne modale
        setShowNewMessageModal(false);
        setShowTemplateEditorModal(false);
        setShowNewAutomationModal(false);
    };

    // Otwarcie modalu edytora szablonów
    const openTemplateEditor = (template?: SmsTemplate) => {
        setInitialTemplate(template);
        setIsEditing(!!template);
        setShowTemplateEditorModal(true);

        // Zamknij inne modale
        setShowNewMessageModal(false);
        setShowNewCampaignModal(false);
        setShowNewAutomationModal(false);
    };

    // Otwarcie modalu nowej automatyzacji (do zaimplementowania)
    const openNewAutomation = () => {
        setShowNewAutomationModal(true);

        // Zamknij inne modale
        setShowNewMessageModal(false);
        setShowNewCampaignModal(false);
        setShowTemplateEditorModal(false);
    };

    // Zamknięcie wszystkich modali
    const closeAllModals = () => {
        setShowNewMessageModal(false);
        setShowNewCampaignModal(false);
        setShowTemplateEditorModal(false);
        setShowNewAutomationModal(false);

        // Reset stanów inicjujących
        setInitialRecipientId(undefined);
        setInitialCampaignData(undefined);
        setInitialTemplate(undefined);
        setIsEditing(false);
    };

    // Obsługa wysłania wiadomości
    const handleSendMessage = async (message: SmsMessage) => {
        try {
            showToast(
                'success',
                message.status === SmsStatus.SCHEDULED
                    ? 'Wiadomość została zaplanowana'
                    : 'Wiadomość została wysłana',
                3000
            );

            // Odświeżenie listy wiadomości
            navigate('/sms/messages');
        } catch (error) {
            console.error('Error sending message:', error);
            showToast('error', 'Nie udało się wysłać wiadomości', 3000);
        } finally {
            closeAllModals();
        }
    };

    // Obsługa zapisania kampanii
    const handleSaveCampaign = async (campaign: SmsCampaign) => {
        try {
            showToast(
                'success',
                campaign.status === SmsStatus.SCHEDULED
                    ? 'Kampania została zaplanowana'
                    : 'Kampania została uruchomiona',
                3000
            );

            // Odświeżenie listy kampanii
            navigate('/sms/campaigns');
        } catch (error) {
            console.error('Error saving campaign:', error);
            showToast('error', 'Nie udało się zapisać kampanii', 3000);
        } finally {
            closeAllModals();
        }
    };

    // Obsługa zapisania szablonu
    const handleSaveTemplate = async (template: SmsTemplate) => {
        try {
            if (isEditing && initialTemplate) {
                // Aktualizacja istniejącego szablonu
                await smsApi.updateTemplate(initialTemplate.id, template);
                showToast('success', 'Szablon został zaktualizowany', 3000);
            } else {
                // Tworzenie nowego szablonu
                await smsApi.createTemplate(template);
                showToast('success', 'Nowy szablon został utworzony', 3000);
            }

            // Odświeżenie listy szablonów
            navigate('/sms/templates');
        } catch (error) {
            console.error('Error saving template:', error);
            showToast('error', 'Nie udało się zapisać szablonu', 3000);
        } finally {
            closeAllModals();
        }
    };

    // Wartość kontekstu dostarczana przez providera
    const contextValue = {
        openNewMessage,
        openNewCampaign,
        openTemplateEditor,
        openNewAutomation,
        closeAllModals
    };

    return (
        <SmsModalsContext.Provider value={contextValue}>
            {children}

            {/* Modal nowej wiadomości SMS */}
            <NewSmsMessageModal
                isOpen={showNewMessageModal}
                onClose={closeAllModals}
                onSend={handleSendMessage}
                initialRecipientId={initialRecipientId}
            />

            {/* Modal nowej kampanii SMS */}
            <NewSmsCampaignModal
                isOpen={showNewCampaignModal}
                onClose={closeAllModals}
                onSave={handleSaveCampaign}
                initialCampaign={initialCampaignData as SmsCampaign}
                isEditing={isEditing}
            />

            {/* Modal edytora szablonów */}
            <TemplateEditorModal
                isOpen={showTemplateEditorModal}
                onClose={closeAllModals}
                onSave={handleSaveTemplate}
                initialTemplate={initialTemplate}
                isEditing={isEditing}
            />

            {/* Tu można dodać kolejne modale po implementacji */}
        </SmsModalsContext.Provider>
    );
};

export default SmsModalsContainer;