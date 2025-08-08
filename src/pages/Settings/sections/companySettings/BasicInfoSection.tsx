// src/pages/Settings/sections/BasicInfoSection.tsx
import React, { useState } from 'react';
import { FaBuilding, FaMapMarkerAlt, FaPhone, FaGlobe, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { companySettingsApi } from '../../../../api/companySettingsApi';
import { SectionCard } from '../../components/companySettings/SectionCard';
import { FormField } from '../../components/companySettings/FormField';
import { ValidationStatus } from '../../components/companySettings/ValidationStatus';
import { FormGrid, DisplayValue, WebsiteLink } from '../../styles/companySettings/Form.styles';

interface BasicInfo {
    companyName?: string;
    taxId?: string;
    address?: string;
    phone?: string;
    website?: string;
}

interface BasicInfoSectionProps {
    data?: BasicInfo;
    isEditing: boolean;
    saving: boolean;
    onStartEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onChange: (field: string, value: string) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
                                                                      data = {},
                                                                      isEditing,
                                                                      saving,
                                                                      onStartEdit,
                                                                      onSave,
                                                                      onCancel,
                                                                      onChange
                                                                  }) => {
    const [nipValidation, setNipValidation] = useState<{ isValid: boolean; message: string } | null>(null);
    const [validatingNip, setValidatingNip] = useState(false);

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

    return (
        <SectionCard
            icon={FaBuilding}
            title="Dane podstawowe"
            subtitle="Podstawowe informacje identyfikacyjne firmy"
            isEditing={isEditing}
            saving={saving}
            onStartEdit={onStartEdit}
            onSave={onSave}
            onCancel={onCancel}
        >
            <FormGrid>
                <FormField
                    label="Nazwa firmy"
                    icon={<FaBuilding />}
                    required
                    isEditing={isEditing}
                    value={data.companyName || ''}
                    onChange={(value) => onChange('companyName', value)}
                    placeholder="Wprowadź nazwę firmy"
                />

                <FormField
                    label="NIP"
                    icon={<span className="icon">🏛️</span>}
                    required
                    isEditing={isEditing}
                    value={data.taxId || ''}
                    onChange={(value) => onChange('taxId', value)}
                    onBlur={(value) => validateNIP(value)}
                    placeholder="123-456-78-90"
                    validation={nipValidation}
                    validating={validatingNip}
                    rightElement={
                        <ValidationStatus
                            valid={nipValidation?.isValid ?? !!data.taxId}
                            loading={validatingNip}
                        />
                    }
                />

                <FormField
                    label="Adres"
                    icon={<FaMapMarkerAlt />}
                    isEditing={isEditing}
                    value={data.address || ''}
                    onChange={(value) => onChange('address', value)}
                    placeholder="ul. Nazwa 123, 00-000 Miasto"
                    fullWidth
                />

                <FormField
                    label="Telefon"
                    icon={<FaPhone />}
                    isEditing={isEditing}
                    value={data.phone || ''}
                    onChange={(value) => onChange('phone', value)}
                    placeholder="+48 123 456 789"
                />

                <FormField
                    label="Strona WWW"
                    icon={<FaGlobe />}
                    isEditing={isEditing}
                    value={data.website || ''}
                    onChange={(value) => onChange('website', value)}
                    placeholder="https://firma.pl"
                    displayValue={
                        data.website ? (
                            <WebsiteLink href={data.website} target="_blank">
                                {data.website}
                            </WebsiteLink>
                        ) : (
                            <DisplayValue $hasValue={false}>Nie podano</DisplayValue>
                        )
                    }
                />
            </FormGrid>
        </SectionCard>
    );
};