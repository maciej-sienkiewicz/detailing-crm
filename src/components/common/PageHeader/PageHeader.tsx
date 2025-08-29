// src/components/common/PageHeader/PageHeader.tsx
import React from 'react';
import styled from 'styled-components';

const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b'
    },
    border: '#e2e8f0',
    borderHover: '#cbd5e1',
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    },
    transitions: {
        normal: '0.2s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }
};

export interface Tab<T extends React.Key = string> {
    id: T;
    label: string;
    icon: React.ComponentType;
    description: string;
}

interface PageHeaderProps<T extends React.Key = string> {
    icon: React.ComponentType;
    title: string;
    subtitle: string;
    actions?: React.ReactNode;
    // Nowe props dla zakładek
    tabs?: Tab<T>[];
    activeTab?: T;
    onTabChange?: (tabId: T) => void;
}

export const PageHeader = <T extends React.Key = string>({
                                                             icon: IconComponent,
                                                             title,
                                                             subtitle,
                                                             actions,
                                                             tabs,
                                                             activeTab,
                                                             onTabChange
                                                         }: PageHeaderProps<T>) => {
    return (
        <HeaderContainer>
            <PageHeaderContent>
                <HeaderTitle>
                    <TitleIcon>
                        <IconComponent />
                    </TitleIcon>
                    <TitleContent>
                        <MainTitle>{title}</MainTitle>
                        <Subtitle>{subtitle}</Subtitle>
                    </TitleContent>
                </HeaderTitle>
                {actions && <HeaderActions>{actions}</HeaderActions>}
            </PageHeaderContent>

            {/* Renderowanie zakładek jeśli są dostarczone */}
            {tabs && tabs.length > 0 && (
                <TabNavigation>
                    <TabsList>
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <TabButton
                                    key={tab.id}
                                    $active={isActive}
                                    onClick={() => onTabChange?.(tab.id)}
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
            )}
        </HeaderContainer>
    );
};

const HeaderContainer = styled.header`
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.sm};
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);
`;

const PageHeaderContent = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xxl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.xxl};

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
        flex-direction: column;
        align-items: stretch;
        gap: ${brandTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md};
    }
`;

const HeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xxl};
    min-width: 0;
    flex: 1;
`;

const TitleIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${brandTheme.shadow.md};
    flex-shrink: 0;
`;

const TitleContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
    min-width: 0;
    flex: 1;
`;

const MainTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const Subtitle = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    line-height: 1.4;

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    align-items: center;
    flex-wrap: wrap;

    @media (max-width: 1024px) {
        justify-content: flex-end;
        width: 100%;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${brandTheme.spacing.xs};

        > * {
            width: 100%;
        }
    }
`;

// Komponenty zakładek
const TabNavigation = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xxl};
    background: ${brandTheme.surface};
    display: flex;
    justify-content: center;
    border-top: 1px solid ${brandTheme.border};

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md};
    }
`;

const TabsList = styled.div`
    display: flex;
    background: ${brandTheme.surfaceAlt};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.xxl};
    padding: 6px;
    box-shadow: ${brandTheme.shadow.sm};
    position: relative;
    overflow: hidden;
    gap: 4px;

    /* Gradient w tle */
    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, ${brandTheme.surfaceAlt} 0%, ${brandTheme.surfaceElevated} 100%);
        border-radius: inherit;
        z-index: 0;
    }

    /* Responsywność */
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
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border: none;
    background: ${props => props.$active
            ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            : 'transparent'
    };
    color: ${props => props.$active ? brandTheme.primary : brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.xl};
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    min-width: 180px;
    white-space: nowrap;
    font-weight: ${props => props.$active ? '700' : '500'};
    z-index: 1;
    flex-shrink: 0;

    /* Cień dla aktywnej zakładki */
    box-shadow: ${props => props.$active
            ? `0 4px 12px -2px rgba(26, 54, 93, 0.15), 0 2px 6px -1px rgba(26, 54, 93, 0.1)`
            : 'none'
    };

    /* Border highlight */
    ${props => props.$active && `
        border: 1px solid ${brandTheme.primary}20;
        
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
            border-radius: ${brandTheme.radius.sm} ${brandTheme.radius.sm} 0 0;
        }
    `}

    &:hover {
        background: ${props => props.$active
                ? 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)'
                : 'rgba(255, 255, 255, 0.7)'
        };
        color: ${props => props.$active ? brandTheme.primaryDark : brandTheme.primary};
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
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
        gap: ${brandTheme.spacing.sm};
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
    border-radius: ${brandTheme.radius.md};
    background: ${props => props.$active
            ? `linear-gradient(135deg, ${brandTheme.primary}15 0%, ${brandTheme.primary}08 100%)`
            : 'transparent'
    };
    transition: all 0.3s ease;

    ${props => props.$active && `
        color: ${brandTheme.primary};
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
    color: ${props => props.$active ? brandTheme.text.secondary : brandTheme.text.tertiary};

    @media (max-width: 768px) {
        font-size: 11px;
    }
`;

// Istniejące komponenty przycisków
const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${brandTheme.transitions.spring};
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;

    &:hover {
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

export const PrimaryButton = styled(BaseButton)`
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${brandTheme.shadow.sm};

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

export const SecondaryButton = styled(BaseButton)`
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border-color: ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.sm};

    &:hover:not(:disabled) {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.text.primary};
        border-color: ${brandTheme.borderHover};
        box-shadow: ${brandTheme.shadow.sm};
    }
`;