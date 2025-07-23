import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaEnvelope,
    FaEdit,
    FaSave,
    FaTimes,
    FaSpinner,
    FaCheckCircle,
    FaExclamationTriangle,
    FaEye,
    FaEyeSlash,
    FaLightbulb,
    FaServer
} from 'react-icons/fa';
import { useEmailSettings } from '../../hooks/useEmailSettings';

interface EmailSettingsCardProps {
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export const EmailSettingsCard: React.FC<EmailSettingsCardProps> = ({ onSuccess, onError }) => {
    const {
        configuration,
        suggestions,
        loading,
        saving,
        validating,
        error,
        getSuggestions,
        saveConfiguration,
        clearError,
        isConfigured
    } = useEmailSettings();

    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        sender_email: '',
        sender_name: '',
        email_password: '',
        smtp_host: '',
        smtp_port: 587,
        use_ssl: true,
        send_test_email: false
    });

    // Inicjalizuj formularz z danymi konfiguracji
    useEffect(() => {
        if (configuration) {
            setFormData({
                sender_email: configuration.sender_email,
                sender_name: configuration.sender_name,
                email_password: '', // Nigdy nie pokazujemy hasła
                smtp_host: configuration.smtp_host,
                smtp_port: configuration.smtp_port,
                use_ssl: configuration.use_ssl,
                send_test_email: false
            });
        }
    }, [configuration]);

    // Automatyczne pobieranie sugestii przy zmianie emaila
    useEffect(() => {
        if (isEditing && formData.sender_email) {
            getSuggestions(formData.sender_email);
        }
    }, [formData.sender_email, isEditing, getSuggestions]);

    // Automatyczne wypełnienie na podstawie sugestii
    useEffect(() => {
        if (suggestions?.has_suggestion && isEditing && !formData.smtp_host) {
            setFormData(prev => ({
                ...prev,
                smtp_host: suggestions.suggested_smtp_host,
                smtp_port: suggestions.suggested_smtp_port,
                use_ssl: suggestions.suggested_use_ssl
            }));
        }
    }, [suggestions, isEditing]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        clearError();
    };

    const handleSave = async () => {
        const success = await saveConfiguration(formData);

        if (success) {
            setIsEditing(false);
            onSuccess?.('Konfiguracja email została zapisana i przetestowana pomyślnie');
        } else if (error) {
            onError?.(error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        clearError();
        // Reset form to original values
        if (configuration) {
            setFormData({
                sender_email: configuration.sender_email,
                sender_name: configuration.sender_name,
                email_password: '',
                smtp_host: configuration.smtp_host,
                smtp_port: configuration.smtp_port,
                use_ssl: configuration.use_ssl,
                send_test_email: false
            });
        }
    };

    const isFormValid = formData.sender_email &&
        formData.sender_name &&
        formData.email_password &&
        formData.smtp_host &&
        formData.smtp_port > 0;

    if (loading) {
        return (
            <EmailCard>
                <CardBody>
                    <LoadingContainer>
                        <FaSpinner className="spinning" />
                        <span>Ładowanie konfiguracji email...</span>
                    </LoadingContainer>
                </CardBody>
            </EmailCard>
        );
    }

    return (
        <EmailCard>
            <CardHeader>
                <HeaderContent>
                    <HeaderIcon>
                        <FaEnvelope />
                    </HeaderIcon>
                    <HeaderText>
                        <HeaderTitle>Konfiguracja email</HeaderTitle>
                        <HeaderSubtitle>
                            System wysyła automatyczne powiadomienia do klientów
                        </HeaderSubtitle>
                    </HeaderText>
                </HeaderContent>
                <HeaderActions>
                    {isEditing ? (
                        <ActionGroup>
                            <SecondaryButton onClick={handleCancel}>
                                <FaTimes />
                                Anuluj
                            </SecondaryButton>
                            <PrimaryButton
                                onClick={handleSave}
                                disabled={saving || !isFormValid}
                            >
                                {saving ? <FaSpinner className="spinning" /> : <FaSave />}
                                {saving ? 'Zapisywanie...' : 'Zapisz i przetestuj'}
                            </PrimaryButton>
                        </ActionGroup>
                    ) : (
                        <SecondaryButton onClick={() => setIsEditing(true)}>
                            <FaEdit />
                            {configuration ? 'Edytuj' : 'Skonfiguruj'}
                        </SecondaryButton>
                    )}
                </HeaderActions>
            </CardHeader>

            <StatusBanner $configured={isConfigured}>
                <StatusIcon>
                    {isConfigured ? <FaCheckCircle /> : <FaExclamationTriangle />}
                </StatusIcon>
                <StatusText>
                    {isConfigured
                        ? `Email skonfigurowany: ${configuration?.sender_email}`
                        : 'Email wymaga konfiguracji'}
                </StatusText>
            </StatusBanner>

            <CardBody>
                {!isEditing && configuration ? (
                    // Widok tylko do odczytu
                    <ReadOnlyView>
                        <InfoGrid>
                            <InfoItem>
                                <InfoLabel>Email nadawcy</InfoLabel>
                                <InfoValue>{configuration.sender_email}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Nazwa nadawcy</InfoLabel>
                                <InfoValue>{configuration.sender_name}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Serwer SMTP</InfoLabel>
                                <InfoValue>{configuration.smtp_host}:{configuration.smtp_port}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Szyfrowanie</InfoLabel>
                                <InfoValue>{configuration.use_ssl ? 'SSL/TLS' : 'Brak'}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Status</InfoLabel>
                                <StatusBadge $status={configuration.validation_status}>
                                    {getStatusText(configuration.validation_status)}
                                </StatusBadge>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Ostatni test</InfoLabel>
                                <InfoValue>
                                    {configuration.test_email_sent ? 'Email testowy wysłany' : 'Nie testowano'}
                                </InfoValue>
                            </InfoItem>
                        </InfoGrid>
                    </ReadOnlyView>
                ) : (
                    // Formularz edycji
                    <FormContainer>
                        <FormGrid>
                            <FormField>
                                <FieldLabel>
                                    <span>Email nadawcy</span>
                                    <RequiredMark>*</RequiredMark>
                                    {validating && <FaSpinner className="spinning" />}
                                </FieldLabel>
                                <Input
                                    type="email"
                                    value={formData.sender_email}
                                    onChange={(e) => handleInputChange('sender_email', e.target.value)}
                                    placeholder="biuro@mojafirma.pl"
                                />
                                {suggestions && (
                                    <SuggestionBox>
                                        <FaLightbulb />
                                        <span>{suggestions.help_text}</span>
                                    </SuggestionBox>
                                )}
                            </FormField>

                            <FormField>
                                <FieldLabel>
                                    <span>Nazwa nadawcy</span>
                                    <RequiredMark>*</RequiredMark>
                                </FieldLabel>
                                <Input
                                    value={formData.sender_name}
                                    onChange={(e) => handleInputChange('sender_name', e.target.value)}
                                    placeholder="Auto Studio"
                                />
                            </FormField>

                            <FormField>
                                <FieldLabel>
                                    <span>Serwer SMTP</span>
                                    <RequiredMark>*</RequiredMark>
                                </FieldLabel>
                                <Input
                                    value={formData.smtp_host}
                                    onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                                    placeholder="smtp.gmail.com"
                                />
                            </FormField>

                            <FormField>
                                <FieldLabel>
                                    <span>Port SMTP</span>
                                    <RequiredMark>*</RequiredMark>
                                </FieldLabel>
                                <Input
                                    type="number"
                                    value={formData.smtp_port}
                                    onChange={(e) => handleInputChange('smtp_port', parseInt(e.target.value) || 587)}
                                    placeholder="587"
                                />
                            </FormField>

                            <FormField $fullWidth>
                                <FieldLabel>
                                    <span>Hasło email</span>
                                    <RequiredMark>*</RequiredMark>
                                </FieldLabel>
                                <PasswordContainer>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.email_password}
                                        onChange={(e) => handleInputChange('email_password', e.target.value)}
                                        placeholder="Hasło do konta email lub hasło aplikacji"
                                    />
                                    <PasswordToggle
                                        onClick={() => setShowPassword(!showPassword)}
                                        type="button"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </PasswordToggle>
                                </PasswordContainer>
                                <HelpText>
                                    Dla Gmail, Yahoo używaj hasła aplikacji. Dla własnych serwerów - hasło konta.
                                </HelpText>
                            </FormField>
                        </FormGrid>

                        <SecuritySection>
                            <SecurityOption>
                                <input
                                    type="checkbox"
                                    checked={formData.use_ssl}
                                    onChange={(e) => handleInputChange('use_ssl', e.target.checked)}
                                />
                                <span>Używaj szyfrowania SSL/TLS (zalecane)</span>
                            </SecurityOption>

                            <SecurityOption>
                                <input
                                    type="checkbox"
                                    checked={formData.send_test_email}
                                    onChange={(e) => handleInputChange('send_test_email', e.target.checked)}
                                />
                                <span>Wyślij testowy email po zapisaniu</span>
                            </SecurityOption>
                        </SecuritySection>

                        {error && (
                            <ErrorBox>
                                <FaExclamationTriangle />
                                <ErrorText>{error}</ErrorText>
                            </ErrorBox>
                        )}
                    </FormContainer>
                )}
            </CardBody>
        </EmailCard>
    );
};

