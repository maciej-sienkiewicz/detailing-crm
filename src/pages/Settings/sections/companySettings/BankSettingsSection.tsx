// src/pages/Settings/sections/BankSettingsSection.tsx
import React from 'react';
import {FaCreditCard} from 'react-icons/fa';
import {SectionCard} from '../../components/companySettings/SectionCard';
import {FormField} from '../../components/companySettings/FormField';
import {FormGrid} from '../../styles/companySettings/Form.styles';

interface BankSettings {
    bankAccountNumber?: string;
    bankName?: string;
    swiftCode?: string;
    accountHolderName?: string;
}

interface BankSettingsSectionProps {
    data?: BankSettings;
    isEditing: boolean;
    saving: boolean;
    onStartEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onChange: (field: string, value: string) => void;
}

export const BankSettingsSection: React.FC<BankSettingsSectionProps> = ({
                                                                            data = {},
                                                                            isEditing,
                                                                            saving,
                                                                            onStartEdit,
                                                                            onSave,
                                                                            onCancel,
                                                                            onChange
                                                                        }) => {
    return (
        <SectionCard
            icon={FaCreditCard}
            title="Dane bankowe"
            subtitle="Te dane będą wykorzystywane przy tworzeniu faktur"
            isEditing={isEditing}
            saving={saving}
            onStartEdit={onStartEdit}
            onSave={onSave}
            onCancel={onCancel}
        >
            <FormGrid>
                <FormField
                    label="Numer konta bankowego"
                    isEditing={isEditing}
                    value={data.bankAccountNumber || ''}
                    onChange={(value) => onChange('bankAccountNumber', value)}
                    placeholder="12 3456 7890 1234 5678 9012 3456"
                    fullWidth
                />

                <FormField
                    label="Nazwa banku"
                    isEditing={isEditing}
                    value={data.bankName || ''}
                    onChange={(value) => onChange('bankName', value)}
                    placeholder="Nazwa banku"
                />

                <FormField
                    label="Kod SWIFT"
                    isEditing={isEditing}
                    value={data.swiftCode || ''}
                    onChange={(value) => onChange('swiftCode', value)}
                    placeholder="PKOPPLPW"
                />

                <FormField
                    label="Właściciel konta"
                    isEditing={isEditing}
                    value={data.accountHolderName || ''}
                    onChange={(value) => onChange('accountHolderName', value)}
                    placeholder="Nazwa właściciela konta"
                />
            </FormGrid>
        </SectionCard>
    );
};