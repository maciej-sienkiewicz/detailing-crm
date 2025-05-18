import React, { useState, useEffect } from 'react';
import { FaUserFriends, FaSave, FaTimes } from 'react-icons/fa';
import Modal from '../../../../components/common/Modal';
import { useToast } from '../../../../components/common/Toast/Toast';
import {SmsCampaign, SmsStatus, SmsTemplate} from '../../../../types/sms';
import { ClientExpanded } from '../../../../types/client';
import { smsApi } from '../../../../api/smsApi';
import { clientApi } from '../../../../api/clientsApi';

// Importy komponentów kroków
import Step1BasicInfo from './campaign-steps/Step1BasicInfo';
import Step2Recipients from './campaign-steps/Step2Recipients';
import Step3Content from './campaign-steps/Step3Content';
import Step4Summary from './campaign-steps/Step4Summary';
import StepsIndicator from './campaign-common/StepsIndicator';

interface NewSmsCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (campaign: SmsCampaign) => void;
    initialCampaign?: SmsCampaign;
    isEditing?: boolean;
}

/**
 * Modal do tworzenia i edycji kampanii SMS
 * Podzielony na 4 kroki z rozszerzonymi możliwościami filtrowania odbiorców
 */
const NewSmsCampaignModal: React.FC<NewSmsCampaignModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSave,
                                                                     initialCampaign,
                                                                     isEditing = false
                                                                 }) => {
    const { showToast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Stan dla danych kampanii
    const [campaign, setCampaign] = useState<Partial<SmsCampaign>>({
        name: '',
        description: '',
        status: SmsStatus.SCHEDULED,
        customContent: '',
        templateId: '',
        scheduledDate: '',
        recipientCount: 0,
        deliveredCount: 0,
        failedCount: 0
    });

    // Stany dla opcji
    const [useTemplate, setUseTemplate] = useState(false);
    const [scheduleNow, setScheduleNow] = useState(false);

    // Stany dla filtrów i odbiorców
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [potentialRecipients, setPotentialRecipients] = useState<ClientExpanded[]>([]);
    const [selectedRecipientPreview, setSelectedRecipientPreview] = useState<ClientExpanded[]>([]);
    const [recipientFilters, setRecipientFilters] = useState({
        // Filtry podstawowe
        lastVisitDays: 0,
        includeCompanyClients: true,
        includeIndividualClients: true,
        minTotalVisits: 0,
        segmentType: 'all', // all, active, inactive

        // Filtry pojazdów
        vehicleMake: '',
        vehicleModel: '',
        vehicleYearFrom: 0,
        vehicleYearTo: 0,

        // Filtry finansowe
        minTotalRevenue: 0,
        maxTotalRevenue: 0,

        // Filtry usług
        serviceTypes: [] as string[],
        lastServiceType: ''
    });

    // Ładowanie danych
    const [loadingRecipients, setLoadingRecipients] = useState(false);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [templates, setTemplates] = useState<SmsTemplate[]>([]);

    // Wypełnianie formularza danymi przy edycji
    useEffect(() => {
        if (initialCampaign && isEditing) {
            setCampaign({
                ...initialCampaign
            });
            setUseTemplate(!!initialCampaign.templateId);
        }
    }, [initialCampaign, isEditing]);

    // Pobieranie listy klientów i szablonów
    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
            fetchPotentialRecipients();
        }
    }, [isOpen]);

    // Reset stanu przy zamknięciu modalu
    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(1);
            if (!isEditing) {
                resetForm();
            }
        }
    }, [isOpen]);

    // Funkcja resetująca formularz
    const resetForm = () => {
        setCampaign({
            name: '',
            description: '',
            status: SmsStatus.SCHEDULED,
            customContent: '',
            templateId: '',
            scheduledDate: '',
            recipientCount: 0,
            deliveredCount: 0,
            failedCount: 0
        });
        setUseTemplate(false);
        setScheduleNow(false);
        setSelectedRecipients([]);
        setRecipientFilters({
            lastVisitDays: 0,
            includeCompanyClients: true,
            includeIndividualClients: true,
            minTotalVisits: 0,
            segmentType: 'all',
            vehicleMake: '',
            vehicleModel: '',
            vehicleYearFrom: 0,
            vehicleYearTo: 0,
            minTotalRevenue: 0,
            maxTotalRevenue: 0,
            serviceTypes: [],
            lastServiceType: ''
        });
    };

    // Pobieranie szablonów
    const fetchTemplates = async () => {
        try {
            setLoadingTemplates(true);
            const data = await smsApi.fetchTemplates();
            setTemplates(data.filter(t => t.isActive));
            setLoadingTemplates(false);
        } catch (error) {
            console.error('Error fetching templates:', error);
            setLoadingTemplates(false);
        }
    };

    // Pobieranie potencjalnych odbiorców
    const fetchPotentialRecipients = async () => {
        try {
            setLoadingRecipients(true);
            const clients = await clientApi.fetchClients();
            setPotentialRecipients(clients);
            setLoadingRecipients(false);
        } catch (error) {
            console.error('Error fetching potential recipients:', error);
            setLoadingRecipients(false);
            showToast('error', 'Nie udało się pobrać listy klientów', 3000);
        }
    };

    // Obsługa zmiany kroków
    const goToNextStep = () => {
        if (currentStep === 1) {
            // Walidacja podstawowych informacji
            if (!campaign.name) {
                showToast('error', 'Nazwa kampanii jest wymagana', 3000);
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Walidacja odbiorców
            if (selectedRecipients.length === 0) {
                showToast('error', 'Wybierz co najmniej jednego odbiorcę', 3000);
                return;
            }
            setCurrentStep(3);
        } else if (currentStep === 3) {
            // Walidacja treści
            if (!campaign.customContent) {
                showToast('error', 'Treść wiadomości nie może być pusta', 3000);
                return;
            }
            setCurrentStep(4);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Obsługa zmiany pól formularza
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCampaign(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Obsługa zmiany filtrów
    const handleFilterChange = (name: string, value: any) => {
        setRecipientFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Stosowanie filtrów i wybór odbiorców
    const applyFilters = () => {
        const filteredClients = filterRecipients();
        setSelectedRecipients(filteredClients.map(client => client.id));

        // Aktualizacja liczby odbiorców w kampanii
        setCampaign(prev => ({
            ...prev,
            recipientCount: filteredClients.length
        }));

        // Podgląd pierwszych kilku odbiorców
        setSelectedRecipientPreview(filteredClients.slice(0, 5));
    };

    // Filtrowanie odbiorców na podstawie wszystkich kryteriów
    const filterRecipients = () => {
        return potentialRecipients.filter(client => {
            // Podstawowa filtracja typu klienta
            if (client.company && !recipientFilters.includeCompanyClients) return false;
            if (!client.company && !recipientFilters.includeIndividualClients) return false;

            // Filtracja po wizytach
            if (client.totalVisits < recipientFilters.minTotalVisits) return false;

            // Filtracja po segmencie (aktywni/nieaktywni)
            if (recipientFilters.lastVisitDays > 0) {
                const now = new Date();
                const lastVisitThreshold = new Date();
                lastVisitThreshold.setDate(now.getDate() - recipientFilters.lastVisitDays);

                if (recipientFilters.segmentType === 'active') {
                    const lastVisitDate = client.lastVisitDate ? new Date(client.lastVisitDate) : null;
                    if (!lastVisitDate || lastVisitDate < lastVisitThreshold) return false;
                } else if (recipientFilters.segmentType === 'inactive') {
                    const lastVisitDate = client.lastVisitDate ? new Date(client.lastVisitDate) : null;
                    if (!lastVisitDate) return true; // Brak wizyty oznacza nieaktywność
                    if (lastVisitDate >= lastVisitThreshold) return false;
                }
            }

            // Filtracja po przychodach
            if (recipientFilters.minTotalRevenue > 0 && client.totalRevenue < recipientFilters.minTotalRevenue) return false;
            if (recipientFilters.maxTotalRevenue > 0 && client.totalRevenue > recipientFilters.maxTotalRevenue) return false;

            // Filtracja po pojazdach
            if (recipientFilters.vehicleMake || recipientFilters.vehicleModel ||
                recipientFilters.vehicleYearFrom > 0 || recipientFilters.vehicleYearTo > 0) {

                // Przyjmujemy, że mamy dostęp do pojazdów klienta poprzez vehicles
                const hasMatchingVehicle = client.vehicles.some(vehicleId => {
                    // Tutaj w rzeczywistym kodzie musiałbyś mieć dostęp do szczegółów pojazdu
                    // To jest uproszczona implementacja
                    const vehicle = getVehicleDetails(vehicleId);
                    if (!vehicle) return false;

                    if (recipientFilters.vehicleMake && vehicle.make !== recipientFilters.vehicleMake) return false;
                    if (recipientFilters.vehicleModel && vehicle.model !== recipientFilters.vehicleModel) return false;
                    if (recipientFilters.vehicleYearFrom > 0 && vehicle.year < recipientFilters.vehicleYearFrom) return false;
                    if (recipientFilters.vehicleYearTo > 0 && vehicle.year > recipientFilters.vehicleYearTo) return false;

                    return true;
                });

                if (!hasMatchingVehicle) return false;
            }

            // Dalsze filtry możesz dodać według potrzeb

            return true;
        });
    };

    // Pomocnicza funkcja do pobrania szczegółów pojazdu - w rzeczywistym kodzie zastąp własną implementacją
    const getVehicleDetails = (vehicleId: string) => {
        // Ta funkcja byłaby zastąpiona faktycznym pobieraniem danych pojazdu
        // Zwracamy przykładowe dane dla uproszczenia
        return {
            make: "BMW",
            model: "X5",
            year: 2020
        };
    };

    // Zapisywanie kampanii
    const handleSave = () => {
        // Walidacja harmonogramu
        if (!scheduleNow && !campaign.scheduledDate) {
            showToast('error', 'Wybierz datę i godzinę wysyłki', 3000);
            return;
        }

        try {
            setLoading(true);

            // Przygotowanie kompletnego obiektu kampanii
            const completeCampaign = {
                ...campaign,
                status: scheduleNow ? SmsStatus.PENDING : SmsStatus.SCHEDULED,
                recipientCount: selectedRecipients.length,
                createdAt: campaign.createdAt || new Date().toISOString(),
                createdBy: campaign.createdBy || 'current-user-id'
            } as SmsCampaign;

            onSave(completeCampaign);
            showToast('success', scheduleNow ? 'Kampania SMS została uruchomiona' : 'Kampania SMS została zaplanowana', 3000);
            onClose();
        } catch (error) {
            console.error('Error saving campaign:', error);
            showToast('error', 'Nie udało się zapisać kampanii', 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edytuj kampanię SMS' : 'Nowa kampania SMS'}
        >
            <div>
                {/* Wskaźnik kroków */}
                <StepsIndicator currentStep={currentStep} />

                {/* Zawartość kroku */}
                {currentStep === 1 && (
                    <Step1BasicInfo
                        campaign={campaign}
                        onInputChange={handleInputChange}
                        onNext={goToNextStep}
                        onCancel={onClose}
                    />
                )}

                {currentStep === 2 && (
                    <Step2Recipients
                        recipientFilters={recipientFilters}
                        onFilterChange={handleFilterChange}
                        applyFilters={applyFilters}
                        selectedRecipients={selectedRecipients}
                        recipientPreview={selectedRecipientPreview}
                        isLoading={loadingRecipients}
                        onPrevious={goToPreviousStep}
                        onNext={goToNextStep}
                    />
                )}

                {currentStep === 3 && (
                    <Step3Content
                        campaign={campaign}
                        useTemplate={useTemplate}
                        setUseTemplate={setUseTemplate}
                        onInputChange={handleInputChange}
                        templates={templates}
                        isLoadingTemplates={loadingTemplates}
                        recipientsCount={selectedRecipients.length}
                        onPrevious={goToPreviousStep}
                        onNext={goToNextStep}
                    />
                )}

                {currentStep === 4 && (
                    <Step4Summary
                        campaign={campaign}
                        scheduleNow={scheduleNow}
                        setScheduleNow={setScheduleNow}
                        onInputChange={handleInputChange}
                        selectedRecipients={selectedRecipients}
                        onPrevious={goToPreviousStep}
                        onSave={handleSave}
                        isLoading={loading}
                    />
                )}
            </div>
        </Modal>
    );
};

export default NewSmsCampaignModal;