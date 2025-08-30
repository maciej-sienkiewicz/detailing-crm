// src/pages/Settings/SettingsPageWithTabs.tsx - Professional full-width tabs design
import React, {useRef, useState} from 'react';
import styled from 'styled-components';
import {FaBuilding, FaCalendarAlt, FaCog, FaFileAlt, FaPalette, FaSave, FaUser, FaWrench} from 'react-icons/fa';

// Import existing components
import EmployeesPage from './EmployeesPage';
import ServicesPage from './ServicesPage';
import BrandThemeSettingsPage from './BrandThemeSettingsPage';
import CalendarColorsPage from './CalendarColorsPage';
import CompanySettingsPage from './CompanySettingsPage';
import TemplatesPage from "./TemplatesPage";

// Import styles and utilities
import {settingsTheme} from './styles/theme';

type ActiveTab = 'company' | 'employees' | 'services' | 'visual-personalization' | 'calendar-colors' | 'templates';

// Updated interfaces for ref communication
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

    // Component refs
    const companySettingsRef = useRef<CompanySettingsRef>(null);
    const employeesPageRef = useRef<EmployeesPageRef>(null);
    const servicesPageRef = useRef<ServicesPageRef>(null);
    const calendarColorsPageRef = useRef<CalendarColorsPageRef>(null);
    const brandThemeSettingsRef = useRef<BrandThemeSettingsRef>(null);
    const templatesPageRef = useRef<TemplatesPageRef>(null);

    // Tab configuration
    const tabs = [
        {
            id: 'company' as ActiveTab,
            label: 'Ustawienia firmy',
            icon: FaBuilding,
            description: 'Dane firmy, bank, email i integracje'
        },
        {
            id: 'services' as ActiveTab,
            label: 'Usługi',
            icon: FaWrench,
            description: 'Lista usług i cennik'
        },
        {
            id: 'templates' as ActiveTab,
            label: 'Szablony',
            icon: FaFileAlt,
            description: 'Zarządzanie szablonami dokumentów'
        },
        {
            id: 'visual-personalization' as ActiveTab,
            label: 'Personalizacja',
            icon: FaPalette,
            description: 'Kolor marki i logo firmy'
        },
        {
            id: 'calendar-colors' as ActiveTab,
            label: 'Kolory kalendarza',
            icon: FaCalendarAlt,
            description: 'Kolory dla pracowników i usług'
        }
    ];

    // Handle tab change
    const handleTabChange = (tabId: ActiveTab) => {
        setActiveTab(tabId);
    };

    // Action handlers for different tabs
    const handleCompanySaveSettings = () => {
        companySettingsRef.current?.handleSave();
    };

    const handleAddTemplate = () => {
        templatesPageRef.current?.handleAddTemplate();
    };

    const handleSaveBrandTheme = () => {
        brandThemeSettingsRef.current?.handleSave();
    };

    const handleAddEmployee = () => {
        employeesPageRef.current?.handleAddEmployee();
    };

    const handleAddService = () => {
        servicesPageRef.current?.handleAddService();
    };

    const handleAddCalendarColor = () => {
        calendarColorsPageRef.current?.handleAddColor();
    };

    return (
        <PageContainer>
            {/* Normal Header - scrolls away with content */}
            <HeaderContainer>
                <HeaderContent>
                    <HeaderLeft>
                        <HeaderIcon>
                            <FaCog />
                        </HeaderIcon>
                        <HeaderText>
                            <HeaderTitle>Ustawienia</HeaderTitle>
                            <HeaderSubtitle>
                                Konfiguracja systemu i zarządzanie danymi
                            </HeaderSubtitle>
                        </HeaderText>
                    </HeaderLeft>

                    <HeaderActions>
                        {activeTab === 'visual-personalization' && (
                            <PrimaryButton onClick={handleSaveBrandTheme}>
                                <FaPalette />
                                <span>Zapisz personalizację</span>
                            </PrimaryButton>
                        )}

                        {activeTab === 'employees' && (
                            <PrimaryButton onClick={handleAddEmployee}>
                                <FaUser />
                                <span>Dodaj pracownika</span>
                            </PrimaryButton>
                        )}

                        {activeTab === 'services' && (
                            <PrimaryButton onClick={handleAddService}>
                                <FaWrench />
                                <span>Dodaj usługę</span>
                            </PrimaryButton>
                        )}

                        {activeTab === 'calendar-colors' && (
                            <PrimaryButton onClick={handleAddCalendarColor}>
                                <FaPalette />
                                <span>Dodaj kolor</span>
                            </PrimaryButton>
                        )}

                        {activeTab === 'templates' && (
                            <PrimaryButton onClick={handleAddTemplate}>
                                <FaFileAlt />
                                <span>Dodaj szablon</span>
                            </PrimaryButton>
                        )}
                    </HeaderActions>
                </HeaderContent>

                {/* Professional full-width Tab Navigation */}
                <TabNavigation>
                    <TabsList>
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <TabButton
                                    key={tab.id}
                                    $active={isActive}
                                    onClick={() => handleTabChange(tab.id)}
                                >
                                    <TabIcon $active={isActive}>
                                        <Icon />
                                    </TabIcon>
                                    <TabContent>
                                        <TabLabel $active={isActive}>{tab.label}</TabLabel>
                                        <TabDescription $active={isActive}>{tab.description}</TabDescription>
                                    </TabContent>
                                </TabButton>
                            );
                        })}
                    </TabsList>
                </TabNavigation>
            </HeaderContainer>

            {/* Normal scrollable content */}
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

