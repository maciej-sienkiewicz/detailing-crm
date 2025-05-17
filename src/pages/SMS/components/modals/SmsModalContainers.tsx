// src/pages/SMS/components/modals/SmsModalsContainer.tsx - poprawiona wersja
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../../components/common/Toast/Toast';
import { SmsMessage, SmsCampaign, SmsTemplate, SmsAutomation, SmsStatus } from "../../../../types/sms";
import NewSmsCampaignModal from "./NewSmsCampaignModal";
import TemplateEditorModal from "./TemplateEditorModal";
import NewSmsMessageModal from "./NewSmsMessageModal";
import NewSmsAutomationModal from "./NewSmsAutomationModal";
import { smsApi } from "../../../../api/smsApi";
import { useSmsContext } from '../../../../hooks/useSmsContext';

/**
 * Kontener dla modali SMS
 * Renderuje wszystkie modale związane z modułem SMS i obsługuje ich stan
 */
const SmsModalsContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Pobierz stan i funkcje z kontekstu SMS
    const {
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

        // Zamykanie modali
        closeSmsModals
    } = useSmsContext();

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
            closeSmsModals();
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
            closeSmsModals();
        }
    };

    // Obsługa zapisania szablonu
    const handleSaveTemplate = async (template: SmsTemplate) => {
        try {
            if (isEditing && selectedTemplate?.id) {
                // Aktualizacja istniejącego szablonu
                await smsApi.updateTemplate(selectedTemplate.id, template);
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
            closeSmsModals();
        }
    };

    // Obsługa zapisania automatyzacji
    const handleSaveAutomation = async (automation: SmsAutomation) => {
        try {
            showToast(
                'success',
                isEditing
                    ? 'Automatyzacja została zaktualizowana'
                    : 'Automatyzacja została utworzona',
                3000
            );

            // Odświeżenie listy automatyzacji
            navigate('/sms/automations');
        } catch (error) {
            console.error('Error saving automation:', error);
            showToast('error', 'Nie udało się zapisać automatyzacji', 3000);
        } finally {
            closeSmsModals();
        }
    };

    return (
        <>
            {children}

            {/* Modal nowej wiadomości SMS */}
            <NewSmsMessageModal
                isOpen={isSmsMessageModalOpen}
                onClose={closeSmsModals}
                onSend={handleSendMessage}
                initialRecipientId={selectedClient?.id}
            />

            {/* Modal nowej kampanii SMS */}
            <NewSmsCampaignModal
                isOpen={isSmsCampaignModalOpen}
                onClose={closeSmsModals}
                onSave={handleSaveCampaign}
                initialCampaign={selectedCampaign}
                isEditing={isEditing}
            />

            {/* Modal edytora szablonów */}
            <TemplateEditorModal
                isOpen={isSmsTemplateModalOpen}
                onClose={closeSmsModals}
                onSave={handleSaveTemplate}
                initialTemplate={selectedTemplate}
                isEditing={isEditing}
            />

            {/* Modal nowej automatyzacji SMS */}
            <NewSmsAutomationModal
                isOpen={isSmsAutomationModalOpen}
                onClose={closeSmsModals}
                onSave={handleSaveAutomation}
                initialAutomation={selectedAutomation}
                isEditing={isEditing}
            />
        </>
    );
};

export default SmsModalsContainer;