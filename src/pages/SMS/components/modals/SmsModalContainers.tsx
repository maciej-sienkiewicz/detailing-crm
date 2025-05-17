// src/pages/SMS/containers/SmsModalsContainer.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../../components/common/Toast/Toast';
import {SmsCampaign, SmsMessage, SmsStatus} from "../../../../types/sms";
import NewSmsMessageModal from "./NewSmsMessageModal";
import NewSmsCampaignModal from "./NewSmsCampaignModal";

// Interfejs kontekstu modali SMS
interface SmsModalsContextType {
    openNewMessage: (initialRecipientId?: string) => void;
    openNewCampaign: () => void;
    closeAllModals: () => void;
}

// Tworzenie kontekstu dla modali SMS
export const SmsModalsContext = React.createContext<SmsModalsContextType>({
    openNewMessage: () => {},
    openNewCampaign: () => {},
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
    const [initialRecipientId, setInitialRecipientId] = useState<string | undefined>();

    // Otwarcie modalu nowej wiadomości
    const openNewMessage = (recipientId?: string) => {
        setInitialRecipientId(recipientId);
        setShowNewMessageModal(true);
    };

    // Otwarcie modalu nowej kampanii
    const openNewCampaign = () => {
        setShowNewCampaignModal(true);
    };

    // Zamknięcie wszystkich modali
    const closeAllModals = () => {
        setShowNewMessageModal(false);
        setShowNewCampaignModal(false);
    };

    // Obsługa wysłania wiadomości
    const handleSendMessage = async (message: SmsMessage) => {
        try {
            // W prawdziwej implementacji tutaj byłoby wysłanie wiadomości
            // ale na potrzeby demo wyświetlamy tylko toast
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
        }
    };

    // Obsługa zapisania kampanii
    const handleSaveCampaign = async (campaign: SmsCampaign) => {
        try {
            // W prawdziwej implementacji tutaj byłoby zapisanie kampanii
            // ale na potrzeby demo wyświetlamy tylko toast
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
        }
    };

    // Wartość kontekstu
    const contextValue = {
        openNewMessage,
        openNewCampaign,
        closeAllModals
    };

    return (
        <SmsModalsContext.Provider value={contextValue}>
            {children}

            {/* Modal nowej wiadomości SMS */}
            <NewSmsMessageModal
                isOpen={showNewMessageModal}
                onClose={() => setShowNewMessageModal(false)}
                onSend={handleSendMessage}
                initialRecipientId={initialRecipientId}
            />

            {/* Modal nowej kampanii SMS */}
            <NewSmsCampaignModal
                isOpen={showNewCampaignModal}
                onClose={() => setShowNewCampaignModal(false)}
                onSave={handleSaveCampaign}
            />
        </SmsModalsContext.Provider>
    );
};

export default SmsModalsContainer;