// src/pages/Settings/CompanySettingsPage.tsx
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { companySettingsApi, type CompanySettingsResponse } from '../../api/companySettingsApi';
import { useNotifications } from '../../hooks/useNotifications';
import { BasicInfoSection } from './sections/companySettings/BasicInfoSection';
import { BankSettingsSection } from './sections/companySettings/BankSettingsSection';
import { GoogleDriveSection } from './sections/companySettings/GoogleDriveSection';
import { EmailSettingsCard } from './components/companySettings/EmailSettingsCard';
import { UserSignatureCard } from './components/companySettings/UserSignatureCard';
import {
    PageContainer,
    ContentContainer,
    LoadingContainer,
    ErrorContainer
} from './styles/companySettings/CompanySettings.styles';
import { LoadingSpinner } from './components/companySettings/LoadingSpinner';
import { ErrorDisplay } from './components/companySettings/ErrorDisplay';
import { NotificationManager } from './components/companySettings/NotificationManager';

export type EditingSection = 'basic' | 'bank' | 'email' | null;

const CompanySettingsPage = forwardRef<{ handleSave: () => void }>((props, ref) => {
    const { showSuccess, showError, clearNotifications } = useNotifications();
    const [formData, setFormData] = useState<CompanySettingsResponse | null>(null);
    const [originalData, setOriginalData] = useState<CompanySettingsResponse | null>(null);
    const [editingSection, setEditingSection] = useState<EditingSection>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

        setFormData(prev => ({
            ...prev!,
            [section]: {
                ...prev![section],
                [field]: value
            }
        }));
    };

    const handleSaveAll = async () => {
        if (!formData || !originalData) return;

        try {
            setSaving(true);
            clearNotifications();

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

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner />
                </LoadingContainer>
            </PageContainer>
        );
    }

    if (!formData) {
        return (
            <PageContainer>
                <ErrorContainer>
                    <ErrorDisplay
                        error={error || 'Nie udało się załadować danych'}
                        onRetry={loadCompanySettings}
                    />
                </ErrorContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <NotificationManager />

            <ContentContainer>
                <BasicInfoSection
                    data={formData.basicInfo}
                    isEditing={editingSection === 'basic'}
                    saving={saving}
                    onStartEdit={() => setEditingSection('basic')}
                    onSave={() => handleSaveSection('basic')}
                    onCancel={() => handleCancelSection('basic')}
                    onChange={(field, value) => handleInputChange('basicInfo', field, value)}
                />

                <BankSettingsSection
                    data={formData.bankSettings}
                    isEditing={editingSection === 'bank'}
                    saving={saving}
                    onStartEdit={() => setEditingSection('bank')}
                    onSave={() => handleSaveSection('bank')}
                    onCancel={() => handleCancelSection('bank')}
                    onChange={(field, value) => handleInputChange('bankSettings', field, value)}
                />

                <EmailSettingsCard
                    onSuccess={showSuccess}
                    onError={showError}
                />

                <GoogleDriveSection
                    onSuccess={showSuccess}
                    onError={showError}
                />

                <UserSignatureCard
                    onSuccess={showSuccess}
                    onError={showError}
                />
            </ContentContainer>
        </PageContainer>
    );
});

export default CompanySettingsPage;