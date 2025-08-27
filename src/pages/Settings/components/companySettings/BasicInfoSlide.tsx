// src/pages/Settings/sections/companySettings/BasicInfoSlide.tsx
import React, { useState } from 'react';
import { FaBuilding, FaMapMarkerAlt, FaPhone, FaGlobe, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { companySettingsApi, type CompanySettingsResponse } from '../../../../api/companySettingsApi';
import { UnifiedFormField } from '../../components/companySettings/UnifiedFormField';
import {
    SlideContainer,
    SlideHeader,
    SlideTitle,
    SlideActions,
    ActionButton,
    SlideContent,
    FormGrid
} from '../../styles/companySettings/SlideComponents.styles';

interface BasicInfo {
    companyName?: string;
    taxId?: string;
    address?: string;
    phone?: string;
    website?: string;
}

interface BasicInfoSlideProps {
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

export const BasicInfoSlide: React.FC<BasicInfoSlideProps> = ({
                                                                  data,
                                                                  isEditing,
                                                                  saving,
                                                                  onStartEdit,
                                                                  onSave,
                                                                  onCancel,
                                                                  onChange,
                                                                  onSuccess,
                                                                  onError
                                                              }) => {
    const [nipValidation, setNipValidation] = useState<{ isValid: boolean; message: string } | null>(null);
    const [validatingNip, setValidatingNip] = useState(false);

    const basicInfo: BasicInfo = data?.basicInfo || {};

    const validateNIP = async (nip: string) => {
        if (!nip || nip.length < 10) {
            setNipValidation(null);
            return;
        }

        try {
            setValidatingNip(true);
            const result = await companySettingsApi.validateNIP(nip);
            setNipValidation({
                isValid: result.valid,
                message: result.message
            });
        } catch (err) {
            console.error('Error validating NIP:', err);
            setNipValidation({
                isValid: false,
                message: 'Błąd walidacji NIP'
            });
        } finally {
            setValidatingNip(false);
        }
    };

    const formatWebsite = (website: string) => (
        <a href={website} target="_blank" rel="noopener noreferrer" style={{ color: '#1a365d', textDecoration: 'none' }}>
            {website}
        </a>
    );

    return (
        <SlideContainer>
            <SlideHeader>
                <SlideTitle>Dane podstawowe firmy</SlideTitle>
                <SlideActions>
                    {isEditing ? (
                        <>
                            <ActionButton $secondary onClick={onCancel} disabled={saving}>
                                <FaTimes />
                                Anuluj
                            </ActionButton>
                            <ActionButton $primary onClick={onSave} disabled={saving}>
                                <FaSave />
                                {saving ? 'Zapisywanie...' : 'Zapisz'}
                            </ActionButton>
                        </>
                    ) : (
                        <ActionButton $primary onClick={onStartEdit}>
                            <FaEdit />
                            Edytuj
                        </ActionButton>
                    )}
                </SlideActions>
            </SlideHeader>

            <SlideContent>
                <FormGrid>
                    <UnifiedFormField
                        label="Nazwa firmy"
                        icon={FaBuilding}
                        required
                        isEditing={isEditing}
                        value={basicInfo.companyName || ''}
                        onChange={(value) => onChange('basicInfo', 'companyName', value)}
                        placeholder="Wprowadź nazwę firmy"
                        fullWidth
                    />

                    <UnifiedFormField
                        label="NIP"
                        required
                        isEditing={isEditing}
                        value={basicInfo.taxId || ''}
                        onChange={(value) => onChange('basicInfo', 'taxId', value)}
                        onBlur={(value) => validateNIP(value)}
                        placeholder="123-456-78-90"
                        validation={nipValidation}
                        validating={validatingNip}
                        helpText="Podaj NIP w formacie 123-456-78-90"
                    />

                    <UnifiedFormField
                        label="Adres"
                        icon={FaMapMarkerAlt}
                        isEditing={isEditing}
                        value={basicInfo.address || ''}
                        onChange={(value) => onChange('basicInfo', 'address', value)}
                        placeholder="ul. Nazwa 123, 00-000 Miasto"
                        fullWidth
                    />

                    <UnifiedFormField
                        label="Telefon"
                        icon={FaPhone}
                        isEditing={isEditing}
                        value={basicInfo.phone || ''}
                        onChange={(value) => onChange('basicInfo', 'phone', value)}
                        placeholder="+48 123 456 789"
                        type="tel"
                    />

                    <UnifiedFormField
                        label="Strona WWW"
                        icon={FaGlobe}
                        isEditing={isEditing}
                        value={basicInfo.website || ''}
                        onChange={(value) => onChange('basicInfo', 'website', value)}
                        placeholder="https://firma.pl"
                        type="url"
                        displayFormatter={basicInfo.website ? formatWebsite : undefined}
                        helpText="Podaj pełny adres ze schematem https://"
                    />
                </FormGrid>
            </SlideContent>
        </SlideContainer>
    );
};