// src/pages/Settings/SettingsPageWithTabs.tsx
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import {
    FaCog,
    FaUsers,
    FaWrench,
    FaPalette,
    FaCalendarAlt,
    FaUser,
    FaPlus,
    FaBuilding,
    FaExchangeAlt,
    FaSave
} from 'react-icons/fa';

// Import existing components
import EmployeesPage from './EmployeesPage';
import ServicesPage from './ServicesPage';
import BrandThemeSettingsPage from './BrandThemeSettingsPage';
import CalendarColorsPage from './CalendarColorsPage';
import CompanySettingsPage from './CompanySettingsPage';

// Import styles and utilities
import { settingsTheme } from './styles/theme';

type ActiveTab = 'company' | 'employees' | 'services' | 'brand-theme' | 'calendar-colors';

// Interfejsy dla komunikacji z komponentami dziećmi - poprawione typy
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

const SettingsPageWithTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('company');

    // Referencje do komponentów dzieci - poprawione typy
    const companySettingsRef = useRef<CompanySettingsRef>(null);
    const employeesPageRef = useRef<EmployeesPageRef>(null);
    const servicesPageRef = useRef<ServicesPageRef>(null);
    const calendarColorsPageRef = useRef<CalendarColorsPageRef>(null);

    // Tab configuration
    const tabs = [
        {
            id: 'company' as ActiveTab,
            label: 'Ustawienia firmy',
            icon: FaBuilding,
            description: 'Dane firmy, bank, email i logo'
        },
        {
            id: 'employees' as ActiveTab,
            label: 'Pracownicy',
            icon: FaUsers,
            description: 'Zarządzanie zespołem i dokumentacją'
        },
        {
            id: 'services' as ActiveTab,
            label: 'Usługi',
            icon: FaWrench,
            description: 'Lista usług i cennik'
        },
        {
            id: 'brand-theme' as ActiveTab,
            label: 'Kolory marki',
            icon: FaPalette,
            description: 'Personalizacja wyglądu aplikacji'
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

    // Akcje dla poszczególnych zakładek - poprawione z null checking
    const handleCompanySaveSettings = () => {
        companySettingsRef.current?.handleSave();
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

    // Get current tab configuration
    const currentTab = tabs.find(tab => tab.id === activeTab);

    return (
        <PageContainer>
            {/* Header with updated navigation */}
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
                        {activeTab === 'company' && (
                            <PrimaryButton onClick={handleCompanySaveSettings}>
                                <FaSave />
                                <span>Zapisz ustawienia</span>
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
                    </HeaderActions>
                </HeaderContent>

                {/* Tab Navigation */}
                <TabNavigation>
                    <TabsList>
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <TabButton
                                    key={tab.id}
                                    $active={activeTab === tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                >
                                    <TabIcon>
                                        <Icon />
                                    </TabIcon>
                                    <TabContent>
                                        <TabLabel>{tab.label}</TabLabel>
                                        <TabDescription>{tab.description}</TabDescription>
                                    </TabContent>
                                </TabButton>
                            );
                        })}
                    </TabsList>
                </TabNavigation>
            </HeaderContainer>

            {/* Tab Content */}
            <ContentContainer>
                {activeTab === 'company' && <CompanySettingsPage ref={companySettingsRef} />}
                {activeTab === 'employees' && <EmployeesPage ref={employeesPageRef} />}
                {activeTab === 'services' && <ServicesPage ref={servicesPageRef} />}
                {activeTab === 'brand-theme' && <BrandThemeSettingsPage />}
            </ContentContainer>
        </PageContainer>
    );
};

// Styled Components - identyczne jak wcześniej
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
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);
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

const TabNavigation = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 ${settingsTheme.spacing.xl};
    border-top: 1px solid ${settingsTheme.border};

    @media (max-width: 1024px) {
        padding: 0 ${settingsTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${settingsTheme.spacing.md};
    }
`;

const TabsList = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.sm};
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
        display: none;
    }

    @media (max-width: 768px) {
        gap: ${settingsTheme.spacing.xs};
    }
`;

const TabButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
    border: none;
    background: ${props => props.$active ? settingsTheme.surface : 'transparent'};
    color: ${props => props.$active ? settingsTheme.primary : settingsTheme.text.secondary};
    border-radius: ${settingsTheme.radius.lg} ${settingsTheme.radius.lg} 0 0;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    min-width: 180px;
    white-space: nowrap;
    border-bottom: 3px solid ${props => props.$active ? settingsTheme.primary : 'transparent'};

    &:hover {
        background: ${props => props.$active ? settingsTheme.surface : settingsTheme.surfaceHover};
        color: ${props => props.$active ? settingsTheme.primary : settingsTheme.text.primary};
    }

    @media (max-width: 768px) {
        min-width: 140px;
        padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
        gap: ${settingsTheme.spacing.sm};
    }
`;

const TabIcon = styled.div`
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;

    @media (max-width: 768px) {
        width: 24px;
        height: 24px;
        font-size: 14px;
    }
`;

const TabContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    min-width: 0;
`;

const TabLabel = styled.div`
    font-size: 14px;
    font-weight: 600;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 12px;
    }
`;

const TabDescription = styled.div`
    font-size: 12px;
    font-weight: 400;
    opacity: 0.8;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 10px;
    }
`;

const ContentContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

export default SettingsPageWithTabs;