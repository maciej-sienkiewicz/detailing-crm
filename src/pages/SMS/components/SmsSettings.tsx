// src/pages/SMS/components/SmsSettings.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaCog,
    FaSave,
    FaSync,
    FaKey,
    FaUser,
    FaBell,
    FaCheck,
    FaInfoCircle,
    FaQuestionCircle,
    FaTimes,
    FaLock,
    FaUnlock,
    FaGlobe,
    FaMobileAlt,
    FaPhone,
    FaShieldAlt,
    FaEnvelope,
    FaSignature,
    FaExclamationCircle
} from 'react-icons/fa';
import { useToast } from '../../../components/common/Toast/Toast';

// Interfejs dla ustawień SMS
interface SmsSettings {
    apiKey: string;
    sender: string;
    senderType: 'alpha' | 'numeric';
    maxLengthPerMessage: number;
    maxMessagesPerDay: number;
    maxMessagesPerMonth: number;
    countryCode: string;
    defaultCountryCode: string;
    deliveryReports: boolean;
    blacklistEnabled: boolean;
    blacklistedNumbers: string[];
    notifyOnFailure: boolean;
    notifyEmail: string;
    autoRetry: boolean;
    autoRetryCount: number;
    autoRetryDelayMinutes: number;
    signature: string;
    testMode: boolean;
}

