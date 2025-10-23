import React from 'react';
import styled from 'styled-components';
import { theme } from "../../../styles/theme";

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
    background: ${theme.surface};
    border-bottom: 1px solid ${theme.border};
    box-shadow: ${theme.shadow.sm};
`;

const PageHeaderContent = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${theme.spacing.xl};

    @media (max-width: 1024px) {
        padding: ${theme.spacing.md} ${theme.spacing.lg};
        flex-direction: column;
        align-items: stretch;
        gap: ${theme.spacing.md};
    }

    @media (max-width: 768px) {
        padding: ${theme.spacing.md};
    }
`;

const HeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    min-width: 0;
    flex: 1;
`;

const TitleIcon = styled.div`
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
    border-radius: ${theme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: ${theme.fontSize.xxl};
    box-shadow: ${theme.shadow.sm};
    flex-shrink: 0;
`;

const TitleContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    min-width: 0;
    flex: 1;
`;

const MainTitle = styled.h1`
    font-size: ${theme.fontSize.xxxl};
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: ${theme.fontSize.xxl};
    }
`;

const Subtitle = styled.div`
    font-size: ${theme.fontSize.md};
    color: ${theme.text.secondary};
    font-weight: 500;
    line-height: 1.3;

    @media (max-width: 768px) {
        font-size: ${theme.fontSize.base};
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};
    align-items: center;
    flex-wrap: wrap;

    @media (max-width: 1024px) {
        justify-content: flex-end;
        width: 100%;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${theme.spacing.xs};

        > * {
            width: 100%;
        }
    }
`;

const TabNavigation = styled.div`
    background: ${theme.surfaceAlt};
    border-top: 1px solid ${theme.border};
`;

const TabsList = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 ${theme.spacing.xl};
    display: flex;
    background: transparent;
    gap: 0;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: ${theme.spacing.xl};
        right: ${theme.spacing.xl};
        height: 1px;
        background: ${theme.border};
        z-index: 0;
    }

    @media (max-width: 1024px) {
        padding: 0 ${theme.spacing.lg};

        &::after {
            left: ${theme.spacing.lg};
            right: ${theme.spacing.lg};
        }
    }

    @media (max-width: 768px) {
        padding: 0 ${theme.spacing.md};

        &::after {
            left: ${theme.spacing.md};
            right: ${theme.spacing.md};
        }
    }
`;

const TabButton = styled.button<{ $active: boolean }>`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg} ${theme.spacing.md};
    border: none;
    background: transparent;
    color: ${props => props.$active ? theme.primary : theme.text.tertiary};
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    font-weight: ${props => props.$active ? '700' : '500'};
    z-index: 1;
    border-bottom: 2px solid transparent;

    ${props => props.$active && `
        border-bottom-color: ${theme.primary};
        background: linear-gradient(135deg, ${theme.surface} 0%, ${theme.surfaceElevated} 100%);
        
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: -1px;
            background: ${theme.surface};
            border-radius: ${theme.radius.sm} ${theme.radius.sm} 0 0;
            z-index: -1;
            box-shadow: 
                0 -1px 4px rgba(0, 0, 0, 0.04),
                inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }
    `}

    &:hover {
        color: ${props => props.$active ? theme.primaryDark : theme.primary};
        background: ${props => props.$active
                ? `linear-gradient(135deg, ${theme.surface} 0%, ${theme.surfaceHover} 100%)`
                : 'rgba(255, 255, 255, 0.5)'
        };

        ${props => !props.$active && `
            border-bottom-color: ${theme.border};
        `}
    }

    &:active {
        transform: none;
    }

    @media (max-width: 768px) {
        padding: ${theme.spacing.md} ${theme.spacing.sm};
        gap: ${theme.spacing.sm};
    }
`;

const TabIcon = styled.div<{ $active?: boolean }>`
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${theme.fontSize.md};
    flex-shrink: 0;
    border-radius: ${theme.radius.sm};
    background: ${props => props.$active
            ? `${theme.primary}10`
            : 'transparent'
    };
    transition: all 0.3s ease;

    ${props => props.$active && `
        color: ${theme.primary};
    `}

    @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    font-size: ${theme.fontSize.sm};
}
`;

const TabContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    min-width: 0;

    @media (max-width: 768px) {
        align-items: center;
    }
`;

const TabLabel = styled.div<{ $active?: boolean }>`
    font-size: ${theme.fontSize.md};
    font-weight: ${props => props.$active ? '700' : '600'};
    line-height: 1.2;
    letter-spacing: ${props => props.$active ? '-0.025em' : '0'};
    text-align: center;

    @media (max-width: 768px) {
        font-size: ${theme.fontSize.base};
    }
`;

const TabDescription = styled.div<{ $active?: boolean }>`
    font-size: ${theme.fontSize.xs};
    font-weight: 500;
    opacity: ${props => props.$active ? '0.8' : '0.6'};
    line-height: 1.2;
    color: ${props => props.$active ? theme.text.secondary : theme.text.tertiary};
    text-align: center;
    max-width: 200px;

    @media (max-width: 768px) {
        display: none;
    }
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: ${theme.fontSize.base};
    cursor: pointer;
    transition: all ${theme.transitions.spring};
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 32px;

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
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
    color: white;
    box-shadow: ${theme.shadow.sm};

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 100%);
        box-shadow: ${theme.shadow.md};
    }
`;

export const SecondaryButton = styled(BaseButton)`
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border-color: ${theme.border};
    box-shadow: ${theme.shadow.sm};

    &:hover:not(:disabled) {
        background: ${theme.surfaceHover};
        color: ${theme.text.primary};
        border-color: ${theme.borderHover};
        box-shadow: ${theme.shadow.sm};
    }
`;