// src/pages/Settings/SettingsPageWithTabs.tsx - Updated for simplified brand theme
import React, {useRef, useState} from 'react';
import styled from 'styled-components';
import {FaBuilding, FaCalendarAlt, FaCog, FaFileInvoice, FaPalette, FaSave, FaUser, FaWrench} from 'react-icons/fa';

// Import existing components
import EmployeesPage from './EmployeesPage';
import ServicesPage from './ServicesPage';
import BrandThemeSettingsPage from './BrandThemeSettingsPage'; // Updated component
import CalendarColorsPage from './CalendarColorsPage';
import CompanySettingsPage from './CompanySettingsPage';
import InvoiceTemplatesPage from "./InvoiceTemplatesPage";

// Import styles and utilities
import {settingsTheme} from './styles/theme';

type ActiveTab = 'company' | 'employees' | 'services' | 'visual-personalization' | 'calendar-colors' | 'invoice-templates';

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

interface InvoiceTemplatesPageRef {
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
    const invoiceTemplatesPageRef = useRef<InvoiceTemplatesPageRef>(null);

    // Tab configuration - Updated description for visual-personalization
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
            id: 'visual-personalization' as ActiveTab,
            label: 'Personalizacja',
            icon: FaPalette,
            description: 'Kolor marki i logo firmy' // Simplified description
        },
        {
            id: 'calendar-colors' as ActiveTab,
            label: 'Kolory kalendarza',
            icon: FaCalendarAlt,
            description: 'Kolory dla pracowników i usług'
        },
        {
            id: 'invoice-templates' as ActiveTab,
            label: 'Szablony faktur',
            icon: FaFileInvoice,
            description: 'Zarządzanie szablonami HTML dla faktur'
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

    const handleAddInvoiceTemplate = () => {
        invoiceTemplatesPageRef.current?.handleAddTemplate();
    };

    // Updated handler name for consistency
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
                        {/* Updated button text for visual personalization */}
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

                        {activeTab === 'invoice-templates' && (
                            <PrimaryButton onClick={handleAddInvoiceTemplate}>
                                <FaFileInvoice />
                                <span>Dodaj szablon</span>
                            </PrimaryButton>
                        )}
                    </HeaderActions>
                </HeaderContent>

                {/* Tab Navigation */}
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

            {/* Tab Content */}
            <ContentContainer>
                {activeTab === 'company' && <CompanySettingsPage ref={companySettingsRef} />}
                {activeTab === 'employees' && <EmployeesPage ref={employeesPageRef} />}
                {activeTab === 'services' && <ServicesPage ref={servicesPageRef} />}
                {activeTab === 'visual-personalization' && <BrandThemeSettingsPage ref={brandThemeSettingsRef} />}
                {activeTab === 'calendar-colors' && <CalendarColorsPage ref={calendarColorsPageRef} />}
                {activeTab === 'invoice-templates' && <InvoiceTemplatesPage ref={invoiceTemplatesPageRef} />}
            </ContentContainer>
        </PageContainer>
    );
};

// Styled Components remain the same as in the original file
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
    padding: ${settingsTheme.spacing.lg} ${settingsTheme.spacing.xl};
    background: ${settingsTheme.surface};
    display: flex;
    justify-content: center;
    border-top: 1px solid ${settingsTheme.border};

    @media (max-width: 1024px) {
        padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: ${settingsTheme.spacing.md};
    }
`;

const TabsList = styled.div`
    display: flex;
    background: ${settingsTheme.surfaceAlt};
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.xxl};
    padding: 6px;
    box-shadow: ${settingsTheme.shadow.sm};
    position: relative;
    overflow: hidden;
    gap: 4px;

    /* Dodajemy subtelny gradient w tle */
    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, ${settingsTheme.surfaceAlt} 0%, ${settingsTheme.surfaceElevated} 100%);
        border-radius: inherit;
        z-index: 0;
    }

    /* Obsługa overflow na mobilnych */
    @media (max-width: 1200px) {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        justify-content: flex-start;
        width: 100%;

        &::-webkit-scrollbar {
            display: none;
        }
    }

    @media (max-width: 768px) {
        padding: 4px;
        gap: 2px;
    }
`;

const TabButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    padding: ${settingsTheme.spacing.lg} ${settingsTheme.spacing.xl};
    border: none;
    background: ${props => props.$active
            ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            : 'transparent'
    };
    color: ${props => props.$active ? settingsTheme.primary : settingsTheme.text.secondary};
    border-radius: ${settingsTheme.radius.xl};
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    min-width: 180px;
    white-space: nowrap;
    font-weight: ${props => props.$active ? '700' : '500'};
    z-index: 1;
    flex-shrink: 0;

    /* Efekt cienia dla aktywnej zakładki */
    box-shadow: ${props => props.$active
            ? `0 4px 12px -2px rgba(26, 54, 93, 0.15), 0 2px 6px -1px rgba(26, 54, 93, 0.1)`
            : 'none'
    };

    /* Border highlight dla aktywnej zakładki */
    ${props => props.$active && `
        border: 1px solid ${settingsTheme.primary}20;
        
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, ${settingsTheme.primary} 0%, ${settingsTheme.primaryLight} 100%);
            border-radius: ${settingsTheme.radius.sm} ${settingsTheme.radius.sm} 0 0;
        }
    `}

    &:hover {
        background: ${props => props.$active
                ? 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)'
                : 'rgba(255, 255, 255, 0.7)'
        };
        color: ${props => props.$active ? settingsTheme.primaryDark : settingsTheme.primary};
        transform: ${props => props.$active ? 'none' : 'translateY(-1px)'};

        ${props => !props.$active && `
            box-shadow: 0 2px 8px -1px rgba(26, 54, 93, 0.1);
        `}
    }

    &:active {
        transform: translateY(0);
    }

    @media (max-width: 768px) {
        min-width: 140px;
        padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
        gap: ${settingsTheme.spacing.sm};
    }
`;

const TabIcon = styled.div<{ $active?: boolean }>`
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    border-radius: ${settingsTheme.radius.md};
    background: ${props => props.$active
            ? `linear-gradient(135deg, ${settingsTheme.primary}15 0%, ${settingsTheme.primary}08 100%)`
            : 'transparent'
    };
    transition: all 0.3s ease;

    ${props => props.$active && `
        color: ${settingsTheme.primary};
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
    `}

    @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 14px;
}
`;

const TabContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    min-width: 0;
`;

const TabLabel = styled.div<{ $active?: boolean }>`
    font-size: 15px;
    font-weight: ${props => props.$active ? '700' : '600'};
    line-height: 1.2;
    letter-spacing: ${props => props.$active ? '-0.025em' : '0'};

    @media (max-width: 768px) {
        font-size: 13px;
    }
`;

const TabDescription = styled.div<{ $active?: boolean }>`
    font-size: 12px;
    font-weight: 500;
    opacity: ${props => props.$active ? '0.9' : '0.7'};
    line-height: 1.2;
    color: ${props => props.$active ? settingsTheme.text.secondary : settingsTheme.text.tertiary};

    @media (max-width: 768px) {
        font-size: 11px;
    }
`;

const ContentContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

export default SettingsPageWithTabs;