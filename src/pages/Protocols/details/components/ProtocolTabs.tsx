import React from 'react';
import styled from 'styled-components';
import {FaComments, FaFileInvoiceDollar, FaImages, FaInfo} from 'react-icons/fa';

const automotiveTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',

    surface: '#ffffff',
    surfaceDark: '#f8fafc',
    surfaceElevated: '#ffffff',

    textPrimary: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#64748b',

    borderPrimary: '#e2e8f0',
    borderLight: '#f1f5f9',

    spacing: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px'
    },

    radius: {
        sm: '4px',
        md: '6px',
        lg: '8px'
    }
};

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
    min-width: 100px;
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
        min-width: 80px;
        flex-shrink: 0;
        padding: ${automotiveTheme.spacing.sm};
        gap: ${automotiveTheme.spacing.xs};
    }
`;

const TabIconContainer = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: ${props => props.$active ? automotiveTheme.primary : automotiveTheme.textMuted};
    font-size: 13px;
    transition: color 0.2s ease;

    ${TabItem}:hover & {
        color: ${automotiveTheme.primary};
    }

    @media (max-width: 768px) {
        width: 16px;
        height: 16px;
        font-size: 12px;
    }
`;

const TabLabel = styled.div<{ $active: boolean }>`
    font-size: 11px;
    font-weight: ${props => props.$active ? '600' : '500'};
    color: ${props => props.$active ? automotiveTheme.textPrimary : automotiveTheme.textSecondary};
    line-height: 1.2;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.3px;

    ${TabItem}:hover & {
        color: ${automotiveTheme.textPrimary};
    }

    @media (max-width: 768px) {
        font-size: 10px;
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