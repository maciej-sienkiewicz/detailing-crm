import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaRobot,
    FaSave,
    FaTimes,
    FaCalendarAlt,
    FaListAlt,
    FaCheck,
    FaCaretRight,
    FaInfoCircle,
    FaArrowRight,
    FaArrowLeft,
    FaUserFriends,
    FaExclamationTriangle,
    FaClock,
    FaCar,
    FaBirthdayCake,
    FaFileInvoiceDollar,
    FaTachometerAlt,
    FaToggleOn
} from 'react-icons/fa';
import Modal from '../../../../components/common/Modal';
import { smsApi } from '../../../../api/smsApi';
import {
    SmsAutomation,
    SmsAutomationTrigger,
    SmsAutomationTriggerLabels,
    SmsTemplate
} from '../../../../types/sms';
import { useToast } from '../../../../components/common/Toast/Toast';

interface NewSmsAutomationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (automation: SmsAutomation) => void;
    initialAutomation?: SmsAutomation;
    isEditing?: boolean;
}

const NewSmsAutomationModal: React.FC<NewSmsAutomationModalProps> = ({
                                                                         isOpen,
                                                                         onClose,
                                                                         onSave,
                                                                         initialAutomation,
                                                                         isEditing = false
                                                                     }) => {
    const { showToast } = useToast();

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

    // Stan dla kroków formularza
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Stan dla szablonów
    const [templates, setTemplates] = useState<SmsTemplate[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplate | null>(null);
    interface NewSmsAutomationModalProps {
        isOpen: boolean;
        onClose: () => void;
        onSave: (automation: SmsAutomation) => void;
        initialAutomation?: SmsAutomation;
        isEditing?: boolean;
    }

    const NewSmsAutomationModal: React.FC<NewSmsAutomationModalProps> = ({
                                                                             isOpen,
                                                                             onClose,
                                                                             onSave,
                                                                             initialAutomation,
                                                                             isEditing = false
                                                                         }) => {
        const { showToast } = useToast();

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

        // Stan dla kroków formularza
        const [currentStep, setCurrentStep] = useState(1);
        const [loading, setLoading] = useState(false);

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

        // Obsługa przejścia do następnego kroku
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

        // Obsługa powrotu do poprzedniego kroku
        const goToPreviousStep = () => {
            if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
            }
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

        // Renderowanie ikon wyzwalaczy
        const renderTriggerIcon = (trigger: SmsAutomationTrigger) => {
            switch (trigger) {
                case SmsAutomationTrigger.BEFORE_APPOINTMENT:
                case SmsAutomationTrigger.AFTER_APPOINTMENT:
                    return <FaCalendarAlt />;
                case SmsAutomationTrigger.STATUS_CHANGE:
                    return <FaCaretRight />;
                case SmsAutomationTrigger.CLIENT_BIRTHDAY:
                    return <FaBirthdayCake />;
                case SmsAutomationTrigger.NO_VISIT_PERIOD:
                    return <FaClock />;
                case SmsAutomationTrigger.INVOICE_STATUS_CHANGE:
                    return <FaFileInvoiceDollar />;
                case SmsAutomationTrigger.VEHICLE_ANNIVERSARY:
                    return <FaCar />;
                case SmsAutomationTrigger.VEHICLE_MILEAGE:
                    return <FaTachometerAlt />;
                default:
                    return <FaRobot />;
            }
        };

        // Renderowanie formularza parametrów wyzwalacza
        const renderTriggerParametersForm = () => {
            const { trigger, triggerParameters } = automation;

            if (!trigger) return null;

            switch (trigger) {
                case SmsAutomationTrigger.BEFORE_APPOINTMENT:
                    return (
                        <ParametersGroup>
                            <FormGroup>
                                <FormLabel>Liczba dni przed wizytą</FormLabel>
                                <FormInput
                                    type="number"
                                    name="days"
                                    value={triggerParameters?.days || 1}
                                    onChange={handleTriggerParameterChange}
                                    min="1"
                                    max="30"
                                />
                                <FormHelp>
                                    Wiadomość zostanie wysłana określoną liczbę dni przed planowaną wizytą.
                                </FormHelp>
                            </FormGroup>
                        </ParametersGroup>
                    );

                case SmsAutomationTrigger.AFTER_APPOINTMENT:
                    return (
                        <ParametersGroup>
                            <FormGroup>
                                <FormLabel>Liczba dni po wizycie</FormLabel>
                                <FormInput
                                    type="number"
                                    name="days"
                                    value={triggerParameters?.days || 1}
                                    onChange={handleTriggerParameterChange}
                                    min="1"
                                    max="30"
                                />
                                <FormHelp>
                                    Wiadomość zostanie wysłana określoną liczbę dni po zakończonej wizycie.
                                </FormHelp>
                            </FormGroup>
                        </ParametersGroup>
                    );

                case SmsAutomationTrigger.STATUS_CHANGE:
                    return (
                        <ParametersGroup>
                            <FormGroup>
                                <FormLabel>Status zlecenia</FormLabel>
                                <FormSelect
                                    name="status"
                                    value={triggerParameters?.status || 'completed'}
                                    onChange={handleTriggerParameterChange}
                                >
                                    <option value="new">Nowe</option>
                                    <option value="in_progress">W realizacji</option>
                                    <option value="completed">Zakończone</option>
                                    <option value="canceled">Anulowane</option>
                                </FormSelect>
                                <FormHelp>
                                    Wiadomość zostanie wysłana gdy status zlecenia zmieni się na wybrany.
                                </FormHelp>
                            </FormGroup>
                        </ParametersGroup>
                    );

                case SmsAutomationTrigger.CLIENT_BIRTHDAY:
                    return (
                        <ParametersGroup>
                            <FormGroup>
                                <FormLabel>Godzina wysyłki</FormLabel>
                                <FormInput
                                    type="time"
                                    name="time"
                                    value={triggerParameters?.time || '09:00'}
                                    onChange={handleTriggerParameterChange}
                                />
                                <FormHelp>
                                    Wiadomość zostanie wysłana o określonej godzinie w dniu urodzin klienta.
                                </FormHelp>
                            </FormGroup>

                            <FormGroup>
                                <FormCheckboxWrapper>
                                    <FormCheckbox
                                        type="checkbox"
                                        id="withDiscount"
                                        name="triggerParameters.withDiscount"
                                        checked={triggerParameters?.withDiscount || false}
                                        onChange={handleCheckboxChange}
                                    />
                                    <FormCheckboxLabel htmlFor="withDiscount">
                                        Dołącz kod rabatowy urodzinowy
                                    </FormCheckboxLabel>
                                </FormCheckboxWrapper>
                            </FormGroup>

                            {triggerParameters?.withDiscount && (
                                <>
                                    <FormGroup>
                                        <FormLabel>Kod rabatowy</FormLabel>
                                        <FormInput
                                            type="text"
                                            name="discountCode"
                                            value={triggerParameters?.discountCode || ''}
                                            onChange={handleTriggerParameterChange}
                                            placeholder="np. URODZINY2025"
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <FormLabel>Wartość rabatu (%)</FormLabel>
                                        <FormInput
                                            type="number"
                                            name="discountValue"
                                            value={triggerParameters?.discountValue || 10}
                                            onChange={handleTriggerParameterChange}
                                            min="1"
                                            max="100"
                                        />
                                    </FormGroup>
                                </>
                            )}
                        </ParametersGroup>
                    );

                case SmsAutomationTrigger.NO_VISIT_PERIOD:
                    return (
                        <ParametersGroup>
                            <FormGroup>
                                <FormLabel>Liczba miesięcy bez wizyty</FormLabel>
                                <FormInput
                                    type="number"
                                    name="months"
                                    value={triggerParameters?.months || 3}
                                    onChange={handleTriggerParameterChange}
                                    min="1"
                                    max="24"
                                />
                                <FormHelp>
                                    Wiadomość zostanie wysłana gdy klient nie odwiedzi warsztatu przez określoną liczbę miesięcy.
                                </FormHelp>
                            </FormGroup>
                        </ParametersGroup>
                    );

                case SmsAutomationTrigger.INVOICE_STATUS_CHANGE:
                    return (
                        <ParametersGroup>
                            <FormGroup>
                                <FormLabel>Status faktury</FormLabel>
                                <FormSelect
                                    name="status"
                                    value={triggerParameters?.status || 'overdue'}
                                    onChange={handleTriggerParameterChange}
                                >
                                    <option value="issued">Wystawiona</option>
                                    <option value="paid">Opłacona</option>
                                    <option value="overdue">Przeterminowana</option>
                                    <option value="canceled">Anulowana</option>
                                </FormSelect>
                                <FormHelp>
                                    Wiadomość zostanie wysłana gdy status faktury zmieni się na wybrany.
                                </FormHelp>
                            </FormGroup>
                        </ParametersGroup>
                    );

                case SmsAutomationTrigger.VEHICLE_ANNIVERSARY:
                    return (
                        <ParametersGroup>
                            <FormGroup>
                                <FormLabel>Rocznica (w latach)</FormLabel>
                                <FormInput
                                    type="number"
                                    name="years"
                                    value={triggerParameters?.years || 1}
                                    onChange={handleTriggerParameterChange}
                                    min="1"
                                    max="10"
                                />
                                <FormHelp>
                                    Wiadomość zostanie wysłana w rocznicę pierwszej wizyty pojazdu w warsztacie.
                                </FormHelp>
                            </FormGroup>
                        </ParametersGroup>
                    );

                case SmsAutomationTrigger.VEHICLE_MILEAGE:
                    return (
                        <ParametersGroup>
                            <FormGroup>
                                <FormLabel>Przebieg (km)</FormLabel>
                                <FormInput
                                    type="number"
                                    name="mileage"
                                    value={triggerParameters?.mileage || 10000}
                                    onChange={handleTriggerParameterChange}
                                    min="1000"
                                    step="1000"
                                />
                                <FormHelp>
                                    Wiadomość zostanie wysłana gdy przebieg pojazdu przekroczy określoną wartość.
                                </FormHelp>
                            </FormGroup>
                        </ParametersGroup>
                    );

                default:
                    return null;
            }
        };

        // Renderowanie kroku 1 - Podstawowe informacje
        const renderStep1 = () => {
            return (
                <StepContainer>
                    <StepTitle>
                        <StepNumber active>1</StepNumber>
                        Podstawowe informacje
                    </StepTitle>

                    <FormGroup>
                        <FormLabel>Nazwa automatyzacji*</FormLabel>
                        <FormInput
                            type="text"
                            name="name"
                            value={automation.name || ''}
                            onChange={handleInputChange}
                            placeholder="np. Przypomnienie o wizycie"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Opis automatyzacji</FormLabel>
                        <FormTextarea
                            name="description"
                            value={automation.description || ''}
                            onChange={handleInputChange}
                            placeholder="Dodaj opis automatyzacji..."
                            rows={3}
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormCheckboxWrapper>
                            <FormCheckbox
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={automation.isActive === true}
                                onChange={handleCheckboxChange}
                            />
                            <FormCheckboxLabel htmlFor="isActive">
                                Automatyzacja aktywna
                            </FormCheckboxLabel>
                        </FormCheckboxWrapper>
                        <FormHelp>
                            Nieaktywne automatyzacje nie będą wysyłać wiadomości.
                        </FormHelp>
                    </FormGroup>

                    <StepActions>
                        <SecondaryButton onClick={onClose}>
                            <FaTimes /> Anuluj
                        </SecondaryButton>
                        <PrimaryButton onClick={goToNextStep}>
                            Dalej <FaArrowRight />
                        </PrimaryButton>
                    </StepActions>
                </StepContainer>
            );
        };
        // Renderowanie kroku 2 - Konfiguracja wyzwalacza
        const renderStep2 = () => {
            return (
                <StepContainer>
                    <StepTitle>
                        <StepNumber>1</StepNumber>
                        <StepNumber active>2</StepNumber>
                        Konfiguracja wyzwalacza
                    </StepTitle>

                    <FormSection>
                        <SectionTitle>Typ wyzwalacza</SectionTitle>

                        <TriggersGrid>
                            {Object.entries(SmsAutomationTriggerLabels).map(([key, label]) => (
                                <TriggerOption
                                    key={key}
                                    selected={automation.trigger === key}
                                    onClick={() => handleInputChange({
                                        target: { name: 'trigger', value: key }
                                    } as React.ChangeEvent<HTMLSelectElement>)}
                                >
                                    <TriggerIcon>
                                        {renderTriggerIcon(key as SmsAutomationTrigger)}
                                    </TriggerIcon>
                                    <TriggerLabel>{label}</TriggerLabel>
                                </TriggerOption>
                            ))}
                        </TriggersGrid>
                    </FormSection>

                    <FormSection>
                        <SectionTitle>Parametry wyzwalacza</SectionTitle>

                        {renderTriggerParametersForm()}

                        <TriggerDescription>
                            <FaInfoCircle style={{ marginRight: '8px' }} />
                            {getTriggerDescription(automation.trigger as SmsAutomationTrigger)}
                        </TriggerDescription>
                    </FormSection>

                    <StepActions>
                        <SecondaryButton onClick={goToPreviousStep}>
                            <FaArrowLeft /> Wstecz
                        </SecondaryButton>
                        <PrimaryButton onClick={goToNextStep}>
                            Dalej <FaArrowRight />
                        </PrimaryButton>
                    </StepActions>
                </StepContainer>
            );
        };


// Renderowanie kroku 3 - Wybór szablonu i podsumowanie
        const renderStep3 = () => {
            return (
                <StepContainer>
                    <StepTitle>
                        <StepNumber>1</StepNumber>
                        <StepNumber>2</StepNumber>
                        <StepNumber active>3</StepNumber>
                        Wiadomość i podsumowanie
                    </StepTitle>

                    <FormSection>
                        <SectionTitle>Szablon wiadomości</SectionTitle>

                        <FormGroup>
                            <FormLabel>Wybierz szablon*</FormLabel>
                            {loadingTemplates ? (
                                <LoadingContainer>
                                    <LoadingSpinner />
                                    <span>Ładowanie szablonów...</span>
                                </LoadingContainer>
                            ) : (
                                <FormSelect
                                    name="templateId"
                                    value={automation.templateId || ''}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Wybierz szablon...</option>
                                    {templates.map(template => (
                                        <option key={template.id} value={template.id}>
                                            {template.name}
                                        </option>
                                    ))}
                                </FormSelect>
                            )}
                        </FormGroup>

                        {selectedTemplate && (
                            <TemplatePreview>
                                <PreviewTitle>Podgląd szablonu</PreviewTitle>
                                <PreviewContent>
                                    {selectedTemplate.content}
                                </PreviewContent>

                                {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                                    <VariablesInfo>
                                        <VariablesTitle>Zmienne w szablonie:</VariablesTitle>
                                        <VariablesList>
                                            {selectedTemplate.variables.map(variable => (
                                                <VariableTag key={variable}>{`{{${variable}}}`}</VariableTag>
                                            ))}
                                        </VariablesList>
                                    </VariablesInfo>
                                )}
                            </TemplatePreview>
                        )}
                    </FormSection>

                    <FormSection>
                        <SectionTitle>Podsumowanie automatyzacji</SectionTitle>

                        <SummaryGrid>
                            <SummaryItem>
                                <SummaryLabel>Nazwa</SummaryLabel>
                                <SummaryValue>{automation.name}</SummaryValue>
                            </SummaryItem>

                            <SummaryItem>
                                <SummaryLabel>Wyzwalacz</SummaryLabel>
                                <SummaryValue>
                                    {automation.trigger && SmsAutomationTriggerLabels[automation.trigger as SmsAutomationTrigger]}
                                </SummaryValue>
                            </SummaryItem>

                            <SummaryItem>
                                <SummaryLabel>Status</SummaryLabel>
                                <StatusValue active={automation.isActive === true}>
                                    {automation.isActive ? (
                                        <>
                                            <FaToggleOn style={{ marginRight: '5px' }} />
                                            Aktywna
                                        </>
                                    ) : (
                                        <>
                                            <FaTimes style={{ marginRight: '5px' }} />
                                            Nieaktywna
                                        </>
                                    )}
                                </StatusValue>
                            </SummaryItem>

                            <SummaryItem fullWidth>
                                <SummaryLabel>Szablon wiadomości</SummaryLabel>
                                <SummaryValue>
                                    {selectedTemplate ? selectedTemplate.name : 'Nie wybrano szablonu'}
                                </SummaryValue>
                            </SummaryItem>

                            {automation.description && (
                                <SummaryItem fullWidth>
                                    <SummaryLabel>Opis</SummaryLabel>
                                    <SummaryValue>{automation.description}</SummaryValue>
                                </SummaryItem>
                            )}
                        </SummaryGrid>
                    </FormSection>

                    <StepActions>
                        <SecondaryButton onClick={goToPreviousStep}>
                            <FaArrowLeft /> Wstecz
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={handleSave}
                            disabled={loading || !automation.templateId}
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner />
                                    Zapisywanie...
                                </>
                            ) : (
                                <>
                                    <FaSave /> {isEditing ? 'Zapisz zmiany' : 'Utwórz automatyzację'}
                                </>
                            )}
                        </PrimaryButton>
                    </StepActions>
                </StepContainer>
            );
        };

        // Funkcja pomocnicza do generowania opisów wyzwalaczy
        const getTriggerDescription = (trigger: SmsAutomationTrigger): string => {
            switch (trigger) {
                case SmsAutomationTrigger.BEFORE_APPOINTMENT:
                    return 'Automatyzacja wysyła wiadomość określoną liczbę dni przed zaplanowaną wizytą.';
                case SmsAutomationTrigger.AFTER_APPOINTMENT:
                    return 'Automatyzacja wysyła wiadomość określoną liczbę dni po zakończonej wizycie.';
                case SmsAutomationTrigger.STATUS_CHANGE:
                    return 'Automatyzacja wysyła wiadomość gdy status zlecenia zmienia się na określoną wartość.';
                case SmsAutomationTrigger.CLIENT_BIRTHDAY:
                    return 'Automatyzacja wysyła wiadomość w dniu urodzin klienta, opcjonalnie z kodem rabatowym.';
                case SmsAutomationTrigger.NO_VISIT_PERIOD:
                    return 'Automatyzacja wysyła wiadomość gdy klient nie odwiedził warsztatu przez określony czas.';
                case SmsAutomationTrigger.INVOICE_STATUS_CHANGE:
                    return 'Automatyzacja wysyła wiadomość gdy status faktury zmienia się na określoną wartość.';
                case SmsAutomationTrigger.VEHICLE_ANNIVERSARY:
                    return 'Automatyzacja wysyła wiadomość w rocznicę pierwszej wizyty pojazdu w warsztacie.';
                case SmsAutomationTrigger.VEHICLE_MILEAGE:
                    return 'Automatyzacja wysyła wiadomość gdy przebieg pojazdu przekroczy określoną wartość.';
                default:
                    return 'Niestandardowa automatyzacja wiadomości SMS.';
            }
        };

        return (
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={isEditing ? 'Edytuj automatyzację SMS' : 'Nowa automatyzacja SMS'}
            >
                <ModalContent>
                    <StepsIndicator>
                        <StepIndicator active={currentStep >= 1} completed={currentStep > 1}>
                            <StepIndicatorNumber>{currentStep > 1 ? <FaCheck /> : 1}</StepIndicatorNumber>
                            <StepIndicatorLabel>Podstawowe informacje</StepIndicatorLabel>
                        </StepIndicator>

                        <StepConnector completed={currentStep > 1} />

                        <StepIndicator active={currentStep >= 2} completed={currentStep > 2}>
                            <StepIndicatorNumber>{currentStep > 2 ? <FaCheck /> : 2}</StepIndicatorNumber>
                            <StepIndicatorLabel>Wyzwalacz</StepIndicatorLabel>
                        </StepIndicator>

                        <StepConnector completed={currentStep > 2} />

                        <StepIndicator active={currentStep >= 3}>
                            <StepIndicatorNumber>3</StepIndicatorNumber>
                            <StepIndicatorLabel>Szablon i podsumowanie</StepIndicatorLabel>
                        </StepIndicator>
                    </StepsIndicator>

                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                </ModalContent>
            </Modal>
        );
    };

    // Styled components
const ModalContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

    const StepsIndicator = styled.div`
    display: flex;
    align-items: center;
    padding: 0 16px;
    margin-bottom: 24px;
`;

    const StepIndicator = styled.div<{ active?: boolean; completed?: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    position: relative;
    
    ${({ active }) => active && `
        font-weight: 600;
    `}
`;

    const StepIndicatorNumber = styled.div<{ active?: boolean; completed?: boolean }>`
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background-color: #e9ecef;
        border-radius: 50%;
        font-size: 14px;
        color: #6c757d;

        ${props => (props.active || props.completed) && `
        background-color: #3498db;
        color: white;
    `}
    `;

const StepIndicatorLabel = styled.div`
    font-size: 12px;
    color: #6c757d;
    white-space: nowrap;
    
    ${({ theme, active }) => active && `
        color: #2c3e50;
    `}
`;

    const StepConnector = styled.div<{ completed?: boolean }>`
    flex: 1;
    height: 2px;
    background-color: #e9ecef;
    margin: 0 4px;
    
    ${({ completed }) => completed && `
        background-color: #3498db;
    `}
`;

    const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

    const StepTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
`;

    const StepNumber = styled.div<{ active?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background-color: ${({ active }) => active ? '#3498db' : '#e9ecef'};
    color: ${({ active }) => active ? 'white' : '#6c757d'};
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
`;

    const FormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
`;

    const SectionTitle = styled.h4`
    font-size: 15px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 8px 0;
`;

    const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

    const FormLabel = styled.label`
    font-size: 14px;
    font-weight: 500;
    color: #495057;
`;

    const FormInput = styled.input`
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 14px;
    transition: border-color 0.2s;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

    const FormTextarea = styled.textarea`
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 14px;
    transition: border-color 0.2s;
    resize: vertical;
    min-height: 100px;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

    const FormSelect = styled.select`
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 14px;
    background-color: white;
    transition: border-color 0.2s;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

    const FormHelp = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

    const FormCheckboxWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

    const FormCheckbox = styled.input`
    width: 16px;
    height: 16px;
    cursor: pointer;
`;

    const FormCheckboxLabel = styled.label`
    font-size: 14px;
    color: #495057;
    cursor: pointer;
`;

    const TriggersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
`;

    const TriggerOption = styled.div<{ selected?: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background-color: ${({ selected }) => selected ? '#e3f2fd' : 'white'};
    border: 1px solid ${({ selected }) => selected ? '#90cdf4' : '#e9ecef'};
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background-color: ${({ selected }) => selected ? '#e3f2fd' : '#f0f9ff'};
        border-color: ${({ selected }) => selected ? '#90cdf4' : '#bee3f8'};
    }
`;

    const TriggerIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background-color: #f0f9ff;
    border-radius: 12px;
    color: #3498db;
    font-size: 20px;
`;

    const TriggerLabel = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
    text-align: center;
`;

    const ParametersGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background-color: white;
    border-radius: 5px;
    border: 1px solid #e9ecef;
`;

    const TriggerDescription = styled.div`
    display: flex;
    align-items: flex-start;
    padding: 12px 16px;
    background-color: #f0f9ff;
    border: 1px solid #bee3f8;
    border-radius: 5px;
    font-size: 14px;
    color: #2c5282;
    line-height: 1.5;
`;

    const TemplatePreview = styled.div`
    padding: 16px;
    background-color: #f0f9ff;
    border: 1px solid #bee3f8;
    border-radius: 5px;
    margin-top: 12px;
`;

    const PreviewTitle = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #3498db;
    margin-bottom: 12px;
`;

    const PreviewContent = styled.div`
    padding: 12px;
    background-color: white;
    border: 1px solid #e9ecef;
    border-radius: 5px;
    font-size: 14px;
    color: #2c3e50;
    white-space: pre-wrap;
    line-height: 1.5;
`;
    const VariablesInfo = styled.div`
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed #bee3f8;
`;

    const VariablesTitle = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: #4a5568;
    margin-bottom: 8px;
`;

    const VariablesList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

    const VariableTag = styled.div`
    display: inline-block;
    padding: 2px 6px;
    background-color: #edf2f7;
    border-radius: 3px;
    font-size: 12px;
    font-family: monospace;
    color: #e74c3c;
`;

    const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
`;

    const SummaryItem = styled.div<{ fullWidth?: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    ${({ fullWidth }) => fullWidth && `
        grid-column: 1 / -1;
    `}
`;

    const SummaryLabel = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

    const SummaryValue = styled.div`
    font-size: 14px;
    color: #2c3e50;
    font-weight: 500;
`;

    const StatusValue = styled.div<{ active?: boolean }>`
    display: flex;
    align-items: center;
    color: ${({ active }) => active ? '#2ecc71' : '#6c757d'};
`;

    const StepActions = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
`;

    const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 5px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

    const PrimaryButton = styled(Button)`
    background-color: #3498db;
    border-color: #3498db;
    color: white;

    &:hover:not(:disabled) {
        background-color: #2980b9;
        border-color: #2980b9;
    }
`;

    const SecondaryButton = styled(Button)`
    background-color: #f8f9fa;
    border-color: #dee2e6;
    color: #6c757d;

    &:hover:not(:disabled) {
        background-color: #e9ecef;
    }
`;

    const LoadingContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    color: #6c757d;
`;

    const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export default NewSmsAutomationModal;