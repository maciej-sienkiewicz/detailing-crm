// src/pages/Settings/components/companySettings/UserSignatureSlide.tsx
import React from 'react';
import { type CompanySettingsResponse } from '../../../../api/companySettingsApi';
import { UserSignatureCard } from './UserSignatureCard';
import {
    SlideContainer,
    SlideContent
} from '../../styles/companySettings/SlideComponents.styles';

interface UserSignatureSlideProps {
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

export const UserSignatureSlide: React.FC<UserSignatureSlideProps> = ({
                                                                          onSuccess,
                                                                          onError
                                                                      }) => {
    return (
        <SlideContainer>
            <SlideContent>
                <UserSignatureCard
                    onSuccess={onSuccess}
                    onError={onError}
                />
            </SlideContent>
        </SlideContainer>
    );
};