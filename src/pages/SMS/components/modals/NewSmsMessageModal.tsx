// src/pages/SMS/components/modals/NewSmsMessageModal.tsx
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {
    FaCalendarAlt,
    FaCar,
    FaEnvelope,
    FaHistory,
    FaPhone,
    FaPlus,
    FaSearch,
    FaTimes,
    FaUser,
    FaUserFriends
} from 'react-icons/fa';
import Modal from '../../../../components/common/Modal';
import {smsApi} from '../../../../api/smsApi';
import {SmsMessage, SmsTemplate} from '../../../../types/sms';
import {clientApi} from '../../../../api/clientsApi';
import {ClientExpanded} from '../../../../types/client';
import {useToast} from '../../../../components/common/Toast/Toast';

interface NewSmsMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (message: SmsMessage) => void;
    initialRecipientId?: string;
}

const NewSmsMessageModal: React.FC<NewSmsMessageModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   onSend,
                                                                   initialRecipientId
                                                               }) => {
    const { showToast } = useToast();

    // Stan dla danych formularza
    const [messageData, setMessageData] = useState({
        recipientId: initialRecipientId || '',
        content: '',
        scheduledDate: '',
        templateId: '',
        useTemplate: false
    });

    // Stan dla zaawansowanych opcji
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [scheduleMessage, setScheduleMessage] = useState(false);

    // Stan dla wyszukiwania klientów
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ClientExpanded[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedClient, setSelectedClient] = useState<ClientExpanded | null>(null);

    // Stan dla szablonów
    const [templates, setTemplates] = useState<SmsTemplate[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplate | null>(null);

    // Stan dla ładowania i wysyłania
    const [sending, setSending] = useState(false);

    // Pobierz dane klienta jeśli jest podany initialRecipientId
    useEffect(() => {
        if (initialRecipientId && isOpen) {
            fetchClientById(initialRecipientId);
        }
    }, [initialRecipientId, isOpen]);

    // Pobierz szablony przy otwarciu modalu
    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
        }
    }, [isOpen]);

    // Reset formularza przy zamknięciu
    useEffect(() => {
        if (!isOpen) {
            setMessageData({
                recipientId: '',
                content: '',
                scheduledDate: '',
                templateId: '',
                useTemplate: false
            });
            setSelectedClient(null);
            setSelectedTemplate(null);
            setScheduleMessage(false);
            setShowAdvancedOptions(false);
        }
    }, [isOpen]);

    // Pobieranie danych klienta po ID
    const fetchClientById = async (id: string) => {
        try {
            const client = await clientApi.fetchClientById(id);
            if (client) {
                setSelectedClient(client);
                setMessageData(prev => ({
                    ...prev,
                    recipientId: id
                }));
            }
        } catch (error) {
            console.error('Error fetching client:', error);
        }
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

    // Wyszukiwanie klientów
    const searchClients = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        try {
            setSearchLoading(true);
            // W prawdziwej implementacji byłoby API do wyszukiwania
            // Tutaj użyjemy fetchClients i filtrowanie ręczne dla uproszczenia
            const clients = await clientApi.fetchClients();
            const filtered = clients.filter(client =>
                client.firstName.toLowerCase().includes(query.toLowerCase()) ||
                client.lastName.toLowerCase().includes(query.toLowerCase()) ||
                client.phone.includes(query)
            );
            setSearchResults(filtered);
            setShowSearchResults(true);
            setSearchLoading(false);
        } catch (error) {
            console.error('Error searching clients:', error);
            setSearchLoading(false);
        }
    };

    // Obsługa zmiany pól formularza
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setMessageData(prev => ({
            ...prev,
            [name]: value
        }));

        // Jeśli zmieniono szablon, pobierz jego zawartość
        if (name === 'templateId' && value) {
            const template = templates.find(t => t.id === value);
            if (template) {
                setSelectedTemplate(template);
                setMessageData(prev => ({
                    ...prev,
                    content: template.content
                }));
            } else {
                setSelectedTemplate(null);
            }
        }
    };

    // Obsługa wyszukiwania
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        searchClients(query);
    };

    // Wybór klienta z wyników wyszukiwania
    const handleSelectClient = (client: ClientExpanded) => {
        setSelectedClient(client);
        setMessageData(prev => ({
            ...prev,
            recipientId: client.id
        }));
        setSearchQuery('');
        setShowSearchResults(false);
    };

    // Obsługa zmiany opcji harmonogramu
    const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setScheduleMessage(e.target.checked);

        // Jeśli włączono harmonogram, ustaw domyślną datę (jutro)
        if (e.target.checked && !messageData.scheduledDate) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);
            setMessageData(prev => ({
                ...prev,
                scheduledDate: tomorrow.toISOString().slice(0, 16)
            }));
        }
    };

    // Obsługa zmiany opcji szablonu
    const handleUseTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const useTemplate = e.target.checked;
        setMessageData(prev => ({
            ...prev,
            useTemplate,
            // Jeśli wyłączono opcję szablonu, wyczyść powiązane pola
            ...(useTemplate ? {} : { templateId: '', content: '' })
        }));
    };

    // Walidacja formularza przed wysyłką
    const validateForm = (): boolean => {
        if (!messageData.recipientId) {
            showToast('error', 'Wybierz odbiorcę wiadomości', 3000);
            return false;
        }

        if (!messageData.content) {
            showToast('error', 'Treść wiadomości nie może być pusta', 3000);
            return false;
        }

        if (scheduleMessage && !messageData.scheduledDate) {
            showToast('error', 'Wybierz datę i godzinę wysyłki', 3000);
            return false;
        }

        return true;
    };

    // Wysyłanie wiadomości
    const handleSend = async () => {
        if (!validateForm()) return;

        try {
            setSending(true);

            // Przygotuj dane do wysyłki
            const smsData = {
                recipientId: messageData.recipientId,
                content: messageData.content,
                scheduledDate: scheduleMessage ? messageData.scheduledDate : undefined,
                templateId: messageData.useTemplate ? messageData.templateId : undefined
            };

            const message = await smsApi.sendMessage(
                smsData.recipientId,
                smsData.content,
                smsData.scheduledDate
            );

            onSend(message);
            showToast('success', scheduleMessage
                ? 'Wiadomość została zaplanowana'
                : 'Wiadomość została wysłana', 3000);
            onClose();
        } catch (error) {
            console.error('Error sending message:', error);
            showToast('error', 'Nie udało się wysłać wiadomości', 3000);
        } finally {
            setSending(false);
        }
    };

    // Liczenie znaków w treści
    const countCharacters = (text: string) => {
        return text.length;
    };

    // Liczba SMS-ów potrzebnych do wysłania
    const getSmsCount = (text: string) => {
        const length = countCharacters(text);
        if (length <= 160) return 1;
        return Math.ceil(length / 153); // 153 znaki dla kolejnych części wiadomości wieloczęściowej
    };

    // Renderowanie zmiennych z szablonu
    const renderTemplateVariables = () => {
        if (!selectedTemplate?.variables?.length) return null;

        return (
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
                    Zmienne zostaną automatycznie zastąpione danymi odbiorcy podczas wysyłki.
                </VariablesHelp>
            </TemplateVariablesInfo>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nowa wiadomość SMS"
        >
            <ModalContent>
                <FormSection>
                    <SectionTitle>Odbiorca</SectionTitle>

                    <FormGroup>
                        <FormLabel>Wyszukaj klienta</FormLabel>
                        <SearchContainer>
                            <SearchInput
                                type="text"
                                placeholder="Wyszukaj po nazwisku, imieniu lub numerze telefonu..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={() => setShowSearchResults(true)}
                            />
                            <SearchIcon>
                                <FaSearch />
                            </SearchIcon>
                        </SearchContainer>

                        {showSearchResults && searchResults.length > 0 && (
                            <SearchResultsDropdown>
                                {searchLoading ? (
                                    <LoadingItem>
                                        <LoadingSpinner />
                                        <span>Szukanie...</span>
                                    </LoadingItem>
                                ) : (
                                    searchResults.map(client => (
                                        <SearchResultItem
                                            key={client.id}
                                            onClick={() => handleSelectClient(client)}
                                        >
                                            <ClientName>
                                                {client.firstName} {client.lastName}
                                                {client.company && ` (${client.company})`}
                                            </ClientName>
                                            <ClientPhone>{client.phone}</ClientPhone>
                                        </SearchResultItem>
                                    ))
                                )}
                            </SearchResultsDropdown>
                        )}
                    </FormGroup>

                    {selectedClient && (
                        <SelectedClientCard>
                            <ClientDetails>
                                <ClientDetailHeader>
                                    <ClientIcon>
                                        <FaUser />
                                    </ClientIcon>
                                    <ClientNameBig>
                                        {selectedClient.firstName} {selectedClient.lastName}
                                    </ClientNameBig>
                                </ClientDetailHeader>

                                <ClientDetail>
                                    <FaPhone style={{ marginRight: '8px' }} />
                                    {selectedClient.phone}
                                </ClientDetail>

                                {selectedClient.company && (
                                    <ClientDetail>
                                        <FaUserFriends style={{ marginRight: '8px' }} />
                                        {selectedClient.company}
                                    </ClientDetail>
                                )}

                                <ClientDetail>
                                    <FaCar style={{ marginRight: '8px' }} />
                                    {selectedClient.vehicles.length} {
                                    selectedClient.vehicles.length === 1
                                        ? 'pojazd'
                                        : selectedClient.vehicles.length < 5
                                            ? 'pojazdy'
                                            : 'pojazdów'
                                }
                                </ClientDetail>

                                <ClientDetail>
                                    <FaHistory style={{ marginRight: '8px' }} />
                                    {selectedClient.totalVisits} {
                                    selectedClient.totalVisits === 1
                                        ? 'wizyta'
                                        : selectedClient.totalVisits < 5
                                            ? 'wizyty'
                                            : 'wizyt'
                                }
                                </ClientDetail>
                            </ClientDetails>

                            <RemoveClientButton onClick={() => {
                                setSelectedClient(null);
                                setMessageData(prev => ({
                                    ...prev,
                                    recipientId: ''
                                }));
                            }}>
                                <FaTimes />
                            </RemoveClientButton>
                        </SelectedClientCard>
                    )}
                </FormSection>

                <FormSection>
                    <SectionTitle>Treść wiadomości</SectionTitle>

                    <FormGroup>
                        <FormCheckboxWrapper>
                            <FormCheckbox
                                type="checkbox"
                                id="useTemplate"
                                checked={messageData.useTemplate}
                                onChange={handleUseTemplateChange}
                            />
                            <FormCheckboxLabel htmlFor="useTemplate">
                                Użyj szablonu wiadomości
                            </FormCheckboxLabel>
                        </FormCheckboxWrapper>
                    </FormGroup>

                    {messageData.useTemplate && (
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
                                    value={messageData.templateId}
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

                            {renderTemplateVariables()}
                        </FormGroup>
                    )}

                    <FormGroup>
                        <FormLabel>Treść SMS</FormLabel>
                        <FormTextarea
                            name="content"
                            value={messageData.content}
                            onChange={handleInputChange}
                            placeholder="Wprowadź treść wiadomości..."
                            rows={5}
                            required
                        />

                        <CharacterCounter>
                            <div>
                                {countCharacters(messageData.content)} znaków
                            </div>
                            <div>
                                {getSmsCount(messageData.content)} {
                                getSmsCount(messageData.content) === 1
                                    ? 'wiadomość SMS'
                                    : getSmsCount(messageData.content) < 5
                                        ? 'wiadomości SMS'
                                        : 'wiadomości SMS'
                            }
                            </div>
                        </CharacterCounter>
                    </FormGroup>
                </FormSection>

                <FormSection>
                    <SectionTitle>
                        <SectionTitleWithToggle onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
                            Opcje zaawansowane
                            <ToggleIndicator>
                                {showAdvancedOptions ? <FaTimes /> : <FaPlus />}
                            </ToggleIndicator>
                        </SectionTitleWithToggle>
                    </SectionTitle>

                    {showAdvancedOptions && (
                        <>
                            <FormGroup>
                                <FormCheckboxWrapper>
                                    <FormCheckbox
                                        type="checkbox"
                                        id="scheduleMessage"
                                        checked={scheduleMessage}
                                        onChange={handleScheduleChange}
                                    />
                                    <FormCheckboxLabel htmlFor="scheduleMessage">
                                        Zaplanuj wysyłkę na później
                                    </FormCheckboxLabel>
                                </FormCheckboxWrapper>
                            </FormGroup>

                            {scheduleMessage && (
                                <FormGroup>
                                    <FormLabel>
                                        <FaCalendarAlt style={{ marginRight: '8px' }} />
                                        Data i godzina wysyłki
                                    </FormLabel>
                                    <FormInput
                                        type="datetime-local"
                                        name="scheduledDate"
                                        value={messageData.scheduledDate}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                    <FormHelp>
                                        Wiadomość zostanie wysłana automatycznie o wybranej porze.
                                    </FormHelp>
                                </FormGroup>
                            )}
                        </>
                    )}
                </FormSection>

                <ModalActions>
                    <SecondaryButton onClick={onClose} disabled={sending}>
                        <FaTimes /> Anuluj
                    </SecondaryButton>
                    <PrimaryButton onClick={handleSend} disabled={sending}>
                        {sending ? (
                            <>
                                <LoadingSpinner />
                                {scheduleMessage ? 'Planowanie...' : 'Wysyłanie...'}
                            </>
                        ) : (
                            <>
                                <FaEnvelope />
                                {scheduleMessage ? 'Zaplanuj wiadomość' : 'Wyślij wiadomość'}
                            </>
                        )}
                    </PrimaryButton>
                </ModalActions>
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

const FormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #f1f3f5;
`;

const SectionTitleWithToggle = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    
    &:hover {
        color: #3498db;
    }
`;

const ToggleIndicator = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background-color: #f8f9fa;
    border-radius: 50%;
    color: #6c757d;
    
    &:hover {
        background-color: #e9ecef;
        color: #3498db;
    }
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

const SearchContainer = styled.div`
    position: relative;
`;

const SearchInput = styled(FormInput)`
    padding-right: 40px;
`;

const SearchIcon = styled.div`
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
`;

const SearchResultsDropdown = styled.div`
    position: absolute;
    z-index: 100;
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    background-color: white;
    border: 1px solid #ced4da;
    border-radius: 0 0 5px 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const SearchResultItem = styled.div`
    padding: 10px 12px;
    cursor: pointer;
    border-bottom: 1px solid #f1f3f5;
    transition: background-color 0.2s;
    
    &:last-child {
        border-bottom: none;
    }
    
    &:hover {
        background-color: #f8f9fa;
    }
`;

const LoadingItem = styled.div`
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #6c757d;
`;

const ClientName = styled.div`
    font-weight: 500;
    color: #2c3e50;
`;

const ClientPhone = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

const SelectedClientCard = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px 16px;
    background-color: #f0f9ff;
    border: 1px solid #bee3f8;
    border-radius: 5px;
`;

const ClientDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const ClientDetailHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
`;

const ClientIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background-color: #3498db;
    color: white;
    border-radius: 50%;
`;

const ClientNameBig = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
`;

const ClientDetail = styled.div`
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #4a5568;
`;

const RemoveClientButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 50%;
    color: #6c757d;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background-color: #fee2e2;
        color: #e53e3e;
        border-color: #fed7d7;
    }
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

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
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

export default NewSmsMessageModal;