// Helper function
const getStatusText = (status: string): string => {
    switch (status) {
        case 'VALID': return 'Konfiguracja prawidłowa';
        case 'INVALID_CREDENTIALS': return 'Nieprawidłowe dane logowania';
        case 'INVALID_SETTINGS': return 'Błąd konfiguracji SMTP';
        case 'CONNECTION_ERROR': return 'Błąd połączenia';
        default: return 'Nie testowano';
    }
};

// Styled components
const EmailCard = styled.div`
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #e2e8f0;
    background: #fafbfc;
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const HeaderIcon = styled.div`
    width: 40px;
    height: 40px;
    background: rgba(26, 54, 93, 0.1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1a365d;
    font-size: 18px;
`;

const HeaderText = styled.div``;

const HeaderTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 4px 0;
`;

const HeaderSubtitle = styled.p`
    font-size: 14px;
    color: #64748b;
    margin: 0;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 8px;
`;

const ActionGroup = styled.div`
    display: flex;
    gap: 8px;
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
    min-height: 44px;
    justify-content: center;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const PrimaryButton = styled(BaseButton)`
    background: linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%);
    color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #0f2027 0%, #1a365d 100%);
    }
`;

const SecondaryButton = styled(BaseButton)`
    background: white;
    color: #64748b;
    border-color: #e2e8f0;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &:hover:not(:disabled) {
        background: #f1f5f9;
        color: #0f172a;
        border-color: #cbd5e1;
    }
