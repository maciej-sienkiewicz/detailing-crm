// src/pages/SMS/components/modals/NewSmsCampaignModal.tsx - Część 1: Importy i definicja props
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaUserFriends,
    FaSave,
    FaTimes,
    FaCalendarAlt,
    FaListAlt,
    FaCheck,
    FaFilter,
    FaSearch,
    FaUsers,
    FaEnvelope,
    FaInfoCircle,
    FaExclamationTriangle,
    FaEye,
    FaPlay,
    FaArrowRight,
    FaArrowLeft
} from 'react-icons/fa';
import Modal from '../../../../components/common/Modal';
import { smsApi } from '../../../../api/smsApi';
import { SmsCampaign, SmsStatus, SmsTemplate } from '../../../../types/sms';
import { useToast } from '../../../../components/common/Toast/Toast';
import { clientApi } from '../../../../api/clientsApi';
import { ClientExpanded } from '../../../../types/client';

interface NewSmsCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (campaign: SmsCampaign) => void;
    initialCampaign?: SmsCampaign;
    isEditing?: boolean;
}// src/pages/SMS/components/modals/NewSmsCampaignModal.tsx - Część 2: Definicja komponentu i stany
const NewSmsCampaignModal: React.FC<NewSmsCampaignModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSave,
                                                                     initialCampaign,
                                                                     isEditing = false
                                                                 }) => {
    const { showToast } = useToast();

    // Stan dla danych formularza
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

    // Stan dla interfejsu
    const [currentStep, setCurrentStep] = useState(1);
    const [useTemplate, setUseTemplate] = useState(false);
    const [scheduleNow, setScheduleNow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [recipientFilters, setRecipientFilters] = useState({
        lastVisitDays: 0,
        includeCompanyClients: true,
        includeIndividualClients: true,
        minTotalVisits: 0,
        segmentType: 'all', // all, active, inactive
    });

    // Stan dla szablonów
    const [templates, setTemplates] = useState<SmsTemplate[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplate | null>(null);

    // Stan dla odbiorców
    const [potentialRecipients, setPotentialRecipients] = useState<ClientExpanded[]>([]);
    const [loadingRecipients, setLoadingRecipients] = useState(false);
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [recipientPreview, setRecipientPreview] = useState<ClientExpanded[]>([]);
    const [showRecipientPreview, setShowRecipientPreview] = useState(false);

    // Wypełnianie formularza danymi przy edycji
    useEffect(() => {
        if (initialCampaign && isEditing) {
            setCampaign({
                ...initialCampaign
            });
            setUseTemplate(!!initialCampaign.templateId);
        }
    }, [initialCampaign, isEditing]);

    // Pobieranie listy szablonów
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
    }, [isOpen]);// src/pages/SMS/components/modals/NewSmsCampaignModal.tsx - Część 3: Funkcje pomocnicze
    // Resetowanie formularza
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
        }
    };

    // Obsługa zmiany pól formularza
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCampaign(prev => ({
            ...prev,
            [name]: value
        }));

        // Jeśli zmieniono szablon, pobierz jego zawartość
        if (name === 'templateId' && value) {
            const template = templates.find(t => t.id === value);
            if (template) {
                setSelectedTemplate(template);
                setCampaign(prev => ({
                    ...prev,
                    customContent: template.content
                }));
            } else {
                setSelectedTemplate(null);
            }
        }
    };

    // Obsługa zmiany opcji szablonu
    const handleUseTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUseTemplate(e.target.checked);
        if (!e.target.checked) {
            setCampaign(prev => ({
                ...prev,
                templateId: ''
            }));
            setSelectedTemplate(null);
        }
    };

    // Obsługa zmiany opcji harmonogramu
    const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setScheduleNow(!e.target.checked);

        // Jeśli zaplanowano na później, ustaw domyślną datę (jutro)
        if (e.target.checked && !campaign.scheduledDate) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);
            setCampaign(prev => ({
                ...prev,
                scheduledDate: tomorrow.toISOString().slice(0, 16)
            }));
        }
    };

    // Obsługa zmiany filtrów odbiorców
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : type === 'number'
                ? parseInt(value, 10)
                : value;

        setRecipientFilters(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    // Filtrowanie potencjalnych odbiorców
    const filterRecipients = () => {
        const now = new Date();
        const lastVisitThreshold = new Date();
        lastVisitThreshold.setDate(now.getDate() - recipientFilters.lastVisitDays);

        return potentialRecipients.filter(client => {
            // Filtruj po typie klienta (firma/indywidualny)
            if (client.company && !recipientFilters.includeCompanyClients) return false;
            if (!client.company && !recipientFilters.includeIndividualClients) return false;

            // Filtruj po liczbie wizyt
            if (client.totalVisits < recipientFilters.minTotalVisits) return false;

            // Filtruj po segmencie
            if (recipientFilters.segmentType === 'active') {
                // Aktywni klienci mają wizytę w ostatnich X dniach
                const lastVisitDate = client.lastVisitDate ? new Date(client.lastVisitDate) : null;
                if (!lastVisitDate || lastVisitDate < lastVisitThreshold) return false;
            } else if (recipientFilters.segmentType === 'inactive') {
                // Nieaktywni klienci nie mają wizyty w ostatnich X dniach
                const lastVisitDate = client.lastVisitDate ? new Date(client.lastVisitDate) : null;
                if (!lastVisitDate) return true; // Brak wizyty oznacza nieaktywność
                if (lastVisitDate >= lastVisitThreshold) return false;
            }

            return true;
        });
    };

    // Aplikowanie filtrów i wybór odbiorców
    const applyFilters = () => {
        const filteredClients = filterRecipients();
        setSelectedRecipients(filteredClients.map(client => client.id));

        // Ustaw liczbę odbiorców w kampanii
        setCampaign(prev => ({
            ...prev,
            recipientCount: filteredClients.length
        }));

        // Pobierz podgląd pierwszych 5 odbiorców
        setRecipientPreview(filteredClients.slice(0, 5));
    };// src/pages/SMS/components/modals/NewSmsCampaignModal.tsx - Część 4: Obsługa nawigacji i zapis
    // Obsługa przejścia do kolejnych kroków
    const goToNextStep = () => {
        if (currentStep === 1) {
            // Walidacja podstawowych informacji
            if (!campaign.name) {
                showToast('error', 'Nazwa kampanii jest wymagana', 3000);
                return;
            }

            // Przejdź do kroku 2
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Walidacja odbiorców
            if (selectedRecipients.length === 0) {
                showToast('error', 'Wybierz co najmniej jednego odbiorcę', 3000);
                return;
            }

            // Przejdź do kroku 3
            setCurrentStep(3);
        } else if (currentStep === 3) {
            // Walidacja treści
            if (!campaign.customContent) {
                showToast('error', 'Treść wiadomości nie może być pusta', 3000);
                return;
            }

            // Przejdź do kroku 4
            setCurrentStep(4);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
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
                name: campaign.name || '',
                description: campaign.description || '',
                status: scheduleNow ? SmsStatus.PENDING : SmsStatus.SCHEDULED,
                customContent: campaign.customContent || '',
                templateId: useTemplate ? campaign.templateId : undefined,
                scheduledDate: scheduleNow ? undefined : campaign.scheduledDate,
                recipientCount: selectedRecipients.length,
                deliveredCount: campaign.deliveredCount || 0,
                failedCount: campaign.failedCount || 0,
                createdAt: campaign.createdAt || new Date().toISOString(),
                createdBy: campaign.createdBy || 'current-user-id'
            } as SmsCampaign;

            onSave(completeCampaign);

            showToast('success', scheduleNow
                ? 'Kampania SMS została uruchomiona'
                : 'Kampania SMS została zaplanowana', 3000);

            onClose();
        } catch (error) {
            console.error('Error saving campaign:', error);
            showToast('error', 'Nie udało się zapisać kampanii', 3000);
        } finally {
            setLoading(false);
        }
    };

    // Liczenie znaków w treści
    const countCharacters = (text: string) => {
        return text ? text.length : 0;
    };

    // Liczba SMS-ów potrzebnych do wysłania
    const getSmsCount = (text: string) => {
        const length = countCharacters(text);
        if (length <= 160) return 1;
        return Math.ceil(length / 153); // 153 znaki dla kolejnych części wiadomości wieloczęściowej
    };// src/pages/SMS/components/modals/NewSmsCampaignModal.tsx - Część 5: Renderowanie kroków 1 i 2
    // Renderowanie kroku 1 - Podstawowe informacje
    const renderStep1 = () => {
        return (
            <StepContainer>
                <StepTitle>
                    <StepNumber active>1</StepNumber>
                    Podstawowe informacje
                </StepTitle>

                <FormGroup>
                    <FormLabel>Nazwa kampanii*</FormLabel>
                    <FormInput
                        type="text"
                        name="name"
                        value={campaign.name || ''}
                        onChange={handleInputChange}
                        placeholder="np. Promocja letnia 2025"
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel>Opis kampanii</FormLabel>
                    <FormTextarea
                        name="description"
                        value={campaign.description || ''}
                        onChange={handleInputChange}
                        placeholder="Dodaj opis kampanii..."
                        rows={3}
                    />
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

    // Renderowanie kroku 2 - Wybór odbiorców
    const renderStep2 = () => {
        return (
            <StepContainer>
                <StepTitle>
                    <StepNumber>1</StepNumber>
                    <StepNumber active>2</StepNumber>
                    Wybór odbiorców
                </StepTitle>

                <FormSection>
                    <SectionTitle>Filtry odbiorców</SectionTitle>

                    <FilterGrid>
                        <FormGroup>
                            <FormLabel>Typ klienta</FormLabel>
                            <CheckboxGroup>
                                <FormCheckboxWrapper>
                                    <FormCheckbox
                                        type="checkbox"
                                        id="includeIndividualClients"
                                        name="includeIndividualClients"
                                        checked={recipientFilters.includeIndividualClients}
                                        onChange={handleFilterChange}
                                    />
                                    <FormCheckboxLabel htmlFor="includeIndividualClients">
                                        Klienci indywidualni
                                    </FormCheckboxLabel>
                                </FormCheckboxWrapper>

                                <FormCheckboxWrapper>
                                    <FormCheckbox
                                        type="checkbox"
                                        id="includeCompanyClients"
                                        name="includeCompanyClients"
                                        checked={recipientFilters.includeCompanyClients}
                                        onChange={handleFilterChange}
                                    />
                                    <FormCheckboxLabel htmlFor="includeCompanyClients">
                                        Klienci firmowi
                                    </FormCheckboxLabel>
                                </FormCheckboxWrapper>
                            </CheckboxGroup>
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>Segment klientów</FormLabel>
                            <FormSelect
                                name="segmentType"
                                value={recipientFilters.segmentType}
                                onChange={handleFilterChange}
                            >
                                <option value="all">Wszyscy klienci</option>
                                <option value="active">Aktywni klienci</option>
                                <option value="inactive">Nieaktywni klienci</option>
                            </FormSelect>
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>Minimalna liczba wizyt</FormLabel>
                            <FormInput
                                type="number"
                                name="minTotalVisits"
                                value={recipientFilters.minTotalVisits}
                                onChange={handleFilterChange}
                                min="0"
                            />
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>Ostatnia wizyta (dni)</FormLabel>
                            <FormInput
                                type="number"
                                name="lastVisitDays"
                                value={recipientFilters.lastVisitDays}
                                onChange={handleFilterChange}
                                min="0"
                                placeholder="0 = dowolna data"
                            />
                            <FormHelp>
                                {recipientFilters.segmentType === 'active'
                                    ? 'Klienci z wizytą w ciągu ostatnich X dni'
                                    : recipientFilters.segmentType === 'inactive'
                                        ? 'Klienci bez wizyty przez ostatnie X dni'
                                        : 'Ustaw 0, aby nie filtrować po dacie ostatniej wizyty'}
                            </FormHelp>
                        </FormGroup>
                    </FilterGrid>

                    <ApplyFiltersButton onClick={applyFilters}>
                        <FaFilter /> Zastosuj filtry
                    </ApplyFiltersButton>
                </FormSection>

                <FormSection>
                    <SectionTitle>Odbiorcy kampanii</SectionTitle>

                    {loadingRecipients ? (
                        <LoadingContainer>
                            <LoadingSpinner />
                            <span>Ładowanie danych klientów...</span>
                        </LoadingContainer>
                    ) : (
                        <>
                            <RecipientsInfo>
                                <RecipientCount>
                                    <FaUsers /> Liczba odbiorców: <strong>{selectedRecipients.length}</strong>
                                </RecipientCount>

                                <RecipientPreviewToggle onClick={() => setShowRecipientPreview(!showRecipientPreview)}>
                                    {showRecipientPreview ? 'Ukryj podgląd odbiorców' : 'Pokaż podgląd odbiorców'}
                                </RecipientPreviewToggle>
                            </RecipientsInfo>

                            {showRecipientPreview && recipientPreview.length > 0 && (
                                <RecipientPreviewList>
                                    {recipientPreview.map(client => (
                                        <RecipientPreviewItem key={client.id}>
                                            <RecipientName>
                                                {client.firstName} {client.lastName}
                                                {client.company && ` (${client.company})`}
                                            </RecipientName>
                                            <RecipientPhone>{client.phone}</RecipientPhone>
                                        </RecipientPreviewItem>
                                    ))}
                                    {selectedRecipients.length > 5 && (
                                        <RecipientPreviewMore>
                                            i {selectedRecipients.length - 5} więcej...
                                        </RecipientPreviewMore>
                                    )}
                                </RecipientPreviewList>
                            )}

                            {selectedRecipients.length === 0 && (
                                <NoRecipientsMessage>
                                    <FaExclamationTriangle /> Nie wybrano żadnych odbiorców. Użyj filtrów aby wybrać odbiorców kampanii.
                                </NoRecipientsMessage>
                            )}
                        </>
                    )}
                </FormSection>

                <StepActions>
                    <SecondaryButton onClick={goToPreviousStep}>
                        <FaArrowLeft /> Wstecz
                    </SecondaryButton>
                    <PrimaryButton onClick={goToNextStep} disabled={selectedRecipients.length === 0}>
                        Dalej <FaArrowRight />
                    </PrimaryButton>
                </StepActions>
            </StepContainer>
        );
    };
    // Renderowanie kroku 3 - Treść wiadomości
    const renderStep3 = () => {
        return (
            <StepContainer>
                <StepTitle>
                    <StepNumber>1</StepNumber>
                    <StepNumber>2</StepNumber>
                    <StepNumber active>3</StepNumber>
                    Treść wiadomości
                </StepTitle>

                <FormGroup>
                    <FormCheckboxWrapper>
                        <FormCheckbox
                            type="checkbox"
                            id="useTemplate"
                            checked={useTemplate}
                            onChange={handleUseTemplateChange}
                        />
                        <FormCheckboxLabel htmlFor="useTemplate">
                            Użyj szablonu wiadomości
                        </FormCheckboxLabel>
                    </FormCheckboxWrapper>
                </FormGroup>

                {useTemplate && (
                    <FormGroup>
                        <FormLabel>Wybierz szablon</FormLabel>
                        {loadingTemplates ? (
                            <LoadingContainer>
                                <LoadingSpinner />
                                <span>Ładowanie szablonów...</span>
                            </LoadingContainer>
                        ) : (
                            <FormSelect
                                name="templateId"
                                value={campaign.templateId || ''}
                                onChange={handleInputChange}
                            >
                                <option value="">Wybierz szablon...</option>
                                {templates.map(template => (
                                    <option key={template.id} value={template.id}>
                                        {template.name}
                                    </option>
                                ))}
                            </FormSelect>
                        )}

                        {selectedTemplate?.variables?.length > 0 && (
                            <TemplateVariablesInfo>
                                <VariablesTitle>Dostępne zmienne w szablonie:</VariablesTitle>
                                <VariablesList>
                                    {selectedTemplate.variables.map(variable => (
                                        <VariableItem key={variable}>
                                            <VariableCode>{`{{${variable}}}`}</VariableCode>
                                        </VariableItem>
                                    ))}
                                </VariablesList>
                                <VariablesHelp>
                                    Zmienne zostaną automatycznie zastąpione danymi każdego odbiorcy podczas wysyłki.
                                </VariablesHelp>
                            </TemplateVariablesInfo>
                        )}
                    </FormGroup>
                )}

                <FormGroup>
                    <FormLabel>Treść wiadomości SMS</FormLabel>
                    <FormTextarea
                        name="customContent"
                        value={campaign.customContent || ''}
                        onChange={handleInputChange}
                        placeholder="Wprowadź treść wiadomości..."
                        rows={5}
                        required
                    />

                    <CharacterCounter>
                        <div>
                            {countCharacters(campaign.customContent || '')} znaków
                        </div>
                        <div>
                            {getSmsCount(campaign.customContent || '')} {
                            getSmsCount(campaign.customContent || '') === 1
                                ? 'wiadomość SMS'
                                : getSmsCount(campaign.customContent || '') < 5
                                    ? 'wiadomości SMS'
                                    : 'wiadomości SMS'
                        } × {selectedRecipients.length} odbiorców = {
                            getSmsCount(campaign.customContent || '') * selectedRecipients.length
                        } SMS
                        </div>
                    </CharacterCounter>
                </FormGroup>

                <MessagePreviewBox>
                    <PreviewTitle>Podgląd wiadomości</PreviewTitle>
                    <PreviewContent>
                        {campaign.customContent || 'Brak treści'}
                    </PreviewContent>
                </MessagePreviewBox>

                <StepActions>
                    <SecondaryButton onClick={goToPreviousStep}>
                        <FaArrowLeft /> Wstecz
                    </SecondaryButton>
                    <PrimaryButton onClick={goToNextStep} disabled={!campaign.customContent}>
                        Dalej <FaArrowRight />
                    </PrimaryButton>
                </StepActions>
            </StepContainer>
        );
    };

    // Renderowanie kroku 4 - Harmonogram i podsumowanie
    const renderStep4 = () => {
        return (
            <StepContainer>
                <StepTitle>
                    <StepNumber>1</StepNumber>
                    <StepNumber>2</StepNumber>
                    <StepNumber>3</StepNumber>
                    <StepNumber active>4</StepNumber>
                    Harmonogram i podsumowanie
                </StepTitle>

                <FormSection>
                    <SectionTitle>Harmonogram wysyłki</SectionTitle>

                    <FormGroup>
                        <FormCheckboxWrapper>
                            <FormCheckbox
                                type="checkbox"
                                id="scheduleForLater"
                                checked={!scheduleNow}
                                onChange={handleScheduleChange}
                            />
                            <FormCheckboxLabel htmlFor="scheduleForLater">
                                Zaplanuj wysyłkę na później
                            </FormCheckboxLabel>
                        </FormCheckboxWrapper>
                    </FormGroup>

                    {!scheduleNow && (
                        <FormGroup>
                            <FormLabel>
                                <FaCalendarAlt style={{ marginRight: '8px' }} />
                                Data i godzina wysyłki
                            </FormLabel>
                            <FormInput
                                type="datetime-local"
                                name="scheduledDate"
                                value={campaign.scheduledDate || ''}
                                onChange={handleInputChange}
                                min={new Date().toISOString().slice(0, 16)}
                                required
                            />
                            <FormHelp>
                                Wiadomości zostaną wysłane automatycznie o wybranej porze.
                            </FormHelp>
                        </FormGroup>
                    )}
                </FormSection>

                <FormSection>
                    <SectionTitle>Podsumowanie kampanii</SectionTitle>

                    <SummaryGrid>
                        <SummaryItem>
                            <SummaryLabel>Nazwa kampanii</SummaryLabel>
                            <SummaryValue>{campaign.name}</SummaryValue>
                        </SummaryItem>

                        <SummaryItem>
                            <SummaryLabel>Liczba odbiorców</SummaryLabel>
                            <SummaryValue>{selectedRecipients.length}</SummaryValue>
                        </SummaryItem>

                        <SummaryItem>
                            <SummaryLabel>Liczba wiadomości</SummaryLabel>
                            <SummaryValue>
                                {getSmsCount(campaign.customContent || '') * selectedRecipients.length} SMS
                            </SummaryValue>
                        </SummaryItem>

                        <SummaryItem>
                            <SummaryLabel>Harmonogram</SummaryLabel>
                            <SummaryValue>
                                {scheduleNow
                                    ? 'Natychmiastowa wysyłka'
                                    : campaign.scheduledDate
                                        ? new Date(campaign.scheduledDate).toLocaleString('pl-PL')
                                        : 'Nie wybrano daty'
                                }
                            </SummaryValue>
                        </SummaryItem>

                        {campaign.description && (
                            <SummaryItem fullWidth>
                                <SummaryLabel>Opis</SummaryLabel>
                                <SummaryValue>{campaign.description}</SummaryValue>
                            </SummaryItem>
                        )}

                        <SummaryItem fullWidth>
                            <SummaryLabel>Treść wiadomości</SummaryLabel>
                            <SummaryContentBox>
                                {campaign.customContent}
                            </SummaryContentBox>
                        </SummaryItem>
                    </SummaryGrid>

                    <CostEstimation>
                        <CostTitle>Szacunkowy koszt kampanii</CostTitle>
                        <CostValue>
                            {getSmsCount(campaign.customContent || '') * selectedRecipients.length} SMS
                        </CostValue>
                    </CostEstimation>
                </FormSection>

                <StepActions>
                    <SecondaryButton onClick={goToPreviousStep}>
                        <FaArrowLeft /> Wstecz
                    </SecondaryButton>
                    <PrimaryButton
                        onClick={handleSave}
                        disabled={loading || (!scheduleNow && !campaign.scheduledDate)}
                    >
                        {loading ? (
                            <>
                                <LoadingSpinner />
                                {scheduleNow ? 'Uruchamianie...' : 'Zapisywanie...'}
                            </>
                        ) : (
                            <>
                                {scheduleNow ? <FaPlay /> : <FaCalendarAlt />}
                                {scheduleNow ? 'Uruchom kampanię' : 'Zaplanuj kampanię'}
                            </>
                        )}
                    </PrimaryButton>
                </StepActions>
            </StepContainer>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edytuj kampanię SMS' : 'Nowa kampania SMS'}
            size="lg"
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
                        <StepIndicatorLabel>Wybór odbiorców</StepIndicatorLabel>
                    </StepIndicator>

                    <StepConnector completed={currentStep > 2} />

                    <StepIndicator active={currentStep >= 3} completed={currentStep > 3}>
                        <StepIndicatorNumber>{currentStep > 3 ? <FaCheck /> : 3}</StepIndicatorNumber>
                        <StepIndicatorLabel>Treść</StepIndicatorLabel>
                    </StepIndicator>

                    <StepConnector completed={currentStep > 3} />

                    <StepIndicator active={currentStep >= 4}>
                        <StepIndicatorNumber>4</StepIndicatorNumber>
                        <StepIndicatorLabel>Harmonogram</StepIndicatorLabel>
                    </StepIndicator>
                </StepsIndicator>

                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
            </ModalContent>
        </Modal>
    );
};

// Styled components - część 1
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

const StepIndicatorNumber = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: #e9ecef;
    border-radius: 50%;
    font-size: 14px;
    color: #6c757d;
    
    ${({ theme, active, completed }) => (active || completed) && `
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

const CheckboxGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const FilterGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
`;

const ApplyFiltersButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    background-color: #f0f9ff;
    border: 1px solid #bee3f8;
    border-radius: 5px;
    color: #3498db;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background-color: #e3f2fd;
    }
`;// src/pages/SMS/components/modals/NewSmsCampaignModal.tsx - Część 8: Styled components 2
const RecipientsInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
`;

const RecipientCount = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #2c3e50;
`;

const RecipientPreviewToggle = styled.button`
    background: none;
    border: none;
    color: #3498db;
    font-size: 13px;
    cursor: pointer;
    
    &:hover {
        text-decoration: underline;
    }
`;

const RecipientPreviewList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
    padding: 12px;
    background-color: white;
    border: 1px solid #e9ecef;
    border-radius: 5px;
`;

const RecipientPreviewItem = styled.div`
    padding: 8px 0;
    border-bottom: 1px solid #f1f3f5;
    
    &:last-child {
        border-bottom: none;
    }
`;

const RecipientName = styled.div`
    font-weight: 500;
    color: #2c3e50;
`;

const RecipientPhone = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

const RecipientPreviewMore = styled.div`
    text-align: center;
    font-size: 13px;
    color: #6c757d;
    padding: 8px 0;
`;

const NoRecipientsMessage = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background-color: #fff8e6;
    border: 1px solid #ffeeba;
    border-radius: 5px;
    color: #856404;
    font-size: 14px;
`;

const CharacterCounter = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #6c757d;
    margin-top: 8px;
`;

const TemplateVariablesInfo = styled.div`
    margin-top: 8px;
    padding: 10px 12px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 5px;
`;

const VariablesTitle = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: #495057;
    margin-bottom: 8px;
`;

const VariablesList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
`;

const VariableItem = styled.div`
    display: inline-block;
`;

const VariableCode = styled.code`
    padding: 2px 6px;
    background-color: #e9ecef;
    border-radius: 3px;
    font-family: monospace;
    font-size: 12px;
    color: #e74c3c;
`;

const VariablesHelp = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

const MessagePreviewBox = styled.div`
    margin-top: 8px;
    padding: 12px 16px;
    background-color: #f0f9ff;
    border: 1px solid #bee3f8;
    border-radius: 5px;
`;

const PreviewTitle = styled.div`
    font-weight: 500;
    color: #3498db;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &::before {
        content: '';
        display: inline-block;
        width: 8px;
        height: 8px;
        background-color: #3498db;
        border-radius: 50%;
    }
`;

const PreviewContent = styled.div`
    font-size: 14px;
    line-height: 1.5;
    color: #2c3e50;
    white-space: pre-wrap;
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

const SummaryContentBox = styled.div`
    padding: 12px;
    background-color: white;
    border: 1px solid #e9ecef;
    border-radius: 5px;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
`;

const CostEstimation = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    padding: 12px 16px;
    background-color: #f0f9ff;
    border: 1px solid #bee3f8;
    border-radius: 5px;
`;

const CostTitle = styled.div`
    font-weight: 500;
    color: #3498db;
`;

const CostValue = styled.div`
    font-weight: 600;
    color: #2c3e50;
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


export default NewSmsCampaignModal;