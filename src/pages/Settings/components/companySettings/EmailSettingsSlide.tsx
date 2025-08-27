// src/pages/Settings/sections/companySettings/EmailSettingsSlide.tsx
import React from 'react';
import { FaEnvelope } from 'react-icons/fa';
import { type CompanySettingsResponse } from '../../../../api/companySettingsApi';
import { EmailSettingsCard } from '../../components/companySettings/EmailSettingsCard';
import {
    SlideContainer,
    SlideHeader,
    SlideTitle,
    SlideContent
} from '../../styles/companySettings/SlideComponents.styles';

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
                                                                          onSuccess,
                                                                          onError
                                                                      }) => {
    return (
        <SlideContainer>
            <SlideHeader>
                <SlideTitle>Konfiguracja email</SlideTitle>
            </SlideHeader>

            <SlideContent>
                <EmailSettingsCard
                    onSuccess={onSuccess}
                    onError={onError}
                />
            </SlideContent>
        </SlideContainer>
    );
};