`;

const StatusBanner = styled.div<{ $configured: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    background: ${props => props.$configured ? '#d1fae5' : '#fef3c7'};
    color: ${props => props.$configured ? '#059669' : '#d97706'};
    border-bottom: 1px solid #e2e8f0;
`;

const StatusIcon = styled.div`
    font-size: 16px;
`;

const StatusText = styled.div`
    font-weight: 500;
    flex: 1;
`;

const CardBody = styled.div`
    padding: 24px;
`;

const LoadingContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #64748b;
    font-weight: 500;
    padding: 40px;

    .spinning {
        animation: spin 1s linear infinite;
    }
`;

const ReadOnlyView = styled.div``;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const InfoItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const InfoLabel = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #0f172a;
`;

const StatusBadge = styled.span<{ $status: string }>`
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    background: ${props => {
    switch (props.$status) {
        case 'VALID': return '#d1fae5';
        case 'INVALID_CREDENTIALS':
        case 'INVALID_SETTINGS':
        case 'CONNECTION_ERROR': return '#fee2e2';
        default: return '#fef3c7';
    }
}};
    color: ${props => {
    switch (props.$status) {
        case 'VALID': return '#059669';
        case 'INVALID_CREDENTIALS':
        case 'INVALID_SETTINGS':
        case 'CONNECTION_ERROR': return '#dc2626';
        default: return '#d97706';
    }
}};
`;

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormField = styled.div<{ $fullWidth?: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 8px;
    ${props => props.$fullWidth && 'grid-column: 1 / -1;'}
`;

const FieldLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 14px;
    color: #0f172a;

    .spinning {
        animation: spin 1s linear infinite;
        color: #64748b;
    }
`;

const RequiredMark = styled.span`
    color: #dc2626;
    font-weight: 700;
`;

const Input = styled.input`
    height: 48px;
    padding: 0 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    background: white;
    color: #0f172a;
    transition: all 0.2s;

    &:focus {
        outline: none;
        border-color: #1a365d;
        box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.1);
    }

    &::placeholder {
        color: #94a3b8;
        font-weight: 400;
    }
`;

const PasswordContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const PasswordToggle = styled.button`
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;

    &:hover {
        color: #0f172a;
        background: #f1f5f9;
    }
`;

const HelpText = styled.div`
    font-size: 12px;
    color: #64748b;
    line-height: 1.4;
`;

const SuggestionBox = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(26, 54, 93, 0.1);
    color: #1a365d;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
`;

const SecuritySection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
`;

const SecurityOption = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #0f172a;
    cursor: pointer;

    input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #1a365d;
        cursor: pointer;
    }
`;

const ErrorBox = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #fee2e2;
    color: #dc2626;
    border-radius: 8px;
    border: 1px solid rgba(220, 38, 38, 0.2);
`;

const ErrorText = styled.div`
    font-weight: 500;
    flex: 1;
`;