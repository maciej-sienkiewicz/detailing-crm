// src/pages/SMS/components/modals/NewSmsAutomationModal.tsx
import React, { useState, useEffect } from 'react';
import { FaRobot } from 'react-icons/fa';
import Modal from '../../../../components/common/Modal';
import { useToast } from '../../../../components/common/Toast/Toast';
import {
    SmsAutomation,
    SmsAutomationTrigger,
    SmsTemplate
} from '../../../../types/sms';
import { smsApi } from '../../../../api/smsApi';

// Importy komponentów kroków
import Step2TriggerSettings from './automation-steps/Step2TriggerSettings';
import Step3TemplateAndSummary from './automation-steps/Step3TemplateAndSummary';
import StepsIndicator from './automation-common/StepsIndicator';
import Step1BasicInfo from "./automation-steps/Step1BasicInfo";

interface NewSmsAutomationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (automation: SmsAutomation) => void;
    initialAutomation?: SmsAutomation;
    isEditing?: boolean;
}

/**
 * Modal do tworzenia i edycji automatyzacji SMS
 * Podzielony na 3 kroki: informacje podstawowe, ustawienia wyzwalacza i wybór szablonu
 */
const NewSmsAutomationModal: React.FC<NewSmsAutomationModalProps> = ({
                                                                         isOpen,
                                                                         onClose,
                                                                         onSave,
                                                                         initialAutomation,
                                                                         isEditing = false
                                                                     }) => {
    const { showToast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Stan dla danych automatyzacji
    const [automation, setAutomation] = useState<Partial<SmsAutomation>>({
        name: '',
        description: '',
        isActive: true,
        trigger: SmsAutomationTrigger.BEFORE_APPOINTMENT,
        triggerParameters: {},
        templateId: '',
        messagesSent: 0
    });

    // Stan dla szablonów
    const [templates, setTemplates] = useState<SmsTemplate[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplate | null>(null);

    // Wypełnianie formularza danymi przy edycji
    useEffect(() => {
        if (initialAutomation && isEditing) {
            setAutomation({
                ...initialAutomation
            });
        }
    }, [initialAutomation, isEditing]);

    // Pobieranie szablonów przy otwarciu modalu
    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
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

    // Resetowanie formularza
    const resetForm = () => {
        setAutomation({
            name: '',
            description: '',
            isActive: true,
            trigger: SmsAutomationTrigger.BEFORE_APPOINTMENT,
            triggerParameters: {},
            templateId: '',
            messagesSent: 0
        });
        setSelectedTemplate(null);
    };

    // Pobieranie szablonów
    const fetchTemplates = async () => {
        try {
            setLoadingTemplates(true);
            const data = await smsApi.fetchTemplates();
            setTemplates(data.filter(t => t.isActive));

            // Jeśli jest templateId w automatyzacji, znajdź i ustaw wybrany szablon
            if (automation.templateId) {
                const template = data.find(t => t.id === automation.templateId);
                if (template) {
                    setSelectedTemplate(template);
                }
            }

            setLoadingTemplates(false);
        } catch (error) {
            console.error('Error fetching templates:', error);
            setLoadingTemplates(false);
        }
    };

    // Obsługa zmiany pól formularza
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'trigger') {
            // Rzutowanie value na SmsAutomationTrigger przed przypisaniem
            const triggerValue = value as SmsAutomationTrigger;
            setAutomation(prev => ({
                ...prev,
                [name]: triggerValue,
                triggerParameters: getDefaultTriggerParameters(triggerValue)
            }));
        } else if (name === 'templateId') {
            // Znajdź i ustaw wybrany szablon
            const template = templates.find(t => t.id === value);
            setSelectedTemplate(template || null);
            setAutomation(prev => ({
                ...prev,
                [name]: value
            }));
        } else {
            setAutomation(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Obsługa zmiany pól parametrów wyzwalacza
    const handleTriggerParameterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Konwersja wartości dla typów numerycznych
        const paramValue = type === 'number' ? parseInt(value, 10) : value;

        setAutomation(prev => ({
            ...prev,
            triggerParameters: {
                ...prev.triggerParameters,
                [name]: paramValue
            }
        }));
    };

    // Obsługa zmiany checkbox
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;

        if (name.includes('.')) {
            // Dla parametrów wyzwalacza w formacie "triggerParameters.paramName"
            const paramName = name.split('.')[1];
            setAutomation(prev => ({
                ...prev,
                triggerParameters: {
                    ...prev.triggerParameters,
                    [paramName]: checked
                }
            }));
        } else {
            // Dla głównych pól automatyzacji
            setAutomation(prev => ({
                ...prev,
                [name]: checked
            }));
        }
    };

    // Pobranie domyślnych parametrów dla wyzwalacza
    const getDefaultTriggerParameters = (trigger: SmsAutomationTrigger): Record<string, any> => {
        switch (trigger) {
            case SmsAutomationTrigger.BEFORE_APPOINTMENT:
                return { days: 1 };
            case SmsAutomationTrigger.AFTER_APPOINTMENT:
                return { days: 1 };
            case SmsAutomationTrigger.STATUS_CHANGE:
                return { status: 'completed' };
            case SmsAutomationTrigger.CLIENT_BIRTHDAY:
                return {
                    time: '09:00',
                    withDiscount: false,
                    discountCode: '',
                    discountValue: 0
                };
            case SmsAutomationTrigger.NO_VISIT_PERIOD:
                return { months: 3 };
            case SmsAutomationTrigger.INVOICE_STATUS_CHANGE:
                return { status: 'overdue' };
            case SmsAutomationTrigger.VEHICLE_ANNIVERSARY:
                return { years: 1 };
            case SmsAutomationTrigger.VEHICLE_MILEAGE:
                return { mileage: 10000 };
            default:
                return {};
        }
    };

    // Obsługa zmiany kroków
    const goToNextStep = () => {
        if (currentStep === 1) {
            // Walidacja podstawowych informacji
            if (!automation.name) {
                showToast('error', 'Nazwa automatyzacji jest wymagana', 3000);
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Walidacja wyzwalacza
            if (!automation.trigger) {
                showToast('error', 'Wybierz typ wyzwalacza', 3000);
                return;
            }

            // Sprawdź czy parametry są poprawne
            if (!validateTriggerParameters()) {
                return;
            }

            setCurrentStep(3);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Walidacja parametrów wyzwalacza
    const validateTriggerParameters = (): boolean => {
        const { trigger, triggerParameters } = automation;

        if (!trigger || !triggerParameters) return false;

        switch (trigger) {
            case SmsAutomationTrigger.BEFORE_APPOINTMENT:
            case SmsAutomationTrigger.AFTER_APPOINTMENT:
                if (!triggerParameters.days || triggerParameters.days < 1) {
                    showToast('error', 'Liczba dni musi być większa od 0', 3000);
                    return false;
                }
                break;
            case SmsAutomationTrigger.CLIENT_BIRTHDAY:
                if (triggerParameters.withDiscount && !triggerParameters.discountCode) {
                    showToast('error', 'Podaj kod rabatowy', 3000);
                    return false;
                }
                break;
            case SmsAutomationTrigger.NO_VISIT_PERIOD:
                if (!triggerParameters.months || triggerParameters.months < 1) {
                    showToast('error', 'Liczba miesięcy musi być większa od 0', 3000);
                    return false;
                }
                break;
            case SmsAutomationTrigger.VEHICLE_MILEAGE:
                if (!triggerParameters.mileage || triggerParameters.mileage < 1000) {
                    showToast('error', 'Przebieg musi być większy od 1000 km', 3000);
                    return false;
                }
                break;
        }

        return true;
    };

    // Zapisywanie automatyzacji
    const handleSave = async () => {
        try {
            // Walidacja ostatniego kroku
            if (!automation.templateId) {
                showToast('error', 'Wybierz szablon wiadomości', 3000);
                return;
            }

            setLoading(true);

            // Przygotowanie kompletnego obiektu automatyzacji
            const completeAutomation = {
                ...automation,
                name: automation.name || '',
                description: automation.description || '',
                isActive: automation.isActive !== undefined ? automation.isActive : true,
                trigger: automation.trigger || SmsAutomationTrigger.BEFORE_APPOINTMENT,
                triggerParameters: automation.triggerParameters || {},
                templateId: automation.templateId || '',
                messagesSent: automation.messagesSent || 0,
                createdAt: automation.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: automation.createdBy || 'current-user-id'
            } as SmsAutomation;

            onSave(completeAutomation);
            showToast('success', isEditing ? 'Automatyzacja została zaktualizowana' : 'Automatyzacja została utworzona', 3000);
            onClose();
        } catch (error) {
            console.error('Error saving automation:', error);
            showToast('error', 'Nie udało się zapisać automatyzacji', 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edytuj automatyzację SMS' : 'Nowa automatyzacja SMS'}
        >
            <div>
                {/* Wskaźnik kroków */}
                <StepsIndicator currentStep={currentStep} />

                {/* Zawartość kroku */}
                {currentStep === 1 && (
                    <Step1BasicInfo
                        automation={automation}
                        onInputChange={handleInputChange}
                        onCheckboxChange={handleCheckboxChange}
                        onNext={goToNextStep}
                        onCancel={onClose}
                    />
                )}

                {currentStep === 2 && (
                    <Step2TriggerSettings
                        automation={automation}
                        onTriggerChange={handleInputChange}
                        onTriggerParameterChange={handleTriggerParameterChange}
                        onCheckboxChange={handleCheckboxChange}
                        getDefaultTriggerParameters={getDefaultTriggerParameters}
                        onPrevious={goToPreviousStep}
                        onNext={goToNextStep}
                    />
                )}

                {currentStep === 3 && (
                    <Step3TemplateAndSummary
                        automation={automation}
                        templates={templates}
                        selectedTemplate={selectedTemplate}
                        isLoadingTemplates={loadingTemplates}
                        onInputChange={handleInputChange}
                        onPrevious={goToPreviousStep}
                        onSave={handleSave}
                        isLoading={loading}
                    />
                )}
            </div>
        </Modal>
    );
};

export default NewSmsAutomationModal;