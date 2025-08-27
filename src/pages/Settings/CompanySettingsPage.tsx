// src/pages/Settings/CompanySettingsPage.tsx
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { companySettingsApi, type CompanySettingsResponse } from '../../api/companySettingsApi';
import { useNotifications } from '../../hooks/useNotifications';
import { SectionSlider } from './components/companySettings/SectionSlider';
import { LoadingOverlay } from './components/companySettings/LoadingOverlay';
import { ErrorOverlay } from './components/companySettings/ErrorOverlay';
import {
    PageContainer,
    SlideContainer
} from './styles/companySettings/CompanySettingsRedesigned.styles';
import {BankSettingsSlide} from "./components/companySettings/BankSettingsSlide";
import {BasicInfoSlide} from "./components/companySettings/BasicInfoSlide";
import {EmailSettingsSlide} from "./components/companySettings/EmailSettingsSlide";
import {GoogleDriveSlide} from "./components/companySettings/GoogleDriveSlide";
import {UserSignatureSlide} from "./components/companySettings/UserSignatureSlide";

export type EditingSection = 'basic' | 'bank' | 'email' | null;

const CompanySettingsPage = forwardRef<{ handleSave: () => void }>((props, ref) => {
    const { showSuccess, showError } = useNotifications();
    const [formData, setFormData] = useState<CompanySettingsResponse | null>(null);
    const [originalData, setOriginalData] = useState<CompanySettingsResponse | null>(null);
    const [editingSection, setEditingSection] = useState<EditingSection>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

    const sections = [
        {
            id: 'basic',
            title: 'Dane podstawowe',
            subtitle: 'Podstawowe informacje identyfikacyjne firmy',
            component: BasicInfoSlide
        },
        {
            id: 'bank',
            title: 'Dane bankowe',
            subtitle: 'Informacje o koncie bankowym dla faktur',
            component: BankSettingsSlide
        },
        {
            id: 'email',
            title: 'Konfiguracja email',
            subtitle: 'Ustawienia automatycznych powiadomień email',
            component: EmailSettingsSlide
        },
        {
            id: 'google-drive',
            title: 'Google Drive',
            subtitle: 'Automatyczne kopie zapasowe w chmurze',
            component: GoogleDriveSlide
        },
        {
            id: 'signature',
            title: 'Podpis elektroniczny',
            subtitle: 'Profesjonalny podpis do dokumentów',
            component: UserSignatureSlide
        }
    ];

    useImperativeHandle(ref, () => ({
        handleSave: handleSaveAll
    }));

    useEffect(() => {
        loadCompanySettings();
    }, []);

    const loadCompanySettings = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await companySettingsApi.getCompanySettings();
            setFormData(data);
            setOriginalData(data);
        } catch (err) {
            console.error('Error loading company settings:', err);
            setError('Nie udało się załadować ustawień firmy');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (section: keyof CompanySettingsResponse, field: string, value: any) => {
        if (!formData) return;

        setFormData(prev => {
            if (!prev) return null;

            const currentSection = prev[section];
            if (!currentSection || typeof currentSection !== 'object') {
                return prev;
            }

            return {
                ...prev,
                [section]: {
                    ...(currentSection as Record<string, any>),
                    [field]: value
                }
            };
        });
    };

    const handleSaveAll = async () => {
        if (!formData || !originalData) return;

        try {
            setSaving(true);

            const updateRequest = {
                basicInfo: formData.basicInfo,
                bankSettings: formData.bankSettings,
                logoSettings: formData.logoSettings
            };

            const updatedData = await companySettingsApi.updateCompanySettings(updateRequest);

            setFormData(updatedData);
            setOriginalData(updatedData);
            setEditingSection(null);
            showSuccess('Ustawienia zostały zapisane pomyślnie');
        } catch (err) {
            console.error('Error saving company settings:', err);
            showError('Nie udało się zapisać ustawień');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSection = async (section: EditingSection) => {
        if (!section) return;
        await handleSaveAll();
    };

    const handleCancelSection = (section: EditingSection) => {
        if (!section || !originalData) return;
        setFormData(originalData);
        setEditingSection(null);
        setError(null);
    };

    const handlePrevious = () => {
        setCurrentSectionIndex(prev => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentSectionIndex(prev => Math.min(sections.length - 1, prev + 1));
    };

    const handleSectionChange = (index: number) => {
        setCurrentSectionIndex(index);
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingOverlay />
            </PageContainer>
        );
    }

    if (!formData) {
        return (
            <PageContainer>
                <ErrorOverlay
                    error={error || 'Nie udało się załadować danych'}
                    onRetry={loadCompanySettings}
                />
            </PageContainer>
        );
    }

    const CurrentSlideComponent = sections[currentSectionIndex].component;

    return (
        <PageContainer>
            <SectionSlider
                sections={sections}
                currentIndex={currentSectionIndex}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSectionChange={handleSectionChange}
                canNavigatePrev={currentSectionIndex > 0}
                canNavigateNext={currentSectionIndex < sections.length - 1}
            />

            <SlideContainer>
                <CurrentSlideComponent
                    data={formData}
                    isEditing={editingSection === sections[currentSectionIndex].id}
                    saving={saving}
                    onStartEdit={() => setEditingSection(sections[currentSectionIndex].id as EditingSection)}
                    onSave={() => handleSaveSection(sections[currentSectionIndex].id as EditingSection)}
                    onCancel={() => handleCancelSection(sections[currentSectionIndex].id as EditingSection)}
                    onChange={handleInputChange}
                    onSuccess={showSuccess}
                    onError={showError}
                />
            </SlideContainer>
        </PageContainer>
    );
});

export default CompanySettingsPage;