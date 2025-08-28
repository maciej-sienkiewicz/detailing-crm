// src/pages/Settings/sections/companySettings/BankSettingsSlide.tsx
import React from 'react';
import { FaCreditCard, FaUniversity, FaCode, FaUser } from 'react-icons/fa';
import { type CompanySettingsResponse } from '../../../../api/companySettingsApi';
import { UnifiedFormField } from '../../components/companySettings/UnifiedFormField';
import {
    SlideContainer,
    SlideContent,
    FormGrid
} from '../../styles/companySettings/SlideComponents.styles';

interface BankSettings {
    bankAccountNumber?: string;
    bankName?: string;
    swiftCode?: string;
    accountHolderName?: string;
}

interface BankSettingsSlideProps {
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

export const BankSettingsSlide: React.FC<BankSettingsSlideProps> = ({
                                                                        data,
                                                                        isEditing,
                                                                        saving,
                                                                        onStartEdit,
                                                                        onSave,
                                                                        onCancel,
                                                                        onChange
                                                                    }) => {
    const bankSettings: BankSettings = data?.bankSettings || {};

    const formatAccountNumber = (accountNumber: string) => {
        if (!accountNumber) return accountNumber;
        return accountNumber.replace(/\s/g, '').replace(/(.{2})/g, '$1 ').trim();
    };

    return (
        <SlideContainer>
            <SlideContent>
                <FormGrid>
                    <UnifiedFormField
                        label="Numer konta bankowego"
                        icon={FaCreditCard}
                        required
                        isEditing={isEditing}
                        value={bankSettings.bankAccountNumber || ''}
                        onChange={(value) => onChange('bankSettings', 'bankAccountNumber', value)}
                        placeholder="12 3456 7890 1234 5678 9012 3456"
                        helpText="Podaj numer konta w formacie IBAN"
                        displayFormatter={formatAccountNumber}
                        fullWidth
                    />

                    <UnifiedFormField
                        label="Nazwa banku"
                        icon={FaUniversity}
                        isEditing={isEditing}
                        value={bankSettings.bankName || ''}
                        onChange={(value) => onChange('bankSettings', 'bankName', value)}
                        placeholder="PKO Bank Polski"
                    />

                    <UnifiedFormField
                        label="Kod SWIFT"
                        icon={FaCode}
                        isEditing={isEditing}
                        value={bankSettings.swiftCode || ''}
                        onChange={(value) => onChange('bankSettings', 'swiftCode', value)}
                        placeholder="PKOPPLPW"
                        helpText="8 lub 11 znaków"
                    />

                    <UnifiedFormField
                        label="Właściciel konta"
                        icon={FaUser}
                        isEditing={isEditing}
                        value={bankSettings.accountHolderName || ''}
                        onChange={(value) => onChange('bankSettings', 'accountHolderName', value)}
                        placeholder="Nazwa właściciela konta"
                        fullWidth
                    />
                </FormGrid>
            </SlideContent>
        </SlideContainer>
    );
};