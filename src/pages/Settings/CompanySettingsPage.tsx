// src/pages/Settings/CompanySettingsPage.tsx - Zaktualizowana wersja
import React, { forwardRef, useEffect, useImperativeHandle, useState, useRef } from 'react';
import { companySettingsApi, type CompanySettingsResponse } from '../../api/companySettingsApi';
import { useNotifications } from '../../hooks/useNotifications';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';
import { SectionSlider } from './components/companySettings/SectionSlider';
import { LoadingOverlay } from './components/companySettings/LoadingOverlay';
import { ErrorOverlay } from './components/companySettings/ErrorOverlay';
import {
    PageContainer,
    SlideContainer
} from './styles/companySettings/CompanySettingsRedesigned.styles';
import { BankSettingsSlide } from "./components/companySettings/BankSettingsSlide";
import { EmailSettingsSlide } from "./components/companySettings/EmailSettingsSlide";
import { UserSignatureSlide } from "./components/companySettings/UserSignatureSlide";
import { BasicInfoSlide } from "./components/companySettings/BasicInfoSlide";
import GoogleDriveSlide from "./components/companySettings/GoogleDriveSlide";

export type EditingSection = 'basic' | 'bank' | 'email' | 'google-drive' | 'signature' | null;

const CompanySettingsPage = forwardRef<{ handleSave: () => void }>((props, ref) => {
    const { showSuccess, showError } = useNotifications();
    const googleDriveSlideRef = useRef<{ showInstructionModal: () => void }>(null);
    const [formData, setFormData] = useState<CompanySettingsResponse | null>(null);
    const [originalData, setOriginalData] = useState<CompanySettingsResponse | null>(null);
    const [editingSection, setEditingSection] = useState<EditingSection>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

    // Hook do ostrzegania o niezapisanych zmianach
    const hasUnsavedChanges = editingSection !== null;
    useUnsavedChangesWarning({
        hasUnsavedChanges,
        message: 'Masz niezapisane zmiany w ustawieniach firmy. Czy na pewno chcesz opuścić tę stronę?'
    });

    const handleShowGoogleDriveInstruction = () => {
        googleDriveSlideRef.current?.showInstructionModal();
    };

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

            // Handle different section types
            if (editingSection === 'signature') {
                // For signature section, don't return - let the UserSignatureSlide component
                // handle the save via useEffect that watches the 'saving' state
                return;
            }

            if (editingSection === 'email') {
                // Email settings are handled by EmailSettingsSlide component
                return;
            }

            if (editingSection === 'google-drive') {
                // Google Drive settings are handled by GoogleDriveSlide component
                return;
            }

            // For basic and bank settings, save to company settings API
            if (editingSection === 'basic' || editingSection === 'bank') {
                // Create a copy of basicInfo without taxId to prevent sending it to server
                const { taxId, ...basicInfoWithoutTaxId } = formData.basicInfo;

                const updateRequest = {
                    basicInfo: basicInfoWithoutTaxId,
                    bankSettings: formData.bankSettings,
                    logoSettings: formData.logoSettings
                };

                const updatedData = await companySettingsApi.updateCompanySettings(updateRequest);

                setFormData(updatedData);
                setOriginalData(updatedData);
                setEditingSection(null);
                showSuccess('Ustawienia zostały zapisane pomyślnie');
            }
        } catch (err) {
            console.error('Error saving company settings:', err);
            showError('Nie udało się zapisać ustawień');
        } finally {
            // Only set saving to false for non-async sections
            if (editingSection !== 'signature' && editingSection !== 'email' && editingSection !== 'google-drive') {
                setSaving(false);
            }
        }
    };

    const handleSaveSection = async (section: EditingSection) => {
        if (!section) return;
        await handleSaveAll();
    };

    const handleCancelSection = (section: EditingSection) => {
        if (!section) return;

        // Handle signature section differently
        if (section === 'signature') {
            setEditingSection(null);
            return;
        }

        // Handle email section differently
        if (section === 'email') {
            setEditingSection(null);
            return;
        }

        // Handle google-drive section differently
        if (section === 'google-drive') {
            setEditingSection(null);
            return;
        }

        if (!originalData) return;
        setFormData(originalData);
        setEditingSection(null);
        setError(null);
    };

    // Navigation handlers with editing check
    const handlePrevious = () => {
        if (editingSection) {
            // This will be blocked by SectionSlider guard
            return;
        }
        setCurrentSectionIndex(prev => Math.max(0, prev - 1));
        setEditingSection(null);
    };

    const handleNext = () => {
        if (editingSection) {
            // This will be blocked by SectionSlider guard
            return;
        }
        setCurrentSectionIndex(prev => Math.min(sections.length - 1, prev + 1));
        setEditingSection(null);
    };

    const handleSectionChange = (index: number) => {
        if (editingSection) {
            // This will be blocked by SectionSlider guard
            return;
        }
        setCurrentSectionIndex(index);
        setEditingSection(null);
    };

    const handleStartEdit = () => {
        const currentSectionId = sections[currentSectionIndex].id;
        if (currentSectionId === 'basic' || currentSectionId === 'bank' || currentSectionId === 'email' || currentSectionId === 'google-drive' || currentSectionId === 'signature') {
            setEditingSection(currentSectionId as EditingSection);
        }
    };

    const handleSaveCurrentSection = () => {
        handleSaveSection(editingSection);
    };

    const handleCancelCurrentSection = () => {
        handleCancelSection(editingSection);
    };

    // Completion callbacks for async sections
    const handleSignatureSaveComplete = () => {
        setEditingSection(null);
        setSaving(false);
    };

    const handleSignatureCancelComplete = () => {
        setEditingSection(null);
    };

    const handleEmailSaveComplete = () => {
        setEditingSection(null);
        setSaving(false);
    };

    const handleEmailCancelComplete = () => {
        setEditingSection(null);
        setSaving(false);
    };

    const handleGoogleDriveSaveComplete = () => {
        setEditingSection(null);
        setSaving(false);
    };

    const handleGoogleDriveCancelComplete = () => {
        setEditingSection(null);
        setSaving(false);
    };

    const currentSectionId = sections[currentSectionIndex].id;
    const showEditControls = currentSectionId === 'basic' || currentSectionId === 'bank' || currentSectionId === 'email' || currentSectionId === 'google-drive' || currentSectionId === 'signature';
    const isCurrentSectionEditing = editingSection === currentSectionId;

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

    // Common props for all components
    const commonProps = {
        data: formData,
        isEditing: isCurrentSectionEditing,
        saving: saving,
        onStartEdit: handleStartEdit,
        onSave: handleSaveCurrentSection,
        onCancel: handleCancelCurrentSection,
        onChange: handleInputChange,
        onSuccess: showSuccess,
        onError: showError
    };

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
                isEditing={isCurrentSectionEditing}
                saving={saving}
                onStartEdit={handleStartEdit}
                onSave={handleSaveCurrentSection}
                onCancel={handleCancelCurrentSection}
                showEditControls={showEditControls}
                onShowInstruction={currentSectionId === 'google-drive' ? handleShowGoogleDriveInstruction : undefined}
            />

            <SlideContainer>
                {/* Render components conditionally with appropriate props */}
                {currentSectionId === 'basic' && (
                    <BasicInfoSlide {...commonProps} />
                )}
                {currentSectionId === 'bank' && (
                    <BankSettingsSlide {...commonProps} />
                )}
                {currentSectionId === 'email' && (
                    <EmailSettingsSlide
                        data={formData}
                        isEditing={isCurrentSectionEditing}
                        saving={saving}
                        onStartEdit={handleStartEdit}
                        onSave={handleEmailSaveComplete}
                        onCancel={handleEmailCancelComplete}
                        onChange={handleInputChange}
                        onSuccess={showSuccess}
                        onError={showError}
                    />
                )}
                {currentSectionId === 'google-drive' && (
                    <GoogleDriveSlide
                        ref={googleDriveSlideRef}
                        data={formData}
                        isEditing={isCurrentSectionEditing}
                        saving={saving}
                        onStartEdit={handleStartEdit}
                        onSave={handleGoogleDriveSaveComplete}
                        onCancel={handleGoogleDriveCancelComplete}
                        onChange={handleInputChange}
                        onSuccess={showSuccess}
                        onError={showError}
                    />
                )}
                {currentSectionId === 'signature' && (
                    <UserSignatureSlide
                        data={formData}
                        isEditing={isCurrentSectionEditing}
                        saving={saving}
                        onStartEdit={handleStartEdit}
                        onSave={handleSignatureSaveComplete}
                        onCancel={handleSignatureCancelComplete}
                        onChange={handleInputChange}
                        onSuccess={showSuccess}
                        onError={showError}
                    />
                )}
            </SlideContainer>
        </PageContainer>
    );
});

export default CompanySettingsPage;