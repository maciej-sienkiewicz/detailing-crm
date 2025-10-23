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
        <>
            <HeaderContainer>
                <HeaderMain>
                    <TitleGroup>
                        <IconBadge>
                            <IconComponent />
                        </IconBadge>
                        <TitleContent>
                            <Title>{title}</Title>
                            <Subtitle>{subtitle}</Subtitle>
                        </TitleContent>
                    </TitleGroup>
                    {actions && <ActionsGroup>{actions}</ActionsGroup>}
                </HeaderMain>
            </HeaderContainer>

            {tabs && tabs.length > 0 && (
                <TabsContainer>
                    <TabsBar>
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <TabButton
                                    key={tab.id}
                                    $active={isActive}
                                    onClick={() => onTabChange?.(tab.id)}
                                >
                                    <TabIcon><Icon /></TabIcon>
                                    <TabText>{tab.label}</TabText>
                                </TabButton>
                            );
                        })}
                    </TabsBar>
                </TabsContainer>
            )}
        </>
    );
};

const HeaderContainer = styled.header`
    background: #fafbfc;
    border-bottom: 1px solid #e8ecef;
`;

const HeaderMain = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    min-height: 64px;
    gap: 24px;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        padding: 12px 16px;
        gap: 12px;
    }
`;

const TitleGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;
`;

const IconBadge = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px ${theme.primary}25;
`;

const TitleContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
`;

const Title = styled.h1`
    font-size: 20px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0;
    letter-spacing: -0.01em;
    line-height: 1.2;
`;

const Subtitle = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
    font-weight: 500;
    line-height: 1.3;
`;

const ActionsGroup = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;

    @media (max-width: 768px) {
        width: 100%;

        > * {
            flex: 1;
        }
    }
`;

const TabsContainer = styled.div`
    background: white;
    border-bottom: 1px solid #e8ecef;
`;

const TabsBar = styled.div`
    display: flex;
    gap: 2px;
    padding: 0 24px;
    overflow-x: auto;

    &::-webkit-scrollbar {
        height: 0;
    }

    @media (max-width: 768px) {
        padding: 0 16px;
    }
`;

const TabButton = styled.button<{ $active: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 12px 20px;
    background: transparent;
    color: ${props => props.$active ? theme.primary : theme.text.secondary};
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
        color: ${theme.primary};
        background: ${theme.surfaceHover};
    }

    ${props => props.$active && `
        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: ${theme.primary};
        }
    `}
`;

const TabIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
`;

const TabText = styled.span``;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    white-space: nowrap;
    min-height: 36px;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    @media (max-width: 768px) {
        min-height: 40px;
        justify-content: center;
    }
`;

export const PrimaryButton = styled(BaseButton)`
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%);
    color: white;
    box-shadow: 0 2px 8px ${theme.primary}25;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px ${theme.primary}30;
    }
`;

export const SecondaryButton = styled(BaseButton)`
    background: white;
    color: ${theme.text.primary};
    border-color: #e8ecef;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

    &:hover:not(:disabled) {
        border-color: ${theme.borderActive};
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    }
`;