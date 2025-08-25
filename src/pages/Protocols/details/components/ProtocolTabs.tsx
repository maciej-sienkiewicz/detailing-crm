import React from 'react';
import styled from 'styled-components';
import {FaComments, FaFileInvoiceDollar, FaImages, FaInfo} from 'react-icons/fa';

// Automotive-Grade Design System
const automotiveTheme = {
    // Primary Brand Colors
    primary: 'var(--brand-primary, #2563eb)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',

    // Professional Surfaces
    surface: '#ffffff',
    surfaceDark: '#f8fafc',
    surfaceElevated: '#ffffff',

    // Industrial Typography
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#64748b',

    // Technical Borders
    borderPrimary: '#e2e8f0',
    borderLight: '#f1f5f9',

    // Professional Spacing
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
    },

    // Technical Radius
    radius: {
        sm: '4px',
        md: '6px',
        lg: '8px'
    },

    // Industrial Shadows
    shadowSubtle: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    shadowElevated: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
};

// Define tab types
type TabType = 'summary' | 'comments' | 'invoices' | 'client' | 'vehicle' | 'gallery';

interface TabConfig {
    id: TabType;
    label: string;
    icon: React.ReactElement;
}

const tabsConfig: TabConfig[] = [
    {
        id: 'summary',
        label: 'Przegląd',
        icon: <FaInfo />
    },
    {
        id: 'comments',
        label: 'Komunikacja',
        icon: <FaComments />
    },
    {
        id: 'invoices',
        label: 'Koszta zlecenia',
        icon: <FaFileInvoiceDollar />
    },
    {
        id: 'gallery',
        label: 'Dokumentacja',
        icon: <FaImages />
    }
];

interface ProtocolTabsProps {
    activeTab: TabType;
    onChange: (tab: TabType) => void;
}

const ProtocolTabs: React.FC<ProtocolTabsProps> = ({ activeTab, onChange }) => {
    return (
        <TabsContainer>
            <TabsHeader>
                <TabsWrapper>
                    {tabsConfig.map((tab) => (
                        <TabItem
                            key={tab.id}
                            $active={activeTab === tab.id}
                            onClick={() => onChange(tab.id)}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onChange(tab.id);
                                }
                            }}
                        >
                            <TabIconContainer $active={activeTab === tab.id}>
                                {tab.icon}
                            </TabIconContainer>
                            <TabLabel $active={activeTab === tab.id}>
                                {tab.label}
                            </TabLabel>
                            {activeTab === tab.id && <ActiveIndicator />}
                        </TabItem>
                    ))}
                </TabsWrapper>
            </TabsHeader>
        </TabsContainer>
    );
};

// Automotive Professional Styled Components
const TabsContainer = styled.div`
    background: ${automotiveTheme.surface};
    border: 1px solid ${automotiveTheme.borderPrimary};
    border-radius: ${automotiveTheme.radius.lg} ${automotiveTheme.radius.lg} 0 0;
    overflow: hidden;
`;

const TabsHeader = styled.div`
    background: ${automotiveTheme.surfaceDark};
    border-bottom: 1px solid ${automotiveTheme.borderPrimary};
`;

const TabsWrapper = styled.div`
    display: flex;
    position: relative;
    overflow-x: auto;
    overflow-y: hidden;
    
    /* Professional scrollbar */
    &::-webkit-scrollbar {
        height: 2px;
    }
    
    &::-webkit-scrollbar-track {
        background: ${automotiveTheme.borderLight};
    }
    
    &::-webkit-scrollbar-thumb {
        background: ${automotiveTheme.textMuted};
        border-radius: 1px;
    }

    @media (max-width: 768px) {
        -webkit-overflow-scrolling: touch;
    }
`;

const TabItem = styled.button<{ $active: boolean }>`
    flex: 1;
    min-width: 120px;
    position: relative;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${automotiveTheme.spacing.sm};
    padding: ${automotiveTheme.spacing.md};
    
    &:hover:not([aria-selected="true"]) {
        background: rgba(37, 99, 235, 0.04);
    }

    &:focus-visible {
        outline: 2px solid ${automotiveTheme.primary};
        outline-offset: -2px;
        z-index: 1;
    }

    @media (max-width: 768px) {
        min-width: 100px;
        flex-shrink: 0;
        padding: ${automotiveTheme.spacing.sm};
        gap: ${automotiveTheme.spacing.xs};
    }
`;

const TabIconContainer = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: ${props => props.$active ? automotiveTheme.primary : automotiveTheme.textMuted};
    font-size: 16px;
    transition: color 0.2s ease;

    ${TabItem}:hover & {
        color: ${automotiveTheme.primary};
    }

    @media (max-width: 768px) {
        width: 20px;
        height: 20px;
        font-size: 14px;
    }
`;

const TabLabel = styled.div<{ $active: boolean }>`
    font-size: 13px;
    font-weight: ${props => props.$active ? '600' : '500'};
    color: ${props => props.$active ? automotiveTheme.textPrimary : automotiveTheme.textSecondary};
    line-height: 1.2;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    ${TabItem}:hover & {
        color: ${automotiveTheme.textPrimary};
    }

    @media (max-width: 768px) {
        font-size: 11px;
    }
`;

const ActiveIndicator = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${automotiveTheme.primary};
`;

export default ProtocolTabs;