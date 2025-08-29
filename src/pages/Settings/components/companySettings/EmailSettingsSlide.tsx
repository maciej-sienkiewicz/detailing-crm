// src/pages/Settings/components/companySettings/EmailSettingsSlide.tsx
import React, { useEffect, useState } from 'react';
import { FaEnvelope, FaEye, FaEyeSlash, FaLightbulb, FaSpinner } from 'react-icons/fa';
import { type CompanySettingsResponse } from '../../../../api/companySettingsApi';
import { useEmailSettings } from '../../../../hooks/useEmailSettings';
import { UnifiedFormField } from './UnifiedFormField';
import {
    SlideContainer,
    SlideContent,
    FormGrid
} from '../../styles/companySettings/SlideComponents.styles';
import {
    StatusBanner,
    ReadOnlyView,
    FormContainer,
    SecuritySection,
    SecurityOption,
    ErrorBox,
    ErrorText,
    SuggestionBox,
    StatusBadge
} from '../../styles/companySettings/EmailSettings.styles';

interface EmailSettingsSlideProps {
    data: CompanySettingsResponse;
    isEditing: boolean;
    saving: boolean;
    onStartEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onChange: (section: keyof CompanySettingsResponse, field: string, value: any) => void;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export const EmailSettingsSlide: React.FC<EmailSettingsSlideProps> = ({
                                                                          isEditing,
                                                                          saving,
                                                                          onSave,
                                                                          onCancel,
                                                                          onSuccess,
                                                                          onError
                                                                      }) => {
    const {
        configuration,
        suggestions,
        loading,
        saving: emailSaving,
        validating,
        error,
        getSuggestions,
        saveConfiguration,
        clearError,
        isConfigured
    } = useEmailSettings();

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

    // Handle save from parent component
    useEffect(() => {
        if (isEditing && saving && !emailSaving) {
            handleSave();
        }
    }, [isEditing, saving]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        clearError();
    };

    const handleSave = async () => {
        const success = await saveConfiguration(formData);

        if (success) {
            onSuccess?.('Konfiguracja email została zapisana i przetestowana pomyślnie');
            onSave();
        } else if (error) {
            onError?.(error);
        }
    };

    const handleCancel = () => {
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
        onCancel();
    };

    // Handle cancel from parent
    useEffect(() => {
        if (!isEditing) {
            handleCancel();
        }
    }, [isEditing]);

    const getStatusText = (status: string): string => {
        switch (status) {
            case 'VALID': return 'Konfiguracja prawidłowa';
            case 'INVALID_CREDENTIALS': return 'Nieprawidłowe dane logowania';
            case 'INVALID_SETTINGS': return 'Błąd konfiguracji SMTP';
            case 'CONNECTION_ERROR': return 'Błąd połączenia';
            default: return 'Nie testowano';
        }
    };

    const isSaving = saving || emailSaving;

    if (loading) {
        return (
            <SlideContainer>
                <SlideContent>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px' }}>
                        <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '32px', color: '#1a365d' }} />
                    </div>
                </SlideContent>
            </SlideContainer>
        );
    }

    return (
        <SlideContainer>
            <SlideContent>
                <StatusBanner $configured={isConfigured}>
                    {isConfigured
                        ? `Email skonfigurowany: ${configuration?.senderEmail}`
                        : 'Email wymaga konfiguracji'
                    }
                </StatusBanner>

                {!isEditing && configuration ? (
                    <ReadOnlyView>
                        <FormGrid>
                            <UnifiedFormField
                                label="Email nadawcy"
                                icon={FaEnvelope}
                                isEditing={false}
                                value={configuration.senderEmail || ''}
                                onChange={() => {}}
                            />

                            <UnifiedFormField
                                label="Nazwa nadawcy"
                                isEditing={false}
                                value={configuration.senderName || ''}
                                onChange={() => {}}
                            />

                            <UnifiedFormField
                                label="Serwer SMTP"
                                isEditing={false}
                                value={configuration.smtpHost || ''}
                                onChange={() => {}}
                            />

                            <UnifiedFormField
                                label="Port SMTP"
                                isEditing={false}
                                value={configuration.smtpPort?.toString() || ''}
                                onChange={() => {}}
                            />

                            <UnifiedFormField
                                label="Szyfrowanie"
                                isEditing={false}
                                value={configuration.useSsl ? 'SSL/TLS' : 'Brak'}
                                onChange={() => {}}
                            />

                            <UnifiedFormField
                                label="Status"
                                isEditing={false}
                                value=""
                                onChange={() => {}}
                                displayFormatter={() => (
                                    <StatusBadge $status={configuration.validationStatus}>
                                        {getStatusText(configuration.validationStatus)}
                                    </StatusBadge>
                                )}
                            />
                        </FormGrid>
                    </ReadOnlyView>
                ) : (
                    <FormContainer>
                        <FormGrid>
                            <UnifiedFormField
                                label="Email nadawcy"
                                icon={FaEnvelope}
                                required
                                isEditing={isEditing}
                                value={formData.sender_email}
                                onChange={(value) => handleInputChange('sender_email', value)}
                                placeholder="biuro@mojafirma.pl"
                                type="email"
                                validating={validating}
                            />

                            <UnifiedFormField
                                label="Nazwa nadawcy"
                                required
                                isEditing={isEditing}
                                value={formData.sender_name}
                                onChange={(value) => handleInputChange('sender_name', value)}
                                placeholder="Auto Studio"
                            />

                            <UnifiedFormField
                                label="Serwer SMTP"
                                required
                                isEditing={isEditing}
                                value={formData.smtp_host}
                                onChange={(value) => handleInputChange('smtp_host', value)}
                                placeholder="smtp.gmail.com"
                            />

                            <UnifiedFormField
                                label="Port SMTP"
                                required
                                isEditing={isEditing}
                                value={formData.smtp_port.toString()}
                                onChange={(value) => handleInputChange('smtp_port', parseInt(value) || 587)}
                                placeholder="587"
                                type="number"
                            />

                            <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
                                <UnifiedFormField
                                    label="Hasło email"
                                    required
                                    isEditing={isEditing}
                                    value={formData.email_password}
                                    onChange={(value) => handleInputChange('email_password', value)}
                                    placeholder="Hasło do konta email lub hasło aplikacji"
                                    type={showPassword ? 'text' : 'password'}
                                    helpText="Dla Gmail, Yahoo używaj hasła aplikacji. Dla własnych serwerów - hasło konta."
                                    fullWidth
                                />
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '16px',
                                            top: '32px',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#64748b',
                                            fontSize: '16px'
                                        }}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                )}
                            </div>
                        </FormGrid>

                        {suggestions && isEditing && (
                            <SuggestionBox>
                                <FaLightbulb />
                                <span>{suggestions.help_text}</span>
                            </SuggestionBox>
                        )}

                        {isEditing && (
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
                        )}

                        {error && (
                            <ErrorBox>
                                <span>⚠</span>
                                <ErrorText>{error}</ErrorText>
                            </ErrorBox>
                        )}
                    </FormContainer>
                )}
            </SlideContent>
        </SlideContainer>
    );
};