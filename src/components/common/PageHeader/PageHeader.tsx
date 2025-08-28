// src/components/common/PageHeader/PageHeader.tsx
import React from 'react';
import styled from 'styled-components';

const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b'
    },
    border: '#e2e8f0',
    borderHover: '#cbd5e1',
    shadow: {
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
        md: '8px',
        lg: '12px'
    },
    transitions: {
        normal: '0.2s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }
};

interface PageHeaderProps {
    icon: React.ComponentType;
    title: string;
    subtitle: string;
    actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
                                                          icon: IconComponent,
                                                          title,
                                                          subtitle,
                                                          actions
                                                      }) => {
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
        </HeaderContainer>
    );
};

const HeaderContainer = styled.header`
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.sm};
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
`;

const MainTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0;
    letter-spacing: -0.5px;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const Subtitle = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.tertiary};
    font-weight: 500;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    align-items: center;

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

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