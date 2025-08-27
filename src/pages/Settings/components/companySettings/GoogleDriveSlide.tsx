// src/pages/Settings/sections/companySettings/GoogleDriveSlide.tsx
import React from 'react';
import { type CompanySettingsResponse } from '../../../../api/companySettingsApi';
import {
    SlideContainer,
    SlideHeader,
    SlideTitle,
    SlideContent
} from '../../styles/companySettings/SlideComponents.styles';
import {GoogleDriveSection} from "../../sections/companySettings/GoogleDriveSection";

interface GoogleDriveSlideProps {
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

export const GoogleDriveSlide: React.FC<GoogleDriveSlideProps> = ({
                                                                      onSuccess,
                                                                      onError
                                                                  }) => {
    return (
        <SlideContainer>
            <SlideHeader>
                <SlideTitle>Integracja z Google Drive</SlideTitle>
            </SlideHeader>

            <SlideContent>
                <GoogleDriveSection
                    onSuccess={onSuccess}
                    onError={onError}
                />
            </SlideContent>
        </SlideContainer>
    );
};