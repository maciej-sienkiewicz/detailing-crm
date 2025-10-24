// src/pages/Settings/SettingsPageWithTabs.tsx
import React, {useRef, useState} from 'react';
import styled from 'styled-components';
import {FaBuilding, FaCalendarAlt, FaCog, FaFileAlt, FaPalette, FaUser, FaWrench} from 'react-icons/fa';
import { PageHeader, PrimaryButton } from '../../components/common/PageHeader';

import EmployeesPage from './EmployeesPage';
import ServicesPage from './ServicesPage';
import BrandThemeSettingsPage from './BrandThemeSettingsPage';
import CalendarColorsPage from './CalendarColorsPage';
import CompanySettingsPage from './CompanySettingsPage';
import TemplatesPage from "./TemplatesPage";
import {settingsTheme} from './styles/theme';

type ActiveTab = 'company' | 'employees' | 'services' | 'visual-personalization' | 'calendar-colors' | 'templates';

interface CompanySettingsRef {
    handleSave: () => void;
}

interface EmployeesPageRef {
    handleAddEmployee: () => void;
}

interface ServicesPageRef {
    handleAddService: () => void;
}

interface CalendarColorsPageRef {
    handleAddColor: () => void;
}

interface TemplatesPageRef {
    handleAddTemplate: () => void;
}

interface BrandThemeSettingsRef {
    handleSave: () => void;
}

const SettingsPageWithTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('company');

    const companySettingsRef = useRef<CompanySettingsRef>(null);
    const employeesPageRef = useRef<EmployeesPageRef>(null);
    const servicesPageRef = useRef<ServicesPageRef>(null);
    const calendarColorsPageRef = useRef<CalendarColorsPageRef>(null);
    const brandThemeSettingsRef = useRef<BrandThemeSettingsRef>(null);
    const templatesPageRef = useRef<TemplatesPageRef>(null);

    const tabs = [
        {
            id: 'company' as ActiveTab,
            label: 'Firma',
            icon: FaBuilding,
            description: 'Dane i integracje'
        },
        {
            id: 'services' as ActiveTab,
            label: 'Usługi',
            icon: FaWrench,
            description: 'Lista i cennik'
        },
        {
            id: 'templates' as ActiveTab,
            label: 'Szablony',
            icon: FaFileAlt,
            description: 'Dokumenty'
        },
        {
            id: 'visual-personalization' as ActiveTab,
            label: 'Wygląd',
            icon: FaPalette,
            description: 'Kolor i logo'
        },
        {
            id: 'calendar-colors' as ActiveTab,
            label: 'Kolory',
            icon: FaCalendarAlt,
            description: 'Kalendarz'
        }
    ];

    const handleTabChange = (tabId: ActiveTab) => {
        setActiveTab(tabId);
    };

    const getActionButton = () => {
        switch (activeTab) {
            case 'visual-personalization':
                return (
                    <PrimaryButton onClick={() => brandThemeSettingsRef.current?.handleSave()}>
                        <FaPalette />
                        <span>Zapisz</span>
                    </PrimaryButton>
                );
            case 'employees':
                return (
                    <PrimaryButton onClick={() => employeesPageRef.current?.handleAddEmployee()}>
                        <FaUser />
                        <span>Dodaj pracownika</span>
                    </PrimaryButton>
                );
            case 'services':
                return (
                    <PrimaryButton onClick={() => servicesPageRef.current?.handleAddService()}>
                        <FaWrench />
                        <span>Dodaj usługę</span>
                    </PrimaryButton>
                );
            case 'calendar-colors':
                return (
                    <PrimaryButton onClick={() => calendarColorsPageRef.current?.handleAddColor()}>
                        <FaPalette />
                        <span>Dodaj kolor</span>
                    </PrimaryButton>
                );
            case 'templates':
                return (
                    <PrimaryButton onClick={() => templatesPageRef.current?.handleAddTemplate()}>
                        <FaFileAlt />
                        <span>Dodaj szablon</span>
                    </PrimaryButton>
                );
            default:
                return null;
        }
    };

    return (
        <PageContainer>
            <PageHeader
                icon={FaCog}
                title="Ustawienia"
                subtitle="Konfiguracja systemu"
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                actions={getActionButton()}
            />

            <ContentContainer>
                {activeTab === 'company' && <CompanySettingsPage ref={companySettingsRef} />}
                {activeTab === 'employees' && <EmployeesPage ref={employeesPageRef} />}
                {activeTab === 'services' && <ServicesPage ref={servicesPageRef} />}
                {activeTab === 'templates' && <TemplatesPage ref={templatesPageRef} />}
                {activeTab === 'visual-personalization' && <BrandThemeSettingsPage ref={brandThemeSettingsRef} />}
                {activeTab === 'calendar-colors' && <CalendarColorsPage ref={calendarColorsPageRef} />}
            </ContentContainer>
        </PageContainer>
    );
};

const PageContainer = styled.div`
    min-height: 100vh;
    background: ${settingsTheme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const ContentContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

export default SettingsPageWithTabs;