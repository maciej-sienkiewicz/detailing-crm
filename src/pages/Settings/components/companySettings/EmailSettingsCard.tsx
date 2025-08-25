// src/pages/Settings/components/EmailSettingsCard.tsx
import React, {useEffect, useState} from 'react';
import {FaEnvelope, FaEye, FaEyeSlash, FaLightbulb} from 'react-icons/fa';
import {useEmailSettings} from '../../../../hooks/useEmailSettings';
import {SectionCard} from './SectionCard';
import {FormField} from './FormField';
import {LoadingSpinner} from './LoadingSpinner';
import {
    ErrorBox,
    ErrorText,
    FormContainer,
    FormGrid,
    InfoGrid,
    InfoItem,
    InfoLabel,
    InfoValue,
    PasswordToggle,
    ReadOnlyView,
    SecurityOption,
    SecuritySection,
    StatusBadge,
    StatusBanner,
    SuggestionBox
} from '../../styles/companySettings/EmailSettings.styles';

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

    useEffect(() => {
        if (configuration) {
            setFormData({
                sender_email: configuration.senderEmail,
                sender_name: configuration.senderName,
                email_password: '',
                smtp_host: configuration.smtpHost,
                smtp_port: configuration.smtpPort,
                use_ssl: configuration.useSsl,
                send_test_email: false
            });
        }
    }, [configuration]);

    useEffect(() => {
        if (isEditing && formData.sender_email) {
            getSuggestions(formData.sender_email);
        }
    }, [formData.sender_email, isEditing, getSuggestions]);

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
        if (configuration) {
            setFormData({
                sender_email: configuration.senderEmail,
                sender_name: configuration.senderName,
                email_password: '',
                smtp_host: configuration.smtpHost,
                smtp_port: configuration.smtpPort,
                use_ssl: configuration.useSsl,
                send_test_email: false
            });
        }
    };

    const getStatusText = (status: string): string => {
        switch (status) {
            case 'VALID': return 'Konfiguracja prawidłowa';
            case 'INVALID_CREDENTIALS': return 'Nieprawidłowe dane logowania';
            case 'INVALID_SETTINGS': return 'Błąd konfiguracji SMTP';
            case 'CONNECTION_ERROR': return 'Błąd połączenia';
            default: return 'Nie testowano';
        }
    };

    const isFormValid = formData.sender_email &&
        formData.sender_name &&
        formData.email_password &&
        formData.smtp_host &&
        formData.smtp_port > 0;

    if (loading) {
        return (
            <SectionCard
                icon={FaEnvelope}
                title="Konfiguracja email"
                subtitle="System wysyła automatyczne powiadomienia do klientów"
            >
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <LoadingSpinner />
                </div>
            </SectionCard>
        );
    }

    return (
        <SectionCard
            icon={FaEnvelope}
            title="Konfiguracja email"
            subtitle="System wysyła automatyczne powiadomienia do klientów"
            isEditing={isEditing}
            saving={saving}
            onStartEdit={() => setIsEditing(true)}
            onSave={handleSave}
            onCancel={handleCancel}
        >
            <StatusBanner $configured={isConfigured}>
                {isConfigured
                    ? `Email skonfigurowany: ${configuration?.senderEmail}`
                    : 'Email wymaga konfiguracji'
                }
            </StatusBanner>

            {!isEditing && configuration ? (
                <ReadOnlyView>
                    <InfoGrid>
                        <InfoItem>
                            <InfoLabel>Email nadawcy</InfoLabel>
                            <InfoValue>{configuration.senderEmail}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>Nazwa nadawcy</InfoLabel>
                            <InfoValue>{configuration.senderName}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>Serwer SMTP</InfoLabel>
                            <InfoValue>{configuration.smtpHost}:{configuration.smtpPort}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>Szyfrowanie</InfoLabel>
                            <InfoValue>{configuration.useSsl ? 'SSL/TLS' : 'Brak'}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>Status</InfoLabel>
                            <StatusBadge $status={configuration.validationStatus}>
                                {getStatusText(configuration.validationStatus)}
                            </StatusBadge>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>Ostatni test</InfoLabel>
                            <InfoValue>
                                {configuration.testEmailSent ? 'Email testowy wysłany' : 'Nie testowano'}
                            </InfoValue>
                        </InfoItem>
                    </InfoGrid>
                </ReadOnlyView>
            ) : (
                <FormContainer>
                    <FormGrid>
                        <FormField
                            label="Email nadawcy"
                            required
                            isEditing={true}
                            value={formData.sender_email}
                            onChange={(value) => handleInputChange('sender_email', value)}
                            placeholder="biuro@mojafirma.pl"
                            type="email"
                            rightElement={validating ? <LoadingSpinner size="small" /> : null}
                        />

                        <FormField
                            label="Nazwa nadawcy"
                            required
                            isEditing={true}
                            value={formData.sender_name}
                            onChange={(value) => handleInputChange('sender_name', value)}
                            placeholder="Auto Studio"
                        />

                        <FormField
                            label="Serwer SMTP"
                            required
                            isEditing={true}
                            value={formData.smtp_host}
                            onChange={(value) => handleInputChange('smtp_host', value)}
                            placeholder="smtp.gmail.com"
                        />

                        <FormField
                            label="Port SMTP"
                            required
                            isEditing={true}
                            value={formData.smtp_port.toString()}
                            onChange={(value) => handleInputChange('smtp_port', parseInt(value) || 587)}
                            placeholder="587"
                            type="number"
                        />

                        <div style={{ gridColumn: '1 / -1' }}>
                            <FormField
                                label="Hasło email"
                                required
                                isEditing={true}
                                value={formData.email_password}
                                onChange={(value) => handleInputChange('email_password', value)}
                                placeholder="Hasło do konta email lub hasło aplikacji"
                                type={showPassword ? 'text' : 'password'}
                                helpText="Dla Gmail, Yahoo używaj hasła aplikacji. Dla własnych serwerów - hasło konta."
                                rightElement={
                                    <PasswordToggle
                                        onClick={() => setShowPassword(!showPassword)}
                                        type="button"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </PasswordToggle>
                                }
                            />
                        </div>
                    </FormGrid>

                    {suggestions && (
                        <SuggestionBox>
                            <FaLightbulb />
                            <span>{suggestions.help_text}</span>
                        </SuggestionBox>
                    )}

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
                            <span>⚠</span>
                            <ErrorText>{error}</ErrorText>
                        </ErrorBox>
                    )}
                </FormContainer>
            )}
        </SectionCard>
    );
};