// Fixed Styled Components - removed all sticky positioning
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${settingsTheme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const HeaderContainer = styled.header`
    background: ${settingsTheme.surface};
    border-bottom: 1px solid ${settingsTheme.border};
    box-shadow: ${settingsTheme.shadow.sm};
`;

const HeaderContent = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${settingsTheme.spacing.lg} ${settingsTheme.spacing.xl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${settingsTheme.spacing.lg};

    @media (max-width: 1024px) {
        padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
        flex-direction: column;
        align-items: stretch;
        gap: ${settingsTheme.spacing.md};
    }

    @media (max-width: 768px) {
        padding: ${settingsTheme.spacing.md};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    min-width: 0;
    flex: 1;
`;

const HeaderIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${settingsTheme.primary} 0%, ${settingsTheme.primaryLight} 100%);
    border-radius: ${settingsTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${settingsTheme.shadow.md};
    flex-shrink: 0;
`;

const HeaderText = styled.div`
    min-width: 0;
    flex: 1;
`;

const HeaderTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${settingsTheme.text.primary};
    margin: 0 0 ${settingsTheme.spacing.xs} 0;
    letter-spacing: -0.025em;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const HeaderSubtitle = styled.p`
    color: ${settingsTheme.text.secondary};
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.4;

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.sm};
    align-items: center;
    flex-wrap: wrap;

    @media (max-width: 1024px) {
        justify-content: flex-end;
        width: 100%;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${settingsTheme.spacing.xs};

        > * {
            width: 100%;
        }
    }
`;

const PrimaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, ${settingsTheme.primary} 0%, ${settingsTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${settingsTheme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, ${settingsTheme.primaryDark} 0%, ${settingsTheme.primary} 100%);
        box-shadow: ${settingsTheme.shadow.md};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

// UPDATED: Professional full-width tab design
const TabNavigation = styled.div`
    background: ${settingsTheme.surfaceAlt};
    border-top: 1px solid ${settingsTheme.border};
`;

const TabsList = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 ${settingsTheme.spacing.xl};
    display: flex;
    background: transparent;
    gap: 0;
    position: relative;

    /* Bottom border line */
    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: ${settingsTheme.spacing.xl};
        right: ${settingsTheme.spacing.xl};
        height: 1px;
        background: ${settingsTheme.border};
        z-index: 0;
    }

    @media (max-width: 1024px) {
        padding: 0 ${settingsTheme.spacing.lg};

        &::after {
            left: ${settingsTheme.spacing.lg};
            right: ${settingsTheme.spacing.lg};
        }
    }

    @media (max-width: 768px) {
        padding: 0 ${settingsTheme.spacing.md};

        &::after {
            left: ${settingsTheme.spacing.md};
            right: ${settingsTheme.spacing.md};
        }
    }
`;

const TabButton = styled.button<{ $active: boolean }>`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${settingsTheme.spacing.lg};
    padding: ${settingsTheme.spacing.xl} ${settingsTheme.spacing.lg};
    border: none;
    background: transparent;
    color: ${props => props.$active ? settingsTheme.primary : settingsTheme.text.tertiary};
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    font-weight: ${props => props.$active ? '700' : '500'};
    z-index: 1;
    border-bottom: 3px solid transparent;

    /* Active tab bottom border */
    ${props => props.$active && `
        border-bottom-color: ${settingsTheme.primary};
        background: linear-gradient(135deg, ${settingsTheme.surface} 0%, ${settingsTheme.surfaceElevated} 100%);
        
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: -1px;
            background: ${settingsTheme.surface};
            border-radius: ${settingsTheme.radius.md} ${settingsTheme.radius.md} 0 0;
            z-index: -1;
            box-shadow: 
                0 -2px 8px rgba(0, 0, 0, 0.04),
                inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }
    `}

    &:hover {
        color: ${props => props.$active ? settingsTheme.primaryDark : settingsTheme.primary};
        background: ${props => props.$active
    ? `linear-gradient(135deg, ${settingsTheme.surface} 0%, ${settingsTheme.surfaceHover} 100%)`
    : 'rgba(255, 255, 255, 0.5)'
};

        ${props => !props.$active && `
            border-bottom-color: ${settingsTheme.border};
        `}
    }

    &:active {
        transform: none;
    }

    @media (max-width: 768px) {
        padding: ${settingsTheme.spacing.lg} ${settingsTheme.spacing.md};
        gap: ${settingsTheme.spacing.md};
    }
`;

const TabIcon = styled.div<{ $active?: boolean }>`
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
    border-radius: ${settingsTheme.radius.sm};
    background: ${props => props.$active
            ? `${settingsTheme.primary}10`
            : 'transparent'
    };
    transition: all 0.3s ease;

    ${props => props.$active && `
        color: ${settingsTheme.primary};
    `}

    @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: 14px;
}
`;

const TabContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 0;

    @media (max-width: 768px) {
        align-items: center;
    }
`;

const TabLabel = styled.div<{ $active?: boolean }>`
    font-size: 16px;
    font-weight: ${props => props.$active ? '700' : '600'};
    line-height: 1.2;
    letter-spacing: ${props => props.$active ? '-0.025em' : '0'};
    text-align: center;

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const TabDescription = styled.div<{ $active?: boolean }>`
    font-size: 13px;
    font-weight: 500;
    opacity: ${props => props.$active ? '0.8' : '0.6'};
    line-height: 1.2;
    color: ${props => props.$active ? settingsTheme.text.secondary : settingsTheme.text.tertiary};
    text-align: center;
    max-width: 200px;

    @media (max-width: 768px) {
        font-size: 12px;
        display: none; /* Hide description on mobile to save space */
    }
`;

const ContentContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

export default SettingsPageWithTabs;