export const SmsSettings: React.FC = () => {
    const { showToast } = useToast();

    // Stan dla ustawień
    const [settings, setSettings] = useState<SmsSettings>({
        apiKey: '************************',
        sender: 'AutoDetailing',
        senderType: 'alpha',
        maxLengthPerMessage: 160,
        maxMessagesPerDay: 500,
        maxMessagesPerMonth: 10000,
        countryCode: 'PL',
        defaultCountryCode: '+48',
        deliveryReports: true,
        blacklistEnabled: false,
        blacklistedNumbers: [],
        notifyOnFailure: true,
        notifyEmail: 'admin@example.com',
        autoRetry: true,
        autoRetryCount: 3,
        autoRetryDelayMinutes: 15,
        signature: '',
        testMode: false
    });

    // Stan edytora
    const [editMode, setEditMode] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [editedSettings, setEditedSettings] = useState<SmsSettings>(settings);

    // Stan testowej wiadomości
    const [testMessage, setTestMessage] = useState({
        phoneNumber: '',
        content: 'To jest testowa wiadomość SMS z CRM detailingowego.'
    });
    const [showTestMessagePanel, setShowTestMessagePanel] = useState(false);
    const [sendingTest, setSendingTest] = useState(false);

    // Lista krajów do wyboru (przykład)
    const countries = [
        { code: 'PL', name: 'Polska', prefix: '+48' },
        { code: 'DE', name: 'Niemcy', prefix: '+49' },
        { code: 'GB', name: 'Wielka Brytania', prefix: '+44' },
        { code: 'FR', name: 'Francja', prefix: '+33' },
        { code: 'IT', name: 'Włochy', prefix: '+39' },
        { code: 'ES', name: 'Hiszpania', prefix: '+34' },
        { code: 'CZ', name: 'Czechy', prefix: '+420' },
        { code: 'SK', name: 'Słowacja', prefix: '+421' }
    ];

    // Włączanie trybu edycji
    const handleEditModeToggle = () => {
        if (editMode) {
            // Jeśli wyłączamy tryb edycji, anulujemy zmiany
            setEditedSettings(settings);
        }
        setEditMode(!editMode);
    };

    // Obsługa zmiany pól formularza
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setEditedSettings(prev => ({
                ...prev,
                [name]: checked
            }));
        } else if (type === 'number') {
            const numValue = parseInt(value, 10);
            setEditedSettings(prev => ({
                ...prev,
                [name]: isNaN(numValue) ? 0 : numValue
            }));
        } else {
            setEditedSettings(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Symulacja zapisywania ustawień
    const handleSaveSettings = () => {
        // W rzeczywistej implementacji, tutaj byłoby wywołanie API
        setSettings(editedSettings);
        setEditMode(false);
        showToast('success', 'Ustawienia zostały zapisane', 3000);
    };

    // Przełączanie widoczności klucza API
    const toggleApiKeyVisibility = () => {
        setShowApiKey(!showApiKey);
    };

    // Obsługa zmiany typu nadawcy
    const handleSenderTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedSettings(prev => ({
            ...prev,
            senderType: e.target.value as 'alpha' | 'numeric'
        }));
    };

    // Obsługa wysyłki testowej wiadomości
    const handleTestMessageInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTestMessage(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Symulacja wysyłki testowej wiadomości
    const handleSendTestMessage = () => {
        if (!testMessage.phoneNumber) {
            showToast('error', 'Podaj numer telefonu', 3000);
            return;
        }

        if (!testMessage.content) {
            showToast('error', 'Podaj treść wiadomości', 3000);
            return;
        }

        setSendingTest(true);

        // Symulacja opóźnienia
        setTimeout(() => {
            setSendingTest(false);
            showToast('success', `Wysłano testową wiadomość na numer ${testMessage.phoneNumber}`, 3000);
        }, 1500);
    };

    // Aktualizacja strony
    const handleRefreshPage = () => {
        window.location.reload();
    };

    return (
        <Container>
            <PageHeader>
                <PageTitle>
                    <FaCog style={{ marginRight: '10px' }} />
                    Ustawienia SMS
                </PageTitle>
                <HeaderActions>
                    {editMode ? (
                        <>
                            <SecondaryButton onClick={handleEditModeToggle}>
                                <FaTimes /> Anuluj
                            </SecondaryButton>
                            <PrimaryButton onClick={handleSaveSettings}>
                                <FaSave /> Zapisz
                            </PrimaryButton>
                        </>
                    ) : (
                        <>
                            <SecondaryButton onClick={handleRefreshPage}>
                                <FaSync /> Odśwież
                            </SecondaryButton>
                            <PrimaryButton onClick={handleEditModeToggle}>
                                <FaCog /> Edytuj
                            </PrimaryButton>
                        </>
                    )}
                </HeaderActions>
            </PageHeader>

            <InfoBar>
                <InfoIcon>
                    <FaInfoCircle />
                </InfoIcon>
                <InfoText>
                    Konfiguracja bramki SMS dla powiadomień, kampanii oraz automatyzacji.
                    Zmiany w ustawieniach dostawcy SMS mogą wymagać ponownego uruchomienia usługi.
                </InfoText>
            </InfoBar>

            <SettingsGrid>
                {/* Sekcja podstawowych ustawień */}
                <SettingsSection>
                    <SectionTitle>Podstawowa konfiguracja</SectionTitle>

                    <FormGroup>
                        <FormLabel>
                            <FaKey style={{ marginRight: '8px' }} />
                            Klucz API
                        </FormLabel>
                        <ApiKeyContainer>
                            <ApiKeyInput
                                type={showApiKey ? 'text' : 'password'}
                                name="apiKey"
                                value={editMode ? editedSettings.apiKey : settings.apiKey}
                                onChange={handleInputChange}
                                disabled={!editMode}
                            />
                            <ApiKeyToggle onClick={toggleApiKeyVisibility}>
                                {showApiKey ? <FaUnlock /> : <FaLock />}
                            </ApiKeyToggle>
                        </ApiKeyContainer>
                        <FormHelp>
                            Klucz API dostawcy usług SMS. Nie udostępniaj tego klucza innym osobom.
                        </FormHelp>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>
                            <FaSignature style={{ marginRight: '8px' }} />
                            Nadawca (Sender ID)
                        </FormLabel>
                        <FormInput
                            type="text"
                            name="sender"
                            value={editMode ? editedSettings.sender : settings.sender}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            maxLength={11} // Alfanumeryczny ID nadawcy zwykle ma limit do 11 znaków
                        />
                        <FormHelp>
                            Nazwa lub numer, który będzie wyświetlany jako nadawca wiadomości.
                        </FormHelp>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Typ nadawcy</FormLabel>
                        <RadioGroup>
                            <RadioOption>
                                <RadioInput
                                    type="radio"
                                    name="senderType"
                                    value="alpha"
                                    checked={editMode ? editedSettings.senderType === 'alpha' : settings.senderType === 'alpha'}
                                    onChange={handleSenderTypeChange}
                                    disabled={!editMode}
                                    id="senderTypeAlpha"
                                />
                                <RadioLabel htmlFor="senderTypeAlpha">
                                    Alfanumeryczny (nazwa)
                                </RadioLabel>
                            </RadioOption>
                            <RadioOption>
                                <RadioInput
                                    type="radio"
                                    name="senderType"
                                    value="numeric"
                                    checked={editMode ? editedSettings.senderType === 'numeric' : settings.senderType === 'numeric'}
                                    onChange={handleSenderTypeChange}
                                    disabled={!editMode}
                                    id="senderTypeNumeric"
                                />
                                <RadioLabel htmlFor="senderTypeNumeric">
                                    Numeryczny (numer telefonu)
                                </RadioLabel>
                            </RadioOption>
                        </RadioGroup>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>
                            <FaGlobe style={{ marginRight: '8px' }} />
                            Kraj domyślny
                        </FormLabel>
                        <FormSelect
                            name="countryCode"
                            value={editMode ? editedSettings.countryCode : settings.countryCode}
                            onChange={handleInputChange}
                            disabled={!editMode}
                        >
                            {countries.map(country => (
                                <option key={country.code} value={country.code}>
                                    {country.name} ({country.prefix})
                                </option>
                            ))}
                        </FormSelect>
                        <FormHelp>
                            Domyślny kraj dla numerów bez kodu kraju.
                        </FormHelp>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>
                            <FaMobileAlt style={{ marginRight: '8px' }} />
                            Domyślny prefiks
                        </FormLabel>
                        <FormInput
                            type="text"
                            name="defaultCountryCode"
                            value={editMode ? editedSettings.defaultCountryCode : settings.defaultCountryCode}
                            onChange={handleInputChange}
                            disabled={!editMode}
                        />
                        <FormHelp>
                            Prefiks dodawany automatycznie do numerów bez kodu kraju.
                        </FormHelp>
                    </FormGroup>
                </SettingsSection>

                {/* Sekcja limitów i opcji zaawansowanych */}
                <SettingsSection>
                    <SectionTitle>Limity i opcje zaawansowane</SectionTitle>

                    <FormGroup>
                        <FormLabel>
                            <FaBell style={{ marginRight: '8px' }} />
                            Powiadomienia o błędach
                        </FormLabel>
                        <CheckboxGroup>
                            <Checkbox
                                type="checkbox"
                                name="notifyOnFailure"
                                checked={editMode ? editedSettings.notifyOnFailure : settings.notifyOnFailure}
                                onChange={(e) => setEditedSettings(prev => ({ ...prev, notifyOnFailure: e.target.checked }))}
                                disabled={!editMode}
                                id="notifyOnFailure"
                            />
                            <CheckboxLabel htmlFor="notifyOnFailure">
                                Wysyłaj powiadomienia email o nieudanych wiadomościach
                            </CheckboxLabel>
                        </CheckboxGroup>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>
                            <FaEnvelope style={{ marginRight: '8px' }} />
                            Email do powiadomień
                        </FormLabel>
                        <FormInput
                            type="email"
                            name="notifyEmail"
                            value={editMode ? editedSettings.notifyEmail : settings.notifyEmail}
                            onChange={handleInputChange}
                            disabled={!editMode || !editedSettings.notifyOnFailure}
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>
                            <FaSync style={{ marginRight: '8px' }} />
                            Automatyczne ponowne próby
                        </FormLabel>
                        <CheckboxGroup>
                            <Checkbox
                                type="checkbox"
                                name="autoRetry"
                                checked={editMode ? editedSettings.autoRetry : settings.autoRetry}
                                onChange={(e) => setEditedSettings(prev => ({ ...prev, autoRetry: e.target.checked }))}
                                disabled={!editMode}
                                id="autoRetry"
                            />
                            <CheckboxLabel htmlFor="autoRetry">
                                Automatycznie ponawiaj nieudane wiadomości
                            </CheckboxLabel>
                        </CheckboxGroup>
                    </FormGroup>

                    {(editMode ? editedSettings.autoRetry : settings.autoRetry) && (
                        <FormRow>
                            <FormColumn>
                                <FormLabel>Liczba prób</FormLabel>
                                <FormInput
                                    type="number"
                                    name="autoRetryCount"
                                    min="1"
                                    max="10"
                                    value={editMode ? editedSettings.autoRetryCount : settings.autoRetryCount}
                                    onChange={handleInputChange}
                                    disabled={!editMode}
                                />
                            </FormColumn>
                            <FormColumn>
                                <FormLabel>Opóźnienie (min)</FormLabel>
                                <FormInput
                                    type="number"
                                    name="autoRetryDelayMinutes"
                                    min="1"
                                    max="60"
                                    value={editMode ? editedSettings.autoRetryDelayMinutes : settings.autoRetryDelayMinutes}
                                    onChange={handleInputChange}
                                    disabled={!editMode}
                                />
                            </FormColumn>
                        </FormRow>
                    )}

                    <FormGroup>
                        <FormLabel>
                            <FaShieldAlt style={{ marginRight: '8px' }} />
                            Czarna lista numerów
                        </FormLabel>
                        <CheckboxGroup>
                            <Checkbox
                                type="checkbox"
                                name="blacklistEnabled"
                                checked={editMode ? editedSettings.blacklistEnabled : settings.blacklistEnabled}
                                onChange={(e) => setEditedSettings(prev => ({ ...prev, blacklistEnabled: e.target.checked }))}
                                disabled={!editMode}
                                id="blacklistEnabled"
                            />
                            <CheckboxLabel htmlFor="blacklistEnabled">
                                Aktywuj blokowanie numerów z czarnej listy
                            </CheckboxLabel>
                        </CheckboxGroup>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Stopka wiadomości</FormLabel>
                        <FormTextarea
                            name="signature"
                            value={editMode ? editedSettings.signature : settings.signature}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            placeholder="np. Pozdrawiamy, Zespół Detailing"
                            rows={2}
                        />
                        <FormHelp>
                            Opcjonalna stopka dodawana do każdej wiadomości SMS.
                        </FormHelp>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>
                            <FaExclamationCircle style={{ marginRight: '8px' }} />
                            Tryb testowy
                        </FormLabel>
                        <CheckboxGroup>
                            <Checkbox
                                type="checkbox"
                                name="testMode"
                                checked={editMode ? editedSettings.testMode : settings.testMode}
                                onChange={(e) => setEditedSettings(prev => ({ ...prev, testMode: e.target.checked }))}
                                disabled={!editMode}
                                id="testMode"
                            />
                            <CheckboxLabel htmlFor="testMode">
                                Włącz tryb testowy (wiadomości nie są wysyłane, tylko logowane)
                            </CheckboxLabel>
                        </CheckboxGroup>
                    </FormGroup>
                </SettingsSection>
            </SettingsGrid>

            <SettingsFooter>
                <TestMessageButton
                    onClick={() => setShowTestMessagePanel(!showTestMessagePanel)}
                    $isOpen={showTestMessagePanel}
                >
                    <FaPhone style={{ marginRight: '8px' }} />
                    {showTestMessagePanel ? 'Ukryj panel testowy' : 'Wyślij wiadomość testową'}
                </TestMessageButton>
            </SettingsFooter>

            {showTestMessagePanel && (
                <TestPanel>
                    <TestPanelTitle>
                        Wysyłka wiadomości testowej
                    </TestPanelTitle>

                    <FormGroup>
                        <FormLabel>Numer telefonu</FormLabel>
                        <FormInput
                            type="text"
                            name="phoneNumber"
                            value={testMessage.phoneNumber}
                            onChange={handleTestMessageInputChange}
                            placeholder="np. +48123456789"
                            disabled={sendingTest}
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Treść wiadomości</FormLabel>
                        <FormTextarea
                            name="content"
                            value={testMessage.content}
                            onChange={handleTestMessageInputChange}
                            placeholder="Wpisz treść wiadomości testowej..."
                            rows={3}
                            disabled={sendingTest}
                        />
                        <CharCounter>
                            {testMessage.content.length} / 160 znaków
                        </CharCounter>
                    </FormGroup>

                    <TestActionButtons>
                        <SecondaryButton
                            onClick={() => setShowTestMessagePanel(false)}
                            disabled={sendingTest}
                        >
                            Anuluj
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={handleSendTestMessage}
                            disabled={sendingTest}
                        >
                            {sendingTest ? (
                                <>
                                    <LoadingSpinner />
                                    Wysyłanie...
                                </>
                            ) : (
                                <>
                                    <FaPhone style={{ marginRight: '5px' }} />
                                    Wyślij test
                                </>
                            )}
                        </PrimaryButton>
                    </TestActionButtons>
                </TestPanel>
            )}
        </Container>
    );
};

// Styled components
const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const PageTitle = styled.h1`
    font-size: 24px;
    display: flex;
    align-items: center;
    color: #2c3e50;
    margin: 0;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 10px;
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const PrimaryButton = styled(Button)`
    background-color: #3498db;
    border: 1px solid #3498db;
    color: white;
    
    &:hover:not(:disabled) {
        background-color: #2980b9;
        border-color: #2980b9;
    }
`;

const SecondaryButton = styled(Button)`
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    color: #495057;
    
    &:hover:not(:disabled) {
        background-color: #e9ecef;
    }
`;

const InfoBar = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background-color: #e3f2fd;
    border: 1px solid #90cdf4;
    border-radius: 4px;
    color: #2c5282;
`;

const InfoIcon = styled.div`
    margin-right: 12px;
    display: flex;
    align-items: center;
    font-size: 18px;
`;

const InfoText = styled.div`
    font-size: 14px;
    line-height: 1.5;
`;

const SettingsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
`;

const SettingsSection = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    padding: 20px;
    border: 1px solid #e9ecef;
`;

const SectionTitle = styled.h2`
    font-size: 16px;
    margin: 0 0 20px 0;
    color: #2c3e50;
    padding-bottom: 10px;
    border-bottom: 1px solid #e9ecef;
`;

const FormGroup = styled.div`
    margin-bottom: 16px;
`;

const FormLabel = styled.label`
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 6px;
`;

const FormInput = styled.input`
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.2s;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
    
    &:disabled {
        background-color: #f8f9fa;
        cursor: not-allowed;
    }
`;

const FormSelect = styled.select`
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.2s;
    background-color: white;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
    
    &:disabled {
        background-color: #f8f9fa;
        cursor: not-allowed;
    }
`;

const FormTextarea = styled.textarea`
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.2s;
    resize: vertical;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
    
    &:disabled {
        background-color: #f8f9fa;
        cursor: not-allowed;
    }
`;

const FormHelp = styled.div`
    font-size: 12px;
    color: #6c757d;
    margin-top: 4px;
`;

const ApiKeyContainer = styled.div`
    position: relative;
`;

const ApiKeyInput = styled(FormInput)`
    padding-right: 40px;
`;

const ApiKeyToggle = styled.button`
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    
    &:hover {
        color: #343a40;
    }
`;

const RadioGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const RadioOption = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const RadioInput = styled.input`
    cursor: pointer;
    
    &:disabled {
        cursor: not-allowed;
    }
`;

const RadioLabel = styled.label`
    font-size: 14px;
    color: #2c3e50;
    cursor: pointer;
`;

const CheckboxGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const Checkbox = styled.input`
    cursor: pointer;
    
    &:disabled {
        cursor: not-allowed;
    }
`;

const CheckboxLabel = styled.label`
    font-size: 14px;
    color: #2c3e50;
    cursor: pointer;
`;

const FormRow = styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
`;

const FormColumn = styled.div`
    flex: 1;
`;

const SettingsFooter = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 20px;
`;

const TestMessageButton = styled.button<{ $isOpen: boolean }>`
    display: flex;
    align-items: center;
    padding: 10px 20px;
    border-radius: 4px;
    background-color: ${props => props.$isOpen ? '#e9ecef' : '#f8f9fa'};
    border: 1px solid ${props => props.$isOpen ? '#ced4da' : '#dee2e6'};
    color: #495057;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background-color: #e9ecef;
    }
`;

const TestPanel = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    padding: 20px;
    border: 1px solid #e9ecef;
    margin-top: 10px;
`;

const TestPanelTitle = styled.h3`
    font-size: 16px;
    margin: 0 0 20px 0;
    color: #2c3e50;
`;

const CharCounter = styled.div`
    text-align: right;
    font-size: 12px;
    color: #6c757d;
    margin-top: 4px;
`;

const TestActionButtons = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
`;

const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    margin-right: 8px;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export default SmsSettings;